// Pricing Types

export interface PriceMultipliers {
  demand: number;
  seasonal: number;
  utilization: number;
  duration: number;
  customer: number;
}

export interface PriceBreakdown {
  base: number;
  multipliers: PriceMultipliers;
  dynamicPrice?: number;
  constraints?: { min: number; max: number; applied: boolean };
  rules?: Array<{
    name: string;
    description?: string;
    adjustment: number;
  }>;
}

export interface PriceCalculation {
  carId: number;
  pricePerDay: number;
  totalPrice: number;
  duration: number;
  breakdown: PriceBreakdown;
  /** When false, pricing uses fixed listing + optional loyalty only (no demand/seasonal stack). */
  isDynamic?: boolean;
}

export interface PricePreview {
  carId: number;
  pricePerDay: number;
  totalPrice: number;
  duration: number;
}

export interface CityDemand {
  totalCars: number;
  availableCars: number;
  utilizationRate: number;
  demandScore: number;
}

export interface CustomerLoyalty {
  tier: string;
  /** Total effective loyalty discount % applied in pricing (tier + recent bonus, capped) */
  discount: number;
  tierDiscount?: number;
  recentActivityBonus?: number;
  rentalsCount: number;
  lifetimeValue: number;
}

export interface PricingStatistics {
  avgBasePrice: number;
  avgFinalPrice: number;
  avgDemandMultiplier: number;
}

export interface PricingSnapshot {
  id: number;
  carId: number;
  requestedAt: string;
  startDate: string;
  endDate: string;
  duration: number;
  basePrice: number;
  finalPrice: number;
  demandMultiplier: number;
  seasonalMultiplier: number;
  utilizationMultiplier: number;
  durationMultiplier: number;
  customerMultiplier: number;
  cityId?: number;
  userId?: number;
}

export interface PricingAnalytics {
  revenue: {
    total: number;
    totalContracts: number;
    avgPerContract: number;
    avgPricePerDay: number;
  };
  pricingPerformance: {
    dynamicPricingUsage: number;
    revenueImpact: number;
    avgDemandMultiplier: number;
    avgSeasonalMultiplier: number;
  };
}

export interface RevenueBreakdown {
  summary: {
    totalRevenue: number;
    pendingRevenue: number;
    lostRevenue: number;
    completedContracts: number;
    activeContracts: number;
    cancelledContracts: number;
  };
  topCars: Array<{
    car: string;
    revenue: number;
    contracts: number;
  }>;
}

export interface CarPerformanceItem {
  carId: number;
  utilizationRate: number;
  avgPriceMultiplier: number;
  totalContracts: number;
}

export type CarPerformance = CarPerformanceItem[];

export interface PricingRule {
  id: number;
  name: string;
  description?: string;
  carId?: number;
  cityId?: number;
  startDate?: string;
  endDate?: string;
  fixedPrice?: number;
  multiplier?: number;
  priority?: number;
  isActive: boolean;
  createdAt: string;
}

export interface PricingRuleCreate {
  name: string;
  description?: string;
  carId?: number;
  cityId?: number;
  startDate?: string;
  endDate?: string;
  fixedPrice?: number | null;
  multiplier?: number | null;
  priority?: number;
}

export interface SeasonalFactor {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  multiplier: number;
  cityId?: number;
  isActive: boolean;
  createdAt: string;
}

export interface SeasonalFactorCreate {
  name: string;
  startDate: string;
  endDate: string;
  multiplier: number;
  cityId?: number;
}

export interface CarPricingConfig {
  useDynamicPricing: boolean;
  basePricePerDay: number;
  minPricePerDay: number;
  maxPricePerDay: number;
  dailyOperatingCost?: number;
  monthlyFinancingCost?: number;
  purchasePrice?: number;
  applyUtilizationPricing?: boolean;
  utilizationMultiplierOverride?: number | null;
}
