import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { LoadingPage } from '../components/ui/Loading';
import { useLanguage } from '../contexts/LanguageContext';
import { contactsApi } from '../api/contacts';
import type { ContactUpdate } from '../types/api';

export function AdminContactsPage() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ContactUpdate>({
    email: '',
    phone: '',
    operationAreas: '',
  });

  const { data: contact, isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: contactsApi.get,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });

  const updateMutation = useMutation({
    mutationFn: contactsApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      console.error('Contact update error:', error);
      const errorMsg = error?.response?.data?.error || error?.response?.data?.message || error.message;
      alert(`Failed to update contact: ${errorMsg}`);
    },
  });

  const createMutation = useMutation({
    mutationFn: contactsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
    onError: (error: any) => {
      console.error('Contact create error:', error);
      const errorMsg = error?.response?.data?.error || error?.response?.data?.message || error.message;
      alert(`Failed to create contact: ${errorMsg}`);
    },
  });

  const handleEdit = () => {
    if (contact) {
      setFormData({
        email: contact.email,
        phone: contact.phone,
        operationAreas: contact.operationAreas,
      });
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (contact) {
      setFormData({
        email: contact.email,
        phone: contact.phone,
        operationAreas: contact.operationAreas,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) return <LoadingPage />;

  if (!contact) {
    // If no contact exists, allow admin to create one
    const handleCreate = async (e: React.FormEvent) => {
      e.preventDefault();
      console.log('Creating contact with data:', formData);
      createMutation.mutate(formData);
    };

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('contactManagement')}</h1>
          <p className="text-gray-600 mt-2">{t('noContactInfoYet')}</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleCreate}>
            <div className="space-y-6">
              <Input
                label={t('email')}
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />

              <Input
                label={t('phone')}
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('operationAreas')}
                </label>
                <textarea
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  rows={3}
                  value={formData.operationAreas}
                  onChange={(e) => setFormData({ ...formData, operationAreas: e.target.value })}
                  placeholder={t('operationAreasPlaceholder')}
                  required
                />
                <p className="mt-1 text-sm text-gray-500">{t('operationAreasHelp')}</p>
              </div>
            </div>

            <div className="mt-6">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? t('creating') : t('createContact')}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('contactManagement')}</h1>
        <p className="text-gray-600 mt-2">{t('manageContactInfo')}</p>
      </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <Input
                label={t('email')}
                type="email"
                value={isEditing ? formData.email : contact?.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                required
              />

              <Input
                label={t('phone')}
                type="tel"
                value={isEditing ? formData.phone : contact?.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('operationAreas')}
                </label>
                <textarea
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                  rows={3}
                  value={isEditing ? formData.operationAreas : contact?.operationAreas || ''}
                  onChange={(e) => setFormData({ ...formData, operationAreas: e.target.value })}
                  disabled={!isEditing}
                  placeholder={t('operationAreasPlaceholder')}
                  required
                />
                <p className="mt-1 text-sm text-gray-500">{t('operationAreasHelp')}</p>
              </div>

              {contact && (
                <div className="text-sm text-gray-500">
                  {t('lastUpdated')}: {new Date(contact.updatedAt).toLocaleString()}
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              {!isEditing ? (
                <Button type="button" onClick={handleEdit}>
                  {t('edit')}
                </Button>
              ) : (
                <>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? t('saving') : t('save')}
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleCancel}>
                    {t('cancel')}
                  </Button>
                </>
              )}
            </div>
          </form>
        </Card>
      </div>
    
  );  
}
