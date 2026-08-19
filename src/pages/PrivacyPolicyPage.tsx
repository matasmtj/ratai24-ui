import { Layout } from '../components/Layout';
import { LegalPageContentView } from '../components/LegalPageContentView';
import { useLanguage } from '../contexts/useLanguage';
import { useQuery } from '@tanstack/react-query';
import { contactsApi } from '../api/contacts';
import { legalPagesApi } from '../api/legalPages';
import { getLegalPageDefaults } from '../data/legalPageDefaults';

export function PrivacyPolicyPage() {
  const { t, language } = useLanguage();
  const { data: contact } = useQuery({
    queryKey: ['contact-info'],
    queryFn: contactsApi.get,
  });
  const contactEmail = contact?.email?.trim() || contact?.companyEmail?.trim() || 'info@skirvita.lt';

  const activeLanguage = language === 'en' || language === 'ru' ? language : 'lt';
  const { data: legalPage } = useQuery({
    queryKey: ['legal-page', 'privacy-policy', activeLanguage],
    queryFn: async () => {
      try {
        return await legalPagesApi.get('privacy-policy', activeLanguage);
      } catch {
        return null;
      }
    },
    retry: false,
  });
  const content = legalPage?.content ?? getLegalPageDefaults('privacy-policy', activeLanguage);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <LegalPageContentView
          content={content}
          title={t('privacyPolicyTitle')}
          email={contactEmail}
        />
      </div>
    </Layout>
  );
}
