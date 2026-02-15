import { useEffect, useState } from 'react';
import { pricingApi } from '../../api/pricing';
import type { CustomerLoyalty } from '../../types/pricing';
import { useLanguage } from '../../contexts/useLanguage';

export function LoyaltyBadge() {
  const { t } = useLanguage();
  const [loyalty, setLoyalty] = useState<CustomerLoyalty | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoyalty = async () => {
      try {
        const data = await pricingApi.getCustomerLoyalty();
        setLoyalty(data);
      } catch (error) {
        console.error('Error fetching loyalty:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLoyalty();
  }, []);

  if (loading || !loyalty) {
    return null;
  }

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'platinum':
      case 'gold':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 'silver':
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      default:
        return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'platinum':
        return '💎';
      case 'gold':
        return '🏆';
      case 'silver':
        return '🥈';
      default:
        return '⭐';
    }
  };

  return (
    <div className={`p-4 rounded-lg shadow-md ${getTierColor(loyalty.tier)}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{getTierIcon(loyalty.tier)}</span>
            <span className="font-bold text-lg">{loyalty.tier} {t('pricing.loyalty.tier')}</span>
          </div>
          <p className="text-sm opacity-90">
            {loyalty.discount > 0 ? `${loyalty.discount.toFixed(0)}% ${t('pricing.loyalty.discount')}` : t('pricing.loyalty.noDiscount')}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm opacity-90">{loyalty.rentalsCount} {t('pricing.loyalty.rentals')}</p>
          <p className="text-xs opacity-75">€{loyalty.lifetimeValue.toFixed(0)} {t('pricing.loyalty.spent')}</p>
        </div>
      </div>
    </div>
  );
}
