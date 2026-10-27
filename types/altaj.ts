export type WalletType =
  | 'bifold'
  | 'cardholder'
  | 'minimalist'
  | 'long'
  | 'passport'
  | 'custom';

export type ProductStatus = 'active' | 'discontinued' | 'archived';

export interface BomItem {
  materialId: string;
  materialName: string;
  unit: string;
  quantityRequired: number; // e.g. 0.8 sq ft, 2.5 meters, 1 piece
  estimatedUnitCost: number;
  totalCost: number;
  notes?: string;
}

export interface WalletModel {
  id: string;
  name: string;
  sku: string;
  photoUrl: string;
  description: string;
  walletType: WalletType;
  leatherType: string; // e.g., Full-Grain Vegetable Tanned Cowhide
  leatherColor: string; // e.g., Cognac, Espresso, Saddle Tan, Forest Green
  threadColor: string; // e.g., Cream, Amber, Olive, Dark Brown
  hardware: string; // e.g., Solid Brass Snap, YKK Brass Zipper #3, None
  dimensions: string; // e.g., 11.5 x 9.0 x 1.2 cm
  productionTimeMinutes: number; // e.g. 120 minutes (2 hours)
  
  // Recipe / Bill of Materials
  recipe: BomItem[];
  leatherWastePercent: number; // e.g. 15% estimated scrap allowance
  
  // Unit Cost Breakdown
  leatherCost: number;
  threadCost: number;
  hardwareCost: number;
  packagingCost: number;
  directLaborCost: number; // based on productionTimeMinutes * hourlyLaborRate
  otherProductionCosts: number; // e.g., edge paint, beeswax, glue, needles wear
  unitProductionCost: number; // Total cost to make 1 unit
  
  // Pricing & Margins
  sellingPrice: number;
  grossProfitPerUnit: number; // sellingPrice - unitProductionCost
  grossProfitMarginPercent: number; // (grossProfit / sellingPrice) * 100
  
  // Inventory
  finishedStock: number; // Physically available finished wallets
  reservedStock: number; // Reserved for confirmed/in-progress orders
  minStockThreshold: number; // Low stock alert threshold
  
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export type MaterialCategory =
  | 'leather'
  | 'thread'
  | 'hardware'
  | 'lining'
  | 'edge_paint'
  | 'packaging'
  | 'consumable'
  | 'other';

export type MaterialUnit =
  | 'sq_ft'
  | 'sq_m'
  | 'sq_dm'
  | 'sq_cm'
  | 'meter'
  | 'cm'
  | 'piece'
  | 'gram'
  | 'ml'
  | 'unit';

export interface RawMaterial {
  id: string;
  name: string;
  category: MaterialCategory;
  supplierId?: string;
  supplierName: string;
  unit: MaterialUnit;
  quantityPurchased: number;
  quantityConsumed: number;
  currentStock: number;
  minStockThreshold: number;
  unitCost: number; // Average purchase cost per unit
  totalValue: number; // currentStock * unitCost
  
  // Leather-specific area tracking
  isLeather?: boolean;
  leatherDetails?: {
    hideType: string; // Cowhide, Calfskin, Goat, Horse
    tannage: string; // Vegetable tanned, Chrome, Waxed pull-up
    purchasedArea: number; // in sq ft or sq dm
    usableArea: number; // after trimming natural flaws/bellies
    estimatedWastePercent: number;
    color: string;
    thicknessOz?: string; // 3-4 oz, 4-5 oz
  };
  
  purchaseDate: string;
  wasteScrapsLogged: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialPurchase {
  id: string;
  purchaseNumber: string;
  materialId: string;
  materialName: string;
  supplierId?: string;
  supplierName: string;
  quantity: number;
  unit: MaterialUnit;
  unitCost: number;
  totalCost: number;
  purchaseDate: string;
  paymentStatus: 'paid' | 'pending';
  paymentMethod: string;
  isCapitalEquipment?: boolean; // If equipment/tool rather than consumable inventory
  notes?: string;
  createdAt: string;
}

export type ProductionStatus = 'draft' | 'in_progress' | 'completed' | 'cancelled';

export interface ProductionConsumedMaterial {
  materialId: string;
  materialName: string;
  quantityConsumed: number;
  unit: MaterialUnit;
  unitCost: number;
  totalCost: number;
}

export interface ProductionBatch {
  id: string;
  batchNumber: string;
  modelId: string;
  modelName: string;
  sku: string;
  quantityPlanned: number;
  quantityCompleted: number;
  quantityDefects: number; // Flawed/scrapped units
  status: ProductionStatus;
  
  materialsConsumed: ProductionConsumedMaterial[];
  actualMaterialCost: number;
  laborTimeHours: number;
  laborRatePerHour: number;
  actualLaborCost: number;
  additionalCost: number;
  totalBatchCost: number;
  unitCostCalculated: number; // totalBatchCost / quantityCompleted
  
  startDate: string;
  completedDate?: string;
  performedBy: string; // Artisan / Craftsman name
  materialsDeducted: boolean; // Prevents duplicate stock deductions
  finishedStockAdded: boolean; // Prevents duplicate finished stock additions
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'new'
  | 'confirmed'
  | 'in_production'
  | 'ready_to_ship'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type PaymentStatus = 'unpaid' | 'partially_paid' | 'paid' | 'refunded';

export type PaymentMethod =
  | 'cash'
  | 'bank_transfer'
  | 'card'
  | 'cod'
  | 'custom';

export type SalesChannel =
  | 'direct_atelier'
  | 'whatsapp'
  | 'instagram'
  | 'website'
  | 'boutique_partner'
  | 'other';

export interface OrderLineItem {
  modelId: string;
  modelName: string;
  sku: string;
  photoUrl?: string;
  quantity: number;
  unitPrice: number;
  unitCost: number; // COGS reference
  totalPrice: number;
  totalCost: number;
}

export interface ReturnRecord {
  returnDate: string;
  returnedQuantity: number;
  refundAmount: number;
  restockCondition: 'resellable' | 'damaged'; // Damaged is NEVER put back in active inventory
  reason: string;
  notes?: string;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  orderDate: string;
  channel: SalesChannel;
  
  // Customer details
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  customerAddress?: string;
  
  // Items
  items: OrderLineItem[];
  
  // Pricing & Totals
  subtotal: number;
  discount: number;
  shippingCharged: number; // Charged to customer (e.g. 0 DH free shipping or 25 DH)
  shippingCostActual: number; // Cost paid by ALTAJLEATHER to courier (e.g. 35 DH)
  totalAmount: number; // subtotal - discount + shippingCharged
  
  // Payments
  amountPaid: number;
  outstandingBalance: number; // totalAmount - amountPaid
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  
  // Fulfillment & Status
  orderStatus: OrderStatus;
  stockDeducted: boolean; // Deducted on dispatch/delivery
  stockReserved: boolean; // Reserved on confirmed/in_production
  trackingNumber?: string; // Carrier tracking number (Amana, Cathedis, Ozone, etc.)
  carrierName?: string; // Delivery company name
  
  returnDetails?: ReturnRecord;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCategory =
  | 'leather_and_raw_materials'
  | 'tools_and_equipment'
  | 'repairs_and_maintenance'
  | 'packaging'
  | 'shipping_and_delivery'
  | 'advertising'
  | 'marketplace_commissions'
  | 'payment_processing_fees'
  | 'rent_and_utilities'
  | 'software_subscriptions'
  | 'other_operating_expenses';

export interface Expense {
  id: string;
  date: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  paymentMethod: string;
  supplierRecipient: string;
  receiptRef?: string;
  isRecurring?: boolean;
  isCapitalAsset?: boolean; // Equipment capitalized vs expensed
  notes?: string;
  linkedMaterialPurchaseId?: string; // If linked to an inventory acquisition
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city: string;
  country: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
  outstandingBalance: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  city: string;
  materialsSupplied: string[];
  totalPurchased: number;
  outstandingBalance: number;
  notes?: string;
  createdAt: string;
}

export type MovementType =
  | 'raw_material_in'
  | 'raw_material_consumed'
  | 'finished_goods_produced'
  | 'finished_goods_sold'
  | 'finished_goods_reserved'
  | 'finished_goods_unreserved'
  | 'stock_adjustment'
  | 'return_restocked'
  | 'damaged_writeoff';

export interface InventoryLogEntry {
  id: string;
  date: string;
  type: MovementType;
  referenceId?: string; // Order ID, Batch ID, Purchase ID
  itemId: string;
  itemName: string;
  itemType: 'raw_material' | 'finished_goods';
  quantityChange: number;
  previousStock: number;
  newStock: number;
  unit?: string;
  reason: string;
  performedBy?: string;
}

export interface BusinessSettings {
  businessName: string;
  tagline: string;
  currency: string;
  currencySymbol: string;
  defaultLaborRatePerHour: number; // in DH / hour
  defaultTaxRatePercent: number; // e.g. 0% for artisan or 10%/20%
  defaultShippingCostActual: number; // e.g. 35 DH
  defaultShippingCharged: number; // e.g. 25 DH
  defaultShippingDescription?: string; // e.g. "Average courier fee (Morocco)"
  defaultPackagingCost?: number; // e.g. 15 DH
  defaultPackagingDescription?: string; // e.g. "Rigid box + dust bag"
  defaultSalesFeePercent: number; // e.g. 5%
  lowStockThresholdDefault: number;
  inventoryValuationMethod: 'weighted_average' | 'fifo';
  revenueRecognitionRule: 'on_delivery' | 'on_shipped_or_delivered' | 'on_confirmation';
  salesChannels: string[];
  paymentMethods: string[];
  ownerName: string;
  phone: string;
  city: string;
  atelierAddress: string;
}

export type DateRangePreset =
  | 'today'
  | 'last_7_days'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'all_time'
  | 'custom';

export interface DateRangeFilter {
  preset: DateRangePreset;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export interface PricingCalculatorInputs {
  leatherAreaRequired: number; // area in chosen unit
  leatherUnit: MaterialUnit;
  leatherPurchasePricePerUnit: number;
  leatherWastePercent: number; // e.g. 15%
  threadCost: number;
  hardwareCost: number;
  edgeFinishingCost: number;
  packagingCost: number;
  productionTimeMinutes: number;
  hourlyLaborRate: number;
  otherDirectCosts: number;
  variableSellingFeePercent: number; // e.g. 5%
  shippingSubsidy: number; // e.g. 15 DH (actual shipping - customer charge)
  targetProfitMarginPercent: number; // e.g. 45%
  desiredSellingPrice?: number;
}

export interface PricingCalculatorOutputs {
  totalMaterialCost: number;
  directLaborCost: number;
  totalProductionCost: number;
  shippingSubsidy: number;
  fixedUnitCost: number; // totalProductionCost + shippingSubsidy
  suggestedSellingPrice: number;
  sellingFeeAtSuggestedPrice: number;
  grossProfitAtSuggested: number;
  grossMarginAtSuggestedPercent: number;
  netMarginEstimatePercent: number;
  isMarginFeasible: boolean;
  errorMessage?: string;
  // If desired price is provided
  desiredPriceAnalysis?: {
    sellingPrice: number;
    sellingFee: number;
    grossProfit: number;
    grossMarginPercent: number;
    contributionProfit: number;
    netMarginPercent: number;
    isProfitable: boolean;
  };
}
