import { useState, useEffect } from 'react';
import { pricingApi } from '../../api/pricing';
import { carsApi } from '../../api/cars';
import { citiesApi } from '../../api/cities';
import type { PricingRule, PricingRuleCreate } from '../../types/pricing';
import type { Car, City } from '../../types/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { LoadingSpinner } from '../../components/ui/Loading';
import { useLanguage } from '../../contexts/useLanguage';
import { Alert } from '../../components/ui/Alert';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

export function AdminPricingRulesPage() {
  const { t } = useLanguage();
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
  const [deleteConfirmRule, setDeleteConfirmRule] = useState<PricingRule | null>(null);

  // Form state
  const [formData, setFormData] = useState<PricingRuleCreate>({
    name: '',
    description: '',
    carId: undefined,
    cityId: undefined,
    startDate: '',
    endDate: '',
    fixedPrice: undefined,
    multiplier: undefined,
    priority: 10,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rulesData, carsData, citiesData] = await Promise.all([
        pricingApi.getPricingRules(),
        carsApi.getAll(),
        citiesApi.getAll(),
      ]);
      setRules(rulesData);
      setCars(carsData);
      setCities(citiesData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(t('pricing.errors.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (rule?: PricingRule) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        name: rule.name,
        description: rule.description,
        carId: rule.carId,
        cityId: rule.cityId,
        startDate: rule.startDate ? rule.startDate.split('T')[0] : '',
        endDate: rule.endDate ? rule.endDate.split('T')[0] : '',
        fixedPrice: rule.fixedPrice,
        multiplier: rule.multiplier,
        priority: rule.priority,
      });
    } else {
      setEditingRule(null);
      setFormData({
        name: '',
        description: '',
        carId: undefined,
        cityId: undefined,
        startDate: '',
        endDate: '',
        fixedPrice: undefined,
        multiplier: undefined,
        priority: 10,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRule(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      if (editingRule) {
        await pricingApi.updatePricingRule(editingRule.id, formData);
        setSuccessMessage(t('pricing.admin.ruleUpdated'));
      } else {
        await pricingApi.createPricingRule(formData);
        setSuccessMessage(t('pricing.admin.ruleCreated'));
      }
      handleCloseModal();
      await fetchData();
    } catch (err) {
      console.error('Error saving rule:', err);
      setError(t('pricing.errors.saveFailed'));
    }
  };

  const handleDelete = async (rule: PricingRule) => {
    try {
      await pricingApi.deletePricingRule(rule.id);
      setSuccessMessage(t('pricing.admin.ruleDeleted'));
      setDeleteConfirmRule(null);
      await fetchData();
    } catch (err) {
      console.error('Error deleting rule:', err);
      setError(t('pricing.errors.deleteFailed'));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('pricing.admin.pricingRules')}</h2>
          <p className="text-sm text-gray-600 mt-1">{t('pricing.admin.pricingRulesDescription')}</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          {t('pricing.admin.addRule')}
        </Button>
      </div>

      {error && <Alert type="error" message={error} />}
      {successMessage && <Alert type="success" message={successMessage} />}

      {rules.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">{t('pricing.admin.noRules')}</p>
          <Button onClick={() => handleOpenModal()} className="mt-4">
            {t('pricing.admin.createFirstRule')}
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {rules.map((rule) => (
            <Card key={rule.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{rule.name}</h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        rule.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {rule.isActive ? t('common.active') : t('common.inactive')}
                    </span>
                  </div>
                  
                  {rule.description && (
                    <p className="text-gray-600 mb-3">{rule.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {rule.carId && (
                      <div>
                        <span className="text-gray-500">{t('car')}: </span>
                        <span className="font-medium">
                          {cars.find((c) => c.id === rule.carId)?.make}{' '}
                          {cars.find((c) => c.id === rule.carId)?.model}
                        </span>
                      </div>
                    )}
                    {rule.cityId && (
                      <div>
                        <span className="text-gray-500">{t('city')}: </span>
                        <span className="font-medium">
                          {cities.find((c) => c.id === rule.cityId)?.name}
                        </span>
                      </div>
                    )}
                    {rule.startDate && (
                      <div>
                        <span className="text-gray-500">{t('common.startDate')}: </span>
                        <span className="font-medium">
                          {new Date(rule.startDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {rule.endDate && (
                      <div>
                        <span className="text-gray-500">{t('common.endDate')}: </span>
                        <span className="font-medium">
                          {new Date(rule.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {rule.fixedPrice && (
                      <div>
                        <span className="text-gray-500">{t('pricing.admin.fixedPrice')}: </span>
                        <span className="font-medium text-primary-600">
                          €{rule.fixedPrice.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {rule.multiplier && (
                      <div>
                        <span className="text-gray-500">{t('pricing.admin.multiplier')}: </span>
                        <span className="font-medium">{rule.multiplier.toFixed(2)}x</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">{t('pricing.admin.priority')}: </span>
                      <span className="font-medium">{rule.priority}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleOpenModal(rule)}
                  >
                    {t('common.edit')}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => setDeleteConfirmRule(rule)}
                  >
                    {t('common.delete')}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingRule ? t('pricing.admin.editRule') : t('pricing.admin.addRule')}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
            <h4 className="font-semibold text-blue-900 mb-2">{t('pricing.admin.howPricingRulesWork')}</h4>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>{t('pricing.admin.ruleHelp1')}</li>
              <li>{t('pricing.admin.ruleHelp2')}</li>
              <li>{t('pricing.admin.ruleHelp3')}</li>
              <li>{t('pricing.admin.ruleHelp4')}</li>
            </ul>
          </div>

          <Input
            label={t('common.name')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder={t('pricing.admin.ruleNamePlaceholder')}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('common.description')}
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <Select
            label={t('car') + ' (' + t('common.optional') + ')'}
            value={formData.carId?.toString() || ''}
            onChange={(e) =>
              setFormData({ ...formData, carId: e.target.value ? Number(e.target.value) : undefined })
            }
            options={[
              { value: '', label: t('common.all') },
              ...cars.map((car) => ({
                value: car.id.toString(),
                label: `${car.make} ${car.model} - ${car.numberPlate}`
              }))
            ]}
          />

          <Select
            label={t('city') + ' (' + t('common.optional') + ')'}
            value={formData.cityId?.toString() || ''}
            onChange={(e) =>
              setFormData({ ...formData, cityId: e.target.value ? Number(e.target.value) : undefined })
            }
            options={[
              { value: '', label: t('common.all') },
              ...cities.map((city) => ({
                value: city.id.toString(),
                label: city.name
              }))
            ]}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('common.startDate')}
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
            <Input
              label={t('common.endDate')}
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label={t('pricing.admin.fixedPrice') + ' (€)'}
                type="number"
                step="0.01"
                value={formData.fixedPrice || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fixedPrice: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
              <p className="mt-1 text-xs text-gray-500">{t('pricing.admin.fixedPriceHelp')}</p>
            </div>
            <div>
              <Input
                label={t('pricing.admin.multiplier')}
                type="number"
                step="0.01"
                value={formData.multiplier || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    multiplier: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
              <p className="mt-1 text-xs text-gray-500">{t('pricing.admin.multiplierHelp')}</p>
            </div>
          </div>

          <div>
            <Input
              label={t('pricing.admin.priority')}
              type="number"
              value={formData.priority || 10}
              onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
            />
            <p className="mt-1 text-xs text-gray-500">{t('pricing.admin.priorityHelp')}</p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              {t('common.cancel')}
            </Button>
            <Button type="submit">{editingRule ? t('common.update') : t('common.create')}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirmRule}
        onClose={() => setDeleteConfirmRule(null)}
        onConfirm={() => deleteConfirmRule && handleDelete(deleteConfirmRule)}
        title={t('pricing.admin.deleteRuleTitle')}
        message={t('pricing.admin.deleteRuleMessage')}
        confirmText={t('common.delete')}
      />
    </div>
  );
}
