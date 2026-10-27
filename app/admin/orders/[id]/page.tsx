"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  getOrderById,
  updateOrderStatus,
  updateOrder,
  deleteOrder,
  addOrderNote,
} from "@/lib/db/store";
import { Order, OrderStatus } from "@/types";
import { formatMAD, MOROCCAN_CITIES } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  ChevronLeft,
  PhoneCall,
  MessageSquare,
  User,
  FileText,
  Send,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [newNoteText, setNewNoteText] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Edit & Delete states
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [isLoading, setIsLoading] = useState(true);

  const loadOrder = async () => {
    if (!orderId) {
      setIsLoading(false);
      return;
    }

    // 1. Try local store
    try {
      const found = getOrderById(orderId);
      if (found) {
        setOrder(found);
        setEditFormData(found);
        setIsLoading(false);
        return;
      }
    } catch (e) {
      // Ignore
    }

    // 2. Try single order API endpoint
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
      if (res.ok) {
        const data: Order = await res.json();
        if (data && (data.id || data.orderNumber)) {
          setOrder(data);
          setEditFormData(data);
          setIsLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn("Could not fetch from /api/orders/[id]", e);
    }

    // 3. Fallback: check /api/orders list
    try {
      const resAll = await fetch("/api/orders");
      if (resAll.ok) {
        const allOrders: Order[] = await resAll.json();
        const matched = allOrders.find(
          (o) => o.id === orderId || o.orderNumber === orderId
        );
        if (matched) {
          setOrder(matched);
          setEditFormData(matched);
          setIsLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn("Could not fetch from /api/orders", e);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const handleStatusChange = (status: OrderStatus) => {
    if (!order) return;
    updateOrderStatus(order.id, status, "Admin / Staff");
    loadOrder();
    showToast(`Statut mis à jour : ${status}`);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !newNoteText.trim()) return;

    setIsSubmittingNote(true);
    addOrderNote(order.id, newNoteText.trim(), "Responsable COD");
    setNewNoteText("");
    setIsSubmittingNote(false);
    loadOrder();
    showToast("Note ajoutée à l'historique.");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData) return;

    updateOrder(editFormData);
    setIsEditing(false);
    loadOrder();
    showToast(`Commande ${editFormData.orderNumber} mise à jour avec succès !`);
  };

  const handleConfirmDelete = async () => {
    if (!order) return;

    const orderId = order.id;

    // 1. Delete from client localStorage
    try {
      deleteOrder(orderId);
    } catch (e) {}

    // 2. Delete from server API
    try {
      await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        method: "DELETE",
      });
    } catch (e) {
      console.warn("Could not delete from /api/orders/[id]:", e);
    }

    try {
      await fetch(`/api/orders?id=${encodeURIComponent(orderId)}`, {
        method: "DELETE",
      });
    } catch (e) {
      console.warn("Could not delete from /api/orders?id=:", e);
    }

    setIsDeleting(false);
    router.push("/admin/orders");
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-altaj-gold border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-altaj-muted">Chargement de la commande...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-sm text-altaj-muted">Commande introuvable.</p>
        <Link href="/admin/orders">
          <Button variant="outline" size="sm">
            Retour à la liste
          </Button>
        </Link>
      </div>
    );
  }

  const cleanPhone = order.customerPhone.replace(/^0/, "");
  const whatsappUrl = `https://wa.me/212${cleanPhone}?text=Bonjour%20${encodeURIComponent(
    order.customerName
  )},%20je%20suis%20le%20responsable%20ALTAJLEATHER%20concernant%20votre%20commande%20${
    order.orderNumber
  }`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-altaj-dark text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 border border-altaj-gold animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-altaj-gold flex-shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 bg-white border border-altaj-border rounded-lg hover:bg-altaj-sand text-altaj-dark transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-bold text-altaj-dark">
                Commande {order.orderNumber}
              </h1>
              <span className="bg-altaj-sand text-altaj-dark text-xs font-bold px-2 py-0.5 rounded-sm">
                {order.status}
              </span>
            </div>
            <p className="text-xs text-altaj-muted">
              Enregistrée le{" "}
              {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`tel:${order.customerPhone}`}
            className="flex items-center gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-2 rounded-lg text-xs font-bold"
          >
            <PhoneCall className="h-4 w-4" />
            <span>Appeler</span>
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-[#25D366] text-white hover:bg-[#1EBE5D] px-3 py-2 rounded-lg text-xs font-bold"
          >
            <MessageSquare className="h-4 w-4 fill-white" />
            <span>WhatsApp Direct</span>
          </a>

          {/* Edit Button */}
          <button
            onClick={() => {
              setEditFormData({ ...order });
              setIsEditing(true);
            }}
            className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 px-3 py-2 rounded-lg text-xs font-bold transition-colors"
          >
            <Pencil className="h-4 w-4 text-amber-700" />
            <span>Modifier</span>
          </button>

          {/* Delete Button */}
          <button
            onClick={() => setIsDeleting(true)}
            className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-2 rounded-lg text-xs font-bold transition-colors"
          >
            <Trash2 className="h-4 w-4 text-rose-600" />
            <span>Supprimer</span>
          </button>
        </div>
      </div>

      {/* Lifecycle Buttons */}
      <div className="bg-white p-5 rounded-xl border border-altaj-border shadow-sm space-y-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-altaj-gold block">
          Actions sur le cycle de vie COD
        </span>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={order.status === "CONFIRMED" ? "primary" : "outline"}
            onClick={() => handleStatusChange("CONFIRMED")}
            className="text-xs"
          >
            ✓ Confirmer la Commande
          </Button>
          <Button
            size="sm"
            variant={order.status === "PREPARING" ? "primary" : "outline"}
            onClick={() => handleStatusChange("PREPARING")}
            className="text-xs"
          >
            📦 Mettre en Préparation
          </Button>
          <Button
            size="sm"
            variant={order.status === "SHIPPED" ? "primary" : "outline"}
            onClick={() => handleStatusChange("SHIPPED")}
            className="text-xs"
          >
            🚚 Remis au Transporteur (Expédié)
          </Button>
          <Button
            size="sm"
            variant={order.status === "DELIVERED" ? "gold" : "outline"}
            onClick={() => handleStatusChange("DELIVERED")}
            className="text-xs text-emerald-800 border-emerald-600 font-bold"
          >
            💰 Colis Livré & Encaissé
          </Button>
          <Button
            size="sm"
            variant={order.status === "RETURNED" ? "secondary" : "outline"}
            onClick={() => handleStatusChange("RETURNED")}
            className="text-xs text-purple-800"
          >
            ↩ Marquer Retour / Refus
          </Button>
          <Button
            size="sm"
            variant={order.status === "CANCELLED" ? "secondary" : "outline"}
            onClick={() => handleStatusChange("CANCELLED")}
            className="text-xs text-rose-700"
          >
            ✕ Annuler la Commande
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items & Summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-altaj-border shadow-sm space-y-4">
            <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-altaj-dark">
              Articles Commandés ({order.items.length})
            </h3>

            <div className="divide-y divide-altaj-border/60">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-altaj-sand rounded-lg overflow-hidden relative flex-shrink-0">
                      {item.productImage ? (
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-altaj-muted text-xs">
                          ALTAJ
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-xs text-altaj-dark">
                        {item.productName}
                      </h4>
                      {item.bundleName && (
                        <span className="text-[10px] text-altaj-gold font-semibold block">
                          {item.bundleName}
                        </span>
                      )}
                      <span className="text-[11px] text-altaj-muted">
                        Quantité : {item.quantity}
                      </span>
                    </div>
                  </div>

                  <div className="font-serif font-bold text-xs text-altaj-brown">
                    {formatMAD(item.totalPrice)}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-altaj-border space-y-2 text-xs">
              <div className="flex justify-between text-altaj-muted">
                <span>Sous-total</span>
                <span>{formatMAD(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-altaj-muted">
                <span>Frais de livraison (COD Maroc)</span>
                <span>
                  {order.shippingFee === 0 ? "GRATUIT" : formatMAD(order.shippingFee)}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-800 font-semibold">
                  <span>Remise</span>
                  <span>-{formatMAD(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-serif font-bold text-sm text-altaj-dark pt-2 border-t border-altaj-border">
                <span>Montant Total à Encaisser en Espèces :</span>
                <span className="text-altaj-brown text-base">{formatMAD(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Internal Notes / History */}
          <div className="bg-white p-6 rounded-xl border border-altaj-border shadow-sm space-y-4">
            <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-altaj-dark flex items-center gap-2">
              <FileText className="h-4 w-4 text-altaj-gold" />
              <span>Historique & Notes Internes</span>
            </h3>

            <form onSubmit={handleAddNote} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ajouter une note de suivi (ex: Client injoignable, rappel prévu à 16h...)"
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="flex-1 bg-[#FAF8F5] border border-altaj-border px-3 py-2 text-xs rounded-lg focus:outline-none focus:border-altaj-brown"
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="gold"
                  isLoading={isSubmittingNote}
                  className="text-xs px-4"
                >
                  <Send className="h-3.5 w-3.5 mr-1" />
                  Ajouter
                </Button>
              </div>
            </form>

            <div className="space-y-2.5 pt-2">
              {order.internalNotes?.length === 0 ? (
                <p className="text-xs text-altaj-muted">Aucune note enregistrée.</p>
              ) : (
                order.internalNotes?.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 bg-altaj-sand/30 rounded-lg border border-altaj-border/60 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] text-altaj-muted">
                      <span className="font-bold text-altaj-dark">{note.author}</span>
                      <span>
                        {new Date(note.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-altaj-text">{note.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Customer Info Card */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-altaj-border shadow-sm space-y-4">
            <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-altaj-dark flex items-center gap-2">
              <User className="h-4 w-4 text-altaj-gold" />
              <span>Coordonnées Client</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-altaj-muted text-[10px] uppercase font-bold">Nom complet</span>
                <p className="font-bold text-altaj-dark text-sm">{order.customerName}</p>
              </div>

              <div>
                <span className="text-altaj-muted text-[10px] uppercase font-bold">Téléphone</span>
                <p className="font-semibold text-altaj-dark text-sm">{order.customerPhone}</p>
              </div>

              <div>
                <span className="text-altaj-muted text-[10px] uppercase font-bold">Ville</span>
                <p className="font-semibold text-altaj-dark">{order.customerCity}, Maroc</p>
              </div>

              <div>
                <span className="text-altaj-muted text-[10px] uppercase font-bold">Adresse de livraison</span>
                <p className="text-altaj-text bg-altaj-sand/40 p-2.5 rounded-lg border border-altaj-border/80">
                  {order.customerAddress}
                </p>
              </div>

              {order.notes && (
                <div>
                  <span className="text-altaj-muted text-[10px] uppercase font-bold">Remarques client</span>
                  <p className="text-altaj-brown italic bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                    "{order.notes}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: EDIT ORDER */}
      {/* ========================================================================= */}
      {isEditing && editFormData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-altaj-gold">
                  Modification Commande
                </span>
                <h3 className="font-serif text-lg font-bold text-altaj-dark">
                  Modifier {order.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setIsEditing(false)}
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
                    value={editFormData.customerName}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, customerName: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-altaj-dark">Téléphone</label>
                  <input
                    type="text"
                    required
                    value={editFormData.customerPhone}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, customerPhone: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-altaj-dark">Ville de Livraison</label>
                  <select
                    value={editFormData.customerCity}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, customerCity: e.target.value })
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
                  <label className="font-bold text-altaj-dark">Statut</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
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
                <label className="font-bold text-altaj-dark">Adresse de Livraison</label>
                <textarea
                  rows={2}
                  value={editFormData.customerAddress}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, customerAddress: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-altaj-dark">Sous-total (DH)</label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.subtotal}
                    onChange={(e) => {
                      const sub = Number(e.target.value);
                      setEditFormData({
                        ...editFormData,
                        subtotal: sub,
                        total: sub + (editFormData.shippingFee || 0) - (editFormData.discount || 0),
                      });
                    }}
                    className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-altaj-dark">Frais Port (DH)</label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.shippingFee}
                    onChange={(e) => {
                      const fee = Number(e.target.value);
                      setEditFormData({
                        ...editFormData,
                        shippingFee: fee,
                        total: (editFormData.subtotal || 0) + fee - (editFormData.discount || 0),
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
                    value={editFormData.total}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, total: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border rounded-lg font-mono font-black text-altaj-brown"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-altaj-dark">Remarques du Client</label>
                <input
                  type="text"
                  value={editFormData.notes || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border rounded-lg text-slate-700 font-bold hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-altaj-brown hover:bg-altaj-dark text-white rounded-lg font-bold shadow-md"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIRM DELETE ORDER */}
      {/* ========================================================================= */}
      {isDeleting && (
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
                <strong>N° de Commande :</strong> {order.orderNumber}
              </p>
              <p>
                <strong>Client :</strong> {order.customerName} ({order.customerPhone})
              </p>
              <p>
                <strong>Montant :</strong> {formatMAD(order.total)}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDeleting(false)}
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
    </div>
  );
}
