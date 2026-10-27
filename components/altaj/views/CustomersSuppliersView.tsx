'use client';

import React, { useState } from 'react';
import {
  Users,
  Plus,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  DollarSign,
  AlertCircle,
  Truck,
  Building,
  Edit,
  Trash2,
  X,
} from 'lucide-react';
import { useAltaj } from '@/context/AltajContext';
import { Customer, Supplier } from '@/types/altaj';
import { formatCurrency, formatDate } from '@/lib/altaj/utils';

export function CustomersSuppliersView() {
  const {
    customers,
    suppliers,
    settings,
    saveCustomerItem,
    deleteCustomerItem,
    saveSupplierItem,
    deleteSupplierItem,
  } = useAltaj();

  const [activeSubTab, setActiveSubTab] = useState<'customers' | 'suppliers'>('customers');
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Customer form state
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custCity, setCustCity] = useState('Casablanca');
  const [custAddress, setCustAddress] = useState('');
  const [custNotes, setCustNotes] = useState('');

  // Supplier form state
  const [supName, setSupName] = useState('');
  const [supContact, setSupContact] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supCity, setSupCity] = useState('Fès');
  const [supMaterials, setSupMaterials] = useState('');
  const [supNotes, setSupNotes] = useState('');

  const handleOpenCreateCustomer = () => {
    setEditingCustomer(null);
    setCustName('');
    setCustPhone('');
    setCustCity('Casablanca');
    setCustAddress('');
    setCustNotes('');
    setCustomerModalOpen(true);
  };

  const handleOpenEditCustomer = (c: Customer) => {
    setEditingCustomer(c);
    setCustName(c.name);
    setCustPhone(c.phone || '');
    setCustCity(c.city || 'Casablanca');
    setCustAddress(c.address || '');
    setCustNotes(c.notes || '');
    setCustomerModalOpen(true);
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName) return;
    saveCustomerItem({
      ...(editingCustomer ? { id: editingCustomer.id } : {}),
      name: custName,
      phone: custPhone,
      city: custCity,
      country: 'Maroc',
      address: custAddress,
      notes: custNotes,
    });
    setCustomerModalOpen(false);
    setEditingCustomer(null);
    setCustName('');
    setCustPhone('');
    setCustAddress('');
    setCustNotes('');
  };

  const handleOpenCreateSupplier = () => {
    setEditingSupplier(null);
    setSupName('');
    setSupContact('');
    setSupPhone('');
    setSupCity('Fès');
    setSupMaterials('');
    setSupNotes('');
    setSupplierModalOpen(true);
  };

  const handleOpenEditSupplier = (s: Supplier) => {
    setEditingSupplier(s);
    setSupName(s.name);
    setSupContact(s.contactPerson || '');
    setSupPhone(s.phone || '');
    setSupCity(s.city || 'Fès');
    setSupMaterials(s.materialsSupplied?.join(', ') || '');
    setSupNotes(s.notes || '');
    setSupplierModalOpen(true);
  };

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName) return;
    saveSupplierItem({
      ...(editingSupplier ? { id: editingSupplier.id } : {}),
      name: supName,
      contactPerson: supContact,
      phone: supPhone,
      city: supCity,
      materialsSupplied: supMaterials.split(',').map((s) => s.trim()).filter(Boolean),
      notes: supNotes,
    });
    setSupplierModalOpen(false);
    setEditingSupplier(null);
    setSupName('');
    setSupContact('');
    setSupPhone('');
    setSupMaterials('');
    setSupNotes('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-xl md:text-2xl text-charcoal-900">
            Customers & Supplier Partners
          </h2>
          <p className="text-xs md:text-sm text-charcoal-500">
            Address book for clients, wholesale buyers, and partner tanneries
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === 'customers' ? (
            <button
              type="button"
              onClick={handleOpenCreateCustomer}
              className="flex items-center gap-2 px-4 py-2.5 bg-sage-400 hover:bg-sage-500 text-white rounded-xl text-xs md:text-sm font-semibold shadow-soft"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Customer</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenCreateSupplier}
              className="flex items-center gap-2 px-4 py-2.5 bg-sage-400 hover:bg-sage-500 text-white rounded-xl text-xs md:text-sm font-semibold shadow-soft"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Supplier</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-cream-300 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('customers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
            activeSubTab === 'customers'
              ? 'bg-sage-400 text-white shadow-soft'
              : 'text-charcoal-600 hover:bg-cream-100'
          }`}
        >
          <Users className="w-4 h-4" />
          Customers ({customers.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('suppliers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
            activeSubTab === 'suppliers'
              ? 'bg-sage-400 text-white shadow-soft'
              : 'text-charcoal-600 hover:bg-cream-100'
          }`}
        >
          <Building className="w-4 h-4" />
          Suppliers & Tanneries ({suppliers.length})
        </button>
      </div>

      {/* CUSTOMERS VIEW */}
      {activeSubTab === 'customers' && (
        <div className="bg-white rounded-2xl border border-cream-300 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream-100 border-b border-cream-200 text-[11px] font-semibold text-charcoal-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4 text-center">Orders</th>
                  <th className="py-3 px-4 text-right">Total Spent</th>
                  <th className="py-3 px-4 text-right">Balance Due</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100 text-xs">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-cream-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-charcoal-900">{c.name}</div>
                      {c.notes && <div className="text-[10px] text-charcoal-500 mt-0.5">{c.notes}</div>}
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-600">
                      <div className="font-mono text-charcoal-800">{c.phone || '—'}</div>
                      {c.email && <div className="text-[10px] text-charcoal-500">{c.email}</div>}
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-700">
                      {c.city}, {c.country}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-charcoal-900">
                      {c.totalOrders}
                    </td>
                    <td className="py-3.5 px-4 text-right font-serif font-bold text-charcoal-900">
                      {formatCurrency(c.totalSpent, settings.currencySymbol)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`font-serif font-bold ${c.outstandingBalance > 0 ? 'text-terracotta-600' : 'text-charcoal-400'}`}>
                        {formatCurrency(c.outstandingBalance, settings.currencySymbol)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditCustomer(c)}
                          className="p-1 rounded-lg text-sage-600 hover:text-sage-800 hover:bg-sage-50 transition-colors"
                          title="Edit this customer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteCustomerItem(c.id)}
                          className="p-1 rounded-lg text-charcoal-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
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
      )}

      {/* SUPPLIERS VIEW */}
      {activeSubTab === 'suppliers' && (
        <div className="bg-white rounded-2xl border border-cream-300 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream-100 border-b border-cream-200 text-[11px] font-semibold text-charcoal-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Materials Supplied</th>
                  <th className="py-3 px-4 text-right">Total Purchased</th>
                  <th className="py-3 px-4 text-right">Balance Due</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100 text-xs">
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-cream-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-charcoal-900">{s.name}</div>
                      {s.notes && <div className="text-[10px] text-charcoal-500 mt-0.5">{s.notes}</div>}
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-700">
                      <div>{s.contactPerson || 'Management'}</div>
                      <div className="text-[10px] text-charcoal-500 font-mono">{s.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-700">
                      {s.city}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {s.materialsSupplied?.map((mat, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-cream-100 text-charcoal-700 text-[10px]">
                            {mat}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-serif font-bold text-charcoal-900">
                      {formatCurrency(s.totalPurchased, settings.currencySymbol)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-serif text-charcoal-600">
                      {formatCurrency(s.outstandingBalance, settings.currencySymbol)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditSupplier(s)}
                          className="p-1 rounded-lg text-sage-600 hover:text-sage-800 hover:bg-sage-50 transition-colors"
                          title="Edit this supplier"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSupplierItem(s.id)}
                          className="p-1 rounded-lg text-charcoal-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
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
      )}

      {/* New Customer Modal */}
      {customerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full border border-cream-300 shadow-float p-6 animate-fade-in space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cream-200">
              <h3 className="font-serif font-bold text-lg text-charcoal-900">
                {editingCustomer ? 'Edit Customer Card' : 'Add New Customer'}
              </h3>
              <button type="button" onClick={() => setCustomerModalOpen(false)}>
                <X className="w-5 h-5 text-charcoal-400" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-charcoal-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full p-2 border border-cream-300 rounded-xl outline-none focus:ring-1 focus:ring-sage-400"
                />
              </div>

              <div>
                <label className="font-medium text-charcoal-700 block mb-1">Phone Number (WhatsApp)</label>
                <input
                  type="text"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="w-full p-2 border border-cream-300 rounded-xl outline-none focus:ring-1 focus:ring-sage-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-charcoal-700 block mb-1">City</label>
                  <input
                    type="text"
                    value={custCity}
                    onChange={(e) => setCustCity(e.target.value)}
                    className="w-full p-2 border border-cream-300 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="font-medium text-charcoal-700 block mb-1">Address</label>
                  <input
                    type="text"
                    value={custAddress}
                    onChange={(e) => setCustAddress(e.target.value)}
                    className="w-full p-2 border border-cream-300 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-charcoal-700 block mb-1">Notes & Preferences</label>
                <textarea
                  value={custNotes}
                  onChange={(e) => setCustNotes(e.target.value)}
                  rows={2}
                  className="w-full p-2 border border-cream-300 rounded-xl outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-cream-200">
                <button
                  type="button"
                  onClick={() => setCustomerModalOpen(false)}
                  className="px-4 py-2 text-charcoal-600 hover:bg-cream-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sage-400 hover:bg-sage-500 text-white rounded-xl font-semibold shadow-soft"
                >
                  {editingCustomer ? 'Save Changes' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Supplier Modal */}
      {supplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full border border-cream-300 shadow-float p-6 animate-fade-in space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cream-200">
              <h3 className="font-serif font-bold text-lg text-charcoal-900">
                {editingSupplier ? 'Edit Supplier' : 'Add Supplier / Tannery'}
              </h3>
              <button type="button" onClick={() => setSupplierModalOpen(false)}>
                <X className="w-5 h-5 text-charcoal-400" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-charcoal-700 block mb-1">Company / Tannery Name *</label>
                <input
                  type="text"
                  required
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                  className="w-full p-2 border border-cream-300 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-charcoal-700 block mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={supContact}
                    onChange={(e) => setSupContact(e.target.value)}
                    className="w-full p-2 border border-cream-300 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="font-medium text-charcoal-700 block mb-1">City</label>
                  <input
                    type="text"
                    value={supCity}
                    onChange={(e) => setSupCity(e.target.value)}
                    className="w-full p-2 border border-cream-300 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-charcoal-700 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={supPhone}
                  onChange={(e) => setSupPhone(e.target.value)}
                  className="w-full p-2 border border-cream-300 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="font-medium text-charcoal-700 block mb-1">Materials Supplied (comma separated)</label>
                <input
                  type="text"
                  placeholder="Full-grain cowhide, Waxed thread, YKK Zippers..."
                  value={supMaterials}
                  onChange={(e) => setSupMaterials(e.target.value)}
                  className="w-full p-2 border border-cream-300 rounded-xl outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-cream-200">
                <button
                  type="button"
                  onClick={() => setSupplierModalOpen(false)}
                  className="px-4 py-2 text-charcoal-600 hover:bg-cream-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sage-400 hover:bg-sage-500 text-white rounded-xl font-semibold shadow-soft"
                >
                  {editingSupplier ? 'Save Changes' : 'Save Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
