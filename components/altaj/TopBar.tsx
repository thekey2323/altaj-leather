'use client';

import React, { useState } from 'react';
import {
  Menu,
  Plus,
  ShoppingBag,
  Package,
  Layers,
  Boxes,
  Receipt,
  SlidersHorizontal,
  AlertTriangle,
  Coins,
  ChevronDown,
  Search,
  Bell,
  Calculator,
} from 'lucide-react';
import { useAltaj } from '@/context/AltajContext';
import { DateRangePicker } from './DateRangePicker';

interface TopBarProps {
  onOpenMobileMenu: () => void;
}

export function TopBar({ onOpenMobileMenu }: TopBarProps) {
  const {
    activeTab,
    dateFilter,
    setDateFilter,
    financials,
    openQuickActionModal,
    settings,
  } = useAltaj();

  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);

  const totalLowStock = financials.lowStockProductsCount + financials.lowStockMaterialsCount;

  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Overview of workshop performance, inventory levels, and real net profit',
    },
    wallet_models: {
      title: 'Wallet Models',
      subtitle: 'Handcrafted creations catalog, bill of materials (BOM), and unit production cost',
    },
    inventory: {
      title: 'Inventory & Materials',
      subtitle: 'Stock tracking for leathers, thread, packaging, and finished wallets',
    },
    production: {
      title: 'Workshop & Crafting Batches',
      subtitle: 'Production runs, automatic material deduction, and labor tracking',
    },
    sales_orders: {
      title: 'Sales & Orders',
      subtitle: 'Customer orders, COD delivery tracking, payments, and return processing',
    },
    marketing: {
      title: 'Marketing & Ads',
      subtitle: 'Facebook & TikTok Ads spend, customer acquisition cost (CAC), and direct net profit impact',
    },
    expenses: {
      title: 'Operating Expenses & Overhead',
      subtitle: 'Strict operational expense tracking without double-counting materials or stock',
    },
    customers: {
      title: 'Customers & Suppliers',
      subtitle: 'Customer directory and trusted leather tanneries & hardware suppliers',
    },
    calculator: {
      title: 'Cost & Selling Price Calculator',
      subtitle: 'Artisan pricing tool factoring leather yield, scrap margins, and target profit',
    },
    financial_reports: {
      title: 'Financial Reports & Exports',
      subtitle: 'Income statement (P&L), cash flow statement, and inventory valuation',
    },
    settings: {
      title: 'Settings & Data Management',
      subtitle: 'Workshop configuration, hourly labor rate, MAD currency, and JSON backups',
    },
  };

  const currentTabInfo = tabTitles[activeTab] || tabTitles.dashboard;

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-[#00c9a7] via-[#05b3d6] to-[#0072ff] text-white px-4 md:px-8 py-3.5 shadow-md transition-all rounded-b-2xl md:rounded-b-3xl mb-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Frosted glass Logo + Page Title / Subtitle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl bg-white/20 text-white hover:bg-white/30 backdrop-blur-md"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/25 backdrop-blur-md border border-white/40 flex items-center justify-center font-bold text-white text-base shadow-xs tracking-tight">
              .D
            </div>
            <div>
              <h1 className="font-bold text-base md:text-lg text-white tracking-tight leading-tight">
                {currentTabInfo.title}
              </h1>
              <p className="text-[11px] text-white/85 font-normal">
                Admin • ALTAJ Atelier
              </p>
            </div>
          </div>
        </div>

        {/* Center: Search Bar Pill */}
        <div className="relative flex-1 max-w-md mx-auto hidden md:block">
          <input
            type="text"
            placeholder="Type in to search..."
            className="w-full pl-5 pr-10 py-2 bg-white/20 hover:bg-white/25 focus:bg-white/30 border border-white/30 rounded-full text-xs text-white placeholder-white/75 outline-none backdrop-blur-md transition-all shadow-inner"
          />
          <Search className="w-4 h-4 text-white/80 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Right: Quick Tools + Date Filter + New Sale + User Avatar */}
        <div className="flex items-center gap-2.5 flex-wrap justify-end">
          {/* Quick Tools Icons */}
          <div className="hidden sm:flex items-center gap-1.5 bg-white/15 p-1 rounded-2xl backdrop-blur-md border border-white/20">
            <button
              type="button"
              onClick={() => openQuickActionModal('calculator')}
              className="p-1.5 rounded-xl text-white/90 hover:text-white hover:bg-white/20 transition-colors"
              title="Pricing Calculator"
            >
              <Calculator className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => openQuickActionModal('adjust_stock')}
              className="p-1.5 rounded-xl text-white/90 hover:text-white hover:bg-white/20 transition-colors"
              title="Stock Adjustment"
            >
              <Boxes className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => openQuickActionModal('record_production')}
              className="p-1.5 rounded-xl text-white/90 hover:text-white hover:bg-white/20 transition-colors"
              title="Start Production Batch"
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-1.5 rounded-xl text-white/90 hover:text-white hover:bg-white/20 transition-colors relative"
              title={`${totalLowStock} stock alerts`}
            >
              <Bell className="w-4 h-4" />
              {totalLowStock > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-300 ring-2 ring-emerald-500 animate-pulse" />
              )}
            </button>
          </div>

          <div className="h-6 w-px bg-white/30 hidden sm:block" />

          {/* Date Range Picker */}
          <div className="text-charcoal-800">
            <DateRangePicker filter={dateFilter} onChange={setDateFilter} />
          </div>

          {/* Primary Quick Action: + New Sale */}
          <button
            type="button"
            onClick={() => openQuickActionModal('new_sale')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-white/95 text-teal-700 rounded-full text-xs font-bold shadow-sm transition-all duration-150 transform hover:scale-[1.02]"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-teal-600" />
            <span>+ New Sale</span>
          </button>

          {/* Quick Actions Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActionsMenuOpen(!actionsMenuOpen)}
              className="flex items-center gap-1 px-2.5 py-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-full text-xs font-medium text-white shadow-xs transition-colors backdrop-blur-md"
              title="More actions"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <ChevronDown className="w-3.5 h-3.5 text-white/80" />
            </button>

            {actionsMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setActionsMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-card border border-cream-300 z-50 p-1.5 animate-fade-in">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-charcoal-500 px-3 py-1.5">
                    Quick Create
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      openQuickActionModal('add_model');
                      setActionsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-charcoal-800 hover:bg-cream-100 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-paleblue-100 text-paleblue-500 flex items-center justify-center">
                      <Package className="w-3.5 h-3.5" />
                    </div>
                    <span>New Wallet Model</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      openQuickActionModal('record_production');
                      setActionsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-charcoal-800 hover:bg-cream-100 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-lavender-100 text-lavender-500 flex items-center justify-center">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <span>Start Crafting Batch</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      openQuickActionModal('add_purchase');
                      setActionsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-charcoal-800 hover:bg-cream-100 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-sage-100 text-sage-600 flex items-center justify-center">
                      <Boxes className="w-3.5 h-3.5" />
                    </div>
                    <span>Purchase Raw Materials</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      openQuickActionModal('add_expense');
                      setActionsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-charcoal-800 hover:bg-cream-100 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-softpeach-100 text-terracotta-500 flex items-center justify-center">
                      <Receipt className="w-3.5 h-3.5" />
                    </div>
                    <span>Log Operating Expense</span>
                  </button>

                  <div className="my-1 border-t border-cream-200" />

                  <button
                    type="button"
                    onClick={() => {
                      openQuickActionModal('adjust_stock');
                      setActionsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-charcoal-800 hover:bg-cream-100 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-cream-200 text-charcoal-700 flex items-center justify-center">
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                    </div>
                    <span>Manual Stock Adjustment</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* User Profile Avatar with White Ring */}
          <div className="w-8 h-8 rounded-full border-2 border-white/90 overflow-hidden bg-white/30 flex items-center justify-center shrink-0 shadow-xs cursor-pointer hover:ring-2 hover:ring-white/40 transition-all">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
              alt="Artisan Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
