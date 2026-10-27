'use client';

import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  DollarSign,
  AlertCircle,
  ShieldCheck,
  Calendar,
  Tag,
  Trash2,
  Repeat,
  SlidersHorizontal,
  Edit,
} from 'lucide-react';
import { useAltaj } from '@/context/AltajContext';
import { Expense, ExpenseCategory } from '@/types/altaj';
import { formatCurrency, formatDate } from '@/lib/altaj/utils';
import { ExpenseModal } from '../modals/ExpenseModal';

export function ExpensesView() {
  const {
    expenses,
    financials,
    settings,
    saveExpenseItem,
    deleteExpenseItem,
    openQuickActionModal,
  } = useAltaj();

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categoryLabels: Record<ExpenseCategory | 'all', string> = {
    all: 'All Categories',
    leather_and_raw_materials: 'Raw Materials & Leather (Asset)',
    tools_and_equipment: 'Workshop Tools & Equipment',
    repairs_and_maintenance: 'Maintenance & Blade Sharpening',
    packaging: 'Packaging & Boxes',
    shipping_and_delivery: 'Shipping & Logistics',
    advertising: 'Advertising & Marketing (Meta/TikTok)',
    marketplace_commissions: 'Marketplace Fees & Commissions',
    payment_processing_fees: 'Bank & Payment Processing Fees',
    rent_and_utilities: 'Workshop Rent & Utilities',
    software_subscriptions: 'Software & Cloud Subscriptions',
    other_operating_expenses: 'Other Operating Expenses',
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        e.description.toLowerCase().includes(q) ||
        (e.supplierRecipient || '').toLowerCase().includes(q) ||
        (e.receiptRef || '').toLowerCase().includes(q);

      const matchesCat = categoryFilter === 'all' || e.category === categoryFilter;

      return matchesSearch && matchesCat;
    });
  }, [expenses, searchQuery, categoryFilter]);

  // Total operating expenses vs capitalized/materials
  const totalOperating = useMemo(() => {
    return expenses
      .filter((e) => e.category !== 'leather_and_raw_materials' && !e.isCapitalAsset)
      .reduce((acc, e) => acc + e.amount, 0);
  }, [expenses]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-xl md:text-2xl text-charcoal-900">
            Expenses & Overhead ({expenses.length})
          </h2>
          <p className="text-xs md:text-sm text-charcoal-500">
            Accurate accounting without double-counting raw leather inventory
          </p>
        </div>

        <button
          type="button"
          onClick={() => openQuickActionModal('add_expense')}
          className="flex items-center gap-2 px-4 py-2.5 bg-sage-400 hover:bg-sage-500 text-white rounded-xl text-xs md:text-sm font-semibold shadow-soft transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Log an Expense</span>
        </button>
      </div>

      {/* Accounting Notice Banner */}
      <div className="p-4 rounded-2xl bg-cream-100 border border-cream-300 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-sage-600 shrink-0 mt-0.5" />
        <div className="text-xs text-charcoal-700 leading-relaxed">
          <strong className="font-semibold text-charcoal-900 block mb-0.5">
            ALTAJ Anti-Double-Count Accounting Rule:
          </strong>
          Purchases of leather and raw materials are recorded as <em>inventory assets</em> on the balance sheet. They enter the Cost of Goods Sold (COGS) only when finished wallets are actually sold. Workshop rent, utilities, tooling, and ad spend are accounted for separately here.
        </div>
      </div>

      {/* Total Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-cream-300 shadow-xs">
          <span className="text-xs text-charcoal-500 block">Total Operating Expenses (OPEX)</span>
          <div className="mt-1 text-2xl font-serif font-bold text-charcoal-900">
            {formatCurrency(totalOperating, settings.currencySymbol)}
          </div>
          <span className="text-[10px] text-charcoal-400">Deducted from operating income</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-cream-300 shadow-xs">
          <span className="text-xs text-charcoal-500 block">Filtered Period Expenses</span>
          <div className="mt-1 text-2xl font-serif font-bold text-sage-700">
            {formatCurrency(financials.operatingExpenses, settings.currencySymbol)}
          </div>
          <span className="text-[10px] text-charcoal-400">Based on active date range</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-cream-300 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-charcoal-500 block">Actions</span>
            <span className="text-xs font-semibold text-charcoal-800">Quick Entry</span>
          </div>
          <button
            type="button"
            onClick={() => openQuickActionModal('add_expense')}
            className="px-3 py-1.5 bg-cream-100 hover:bg-cream-200 border border-cream-300 rounded-xl text-xs font-medium text-charcoal-800"
          >
            + New Expense
          </button>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white p-3.5 rounded-2xl border border-cream-300 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by description, payee, receipt reference..."
            className="w-full pl-9 pr-4 py-2 text-xs md:text-sm bg-cream-50/60 border border-cream-300 rounded-xl outline-none focus:ring-2 focus:ring-sage-400 transition-all text-charcoal-800"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-xs md:text-sm bg-cream-50 border border-cream-300 rounded-xl text-charcoal-700 outline-none"
        >
          {Object.entries(categoryLabels).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>

      {/* Expenses Table */}
      {filteredExpenses.length > 0 ? (
        <div className="bg-white rounded-2xl border border-cream-300 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream-100 border-b border-cream-200 text-[11px] font-semibold text-charcoal-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Payee / Supplier</th>
                  <th className="py-3 px-4 text-center">Payment Method</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100 text-xs">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-cream-50/70 transition-colors">
                    <td className="py-3.5 px-4 text-charcoal-500 whitespace-nowrap">
                      {formatDate(exp.date)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-charcoal-900 flex items-center gap-2">
                        {exp.description}
                        {exp.isRecurring && (
                          <span className="p-0.5 rounded bg-cream-200 text-charcoal-600" title="Recurring expense">
                            <Repeat className="w-3 h-3" />
                          </span>
                        )}
                        {exp.isCapitalAsset && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-paleblue-100 text-paleblue-500">
                            Asset
                          </span>
                        )}
                      </div>
                      {exp.receiptRef && (
                        <span className="text-[10px] text-charcoal-400 font-mono">
                          Ref: {exp.receiptRef}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-600">
                      <span className="px-2 py-0.5 rounded-md bg-cream-100 text-charcoal-700 text-[11px]">
                        {categoryLabels[exp.category] || exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-700">
                      {exp.supplierRecipient || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-center capitalize text-charcoal-600 font-mono text-[11px]">
                      {exp.paymentMethod}
                    </td>
                    <td className="py-3.5 px-4 text-right font-serif font-bold text-charcoal-900 text-sm">
                      {formatCurrency(exp.amount, settings.currencySymbol)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingExpense(exp)}
                          className="p-1 rounded-lg text-sage-600 hover:text-sage-800 hover:bg-sage-50 transition-colors"
                          title="Edit this expense"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteExpenseItem(exp.id)}
                          className="p-1 rounded-lg text-charcoal-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete this expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-cream-300 p-12 text-center">
          <Receipt className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
          <h3 className="font-serif font-bold text-lg text-charcoal-800">
            No expenses found
          </h3>
          <p className="text-xs text-charcoal-500 mt-1 max-w-sm mx-auto">
            Log workshop overhead, tooling, rent, or marketing spend.
          </p>
          <button
            type="button"
            onClick={() => openQuickActionModal('add_expense')}
            className="mt-4 px-4 py-2 bg-sage-400 hover:bg-sage-500 text-white rounded-xl text-xs font-semibold shadow-soft"
          >
            + Log an Expense
          </button>
        </div>
      )}

      {/* Edit Expense Modal */}
      {editingExpense && (
        <ExpenseModal
          initialExpense={editingExpense}
          onClose={() => setEditingExpense(null)}
        />
      )}
    </div>
  );
}
