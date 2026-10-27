'use client';

import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  ChevronRight,
  CornerUpLeft,
  Edit,
  Trash2,
  LayoutList,
  Table as TableIcon,
  RotateCcw,
  Truck,
} from 'lucide-react';
import { useAltaj } from '@/context/AltajContext';
import { SalesOrder, OrderStatus, PaymentStatus } from '@/types/altaj';
import { formatCurrency, formatDate, getOrderStatusBadge, getPaymentStatusBadge } from '@/lib/altaj/utils';
import { NewSaleModal } from '../modals/NewSaleModal';
import { DeliverySyncModal } from '../modals/DeliverySyncModal';

export function SalesOrdersView() {
  const {
    orders,
    settings,
    deleteOrder,
    changeOrderStatus,
    openQuickActionModal,
  } = useAltaj();

  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact');
  const [editingOrder, setEditingOrder] = useState<SalesOrder | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<SalesOrder | null>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');

  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [returnModalOrder, setReturnModalOrder] = useState<SalesOrder | null>(null);

  // Return state form
  const [returnQty, setReturnQty] = useState(1);
  const [refundAmount, setRefundAmount] = useState(0);
  const [restockCondition, setRestockCondition] = useState<'resellable' | 'damaged'>('resellable');
  const [returnReason, setReturnReason] = useState('Customer exchange or return');

  const { processReturn } = useAltaj();

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.toLowerCase().includes(q) ||
        (o.customerCity || '').toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'all' || o.orderStatus === statusFilter;
      const matchesPayment = paymentFilter === 'all' || o.paymentStatus === paymentFilter;
      const matchesChannel = channelFilter === 'all' || o.channel === channelFilter;

      return matchesSearch && matchesStatus && matchesPayment && matchesChannel;
    });
  }, [orders, searchQuery, statusFilter, paymentFilter, channelFilter]);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    changeOrderStatus(orderId, newStatus);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
    }
  };

  const handleOpenReturnModal = (order: SalesOrder) => {
    setReturnModalOrder(order);
    setRefundAmount(order.totalAmount);
    setReturnQty(order.items.reduce((acc, i) => acc + i.quantity, 0));
  };

  const handleConfirmReturn = () => {
    if (!returnModalOrder) return;
    processReturn({
      orderId: returnModalOrder.id,
      returnedQuantity: Number(returnQty) || 1,
      refundAmount: Number(refundAmount) || 0,
      restockCondition,
      reason: returnReason,
    });
    setReturnModalOrder(null);
    setSelectedOrder(null);
  };

  return (
    <div className="space-y-6 pb-12 font-sans antialiased text-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-xl md:text-2xl text-charcoal-900">
            Orders & Sales ({orders.length})
          </h2>
          <p className="text-xs md:text-sm text-charcoal-500">
            Track COD customer orders, stock reservations, shipping parcels, and customer returns
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
          <button
            type="button"
            onClick={() => setIsSyncModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs md:text-sm font-semibold shadow-2xs transition-all cursor-pointer"
            title="Import delivery tracking report (Cathedis, Amana, Ozone, Sendit) to auto-adjust delivered, returned & COD cash"
          >
            <Truck className="w-4 h-4 text-blue-600" />
            <span>Sync Delivery Data</span>
          </button>

          <button
            type="button"
            onClick={() => openQuickActionModal('new_sale')}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs md:text-sm font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Order / Sale</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-cream-300 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order #, customer name, phone, city..."
            className="w-full pl-9 pr-4 py-2 text-xs md:text-sm bg-cream-50/60 border border-cream-300 rounded-xl outline-none focus:ring-2 focus:ring-sage-400 transition-all text-charcoal-800"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs md:text-sm bg-cream-50 border border-cream-300 rounded-xl text-charcoal-700 outline-none"
          >
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_production">In Production</option>
            <option value="ready_to_ship">Ready to Ship</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="returned">Returned</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 text-xs md:text-sm bg-cream-50 border border-cream-300 rounded-xl text-charcoal-700 outline-none"
          >
            <option value="all">All payments</option>
            <option value="paid">Paid</option>
            <option value="partially_paid">Partial</option>
            <option value="unpaid">Unpaid</option>
            <option value="refunded">Refunded</option>
          </select>

          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="px-3 py-2 text-xs md:text-sm bg-cream-50 border border-cream-300 rounded-xl text-charcoal-700 outline-none"
          >
            <option value="all">All channels</option>
            <option value="direct_atelier">Workshop Direct</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="instagram">Instagram</option>
            <option value="website">Website</option>
            <option value="boutique_partner">Partner Store</option>
          </select>

          {/* View mode toggle: Compact vs Detailed */}
          <div className="flex items-center bg-cream-100 p-1 rounded-xl border border-cream-200">
            <button
              type="button"
              onClick={() => setViewMode('compact')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'compact'
                  ? 'bg-white text-charcoal-900 shadow-xs'
                  : 'text-charcoal-500 hover:text-charcoal-800'
              }`}
              title="Compact view: Name, City, Wallet Model, Status, Edit & Delete"
            >
              <LayoutList className="w-3.5 h-3.5 text-sage-600" />
              <span>Compact</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('detailed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'detailed'
                  ? 'bg-white text-charcoal-900 shadow-xs'
                  : 'text-charcoal-500 hover:text-charcoal-800'
              }`}
              title="Detailed view with accounting breakdown"
            >
              <TableIcon className="w-3.5 h-3.5 text-charcoal-500" />
              <span>Detailed</span>
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length > 0 ? (
        <div className="bg-white rounded-2xl border border-cream-300 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            {viewMode === 'compact' ? (
              /* COMPACT VIEW TABLE */
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-cream-100 border-b border-cream-200 text-[11px] font-semibold text-charcoal-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Customer & City</th>
                    <th className="py-3 px-4">Wallet Model</th>
                    <th className="py-3 px-4 text-right">Total</th>
                    <th className="py-3 px-4 text-center">Status (Quick Change)</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100 text-xs">
                  {filteredOrders.map((order) => {
                    const statusBadge = getOrderStatusBadge(order.orderStatus);
                    const payBadge = getPaymentStatusBadge(order.paymentStatus);

                    return (
                      <tr key={order.id} className="hover:bg-cream-50/80 transition-colors">
                        {/* Name & City */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="font-bold text-sm text-charcoal-900 flex items-center gap-1.5">
                                {order.customerName}
                                <span className="font-mono text-[10px] text-charcoal-400 font-normal">
                                  #{order.orderNumber}
                                </span>
                              </div>
                              <div className="text-xs text-charcoal-600 flex items-center gap-1.5 mt-0.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cream-100 font-medium text-charcoal-800 text-[11px]">
                                  <MapPin className="w-3 h-3 text-sage-600" />
                                  {order.customerCity || 'Morocco'}
                                </span>
                                <span className="text-[11px] text-charcoal-500 font-mono">
                                  {order.customerPhone}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Wallet Model */}
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-sage-100 text-sage-800 font-bold text-xs">
                                  {item.quantity}x
                                </span>
                                <span className="font-semibold text-charcoal-900 text-xs">
                                  {item.modelName}
                                </span>
                                {item.sku && (
                                  <span className="text-[10px] text-charcoal-400 font-mono">
                                    ({item.sku})
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* Total Amount & Payment */}
                        <td className="py-3 px-4 text-right">
                          <div className="font-serif font-bold text-sm text-charcoal-900">
                            {formatCurrency(order.totalAmount, settings.currencySymbol)}
                          </div>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium border mt-0.5 ${payBadge.bg} ${payBadge.text} ${payBadge.border}`}>
                            {payBadge.label}
                          </span>
                        </td>

                        {/* Quick-Change Status Dropdown */}
                        <td className="py-3 px-4 text-center">
                          <select
                            value={order.orderStatus}
                            onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-xl border outline-none cursor-pointer transition-all shadow-xs ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
                            title="Change status in 1 click"
                          >
                            <option value="new">🆕 New</option>
                            <option value="confirmed">📋 Confirmed (Stock reserved)</option>
                            <option value="in_production">🔨 In Production</option>
                            <option value="ready_to_ship">📦 Ready to Ship</option>
                            <option value="shipped">🚚 Shipped (Stock deducted)</option>
                            <option value="delivered">✅ Delivered (Recognized)</option>
                            <option value="returned">↩️ Returned</option>
                            <option value="cancelled">❌ Cancelled</option>
                          </select>
                        </td>

                        {/* Actions: Edit, Delete, Detail */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingOrder(order)}
                              className="p-1.5 rounded-xl bg-sage-50 hover:bg-sage-100 text-sage-700 transition-colors"
                              title="Edit order"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setOrderToDelete(order)}
                              className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                              title="Delete order"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                              className="px-2 py-1 bg-cream-100 hover:bg-cream-200 text-charcoal-700 rounded-lg text-xs font-medium transition-colors"
                              title="Detailed view"
                            >
                              Detail
                            </button>
                            {order.orderStatus !== 'returned' && order.orderStatus !== 'cancelled' && (
                              <button
                                type="button"
                                onClick={() => handleOpenReturnModal(order)}
                                className="p-1 rounded-lg text-charcoal-400 hover:text-terracotta-600 hover:bg-softpeach-50 transition-colors"
                                title="Customer return"
                              >
                                <CornerUpLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              /* DETAILED ACCOUNTING TABLE */
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-cream-100 border-b border-cream-200 text-[11px] font-semibold text-charcoal-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Customer & City</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4 text-right">Total</th>
                    <th className="py-3 px-4 text-right">Paid</th>
                    <th className="py-3 px-4 text-right">Balance Due</th>
                    <th className="py-3 px-4 text-center">Payment</th>
                    <th className="py-3 px-4 text-center">Order Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100 text-xs">
                  {filteredOrders.map((order) => {
                    const statusBadge = getOrderStatusBadge(order.orderStatus);
                    const payBadge = getPaymentStatusBadge(order.paymentStatus);
                    const hasBalance = order.outstandingBalance > 0 && order.orderStatus !== 'cancelled';

                    return (
                      <tr key={order.id} className="hover:bg-cream-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-charcoal-900">
                          {order.orderNumber}
                          <span className="block text-[10px] text-charcoal-400 capitalize font-sans">
                            {order.channel.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-charcoal-500 whitespace-nowrap">
                          {formatDate(order.orderDate)}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-charcoal-900">{order.customerName}</div>
                          <div className="text-[10px] text-charcoal-500 flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5 text-charcoal-400" />
                            {order.customerCity || 'Morocco'} • {order.customerPhone}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="truncate max-w-[200px] text-charcoal-700">
                            {order.items.map((i) => `${i.quantity}x ${i.modelName}`).join(', ')}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-serif font-bold text-charcoal-900">
                          {formatCurrency(order.totalAmount, settings.currencySymbol)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-serif text-sage-700 font-semibold">
                          {formatCurrency(order.amountPaid, settings.currencySymbol)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className={`font-serif font-bold ${hasBalance ? 'text-terracotta-600' : 'text-charcoal-400'}`}>
                            {formatCurrency(order.outstandingBalance, settings.currencySymbol)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium border ${payBadge.bg} ${payBadge.text} ${payBadge.border}`}>
                            {payBadge.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <select
                            value={order.orderStatus}
                            onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                            className={`text-[10px] font-medium px-2 py-1 rounded-full border outline-none cursor-pointer ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
                          >
                            <option value="new">New</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="in_production">In Production</option>
                            <option value="ready_to_ship">Ready to Ship</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="returned">Returned</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingOrder(order)}
                              className="p-1.5 rounded-lg text-sage-700 hover:bg-sage-100 transition-colors"
                              title="Edit order"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setOrderToDelete(order)}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete order"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                              className="px-2 py-1 bg-cream-100 hover:bg-cream-200 text-charcoal-700 rounded-lg text-xs font-medium transition-colors"
                            >
                              Detail
                            </button>
                            {order.orderStatus !== 'returned' && order.orderStatus !== 'cancelled' && (
                              <button
                                type="button"
                                onClick={() => handleOpenReturnModal(order)}
                                className="p-1 rounded-lg text-charcoal-400 hover:text-terracotta-600 hover:bg-softpeach-50 transition-colors"
                                title="Customer return"
                              >
                                <CornerUpLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-cream-300 p-12 text-center">
          <ShoppingBag className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
          <h3 className="font-serif font-bold text-lg text-charcoal-800">
            No orders found
          </h3>
          <p className="text-xs text-charcoal-500 mt-1 max-w-sm mx-auto">
            Create an in-person workshop sale or record an order from social media.
          </p>
          <button
            type="button"
            onClick={() => openQuickActionModal('new_sale')}
            className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-soft"
          >
            + New Order
          </button>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-cream-300 shadow-float p-6 animate-fade-in space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-cream-200">
              <div>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-cream-200 text-charcoal-700 font-bold">
                  {selectedOrder.orderNumber}
                </span>
                <h3 className="font-serif font-bold text-lg text-charcoal-900 mt-1">
                  Order: {selectedOrder.customerName}
                </h3>
                <span className="text-xs text-charcoal-500">
                  Date: {formatDate(selectedOrder.orderDate)} • Channel: {selectedOrder.channel}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-cream-100"
              >
                ✕
              </button>
            </div>

            {/* Customer & Delivery address */}
            <div className="p-3 bg-cream-50 rounded-xl border border-cream-200 text-xs space-y-1">
              <div className="font-semibold text-charcoal-800">Delivery Information:</div>
              <div className="text-charcoal-600">Phone: {selectedOrder.customerPhone || 'Not provided'}</div>
              <div className="text-charcoal-600">City: {selectedOrder.customerCity}</div>
              {selectedOrder.customerAddress && (
                <div className="text-charcoal-600">Address: {selectedOrder.customerAddress}</div>
              )}
            </div>

            {/* Items Table */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal-500 mb-2">
                Ordered Items & Costs
              </h4>
              <div className="border border-cream-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-cream-100 text-[10px] uppercase font-semibold text-charcoal-600">
                    <tr>
                      <th className="p-2.5">Wallet</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Unit Price</th>
                      <th className="p-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-100">
                    {selectedOrder.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-medium text-charcoal-800">
                          {it.modelName}
                          <span className="block text-[10px] text-charcoal-400 font-mono">{it.sku}</span>
                        </td>
                        <td className="p-2.5 text-center text-charcoal-600">{it.quantity}</td>
                        <td className="p-2.5 text-right font-serif text-charcoal-700">
                          {formatCurrency(it.unitPrice, settings.currencySymbol)}
                        </td>
                        <td className="p-2.5 text-right font-serif font-bold text-charcoal-900">
                          {formatCurrency(it.totalPrice, settings.currencySymbol)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-cream-50/60">
                      <td colSpan={3} className="p-2 text-right text-charcoal-500">Subtotal:</td>
                      <td className="p-2 text-right font-serif font-semibold text-charcoal-800">
                        {formatCurrency(selectedOrder.subtotal, settings.currencySymbol)}
                      </td>
                    </tr>
                    {selectedOrder.discount > 0 && (
                      <tr className="bg-cream-50/60 text-terracotta-600">
                        <td colSpan={3} className="p-2 text-right">Discount:</td>
                        <td className="p-2 text-right font-serif font-semibold">
                          -{formatCurrency(selectedOrder.discount, settings.currencySymbol)}
                        </td>
                      </tr>
                    )}
                    <tr className="bg-cream-50/60">
                      <td colSpan={3} className="p-2 text-right text-charcoal-500">Shipping Charged:</td>
                      <td className="p-2 text-right font-serif font-semibold text-charcoal-800">
                        {formatCurrency(selectedOrder.shippingCharged, settings.currencySymbol)}
                      </td>
                    </tr>
                    <tr className="bg-emerald-50 font-bold border-t border-emerald-200">
                      <td colSpan={3} className="p-2.5 text-emerald-900">Order Total:</td>
                      <td className="p-2.5 text-right font-serif text-emerald-900 text-sm">
                        {formatCurrency(selectedOrder.totalAmount, settings.currencySymbol)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial tracking: Cash vs Balance */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-cream-50 rounded-xl border border-cream-200">
                <span className="text-[10px] text-charcoal-500 block">Actual Cash Paid</span>
                <strong className="text-emerald-700 font-serif text-sm">
                  {formatCurrency(selectedOrder.amountPaid, settings.currencySymbol)}
                </strong>
              </div>
              <div className="p-3 bg-cream-50 rounded-xl border border-cream-200">
                <span className="text-[10px] text-charcoal-500 block">Outstanding Balance Due</span>
                <strong className={`font-serif text-sm ${selectedOrder.outstandingBalance > 0 ? 'text-terracotta-600' : 'text-charcoal-800'}`}>
                  {formatCurrency(selectedOrder.outstandingBalance, settings.currencySymbol)}
                </strong>
              </div>
            </div>

            {selectedOrder.notes && (
              <p className="text-xs text-charcoal-600 bg-cream-50 p-3 rounded-xl border border-cream-200">
                <strong>Notes:</strong> {selectedOrder.notes}
              </p>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-cream-200">
              <button
                type="button"
                onClick={() => handleOpenReturnModal(selectedOrder)}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium"
              >
                Process customer return
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-cream-200 hover:bg-cream-300 text-charcoal-800 rounded-xl text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return & Refund Modal */}
      {returnModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full border border-cream-300 shadow-float p-6 animate-fade-in space-y-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-charcoal-900 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-terracotta-500" />
                Process Return & Refund
              </h3>
              <p className="text-xs text-charcoal-500 mt-1">
                Order {returnModalOrder.orderNumber} ({returnModalOrder.customerName})
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-charcoal-700 block mb-1">
                  Returned Item Condition:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRestockCondition('resellable')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      restockCondition === 'resellable'
                        ? 'border-sage-400 bg-sage-50 text-sage-900 font-semibold'
                        : 'border-cream-300 text-charcoal-700 hover:bg-cream-50'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 mb-1 text-sage-600" />
                    <span className="block font-semibold">Mint Condition</span>
                    <span className="text-[10px] text-charcoal-500 block">Restock into available inventory</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRestockCondition('damaged')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      restockCondition === 'damaged'
                        ? 'border-terracotta-400 bg-softpeach-50 text-terracotta-900 font-semibold'
                        : 'border-cream-300 text-charcoal-700 hover:bg-cream-50'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 mb-1 text-terracotta-500" />
                    <span className="block font-semibold">Damaged / Scratched</span>
                    <span className="text-[10px] text-charcoal-500 block">Loss (Do NOT restock)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="font-medium text-charcoal-700 block mb-1">
                  Refund Amount ({settings.currencySymbol}):
                </label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  className="w-full p-2 border border-cream-300 rounded-xl outline-none focus:ring-1 focus:ring-sage-400 font-serif font-bold text-sm"
                />
              </div>

              <div>
                <label className="font-medium text-charcoal-700 block mb-1">
                  Reason for Return:
                </label>
                <input
                  type="text"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full p-2 border border-cream-300 rounded-xl outline-none focus:ring-1 focus:ring-sage-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-cream-200">
              <button
                type="button"
                onClick={() => setReturnModalOrder(null)}
                className="px-4 py-2 text-xs font-medium text-charcoal-600 hover:bg-cream-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReturn}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-soft"
              >
                Confirm Return & Refund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {editingOrder && (
        <NewSaleModal
          initialOrder={editingOrder}
          onClose={() => setEditingOrder(null)}
        />
      )}

      {/* Delete Order Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-cream-300 shadow-float animate-fade-in space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-softpeach-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-terracotta-500" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-charcoal-900">
                  Delete Order?
                </h4>
                <p className="text-xs text-charcoal-500 font-mono">
                  {orderToDelete.orderNumber} • {orderToDelete.customerName}
                </p>
              </div>
            </div>

            <p className="text-xs text-charcoal-600 leading-relaxed">
              Are you sure you want to delete this order? Any reserved stock will be automatically restored and accounting records will update.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-cream-200">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-charcoal-600 hover:bg-cream-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteOrder(orderToDelete.id);
                  if (selectedOrder?.id === orderToDelete.id) {
                    setSelectedOrder(null);
                  }
                  setOrderToDelete(null);
                }}
                className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-soft"
              >
                Delete Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CARRIER DELIVERY AUTO-SYNC MODAL */}
      {isSyncModalOpen && (
        <DeliverySyncModal onClose={() => setIsSyncModalOpen(false)} />
      )}
    </div>
  );
}
