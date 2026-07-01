import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { LoadingSpinner } from './ui/Loading';
import { useLanguage } from '../contexts/useLanguage';
import { contactsApi } from '../api/contacts';
import { carsApi } from '../api/cars';
import type { Contract } from '../types/api';
import { resolveContractDeposit } from '../lib/deposit';

interface PendingReservationModalProps {
  contract: Contract | null;
  isOpen: boolean;
  onClose: () => void;
  onCancel?: () => void;
}

export function PendingReservationModal({
  contract,
  isOpen,
  onClose,
  onCancel,
}: PendingReservationModalProps) {
  const { t } = useLanguage();

  const { data: car } = useQuery({
    queryKey: ['car', contract?.carId],
    queryFn: () => carsApi.getById(contract!.carId),
    enabled: isOpen && !!contract?.carId,
  });

  const { data: contact, isLoading: contactLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: contactsApi.get,
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
  });

  if (!contract) return null;

  const paymentReference = `${t('reservationNumber')} Nr. ${contract.id}`;
  const depositAmount = resolveContractDeposit(contract);
  const hasBankDetails = !!(
    contact &&
    (contact.companyName ||
      contact.companyCode ||
      contact.bankAccount ||
      contact.companyEmail ||
      contact.mainAddress)
  );

  const handleCopyReference = async () => {
    try {
      await navigator.clipboard.writeText(paymentReference);
    } catch {
      /* ignore */
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${t('reservationNumber')} #${contract.id}`}
      size="lg"
    >
      <div className="space-y-6 text-left">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <p className="font-medium">{t('pendingReservationModalIntro')}</p>
          <p className="text-sm mt-1">{t('reservationDepositPendingApproval')}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('reservationDetails')}</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <dt className="text-gray-500">{t('vehicle')}</dt>
              <dd className="font-medium text-gray-900">
                {car ? `${car.make} ${car.model}` : `#${contract.carId}`}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">{t('statusLabel')}</dt>
              <dd className="font-medium text-gray-900">{t('pendingApproval')}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-gray-500">{t('datesLabel')}</dt>
              <dd className="font-medium text-gray-900">
                {format(new Date(contract.startDate), 'yyyy-MM-dd HH:mm')} –{' '}
                {format(new Date(contract.endDate), 'yyyy-MM-dd HH:mm')}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">{t('priceLabel')}</dt>
              <dd className="font-medium text-gray-900">€{contract.totalPrice}</dd>
            </div>
            {contract.notes && (
              <div className="sm:col-span-2">
                <dt className="text-gray-500">{t('notesLabel')}</dt>
                <dd className="text-gray-900 italic">{contract.notes}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="rounded-lg border border-primary-200 bg-primary-50 p-4 space-y-4">
          <h3 className="text-base font-semibold text-gray-900">
            {t('depositBankDetailsTitle')}
          </h3>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <dt className="text-gray-500">{t('reservationNumberLabel')}</dt>
              <dd className="font-semibold text-gray-900">#{contract.id}</dd>
            </div>
            <div>
              <dt className="text-gray-500">{t('depositAmountLabel')}</dt>
              <dd className="font-semibold text-gray-900">€{depositAmount}</dd>
            </div>
          </dl>
          <p className="text-xs text-gray-500 -mt-2">
            {t('depositDurationDisclaimer')}
          </p>

          <div className="rounded-md bg-white border border-primary-100 p-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              {t('paymentReferenceLabel')}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <code className="text-base font-bold text-gray-900">{paymentReference}</code>
              <Button type="button" size="sm" variant="ghost" onClick={handleCopyReference}>
                {t('copyPaymentReference')}
              </Button>
            </div>
            <p className="text-xs text-gray-600 mt-2">{t('paymentReferenceHint')}</p>
          </div>

          {contactLoading ? (
            <div className="flex justify-center py-4">
              <LoadingSpinner />
            </div>
          ) : hasBankDetails ? (
            <dl className="space-y-2 text-sm rounded-md border border-primary-100 bg-white p-3">
              {contact?.companyName && (
                <div>
                  <dt className="text-gray-500">{t('companyName')}</dt>
                  <dd className="font-medium text-gray-900">{contact.companyName}</dd>
                </div>
              )}
              {contact?.companyCode && (
                <div>
                  <dt className="text-gray-500">{t('companyCode')}</dt>
                  <dd className="font-medium text-gray-900">{contact.companyCode}</dd>
                </div>
              )}
              {contact?.bankAccount && (
                <div>
                  <dt className="text-gray-500">{t('bankAccount')}</dt>
                  <dd className="font-medium text-gray-900 font-mono break-all">{contact.bankAccount}</dd>
                </div>
              )}
              {contact?.companyEmail && (
                <div>
                  <dt className="text-gray-500">{t('companyEmail')}</dt>
                  <dd className="font-medium text-gray-900">{contact.companyEmail}</dd>
                </div>
              )}
              {contact?.mainAddress && (
                <div>
                  <dt className="text-gray-500">{t('mainAddress')}</dt>
                  <dd className="font-medium text-gray-900">{contact.mainAddress}</dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="text-sm text-gray-600">{t('depositBankDetailsFallback')}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-200">
          {onCancel && (
            <Button variant="danger" onClick={onCancel}>
              {t('cancelButton')}
            </Button>
          )}
          <Button variant="ghost" className="ml-auto" onClick={onClose}>
            {t('closeModal')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
