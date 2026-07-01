import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useLanguage } from '../contexts/useLanguage';
import { authApi } from '../api/auth';
import {
  CheckCircleIcon,
  EnvelopeOpenIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

type Status = 'verifying' | 'success' | 'invalid' | 'expired' | 'missing';

export function VerifyEmailPage() {
  const { t, language } = useLanguage();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') ?? '';

  const [status, setStatus] = useState<Status>(tokenFromUrl ? 'verifying' : 'missing');
  const [resendEmail, setResendEmail] = useState('');
  const [resendError, setResendError] = useState('');
  const [resendSent, setResendSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const hasVerified = useRef(false);

  useEffect(() => {
    if (!tokenFromUrl || hasVerified.current) return;
    hasVerified.current = true;

    let cancelled = false;
    (async () => {
      try {
        await authApi.verifyEmail({ token: tokenFromUrl });
        if (!cancelled) setStatus('success');
      } catch (err: unknown) {
        if (cancelled) return;
        const code =
          err && typeof err === 'object' && 'response' in err
            ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
            : undefined;
        if (code === 'EXPIRED_TOKEN') {
          setStatus('expired');
        } else {
          setStatus('invalid');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tokenFromUrl]);

  const handleResend = async () => {
    if (resendLoading) return;
    setResendError('');
    if (!resendEmail.trim()) {
      setResendError(t('verifyEmailMissingToken'));
      return;
    }
    setResendLoading(true);
    try {
      await authApi.resendVerification({ email: resendEmail.trim(), language });
      setResendSent(true);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setResendError(message || t('resendVerificationFailed'));
    } finally {
      setResendLoading(false);
    }
  };

  const renderHeader = () => {
    const headerIconClass = 'h-12 w-12';
    if (status === 'success') {
      return <CheckCircleIcon className={`${headerIconClass} text-green-600`} />;
    }
    if (status === 'invalid' || status === 'expired' || status === 'missing') {
      return <ExclamationTriangleIcon className={`${headerIconClass} text-amber-500`} />;
    }
    return <EnvelopeOpenIcon className={`${headerIconClass} text-primary-600`} />;
  };

  const renderBody = () => {
    if (status === 'verifying') {
      return (
        <p className="text-sm text-gray-700 text-center">{t('verifyEmailVerifying')}</p>
      );
    }

    if (status === 'success') {
      return (
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-700">{t('verifyEmailSuccess')}</p>
          <Link
            to="/login"
            className="inline-block w-full rounded-lg bg-primary-600 px-4 py-2 text-white font-medium hover:bg-primary-700"
          >
            {t('verifyEmailContinueToLogin')}
          </Link>
        </div>
      );
    }

    const message =
      status === 'expired'
        ? t('verifyEmailExpired')
        : status === 'missing'
          ? t('verifyEmailMissingToken')
          : t('verifyEmailInvalid');

    return (
      <div className="space-y-4">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-sm">
          {message}
        </div>

        {resendSent ? (
          <p className="text-sm text-gray-700 text-center">{t('resendVerificationSent')}</p>
        ) : (
          <>
            {resendError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                {resendError}
              </div>
            )}
            <Input
              label={t('email')}
              type="email"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleResend())}
              placeholder={t('emailPlaceholder')}
              autoComplete="email"
            />
            <Button
              type="button"
              onClick={handleResend}
              className="w-full"
              isLoading={resendLoading}
              disabled={resendLoading}
            >
              {resendLoading ? t('resendVerificationSending') : t('resendVerificationCta')}
            </Button>
          </>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">{renderHeader()}</div>
            <h1 className="text-2xl font-bold text-gray-900">{t('verifyEmailTitle')}</h1>
          </div>

          {renderBody()}

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              {t('backToLogin')}
            </Link>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
