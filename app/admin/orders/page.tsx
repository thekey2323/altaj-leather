"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  getOrders,
  updateOrderStatus,
  updateOrder,
  deleteOrder,
  deleteOrders,
  createOrder,
  getProducts,
  getEstimatedCourierCostForCity,
} from "@/lib/db/store";
import { Order, OrderStatus, Product } from "@/types";
import { formatMAD, MOROCCAN_CITIES } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  Search,
  PhoneCall,
  MessageSquare,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  XCircle,
  Package,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  Sliders,
  Plus,
  ShoppingBag,
  History,
  Calendar,
  Sparkles,
} from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedCity, setSelectedCity] = useState<string>("ALL");

  // Edit & Delete state
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  const handleSelectAll = () => {
    const currentFilteredIds = filteredOrders.map((o) => o.id);
    const areAllSelected =
      currentFilteredIds.length > 0 &&
      currentFilteredIds.every((id) => selectedOrderIds.includes(id));

    if (areAllSelected) {
      setSelectedOrderIds((prev) => prev.filter((id) => !currentFilteredIds.includes(id)));
    } else {
      setSelectedOrderIds((prev) => Array.from(new Set([...prev, ...currentFilteredIds])));
    }
  };

  const handleToggleSelect = (orderId: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedOrderIds.length === 0) return;
    const count = selectedOrderIds.length;
    if (!confirm(`Supprimer définitivement ces ${count} commandes sélectionnées ?`)) return;

    setIsDeletingBulk(true);
    const idsToDelete = [...selectedOrderIds];
    setOrders((prev) => prev.filter((o) => !idsToDelete.includes(o.id) && !idsToDelete.includes(o.orderNumber)));
    setSelectedOrderIds([]);

    deleteOrders(idsToDelete);

    try {
      await fetch(`/api/orders?ids=${encodeURIComponent(idsToDelete.join(","))}`, {
        method: "DELETE",
      });
    } catch {} finally {
      setIsDeletingBulk(false);
    }

    showToast(`${count} commandes supprimées avec succès.`);
  };

  // Purge Modal State
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [purgeOption, setPurgeOption] = useState<"7days" | "14days" | "30days" | "samples" | "all">("7days");
  const [isPurging, setIsPurging] = useState(false);

  // New Order State
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerCity, setNewCustomerCity] = useState("Casablanca");
  const [newCustomerAddress, setNewCustomerAddress] = useState("");
  const [newProductId, setNewProductId] = useState("");
  const [newQuantity, setNewQuantity] = useState(1);
  const [newShippingFee, setNewShippingFee] = useState(0);
  const [newCourierCost, setNewCourierCost] = useState(getEstimatedCourierCostForCity("Casablanca"));
  const [newDiscount, setNewDiscount] = useState(0);
  const [newOrderStatus, setNewOrderStatus] = useState<OrderStatus>("NEW");
  const [newOrderSource, setNewOrderSource] = useState("WhatsApp Direct");
  const [newOrderNotes, setNewOrderNotes] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const serverOrders = await res.json();
        setOrders(serverOrders);
        const prods = getProducts();
        setProducts(prods);
        if (prods.length > 0 && !newProductId) {
          setNewProductId(prods[0].id);
        }
        return;
      }
    } catch (e) {}

    setOrders(getOrders());
    const prods = getProducts();
    setProducts(prods);
    if (prods.length > 0 && !newProductId) {
      setNewProductId(prods[0].id);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateNewOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find((p) => p.id === newProductId) || products[0];
    if (!product) return;

    const unitPrice = product.price;
    const subtotal = unitPrice * newQuantity;

    const created = createOrder({
      customerName: newCustomerName,
      customerPhone: newCustomerPhone,
      customerCity: newCustomerCity,
      customerAddress: newCustomerAddress,
      notes: newOrderNotes,
      items: [
        {
          productId: product.id,
          productName: product.name,
          productImage: product.featuredImage || "/placeholder.jpg",
          quantity: newQuantity,
          unitPrice,
          totalPrice: subtotal,
          bundleName: newQuantity >= 2 ? "Pack Duo (Meilleure Offre)" : undefined,
        },
      ],
      subtotal,
      discount: newDiscount,
      shippingFee: newShippingFee,
      courierCost: newCourierCost,
      utmSource: newOrderSource,
      utmCampaign: "Direct_Order",
      status: newOrderStatus,
    });

    setIsNewOrderModalOpen(false);
    // Reset inputs
    setNewCustomerName("");
    setNewCustomerPhone("");
    setNewCustomerAddress("");
    setNewOrderNotes("");
    setNewQuantity(1);
    setNewDiscount(0);
    setNewShippingFee(0);
    setNewCourierCost(getEstimatedCourierCostForCity("Casablanca"));
    loadOrders();
    showToast(`Nouvelle commande #${created.orderNumber} créée avec succès !`);
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus, "Staff");
    loadOrders();
    showToast(`Statut de la commande mis à jour : ${newStatus}`);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    updateOrder(editingOrder);
    setEditingOrder(null);
    loadOrders();
    showToast(`Commande ${editingOrder.orderNumber} modifiée avec succès !`);
  };

  const handleConfirmDelete = async () => {
    if (!deletingOrder) return;

    const num = deletingOrder.orderNumber;
    const orderId = deletingOrder.id;

    // 1. Immediately filter out from state so it disappears instantly
    setOrders((prev) => prev.filter((o) => o.id !== orderId && o.orderNumber !== num));
    setDeletingOrder(null);
    showToast(`Commande ${num} supprimée définitivement.`);

    // 2. Delete from client localStorage
    try {
      deleteOrder(orderId);
    } catch (e) {}

    // 3. Delete from server API (persisted in data/orders.json and data/whatsapp-conversations.json)
    try {
      await fetch(`/api/orders?id=${encodeURIComponent(orderId)}`, {
        method: "DELETE",
      });
    } catch (e) {
      console.warn("Could not delete from /api/orders?id=:", e);
    }

    try {
      await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        method: "DELETE",
      });
    } catch (e) {}
  };

  const handleConfirmPurge = async () => {
    setIsPurging(true);
    try {
      let body: any = {};
      if (purgeOption === "7days") body = { keepDays: 7 };
      else if (purgeOption === "14days") body = { keepDays: 14 };
      else if (purgeOption === "30days") body = { keepDays: 30 };
      else if (purgeOption === "samples") body = { onlySamples: true };
      else if (purgeOption === "all") body = { all: true };

      const res = await fetch("/api/orders/purge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        const updatedList: Order[] = data.orders || [];
        if (typeof window !== "undefined") {
          localStorage.setItem("altaj_orders_v2", JSON.stringify(updatedList));
        }
        setOrders(updatedList);
        setIsPurgeModalOpen(false);
        showToast(
          `Historique nettoyé : ${data.deletedCount} commande(s) supprimée(s), ${data.remainingCount} conservée(s).`
        );
        return;
      }
    } catch (e) {
      console.error("Purge error:", e);
    } finally {
      setIsPurging(false);
    }

    // Client-side fallback purge
    const cutoffMap: Record<string, number> = {
      "7days": 7 * 24 * 3600 * 1000,
      "14days": 14 * 24 * 3600 * 1000,
      "30days": 30 * 24 * 3600 * 1000,
    };

    let remaining = [...orders];
    if (purgeOption === "all") {
      remaining = [];
    } else if (purgeOption === "samples") {
      remaining = remaining.filter(
        (o) =>
          !o.id.startsWith("ord-10") &&
          !o.orderNumber.startsWith("ALTAJ-102") &&
          !o.orderNumber.startsWith("ALTAJ-100")
      );
    } else if (cutoffMap[purgeOption]) {
      const cutoff = Date.now() - cutoffMap[purgeOption];
      remaining = remaining.filter((o) => {
        const t = new Date(o.createdAt).getTime();
        return !isNaN(t) && t >= cutoff;
      });
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("altaj_orders_v2", JSON.stringify(remaining));
    }
    setOrders(remaining);
    setIsPurgeModalOpen(false);
    showToast(`Historique nettoyé avec succès.`);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery);

    const matchesStatus =
      selectedStatus === "ALL" || order.status === selectedStatus;

    const matchesCity =
      selectedCity === "ALL" || order.customerCity === selectedCity;

    return matchesSearch && matchesStatus && matchesCity;
  });

  const getStatusBadge = (status: OrderStatus) => {
    const config: Record<
      OrderStatus,
      { label: string; bg: string; text: string; icon: any }
    > = {
      NEW: { label: "NOUVELLE", bg: "bg-amber-100", text: "text-amber-900", icon: Clock },
      PENDING_CONFIRMATION: { label: "À CONFIRMER", bg: "bg-yellow-100", text: "text-yellow-900", icon: Clock },
      CONFIRMED: { label: "CONFIRMÉE", bg: "bg-blue-100", text: "text-blue-900", icon: CheckCircle2 },
      PREPARING: { label: "EN PRÉPARATION", bg: "bg-purple-100", text: "text-purple-900", icon: Package },
      SHIPPED: { label: "EXPÉDIÉE", bg: "bg-indigo-100", text: "text-indigo-900", icon: Truck },
      DELIVERED: { label: "LIVRÉE (ENCAISSÉ)", bg: "bg-emerald-100", text: "text-emerald-900", icon: CheckCircle2 },
      CANCELLED: { label: "ANNULÉE", bg: "bg-rose-100", text: "text-rose-900", icon: XCircle },
      RETURNED: { label: "RETOURNÉE", bg: "bg-gray-100", text: "text-gray-900", icon: RotateCcw },
    };

    const s = config[status] || config.NEW;
    const Icon = s.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] text-[10px] font-extrabold uppercase tracking-wider ${s.bg} ${s.text}`}
      >
        <Icon className="h-3 w-3" />
        <span>{s.label}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-altaj-dark text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 border border-altaj-gold animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-altaj-gold flex-shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#EBE6DE] shadow-sm">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            Gestion des Commandes COD
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            Commandes ({filteredOrders.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Validation téléphonique, édition des coordonnées, statuts d'expédition et synchronisation WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/admin"
            className="px-3.5 py-2 text-xs font-bold text-slate-700 border border-[#E0D9CE] rounded-2xl bg-white hover:bg-slate-50 transition-colors shadow-sm"
          >
            ← Dashboard
          </Link>

          {/* PURGE ORDER HISTORY BUTTON */}
          <button
            onClick={() => setIsPurgeModalOpen(true)}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
            title="Purger ou nettoyer l'ancien historique des commandes"
          >
            <History className="h-4 w-4 text-rose-600" />
            <span>Purger l'Historique</span>
          </button>

          <button
            onClick={() => {
              if (products.length > 0 && !newProductId) {
                setNewProductId(products[0].id);
              }
              setIsNewOrderModalOpen(true);
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus className="h-4 w-4 text-amber-400" />
            <span>Nouvelle Commande</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-3xl border border-[#EBE6DE] shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par n° commande, nom ou n° téléphone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F4F2EE] border border-transparent focus:border-amber-400 focus:bg-white pl-10 pr-4 py-2 text-xs rounded-2xl focus:outline-none transition-all text-slate-800"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-[#F4F2EE] border border-transparent focus:border-amber-400 px-3.5 py-2 text-xs font-semibold rounded-2xl focus:outline-none w-full md:w-auto text-slate-700"
        >
          <option value="ALL">Tous les statuts</option>
          <option value="NEW">Nouvelles</option>
          <option value="PENDING_CONFIRMATION">À confirmer</option>
          <option value="CONFIRMED">Confirmées</option>
          <option value="PREPARING">En préparation</option>
          <option value="SHIPPED">Expédiées</option>
          <option value="DELIVERED">Livrées (Encaissé)</option>
          <option value="CANCELLED">Annulées</option>
          <option value="RETURNED">Retournées</option>
        </select>

        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="bg-[#F4F2EE] border border-transparent focus:border-amber-400 px-3.5 py-2 text-xs font-semibold rounded-2xl focus:outline-none w-full md:w-auto text-slate-700"
        >
          <option value="ALL">Toutes les villes</option>
          {MOROCCAN_CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Bulk Action Bar when items selected */}
      {selectedOrderIds.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-950">
              {selectedOrderIds.length} commande(s) sélectionnée(s) sur {filteredOrders.length}
            </span>
            <button
              type="button"
              onClick={() => setSelectedOrderIds([])}
              className="text-xs text-amber-800 underline hover:text-amber-950 font-semibold cursor-pointer ml-1"
            >
              Tout désélectionner
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDeleteSelected}
              disabled={isDeletingBulk}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Supprimer la sélection ({selectedOrderIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-[#EBE6DE] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-altaj-border text-[10px] uppercase font-bold text-altaj-dark">
              <tr>
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    aria-label="Sélectionner toutes les commandes"
                    checked={
                      filteredOrders.length > 0 &&
                      filteredOrders.every((o) => selectedOrderIds.includes(o.id))
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-amber-700 focus:ring-amber-700 cursor-pointer accent-amber-700"
                    title="Tout sélectionner / désélectionner"
                  />
                </th>
                <th className="p-3.5">N° / Date</th>
                <th className="p-3.5">Client</th>
                <th className="p-3.5">Ville & Adresse</th>
                <th className="p-3.5">Articles</th>
                <th className="p-3.5">Total COD</th>
                <th className="p-3.5">Statut</th>
                <th className="p-3.5 text-center">Contact</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-altaj-border/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-altaj-muted">
                    Aucune commande ne correspond à vos critères.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const rawPhone = (order.customerPhone || (order as any).phone || "").toString();
                  const cleanPhone = rawPhone.replace(/\D/g, "").replace(/^212/, "").replace(/^0/, "");
                  const whatsappUrl = cleanPhone
                    ? `https://wa.me/212${cleanPhone}?text=Bonjour%20${encodeURIComponent(order.customerName || "Client")},%20je%20suis%20le%20responsable%20ALTAJLEATHER%20au%20sujet%20de%20votre%20commande%20${order.orderNumber}`
                    : "#";
                  const isSelected = selectedOrderIds.includes(order.id);

                  return (
                    <tr
                      key={order.id}
                      className={`transition-colors ${
                        isSelected ? "bg-amber-50/70 hover:bg-amber-50" : "hover:bg-slate-50/80"
                      }`}
                    >
                      <td className="p-3.5 w-10 text-center">
                        <input
                          type="checkbox"
                          aria-label={`Sélectionner commande ${order.orderNumber}`}
                          checked={isSelected}
                          onChange={() => handleToggleSelect(order.id)}
                          className="w-4 h-4 rounded border-gray-300 text-amber-700 focus:ring-amber-700 cursor-pointer accent-amber-700"
                        />
                      </td>
                      <td className="p-3.5">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-serif font-bold text-altaj-dark hover:text-altaj-brown underline"
                        >
                          {order.orderNumber}
                        </Link>
                        <div className="text-[10px] text-altaj-muted mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-altaj-dark">{order.customerName}</div>
                        <div className="text-[11px] text-altaj-muted">{order.customerPhone}</div>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-altaj-dark">{order.customerCity}</span>
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 shadow-xs"
                            title="Coût réel payé au livreur/transporteur. Déduit automatiquement du Bénéfice Net une fois livré."
                          >
                            <Truck className="h-3 w-3 text-amber-700" />
                            {order.courierCost !== undefined && order.courierCost !== null
                              ? order.courierCost
                              : getEstimatedCourierCostForCity(order.customerCity)} DH
                          </span>
                        </div>
                        <div className="text-[11px] text-altaj-muted truncate max-w-xs mt-0.5">
                          {order.customerAddress}
                        </div>
                      </td>

                      <td className="p-3.5">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="truncate max-w-[200px]">
                            {item.quantity}x {item.productName}
                          </div>
                        ))}
                      </td>

                      <td className="p-3.5 font-serif font-bold text-altaj-brown text-sm">
                        {formatMAD(order.total)}
                      </td>

                      <td className="p-3.5">{getStatusBadge(order.status)}</td>

                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <a
                            href={`tel:${order.customerPhone}`}
                            title="Appeler"
                            className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md"
                          >
                            <PhoneCall className="h-3.5 w-3.5" />
                          </a>
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="WhatsApp"
                            className="p-1.5 bg-[#25D366]/15 text-[#1EBE5D] hover:bg-[#25D366]/30 rounded-md"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Fiche details */}
                          <Link href={`/admin/orders/${order.id}`}>
                            <button
                              title="Voir les détails"
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                          </Link>

                          {/* Edit button */}
                          <button
                            title="Modifier la commande"
                            onClick={() => setEditingOrder({ ...order })}
                            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-md"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>

                          {/* Delete button */}
                          <button
                            title="Supprimer la commande"
                            onClick={() => setDeletingOrder(order)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>

                          {/* Quick status progress actions */}
                          {order.status === "NEW" && (
                            <Button
                              size="sm"
                              variant="gold"
                              className="text-[10px] px-2 py-1"
                              onClick={() => handleStatusChange(order.id, "CONFIRMED")}
                            >
                              Confirmer
                            </Button>
                          )}
                          {order.status === "CONFIRMED" && (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="text-[10px] px-2 py-1"
                              onClick={() => handleStatusChange(order.id, "SHIPPED")}
                            >
                              Expédier
                            </Button>
                          )}
                          {order.status === "SHIPPED" && (
                            <Button
                              size="sm"
                              variant="primary"
                              className="text-[10px] px-2 py-1 bg-emerald-800 text-white hover:bg-emerald-900"
                              onClick={() => handleStatusChange(order.id, "DELIVERED")}
                            >
                              Livré
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: EDIT ORDER */}
      {/* ========================================================================= */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-altaj-gold">
                  Modification Commande
                </span>
                <h3 className="font-serif text-lg font-bold text-altaj-dark">
                  Modifier {editingOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setEditingOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-altaj-dark">Nom du Client</label>
                  <input
                    type="text"
                    required
                    value={editingOrder.customerName}
                    onChange={(e) =>
                      setEditingOrder({ ...editingOrder, customerName: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-altaj-dark">Téléphone</label>
                  <input
                    type="text"
                    required
                    value={editingOrder.customerPhone}
                    onChange={(e) =>
                      setEditingOrder({ ...editingOrder, customerPhone: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-altaj-dark">Ville de Livraison</label>
                  <select
                    value={editingOrder.customerCity}
                    onChange={(e) =>
                      setEditingOrder({ ...editingOrder, customerCity: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg font-medium bg-white"
                  >
                    {MOROCCAN_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-altaj-dark">Statut de la Commande</label>
                  <select
                    value={editingOrder.status}
                    onChange={(e) =>
                      setEditingOrder({
                        ...editingOrder,
                        status: e.target.value as OrderStatus,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg font-bold bg-white"
                  >
                    <option value="NEW">Nouvelle (NEW)</option>
                    <option value="PENDING_CONFIRMATION">À confirmer</option>
                    <option value="CONFIRMED">Confirmée</option>
                    <option value="PREPARING">En préparation</option>
                    <option value="SHIPPED">Expédiée (En transit)</option>
                    <option value="DELIVERED">Livrée & Encaissée</option>
                    <option value="CANCELLED">Annulée</option>
                    <option value="RETURNED">Retournée (Refus)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-altaj-dark">Adresse Complète</label>
                <textarea
                  rows={2}
                  value={editingOrder.customerAddress}
                  onChange={(e) =>
                    setEditingOrder({ ...editingOrder, customerAddress: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg font-medium"
                  placeholder="Quartier, N° rue, Résidence..."
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-xs text-altaj-dark block">Sous-total (DH)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingOrder.subtotal}
                    onChange={(e) => {
                      const sub = Number(e.target.value);
                      setEditingOrder({
                        ...editingOrder,
                        subtotal: sub,
                        total: sub + (editingOrder.shippingFee || 0) - (editingOrder.discount || 0),
                      });
                    }}
                    className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-xs text-altaj-dark block" title="Frais facturés au client (0 DH si livraison offerte)">
                    Livraison Client (DH)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingOrder.shippingFee}
                    onChange={(e) => {
                      const fee = Number(e.target.value);
                      setEditingOrder({
                        ...editingOrder,
                        shippingFee: fee,
                        total: (editingOrder.subtotal || 0) + fee - (editingOrder.discount || 0),
                      });
                    }}
                    className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-xs text-amber-900 block flex items-center gap-1" title="Frais payés à la société de livraison pour cette ville. Déduit du Bénéfice Net">
                    <Truck className="h-3 w-3 text-amber-700" />
                    Coût Livreur (DH)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={
                      editingOrder.courierCost !== undefined && editingOrder.courierCost !== null
                        ? editingOrder.courierCost
                        : getEstimatedCourierCostForCity(editingOrder.customerCity)
                    }
                    onChange={(e) => {
                      const courierFee = Number(e.target.value) || 0;
                      setEditingOrder({
                        ...editingOrder,
                        courierCost: courierFee,
                      });
                    }}
                    className="w-full px-3 py-2 border border-amber-300 bg-amber-50/50 rounded-lg font-mono font-bold text-amber-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-xs text-altaj-dark block">Total COD Client (DH)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingOrder.total}
                    onChange={(e) =>
                      setEditingOrder({ ...editingOrder, total: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border rounded-lg font-mono font-black text-altaj-brown"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-altaj-dark">Notes du Client / Instructions</label>
                <input
                  type="text"
                  value={editingOrder.notes || ""}
                  onChange={(e) =>
                    setEditingOrder({ ...editingOrder, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Ex: Appeler avant 14h, livraison bureau..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 border rounded-lg text-slate-700 font-bold hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-altaj-brown hover:bg-altaj-dark text-white rounded-lg font-bold shadow-md"
                >
                  Enregistrer les Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIRM DELETE ORDER */}
      {/* ========================================================================= */}
      {deletingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-rose-200 shadow-2xl p-6 space-y-4 animate-fade-in">
            <div className="flex items-center gap-3 text-rose-600">
              <span className="p-3 bg-rose-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-rose-600" />
              </span>
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900">
                  Supprimer la Commande ?
                </h3>
                <p className="text-xs text-rose-600 font-semibold">
                  Cette action est irréversible.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl text-xs space-y-1.5 border border-slate-200">
              <p>
                <strong>N° de Commande :</strong> {deletingOrder.orderNumber}
              </p>
              <p>
                <strong>Client :</strong> {deletingOrder.customerName} ({deletingOrder.customerPhone})
              </p>
              <p>
                <strong>Montant :</strong> {formatMAD(deletingOrder.total)} ({deletingOrder.customerCity})
              </p>
            </div>

            <p className="text-xs text-slate-600">
              La commande sera retirée des données et ne sera plus comptabilisée dans les statistiques et le bénéfice net.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingOrder(null)}
                className="px-4 py-2 border rounded-lg text-slate-700 font-bold hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold shadow-md"
              >
                Oui, Supprimer Définitivement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PURGE ORDER HISTORY (NETTOYAGE DE L'HISTORIQUE)                     */}
      {/* ========================================================================= */}
      {isPurgeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-rose-200 shadow-2xl p-6 sm:p-7 space-y-5 animate-fade-in my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200">
                  <History className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900">
                    Purger l'Historique des Commandes
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Nettoyer les anciennes commandes ou les données de démonstration ({orders.length} commandes au total)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPurgeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 font-medium">
                Choisissez la période à conserver dans votre base de données :
              </p>

              <div className="space-y-2">
                {/* Option: 7 Days */}
                <label
                  onClick={() => setPurgeOption("7days")}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    purgeOption === "7days"
                      ? "border-amber-400 bg-amber-50/60 ring-1 ring-amber-300"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="purgeOption"
                      value="7days"
                      checked={purgeOption === "7days"}
                      onChange={() => setPurgeOption("7days")}
                      className="text-amber-600 focus:ring-amber-500 accent-amber-600"
                    />
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>Garder uniquement les 7 derniers jours</span>
                        <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-2 py-0.5 rounded-full">
                          Recommandé
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Supprime automatiquement toutes les commandes antérieures à 7 jours.
                      </p>
                    </div>
                  </div>
                  <Calendar className="h-4 w-4 text-amber-600 flex-shrink-0" />
                </label>

                {/* Option: 14 Days */}
                <label
                  onClick={() => setPurgeOption("14days")}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    purgeOption === "14days"
                      ? "border-amber-400 bg-amber-50/60 ring-1 ring-amber-300"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="purgeOption"
                      value="14days"
                      checked={purgeOption === "14days"}
                      onChange={() => setPurgeOption("14days")}
                      className="text-amber-600 focus:ring-amber-500 accent-amber-600"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">
                        Garder uniquement les 14 derniers jours
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Supprime toutes les commandes de plus de 2 semaines.
                      </p>
                    </div>
                  </div>
                  <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0" />
                </label>

                {/* Option: 30 Days */}
                <label
                  onClick={() => setPurgeOption("30days")}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    purgeOption === "30days"
                      ? "border-amber-400 bg-amber-50/60 ring-1 ring-amber-300"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="purgeOption"
                      value="30days"
                      checked={purgeOption === "30days"}
                      onChange={() => setPurgeOption("30days")}
                      className="text-amber-600 focus:ring-amber-500 accent-amber-600"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">
                        Garder uniquement les 30 derniers jours (1 mois)
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Supprime les commandes de plus d'un mois.
                      </p>
                    </div>
                  </div>
                  <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0" />
                </label>

                {/* Option: Purge Samples */}
                <label
                  onClick={() => setPurgeOption("samples")}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    purgeOption === "samples"
                      ? "border-amber-400 bg-amber-50/60 ring-1 ring-amber-300"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="purgeOption"
                      value="samples"
                      checked={purgeOption === "samples"}
                      onChange={() => setPurgeOption("samples")}
                      className="text-amber-600 focus:ring-amber-500 accent-amber-600"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">
                        Supprimer les commandes d'exemple / échantillons (Mock data)
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Conserve uniquement les commandes réelles reçues récemment.
                      </p>
                    </div>
                  </div>
                  <Sparkles className="h-4 w-4 text-amber-600 flex-shrink-0" />
                </label>

                {/* Option: Clear ALL */}
                <label
                  onClick={() => setPurgeOption("all")}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    purgeOption === "all"
                      ? "border-rose-400 bg-rose-50/60 ring-1 ring-rose-300"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="purgeOption"
                      value="all"
                      checked={purgeOption === "all"}
                      onChange={() => setPurgeOption("all")}
                      className="text-rose-600 focus:ring-rose-500 accent-rose-600"
                    />
                    <div>
                      <span className="font-bold text-rose-800 block">
                        Tout supprimer (Remise à zéro complète)
                      </span>
                      <p className="text-[11px] text-rose-600 mt-0.5">
                        Efface la totalité de l'historique des commandes (0 commandes).
                      </p>
                    </div>
                  </div>
                  <Trash2 className="h-4 w-4 text-rose-600 flex-shrink-0" />
                </label>
              </div>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200/80 rounded-2xl text-[11px] text-rose-800 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>
                Attention : Cette action est irréversible. Les commandes purgées seront supprimées définitivement du serveur et ne réapparaîtront plus.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsPurgeModalOpen(false)}
                className="px-4 py-2.5 border border-slate-200 rounded-2xl text-slate-700 font-bold hover:bg-slate-50 transition-colors text-xs"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isPurging}
                onClick={handleConfirmPurge}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold shadow-md transition-all text-xs flex items-center gap-2 disabled:opacity-50"
              >
                {isPurging ? (
                  <span>Nettoyage en cours...</span>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Confirmer le Nettoyage</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CREATE NEW ORDER (NOUVELLE COMMANDE COD)                         */}
      {/* ========================================================================= */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-fade-in my-8 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2.5 rounded-xl bg-altaj-brown text-white shadow-sm">
                  <ShoppingBag className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-serif text-lg font-bold text-altaj-dark">
                    Créer une Nouvelle Commande COD
                  </h3>
                  <p className="text-[11px] text-altaj-muted">
                    Saisie manuelle pour vente WhatsApp, téléphone ou atelier
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewOrderModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateNewOrder} className="space-y-4 text-xs">
              {/* Customer Information */}
              <div className="space-y-3 p-3.5 bg-[#FAF8F5] rounded-xl border border-altaj-border">
                <span className="text-[10px] font-bold uppercase tracking-wider text-altaj-brown block">
                  Informations Client (Maroc)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-altaj-dark block">Nom Complet</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Mehdi Tazi"
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-altaj-dark block">N° Téléphone</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 0661234567"
                      value={newCustomerPhone}
                      onChange={(e) => setNewCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-altaj-dark block">Ville de Livraison</label>
                    <select
                      value={newCustomerCity}
                      onChange={(e) => {
                        const city = e.target.value;
                        setNewCustomerCity(city);
                        setNewCourierCost(getEstimatedCourierCostForCity(city));
                      }}
                      className="w-full px-3 py-2 border rounded-lg bg-white font-medium"
                    >
                      {MOROCCAN_CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-altaj-dark block">Canal d'Origine</label>
                    <select
                      value={newOrderSource}
                      onChange={(e) => setNewOrderSource(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg bg-white font-medium"
                    >
                      <option value="WhatsApp Direct">WhatsApp Direct</option>
                      <option value="Meta Ads (Instagram)">Meta Ads (Instagram)</option>
                      <option value="Meta Ads (Facebook)">Meta Ads (Facebook)</option>
                      <option value="TikTok Ads (Spark)">TikTok Ads (Spark)</option>
                      <option value="Appel Direct">Appel Téléphonique Direct</option>
                      <option value="Boutique / Atelier Fès">Boutique / Atelier Fès</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-altaj-dark block">Adresse Complète</label>
                  <input
                    type="text"
                    required
                    placeholder="Quartier, N° rue, Résidence, Appartement..."
                    value={newCustomerAddress}
                    onChange={(e) => setNewCustomerAddress(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Product Selection */}
              <div className="space-y-3 p-3.5 bg-[#FAF8F5] rounded-xl border border-altaj-border">
                <span className="text-[10px] font-bold uppercase tracking-wider text-altaj-brown block">
                  Sélection du Portefeuille
                </span>

                <div className="space-y-1">
                  <label className="font-bold text-altaj-dark block">Modèle en Cuir</label>
                  <select
                    value={newProductId}
                    onChange={(e) => setNewProductId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white font-medium"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {formatMAD(p.price)} (Stock: {p.stock} unités)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-xs text-altaj-dark block">Quantité</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={newQuantity}
                      onChange={(e) => setNewQuantity(Math.max(1, Number(e.target.value) || 1))}
                      className="w-full px-3 py-2 border rounded-lg bg-white font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-xs text-altaj-dark block" title="Frais facturés au client (0 DH si livraison offerte)">
                      Livraison Client (DH)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newShippingFee}
                      onChange={(e) => setNewShippingFee(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 border rounded-lg bg-white font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-xs text-altaj-dark block">Remise (DH)</label>
                    <input
                      type="number"
                      min="0"
                      value={newDiscount}
                      onChange={(e) => setNewDiscount(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 border rounded-lg bg-white font-mono text-emerald-700 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-xs text-amber-900 block flex items-center gap-1" title="Coût réel payé au livreur/transporteur. Déduit du Bénéfice Net">
                      <Truck className="h-3 w-3 text-amber-700" />
                      Livreur Réel (DH)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newCourierCost}
                      onChange={(e) => setNewCourierCost(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-amber-300 bg-amber-50/50 rounded-lg font-mono font-bold text-amber-900"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-amber-800 bg-amber-50/70 border border-amber-200/70 rounded-lg p-2 flex items-center justify-between">
                  <span>
                    🚚 Tarif transporteur auto pour <strong>{newCustomerCity}</strong> : <strong>{getEstimatedCourierCostForCity(newCustomerCity)} DH</strong>
                  </span>
                  <span className="text-[10px] text-amber-900 font-medium">
                    (Ajustez manuellement si accord spécial)
                  </span>
                </div>

                {/* Total Calculation Display */}
                {(() => {
                  const sel = products.find((p) => p.id === newProductId) || products[0];
                  const subtotal = sel ? sel.price * newQuantity : 0;
                  const total = Math.max(0, subtotal - newDiscount + newShippingFee);

                  return (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-emerald-800 font-bold uppercase block">
                          Total COD à Encaisser par le Livreur :
                        </span>
                        <span className="text-xs text-emerald-900">
                          Sous-total: {formatMAD(subtotal)} | Livraison: {formatMAD(newShippingFee)} | Remise: -{formatMAD(newDiscount)}
                        </span>
                      </div>
                      <div className="font-serif text-lg font-black text-emerald-950">
                        {formatMAD(total)}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Status & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-altaj-dark block">Statut Initial</label>
                  <select
                    value={newOrderStatus}
                    onChange={(e) => setNewOrderStatus(e.target.value as OrderStatus)}
                    className="w-full px-3 py-2 border rounded-lg bg-white font-bold"
                  >
                    <option value="NEW">NOUVELLE</option>
                    <option value="PENDING_CONFIRMATION">À CONFIRMER (Appel)</option>
                    <option value="CONFIRMED">CONFIRMÉE (Prête)</option>
                    <option value="PREPARING">EN PRÉPARATION</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-altaj-dark block">Notes / Instructions</label>
                  <input
                    type="text"
                    placeholder="Ex: Confirmer après 18h, cadeau anniversaire..."
                    value={newOrderNotes}
                    onChange={(e) => setNewOrderNotes(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-slate-700 font-bold hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-altaj-brown to-altaj-dark hover:opacity-95 text-white rounded-lg font-bold shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4 text-altaj-gold" />
                  <span>Enregistrer la Commande</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
