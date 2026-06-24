import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/useLanguage';
import { useLocalizedPath } from '../hooks/useLocalizedPath';

type Variant = 'banner' | 'inline' | 'success';

interface ReservationDepositNoticeProps {
  variant?: Variant;
  className?: string;
  reservationId?: number;
  /**
   * Required deposit amount (in euro). Defaults to €50 if not supplied —
   * use `resolveContractDeposit(contract)` from `lib/deposit` at call sites
   * so the amount matches the rental duration.
   */
  depositAmount?: number;
  /**
   * When false, the trailing "see contact page" link is omitted. Defaults to
   * true for backward compatibility with the dashboard success banner.
   */
  showContactLink?: boolean;
}

export function ReservationDepositNotice({
  variant = 'banner',
  className = '',
  reservationId,
  depositAmount = 50,
  showContactLink = true,
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
      <strong>€{depositAmount}</strong>{' '}
      {t('reservationDepositNoticeSuffix')}
      {showContactLink && (
        <>
          {' '}
          {link}.
        </>
      )}
    </>
  );

  const disclaimer = (
    <span className="block text-xs text-gray-500 mt-1">
      {t('depositDurationDisclaimer')}
    </span>
  );

  if (variant === 'success') {
    return (
      <div className={`rounded-lg border border-green-200 bg-green-50 p-4 text-green-900 ${className}`}>
        <p className="font-semibold mb-2">{t('reservationCreatedTitle')}</p>
        <p className="text-sm">
          {message}
          {disclaimer}
        </p>
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
        {disclaimer}
      </p>
    );
  }

  return (
    <div className={`rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 ${className}`}>
      <p className="text-sm font-medium mb-1">{t('reservationDepositPendingTitle')}</p>
      <p className="text-sm">
        {message}
        {disclaimer}
      </p>
    </div>
  );
}
