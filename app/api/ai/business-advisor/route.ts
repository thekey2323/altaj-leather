import { NextRequest, NextResponse } from 'next/server';
import { geminiClient, GEMINI_MODEL_TEXT, isGeminiConfigured } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, metrics } = body as {
      question?: string;
      metrics?: {
        totalRevenue: number;
        netProfit: number;
        netMarginPercent: number;
        grossProfit: number;
        grossMarginPercent: number;
        cogs: number;
        packagingCost: number;
        shippingCost: number;
        adSpend: number;
        roas: number;
        cac: number;
        deliveredOrdersCount: number;
        returnRatePercent: number;
        activeModelsCount: number;
        finishedStockUnits: number;
        finishedStockValue: number;
        uncollectedCOD: number;
      };
    };

    const q = (question || '').trim();
    const m = metrics || {
      totalRevenue: 33630,
      netProfit: 14170,
      netMarginPercent: 42.1,
      grossProfit: 21030,
      grossMarginPercent: 62.5,
      cogs: 9720,
      packagingCost: 1080,
      shippingCost: 2520,
      adSpend: 4200,
      roas: 3.4,
      cac: 58.3,
      deliveredOrdersCount: 72,
      returnRatePercent: 8.3,
      activeModelsCount: 5,
      finishedStockUnits: 36,
      finishedStockValue: 4860,
      uncollectedCOD: 3850,
    };

    // Helper for fallback expert response
    const generateLocalAdvice = (userQ: string) => {
      const qLower = userQ.toLowerCase();

      if (qLower.includes('double') || qLower.includes('scale') || qLower.includes('grow')) {
        return `### 🚀 Roadmap to Double Your Net Profit (${m.netProfit.toLocaleString()} DH → ${(m.netProfit * 2).toLocaleString()} DH)

1. **Launch High-AOV Leather Bundles (Zero Extra Ad Cost)**:
   - Pair your best-selling full-grain bifold with a slim cardholder or leather keychain.
   - Bundle price: **450 DH** (vs 380 DH individual). Estimated margin uplift: **+38% per parcel**.

2. **Reduce COD Delivery Loss & Returns**:
   - Your current return rate is ~${m.returnRatePercent}%. Every returned COD order costs you ${m.shippingCost > 0 ? Math.round(m.shippingCost / Math.max(1, m.deliveredOrdersCount)) : 35} DH in two-way courier fees.
   - Implement **WhatsApp Voice Confirmation** before packing. Slashing returns to 4% saves an immediate **+1,800 DH/month**.

3. **Scale Your Top-Performing TikTok UGC Ads**:
   - Current ROAS is **${m.roas}x**. With an average CAC of **${m.cac} DH**, your customer acquisition is healthy.
   - Reallocate 40% of Facebook budget into TikTok craftsman stitching videos ("Made in Fès Médina") to double order volume profitably.

4. **Bulk Leather Procurement**:
   - Tanneries in Fès offer an 8-12% price break when buying 150+ sq ft. This reduces unit COGS by **15 DH/wallet**.`;
      }

      if (qLower.includes('leak') || qLower.includes('worst') || qLower.includes('waste') || qLower.includes('risk')) {
        return `### 🔍 Profit Leak & Vulnerability Diagnosis

1. **Uncollected COD Remittance (${m.uncollectedCOD.toLocaleString()} DH)**:
   - Cash locked with courier services (Amana/Cathedis). Reconcile your courier delivery manifests weekly to ensure payouts aren't delayed beyond 7 days.

2. **Courier Return Deductions (${m.returnRatePercent}% Refusal Rate)**:
   - Courier delivery costs (${m.shippingCost.toLocaleString()} DH) represent a major cash deduction. 
   - Customers refusing parcels upon delivery is your biggest avoidable drain. Require city + district address precision and order re-confirmation.

3. **Packaging Cost Benchmark (${m.packagingCost.toLocaleString()} DH Total)**:
   - At ~15 DH/box, packaging is 4.5% of selling price. That is acceptable for luxury artisan positioning, provided it builds unboxing virality on social media.`;
      }

      if (qLower.includes('ad') || qLower.includes('marketing') || qLower.includes('tiktok') || qLower.includes('facebook')) {
        return `### 🎯 Marketing & Ad Spend Strategy (${m.adSpend.toLocaleString()} DH Ad Budget)

1. **ROAS Assessment (${m.roas}x Current Return on Ad Spend)**:
   - In Moroccan luxury leathercraft, a ROAS above 3.0x is considered **healthy and scalable**. Your current ${m.roas}x gives you leeway to increase daily spend by 25%.

2. **Channel Strategy**:
   - **TikTok (High Volume, Low CAC)**: Focus on ASMR leather cutting, edge beveling, and burnishing. Ideal price point: 250 - 320 DH.
   - **Instagram / Meta (High Ticket & Gifting)**: Focus on personalized embossed initials and gift packaging for professional buyers. Ideal price point: 380 - 550 DH.

3. **Free Repeat Sales via WhatsApp VIP Broadcast**:
   - You have ${m.deliveredOrdersCount} satisfied buyers. Announce exclusive leather care balm or matching key fobs with zero advertising expense.`;
      }

      // Default comprehensive advice
      return `### 💡 Executive Atelier Business Health Summary

- **Net Profit Margin: ${m.netMarginPercent}%** (Status: **Strong 🟢**). You are generating ${m.netProfit.toLocaleString()} DH net cash from ${m.totalRevenue.toLocaleString()} DH revenue.
- **Gross Profit Margin: ${m.grossMarginPercent}%** (Status: **Optimal 🟢**). COGS of ${m.cogs.toLocaleString()} DH leaves healthy gross room for ads and fulfillment.
- **COD Delivery Health**: ${m.deliveredOrdersCount} delivered parcels with ${m.returnRatePercent}% return rate.

#### Immediate Recommendations:
1. **Maintain Finished Stock Cover**: You currently hold ${m.finishedStockUnits} finished wallets (${m.finishedStockValue.toLocaleString()} DH). Keep at least 40 units ready to avoid out-of-stock delays during ad spikes.
2. **Standardize Courier Contracts**: Negotiate a volume bracket below 35 DH with your courier for major metropolitan hubs (Casablanca, Rabat, Fès, Marrakech).
3. **Upsell Personalized Initials**: Adding hot-foil or debossed monogramming costs under 3 DH in labor/foil but commands a +40 DH premium on retail price.`;
    };

    if (!isGeminiConfigured() || !geminiClient) {
      return NextResponse.json({
        success: true,
        source: 'local_expert_engine',
        advice: generateLocalAdvice(q),
      });
    }

    try {
      const model = geminiClient.getGenerativeModel({
        model: GEMINI_MODEL_TEXT,
      });

      const prompt = `You are an elite Chief Operating Officer & Financial Strategist for ALTAJLEATHER, an artisan handmade leather goods atelier and e-commerce brand based in Morocco (Fès Medina).
The brand sells full-grain vegetable-tanned wallets across Morocco via Cash-on-Delivery (COD).

Current Live Business Numbers:
- Recognized Revenue: ${m.totalRevenue} DH
- Net Profit: ${m.netProfit} DH
- Net Profit Margin: ${m.netMarginPercent}%
- Gross Profit: ${m.grossProfit} DH
- Gross Margin: ${m.grossMarginPercent}%
- Leather & Direct COGS: ${m.cogs} DH
- Packaging Costs: ${m.packagingCost} DH
- Courier Shipping Deductions: ${m.shippingCost} DH
- Ad Spend: ${m.adSpend} DH
- Marketing ROAS: ${m.roas}x
- CAC: ${m.cac} DH / order
- Delivered Orders: ${m.deliveredOrdersCount}
- Return / Refusal Rate: ${m.returnRatePercent}%
- Finished Inventory in Stock: ${m.finishedStockUnits} units (${m.finishedStockValue} DH)
- Uncollected COD Remittance: ${m.uncollectedCOD} DH

User Question / Goal: "${q || 'Provide a comprehensive diagnosis of my business health, KPIs, and actionable steps to improve profitability and operations.'}"

Provide a direct, practical, and highly strategic response:
1. Directly assess whether the KPIs and business health are good, monitor, or at risk (with specific reference to Moroccan e-commerce benchmarks).
2. Give 3-4 specific, numbered actionable steps the business owner should take right now to improve margins, cut costs, or scale sales.
3. Highlight any hidden profit leaks (returns, courier fees, stockouts, uncollected COD).
4. Format in clean markdown with clear headers and bullet points. Keep it professional, encouraging, and razor-sharp.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      return NextResponse.json({
        success: true,
        source: 'gemini_ai',
        advice: text,
      });
    } catch (apiError: any) {
      console.warn('Gemini API call failed, falling back to local expert engine:', apiError?.message);
      return NextResponse.json({
        success: true,
        source: 'local_expert_engine',
        advice: generateLocalAdvice(q),
      });
    }
  } catch (error: any) {
    console.error('AI Advisor error:', error);
    return NextResponse.json(
      { error: 'Failed to process AI advisory request', details: error?.message },
      { status: 500 }
    );
  }
}
