"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Plus,
  Star,
  Trash2,
  Edit2,
  Mic,
  Upload,
  CheckCircle2,
  X,
  Volume2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { getReviews, saveReview, deleteReview, getProducts } from "@/lib/db/store";
import { CustomerReview, Product } from "@/types";
import { WhatsAppAudioPlayer } from "@/components/common/WhatsAppAudioPlayer";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<CustomerReview | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [city, setCity] = useState("Casablanca");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [productSlug, setProductSlug] = useState<string>("all");
  const [isVerified, setIsVerified] = useState(true);
  const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);
  const [audioDuration, setAudioDuration] = useState<string>("0:15");
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const refreshData = () => {
    try {
      setReviews(getReviews());
      setProducts(getProducts());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const openAddModal = () => {
    setEditingReview(null);
    setName("");
    setCity("Casablanca");
    setRating(5);
    setComment("");
    setProductSlug("all");
    setIsVerified(true);
    setAudioUrl(undefined);
    setAudioDuration("0:15");
    setIsModalOpen(true);
  };

  const openEditModal = (rev: CustomerReview) => {
    setEditingReview(rev);
    setName(rev.name);
    setCity(rev.city);
    setRating(rev.rating || 5);
    setComment(rev.comment);
    setProductSlug(rev.productSlug || "all");
    setIsVerified(rev.isVerified ?? true);
    setAudioUrl(rev.audioUrl);
    setAudioDuration(rev.audioDuration || "0:15");
    setIsModalOpen(true);
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAudioLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64Audio = reader.result as string;
      setAudioUrl(base64Audio);

      // Measure duration
      try {
        const audioObj = new Audio(base64Audio);
        audioObj.onloadedmetadata = () => {
          const totalSecs = Math.round(audioObj.duration);
          if (totalSecs && !isNaN(totalSecs)) {
            const m = Math.floor(totalSecs / 60);
            const s = totalSecs % 60;
            setAudioDuration(`${m}:${s < 10 ? "0" : ""}${s}`);
          } else {
            setAudioDuration("0:20");
          }
          setIsAudioLoading(false);
        };
        audioObj.onerror = () => {
          setAudioDuration("0:18");
          setIsAudioLoading(false);
        };
      } catch {
        setAudioDuration("0:18");
        setIsAudioLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeAudio = () => {
    setAudioUrl(undefined);
    setAudioDuration("0:15");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      alert("Veuillez renseigner le nom et le commentaire.");
      return;
    }

    const reviewToSave: CustomerReview = {
      id: editingReview?.id || `rev-${Date.now()}`,
      name: name.trim(),
      city: city.trim(),
      rating,
      comment: comment.trim(),
      date: editingReview?.date || "Aujourd'hui",
      isVerified,
      audioUrl: audioUrl || undefined,
      audioDuration: audioUrl ? audioDuration : undefined,
      productSlug: productSlug === "all" ? undefined : productSlug,
      createdAt: editingReview?.createdAt || new Date().toISOString(),
    };

    saveReview(reviewToSave);
    refreshData();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Confirmez-vous la suppression de l'avis de "${name}" ?`)) {
      deleteReview(id);
      refreshData();
    }
  };

  const audioCount = reviews.filter((r) => !!r.audioUrl).length;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-[#E9E4DC] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
              <MessageSquare className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 font-serif">Avis Clients & Vocaux WhatsApp</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gérez les témoignages textuels et vocaux authentiques affichés sur la page d&apos;accueil et les pages produits.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#8C5E35] hover:bg-[#734A26] text-white text-xs font-bold shadow-md shadow-amber-900/10 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un Avis ou Vocal</span>
        </button>
      </div>

      {/* KPI Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#E9E4DC] p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Avis Actifs</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{reviews.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Taux de recommandation 100%</p>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-200/60 p-5 bg-gradient-to-br from-emerald-50/40 to-white">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
            <Mic className="w-3.5 h-3.5 text-emerald-600" />
            Notes Vocales WhatsApp
          </p>
          <p className="text-2xl font-black text-emerald-900 mt-1">{audioCount}</p>
          <p className="text-[11px] text-emerald-700 mt-1">Écoutes directes sur le site</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E9E4DC] p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Note Moyenne</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-black text-amber-600">4.9 / 5</span>
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Satisfaction cuir véritable certifié</p>
        </div>
      </div>

      {/* Reviews Table / Cards */}
      <div className="bg-white rounded-2xl border border-[#E9E4DC] shadow-xs overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-[#F0EBE3] flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Liste des Avis Enregistrés ({reviews.length})</h2>
        </div>

        {reviews.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Aucun avis pour le moment. Cliquez sur &quot;Ajouter un Avis ou Vocal&quot; pour en créer un.
          </div>
        ) : (
          <div className="divide-y divide-[#F0EBE3]">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-5 sm:p-6 hover:bg-[#FAF8F5] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm">{rev.name}</span>
                    <span className="text-xs text-slate-500">({rev.city})</span>
                    {rev.isVerified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Achat vérifié
                      </span>
                    )}
                    {rev.productSlug && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                        {products.find((p) => p.slug === rev.productSlug)?.name || rev.productSlug}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex text-amber-500">
                      {[...Array(rev.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-400">{rev.date}</span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed italic bg-stone-50/70 p-3 rounded-xl border border-stone-100">
                    &quot;{rev.comment}&quot;
                  </p>

                  {/* Audio WhatsApp Player Preview */}
                  {rev.audioUrl && (
                    <div className="max-w-md pt-1">
                      <WhatsAppAudioPlayer
                        audioUrl={rev.audioUrl}
                        senderName={rev.name}
                        durationLabel={rev.audioDuration}
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => openEditModal(rev)}
                    className="p-2 text-slate-500 hover:text-amber-800 hover:bg-amber-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
                    title="Modifier l'avis"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(rev.id, rev.name)}
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
                    title="Supprimer l'avis"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-50 text-[#8C5E35]">
                  <MessageSquare className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-base text-slate-900 font-serif">
                  {editingReview ? "Modifier l'Avis" : "Ajouter un Nouvel Avis / Vocal"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nom du Client *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="ex: Youssef El Amrani"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs focus:border-amber-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Ville *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    placeholder="ex: Casablanca, Rabat, Fès..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs focus:border-amber-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Note (1 à 5 Étoiles)
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs focus:border-amber-600 focus:outline-none bg-white"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5/5 Exceptionnel)</option>
                    <option value={4}>⭐⭐⭐⭐ (4/5 Très bien)</option>
                    <option value={3}>⭐⭐⭐ (3/5 Bien)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Produit concerné
                  </label>
                  <select
                    value={productSlug}
                    onChange={(e) => setProductSlug(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs focus:border-amber-600 focus:outline-none bg-white"
                  >
                    <option value="all">Tous les produits / Page d&apos;accueil</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.slug}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Commentaire Textuel *
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                  rows={3}
                  placeholder="ex: La qualité du cuir véritable est bluffante. Finition artisanale irréprochable et livraison très rapide à Casablanca."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs focus:border-amber-600 focus:outline-none"
                />
              </div>

              {/* WhatsApp Audio Upload Section */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-[#25D366] text-white">
                      <Mic className="w-4 h-4" />
                    </span>
                    <span className="font-bold text-slate-900 text-xs">Note Vocale WhatsApp (Optionnel)</span>
                  </div>
                  {audioUrl && (
                    <button
                      type="button"
                      onClick={removeAudio}
                      className="text-[11px] text-rose-600 font-bold hover:underline cursor-pointer"
                    >
                      Supprimer le vocal
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-600">
                  Importez un message vocal WhatsApp envoyé par le client (.mp3, .ogg, .m4a, .wav). Un lecteur authentique WhatsApp s&apos;affichera sur votre boutique !
                </p>

                {audioUrl ? (
                  <div className="space-y-2 pt-1">
                    <WhatsAppAudioPlayer audioUrl={audioUrl} durationLabel={audioDuration} />
                    <div className="flex items-center gap-2">
                      <label className="text-[10.5px] font-semibold text-slate-600">Durée affichée :</label>
                      <input
                        type="text"
                        value={audioDuration}
                        onChange={(e) => setAudioDuration(e.target.value)}
                        placeholder="0:18"
                        className="w-20 px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*,.mp3,.ogg,.m4a,.wav,.aac"
                      onChange={handleAudioUpload}
                      className="hidden"
                      id="whatsapp-audio-upload"
                    />
                    <label
                      htmlFor="whatsapp-audio-upload"
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#25D366] text-[#0D5B2C] hover:bg-emerald-50 text-xs font-bold shadow-2xs cursor-pointer transition-all"
                    >
                      <Upload className="w-4 h-4 text-[#25D366]" />
                      <span>{isAudioLoading ? "Chargement..." : "Importer un vocal audio (.mp3, .ogg, .m4a)"}</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Verified check */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-4 w-4"
                />
                <span className="text-xs font-semibold text-slate-700">
                  Marquer comme &quot;Client vérifié / Achat certifié&quot;
                </span>
              </label>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#8C5E35] hover:bg-[#734A26] text-white font-bold shadow-md cursor-pointer transition-all"
                >
                  {editingReview ? "Enregistrer les modifications" : "Ajouter l'avis"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
