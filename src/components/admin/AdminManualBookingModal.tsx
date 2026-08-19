import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { DateTimePicker } from '../ui/DateTimePicker';
import { Alert } from '../ui/Alert';
import { useLanguage } from '../../contexts/useLanguage';
import { contractsApi } from '../../api/contracts';
import { carsApi } from '../../api/cars';

interface AdminManualBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function defaultStartDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function defaultEndDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function AdminManualBookingModal({ isOpen, onClose }: AdminManualBookingModalProps) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const [carId, setCarId] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [notes, setNotes] = useState('');

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [startTime, setStartTime] = useState('10');
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [endTime, setEndTime] = useState('10');

  const { data: cars } = useQuery({
    queryKey: ['admin-cars-manual-booking'],
    queryFn: () => carsApi.getAll(),
    enabled: isOpen,
  });

  const leaseCars = (cars ?? []).filter(
    (car) => car.availableForLease && car.state !== 'MAINTENANCE'
  );

  const resetForm = () => {
    setCarId('');
    setGuestName('');
    setGuestPhone('');
    setGuestEmail('');
    setNotes('');
    setStartDate(defaultStartDate());
    setStartTime('10');
    setEndDate(defaultEndDate());
    setEndTime('10');
    setError(null);
  };

  const createMutation = useMutation({
    mutationFn: contractsApi.createManual,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contracts'] });
      resetForm();
      onClose();
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        t('manualBookingError');
      setError(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const carIdNum = Number(carId);
    if (!carIdNum) {
      setError(t('selectCar'));
      return;
    }
    if (!guestName.trim() || !guestPhone.trim()) {
      setError(t('manualBookingContactRequired'));
      return;
    }

    const startDateTime = new Date(`${startDate}T${startTime}:00:00`);
    const endDateTime = new Date(`${endDate}T${endTime}:00:00`);
    if (endDateTime <= startDateTime) {
      setError(t('invalidDateRange'));
      return;
    }

    createMutation.mutate({
      carId: carIdNum,
      startDate: startDateTime.toISOString(),
      endDate: endDateTime.toISOString(),
      guestName: guestName.trim(),
      guestPhone: guestPhone.trim(),
      ...(guestEmail.trim() ? { guestEmail: guestEmail.trim() } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    });
  };

  const handleClose = () => {
    if (createMutation.isPending) return;
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('manualBookingTitle')} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        <p className="text-sm text-gray-600">{t('manualBookingDesc')}</p>

        {error && <Alert type="error" message={error} />}

        <Select
          label={t('carLabel')}
          value={carId}
          onChange={(e) => setCarId(e.target.value)}
          options={[
            { value: '', label: t('selectCar') },
            ...leaseCars.map((car) => ({
              value: String(car.id),
              label: `${car.make} ${car.model} (${car.numberPlate})`,
            })),
          ]}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DateTimePicker
            label={t('startDateTime')}
            selectedDate={startDate}
            selectedTime={startTime}
            onDateChange={setStartDate}
            onTimeChange={setStartTime}
            required
          />
          <DateTimePicker
            label={t('endDateTime')}
            selectedDate={endDate}
            selectedTime={endTime}
            onDateChange={setEndDate}
            onTimeChange={setEndTime}
            minDate={startDate ? new Date(`${startDate}T00:00:00`) : undefined}
            required
          />
        </div>

        <Input
          label={t('guestName')}
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          required
        />
        <Input
          label={t('guestPhone')}
          value={guestPhone}
          onChange={(e) => setGuestPhone(e.target.value)}
          required
        />
        <Input
          label={t('guestEmailOptional')}
          type="email"
          value={guestEmail}
          onChange={(e) => setGuestEmail(e.target.value)}
        />
        <Input
          label={t('notesContract')}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={createMutation.isPending}>
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? t('loading') : t('createManualBooking')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
