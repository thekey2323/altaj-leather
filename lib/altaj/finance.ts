import {
  WalletModel,
  RawMaterial,
  SalesOrder,
  Expense,
  MaterialPurchase,
  ProductionBatch,
  BusinessSettings,
  DateRangeFilter,
} from '@/types/altaj';

export interface FinancialSummary {
  // Financial KPIs
  totalRevenue: number; // Recognized sales
  grossRevenue: number; // Before discounts
  totalDiscounts: number;
  totalRefunds: number;
  costOfGoodsSold: number; // COGS of sold units
  grossProfit: number; // Revenue - COGS
  grossProfitMargin: number; // (grossProfit / revenue) * 100
  operatingExpenses: number; // Overhead & operations
  netOperatingProfit: number; // grossProfit - operatingExpenses
  estimatedTaxes: number;
  netProfit: number; // netOperatingProfit - taxes
  netProfitMargin: number; // (netProfit / revenue) * 100
  averageOrderValue: number; // revenue / eligible order count
  orderCount: number;
  unitsSold: number;

  // Comparison with previous equivalent period
  previousPeriod?: {
    totalRevenue: number;
    netProfit: number;
    costOfGoodsSold: number;
    operatingExpenses: number;
    unitsSold: number;
    orderCount: number;
    revenueGrowthPercent?: number;
    profitGrowthPercent?: number;
  };

  // Cash Flow Breakdown
  cashFlow: {
    cashInflow: number; // Actual cash collected from customers
    cashOutflowPurchases: number; // Cash spent buying raw materials/equipment
    cashOutflowExpenses: number; // Cash spent on overhead/operations
    cashOutflowRefunds: number; // Cash returned to customers
    totalCashOutflow: number;
    netCashFlow: number; // cashInflow - totalCashOutflow
  };

  // Business & Inventory KPIs
  totalWalletModelsCount: number;
  currentFinishedWalletStock: number;
  rawMaterialsInventoryValue: number;
  finishedGoodsInventoryValue: number;
  totalInventoryValue: number;
  lowStockProductsCount: number;
  lowStockMaterialsCount: number;
  pendingOrdersCount: number;
}

export function isDateInRange(dateStr: string, startDate: string, endDate: string): boolean {
  if (!dateStr) return false;
  const d = dateStr.slice(0, 10);
  return d >= startDate && d <= endDate;
}

export function getDateRangeBounds(filter: DateRangeFilter, referenceDate = new Date()): { start: string; end: string; prevStart: string; prevEnd: string } {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const formatYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const today = new Date(referenceDate);
  const y = today.getFullYear();
  const m = today.getMonth();
  const day = today.getDate();

  let start = '';
  let end = '';
  let prevStart = '';
  let prevEnd = '';

  switch (filter.preset) {
    case 'today': {
      start = formatYMD(today);
      end = formatYMD(today);
      const yest = new Date(today);
      yest.setDate(day - 1);
      prevStart = formatYMD(yest);
      prevEnd = formatYMD(yest);
      break;
    }
    case 'last_7_days': {
      end = formatYMD(today);
      const s7 = new Date(today);
      s7.setDate(day - 6);
      start = formatYMD(s7);

      const pEnd = new Date(s7);
      pEnd.setDate(pEnd.getDate() - 1);
      const pStart = new Date(pEnd);
      pStart.setDate(pEnd.getDate() - 6);
      prevStart = formatYMD(pStart);
      prevEnd = formatYMD(pEnd);
      break;
    }
    case 'this_month': {
      const sMonth = new Date(y, m, 1);
      const eMonth = new Date(y, m + 1, 0);
      start = formatYMD(sMonth);
      end = formatYMD(eMonth);

      const sPrevM = new Date(y, m - 1, 1);
      const ePrevM = new Date(y, m, 0);
      prevStart = formatYMD(sPrevM);
      prevEnd = formatYMD(ePrevM);
      break;
    }
    case 'last_month': {
      const sPrevM = new Date(y, m - 1, 1);
      const ePrevM = new Date(y, m, 0);
      start = formatYMD(sPrevM);
      end = formatYMD(ePrevM);

      const sPrev2M = new Date(y, m - 2, 1);
      const ePrev2M = new Date(y, m - 1, 0);
      prevStart = formatYMD(sPrev2M);
      prevEnd = formatYMD(ePrev2M);
      break;
    }
    case 'this_year': {
      start = `${y}-01-01`;
      end = `${y}-12-31`;
      prevStart = `${y - 1}-01-01`;
      prevEnd = `${y - 1}-12-31`;
      break;
    }
    case 'all_time': {
      start = '2020-01-01';
      end = '2099-12-31';
      prevStart = '2010-01-01';
      prevEnd = '2019-12-31';
      break;
    }
    case 'custom':
    default: {
      start = filter.startDate || '2020-01-01';
      end = filter.endDate || formatYMD(today);
      // Equal length prior period
      const sDate = new Date(start);
      const eDate = new Date(end);
      const diffMs = eDate.getTime() - sDate.getTime();
      const pEnd = new Date(sDate.getTime() - 86400000);
      const pStart = new Date(pEnd.getTime() - diffMs);
      prevStart = formatYMD(pStart);
      prevEnd = formatYMD(pEnd);
      break;
    }
  }

  return { start, end, prevStart, prevEnd };
}

/**
 * Computes exact financial metrics for a period.
 * Strictly avoids double counting material purchases as both COGS and operating expenses.
 */
export function calculateFinancialSummary(params: {
  models: WalletModel[];
  materials: RawMaterial[];
  orders: SalesOrder[];
  expenses: Expense[];
  purchases: MaterialPurchase[];
  settings: BusinessSettings;
  dateFilter: DateRangeFilter;
}): FinancialSummary {
  const { models, materials, orders, expenses, purchases, settings, dateFilter } = params;
  const { start, end, prevStart, prevEnd } = getDateRangeBounds(dateFilter);

  // Revenue recognition rule helper
  const isOrderRecognized = (order: SalesOrder) => {
    if (order.orderStatus === 'cancelled') return false;
    if (settings.revenueRecognitionRule === 'on_confirmation') {
      return ['confirmed', 'in_production', 'ready_to_ship', 'shipped', 'delivered', 'returned'].includes(order.orderStatus);
    }
    if (settings.revenueRecognitionRule === 'on_shipped_or_delivered') {
      return ['shipped', 'delivered', 'returned'].includes(order.orderStatus);
    }
    // default: on_delivery or shipped/delivered
    return ['shipped', 'delivered', 'returned'].includes(order.orderStatus);
  };

  // Helper for period aggregation
  const computePeriodMetrics = (pStart: string, pEnd: string) => {
    let grossRev = 0;
    let totalDisc = 0;
    let cogs = 0;
    let refunds = 0;
    let units = 0;
    let recognizedOrderCount = 0;
    let cashInflow = 0;

    orders.forEach((o) => {
      // Cash inflow: payments made in this period
      const orderDate = o.orderDate.slice(0, 10);
      if (orderDate >= pStart && orderDate <= pEnd) {
        if (o.orderStatus !== 'cancelled') {
          cashInflow += o.amountPaid || 0;
        }
      }

      // Revenue & COGS recognition
      if (isOrderRecognized(o) && orderDate >= pStart && orderDate <= pEnd) {
        recognizedOrderCount += 1;
        grossRev += o.subtotal + (o.shippingCharged || 0);
        totalDisc += o.discount || 0;

        // COGS is calculated from current wallet model costs (or fallback to item unit cost)
        o.items.forEach((item) => {
          const mod = models.find(
            (m) =>
              m.id === item.modelId ||
              (item.sku && m.sku?.toLowerCase().trim() === item.sku?.toLowerCase().trim()) ||
              (item.modelName && m.name?.toLowerCase().trim() === item.modelName?.toLowerCase().trim())
          );
          const unitCost = mod ? mod.unitProductionCost : (item.unitCost || 0);
          cogs += unitCost * (item.quantity || 0);
          units += item.quantity || 0;
        });

        // Account for returns/refunds if returned
        if (o.orderStatus === 'returned' && o.returnDetails) {
          refunds += o.returnDetails.refundAmount || 0;
        }
      }
    });

    const netRev = Math.max(0, grossRev - totalDisc - refunds);
    const grossP = netRev - cogs;
    const grossM = netRev > 0 ? (grossP / netRev) * 100 : 0;

    // Operating expenses in this period
    // Filter out expenses that are raw material purchases to avoid double counting!
    let opExpenses = 0;
    let cashOutflowExpenses = 0;

    expenses.forEach((e) => {
      const eDate = e.date.slice(0, 10);
      if (eDate >= pStart && eDate <= pEnd) {
        cashOutflowExpenses += e.amount || 0;
        // Operating expense excludes capitalized equipment and material purchases tracked in COGS
        if (e.category !== 'leather_and_raw_materials' && !e.isCapitalAsset) {
          opExpenses += e.amount || 0;
        }
      }
    });

    // Material purchases cash outflow in this period
    let cashOutflowPurchases = 0;
    purchases.forEach((p) => {
      const pDate = p.purchaseDate.slice(0, 10);
      if (pDate >= pStart && pDate <= pEnd) {
        if (p.paymentStatus === 'paid') {
          cashOutflowPurchases += p.totalCost || 0;
        }
      }
    });

    const netOperatingP = grossP - opExpenses;
    const taxRate = settings.defaultTaxRatePercent || 0;
    const taxes = netOperatingP > 0 ? (netOperatingP * taxRate) / 100 : 0;
    const netP = netOperatingP - taxes;
    const netM = netRev > 0 ? (netP / netRev) * 100 : 0;
    const aov = recognizedOrderCount > 0 ? netRev / recognizedOrderCount : 0;

    const totalCashOut = cashOutflowPurchases + cashOutflowExpenses + refunds;
    const netCash = cashInflow - totalCashOut;

    return {
      grossRevenue: Math.round(grossRev * 10) / 10,
      totalDiscounts: Math.round(totalDisc * 10) / 10,
      totalRefunds: Math.round(refunds * 10) / 10,
      totalRevenue: Math.round(netRev * 10) / 10,
      costOfGoodsSold: Math.round(cogs * 10) / 10,
      grossProfit: Math.round(grossP * 10) / 10,
      grossProfitMargin: Math.round(grossM * 10) / 10,
      operatingExpenses: Math.round(opExpenses * 10) / 10,
      netOperatingProfit: Math.round(netOperatingP * 10) / 10,
      estimatedTaxes: Math.round(taxes * 10) / 10,
      netProfit: Math.round(netP * 10) / 10,
      netProfitMargin: Math.round(netM * 10) / 10,
      averageOrderValue: Math.round(aov * 10) / 10,
      orderCount: recognizedOrderCount,
      unitsSold: units,
      cashFlow: {
        cashInflow: Math.round(cashInflow * 10) / 10,
        cashOutflowPurchases: Math.round(cashOutflowPurchases * 10) / 10,
        cashOutflowExpenses: Math.round(cashOutflowExpenses * 10) / 10,
        cashOutflowRefunds: Math.round(refunds * 10) / 10,
        totalCashOutflow: Math.round(totalCashOut * 10) / 10,
        netCashFlow: Math.round(netCash * 10) / 10,
      },
    };
  };

  const current = computePeriodMetrics(start, end);
  const previous = computePeriodMetrics(prevStart, prevEnd);

  // Growth rates only if meaningful previous data exists (> 0)
  let revGrowth: number | undefined;
  let profitGrowth: number | undefined;
  if (previous.totalRevenue > 0) {
    revGrowth = Math.round(((current.totalRevenue - previous.totalRevenue) / previous.totalRevenue) * 1000) / 10;
  }
  if (Math.abs(previous.netProfit) > 0) {
    profitGrowth = Math.round(((current.netProfit - previous.netProfit) / Math.abs(previous.netProfit)) * 1000) / 10;
  }

  // Inventory valuation & counts
  let totalFinishedStock = 0;
  let finishedGoodsVal = 0;
  let lowStockProducts = 0;

  models.forEach((m) => {
    totalFinishedStock += m.finishedStock || 0;
    finishedGoodsVal += (m.finishedStock || 0) * (m.unitProductionCost || 0);
    if (m.status === 'active' && m.finishedStock <= m.minStockThreshold) {
      lowStockProducts += 1;
    }
  });

  let rawMaterialsVal = 0;
  let lowStockMaterials = 0;

  materials.forEach((rm) => {
    rawMaterialsVal += (rm.currentStock || 0) * (rm.unitCost || 0);
    if (rm.currentStock <= rm.minStockThreshold) {
      lowStockMaterials += 1;
    }
  });

  const pendingOrders = orders.filter((o) =>
    ['new', 'confirmed', 'in_production', 'ready_to_ship'].includes(o.orderStatus)
  ).length;

  return {
    ...current,
    previousPeriod: {
      totalRevenue: previous.totalRevenue,
      netProfit: previous.netProfit,
      costOfGoodsSold: previous.costOfGoodsSold,
      operatingExpenses: previous.operatingExpenses,
      unitsSold: previous.unitsSold,
      orderCount: previous.orderCount,
      revenueGrowthPercent: revGrowth,
      profitGrowthPercent: profitGrowth,
    },
    totalWalletModelsCount: models.length,
    currentFinishedWalletStock: totalFinishedStock,
    rawMaterialsInventoryValue: Math.round(rawMaterialsVal * 10) / 10,
    finishedGoodsInventoryValue: Math.round(finishedGoodsVal * 10) / 10,
    totalInventoryValue: Math.round((rawMaterialsVal + finishedGoodsVal) * 10) / 10,
    lowStockProductsCount: lowStockProducts,
    lowStockMaterialsCount: lowStockMaterials,
    pendingOrdersCount: pendingOrders,
  };
}

/**
 * Calculates how many wallets of a specific model can be produced from current raw materials stock
 */
export function calculateModelProductionCapacity(
  model: WalletModel,
  materials: RawMaterial[]
): { maxUnitsPossible: number; limitingMaterialName?: string; details: { materialName: string; required: number; available: number; possibleUnits: number }[] } {
  if (!model.recipe || model.recipe.length === 0) {
    return { maxUnitsPossible: 0, details: [] };
  }

  const matMap = new Map<string, RawMaterial>();
  materials.forEach((m) => matMap.set(m.id, m));

  let minUnits = Infinity;
  let limitingName: string | undefined;
  const details: { materialName: string; required: number; available: number; possibleUnits: number }[] = [];

  for (const item of model.recipe) {
    const raw = matMap.get(item.materialId);
    const available = raw ? raw.currentStock : 0;
    const req = item.quantityRequired || 0;
    const possible = req > 0 ? Math.floor(available / req) : 0;

    details.push({
      materialName: item.materialName || raw?.name || 'Unknown',
      required: req,
      available,
      possibleUnits: possible,
    });

    if (possible < minUnits) {
      minUnits = possible;
      limitingName = item.materialName || raw?.name;
    }
  }

  return {
    maxUnitsPossible: minUnits === Infinity ? 0 : Math.max(0, minUnits),
    limitingMaterialName: limitingName,
    details,
  };
}
