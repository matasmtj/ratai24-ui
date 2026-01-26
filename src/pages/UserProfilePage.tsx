import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { useLanguage } from '../contexts/useLanguage';
import { usersApi } from '../api/users';
import type { User } from '../types/api';
import { UserCircleIcon } from '@heroicons/react/24/outline';

export function UserProfilePage() {
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await usersApi.getCurrentUser();
      setUser(data);
      setFormData({
        email: data.email,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phoneNumber: data.phoneNumber || '',
        password: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.error || t('errorLoadingData'));
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Password validation if password is being changed
    if (formData.password || formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        setError(t('passwordsDontMatch'));
        return;
      }
      if (formData.password.length < 8) {
        setError(t('minPasswordLength'));
        return;
      }
    }

    setIsLoading(true);

    try {
      const updateData: any = {
        email: formData.email,
        firstName: formData.firstName || null,
        lastName: formData.lastName || null,
        phoneNumber: formData.phoneNumber || null,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      const updatedUser = await usersApi.updateCurrentUser(updateData);
      setUser(updatedUser);
      setSuccess(t('profileUpdated'));
      setFormData({
        ...formData,
        password: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.error || t('profileUpdateFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('loading')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <UserCircleIcon className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl font-bold">{t('myProfile')}</h1>
          </div>
          <p className="text-gray-600">{t('profileInformation')}</p>
        </div>

        <Card className="p-6">
          {error && (
            <div className="mb-4">
              <Alert type="error" message={error} onClose={() => setError('')} />
            </div>
          )}

          {success && (
            <div className="mb-4">
              <Alert type="success" message={success} onClose={() => setSuccess('')} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            <Input
              label={t('email')}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            <Input
              label={t('phoneNumber')}
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="+370..."
            />

            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-medium mb-4">{t('password')}</h3>
              <p className="text-sm text-gray-600 mb-4">{t('leaveBlankToKeep')}</p>

              <div className="space-y-4">
                <Input
                  label={t('newPasswordOptional')}
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={t('minPasswordLength')}
                />
                {formData.password && (
                  <Input
                    label={t('confirmNewPassword')}
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="submit" isLoading={isLoading}>
                {t('updateProfile')}
              </Button>
            </div>
          </form>

          {user && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <p><strong>{t('role')}:</strong> {user.role}</p>
                <p className="mt-1"><strong>{t('createdAt')}:</strong> {new Date(user.createdAt).toLocaleString()}</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}
