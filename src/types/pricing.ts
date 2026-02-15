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
}

export interface PriceCalculation {
  carId: number;
  pricePerDay: number;
  totalPrice: number;
  duration: number;
  breakdown: PriceBreakdown;
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
  discount: number;
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
  fixedPrice?: number;
  multiplier?: number;
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
}
