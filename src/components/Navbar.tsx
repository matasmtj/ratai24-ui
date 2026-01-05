import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/useLanguage';
import { Button } from './ui/Button';
import { 
  HomeIcon, 
  TruckIcon, 
  DocumentTextIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  LanguageIcon,
  PhoneIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Menu } from '@headlessui/react';
import type { Language } from '../i18n/translations';
import { useState } from 'react';

export function Navbar() {
  const { isAuthenticated, role, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center flex-shrink-0">
              <TruckIcon className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Ratai24</span>
            </Link>
            
            <div className="hidden lg:ml-8 lg:flex lg:space-x-1">
              <Link
                to="/"
                className="inline-flex items-center px-2 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md whitespace-nowrap"
              >
                <HomeIcon className="h-4 w-4 mr-1" />
                {t('home')}
              </Link>
              <Link
                to="/cars"
                className="inline-flex items-center px-2 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md whitespace-nowrap"
              >
                <TruckIcon className="h-4 w-4 mr-1" />
                {t('carLease')}
              </Link>
              <Link
                to="/car-sale"
                className="inline-flex items-center px-2 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md whitespace-nowrap"
              >
                <TruckIcon className="h-4 w-4 mr-1" />
                {t('carSale')}
              </Link>
              <Link
                to="/parts"
                className="inline-flex items-center px-2 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md whitespace-nowrap"
              >
                <TruckIcon className="h-4 w-4 mr-1" />
                {t('parts')}
              </Link>
              <Link
                to="/contacts"
                className="inline-flex items-center px-2 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md whitespace-nowrap"
              >
                <PhoneIcon className="h-4 w-4 mr-1" />
                {t('contacts')}
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>

            {/* Language Switcher */}
            <Menu as="div" className="relative hidden lg:block">
              <Menu.Button className="inline-flex items-center px-2 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                <LanguageIcon className="h-4 w-4 mr-1" />
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
                  <>
                    <Link to="/dashboard">
                      <Button variant="ghost" size="sm" className="flex items-center">
                        <DocumentTextIcon className="h-5 w-5" />
                        <span className="hidden sm:inline ml-1">{t('myReservations')}</span>
                      </Button>
                    </Link>
                    <Link to="/profile">
                      <Button variant="ghost" size="sm" className="flex items-center">
                        <UserCircleIcon className="h-5 w-5" />
                        <span className="hidden sm:inline ml-1">{t('myProfile')}</span>
                      </Button>
                    </Link>
                  </>
                )}
                {role === 'ADMIN' && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm" className="flex items-center">
                      <Cog6ToothIcon className="h-5 w-5" />
                      <span className="hidden sm:inline ml-1">{t('administration')}</span>
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center">
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span className="hidden sm:inline ml-1">{t('logout')}</span>
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="flex items-center">
                    <UserCircleIcon className="h-5 w-5" />
                    <span className="hidden sm:inline ml-1">{t('login')}</span>
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="whitespace-nowrap">{t('register')}</Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              >
                <HomeIcon className="h-5 w-5 mr-3" />
                {t('home')}
              </Link>
              <Link
                to="/cars"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              >
                <TruckIcon className="h-5 w-5 mr-3" />
                {t('carLease')}
              </Link>
              <Link
                to="/car-sale"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              >
                <TruckIcon className="h-5 w-5 mr-3" />
                {t('carSale')}
              </Link>
              <Link
                to="/parts"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              >
                <TruckIcon className="h-5 w-5 mr-3" />
                {t('parts')}
              </Link>
              <Link
                to="/contacts"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              >
                <PhoneIcon className="h-5 w-5 mr-3" />
                {t('contacts')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
