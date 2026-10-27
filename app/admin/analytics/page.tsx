"use client";

import React, { useState, useEffect } from "react";
import { getAnalytics } from "@/lib/db/store";
import { formatMAD } from "@/lib/utils";
import { MapPin } from "lucide-react";

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    try {
      setStats(getAnalytics());
    } catch (e) {
      console.error(e);
    }
  }, []);

  if (!stats) return <div className="py-20 text-center text-xs text-altaj-muted">Chargement...</div>;

  return (
    <div className="space-y-8">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-altaj-gold">Intelligence Commerciale</span>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-altaj-dark uppercase">ANALYTIQUE & RENTABILITÉ</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-sm border border-altaj-border shadow-sm">
          <span className="text-[10px] font-bold uppercase text-altaj-muted">Taux Confirmation</span>
          <div className="font-serif text-2xl font-bold text-emerald-800">{stats.confirmationRate}%</div>
        </div>
        <div className="bg-white p-5 rounded-sm border border-altaj-border shadow-sm">
          <span className="text-[10px] font-bold uppercase text-altaj-muted">Taux Livraison</span>
          <div className="font-serif text-2xl font-bold text-indigo-900">{stats.deliveryRate}%</div>
        </div>
        <div className="bg-white p-5 rounded-sm border border-altaj-border shadow-sm">
          <span className="text-[10px] font-bold uppercase text-altaj-muted">Taux Annulation</span>
          <div className="font-serif text-2xl font-bold text-rose-800">{stats.cancellationRate}%</div>
        </div>
        <div className="bg-white p-5 rounded-sm border border-altaj-border shadow-sm">
          <span className="text-[10px] font-bold uppercase text-altaj-muted">Taux Retour</span>
          <div className="font-serif text-2xl font-bold text-purple-900">{stats.returnRate}%</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-sm border border-altaj-border shadow-sm space-y-4">
        <h3 className="font-serif text-base font-bold uppercase text-altaj-dark flex items-center gap-2">
          <MapPin className="h-5 w-5 text-altaj-gold" />
          <span>Performance par Ville Marocaine</span>
        </h3>
        <table className="w-full text-left text-xs">
          <thead className="bg-altaj-sand/50 border-b border-altaj-border text-[10px] uppercase font-bold text-altaj-dark">
            <tr>
              <th className="p-3">Ville</th>
              <th className="p-3">Commandes</th>
              <th className="p-3">Livrées</th>
              <th className="p-3">Chiffre d'Affaires</th>
              <th className="p-3 text-right">Succès</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-altaj-border/60">
            {stats.cityStats.map((c: any) => (
              <tr key={c.city}>
                <td className="p-3 font-bold">{c.city}</td>
                <td className="p-3">{c.orders}</td>
                <td className="p-3 text-emerald-800 font-bold">{c.delivered}</td>
                <td className="p-3 font-serif font-bold text-altaj-brown">{formatMAD(c.revenue)}</td>
                <td className="p-3 text-right font-bold text-emerald-700">{c.deliverySuccessRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
