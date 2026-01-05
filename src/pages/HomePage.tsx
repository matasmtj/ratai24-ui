import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/Loading';
import { useLanguage } from '../contexts/useLanguage';
import { citiesApi } from '../api/cities';
import { carsApi } from '../api/cars';
import { 
  TruckIcon, 
  MapPinIcon, 
  CheckCircleIcon,
  ClockIcon,
  ShieldCheckIcon 
} from '@heroicons/react/24/outline';

export function HomePage() {
  const { t } = useLanguage();
  const { data: cities, isLoading: citiesLoading } = useQuery({
    queryKey: ['cities'],
    queryFn: citiesApi.getAll,
  });

  const { data: cars, isLoading: carsLoading } = useQuery({
    queryKey: ['cars-preview'],
    queryFn: () => carsApi.getAll(),
  });

  const featuredCars = cars?.slice(0, 3);

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t('heroTitle')}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              {t('heroSubtitle')}
            </p>
            <Link to="/cars">
              <Button size="lg" variant="secondary">
                <TruckIcon className="h-6 w-6 mr-2" />
                {t('viewCars')}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Cities Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('activeCities')}
          </h2>
          {citiesLoading ? (
            <LoadingSpinner />
          ) : cities && cities.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              {cities.map((city) => (
                <Link
                  key={city.id}
                  to={`/cars?cityId=${city.id}`}
                  className="inline-flex items-center px-6 py-3 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-primary-300 transition-all cursor-pointer"
                >
                  <MapPinIcon className="h-6 w-6 text-primary-600 mr-2" />
                  <span className="text-lg font-medium text-gray-900">{city.name}</span>
                  <span className="ml-2 text-sm text-gray-500">({city.country})</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">{t('noCarsFound')}</p>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            {t('whyUs')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <CheckCircleIcon className="h-12 w-12 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('simpleBooking')}</h3>
              <p className="text-gray-600">
                {t('simpleBookingDesc')}
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <ClockIcon className="h-12 w-12 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('fastConfirmation')}</h3>
              <p className="text-gray-600">
                {t('fastConfirmationDesc')}
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <ShieldCheckIcon className="h-12 w-12 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('reliableCars')}</h3>
              <p className="text-gray-600">
                {t('reliableCarsDesc')}
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Featured Cars Section */}
      {!carsLoading && featuredCars && featuredCars.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            {t('popularCars')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredCars.map((car) => {
              const mainImage = car.images?.find(img => img.isMain);
              
              return (
              <Card key={car.id} hover className="overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  {mainImage ? (
                    <img 
                      src={mainImage.url} 
                      alt={`${car.make} ${car.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <TruckIcon className="h-24 w-24 text-gray-400" />
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">
                    {car.make} {car.model}
                  </h3>
                  <p className="text-gray-600 mb-4">{car.year} {t('year')}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primary-600">
                      €{car.pricePerDay}{t('perDay')}
                    </span>
                    <Link to="/cars">
                      <Button size="sm">{t('view')}</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            )})}
          </div>
          <div className="text-center mt-8">
            <Link to="/cars">
              <Button variant="secondary" size="lg">
                {t('viewAllCars')}
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">{t('readyToStart')}</h2>
          <p className="text-xl mb-8 text-primary-100">
            {t('readyToStartDesc')}
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary">
              {t('registerNow')}
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
