import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useLanguage } from '../contexts/useLanguage';
import { authApi } from '../api/auth';
import { PasswordCriteria } from '../components/PasswordCriteria';
import { passwordMeetsAllRequirements } from '../lib/passwordRequirements';
import { KeyIcon } from '@heroicons/react/24/outline';

export function ResetPasswordPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!tokenFromUrl) {
      setError(t('resetPasswordMissingToken'));
    }
  }, [tokenFromUrl, t]);

  const handleSubmit = async () => {
    if (!tokenFromUrl || isLoading) return;
    setError('');

    if (password !== confirmPassword) {
      setError(t('passwordsDontMatch'));
      return;
    }
    if (!passwordMeetsAllRequirements(password)) {
      setError(t('passwordRequirementsIncomplete'));
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword({ token: tokenFromUrl, password });
      navigate('/login', { replace: true, state: { passwordResetOk: true } });
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setError(message || t('resetPasswordFailed'));
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
              <KeyIcon className="h-12 w-12 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t('resetPasswordTitle')}</h1>
            <p className="text-gray-600 mt-2">{t('resetPasswordSubtitle')}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label={t('newPassword')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSubmit())}
              autoComplete="new-password"
            />
            <PasswordCriteria password={password} />
            <Input
              label={t('confirmPassword')}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSubmit())}
              autoComplete="new-password"
            />
            <Button
              type="button"
              onClick={handleSubmit}
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading || !tokenFromUrl}
            >
              {t('saveNewPassword')}
            </Button>
          </div>

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
