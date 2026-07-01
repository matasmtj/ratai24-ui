import { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ReCaptcha, type ReCaptchaHandle } from '../components/ui/ReCaptcha';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/useLanguage';
import { isSafeInternalPath } from '../i18n/routes';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { authApi } from '../api/auth';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { t, language } = useLanguage();
  const recaptchaRef = useRef<ReCaptchaHandle>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendError, setResendError] = useState('');
  const [resendSent, setResendSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const resetBanner =
    (location.state as { passwordResetOk?: boolean } | null)?.passwordResetOk === true;

  const handleInputChange = (field: 'email' | 'password', value: string) => {
    setFormData({ ...formData, [field]: value });
    if (error) setError('');
    if (needsVerification) {
      setNeedsVerification(false);
      setResendSent(false);
      setResendError('');
    }
  };

  const handleResend = async () => {
    if (resendLoading || !formData.email.trim()) return;
    setResendError('');
    setResendLoading(true);
    try {
      await authApi.resendVerification({
        email: formData.email.trim(),
        language,
      });
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    console.log('Submit clicked - starting login flow');
    
    // Prevent multiple submissions
    if (isLoading) {
      console.log('Already loading, preventing duplicate submission');
      return;
    }

    // Verify reCAPTCHA
    const recaptchaToken = recaptchaRef.current?.getValue();
    console.log('ReCAPTCHA token:', recaptchaToken ? 'present' : 'missing');
    
    if (!recaptchaToken) {
      setError(t('completeRecaptcha'));
      return;
    }

    setIsLoading(true);
    console.log('Starting login request...');

    try {
      await login(formData);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(isSafeInternalPath(from) ? from : '/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      const errorCode = err.response?.data?.error;
      if (errorCode === 'EMAIL_NOT_VERIFIED') {
        setNeedsVerification(true);
        setResendSent(false);
        setResendError('');
        setError('');
      } else {
        setError(errorCode || t('loginFailed'));
      }
      recaptchaRef.current?.reset();
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <UserCircleIcon className="h-12 w-12 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t('loginTitle')}</h1>
            <p className="text-gray-600 mt-2">{t('loginSubtitle')}</p>
          </div>

          {resetBanner && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
              {t('passwordResetSuccess')}
            </div>
          )}

          {needsVerification && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-sm space-y-2">
              <p>{t('loginEmailNotVerified')}</p>
              {resendSent ? (
                <p className="text-amber-900">{t('resendVerificationSent')}</p>
              ) : (
                <>
                  {resendError && (
                    <p className="text-red-700">{resendError}</p>
                  )}
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendLoading || !formData.email.trim()}
                    className="text-sm font-semibold text-primary-700 hover:text-primary-800 underline underline-offset-2 disabled:opacity-50"
                  >
                    {resendLoading
                      ? t('resendVerificationSending')
                      : t('resendVerificationCta')}
                  </button>
                </>
              )}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label={t('email')}
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('emailPlaceholder')}
              autoComplete="email"
            />
            <Input
              label={t('password')}
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="current-password"
            />

            <div className="flex flex-col items-stretch gap-1 -mt-1">
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-primary-600 hover:text-primary-800 underline underline-offset-2 text-center"
              >
                {t('forgotPasswordLink')}
              </Link>
            </div>

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
              {t('login')}
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('noAccount')}{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                {t('register')}
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
