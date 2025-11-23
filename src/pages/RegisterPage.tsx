import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { UserPlusIcon } from '@heroicons/react/24/outline';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Slaptažodžiai nesutampa');
      return;
    }

    if (formData.password.length < 8) {
      setError('Slaptažodis turi būti bent 8 simbolių');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
      });
      
      alert('Registracija sėkminga! Dabar galite prisijungti.');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registracija nepavyko. Bandykite dar kartą.');
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
              <UserPlusIcon className="h-12 w-12 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Registruotis</h1>
            <p className="text-gray-600 mt-2">Sukurkite naują paskyrą</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="El. paštas"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="jusu@pastas.lt"
            />
            <Input
              label="Slaptažodis"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="Bent 8 simboliai"
            />
            <Input
              label="Patvirtinti slaptažodį"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Registruotis
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Jau turite paskyrą?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Prisijungti
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
