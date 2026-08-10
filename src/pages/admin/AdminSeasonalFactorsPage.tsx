import { useState, useEffect } from 'react';
import { pricingApi } from '../../api/pricing';
import { citiesApi } from '../../api/cities';
import type { SeasonalFactor, SeasonalFactorCreate } from '../../types/pricing';
import type { City } from '../../types/api';
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

export function AdminSeasonalFactorsPage() {
  const { t } = useLanguage();
  const [factors, setFactors] = useState<SeasonalFactor[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFactor, setEditingFactor] = useState<SeasonalFactor | null>(null);
  const [deleteConfirmFactor, setDeleteConfirmFactor] = useState<SeasonalFactor | null>(null);

  // Form state
  const [formData, setFormData] = useState<SeasonalFactorCreate>({
    name: '',
    startDate: '',
    endDate: '',
    multiplier: 1.0,
    cityId: undefined,
  });
  /** String so clearing the field does not snap to 0 */
  const [multiplierInput, setMultiplierInput] = useState('1');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [factorsData, citiesData] = await Promise.all([
        pricingApi.getSeasonalFactors(),
        citiesApi.getAll(),
      ]);
      setFactors(factorsData);
      setCities(citiesData);
    } catch {
      setError(t('pricing.errors.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (factor?: SeasonalFactor) => {
    if (factor) {
      setEditingFactor(factor);
      setFormData({
        name: factor.name,
        startDate: factor.startDate.split('T')[0],
        endDate: factor.endDate.split('T')[0],
        multiplier: factor.multiplier,
        cityId: factor.cityId,
      });
      setMultiplierInput(String(factor.multiplier));
    } else {
      setEditingFactor(null);
      setFormData({
        name: '',
        startDate: '',
        endDate: '',
        multiplier: 1.0,
        cityId: undefined,
      });
      setMultiplierInput('1');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFactor(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const mult = parseFloat(multiplierInput.replace(',', '.'));
    if (!Number.isFinite(mult) || mult < 0.1 || mult > 3) {
      setError(t('pricing.errors.invalidMultiplier'));
      return;
    }

    try {
      const payload = { ...formData, multiplier: mult };
      if (editingFactor) {
        await pricingApi.updateSeasonalFactor(editingFactor.id, payload);
        setSuccessMessage(t('pricing.admin.seasonalFactorUpdated'));
      } else {
        await pricingApi.createSeasonalFactor(payload);
        setSuccessMessage(t('pricing.admin.seasonalFactorCreated'));
      }
      handleCloseModal();
      await fetchData();
    } catch {
      setError(t('pricing.errors.saveFailed'));
    }
  };

  const handleDelete = async (factor: SeasonalFactor) => {
    try {
      await pricingApi.deleteSeasonalFactor(factor.id);
      setSuccessMessage(t('pricing.admin.seasonalFactorDeleted'));
      setDeleteConfirmFactor(null);
      await fetchData();
    } catch {
      setError(t('pricing.errors.deleteFailed'));
    }
  };

  const getMultiplierBadge = (multiplier: number) => {
    const percentage = ((multiplier - 1) * 100).toFixed(0);
    const isIncrease = multiplier > 1;
    return {
      text: isIncrease ? `+${percentage}%` : `${percentage}%`,
      color: isIncrease ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800',
    };
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
          <h2 className="text-2xl font-bold text-gray-900">{t('pricing.admin.seasonalFactors')}</h2>
          <p className="text-sm text-gray-600 mt-1">{t('pricing.admin.seasonalFactorsDescription')}</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          {t('pricing.admin.addSeasonalFactor')}
        </Button>
      </div>

      {error && <Alert type="error" message={error} />}
      {successMessage && <Alert type="success" message={successMessage} />}

      {factors.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">{t('pricing.admin.noSeasonalFactors')}</p>
          <Button onClick={() => handleOpenModal()} className="mt-4">
            {t('pricing.admin.createFirstSeasonalFactor')}
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {factors.map((factor) => {
            const badge = getMultiplierBadge(factor.multiplier);
            const isActive =
              new Date(factor.startDate) <= new Date() && new Date(factor.endDate) >= new Date();

            return (
              <Card key={factor.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{factor.name}</h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {isActive ? t('common.active') : t('common.inactive')}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}>
                        {badge.text}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">{t('common.startDate')}: </span>
                        <span className="font-medium">
                          {new Date(factor.startDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">{t('common.endDate')}: </span>
                        <span className="font-medium">
                          {new Date(factor.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">{t('pricing.admin.multiplier')}: </span>
                        <span className="font-medium">{factor.multiplier.toFixed(2)}x</span>
                      </div>
                      {factor.cityId && (
                        <div>
                          <span className="text-gray-500">{t('city')}: </span>
                          <span className="font-medium">
                            {cities.find((c) => c.id === factor.cityId)?.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleOpenModal(factor)}
                    >
                      {t('common.edit')}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setDeleteConfirmFactor(factor)}
                    >
                      {t('common.delete')}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          editingFactor
            ? t('pricing.admin.editSeasonalFactor')
            : t('pricing.admin.addSeasonalFactor')
        }
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Info Box */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
            <h4 className="font-semibold text-green-900 mb-2">{t('pricing.admin.howSeasonalFactorsWork')}</h4>
            <ul className="list-disc list-inside space-y-1 text-green-800">
              <li>{t('pricing.admin.seasonalHelp1')}</li>
              <li>{t('pricing.admin.seasonalHelp2')}</li>
              <li>{t('pricing.admin.seasonalHelp3')}</li>
            </ul>
          </div>

          <Input
            label={t('common.name')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder={t('pricing.admin.seasonalNamePlaceholder')}
            required
          />

          <DateRangePicker
            label={t('pricing.admin.validPeriod')}
            startDate={formData.startDate}
            endDate={formData.endDate}
            onChange={(startDate, endDate) => setFormData({ ...formData, startDate, endDate })}
            required
          />

          <div>
            <Input
              label={t('pricing.admin.multiplier')}
              type="text"
              inputMode="decimal"
              value={multiplierInput}
              onChange={(e) => setMultiplierInput(e.target.value)}
              required
            />
            <p className="mt-1 text-xs text-gray-600">
              <strong>
                {(() => {
                  const m = parseFloat(multiplierInput.replace(',', '.'));
                  if (!Number.isFinite(m)) return '—';
                  if (m < 1) return `${((1 - m) * 100).toFixed(0)}% ${t('pricing.admin.discount')}`;
                  if (m > 1) return `${((m - 1) * 100).toFixed(0)}% ${t('pricing.admin.increase')}`;
                  return t('pricing.admin.noChange');
                })()}
              </strong>
            </p>
            <p className="mt-1 text-xs text-gray-500">{t('pricing.admin.multiplierExplanation')}</p>
          </div>

          <Select
            label={t('city') + ' (' + t('common.optional') + ')'}
            value={formData.cityId?.toString() || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                cityId: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            options={[
              { value: '', label: t('common.all') },
              ...cities.map((city) => ({
                value: city.id.toString(),
                label: city.name
              }))
            ]}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              {t('common.cancel')}
            </Button>
            <Button type="submit">
              {editingFactor ? t('common.update') : t('common.create')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirmFactor}
        onClose={() => setDeleteConfirmFactor(null)}
        onConfirm={() => deleteConfirmFactor && handleDelete(deleteConfirmFactor)}
        title={t('pricing.admin.deleteSeasonalFactorTitle')}
        message={t('pricing.admin.deleteSeasonalFactorMessage')}
        confirmText={t('common.delete')}
      />
    </div>
  );
}
