import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useLanguage } from '../contexts/useLanguage';
import { useAuth } from '../contexts/AuthContext';
import { usersApi } from '../api/users';
import { isSafeInternalPath } from '../i18n/routes';
import { PhoneIcon } from '@heroicons/react/24/outline';

export function CompleteProfilePage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { clearNeedsPhone } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phoneNumber.trim()) {
      setError(t('phoneRequired'));
      return;
    }

    setIsLoading(true);
    try {
      await usersApi.updateCurrentUser({ phoneNumber: phoneNumber.trim() });
      clearNeedsPhone();
      const from = (location.state as { from?: string } | null)?.from;
      navigate(isSafeInternalPath(from) ? from : '/dashboard', { replace: true });
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;
      setError(message || t('completeProfileFailed'));
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
              <PhoneIcon className="h-12 w-12 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t('completeProfileTitle')}</h1>
            <p className="text-gray-600 mt-2">{t('completeProfileSubtitle')}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t('phoneNumber')}
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              placeholder="+370..."
              autoComplete="tel"
            />
            <Button type="submit" className="w-full" isLoading={isLoading}>
              {t('completeProfileSave')}
            </Button>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
