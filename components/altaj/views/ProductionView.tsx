'use client';

import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Clock,
  Scissors,
  CheckCircle2,
  AlertTriangle,
  Play,
  Check,
  X,
  FileText,
  User,
  DollarSign,
  ChevronRight,
  Edit,
  Trash2,
} from 'lucide-react';
import { useAltaj } from '@/context/AltajContext';
import { ProductionBatch, ProductionStatus } from '@/types/altaj';
import { formatCurrency, formatDate } from '@/lib/altaj/utils';

export function ProductionView() {
  const {
    batches,
    models,
    materials,
    settings,
    saveBatch,
    deleteBatch,
    openQuickActionModal,
  } = useAltaj();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedBatch, setSelectedBatch] = useState<ProductionBatch | null>(null);
  const [editingBatch, setEditingBatch] = useState<ProductionBatch | null>(null);

  // Batch edit form states
  const [editPlannedQty, setEditPlannedQty] = useState(1);
  const [editCompletedQty, setEditCompletedQty] = useState(0);
  const [editLaborHours, setEditLaborHours] = useState(1);
  const [editStatus, setEditStatus] = useState<ProductionStatus>('in_progress');
  const [editNotes, setEditNotes] = useState('');

  const handleOpenEditBatch = (b: ProductionBatch) => {
    setEditingBatch(b);
    setEditPlannedQty(b.quantityPlanned);
    setEditCompletedQty(b.quantityCompleted);
    setEditLaborHours(b.laborTimeHours);
    setEditStatus(b.status);
    setEditNotes(b.notes || '');
  };

  const handleSaveEditedBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatch) return;
    saveBatch({
      ...editingBatch,
      quantityPlanned: Number(editPlannedQty),
      quantityCompleted: Number(editCompletedQty),
      laborTimeHours: Number(editLaborHours),
      status: editStatus,
      notes: editNotes,
    });
    setEditingBatch(null);
  };

  const filteredBatches = batches.filter((b) => {
    return filterStatus === 'all' || b.status === filterStatus;
  });

  const getStatusBadge = (status: ProductionStatus) => {
    switch (status) {
      case 'draft':
        return { label: 'Draft', bg: 'bg-cream-200 text-charcoal-700' };
      case 'in_progress':
        return { label: 'In Workshop', bg: 'bg-lavender-100 text-lavender-500 font-semibold' };
      case 'completed':
        return { label: 'Completed', bg: 'bg-sage-100 text-sage-700 font-semibold' };
      case 'cancelled':
        return { label: 'Cancelled', bg: 'bg-red-50 text-red-600' };
      default:
        return { label: status, bg: 'bg-gray-100 text-gray-700' };
    }
  };

  const handleMarkCompleted = (batch: ProductionBatch) => {
    saveBatch({
      ...batch,
      status: 'completed',
      quantityCompleted: batch.quantityPlanned,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-xl md:text-2xl text-charcoal-900">
            Workshop & Crafting Batches ({batches.length})
          </h2>
          <p className="text-xs md:text-sm text-charcoal-500">
            Track leather cutting, saddle stitching, real material consumption, and labor hours
          </p>
        </div>

        <button
          type="button"
          onClick={() => openQuickActionModal('record_production')}
          className="flex items-center gap-2 px-4 py-2.5 bg-sage-400 hover:bg-sage-500 text-white rounded-xl text-xs md:text-sm font-semibold shadow-soft transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Start Production Batch</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center gap-2 border-b border-cream-300 pb-2">
        {['all', 'in_progress', 'completed', 'draft', 'cancelled'].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
              filterStatus === st
                ? 'bg-sage-400 text-white shadow-soft'
                : 'text-charcoal-600 hover:bg-cream-100'
            }`}
          >
            {st === 'all'
              ? 'All Batches'
              : st === 'in_progress'
              ? 'In Progress'
              : st === 'completed'
              ? 'Completed'
              : st === 'draft'
              ? 'Drafts'
              : 'Cancelled'}
          </button>
        ))}
      </div>

      {/* Batches Table / Cards */}
      {filteredBatches.length > 0 ? (
        <div className="bg-white rounded-2xl border border-cream-300 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream-100 border-b border-cream-200 text-[11px] font-semibold text-charcoal-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Batch #</th>
                  <th className="py-3 px-4">Wallet Model</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Planned / Done</th>
                  <th className="py-3 px-4 text-right">Labor Time</th>
                  <th className="py-3 px-4 text-right">Material Cost</th>
                  <th className="py-3 px-4 text-right">Total Batch Cost</th>
                  <th className="py-3 px-4 text-right">Real Unit Cost</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100 text-xs">
                {filteredBatches.map((batch) => {
                  const badge = getStatusBadge(batch.status);
                  return (
                    <tr key={batch.id} className="hover:bg-cream-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-charcoal-800">
                        {batch.batchNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-charcoal-900">{batch.modelName}</div>
                        <div className="text-[10px] text-charcoal-500 font-mono">{batch.sku}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-serif font-bold text-charcoal-900">
                        {batch.quantityCompleted} / {batch.quantityPlanned} pcs
                      </td>
                      <td className="py-3 px-4 text-right text-charcoal-700">
                        {batch.laborTimeHours} h (@{batch.laborRatePerHour} {settings.currencySymbol})
                      </td>
                      <td className="py-3 px-4 text-right font-serif text-charcoal-700">
                        {formatCurrency(batch.actualMaterialCost, settings.currencySymbol)}
                      </td>
                      <td className="py-3 px-4 text-right font-serif font-bold text-charcoal-900">
                        {formatCurrency(batch.totalBatchCost, settings.currencySymbol)}
                      </td>
                      <td className="py-3 px-4 text-right font-serif text-sage-700 font-bold">
                        {formatCurrency(batch.unitCostCalculated, settings.currencySymbol)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {batch.status === 'in_progress' && (
                            <button
                              type="button"
                              onClick={() => handleMarkCompleted(batch)}
                              className="px-2 py-1 bg-sage-400 hover:bg-sage-500 text-white rounded-lg text-xs font-medium transition-colors"
                              title="Complete and add to finished goods inventory"
                            >
                              Finish
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenEditBatch(batch)}
                            className="p-1 rounded-lg text-sage-600 hover:text-sage-800 hover:bg-sage-50 transition-colors"
                            title="Edit this batch"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteBatch(batch.id)}
                            className="p-1 rounded-lg text-charcoal-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete this batch"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedBatch(batch)}
                            className="px-2 py-1 bg-cream-100 hover:bg-cream-200 text-charcoal-700 rounded-lg text-xs font-medium transition-colors"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-cream-300 p-12 text-center">
          <Layers className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
          <h3 className="font-serif font-bold text-lg text-charcoal-800">
            No production orders found
          </h3>
          <p className="text-xs text-charcoal-500 mt-1 max-w-sm mx-auto">
            Start a production batch to automatically deduct leathers and threads from inventory.
          </p>
          <button
            type="button"
            onClick={() => openQuickActionModal('record_production')}
            className="mt-4 px-4 py-2 bg-sage-400 hover:bg-sage-500 text-white rounded-xl text-xs font-semibold shadow-soft"
          >
            + Start Batch
          </button>
        </div>
      )}

      {/* Batch Detail Modal */}
      {selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-cream-300 shadow-float p-6 animate-fade-in space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-cream-200">
              <div>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-cream-200 text-charcoal-700 font-bold">
                  {selectedBatch.batchNumber}
                </span>
                <h3 className="font-serif font-bold text-lg text-charcoal-900 mt-1">
                  {selectedBatch.modelName} ({selectedBatch.quantityPlanned} units)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBatch(null)}
                className="p-1 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-cream-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-cream-50 rounded-xl border border-cream-200">
                <span className="text-[10px] text-charcoal-500 block">Artisan / Craftsperson</span>
                <strong className="text-charcoal-800">{selectedBatch.performedBy}</strong>
              </div>
              <div className="p-3 bg-cream-50 rounded-xl border border-cream-200">
                <span className="text-[10px] text-charcoal-500 block">Start Date</span>
                <strong className="text-charcoal-800">{formatDate(selectedBatch.startDate)}</strong>
              </div>
              <div className="p-3 bg-cream-50 rounded-xl border border-cream-200">
                <span className="text-[10px] text-charcoal-500 block">Labor</span>
                <strong className="text-charcoal-800">
                  {selectedBatch.laborTimeHours} h (@{selectedBatch.laborRatePerHour} {settings.currencySymbol}) = {formatCurrency(selectedBatch.actualLaborCost, settings.currencySymbol)}
                </strong>
              </div>
              <div className="p-3 bg-cream-50 rounded-xl border border-cream-200">
                <span className="text-[10px] text-charcoal-500 block">Real Unit Cost</span>
                <strong className="text-sage-700 font-serif text-sm">
                  {formatCurrency(selectedBatch.unitCostCalculated, settings.currencySymbol)}
                </strong>
              </div>
            </div>

            {/* Consumed Materials */}
            <div>
              <h4 className="text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-2">
                Consumed Raw Materials
              </h4>
              <div className="border border-cream-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-cream-100 text-[10px] uppercase font-semibold text-charcoal-600">
                    <tr>
                      <th className="p-2">Material</th>
                      <th className="p-2 text-right">Qty</th>
                      <th className="p-2 text-right">Total Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-100">
                    {selectedBatch.materialsConsumed?.map((mc, idx) => (
                      <tr key={idx}>
                        <td className="p-2 text-charcoal-800">{mc.materialName}</td>
                        <td className="p-2 text-right text-charcoal-600">{mc.quantityConsumed} {mc.unit}</td>
                        <td className="p-2 text-right font-serif font-medium text-charcoal-900">
                          {formatCurrency(mc.totalCost, settings.currencySymbol)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedBatch.notes && (
              <p className="text-xs text-charcoal-600 bg-cream-50 p-3 rounded-xl border border-cream-200">
                {selectedBatch.notes}
              </p>
            )}

            <div className="flex justify-end pt-2 border-t border-cream-200">
              <button
                type="button"
                onClick={() => setSelectedBatch(null)}
                className="px-4 py-2 bg-cream-200 hover:bg-cream-300 text-charcoal-800 rounded-xl text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Batch Modal */}
      {editingBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full border border-cream-300 shadow-float p-6 animate-fade-in space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cream-200">
              <div>
                <h3 className="font-serif font-bold text-lg text-charcoal-900">
                  Edit Production Batch
                </h3>
                <p className="text-xs text-charcoal-500 font-mono">
                  {editingBatch.batchNumber} • {editingBatch.modelName}
                </p>
              </div>
              <button type="button" onClick={() => setEditingBatch(null)}>
                <X className="w-5 h-5 text-charcoal-400" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedBatch} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-charcoal-700 block mb-1">Planned Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={editPlannedQty}
                    onChange={(e) => setEditPlannedQty(Number(e.target.value))}
                    className="w-full p-2 border border-cream-300 rounded-xl outline-none font-serif font-bold"
                  />
                </div>
                <div>
                  <label className="font-medium text-charcoal-700 block mb-1">Completed Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={editCompletedQty}
                    onChange={(e) => setEditCompletedQty(Number(e.target.value))}
                    className="w-full p-2 border border-cream-300 rounded-xl outline-none font-serif font-bold text-sage-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-charcoal-700 block mb-1">Workshop Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={editLaborHours}
                    onChange={(e) => setEditLaborHours(Number(e.target.value))}
                    className="w-full p-2 border border-cream-300 rounded-xl outline-none font-serif"
                  />
                </div>
                <div>
                  <label className="font-medium text-charcoal-700 block mb-1">Batch Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as ProductionStatus)}
                    className="w-full p-2 border border-cream-300 rounded-xl outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="in_progress">In Workshop</option>
                    <option value="completed">Completed & in Stock</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-medium text-charcoal-700 block mb-1">Workshop Notes</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full p-2 border border-cream-300 rounded-xl outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-cream-200">
                <button
                  type="button"
                  onClick={() => setEditingBatch(null)}
                  className="px-4 py-2 text-charcoal-600 hover:bg-cream-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sage-400 hover:bg-sage-500 text-white rounded-xl font-semibold shadow-soft"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
