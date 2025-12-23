import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ReCaptcha, type ReCaptchaHandle } from '../components/ui/ReCaptcha';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { UserCircleIcon } from '@heroicons/react/24/outline';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();
  const recaptchaRef = useRef<ReCaptchaHandle>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Verify reCAPTCHA
    const recaptchaToken = recaptchaRef.current?.getValue();
    if (!recaptchaToken) {
      setError(t('completeRecaptcha'));
      return;
    }

    setIsLoading(true);

    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Prisijungimas nepavyko. Patikrinkite įvestus duomenis.');
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
              <UserCircleIcon className="h-12 w-12 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t('loginTitle')}</h1>
            <p className="text-gray-600 mt-2">{t('loginSubtitle')}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
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
              label={t('password')}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />

            <div className="pt-2">
              <ReCaptcha ref={recaptchaRef} />
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              {t('login')}
            </Button>
          </form>

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
