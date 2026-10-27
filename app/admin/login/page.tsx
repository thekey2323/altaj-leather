"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/common/Logo";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Lock, ShieldCheck, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAdminAuth();

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push("/admin");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const res = login(username, password);
      setLoading(false);
      if (res.success) {
        router.push("/admin");
      } else {
        setError(res.error || "Identifiants invalides");
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#1A1817] flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-[#FAF8F5] p-8 sm:p-10 rounded-2xl shadow-2xl border border-[#D9D1C5] space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-white text-xl shadow-lg shadow-amber-900/20">
              ⚡
            </div>
          </div>
          <h1 className="text-xl font-bold font-serif text-slate-900 tracking-tight">ALTAJ LEATHER</h1>
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#8C5E35]">
            <Lock className="h-3 w-3" />
            <span>Accès Back-Office Sécurisé</span>
          </div>
          <p className="text-xs text-slate-500">
            Veuillez vous authentifier pour accéder à la gestion des commandes, produits et avis.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nom d&apos;utilisateur ou Email
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="ex: admin"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:border-amber-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:border-amber-600 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#8C5E35] hover:bg-[#724B28] text-white shadow-md active:scale-[0.99] transition-all disabled:opacity-50"
          >
            {loading ? "Connexion en cours..." : "Accéder au tableau de bord"}
          </button>
        </form>

        <div className="pt-4 border-t border-[#E5DFD5] text-center">
          <Link href="/" className="text-[11px] font-semibold text-[#8C5E35] hover:text-[#5E3C1D] uppercase">
            ← Retour à la boutique
          </Link>
        </div>
      </div>
    </div>
  );
}
