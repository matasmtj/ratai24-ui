import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from './Navbar';
import { useLanguage } from '../contexts/LanguageContext';
import { TruckIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <footer className="bg-gray-900 text-gray-300 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1">
              <div className="flex items-center mb-4">
                <TruckIcon className="h-8 w-8 text-primary-400" />
                <span className="ml-2 text-xl font-bold text-white">Ratai24</span>
              </div>
              <p className="text-sm text-gray-400">
                {t('footerTagline')}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">{t('quickLinks')}</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/cars" className="text-sm hover:text-white transition-colors">
                    {t('cars')}
                  </Link>
                </li>
                <li>
                  <Link to="/contacts" className="text-sm hover:text-white transition-colors">
                    {t('contacts')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-white font-semibold mb-4">{t('information')}</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm hover:text-white transition-colors">
                    {t('aboutUs')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm hover:text-white transition-colors">
                    {t('termsOfService')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm hover:text-white transition-colors">
                    {t('privacyPolicy')}
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-semibold mb-4">{t('contactInfo')}</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-sm">
                  <EnvelopeIcon className="h-5 w-5 mr-2" />
                  <a href="/contacts" className="hover:text-white transition-colors">
                    {t('viewContacts')}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Ratai24. {t('footer')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
