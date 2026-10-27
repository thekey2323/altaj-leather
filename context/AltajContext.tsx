'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  WalletModel,
  RawMaterial,
  MaterialPurchase,
  ProductionBatch,
  SalesOrder,
  Expense,
  Customer,
  Supplier,
  BusinessSettings,
  InventoryLogEntry,
  DateRangeFilter,
  OrderStatus,
} from '@/types/altaj';
import {
  getSettings,
  saveSettings,
  getWalletModels,
  saveWalletModel,
  deleteWalletModel,
  duplicateWalletModel,
  archiveWalletModel,
  getRawMaterials,
  saveRawMaterial,
  deleteRawMaterial,
  recordMaterialPurchase,
  getMaterialPurchases,
  getSalesOrders,
  saveSalesOrder,
  deleteSalesOrder,
  updateOrderStatus,
  recordOrderReturn,
  getProductionBatches,
  saveProductionBatch,
  deleteProductionBatch,
  getExpenses,
  saveExpense,
  deleteExpense,
  getCustomers,
  saveCustomer,
  deleteCustomer,
  getSuppliers,
  saveSupplier,
  deleteSupplier,
  getInventoryLogs,
  adjustStock,
  resetToDemoData,
  clearAllData,
  exportDatabaseJson,
  importDatabaseJson,
  subscribeToStore,
} from '@/lib/altaj/store';
import { calculateFinancialSummary, FinancialSummary } from '@/lib/altaj/finance';

export type MainTab =
  | 'dashboard'
  | 'ai_advisor'
  | 'wallet_models'
  | 'inventory'
  | 'production'
  | 'sales_orders'
  | 'marketing'
  | 'expenses'
  | 'customers'
  | 'calculator'
  | 'financial_reports'
  | 'settings';

interface AltajContextType {
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;

  // Date Range Filter
  dateFilter: DateRangeFilter;
  setDateFilter: (filter: DateRangeFilter) => void;

  // Business Data
  settings: BusinessSettings;
  updateSettings: (s: Partial<BusinessSettings>) => void;
  models: WalletModel[];
  materials: RawMaterial[];
  purchases: MaterialPurchase[];
  batches: ProductionBatch[];
  orders: SalesOrder[];
  expenses: Expense[];
  customers: Customer[];
  suppliers: Supplier[];
  logs: InventoryLogEntry[];

  // Computed Financials
  financials: FinancialSummary;

  // Actions
  saveModel: (m: Partial<WalletModel> & { name: string }) => WalletModel;
  deleteModel: (id: string) => boolean;
  duplicateModel: (id: string) => WalletModel | null;
  archiveModel: (id: string) => boolean;

  saveMaterial: (m: Partial<RawMaterial> & { name: string }) => RawMaterial;
  deleteMaterial: (id: string) => boolean;
  addPurchase: (p: Parameters<typeof recordMaterialPurchase>[0]) => MaterialPurchase;

  saveBatch: (b: Partial<ProductionBatch> & { modelId: string; quantityPlanned: number }) => ProductionBatch;

  saveOrder: (o: Partial<SalesOrder> & { customerName: string; items: SalesOrder['items'] }) => SalesOrder;
  deleteOrder: (id: string) => boolean;
  changeOrderStatus: (orderId: string, status: OrderStatus) => SalesOrder | null;
  processReturn: (params: Parameters<typeof recordOrderReturn>[0]) => SalesOrder | null;

  deleteBatch: (id: string) => boolean;

  saveExpenseItem: (e: Partial<Expense> & { description: string; amount: number }) => Expense;
  deleteExpenseItem: (id: string) => boolean;

  saveCustomerItem: (c: Partial<Customer> & { name: string }) => Customer;
  deleteCustomerItem: (id: string) => boolean;

  saveSupplierItem: (s: Partial<Supplier> & { name: string }) => Supplier;
  deleteSupplierItem: (id: string) => boolean;

  manualStockAdjust: (params: Parameters<typeof adjustStock>[0]) => boolean;

  resetDemo: () => void;
  clearData: () => void;
  exportData: () => string;
  importData: (json: string) => boolean;

  // Modals / Quick Actions
  openQuickActionModal: (action: 'new_sale' | 'add_model' | 'record_production' | 'add_purchase' | 'add_expense' | 'adjust_stock' | 'calculator') => void;
  activeQuickModal: string | null;
  closeQuickModal: () => void;
}

const AltajContext = createContext<AltajContextType | undefined>(undefined);

export function AltajProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<MainTab>('dashboard');
  const [activeQuickModal, setActiveQuickModal] = useState<string | null>(null);

  const [dateFilter, setDateFilter] = useState<DateRangeFilter>({
    preset: 'this_month',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
  });

  const [tick, setTick] = useState(0);

  // Subscribe to changes in the data store
  useEffect(() => {
    const unsubscribe = subscribeToStore(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  // Current reactive state
  const settings = useMemo(() => getSettings(), [tick]);
  const models = useMemo(() => getWalletModels(), [tick]);
  const materials = useMemo(() => getRawMaterials(), [tick]);
  const purchases = useMemo(() => getMaterialPurchases(), [tick]);
  const batches = useMemo(() => getProductionBatches(), [tick]);
  const orders = useMemo(() => getSalesOrders(), [tick]);
  const expenses = useMemo(() => getExpenses(), [tick]);
  const customers = useMemo(() => getCustomers(), [tick]);
  const suppliers = useMemo(() => getSuppliers(), [tick]);
  const logs = useMemo(() => getInventoryLogs(), [tick]);

  // Financial summary
  const financials = useMemo(() => {
    return calculateFinancialSummary({
      models,
      materials,
      orders,
      expenses,
      purchases,
      settings,
      dateFilter,
    });
  }, [models, materials, orders, expenses, purchases, settings, dateFilter, tick]);

  const openQuickActionModal = (action: string) => {
    setActiveQuickModal(action);
  };

  const closeQuickModal = () => {
    setActiveQuickModal(null);
  };

  const value: AltajContextType = {
    activeTab,
    setActiveTab,
    dateFilter,
    setDateFilter,
    settings,
    updateSettings: saveSettings,
    models,
    materials,
    purchases,
    batches,
    orders,
    expenses,
    customers,
    suppliers,
    logs,
    financials,
    saveModel: saveWalletModel,
    deleteModel: deleteWalletModel,
    duplicateModel: duplicateWalletModel,
    archiveModel: archiveWalletModel,
    saveMaterial: saveRawMaterial,
    deleteMaterial: deleteRawMaterial,
    addPurchase: recordMaterialPurchase,
    saveBatch: saveProductionBatch,
    saveOrder: saveSalesOrder,
    deleteOrder: deleteSalesOrder,
    changeOrderStatus: updateOrderStatus,
    processReturn: recordOrderReturn,
    deleteBatch: deleteProductionBatch,
    saveExpenseItem: saveExpense,
    deleteExpenseItem: deleteExpense,
    saveCustomerItem: saveCustomer,
    deleteCustomerItem: deleteCustomer,
    saveSupplierItem: saveSupplier,
    deleteSupplierItem: deleteSupplier,
    manualStockAdjust: adjustStock,
    resetDemo: resetToDemoData,
    clearData: clearAllData,
    exportData: exportDatabaseJson,
    importData: importDatabaseJson,
    openQuickActionModal,
    activeQuickModal,
    closeQuickModal,
  };

  return <AltajContext.Provider value={value}>{children}</AltajContext.Provider>;
}

export function useAltaj() {
  const context = useContext(AltajContext);
  if (!context) {
    throw new Error('useAltaj must be used within an AltajProvider');
  }
  return context;
}
