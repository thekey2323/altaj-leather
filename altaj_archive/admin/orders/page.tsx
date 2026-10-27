"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  getOrders,
  updateOrderStatus,
  updateOrder,
  deleteOrder,
  createOrder,
  getProducts,
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

  // New Order State
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerCity, setNewCustomerCity] = useState("Casablanca");
  const [newCustomerAddress, setNewCustomerAddress] = useState("");
  const [newProductId, setNewProductId] = useState("");
  const [newQuantity, setNewQuantity] = useState(1);
  const [newShippingFee, setNewShippingFee] = useState(0);
  const [newDiscount, setNewDiscount] = useState(0);
  const [newOrderStatus, setNewOrderStatus] = useState<OrderStatus>("NEW");
  const [newOrderSource, setNewOrderSource] = useState("WhatsApp Direct");
  const [newOrderNotes, setNewOrderNotes] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadOrders = () => {
    setOrders(getOrders());
    const prods = getProducts();
    setProducts(prods);
    if (prods.length > 0 && !newProductId) {
      setNewProductId(prods[0].id);
    }
  };

  useEffect(() => {
    loadOrders();
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

  const handleConfirmDelete = () => {
    if (!deletingOrder) return;

    const num = deletingOrder.orderNumber;
    deleteOrder(deletingOrder.id);
    setDeletingOrder(null);
    loadOrders();
    showToast(`Commande ${num} supprimée définitivement.`);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-altaj-gold">
            Gestion des Commandes COD
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-altaj-dark uppercase">
            COMMANDES ({filteredOrders.length})
          </h1>
          <p className="text-xs text-altaj-muted mt-0.5">
            Validation téléphonique, édition des coordonnées, statuts d'expédition et suppression.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="px-3 py-2 text-xs font-bold text-altaj-dark border border-altaj-border rounded-xl bg-white hover:bg-altaj-sand/30 transition-colors shadow-sm"
          >
            ← Dashboard
          </Link>
          <button
            onClick={() => {
              if (products.length > 0 && !newProductId) {
                setNewProductId(products[0].id);
              }
              setIsNewOrderModalOpen(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-altaj-brown to-altaj-dark hover:opacity-95 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus className="h-4 w-4 text-altaj-gold" />
            <span>Nouvelle Commande</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-altaj-border shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-altaj-muted" />
          <input
            type="text"
            placeholder="Rechercher par n° commande, nom ou n° téléphone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-altaj-border pl-9 pr-4 py-2 text-xs rounded-lg focus:outline-none focus:border-altaj-brown"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-white border border-altaj-border px-3 py-2 text-xs rounded-lg focus:border-altaj-brown w-full md:w-auto"
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
          className="bg-white border border-altaj-border px-3 py-2 text-xs rounded-lg focus:border-altaj-brown w-full md:w-auto"
        >
          <option value="ALL">Toutes les villes</option>
          {MOROCCAN_CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-altaj-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-altaj-border text-[10px] uppercase font-bold text-altaj-dark">
              <tr>
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
                  <td colSpan={8} className="p-8 text-center text-altaj-muted">
                    Aucune commande ne correspond à vos critères.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const cleanPhone = order.customerPhone.replace(/^0/, "");
                  const whatsappUrl = `https://wa.me/212${cleanPhone}?text=Bonjour%20${encodeURIComponent(order.customerName)},%20je%20suis%20le%20responsable%20ALTAJLEATHER%20au%20sujet%20de%20votre%20commande%20${order.orderNumber}`;

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
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
                        <span className="font-semibold text-altaj-dark">{order.customerCity}</span>
                        <div className="text-[11px] text-altaj-muted truncate max-w-xs">
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

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-altaj-dark">Sous-total (DH)</label>
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
                  <label className="font-bold text-altaj-dark">Frais Livraison (DH)</label>
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
                  <label className="font-bold text-altaj-dark">Total COD (DH)</label>
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
                      onChange={(e) => setNewCustomerCity(e.target.value)}
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

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-altaj-dark block">Quantité</label>
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
                    <label className="font-bold text-altaj-dark block">Frais Livraison (DH)</label>
                    <input
                      type="number"
                      min="0"
                      value={newShippingFee}
                      onChange={(e) => setNewShippingFee(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 border rounded-lg bg-white font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-altaj-dark block">Remise (DH)</label>
                    <input
                      type="number"
                      min="0"
                      value={newDiscount}
                      onChange={(e) => setNewDiscount(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 border rounded-lg bg-white font-mono text-emerald-700"
                    />
                  </div>
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
