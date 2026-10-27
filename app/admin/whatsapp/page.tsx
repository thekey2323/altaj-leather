"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MessageSquare,
  QrCode,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Send,
  RefreshCw,
  Sliders,
  Sparkles,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Truck,
  Eye,
  Download,
  Layers,
  Video,
  Image as ImageIcon,
  DollarSign,
  TrendingUp,
  Users,
  Package,
  Phone,
  Clock,
  ArrowRight,
  Bot,
  UserCheck,
  MapPin,
  ChevronRight,
  FileSpreadsheet,
  Save,
  Cpu,
  Pencil,
  X,
} from "lucide-react";
import {
  WhatsAppConversation,
  WhatsAppMessage,
  WhatsAppModelMedia,
  WhatsAppBotConfig,
  WhatsAppCapturedOrder,
  Order,
} from "@/types";
import {
  getWhatsAppConversations,
  saveWhatsAppConversations,
  getWhatsAppModels,
  getWhatsAppConfig,
  getWhatsAppMetrics,
  receiveIncomingCustomerMessage,
  sendAgentMessage,
  toggleBotForConversation,
  saveWhatsAppConfig,
  saveWhatsAppModels,
} from "@/lib/whatsapp/store";
import { cn } from "@/lib/utils";

export default function WhatsAppAdminPage() {
  const [activeTab, setActiveTab] = useState<"kpis" | "inbox" | "orders" | "models" | "config">("kpis");

  // State
  const [conversations, setConversations] = useState<WhatsAppConversation[]>([]);
  const [models, setModels] = useState<WhatsAppModelMedia[]>([]);
  const [config, setConfig] = useState<WhatsAppBotConfig | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [selectedConvId, setSelectedConvId] = useState<string>("");

  // Live Chat input
  const [agentText, setAgentText] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // Live Simulator input
  const [simText, setSimText] = useState("");
  const [simLoading, setSimLoading] = useState(false);

  // QR Pairing form
  const [inputPhone, setInputPhone] = useState("");
  const [pairingSuccess, setPairingSuccess] = useState(false);
  const [disconnectSuccess, setDisconnectSuccess] = useState(false);
  const [realQrCode, setRealQrCode] = useState<string | null>(null);
  const [bridgeOnline, setBridgeOnline] = useState(false);

  // Model modal state (Add & Edit)
  const [showModelModal, setShowModelModal] = useState(false);
  const [editingModel, setEditingModel] = useState<WhatsAppModelMedia | null>(null);
  const [modelFormName, setModelFormName] = useState("");
  const [modelFormPrice, setModelFormPrice] = useState("119");
  const [modelFormDuoPrice, setModelFormDuoPrice] = useState("200");
  const [modelFormDescription, setModelFormDescription] = useState("");
  const [modelFormBadge, setModelFormBadge] = useState("");
  const [modelFormPhotos, setModelFormPhotos] = useState<string[]>([
    "/images/products/altaj-classic-brown-front.jpg",
  ]);
  const [newPhotoInput, setNewPhotoInput] = useState("");
  const [modelFormVideo, setModelFormVideo] = useState("");
  const [modelFormVideoCaption, setModelFormVideoCaption] = useState("");

  // Selected conversation object
  const activeConversation = conversations.find((c) => c.id === selectedConvId) || conversations[0];

  // Fetch real QR code from bridge
  const fetchQrCode = async () => {
    try {
      const res = await fetch("/api/whatsapp/qr");
      if (res.ok) {
        const data = await res.json();
        setBridgeOnline(data.bridgeOnline);
        if (data.qrCode) {
          setRealQrCode(data.qrCode);
        }
        if (data.isConnected && (!config || !config.isConnected)) {
          loadData();
        }
      }
    } catch (e) {}
  };

  // Refresh all data (Live from Server API + sync to local storage)
  const loadData = async () => {
    try {
      const res = await fetch("/api/whatsapp/chat");
      if (res.ok) {
        const data = await res.json();
        if (data.conversations) {
          setConversations(data.conversations);
          saveWhatsAppConversations(data.conversations);
          if (!selectedConvId && data.conversations.length > 0) {
            setSelectedConvId(data.conversations[0].id);
          }
        }
        if (data.models) setModels(data.models);
        if (data.config) setConfig(data.config);
        if (data.metrics) setMetrics(data.metrics);
        return;
      }
    } catch (e) {
      console.warn("API loadData failed, falling back to localStorage:", e);
    }

    try {
      const convs = getWhatsAppConversations();
      const mods = getWhatsAppModels();
      const cfg = getWhatsAppConfig();
      const met = getWhatsAppMetrics();

      setConversations(convs);
      setModels(mods);
      setConfig(cfg);
      setMetrics(met);

      if (!selectedConvId && convs.length > 0) {
        setSelectedConvId(convs[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
    fetchQrCode();
    const interval = setInterval(() => {
      loadData();
      fetchQrCode();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Handle agent manual reply
  const handleSendAgentReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentText.trim() || !activeConversation) return;

    sendAgentMessage(activeConversation.id, agentText.trim());
    setAgentText("");
    loadData();
  };

  // Quick insertion of Darija canned responses
  const insertQuickText = (text: string) => {
    setAgentText(text);
  };

  // Handle toggle bot active for conversation
  const handleToggleBot = (convId: string, currentActive: boolean) => {
    toggleBotForConversation(convId, !currentActive);
    loadData();
  };

  // Handle Live Simulator submit
  const handleSimulateClientMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simText.trim()) return;

    setSimLoading(true);
    const targetPhone = activeConversation ? activeConversation.customerPhone : "212699887766";
    const targetName = activeConversation ? activeConversation.customerName : "Test Client";

    setTimeout(() => {
      receiveIncomingCustomerMessage(
        targetPhone,
        targetName,
        simText.trim(),
        activeConversation?.utmSource || "Simulation Test",
        activeConversation?.utmCampaign || "SIMULATOR"
      );
      setSimText("");
      setSimLoading(false);
      loadData();
    }, 600);
  };

  // Handle QR Pairing
  const handlePairNumber = () => {
    if (!config) return;
    const updated = {
      ...config,
      isConnected: true,
      connectionMethod: "QR_CODE" as const,
      connectedNumber: inputPhone,
      connectedDeviceName: "WhatsApp Business (iPhone / Android)",
      connectedAt: new Date().toISOString(),
    };
    saveWhatsAppConfig(updated);
    setConfig(updated);
    setPairingSuccess(true);
    setDisconnectSuccess(false);
    setTimeout(() => setPairingSuccess(false), 4000);
  };

  const handleDisconnect = () => {
    if (!config) return;
    const updated = {
      ...config,
      isConnected: false,
      connectedNumber: "",
      connectedDeviceName: "",
      connectedAt: undefined,
    };
    saveWhatsAppConfig(updated);
    setConfig(updated);
    setDisconnectSuccess(true);
    setPairingSuccess(false);
    setTimeout(() => setDisconnectSuccess(false), 4000);
  };

  // Handle Auto Reply Global Toggle
  const handleToggleGlobalAutoReply = () => {
    if (!config) return;
    const updated = {
      ...config,
      autoReplyEnabled: !config.autoReplyEnabled,
    };
    saveWhatsAppConfig(updated);
    setConfig(updated);
  };

  // Copy click-to-WhatsApp link
  const handleCopyAdLink = () => {
    const num = config?.connectedNumber?.replace(/[^0-9]/g, "") || "212661234567";
    const message = encodeURIComponent("Salam ALTAJ LEATHER, cheft l'annonce dialkoum bghit nchof les modeles w les prix.");
    const fullUrl = `https://wa.me/${num}?text=${message}&utm_source=Meta_Ads&utm_campaign=Wallet_Darija_COD`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Open Create Model Modal
  const handleOpenCreateModel = () => {
    setEditingModel(null);
    setModelFormName("");
    setModelFormPrice("119");
    setModelFormDuoPrice("200");
    setModelFormBadge("");
    setModelFormDescription("جلد طبيعي ممتاز 100% يدوي الصنع في فاس.");
    setModelFormPhotos(["/images/products/altaj-classic-brown-front.jpg"]);
    setModelFormVideo("");
    setModelFormVideoCaption("");
    setNewPhotoInput("");
    setShowModelModal(true);
  };

  // Open Edit Model Modal
  const handleOpenEditModel = (mod: WhatsAppModelMedia) => {
    setEditingModel(mod);
    setModelFormName(mod.name);
    setModelFormPrice(String(mod.price || 119));
    setModelFormDuoPrice(String(mod.packDuoPrice || 200));
    setModelFormBadge(mod.badge || "");
    setModelFormDescription(mod.darijaDescription || "");
    setModelFormPhotos(mod.photos && mod.photos.length > 0 ? [...mod.photos] : ["/images/products/altaj-classic-brown-front.jpg"]);
    setModelFormVideo(mod.videoUrl || "");
    setModelFormVideoCaption(mod.videoCaption || "");
    setNewPhotoInput("");
    setShowModelModal(true);
  };

  // Save Model (Create or Edit)
  const handleSaveModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelFormName.trim()) return;

    let updatedModels: WhatsAppModelMedia[] = [];

    if (editingModel) {
      // Modify existing
      updatedModels = models.map((m) =>
        m.id === editingModel.id
          ? {
              ...m,
              name: modelFormName.trim(),
              slug: modelFormName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
              badge: modelFormBadge.trim() || undefined,
              price: Number(modelFormPrice) || 119,
              packDuoPrice: Number(modelFormDuoPrice) || 200,
              darijaDescription: modelFormDescription.trim() || "جلد طبيعي ممتاز 100% يدوي الصنع في فاس.",
              photos: modelFormPhotos.filter(Boolean),
              videoUrl: modelFormVideo.trim() || undefined,
              videoCaption: modelFormVideoCaption.trim() || undefined,
            }
          : m
      );
    } else {
      // Add new
      const newMod: WhatsAppModelMedia = {
        id: `wa-mod-${Date.now()}`,
        name: modelFormName.trim(),
        slug: modelFormName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        badge: modelFormBadge.trim() || undefined,
        price: Number(modelFormPrice) || 119,
        packDuoPrice: Number(modelFormDuoPrice) || 200,
        darijaDescription: modelFormDescription.trim() || "جلد طبيعي ممتاز 100% يدوي الصنع في فاس.",
        photos: modelFormPhotos.filter(Boolean),
        videoUrl: modelFormVideo.trim() || undefined,
        videoCaption: modelFormVideoCaption.trim() || undefined,
        isAvailable: true,
        autoSendOnGreeting: true,
        order: models.length + 1,
      };
      updatedModels = [...models, newMod];
    }

    saveWhatsAppModels(updatedModels);
    setModels(updatedModels);
    setShowModelModal(false);

    // Sync to server API
    try {
      await fetch("/api/whatsapp/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_models", models: updatedModels }),
      });
    } catch (e) {
      console.warn("Could not sync models to server API:", e);
    }
  };

  // Delete model
  const handleDeleteModel = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce modèle du catalogue WhatsApp ?")) return;
    const updated = models.filter((m) => m.id !== id);
    saveWhatsAppModels(updated);
    setModels(updated);

    try {
      await fetch("/api/whatsapp/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_models", models: updated }),
      });
    } catch (e) {
      console.warn("Could not sync models delete to server API:", e);
    }
  };

  // Add photo to current form
  const handleAddPhotoToForm = () => {
    if (!newPhotoInput.trim()) return;
    setModelFormPhotos([...modelFormPhotos, newPhotoInput.trim()]);
    setNewPhotoInput("");
  };

  // Remove photo from current form
  const handleRemovePhotoFromForm = (idx: number) => {
    if (modelFormPhotos.length <= 1) {
      alert("Il faut au moins une photo pour le modèle.");
      return;
    }
    setModelFormPhotos(modelFormPhotos.filter((_, i) => i !== idx));
  };

  // Export CSV of captured orders
  const exportCapturedOrdersCSV = () => {
    const capturedConvs = conversations.filter((c) => c.capturedOrder && c.capturedOrder.isConfirmed);
    if (capturedConvs.length === 0) {
      alert("Aucune commande capturée à exporter pour le moment.");
      return;
    }

    const headers = ["Numero_Commande", "Client", "Telephone", "Ville", "Adresse", "Produit", "Quantite", "Total_DH", "Frais_Port", "Paiement", "Statut_Confirmation"];
    const rows = capturedConvs.map((c) => {
      const o = c.capturedOrder!;
      return [
        o.orderNumber || "ALTAJ-COD",
        `"${o.customerName || c.customerName}"`,
        `"${o.customerPhone || c.customerPhone}"`,
        `"${o.customerCity || "Casablanca"}"`,
        `"${(o.customerAddress || "").replace(/"/g, '""')}"`,
        `"${o.modelChosen || "Pack Duo ALTAJ"}"`,
        o.quantity || 2,
        o.totalPrice || 200,
        o.shippingFee || 0,
        "COD (Paiement a la livraison)",
        "CONFIRME",
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ALTAJ_WhatsApp_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP HEADER & STATUS BAR - SOFT MODERN WHITE CARD WITH COLORFUL ACCENTS */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#EBE6DE]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100/80 text-emerald-600 flex items-center justify-center shadow-sm">
                <MessageSquare className="h-6 w-6 stroke-[2.2]" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-serif font-black tracking-tight text-slate-900 flex items-center gap-2.5">
                  WhatsApp CRM & Agent IA
                  <span className="text-[10px] font-sans font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Darija Marocaine 🇲🇦
                  </span>
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Répondeur intelligent automatique pour publicités Meta & TikTok • Capture instantanée des commandes COD
                </p>
              </div>
            </div>
          </div>

          {/* Quick status & switch */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Connection badge */}
            <div
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold border",
                config?.isConnected
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              )}
            >
              <span className={cn("h-2 w-2 rounded-full animate-pulse", config?.isConnected ? "bg-emerald-500" : "bg-rose-500")} />
              {config?.isConnected ? (
                <span>Connecté : <strong>{config.connectedNumber}</strong></span>
              ) : (
                <span>Numéro non connecté</span>
              )}
            </div>

            {/* Global Bot Toggle */}
            <button
              onClick={handleToggleGlobalAutoReply}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-sm",
                config?.autoReplyEnabled
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              <Bot className="h-4 w-4" />
              <span>Bot IA : {config?.autoReplyEnabled ? "ACTIF (24/7)" : "PAUSE"}</span>
            </button>

            {/* Link generator quick copy */}
            <button
              onClick={handleCopyAdLink}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all border border-[#E0D9CE] shadow-sm"
              title="Copier le lien publicitaire Click-to-WhatsApp avec message pré-rempli en Darija"
            >
              {copiedLink ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-slate-400" />}
              <span>{copiedLink ? "Lien Copié !" : "Lien Pub WhatsApp"}</span>
            </button>
          </div>
        </div>

        {/* 2. SUB NAVIGATION TABS - CLEAN ROUNDED PILLS */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-[#F0EBE3] overflow-x-auto text-xs font-bold scrollbar-none">
          <button
            onClick={() => setActiveTab("kpis")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap",
              activeTab === "kpis"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-100 font-extrabold"
                : "text-slate-600 hover:text-slate-900 hover:bg-[#F8F6F2]"
            )}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Tableau de Bord & KPIs</span>
          </button>

          <button
            onClick={() => setActiveTab("inbox")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap relative",
              activeTab === "inbox"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-100 font-extrabold"
                : "text-slate-600 hover:text-slate-900 hover:bg-[#F8F6F2]"
            )}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Boîte de Réception & Live Chat</span>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-black",
              activeTab === "inbox" ? "bg-white text-emerald-700" : "bg-emerald-100 text-emerald-800"
            )}>
              {conversations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap",
              activeTab === "orders"
                ? "bg-amber-600 text-white shadow-md shadow-amber-100 font-extrabold"
                : "text-slate-600 hover:text-slate-900 hover:bg-[#F8F6F2]"
            )}
          >
            <Package className="h-4 w-4" />
            <span>Commandes Capturées</span>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-black",
              activeTab === "orders" ? "bg-white text-amber-700" : "bg-amber-100 text-amber-900"
            )}>
              {metrics?.capturedConfirmedOrders || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("models")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap",
              activeTab === "models"
                ? "bg-purple-600 text-white shadow-md shadow-purple-100 font-extrabold"
                : "text-slate-600 hover:text-slate-900 hover:bg-[#F8F6F2]"
            )}
          >
            <ImageIcon className="h-4 w-4" />
            <span>Modèles & Médias (Photos/Vidéos)</span>
          </button>

          <button
            onClick={() => setActiveTab("config")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap",
              activeTab === "config"
                ? "bg-slate-800 text-white shadow-md shadow-slate-200 font-extrabold"
                : "text-slate-600 hover:text-slate-900 hover:bg-[#F8F6F2]"
            )}
          >
            <QrCode className="h-4 w-4" />
            <span>Connexion Numéro & Scripts Darija</span>
          </button>
        </div>
      </div>

      {/* 3. TAB CONTENT */}

      {/* ======================================================== */}
      {/* TAB 1: KPIS & ANALYTICS                                  */}
      {/* ======================================================== */}
      {activeTab === "kpis" && (
        <div className="space-y-6">
          {/* Main 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Revenue */}
            <div className="bg-white rounded-lg p-5 border border-altaj-borderLight shadow-sm space-y-2">
              <div className="flex items-center justify-between text-altaj-muted">
                <span className="text-xs uppercase font-bold tracking-wider">CA Généré WhatsApp</span>
                <div className="p-2 rounded bg-emerald-50 text-emerald-700">
                  <DollarSign className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-serif font-bold text-altaj-text">
                {(metrics?.totalWhatsAppRevenue || 0).toLocaleString()} <span className="text-sm font-sans font-normal text-altaj-muted">DH</span>
              </div>
              <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> +38% par rapport à la semaine dernière
              </p>
            </div>

            {/* Total Conversations */}
            <div className="bg-white rounded-lg p-5 border border-altaj-borderLight shadow-sm space-y-2">
              <div className="flex items-center justify-between text-altaj-muted">
                <span className="text-xs uppercase font-bold tracking-wider">Prospects WhatsApp Ads</span>
                <div className="p-2 rounded bg-blue-50 text-blue-700">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-serif font-bold text-altaj-text">
                {metrics?.totalConversations || 0} <span className="text-sm font-sans font-normal text-altaj-muted">clients</span>
              </div>
              <p className="text-[11px] text-altaj-muted">Provenant de Meta Ads & TikTok</p>
            </div>

            {/* Orders Caught */}
            <div className="bg-white rounded-lg p-5 border border-altaj-borderLight shadow-sm space-y-2">
              <div className="flex items-center justify-between text-altaj-muted">
                <span className="text-xs uppercase font-bold tracking-wider">Commandes Confirmées</span>
                <div className="p-2 rounded bg-amber-50 text-amber-700">
                  <Package className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-serif font-bold text-altaj-text">
                {metrics?.capturedConfirmedOrders || 0} <span className="text-sm font-sans font-normal text-altaj-muted">colis COD</span>
              </div>
              <p className="text-[11px] text-amber-700 font-medium">Capture 100% automatique par le bot</p>
            </div>

            {/* Conversion Rate */}
            <div className="bg-white rounded-lg p-5 border border-altaj-borderLight shadow-sm space-y-2">
              <div className="flex items-center justify-between text-altaj-muted">
                <span className="text-xs uppercase font-bold tracking-wider">Taux de Conversion</span>
                <div className="p-2 rounded bg-purple-50 text-purple-700">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-serif font-bold text-altaj-text">
                {metrics?.conversionRate || 0}%
              </div>
              <p className="text-[11px] text-purple-700 font-medium">Panier moyen : {metrics?.averageOrderValue || 0} DH</p>
            </div>
          </div>

          {/* Detailed Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Moroccan Cities Breakdown */}
            <div className="bg-white rounded-lg p-5 border border-altaj-borderLight shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-altaj-borderLight pb-3">
                <h3 className="font-serif font-bold text-altaj-text text-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-altaj-brown" />
                  Top Villes Marocaines (WhatsApp COD)
                </h3>
                <span className="text-[10px] text-altaj-muted uppercase font-bold">Volume</span>
              </div>
              <div className="space-y-3">
                {metrics?.cityBreakdown?.length > 0 ? (
                  metrics.cityBreakdown.map((item: any, idx: number) => (
                    <div key={item.city} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="h-5 w-5 rounded-full bg-altaj-bg text-altaj-brown font-bold text-[10px] flex items-center justify-center border border-altaj-borderLight">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-altaj-text">{item.city}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-altaj-brown">{item.orders} commandes</span>
                        <span className="text-[10px] text-altaj-muted ml-2">({item.revenue} DH)</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-altaj-muted py-4 text-center">Aucune donnée de ville pour l'instant.</p>
                )}
              </div>
            </div>

            {/* Models Popularity */}
            <div className="bg-white rounded-lg p-5 border border-altaj-borderLight shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-altaj-borderLight pb-3">
                <h3 className="font-serif font-bold text-altaj-text text-sm flex items-center gap-2">
                  <Layers className="h-4 w-4 text-altaj-brown" />
                  Modèles les Plus Vendus via WhatsApp
                </h3>
                <span className="text-[10px] text-altaj-gold font-bold uppercase">Best-Sellers</span>
              </div>
              <div className="space-y-3">
                {Object.entries(metrics?.modelStats || {}).map(([modelName, count]: [string, any]) => (
                  <div key={modelName} className="p-2.5 rounded bg-altaj-bg/50 border border-altaj-borderLight space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-altaj-text truncate max-w-[200px]">{modelName}</span>
                      <span className="bg-altaj-brown text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                        {count} vendus
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-altaj-gold h-full rounded-full"
                        style={{ width: `${Math.min(100, count * 35)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Conversion Funnel */}
            <div className="bg-white rounded-lg p-5 border border-altaj-borderLight shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-altaj-borderLight pb-3">
                <h3 className="font-serif font-bold text-altaj-text text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-altaj-brown" />
                  Entonnoir de Conversion Darija
                </h3>
                <span className="text-[10px] text-emerald-700 font-bold uppercase">Entonnoir</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded bg-gray-50 border border-gray-200 flex items-center justify-between">
                  <span>1. Clic Pub & Premier Message</span>
                  <span className="font-bold">100%</span>
                </div>
                <div className="p-2.5 rounded bg-blue-50 border border-blue-200 flex items-center justify-between text-blue-900">
                  <span>2. Envoi Photos & Pitch Duo</span>
                  <span className="font-bold">88%</span>
                </div>
                <div className="p-2.5 rounded bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-900">
                  <span>3. Nom, Ville & Adresse fournis</span>
                  <span className="font-bold">62%</span>
                </div>
                <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-900 font-bold">
                  <span>4. Confirmation & Création Commande</span>
                  <span className="text-emerald-700 font-black">{metrics?.conversionRate || 40}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: INBOX & LIVE CHAT / SIMULATOR                     */}
      {/* ======================================================== */}
      {activeTab === "inbox" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[760px] max-h-[82vh]">
          {/* Left Panel: Conversations List (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-lg border border-altaj-borderLight shadow-sm flex flex-col overflow-hidden">
            <div className="p-3.5 border-b border-altaj-borderLight bg-altaj-bg/40 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-xs uppercase text-altaj-text">Discussions WhatsApp</h3>
                <span className="text-[10px] text-altaj-muted">{conversations.length} contacts</span>
              </div>
              <button
                onClick={loadData}
                className="p-1 text-altaj-muted hover:text-altaj-dark"
                title="Actualiser"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Conversation Items */}
            <div className="flex-1 overflow-y-auto divide-y divide-altaj-borderLight/60">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-altaj-muted space-y-3">
                  <MessageSquare className="h-10 w-10 mx-auto text-altaj-brown/40" />
                  <p className="text-xs font-bold text-altaj-text">Aucune conversation</p>
                  <p className="text-[11px] leading-relaxed">
                    Toutes les données de test ont été retirées. Vos vraies discussions clients apparaîtront ici dès le premier message !
                  </p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const isSelected = conv.id === selectedConvId;
                  const hasOrder = conv.capturedOrder && conv.capturedOrder.isConfirmed;

                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConvId(conv.id)}
                      className={cn(
                        "w-full text-left p-3 transition-colors flex items-start gap-3",
                        isSelected ? "bg-altaj-sand/20 border-l-4 border-altaj-brown" : "hover:bg-gray-50"
                      )}
                    >
                    <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {conv.customerName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold text-altaj-text truncate">{conv.customerName}</span>
                        <span className="text-[10px] text-altaj-muted">
                          {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-[11px] text-altaj-muted truncate mb-1">{conv.lastMessage}</p>

                      <div className="flex flex-wrap items-center gap-1">
                        {hasOrder && (
                          <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                            {conv.capturedOrder?.orderNumber || "COMMANDE #OK"}
                          </span>
                        )}
                        {conv.capturedOrder?.customerCity && (
                          <span className="text-[9px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                            📍 {conv.capturedOrder.customerCity}
                          </span>
                        )}
                        <span
                          className={cn(
                            "text-[9px] px-1.5 py-0.5 rounded font-bold",
                            conv.botActive
                              ? "bg-[#25D366]/15 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          )}
                        >
                          {conv.botActive ? "🤖 Bot Actif" : "👤 Manuel"}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
            </div>
          </div>

          {/* Right Panel: Chat Thread & Live Simulator (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-lg border border-altaj-borderLight shadow-sm flex flex-col overflow-hidden">
            {activeConversation ? (
              <>
                {/* Chat Top Header */}
                <div className="p-3.5 border-b border-altaj-borderLight bg-altaj-bg/30 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                      {activeConversation.customerName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-altaj-text">{activeConversation.customerName}</span>
                        <span className="text-[11px] text-altaj-muted font-mono">{activeConversation.customerPhone}</span>
                      </div>
                      <div className="text-[10px] text-altaj-muted flex items-center gap-2">
                        <span>Origine : {activeConversation.utmSource || "Publicité Meta"}</span>
                        <span>•</span>
                        <span>État : <strong className="text-altaj-brown">{activeConversation.funnelState}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Bot active toggle */}
                    <button
                      onClick={() => handleToggleBot(activeConversation.id, activeConversation.botActive)}
                      className={cn(
                        "text-xs px-2.5 py-1 rounded font-bold transition-all flex items-center gap-1.5",
                        activeConversation.botActive
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                      )}
                    >
                      <Bot className="h-3.5 w-3.5" />
                      <span>{activeConversation.botActive ? "Bot Automatique" : "Prise en main manuelle"}</span>
                    </button>

                    {/* Direct WhatsApp Call or Web */}
                    <a
                      href={`https://wa.me/${activeConversation.customerPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      title="Ouvrir dans l'application WhatsApp"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>

                {/* Banner if Order Caught */}
                {activeConversation.capturedOrder && (
                  <div className={cn(
                    "p-3 border-b text-xs flex flex-wrap items-center justify-between gap-2",
                    activeConversation.capturedOrder.isConfirmed
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : "bg-amber-50 border-amber-200 text-amber-900"
                  )}>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-emerald-700" />
                      <div>
                        <strong>
                          {activeConversation.capturedOrder.isConfirmed
                            ? `COMMANDE VALIDÉE #${activeConversation.capturedOrder.orderNumber || "ALTAJ-COD"}`
                            : "DONNÉES CLIENT DÉTECTÉES (EN COURS DE VALIDATION)"}
                        </strong>
                        <div className="text-[11px] opacity-80 mt-0.5">
                          {activeConversation.capturedOrder.customerCity && `📍 ${activeConversation.capturedOrder.customerCity} `}
                          {activeConversation.capturedOrder.customerAddress && `• ${activeConversation.capturedOrder.customerAddress} `}
                          {activeConversation.capturedOrder.totalPrice && `• ${activeConversation.capturedOrder.totalPrice} DH`}
                        </div>
                      </div>
                    </div>

                    {activeConversation.capturedOrder.isConfirmed ? (
                      <Link
                        href="/admin/orders"
                        className="bg-emerald-700 text-white px-2.5 py-1 rounded text-[11px] font-bold hover:bg-emerald-800"
                      >
                        Voir dans Commandes
                      </Link>
                    ) : (
                      <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                        En attente du mot "نعم"
                      </span>
                    )}
                  </div>
                )}

                {/* Messages Scroll Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#EFEAE2]/40 bg-repeat">
                  {activeConversation.messages.map((msg) => {
                    const isCustomer = msg.sender === "CUSTOMER";
                    const isBot = msg.sender === "BOT";

                    return (
                      <div
                        key={msg.id}
                        className={cn("flex flex-col max-w-[82%]", isCustomer ? "mr-auto items-start" : "ml-auto items-end")}
                      >
                        <div
                          className={cn(
                            "rounded-lg p-3 text-xs shadow-sm relative space-y-2",
                            isCustomer
                              ? "bg-white text-gray-900 rounded-tl-none border border-gray-100"
                              : isBot
                              ? "bg-[#DCF8C6] text-gray-900 rounded-tr-none border border-emerald-200"
                              : "bg-blue-600 text-white rounded-tr-none"
                          )}
                        >
                          {/* Sender badge */}
                          <div className="flex items-center justify-between gap-3 text-[10px] opacity-70 mb-1">
                            <span className="font-bold">
                              {isCustomer ? activeConversation.customerName : isBot ? "🤖 Bot Darija (ALTAJ)" : "👤 Vous (Agent)"}
                            </span>
                            <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          </div>

                          {/* Message Body text */}
                          <div className="whitespace-pre-line leading-relaxed font-sans">{msg.text}</div>

                          {/* Single Image Attachment */}
                          {msg.mediaType === "image" && msg.mediaUrl && (
                            <div className="mt-2 rounded overflow-hidden border border-black/10 relative w-48 h-36">
                              <Image
                                src={msg.mediaUrl}
                                alt="Détail Portefeuille Cuir"
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}

                          {/* Catalog Cards Preview */}
                          {msg.mediaType === "catalog" && msg.mediaItems && msg.mediaItems.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-black/10">
                              {msg.mediaItems.map((item, idx) => (
                                <div key={idx} className="bg-white/80 rounded p-1.5 border border-black/10 text-[10px]">
                                  <div className="relative w-full h-20 rounded overflow-hidden mb-1">
                                    <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                                  </div>
                                  <div className="font-bold truncate text-altaj-dark">{item.title}</div>
                                  <div className="text-emerald-700 font-bold">{item.price} DH</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Darija Actions Bar */}
                <div className="p-2 border-t border-altaj-borderLight bg-gray-50 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
                  <span className="text-altaj-muted text-[10px] font-bold uppercase whitespace-nowrap pl-1">Réponses rapides :</span>
                  <button
                    onClick={() => insertQuickText("مرحباً بك أخي الكريم! هاهما صور الموديلات المتوفرة حالياً بالجلد الطبيعي 100%:")}
                    className="px-2.5 py-1 rounded bg-white border border-gray-300 hover:border-altaj-brown text-gray-700 whitespace-nowrap"
                  >
                    📸 Salutation & Photos
                  </button>
                  <button
                    onClick={() => insertQuickText("العرض الأكثر طلباً: 2 ببياسات بـ 200 درهم فقط والتوصيل بالمجان لجميع مدن المغرب! 🚚")}
                    className="px-2.5 py-1 rounded bg-white border border-gray-300 hover:border-altaj-brown text-gray-700 whitespace-nowrap"
                  >
                    🔥 Pitch Pack Duo
                  </button>
                  <button
                    onClick={() => insertQuickText("عافاك صيفط لينا غير الاسم الكامل والمدينة والعنوان باش نوجدو ليك الإرسالية 📦")}
                    className="px-2.5 py-1 rounded bg-white border border-gray-300 hover:border-altaj-brown text-gray-700 whitespace-nowrap"
                  >
                    📍 Demander l'Adresse
                  </button>
                  <button
                    onClick={() => insertQuickText("التوصيل كاياخد من 24 لـ 48 ساعة والدفع كيبقى حتى تقلب سلعتك عند الاستلام 🤝")}
                    className="px-2.5 py-1 rounded bg-white border border-gray-300 hover:border-altaj-brown text-gray-700 whitespace-nowrap"
                  >
                    🚚 Délai 24-48h
                  </button>
                </div>

                {/* Manual Agent Reply Box */}
                <form onSubmit={handleSendAgentReply} className="p-3 border-t border-altaj-borderLight bg-white flex items-center gap-2">
                  <input
                    type="text"
                    value={agentText}
                    onChange={(e) => setAgentText(e.target.value)}
                    placeholder="Écrire une réponse manuelle au client (Darija / Français)..."
                    className="flex-1 bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:border-altaj-brown"
                  />
                  <button
                    type="submit"
                    className="bg-altaj-brown hover:bg-altaj-brown/90 text-white p-2 rounded-md shadow-sm transition-all"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>

                {/* Interactive Live Testing Box (Simulate incoming message from client) */}
                <div className="p-2.5 bg-altaj-dark text-altaj-bg border-t border-altaj-borderDark/60 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 flex-shrink-0 text-altaj-gold font-bold text-[11px]">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Simulateur Client :</span>
                  </div>

                  <form onSubmit={handleSimulateClientMessage} className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={simText}
                      onChange={(e) => setSimText(e.target.value)}
                      placeholder="Tapez un message client (ex: 'Salam bghit pack duo', 'Mohamed Alami, Casa Maarif', 'Oui')..."
                      className="flex-1 bg-black/40 text-white border border-white/20 rounded px-2.5 py-1 text-[11px] focus:outline-none focus:border-altaj-gold"
                    />
                    <button
                      type="submit"
                      disabled={simLoading}
                      className="bg-altaj-gold text-altaj-dark font-extrabold px-3 py-1 rounded text-[11px] hover:bg-white transition-all disabled:opacity-50"
                    >
                      {simLoading ? "Réponse..." : "Envoyer en tant que Client"}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-altaj-muted text-xs">
                Sélectionnez une conversation dans la liste de gauche.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: CAPTURED ORDERS (WhatsApp COD)                    */}
      {/* ======================================================== */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-altaj-borderLight shadow-sm">
            <div>
              <h2 className="font-serif font-bold text-altaj-text text-base">Commandes Capturées par WhatsApp Bot</h2>
              <p className="text-xs text-altaj-muted">
                Commandes automatiquement validées après confirmation de l'adresse et de la ville par le client
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={exportCapturedOrdersCSV}
                className="flex items-center gap-2 px-3.5 py-2 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Exporter CSV (Cathedis / Ameex / Yalidine)</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg border border-altaj-borderLight shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-altaj-bg/60 border-b border-altaj-borderLight text-altaj-muted uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5 font-bold">N° Commande</th>
                    <th className="p-3.5 font-bold">Date</th>
                    <th className="p-3.5 font-bold">Client</th>
                    <th className="p-3.5 font-bold">Ville & Adresse</th>
                    <th className="p-3.5 font-bold">Modèle Sélectionné</th>
                    <th className="p-3.5 font-bold">Montant Total</th>
                    <th className="p-3.5 font-bold">Statut</th>
                    <th className="p-3.5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-altaj-borderLight">
                  {conversations.filter((c) => c.capturedOrder && c.capturedOrder.isConfirmed).length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-altaj-muted bg-white">
                        <Package className="h-10 w-10 mx-auto text-altaj-brown/30 mb-2" />
                        <p className="font-serif font-bold text-xs text-altaj-text">Aucune commande capturée pour le moment</p>
                        <p className="text-[11px] text-altaj-muted mt-1 max-w-sm mx-auto">
                          Toutes les données de test ont été supprimées. Dès qu'un client confirme son adresse et sa ville en répondant "نعم" ou "Oui", sa commande sera créée automatiquement ici et prête pour l'expédition !
                        </p>
                      </td>
                    </tr>
                  ) : (
                    conversations
                      .filter((c) => c.capturedOrder && c.capturedOrder.isConfirmed)
                      .map((conv) => {
                        const o = conv.capturedOrder!;
                        return (
                          <tr key={conv.id} className="hover:bg-gray-50/70 transition-colors">
                            <td className="p-3.5 font-mono font-bold text-altaj-brown">
                              #{o.orderNumber || "ALTAJ-1029"}
                            </td>
                          <td className="p-3.5 text-altaj-muted whitespace-nowrap">
                            {new Date(o.confirmedAt || conv.lastMessageAt).toLocaleDateString("fr-FR", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-altaj-text">{o.customerName || conv.customerName}</div>
                            <div className="text-[10px] text-altaj-muted font-mono">{o.customerPhone || conv.customerPhone}</div>
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-altaj-text flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-altaj-brown" />
                              {o.customerCity || "Casablanca"}
                            </div>
                            <div className="text-[11px] text-altaj-muted max-w-xs truncate">
                              {o.customerAddress || "Adresse client"}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold text-altaj-text">{o.modelChosen || "Pack Duo ALTAJ"}</span>
                            <div className="text-[10px] text-altaj-muted">Quantité : {o.quantity || 2}</div>
                          </td>
                          <td className="p-3.5 font-serif font-bold text-altaj-text whitespace-nowrap">
                            {o.totalPrice || 200} DH
                            <span className="text-[10px] font-sans font-normal text-emerald-700 block">
                              {(o.shippingFee || 0) === 0 ? "Livraison Gratuite" : "+25 DH Livraison"}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="h-3 w-3" />
                              CONFIRMÉ COD
                            </span>
                          </td>
                          <td className="p-3.5 text-right whitespace-nowrap space-x-1">
                            <a
                              href={`https://wa.me/${o.customerPhone || conv.customerPhone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block p-1.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              title="Contacter sur WhatsApp"
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                            </a>
                            <a
                              href={`tel:${o.customerPhone || conv.customerPhone}`}
                              className="inline-block p-1.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100"
                              title="Appeler le client"
                            >
                              <Phone className="h-3.5 w-3.5" />
                            </a>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: MODELS & MEDIA (PHOTOS / VIDEOS)                  */}
      {/* ======================================================== */}
      {activeTab === "models" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#EBE6DE] shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                  Catalogue Médias
                </span>
                <span className="text-xs text-slate-400 font-medium">WhatsApp Bot & IA</span>
              </div>
              <h2 className="font-serif font-black text-slate-900 text-xl sm:text-2xl mt-1 tracking-tight">
                Catalogue & Médias Envoyés par WhatsApp
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Modifiez les prix, photos HD et vidéos de démonstration que l'agent IA WhatsApp envoie aux prospects.
              </p>
            </div>

            <button
              onClick={handleOpenCreateModel}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-200 transition-all self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Ajouter un Modèle</span>
            </button>
          </div>

          {/* Models Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map((mod) => (
              <div
                key={mod.id}
                className="bg-white rounded-3xl border border-[#EBE6DE] shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Photo Preview Carousel */}
                  <div className="relative h-56 w-full bg-slate-100 border-b border-slate-100 overflow-hidden">
                    {mod.photos[0] ? (
                      <Image
                        src={mod.photos[0]}
                        alt={mod.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                        Aucune photo
                      </div>
                    )}
                    {mod.badge && (
                      <span className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-sm text-amber-400 font-extrabold text-[10px] px-2.5 py-1 rounded-full shadow">
                        {mod.badge}
                      </span>
                    )}
                    <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white font-bold text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1">
                      <ImageIcon className="h-3 w-3" />
                      {mod.photos.length} photo{mod.photos.length > 1 ? "s" : ""} HD
                    </span>
                  </div>

                  {/* Thumbnail gallery preview if multiple */}
                  {mod.photos.length > 1 && (
                    <div className="flex items-center gap-1.5 p-2 bg-[#FAF8F5] border-b border-slate-100 overflow-x-auto no-scrollbar">
                      {mod.photos.map((p, idx) => (
                        <div key={idx} className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                          <Image src={p} alt="" fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Model Info */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="font-serif font-black text-slate-900 text-sm tracking-tight">{mod.name}</h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-lg font-black text-slate-900">{mod.price} DH</span>
                        {mod.compareAtPrice && (
                          <span className="text-xs text-slate-400 line-through">{mod.compareAtPrice} DH</span>
                        )}
                        <span className="text-[11px] bg-emerald-50 text-emerald-700 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200 ml-auto">
                          Pack Duo: {mod.packDuoPrice} DH
                        </span>
                      </div>
                    </div>

                    {/* Darija description */}
                    <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#EFEBE3]">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Script Darija (IA WhatsApp) :
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed font-sans font-medium">{mod.darijaDescription}</p>
                    </div>

                    {/* Video demo indicator */}
                    {mod.videoUrl ? (
                      <div className="flex items-center gap-2 text-xs text-indigo-700 bg-indigo-50/80 p-2.5 rounded-2xl border border-indigo-200">
                        <Video className="h-4 w-4 flex-shrink-0 text-indigo-600" />
                        <span className="truncate font-semibold">Vidéo Démo jointe ({mod.videoCaption || "Démonstration MP4"})</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 px-1">
                        <Video className="h-3.5 w-3.5 text-slate-300" />
                        <span>Pas de vidéo configurée</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions: Edit & Delete */}
                <div className="p-4 bg-[#FAF8F5]/80 border-t border-[#EBE6DE] flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Envoi bot actif
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* EDIT BUTTON */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditModel(mod)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 shadow-sm transition-all"
                      title="Modifier les photos, vidéo, prix ou texte Darija"
                    >
                      <Pencil className="h-3.5 w-3.5 text-slate-500" />
                      <span>Modifier</span>
                    </button>

                    {/* DELETE BUTTON */}
                    <button
                      type="button"
                      onClick={() => handleDeleteModel(mod.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Supprimer définitivement ce modèle"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Create / Edit Model Modal */}
          {showModelModal && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-serif font-black text-slate-900 text-lg">
                        {editingModel ? "Modifier le Modèle WhatsApp" : "Ajouter un Nouveau Modèle"}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {editingModel ? "Mise à jour des photos, vidéos et prix de ce modèle" : "Configurez les informations transmises par le bot"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModelModal(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveModel} className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nom du Modèle</label>
                    <input
                      type="text"
                      required
                      placeholder="ex: ALTAJ VINTAGE — MARRON FONCÉ"
                      value={modelFormName}
                      onChange={(e) => setModelFormName(e.target.value)}
                      className="w-full bg-[#F4F2EE] border border-transparent focus:border-purple-400 focus:bg-white rounded-2xl p-2.5 focus:outline-none transition-all font-medium text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Prix Unitaire (DH)</label>
                      <input
                        type="number"
                        required
                        value={modelFormPrice}
                        onChange={(e) => setModelFormPrice(e.target.value)}
                        className="w-full bg-[#F4F2EE] border border-transparent focus:border-purple-400 focus:bg-white rounded-2xl p-2.5 focus:outline-none transition-all font-medium text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Prix Pack Duo (DH)</label>
                      <input
                        type="number"
                        required
                        value={modelFormDuoPrice}
                        onChange={(e) => setModelFormDuoPrice(e.target.value)}
                        className="w-full bg-[#F4F2EE] border border-transparent focus:border-purple-400 focus:bg-white rounded-2xl p-2.5 focus:outline-none transition-all font-medium text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Badge (ex: Meilleure Vente)</label>
                      <input
                        type="text"
                        placeholder="⭐ Meilleure Vente"
                        value={modelFormBadge}
                        onChange={(e) => setModelFormBadge(e.target.value)}
                        className="w-full bg-[#F4F2EE] border border-transparent focus:border-purple-400 focus:bg-white rounded-2xl p-2.5 focus:outline-none transition-all font-medium text-slate-800"
                      />
                    </div>
                  </div>

                  {/* PHOTOS SECTION */}
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EBE6DE] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-extrabold text-slate-800 flex items-center gap-1.5">
                        <ImageIcon className="h-4 w-4 text-purple-600" />
                        <span>Photos HD du Modèle ({modelFormPhotos.length})</span>
                      </label>
                      <span className="text-[10px] text-slate-400">Envoyées sur demande</span>
                    </div>

                    {/* Photo list */}
                    <div className="space-y-2">
                      {modelFormPhotos.map((photoUrl, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
                          <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                            <Image src={photoUrl} alt="" fill className="object-cover" />
                          </div>
                          <span className="text-xs text-slate-600 truncate flex-1 font-mono">{photoUrl}</span>
                          <button
                            type="button"
                            onClick={() => handleRemovePhotoFromForm(idx)}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg"
                            title="Retirer cette photo"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add photo input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="/images/products/... ou URL web"
                        value={newPhotoInput}
                        onChange={(e) => setNewPhotoInput(e.target.value)}
                        className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:border-purple-400 focus:outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleAddPhotoToForm}
                        className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl border border-purple-200 transition-colors flex items-center gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Ajouter Photo</span>
                      </button>
                    </div>
                  </div>

                  {/* VIDEO SECTION */}
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EBE6DE] space-y-3">
                    <label className="font-extrabold text-slate-800 flex items-center gap-1.5">
                      <Video className="h-4 w-4 text-indigo-600" />
                      <span>Vidéo Démonstration (Optionnelle)</span>
                    </label>

                    <div className="space-y-2">
                      <div>
                        <span className="text-[10px] text-slate-500 font-medium block mb-1">URL de la vidéo (MP4, Cloudinary, YouTube ou lien direct) :</span>
                        <input
                          type="text"
                          placeholder="https://.../video-demo.mp4"
                          value={modelFormVideo}
                          onChange={(e) => setModelFormVideo(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:border-indigo-400 focus:outline-none font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-medium block mb-1">Titre / Légende de la vidéo :</span>
                        <input
                          type="text"
                          placeholder="Démonstration cuir & finitions main"
                          value={modelFormVideoCaption}
                          onChange={(e) => setModelFormVideoCaption(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:border-indigo-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* DARIJA DESCRIPTION */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Description en Darija (Envoyée par le bot)</label>
                    <textarea
                      rows={3}
                      value={modelFormDescription}
                      onChange={(e) => setModelFormDescription(e.target.value)}
                      placeholder="جلد طبيعي ممتاز 100% يدوي الصنع في فاس..."
                      className="w-full bg-[#F4F2EE] border border-transparent focus:border-purple-400 focus:bg-white rounded-2xl p-2.5 focus:outline-none transition-all font-sans text-slate-800"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowModelModal(false)}
                      className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold shadow-md shadow-purple-200 transition-all flex items-center gap-1.5"
                    >
                      <Save className="h-4 w-4" />
                      <span>{editingModel ? "Enregistrer les Modifications" : "Créer le Modèle"}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: CONFIGURATION & DARIJA SCRIPTS                    */}
      {/* ======================================================== */}
      {activeTab === "config" && (
        <div className="space-y-6">
          {/* QR Code Working Pairing Section */}
          <div className="bg-white rounded-lg p-6 border border-altaj-borderLight shadow-sm space-y-5">
            <div className="border-b pb-4">
              <h2 className="font-serif font-bold text-altaj-text text-base flex items-center gap-2">
                <QrCode className="h-5 w-5 text-altaj-brown" />
                Connexion WhatsApp par QR Code (Méthode Directe & Gratuite)
              </h2>
              <p className="text-xs text-altaj-muted mt-1">
                Liez votre smartphone en 10 secondes sans démarche complexe ni approbation Facebook/Meta.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Left: QR Code Box */}
              <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-altaj-bg/50 rounded-lg border border-altaj-borderLight">
                {config?.isConnected ? (
                  <div className="p-6 bg-emerald-50 border-2 border-emerald-500 rounded-xl text-center space-y-3 w-full">
                    <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
                    <div>
                      <h4 className="font-serif font-bold text-sm text-emerald-950">Appareil Connecté & Actif !</h4>
                      <p className="font-mono font-bold text-xs text-emerald-800 mt-1">{config.connectedNumber}</p>
                      <p className="text-[11px] text-emerald-700 mt-1">Le bot Darija répond automatiquement 24h/24</p>
                    </div>
                    <button
                      onClick={handleDisconnect}
                      className="px-4 py-1.5 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all"
                    >
                      Déconnecter cet appareil
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-3">
                    <div className="p-3 bg-white rounded-xl shadow-lg border-2 border-emerald-500 relative">
                      {realQrCode ? (
                        /* REAL SCANNABLE BAILEYS QR CODE */
                        <img
                          src={realQrCode}
                          alt="Scannez ce QR Code avec WhatsApp"
                          className="w-52 h-52 object-contain"
                        />
                      ) : (
                        <div className="w-52 h-52 flex flex-col items-center justify-center bg-gray-50 text-center p-4">
                          <QrCode className="h-10 w-10 text-altaj-brown animate-pulse mb-2" />
                          <span className="text-xs font-bold text-altaj-text">Génération du QR Code...</span>
                          <span className="text-[10px] text-altaj-muted mt-1">Connexion au serveur WhatsApp en cours</span>
                        </div>
                      )}
                    </div>

                    <div className="text-center space-y-1">
                      <span className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                        Scannez ce QR Code avec votre téléphone
                      </span>
                      <p className="text-[10px] text-altaj-muted">WhatsApp &gt; Appareils connectés &gt; Connecter un appareil</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Step-by-Step Instructions & Pairing Input */}
              <div className="md:col-span-7 space-y-4 text-xs">
                <div className="space-y-2">
                  <h4 className="font-bold text-altaj-text uppercase text-xs tracking-wider">Comment connecter votre numéro :</h4>
                  <ol className="space-y-2 text-altaj-text list-decimal list-inside leading-relaxed bg-white p-3 rounded border border-altaj-borderLight">
                    <li>Ouvrez l'application <strong>WhatsApp</strong> ou <strong>WhatsApp Business</strong> sur votre smartphone.</li>
                    <li>Accédez au menu <strong>"Réglages" (ou 3 points)</strong> ➔ <strong>"Appareils connectés" (الأجهزة المرتبطة)</strong>.</li>
                    <li>Touchez <strong>"Connecter un appareil"</strong> et pointez la caméra vers le QR code.</li>
                  </ol>
                </div>

                {/* Input to bind/simulate number */}
                <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                  <label className="font-bold text-altaj-text block">Numéro de téléphone WhatsApp à associer :</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inputPhone}
                      onChange={(e) => setInputPhone(e.target.value)}
                      placeholder="+212 6XX-XXXXXX"
                      className="flex-1 bg-white border border-gray-300 rounded px-3 py-2 text-xs font-mono focus:border-altaj-brown"
                    />
                    <button
                      type="button"
                      onClick={handlePairNumber}
                      className="bg-[#25D366] hover:bg-[#20ba59] text-altaj-dark font-extrabold px-4 py-2 rounded text-xs transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <Check className="h-4 w-4" />
                      <span>Associer & Activer</span>
                    </button>
                    {config?.isConnected && (
                      <button
                        type="button"
                        onClick={handleDisconnect}
                        className="bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 px-3 py-2 rounded text-xs font-bold"
                      >
                        Déconnecter
                      </button>
                    )}
                  </div>

                  {pairingSuccess && (
                    <div className="p-2.5 rounded bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Numéro WhatsApp connecté avec succès ! Le bot répondra désormais automatiquement en Darija.
                    </div>
                  )}

                  {disconnectSuccess && (
                    <div className="p-2.5 rounded bg-amber-100 text-amber-800 font-bold text-xs flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Session WhatsApp déconnectée.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* AI Intelligence & Customization Panel (Google Gemini) */}
          <div className="bg-gradient-to-br from-white to-amber-50/40 rounded-lg p-6 border-2 border-altaj-gold/40 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-altaj-borderLight pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-gradient-to-r from-amber-600 to-amber-800 text-white font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
                    Modèle IA Élite
                  </span>
                  <h2 className="font-serif font-bold text-altaj-text text-base flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-altaj-gold" />
                    Moteur d&apos;Intelligence Artificielle en Darija (Google Gemini AI)
                  </h2>
                </div>
                <p className="text-xs text-altaj-muted mt-1">
                  Comprend l&apos;Arabe marocain, l&apos;Arabizi (3, 7, 9), les questions complexes et les objections clients avec un naturel 100% humain.
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-altaj-borderLight shadow-sm">
                <button
                  type="button"
                  onClick={() => config && setConfig({ ...config, aiProvider: "GEMINI_AI" })}
                  className={`px-3 py-1.5 rounded-md font-bold text-xs transition-all flex items-center gap-1.5 ${
                    config?.aiProvider !== "RULES_ONLY"
                      ? "bg-altaj-brown text-white shadow-sm"
                      : "text-altaj-muted hover:text-altaj-dark"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>🤖 Mode IA Gemini (Actif)</span>
                </button>
                <button
                  type="button"
                  onClick={() => config && setConfig({ ...config, aiProvider: "RULES_ONLY" })}
                  className={`px-3 py-1.5 rounded-md font-bold text-xs transition-all flex items-center gap-1.5 ${
                    config?.aiProvider === "RULES_ONLY"
                      ? "bg-altaj-brown text-white shadow-sm"
                      : "text-altaj-muted hover:text-altaj-dark"
                  }`}
                >
                  <span>⚡ Scripts Fixes</span>
                </button>
              </div>
            </div>

            {/* Model & System Instructions */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-altaj-text block mb-1">Modèle LLM Recommandé pour la Darija :</label>
                  <select
                    value={config?.aiModel || "gemini-flash-latest"}
                    onChange={(e) => config && setConfig({ ...config, aiModel: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded p-2 text-xs font-mono font-bold focus:border-altaj-brown"
                  >
                    <option value="gemini-flash-latest">gemini-flash-latest (⚡ Recommandé : Ultra-rapide &amp; Parfaite maîtrise de la Darija)</option>
                    <option value="gemini-2.5-flash-lite">gemini-2.5-flash-lite (Économique &amp; Réactif)</option>
                    <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Nouvelle génération)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-altaj-text block mb-1">Clé API &amp; Connexion :</label>
                  <div className="p-2 bg-white rounded border border-gray-200 text-xs font-mono text-emerald-700 font-bold flex items-center justify-between">
                    <span className="truncate">GEMINI_API_KEY (Actif via .env.local)</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-black">
                      🟢 Connecté
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-altaj-text block">
                    Directives Personnalisées de l&apos;IA (System Prompt Darija) :
                  </label>
                  <span className="text-[10px] text-altaj-muted font-bold">
                    Vous pouvez personnaliser le ton, les règles et les arguments de vente ci-dessous
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={config?.aiCustomSystemPrompt || ""}
                  onChange={(e) =>
                    config && setConfig({ ...config, aiCustomSystemPrompt: e.target.value })
                  }
                  placeholder="أنت المساعد التجاري الذكي لمتجر ALTAJ LEATHER..."
                  className="w-full bg-white border border-gray-300 rounded-lg p-3 text-xs leading-relaxed font-sans focus:border-altaj-brown shadow-inner"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] text-altaj-muted flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>En cas de latence de l&apos;IA, bascule automatique sur les règles locales sans coupure.</span>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (config) {
                      saveWhatsAppConfig(config);
                      try {
                        await fetch("/api/whatsapp/chat", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ action: "update_config", config }),
                        });
                      } catch (e) {}
                      alert("Directives IA enregistrées avec succès !");
                    }
                  }}
                  className="bg-altaj-brown hover:bg-altaj-brown/90 text-white font-bold px-5 py-2 rounded-md text-xs shadow-sm transition-all flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Enregistrer les Directives IA</span>
                </button>
              </div>
            </div>
          </div>

          {/* Scripts Customizer (Moroccan Darija) */}
          <div className="bg-white rounded-lg p-6 border border-altaj-borderLight shadow-sm space-y-5">
            <div className="border-b pb-4">
              <h2 className="font-serif font-bold text-altaj-text text-base flex items-center gap-2">
                <Sliders className="h-5 w-5 text-altaj-gold" />
                Scripts de Secours &amp; Réponses Fixes (Fallback Manuel)
              </h2>
              <p className="text-xs text-altaj-muted mt-1">
                Textes utilisés en mode scripts fixes ou comme filet de sécurité si l&apos;IA est désactivée
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-altaj-text block mb-1">1. Message de Salutation & Bienvenue (الترحيب)</label>
                <textarea
                  rows={3}
                  value={config?.scripts.greeting}
                  onChange={(e) =>
                    config &&
                    setConfig({
                      ...config,
                      scripts: { ...config.scripts, greeting: e.target.value },
                    })
                  }
                  className="w-full border rounded p-2.5 font-sans focus:border-altaj-brown"
                />
              </div>

              <div>
                <label className="font-bold text-altaj-text block mb-1">2. Pitch de l'Offre & Pack Duo (أثمنة العروض)</label>
                <textarea
                  rows={3}
                  value={config?.scripts.pricingOffer}
                  onChange={(e) =>
                    config &&
                    setConfig({
                      ...config,
                      scripts: { ...config.scripts, pricingOffer: e.target.value },
                    })
                  }
                  className="w-full border rounded p-2.5 font-sans focus:border-altaj-brown"
                />
              </div>

              <div>
                <label className="font-bold text-altaj-text block mb-1">3. Demande de Coordonnées (طلب الاسم والمدينة)</label>
                <textarea
                  rows={3}
                  value={config?.scripts.askAddress}
                  onChange={(e) =>
                    config &&
                    setConfig({
                      ...config,
                      scripts: { ...config.scripts, askAddress: e.target.value },
                    })
                  }
                  className="w-full border rounded p-2.5 font-sans focus:border-altaj-brown"
                />
              </div>

              <div>
                <label className="font-bold text-altaj-text block mb-1">4. Message de Confirmation Réussie (نجاح التأكيد)</label>
                <textarea
                  rows={3}
                  value={config?.scripts.orderConfirmedSuccess}
                  onChange={(e) =>
                    config &&
                    setConfig({
                      ...config,
                      scripts: { ...config.scripts, orderConfirmedSuccess: e.target.value },
                    })
                  }
                  className="w-full border rounded p-2.5 font-sans focus:border-altaj-brown"
                />
              </div>

              <div>
                <label className="font-bold text-altaj-text block mb-1">5. FAQ : Cuir Naturel Véritable (الجلد الطبيعي)</label>
                <textarea
                  rows={3}
                  value={config?.scripts.faqRealLeather}
                  onChange={(e) =>
                    config &&
                    setConfig({
                      ...config,
                      scripts: { ...config.scripts, faqRealLeather: e.target.value },
                    })
                  }
                  className="w-full border rounded p-2.5 font-sans focus:border-altaj-brown"
                />
              </div>

              <div>
                <label className="font-bold text-altaj-text block mb-1">6. FAQ : Délais de Livraison au Maroc (مدة التوصيل)</label>
                <textarea
                  rows={3}
                  value={config?.scripts.faqDeliveryTime}
                  onChange={(e) =>
                    config &&
                    setConfig({
                      ...config,
                      scripts: { ...config.scripts, faqDeliveryTime: e.target.value },
                    })
                  }
                  className="w-full border rounded p-2.5 font-sans focus:border-altaj-brown"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button
                type="button"
                onClick={() => {
                  if (config) {
                    saveWhatsAppConfig(config);
                    alert("Scripts en Darija enregistrés avec succès !");
                  }
                }}
                className="px-5 py-2 rounded bg-altaj-brown text-white font-bold hover:bg-altaj-brown/90 shadow-sm"
              >
                Sauvegarder les Scripts Darija
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
