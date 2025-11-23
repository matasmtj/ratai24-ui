import { Link, Outlet, useLocation } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { 
  MapPinIcon, 
  TruckIcon, 
  DocumentTextIcon,
  Cog6ToothIcon 
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const tabs = [
  { name: 'Miestai', href: '/admin/cities', icon: MapPinIcon },
  { name: 'Automobiliai', href: '/admin/cars', icon: TruckIcon },
  { name: 'Rezervacijos', href: '/admin/contracts', icon: DocumentTextIcon },
];

export function AdminDashboard() {
  const location = useLocation();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Cog6ToothIcon className="h-8 w-8 text-primary-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Administravimo skydelis</h1>
          </div>
          <p className="text-gray-600">Valdykite miestus, automobilius ir rezervacijas</p>
        </div>

        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const isActive = location.pathname === tab.href || 
                              (tab.href === '/admin/cities' && location.pathname === '/admin');
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

        <Outlet />
      </div>
    </Layout>
  );
}
