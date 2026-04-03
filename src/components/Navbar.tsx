import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Menu } from '@headlessui/react';
import { UserCircleIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/useLanguage';
import { Button } from './ui/Button';
import type { Language } from '../i18n/translations';

export function Navbar() {
  const { isAuthenticated, role, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate('/', { replace: true });
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center flex-shrink-0 text-xl font-bold text-gray-900">
              Ratai24
            </Link>

            <div className="hidden lg:flex lg:space-x-3">
              <Link
                to="/"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md whitespace-nowrap"
              >
                {t('home')}
              </Link>
              <Link
                to="/cars"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md whitespace-nowrap"
              >
                {t('carLease')}
              </Link>
              <Link
                to="/car-sale"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md whitespace-nowrap"
              >
                {t('carSale')}
              </Link>
              <Link
                to="/contacts"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md whitespace-nowrap"
              >
                {t('contacts')}
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
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

            {isAuthenticated && role === 'ADMIN' && (
              <Link to="/admin" className="hidden lg:inline-flex">
                <Button variant="ghost" size="sm">
                  {t('administration')}
                </Button>
              </Link>
            )}

            {!isAuthenticated && (
              <Link to="/login" className="inline-flex">
                <Button variant="secondary" size="sm" className="border border-gray-300 shadow-sm">
                  {t('login')}
                </Button>
              </Link>
            )}

            <Menu as="div" className="relative">
              <Menu.Button className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md border border-gray-200 gap-2">
                <Bars3Icon className="h-5 w-5 lg:hidden" aria-hidden />
                <UserCircleIcon className="h-5 w-5" />
                <span className="hidden sm:inline">{t('account')}</span>
              </Menu.Button>
              <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 divide-y divide-gray-100">
                <div className="py-1">
                  {isAuthenticated ? (
                    <>
                      {role === 'USER' && (
                        <>
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to="/dashboard"
                                className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700`}
                              >
                                {t('myReservations')}
                              </Link>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to="/profile"
                                className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700`}
                              >
                                {t('myProfile')}
                              </Link>
                            )}
                          </Menu.Item>
                        </>
                      )}
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={`${active ? 'bg-gray-100' : ''} block w-full text-left px-4 py-2 text-sm text-gray-700`}
                          >
                            {t('logout')}
                          </button>
                        )}
                      </Menu.Item>
                    </>
                  ) : (
                    <>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/login"
                            className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700`}
                          >
                            {t('login')}
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/register"
                            className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700`}
                          >
                            {t('register')}
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/forgot-password"
                            className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700`}
                          >
                            {t('forgotPasswordLink')}
                          </Link>
                        )}
                      </Menu.Item>
                    </>
                  )}
                </div>

                <div className="py-1">
                  <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kalba</div>
                  {(['lt', 'en', 'ru'] as Language[]).map((lang) => (
                    <Menu.Item key={lang}>
                      {({ active }) => (
                        <button
                          onClick={() => setLanguage(lang)}
                          className={`${active ? 'bg-gray-100' : ''} ${language === lang ? 'font-semibold text-primary-700' : 'text-gray-700'} block w-full text-left px-4 py-2 text-sm`}
                        >
                          {lang === 'lt' && 'Lietuvių'}
                          {lang === 'en' && 'English'}
                          {lang === 'ru' && 'Русский'}
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                </div>
              </Menu.Items>
            </Menu>
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
                {t('home')}
              </Link>
              <Link
                to="/cars"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              >
                {t('carLease')}
              </Link>
              <Link
                to="/car-sale"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              >
                {t('carSale')}
              </Link>
              <Link
                to="/contacts"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              >
                {t('contacts')}
              </Link>
              {isAuthenticated ? (
                <>
                  {role === 'USER' && (
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                    >
                      {t('myReservations')}
                    </Link>
                  )}
                  {role === 'USER' ? (
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                    >
                      {t('myProfile')}
                    </Link>
                  ) : (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                    >
                      {t('administration')}
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center w-full px-3 py-2 text-left text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                  >
                    {t('logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                  >
                    {t('login')}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                  >
                    {t('register')}
                  </Link>
                  <Link
                    to="/forgot-password"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                  >
                    {t('forgotPasswordLink')}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
