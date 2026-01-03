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

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('contactUs')}</h1>
          <p className="text-xl text-gray-600">{t('contactDescription')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
              <EnvelopeIcon className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('email')}</h3>
            <div className="text-gray-600 break-all">
              <b>{contact?.email}</b>
            </div>
          </Card>

          <Card className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
              <PhoneIcon className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('phone')}</h3>
            <div className="text-gray-600">
              <b>{contact?.phone}</b>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-12">
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100">
                <MapPinIcon className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold">{t('operationAreas')}</h3>
            </div>
            <div className="space-y-3">
              {!contact.operationAreasDetails || contact.operationAreasDetails.length === 0 ? (
                <p className="text-gray-500">{t('noOperationAreasYet')}</p>
              ) : (
                contact.operationAreasDetails.map((detail) => (
                  <div key={detail.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-900">
                      {detail.cityName}, {detail.country}
                    </div>
                    {detail.address && (
                      <div className="text-sm text-gray-600 mt-1">{detail.address}</div>
                    )}
                  </div>
                ))
              )}
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
