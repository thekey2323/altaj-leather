'use client';

import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Plus,
  Trash2,
  X,
  TrendingUp,
} from 'lucide-react';
import { useAltaj } from '@/context/AltajContext';
import { OrderLineItem, SalesChannel, PaymentMethod, OrderStatus, SalesOrder } from '@/types/altaj';
import { formatCurrency } from '@/lib/altaj/utils';

interface NewSaleModalProps {
  initialOrder?: SalesOrder | null;
  onClose: () => void;
}

export function NewSaleModal({ initialOrder, onClose }: NewSaleModalProps) {
  const { models, customers, settings, saveOrder } = useAltaj();

  const isEditing = !!initialOrder;

  // Customer info
  const [customerName, setCustomerName] = useState(initialOrder?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(initialOrder?.customerPhone || '');
  const [customerCity, setCustomerCity] = useState(initialOrder?.customerCity || 'Casablanca');
  const [customerAddress, setCustomerAddress] = useState(initialOrder?.customerAddress || '');
  const [channel, setChannel] = useState<SalesChannel>(initialOrder?.channel || 'direct_atelier');

  // Line items
  const [items, setItems] = useState<{ modelId: string; quantity: number }[]>(
    initialOrder?.items && initialOrder.items.length > 0
      ? initialOrder.items.map((i) => ({ modelId: i.modelId, quantity: i.quantity }))
      : [{ modelId: models[0]?.id || '', quantity: 1 }]
  );

  // Financials
  const [discount, setDiscount] = useState<number>(initialOrder?.discount ?? 0);
  const [shippingCharged, setShippingCharged] = useState<number>(initialOrder?.shippingCharged ?? (settings.defaultShippingCharged || 20));
  const [shippingCostActual, setShippingCostActual] = useState<number>(initialOrder?.shippingCostActual ?? (settings.defaultShippingCostActual || 35));
  const [amountPaid, setAmountPaid] = useState<number>(initialOrder?.amountPaid ?? (initialOrder ? 0 : 0));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initialOrder?.paymentMethod || 'cod');
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(initialOrder?.orderStatus || 'delivered');
  const [notes, setNotes] = useState(initialOrder?.notes || '');

  // Auto-fill from existing customer if phone matches
  const handlePhoneBlur = () => {
    if (!customerPhone) return;
    const existing = customers.find((c) => c.phone === customerPhone);
    if (existing) {
      if (!customerName) setCustomerName(existing.name);
      if (existing.city) setCustomerCity(existing.city);
      if (existing.address) setCustomerAddress(existing.address);
    }
  };

  // Compute line items with prices and costs
  const populatedItems: OrderLineItem[] = useMemo(() => {
    return items
      .map((it) => {
        const mod = models.find((m) => m.id === it.modelId);
        if (!mod) return null;
        return {
          modelId: mod.id,
          modelName: mod.name,
          sku: mod.sku,
          photoUrl: mod.photoUrl,
          quantity: it.quantity,
          unitPrice: mod.sellingPrice,
          unitCost: mod.unitProductionCost,
          totalPrice: mod.sellingPrice * it.quantity,
          totalCost: mod.unitProductionCost * it.quantity,
        };
      })
      .filter(Boolean) as OrderLineItem[];
  }, [items, models]);

  const subtotal = populatedItems.reduce((acc, it) => acc + it.totalPrice, 0);
  const totalCost = populatedItems.reduce((acc, it) => acc + it.totalCost, 0);
  const totalAmount = Math.max(0, subtotal - discount + Number(shippingCharged || 0));
  const estimatedProfit = Math.max(0, totalAmount - totalCost - Number(shippingCostActual || 0) + Number(shippingCharged || 0));

  const handleStatusOrMethodChange = (st: OrderStatus, pm: PaymentMethod) => {
    setOrderStatus(st);
    setPaymentMethod(pm);
    if (st === 'delivered' && (pm === 'cash' || pm === 'card')) {
      setAmountPaid(totalAmount);
    }
  };

  const addItemRow = () => {
    if (models.length > 0) {
      setItems([...items, { modelId: models[0].id, quantity: 1 }]);
    }
  };

  const removeItemRow = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const updateItemRow = (idx: number, modelId: string, quantity: number) => {
    const next = [...items];
    next[idx] = { modelId, quantity: Math.max(1, quantity) };
    setItems(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || populatedItems.length === 0) return;

    saveOrder({
      ...(initialOrder ? { id: initialOrder.id, orderNumber: initialOrder.orderNumber } : {}),
      customerName,
      customerPhone,
      customerCity,
      customerAddress,
      channel,
      items: populatedItems,
      subtotal,
      discount: Number(discount) || 0,
      shippingCharged: Number(shippingCharged) || 0,
      shippingCostActual: Number(shippingCostActual) || 0,
      totalAmount,
      amountPaid: Number(amountPaid) || 0,
      paymentMethod,
      orderStatus,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-cream-300 shadow-float p-6 animate-fade-in space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cream-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-charcoal-900">
                {isEditing ? `Edit Order #${initialOrder?.orderNumber}` : 'Record New Order / Sale'}
              </h3>
              <p className="text-[11px] text-charcoal-500">
                {isEditing
                  ? 'Update customer details, status, items, or payments'
                  : 'Direct workshop sale, WhatsApp, Instagram, or COD shipment'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-cream-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Customer & Channel */}
          <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200 space-y-3">
            <h4 className="font-semibold text-charcoal-800 uppercase tracking-wider text-[10px]">
              Customer & Sales Channel
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-medium text-charcoal-700 block mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Youssef Alami"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2 border border-cream-300 rounded-xl outline-none focus:ring-1 focus:ring-sage-400"
                />
              </div>

              <div>
                <label className="font-medium text-charcoal-700 block mb-1">Phone (WhatsApp)</label>
                <input
                  type="text"
                  placeholder="+212 6..."
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  onBlur={handlePhoneBlur}
                  className="w-full p-2 border border-cream-300 rounded-xl outline-none focus:ring-1 focus:ring-sage-400"
                />
              </div>

              <div>
                <label className="font-medium text-charcoal-700 block mb-1">Sales Channel</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as SalesChannel)}
                  className="w-full p-2 border border-cream-300 rounded-xl bg-white text-charcoal-800 outline-none"
                >
                  <option value="direct_atelier">Workshop Direct (Fez)</option>
                  <option value="whatsapp">WhatsApp Order</option>
                  <option value="instagram">Instagram Direct</option>
                  <option value="website">Online Store</option>
                  <option value="boutique_partner">Partner Boutique</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-charcoal-700 block mb-1">Destination City</label>
                <input
                  type="text"
                  value={customerCity}
                  onChange={(e) => setCustomerCity(e.target.value)}
                  className="w-full p-2 border border-cream-300 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="font-medium text-charcoal-700 block mb-1">Full Shipping Address</label>
                <input
                  type="text"
                  placeholder="Neighborhood, street, building..."
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full p-2 border border-cream-300 rounded-xl outline-none"
                />
              </div>
            </div>
          </div>

          {/* Line items selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-charcoal-800 uppercase tracking-wider text-[10px]">
                Ordered Wallets
              </label>
              <button
                type="button"
                onClick={addItemRow}
                className="text-emerald-700 hover:text-emerald-800 text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> + Add Model
              </button>
            </div>

            <div className="space-y-2">
              {items.map((row, idx) => {
                const currentMod = models.find((m) => m.id === row.modelId);
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 bg-cream-50 rounded-xl border border-cream-200"
                  >
                    <div className="flex-1">
                      <select
                        value={row.modelId}
                        onChange={(e) => updateItemRow(idx, e.target.value, row.quantity)}
                        className="w-full p-1.5 border border-cream-300 rounded-lg bg-white font-medium text-charcoal-800 outline-none"
                      >
                        {models.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} — {formatCurrency(m.sellingPrice, settings.currencySymbol)} (Stock: {m.finishedStock})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-20">
                      <input
                        type="number"
                        min="1"
                        value={row.quantity}
                        onChange={(e) => updateItemRow(idx, row.modelId, Number(e.target.value))}
                        className="w-full p-1.5 border border-cream-300 rounded-lg text-center font-bold"
                      />
                    </div>

                    <div className="w-24 text-right font-serif font-bold text-charcoal-900">
                      {currentMod ? formatCurrency(currentMod.sellingPrice * row.quantity, settings.currencySymbol) : '—'}
                    </div>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItemRow(idx)}
                        className="p-1 text-charcoal-400 hover:text-red-500 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing Adjustments & Delivery */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-cream-50 rounded-2xl border border-cream-200">
            <div>
              <label className="font-medium text-charcoal-700 block mb-1">
                Discount / Promo ({settings.currencySymbol})
              </label>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full p-2 border border-cream-300 rounded-xl outline-none font-medium"
              />
            </div>

            <div>
              <label className="font-medium text-charcoal-700 block mb-1">
                Shipping Charged to Client ({settings.currencySymbol})
              </label>
              <input
                type="number"
                min="0"
                value={shippingCharged}
                onChange={(e) => setShippingCharged(Number(e.target.value))}
                className="w-full p-2 border border-cream-300 rounded-xl outline-none font-medium"
              />
            </div>

            <div>
              <label className="font-medium text-charcoal-700 block mb-1">
                Courier Real Delivery Cost ({settings.currencySymbol})
              </label>
              <input
                type="number"
                min="0"
                value={shippingCostActual}
                onChange={(e) => setShippingCostActual(Number(e.target.value))}
                className="w-full p-2 border border-cream-300 rounded-xl outline-none font-medium"
              />
            </div>
          </div>

          {/* Payment & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-medium text-charcoal-700 block mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => handleStatusOrMethodChange(orderStatus, e.target.value as PaymentMethod)}
                className="w-full p-2 border border-cream-300 rounded-xl bg-white text-charcoal-800 outline-none"
              >
                <option value="cod">Cash On Delivery (COD)</option>
                <option value="cash">Workshop Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="card">Credit Card / POS</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-charcoal-700 block mb-1">Order Status</label>
              <select
                value={orderStatus}
                onChange={(e) => handleStatusOrMethodChange(e.target.value as OrderStatus, paymentMethod)}
                className="w-full p-2 border border-cream-300 rounded-xl bg-white text-charcoal-800 outline-none"
              >
                <option value="delivered">Delivered (Recognized in Revenue & Profit)</option>
                <option value="shipped">Shipped (Stock Deducted)</option>
                <option value="confirmed">Confirmed (Stock Reserved)</option>
                <option value="in_production">In Production</option>
                <option value="new">New (Pending Confirmation)</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-charcoal-700 block mb-1">
                Actual Cash Collected ({settings.currencySymbol})
              </label>
              <input
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(Number(e.target.value))}
                className="w-full p-2 border border-cream-300 rounded-xl font-bold font-serif text-emerald-800 outline-none"
              />
              <span className="text-[10px] text-charcoal-400 block mt-0.5">
                0 for unpaid COD, full amount for direct sale
              </span>
            </div>
          </div>

          {/* Financial summary bar */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-charcoal-500 uppercase block">Total Order Revenue</span>
              <div className="text-xl font-serif font-bold text-emerald-900">
                {formatCurrency(totalAmount, settings.currencySymbol)}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-charcoal-500 uppercase block">Estimated Net Gain</span>
              <div className="text-base font-serif font-bold text-emerald-700 flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                +{formatCurrency(estimatedProfit, settings.currencySymbol)}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-cream-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-charcoal-600 hover:bg-cream-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-soft transition-all"
            >
              {isEditing ? 'Save Changes' : 'Record Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
