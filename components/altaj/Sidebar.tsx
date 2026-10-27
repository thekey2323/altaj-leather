'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  Boxes,
  Layers,
  ShoppingBag,
  Receipt,
  Users,
  Calculator,
  BarChart3,
  Settings,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  X,
  Megaphone,
} from 'lucide-react';
import { MainTab, useAltaj } from '@/context/AltajContext';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ mobileOpen = false, onCloseMobile }: SidebarProps) {
  const { activeTab, setActiveTab, settings, financials } = useAltaj();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems: {
    id: MainTab;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeColor?: string;
    description: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'KPIs & Overview',
    },
    {
      id: 'ai_advisor',
      label: 'AI Business Advisor',
      icon: Sparkles,
      badge: 'AI ✨',
      badgeColor: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-xs',
      description: 'Health & Growth Doctor',
    },
    {
      id: 'wallet_models',
      label: 'Wallet Models',
      icon: Package,
      badge: financials.totalWalletModelsCount,
      badgeColor: 'bg-cream-200 text-charcoal-700',
      description: 'Catalog & BOM',
    },
    {
      id: 'inventory',
      label: 'Inventory & Materials',
      icon: Boxes,
      badge: financials.lowStockProductsCount + financials.lowStockMaterialsCount > 0 
        ? `${financials.lowStockProductsCount + financials.lowStockMaterialsCount} alerts`
        : undefined,
      badgeColor: 'bg-softpeach-200 text-terracotta-600',
      description: 'Leather, Thread & Stock',
    },
    {
      id: 'production',
      label: 'Workshop & Crafting',
      icon: Layers,
      description: 'Batches & Labor Tracking',
    },
    {
      id: 'sales_orders',
      label: 'Orders & Sales',
      icon: ShoppingBag,
      badge: financials.pendingOrdersCount > 0 ? financials.pendingOrdersCount : undefined,
      badgeColor: 'bg-lavender-200 text-lavender-500 font-semibold',
      description: 'COD Tracking & Shipping',
    },
    {
      id: 'marketing',
      label: 'Marketing & Ads',
      icon: Megaphone,
      badge: 'ADS',
      badgeColor: 'bg-indigo-100 text-indigo-700 font-bold',
      description: 'Facebook & TikTok Ads',
    },
    {
      id: 'expenses',
      label: 'Expenses & Overhead',
      icon: Receipt,
      description: 'Operating Costs & Tools',
    },
    {
      id: 'customers',
      label: 'Customers & Suppliers',
      icon: Users,
      description: 'Directory & Balances',
    },
    {
      id: 'calculator',
      label: 'Cost Calculator',
      icon: Calculator,
      badge: 'PRO',
      badgeColor: 'bg-sage-100 text-sage-600 font-bold',
      description: 'Pricing & Target Margins',
    },
    {
      id: 'financial_reports',
      label: 'Financial Reports',
      icon: BarChart3,
      description: 'P&L, Cash Flow & Exports',
    },
    {
      id: 'settings',
      label: 'Settings & Data',
      icon: Settings,
      description: 'Currency, Backup & Demo',
    },
  ];

  const handleNavClick = (id: MainTab) => {
    setActiveTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-charcoal-900/40 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00c9a7] to-[#0072ff] flex items-center justify-center text-white shadow-sm font-bold text-lg">
              <span className="font-serif">A</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-base tracking-wide text-slate-850">
                  {settings.businessName || 'ALTAJLEATHER'}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 font-semibold border border-cyan-200">
                  Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[150px]">
                Artisan Leather ERP
              </p>
            </div>
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1 custom-scrollbar">
          <div className="px-3 pb-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Menu Principal
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all duration-150 group ${
                  isActive
                    ? 'bg-gradient-to-r from-[#00c9a7] via-[#05b3d6] to-[#0072ff] text-white shadow-sm font-medium'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs md:text-sm font-medium leading-snug truncate">
                      {item.label}
                    </div>
                    <div
                      className={`text-[10px] truncate ${
                        isActive ? 'text-white/80' : 'text-slate-400'
                      }`}
                    >
                      {item.description}
                    </div>
                  </div>
                </div>

                {item.badge !== undefined && (
                  <span
                    suppressHydrationWarning
                    className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ml-1.5 ${
                      isActive ? 'bg-white text-cyan-700 font-bold' : item.badgeColor || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {mounted ? item.badge : ''}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer artisan card */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/50">
          <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-semibold text-slate-800">
                Fez Workshop — Handcrafted
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Labor rate: <span className="font-semibold text-slate-700">{settings.defaultLaborRatePerHour} {settings.currencySymbol}/h</span>
            </p>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
              <span>{settings.ownerName}</span>
              <span className="text-emerald-600 font-medium">100% Persistent</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
