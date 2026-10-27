'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  FileSpreadsheet,
  DollarSign,
  TrendingUp,
  Receipt,
  Boxes,
  ShoppingBag,
  RotateCcw,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { useAltaj } from '@/context/AltajContext';
import { formatCurrency, formatPercent, formatDate } from '@/lib/altaj/utils';

export function FinancialReportsView() {
  const {
    financials,
    orders,
    models,
    materials,
    expenses,
    settings,
    dateFilter,
  } = useAltaj();

  const [activeReport, setActiveReport] = useState<
    'pl' | 'cash_flow' | 'product_profitability' | 'inventory_valuation' | 'sales_by_channel' | 'outstanding' | 'returns'
  >('pl');

  // Export report to CSV
  const handleExportCsv = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (activeReport === 'pl') {
      csvContent += 'Accounting Item,Amount (DH)\n';
      csvContent += `Gross Revenue,${financials.grossRevenue}\n`;
      csvContent += `Discounts Allowed,-${financials.totalDiscounts}\n`;
      csvContent += `Refunds on Returns,-${financials.totalRefunds}\n`;
      csvContent += `Net Recognized Revenue,${financials.totalRevenue}\n`;
      csvContent += `Cost of Goods Sold (COGS Materials + Labor),-${financials.costOfGoodsSold}\n`;
      csvContent += `Gross Operating Profit,${financials.grossProfit}\n`;
      csvContent += `Operating Expenses (OPEX),-${financials.operatingExpenses}\n`;
      csvContent += `Net Operating Profit Before Taxes,${financials.netOperatingProfit}\n`;
      csvContent += `Estimated Taxes,-${financials.estimatedTaxes}\n`;
      csvContent += `Net Profit After Taxes,${financials.netProfit}\n`;
    } else if (activeReport === 'cash_flow') {
      csvContent += 'Cash Flow Category,Amount (DH)\n';
      csvContent += `Cash Inflow from Customers,${financials.cashFlow.cashInflow}\n`;
      csvContent += `Cash Outflow Raw Materials/Leather,-${financials.cashFlow.cashOutflowPurchases}\n`;
      csvContent += `Cash Outflow Operating Expenses,-${financials.cashFlow.cashOutflowExpenses}\n`;
      csvContent += `Cash Outflow Return Refunds,-${financials.cashFlow.cashOutflowRefunds}\n`;
      csvContent += `Total Cash Outflow,-${financials.cashFlow.totalCashOutflow}\n`;
      csvContent += `Net Cash Flow,${financials.cashFlow.netCashFlow}\n`;
    } else if (activeReport === 'product_profitability') {
      csvContent += 'Model,SKU,Retail Price (DH),Unit Cost (DH),Unit Margin (DH),Margin Rate (%)\n';
      models.forEach((m) => {
        csvContent += `"${m.name}","${m.sku}",${m.sellingPrice},${m.unitProductionCost},${m.grossProfitPerUnit},${m.grossProfitMarginPercent}%\n`;
      });
    } else if (activeReport === 'inventory_valuation') {
      csvContent += 'Reference,Type,Stock,Unit Cost (DH),Total Value (DH)\n';
      models.forEach((m) => {
        csvContent += `"${m.name} (Wallet)",Finished Goods,${m.finishedStock},${m.unitProductionCost},${m.finishedStock * m.unitProductionCost}\n`;
      });
      materials.forEach((mat) => {
        csvContent += `"${mat.name}",Raw Material,${mat.currentStock} ${mat.unit},${mat.unitCost},${mat.totalValue}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ALTAJLEATHER_Report_${activeReport}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Channel breakdown
  const channelBreakdown = orders.reduce((acc, o) => {
    if (['shipped', 'delivered', 'returned'].includes(o.orderStatus)) {
      const prev = acc[o.channel] || { count: 0, revenue: 0 };
      prev.count += 1;
      prev.revenue += o.totalAmount;
      acc[o.channel] = prev;
    }
    return acc;
  }, {} as Record<string, { count: number; revenue: number }>);

  // Outstanding payments
  const unpaidOrders = orders.filter((o) => o.outstandingBalance > 0 && o.orderStatus !== 'cancelled');

  // Returns list
  const returnedOrders = orders.filter((o) => o.orderStatus === 'returned');

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-xl md:text-2xl text-charcoal-900">
            Financial Reports & Statements
          </h2>
          <p className="text-xs md:text-sm text-charcoal-500">
            Artisan profit and loss statements, real cash flow, and certified inventory valuations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-cream-100 border border-cream-300 text-charcoal-800 rounded-xl text-xs font-medium shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-sage-600" />
            <span>Export CSV / Excel</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-cream-200 hover:bg-cream-300 text-charcoal-800 rounded-xl text-xs font-medium transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs Selection */}
      <div className="flex items-center gap-2 border-b border-cream-300 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveReport('pl')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeReport === 'pl'
              ? 'bg-sage-400 text-white shadow-soft'
              : 'text-charcoal-600 hover:bg-cream-100'
          }`}
        >
          Profit & Loss (P&L)
        </button>

        <button
          type="button"
          onClick={() => setActiveReport('cash_flow')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeReport === 'cash_flow'
              ? 'bg-sage-400 text-white shadow-soft'
              : 'text-charcoal-600 hover:bg-cream-100'
          }`}
        >
          Cash Flow Statement
        </button>

        <button
          type="button"
          onClick={() => setActiveReport('product_profitability')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeReport === 'product_profitability'
              ? 'bg-sage-400 text-white shadow-soft'
              : 'text-charcoal-600 hover:bg-cream-100'
          }`}
        >
          Product Profitability
        </button>

        <button
          type="button"
          onClick={() => setActiveReport('inventory_valuation')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeReport === 'inventory_valuation'
              ? 'bg-sage-400 text-white shadow-soft'
              : 'text-charcoal-600 hover:bg-cream-100'
          }`}
        >
          Inventory Valuation
        </button>

        <button
          type="button"
          onClick={() => setActiveReport('sales_by_channel')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeReport === 'sales_by_channel'
              ? 'bg-sage-400 text-white shadow-soft'
              : 'text-charcoal-600 hover:bg-cream-100'
          }`}
        >
          Sales by Channel
        </button>

        <button
          type="button"
          onClick={() => setActiveReport('outstanding')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeReport === 'outstanding'
              ? 'bg-sage-400 text-white shadow-soft'
              : 'text-charcoal-600 hover:bg-cream-100'
          }`}
        >
          Pending Payments ({unpaidOrders.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveReport('returns')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeReport === 'returns'
              ? 'bg-sage-400 text-white shadow-soft'
              : 'text-charcoal-600 hover:bg-cream-100'
          }`}
        >
          Returns & Refunds ({returnedOrders.length})
        </button>
      </div>

      {/* REPORT 1: PROFIT & LOSS STATEMENT */}
      {activeReport === 'pl' && (
        <div className="bg-white rounded-3xl border border-cream-300 shadow-xs p-6 md:p-8 space-y-6">
          <div className="border-b border-cream-200 pb-4 flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-xl text-charcoal-900">
                Operating Profit & Loss Statement (P&L)
              </h3>
              <p className="text-xs text-charcoal-500 mt-0.5">
                Accrual accounting basis • Period: {dateFilter.preset}
              </p>
            </div>
            <span className="font-serif font-bold text-sage-700 text-xl">
              Net Margin: {financials.netProfitMargin.toFixed(1)}%
            </span>
          </div>

          <div className="space-y-4 text-xs md:text-sm">
            {/* Revenue */}
            <div className="space-y-1.5">
              <div className="flex justify-between py-1 border-b border-cream-100 text-charcoal-700">
                <span>Gross Sales (Recognized Orders)</span>
                <span className="font-serif font-medium">{formatCurrency(financials.grossRevenue, settings.currencySymbol)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-cream-100 text-charcoal-500">
                <span>Less: Customer discounts and promotional coupons</span>
                <span className="font-serif text-terracotta-600">-{formatCurrency(financials.totalDiscounts, settings.currencySymbol)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-cream-100 text-charcoal-500">
                <span>Less: Customer return refunds</span>
                <span className="font-serif text-terracotta-600">-{formatCurrency(financials.totalRefunds, settings.currencySymbol)}</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-charcoal-900 bg-cream-50 px-3 rounded-lg">
                <span>Net Recognized Revenue</span>
                <span className="font-serif text-base">{formatCurrency(financials.totalRevenue, settings.currencySymbol)}</span>
              </div>
            </div>

            {/* COGS */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between py-1 border-b border-cream-100 text-charcoal-700">
                <span>Cost of Goods Sold (COGS - Raw Materials and Direct Labor for {financials.unitsSold} units sold)</span>
                <span className="font-serif font-medium text-terracotta-600">-{formatCurrency(financials.costOfGoodsSold, settings.currencySymbol)}</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-sage-800 bg-sage-50 px-3 rounded-lg border border-sage-200">
                <span>Gross Operating Profit</span>
                <span className="font-serif text-base text-sage-800">
                  {formatCurrency(financials.grossProfit, settings.currencySymbol)} ({financials.grossProfitMargin.toFixed(1)}%)
                </span>
              </div>
            </div>

            {/* Operating Expenses */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between py-1 border-b border-cream-100 text-charcoal-700">
                <span>Operating Expenses (Rent, Tools, Meta/TikTok Ads, Software)</span>
                <span className="font-serif font-medium text-terracotta-600">-{formatCurrency(financials.operatingExpenses, settings.currencySymbol)}</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-charcoal-900 bg-cream-50 px-3 rounded-lg">
                <span>Operating Profit Before Taxes</span>
                <span className="font-serif text-base">{formatCurrency(financials.netOperatingProfit, settings.currencySymbol)}</span>
              </div>
            </div>

            {/* Taxes and Net Profit */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between py-1 border-b border-cream-100 text-charcoal-500">
                <span>Estimated Taxes ({settings.defaultTaxRatePercent}%)</span>
                <span className="font-serif text-terracotta-600">-{formatCurrency(financials.estimatedTaxes, settings.currencySymbol)}</span>
              </div>
              <div className="flex justify-between py-3 font-bold text-white bg-charcoal-800 px-4 rounded-xl shadow-soft">
                <span className="text-sm">WORKSHOP NET PROFIT</span>
                <span className="font-serif text-lg text-sage-300">
                  {formatCurrency(financials.netProfit, settings.currencySymbol)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 2: CASH FLOW STATEMENT */}
      {activeReport === 'cash_flow' && (
        <div className="bg-white rounded-3xl border border-cream-300 shadow-xs p-6 md:p-8 space-y-6">
          <div className="border-b border-cream-200 pb-4">
            <h3 className="font-serif font-bold text-xl text-charcoal-900">
              Cash Flow Statement
            </h3>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Actual cash received and disbursed over the selected period
            </p>
          </div>

          <div className="space-y-4 text-xs md:text-sm">
            <div className="p-3 bg-cream-50 rounded-xl border border-cream-200">
              <span className="font-bold text-charcoal-900 block mb-1">
                + CASH INFLOWS
              </span>
              <div className="flex justify-between text-charcoal-700">
                <span>Collected customer payments (COD, Wire Transfer, Cash)</span>
                <strong className="font-serif text-sage-700">
                  +{formatCurrency(financials.cashFlow.cashInflow, settings.currencySymbol)}
                </strong>
              </div>
            </div>

            <div className="p-3 bg-cream-50 rounded-xl border border-cream-200 space-y-2">
              <span className="font-bold text-charcoal-900 block">
                − CASH OUTFLOWS
              </span>
              <div className="flex justify-between text-charcoal-600">
                <span>Raw materials and leather purchases paid:</span>
                <span className="font-serif text-terracotta-600">
                  -{formatCurrency(financials.cashFlow.cashOutflowPurchases, settings.currencySymbol)}
                </span>
              </div>
              <div className="flex justify-between text-charcoal-600">
                <span>Disbursed operating expenses (rent, tooling, ads):</span>
                <span className="font-serif text-terracotta-600">
                  -{formatCurrency(financials.cashFlow.cashOutflowExpenses, settings.currencySymbol)}
                </span>
              </div>
              <div className="flex justify-between text-charcoal-600">
                <span>Customer refunds paid on returns:</span>
                <span className="font-serif text-terracotta-600">
                  -{formatCurrency(financials.cashFlow.cashOutflowRefunds, settings.currencySymbol)}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-charcoal-800 pt-1 border-t border-cream-200">
                <span>Total Cash Outflows:</span>
                <span className="font-serif text-terracotta-600 font-bold">
                  -{formatCurrency(financials.cashFlow.totalCashOutflow, settings.currencySymbol)}
                </span>
              </div>
            </div>

            <div className="flex justify-between py-3 font-bold text-white bg-sage-500 px-4 rounded-xl shadow-soft">
              <span className="text-sm">NET CASH FLOW GENERATED</span>
              <span className="font-serif text-lg">
                {financials.cashFlow.netCashFlow >= 0 ? '+' : ''}
                {formatCurrency(financials.cashFlow.netCashFlow, settings.currencySymbol)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 3: PRODUCT PROFITABILITY */}
      {activeReport === 'product_profitability' && (
        <div className="bg-white rounded-3xl border border-cream-300 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-cream-200">
            <h3 className="font-serif font-bold text-base text-charcoal-900">
              Product Profitability Breakdown by Wallet Model
            </h3>
          </div>
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-cream-100 text-[10px] uppercase font-semibold text-charcoal-600">
                <tr>
                  <th className="py-3 px-4">Wallet Model</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4 text-right">Retail Price</th>
                  <th className="py-3 px-4 text-right">Material Cost</th>
                  <th className="py-3 px-4 text-right">Labor Cost</th>
                  <th className="py-3 px-4 text-right">Total Production Cost</th>
                  <th className="py-3 px-4 text-right">Gross Profit / Unit</th>
                  <th className="py-3 px-4 text-right">Margin Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {models.map((mod) => (
                  <tr key={mod.id} className="hover:bg-cream-50/70">
                    <td className="py-3 px-4 font-semibold text-charcoal-900">{mod.name}</td>
                    <td className="py-3 px-4 font-mono text-charcoal-500">{mod.sku}</td>
                    <td className="py-3 px-4 text-right font-serif font-bold text-charcoal-900">
                      {formatCurrency(mod.sellingPrice, settings.currencySymbol)}
                    </td>
                    <td className="py-3 px-4 text-right font-serif text-charcoal-700">
                      {formatCurrency(mod.leatherCost + mod.threadCost + mod.hardwareCost + mod.packagingCost, settings.currencySymbol)}
                    </td>
                    <td className="py-3 px-4 text-right font-serif text-charcoal-700">
                      {formatCurrency(mod.directLaborCost, settings.currencySymbol)}
                    </td>
                    <td className="py-3 px-4 text-right font-serif font-semibold text-charcoal-900">
                      {formatCurrency(mod.unitProductionCost, settings.currencySymbol)}
                    </td>
                    <td className="py-3 px-4 text-right font-serif font-bold text-sage-700">
                      +{formatCurrency(mod.grossProfitPerUnit, settings.currencySymbol)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-sage-700">
                      {mod.grossProfitMarginPercent.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 4: INVENTORY VALUATION */}
      {activeReport === 'inventory_valuation' && (
        <div className="bg-white rounded-3xl border border-cream-300 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-cream-200">
            <div>
              <h3 className="font-serif font-bold text-lg text-charcoal-900">
                Current Assets Inventory Valuation
              </h3>
              <p className="text-xs text-charcoal-500">
                Valued at real weighted unit production cost
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-charcoal-500 block uppercase">Total Asset Value</span>
              <strong className="text-xl font-serif font-bold text-sage-700">
                {formatCurrency(financials.totalInventoryValue, settings.currencySymbol)}
              </strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200">
              <h4 className="font-semibold text-xs text-charcoal-800 mb-2">
                1. Finished Wallets: {formatCurrency(financials.finishedGoodsInventoryValue, settings.currencySymbol)}
              </h4>
              <ul className="space-y-1.5 text-xs text-charcoal-600">
                {models.map((m) => (
                  <li key={m.id} className="flex justify-between">
                    <span>{m.name} ({m.finishedStock} pcs)</span>
                    <strong className="font-serif text-charcoal-900">
                      {formatCurrency(m.finishedStock * m.unitProductionCost, settings.currencySymbol)}
                    </strong>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200">
              <h4 className="font-semibold text-xs text-charcoal-800 mb-2">
                2. Raw Materials: {formatCurrency(financials.rawMaterialsInventoryValue, settings.currencySymbol)}
              </h4>
              <ul className="space-y-1.5 text-xs text-charcoal-600">
                {materials.map((mat) => (
                  <li key={mat.id} className="flex justify-between">
                    <span className="truncate max-w-[180px]">{mat.name} ({mat.currentStock} {mat.unit})</span>
                    <strong className="font-serif text-charcoal-900">
                      {formatCurrency(mat.totalValue, settings.currencySymbol)}
                    </strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 5: SALES BY CHANNEL */}
      {activeReport === 'sales_by_channel' && (
        <div className="bg-white rounded-3xl border border-cream-300 shadow-xs p-6 space-y-4">
          <h3 className="font-serif font-bold text-lg text-charcoal-900">
            Sales Breakdown by Acquisition Channel
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(channelBreakdown).map(([ch, data]) => (
              <div key={ch} className="p-4 bg-cream-50 rounded-2xl border border-cream-200">
                <span className="text-[10px] uppercase font-bold text-charcoal-500 block capitalize">
                  {ch.replace('_', ' ')}
                </span>
                <div className="text-xl font-serif font-bold text-charcoal-900 mt-1">
                  {formatCurrency(data.revenue, settings.currencySymbol)}
                </div>
                <span className="text-xs text-charcoal-500">
                  {data.count} delivered order{data.count > 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REPORT 6: OUTSTANDING PAYMENTS */}
      {activeReport === 'outstanding' && (
        <div className="bg-white rounded-3xl border border-cream-300 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-cream-200">
            <h3 className="font-serif font-bold text-base text-charcoal-900">
              Orders with Pending Balance or Partial Advance
            </h3>
          </div>
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-cream-100 text-[10px] uppercase font-semibold text-charcoal-600">
                <tr>
                  <th className="py-2.5 px-4">Order</th>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4 text-right">Total</th>
                  <th className="py-2.5 px-4 text-right">Paid</th>
                  <th className="py-2.5 px-4 text-right">Balance Due</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {unpaidOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="py-3 px-4 font-mono font-bold text-charcoal-900">{o.orderNumber}</td>
                    <td className="py-3 px-4">{o.customerName} ({o.customerPhone})</td>
                    <td className="py-3 px-4 text-right font-serif">{formatCurrency(o.totalAmount, settings.currencySymbol)}</td>
                    <td className="py-3 px-4 text-right font-serif text-sage-700">{formatCurrency(o.amountPaid, settings.currencySymbol)}</td>
                    <td className="py-3 px-4 text-right font-serif font-bold text-terracotta-600">
                      {formatCurrency(o.outstandingBalance, settings.currencySymbol)}
                    </td>
                    <td className="py-3 px-4 text-center capitalize">{o.orderStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 7: RETURNS & REFUNDS */}
      {activeReport === 'returns' && (
        <div className="bg-white rounded-3xl border border-cream-300 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-cream-200">
            <h3 className="font-serif font-bold text-base text-charcoal-900">
              Returns & Defect History
            </h3>
          </div>
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-cream-100 text-[10px] uppercase font-semibold text-charcoal-600">
                <tr>
                  <th className="py-2.5 px-4">Order</th>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4">Return Reason</th>
                  <th className="py-2.5 px-4 text-center">Restock Condition</th>
                  <th className="py-2.5 px-4 text-right">Refund Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {returnedOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="py-3 px-4 font-mono font-bold text-charcoal-900">{o.orderNumber}</td>
                    <td className="py-3 px-4">{o.customerName}</td>
                    <td className="py-3 px-4 text-charcoal-600">{o.returnDetails?.reason || 'Not specified'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        o.returnDetails?.restockCondition === 'resellable'
                          ? 'bg-sage-100 text-sage-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {o.returnDetails?.restockCondition === 'resellable' ? 'Perfect (Restocked)' : 'Damaged (Scrapped)'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-serif font-bold text-terracotta-600">
                      {formatCurrency(o.returnDetails?.refundAmount || 0, settings.currencySymbol)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
