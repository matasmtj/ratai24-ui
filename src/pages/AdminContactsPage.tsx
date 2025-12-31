import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { LoadingPage } from '../components/ui/Loading';
import { Select } from '../components/ui/Select';
import { useLanguage } from '../contexts/LanguageContext';
import { contactsApi } from '../api/contacts';
import { citiesApi } from '../api/cities';
import type { ContactUpdate, OperationArea } from '../types/api';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

export function AdminContactsPage() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ContactUpdate>({
    email: '',
    phone: '',
    operationAreas: [],
  });

  // Fetch cities for selection
  const { data: cities } = useQuery({
    queryKey: ['cities'],
    queryFn: citiesApi.getAll,
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

  const handleEdit = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (contact) {
      // Map backend operationAreasDetails to form format (operationAreas)
      const operationAreas: OperationArea[] = (contact.operationAreasDetails || []).map(detail => ({
        id: detail.id, // Preserve ID to prevent recreation
        cityId: detail.cityId,
        address: detail.address || ''
      }));
      setFormData({
        email: contact.email,
        phone: contact.phone,
        operationAreas,
      });
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (contact) {
      // Map backend operationAreasDetails to form format (operationAreas)
      const operationAreas: OperationArea[] = (contact.operationAreasDetails || []).map(detail => ({
        id: detail.id, // Preserve ID to prevent recreation
        cityId: detail.cityId,
        address: detail.address || ''
      }));
      setFormData({
        email: contact.email,
        phone: contact.phone,
        operationAreas,
      });
    }
  };

  const addOperationArea = () => {
    setFormData({
      ...formData,
      operationAreas: [...formData.operationAreas, { cityId: 0, address: '' }],
    });
  };

  const removeOperationArea = (index: number) => {
    setFormData({
      ...formData,
      operationAreas: formData.operationAreas.filter((_, i) => i !== index),
    });
  };

  const updateOperationArea = (index: number, field: 'cityId' | 'address', value: number | string) => {
    const updated = [...formData.operationAreas];
    if (field === 'cityId') {
      updated[index] = { ...updated[index], cityId: value as number };
    } else {
      updated[index] = { ...updated[index], address: value as string };
    }
    setFormData({ ...formData, operationAreas: updated });
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
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('operationAreas')}
                  </label>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={addOperationArea}
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    {t('addArea')}
                  </Button>
                </div>

                {formData.operationAreas.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                    {t('noOperationAreasYet')}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.operationAreas.map((area, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <Select
                              label={t('city')}
                              value={area.cityId.toString()}
                              onChange={(e) => updateOperationArea(index, 'cityId', parseInt(e.target.value))}
                              options={[
                                { value: '0', label: t('selectCity') },
                                ...(cities || []).map(city => ({
                                  value: city.id.toString(),
                                  label: `${city.name}, ${city.country}`
                                }))
                              ]}
                              required
                            />
                          </div>
                          <div className="flex-1">
                            <Input
                              label={t('address') + ' (' + t('optional') + ')'}
                              type="text"
                              value={area.address || ''}
                              onChange={(e) => updateOperationArea(index, 'address', e.target.value)}
                              placeholder={t('addressPlaceholder')}
                            />
                          </div>
                          <div className="flex items-end">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => removeOperationArea(index)}
                            >
                              <TrashIcon className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
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
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('operationAreas')}
                  </label>
                  {isEditing && (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={addOperationArea}
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      {t('addArea')}
                    </Button>
                  )}
                </div>

                {isEditing ? (
                  formData.operationAreas.length === 0 ? (
                    <div className="text-sm text-gray-500 py-4 text-center border-2 border-dashed border-gray-300 rounded-lg">
                      {t('noOperationAreasYet')}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.operationAreas.map((area, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex gap-3">
                            <div className="flex-1">
                              <Select
                                label={t('city')}
                                value={area.cityId.toString()}
                                onChange={(e) => updateOperationArea(index, 'cityId', parseInt(e.target.value))}
                                options={[
                                  { value: '0', label: t('selectCity') },
                                  ...(cities || []).map(city => ({
                                    value: city.id.toString(),
                                    label: `${city.name}, ${city.country}`
                                  }))
                                ]}
                                required
                              />
                            </div>
                            <div className="flex-1">
                              <Input
                                label={t('address') + ' (' + t('optional') + ')'}
                                type="text"
                                value={area.address || ''}
                                onChange={(e) => updateOperationArea(index, 'address', e.target.value)}
                                placeholder={t('addressPlaceholder')}
                              />
                            </div>
                            <div className="flex items-end">
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => removeOperationArea(index)}
                              >
                                <TrashIcon className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="space-y-2">
                    {!contact?.operationAreasDetails || contact.operationAreasDetails.length === 0 ? (
                      <div className="text-sm text-gray-500">{t('noOperationAreasYet')}</div>
                    ) : (
                      contact.operationAreasDetails.map((detail) => (
                        <div key={detail.id} className="p-3 bg-gray-50 rounded-lg">
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
                )}
              </div>

              {contact && (
                <div className="text-sm text-gray-500">
                  {t('lastUpdated')}: {new Date(contact.updatedAt).toLocaleString()}
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              {!isEditing ? (
                <Button 
                  type="button" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleEdit();
                  }}
                >
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
