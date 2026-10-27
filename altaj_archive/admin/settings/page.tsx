"use client";

import React, { useState, useEffect } from "react";
import { getSettings, saveSettings } from "@/lib/db/store";
import { StoreSettings } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Save, CheckCircle2 } from "lucide-react";

export default function AdminSettingsPage() {
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
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-altaj-gold">Configuration</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-altaj-dark uppercase">PARAMÈTRES</h1>
        </div>
        {savedSuccess && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-sm font-bold">
            <CheckCircle2 className="h-4 w-4" />
            <span>Enregistré !</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        <div className="bg-white p-6 rounded-sm border border-altaj-border shadow-sm space-y-4">
          <h3 className="font-serif text-sm font-bold uppercase text-altaj-dark">Livraison & Règle COD</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Frais livraison standard (DH)"
              type="number"
              value={settings.shippingFeeStandard}
              onChange={(e) => setSettings({ ...settings, shippingFeeStandard: parseFloat(e.target.value) || 0 })}
              required
            />
            <Input
              label="Seuil livraison gratuite (DH)"
              type="number"
              value={settings.freeShippingThreshold}
              onChange={(e) => setSettings({ ...settings, freeShippingThreshold: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>
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
