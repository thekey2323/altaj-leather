"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  Package,
  Settings,
  LogOut,
  ExternalLink,
  Bell,
  Menu,
  X,
  MessageSquare,
  Search,
  ChevronRight,
  Lock,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { getOrders } from "@/lib/db/store";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { user, logout, isAuthenticated, isReady, login } = useAdminAuth();
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // In-place login form states for unauthenticated users
  const [loginUsername, setLoginUsername] = useState("admin");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    try {
      const orders = getOrders();
      const count = orders.filter((o) => o.status === "NEW").length;
      setNewOrdersCount(count);
    } catch {}
  }, [pathname]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Loading state while checking localStorage
  if (!isReady) {
    return (
      <div className="min-h-screen bg-[#F4F2EE] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#8C5E35] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Chargement de l&apos;administration...</p>
        </div>
      </div>
    );
  }

  // Auth gate: If not authenticated, show luxury login modal
  if (!isAuthenticated) {
    const handleLoginSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setLoginError(null);
      setLoginLoading(true);

      setTimeout(() => {
        const res = login(loginUsername, loginPassword);
        setLoginLoading(false);
        if (!res.success) {
          setLoginError(res.error || "Identifiants invalides");
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
              Veuillez saisir votre nom d&apos;utilisateur et mot de passe pour gérer votre boutique.
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nom d&apos;utilisateur
              </label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
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
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:border-amber-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#8C5E35] hover:bg-[#724B28] text-white shadow-md active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
            >
              {loginLoading ? "Connexion en cours..." : "Accéder au tableau de bord"}
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

  const navItems = [
    {
      label: "Commandes COD",
      href: "/admin",
      icon: ShoppingCart,
      iconColor: "text-amber-600 bg-amber-50 border-amber-100",
      activeColor: "bg-[#8C5E35] text-white shadow-amber-200",
      badge: newOrdersCount > 0 ? `${newOrdersCount}` : undefined,
      badgeColor: "bg-rose-500 text-white",
    },
    {
      label: "Produits & Photos",
      href: "/admin/products",
      icon: Package,
      iconColor: "text-sky-600 bg-sky-50 border-sky-100",
      activeColor: "bg-[#8C5E35] text-white shadow-sky-200",
    },
    {
      label: "Analytique & Visiteurs",
      href: "/admin/analytics",
      icon: BarChart3,
      iconColor: "text-purple-600 bg-purple-50 border-purple-100",
      activeColor: "bg-[#8C5E35] text-white shadow-purple-200",
    },
    {
      label: "Avis & Vocaux",
      href: "/admin/reviews",
      icon: MessageSquare,
      iconColor: "text-emerald-600 bg-emerald-50 border-emerald-100",
      activeColor: "bg-[#8C5E35] text-white shadow-emerald-200",
    },
    {
      label: "Paramètres COD",
      href: "/admin/settings",
      icon: Settings,
      iconColor: "text-stone-600 bg-stone-100 border-stone-200",
      activeColor: "bg-[#8C5E35] text-white shadow-stone-200",
    },
  ];

  return (
    <div dir="ltr" className="min-h-screen bg-[#F4F2EE] flex flex-col md:flex-row text-slate-800 antialiased font-sans">
      {/* ========================================================================= */}
      {/* 1. DESKTOP SIDEBAR - ON THE LEFT, SOFT WHITE SURFACE, COLORFUL ICONS     */}
      {/* ========================================================================= */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-[#E9E4DC] shadow-[4px_0_24px_-4px_rgba(0,0,0,0.02)] flex-shrink-0 z-20">
        {/* Brand header */}
        <div className="p-6 border-b border-[#F0EBE3] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-white font-black text-lg shadow-md shadow-amber-200">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-slate-900 font-serif">ALTAJ LEATHER</span>
                <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded-full">COD</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">WhatsApp Bot & CRM</p>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto no-scrollbar">
          <p className="px-3 pb-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
            Menu Principal
          </p>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname?.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200",
                  isActive
                    ? `${item.activeColor} shadow-md font-bold`
                    : "text-slate-600 hover:bg-[#F8F6F2] hover:text-slate-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "p-2 rounded-lg border transition-all duration-200 flex items-center justify-center",
                      isActive
                        ? "bg-white/20 border-white/30 text-white"
                        : `${item.iconColor} group-hover:scale-105`
                    )}
                  >
                    <Icon className="h-4 w-4 stroke-[2.2]" />
                  </span>
                  <span className="tracking-tight">{item.label}</span>
                </div>
                {item.badge ? (
                  <span
                    className={cn(
                      "text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm",
                      isActive ? "bg-white text-slate-900" : item.badgeColor || "bg-amber-100 text-amber-900"
                    )}
                  >
                    {item.badge}
                  </span>
                ) : (
                  <ChevronRight
                    className={cn(
                      "h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity",
                      isActive ? "opacity-100 text-white/80" : "text-slate-300"
                    )}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-[#F0EBE3] space-y-3 bg-[#FAF8F5]/80">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#EBE5DC]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-white text-xs font-bold flex items-center justify-center shadow-sm flex-shrink-0">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : "AL"}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-800 truncate">{user?.name || "Administrateur"}</p>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Connecté ({user?.username})
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              title="Déconnexion"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-[#E0D9CE] py-2 px-3 rounded-xl transition-all shadow-sm"
          >
            <span>Boutique Vitrine</span>
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
          </Link>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MOBILE TOP BAR                                                         */}
      {/* ========================================================================= */}
      <div className="md:hidden bg-white text-slate-800 px-4 py-3 flex items-center justify-between border-b border-[#E9E4DC] sticky top-0 z-30 shadow-sm">
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="p-2 text-slate-600 hover:text-slate-900 bg-[#F4F2EE] rounded-xl"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-500 flex items-center justify-center text-white text-xs font-black">
            ⚡
          </div>
          <span className="font-extrabold text-xs tracking-tight text-slate-900 font-serif">ALTAJ LEATHER</span>
        </div>

        <button onClick={logout} title="Déconnexion" className="p-2 text-slate-400 hover:text-rose-600">
          <LogOut className="h-4 w-4" />
        </button>
      </div>

      {/* Mobile Sidebar Modal Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden animate-fade-in">
          <div className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-white text-slate-800 flex flex-col justify-between p-5 overflow-y-auto shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-white text-sm font-black">
                    ⚡
                  </div>
                  <span className="font-bold text-sm text-slate-900">ALTAJ LEATHER</span>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="py-4 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={cn(
                        "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold",
                        isActive
                          ? `${item.activeColor} shadow-sm font-bold`
                          : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className={cn("p-1.5 rounded-lg border", isActive ? "bg-white/20 border-white/30 text-white" : item.iconColor)}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="bg-amber-100 text-amber-900 font-bold text-[10px] px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
              <button
                onClick={() => {
                  logout();
                  setMobileDrawerOpen(false);
                }}
                className="w-full text-center py-2.5 bg-rose-50 text-rose-700 rounded-xl font-bold border border-rose-200"
              >
                Se déconnecter
              </button>
              <Link
                href="/"
                className="block text-center py-2.5 bg-slate-900 text-white rounded-xl font-bold"
              >
                Voir la boutique
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MAIN WORKSPACE CONTAINER                                               */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-8">
        {/* Soft Modern Header Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md border-b border-[#E9E4DC] sticky top-0 z-10 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)]">
          <div className="relative w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#F4F2EE] hover:bg-[#EFECE6] focus:bg-white text-slate-800 placeholder-slate-400 rounded-xl border border-transparent focus:border-amber-400 focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-full">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-emerald-800">
                WhatsApp Bot Connecté (+212 693 148230)
              </span>
            </div>

            <div className="h-5 w-px bg-slate-200" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                AL
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-xs font-bold text-slate-800 leading-tight">Artisan Maroquinier</p>
                <p className="text-[10px] text-slate-400 font-medium">Fès • Atelier COD</p>
              </div>
            </div>
          </div>
        </header>

        {/* Child Content Views */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 4. MOBILE BOTTOM BAR                                                      */}
      {/* ========================================================================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#E9E4DC] flex items-center justify-around py-2 px-1 shadow-2xl">
        <Link
          href="/admin"
          className={cn(
            "flex flex-col items-center p-1 text-[10px] font-bold",
            pathname === "/admin" ? "text-amber-800" : "text-slate-400"
          )}
        >
          <ShoppingCart className="h-4 w-4" />
          <span className="mt-1">Commandes</span>
        </Link>

        <Link
          href="/admin/products"
          className={cn(
            "flex flex-col items-center p-1 text-[10px] font-bold",
            pathname?.startsWith("/admin/products") ? "text-amber-800" : "text-slate-400"
          )}
        >
          <Package className="h-4 w-4" />
          <span className="mt-1">Produits</span>
        </Link>

        <Link
          href="/admin/reviews"
          className={cn(
            "flex flex-col items-center p-1 text-[10px] font-bold",
            pathname?.startsWith("/admin/reviews") ? "text-emerald-600" : "text-slate-400"
          )}
        >
          <MessageSquare className="h-4 w-4" />
          <span className="mt-1">Avis/Vocaux</span>
        </Link>

        <Link
          href="/admin/settings"
          className={cn(
            "flex flex-col items-center p-1 text-[10px] font-bold",
            pathname?.startsWith("/admin/settings") ? "text-amber-800" : "text-slate-400"
          )}
        >
          <Settings className="h-4 w-4" />
          <span className="mt-1">Réglages</span>
        </Link>
      </div>
    </div>
  );
}
