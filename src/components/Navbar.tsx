import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/Button';
import { 
  HomeIcon, 
  TruckIcon, 
  DocumentTextIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  LanguageIcon
} from '@heroicons/react/24/outline';
import { Menu } from '@headlessui/react';
import type { Language } from '../i18n/translations';

export function Navbar() {
  const { isAuthenticated, role, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <TruckIcon className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Ratai24</span>
            </Link>
            
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              <Link
                to="/"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              >
                <HomeIcon className="h-5 w-5 mr-1" />
                {t('home')}
              </Link>
              <Link
                to="/cars"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              >
                <TruckIcon className="h-5 w-5 mr-1" />
                {t('cars')}
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <Menu as="div" className="relative">
              <Menu.Button className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                <LanguageIcon className="h-5 w-5 mr-1" />
                {language.toUpperCase()}
              </Menu.Button>
              <Menu.Items className="absolute right-0 mt-2 w-32 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <div className="py-1">
                  {(['lt', 'en', 'ru'] as Language[]).map((lang) => (
                    <Menu.Item key={lang}>
                      {({ active }) => (
                        <button
                          onClick={() => setLanguage(lang)}
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } ${
                            language === lang ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                          } block w-full text-left px-4 py-2 text-sm`}
                        >
                          {lang === 'lt' && '🇱🇹 Lietuvių'}
                          {lang === 'en' && '🇬🇧 English'}
                          {lang === 'ru' && '🇷🇺 Русский'}
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                </div>
              </Menu.Items>
            </Menu>

            {isAuthenticated ? (
              <>
                {role === 'USER' && (
                  <Link to="/dashboard">
                    <Button variant="ghost" size="sm">
                      <DocumentTextIcon className="h-5 w-5 mr-1" />
                      {t('myReservations')}
                    </Button>
                  </Link>
                )}
                {role === 'ADMIN' && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm">
                      <Cog6ToothIcon className="h-5 w-5 mr-1" />
                      {t('administration')}
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1" />
                  {t('logout')}
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    <UserCircleIcon className="h-5 w-5 mr-1" />
                    {t('login')}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">{t('register')}</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
