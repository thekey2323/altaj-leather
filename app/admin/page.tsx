"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  CheckCircle2,
  Truck,
  XCircle,
  Clock,
  PhoneCall,
  MessageCircle,
  Package,
  Settings,
  Search,
  ExternalLink,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Edit2,
  Trash2,
  X,
  Save
} from "lucide-react";
import { getOrders, updateOrderStatus, deleteOrder, deleteOrders, purgeOrders, updateOrder } from "@/lib/db/store";
import { Order, OrderStatus } from "@/types";

export default function SimpleCodDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        setOrders(getOrders());
      }
    } catch {
      setOrders(getOrders());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const handleDeleteOrder = async (orderId: string, orderNum: string) => {
    if (!confirm(`Supprimer définitivement la commande #${orderNum} ?`)) {
      return;
    }
    deleteOrder(orderId);
    setOrders((prev) => prev.filter((o) => o.id !== orderId && o.orderNumber !== orderId));
    setSelectedOrderIds((prev) => prev.filter((id) => id !== orderId));
    setNotification(`Commande #${orderNum} supprimée.`);
    setTimeout(() => setNotification(null), 3000);

    try {
      await fetch(`/api/orders?id=${encodeURIComponent(orderId)}`, {
        method: "DELETE",
      });
    } catch {}
  };

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
    if (!confirm(`Êtes-vous sûr de vouloir supprimer définitivement ces ${count} commande(s) ?`)) {
      return;
    }

    setIsDeletingBulk(true);
    const idsToDelete = [...selectedOrderIds];

    // Optimistically update UI
    setOrders((prev) =>
      prev.filter((o) => !idsToDelete.includes(o.id) && !idsToDelete.includes(o.orderNumber))
    );
    setSelectedOrderIds([]);

    // Delete locally
    deleteOrders(idsToDelete);

    // Delete from Supabase & API
    try {
      await fetch(`/api/orders?ids=${encodeURIComponent(idsToDelete.join(","))}`, {
        method: "DELETE",
      });
    } catch (e) {
      console.warn("Bulk delete API warning:", e);
    } finally {
      setIsDeletingBulk(false);
    }

    setNotification(`${count} commande(s) supprimée(s) avec succès.`);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleDeleteAllOrders = async () => {
    if (orders.length === 0) return;
    if (
      !confirm(
        `ATTENTION : Voulez-vous vraiment supprimer TOUTES les commandes (${orders.length}) ? Cette action est irréversible.`
      )
    ) {
      return;
    }

    setIsDeletingBulk(true);
    const totalCount = orders.length;

    // Clear state
    setOrders([]);
    setSelectedOrderIds([]);

    // Local purge
    purgeOrders({ all: true });

    // Supabase & API purge
    try {
      await fetch("/api/orders?all=true", {
        method: "DELETE",
      });
    } catch (e) {
      console.warn("Delete all orders API warning:", e);
    } finally {
      setIsDeletingBulk(false);
    }

    setNotification(`Toutes les commandes (${totalCount}) ont été supprimées.`);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSaveOrderEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    updateOrder(editingOrder);
    setOrders((prev) =>
      prev.map((o) => (o.id === editingOrder.id ? editingOrder : o))
    );
    setNotification(`Commande #${editingOrder.orderNumber} mise à jour avec succès !`);
    setTimeout(() => setNotification(null), 3000);
    const toSave = editingOrder;
    setEditingOrder(null);

    try {
      await fetch(`/api/orders/${toSave.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toSave),
      });
    } catch {}
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    setNotification(`Statut de la commande mis à jour : ${newStatus}`);
    setTimeout(() => setNotification(null), 3000);

    try {
      await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {}
  };

  // Metrics
  const totalOrders = orders.length;
  const newOrders = orders.filter((o) => o.status === "NEW").length;
  const inDeliveryOrders = orders.filter((o) => o.status === "SHIPPED").length;
  const deliveredOrders = orders.filter((o) => o.status === "DELIVERED");
  const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesStatus;

    const orderNum = (o.orderNumber || (o as any).id || "").toString().toLowerCase();
    const custName = (o.customerName || (o as any).name || "").toString().toLowerCase();
    const phone = (o.customerPhone || (o as any).phone || "").toString();
    const city = (o.customerCity || (o as any).city || "").toString().toLowerCase();

    const matchesSearch =
      orderNum.includes(q) ||
      custName.includes(q) ||
      phone.includes(q) ||
      city.includes(q);
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "NEW":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1 w-fit"><Clock className="w-3 h-3" /> Nouveau</span>;
      case "CONFIRMED":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3" /> Confirmé</span>;
      case "SHIPPED":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1 w-fit"><Truck className="w-3 h-3" /> En livraison</span>;
      case "DELIVERED":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3" /> Livré & Encaissé</span>;
      case "CANCELLED":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1 w-fit"><XCircle className="w-3 h-3" /> Annulé</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs bg-slate-100">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 bg-[#1A1614] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold border border-[#8C5E35]/40 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#28A745]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8DFD3]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C5E35] bg-[#F7F0E6] px-2.5 py-0.5 rounded-full border border-[#E8DAC8]">
              Tableau de Bord Simplifié
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#1E1916] font-serif mt-1">
            Gestion des Commandes COD (Paiement à la Livraison)
          </h1>
          <p className="text-xs text-[#7A6E63] mt-0.5">
            Suivi rapide des commandes de votre boutique ALTAJ LEATHER partout au Maroc.
          </p>
        </div>

        {/* Quick action shortcuts */}
        <div className="flex items-center gap-2 flex-wrap">
          {orders.length > 0 && (
            <button
              type="button"
              onClick={handleDeleteAllOrders}
              disabled={isDeletingBulk}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              title="Supprimer toutes les commandes"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tout Supprimer ({orders.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={fetchOrders}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white border border-[#DECDBB] text-slate-700 hover:bg-[#FAF4EC] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            title="Actualiser"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>

          <Link
            href="/admin/products"
            className="px-3.5 py-2 rounded-xl bg-[#8C5E35] text-white hover:bg-[#724823] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Produits & Photos</span>
          </Link>
        </div>
      </div>

      {/* 4 Simple COD Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E8DFD3] shadow-xs">
          <div className="flex items-center justify-between text-[#7A6E63] mb-1">
            <span className="text-xs font-bold">Total Commandes</span>
            <ShoppingCart className="w-4 h-4 text-[#8C5E35]" />
          </div>
          <div className="text-2xl font-black text-[#1E1916]">{totalOrders}</div>
          <p className="text-[10.5px] text-[#8C5E35] mt-1 font-medium">Toutes les commandes COD</p>
        </div>

        <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-800 mb-1">
            <span className="text-xs font-bold">À Confirmer</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900">{newOrders}</div>
          <p className="text-[10.5px] text-amber-700 mt-1 font-medium">Nouvelles commandes en attente</p>
        </div>

        <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-200 shadow-xs">
          <div className="flex items-center justify-between text-purple-800 mb-1">
            <span className="text-xs font-bold">En Livraison</span>
            <Truck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-900">{inDeliveryOrders}</div>
          <p className="text-[10.5px] text-purple-700 mt-1 font-medium">Colis en cours d'acheminement</p>
        </div>

        <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-800 mb-1">
            <span className="text-xs font-bold">Total Encaissé</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-900">{totalRevenue} <span className="text-xs font-bold">DH</span></div>
          <p className="text-[10.5px] text-emerald-700 mt-1 font-medium">{deliveredOrders.length} colis livrés & payés</p>
        </div>
      </div>

      {/* Orders Filter & Search */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E8DFD3] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5 justify-between">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Rechercher par nom, téléphone, ville ou N° commande..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#E0D7CB] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1E1916] focus:bg-white focus:outline-hidden"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* Status selector tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: "ALL", label: "Tous" },
              { id: "NEW", label: "Nouveau" },
              { id: "CONFIRMED", label: "Confirmé" },
              { id: "SHIPPED", label: "En livraison" },
              { id: "DELIVERED", label: "Livré" },
              { id: "CANCELLED", label: "Annulé" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-[#1E1916] text-white shadow-xs"
                    : "bg-[#FAF7F2] text-slate-600 hover:bg-[#EFE8DD]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>

        {/* Bulk Action Bar when items selected */}
        {selectedOrderIds.length > 0 && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
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
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Supprimer la sélection ({selectedOrderIds.length})</span>
              </button>
            </div>
          </div>
        )}

        {/* Orders Table */}
        <div className="overflow-x-auto -mx-3.5 sm:mx-0">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF7F2] text-slate-600 border-b border-[#EAE3D9] uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    aria-label="Sélectionner toutes les commandes"
                    checked={
                      filteredOrders.length > 0 &&
                      filteredOrders.every((o) => selectedOrderIds.includes(o.id))
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-[#8C5E35] focus:ring-[#8C5E35] cursor-pointer accent-[#8C5E35]"
                    title="Tout sélectionner / désélectionner"
                  />
                </th>
                <th className="p-3">Commande</th>
                <th className="p-3">Client & Téléphone</th>
                <th className="p-3">Ville & Adresse</th>
                <th className="p-3">Produit(s)</th>
                <th className="p-3">Total COD</th>
                <th className="p-3">Statut</th>
                <th className="p-3 text-right">Action WhatsApp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE3]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Aucune commande trouvée.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const rawPhone = (order.customerPhone || (order as any).phone || "").toString();
                  const cleanPhone = rawPhone.replace(/\D/g, "").replace(/^212/, "").replace(/^0/, "");
                  const waNumber = cleanPhone ? `212${cleanPhone}` : "";
                  const custName = order.customerName || (order as any).name || "Client";
                  const custCity = order.customerCity || (order as any).city || "Maroc";
                  const custAddress = order.customerAddress || (order as any).address || "";
                  const orderNum = order.orderNumber || (order as any).id || "ALT";
                  const totalAmount = order.total || (order as any).price || 0;
                  const waMessage = `Bonjour ${custName}, nous confirmons votre commande ALTAJ LEATHER N° ${orderNum} d'un montant de ${totalAmount} DH à livrer à ${custCity}. Est-ce que votre adresse est bien confirmée ? Merci !`;
                  const waLink = waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}` : null;
                  const isSelected = selectedOrderIds.includes(order.id);

                  return (
                    <tr
                      key={order.id || Math.random()}
                      className={`transition-colors ${
                        isSelected ? "bg-amber-50/70 hover:bg-amber-50" : "hover:bg-[#FCFAF7]"
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3 w-10 text-center">
                        <input
                          type="checkbox"
                          aria-label={`Sélectionner commande ${orderNum}`}
                          checked={isSelected}
                          onChange={() => handleToggleSelect(order.id)}
                          className="w-4 h-4 rounded border-gray-300 text-[#8C5E35] focus:ring-[#8C5E35] cursor-pointer accent-[#8C5E35]"
                        />
                      </td>

                      {/* Order No & Date */}
                      <td className="p-3 font-mono font-bold text-slate-800">
                        <div>#{orderNum}</div>
                        <div className="text-[10px] text-slate-400 font-sans font-normal">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          }) : "-"}
                        </div>
                      </td>

                      {/* Customer Name & Phone */}
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{custName}</div>
                        <div className="text-[11px] font-mono text-[#8C5E35]">{rawPhone || "—"}</div>
                      </td>

                      {/* City & Address */}
                      <td className="p-3 max-w-[200px]">
                        <div className="font-bold text-slate-800">{custCity}</div>
                        <div className="text-[10.5px] text-slate-500 truncate" title={custAddress}>
                          {custAddress || "—"}
                        </div>
                      </td>

                      {/* Items */}
                      <td className="p-3 max-w-[180px]">
                        <div className="font-medium text-slate-800 truncate" title={order.itemsSummary || order.items?.map((i) => i.productName).join(", ")}>
                          {order.itemsSummary || order.items?.map((i) => i.productName).join(", ") || "Article maroquinerie"}
                        </div>
                      </td>

                      {/* Total COD */}
                      <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                        <span className="text-sm text-[#8C5E35] font-black">{totalAmount}</span> DH
                      </td>

                      {/* Status Dropdown */}
                      <td className="p-3">
                        <select
                          value={order.status || "NEW"}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          className="bg-[#FAF7F2] border border-[#E0D7CB] rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:outline-hidden"
                        >
                          <option value="NEW">🟡 Nouveau</option>
                          <option value="CONFIRMED">🔵 Confirmé</option>
                          <option value="SHIPPED">🟣 En livraison</option>
                          <option value="DELIVERED">🟢 Livré</option>
                          <option value="CANCELLED">🔴 Annulé</option>
                        </select>
                      </td>

                      {/* Actions: WhatsApp + Edit + Delete */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {waLink && (
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-[11px] shadow-2xs transition-all active:scale-95"
                              title="Confirmer sur WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">WhatsApp</span>
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => setEditingOrder({ ...order })}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-amber-800 hover:bg-amber-50 border border-slate-200 transition-colors"
                            title="Modifier la commande"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(order.id, orderNum)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-white hover:bg-rose-600 border border-rose-200 transition-colors"
                            title="Supprimer la commande"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Simple COD Settings Link Note */}
      <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-[#8C5E35]" />
          <span className="text-slate-700 font-medium">
            Pour modifier votre numéro WhatsApp officiel ou les règles de livraison gratuite :
          </span>
        </div>
        <Link
          href="/admin/settings"
          className="text-[#8C5E35] hover:underline font-bold flex items-center gap-1 shrink-0"
        >
          <span>Ouvrir les Paramètres COD</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Edit Order Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 bg-[#161210]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 border border-[#DECDBB] shadow-2xl relative my-8 animate-fade-in text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0EBE3] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C5E35]">
                  Gestion Commande COD
                </span>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#1E1916]">
                  Modifier la Commande #{editingOrder.orderNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOrderEdit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nom du client
                  </label>
                  <input
                    type="text"
                    value={editingOrder.customerName || ""}
                    onChange={(e) => setEditingOrder({ ...editingOrder, customerName: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#D5C6B5] rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#8C5E35]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Numéro de Téléphone
                  </label>
                  <input
                    type="text"
                    value={editingOrder.customerPhone || ""}
                    onChange={(e) => setEditingOrder({ ...editingOrder, customerPhone: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#D5C6B5] rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:border-[#8C5E35]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Ville de Livraison
                  </label>
                  <input
                    type="text"
                    value={editingOrder.customerCity || ""}
                    onChange={(e) => setEditingOrder({ ...editingOrder, customerCity: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#D5C6B5] rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#8C5E35]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Montant Total COD (DH)
                  </label>
                  <input
                    type="number"
                    value={editingOrder.total || 0}
                    onChange={(e) => setEditingOrder({ ...editingOrder, total: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#FAF8F5] border border-[#D5C6B5] rounded-xl px-3 py-2 text-xs font-bold text-[#8C5E35] focus:outline-none focus:border-[#8C5E35]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Adresse complète de livraison
                </label>
                <textarea
                  rows={2}
                  value={editingOrder.customerAddress || ""}
                  onChange={(e) => setEditingOrder({ ...editingOrder, customerAddress: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#D5C6B5] rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#8C5E35]"
                  placeholder="Quartier, Rue, N° d'appartement..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Statut de la commande
                  </label>
                  <select
                    value={editingOrder.status}
                    onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value as OrderStatus })}
                    className="w-full bg-[#FAF8F5] border border-[#D5C6B5] rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="NEW">🟡 Nouveau</option>
                    <option value="CONFIRMED">🔵 Confirmé</option>
                    <option value="SHIPPED">🟣 En livraison</option>
                    <option value="DELIVERED">🟢 Livré & Encaissé</option>
                    <option value="CANCELLED">🔴 Annulé</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Articles / Résumé
                  </label>
                  <input
                    type="text"
                    value={editingOrder.itemsSummary || (editingOrder as any).items?.[0]?.productName || ""}
                    onChange={(e) => setEditingOrder({ ...editingOrder, itemsSummary: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#D5C6B5] rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#8C5E35]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Notes internes & instructions de livraison
                </label>
                <input
                  type="text"
                  value={editingOrder.notes || ""}
                  onChange={(e) => setEditingOrder({ ...editingOrder, notes: e.target.value })}
                  placeholder="Ex : Appeler avant midi, livraison urgente..."
                  className="w-full bg-[#FAF8F5] border border-[#D5C6B5] rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#8C5E35]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F0EBE3]">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#8C5E35] hover:bg-[#724823] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Enregistrer les modifications</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
