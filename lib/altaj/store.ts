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
  OrderStatus,
  PaymentStatus,
} from '@/types/altaj';
import {
  INITIAL_SETTINGS,
  INITIAL_SUPPLIERS,
  INITIAL_RAW_MATERIALS,
  INITIAL_WALLET_MODELS,
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_EXPENSES,
  INITIAL_PURCHASES,
  INITIAL_PRODUCTION_BATCHES,
  INITIAL_INVENTORY_LOGS,
} from './initialData';

const STORAGE_KEYS = {
  MODELS: 'altaj_wallet_models_v3',
  MATERIALS: 'altaj_raw_materials_v3',
  PURCHASES: 'altaj_material_purchases_v3',
  BATCHES: 'altaj_production_batches_v3',
  ORDERS: 'altaj_sales_orders_v3',
  EXPENSES: 'altaj_expenses_v3',
  CUSTOMERS: 'altaj_customers_v3',
  SUPPLIERS: 'altaj_suppliers_v3',
  LOGS: 'altaj_inventory_logs_v3',
  SETTINGS: 'altaj_business_settings_v3',
};

// In-memory cache for SSR & reactive updates
let memoryModels: WalletModel[] = [...INITIAL_WALLET_MODELS];
let memoryMaterials: RawMaterial[] = [...INITIAL_RAW_MATERIALS];
let memoryPurchases: MaterialPurchase[] = [...INITIAL_PURCHASES];
let memoryBatches: ProductionBatch[] = [...INITIAL_PRODUCTION_BATCHES];
let memoryOrders: SalesOrder[] = [...INITIAL_ORDERS];
let memoryExpenses: Expense[] = [...INITIAL_EXPENSES];
let memoryCustomers: Customer[] = [...INITIAL_CUSTOMERS];
let memorySuppliers: Supplier[] = [...INITIAL_SUPPLIERS];
let memoryLogs: InventoryLogEntry[] = [...INITIAL_INVENTORY_LOGS];
let memorySettings: BusinessSettings = { ...INITIAL_SETTINGS };

type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Store listener error:', e);
    }
  });
}

export function subscribeToStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function getStored<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(item);
  } catch (e) {
    console.warn(`Error reading localStorage for key ${key}:`, e);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e: any) {
    console.error(`Error saving localStorage for key ${key}:`, e);
    // Handle QuotaExceededError gracefully
    if (e?.name === 'QuotaExceededError' || e?.code === 22 || e?.code === 1014) {
      try {
        const legacyKeys = [
          'altaj_wallet_models_v2',
          'altaj_wallet_models_v1',
          'altaj_sales_orders_v2',
          'altaj_inventory_logs_v2',
        ];
        legacyKeys.forEach((k) => localStorage.removeItem(k));
        localStorage.setItem(key, JSON.stringify(value));
      } catch (retryErr) {
        console.warn('LocalStorage quota still exceeded after cleanup', retryErr);
      }
    }
  }
}

// -------------------------------------------------------------
// BUSINESS SETTINGS
// -------------------------------------------------------------
export function getSettings(): BusinessSettings {
  if (isBrowser()) {
    memorySettings = getStored(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  }
  return memorySettings;
}

export function saveSettings(settings: Partial<BusinessSettings>): BusinessSettings {
  const current = getSettings();
  const updated: BusinessSettings = { ...current, ...settings };
  memorySettings = updated;
  setStored(STORAGE_KEYS.SETTINGS, updated);
  notifyListeners();
  return updated;
}

// -------------------------------------------------------------
// WALLET MODELS
// -------------------------------------------------------------
export function getWalletModels(): WalletModel[] {
  if (isBrowser()) {
    memoryModels = getStored(STORAGE_KEYS.MODELS, INITIAL_WALLET_MODELS);
  }
  return memoryModels;
}

export function saveWalletModel(modelData: Partial<WalletModel> & { name: string }): WalletModel {
  const models = getWalletModels();
  const now = new Date().toISOString();
  const settings = getSettings();

  // Re-calculate unit cost and gross profit
  const leatherCost = Number(modelData.leatherCost) || 0;
  const threadCost = Number(modelData.threadCost) || 0;
  const hardwareCost = Number(modelData.hardwareCost) || 0;
  const packagingCost = Number(modelData.packagingCost) || 0;
  const directLaborCost = Number(modelData.directLaborCost) || 
    ((Number(modelData.productionTimeMinutes) || 0) / 60) * settings.defaultLaborRatePerHour;
  const otherCosts = Number(modelData.otherProductionCosts) || 0;
  
  const unitProductionCost = Number(modelData.unitProductionCost) > 0
    ? Number(modelData.unitProductionCost)
    : Math.round((leatherCost + threadCost + hardwareCost + packagingCost + directLaborCost + otherCosts) * 100) / 100;
  const sellingPrice = Number(modelData.sellingPrice) || 0;
  const grossProfit = Math.round((sellingPrice - unitProductionCost) * 100) / 100;
  const grossMargin = sellingPrice > 0 ? Math.round((grossProfit / sellingPrice) * 1000) / 10 : 0;

  let model: WalletModel;

  if (modelData.id) {
    const index = models.findIndex((m) => m.id === modelData.id);
    if (index >= 0) {
      model = {
        ...models[index],
        ...modelData,
        unitProductionCost,
        grossProfitPerUnit: grossProfit,
        grossProfitMarginPercent: grossMargin,
        updatedAt: now,
      } as WalletModel;
      models[index] = model;
    } else {
      model = {
        ...modelData,
        id: modelData.id,
        sku: modelData.sku || `ALT-${Date.now().toString().slice(-4)}`,
        photoUrl: modelData.photoUrl || 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
        walletType: modelData.walletType || 'bifold',
        leatherType: modelData.leatherType || 'Cuir Vachette Pleine Fleur',
        leatherColor: modelData.leatherColor || 'Cognac',
        threadColor: modelData.threadColor || 'Crème',
        hardware: modelData.hardware || 'Aucun',
        dimensions: modelData.dimensions || '11.0 x 9.0 x 1.2 cm',
        productionTimeMinutes: Number(modelData.productionTimeMinutes) || 90,
        recipe: modelData.recipe || [],
        leatherWastePercent: Number(modelData.leatherWastePercent) || 15,
        leatherCost,
        threadCost,
        hardwareCost,
        packagingCost,
        directLaborCost,
        otherProductionCosts: otherCosts,
        unitProductionCost,
        sellingPrice,
        grossProfitPerUnit: grossProfit,
        grossProfitMarginPercent: grossMargin,
        finishedStock: Number(modelData.finishedStock) || 0,
        reservedStock: Number(modelData.reservedStock) || 0,
        minStockThreshold: Number(modelData.minStockThreshold) || settings.lowStockThresholdDefault,
        status: modelData.status || 'active',
        createdAt: now,
        updatedAt: now,
      } as WalletModel;
      models.unshift(model);
    }
  } else {
    model = {
      ...modelData,
      id: `mod-${Date.now()}`,
      sku: modelData.sku || `ALT-${Date.now().toString().slice(-4)}`,
      photoUrl: modelData.photoUrl || 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
      walletType: modelData.walletType || 'bifold',
      leatherType: modelData.leatherType || 'Cuir Vachette Pleine Fleur',
      leatherColor: modelData.leatherColor || 'Cognac',
      threadColor: modelData.threadColor || 'Crème',
      hardware: modelData.hardware || 'Aucun',
      dimensions: modelData.dimensions || '11.0 x 9.0 x 1.2 cm',
      productionTimeMinutes: Number(modelData.productionTimeMinutes) || 90,
      recipe: modelData.recipe || [],
      leatherWastePercent: Number(modelData.leatherWastePercent) || 15,
      leatherCost,
      threadCost,
      hardwareCost,
      packagingCost,
      directLaborCost,
      otherProductionCosts: otherCosts,
      unitProductionCost,
      sellingPrice,
      grossProfitPerUnit: grossProfit,
      grossProfitMarginPercent: grossMargin,
      finishedStock: Number(modelData.finishedStock) || 0,
      reservedStock: 0,
      minStockThreshold: Number(modelData.minStockThreshold) || settings.lowStockThresholdDefault,
      status: modelData.status || 'active',
      createdAt: now,
      updatedAt: now,
    } as WalletModel;
    models.unshift(model);
  }

  memoryModels = [...models];
  setStored(STORAGE_KEYS.MODELS, memoryModels);

  // Sync existing sales orders with updated model unit production cost
  try {
    const currentOrders = getSalesOrders();
    let ordersUpdated = false;
    currentOrders.forEach((o) => {
      o.items.forEach((it) => {
        if (it.modelId === model.id || it.sku === model.sku || (it.modelName && it.modelName.toLowerCase().trim() === model.name.toLowerCase().trim())) {
          it.unitCost = model.unitProductionCost;
          it.totalCost = model.unitProductionCost * (it.quantity || 1);
          ordersUpdated = true;
        }
      });
    });
    if (ordersUpdated) {
      memoryOrders = [...currentOrders];
      setStored(STORAGE_KEYS.ORDERS, memoryOrders);
    }
  } catch (err) {
    console.error('Error syncing order costs with updated model', err);
  }

  notifyListeners();
  return model;
}

export function duplicateWalletModel(id: string): WalletModel | null {
  const models = getWalletModels();
  const existing = models.find((m) => m.id === id);
  if (!existing) return null;

  const duplicated: Partial<WalletModel> = {
    ...existing,
    id: undefined,
    name: `${existing.name} (Copie)`,
    sku: `${existing.sku}-COPY`,
    finishedStock: 0,
    reservedStock: 0,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return saveWalletModel(duplicated as any);
}

export function archiveWalletModel(id: string): boolean {
  const models = getWalletModels();
  const index = models.findIndex((m) => m.id === id);
  if (index >= 0) {
    models[index].status = models[index].status === 'archived' ? 'active' : 'archived';
    models[index].updatedAt = new Date().toISOString();
    memoryModels = [...models];
    setStored(STORAGE_KEYS.MODELS, memoryModels);
    notifyListeners();
    return true;
  }
  return false;
}

export function deleteWalletModel(id: string): boolean {
  // Never delete if historical sales exist; archive instead
  const orders = getSalesOrders();
  const hasOrders = orders.some((o) => o.items.some((i) => i.modelId === id));
  if (hasOrders) {
    return archiveWalletModel(id);
  }

  const models = getWalletModels();
  memoryModels = models.filter((m) => m.id !== id);
  setStored(STORAGE_KEYS.MODELS, memoryModels);
  notifyListeners();
  return true;
}

// -------------------------------------------------------------
// RAW MATERIALS
// -------------------------------------------------------------
export function getRawMaterials(): RawMaterial[] {
  if (isBrowser()) {
    memoryMaterials = getStored(STORAGE_KEYS.MATERIALS, INITIAL_RAW_MATERIALS);
  }
  return memoryMaterials;
}

export function saveRawMaterial(materialData: Partial<RawMaterial> & { name: string }): RawMaterial {
  const materials = getRawMaterials();
  const now = new Date().toISOString();

  const currentStock = Number(materialData.currentStock) || 0;
  const unitCost = Number(materialData.unitCost) || 0;
  const totalValue = Math.round(currentStock * unitCost * 100) / 100;

  let material: RawMaterial;

  if (materialData.id) {
    const index = materials.findIndex((m) => m.id === materialData.id);
    if (index >= 0) {
      material = {
        ...materials[index],
        ...materialData,
        currentStock,
        unitCost,
        totalValue,
        updatedAt: now,
      } as RawMaterial;
      materials[index] = material;
    } else {
      material = {
        ...materialData,
        id: materialData.id,
        unitCost,
        currentStock,
        totalValue,
        quantityPurchased: Number(materialData.quantityPurchased) || currentStock,
        quantityConsumed: Number(materialData.quantityConsumed) || 0,
        wasteScrapsLogged: Number(materialData.wasteScrapsLogged) || 0,
        minStockThreshold: Number(materialData.minStockThreshold) || 10,
        purchaseDate: materialData.purchaseDate || now.slice(0, 10),
        createdAt: now,
        updatedAt: now,
      } as RawMaterial;
      materials.push(material);
    }
  } else {
    material = {
      ...materialData,
      id: `mat-${Date.now()}`,
      unitCost,
      currentStock,
      totalValue,
      quantityPurchased: Number(materialData.quantityPurchased) || currentStock,
      quantityConsumed: 0,
      wasteScrapsLogged: 0,
      minStockThreshold: Number(materialData.minStockThreshold) || 10,
      purchaseDate: materialData.purchaseDate || now.slice(0, 10),
      createdAt: now,
      updatedAt: now,
    } as RawMaterial;
    materials.push(material);
  }

  memoryMaterials = [...materials];
  setStored(STORAGE_KEYS.MATERIALS, memoryMaterials);
  notifyListeners();
  return material;
}

export function deleteRawMaterial(id: string): boolean {
  const materials = getRawMaterials();
  memoryMaterials = materials.filter((m) => m.id !== id);
  setStored(STORAGE_KEYS.MATERIALS, memoryMaterials);
  notifyListeners();
  return true;
}

// -------------------------------------------------------------
// MATERIAL PURCHASES & INVENTORY ACQUISITION
// -------------------------------------------------------------
export function getMaterialPurchases(): MaterialPurchase[] {
  if (isBrowser()) {
    memoryPurchases = getStored(STORAGE_KEYS.PURCHASES, INITIAL_PURCHASES);
  }
  return memoryPurchases;
}

/**
 * Records a material purchase:
 * Increases raw material currentStock, updates total purchased,
 * and logs an inventory movement.
 * Does NOT double-count as an operating expense!
 */
export function recordMaterialPurchase(data: {
  materialId: string;
  quantity: number;
  unitCost: number;
  supplierId?: string;
  supplierName?: string;
  purchaseDate?: string;
  paymentStatus?: 'paid' | 'pending';
  paymentMethod?: string;
  isCapitalEquipment?: boolean;
  notes?: string;
}): MaterialPurchase {
  const materials = getRawMaterials();
  const purchases = getMaterialPurchases();
  const now = new Date().toISOString();

  const mat = materials.find((m) => m.id === data.materialId);
  const materialName = mat ? mat.name : 'Matière';
  const unit = mat ? mat.unit : 'unit';

  const totalCost = Math.round(data.quantity * data.unitCost * 100) / 100;
  const purchaseNumber = `PUR-${Date.now().toString().slice(-6)}`;

  const purchase: MaterialPurchase = {
    id: `pur-${Date.now()}`,
    purchaseNumber,
    materialId: data.materialId,
    materialName,
    supplierId: data.supplierId || mat?.supplierId,
    supplierName: data.supplierName || mat?.supplierName || 'Fournisseur',
    quantity: data.quantity,
    unit,
    unitCost: data.unitCost,
    totalCost,
    purchaseDate: data.purchaseDate || now.slice(0, 10),
    paymentStatus: data.paymentStatus || 'paid',
    paymentMethod: data.paymentMethod || 'cash',
    isCapitalEquipment: !!data.isCapitalEquipment,
    notes: data.notes,
    createdAt: now,
  };

  purchases.unshift(purchase);
  memoryPurchases = [...purchases];
  setStored(STORAGE_KEYS.PURCHASES, memoryPurchases);

  // If this is a raw material (not capital equipment), increase inventory stock
  if (mat && !data.isCapitalEquipment) {
    const prevStock = mat.currentStock;
    const newStock = prevStock + data.quantity;
    const newPurchased = mat.quantityPurchased + data.quantity;
    
    // Weighted average unit cost update
    const previousTotalCost = prevStock * mat.unitCost;
    const newTotalCost = previousTotalCost + totalCost;
    const updatedUnitCost = newStock > 0 ? Math.round((newTotalCost / newStock) * 100) / 100 : data.unitCost;

    saveRawMaterial({
      ...mat,
      currentStock: newStock,
      quantityPurchased: newPurchased,
      unitCost: updatedUnitCost,
    });

    // Log inventory movement
    addInventoryLog({
      date: now,
      type: 'raw_material_in',
      referenceId: purchase.id,
      itemId: mat.id,
      itemName: mat.name,
      itemType: 'raw_material',
      quantityChange: data.quantity,
      previousStock: prevStock,
      newStock,
      unit: mat.unit,
      reason: `Achat n° ${purchaseNumber} (${purchase.supplierName})`,
    });
  }

  notifyListeners();
  return purchase;
}

// -------------------------------------------------------------
// PRODUCTION BATCHES & BOM MANUFACTURING
// -------------------------------------------------------------
export function getProductionBatches(): ProductionBatch[] {
  if (isBrowser()) {
    memoryBatches = getStored(STORAGE_KEYS.BATCHES, INITIAL_PRODUCTION_BATCHES);
  }
  return memoryBatches;
}

/**
 * Creates or updates a production batch.
 * Handles deduction of materials and addition of completed finished goods with transaction safety.
 */
export function saveProductionBatch(batchData: Partial<ProductionBatch> & { modelId: string; quantityPlanned: number }): ProductionBatch {
  const batches = getProductionBatches();
  const models = getWalletModels();
  const materials = getRawMaterials();
  const settings = getSettings();
  const now = new Date().toISOString();

  const model = models.find((m) => m.id === batchData.modelId);
  const modelName = model ? model.name : 'Modèle';
  const sku = model ? model.sku : 'SKU';

  const quantityCompleted = Number(batchData.quantityCompleted) || 0;
  const quantityDefects = Number(batchData.quantityDefects) || 0;
  const laborHours = Number(batchData.laborTimeHours) || 0;
  const laborRate = Number(batchData.laborRatePerHour) || settings.defaultLaborRatePerHour;
  const actualLaborCost = Math.round(laborHours * laborRate * 100) / 100;
  const additionalCost = Number(batchData.additionalCost) || 0;

  // Compute materials consumed based on recipe if not already supplied
  let materialsConsumed = batchData.materialsConsumed || [];
  if (materialsConsumed.length === 0 && model && model.recipe) {
    const qty = quantityCompleted > 0 ? quantityCompleted : batchData.quantityPlanned;
    materialsConsumed = model.recipe.map((r) => {
      const mat = materials.find((m) => m.id === r.materialId);
      const consumedQty = Math.round(r.quantityRequired * qty * 100) / 100;
      const unitC = mat ? mat.unitCost : r.estimatedUnitCost;
      return {
        materialId: r.materialId,
        materialName: r.materialName,
        quantityConsumed: consumedQty,
        unit: (mat ? mat.unit : r.unit) as any,
        unitCost: unitC,
        totalCost: Math.round(consumedQty * unitC * 100) / 100,
      };
    });
  }

  const actualMaterialCost = materialsConsumed.reduce((acc, m) => acc + (m.totalCost || 0), 0);
  const totalBatchCost = Math.round((actualMaterialCost + actualLaborCost + additionalCost) * 100) / 100;
  const unitCostCalculated = quantityCompleted > 0 ? Math.round((totalBatchCost / quantityCompleted) * 100) / 100 : (model ? model.unitProductionCost : 0);

  let batch: ProductionBatch;
  let isNew = false;

  if (batchData.id) {
    const index = batches.findIndex((b) => b.id === batchData.id);
    if (index >= 0) {
      batch = {
        ...batches[index],
        ...batchData,
        materialsConsumed,
        actualMaterialCost,
        laborRatePerHour: laborRate,
        actualLaborCost,
        totalBatchCost,
        unitCostCalculated,
        updatedAt: now,
      } as ProductionBatch;
      batches[index] = batch;
    } else {
      isNew = true;
      batch = {
        ...batchData,
        id: batchData.id,
        batchNumber: batchData.batchNumber || `PRD-${Date.now().toString().slice(-6)}`,
        modelName,
        sku,
        status: batchData.status || 'draft',
        materialsConsumed,
        actualMaterialCost,
        laborRatePerHour: laborRate,
        actualLaborCost,
        additionalCost,
        totalBatchCost,
        unitCostCalculated,
        performedBy: batchData.performedBy || settings.ownerName,
        materialsDeducted: false,
        finishedStockAdded: false,
        startDate: batchData.startDate || now,
        createdAt: now,
        updatedAt: now,
      } as ProductionBatch;
      batches.unshift(batch);
    }
  } else {
    isNew = true;
    batch = {
      ...batchData,
      id: `bat-${Date.now()}`,
      batchNumber: `PRD-${Date.now().toString().slice(-6)}`,
      modelName,
      sku,
      status: batchData.status || 'draft',
      materialsConsumed,
      actualMaterialCost,
      laborRatePerHour: laborRate,
      actualLaborCost,
      additionalCost,
      totalBatchCost,
      unitCostCalculated,
      performedBy: batchData.performedBy || settings.ownerName,
      materialsDeducted: false,
      finishedStockAdded: false,
      startDate: batchData.startDate || now,
      createdAt: now,
      updatedAt: now,
    } as ProductionBatch;
    batches.unshift(batch);
  }

  // Stock deduction & addition upon 'completed' status
  if (batch.status === 'completed') {
    // 1. Deduct raw materials if not already deducted
    if (!batch.materialsDeducted) {
      batch.materialsConsumed.forEach((mc) => {
        const raw = materials.find((m) => m.id === mc.materialId);
        if (raw) {
          const prev = raw.currentStock;
          const next = Math.max(0, Math.round((prev - mc.quantityConsumed) * 100) / 100);
          saveRawMaterial({
            ...raw,
            currentStock: next,
            quantityConsumed: (raw.quantityConsumed || 0) + mc.quantityConsumed,
          });

          addInventoryLog({
            date: now,
            type: 'raw_material_consumed',
            referenceId: batch.id,
            itemId: raw.id,
            itemName: raw.name,
            itemType: 'raw_material',
            quantityChange: -mc.quantityConsumed,
            previousStock: prev,
            newStock: next,
            unit: raw.unit,
            reason: `Consommation production lot n° ${batch.batchNumber} (${batch.modelName})`,
          });
        }
      });
      batch.materialsDeducted = true;
    }

    // 2. Add finished wallets to inventory if not already added
    if (!batch.finishedStockAdded && batch.quantityCompleted > 0 && model) {
      const prevStock = model.finishedStock;
      const nextStock = prevStock + batch.quantityCompleted;

      saveWalletModel({
        ...model,
        finishedStock: nextStock,
        // Optionally update unit cost if calculated
        unitProductionCost: batch.unitCostCalculated > 0 ? batch.unitCostCalculated : model.unitProductionCost,
      });

      addInventoryLog({
        date: now,
        type: 'finished_goods_produced',
        referenceId: batch.id,
        itemId: model.id,
        itemName: model.name,
        itemType: 'finished_goods',
        quantityChange: batch.quantityCompleted,
        previousStock: prevStock,
        newStock: nextStock,
        unit: 'unit',
        reason: `Production terminée lot n° ${batch.batchNumber}`,
      });

      batch.finishedStockAdded = true;
      batch.completedDate = batch.completedDate || now;
    }
  }

  memoryBatches = [...batches];
  setStored(STORAGE_KEYS.BATCHES, memoryBatches);
  notifyListeners();
  return batch;
}

// -------------------------------------------------------------
// SALES & ORDER MANAGEMENT
// -------------------------------------------------------------
export function getSalesOrders(): SalesOrder[] {
  if (isBrowser()) {
    memoryOrders = getStored(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  }
  return memoryOrders;
}

export function saveSalesOrder(orderData: Partial<SalesOrder> & { customerName: string; items: SalesOrder['items'] }): SalesOrder {
  const orders = getSalesOrders();
  const models = getWalletModels();
  const customers = getCustomers();
  const settings = getSettings();
  const now = new Date().toISOString();

  // Pricing calculations
  const subtotal = orderData.items.reduce((acc, it) => acc + (it.unitPrice * it.quantity), 0);
  const discount = Number(orderData.discount) || 0;
  const shippingCharged = Number(orderData.shippingCharged) ?? settings.defaultShippingCharged;
  const shippingCostActual = Number(orderData.shippingCostActual) ?? settings.defaultShippingCostActual;
  const totalAmount = Math.max(0, subtotal - discount + shippingCharged);

  const amountPaid = Number(orderData.amountPaid) || 0;
  const outstandingBalance = Math.max(0, totalAmount - amountPaid);

  let paymentStatus: PaymentStatus = orderData.paymentStatus || 'unpaid';
  if (amountPaid >= totalAmount && totalAmount > 0) {
    paymentStatus = 'paid';
  } else if (amountPaid > 0 && amountPaid < totalAmount) {
    paymentStatus = 'partially_paid';
  } else if (amountPaid === 0 && paymentStatus !== 'refunded') {
    paymentStatus = 'unpaid';
  }

  let order: SalesOrder;

  if (orderData.id) {
    const index = orders.findIndex((o) => o.id === orderData.id);
    if (index >= 0) {
      order = {
        ...orders[index],
        ...orderData,
        subtotal,
        discount,
        shippingCharged,
        shippingCostActual,
        totalAmount,
        amountPaid,
        outstandingBalance,
        paymentStatus,
        updatedAt: now,
      } as SalesOrder;
      orders[index] = order;
    } else {
      order = {
        ...orderData,
        id: orderData.id,
        orderNumber: orderData.orderNumber || `ALT-${Date.now().toString().slice(-4)}`,
        orderDate: orderData.orderDate || now,
        channel: orderData.channel || 'direct_atelier',
        subtotal,
        discount,
        shippingCharged,
        shippingCostActual,
        totalAmount,
        amountPaid,
        outstandingBalance,
        paymentMethod: orderData.paymentMethod || 'cod',
        paymentStatus,
        orderStatus: orderData.orderStatus || 'new',
        stockDeducted: false,
        stockReserved: false,
        createdAt: now,
        updatedAt: now,
      } as SalesOrder;
      orders.unshift(order);
    }
  } else {
    order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber: `ALT-${Date.now().toString().slice(-4)}`,
      orderDate: orderData.orderDate || now,
      channel: orderData.channel || 'direct_atelier',
      subtotal,
      discount,
      shippingCharged,
      shippingCostActual,
      totalAmount,
      amountPaid,
      outstandingBalance,
      paymentMethod: orderData.paymentMethod || 'cod',
      paymentStatus,
      orderStatus: orderData.orderStatus || 'new',
      stockDeducted: false,
      stockReserved: false,
      createdAt: now,
      updatedAt: now,
    } as SalesOrder;
    orders.unshift(order);
  }

  // Stock management according to order status:
  manageOrderStockFulfillment(order, models, now);

  // Link or update customer history
  updateCustomerFromOrder(order, customers, now);

  memoryOrders = [...orders];
  setStored(STORAGE_KEYS.ORDERS, memoryOrders);
  notifyListeners();
  return order;
}

/**
 * Handles stock reservation and fulfillment without double deduction
 */
function manageOrderStockFulfillment(order: SalesOrder, models: WalletModel[], now: string) {
  const isReservedStatus = ['confirmed', 'in_production', 'ready_to_ship'].includes(order.orderStatus);
  const isFulfillmentStatus = ['shipped', 'delivered'].includes(order.orderStatus);
  const isCancelled = order.orderStatus === 'cancelled';

  // 1. If cancelled: release reservation or restock if previously deducted
  if (isCancelled) {
    if (order.stockDeducted) {
      // Put back stock
      order.items.forEach((it) => {
        const mod = models.find((m) => m.id === it.modelId);
        if (mod) {
          const prev = mod.finishedStock;
          const next = prev + it.quantity;
          saveWalletModel({ ...mod, finishedStock: next });
          addInventoryLog({
            date: now,
            type: 'stock_adjustment',
            referenceId: order.id,
            itemId: mod.id,
            itemName: mod.name,
            itemType: 'finished_goods',
            quantityChange: it.quantity,
            previousStock: prev,
            newStock: next,
            unit: 'unit',
            reason: `Annulation commande n° ${order.orderNumber} (Restockage)`,
          });
        }
      });
      order.stockDeducted = false;
    }
    if (order.stockReserved) {
      order.items.forEach((it) => {
        const mod = models.find((m) => m.id === it.modelId);
        if (mod) {
          saveWalletModel({ ...mod, reservedStock: Math.max(0, (mod.reservedStock || 0) - it.quantity) });
        }
      });
      order.stockReserved = false;
    }
    return;
  }

  // 2. If Shipped or Delivered: deduct inventory physically
  if (isFulfillmentStatus && !order.stockDeducted) {
    order.items.forEach((it) => {
      const mod = models.find((m) => m.id === it.modelId);
      if (mod) {
        const prev = mod.finishedStock;
        const next = Math.max(0, prev - it.quantity);
        const nextReserved = order.stockReserved ? Math.max(0, (mod.reservedStock || 0) - it.quantity) : (mod.reservedStock || 0);

        saveWalletModel({
          ...mod,
          finishedStock: next,
          reservedStock: nextReserved,
        });

        addInventoryLog({
          date: now,
          type: 'finished_goods_sold',
          referenceId: order.id,
          itemId: mod.id,
          itemName: mod.name,
          itemType: 'finished_goods',
          quantityChange: -it.quantity,
          previousStock: prev,
          newStock: next,
          unit: 'unit',
          reason: `Expédition / Livraison commande n° ${order.orderNumber}`,
        });
      }
    });
    order.stockDeducted = true;
    order.stockReserved = false;
    return;
  }

  // 3. If Confirmed / In Production: reserve stock if not already reserved and not yet deducted
  if (isReservedStatus && !order.stockReserved && !order.stockDeducted) {
    order.items.forEach((it) => {
      const mod = models.find((m) => m.id === it.modelId);
      if (mod) {
        saveWalletModel({
          ...mod,
          reservedStock: (mod.reservedStock || 0) + it.quantity,
        });
      }
    });
    order.stockReserved = true;
  }
}

/**
 * Syncs customer aggregated stats from orders
 */
function updateCustomerFromOrder(order: SalesOrder, customers: Customer[], now: string) {
  if (!order.customerPhone && !order.customerName) return;

  let cust = customers.find(
    (c) => (order.customerId && c.id === order.customerId) || (order.customerPhone && c.phone === order.customerPhone)
  );

  if (cust) {
    const allOrders = getSalesOrders();
    const custOrders = allOrders.filter((o) => o.customerPhone === cust!.phone || o.customerId === cust!.id);
    const totalSpent = custOrders.filter((o) => o.orderStatus !== 'cancelled').reduce((acc, o) => acc + (o.amountPaid || 0), 0);
    const balance = custOrders.filter((o) => o.orderStatus !== 'cancelled').reduce((acc, o) => acc + (o.outstandingBalance || 0), 0);

    saveCustomer({
      ...cust,
      totalOrders: custOrders.length,
      totalSpent,
      outstandingBalance: balance,
      city: order.customerCity || cust.city,
      address: order.customerAddress || cust.address,
      updatedAt: now,
    });
  } else if (order.customerName) {
    saveCustomer({
      name: order.customerName,
      phone: order.customerPhone || '',
      city: order.customerCity || 'Fès',
      country: 'Maroc',
      address: order.customerAddress || '',
      totalOrders: 1,
      totalSpent: order.amountPaid || 0,
      outstandingBalance: order.outstandingBalance || 0,
      createdAt: now,
    });
  }
}

export function updateOrderStatus(orderId: string, newStatus: OrderStatus): SalesOrder | null {
  const orders = getSalesOrders();
  const order = orders.find((o) => o.id === orderId);
  if (!order) return null;

  return saveSalesOrder({
    ...order,
    orderStatus: newStatus,
  });
}

/**
 * Handles Returns and Refunds with condition-based restocking
 * Damaged goods are NEVER restocked into active inventory.
 */
export function recordOrderReturn(data: {
  orderId: string;
  returnedQuantity: number;
  refundAmount: number;
  restockCondition: 'resellable' | 'damaged';
  reason: string;
  notes?: string;
}): SalesOrder | null {
  const orders = getSalesOrders();
  const models = getWalletModels();
  const order = orders.find((o) => o.id === data.orderId);
  if (!order) return null;

  const now = new Date().toISOString();

  // If resellable, restock into finished goods
  if (data.restockCondition === 'resellable') {
    order.items.forEach((it) => {
      const mod = models.find((m) => m.id === it.modelId);
      if (mod) {
        const prev = mod.finishedStock;
        const next = prev + data.returnedQuantity;
        saveWalletModel({ ...mod, finishedStock: next });

        addInventoryLog({
          date: now,
          type: 'return_restocked',
          referenceId: order.id,
          itemId: mod.id,
          itemName: mod.name,
          itemType: 'finished_goods',
          quantityChange: data.returnedQuantity,
          previousStock: prev,
          newStock: next,
          unit: 'unit',
          reason: `Retour réintégré en stock (Commande n° ${order.orderNumber}) - ${data.reason}`,
        });
      }
    });
  } else {
    // Damaged write-off log
    order.items.forEach((it) => {
      const mod = models.find((m) => m.id === it.modelId);
      if (mod) {
        addInventoryLog({
          date: now,
          type: 'damaged_writeoff',
          referenceId: order.id,
          itemId: mod.id,
          itemName: mod.name,
          itemType: 'finished_goods',
          quantityChange: 0,
          previousStock: mod.finishedStock,
          newStock: mod.finishedStock,
          unit: 'unit',
          reason: `Retour défectueux / endommagé rejeté du stock (Commande n° ${order.orderNumber}) - ${data.reason}`,
        });
      }
    });
  }

  // Update order status to returned
  const updated = saveSalesOrder({
    ...order,
    orderStatus: 'returned',
    paymentStatus: 'refunded',
    returnDetails: {
      returnDate: now,
      returnedQuantity: data.returnedQuantity,
      refundAmount: data.refundAmount,
      restockCondition: data.restockCondition,
      reason: data.reason,
      notes: data.notes,
    },
  });

  return updated;
}

export function deleteSalesOrder(id: string): boolean {
  const orders = getSalesOrders();
  const models = getWalletModels();
  const order = orders.find((o) => o.id === id);
  if (!order) return false;

  const now = new Date().toISOString();

  // If order was deducted, restore stock
  if (order.stockDeducted && order.orderStatus !== 'returned') {
    order.items.forEach((it) => {
      const mod = models.find((m) => m.id === it.modelId);
      if (mod) {
        saveWalletModel({ ...mod, finishedStock: mod.finishedStock + it.quantity });
      }
    });
  } else if (order.stockReserved) {
    order.items.forEach((it) => {
      const mod = models.find((m) => m.id === it.modelId);
      if (mod) {
        saveWalletModel({ ...mod, reservedStock: Math.max(0, (mod.reservedStock || 0) - it.quantity) });
      }
    });
  }

  memoryOrders = orders.filter((o) => o.id !== id);
  setStored(STORAGE_KEYS.ORDERS, memoryOrders);
  notifyListeners();
  return true;
}

export function deleteProductionBatch(id: string): boolean {
  const batches = getProductionBatches();
  memoryBatches = batches.filter((b) => b.id !== id);
  setStored(STORAGE_KEYS.BATCHES, memoryBatches);
  notifyListeners();
  return true;
}

// -------------------------------------------------------------
// EXPENSE MANAGEMENT
// -------------------------------------------------------------
export function getExpenses(): Expense[] {
  if (isBrowser()) {
    memoryExpenses = getStored(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
  }
  return memoryExpenses;
}

export function saveExpense(expenseData: Partial<Expense> & { description: string; amount: number }): Expense {
  const expenses = getExpenses();
  const now = new Date().toISOString();

  let expense: Expense;

  if (expenseData.id) {
    const index = expenses.findIndex((e) => e.id === expenseData.id);
    if (index >= 0) {
      expense = {
        ...expenses[index],
        ...expenseData,
        amount: Number(expenseData.amount) || 0,
      } as Expense;
      expenses[index] = expense;
    } else {
      expense = {
        ...expenseData,
        id: expenseData.id,
        date: expenseData.date || now.slice(0, 10),
        category: expenseData.category || 'other_operating_expenses',
        amount: Number(expenseData.amount) || 0,
        paymentMethod: expenseData.paymentMethod || 'cash',
        supplierRecipient: expenseData.supplierRecipient || 'Divers',
        createdAt: now,
      } as Expense;
      expenses.unshift(expense);
    }
  } else {
    expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      date: expenseData.date || now.slice(0, 10),
      category: expenseData.category || 'other_operating_expenses',
      amount: Number(expenseData.amount) || 0,
      paymentMethod: expenseData.paymentMethod || 'cash',
      supplierRecipient: expenseData.supplierRecipient || 'Divers',
      createdAt: now,
    } as Expense;
    expenses.unshift(expense);
  }

  memoryExpenses = [...expenses];
  setStored(STORAGE_KEYS.EXPENSES, memoryExpenses);
  notifyListeners();
  return expense;
}

export function deleteExpense(id: string): boolean {
  const expenses = getExpenses();
  memoryExpenses = expenses.filter((e) => e.id !== id);
  setStored(STORAGE_KEYS.EXPENSES, memoryExpenses);
  notifyListeners();
  return true;
}

// -------------------------------------------------------------
// CUSTOMERS & SUPPLIERS
// -------------------------------------------------------------
export function getCustomers(): Customer[] {
  if (isBrowser()) {
    memoryCustomers = getStored(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  }
  return memoryCustomers;
}

export function saveCustomer(customerData: Partial<Customer> & { name: string }): Customer {
  const customers = getCustomers();
  const now = new Date().toISOString();

  let customer: Customer;

  if (customerData.id) {
    const index = customers.findIndex((c) => c.id === customerData.id);
    if (index >= 0) {
      customer = {
        ...customers[index],
        ...customerData,
        updatedAt: now,
      } as Customer;
      customers[index] = customer;
    } else {
      customer = {
        ...customerData,
        id: customerData.id,
        phone: customerData.phone || '',
        city: customerData.city || 'Fès',
        country: customerData.country || 'Maroc',
        totalOrders: Number(customerData.totalOrders) || 0,
        totalSpent: Number(customerData.totalSpent) || 0,
        outstandingBalance: Number(customerData.outstandingBalance) || 0,
        createdAt: now,
        updatedAt: now,
      } as Customer;
      customers.push(customer);
    }
  } else {
    customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      phone: customerData.phone || '',
      city: customerData.city || 'Fès',
      country: customerData.country || 'Maroc',
      totalOrders: Number(customerData.totalOrders) || 0,
      totalSpent: Number(customerData.totalSpent) || 0,
      outstandingBalance: Number(customerData.outstandingBalance) || 0,
      createdAt: now,
      updatedAt: now,
    } as Customer;
    customers.push(customer);
  }

  memoryCustomers = [...customers];
  setStored(STORAGE_KEYS.CUSTOMERS, memoryCustomers);
  notifyListeners();
  return customer;
}

export function deleteCustomer(id: string): boolean {
  const customers = getCustomers();
  memoryCustomers = customers.filter((c) => c.id !== id);
  setStored(STORAGE_KEYS.CUSTOMERS, memoryCustomers);
  notifyListeners();
  return true;
}

export function getSuppliers(): Supplier[] {
  if (isBrowser()) {
    memorySuppliers = getStored(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
  }
  return memorySuppliers;
}

export function saveSupplier(supplierData: Partial<Supplier> & { name: string }): Supplier {
  const suppliers = getSuppliers();
  const now = new Date().toISOString();

  let supplier: Supplier;

  if (supplierData.id) {
    const index = suppliers.findIndex((s) => s.id === supplierData.id);
    if (index >= 0) {
      supplier = {
        ...suppliers[index],
        ...supplierData,
      } as Supplier;
      suppliers[index] = supplier;
    } else {
      supplier = {
        ...supplierData,
        id: supplierData.id,
        materialsSupplied: supplierData.materialsSupplied || [],
        totalPurchased: Number(supplierData.totalPurchased) || 0,
        outstandingBalance: Number(supplierData.outstandingBalance) || 0,
        createdAt: now,
      } as Supplier;
      suppliers.push(supplier);
    }
  } else {
    supplier = {
      ...supplierData,
      id: `sup-${Date.now()}`,
      materialsSupplied: supplierData.materialsSupplied || [],
      totalPurchased: Number(supplierData.totalPurchased) || 0,
      outstandingBalance: Number(supplierData.outstandingBalance) || 0,
      createdAt: now,
    } as Supplier;
    suppliers.push(supplier);
  }

  memorySuppliers = [...suppliers];
  setStored(STORAGE_KEYS.SUPPLIERS, memorySuppliers);
  notifyListeners();
  return supplier;
}

export function deleteSupplier(id: string): boolean {
  const suppliers = getSuppliers();
  memorySuppliers = suppliers.filter((s) => s.id !== id);
  setStored(STORAGE_KEYS.SUPPLIERS, memorySuppliers);
  notifyListeners();
  return true;
}

// -------------------------------------------------------------
// INVENTORY AUDIT LOGS & ADJUSTMENTS
// -------------------------------------------------------------
export function getInventoryLogs(): InventoryLogEntry[] {
  if (isBrowser()) {
    memoryLogs = getStored(STORAGE_KEYS.LOGS, INITIAL_INVENTORY_LOGS);
  }
  return memoryLogs;
}

export function addInventoryLog(entry: Omit<InventoryLogEntry, 'id'>): InventoryLogEntry {
  const logs = getInventoryLogs();
  const newEntry: InventoryLogEntry = {
    ...entry,
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
  };

  logs.unshift(newEntry);
  memoryLogs = [...logs];
  setStored(STORAGE_KEYS.LOGS, memoryLogs);
  return newEntry;
}

/**
 * Manual quick stock adjustment for finished goods or raw materials
 */
export function adjustStock(params: {
  itemId: string;
  itemType: 'finished_goods' | 'raw_material';
  quantityChange: number; // positive or negative
  reason: string;
  performedBy?: string;
}): boolean {
  const { itemId, itemType, quantityChange, reason, performedBy } = params;
  const now = new Date().toISOString();

  if (itemType === 'finished_goods') {
    const models = getWalletModels();
    const model = models.find((m) => m.id === itemId);
    if (!model) return false;

    const prev = model.finishedStock;
    const next = Math.max(0, prev + quantityChange);
    saveWalletModel({ ...model, finishedStock: next });

    addInventoryLog({
      date: now,
      type: 'stock_adjustment',
      itemId: model.id,
      itemName: model.name,
      itemType: 'finished_goods',
      quantityChange,
      previousStock: prev,
      newStock: next,
      unit: 'unit',
      reason: reason || 'Ajustement manuel de stock',
      performedBy: performedBy || 'Artisan',
    });
    return true;
  } else {
    const materials = getRawMaterials();
    const material = materials.find((m) => m.id === itemId);
    if (!material) return false;

    const prev = material.currentStock;
    const next = Math.max(0, Math.round((prev + quantityChange) * 100) / 100);
    saveRawMaterial({ ...material, currentStock: next });

    addInventoryLog({
      date: now,
      type: 'stock_adjustment',
      itemId: material.id,
      itemName: material.name,
      itemType: 'raw_material',
      quantityChange,
      previousStock: prev,
      newStock: next,
      unit: material.unit,
      reason: reason || 'Ajustement manuel matière',
      performedBy: performedBy || 'Artisan',
    });
    return true;
  }
}

// -------------------------------------------------------------
// BACKUP, RESTORE & DATA MANAGEMENT
// -------------------------------------------------------------
export function exportDatabaseJson(): string {
  const backup = {
    version: '3.0.0',
    exportedAt: new Date().toISOString(),
    settings: getSettings(),
    walletModels: getWalletModels(),
    rawMaterials: getRawMaterials(),
    materialPurchases: getMaterialPurchases(),
    productionBatches: getProductionBatches(),
    salesOrders: getSalesOrders(),
    expenses: getExpenses(),
    customers: getCustomers(),
    suppliers: getSuppliers(),
    inventoryLogs: getInventoryLogs(),
  };
  return JSON.stringify(backup, null, 2);
}

export function importDatabaseJson(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (!data.walletModels && !data.salesOrders) {
      throw new Error('Format de sauvegarde invalide.');
    }

    if (data.settings) setStored(STORAGE_KEYS.SETTINGS, data.settings);
    if (data.walletModels) setStored(STORAGE_KEYS.MODELS, data.walletModels);
    if (data.rawMaterials) setStored(STORAGE_KEYS.MATERIALS, data.rawMaterials);
    if (data.materialPurchases) setStored(STORAGE_KEYS.PURCHASES, data.materialPurchases);
    if (data.productionBatches) setStored(STORAGE_KEYS.BATCHES, data.productionBatches);
    if (data.salesOrders) setStored(STORAGE_KEYS.ORDERS, data.salesOrders);
    if (data.expenses) setStored(STORAGE_KEYS.EXPENSES, data.expenses);
    if (data.customers) setStored(STORAGE_KEYS.CUSTOMERS, data.customers);
    if (data.suppliers) setStored(STORAGE_KEYS.SUPPLIERS, data.suppliers);
    if (data.inventoryLogs) setStored(STORAGE_KEYS.LOGS, data.inventoryLogs);

    // Refresh memory cache
    memorySettings = getStored(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    memoryModels = getStored(STORAGE_KEYS.MODELS, INITIAL_WALLET_MODELS);
    memoryMaterials = getStored(STORAGE_KEYS.MATERIALS, INITIAL_RAW_MATERIALS);
    memoryPurchases = getStored(STORAGE_KEYS.PURCHASES, INITIAL_PURCHASES);
    memoryBatches = getStored(STORAGE_KEYS.BATCHES, INITIAL_PRODUCTION_BATCHES);
    memoryOrders = getStored(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    memoryExpenses = getStored(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    memoryCustomers = getStored(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    memorySuppliers = getStored(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
    memoryLogs = getStored(STORAGE_KEYS.LOGS, INITIAL_INVENTORY_LOGS);

    notifyListeners();
    return true;
  } catch (e) {
    console.error('Import failed:', e);
    return false;
  }
}

export function resetToDemoData(): void {
  setStored(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  setStored(STORAGE_KEYS.MODELS, INITIAL_WALLET_MODELS);
  setStored(STORAGE_KEYS.MATERIALS, INITIAL_RAW_MATERIALS);
  setStored(STORAGE_KEYS.PURCHASES, INITIAL_PURCHASES);
  setStored(STORAGE_KEYS.BATCHES, INITIAL_PRODUCTION_BATCHES);
  setStored(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  setStored(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
  setStored(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  setStored(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
  setStored(STORAGE_KEYS.LOGS, INITIAL_INVENTORY_LOGS);

  memorySettings = { ...INITIAL_SETTINGS };
  memoryModels = [...INITIAL_WALLET_MODELS];
  memoryMaterials = [...INITIAL_RAW_MATERIALS];
  memoryPurchases = [...INITIAL_PURCHASES];
  memoryBatches = [...INITIAL_PRODUCTION_BATCHES];
  memoryOrders = [...INITIAL_ORDERS];
  memoryExpenses = [...INITIAL_EXPENSES];
  memoryCustomers = [...INITIAL_CUSTOMERS];
  memorySuppliers = [...INITIAL_SUPPLIERS];
  memoryLogs = [...INITIAL_INVENTORY_LOGS];

  notifyListeners();
}

export function clearAllData(): void {
  const emptySettings: BusinessSettings = {
    ...INITIAL_SETTINGS,
    businessName: 'ALTAJLEATHER',
  };

  setStored(STORAGE_KEYS.SETTINGS, emptySettings);
  setStored(STORAGE_KEYS.MODELS, []);
  setStored(STORAGE_KEYS.MATERIALS, []);
  setStored(STORAGE_KEYS.PURCHASES, []);
  setStored(STORAGE_KEYS.BATCHES, []);
  setStored(STORAGE_KEYS.ORDERS, []);
  setStored(STORAGE_KEYS.EXPENSES, []);
  setStored(STORAGE_KEYS.CUSTOMERS, []);
  setStored(STORAGE_KEYS.SUPPLIERS, []);
  setStored(STORAGE_KEYS.LOGS, []);

  memorySettings = emptySettings;
  memoryModels = [];
  memoryMaterials = [];
  memoryPurchases = [];
  memoryBatches = [];
  memoryOrders = [];
  memoryExpenses = [];
  memoryCustomers = [];
  memorySuppliers = [];
  memoryLogs = [];

  notifyListeners();
}
