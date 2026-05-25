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
import { DateRangePicker } from '../../components/ui/DateRangePicker';

export function AdminPricingRulesPage() {
  const { t } = useLanguage();
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
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
    fixedPrice: null,
    multiplier: null,
    priority: 10,
  });
  const [priorityInput, setPriorityInput] = useState<string>('10');
  const [fixedPriceInput, setFixedPriceInput] = useState<string>('');
  const [multiplierInput, setMultiplierInput] = useState<string>('');
  const [selectedCarIds, setSelectedCarIds] = useState<number[]>([]);
  const [carSelectorOpen, setCarSelectorOpen] = useState(false);
  const [carSearch, setCarSearch] = useState('');

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
    setModalError(null);
    if (rule) {
      setEditingRule(rule);
      setFormData({
        name: rule.name,
        description: rule.description,
        carId: rule.carId,
        cityId: rule.cityId,
        startDate: rule.startDate ? rule.startDate.split('T')[0] : '',
        endDate: rule.endDate ? rule.endDate.split('T')[0] : '',
        fixedPrice: rule.fixedPrice ?? null,
        multiplier: rule.multiplier ?? null,
        priority: rule.priority,
      });
      setPriorityInput(String(rule.priority ?? 10));
      setFixedPriceInput(rule.fixedPrice != null ? String(rule.fixedPrice) : '');
      setMultiplierInput(rule.multiplier != null ? String(rule.multiplier) : '');
      setSelectedCarIds(
        rule.carIds?.length
          ? rule.carIds
          : rule.carId
            ? [rule.carId]
            : []
      );
    } else {
      setEditingRule(null);
      setFormData({
        name: '',
        description: '',
        carId: undefined,
        cityId: undefined,
        startDate: '',
        endDate: '',
        fixedPrice: null,
        multiplier: null,
        priority: 10,
      });
      setPriorityInput('10');
      setFixedPriceInput('');
      setMultiplierInput('');
      setSelectedCarIds([]);
    }
    setCarSearch('');
    setCarSelectorOpen(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRule(null);
    setModalError(null);
    setCarSelectorOpen(false);
  };

  const getApiErrorMessage = (err: unknown): string => {
    const candidate = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
    if (typeof candidate === 'string' && candidate.trim() !== '') return candidate;
    return t('pricing.errors.saveFailed');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setModalError(null);
    setSuccessMessage(null);

    if (!formData.name.trim()) {
      setModalError(t('pricing.admin.validation.nameRequired'));
      return;
    }
    const parsedFixedPrice =
      fixedPriceInput.trim() === '' ? null : Number(fixedPriceInput.replace(',', '.'));
    const parsedMultiplier =
      multiplierInput.trim() === '' ? null : Number(multiplierInput.replace(',', '.'));

    if (parsedFixedPrice === null && parsedMultiplier === null) {
      setModalError(t('pricing.admin.validation.fixedOrMultiplierRequired'));
      return;
    }
    if (parsedFixedPrice !== null && (!Number.isFinite(parsedFixedPrice) || parsedFixedPrice <= 0)) {
      setModalError(t('pricing.admin.validation.fixedPricePositive'));
      return;
    }
    if (
      parsedMultiplier !== null &&
      (!Number.isFinite(parsedMultiplier) || parsedMultiplier < 0.1 || parsedMultiplier > 3)
    ) {
      setModalError(t('pricing.admin.validation.multiplierRange'));
      return;
    }
    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      setModalError(t('pricing.admin.validation.endDateAfterStart'));
      return;
    }

    try {
      const basePayload: PricingRuleCreate = {
        ...formData,
        fixedPrice: parsedFixedPrice,
        multiplier: parsedMultiplier,
      };

      const scopePayload =
        selectedCarIds.length > 0
          ? { carIds: selectedCarIds, carId: undefined }
          : { carIds: [], carId: undefined };

      if (editingRule) {
        await pricingApi.updatePricingRule(editingRule.id, {
          ...basePayload,
          ...scopePayload,
        });
        setSuccessMessage(t('pricing.admin.ruleUpdated'));
      } else {
        await pricingApi.createPricingRule({
          ...basePayload,
          ...scopePayload,
        });
        setSuccessMessage(t('pricing.admin.ruleCreated'));
      }
      handleCloseModal();
      await fetchData();
    } catch (err) {
      console.error('Error saving rule:', err);
      setModalError(getApiErrorMessage(err));
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
                    {rule.carIds && rule.carIds.length > 0 && (
                      <div className="col-span-2">
                        <span className="text-gray-500">{t('carLabel')}: </span>
                        <span className="font-medium">
                          {rule.carIds.length} {t('cars')}
                          {' — '}
                          {rule.carIds
                            .map((id) => {
                              const c = cars.find((car) => car.id === id);
                              return c ? `${c.make} ${c.model}` : `#${id}`;
                            })
                            .join(', ')}
                        </span>
                      </div>
                    )}
                    {rule.carId && !(rule.carIds && rule.carIds.length > 0) && (
                      <div>
                        <span className="text-gray-500">{t('carLabel')}: </span>
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
                    {rule.fixedPrice != null && (
                      <div>
                        <span className="text-gray-500">{t('pricing.admin.fixedPrice')}: </span>
                        <span className="font-medium text-primary-600">
                          €{rule.fixedPrice.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {rule.multiplier != null && (
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
          {modalError && <Alert type="error" message={modalError} onClose={() => setModalError(null)} />}

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

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t('carLabel')} ({t('common.optional')})
            </label>
            <button
              type="button"
              onClick={() => setCarSelectorOpen((v) => !v)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-left text-sm bg-white hover:border-gray-400"
            >
              {selectedCarIds.length === 0
                ? t('common.all')
                : `${selectedCarIds.length} ${t('cars').toLowerCase()}`}
            </button>
            {carSelectorOpen && (
              <div className="border border-gray-300 rounded-md p-2 bg-white space-y-2">
                <Input
                  label={t('search')}
                  value={carSearch}
                  onChange={(e) => setCarSearch(e.target.value)}
                />
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {cars
                    .filter((car) =>
                      `${car.make} ${car.model} ${car.numberPlate}`
                        .toLowerCase()
                        .includes(carSearch.toLowerCase())
                    )
                    .map((car) => {
                      const checked = selectedCarIds.includes(car.id);
                      return (
                        <label
                          key={car.id}
                          className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              setSelectedCarIds((prev) =>
                                e.target.checked
                                  ? [...prev, car.id]
                                  : prev.filter((id) => id !== car.id)
                              );
                            }}
                          />
                          <span>{`${car.make} ${car.model} - ${car.numberPlate}`}</span>
                        </label>
                      );
                    })}
                </div>
                <div className="flex justify-end">
                  <Button type="button" size="sm" variant="secondary" onClick={() => setCarSelectorOpen(false)}>
                    {t('cancel')}
                  </Button>
                </div>
              </div>
            )}
          </div>

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

          <DateRangePicker
            label={t('pricing.admin.validPeriod')}
            startDate={formData.startDate}
            endDate={formData.endDate}
            onChange={(startDate, endDate) => setFormData({ ...formData, startDate, endDate })}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label={t('pricing.admin.fixedPrice') + ' (€)'}
                type="text"
                inputMode="decimal"
                value={fixedPriceInput}
                onChange={(e) =>
                  setFixedPriceInput(e.target.value)
                }
              />
              <p className="mt-1 text-xs text-gray-500">{t('pricing.admin.fixedPriceHelp')}</p>
            </div>
            <div>
              <Input
                label={t('pricing.admin.multiplier')}
                type="text"
                inputMode="decimal"
                value={multiplierInput}
                onChange={(e) =>
                  setMultiplierInput(e.target.value)
                }
              />
              <p className="mt-1 text-xs text-gray-500">{t('pricing.admin.multiplierHelp')}</p>
            </div>
          </div>

          <div>
            <Input
              label={t('pricing.admin.priority')}
              type="number"
              value={priorityInput}
              onChange={(e) => {
                const value = e.target.value;
                setPriorityInput(value);
                if (value === '') {
                  setFormData({ ...formData, priority: undefined });
                  return;
                }
                const parsed = Number(value);
                if (Number.isFinite(parsed)) {
                  setFormData({ ...formData, priority: parsed });
                }
              }}
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
