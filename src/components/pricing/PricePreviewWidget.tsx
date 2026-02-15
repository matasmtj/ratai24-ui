import { useState, useEffect } from 'react';
import { pricingApi } from '../../api/pricing';
import type { PriceCalculation } from '../../types/pricing';
import { Card } from '../ui/Card';
import { PriceBreakdown } from './PriceBreakdown';
import { useLanguage } from '../../contexts/useLanguage';
import { LoadingSpinner } from '../ui/Loading';

interface PricePreviewWidgetProps {
  carId: number;
  startDate: string;
  endDate: string;
  userId?: number;
  showBreakdown?: boolean;
}

export function PricePreviewWidget({ 
  carId, 
  startDate, 
  endDate, 
  userId,
  showBreakdown = false 
}: PricePreviewWidgetProps) {
  const { t } = useLanguage();
  const [price, setPrice] = useState<PriceCalculation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      if (!startDate || !endDate) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const data = await pricingApi.calculatePrice({
          carId,
          startDate,
          endDate,
          userId,
        });
        setPrice(data);
      } catch (err) {
        console.error('Error calculating price:', err);
        setError(t('pricing.errors.calculationFailed'));
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
  }, [carId, startDate, endDate, userId]);

  if (loading) {
    return (
      <Card className="p-4">
        <LoadingSpinner />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4">
        <p className="text-red-600">{error}</p>
      </Card>
    );
  }

  if (!price) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">{t('pricing.pricePerDay')}</span>
          <span className="text-2xl font-bold text-primary-600">
            €{price.pricePerDay.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {price.duration} {price.duration === 1 ? t('common.day') : t('common.days')}
          </span>
          <span className="text-sm text-gray-600">
            {t('common.total')}: <span className="font-semibold">€{price.totalPrice.toFixed(2)}</span>
          </span>
        </div>
      </Card>

      {showBreakdown && (
        <PriceBreakdown
          breakdown={price.breakdown}
          pricePerDay={price.pricePerDay}
          totalPrice={price.totalPrice}
          duration={price.duration}
        />
      )}
    </div>
  );
}
