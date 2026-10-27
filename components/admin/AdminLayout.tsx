"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  Users,
  BarChart3,
  Tag,
  TrendingUp,
  FileText,
  Settings,
  LogOut,
  ExternalLink,
  Bell,
  Menu,
  X,
  ShieldAlert,
  Coins,
  MessageSquare,
  Search,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { getOrders } from "@/lib/db/store";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { user, logout } = useAdminAuth();
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

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
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white text-xs font-bold flex items-center justify-center shadow-sm flex-shrink-0">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : "AD"}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-800 truncate">{user?.name || "Administrateur"}</p>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Connecté
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              title="Déconnexion"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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

        <Link href="/admin/orders" className="relative p-2 text-slate-600 hover:text-slate-900 bg-[#F4F2EE] rounded-xl">
          <Bell className="h-4 w-4" />
          {newOrdersCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-rose-500 text-white font-extrabold text-[9px] rounded-full flex items-center justify-center shadow-sm">
              {newOrdersCount}
            </span>
          )}
        </Link>
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
          {/* Quick Search bar inspired by the reference design */}
          <div className="relative w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher client, commande, téléphone..."
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

            <Link
              href="/admin/orders"
              className="relative p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Bell className="h-4 w-4" />
              {newOrdersCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-rose-500 text-white font-extrabold text-[9px] rounded-full flex items-center justify-center shadow-sm">
                  {newOrdersCount}
                </span>
              )}
            </Link>

            <div className="h-5 w-px bg-slate-200" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
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
            pathname === "/admin" ? "text-indigo-600" : "text-slate-400"
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span className="mt-1">Accueil</span>
        </Link>

        <Link
          href="/admin/whatsapp"
          className={cn(
            "flex flex-col items-center p-1 text-[10px] font-bold",
            pathname?.startsWith("/admin/whatsapp") ? "text-emerald-600" : "text-slate-400"
          )}
        >
          <MessageSquare className="h-4 w-4" />
          <span className="mt-1">WhatsApp</span>
        </Link>

        <Link
          href="/admin/orders"
          className={cn(
            "relative flex flex-col items-center p-1 text-[10px] font-bold",
            pathname?.startsWith("/admin/orders") ? "text-amber-600" : "text-slate-400"
          )}
        >
          <ShoppingCart className="h-4 w-4" />
          {newOrdersCount > 0 && (
            <span className="absolute top-0 right-2 h-3.5 w-3.5 rounded-full bg-rose-500 text-white font-extrabold text-[8px] flex items-center justify-center">
              {newOrdersCount}
            </span>
          )}
          <span className="mt-1">Commandes</span>
        </Link>

        <Link
          href="/admin/inventory"
          className={cn(
            "flex flex-col items-center p-1 text-[10px] font-bold",
            pathname?.startsWith("/admin/inventory") ? "text-teal-600" : "text-slate-400"
          )}
        >
          <Boxes className="h-4 w-4" />
          <span className="mt-1">Stock</span>
        </Link>
      </div>
    </div>
  );
}
