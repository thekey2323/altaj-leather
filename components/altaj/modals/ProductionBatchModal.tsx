'use client';

import React, { useState, useMemo } from 'react';
import {
  Layers,
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Scissors,
  DollarSign,
} from 'lucide-react';
import { useAltaj } from '@/context/AltajContext';
import { ProductionStatus, ProductionConsumedMaterial } from '@/types/altaj';
import { formatCurrency } from '@/lib/altaj/utils';

export function ProductionBatchModal({ onClose }: { onClose: () => void }) {
  const { models, materials, settings, saveBatch } = useAltaj();

  const [selectedModelId, setSelectedModelId] = useState(models[0]?.id || '');
  const [quantityPlanned, setQuantityPlanned] = useState(10);
  const [laborTimeHours, setLaborTimeHours] = useState(12);
  const [laborRatePerHour, setLaborRatePerHour] = useState(settings.defaultLaborRatePerHour || 55);
  const [additionalCost, setAdditionalCost] = useState(25);
  const [status, setStatus] = useState<ProductionStatus>('completed');
  const [performedBy, setPerformedBy] = useState(settings.ownerName || 'Maâlem Artisan');
  const [notes, setNotes] = useState('');

  const selectedModel = useMemo(() => {
    return models.find((m) => m.id === selectedModelId);
  }, [models, selectedModelId]);

  // Compute required materials and availability
  const materialsRequired = useMemo(() => {
    if (!selectedModel || !selectedModel.recipe) return [];
    return selectedModel.recipe.map((r) => {
      const raw = materials.find((m) => m.id === r.materialId);
      const totalNeeded = Math.round(r.quantityRequired * quantityPlanned * 100) / 100;
      const currentStock = raw ? raw.currentStock : 0;
      const isSufficient = currentStock >= totalNeeded;
      const unitCost = raw ? raw.unitCost : r.estimatedUnitCost;
      const totalCost = Math.round(totalNeeded * unitCost * 100) / 100;

      return {
        materialId: r.materialId,
        materialName: r.materialName,
        quantityConsumed: totalNeeded,
        unit: (raw ? raw.unit : r.unit) as any,
        unitCost,
        totalCost,
        currentStock,
        isSufficient,
      };
    });
  }, [selectedModel, quantityPlanned, materials]);

  const hasShortage = materialsRequired.some((m) => !m.isSufficient);

  const totalMaterialCost = materialsRequired.reduce((acc, m) => acc + m.totalCost, 0);
  const actualLaborCost = Math.round(laborTimeHours * laborRatePerHour * 100) / 100;
  const totalBatchCost = Math.round((totalMaterialCost + actualLaborCost + Number(additionalCost || 0)) * 100) / 100;
  const unitCostCalculated = quantityPlanned > 0 ? Math.round((totalBatchCost / quantityPlanned) * 100) / 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModelId || quantityPlanned <= 0) return;

    if (hasShortage && status === 'completed') {
      const ok = window.confirm(
        'Some raw materials have insufficient inventory. Do you still want to proceed and finalize this production batch?'
      );
      if (!ok) return;
    }

    saveBatch({
      modelId: selectedModelId,
      quantityPlanned: Number(quantityPlanned),
      quantityCompleted: status === 'completed' ? Number(quantityPlanned) : 0,
      quantityDefects: 0,
      status,
      materialsConsumed: materialsRequired.map((m) => ({
        materialId: m.materialId,
        materialName: m.materialName,
        quantityConsumed: m.quantityConsumed,
        unit: m.unit,
        unitCost: m.unitCost,
        totalCost: m.totalCost,
      })),
      actualMaterialCost: totalMaterialCost,
      laborTimeHours: Number(laborTimeHours),
      laborRatePerHour: Number(laborRatePerHour),
      actualLaborCost,
      additionalCost: Number(additionalCost) || 0,
      totalBatchCost,
      unitCostCalculated,
      performedBy,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto border border-cream-300 shadow-float p-6 animate-fade-in space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-cream-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-lavender-100 text-lavender-500 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-charcoal-900">
                Start Production Batch
              </h3>
              <p className="text-[11px] text-charcoal-500">
                Automatically deducts raw materials and adds to finished wallet stock
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
          {/* Model & Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-charcoal-700 block mb-1">
                Wallet Model to Produce *
              </label>
              <select
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
                className="w-full p-2 border border-cream-300 rounded-xl bg-cream-50 font-medium text-charcoal-800 outline-none"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.sku})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-medium text-charcoal-700 block mb-1">
                Quantity of Units to Produce *
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantityPlanned}
                onChange={(e) => setQuantityPlanned(Math.max(1, Number(e.target.value)))}
                className="w-full p-2 border border-cream-300 rounded-xl font-bold text-sm outline-none"
              />
            </div>
          </div>

          {/* BOM Material deduction preview */}
          <div className="space-y-2">
            <label className="font-semibold text-charcoal-800 uppercase tracking-wider text-[10px] block">
              Required Raw Materials (Per BOM Recipe)
            </label>

            {materialsRequired.length > 0 ? (
              <div className="border border-cream-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-cream-100 text-[10px] uppercase font-semibold text-charcoal-600">
                    <tr>
                      <th className="p-2">Material</th>
                      <th className="p-2 text-right">Batch Need</th>
                      <th className="p-2 text-right">In Stock</th>
                      <th className="p-2 text-right">Est. Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-100">
                    {materialsRequired.map((mat, idx) => (
                      <tr key={idx} className={!mat.isSufficient ? 'bg-softpeach-50' : ''}>
                        <td className="p-2 font-medium text-charcoal-800">
                          {mat.materialName}
                        </td>
                        <td className="p-2 text-right font-bold text-charcoal-900">
                          {mat.quantityConsumed} {mat.unit}
                        </td>
                        <td className="p-2 text-right">
                          <span className={`font-medium ${!mat.isSufficient ? 'text-terracotta-600 font-bold' : 'text-charcoal-600'}`}>
                            {mat.currentStock} {mat.unit}
                          </span>
                        </td>
                        <td className="p-2 text-right font-serif font-medium text-charcoal-900">
                          {formatCurrency(mat.totalCost, settings.currencySymbol)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-charcoal-500 italic p-3 bg-cream-50 rounded-xl text-center">
                This model does not have a BOM recipe configured yet.
              </p>
            )}

            {hasShortage && (
              <div className="p-2.5 rounded-xl bg-softpeach-100 border border-softpeach-300 text-terracotta-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-terracotta-600 shrink-0" />
                <span>Notice: Current stock is insufficient for the total materials required for this batch.</span>
              </div>
            )}
          </div>

          {/* Labor Tracking */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-cream-50 rounded-2xl border border-cream-200">
            <div>
              <label className="font-medium text-charcoal-700 block mb-1">
                Labor Hours
              </label>
              <input
                type="number"
                step="0.5"
                value={laborTimeHours}
                onChange={(e) => setLaborTimeHours(Number(e.target.value))}
                className="w-full p-2 border border-cream-300 rounded-xl outline-none font-medium"
              />
            </div>

            <div>
              <label className="font-medium text-charcoal-700 block mb-1">
                Hourly Rate ({settings.currencySymbol}/h)
              </label>
              <input
                type="number"
                value={laborRatePerHour}
                onChange={(e) => setLaborRatePerHour(Number(e.target.value))}
                className="w-full p-2 border border-cream-300 rounded-xl outline-none font-medium"
              />
            </div>

            <div>
              <label className="font-medium text-charcoal-700 block mb-1">
                Workshop Overhead ({settings.currencySymbol})
              </label>
              <input
                type="number"
                value={additionalCost}
                onChange={(e) => setAdditionalCost(Number(e.target.value))}
                className="w-full p-2 border border-cream-300 rounded-xl outline-none font-medium"
              />
            </div>
          </div>

          {/* Performed by & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-charcoal-700 block mb-1">Artisan / Craftsperson</label>
              <input
                type="text"
                value={performedBy}
                onChange={(e) => setPerformedBy(e.target.value)}
                className="w-full p-2 border border-cream-300 rounded-xl outline-none font-medium"
              />
            </div>

            <div>
              <label className="font-medium text-charcoal-700 block mb-1">Batch Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProductionStatus)}
                className="w-full p-2 border border-cream-300 rounded-xl bg-white text-charcoal-800 outline-none"
              >
                <option value="completed">Completed (Deducts materials + Adds finished stock)</option>
                <option value="in_progress">In Progress (Not deducted yet)</option>
                <option value="draft">Draft / Planned order</option>
              </select>
            </div>
          </div>

          {/* Cost Summary Banner */}
          <div className="p-3.5 rounded-2xl bg-sage-50 border border-sage-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-charcoal-500 uppercase block">Total Batch Cost</span>
              <div className="text-lg font-serif font-bold text-sage-900">
                {formatCurrency(totalBatchCost, settings.currencySymbol)}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-charcoal-500 uppercase block">Real Cost Per Finished Unit</span>
              <div className="text-base font-serif font-bold text-sage-700">
                {formatCurrency(unitCostCalculated, settings.currencySymbol)}
              </div>
            </div>
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
              {status === 'completed' ? 'Confirm & Complete Batch' : 'Save Production Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
