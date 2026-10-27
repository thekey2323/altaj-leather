'use client';

import React, { useState, useEffect } from 'react';
import { useAltaj } from '@/context/AltajContext';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

// Views
import { DashboardView } from './views/DashboardView';
import { WalletModelsView } from './views/WalletModelsView';
import { InventoryView } from './views/InventoryView';
import { ProductionView } from './views/ProductionView';
import { SalesOrdersView } from './views/SalesOrdersView';
import { MarketingAdsView } from './views/MarketingAdsView';
import { ExpensesView } from './views/ExpensesView';
import { CustomersSuppliersView } from './views/CustomersSuppliersView';
import { PricingCalculatorView } from './views/PricingCalculatorView';
import { FinancialReportsView } from './views/FinancialReportsView';
import { SettingsView } from './views/SettingsView';
import { AiAdvisorView } from './views/AiAdvisorView';

// Modals
import { NewSaleModal } from './modals/NewSaleModal';
import { WalletModelModal } from './modals/WalletModelModal';
import { ProductionBatchModal } from './modals/ProductionBatchModal';
import { MaterialPurchaseModal } from './modals/MaterialPurchaseModal';
import { ExpenseModal } from './modals/ExpenseModal';
import { StockAdjustModal } from './modals/StockAdjustModal';

export function AltajApp() {
  const [mounted, setMounted] = useState(false);
  const { activeTab, activeQuickModal, closeQuickModal } = useAltaj();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500 font-mono tracking-wider">
            LOADING ALTAJ ATELIER...
          </span>
        </div>
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'ai_advisor':
        return <AiAdvisorView />;
      case 'wallet_models':
        return <WalletModelsView />;
      case 'inventory':
        return <InventoryView />;
      case 'production':
        return <ProductionView />;
      case 'sales_orders':
        return <SalesOrdersView />;
      case 'marketing':
        return <MarketingAdsView />;
      case 'expenses':
        return <ExpensesView />;
      case 'customers':
        return <CustomersSuppliersView />;
      case 'calculator':
        return <PricingCalculatorView />;
      case 'financial_reports':
        return <FinancialReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-slate-800 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileDrawerOpen}
        onCloseMobile={() => setMobileDrawerOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onOpenMobileMenu={() => setMobileDrawerOpen(true)} />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          {renderActiveView()}
        </main>
      </div>

      {/* Quick Action Modals */}
      {activeQuickModal === 'new_sale' && <NewSaleModal onClose={closeQuickModal} />}
      {activeQuickModal === 'add_model' && <WalletModelModal onClose={closeQuickModal} />}
      {activeQuickModal === 'record_production' && <ProductionBatchModal onClose={closeQuickModal} />}
      {activeQuickModal === 'add_purchase' && <MaterialPurchaseModal onClose={closeQuickModal} />}
      {activeQuickModal === 'add_expense' && <ExpenseModal onClose={closeQuickModal} />}
      {activeQuickModal === 'adjust_stock' && <StockAdjustModal onClose={closeQuickModal} />}
    </div>
  );
}
