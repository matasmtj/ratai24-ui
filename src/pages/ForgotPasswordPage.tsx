import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ReCaptcha, type ReCaptchaHandle } from '../components/ui/ReCaptcha';
import { useLanguage } from '../contexts/useLanguage';
import { authApi } from '../api/auth';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

export function ForgotPasswordPage() {
  const { t, language } = useLanguage();
  const recaptchaRef = useRef<ReCaptchaHandle>(null);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (isLoading) return;
    setError('');
    const recaptchaToken = recaptchaRef.current?.getValue();
    if (!recaptchaToken) {
      setError(t('completeRecaptcha'));
      return;
    }

    setIsLoading(true);
    try {
      await authApi.forgotPassword({ email: email.trim(), language });
      setSuccess(true);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setError(message || t('forgotPasswordFailed'));
      recaptchaRef.current?.reset();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <EnvelopeIcon className="h-12 w-12 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t('forgotPasswordTitle')}</h1>
            <p className="text-gray-600 mt-2">{t('forgotPasswordSubtitle')}</p>
          </div>

          {success ? (
            <p className="text-sm text-gray-700 text-center">{t('forgotPasswordSent')}</p>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <Input
                  label={t('email')}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSubmit())}
                  placeholder={t('emailPlaceholder')}
                  autoComplete="email"
                />
                <div className="pt-2">
                  <ReCaptcha ref={recaptchaRef} />
                </div>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  {t('sendResetLink')}
                </Button>
              </div>
            </>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              {t('backToLogin')}
            </Link>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
