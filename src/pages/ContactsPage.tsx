import { useQuery } from '@tanstack/react-query';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { LoadingPage } from '../components/ui/Loading';
import { useLanguage } from '../contexts/LanguageContext';
import { contactsApi } from '../api/contacts';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

export function ContactsPage() {
  const { t } = useLanguage();

  const { data: contact, isLoading, error } = useQuery({
    queryKey: ['contacts'],
    queryFn: contactsApi.get,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
  });

  if (isLoading) return <LoadingPage />;
  
  if (error || !contact) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('contactUs')}</h2>
            <p className="text-gray-600 mb-4">{t('contactNotAvailable')}</p>
            <p className="text-sm text-gray-500">{t('contactAdminToSetup')}</p>
          </Card>
        </div>
      </Layout>
    );
  }

  const operationAreas = contact.operationAreas.split(',').map(area => area.trim()) || [];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('contactUs')}</h1>
          <p className="text-xl text-gray-600">{t('contactDescription')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
              <EnvelopeIcon className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('email')}</h3>
            <a 
              href={`mailto:${contact?.email}`}
              className="text-primary-600 hover:text-primary-700 break-all"
            >
              {contact?.email}
            </a>
          </Card>

          <Card className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
              <PhoneIcon className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('phone')}</h3>
            <a 
              href={`tel:${contact?.phone}`}
              className="text-primary-600 hover:text-primary-700"
            >
              {contact?.phone}
            </a>
          </Card>

          <Card className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
              <MapPinIcon className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('operationAreas')}</h3>
            <div className="text-gray-600 space-y-1">
              {operationAreas.map((area, index) => (
                <div key={index}>{area}</div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-4">{t('businessHours')}</h2>
          <div className="space-y-2 text-gray-600">
            <div className="flex justify-between">
              <span>{t('mondayFriday')}</span>
              <span className="font-semibold">8:00 - 18:00</span>
            </div>
            <div className="flex justify-between">
              <span>{t('saturday')}</span>
              <span className="font-semibold">9:00 - 15:00</span>
            </div>
            <div className="flex justify-between">
              <span>{t('sunday')}</span>
              <span className="font-semibold">{t('closed')}</span>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
