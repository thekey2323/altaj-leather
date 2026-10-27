import {
  Product,
  Order,
  Customer,
  InventoryLog,
  StoreSettings,
  OrderStatus,
  OrderNote,
  BundleOffer,
  MarketingCampaign,
  WalletCostBreakdown,
} from "@/types";
import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_CUSTOMERS,
  INITIAL_INVENTORY_LOGS,
  INITIAL_SETTINGS,
  INITIAL_CAMPAIGNS,
} from "./initialData";

const STORAGE_KEYS = {
  PRODUCTS: "altaj_products_v2",
  ORDERS: "altaj_orders_v2",
  CUSTOMERS: "altaj_customers_v2",
  INVENTORY_LOGS: "altaj_inventory_logs_v2",
  SETTINGS: "altaj_settings_v2",
  NOTIFICATIONS: "altaj_notifications_v2",
  CAMPAIGNS: "altaj_marketing_campaigns_v1",
};

// In-memory fallback cache for SSR
let memoryProducts: Product[] = [...INITIAL_PRODUCTS];
let memoryOrders: Order[] = [...INITIAL_ORDERS];
let memoryCustomers: Customer[] = [...INITIAL_CUSTOMERS];
let memoryLogs: InventoryLog[] = [...INITIAL_INVENTORY_LOGS];
let memorySettings: StoreSettings = { ...INITIAL_SETTINGS };
let memoryCampaigns: MarketingCampaign[] = [...INITIAL_CAMPAIGNS];

function isBrowser(): boolean {
  return typeof window !== "undefined";
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
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e: any) {
    if (e?.name === "QuotaExceededError" || e?.code === 22 || e?.name === "NS_ERROR_DOM_QUOTA_REACHED") {
      console.warn(`[LocalStorage Quota Exceeded for ${key}]. Attempting storage cleanup...`);
      try {
        // Free up space by purging bulky log entries if quota is saturated
        localStorage.removeItem(STORAGE_KEYS.INVENTORY_LOGS);
        localStorage.setItem(key, JSON.stringify(value));
        console.info(`[LocalStorage Recovery Succeeded for ${key}]`);
        return;
      } catch (recoveryError) {
        console.warn("Storage quota recovery failed, state preserved in active memory session.");
      }
    } else {
      console.error("Storage error:", e);
    }
  }
}

function getFs() {
  if (typeof window === "undefined") {
    try {
      return eval("require")("fs");
    } catch {}
  }
  return null;
}

function getPath() {
  if (typeof window === "undefined") {
    try {
      return eval("require")("path");
    } catch {}
  }
  return null;
}

function loadServerJson<T>(filename: string, fallback: T): T {
  if (isBrowser()) return fallback;
  const fs = getFs();
  const path = getPath();
  if (!fs || !path) return fallback;
  try {
    const filePath = path.join(process.cwd(), "data", filename);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content);
    }
  } catch (e) {}
  return fallback;
}

function saveServerJson<T>(filename: string, data: T): void {
  if (isBrowser()) return;
  const fs = getFs();
  const path = getPath();
  if (!fs || !path) return;
  try {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const filePath = path.join(dataDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Error saving server json:", e);
  }
}

// -------------------------------------------------------------
// PRODUCTS SERVICE
// -------------------------------------------------------------
export function getProducts(): Product[] {
  if (isBrowser()) {
    return getStored<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  }
  return loadServerJson<Product[]>("products.json", memoryProducts);
}

export function getProductBySlug(slug: string): Product | undefined {
  const products = getProducts();
  return products.find((p) => p.slug === slug);
}

export function saveProduct(product: Product): Product {
  const products = getProducts();
  const index = products.findIndex((p) => p.id === product.id);
  let updated: Product[];
  
  if (index >= 0) {
    updated = [...products];
    updated[index] = { ...product, updatedAt: new Date().toISOString() };
  } else {
    updated = [
      {
        ...product,
        id: product.id || `prod-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      ...products,
    ];
  }

  if (isBrowser()) {
    setStored(STORAGE_KEYS.PRODUCTS, updated);
  }
  saveServerJson("products.json", updated);
  memoryProducts = updated;
  return product;
}

export function updateProductCost(productId: string, cost: number): Product | null {
  const products = getProducts();
  const index = products.findIndex((p) => p.id === productId);
  if (index === -1) return null;

  const updatedProduct: Product = {
    ...products[index],
    cost: Math.max(0, cost),
    updatedAt: new Date().toISOString(),
  };

  const updated = [...products];
  updated[index] = updatedProduct;

  if (isBrowser()) {
    setStored(STORAGE_KEYS.PRODUCTS, updated);
  }
  memoryProducts = updated;
  return updatedProduct;
}

export function updateBatchProductCosts(costMap: Record<string, number>): Product[] {
  const products = getProducts();
  const updated = products.map((p) => {
    if (costMap[p.id] !== undefined) {
      return {
        ...p,
        cost: Math.max(0, costMap[p.id]),
        updatedAt: new Date().toISOString(),
      };
    }
    return p;
  });

  if (isBrowser()) {
    setStored(STORAGE_KEYS.PRODUCTS, updated);
  }
  memoryProducts = updated;
  return updated;
}

export const DEFAULT_COST_BREAKDOWN: WalletCostBreakdown = {
  rawLeatherCost: 25,
  craftingCost: 18,
  suppliesCost: 7,
  packagingCost: 8,
  marketingCpa: 35,
  deliveryCost: 35,
  returnRiskBuffer: 6,
  callCenterCost: 3,
};

export function updateProductCostBreakdown(
  productId: string,
  breakdown: WalletCostBreakdown
): Product | null {
  const products = getProducts();
  const index = products.findIndex((p) => p.id === productId);
  if (index === -1) return null;

  const workshopCost =
    breakdown.rawLeatherCost + breakdown.craftingCost + breakdown.suppliesCost;

  const updatedProduct: Product = {
    ...products[index],
    cost: workshopCost,
    costBreakdown: breakdown,
    updatedAt: new Date().toISOString(),
  };

  const updated = [...products];
  updated[index] = updatedProduct;

  if (isBrowser()) {
    setStored(STORAGE_KEYS.PRODUCTS, updated);
  }
  memoryProducts = updated;
  return updatedProduct;
}

export function duplicateProduct(id: string): Product | null {
  const products = getProducts();
  const original = products.find((p) => p.id === id);
  if (!original) return null;

  const clone: Product = {
    ...original,
    id: `prod-${Date.now()}`,
    name: `${original.name} (Copie)`,
    slug: `${original.slug}-copie-${Math.floor(Math.random() * 1000)}`,
    sku: `${original.sku}-CPY`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveProduct(clone);
  return clone;
}

export function deleteProduct(id: string): void {
  const products = getProducts().filter((p) => p.id !== id);
  if (isBrowser()) {
    setStored(STORAGE_KEYS.PRODUCTS, products);
    try {
      fetch(`/api/products?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => {});
    } catch {}
  }
  saveServerJson("products.json", products);
  memoryProducts = products;
}

export function saveServerProducts(products: Product[]): void {
  if (isBrowser()) {
    setStored(STORAGE_KEYS.PRODUCTS, products);
  }
  saveServerJson("products.json", products);
  memoryProducts = products;
}


// -------------------------------------------------------------
// ORDERS SERVICE (COD Moroccan Engine)
// -------------------------------------------------------------
export function getOrders(): Order[] {
  if (isBrowser()) {
    return getStored<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  }
  return loadServerJson<Order[]>("orders.json", memoryOrders);
}

// Moroccan Courier (3PL) City Rates for Cash-On-Delivery
export const DEFAULT_CITY_COURIER_RATES: Record<string, number> = {
  "Fès": 25,
  "Fes": 25,
  "Meknès": 30,
  "Meknes": 30,
  "Casablanca": 30,
  "Rabat": 30,
  "Salé": 30,
  "Sale": 30,
  "Kénitra": 30,
  "Kenitra": 30,
  "Mohammédia": 30,
  "Mohammedia": 30,
  "Témara": 30,
  "Temara": 30,
  "Marrakech": 35,
  "Tanger": 35,
  "Tangier": 35,
  "Tétouan": 35,
  "Tetouan": 35,
  "Agadir": 35,
  "El Jadida": 35,
  "Settat": 35,
  "Béni Mellal": 35,
  "Beni Mellal": 35,
  "Safi": 35,
  "Larache": 35,
  "Ksar El Kebir": 35,
  "Khémisset": 35,
  "Khemisset": 35,
  "Nador": 40,
  "Taza": 40,
  "Oujda": 42,
  "Berkane": 42,
  "Taroudant": 40,
  "Guelmim": 45,
  "Ouarzazate": 45,
  "Errachidia": 45,
  "Laâyoune": 50,
  "Laayoune": 50,
  "Dakhla": 55,
};

export function getEstimatedCourierCostForCity(cityName?: string): number {
  if (!cityName) return 35;
  const normalized = cityName.trim().toLowerCase();
  for (const [city, cost] of Object.entries(DEFAULT_CITY_COURIER_RATES)) {
    if (city.toLowerCase() === normalized) {
      return cost;
    }
  }
  for (const [city, cost] of Object.entries(DEFAULT_CITY_COURIER_RATES)) {
    if (normalized.includes(city.toLowerCase()) || city.toLowerCase().includes(normalized)) {
      return cost;
    }
  }
  return 35;
}

export function getOrderById(id: string): Order | undefined {
  const orders = getOrders();
  return orders.find((o) => o.id === id || o.orderNumber === id);
}

export function createOrder(data: {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  notes?: string;
  items: {
    productId: string;
    productName: string;
    productImage: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    bundleName?: string;
  }[];
  subtotal: number;
  discount?: number;
  shippingFee?: number;
  courierCost?: number;
  utmSource?: string;
  utmCampaign?: string;
  status?: OrderStatus;
}): Order {
  const orders = getOrders();
  const orderNumSeq = 1025 + orders.length;
  const orderNumber = `ALTAJ-${orderNumSeq}`;

  const determinedCourierCost =
    data.courierCost !== undefined && data.courierCost !== null
      ? Number(data.courierCost)
      : getEstimatedCourierCostForCity(data.customerCity);

  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    orderNumber,
    createdAt: new Date().toISOString(),
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    customerAddress: data.customerAddress,
    customerCity: data.customerCity,
    courierCost: determinedCourierCost,
    notes: data.notes || "",
    items: data.items.map((item, idx) => ({
      ...item,
      id: `item-${Date.now()}-${idx}`,
    })),
    subtotal: data.subtotal,
    discount: data.discount || 0,
    shippingFee: data.shippingFee ?? 0,
    total: data.subtotal - (data.discount || 0) + (data.shippingFee ?? 0),
    status: data.status || "NEW",
    paymentMethod: "COD",
    utmSource: data.utmSource || "Direct",
    utmCampaign: data.utmCampaign || "Organic",
    internalNotes: [
      {
        id: `note-${Date.now()}`,
        orderId: `ord-${Date.now()}`,
        author: "Système COD",
        text: "Nouvelle commande enregistrée avec succès. Paiement à la livraison prévu.",
        createdAt: new Date().toISOString(),
        type: "INTERNAL_NOTE",
      },
    ],
  };

  const updatedOrders = [newOrder, ...orders];
  if (isBrowser()) {
    setStored(STORAGE_KEYS.ORDERS, updatedOrders);
    
    // Add real-time notification
    const currentNotifs = getStored<any[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    setStored(STORAGE_KEYS.NOTIFICATIONS, [
      {
        id: `notif-${Date.now()}`,
        title: `Nouvelle commande #${orderNumber}`,
        customer: data.customerName,
        total: newOrder.total,
        time: new Date().toISOString(),
        read: false,
      },
      ...currentNotifs,
    ]);
  }
  saveServerJson("orders.json", updatedOrders);
  memoryOrders = updatedOrders;

  // Auto update customer database
  updateCustomerFromOrder(newOrder);

  // Auto adjust inventory
  data.items.forEach((item) => {
    adjustStock(
      item.productId,
      -item.quantity,
      `Commande #${orderNumber}`,
      "ORDER_FULFILL",
      "Système"
    );
  });

  return newOrder;
}

export function updateOrderStatus(orderId: string, status: OrderStatus, author = "Admin"): Order | null {
  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  if (!order) return null;

  const oldStatus = order.status;
  order.status = status;
  
  const note: OrderNote = {
    id: `note-${Date.now()}`,
    orderId,
    author,
    text: `Statut modifié : de ${oldStatus} à ${status}`,
    createdAt: new Date().toISOString(),
    type: "STATUS_CHANGE",
  };
  order.internalNotes.unshift(note);

  const updated = orders.map((o) => (o.id === orderId ? order : o));
  if (isBrowser()) {
    setStored(STORAGE_KEYS.ORDERS, updated);
  }
  saveServerJson("orders.json", updated);
  memoryOrders = updated;

  // If status is RETURNED, restore stock
  if (status === "RETURNED" && oldStatus !== "RETURNED") {
    order.items.forEach((item) => {
      adjustStock(
        item.productId,
        item.quantity,
        `Retour commande #${order.orderNumber}`,
        "RETURN",
        author
      );
    });
  }

  // Update customer stats
  updateCustomerStats(order.customerPhone);

  return order;
}

export function addOrderNote(orderId: string, text: string, author = "Staff"): OrderNote | null {
  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  if (!order) return null;

  const newNote: OrderNote = {
    id: `note-${Date.now()}`,
    orderId,
    author,
    text,
    createdAt: new Date().toISOString(),
    type: "CUSTOMER_CONTACT",
  };

  order.internalNotes.unshift(newNote);
  const updated = orders.map((o) => (o.id === orderId ? order : o));
  if (isBrowser()) {
    setStored(STORAGE_KEYS.ORDERS, updated);
  }
  saveServerJson("orders.json", updated);
  memoryOrders = updated;
  return newNote;
}

export function updateOrder(updatedOrder: Order): Order | null {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === updatedOrder.id);
  if (index === -1) return null;

  const updated = [...orders];
  updated[index] = updatedOrder;

  if (isBrowser()) {
    setStored(STORAGE_KEYS.ORDERS, updated);
  }
  saveServerJson("orders.json", updated);
  memoryOrders = updated;
  updateCustomerStats(updatedOrder.customerPhone);
  return updatedOrder;
}

export function deleteOrder(orderId: string): boolean {
  const orders = getOrders();
  const orderToDelete = orders.find((o) => o.id === orderId || o.orderNumber === orderId);
  const updated = orders.filter((o) => o.id !== orderId && o.orderNumber !== orderId);

  if (isBrowser()) {
    setStored(STORAGE_KEYS.ORDERS, updated);
  }
  saveServerJson("orders.json", updated);
  memoryOrders = updated;

  if (orderToDelete) {
    updateCustomerStats(orderToDelete.customerPhone);
  }
  return true;
}

export interface PurgeOrdersOptions {
  keepDays?: number; // e.g. 7, 14, 30
  onlySamples?: boolean; // clear test / sample mock orders
  all?: boolean; // clear everything
}

export function purgeOrders(options: PurgeOrdersOptions): { deletedCount: number; remainingCount: number } {
  const currentOrders = getOrders();
  let remaining: Order[] = [];

  if (options.all) {
    remaining = [];
  } else if (options.onlySamples) {
    remaining = currentOrders.filter(
      (o) =>
        !o.id.startsWith("ord-10") &&
        !o.orderNumber.startsWith("ALTAJ-102") &&
        !o.orderNumber.startsWith("ALTAJ-100")
    );
  } else if (options.keepDays && options.keepDays > 0) {
    const cutoff = Date.now() - options.keepDays * 24 * 60 * 60 * 1000;
    remaining = currentOrders.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return !isNaN(t) && t >= cutoff;
    });
  } else {
    remaining = currentOrders;
  }

  const deletedCount = currentOrders.length - remaining.length;
  if (isBrowser()) {
    setStored(STORAGE_KEYS.ORDERS, remaining);
  }
  saveServerJson("orders.json", remaining);
  memoryOrders = remaining;
  return { deletedCount, remainingCount: remaining.length };
}

// -------------------------------------------------------------
// INVENTORY SERVICE
// -------------------------------------------------------------
export function getInventoryLogs(): InventoryLog[] {
  if (isBrowser()) {
    return getStored<InventoryLog[]>(STORAGE_KEYS.INVENTORY_LOGS, INITIAL_INVENTORY_LOGS);
  }
  return memoryLogs;
}

export function adjustStock(
  productId: string,
  quantityChange: number,
  reason: string,
  action: InventoryLog["action"] = "ADJUST",
  performedBy = "Admin"
): void {
  const products = getProducts();
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  product.stock = Math.max(0, product.stock + quantityChange);
  if (product.stock === 0) {
    product.status = "OUT OF STOCK";
  } else if (product.status === "OUT OF STOCK" && product.stock > 0) {
    product.status = "ACTIVE";
  }

  saveProduct(product);

  const newLog: InventoryLog = {
    id: `log-${Date.now()}`,
    productId,
    productName: product.name,
    sku: product.sku,
    action,
    quantityChange,
    newStock: product.stock,
    reason,
    createdAt: new Date().toISOString(),
    performedBy,
  };

  const logs = [newLog, ...getInventoryLogs()];
  if (isBrowser()) {
    setStored(STORAGE_KEYS.INVENTORY_LOGS, logs);
  }
  memoryLogs = logs;
}

// -------------------------------------------------------------
// CUSTOMERS SERVICE
// -------------------------------------------------------------
export function getCustomers(): Customer[] {
  if (isBrowser()) {
    return getStored<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  }
  return memoryCustomers;
}

function updateCustomerFromOrder(order: Order): void {
  const customers = getCustomers();
  const existing = customers.find((c) => c.phone === order.customerPhone);
  const today = new Date().toISOString().split("T")[0];

  if (existing) {
    existing.totalOrders += 1;
    existing.lastOrderDate = today;
    existing.address = order.customerAddress;
    existing.city = order.customerCity;
    const updated = customers.map((c) => (c.id === existing.id ? existing : c));
    if (isBrowser()) setStored(STORAGE_KEYS.CUSTOMERS, updated);
    memoryCustomers = updated;
  } else {
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: order.customerName,
      phone: order.customerPhone,
      city: order.customerCity,
      address: order.customerAddress,
      totalOrders: 1,
      deliveredOrders: 0,
      cancelledOrders: 0,
      totalSpent: order.total,
      firstOrderDate: today,
      lastOrderDate: today,
      reliabilityScore: 100,
    };
    const updated = [newCust, ...customers];
    if (isBrowser()) setStored(STORAGE_KEYS.CUSTOMERS, updated);
    memoryCustomers = updated;
  }
}

function updateCustomerStats(phone: string): void {
  const orders = getOrders().filter((o) => o.customerPhone === phone);
  const customers = getCustomers();
  const customer = customers.find((c) => c.phone === phone);
  if (!customer) return;

  const total = orders.length;
  const delivered = orders.filter((o) => o.status === "DELIVERED").length;
  const cancelled = orders.filter((o) => o.status === "CANCELLED").length;
  const totalSpent = orders
    .filter((o) => o.status === "DELIVERED")
    .reduce((sum, o) => sum + o.total, 0);

  customer.totalOrders = total;
  customer.deliveredOrders = delivered;
  customer.cancelledOrders = cancelled;
  customer.totalSpent = totalSpent;

  if (total > 0) {
    customer.reliabilityScore = Math.max(0, Math.round(((total - cancelled) / total) * 100));
  }

  const updated = customers.map((c) => (c.id === customer.id ? customer : c));
  if (isBrowser()) setStored(STORAGE_KEYS.CUSTOMERS, updated);
  memoryCustomers = updated;
}

// -------------------------------------------------------------
// SETTINGS SERVICE
// -------------------------------------------------------------
export function getSettings(): StoreSettings {
  if (isBrowser()) {
    return getStored<StoreSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  }
  return memorySettings;
}

export function saveSettings(settings: StoreSettings): StoreSettings {
  if (isBrowser()) {
    setStored(STORAGE_KEYS.SETTINGS, settings);
  }
  memorySettings = settings;
  return settings;
}

// -------------------------------------------------------------
// COD SETTINGS SERVICE
// -------------------------------------------------------------
export interface CodSettings {
  metaAdsSpend: number;
  tiktokAdsSpend: number;
  googleAdsSpend: number;
  deliveryFeePerDelivered: number; // e.g. 35 DH
  returnFeePerReturned: number; // e.g. 20 DH charged on returned package
  packagingPerOrder: number; // e.g. 8 DH for gift box, dustbag, call confirmation
  targetDeliveryRate: number; // e.g. 75%
  targetNetMargin: number; // e.g. 25%
}

export const DEFAULT_COD_SETTINGS: CodSettings = {
  metaAdsSpend: 3450,
  tiktokAdsSpend: 2650,
  googleAdsSpend: 350,
  deliveryFeePerDelivered: 35,
  returnFeePerReturned: 20,
  packagingPerOrder: 8,
  targetDeliveryRate: 75,
  targetNetMargin: 25,
};

const COD_SETTINGS_KEY = "altaj_cod_settings_v3";
let memoryCodSettings: CodSettings = { ...DEFAULT_COD_SETTINGS };

export function getCodSettings(): CodSettings {
  if (isBrowser()) {
    return getStored<CodSettings>(COD_SETTINGS_KEY, DEFAULT_COD_SETTINGS);
  }
  return memoryCodSettings;
}

export function saveCodSettings(settings: CodSettings): CodSettings {
  if (isBrowser()) {
    setStored(COD_SETTINGS_KEY, settings);
  }
  memoryCodSettings = settings;
  return settings;
}

// -------------------------------------------------------------
// QUICK STOCK ADJUSTMENT FOR ARTISAN WORKSHOP
// -------------------------------------------------------------
export function quickAdjustStock(
  productId: string,
  amount: number,
  mode: "ADD" | "REMOVE" | "SET" = "ADD",
  customReason?: string,
  newThreshold?: number
): Product | null {
  const products = getProducts();
  const index = products.findIndex((p) => p.id === productId);
  if (index === -1) return null;

  const current = products[index];
  let newStock = current.stock;
  let quantityChange = 0;
  let action: InventoryLog["action"] = "ADJUST";

  if (mode === "ADD") {
    quantityChange = Math.abs(amount);
    newStock = current.stock + quantityChange;
    action = "ADD";
  } else if (mode === "REMOVE") {
    quantityChange = -Math.min(current.stock, Math.abs(amount));
    newStock = Math.max(0, current.stock + quantityChange);
    action = "REMOVE";
  } else if (mode === "SET") {
    newStock = Math.max(0, amount);
    quantityChange = newStock - current.stock;
    action = "ADJUST";
  }

  const updatedProduct: Product = {
    ...current,
    stock: newStock,
    lowStockThreshold: newThreshold !== undefined ? newThreshold : current.lowStockThreshold,
    status: newStock === 0 ? "OUT OF STOCK" : current.status === "OUT OF STOCK" ? "ACTIVE" : current.status,
    updatedAt: new Date().toISOString(),
  };

  const updatedProducts = [...products];
  updatedProducts[index] = updatedProduct;

  if (isBrowser()) {
    setStored(STORAGE_KEYS.PRODUCTS, updatedProducts);
  }
  memoryProducts = updatedProducts;

  // Add an inventory log
  try {
    const logs = getStored<InventoryLog[]>(STORAGE_KEYS.INVENTORY_LOGS, INITIAL_INVENTORY_LOGS);
    const defaultReason =
      mode === "ADD"
        ? "Réapprovisionnement atelier maroquinerie Fès"
        : mode === "REMOVE"
        ? "Prélèvement / Défaut / Exposition"
        : "Comptage physique & mise à niveau inventaire";

    const newLog: InventoryLog = {
      id: `log-${Date.now()}`,
      productId: current.id,
      productName: current.name,
      sku: current.sku,
      action,
      quantityChange,
      newStock,
      reason: customReason?.trim() || defaultReason,
      createdAt: new Date().toISOString(),
      performedBy: "Othmane (Owner)",
    };
    const updatedLogs = [newLog, ...logs];
    if (isBrowser()) setStored(STORAGE_KEYS.INVENTORY_LOGS, updatedLogs);
    memoryLogs = updatedLogs;
  } catch {}

  return updatedProduct;
}

// -------------------------------------------------------------
// MARKETING CAMPAIGNS SERVICE
// -------------------------------------------------------------
export function getCampaigns(): MarketingCampaign[] {
  if (isBrowser()) {
    return getStored<MarketingCampaign[]>(STORAGE_KEYS.CAMPAIGNS, INITIAL_CAMPAIGNS);
  }
  return memoryCampaigns;
}

export function getCampaignById(id: string): MarketingCampaign | null {
  const campaigns = getCampaigns();
  return campaigns.find((c) => c.id === id) || null;
}

export function addCampaign(
  campaignData: Omit<MarketingCampaign, "id" | "createdAt" | "updatedAt">
): MarketingCampaign {
  const campaigns = getCampaigns();
  const newCampaign: MarketingCampaign = {
    ...campaignData,
    id: `cmp-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updated = [newCampaign, ...campaigns];
  if (isBrowser()) {
    setStored(STORAGE_KEYS.CAMPAIGNS, updated);
  }
  memoryCampaigns = updated;
  syncCodSettingsWithCampaigns();
  return newCampaign;
}

export function updateCampaign(updatedCampaign: MarketingCampaign): MarketingCampaign | null {
  const campaigns = getCampaigns();
  const index = campaigns.findIndex((c) => c.id === updatedCampaign.id);
  if (index === -1) return null;

  const campaignToSave: MarketingCampaign = {
    ...updatedCampaign,
    updatedAt: new Date().toISOString(),
  };

  const updated = [...campaigns];
  updated[index] = campaignToSave;

  if (isBrowser()) {
    setStored(STORAGE_KEYS.CAMPAIGNS, updated);
  }
  memoryCampaigns = updated;
  syncCodSettingsWithCampaigns();
  return campaignToSave;
}

export function deleteCampaign(campaignId: string): boolean {
  const campaigns = getCampaigns();
  const exists = campaigns.some((c) => c.id === campaignId);
  if (!exists) return false;

  const updated = campaigns.filter((c) => c.id !== campaignId);
  if (isBrowser()) {
    setStored(STORAGE_KEYS.CAMPAIGNS, updated);
  }
  memoryCampaigns = updated;
  syncCodSettingsWithCampaigns();
  return true;
}

export function syncCodSettingsWithCampaigns(): void {
  try {
    const campaigns = getCampaigns();
    const meta = campaigns
      .filter((c) => c.platform === "META")
      .reduce((sum, c) => sum + (Number(c.spent) || 0), 0);
    const tiktok = campaigns
      .filter((c) => c.platform === "TIKTOK")
      .reduce((sum, c) => sum + (Number(c.spent) || 0), 0);
    const google = campaigns
      .filter((c) => c.platform === "GOOGLE")
      .reduce((sum, c) => sum + (Number(c.spent) || 0), 0);

    const current = getCodSettings();
    const updated: CodSettings = {
      ...current,
      metaAdsSpend: meta,
      tiktokAdsSpend: tiktok,
      googleAdsSpend: google,
    };
    if (isBrowser()) {
      setStored(COD_SETTINGS_KEY, updated);
    }
    memoryCodSettings = updated;
  } catch {}
}

export function getCampaignsWithStats() {
  const campaigns = getCampaigns();
  const orders = getOrders();

  return campaigns.map((campaign) => {
    const matchedOrders = orders.filter((o) => {
      if (o.utmCampaign && campaign.utmCampaign) {
        if (o.utmCampaign.toLowerCase() === campaign.utmCampaign.toLowerCase()) return true;
      }
      return false;
    });

    // Fallback if no exact utmCampaign match, match by platform prefix
    const effectiveOrders =
      matchedOrders.length > 0
        ? matchedOrders
        : orders.filter((o) => {
            if (campaign.platform === "META" && o.utmSource?.toLowerCase().includes("meta")) return true;
            if (campaign.platform === "TIKTOK" && o.utmSource?.toLowerCase().includes("tiktok")) return true;
            if (campaign.platform === "GOOGLE" && o.utmSource?.toLowerCase().includes("google")) return true;
            if (campaign.platform === "WHATSAPP" && o.utmSource?.toLowerCase().includes("whatsapp")) return true;
            return false;
          });

    const ordersCount = effectiveOrders.length;
    const deliveredOrders = effectiveOrders.filter((o) => o.status === "DELIVERED");
    const deliveredOrdersCount = deliveredOrders.length;
    const shippedOrders = effectiveOrders.filter((o) => ["SHIPPED", "DELIVERED", "RETURNED"].includes(o.status));
    const shippedCount = shippedOrders.length;
    const deliveryRate = shippedCount > 0 ? Math.round((deliveredOrdersCount / shippedCount) * 100) : 0;
    const revenue = deliveredOrders.reduce((sum, o) => sum + o.total, 0);
    const roas = campaign.spent > 0 ? Math.round((revenue / campaign.spent) * 100) / 100 : 0;
    const cpa = deliveredOrdersCount > 0 ? Math.round(campaign.spent / deliveredOrdersCount) : campaign.spent;

    return {
      ...campaign,
      ordersCount,
      deliveredOrdersCount,
      revenue,
      roas,
      cpa,
      deliveryRate,
    };
  });
}

// -------------------------------------------------------------
// COD METRICS & ANALYTICS CALCULATION
// -------------------------------------------------------------
export function getAnalytics() {
  const orders = getOrders();
  const totalOrders = orders.length;
  
  const confirmedOrders = orders.filter((o) =>
    ["CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED"].includes(o.status)
  ).length;
  
  const shippedOrders = orders.filter((o) =>
    ["SHIPPED", "DELIVERED", "RETURNED"].includes(o.status)
  ).length;
  
  const deliveredOrders = orders.filter((o) => o.status === "DELIVERED").length;
  const cancelledOrders = orders.filter((o) => o.status === "CANCELLED").length;
  const returnedOrders = orders.filter((o) => o.status === "RETURNED").length;
  const newOrders = orders.filter((o) => o.status === "NEW").length;
  const pendingConfirmation = orders.filter((o) => o.status === "PENDING_CONFIRMATION").length;

  const totalSales = orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + o.total, 0);

  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  // COD Specific Rates
  const confirmationRate = totalOrders > 0 ? (confirmedOrders / totalOrders) * 100 : 0;
  const deliveryRate = shippedOrders > 0 ? (deliveredOrders / shippedOrders) * 100 : 0;
  const cancellationRate = totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0;
  const returnRate = shippedOrders > 0 ? (returnedOrders / shippedOrders) * 100 : 0;

  // City Analytics (Crucial for Moroccan COD)
  const cityMap: Record<
    string,
    { orders: number; delivered: number; cancelled: number; revenue: number }
  > = {};

  orders.forEach((o) => {
    const city = o.customerCity || "Autre";
    if (!cityMap[city]) {
      cityMap[city] = { orders: 0, delivered: 0, cancelled: 0, revenue: 0 };
    }
    cityMap[city].orders += 1;
    if (o.status === "DELIVERED") {
      cityMap[city].delivered += 1;
      cityMap[city].revenue += o.total;
    }
    if (o.status === "CANCELLED") {
      cityMap[city].cancelled += 1;
    }
  });

  const cityStats = Object.entries(cityMap)
    .map(([city, data]) => ({
      city,
      orders: data.orders,
      delivered: data.delivered,
      cancelled: data.cancelled,
      revenue: data.revenue,
      deliverySuccessRate: data.orders > 0 ? Math.round((data.delivered / data.orders) * 100) : 0,
      cancellationRate: data.orders > 0 ? Math.round((data.cancelled / data.orders) * 100) : 0,
    }))
    .sort((a, b) => b.orders - a.orders);

  // Marketing Attribution
  const sourceMap: Record<string, { orders: number; revenue: number }> = {};
  orders.forEach((o) => {
    const source = o.utmSource || "Direct";
    if (!sourceMap[source]) {
      sourceMap[source] = { orders: 0, revenue: 0 };
    }
    sourceMap[source].orders += 1;
    if (o.status !== "CANCELLED") {
      sourceMap[source].revenue += o.total;
    }
  });

  const marketingStats = Object.entries(sourceMap).map(([source, data]) => ({
    source,
    orders: data.orders,
    revenue: data.revenue,
    share: Math.round((data.orders / (totalOrders || 1)) * 100),
  }));

  return {
    totalSales,
    totalOrders,
    averageOrderValue,
    confirmedOrders,
    deliveredOrders,
    cancelledOrders,
    returnedOrders,
    newOrders,
    pendingConfirmation,
    shippedOrders,
    confirmationRate: Math.round(confirmationRate),
    deliveryRate: Math.round(deliveryRate),
    cancellationRate: Math.round(cancellationRate),
    returnRate: Math.round(returnRate),
    cityStats,
    marketingStats,
  };
}

// -------------------------------------------------------------
// COMPREHENSIVE COD & PAID ADS EXECUTIVE ANALYTICS ENGINE
// -------------------------------------------------------------
export type DateRangeFilter = "today" | "7days" | "30days" | "all";

export function getCodAnalytics(
  dateRange: DateRangeFilter = "30days",
  customSettings?: CodSettings
) {
  const allOrders = getOrders();
  const products = getProducts();
  const settings = customSettings || getCodSettings();

  // Filter orders by date range
  const now = new Date();
  const filteredOrders = allOrders.filter((o) => {
    if (dateRange === "all") return true;
    const orderDate = new Date(o.createdAt);
    const diffMs = now.getTime() - orderDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (dateRange === "today") return diffDays <= 1;
    if (dateRange === "7days") return diffDays <= 7;
    if (dateRange === "30days") return diffDays <= 30;
    return true;
  });

  const totalOrders = filteredOrders.length;

  const deliveredOrders = filteredOrders.filter((o) => o.status === "DELIVERED");
  const shippedOrders = filteredOrders.filter((o) =>
    ["SHIPPED", "DELIVERED", "RETURNED"].includes(o.status)
  );
  const inTransitOrders = filteredOrders.filter((o) => o.status === "SHIPPED");
  const confirmedOrders = filteredOrders.filter((o) =>
    ["CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED"].includes(o.status)
  );
  const returnedOrders = filteredOrders.filter((o) => o.status === "RETURNED");
  const cancelledOrders = filteredOrders.filter((o) => o.status === "CANCELLED");
  const pendingOrders = filteredOrders.filter((o) =>
    ["NEW", "PENDING_CONFIRMATION"].includes(o.status)
  );

  // Revenue Calculations
  // Only DELIVERED orders collect cash in Moroccan COD!
  const deliveredRevenue = deliveredOrders.reduce((sum, o) => sum + o.total, 0);

  // Gross pipeline revenue (confirmed + shipped + delivered)
  const pipelineRevenue = filteredOrders
    .filter((o) => !["CANCELLED", "RETURNED"].includes(o.status))
    .reduce((sum, o) => sum + o.total, 0);

  // COGS of Delivered Wallets (Product crafting cost in Morocco)
  const productCostMap = new Map(products.map((p) => [p.id, p.cost || 50]));
  let deliveredCogs = 0;
  deliveredOrders.forEach((o) => {
    o.items.forEach((it) => {
      const unitCost = productCostMap.get(it.productId) || 50;
      deliveredCogs += unitCost * (it.quantity || 1);
    });
  });

  // Calculate Ad Spend for the period directly from Marketing Campaigns
  let adSpendScale = 1;
  if (dateRange === "today") adSpendScale = 1 / 30;
  else if (dateRange === "7days") adSpendScale = 7 / 30;
  else if (dateRange === "30days") adSpendScale = 1;
  else adSpendScale = 1.0; // all-time uses exact total

  const campaigns = getCampaigns();
  const campaignMetaSpend = campaigns
    .filter((c) => c.platform === "META")
    .reduce((sum, c) => sum + (Number(c.spent) || 0), 0);
  const campaignTiktokSpend = campaigns
    .filter((c) => c.platform === "TIKTOK")
    .reduce((sum, c) => sum + (Number(c.spent) || 0), 0);
  const campaignGoogleSpend = campaigns
    .filter((c) => c.platform === "GOOGLE")
    .reduce((sum, c) => sum + (Number(c.spent) || 0), 0);
  const campaignOtherSpend = campaigns
    .filter((c) => !["META", "TIKTOK", "GOOGLE"].includes(c.platform))
    .reduce((sum, c) => sum + (Number(c.spent) || 0), 0);

  const hasCampaigns = campaigns.length > 0;
  const baseMetaSpend = hasCampaigns ? campaignMetaSpend : (settings.metaAdsSpend || 0);
  const baseTiktokSpend = hasCampaigns ? campaignTiktokSpend : (settings.tiktokAdsSpend || 0);
  const baseGoogleSpend = hasCampaigns ? campaignGoogleSpend : (settings.googleAdsSpend || 0);
  const baseOtherSpend = hasCampaigns ? campaignOtherSpend : 0;

  const metaSpend = Math.round(baseMetaSpend * adSpendScale);
  const tiktokSpend = Math.round(baseTiktokSpend * adSpendScale);
  const googleSpend = Math.round(baseGoogleSpend * adSpendScale);
  const otherSpend = Math.round(baseOtherSpend * adSpendScale);
  const totalAdSpend = metaSpend + tiktokSpend + googleSpend + otherSpend;

  // Courier Fees (Moroccan Logistics)
  // Compute real exact courier costs from individual delivered orders (falling back to city rate or settings baseline)
  const courierDeliveryCost = deliveredOrders.reduce((sum, o) => {
    const fee =
      o.courierCost !== undefined && o.courierCost !== null
        ? Number(o.courierCost)
        : getEstimatedCourierCostForCity(o.customerCity) || settings.deliveryFeePerDelivered || 35;
    return sum + fee;
  }, 0);
  const avgCourierDeliveryFee =
    deliveredOrders.length > 0
      ? Math.round(courierDeliveryCost / deliveredOrders.length)
      : (settings.deliveryFeePerDelivered || 35);
  const courierReturnCost = returnedOrders.length * settings.returnFeePerReturned;
  const packagingCost =
    (deliveredOrders.length + returnedOrders.length) * settings.packagingPerOrder;

  // REAL NET PROFIT CALCULATION
  const netProfit =
    deliveredRevenue -
    deliveredCogs -
    totalAdSpend -
    courierDeliveryCost -
    courierReturnCost -
    packagingCost;

  const netMargin = deliveredRevenue > 0 ? (netProfit / deliveredRevenue) * 100 : 0;
  const grossProfit = deliveredRevenue - deliveredCogs;
  const grossMargin = deliveredRevenue > 0 ? (grossProfit / deliveredRevenue) * 100 : 0;

  // COD Specific Rates
  const deliveryRate =
    shippedOrders.length > 0 ? (deliveredOrders.length / shippedOrders.length) * 100 : 0;
  const confirmationRate =
    totalOrders > 0 ? (confirmedOrders.length / totalOrders) * 100 : 0;
  const returnRate =
    shippedOrders.length > 0 ? (returnedOrders.length / shippedOrders.length) * 100 : 0;
  const cancellationRate =
    totalOrders > 0 ? (cancelledOrders.length / totalOrders) * 100 : 0;

  // Paid Ads Performance Metrics
  const blendedRoas = totalAdSpend > 0 ? deliveredRevenue / totalAdSpend : 0;
  const grossRoas = totalAdSpend > 0 ? pipelineRevenue / totalAdSpend : 0;
  const deliveredCpa =
    deliveredOrders.length > 0 ? Math.round(totalAdSpend / deliveredOrders.length) : 0;
  const blendedCpa = totalOrders > 0 ? Math.round(totalAdSpend / totalOrders) : 0;

  // Escrow Cash (Money collected by courier pending remittance to ALTAJLEATHER bank)
  // Usually the last 7-10 days of delivered orders
  const escrowDeliveredOrders = deliveredOrders.slice(-8);
  const fundsInEscrow = escrowDeliveredOrders.reduce((sum, o) => sum + o.total, 0);
  const inTransitValue = inTransitOrders.reduce((sum, o) => sum + o.total, 0);

  // STOCK STATUS (WHAT LEFT ON STOCK)
  const totalStockUnits = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const totalStockCostValue = products.reduce(
    (sum, p) => sum + (p.stock || 0) * (p.cost || 50),
    0
  );
  const totalStockRetailValue = products.reduce(
    (sum, p) => sum + (p.stock || 0) * p.price,
    0
  );
  const lowStockThreshold = 10;
  const lowStockProducts = products.filter((p) => p.stock <= lowStockThreshold);
  const outOfStockProducts = products.filter((p) => p.stock === 0);

  const productsStock = products.map((p) => {
    const maxReference = 50; // max capacity reference for progress bar
    const stockPct = Math.min(100, Math.round((p.stock / maxReference) * 100));

    let deliveredUnits = 0;
    deliveredOrders.forEach((o) => {
      o.items.forEach((it) => {
        if (it.productId === p.id) {
          deliveredUnits += it.quantity || 1;
        }
      });
    });

    const cost = p.cost || 50;

    return {
      id: p.id,
      name: p.name,
      sku: p.sku,
      image: p.featuredImage || (p.images && p.images[0]?.url) || "",
      stock: p.stock,
      cost,
      price: p.price,
      deliveredUnits,
      deliveredCogs: deliveredUnits * cost,
      potentialProfit: (p.price - cost) * p.stock,
      isLowStock: p.stock <= (p.lowStockThreshold || lowStockThreshold),
      stockPct,
    };
  });

  // MOROCCAN CITIES MATRIX
  const cityMap: Record<
    string,
    { orders: number; delivered: number; returned: number; cancelled: number; revenue: number }
  > = {};

  filteredOrders.forEach((o) => {
    const city = o.customerCity || "Autre";
    if (!cityMap[city]) {
      cityMap[city] = { orders: 0, delivered: 0, returned: 0, cancelled: 0, revenue: 0 };
    }
    cityMap[city].orders += 1;
    if (o.status === "DELIVERED") {
      cityMap[city].delivered += 1;
      cityMap[city].revenue += o.total;
    }
    if (o.status === "RETURNED") {
      cityMap[city].returned += 1;
    }
    if (o.status === "CANCELLED") {
      cityMap[city].cancelled += 1;
    }
  });

  const cityMatrix = Object.entries(cityMap)
    .map(([city, data]) => {
      const shipped = data.delivered + data.returned;
      const rate = shipped > 0 ? Math.round((data.delivered / shipped) * 100) : data.orders > 0 ? Math.round((data.delivered / data.orders) * 100) : 0;
      const returnPct = shipped > 0 ? Math.round((data.returned / shipped) * 100) : 0;
      
      let recommendation: "BOOST_ADS" | "HEALTHY" | "WATCH" | "HIGH_RETURN_RISK" = "HEALTHY";
      if (rate >= 80) recommendation = "BOOST_ADS";
      else if (rate >= 65) recommendation = "HEALTHY";
      else if (returnPct >= 30) recommendation = "HIGH_RETURN_RISK";
      else recommendation = "WATCH";

      return {
        city,
        orders: data.orders,
        delivered: data.delivered,
        returned: data.returned,
        cancelled: data.cancelled,
        revenue: data.revenue,
        deliveryRate: rate,
        returnRate: returnPct,
        recommendation,
      };
    })
    .sort((a, b) => b.orders - a.orders);

  // PAID ADS PLATFORM BREAKDOWN
  const channelStats = [
    {
      name: "Meta Ads (Instagram / Facebook)",
      platform: "meta",
      spend: metaSpend,
      orders: filteredOrders.filter((o) => o.utmSource?.toLowerCase().includes("meta") || o.utmSource?.toLowerCase().includes("instagram") || o.utmSource?.toLowerCase().includes("facebook")).length,
      delivered: deliveredOrders.filter((o) => o.utmSource?.toLowerCase().includes("meta") || o.utmSource?.toLowerCase().includes("instagram") || o.utmSource?.toLowerCase().includes("facebook")).length,
      revenue: deliveredOrders
        .filter((o) => o.utmSource?.toLowerCase().includes("meta") || o.utmSource?.toLowerCase().includes("instagram") || o.utmSource?.toLowerCase().includes("facebook"))
        .reduce((s, o) => s + o.total, 0),
      color: "#3B82F6",
      share: Math.round((metaSpend / (totalAdSpend || 1)) * 100),
    },
    {
      name: "TikTok Ads (Spark / UGC)",
      platform: "tiktok",
      spend: tiktokSpend,
      orders: filteredOrders.filter((o) => o.utmSource?.toLowerCase().includes("tiktok")).length,
      delivered: deliveredOrders.filter((o) => o.utmSource?.toLowerCase().includes("tiktok")).length,
      revenue: deliveredOrders
        .filter((o) => o.utmSource?.toLowerCase().includes("tiktok"))
        .reduce((s, o) => s + o.total, 0),
      color: "#EC4899",
      share: Math.round((tiktokSpend / (totalAdSpend || 1)) * 100),
    },
    {
      name: "Google Ads (Search & Shopping)",
      platform: "google",
      spend: googleSpend,
      orders: filteredOrders.filter((o) => o.utmSource?.toLowerCase().includes("google")).length,
      delivered: deliveredOrders.filter((o) => o.utmSource?.toLowerCase().includes("google")).length,
      revenue: deliveredOrders
        .filter((o) => o.utmSource?.toLowerCase().includes("google"))
        .reduce((s, o) => s + o.total, 0),
      color: "#F59E0B",
      share: Math.round((googleSpend / (totalAdSpend || 1)) * 100),
    },
    {
      name: "WhatsApp Direct & Organique",
      platform: "direct",
      spend: otherSpend,
      orders: filteredOrders.filter((o) => o.utmSource?.toLowerCase().includes("whatsapp") || o.utmSource?.toLowerCase().includes("direct")).length,
      delivered: deliveredOrders.filter((o) => o.utmSource?.toLowerCase().includes("whatsapp") || o.utmSource?.toLowerCase().includes("direct")).length,
      revenue: deliveredOrders
        .filter((o) => o.utmSource?.toLowerCase().includes("whatsapp") || o.utmSource?.toLowerCase().includes("direct"))
        .reduce((s, o) => s + o.total, 0),
      color: "#10B981",
      share: Math.round((otherSpend / (totalAdSpend || 1)) * 100),
    },
  ];

  return {
    dateRange,
    // Core KPIs
    netProfit: Math.round(netProfit),
    netMargin: Math.round(netMargin * 10) / 10,
    deliveryRate: Math.round(deliveryRate),
    totalStockUnits,
    lowStockCount: lowStockProducts.length,
    outOfStockCount: outOfStockProducts.length,
    totalStockCostValue: Math.round(totalStockCostValue),
    totalStockRetailValue: Math.round(totalStockRetailValue),
    
    // Revenue & Volumes
    deliveredRevenue: Math.round(deliveredRevenue),
    pipelineRevenue: Math.round(pipelineRevenue),
    totalOrders,
    deliveredOrders: deliveredOrders.length,
    deliveredOrdersCount: deliveredOrders.length,
    shippedOrders: shippedOrders.length,
    shippedOrdersCount: shippedOrders.length,
    inTransitOrders: inTransitOrders.length,
    inTransitOrdersCount: inTransitOrders.length,
    confirmedOrders: confirmedOrders.length,
    confirmedOrdersCount: confirmedOrders.length,
    returnedOrders: returnedOrders.length,
    returnedOrdersCount: returnedOrders.length,
    cancelledOrders: cancelledOrders.length,
    cancelledOrdersCount: cancelledOrders.length,
    pendingOrdersCount: pendingOrders.length,

    // Rates
    confirmationRate: Math.round(confirmationRate),
    returnRate: Math.round(returnRate),
    cancellationRate: Math.round(cancellationRate),

    // Unit Economics Waterfall
    deliveredCogs: Math.round(deliveredCogs),
    totalAdSpend,
    metaSpend,
    tiktokSpend,
    googleSpend,
    otherSpend,
    courierDeliveryCost: Math.round(courierDeliveryCost),
    avgCourierDeliveryFee,
    courierReturnCost: Math.round(courierReturnCost),
    packagingCost: Math.round(packagingCost),
    grossProfit: Math.round(grossProfit),
    grossMargin: Math.round(grossMargin * 10) / 10,

    // Paid Ads Metrics
    blendedRoas: Math.round(blendedRoas * 100) / 100,
    grossRoas: Math.round(grossRoas * 100) / 100,
    deliveredCpa: deliveredCpa || 0,
    realDeliveredCpa: deliveredCpa || 0,
    blendedCpa: blendedCpa || 0,

    // Cash Escrow & In Transit
    fundsInEscrow: Math.round(fundsInEscrow),
    inTransitValue: Math.round(inTransitValue),

    // Details for widgets
    productsStock,
    cityMatrix,
    channelStats,
    pendingOrders: pendingOrders.slice(0, 5),
    settings: {
      ...settings,
      metaAdsSpend: baseMetaSpend,
      tiktokAdsSpend: baseTiktokSpend,
      googleAdsSpend: baseGoogleSpend,
    },
  };
}
