import { useState, useMemo } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { DateTimePicker } from '../ui/DateTimePicker';
import { useLanguage } from '../../contexts/useLanguage';
import { contractsApi } from '../../api/contracts';
import type { Contract, ContractUpdate, ContractComplete, Car } from '../../types/api';
import { format } from 'date-fns';

interface AdminContractDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract;
  car?: Car;
}

type ModalMode = 'view' | 'edit' | 'complete';

export function AdminContractDetailModal({
  isOpen,
  onClose,
  contract,
  car,
}: AdminContractDetailModalProps) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<ModalMode>('view');
  
  const [editFormData, setEditFormData] = useState<ContractUpdate>({
    startDate: contract.startDate,
    endDate: contract.endDate,
    state: contract.state,
    notes: contract.notes || '',
  });

  // Parse dates for edit mode
  const [editStartDate, setEditStartDate] = useState(() => {
    const d = new Date(contract.startDate);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [editStartTime, setEditStartTime] = useState(() => {
    const d = new Date(contract.startDate);
    return String(d.getHours()).padStart(2, '0');
  });
  const [editEndDate, setEditEndDate] = useState(() => {
    const d = new Date(contract.endDate);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [editEndTime, setEditEndTime] = useState(() => {
    const d = new Date(contract.endDate);
    return String(d.getHours()).padStart(2, '0');
  });

  const [completeFormData, setCompleteFormData] = useState<ContractComplete>({
    mileageEndKm: contract.mileageEndKm || 0,
    fuelLevelEndPct: contract.fuelLevelEndPct || 100,
    damageFee: 0,
    notes: '',
  });

  // Fetch all contracts for the car to show blocked dates
  const { data: carContracts } = useQuery({
    queryKey: ['car-contracts', contract.carId],
    queryFn: () => contractsApi.getAll().then(contracts => 
      contracts.filter(c => c.carId === contract.carId && c.id !== contract.id && c.state !== 'CANCELLED')
    ),
    enabled: mode === 'edit',
  });

  // Calculate blocked dates from other contracts
  const blockedDates = useMemo(() => {
    if (!carContracts) return [];
    
    const dates: Date[] = [];
    carContracts.forEach(c => {
      const start = new Date(c.startDate);
      const end = new Date(c.endDate);
      const current = new Date(start);
      
      while (current <= end) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
    });
    
    return dates;
  }, [carContracts]);

  // Calculate price details
  const calculatePriceDetails = () => {
    if (!car) return { days: 0, basePrice: 0, fuelFee: 0, damageFee: 0, total: 0 };

    const start = new Date(contract.startDate);
    const end = new Date(contract.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    const basePrice = days * car.pricePerDay;
    
    // Calculate fuel fee based on missing percentage
    // Assume €1.50 per liter and average tank size of 50L
    const fuelLevelEnd = mode === 'complete' ? completeFormData.fuelLevelEndPct : (contract.fuelLevelEndPct || 100);
    const missingFuelPct = 100 - fuelLevelEnd;
    const fuelFee = missingFuelPct > 0 ? (missingFuelPct / 100) * 50 * 1.5 : 0;
    
    const damageFee = mode === 'complete' ? (completeFormData.damageFee || 0) : contract.extraFees;
    
    const total = basePrice + fuelFee + damageFee;

    return { days, basePrice, fuelFee, damageFee, total };
  };

  const priceDetails = calculatePriceDetails();

  // Update mutations
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ContractUpdate }) =>
      contractsApi.update(id, data),
    onSuccess: (updatedContract) => {
      queryClient.invalidateQueries({ queryKey: ['admin-contracts'] });
      // Update the local state with the new data
      Object.assign(contract, updatedContract);
      setMode('view');
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      const errorMsg = error?.response?.data?.error || error?.response?.data?.message || t('errorUpdatingReservation');
      alert(`${t('errorUpdatingReservation')}\n\n${errorMsg}`);
    },
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ContractComplete }) =>
      contractsApi.complete(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contracts'] });
      onClose();
    },
    onError: (error: any) => {
      console.error('Complete error:', error);
      const errorMsg = error?.response?.data?.error || error?.response?.data?.message || t('errorCompletingReservation');
      alert(`${t('errorCompletingReservation')}\n\n${errorMsg}`);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: contractsApi.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contracts'] });
      onClose();
    },
  });

  const activateMutation = useMutation({
    mutationFn: contractsApi.activate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contracts'] });
      setMode('view');
    },
  });

  const handleEdit = () => {
    const startD = new Date(contract.startDate);
    setEditStartDate(`${startD.getFullYear()}-${String(startD.getMonth() + 1).padStart(2, '0')}-${String(startD.getDate()).padStart(2, '0')}`);
    setEditStartTime(String(startD.getHours()).padStart(2, '0'));
    
    const endD = new Date(contract.endDate);
    setEditEndDate(`${endD.getFullYear()}-${String(endD.getMonth() + 1).padStart(2, '0')}-${String(endD.getDate()).padStart(2, '0')}`);
    setEditEndTime(String(endD.getHours()).padStart(2, '0'));
    
    setEditFormData({
      startDate: contract.startDate,
      endDate: contract.endDate,
      state: contract.state,
      notes: contract.notes || '',
    });
    setMode('edit');
  };

  const handleSaveEdit = () => {
    // Combine date and time into proper Date objects and convert to ISO string
    const startDateTime = new Date(`${editStartDate}T${editStartTime}:00:00`);
    const endDateTime = new Date(`${editEndDate}T${editEndTime}:00:00`);
    
    const dataToUpdate = {
      ...editFormData,
      startDate: startDateTime.toISOString(),
      endDate: endDateTime.toISOString(),
    };
    
    console.log('Updating contract with data:', dataToUpdate);
    updateMutation.mutate({ id: contract.id, data: dataToUpdate });
  };

  const handleComplete = () => {
    setCompleteFormData({
      mileageEndKm: contract.mileageEndKm || contract.mileageStartKm,
      fuelLevelEndPct: contract.fuelLevelEndPct || 100,
      damageFee: 0,
      notes: '',
    });
    setMode('complete');
  };

  const handleSaveComplete = () => {
    // Validate required fields
    if (!completeFormData.mileageEndKm || completeFormData.mileageEndKm < contract.mileageStartKm) {
      alert(t('invalidEndMileage') || 'End mileage must be greater than or equal to start mileage');
      return;
    }
    
    if (completeFormData.fuelLevelEndPct === null || completeFormData.fuelLevelEndPct === undefined || 
        completeFormData.fuelLevelEndPct < 0 || completeFormData.fuelLevelEndPct > 100) {
      alert(t('invalidFuelLevel') || 'Fuel level must be between 0 and 100');
      return;
    }
    
    console.log('Completing contract with data:', completeFormData);
    completeMutation.mutate({ id: contract.id, data: completeFormData });
  };

  const handleCancel = () => {
    if (window.confirm(t('confirmCancelReservation'))) {
      cancelMutation.mutate(contract.id);
    }
  };

  const handleActivate = () => {
    if (window.confirm(t('confirmActivateReservation'))) {
      activateMutation.mutate(contract.id);
    }
  };

  const handleModalClose = () => {
    setMode('view');
    onClose();
  };

  const getStatusBadge = (state: string) => {
    const styles = {
      DRAFT: 'bg-gray-100 text-gray-800',
      ACTIVE: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return styles[state as keyof typeof styles] || styles.DRAFT;
  };

  const getStateLabel = (state: string) => {
    const labels = {
      DRAFT: t('draft'),
      ACTIVE: t('active'),
      COMPLETED: t('completed'),
      CANCELLED: t('cancelled'),
    };
    return labels[state as keyof typeof labels] || state;
  };

  return (
    <Modal isOpen={isOpen} onClose={handleModalClose} title={`${t('reservationNumber')} #${contract.id}`} size="xl">
      <div className="space-y-6">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(mode === 'edit' ? editFormData.state! : contract.state)}`}>
            {mode === 'edit' ? getStateLabel(editFormData.state!) : getStateLabel(contract.state)}
          </span>
          {contract.user && (
            <div className="text-sm text-gray-600">
              {t('customer')}: <span className="font-medium">{contract.user.email}</span>
            </div>
          )}
        </div>

        {/* Car Information */}
        {car && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">{t('carDetails')}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-600">{t('vehicle')}:</span> {car.make} {car.model}</div>
              <div><span className="text-gray-600">{t('yearLabel')}:</span> {car.year}</div>
              <div><span className="text-gray-600">{t('plate')}:</span> {car.numberPlate}</div>
              <div><span className="text-gray-600">{t('pricePerDayLabel')}:</span> €{car.pricePerDay}</div>
            </div>
          </div>
        )}

        {/* Dates and Mileage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mode === 'edit' ? (
            <>
              <DateTimePicker
                label={t('adminStartDate')}
                selectedDate={editStartDate}
                selectedTime={editStartTime}
                onDateChange={setEditStartDate}
                onTimeChange={setEditStartTime}
                blockedDates={blockedDates}
              />
              <DateTimePicker
                label={t('adminEndDate')}
                selectedDate={editEndDate}
                selectedTime={editEndTime}
                onDateChange={setEditEndDate}
                onTimeChange={setEditEndTime}
                blockedDates={blockedDates}
              />
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('adminStartDate')}</label>
                <div className="text-gray-900">{format(new Date(contract.startDate), 'yyyy-MM-dd HH:mm')}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('adminEndDate')}</label>
                <div className="text-gray-900">{format(new Date(contract.endDate), 'yyyy-MM-dd HH:mm')}</div>
              </div>
            </>
          )}
        </div>

        {/* Mileage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('startMileageContract')}</label>
            <div className="text-gray-900">{contract.mileageStartKm} km</div>
          </div>
          {mode === 'complete' ? (
            <Input
              label={t('endMileageLabel')}
              type="number"
              value={completeFormData.mileageEndKm || ''}
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                setCompleteFormData({ ...completeFormData, mileageEndKm: val });
              }}
              min={contract.mileageStartKm}
              required
            />
          ) : contract.mileageEndKm ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('endMileageLabel')}</label>
              <div className="text-gray-900">{contract.mileageEndKm} km</div>
            </div>
          ) : null}
        </div>

        {/* Fuel Levels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('fuelLevelStart')}</label>
            <div className="text-gray-900">{contract.fuelLevelStartPct}%</div>
          </div>
          {mode === 'complete' ? (
            <Input
              label={t('fuelLevelEnd')}
              type="number"
              value={completeFormData.fuelLevelEndPct ?? ''}
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                setCompleteFormData({ ...completeFormData, fuelLevelEndPct: val });
              }}
              min={0}
              max={100}
              required
            />
          ) : contract.fuelLevelEndPct !== null ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('fuelLevelEnd')}</label>
              <div className="text-gray-900">{contract.fuelLevelEndPct}%</div>
            </div>
          ) : null}
        </div>

        {/* Price Breakdown */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">{t('priceBreakdown')}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('rentalDays')}:</span>
              <span>{priceDetails.days} {t('days')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('basePrice')}:</span>
              <span>€{priceDetails.basePrice.toFixed(2)}</span>
            </div>
            {priceDetails.fuelFee > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">{t('fuelFee')}:</span>
                <span>€{priceDetails.fuelFee.toFixed(2)}</span>
              </div>
            )}
            {mode === 'complete' && (
              <Input
                label={t('damageFee')}
                type="number"
                value={completeFormData.damageFee ?? ''}
                onChange={(e) => setCompleteFormData({ ...completeFormData, damageFee: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                min={0}
                step={0.01}
              />
            )}
            {priceDetails.damageFee > 0 && mode !== 'complete' && (
              <div className="flex justify-between">
                <span className="text-gray-600">{t('damageFee')}:</span>
                <span>€{priceDetails.damageFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-2 border-t border-blue-200">
              <span>{t('totalPrice')}:</span>
              <span>€{priceDetails.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {mode === 'edit' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('notesContract')}</label>
            <textarea
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              rows={3}
              value={editFormData.notes || ''}
              onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
            />
          </div>
        ) : mode === 'complete' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('notesContract')}</label>
            <textarea
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              rows={3}
              value={completeFormData.notes || ''}
              onChange={(e) => setCompleteFormData({ ...completeFormData, notes: e.target.value })}
            />
          </div>
        ) : contract.notes ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('notesContract')}</label>
            <div className="text-gray-900 italic">{contract.notes}</div>
          </div>
        ) : null}

        {/* State Selection (only in edit mode) */}
        {mode === 'edit' && (
          <Select
            label={t('statusLabel')}
            value={editFormData.state || ''}
            onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value as any })}
            options={[
              { value: 'DRAFT', label: t('draft') },
              { value: 'ACTIVE', label: t('active') },
              { value: 'COMPLETED', label: t('completed') },
              { value: 'CANCELLED', label: t('cancelled') },
            ]}
          />
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          {mode === 'view' ? (
            <>
              {contract.state === 'DRAFT' && (
                <Button onClick={handleActivate} variant="primary">
                  {t('activateReservation')}
                </Button>
              )}
              {(contract.state === 'DRAFT' || contract.state === 'ACTIVE') && (
                <>
                  <Button onClick={handleEdit} variant="secondary">
                    {t('edit')}
                  </Button>
                  {contract.state === 'ACTIVE' && (
                    <Button onClick={handleComplete} variant="primary">
                      {t('completeReservation')}
                    </Button>
                  )}
                  <Button onClick={handleCancel} variant="danger">
                    {t('cancelReservation')}
                  </Button>
                </>
              )}
              <Button onClick={handleModalClose} variant="ghost" className="ml-auto">
                {t('closeModal')}
              </Button>
            </>
          ) : mode === 'edit' ? (
            <>
              <Button onClick={handleSaveEdit} variant="primary" disabled={updateMutation.isPending}>
                {t('save')}
              </Button>
              <Button onClick={() => setMode('view')} variant="ghost">
                {t('cancel')}
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleSaveComplete} variant="primary" disabled={completeMutation.isPending}>
                {t('completeReservation')}
              </Button>
              <Button onClick={() => setMode('view')} variant="ghost">
                {t('cancel')}
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
