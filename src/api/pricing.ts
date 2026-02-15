import api from '../lib/api';
import type {
  PriceCalculation,
  PricePreview,
  CityDemand,
  CustomerLoyalty,
  PricingAnalytics,
  RevenueBreakdown,
  CarPerformance,
  PricingRule,
  PricingRuleCreate,
  SeasonalFactor,
  SeasonalFactorCreate,
  CarPricingConfig,
} from '../types/pricing';

export const pricingApi = {
  // Public endpoints
  calculatePrice: async (params: {
    carId: number;
    startDate: string;
    endDate: string;
    userId?: number;
  }): Promise<PriceCalculation> => {
    const response = await api.post<PriceCalculation>('/api/pricing/calculate', params);
    return response.data;
  },

  getPreview: async (
    carId: number,
    startDate: string,
    endDate: string
  ): Promise<PricePreview> => {
    const response = await api.get<PricePreview>(`/api/pricing/preview/${carId}`, {
      params: { startDate, endDate },
    });
    return response.data;
  },

  getCityDemand: async (cityId: number): Promise<CityDemand> => {
    const response = await api.get<CityDemand>(`/api/pricing/demand/${cityId}`);
    return response.data;
  },

  getCustomerLoyalty: async (): Promise<CustomerLoyalty> => {
    const response = await api.get<CustomerLoyalty>('/api/pricing/loyalty');
    return response.data;
  },

  // Admin endpoints
  getAnalytics: async (params?: {
    startDate?: string;
    endDate?: string;
    cityId?: number;
  }): Promise<PricingAnalytics> => {
    const response = await api.get<PricingAnalytics>('/api/admin/pricing/analytics', {
      params,
    });
    return response.data;
  },

  getRevenue: async (params?: {
    startDate?: string;
    endDate?: string;
    cityId?: number;
    groupBy?: 'city';
  }): Promise<RevenueBreakdown> => {
    const response = await api.get<RevenueBreakdown>('/api/admin/pricing/revenue', {
      params,
    });
    return response.data;
  },

  getCarPerformance: async (cityId?: number): Promise<CarPerformance> => {
    const response = await api.get<CarPerformance>('/api/admin/pricing/performance', {
      params: cityId ? { cityId } : {},
    });
    return response.data;
  },

  updateCarPricingConfig: async (
    carId: number,
    config: Partial<CarPricingConfig>
  ): Promise<void> => {
    await api.put(`/api/admin/pricing/cars/${carId}/config`, config);
  },

  // Pricing rules
  getPricingRules: async (): Promise<PricingRule[]> => {
    const response = await api.get<PricingRule[]>('/api/admin/pricing/rules');
    return response.data;
  },

  createPricingRule: async (rule: PricingRuleCreate): Promise<PricingRule> => {
    const response = await api.post<PricingRule>('/api/admin/pricing/rules', rule);
    return response.data;
  },

  updatePricingRule: async (id: number, rule: Partial<PricingRuleCreate>): Promise<PricingRule> => {
    const response = await api.put<PricingRule>(`/api/admin/pricing/rules/${id}`, rule);
    return response.data;
  },

  deletePricingRule: async (id: number): Promise<void> => {
    await api.delete(`/api/admin/pricing/rules/${id}`);
  },

  // Seasonal factors
  getSeasonalFactors: async (): Promise<SeasonalFactor[]> => {
    const response = await api.get<SeasonalFactor[]>('/api/admin/pricing/seasonal-factors');
    return response.data;
  },

  createSeasonalFactor: async (factor: SeasonalFactorCreate): Promise<SeasonalFactor> => {
    const response = await api.post<SeasonalFactor>('/api/admin/pricing/seasonal-factors', factor);
    return response.data;
  },

  updateSeasonalFactor: async (
    id: number,
    factor: Partial<SeasonalFactorCreate>
  ): Promise<SeasonalFactor> => {
    const response = await api.put<SeasonalFactor>(
      `/api/admin/pricing/seasonal-factors/${id}`,
      factor
    );
    return response.data;
  },

  deleteSeasonalFactor: async (id: number): Promise<void> => {
    await api.delete(`/api/admin/pricing/seasonal-factors/${id}`);
  },

  // Utility
  refreshPricingData: async (): Promise<void> => {
    await api.post('/api/admin/pricing/refresh');
  },
};
