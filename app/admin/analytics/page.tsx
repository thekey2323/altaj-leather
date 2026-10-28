"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Eye,
  TrendingUp,
  MapPin,
  Smartphone,
  Globe,
  Share2,
  Clock,
  RefreshCw,
  ExternalLink,
  Flame,
  MessageCircle,
  FileText,
  Activity,
  CheckCircle2,
  Compass,
} from "lucide-react";
import { AnalyticsSummary } from "@/lib/analytics/tracker";
import { formatMAD } from "@/lib/utils";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [timeRange, setTimeRange] = useState<"today" | "7days" | "30days" | "all">("all");
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalytics = async (range = timeRange) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/analytics?range=${range}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Error loading analytics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics(timeRange);
    const interval = setInterval(() => {
      loadAnalytics(timeRange);
    }, 15000); // Auto-refresh every 15s for live updates
    return () => clearInterval(interval);
  }, [timeRange]);

  const handleRangeChange = (range: "today" | "7days" | "30days" | "all") => {
    setTimeRange(range);
    loadAnalytics(range);
  };

  if (!data && isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-3 border-[#8C5E35] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500">Chargement des données analytiques...</span>
      </div>
    );
  }

  const summary = data || {
    liveVisitors: 0,
    totalVisitors: 0,
    totalPageViews: 0,
    conversionRate: 0,
    averageSessionDuration: 0,
    bounceRate: 0,
    whatsappClicks: 0,
    formViews: 0,
    cityStats: [],
    countryStats: [],
    deviceStats: [],
    browserStats: [],
    trafficSources: [],
    topPages: [],
    funnel: { views: 0, bundleSelects: 0, formScrolls: 0, orders: 0 },
    recentVisitors: [],
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8C5E35]">
              Intelligence & Trafic
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>{summary.liveVisitors} en ligne en direct</span>
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900 uppercase mt-0.5">
            VISITEURS & COMPORTEMENT
          </h1>
          <p className="text-xs text-slate-500">
            Origine géographique, villes marocaines, sources de trafic et conversion des fiches produits.
          </p>
        </div>

        {/* Time filters & Refresh */}
        <div className="flex items-center gap-2">
          <div className="bg-white border border-[#DECDBB] rounded-xl p-1 flex items-center shadow-2xs text-xs">
            <button
              onClick={() => handleRangeChange("today")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                timeRange === "today" ? "bg-[#8C5E35] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Aujourd&apos;hui
            </button>
            <button
              onClick={() => handleRangeChange("7days")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                timeRange === "7days" ? "bg-[#8C5E35] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              7 Jours
            </button>
            <button
              onClick={() => handleRangeChange("30days")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                timeRange === "30days" ? "bg-[#8C5E35] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              30 Jours
            </button>
            <button
              onClick={() => handleRangeChange("all")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                timeRange === "all" ? "bg-[#8C5E35] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tout
            </button>
          </div>

          <button
            onClick={() => loadAnalytics(timeRange)}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-white border border-[#DECDBB] text-slate-700 hover:bg-[#FAF6F0] text-xs font-bold transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            title="Rafraîchir les données"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#8C5E35]" : ""}`} />
          </button>
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Unique Visitors */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8DFD4] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Visiteurs Uniques</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900">
            {summary.totalVisitors.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] font-bold text-emerald-700">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.2% de trafic</span>
          </div>
        </div>

        {/* Card 2: Total Page Views */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8DFD4] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Pages Vues</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900">
            {summary.totalPageViews.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>2m 15s durée moyenne</span>
          </div>
        </div>

        {/* Card 3: COD Conversion Rate */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8DFD4] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Taux Conversion COD</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-extrabold text-emerald-800">
            {summary.conversionRate}%
          </div>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-500 font-medium">
            <span>Visiteurs &rarr; Acheteurs</span>
          </div>
        </div>

        {/* Card 4: High Value Actions */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8DFD4] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Clics WhatsApp</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-[#25D366] border border-emerald-100">
              <MessageCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900">
            {summary.whatsappClicks}
          </div>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-emerald-700 font-bold">
            <span>{summary.formViews} formulaires ouverts</span>
          </div>
        </div>
      </div>

      {/* Row 2: Moroccan Cities & Geolocation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Moroccan Cities Ranking */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-[#E8DFD4] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F0EBE3] pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-50 text-[#8C5E35] border border-amber-200">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-sm sm:text-base font-bold text-slate-900 uppercase">
                  Trafic & Ventes par Ville Marocaine 🇲🇦
                </h3>
                <p className="text-[11px] text-slate-400">
                  Répartition des acheteurs et visiteurs dans les principales métropoles du Maroc
                </p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold text-[#8C5E35] bg-[#F7F2EB] px-2 py-0.5 rounded-full border border-[#E0D5C7]">
              Top Villes
            </span>
          </div>

          <div className="space-y-3">
            {summary.cityStats.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Aucune visite enregistrée pour cette période. Les données s&apos;afficheront ici dès les premières visites.
              </div>
            ) : (
              summary.cityStats.map((c, idx) => (
                <div key={c.city} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 font-mono">
                        {idx + 1}
                      </span>
                      <span>{c.city}</span>
                      {c.orders > 0 && (
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          {c.orders} commande{c.orders > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 font-semibold text-slate-600 text-[11px]">
                      {c.revenue > 0 && (
                        <span className="font-bold text-[#8C5E35]">{formatMAD(c.revenue)}</span>
                      )}
                      <span className="font-mono text-slate-400">{c.percentage}%</span>
                    </div>
                  </div>
                  {/* Visual Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#B07B4F] to-[#7B4D24] transition-all duration-500"
                      style={{ width: `${Math.max(c.percentage, 4)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Countries Breakdown */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-[#E8DFD4] shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#F0EBE3] pb-3">
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-bold text-slate-900 uppercase">
                Pays des Visiteurs
              </h3>
              <p className="text-[11px] text-slate-400">Origine IP globale</p>
            </div>
          </div>

          <div className="space-y-3.5">
            {summary.countryStats.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                En attente des premières visites
              </div>
            ) : (
              summary.countryStats.map((c) => (
                <div key={c.country} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{c.flag}</span>
                    <span className="font-bold text-slate-800">{c.country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">{c.visitors} visites</span>
                    <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                      {c.percentage}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-[#FAF7F2] border border-[#E9DFD3] text-[11px] text-[#6E5A4A] space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-slate-800">
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>Marocain Résidents à l'Étranger (MRE)</span>
            </div>
            <p className="text-[10.5px]">
              Trafic important provenant de France et Espagne commandant pour livraison à leur famille au Maroc.
            </p>
          </div>
        </div>
      </div>

      {/* Row 3: Traffic Sources & Devices */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Traffic Sources */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8DFD4] shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#F0EBE3] pb-3">
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-bold text-slate-900 uppercase">
                Sources de Trafic
              </h3>
              <p className="text-[11px] text-slate-400">Publicités & Canaux d'acquisition</p>
            </div>
          </div>

          <div className="space-y-3">
            {summary.trafficSources.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Aucune source pour le moment
              </div>
            ) : (
              summary.trafficSources.map((s) => (
                <div key={s.source} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{s.source}</span>
                    <span className="font-bold text-slate-900">{s.percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#8C5E35]"
                      style={{ width: `${s.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Devices */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8DFD4] shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#F0EBE3] pb-3">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-bold text-slate-900 uppercase">
                Appareils des Clients
              </h3>
              <p className="text-[11px] text-slate-400">Mobile vs Ordinateur</p>
            </div>
          </div>

          <div className="space-y-3.5">
            {summary.deviceStats.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                En attente des premiers appareils
              </div>
            ) : (
              summary.deviceStats.map((d) => (
                <div key={d.device} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{d.device}</span>
                  <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                    {d.percentage}%
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Navigateurs les plus utilisés :
            </span>
            <div className="space-y-1 text-xs">
              {summary.browserStats.length === 0 ? (
                <span className="text-[11px] text-slate-400 italic">Aucune donnée</span>
              ) : (
                summary.browserStats.map((b) => (
                  <div key={b.browser} className="flex justify-between text-[11px] text-slate-600">
                    <span>{b.browser}</span>
                    <span className="font-bold">{b.percentage}%</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Funnel & Conversion Steps */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8DFD4] shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#F0EBE3] pb-3">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-bold text-slate-900 uppercase">
                Tunnel de Vente COD
              </h3>
              <p className="text-[11px] text-slate-400">Comportement jusqu&apos;à l&apos;achat</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {/* Step 1 */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Étape 1 : Visite</span>
                <span className="font-bold text-slate-800">Arrivée sur la fiche produit</span>
              </div>
              <span className="font-mono font-bold text-slate-900">{summary.funnel.views}</span>
            </div>

            {/* Step 2 */}
            <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-700 block">Étape 2 : Offre</span>
                <span className="font-bold text-slate-800">Choix d'un bundle (1, 2 ou 3)</span>
              </div>
              <span className="font-mono font-bold text-amber-900">{summary.funnel.bundleSelects}</span>
            </div>

            {/* Step 3 */}
            <div className="p-2.5 rounded-xl bg-sky-50/60 border border-sky-200 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold uppercase text-sky-700 block">Étape 3 : Formulaire</span>
                <span className="font-bold text-slate-800">Défilement vers la commande</span>
              </div>
              <span className="font-mono font-bold text-sky-900">{summary.funnel.formScrolls}</span>
            </div>

            {/* Step 4 */}
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-700 block">Étape 4 : Succès</span>
                <span className="font-bold text-emerald-900">Commande COD validée</span>
              </div>
              <span className="font-mono font-bold text-emerald-900">{summary.funnel.orders}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Top Visited Products */}
      <div className="bg-white p-5 rounded-2xl border border-[#E8DFD4] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#F0EBE3] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-50 text-[#8C5E35] border border-amber-200">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-sm sm:text-base font-bold text-slate-900 uppercase">
                Pages & Fiches Produits les Plus Visitées
              </h3>
              <p className="text-[11px] text-slate-400">Intérêt des visiteurs sur les modèles du catalogue ALTAJ</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] border-b border-[#E8DFD4] text-[10px] uppercase font-bold text-slate-700">
              <tr>
                <th className="p-3">Page & Produit</th>
                <th className="p-3">Visiteurs Uniques</th>
                <th className="p-3">Total Vues</th>
                <th className="p-3">Intérêt</th>
                <th className="p-3 text-right">Lien Direct</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary.topPages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-xs text-slate-400">
                    Aucune vue de page enregistrée pour l'instant
                  </td>
                </tr>
              ) : (
                summary.topPages.map((page) => (
                  <tr key={page.path} className="border-b border-slate-100 last:border-0 hover:bg-[#FAF7F2] transition">
                    <td className="p-3 font-medium text-slate-800">
                      <div className="font-bold">{page.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{page.path}</div>
                    </td>
                    <td className="p-3 text-right font-mono text-slate-600">{page.uniqueVisitors}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">{page.views}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Flame className="w-3 h-3 text-amber-600" />
                        <span>Forte Demande</span>
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href={page.path}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-[11px] font-semibold"
                      >
                        <span>Voir la page</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 5: Real-Time Recent Visitors Feed */}
      <div className="bg-white p-5 rounded-2xl border border-[#E8DFD4] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#F0EBE3] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-sm sm:text-base font-bold text-slate-900 uppercase">
                Flux d&apos;Activité des Visiteurs en Direct
              </h3>
              <p className="text-[11px] text-slate-400">Dernières visites enregistrées sur le site</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Temps Réel
          </span>
        </div>

        <div className="space-y-2.5">
          {summary.recentVisitors.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              En attente des premiers visiteurs en temps réel...
            </div>
          ) : (
            summary.recentVisitors.map((vis) => (
              <div
                key={vis.id}
                className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E9E1D6] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🇲🇦</span>
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{vis.city}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] font-normal text-slate-500">{vis.device}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] font-normal text-slate-500">{vis.browser}</span>
                    </div>
                    <div className="text-[10.5px] font-mono text-[#8C5E35]">{vis.path}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {vis.source}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">{vis.timeAgo}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
