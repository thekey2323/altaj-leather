"use client";

import React, { useState, useEffect } from "react";
import { getSettings, saveSettings } from "@/lib/db/store";
import { StoreSettings } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Save, CheckCircle2 } from "lucide-react";

export default function AdminContentPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    saveSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  if (!settings) return <div className="py-20 text-center text-xs text-altaj-muted">Chargement...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-altaj-gold">CMS</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-altaj-dark uppercase">CONTENU DU SITE</h1>
        </div>
        {savedSuccess && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-sm font-bold">
            <CheckCircle2 className="h-4 w-4" />
            <span>Enregistré avec succès !</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        <div className="bg-white p-6 rounded-sm border border-altaj-border shadow-sm space-y-4">
          <h3 className="font-serif text-sm font-bold uppercase text-altaj-dark">Bannière Hero</h3>
          <Input label="Titre Principal" value={settings.heroTitle} onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })} required />
          <div className="space-y-1">
            <label className="font-bold text-altaj-dark">Sous-titre</label>
            <textarea rows={3} value={settings.heroSubtitle} onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })} className="w-full border border-altaj-border p-2 rounded-sm" />
          </div>
          <Input label="Texte Bouton CTA" value={settings.heroCtaText} onChange={(e) => setSettings({ ...settings, heroCtaText: e.target.value })} required />
        </div>

        <div className="bg-white p-6 rounded-sm border border-altaj-border shadow-sm space-y-4">
          <h3 className="font-serif text-sm font-bold uppercase text-altaj-dark">Annonce & WhatsApp</h3>
          <Input label="Texte Bannière Défilante" value={settings.announcementText} onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })} required />
          <Input label="WhatsApp (Ex: 212661234567)" value={settings.whatsappNumber} onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })} required />
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="gold" size="lg" className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            <span>Enregistrer</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
