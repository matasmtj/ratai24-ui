import { useEffect, useState } from 'react';
import { pricingApi } from '../../api/pricing';
import type { CityDemand } from '../../types/pricing';
import { useLanguage } from '../../contexts/useLanguage';

interface DemandIndicatorProps {
  cityId: number;
}

export function DemandIndicator({ cityId }: DemandIndicatorProps) {
  const { t } = useLanguage();
  const [demand, setDemand] = useState<CityDemand | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDemand = async () => {
      try {
        const data = await pricingApi.getCityDemand(cityId);
        setDemand(data);
      } catch {
        // demand indicator is optional UI
      } finally {
        setLoading(false);
      }
    };

    fetchDemand();
    // Refresh every 5 minutes
    const interval = setInterval(fetchDemand, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [cityId]);

  if (loading || !demand) {
    return null;
  }

  const getDemandLevel = () => {
    if (demand.demandScore >= 1.5) return { label: t('pricing.demand.high'), color: 'bg-red-100 text-red-800', icon: '🔥' };
    if (demand.demandScore >= 1.2) return { label: t('pricing.demand.medium'), color: 'bg-yellow-100 text-yellow-800', icon: '⚠️' };
    return { label: t('pricing.demand.low'), color: 'bg-green-100 text-green-800', icon: '✓' };
  };

  const demandLevel = getDemandLevel();

  return (
    <div className="flex items-center gap-2">
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${demandLevel.color}`}>
        <span>{demandLevel.icon}</span>
        <span>{demandLevel.label}</span>
      </span>
      <span className="text-xs text-gray-500">
        {demand.availableCars}/{demand.totalCars} {t('pricing.demand.available')}
      </span>
    </div>
  );
}
