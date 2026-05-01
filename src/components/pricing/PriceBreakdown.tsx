import { Card } from '../ui/Card';
import type { PriceBreakdown as PriceBreakdownType } from '../../types/pricing';
import { useLanguage } from '../../contexts/useLanguage';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

interface PriceBreakdownProps {
  breakdown: PriceBreakdownType;
  pricePerDay: number;
  totalPrice: number;
  duration: number;
}

export function PriceBreakdown({ breakdown, pricePerDay, totalPrice, duration }: PriceBreakdownProps) {
  const { t } = useLanguage();

  const multipliers = [
    { key: 'demand', label: t('pricing.multipliers.demand'), value: breakdown.multipliers.demand },
    { key: 'seasonal', label: t('pricing.multipliers.seasonal'), value: breakdown.multipliers.seasonal },
    { key: 'utilization', label: t('pricing.multipliers.utilization'), value: breakdown.multipliers.utilization },
    { key: 'duration', label: t('pricing.multipliers.duration'), value: breakdown.multipliers.duration },
    { key: 'customer', label: t('pricing.multipliers.customer'), value: breakdown.multipliers.customer },
  ];

  const getMultiplierColor = (value: number) => {
    if (value < 0.9) return 'text-green-600';
    if (value > 1.1) return 'text-red-600';
    return 'text-gray-700';
  };

  const getMultiplierBadge = (value: number) => {
    const percentage = ((value - 1) * 100).toFixed(0);
    if (value < 1) return `${percentage}%`;
    if (value > 1) return `+${percentage}%`;
    return '0%';
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">{t('pricing.breakdown.title')}</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center pb-3 border-b">
          <span className="text-gray-600">{t('pricing.breakdown.basePrice')}</span>
          <span className="font-medium">€{breakdown.base.toFixed(2)}/{t('common.day')}</span>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">{t('pricing.breakdown.multipliers')}</p>
          {multipliers.map((m) => (
            <div key={m.key} className="flex justify-between items-center text-sm pl-4">
              <div className="flex items-center gap-1.5 group relative">
                <span className="text-gray-600">{m.label}</span>
                <QuestionMarkCircleIcon className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg">
                  {t(`pricing.multipliersHelp.${m.key}` as any)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={getMultiplierColor(m.value)}>
                  {m.value.toFixed(2)}x
                </span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  m.value < 1 ? 'bg-green-100 text-green-700' : 
                  m.value > 1 ? 'bg-red-100 text-red-700' : 
                  'bg-gray-100 text-gray-700'
                }`}>
                  {getMultiplierBadge(m.value)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {breakdown.rules && breakdown.rules.length > 0 ? (
          <div className="space-y-2 pt-3 border-t">
            <p className="text-sm font-medium text-gray-700">
              {t('pricing.breakdown.ruleAdjustments')}
            </p>
            {breakdown.rules.map((rule) => (
              <div
                key={`${rule.name}-${rule.adjustment}`}
                className="flex justify-between items-center text-sm pl-4"
              >
                <span className="text-gray-600">{rule.name}</span>
                <span className={rule.adjustment <= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                  {rule.adjustment > 0 ? '+' : ''}€{rule.adjustment.toFixed(2)}/{t('common.day')}
                </span>
              </div>
            ))}
          </div>
        ) : null}

        <div className="flex justify-between items-center pt-3 border-t">
          <span className="font-medium">{t('pricing.breakdown.finalPrice')}</span>
          <span className="font-bold text-lg">€{pricePerDay.toFixed(2)}/{t('common.day')}</span>
        </div>

        <div className="flex justify-between items-center pt-2 border-t-2 border-gray-300">
          <span className="font-semibold text-lg">{t('pricing.breakdown.total')} ({duration} {t('common.days')})</span>
          <span className="font-bold text-xl text-primary-600">€{totalPrice.toFixed(2)}</span>
        </div>
      </div>
    </Card>
  );
}
