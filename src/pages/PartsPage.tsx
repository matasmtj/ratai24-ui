import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { useLanguage } from '../contexts/useLanguage';
import { TruckIcon } from '@heroicons/react/24/outline';

export function PartsPage() {
  const { t } = useLanguage();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('parts')}</h1>
          <p className="text-gray-600">{t('partsComingSoon')}</p>
        </div>

        <Card className="p-12 text-center">
          <TruckIcon className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('partsMarketplace')}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('partsComingSoonDescription')}
          </p>
        </Card>
      </div>
    </Layout>
  );
}
