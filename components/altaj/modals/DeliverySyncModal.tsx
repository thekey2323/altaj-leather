'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Truck,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  X,
  HelpCircle,
  Check,
  RefreshCw,
  PlusCircle,
  DollarSign,
  User,
  MapPin,
  Calendar,
  Camera,
  Image as ImageIcon,
  FileImage,
  Loader2,
  Clipboard,
} from 'lucide-react';
import { useAltaj } from '@/context/AltajContext';
import { SalesOrder, OrderStatus, PaymentStatus, OrderLineItem } from '@/types/altaj';
import { formatCurrency } from '@/lib/altaj/utils';

interface ParsedDeliveryRow {
  rawId: string;
  customerName: string;
  customerCity: string;
  statusText: string;
  newStatus: OrderStatus;
  newPaymentStatus: PaymentStatus;
  sellingPrice: number;
  deliveryFee: number;
  orderDate: string;
  deliverDate?: string;
  matchedOrder?: SalesOrder;
  action: 'update' | 'create';
  selected: boolean;
}

export function DeliverySyncModal({ onClose }: { onClose: () => void }) {
  const { orders, models, saveOrder, processReturn, settings } = useAltaj();

  // Mode: screenshot vs paste vs csv
  const [inputMode, setInputMode] = useState<'screenshot' | 'paste' | 'csv'>('screenshot');
  const [carrier, setCarrier] = useState<string>('Cathedis');
  const [inputText, setInputText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [allowCreateMissing, setAllowCreateMissing] = useState<boolean>(true);
  const [successCount, setSuccessCount] = useState<{ updated: number; created: number } | null>(null);

  // Screenshot AI Scanning state
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isScanningImage, setIsScanningImage] = useState<boolean>(false);
  const [scanStatusMessage, setScanStatusMessage] = useState<string>('');
  const [scanError, setScanError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to parse date to YYYY-MM-DD
  const parseDateToIso = (str: string): string => {
    if (!str) return new Date().toISOString().slice(0, 10);
    const parts = str.trim().split(/[\/\-.]/);
    if (parts.length === 3) {
      if (parts[2].length === 4) {
        // DD/MM/YYYY
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      } else if (parts[0].length === 4) {
        // YYYY-MM-DD
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      }
    }
    return str;
  };

  // Helper to clean price numbers from "310 DH", " 130 ", "19.00"
  const extractAmount = (val: string): number => {
    if (!val) return 0;
    const clean = val.replace(/[^0-9.]/g, '');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

  // Image processor using AI OCR endpoint
  const handleProcessImage = async (file: File) => {
    setIsScanningImage(true);
    setScanError(null);
    setScanStatusMessage('AI scanning table: reading cities, statuses, selling prices & fees...');
    setFileName(file.name || 'Screenshot.png');

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        setScreenshotPreview(base64);

        try {
          const res = await fetch('/api/ai/extract-orders-screenshot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64,
              mimeType: file.type || 'image/png',
            }),
          });

          const data = await res.json();
          if (data.rows && Array.isArray(data.rows) && data.rows.length > 0) {
            // Convert to tab-separated text so our robust parser formats it cleanly!
            const header = `Ville du client\tCode\tFrais de livraison\tNom du client\tMontant total\tCréé le\tDeliver date`;
            const rowsText = data.rows
              .map(
                (r: any) =>
                  `${r.customerCity || 'Maroc'}\t${r.statusCode || 'Livré'}\t${r.deliveryFee ?? 35} DH\t${r.customerName || 'Client'}\t${r.sellingPrice || 130} DH\t${r.orderDate || ''}\t${r.deliverDate || ''}`
              )
              .join('\n');

            setInputText(`${header}\n${rowsText}`);
            setScanStatusMessage(`AI successfully extracted ${data.rows.length} orders from screenshot!`);
          } else {
            setScanError('Could not recognize table rows in this screenshot. Please try pasting the text or another image.');
          }
        } catch (apiErr: any) {
          console.error(apiErr);
          setScanError('Failed to scan screenshot: ' + (apiErr.message || 'Error'));
        } finally {
          setIsScanningImage(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setIsScanningImage(false);
      setScanError(err.message || 'Error reading image file');
    }
  };

  // Handle global paste event (Ctrl+V) for screenshots
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            setInputMode('screenshot');
            handleProcessImage(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Quick action: Load sample screenshot directly from public folder
  const handleLoadSampleScreenshot = async () => {
    setIsScanningImage(true);
    setScanError(null);
    setScanStatusMessage('Loading and analyzing your uploaded screenshot with AI...');
    try {
      const response = await fetch('/sample-delivery-screenshot.png');
      const blob = await response.blob();
      const file = new File([blob], 'delivery_screenshot.png', { type: 'image/png' });
      await handleProcessImage(file);
    } catch (err: any) {
      setIsScanningImage(false);
      setScanError('Could not load sample screenshot: ' + err.message);
    }
  };

  // Parse raw text or paste into structured rows
  const parsedRows: ParsedDeliveryRow[] = useMemo(() => {
    if (!inputText.trim()) return [];

    const lines = inputText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return [];

    // Check if line 0 is a header line
    const headerLine = lines[0].toLowerCase();
    const hasHeader =
      headerLine.includes('ville') ||
      headerLine.includes('client') ||
      headerLine.includes('frais') ||
      headerLine.includes('code') ||
      headerLine.includes('montant') ||
      headerLine.includes('créé') ||
      headerLine.includes('total') ||
      headerLine.includes('prix');

    // Default column indices based on user's exact spreadsheet layout:
    let cityIdx = 0;
    let statusIdx = 1;
    let feeIdx = 2;
    let nameIdx = 3;
    let priceIdx = 4;
    let createdDateIdx = 5;
    let deliverDateIdx = 6;

    let dataLines = lines;

    if (hasHeader) {
      const headerParts = lines[0].includes('\t')
        ? lines[0].split('\t')
        : lines[0].includes(';')
        ? lines[0].split(';')
        : lines[0].split(',');

      const cleanHeaders = headerParts.map((h) => h.toLowerCase().trim().replace(/^["']|["']$/g, ''));

      const fCity = cleanHeaders.findIndex((h) => h.includes('ville') || h.includes('city'));
      const fStatus = cleanHeaders.findIndex((h) => h.includes('code') || h.includes('statut') || h.includes('status'));
      const fFee = cleanHeaders.findIndex((h) => h.includes('frais') || h.includes('shipping') || h.includes('fee'));
      const fName = cleanHeaders.findIndex((h) => (h.includes('nom') || h.includes('client') || h.includes('customer')) && !h.includes('ville'));
      const fPrice = cleanHeaders.findIndex((h) => h.includes('montant') || h.includes('total') || h.includes('prix') || h.includes('price'));
      const fCreated = cleanHeaders.findIndex((h) => h.includes('créé') || h.includes('created') || h.includes('date'));
      const fDeliver = cleanHeaders.findIndex((h) => h.includes('deliver') || h.includes('livr'));

      if (fCity >= 0) cityIdx = fCity;
      if (fStatus >= 0) statusIdx = fStatus;
      if (fFee >= 0) feeIdx = fFee;
      if (fName >= 0) nameIdx = fName;
      if (fPrice >= 0) priceIdx = fPrice;
      if (fCreated >= 0) createdDateIdx = fCreated;
      if (fDeliver >= 0) deliverDateIdx = fDeliver;

      // Skip the header line
      dataLines = lines.slice(1);
    }

    const results: ParsedDeliveryRow[] = [];

    dataLines.forEach((line) => {
      const parts = line.includes('\t')
        ? line.split('\t')
        : line.includes(';')
        ? line.split(';')
        : line.split(',');

      const cleanParts = parts.map((p) => p.trim().replace(/^["']|["']$/g, ''));
      if (cleanParts.length === 0 || !cleanParts.some((p) => p.length > 0)) return;

      const customerCity = cleanParts[cityIdx] || cleanParts[0] || 'Maroc';
      const statusRaw = cleanParts[statusIdx] || '';
      const feeRaw = cleanParts[feeIdx] || '';
      const customerName = cleanParts[nameIdx] || 'Client COD';
      const priceRaw = cleanParts[priceIdx] || '';
      const createdRaw = cleanParts[createdDateIdx] || '';
      const deliverRaw = cleanParts[deliverDateIdx] || '';

      // Determine Status
      const statusLower = (statusRaw + ' ' + cleanParts.join(' ')).toLowerCase();
      let newStatus: OrderStatus = 'shipped';
      let newPayment: PaymentStatus = 'unpaid';

      if (statusLower.includes('livr') || statusLower.includes('delivered') || statusLower.includes('pay')) {
        newStatus = 'delivered';
        newPayment = 'paid';
      } else if (statusLower.includes('refus') || statusLower.includes('retour') || statusLower.includes('returned') || statusLower.includes('echec')) {
        newStatus = 'returned';
        newPayment = 'refunded';
      } else if (statusLower.includes('annul') || statusLower.includes('cancel')) {
        newStatus = 'cancelled';
        newPayment = 'unpaid';
      } else {
        newStatus = 'shipped';
        newPayment = 'unpaid';
      }

      // Selling price & Delivery fee extraction
      let sellingPrice = extractAmount(priceRaw);
      let deliveryFee = extractAmount(feeRaw);

      // If price was not found at expected index, scan numeric columns
      if (sellingPrice === 0) {
        const numbers = cleanParts.map(extractAmount).filter((n) => n > 0);
        if (numbers.length > 0) {
          const sorted = [...numbers].sort((a, b) => b - a);
          sellingPrice = sorted[0]; // Highest is selling price
          if (sorted.length > 1 && sorted[1] <= 60) {
            deliveryFee = sorted[1];
          }
        }
      }

      const orderDate = parseDateToIso(createdRaw);
      const deliverDate = deliverRaw ? parseDateToIso(deliverRaw) : undefined;

      // Matching with existing orders
      const normName = customerName.toLowerCase().trim();

      const matched = orders.find((o) => {
        const oName = o.customerName.toLowerCase().trim();
        if (normName && oName === normName) return true;
        if (normName && oName.includes(normName)) return true;
        if (normName && normName.includes(oName) && normName.length > 3) return true;
        return false;
      });

      results.push({
        rawId: customerName || cleanParts[0],
        customerName: customerName.trim(),
        customerCity: customerCity.trim(),
        statusText: statusRaw.trim() || (newStatus === 'delivered' ? 'Livré' : newStatus === 'returned' ? 'Refusé' : 'Annulé'),
        newStatus,
        newPaymentStatus: newPayment,
        sellingPrice: sellingPrice > 0 ? sellingPrice : 130,
        deliveryFee,
        orderDate,
        deliverDate,
        matchedOrder: matched,
        action: matched ? 'update' : 'create',
        selected: true,
      });
    });

    return results;
  }, [inputText, orders]);

  // Perform bulk auto-adjustment and creation
  const handleApplyAutoAdjust = () => {
    const toProcess = parsedRows.filter((r) => r.selected);
    if (toProcess.length === 0) return;

    let updatedCount = 0;
    let createdCount = 0;

    // Pick fallback wallet model for new orders
    const fallbackModel = models[0] || {
      id: 'mod-default',
      name: 'Portefeuille Cuir Artisan',
      sku: 'ALT-WALLET',
      unitProductionCost: 95,
      sellingPrice: 190,
    };

    toProcess.forEach((row, idx) => {
      // 1. If matching order exists: update it
      if (row.matchedOrder) {
        const order = row.matchedOrder;

        if (row.newStatus === 'returned') {
          processReturn({
            orderId: order.id,
            returnedQuantity: order.items.reduce((acc, i) => acc + i.quantity, 0),
            refundAmount: 0,
            restockCondition: 'resellable',
            reason: `Carrier Report (${carrier}): Refusé / Retour client`,
          });
        } else {
          saveOrder({
            ...order,
            customerCity: row.customerCity || order.customerCity,
            orderStatus: row.newStatus,
            paymentStatus: row.newPaymentStatus,
            totalAmount: row.sellingPrice || order.totalAmount,
            amountPaid: row.newStatus === 'delivered' ? row.sellingPrice : 0,
            outstandingBalance: row.newStatus === 'delivered' ? 0 : row.sellingPrice,
            shippingCostActual: row.deliveryFee,
            carrierName: carrier,
          });
        }
        updatedCount++;
      } else if (allowCreateMissing) {
        // 2. If no matching order exists: AUTO-CREATE the order!
        const matchingModel =
          models.find((m) => Math.abs(m.sellingPrice - row.sellingPrice) < 30) || fallbackModel;

        const lineItem: OrderLineItem = {
          modelId: matchingModel.id,
          modelName: matchingModel.name,
          sku: matchingModel.sku,
          quantity: 1,
          unitPrice: row.sellingPrice,
          unitCost: matchingModel.unitProductionCost || 85,
          totalPrice: row.sellingPrice,
          totalCost: matchingModel.unitProductionCost || 85,
        };

        const newOrderNumber = `CMD-${1040 + orders.length + idx + 1}`;

        saveOrder({
          orderNumber: newOrderNumber,
          customerName: row.customerName,
          customerCity: row.customerCity,
          customerPhone: '0600000000',
          orderDate: row.orderDate,
          channel: 'direct_atelier',
          items: [lineItem],
          subtotal: row.sellingPrice,
          discount: 0,
          shippingCharged: 0,
          shippingCostActual: row.deliveryFee,
          totalAmount: row.sellingPrice,
          amountPaid: row.newStatus === 'delivered' ? row.sellingPrice : 0,
          outstandingBalance: row.newStatus === 'delivered' ? 0 : row.sellingPrice,
          paymentMethod: 'cod',
          paymentStatus: row.newPaymentStatus,
          orderStatus: row.newStatus,
          carrierName: carrier,
          notes: `Imported via Screenshot (${carrier}) on ${row.orderDate}`,
        });
        createdCount++;
      }
    });

    setSuccessCount({ updated: updatedCount, created: createdCount });
  };

  // Computed summary metrics of parsed rows
  const summaryMetrics = useMemo(() => {
    const selected = parsedRows.filter((r) => r.selected);
    const totalDelivered = selected.filter((r) => r.newStatus === 'delivered').length;
    const totalReturned = selected.filter((r) => r.newStatus === 'returned').length;
    const totalCancelled = selected.filter((r) => r.newStatus === 'cancelled').length;
    const totalSellingPrice = selected.reduce((s, r) => s + r.sellingPrice, 0);
    const totalDeliveryFees = selected.reduce((s, r) => s + r.deliveryFee, 0);
    const deliveredCash = selected.filter((r) => r.newStatus === 'delivered').reduce((s, r) => s + r.sellingPrice, 0);

    return {
      totalRows: selected.length,
      totalDelivered,
      totalReturned,
      totalCancelled,
      totalSellingPrice,
      totalDeliveryFees,
      deliveredCash,
    };
  }, [parsedRows]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-charcoal-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-cream-300 shadow-2xl p-5 sm:p-6 animate-fade-in space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-cream-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-charcoal-900 flex items-center gap-2">
                <span>Screenshot & Sheet Auto-Import</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  AI Powered
                </span>
              </h3>
              <p className="text-xs text-charcoal-500">
                Upload or paste a screenshot of your orders to automatically extract prices, cities, and statuses
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-charcoal-400 hover:text-charcoal-700 hover:bg-cream-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex items-center gap-2 border-b border-cream-200 pb-2">
          <button
            type="button"
            onClick={() => setInputMode('screenshot')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              inputMode === 'screenshot'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>📸 Screenshot AI Auto-Scan</span>
          </button>

          <button
            type="button"
            onClick={() => setInputMode('paste')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              inputMode === 'paste'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>📋 Paste Table / Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setInputMode('csv')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              inputMode === 'csv'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>📁 Upload CSV</span>
          </button>
        </div>

        {/* TAB 1: SCREENSHOT AI AUTO-IMPORT */}
        {inputMode === 'screenshot' && (
          <div className="space-y-3">
            {/* Quick Demo Screenshot Button */}
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-emerald-950 block">
                    Have the screenshot from your image?
                  </span>
                  <span className="text-[11px] text-emerald-800">
                    Click below to scan it with AI in 1 second
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLoadSampleScreenshot}
                disabled={isScanningImage}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {isScanningImage ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5" />
                )}
                Scan My Screenshot with AI
              </button>
            </div>

            {/* Drag & Drop / Paste Screenshot Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleProcessImage(file);
              }}
              className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/70 rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleProcessImage(file);
                }}
                className="hidden"
              />

              <div className="w-12 h-12 rounded-2xl bg-white text-emerald-600 shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform mb-2 border border-emerald-200">
                {isScanningImage ? (
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                ) : (
                  <ImageIcon className="w-6 h-6" />
                )}
              </div>

              <div className="font-bold text-charcoal-900 text-sm">
                Drop your screenshot here, or click to browse
              </div>
              <p className="text-xs text-charcoal-500 mt-0.5">
                Supports PNG, JPG, WebP • <strong>Or press Ctrl + V anywhere to paste directly</strong>
              </p>

              {scanStatusMessage && (
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-full font-semibold animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" />
                  {scanStatusMessage}
                </div>
              )}

              {scanError && (
                <div className="mt-3 text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-xl font-medium">
                  {scanError}
                </div>
              )}
            </div>

            {/* Thumbnail preview if available */}
            {screenshotPreview && (
              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-cream-100 border border-cream-300">
                <img
                  src={screenshotPreview}
                  alt="Screenshot preview"
                  className="w-16 h-12 object-cover rounded-xl border border-cream-300 shadow-xs"
                />
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-xs text-charcoal-900 truncate block">
                    {fileName || 'Screenshot image'}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold block">
                    ✓ Scanned with Gemini Vision
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 text-xs font-semibold text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-200 rounded-lg transition-colors"
                >
                  Change
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2 & 3: PASTE OR CSV */}
        {(inputMode === 'paste' || inputMode === 'csv') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-charcoal-700">
              <span className="flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Paste text rows or upload CSV
              </span>
              <label className="text-blue-600 hover:underline cursor-pointer flex items-center gap-1 font-semibold text-[11px]">
                <Upload className="w-3.5 h-3.5" />
                Upload .CSV file
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setFileName(file.name);
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const content = event.target?.result as string;
                      if (content) setInputText(content);
                    };
                    reader.readAsText(file);
                  }}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Ville du client\tCode\tFrais de livraison\tNom du client\tMontant total\tCréé le\tDeliver date\nCasablanca - Sidi Maârouf\tLivré\t19 DH\tAyoub\t310 DH\t19/10/2026\t22/10/2026\nSale\tLivré\t35 DH\tAziz\t130 DH\t19/10/2026\t21/10/2026`}
              className="w-full p-3 font-mono text-xs bg-cream-50/70 border border-cream-300 rounded-2xl outline-none focus:border-emerald-500 focus:bg-white transition-all text-charcoal-800"
            />
          </div>
        )}

        {/* Live Detected Financials Summary Bar */}
        {parsedRows.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
            <div className="p-2.5 rounded-xl bg-cream-100 border border-cream-300">
              <span className="text-[10px] text-charcoal-500 uppercase font-bold block">Orders Extracted</span>
              <span className="font-bold text-sm text-charcoal-900">{summaryMetrics.totalRows} orders</span>
              <span className="text-[10px] text-emerald-700 block font-medium">
                {summaryMetrics.totalDelivered} Livré • {summaryMetrics.totalReturned} Refusé
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] text-emerald-800 uppercase font-bold block">Total Selling Prices</span>
              <span className="font-black text-sm text-emerald-900 font-mono">
                {formatCurrency(summaryMetrics.totalSellingPrice, settings.currencySymbol)}
              </span>
              <span className="text-[10px] text-emerald-700 block">Exact sales value</span>
            </div>

            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
              <span className="text-[10px] text-blue-800 uppercase font-bold block">COD Cash Collected</span>
              <span className="font-black text-sm text-blue-900 font-mono">
                +{formatCurrency(summaryMetrics.deliveredCash, settings.currencySymbol)}
              </span>
              <span className="text-[10px] text-blue-700 block">From delivered orders</span>
            </div>

            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
              <span className="text-[10px] text-rose-800 uppercase font-bold block">Delivery Fees</span>
              <span className="font-bold text-sm text-rose-900 font-mono">
                -{formatCurrency(summaryMetrics.totalDeliveryFees, settings.currencySymbol)}
              </span>
              <span className="text-[10px] text-rose-700 block">Courier fees</span>
            </div>
          </div>
        )}

        {/* Parsed Orders Table Preview */}
        {parsedRows.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-charcoal-800 flex items-center gap-1.5">
                <span>Orders to Import ({parsedRows.length})</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  {parsedRows.filter((r) => r.matchedOrder).length} existing •{' '}
                  {parsedRows.filter((r) => !r.matchedOrder).length} new to create
                </span>
              </span>

              <label className="flex items-center gap-1.5 text-xs text-charcoal-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowCreateMissing}
                  onChange={(e) => setAllowCreateMissing(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Automatically create missing orders in app</span>
              </label>
            </div>

            <div className="border border-cream-300 rounded-2xl overflow-hidden max-h-52 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-cream-100 text-[10px] uppercase font-bold text-charcoal-600 border-b border-cream-200">
                    <th className="py-2 px-3">Client & Ville</th>
                    <th className="py-2 px-3">Statut</th>
                    <th className="py-2 px-3 text-right">Selling Price (Montant)</th>
                    <th className="py-2 px-3 text-right">Frais Livraison</th>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Action</th>
                    <th className="py-2 px-3 text-center">Import</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100">
                  {parsedRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-cream-50/80 transition-colors">
                      <td className="py-2 px-3">
                        <div className="font-bold text-charcoal-900">{row.customerName}</div>
                        <div className="text-[10px] text-charcoal-500 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-charcoal-400" />
                          {row.customerCity}
                        </div>
                      </td>

                      <td className="py-2 px-3">
                        {row.newStatus === 'delivered' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Livré
                          </span>
                        ) : row.newStatus === 'returned' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                            <RotateCcw className="w-2.5 h-2.5" /> Refusé
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                            Annulé
                          </span>
                        )}
                      </td>

                      <td className="py-2 px-3 text-right font-serif font-black text-emerald-950 text-sm">
                        {formatCurrency(row.sellingPrice, settings.currencySymbol)}
                      </td>

                      <td className="py-2 px-3 text-right font-mono text-charcoal-600 text-xs">
                        {row.deliveryFee > 0 ? `${row.deliveryFee} DH` : '0 DH'}
                      </td>

                      <td className="py-2 px-3 font-mono text-[10px] text-charcoal-500">
                        {row.orderDate}
                      </td>

                      <td className="py-2 px-3">
                        {row.matchedOrder ? (
                          <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-semibold">
                            Update {row.matchedOrder.orderNumber}
                          </span>
                        ) : (
                          <span className="text-[10px] bg-blue-50 text-blue-800 border border-blue-200 px-1.5 py-0.5 rounded font-semibold flex items-center gap-1 w-fit">
                            <PlusCircle className="w-3 h-3 text-blue-600" /> Create Order
                          </span>
                        )}
                      </td>

                      <td className="py-2 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={row.selected}
                          onChange={(e) => {
                            row.selected = e.target.checked;
                          }}
                          className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Success Confirmation Banner */}
        {successCount !== null && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between text-xs text-emerald-900 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-sm">
                  Successfully imported & adjusted {successCount.created + successCount.updated} orders!
                </span>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  {successCount.created} new orders created with exact selling prices • {successCount.updated} existing
                  orders updated. Net Profit & Delivery Rate updated automatically!
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition-colors shrink-0"
            >
              Done
            </button>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-cream-200 text-xs">
          <div className="text-charcoal-500 flex items-center gap-1 text-[11px]">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>AI extracts: Client, Ville, Statut, Frais de livraison, and Exact Selling Price</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-charcoal-600 hover:bg-cream-100 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyAutoAdjust}
              disabled={parsedRows.filter((r) => r.selected).length === 0}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-soft flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Import & Auto-Adjust ({parsedRows.filter((r) => r.selected).length}) Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
