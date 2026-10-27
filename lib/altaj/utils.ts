import { OrderStatus, PaymentStatus, ProductStatus } from '@/types/altaj';

/**
 * Format currency with configurable symbol and Moroccan dirham default
 */
export function formatCurrency(amount: number, symbol = 'DH'): string {
  if (isNaN(amount) || amount === null || amount === undefined) return `0.00 ${symbol}`;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${formatted} ${symbol}`;
}

/**
 * Format percentage
 */
export function formatPercent(value: number): string {
  if (isNaN(value) || value === null || value === undefined) return '0.0%';
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
}

/**
 * Format date for friendly UI
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

/**
 * Color badge styling for Order Status
 */
export function getOrderStatusBadge(status: OrderStatus): { label: string; bg: string; text: string; border: string } {
  switch (status) {
    case 'new':
      return { label: 'New', bg: 'bg-paleblue-100', text: 'text-paleblue-500', border: 'border-paleblue-300' };
    case 'confirmed':
      return { label: 'Confirmed', bg: 'bg-lavender-100', text: 'text-lavender-500', border: 'border-lavender-300' };
    case 'in_production':
      return { label: 'In Production', bg: 'bg-softpeach-100', text: 'text-terracotta-500', border: 'border-softpeach-300' };
    case 'ready_to_ship':
      return { label: 'Ready to Ship', bg: 'bg-sage-100', text: 'text-sage-600', border: 'border-sage-300' };
    case 'shipped':
      return { label: 'Shipped', bg: 'bg-paleblue-100', text: 'text-sky-700', border: 'border-paleblue-300' };
    case 'delivered':
      return { label: 'Delivered', bg: 'bg-sage-100', text: 'text-sage-700', border: 'border-sage-400' };
    case 'cancelled':
      return { label: 'Cancelled', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
    case 'returned':
      return { label: 'Returned', bg: 'bg-terracotta-100', text: 'text-terracotta-600', border: 'border-terracotta-300' };
    default:
      return { label: status, bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
  }
}

/**
 * Color badge styling for Payment Status
 */
export function getPaymentStatusBadge(status: PaymentStatus): { label: string; bg: string; text: string; border: string } {
  switch (status) {
    case 'paid':
      return { label: 'Paid', bg: 'bg-sage-100', text: 'text-sage-700', border: 'border-sage-300' };
    case 'partially_paid':
      return { label: 'Partial', bg: 'bg-softpeach-100', text: 'text-terracotta-600', border: 'border-softpeach-300' };
    case 'unpaid':
      return { label: 'Unpaid', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' };
    case 'refunded':
      return { label: 'Refunded', bg: 'bg-lavender-100', text: 'text-lavender-500', border: 'border-lavender-300' };
    default:
      return { label: status, bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
  }
}

/**
 * Leather area unit conversions
 */
export function convertLeatherArea(amount: number, fromUnit: string, toUnit: string): number {
  if (fromUnit === toUnit) return amount;
  // Convert fromUnit to sq ft first
  let sqft = amount;
  switch (fromUnit) {
    case 'sq_ft':
      sqft = amount;
      break;
    case 'sq_m':
      sqft = amount * 10.7639;
      break;
    case 'sq_dm':
      sqft = amount * 0.107639;
      break;
    case 'sq_cm':
      sqft = amount * 0.00107639;
      break;
    default:
      sqft = amount;
  }
  // Convert sq ft to toUnit
  switch (toUnit) {
    case 'sq_ft':
      return sqft;
    case 'sq_m':
      return sqft / 10.7639;
    case 'sq_dm':
      return sqft / 0.107639;
    case 'sq_cm':
      return sqft / 0.00107639;
    default:
      return sqft;
  }
}
