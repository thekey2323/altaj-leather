import { NextRequest, NextResponse } from "next/server";
import { getWhatsAppConfig, saveWhatsAppConfig } from "@/lib/whatsapp/store";

export async function GET(req: NextRequest) {
  try {
    const config = getWhatsAppConfig();

    // Query real Baileys Bridge Server on port 3002
    try {
      const baileysRes = await fetch("http://localhost:3002/status", { cache: "no-store" });
      if (baileysRes.ok) {
        const baileysData = await baileysRes.json();

        // Sync with local config
        if (baileysData.isConnected !== config.isConnected || baileysData.connectedNumber !== config.connectedNumber) {
          const updated = {
            ...config,
            isConnected: baileysData.isConnected,
            connectedNumber: baileysData.connectedNumber || "",
            connectedDeviceName: baileysData.connectedDevice || "WhatsApp Mobile",
            connectedAt: baileysData.isConnected ? (config.connectedAt || new Date().toISOString()) : undefined,
          };
          saveWhatsAppConfig(updated);
        }

        return NextResponse.json({
          isConnected: baileysData.isConnected,
          connectedNumber: baileysData.connectedNumber || config.connectedNumber,
          connectedDeviceName: baileysData.connectedDevice || config.connectedDeviceName,
          qrCode: baileysData.qrCode, // Real Baileys Base64 Data URL
          hasQr: !!baileysData.qrCode,
          bridgeOnline: true,
        });
      }
    } catch (e) {
      // Baileys service not yet listening
    }

    return NextResponse.json({
      isConnected: config.isConnected,
      connectedNumber: config.connectedNumber,
      connectedDeviceName: config.connectedDeviceName,
      qrCode: null,
      hasQr: false,
      bridgeOnline: false,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, phoneNumber, deviceName } = body;
    const config = getWhatsAppConfig();

    if (action === "pair_number") {
      const cleanPhone = (phoneNumber || "").trim();
      const updatedConfig = {
        ...config,
        isConnected: true,
        connectionMethod: "QR_CODE" as const,
        connectedNumber: cleanPhone,
        connectedDeviceName: deviceName || "WhatsApp Mobile",
        connectedAt: new Date().toISOString(),
      };
      saveWhatsAppConfig(updatedConfig);

      return NextResponse.json({
        success: true,
        message: "Numéro WhatsApp connecté !",
        config: updatedConfig,
      });
    }

    if (action === "disconnect") {
      try {
        await fetch("http://localhost:3002/logout", { method: "POST" });
      } catch (e) {}

      const updatedConfig = {
        ...config,
        isConnected: false,
        connectedNumber: "",
        connectedDeviceName: "",
        connectedAt: undefined,
      };
      saveWhatsAppConfig(updatedConfig);

      return NextResponse.json({
        success: true,
        message: "Session WhatsApp déconnectée.",
        config: updatedConfig,
      });
    }

    return NextResponse.json({ error: "Action non reconnue" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
