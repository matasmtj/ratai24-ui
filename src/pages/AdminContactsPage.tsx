import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { LoadingPage, LoadingSpinner } from '../components/ui/Loading';
import { Select } from '../components/ui/Select';
import { Alert } from '../components/ui/Alert';
import { useLanguage } from '../contexts/useLanguage';
import { contactsApi } from '../api/contacts';
import { citiesApi } from '../api/cities';
import type { ContactUpdate, OperationArea } from '../types/api';
import { PhotoIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

export function AdminContactsPage() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ContactUpdate>({
    email: '',
    phone: '',
    businessHoursWeekdays: '8:00 - 18:00',
    businessHoursWeekend: '9:00 - 15:00',
    companyName: '',
    companyCode: '',
    bankAccount: '',
    companyEmail: '',
    mainAddress: '',
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
      setError(null);
      setIsEditing(false);
    },
    onError: (error: any) => {
      console.error('Contact update error:', error);
      const errorMsg = error?.response?.data?.error || error?.response?.data?.message || error.message;
      setError(`${t('contactUpdateFailed')}: ${errorMsg}`);
    },
  });

  const heroFileInputRef = useRef<HTMLInputElement | null>(null);

  const uploadHeroMutation = useMutation({
    mutationFn: (file: File) => contactsApi.uploadHeroImage(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setError(null);
    },
    onError: (err: any) => {
      const errorMsg = err?.response?.data?.error || err?.response?.data?.message || err?.message;
      setError(`${t('heroImageUploadFailed')}${errorMsg ? `: ${errorMsg}` : ''}`);
    },
    onSettled: () => {
      if (heroFileInputRef.current) heroFileInputRef.current.value = '';
    },
  });

  const removeHeroMutation = useMutation({
    mutationFn: () => contactsApi.deleteHeroImage(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setError(null);
    },
    onError: (err: any) => {
      const errorMsg = err?.response?.data?.error || err?.response?.data?.message || err?.message;
      setError(`${t('heroImageRemoveFailed')}${errorMsg ? `: ${errorMsg}` : ''}`);
    },
  });

  const handleHeroFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadHeroMutation.mutate(file);
  };

  const handleRemoveHero = () => {
    if (confirm(t('heroImageRemoveConfirm'))) {
      removeHeroMutation.mutate();
    }
  };

  const createMutation = useMutation({
    mutationFn: contactsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setError(null);
    },
    onError: (error: any) => {
      console.error('Contact create error:', error);
      const errorMsg = error?.response?.data?.error || error?.response?.data?.message || error.message;
      setError(`${t('contactCreateFailed')}: ${errorMsg}`);
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
        businessHoursWeekdays: contact.businessHoursWeekdays,
        businessHoursWeekend: contact.businessHoursWeekend,
        companyName: contact.companyName || '',
        companyCode: contact.companyCode || '',
        bankAccount: contact.bankAccount || '',
        companyEmail: contact.companyEmail || '',
        mainAddress: contact.mainAddress || '',
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
        businessHoursWeekdays: contact.businessHoursWeekdays,
        businessHoursWeekend: contact.businessHoursWeekend,
        companyName: contact.companyName || '',
        companyCode: contact.companyCode || '',
        bankAccount: contact.bankAccount || '',
        companyEmail: contact.companyEmail || '',
        mainAddress: contact.mainAddress || '',
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t('mondayFriday')}
                  type="text"
                  value={formData.businessHoursWeekdays}
                  onChange={(e) => setFormData({ ...formData, businessHoursWeekdays: e.target.value })}
                  placeholder="8:00 - 18:00"
                  required
                />
                <Input
                  label={t('weekend')}
                  type="text"
                  value={formData.businessHoursWeekend}
                  onChange={(e) => setFormData({ ...formData, businessHoursWeekend: e.target.value })}
                  placeholder="9:00 - 15:00"
                  required
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">{t('rekvizitai')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label={t('companyName')} value={formData.companyName || ''} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} />
                  <Input label={t('companyCode')} value={formData.companyCode || ''} onChange={(e) => setFormData({ ...formData, companyCode: e.target.value })} />
                  <Input label={t('bankAccount')} value={formData.bankAccount || ''} onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })} />
                  <Input label={t('companyEmail')} type="email" value={formData.companyEmail || ''} onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })} />
                  <Input label={t('mainAddress')} value={formData.mainAddress || ''} onChange={(e) => setFormData({ ...formData, mainAddress: e.target.value })} className="md:col-span-2" />
                </div>
              </div>

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

      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} onClose={() => setError(null)} />
        </div>
      )}

      <Card className="p-6 mb-6">
        <div className="flex items-start gap-3 mb-4">
          <PhotoIcon className="h-6 w-6 text-primary-600 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t('heroImageTitle')}</h2>
            <p className="text-sm text-gray-600 mt-1">{t('heroImageHelp')}</p>
          </div>
        </div>

        <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-100 aspect-[21/9] flex items-center justify-center mb-4">
          {contact?.heroImageUrl ? (
            <img
              src={contact.heroImageUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-sm text-gray-500 text-center px-4">{t('heroImageNone')}</div>
          )}
        </div>

        <input
          ref={heroFileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleHeroFileChange}
        />

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={() => heroFileInputRef.current?.click()}
            disabled={uploadHeroMutation.isPending || removeHeroMutation.isPending}
          >
            {uploadHeroMutation.isPending ? (
              <span className="inline-flex items-center gap-2">
                <LoadingSpinner size="sm" />
                {t('uploadHeroImage')}
              </span>
            ) : contact?.heroImageUrl ? (
              t('replaceHeroImage')
            ) : (
              t('uploadHeroImage')
            )}
          </Button>
          {contact?.heroImageUrl && (
            <Button
              type="button"
              variant="danger"
              onClick={handleRemoveHero}
              disabled={uploadHeroMutation.isPending || removeHeroMutation.isPending}
            >
              {removeHeroMutation.isPending ? (
                <span className="inline-flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  {t('removeHeroImage')}
                </span>
              ) : (
                t('removeHeroImage')
              )}
            </Button>
          )}
        </div>
      </Card>

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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t('mondayFriday')}
                  type="text"
                  value={isEditing ? formData.businessHoursWeekdays : contact?.businessHoursWeekdays || ''}
                  onChange={(e) => setFormData({ ...formData, businessHoursWeekdays: e.target.value })}
                  placeholder="8:00 - 18:00"
                  disabled={!isEditing}
                  required
                />
                <Input
                  label={t('weekend')}
                  type="text"
                  value={isEditing ? formData.businessHoursWeekend : contact?.businessHoursWeekend || ''}
                  onChange={(e) => setFormData({ ...formData, businessHoursWeekend: e.target.value })}
                  placeholder="9:00 - 15:00"
                  disabled={!isEditing}
                  required
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">{t('rekvizitai')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label={t('companyName')} value={isEditing ? formData.companyName || '' : contact?.companyName || ''} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} disabled={!isEditing} />
                  <Input label={t('companyCode')} value={isEditing ? formData.companyCode || '' : contact?.companyCode || ''} onChange={(e) => setFormData({ ...formData, companyCode: e.target.value })} disabled={!isEditing} />
                  <Input label={t('bankAccount')} value={isEditing ? formData.bankAccount || '' : contact?.bankAccount || ''} onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })} disabled={!isEditing} />
                  <Input label={t('companyEmail')} type="email" value={isEditing ? formData.companyEmail || '' : contact?.companyEmail || ''} onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })} disabled={!isEditing} />
                  <Input label={t('mainAddress')} value={isEditing ? formData.mainAddress || '' : contact?.mainAddress || ''} onChange={(e) => setFormData({ ...formData, mainAddress: e.target.value })} disabled={!isEditing} className="md:col-span-2" />
                </div>
              </div>

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
