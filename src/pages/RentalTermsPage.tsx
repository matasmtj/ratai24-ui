import { useQuery } from '@tanstack/react-query';
import { Layout } from '../components/Layout';
import { LegalPageContentView } from '../components/LegalPageContentView';
import { useLanguage } from '../contexts/useLanguage';
import { legalPagesApi } from '../api/legalPages';
import { getLegalPageDefaults } from '../data/legalPageDefaults';

export function RentalTermsPage() {
  const { t, language } = useLanguage();

  const activeLanguage = language === 'en' || language === 'ru' ? language : 'lt';
  const { data: legalPage } = useQuery({
    queryKey: ['legal-page', 'rental-terms', activeLanguage],
    queryFn: async () => {
      try {
        return await legalPagesApi.get('rental-terms', activeLanguage);
      } catch {
        return null;
      }
    },
    retry: false,
  });
  const content = legalPage?.content ?? getLegalPageDefaults('rental-terms', activeLanguage);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <LegalPageContentView content={content} title={t('rentalTermsTitle')} />
      </div>
    </Layout>
  );
}
