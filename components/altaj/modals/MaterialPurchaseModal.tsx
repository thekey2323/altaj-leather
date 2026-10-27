'use client';

import React, { useState } from 'react';
import { Boxes, X, Plus } from 'lucide-react';
import { useAltaj } from '@/context/AltajContext';
import { formatCurrency } from '@/lib/altaj/utils';

export function MaterialPurchaseModal({ onClose }: { onClose: () => void }) {
  const { materials, suppliers, settings, addPurchase } = useAltaj();

  const [materialId, setMaterialId] = useState(materials[0]?.id || '');
  const [quantity, setQuantity] = useState(10);
  const [unitCost, setUnitCost] = useState(materials[0]?.unitCost || 45);
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending'>('paid');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  const selectedMaterial = materials.find((m) => m.id === materialId);
  const selectedSupplier = suppliers.find((s) => s.id === supplierId);

  const totalCost = Math.round(quantity * unitCost * 100) / 100;

  const handleMaterialChange = (id: string) => {
    setMaterialId(id);
    const mat = materials.find((m) => m.id === id);
    if (mat) {
      setUnitCost(mat.unitCost);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialId || quantity <= 0) return;

    addPurchase({
      materialId,
      quantity: Number(quantity),
      unitCost: Number(unitCost),
      supplierId,
      supplierName: selectedSupplier?.name,
      purchaseDate,
      paymentStatus,
      paymentMethod,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full border border-cream-300 shadow-float p-6 animate-fade-in space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-cream-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sage-100 text-sage-600 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-charcoal-900">
                Purchase Raw Material
              </h3>
              <p className="text-[11px] text-charcoal-500">
                Receive leather hides, waxed threads, hardware, or packaging
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-charcoal-400 hover:text-charcoal-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-medium text-charcoal-700 block mb-1">Material to Restock *</label>
            <select
              value={materialId}
              onChange={(e) => handleMaterialChange(e.target.value)}
              className="w-full p-2 border border-cream-300 rounded-xl bg-cream-50 font-medium text-charcoal-800 outline-none"
            >
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.currentStock} {m.unit} in stock)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-charcoal-700 block mb-1">
                Quantity Purchased ({selectedMaterial?.unit || 'unit'}) *
              </label>
              <input
                type="number"
                step="0.5"
                min="0.1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full p-2 border border-cream-300 rounded-xl font-bold outline-none"
              />
            </div>

            <div>
              <label className="font-medium text-charcoal-700 block mb-1">
                Unit Cost ({settings.currencySymbol}) *
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                required
                value={unitCost}
                onChange={(e) => setUnitCost(Number(e.target.value))}
                className="w-full p-2 border border-cream-300 rounded-xl font-serif font-bold outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-charcoal-700 block mb-1">Supplier / Tannery</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full p-2 border border-cream-300 rounded-xl bg-white text-charcoal-800 outline-none"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-medium text-charcoal-700 block mb-1">Purchase Date</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full p-2 border border-cream-300 rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-charcoal-700 block mb-1">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as any)}
                className="w-full p-2 border border-cream-300 rounded-xl bg-white text-charcoal-800 outline-none"
              >
                <option value="paid">Paid upfront</option>
                <option value="pending">Pending / On credit</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-charcoal-700 block mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-2 border border-cream-300 rounded-xl bg-white text-charcoal-800 outline-none"
              >
                <option value="bank_transfer">Wire Transfer</option>
                <option value="cash">Cash</option>
                <option value="check">Check</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-medium text-charcoal-700 block mb-1">Notes / Supplier Batch #</label>
            <input
              type="text"
              placeholder="e.g. Grade 1 Cognac pull-up leather"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border border-cream-300 rounded-xl outline-none"
            />
          </div>

          <div className="p-3 bg-sage-50 rounded-xl border border-sage-200 flex items-center justify-between">
            <span className="text-charcoal-600 font-medium">Total Invoice Amount:</span>
            <span className="font-serif font-bold text-sage-900 text-base">
              {formatCurrency(totalCost, settings.currencySymbol)}
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-cream-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-charcoal-600 hover:bg-cream-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-sage-400 hover:bg-sage-500 text-white rounded-xl font-semibold shadow-soft"
            >
              Save & Increase Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
