import { Link, Outlet, useLocation } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { useLanguage } from '../../contexts/useLanguage';
import { 
  MapPinIcon, 
  TruckIcon, 
  DocumentTextIcon,
  Cog6ToothIcon,
  PhoneIcon,
  UsersIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  ScaleIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

export function AdminDashboard() {
  const location = useLocation();
  const { t } = useLanguage();
  
  const tabs = [
    { name: t('contracts'), href: '/admin/contracts', icon: DocumentTextIcon },
    { name: t('cars'), href: '/admin/cars', icon: TruckIcon },
    { name: t('parts'), href: '/admin/parts', icon: WrenchScrewdriverIcon },
    { name: t('cities'), href: '/admin/cities', icon: MapPinIcon },
    { name: t('contacts'), href: '/admin/contacts', icon: PhoneIcon },
    { name: t('legalPages'), href: '/admin/legal', icon: ScaleIcon },
    { name: t('users'), href: '/admin/users', icon: UsersIcon },
    { name: t('pricing.admin.pricing'), href: '/admin/pricing', icon: CurrencyDollarIcon },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Cog6ToothIcon className="h-8 w-8 text-primary-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">{t('adminPanel')}</h1>
          </div>
          <p className="text-gray-600">{t('adminPanelDesc')}</p>
        </div>

        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const isActive = location.pathname === tab.href || 
                              (tab.href === '/admin/contracts' && location.pathname === '/admin') ||
                              (tab.href === '/admin/pricing' && location.pathname.startsWith('/admin/pricing')) ||
                              (tab.href === '/admin/legal' && location.pathname.startsWith('/admin/legal'));
              return (
                <Link
                  key={tab.name}
                  to={tab.href}
                  className={clsx(
                    'group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm',
                    isActive
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  <tab.icon
                    className={clsx(
                      'mr-2 h-5 w-5',
                      isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {tab.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Pricing Sub-navigation */}
        {location.pathname.startsWith('/admin/pricing') && (
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-4">
              {[
                { name: t('pricing.admin.analytics'), href: '/admin/pricing' },
                { name: t('pricing.admin.pricingRules'), href: '/admin/pricing/rules' },
                { name: t('pricing.admin.seasonalFactors'), href: '/admin/pricing/seasonal' },
              ].map((subtab) => {
                const isActive = location.pathname === subtab.href;
                return (
                  <Link
                    key={subtab.name}
                    to={subtab.href}
                    className={clsx(
                      'py-2 px-3 border-b-2 font-medium text-sm',
                      isActive
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    )}
                  >
                    {subtab.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        <Outlet />
      </div>
    </Layout>
  );
}
