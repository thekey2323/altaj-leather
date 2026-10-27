import {
  PricingCalculatorInputs,
  PricingCalculatorOutputs,
} from '@/types/altaj';

/**
 * Calculates suggested retail price and margins based on artisan leathercraft formula:
 * Required Price = (Material Cost + Labor Cost + Packaging + Direct Costs + Shipping Subsidy) / (1 - Target Margin - Variable Fee Rate)
 */
export function calculateWalletPricing(
  inputs: PricingCalculatorInputs
): PricingCalculatorOutputs {
  const {
    leatherAreaRequired,
    leatherPurchasePricePerUnit,
    leatherWastePercent,
    threadCost,
    hardwareCost,
    edgeFinishingCost,
    packagingCost,
    productionTimeMinutes,
    hourlyLaborRate,
    otherDirectCosts,
    variableSellingFeePercent,
    shippingSubsidy,
    targetProfitMarginPercent,
    desiredSellingPrice,
  } = inputs;

  // Leather cost including waste allowance
  // If 15% waste, the leather needed is leatherAreaRequired * (1 + waste/100)
  const wasteMultiplier = 1 + Math.max(0, leatherWastePercent || 0) / 100;
  const effectiveLeatherArea = Math.max(0, leatherAreaRequired || 0) * wasteMultiplier;
  const totalLeatherCost = effectiveLeatherArea * Math.max(0, leatherPurchasePricePerUnit || 0);

  // Other material costs
  const totalMaterialCost =
    totalLeatherCost +
    Math.max(0, threadCost || 0) +
    Math.max(0, hardwareCost || 0) +
    Math.max(0, edgeFinishingCost || 0) +
    Math.max(0, packagingCost || 0);

  // Direct labor cost: (minutes / 60) * hourlyRate
  const laborHours = Math.max(0, productionTimeMinutes || 0) / 60;
  const directLaborCost = laborHours * Math.max(0, hourlyLaborRate || 0);

  // Total unit production cost
  const totalProductionCost =
    totalMaterialCost + directLaborCost + Math.max(0, otherDirectCosts || 0);

  // Fixed costs per unit (including any non-recovered shipping subsidy)
  const subsidy = Math.max(0, shippingSubsidy || 0);
  const fixedUnitCost = totalProductionCost + subsidy;

  // Target margin and fee rates in decimal
  const targetMarginRate = Math.max(0, targetProfitMarginPercent || 0) / 100;
  const variableFeeRate = Math.max(0, variableSellingFeePercent || 0) / 100;

  const denominator = 1 - targetMarginRate - variableFeeRate;

  let suggestedSellingPrice = 0;
  let isMarginFeasible = true;
  let errorMessage: string | undefined;

  if (denominator <= 0) {
    isMarginFeasible = false;
    errorMessage = `Target margin (${targetProfitMarginPercent}%) plus selling fees (${variableSellingFeePercent}%) equals ${(targetMarginRate + variableFeeRate) * 100}%, which is >= 100%. This pricing formula is mathematically impossible. Please lower your target margin or fees.`;
    // Fallback: simple markup on cost
    suggestedSellingPrice = Math.round(fixedUnitCost * 1.5);
  } else {
    suggestedSellingPrice = Math.round((fixedUnitCost / denominator) * 10) / 10;
  }

  const sellingFeeAtSuggested =
    Math.round(suggestedSellingPrice * variableFeeRate * 10) / 10;
  const grossProfitAtSuggested =
    Math.round((suggestedSellingPrice - totalProductionCost) * 10) / 10;
  const grossMarginAtSuggestedPercent =
    suggestedSellingPrice > 0
      ? Math.round((grossProfitAtSuggested / suggestedSellingPrice) * 1000) / 10
      : 0;

  const contributionProfitAtSuggested =
    Math.round(
      (suggestedSellingPrice - totalProductionCost - sellingFeeAtSuggested - subsidy) * 10
    ) / 10;
  const netMarginEstimatePercent =
    suggestedSellingPrice > 0
      ? Math.round((contributionProfitAtSuggested / suggestedSellingPrice) * 1000) / 10
      : 0;

  // Analysis of desired price if user entered one
  let desiredPriceAnalysis: PricingCalculatorOutputs['desiredPriceAnalysis'];
  if (desiredSellingPrice && desiredSellingPrice > 0) {
    const desiredFee = Math.round(desiredSellingPrice * variableFeeRate * 10) / 10;
    const desiredGrossProfit =
      Math.round((desiredSellingPrice - totalProductionCost) * 10) / 10;
    const desiredGrossMargin =
      Math.round((desiredGrossProfit / desiredSellingPrice) * 1000) / 10;
    const desiredContribution =
      Math.round(
        (desiredSellingPrice - totalProductionCost - desiredFee - subsidy) * 10
      ) / 10;
    const desiredNetMargin =
      Math.round((desiredContribution / desiredSellingPrice) * 1000) / 10;

    desiredPriceAnalysis = {
      sellingPrice: desiredSellingPrice,
      sellingFee: desiredFee,
      grossProfit: desiredGrossProfit,
      grossMarginPercent: desiredGrossMargin,
      contributionProfit: desiredContribution,
      netMarginPercent: desiredNetMargin,
      isProfitable: desiredContribution > 0,
    };
  }

  return {
    totalMaterialCost: Math.round(totalMaterialCost * 10) / 10,
    directLaborCost: Math.round(directLaborCost * 10) / 10,
    totalProductionCost: Math.round(totalProductionCost * 10) / 10,
    shippingSubsidy: subsidy,
    fixedUnitCost: Math.round(fixedUnitCost * 10) / 10,
    suggestedSellingPrice,
    sellingFeeAtSuggestedPrice: sellingFeeAtSuggested,
    grossProfitAtSuggested,
    grossMarginAtSuggestedPercent,
    netMarginEstimatePercent,
    isMarginFeasible,
    errorMessage,
    desiredPriceAnalysis,
  };
}
