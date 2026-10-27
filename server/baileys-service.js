process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

process.on("uncaughtException", (err) => {
  console.error("[Baileys UncaughtException Safely Caught]:", err?.message || err);
});
process.on("unhandledRejection", (reason) => {
  console.error("[Baileys UnhandledRejection Safely Caught]:", reason?.message || reason);
});

const http = require("http");
const path = require("path");
const fs = require("fs");
const pino = require("pino");
const QRCode = require("qrcode");
const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  Browsers,
} = require("@whiskeysockets/baileys");

const SESSION_DIR = path.join(process.cwd(), "data", "wa-session");
if (!fs.existsSync(SESSION_DIR)) {
  fs.mkdirSync(SESSION_DIR, { recursive: true });
}

let sock = null;
let currentQrString = null;
let currentQrDataUrl = null;
let isConnected = false;
let connectedNumber = null;
let connectedDevice = null;

async function startWhatsApp() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`[Baileys] Version WhatsApp: ${version.join(".")}, isLatest: ${isLatest}`);

    sock = makeWASocket({
      version,
      logger: pino({ level: "error" }),
      printQRInTerminal: false,
      auth: state,
      browser: Browsers.macOS("Desktop"),
      syncFullHistory: false,
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        currentQrString = qr;
        try {
          currentQrDataUrl = await QRCode.toDataURL(qr, {
            margin: 2,
            scale: 8,
            color: { dark: "#201B18", light: "#FFFFFF" },
          });
          console.log("[Baileys] Nouveau QR Code généré et prêt pour le scan !");
        } catch (err) {
          console.error("[Baileys QR Error]:", err);
        }
      }

      if (connection === "close") {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        console.log(`[Baileys Connection Closed]. Motif: ${statusCode}. Reconnexion: ${shouldReconnect}`);
        isConnected = false;
        connectedNumber = null;

        if (statusCode === DisconnectReason.loggedOut) {
          console.log("[Baileys Logged Out]. Nettoyage de la session...");
          try {
            fs.rmSync(SESSION_DIR, { recursive: true, force: true });
          } catch (e) {}
        }

        setTimeout(() => startWhatsApp(), 3000);
      } else if (connection === "open") {
        console.log("[Baileys Connection Opened]. Connecté avec succès !");
        isConnected = true;
        currentQrString = null;
        currentQrDataUrl = null;
        
        // Extract connected phone number
        if (sock.user && sock.user.id) {
          const rawId = sock.user.id.split(":")[0];
          connectedNumber = `+${rawId}`;
          connectedDevice = sock.user.name || "WhatsApp Mobile";
          console.log(`[Baileys] Numéro lié: ${connectedNumber} (${connectedDevice})`);

          // Notify Next.js backend of connection
          try {
            const payload = JSON.stringify({
              action: "pair_number",
              phoneNumber: connectedNumber,
              deviceName: connectedDevice,
            });
            const req = http.request("http://localhost:3001/api/whatsapp/qr", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
            });
            req.on("error", (e) => console.warn("[Pair number notify error]:", e.message));
            req.write(payload);
            req.end();
          } catch (e) {}
        }
      }
    });

    // Inbound Messages
    sock.ev.on("messages.upsert", async ({ messages, type }) => {
      if (type !== "notify") return;

      for (const msg of messages) {
        if (!msg.message || msg.key.fromMe) continue;

        const remoteJid = msg.key.remoteJid;
        if (!remoteJid || remoteJid.includes("@g.us")) continue; // Skip group chats

        const senderPhone = remoteJid.replace("@s.whatsapp.net", "");
        const senderName = msg.pushName || "Client WhatsApp";

        const text =
          msg.message.conversation ||
          msg.message.extendedTextMessage?.text ||
          msg.message.imageMessage?.caption ||
          "";

        if (!text) continue;

        console.log(`[Baileys Inbound Message] De: ${senderName} (${senderPhone}) -> "${text}"`);

        // Forward to Next.js Darija Bot API
        try {
          const postData = JSON.stringify({
            phone: senderPhone,
            name: senderName,
            message: text,
            utmSource: "WhatsApp Ad / Direct",
          });

          const req = http.request(
            "http://localhost:3001/api/whatsapp/webhook",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(postData),
              },
            },
            (res) => {
              let body = "";
              res.on("data", (chunk) => (body += chunk));
              res.on("end", async () => {
                try {
                  const parsed = JSON.parse(body);
                  const botReply = parsed.data?.botReplyMessage;
                  if (botReply && sock) {
                    console.log(`[Baileys Outbound Bot Reply] Vers: ${senderPhone}`);

                    // Simulate realistic typing presence
                    try {
                      await sock.sendPresenceUpdate("composing", remoteJid);
                      await new Promise((r) => setTimeout(r, 800));
                      await sock.sendPresenceUpdate("paused", remoteJid);
                    } catch (e) {}

                    // Send text response
                    await sock.sendMessage(remoteJid, { text: botReply.text });

                    // Only send photos if explicitly requested (catalog state)
                    if (botReply.mediaType === "catalog" && botReply.mediaItems) {
                      await new Promise((r) => setTimeout(r, 600));
                      for (const item of botReply.mediaItems.slice(0, 2)) {
                        const localImgPath = path.join(process.cwd(), "public", item.imageUrl);
                        if (fs.existsSync(localImgPath)) {
                          await sock.sendMessage(remoteJid, {
                            image: fs.readFileSync(localImgPath),
                            caption: `👑 *${item.title}* (${item.description || "جلد طبيعي 100%"})`,
                          });
                          await new Promise((r) => setTimeout(r, 400));
                        }
                      }
                    }
                  }
                } catch (e) {
                  console.error("Error processing bot reply forward:", e);
                }
              });
            }
          );

          req.on("error", (e) => console.error("Webhook forward error:", e.message));
          req.write(postData);
          req.end();
        } catch (err) {
          console.error("Error sending to webhook:", err);
        }
      }
    });
  } catch (err) {
    console.error("[Baileys Init Error]:", err);
    setTimeout(() => startWhatsApp(), 5000);
  }
}

// Start WhatsApp Client
startWhatsApp();

// HTTP Server for Dashboard Communication
const server = http.createServer((req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/status" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        isConnected,
        connectedNumber,
        connectedDevice,
        qrCode: currentQrDataUrl,
        hasQr: !!currentQrDataUrl,
      })
    );
    return;
  }

  if (url.pathname === "/logout" && req.method === "POST") {
    console.log("[Baileys Manual Logout requested]");
    try {
      if (sock) {
        sock.logout();
      }
      fs.rmSync(SESSION_DIR, { recursive: true, force: true });
      isConnected = false;
      connectedNumber = null;
    } catch (e) {}

    setTimeout(() => startWhatsApp(), 1000);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, message: "Déconnecté" }));
    return;
  }

  if (url.pathname === "/send" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        const { to, text, imageUrl } = JSON.parse(body);
        if (!to || !sock || !isConnected) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Non connecté ou numéro manquant" }));
          return;
        }

        const jid = to.includes("@s.whatsapp.net") ? to : `${to.replace(/[^0-9]/g, "")}@s.whatsapp.net`;

        if (imageUrl) {
          const imgPath = path.isAbsolute(imageUrl) ? imageUrl : path.join(process.cwd(), "public", imageUrl);
          if (fs.existsSync(imgPath)) {
            await sock.sendMessage(jid, {
              image: fs.readFileSync(imgPath),
              caption: text || "",
            });
          } else {
            await sock.sendMessage(jid, { text: text || "" });
          }
        } else {
          await sock.sendMessage(jid, { text: text || "" });
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Route not found" }));
});

const PORT = 3002;
server.listen(PORT, () => {
  console.log(`[Baileys Bridge Server] En écoute sur http://localhost:${PORT}`);
});
