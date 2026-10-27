"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  getCampaignsWithStats,
  updateCampaign,
  deleteCampaign,
  addCampaign,
  getAnalytics,
  getOrders,
} from "@/lib/db/store";
import { MarketingCampaign, CampaignPlatform, CampaignStatus, CreativeType, Order } from "@/types";
import { formatMAD } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  Target,
  TrendingUp,
  Plus,
  Pencil,
  Trash2,
  Play,
  Pause,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  Sliders,
  DollarSign,
  Eye,
  BarChart3,
  Sparkles,
  ExternalLink,
  Layers,
  ShoppingBag,
  Truck,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function AdminMarketingPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [expandedChannel, setExpandedChannel] = useState<string | null>(null);

  // Modal States
  const [editingCampaign, setEditingCampaign] = useState<MarketingCampaign | null>(null);
  const [deletingCampaign, setDeletingCampaign] = useState<MarketingCampaign | null>(null);
  const [editingChannel, setEditingChannel] = useState<any | null>(null);
  const [deletingChannel, setDeletingChannel] = useState<any | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Campaign Form State
  const [newCampaignData, setNewCampaignData] = useState<Omit<MarketingCampaign, "id" | "createdAt" | "updatedAt">>({
    name: "",
    platform: "META",
    status: "ACTIVE",
    budget: 150,
    budgetType: "DAILY",
    spent: 0,
    targetAudience: "Hommes 25-45 ans • Casablanca, Rabat, Marrakech",
    utmCampaign: "",
    utmSource: "Meta Ads (Instagram)",
    creativeType: "VIDEO_REELS",
    startDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = () => {
    try {
      setCampaigns(getCampaignsWithStats());
      setOrders(getOrders());
      setStats(getAnalytics());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Summary Metrics
  const summary = useMemo(() => {
    const totalSpent = campaigns.reduce((acc, c) => acc + (c.spent || 0), 0);
    const totalRevenue = campaigns.reduce((acc, c) => acc + (c.revenue || 0), 0);
    const totalOrders = campaigns.reduce((acc, c) => acc + (c.ordersCount || 0), 0);
    const totalDelivered = campaigns.reduce((acc, c) => acc + (c.deliveredOrdersCount || 0), 0);
    const activeCount = campaigns.filter((c) => c.status === "ACTIVE").length;
    const blendedRoas = totalSpent > 0 ? Math.round((totalRevenue / totalSpent) * 100) / 100 : 0;

    return {
      totalSpent,
      totalRevenue,
      totalOrders,
      totalDelivered,
      activeCount,
      blendedRoas,
    };
  }, [campaigns]);

  // Filtered Campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.utmCampaign.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.targetAudience && c.targetAudience.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPlatform = selectedPlatform === "ALL" || c.platform === selectedPlatform;
      const matchesStatus = selectedStatus === "ALL" || c.status === selectedStatus;

      return matchesSearch && matchesPlatform && matchesStatus;
    });
  }, [campaigns, searchQuery, selectedPlatform, selectedStatus]);

  // Dynamically linked Channel Attribution from current campaigns and orders
  const channelAttribution = useMemo(() => {
    const totalOrdersCount = orders.length || 1;

    const channelsConfig = [
      {
        id: "META",
        name: "Meta Ads (Instagram & Facebook)",
        shortName: "Meta Ads",
        tagColor: "bg-blue-50 text-blue-800 border-blue-200",
        dotColor: "bg-blue-600",
        platform: "META" as CampaignPlatform,
        matchSource: (s: string) => {
          const l = (s || "").toLowerCase();
          return l.includes("meta") || l.includes("instagram") || l.includes("facebook");
        },
      },
      {
        id: "TIKTOK",
        name: "TikTok Ads (Spark & UGC)",
        shortName: "TikTok Ads",
        tagColor: "bg-pink-50 text-pink-800 border-pink-200",
        dotColor: "bg-pink-600",
        platform: "TIKTOK" as CampaignPlatform,
        matchSource: (s: string) => (s || "").toLowerCase().includes("tiktok"),
      },
      {
        id: "WHATSAPP",
        name: "WhatsApp Direct & Retargeting VIP",
        shortName: "WhatsApp",
        tagColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
        dotColor: "bg-emerald-600",
        platform: "WHATSAPP" as CampaignPlatform,
        matchSource: (s: string) => (s || "").toLowerCase().includes("whatsapp"),
      },
      {
        id: "GOOGLE",
        name: "Google Search Ads",
        shortName: "Google Search",
        tagColor: "bg-amber-50 text-amber-800 border-amber-200",
        dotColor: "bg-amber-600",
        platform: "GOOGLE" as CampaignPlatform,
        matchSource: (s: string) => (s || "").toLowerCase().includes("google"),
      },
      {
        id: "DIRECT",
        name: "Vente Directe / Atelier & Showroom",
        shortName: "Vente Directe",
        tagColor: "bg-slate-50 text-slate-800 border-slate-200",
        dotColor: "bg-slate-600",
        platform: null,
        matchSource: (s: string) => {
          const l = (s || "").toLowerCase();
          return l.includes("direct") || l.includes("atelier") || l.includes("organique") || !s;
        },
      },
    ];

    return channelsConfig
      .map((channel) => {
        // Find current campaigns for this channel
        const channelCampaigns = channel.platform
          ? campaigns.filter((c) => c.platform === channel.platform)
          : [];
        const activeCampaigns = channelCampaigns.filter((c) => c.status === "ACTIVE");

        // Total spend from current campaigns
        const totalSpent = channelCampaigns.reduce((sum, c) => sum + (c.spent || 0), 0);
        const dailyBudget = activeCampaigns.reduce(
          (sum, c) => sum + (c.budgetType === "DAILY" ? c.budget : Math.round(c.budget / 30)),
          0
        );

        // Match orders
        const campaignUtms = new Set(
          channelCampaigns.map((c) => (c.utmCampaign || "").toLowerCase()).filter(Boolean)
        );

        const matchedOrders = orders.filter((o) => {
          const orderUtm = (o.utmCampaign || "").toLowerCase();
          if (orderUtm && campaignUtms.has(orderUtm)) return true;
          if (channel.matchSource(o.utmSource || "")) return true;
          return false;
        });

        const ordersCount = matchedOrders.length;
        const deliveredOrders = matchedOrders.filter((o) => o.status === "DELIVERED");
        const deliveredCount = deliveredOrders.length;
        const returnedOrders = matchedOrders.filter((o) => o.status === "RETURNED");
        const returnedCount = returnedOrders.length;
        const shippedOrders = matchedOrders.filter((o) =>
          ["SHIPPED", "DELIVERED", "RETURNED"].includes(o.status)
        );
        const shippedCount = shippedOrders.length;
        const deliveryRate = shippedCount > 0 ? Math.round((deliveredCount / shippedCount) * 100) : 0;
        const revenue = deliveredOrders.reduce((sum, o) => sum + o.total, 0);
        const share = Math.round((ordersCount / totalOrdersCount) * 100);
        const cpa = deliveredCount > 0 ? Math.round(totalSpent / deliveredCount) : totalSpent;
        const roas = totalSpent > 0 ? Math.round((revenue / totalSpent) * 100) / 100 : 0;

        return {
          ...channel,
          totalCampaignsCount: channelCampaigns.length,
          activeCampaignsCount: activeCampaigns.length,
          activeCampaigns,
          channelCampaigns,
          totalSpent,
          dailyBudget,
          ordersCount,
          deliveredCount,
          returnedCount,
          shippedCount,
          deliveryRate,
          revenue,
          share,
          cpa,
          roas,
        };
      })
      .filter((c) => c.totalCampaignsCount > 0 || c.ordersCount > 0);
  }, [campaigns, orders]);

  // Handle Quick Status Toggle (Play / Pause)
  const handleToggleStatus = (campaign: MarketingCampaign) => {
    const newStatus: CampaignStatus = campaign.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    const updated = updateCampaign({ ...campaign, status: newStatus });
    if (updated) {
      showToast(`Campagne "${campaign.name}" passée en : ${newStatus === "ACTIVE" ? "🟢 ACTIVE" : "⏸️ EN PAUSE"}`);
      loadData();
    }
  };

  // Handle Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign) return;

    const updated = updateCampaign(editingCampaign);
    if (updated) {
      showToast(`Campagne "${updated.name}" modifiée avec succès !`);
      setEditingCampaign(null);
      loadData();
    }
  };

  // Handle Confirm Delete
  const handleConfirmDelete = () => {
    if (!deletingCampaign) return;
    const success = deleteCampaign(deletingCampaign.id);
    if (success) {
      showToast(`Campagne "${deletingCampaign.name}" supprimée.`);
      setDeletingCampaign(null);
      loadData();
    }
  };

  // Handle Save Channel Edit
  const handleSaveChannelEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChannel) return;

    if (editingChannel.platform) {
      const channelCampaigns = campaigns.filter(
        (c) => c.platform === editingChannel.platform
      );

      if (channelCampaigns.length > 0) {
        const budgetPerCampaign = Math.max(
          10,
          Math.round(editingChannel.dailyBudget / channelCampaigns.length)
        );
        channelCampaigns.forEach((c) => {
          updateCampaign({
            ...c,
            status: editingChannel.status,
            budget: budgetPerCampaign,
            spent:
              editingChannel.totalSpent > 0
                ? Math.round(editingChannel.totalSpent / channelCampaigns.length)
                : c.spent,
          });
        });
      }
    }

    showToast(`Canal "${editingChannel.name}" mis à jour avec succès.`);
    setEditingChannel(null);
    loadData();
  };

  // Handle Confirm Delete Channel
  const handleConfirmDeleteChannel = () => {
    if (!deletingChannel) return;

    if (deletingChannel.platform) {
      const channelCampaigns = campaigns.filter(
        (c) => c.platform === deletingChannel.platform
      );

      channelCampaigns.forEach((c) => {
        deleteCampaign(c.id);
      });
      showToast(
        `Canal "${deletingChannel.name}" et ses ${channelCampaigns.length} campagne(s) ont été supprimés.`
      );
    } else {
      showToast(`Canal "${deletingChannel.name}" réinitialisé.`);
    }

    setDeletingChannel(null);
    loadData();
  };

  // Handle Create New Campaign
  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    const created = addCampaign(newCampaignData);
    if (created) {
      showToast(`Nouvelle campagne "${created.name}" créée avec succès !`);
      setIsCreateModalOpen(false);
      // Reset form
      setNewCampaignData({
        name: "",
        platform: "META",
        status: "ACTIVE",
        budget: 150,
        budgetType: "DAILY",
        spent: 0,
        targetAudience: "Hommes 25-45 ans • Casablanca, Rabat, Marrakech",
        utmCampaign: "",
        utmSource: "Meta Ads (Instagram)",
        creativeType: "VIDEO_REELS",
        startDate: new Date().toISOString().split("T")[0],
        notes: "",
      });
      loadData();
    }
  };

  const getPlatformBadge = (platform: CampaignPlatform) => {
    switch (platform) {
      case "META":
        return {
          label: "Meta Ads",
          bg: "bg-blue-50 text-blue-800 border-blue-200",
          icon: "f",
        };
      case "TIKTOK":
        return {
          label: "TikTok Ads",
          bg: "bg-rose-50 text-rose-800 border-rose-200",
          icon: "♪",
        };
      case "GOOGLE":
        return {
          label: "Google Ads",
          bg: "bg-amber-50 text-amber-900 border-amber-200",
          icon: "G",
        };
      case "WHATSAPP":
        return {
          label: "WhatsApp Direct",
          bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
          icon: "W",
        };
      case "INFLUENCER":
        return {
          label: "Influenceur",
          bg: "bg-purple-50 text-purple-800 border-purple-200",
          icon: "★",
        };
      default:
        return {
          label: platform,
          bg: "bg-slate-50 text-slate-800 border-slate-200",
          icon: "•",
        };
    }
  };

  const getCreativeLabel = (type: CreativeType) => {
    switch (type) {
      case "VIDEO_REELS":
        return "Reels Vidéo (Instagram)";
      case "TIKTOK_UGC":
        return "TikTok UGC (Spark Hook)";
      case "CAROUSEL_PHOTO":
        return "Carrousel Photos Studio";
      case "IMAGE_STATIC":
        return "Image Statique";
      case "WHATSAPP_BROADCAST":
        return "Diffusion VIP WhatsApp";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-altaj-dark text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-altaj-gold/40 animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-altaj-gold flex-shrink-0" />
          <span className="text-xs font-bold tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-altaj-gold bg-altaj-gold/10 px-2.5 py-0.5 rounded-full border border-altaj-gold/30">
              Média Buying & COD Maroc
            </span>
            <span className="text-xs text-altaj-muted">• Attribution Publicitaire</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-black text-altaj-dark uppercase tracking-tight mt-1">
            Campagnes Marketing & Ads
          </h1>
          <p className="text-xs sm:text-sm text-altaj-muted">
            Gérez, éditez et suivez le retour sur investissement (ROAS) réel de vos campagnes publicitaires Meta, TikTok et Google.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="px-3 py-2 text-xs font-bold text-altaj-dark border border-altaj-border rounded-xl bg-white hover:bg-altaj-sand/30 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            ← Dashboard
          </Link>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-altaj-brown to-altaj-dark hover:opacity-95 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus className="h-4 w-4 text-altaj-gold" />
            <span>Nouvelle Campagne</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Marketing KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Ad Spend */}
        <div className="bg-white rounded-2xl p-5 border border-altaj-border/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Budget & Dépenses Ads
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-black text-altaj-dark">
              {formatMAD(summary.totalSpent)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Meta ({formatMAD(campaigns.filter((c) => c.platform === "META").reduce((s, c) => s + c.spent, 0))}) • TikTok ({formatMAD(campaigns.filter((c) => c.platform === "TIKTOK").reduce((s, c) => s + c.spent, 0))})
          </p>
        </div>

        {/* Real Delivered Revenue Attributed */}
        <div className="bg-white rounded-2xl p-5 border border-altaj-border/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              CA Livré & Encaissé
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-black text-emerald-900">
              {formatMAD(summary.totalRevenue)}
            </span>
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-2">
            Cash collecté des commandes livrées
          </p>
        </div>

        {/* Blended ROAS */}
        <div className="bg-white rounded-2xl p-5 border border-altaj-border/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              ROAS Blended (Retour Cash)
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-black text-amber-900">
              {summary.blendedRoas}x
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Rentable
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Pour 1 DH dépensé → {summary.blendedRoas} DH encaissés
          </p>
        </div>

        {/* Active Campaigns & Delivery Rate */}
        <div className="bg-white rounded-2xl p-5 border border-altaj-border/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Campagnes Actives
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-100">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-black text-purple-950">
              {summary.activeCount}
            </span>
            <span className="text-xs font-bold text-slate-500">
              sur {campaigns.length} au total
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mt-2">
            {summary.totalDelivered} colis livrés sur {summary.totalOrders} commandes
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-altaj-border/80 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher campagne, tag UTM, audience..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#FAF8F5] border border-altaj-border rounded-xl focus:outline-none focus:border-altaj-brown font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Platform & Status Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {/* Status Filters */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {[
              { id: "ALL", label: "Toutes" },
              { id: "ACTIVE", label: "Actives" },
              { id: "PAUSED", label: "En Pause" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                  selectedStatus === tab.id
                    ? "bg-white text-altaj-dark shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Platform Selector */}
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold bg-[#FAF8F5] border border-altaj-border rounded-xl text-slate-700"
          >
            <option value="ALL">Toutes Plateformes</option>
            <option value="META">Meta Ads (Instagram / FB)</option>
            <option value="TIKTOK">TikTok Ads</option>
            <option value="GOOGLE">Google Ads</option>
            <option value="WHATSAPP">WhatsApp Direct</option>
          </select>
        </div>
      </div>

      {/* Main Campaigns Table */}
      <div className="bg-white rounded-2xl border border-altaj-border shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-altaj-border flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-altaj-brown" />
            <h3 className="font-serif text-sm sm:text-base font-extrabold uppercase text-altaj-dark">
              Liste des Campagnes Publicitaires ({filteredCampaigns.length})
            </h3>
          </div>
          <span className="text-[11px] text-altaj-muted hidden sm:inline-block">
            Cliquez sur ✏️ pour modifier ou 🗑️ pour supprimer
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5]/80 border-b border-altaj-border text-[10px] uppercase font-bold text-slate-600 tracking-wider">
              <tr>
                <th className="p-3.5 sm:p-4">Plateforme & Format</th>
                <th className="p-3.5 sm:p-4">Campagne & Tag UTM</th>
                <th className="p-3.5 sm:p-4">Statut</th>
                <th className="p-3.5 sm:p-4">Budget / Dépensé</th>
                <th className="p-3.5 sm:p-4">Ventes COD Livrées</th>
                <th className="p-3.5 sm:p-4">ROAS & CPA</th>
                <th className="p-3.5 sm:p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-altaj-border/60">
              {filteredCampaigns.map((c) => {
                const badge = getPlatformBadge(c.platform);
                const isActive = c.status === "ACTIVE";

                return (
                  <tr key={c.id} className="hover:bg-[#FAF8F5]/50 transition-colors">
                    {/* Platform & Creative */}
                    <td className="p-3.5 sm:p-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-black border ${badge.bg}`}
                        >
                          {badge.icon}
                        </span>
                        <div>
                          <div className="font-bold text-altaj-dark">{badge.label}</div>
                          <span className="text-[10px] text-slate-500 block">
                            {getCreativeLabel(c.creativeType)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Campaign Name & UTM */}
                    <td className="p-3.5 sm:p-4 max-w-xs">
                      <div className="font-serif font-bold text-altaj-dark text-xs sm:text-sm">
                        {c.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                          utm_campaign: {c.utmCampaign}
                        </span>
                      </div>
                      {c.targetAudience && (
                        <p className="text-[10px] text-slate-500 mt-1 truncate">
                          🎯 {c.targetAudience}
                        </p>
                      )}
                    </td>

                    {/* Status & Quick Toggle */}
                    <td className="p-3.5 sm:p-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                            isActive
                              ? "bg-emerald-100 text-emerald-800"
                              : c.status === "PAUSED"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? "bg-emerald-600 animate-pulse" : "bg-amber-600"
                            }`}
                          />
                          {c.status === "ACTIVE" ? "Active" : c.status === "PAUSED" ? "En Pause" : c.status}
                        </span>
                        <button
                          onClick={() => handleToggleStatus(c)}
                          title={isActive ? "Mettre en pause" : "Activer la campagne"}
                          className="p-1 rounded hover:bg-slate-200 text-slate-500 transition-colors"
                        >
                          {isActive ? (
                            <Pause className="h-3.5 w-3.5 text-amber-700" />
                          ) : (
                            <Play className="h-3.5 w-3.5 text-emerald-700" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Budget & Spend */}
                    <td className="p-3.5 sm:p-4">
                      <div className="font-bold text-altaj-dark">
                        {formatMAD(c.spent)}{" "}
                        <span className="text-[10px] font-normal text-slate-500">dépensés</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Budget:{" "}
                        <strong>{formatMAD(c.budget)}</strong>
                        {c.budgetType === "DAILY" ? "/jour" : " total"}
                      </div>
                    </td>

                    {/* Orders & Revenue */}
                    <td className="p-3.5 sm:p-4">
                      <div className="font-serif font-black text-emerald-900 text-xs sm:text-sm">
                        {formatMAD(c.revenue)}
                      </div>
                      <div className="text-[10px] text-slate-600 mt-0.5 flex items-center gap-1">
                        <span>
                          <strong>{c.deliveredOrdersCount}</strong> livrées
                        </span>
                        <span>/</span>
                        <span>{c.ordersCount} cmd</span>
                        {c.deliveryRate > 0 && (
                          <span className="font-bold text-emerald-700">({c.deliveryRate}%)</span>
                        )}
                      </div>
                    </td>

                    {/* ROAS & CPA */}
                    <td className="p-3.5 sm:p-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-mono font-black text-xs px-2 py-0.5 rounded border ${
                            c.roas >= 2.5
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : c.roas >= 1.5
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-rose-50 text-rose-800 border-rose-200"
                          }`}
                        >
                          {c.roas > 0 ? `${c.roas}x` : "—"} ROAS
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        CPA livré:{" "}
                        <strong className="font-mono text-slate-700">
                          {c.deliveredOrdersCount > 0 ? formatMAD(c.cpa) : "—"}
                        </strong>
                      </span>
                    </td>

                    {/* Actions: Edit & Delete */}
                    <td className="p-3.5 sm:p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Edit Button */}
                        <button
                          onClick={() => setEditingCampaign({ ...c })}
                          title="Modifier la campagne"
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <Pencil className="h-3.5 w-3.5 text-altaj-brown" />
                          <span className="hidden sm:inline">Modifier</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeletingCampaign(c)}
                          title="Supprimer la campagne"
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Supprimer</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredCampaigns.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    <Target className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold">Aucune campagne ne correspond aux critères.</p>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedPlatform("ALL");
                        setSelectedStatus("ALL");
                      }}
                      className="mt-2 text-xs text-altaj-brown font-bold hover:underline"
                    >
                      Réinitialiser les filtres
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Acquisition Breakdown Linked to Current Active Campaigns */}
      <div className="bg-white rounded-2xl border border-altaj-border shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-altaj-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-altaj-gold/10 text-altaj-dark border border-altaj-gold/30">
              <BarChart3 className="h-4 w-4 text-altaj-gold" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-sm sm:text-base font-extrabold uppercase text-altaj-dark tracking-wide">
                  Répartition Globale par Canal d'Acquisition
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  En Direct des Campagnes
                </span>
              </div>
              <p className="text-[11px] text-altaj-muted">
                Synchronisé en temps réel avec vos campagnes publicitaires actives et les commandes réelles
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500 text-[11px]">
              {campaigns.filter((c) => c.status === "ACTIVE").length} campagnes actives au total
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5]/90 border-b border-altaj-border text-[10px] uppercase font-bold text-slate-600">
              <tr>
                <th className="p-3.5">Canal Publicitaire & Campagnes</th>
                <th className="p-3.5">Statut Campagnes</th>
                <th className="p-3.5">Budget / Dépense Réelle</th>
                <th className="p-3.5">Volume & Part</th>
                <th className="p-3.5">Colis Livrés & Taux COD</th>
                <th className="p-3.5">CA Encaissé</th>
                <th className="p-3.5">CPA Livré</th>
                <th className="p-3.5">Cash ROAS</th>
                <th className="p-3.5 text-right">Actions & Détail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-altaj-border/60">
              {channelAttribution.map((ch) => {
                const isExpanded = expandedChannel === ch.id;
                const hasCampaigns = ch.channelCampaigns.length > 0;

                return (
                  <React.Fragment key={ch.id}>
                    <tr
                      onClick={() => hasCampaigns && setExpandedChannel(isExpanded ? null : ch.id)}
                      className={`hover:bg-[#FAF8F5]/60 transition-colors ${hasCampaigns ? "cursor-pointer" : ""}`}
                    >
                      {/* Channel Name & Active Campaign Pills */}
                      <td className="p-3.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${ch.dotColor}`} />
                            <span className="font-bold text-altaj-dark text-xs sm:text-sm">
                              {ch.name}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ch.tagColor}`}>
                              {ch.shortName}
                            </span>
                          </div>
                          {ch.activeCampaigns.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1 pl-4 pt-0.5">
                              {ch.activeCampaigns.slice(0, 2).map((c: any) => (
                                <span
                                  key={c.id}
                                  className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium truncate max-w-[180px]"
                                  title={c.name}
                                >
                                  • {c.name}
                                </span>
                              ))}
                              {ch.activeCampaigns.length > 2 && (
                                <span className="text-[10px] text-altaj-brown font-bold">
                                  +{ch.activeCampaigns.length - 2} autre(s)
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Active Campaigns Count */}
                      <td className="p-3.5">
                        {ch.totalCampaignsCount > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                ch.activeCampaignsCount > 0
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : "bg-slate-100 text-slate-600 border-slate-200"
                              }`}
                            >
                              {ch.activeCampaignsCount} active{ch.activeCampaignsCount > 1 ? "s" : ""}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              / {ch.totalCampaignsCount}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">Organique (Atelier)</span>
                        )}
                      </td>

                      {/* Budget / Spent */}
                      <td className="p-3.5">
                        <div className="font-serif font-bold text-slate-800">
                          {formatMAD(ch.totalSpent)}
                        </div>
                        {ch.dailyBudget > 0 && (
                          <div className="text-[10px] text-slate-500 font-mono">
                            {formatMAD(ch.dailyBudget)} / jour
                          </div>
                        )}
                      </td>

                      {/* Orders & Share */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-altaj-dark">
                            {ch.ordersCount} cmd
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold">
                            ({ch.share}%)
                          </span>
                        </div>
                        <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                          <div
                            className="bg-altaj-brown h-full rounded-full"
                            style={{ width: `${Math.min(100, ch.share)}%` }}
                          />
                        </div>
                      </td>

                      {/* Delivered Orders & Delivery Rate */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-800">
                          {ch.deliveredCount} livrées
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                              ch.deliveryRate >= 75
                                ? "bg-emerald-100 text-emerald-800"
                                : ch.deliveryRate >= 65
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {ch.deliveryRate}% COD
                          </span>
                          {ch.returnedCount > 0 && (
                            <span className="text-[10px] text-rose-600 font-medium">
                              ({ch.returnedCount} retours)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Delivered Revenue */}
                      <td className="p-3.5 font-serif font-bold text-emerald-800">
                        {formatMAD(ch.revenue)}
                      </td>

                      {/* Delivered CPA */}
                      <td className="p-3.5">
                        {ch.totalSpent > 0 ? (
                          <span className="font-serif font-bold text-slate-700">
                            {formatMAD(ch.cpa)}
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-700 font-bold">0 DH (Gratuit)</span>
                        )}
                      </td>

                      {/* Cash ROAS */}
                      <td className="p-3.5">
                        {ch.totalSpent > 0 ? (
                          <span
                            className={`px-2 py-0.5 rounded-md font-mono font-black text-xs ${
                              ch.roas >= 3
                                ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                                : ch.roas >= 2
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : "bg-rose-100 text-rose-900 border border-rose-300"
                            }`}
                          >
                            {ch.roas}x
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md font-mono font-bold text-xs bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Organique
                          </span>
                        )}
                      </td>

                      {/* Actions (Edit & Delete Channel + Toggle Detail) */}
                      <td className="p-3.5 text-right">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Modifier Canal */}
                          <button
                            type="button"
                            onClick={() =>
                              setEditingChannel({
                                id: ch.id,
                                platform: ch.platform,
                                name: ch.name,
                                shortName: ch.shortName,
                                dailyBudget: ch.dailyBudget,
                                totalSpent: ch.totalSpent,
                                status: ch.activeCampaignsCount > 0 ? "ACTIVE" : "PAUSED",
                                totalCampaignsCount: ch.totalCampaignsCount,
                                ordersCount: ch.ordersCount,
                              })
                            }
                            className="p-1.5 rounded-lg text-amber-700 hover:text-amber-900 hover:bg-amber-100 transition-colors border border-amber-200 shadow-2xs"
                            title={`Modifier le canal ${ch.name}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>

                          {/* Supprimer Canal */}
                          {ch.platform && (
                            <button
                              type="button"
                              onClick={() =>
                                setDeletingChannel({
                                  id: ch.id,
                                  platform: ch.platform,
                                  name: ch.name,
                                  totalCampaignsCount: ch.totalCampaignsCount,
                                  totalSpent: ch.totalSpent,
                                  ordersCount: ch.ordersCount,
                                })
                              }
                              className="p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-100 transition-colors border border-rose-200 shadow-2xs"
                              title={`Supprimer le canal ${ch.name}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {/* Toggle Expand detail */}
                          {hasCampaigns && (
                            <button
                              type="button"
                              onClick={() => setExpandedChannel(isExpanded ? null : ch.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                              title={isExpanded ? "Masquer les campagnes" : "Voir les campagnes"}
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Sub-table of Campaigns under this Channel */}
                    {isExpanded && hasCampaigns && (
                      <tr className="bg-[#FAF8F5]/80">
                        <td colSpan={9} className="p-3 sm:p-4 border-t border-b border-altaj-border/80">
                          <div className="space-y-2 pl-4 border-l-2 border-altaj-gold">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-altaj-dark">
                                Campagnes actives et configurées pour {ch.name} :
                              </span>
                              <span className="text-[10px] text-altaj-muted">
                                Modifiez ou supprimez les campagnes individuellement
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                              {ch.channelCampaigns.map((c: any) => (
                                <div
                                  key={c.id}
                                  className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1.5 text-xs hover:border-altaj-brown transition-colors"
                                >
                                  <div className="flex items-start justify-between gap-1">
                                    <span className="font-bold text-altaj-dark truncate" title={c.name}>
                                      {c.name}
                                    </span>
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                        c.status === "ACTIVE"
                                          ? "bg-emerald-100 text-emerald-800"
                                          : "bg-slate-100 text-slate-600"
                                      }`}
                                    >
                                      {c.status === "ACTIVE" ? "ACTIVE" : "PAUSE"}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600">
                                    <div>Dépense: <strong>{formatMAD(c.spent)}</strong></div>
                                    <div>Budget: <strong>{formatMAD(c.budget)}</strong>/j</div>
                                    <div>Commandes: <strong>{c.ordersCount || 0}</strong></div>
                                    <div>Livrées: <strong>{c.deliveredOrdersCount || 0}</strong></div>
                                    <div>CPA: <strong>{formatMAD(c.cpa || 0)}</strong></div>
                                    <div>ROAS: <strong>{c.roas || 0}x</strong></div>
                                  </div>
                                  <div className="pt-1 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {c.utmCampaign}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingCampaign(c);
                                        }}
                                        className="text-[10px] text-altaj-brown font-bold hover:underline flex items-center gap-0.5"
                                        title="Modifier cette campagne"
                                      >
                                        <Pencil className="h-2.5 w-2.5" />
                                        <span>Modifier</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setDeletingCampaign(c);
                                        }}
                                        className="text-[10px] text-rose-600 font-bold hover:underline flex items-center gap-0.5"
                                        title="Supprimer cette campagne"
                                      >
                                        <Trash2 className="h-2.5 w-2.5" />
                                        <span>Supprimer</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT CAMPAIGN MODAL                                              */}
      {/* ========================================================================= */}
      {editingCampaign && (
        <div className="fixed inset-0 z-50 bg-altaj-dark/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full rounded-2xl border border-altaj-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 border-b border-altaj-border bg-[#FAF8F5] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                  <Pencil className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-extrabold text-altaj-dark">
                    Modifier la Campagne Publicitaire
                  </h3>
                  <p className="text-xs font-bold text-altaj-brown">{editingCampaign.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingCampaign(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 text-xs">
              {/* Campaign Name */}
              <div className="space-y-1">
                <label className="font-bold text-altaj-dark block">Nom de la Campagne</label>
                <input
                  type="text"
                  value={editingCampaign.name}
                  onChange={(e) => setEditingCampaign({ ...editingCampaign, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-altaj-border rounded-xl text-xs font-medium focus:outline-none focus:border-altaj-brown bg-[#FAF8F5]"
                />
              </div>

              {/* Platform & Creative Format */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-altaj-dark block">Plateforme Ads</label>
                  <select
                    value={editingCampaign.platform}
                    onChange={(e) =>
                      setEditingCampaign({
                        ...editingCampaign,
                        platform: e.target.value as CampaignPlatform,
                      })
                    }
                    className="w-full px-3 py-2 border border-altaj-border rounded-xl text-xs bg-[#FAF8F5] font-medium"
                  >
                    <option value="META">Meta Ads (Instagram / FB)</option>
                    <option value="TIKTOK">TikTok Ads</option>
                    <option value="GOOGLE">Google Ads</option>
                    <option value="WHATSAPP">WhatsApp Direct</option>
                    <option value="INFLUENCER">Influenceur / UGC</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-altaj-dark block">Format Créatif</label>
                  <select
                    value={editingCampaign.creativeType}
                    onChange={(e) =>
                      setEditingCampaign({
                        ...editingCampaign,
                        creativeType: e.target.value as CreativeType,
                      })
                    }
                    className="w-full px-3 py-2 border border-altaj-border rounded-xl text-xs bg-[#FAF8F5] font-medium"
                  >
                    <option value="VIDEO_REELS">Reels Vidéo (Instagram)</option>
                    <option value="TIKTOK_UGC">TikTok UGC (Spark Hook)</option>
                    <option value="CAROUSEL_PHOTO">Carrousel Photos Studio</option>
                    <option value="IMAGE_STATIC">Image Statique</option>
                    <option value="WHATSAPP_BROADCAST">Diffusion VIP WhatsApp</option>
                  </select>
                </div>
              </div>

              {/* Status & Budget Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-altaj-dark block">Statut</label>
                  <select
                    value={editingCampaign.status}
                    onChange={(e) =>
                      setEditingCampaign({
                        ...editingCampaign,
                        status: e.target.value as CampaignStatus,
                      })
                    }
                    className="w-full px-3 py-2 border border-altaj-border rounded-xl text-xs bg-[#FAF8F5] font-bold"
                  >
                    <option value="ACTIVE">🟢 Active (En diffusion)</option>
                    <option value="PAUSED">⏸️ En Pause</option>
                    <option value="COMPLETED">✅ Terminée</option>
                    <option value="DRAFT">📝 Brouillon</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-altaj-dark block">Type de Budget</label>
                  <select
                    value={editingCampaign.budgetType}
                    onChange={(e) =>
                      setEditingCampaign({
                        ...editingCampaign,
                        budgetType: e.target.value as "DAILY" | "LIFETIME",
                      })
                    }
                    className="w-full px-3 py-2 border border-altaj-border rounded-xl text-xs bg-[#FAF8F5]"
                  >
                    <option value="DAILY">Journalier (DH / jour)</option>
                    <option value="LIFETIME">Global (DH total)</option>
                  </select>
                </div>
              </div>

              {/* Budget & Real Spend */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-altaj-dark block">Montant du Budget (DH)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingCampaign.budget}
                    onChange={(e) =>
                      setEditingCampaign({
                        ...editingCampaign,
                        budget: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-altaj-border rounded-xl font-mono text-xs font-bold bg-[#FAF8F5]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-altaj-dark block">Dépense Réelle à ce jour (DH)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingCampaign.spent}
                    onChange={(e) =>
                      setEditingCampaign({
                        ...editingCampaign,
                        spent: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-altaj-border rounded-xl font-mono text-xs font-bold bg-[#FAF8F5]"
                  />
                </div>
              </div>

              {/* UTM Campaign Tag */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-altaj-dark">Tag UTM Campaign</label>
                  <span className="text-[10px] text-slate-500">
                    Utilisé pour attribuer automatiquement les commandes
                  </span>
                </div>
                <input
                  type="text"
                  value={editingCampaign.utmCampaign}
                  onChange={(e) =>
                    setEditingCampaign({ ...editingCampaign, utmCampaign: e.target.value })
                  }
                  required
                  placeholder="Ex: Reels_Craftsmanship_V2"
                  className="w-full px-3 py-2 border border-altaj-border rounded-xl font-mono text-xs bg-[#FAF8F5]"
                />
              </div>

              {/* Target Audience */}
              <div className="space-y-1">
                <label className="font-bold text-altaj-dark block">Audience Cible & Villes Maroc</label>
                <input
                  type="text"
                  value={editingCampaign.targetAudience}
                  onChange={(e) =>
                    setEditingCampaign({ ...editingCampaign, targetAudience: e.target.value })
                  }
                  placeholder="Ex: Hommes 25-45 ans • Casablanca, Rabat, Marrakech"
                  className="w-full px-3 py-2 border border-altaj-border rounded-xl text-xs bg-[#FAF8F5]"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="font-bold text-altaj-dark block">Notes & Observations</label>
                <textarea
                  rows={2}
                  value={editingCampaign.notes || ""}
                  onChange={(e) =>
                    setEditingCampaign({ ...editingCampaign, notes: e.target.value })
                  }
                  placeholder="Observations sur les créatifs, angle marketing, hook..."
                  className="w-full px-3 py-2 border border-altaj-border rounded-xl text-xs bg-[#FAF8F5]"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-altaj-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingCampaign(null)}
                  className="rounded-xl text-xs"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  size="sm"
                  className="rounded-xl text-xs font-bold px-5 bg-gradient-to-r from-amber-600 to-altaj-brown hover:opacity-95"
                >
                  Enregistrer les Modifications
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CREATE NEW CAMPAIGN MODAL                                        */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-altaj-dark/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full rounded-2xl border border-altaj-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 border-b border-altaj-border bg-[#FAF8F5] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-extrabold text-altaj-dark">
                    Créer une Nouvelle Campagne Publicitaire
                  </h3>
                  <p className="text-xs text-slate-500">Configurez le tracking et le budget</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateCampaign} className="p-5 space-y-4 text-xs">
              {/* Campaign Name */}
              <div className="space-y-1">
                <label className="font-bold text-altaj-dark block">Nom de la Campagne</label>
                <input
                  type="text"
                  value={newCampaignData.name}
                  onChange={(e) =>
                    setNewCampaignData({ ...newCampaignData, name: e.target.value })
                  }
                  required
                  placeholder="Ex: TikTok UGC Hook Résistance Cuir"
                  className="w-full px-3 py-2 border border-altaj-border rounded-xl text-xs font-medium focus:outline-none focus:border-altaj-brown bg-[#FAF8F5]"
                />
              </div>

              {/* Platform & Creative Format */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-altaj-dark block">Plateforme</label>
                  <select
                    value={newCampaignData.platform}
                    onChange={(e) => {
                      const plat = e.target.value as CampaignPlatform;
                      let src = "Meta Ads (Instagram)";
                      if (plat === "TIKTOK") src = "TikTok Ads (Spark)";
                      if (plat === "GOOGLE") src = "Google Search";
                      if (plat === "WHATSAPP") src = "WhatsApp Direct";
                      setNewCampaignData({
                        ...newCampaignData,
                        platform: plat,
                        utmSource: src,
                      });
                    }}
                    className="w-full px-3 py-2 border border-altaj-border rounded-xl text-xs bg-[#FAF8F5] font-medium"
                  >
                    <option value="META">Meta Ads (Instagram / FB)</option>
                    <option value="TIKTOK">TikTok Ads</option>
                    <option value="GOOGLE">Google Ads</option>
                    <option value="WHATSAPP">WhatsApp Direct</option>
                    <option value="INFLUENCER">Influenceur / Partenaire</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-altaj-dark block">Format Créatif</label>
                  <select
                    value={newCampaignData.creativeType}
                    onChange={(e) =>
                      setNewCampaignData({
                        ...newCampaignData,
                        creativeType: e.target.value as CreativeType,
                      })
                    }
                    className="w-full px-3 py-2 border border-altaj-border rounded-xl text-xs bg-[#FAF8F5] font-medium"
                  >
                    <option value="VIDEO_REELS">Reels Vidéo (Instagram)</option>
                    <option value="TIKTOK_UGC">TikTok UGC (Spark Hook)</option>
                    <option value="CAROUSEL_PHOTO">Carrousel Photos Studio</option>
                    <option value="IMAGE_STATIC">Image Statique</option>
                    <option value="WHATSAPP_BROADCAST">Diffusion VIP WhatsApp</option>
                  </select>
                </div>
              </div>

              {/* Budget & Spend */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-altaj-dark block">Budget Initial (DH)</label>
                  <input
                    type="number"
                    min="0"
                    value={newCampaignData.budget}
                    onChange={(e) =>
                      setNewCampaignData({
                        ...newCampaignData,
                        budget: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-altaj-border rounded-xl font-mono text-xs font-bold bg-[#FAF8F5]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-altaj-dark block">Dépense Actuelle (DH)</label>
                  <input
                    type="number"
                    min="0"
                    value={newCampaignData.spent}
                    onChange={(e) =>
                      setNewCampaignData({
                        ...newCampaignData,
                        spent: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-altaj-border rounded-xl font-mono text-xs font-bold bg-[#FAF8F5]"
                  />
                </div>
              </div>

              {/* UTM Campaign Tag */}
              <div className="space-y-1">
                <label className="font-bold text-altaj-dark block">Tag utm_campaign</label>
                <input
                  type="text"
                  value={newCampaignData.utmCampaign}
                  onChange={(e) =>
                    setNewCampaignData({ ...newCampaignData, utmCampaign: e.target.value })
                  }
                  required
                  placeholder="Ex: TikTok_Hook_Knife_V1"
                  className="w-full px-3 py-2 border border-altaj-border rounded-xl font-mono text-xs bg-[#FAF8F5]"
                />
              </div>

              {/* Audience */}
              <div className="space-y-1">
                <label className="font-bold text-altaj-dark block">Audience Cible & Villes</label>
                <input
                  type="text"
                  value={newCampaignData.targetAudience}
                  onChange={(e) =>
                    setNewCampaignData({ ...newCampaignData, targetAudience: e.target.value })
                  }
                  placeholder="Ex: Hommes 20-40 ans • Casablanca, Tanger, Rabat"
                  className="w-full px-3 py-2 border border-altaj-border rounded-xl text-xs bg-[#FAF8F5]"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-altaj-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-xl text-xs"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  size="sm"
                  className="rounded-xl text-xs font-bold px-5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:opacity-95 text-white"
                >
                  Créer la Campagne
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: DELETE CONFIRMATION MODAL                                        */}
      {/* ========================================================================= */}
      {deletingCampaign && (
        <div className="fixed inset-0 z-50 bg-altaj-dark/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl border border-rose-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-full">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-altaj-dark">
                  Supprimer la Campagne ?
                </h3>
                <p className="text-xs text-rose-600 font-semibold">Action irréversible</p>
              </div>
            </div>

            <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-4 text-xs space-y-2 text-slate-700">
              <p>
                Êtes-vous certain de vouloir supprimer la campagne suivante :
              </p>
              <div className="font-serif font-bold text-sm text-altaj-dark bg-white p-2.5 rounded-lg border border-rose-100">
                {deletingCampaign.name}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Tag: <strong className="font-mono">{deletingCampaign.utmCampaign}</strong></span>
                <span>Dépense: <strong>{formatMAD(deletingCampaign.spent)}</strong></span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeletingCampaign(null)}
                className="rounded-xl text-xs"
              >
                Annuler
              </Button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Confirmer la Suppression</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: EDIT CHANNEL MODAL                                               */}
      {/* ========================================================================= */}
      {editingChannel && (
        <div className="fixed inset-0 z-50 bg-altaj-dark/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl border border-altaj-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 border-b border-altaj-border bg-[#FAF8F5] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                  <Pencil className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-extrabold text-altaj-dark">
                    Modifier le Canal d'Acquisition
                  </h3>
                  <p className="text-xs font-bold text-altaj-brown">{editingChannel.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingChannel(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveChannelEdit} className="p-5 space-y-4 text-xs">
              {/* Channel Display Name */}
              <div className="space-y-1">
                <label className="font-bold text-altaj-dark">Nom du Canal Marketing</label>
                <input
                  type="text"
                  required
                  value={editingChannel.name}
                  onChange={(e) =>
                    setEditingChannel({ ...editingChannel, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-altaj-gold font-medium"
                />
              </div>

              {/* Status & Daily Budget */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-altaj-dark">Statut du Canal</label>
                  <select
                    value={editingChannel.status}
                    onChange={(e) =>
                      setEditingChannel({
                        ...editingChannel,
                        status: e.target.value as "ACTIVE" | "PAUSED",
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-altaj-gold font-medium bg-white"
                  >
                    <option value="ACTIVE">🟢 Actif (Diffuser)</option>
                    <option value="PAUSED">⏸️ En Pause (Suspendre)</option>
                  </select>
                  <span className="text-[10px] text-slate-500">
                    Applique le statut à toutes les campagnes
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-altaj-dark">Budget Quotidien Global (DH/j)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingChannel.dailyBudget}
                    onChange={(e) =>
                      setEditingChannel({
                        ...editingChannel,
                        dailyBudget: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-altaj-gold font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-500">
                    Réparti sur les campagnes du canal
                  </span>
                </div>
              </div>

              {/* Real Cumulative Spend */}
              <div className="space-y-1">
                <label className="font-bold text-altaj-dark">Dépenses Publicitaires Réelles (DH)</label>
                <input
                  type="number"
                  min="0"
                  value={editingChannel.totalSpent}
                  onChange={(e) =>
                    setEditingChannel({
                      ...editingChannel,
                      totalSpent: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-altaj-gold font-mono font-bold text-emerald-950"
                />
                <span className="text-[10px] text-slate-500">
                  Montant exact déduit dans le calcul du bénéfice net et du ROAS
                </span>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 leading-relaxed">
                ℹ️ <strong>Synchronisation automatique :</strong> Les modifications de budget et de statut s'appliquent immédiatement à l'ensemble des {editingChannel.totalCampaignsCount || 0} campagnes associées à ce canal publicitaire.
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-altaj-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingChannel(null)}
                  className="rounded-xl text-xs"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  size="sm"
                  className="rounded-xl text-xs font-bold px-5 bg-gradient-to-r from-amber-700 to-altaj-dark hover:opacity-95 text-white"
                >
                  Enregistrer les Modifications
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: DELETE CHANNEL CONFIRMATION MODAL                                */}
      {/* ========================================================================= */}
      {deletingChannel && (
        <div className="fixed inset-0 z-50 bg-altaj-dark/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl border border-rose-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-full">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-altaj-dark">
                  Supprimer ce Canal d'Acquisition ?
                </h3>
                <p className="text-xs text-rose-600 font-semibold">Action irréversible</p>
              </div>
            </div>

            <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-4 text-xs space-y-2 text-slate-700">
              <p>
                Êtes-vous certain de vouloir supprimer le canal d'acquisition suivant ainsi que toutes ses campagnes associées :
              </p>
              <div className="font-serif font-bold text-sm text-altaj-dark bg-white p-2.5 rounded-lg border border-rose-100">
                {deletingChannel.name}
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                <div>Campagnes : <strong>{deletingChannel.totalCampaignsCount || 0} campagne(s)</strong></div>
                <div>Dépenses : <strong>{formatMAD(deletingChannel.totalSpent || 0)}</strong></div>
                <div>Commandes : <strong>{deletingChannel.ordersCount || 0}</strong></div>
              </div>
              <p className="text-[11px] text-slate-500 pt-1 border-t border-rose-200/60">
                💡 L'historique des commandes clients est conservé, seules les campagnes actives de ce canal seront supprimées.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeletingChannel(null)}
                className="rounded-xl text-xs"
              >
                Annuler
              </Button>
              <button
                type="button"
                onClick={handleConfirmDeleteChannel}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Confirmer la Suppression du Canal</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
