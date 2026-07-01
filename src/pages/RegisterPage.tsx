import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { ReCaptcha, type ReCaptchaHandle } from '../components/ui/ReCaptcha';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/useLanguage';
import {
  EnvelopeOpenIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import { PasswordCriteria } from '../components/PasswordCriteria';
import { passwordMeetsAllRequirements } from '../lib/passwordRequirements';
import { authApi } from '../api/auth';

export function RegisterPage() {
  const { register } = useAuth();
  const { t, language } = useLanguage();
  const recaptchaRef = useRef<ReCaptchaHandle>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [resendError, setResendError] = useState('');
  const [resendSent, setResendSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('passwordsDontMatch'));
      return;
    }

    if (!passwordMeetsAllRequirements(formData.password)) {
      setError(t('passwordRequirementsIncomplete'));
      return;
    }

    if (!formData.phoneNumber.trim()) {
      setError(t('phoneRequired'));
      return;
    }

    const recaptchaToken = recaptchaRef.current?.getValue();
    if (!recaptchaToken) {
      setError(t('completeRecaptcha'));
      return;
    }

    setIsLoading(true);

    try {
      const email = formData.email.trim();
      await register({
        email,
        password: formData.password,
        language,
      });
      setRegisteredEmail(email);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setError(message || t('registerFailed'));
      recaptchaRef.current?.reset();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!registeredEmail || resendLoading) return;
    setResendError('');
    setResendLoading(true);
    try {
      await authApi.resendVerification({ email: registeredEmail, language });
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

  if (registeredEmail) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md p-8">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <EnvelopeOpenIcon className="h-12 w-12 text-primary-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('registerCheckEmailTitle')}
              </h1>
              <p className="text-gray-600 mt-3">
                {t('registerCheckEmailBody').replace('{email}', registeredEmail)}
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-gray-500 text-center">
                {t('registerCheckEmailHint')}
              </p>

              {resendSent ? (
                <p className="text-sm text-gray-700 text-center">
                  {t('resendVerificationSent')}
                </p>
              ) : (
                <>
                  {resendError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                      {resendError}
                    </div>
                  )}
                  <Button
                    type="button"
                    onClick={handleResend}
                    className="w-full"
                    isLoading={resendLoading}
                    disabled={resendLoading}
                    variant="secondary"
                  >
                    {resendLoading
                      ? t('resendVerificationSending')
                      : t('resendVerificationCta')}
                  </Button>
                </>
              )}

              <Link
                to="/login"
                className="block w-full text-center rounded-lg bg-primary-600 px-4 py-2 text-white font-medium hover:bg-primary-700"
              >
                {t('verifyEmailContinueToLogin')}
              </Link>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <UserPlusIcon className="h-12 w-12 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t('registerTitle')}</h1>
            <p className="text-gray-600 mt-2">{t('registerSubtitle')}</p>
          </div>

          {error && (
            <div className="mb-4">
              <Alert type="error" message={error} onClose={() => setError('')} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t('email')}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="jusu@pastas.lt"
            />
            <Input
              label={t('firstName')}
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder={t('firstName')}
            />
            <Input
              label={t('lastName')}
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder={t('lastName')}
            />
            <Input
              label={t('phoneNumber')}
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              required
              placeholder="+370..."
            />
            <Input
              label={t('password')}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder={t('minPasswordLength')}
            />
            <PasswordCriteria password={formData.password} />
            <Input
              label={t('confirmPassword')}
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />

            <div className="pt-2">
              <ReCaptcha ref={recaptchaRef} />
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              {t('register')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('haveAccount')}{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                {t('login')}
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
