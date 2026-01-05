import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingPage } from '../components/ui/Loading';
import { ImageLightbox } from '../components/ui/ImageLightbox';
import { carsApi } from '../api/cars';
import { citiesApi } from '../api/cities';
import { useLanguage } from '../contexts/useLanguage';
import { getFuelTypeKey, getBodyTypeKey } from '../lib/translationHelpers';
import { 
  TruckIcon,
  MapPinIcon,
  Cog6ToothIcon,
  BoltIcon,
  PhoneIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

export function CarSaleDetailPage() {
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const { data: car, isLoading } = useQuery({
    queryKey: ['car', id],
    queryFn: () => carsApi.getById(Number(id)),
    enabled: !!id,
  });

  const { data: city } = useQuery({
    queryKey: ['city', car?.cityId],
    queryFn: () => citiesApi.getById(car!.cityId),
    enabled: !!car?.cityId,
  });

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!car) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-12 text-center">
            <TruckIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('carNotFound')}</h2>
            <Link to="/car-sale">
              <Button>{t('backToCars')}</Button>
            </Link>
          </Card>
        </div>
      </Layout>
    );
  }

  const carImages = car.images || [];
  const mainImage = carImages.find(img => img.isMain) || carImages[0];

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? carImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === carImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/car-sale" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
          <ChevronLeftIcon className="h-5 w-5 mr-1" />
          {t('backToCars')}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <Card className="overflow-hidden mb-4">
              {carImages.length > 0 ? (
                <>
                  <div className="relative aspect-video bg-gray-100">
                    <img 
                      src={carImages[currentImageIndex]?.url || mainImage?.url} 
                      alt={`${car.make} ${car.model}`}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setIsLightboxOpen(true)}
                    />
                    {carImages.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-colors"
                        >
                          <ChevronLeftIcon className="h-6 w-6" />
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-colors"
                        >
                          <ChevronRightIcon className="h-6 w-6" />
                        </button>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <TruckIcon className="h-24 w-24 text-gray-400" />
                </div>
              )}
            </Card>
            {carImages.length > 0 && (
              <div className="grid grid-cols-5 gap-2">
                {carImages.slice(0, 5).map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => {
                      setCurrentImageIndex(index);
                      setIsLightboxOpen(true);
                    }}
                    className={`aspect-video rounded-lg overflow-hidden border-2 transition-colors ${
                      index === currentImageIndex ? 'border-primary-600' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img 
                      src={image.url} 
                      alt={`${car.make} ${car.model} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Car Details */}
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {car.make} {car.model}
              </h1>
              <p className="text-xl text-gray-600">{car.year} {t('year')}</p>
              {car.availableForLease && (
                <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                  {t('alsoForLease')}
                </div>
              )}
            </div>

            {/* Specifications */}
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">{t('specifications')}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">{t('fuelType')}</div>
                  <div className="font-medium">
                    {t(getFuelTypeKey(car.fuelType) as any)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">{t('gearboxType')}</div>
                  <div className="font-medium flex items-center">
                    <Cog6ToothIcon className="h-4 w-4 mr-2" />
                    {car.gearbox === 'AUTOMATIC' ? t('automatic') : t('manual')}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">{t('powerOutput')}</div>
                  <div className="font-medium flex items-center">
                    <BoltIcon className="h-4 w-4 mr-2" />
                    {car.powerKW} {t('kw')}
                  </div>
                </div>
                {car.engineCapacityL && (
                  <div>
                    <div className="text-sm text-gray-500">{t('engineVolume')}</div>
                    <div className="font-medium">{car.engineCapacityL} L</div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-gray-500">{t('bodyType')}</div>
                  <div className="font-medium">{t(getBodyTypeKey(car.bodyType) as any)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">{t('seatsNumber')}</div>
                  <div className="font-medium">{car.seatCount}</div>
                </div>
                {car.colour && (
                  <div>
                    <div className="text-sm text-gray-500">{t('colour')}</div>
                    <div className="font-medium">{car.colour}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-gray-500">{t('mileageLabel')}</div>
                  <div className="font-medium">{car.odometerKm.toLocaleString()} km</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">{t('location')}</div>
                  <div className="font-medium flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    {city?.name}
                  </div>
                </div>
              </div>
            </Card>

            {/* Sale Description */}
            {car.saleDescription && (
              <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-2">{t('sellerComment')}</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{car.saleDescription}</p>
              </Card>
            )}

            {/* Price and Contact */}
            <Card className="p-6 bg-primary-50 border-primary-200">
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1">{t('salePrice')}</div>
                <div className="text-4xl font-bold text-primary-600">
                  €{car.salePrice?.toLocaleString()}
                </div>
              </div>
              <div className="border-t border-primary-200 pt-4">
                <p className="text-sm text-gray-700 mb-3">
                  {t('forMoreInfoContactSeller')}
                </p>
                <Link to="/contacts">
                  <Button size="lg" className="w-full">
                    <PhoneIcon className="h-5 w-5 mr-2" />
                    {t('contactSeller')}
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      <ImageLightbox
        images={carImages}
        initialIndex={currentImageIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
      />
    </Layout>
  );
}
