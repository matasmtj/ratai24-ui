import { useState, useEffect } from 'react';
import { pricingApi } from '../../api/pricing';
import type { PricingAnalytics, CarPerformance } from '../../types/pricing';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/Loading';
import { useLanguage } from '../../contexts/useLanguage';
import { Alert } from '../../components/ui/Alert';
import { DateRangePicker } from '../../components/ui/DateRangePicker';

export function AdminPricingDashboard() {
  const { t } = useLanguage();
  const [analytics, setAnalytics] = useState<PricingAnalytics | null>(null);
  const [performance, setPerformance] = useState<CarPerformance | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Date filters
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const fetchData = async () => {
    if (!initialLoad) setAnalyticsLoading(true);
    setError(null);
    try {
      const [analyticsData, performanceData] = await Promise.all([
        pricingApi.getAnalytics({ startDate, endDate }),
        pricingApi.getCarPerformance(),
      ]);
      setAnalytics(analyticsData);
      setPerformance(performanceData);
    } catch (err) {
      console.error('Error fetching pricing data:', err);
      setError(t('pricing.errors.fetchFailed'));
    } finally {
      setAnalyticsLoading(false);
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once; date changes use "Apply"
  }, []);

  const handleRefreshPricing = async () => {
    setRefreshing(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await pricingApi.refreshPricingData();
      setSuccessMessage(t('pricing.admin.refreshSuccess'));
      await fetchData();
    } catch (err) {
      console.error('Error refreshing pricing:', err);
      setError(t('pricing.errors.refreshFailed'));
    } finally {
      setRefreshing(false);
    }
  };

  if (initialLoad && !analytics && !performance) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('pricing.admin.dashboard')}</h2>
        <Button onClick={handleRefreshPricing} isLoading={refreshing} size="sm">
          {t('pricing.admin.refreshData')}
        </Button>
      </div>

      {error && <Alert type="error" message={error} />}
      {successMessage && <Alert type="success" message={successMessage} />}

      {/* Info about analytics */}
      {analytics && analytics.revenue.totalContracts === 0 && (
        <Alert 
          type="info" 
          message={`${t('pricing.admin.noDataYet') || 'No pricing data yet. Analytics are calculated from completed contracts within the selected date range.'} (${startDate} to ${endDate}). Check browser console for API response details.`} 
        />
      )}

      {/* Date filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[16rem]">
            <DateRangePicker
              label={t('pricing.admin.validPeriod') || `${t('common.startDate')} - ${t('common.endDate')}`}
              startDate={startDate}
              endDate={endDate}
              onChange={(nextStartDate, nextEndDate) => {
                setStartDate(nextStartDate);
                setEndDate(nextEndDate);
              }}
              required
            />
          </div>
          <Button onClick={() => fetchData()} size="sm" isLoading={analyticsLoading}>
            {t('common.apply')}
          </Button>
        </div>
      </Card>

      {/* Statistics */}
      {analytics && (
        <>
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4">
            {analyticsLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/60">
                <LoadingSpinner />
              </div>
            )}
            <Card className="p-6">
              <div className="text-sm text-gray-600 mb-1">{t('pricing.admin.totalSnapshots')}</div>
              <div className="text-3xl font-bold text-primary-600">{analytics.revenue.totalContracts || 0}</div>
              <div className="text-xs text-gray-500 mt-1">
                {t('pricing.admin.completedOnly') || 'Completed contracts only'}
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-sm text-gray-600 mb-1">{t('pricing.admin.avgBasePrice')}</div>
              <div className="text-3xl font-bold text-gray-900">
                €{(analytics.revenue.avgPricePerDay || 0).toFixed(2)}
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-sm text-gray-600 mb-1">{t('pricing.admin.totalRevenue')}</div>
              <div className="text-3xl font-bold text-green-600">
                €{(analytics.revenue.total || 0).toFixed(2)}
              </div>
            </Card>
          </div>

          {/* Pricing Performance Metrics */}
          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-4">
            {analyticsLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/60">
                <LoadingSpinner />
              </div>
            )}
            <Card className="p-6">
              <div className="text-sm text-gray-600 mb-1">{t('pricing.admin.dynamicPricingUsage') || 'Dynamic Pricing Usage'}</div>
              <div className="text-2xl font-bold text-blue-600">
                {(analytics.pricingPerformance.dynamicPricingUsage || 0).toFixed(1)}%
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-sm text-gray-600 mb-1">{t('pricing.admin.revenueImpact') || 'Revenue Impact'}</div>
              <div className="text-2xl font-bold text-green-600">
                {`${analytics.pricingPerformance.revenueImpact >= 0 ? '+' : ''}${(analytics.pricingPerformance.revenueImpact || 0).toFixed(1)}%`}
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-sm text-gray-600 mb-1">{t('pricing.admin.avgDemandMultiplier') || 'Avg Demand'}</div>
              <div className="text-2xl font-bold text-purple-600">
                {(analytics.pricingPerformance.avgDemandMultiplier || 1).toFixed(2)}x
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-sm text-gray-600 mb-1">{t('pricing.admin.avgSeasonalMultiplier') || 'Avg Seasonal'}</div>
              <div className="text-2xl font-bold text-orange-600">
                {(analytics.pricingPerformance.avgSeasonalMultiplier || 1).toFixed(2)}x
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Car Performance */}
      {performance && performance.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t('pricing.admin.carPerformance')}</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('pricing.admin.carId')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('pricing.admin.utilizationRate')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('pricing.admin.avgMultiplier')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('contracts')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {performance.map((car) => (
                  <tr key={car.carId}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">#{car.carId}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${Math.min((car.utilizationRate || 0) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          {((car.utilizationRate || 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {(car.avgPriceMultiplier || 0).toFixed(2)}x
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{car.totalContracts || 0}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
