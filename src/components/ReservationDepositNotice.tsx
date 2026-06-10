import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/useLanguage';
import { useLocalizedPath } from '../hooks/useLocalizedPath';

type Variant = 'banner' | 'inline' | 'success';

interface ReservationDepositNoticeProps {
  variant?: Variant;
  className?: string;
  reservationId?: number;
}

export function ReservationDepositNotice({
  variant = 'banner',
  className = '',
  reservationId,
}: ReservationDepositNoticeProps) {
  const { t } = useLanguage();
  const lp = useLocalizedPath();
  const contactsHref = `${lp('/contacts')}#payment-details`;

  const link = (
    <Link to={contactsHref} className="font-semibold text-primary-700 underline hover:text-primary-800">
      {t('reservationDepositContactLink')}
    </Link>
  );

  const message = (
    <>
      {t('reservationDepositNoticePrefix')}{' '}
      <strong>€50</strong>{' '}
      {t('reservationDepositNoticeSuffix')} {link}.
    </>
  );

  if (variant === 'success') {
    return (
      <div className={`rounded-lg border border-green-200 bg-green-50 p-4 text-green-900 ${className}`}>
        <p className="font-semibold mb-2">{t('reservationCreatedTitle')}</p>
        <p className="text-sm">{message}</p>
        <p className="text-sm mt-2 text-green-800">{t('reservationDepositPendingApproval')}</p>
        {reservationId != null && (
          <p className="text-sm mt-2 text-green-800">
            {t('reservationCreatedOpenHint')}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <p className={`text-sm text-amber-900 ${className}`}>
        {message}
      </p>
    );
  }

  return (
    <div className={`rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 ${className}`}>
      <p className="text-sm font-medium mb-1">{t('reservationDepositPendingTitle')}</p>
      <p className="text-sm">{message}</p>
    </div>
  );
}
