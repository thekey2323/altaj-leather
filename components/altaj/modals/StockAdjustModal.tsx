'use client';

import React, { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { useAltaj } from '@/context/AltajContext';

export function StockAdjustModal({ onClose }: { onClose: () => void }) {
  const { models, materials, manualStockAdjust } = useAltaj();

  const [itemType, setItemType] = useState<'finished_goods' | 'raw_material'>('finished_goods');
  const [selectedId, setSelectedId] = useState(models[0]?.id || '');
  const [quantityChange, setQuantityChange] = useState<number>(1);
  const [reason, setReason] = useState('Periodic physical inventory check');

  const handleTypeChange = (type: 'finished_goods' | 'raw_material') => {
    setItemType(type);
    if (type === 'finished_goods') {
      setSelectedId(models[0]?.id || '');
    } else {
      setSelectedId(materials[0]?.id || '');
    }
  };

  const currentItem = itemType === 'finished_goods'
    ? models.find((m) => m.id === selectedId)
    : materials.find((m) => m.id === selectedId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || quantityChange === 0) return;

    manualStockAdjust({
      itemId: selectedId,
      itemType,
      quantityChange: Number(quantityChange),
      reason,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full border border-cream-300 shadow-float p-6 animate-fade-in space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-cream-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cream-200 text-charcoal-700 flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-charcoal-900">
                Manual Stock Adjustment
              </h3>
              <p className="text-[11px] text-charcoal-500">
                Inventory reconciliation, scrap, or corrections
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-charcoal-400 hover:text-charcoal-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* Select Type */}
          <div>
            <label className="font-medium text-charcoal-700 block mb-1">Item Type to Adjust</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('finished_goods')}
                className={`py-2 px-3 rounded-xl border text-center font-medium transition-all ${
                  itemType === 'finished_goods'
                    ? 'border-sage-400 bg-sage-50 text-sage-900 font-bold'
                    : 'border-cream-300 text-charcoal-700 hover:bg-cream-50'
                }`}
              >
                Finished Wallet
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('raw_material')}
                className={`py-2 px-3 rounded-xl border text-center font-medium transition-all ${
                  itemType === 'raw_material'
                    ? 'border-sage-400 bg-sage-50 text-sage-900 font-bold'
                    : 'border-cream-300 text-charcoal-700 hover:bg-cream-50'
                }`}
              >
                Raw Material / Leather
              </button>
            </div>
          </div>

          {/* Select Item */}
          <div>
            <label className="font-medium text-charcoal-700 block mb-1">Item</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full p-2 border border-cream-300 rounded-xl bg-cream-50 font-medium text-charcoal-800 outline-none"
            >
              {itemType === 'finished_goods'
                ? models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} (Current stock: {m.finishedStock})
                    </option>
                  ))
                : materials.map((mat) => (
                    <option key={mat.id} value={mat.id}>
                      {mat.name} (Current stock: {mat.currentStock} {mat.unit})
                    </option>
                  ))}
            </select>
          </div>

          {/* Variation */}
          <div>
            <label className="font-medium text-charcoal-700 block mb-1">
              Quantity Variation (+ to add, − to deduct)
            </label>
            <input
              type="number"
              step={itemType === 'raw_material' ? '0.1' : '1'}
              required
              value={quantityChange}
              onChange={(e) => setQuantityChange(Number(e.target.value))}
              className="w-full p-2 border border-cream-300 rounded-xl font-bold font-serif text-sm outline-none"
            />
            {currentItem && (
              <span className="text-[10px] text-charcoal-500 block mt-0.5">
                New calculated stock:{' '}
                <strong>
                  {itemType === 'finished_goods'
                    ? Math.max(0, (currentItem as any).finishedStock + quantityChange)
                    : Math.max(0, (currentItem as any).currentStock + quantityChange)}{' '}
                  {itemType === 'raw_material' ? (currentItem as any).unit : 'units'}
                </strong>
              </span>
            )}
          </div>

          <div>
            <label className="font-medium text-charcoal-700 block mb-1">Reason / Justification</label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2 border border-cream-300 rounded-xl outline-none"
            />
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
              Apply Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
