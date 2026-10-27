'use client';

import React, { useState } from 'react';
import { Receipt, X } from 'lucide-react';
import { useAltaj } from '@/context/AltajContext';
import { Expense, ExpenseCategory } from '@/types/altaj';

interface ExpenseModalProps {
  initialExpense?: Expense | null;
  onClose: () => void;
}

export function ExpenseModal({ initialExpense, onClose }: ExpenseModalProps) {
  const { settings, saveExpenseItem } = useAltaj();

  const isEditing = !!initialExpense;

  const [description, setDescription] = useState(initialExpense?.description || '');
  const [category, setCategory] = useState<ExpenseCategory>(initialExpense?.category || 'rent_and_utilities');
  const [amount, setAmount] = useState(initialExpense?.amount ?? 150);
  const [paymentMethod, setPaymentMethod] = useState(initialExpense?.paymentMethod || 'cash');
  const [supplierRecipient, setSupplierRecipient] = useState(initialExpense?.supplierRecipient || '');
  const [receiptRef, setReceiptRef] = useState(initialExpense?.receiptRef || '');
  const [isRecurring, setIsRecurring] = useState(initialExpense?.isRecurring ?? false);
  const [isCapitalAsset, setIsCapitalAsset] = useState(initialExpense?.isCapitalAsset ?? false);
  const [date, setDate] = useState(initialExpense?.date || new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState(initialExpense?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || amount <= 0) return;

    saveExpenseItem({
      ...(initialExpense ? { id: initialExpense.id } : {}),
      description,
      category,
      amount: Number(amount),
      paymentMethod,
      supplierRecipient,
      receiptRef,
      isRecurring,
      isCapitalAsset,
      date,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full border border-cream-300 shadow-float p-6 animate-fade-in space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-cream-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-softpeach-100 text-terracotta-500 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-charcoal-900">
                {isEditing ? 'Edit Expense' : 'Log an Expense'}
              </h3>
              <p className="text-[11px] text-charcoal-500">
                {isEditing ? 'Update amount, category, or receipt reference' : 'Workshop expenses, tools, rent, utilities, or advertising'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-charcoal-400 hover:text-charcoal-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-medium text-charcoal-700 block mb-1">Expense Description *</label>
            <input
              type="text"
              required
              placeholder="e.g. Leather knives sharpening & awls"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-cream-300 rounded-xl outline-none focus:ring-1 focus:ring-sage-400 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-charcoal-700 block mb-1">Accounting Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full p-2 border border-cream-300 rounded-xl bg-white text-charcoal-800 outline-none"
              >
                <option value="rent_and_utilities">Rent & Utilities</option>
                <option value="tools_and_equipment">Tools & Equipment</option>
                <option value="repairs_and_maintenance">Maintenance & Blades</option>
                <option value="advertising">Meta/TikTok Advertising</option>
                <option value="packaging">Packaging & Boxes</option>
                <option value="shipping_and_delivery">Courier & Delivery</option>
                <option value="software_subscriptions">Software & Subscriptions</option>
                <option value="payment_processing_fees">Bank & Payment Gateway Fees</option>
                <option value="other_operating_expenses">Other Operating Costs</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-charcoal-700 block mb-1">
                Amount ({settings.currencySymbol}) *
              </label>
              <input
                type="number"
                step="5"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full p-2 border border-cream-300 rounded-xl font-serif font-bold text-sm outline-none focus:ring-1 focus:ring-sage-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-charcoal-700 block mb-1">Payee / Supplier</label>
              <input
                type="text"
                placeholder="e.g. Master Abdelkader"
                value={supplierRecipient}
                onChange={(e) => setSupplierRecipient(e.target.value)}
                className="w-full p-2 border border-cream-300 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="font-medium text-charcoal-700 block mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border border-cream-300 rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-charcoal-700 block mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-2 border border-cream-300 rounded-xl bg-white text-charcoal-800 outline-none"
              >
                <option value="cash">Cash</option>
                <option value="card">Bank Card</option>
                <option value="bank_transfer">Wire Transfer</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-charcoal-700 block mb-1">Receipt / Invoice #</label>
              <input
                type="text"
                placeholder="e.g. REC-0921"
                value={receiptRef}
                onChange={(e) => setReceiptRef(e.target.value)}
                className="w-full p-2 border border-cream-300 rounded-xl outline-none font-mono"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="pt-2 border-t border-cream-200 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="rounded text-sage-600 focus:ring-sage-400"
              />
              <span className="text-charcoal-700">Recurring expense (e.g. monthly rent, subscription)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isCapitalAsset}
                onChange={(e) => setIsCapitalAsset(e.target.checked)}
                className="rounded text-sage-600 focus:ring-sage-400"
              />
              <span className="text-charcoal-700">Capital Asset / Equipment (e.g. sewing machine, leather cutting dies)</span>
            </label>
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
              {isEditing ? 'Save Changes' : 'Record Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
