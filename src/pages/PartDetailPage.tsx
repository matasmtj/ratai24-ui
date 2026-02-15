import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingPage } from '../components/ui/Loading';
import { ImageLightbox } from '../components/ui/ImageLightbox';
import { partsApi } from '../api/parts';
import { useLanguage } from '../contexts/useLanguage';
import { 
  WrenchScrewdriverIcon,
  MapPinIcon,
  TagIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

export function PartDetailPage() {
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const { data: part, isLoading } = useQuery({
    queryKey: ['part', id],
    queryFn: () => partsApi.getById(Number(id)),
    enabled: !!id,
  });

  if (isLoading) return <LoadingPage />;
  if (!part) return <div>{t('partNotFound')}</div>;

  const partImages = part.images || [];
  const currentImage = partImages[currentImageIndex];

  const nextImage = () => {
    if (partImages.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % partImages.length);
    }
  };

  const previousImage = () => {
    if (partImages.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + partImages.length) % partImages.length);
    }
  };

  const getConditionBadgeColor = (condition: string) => {
    switch (condition) {
      case 'NEW':
        return 'bg-green-100 text-green-800';
      case 'REFURBISHED':
        return 'bg-blue-100 text-blue-800';
      case 'USED_GOOD':
        return 'bg-yellow-100 text-yellow-800';
      case 'USED_FAIR':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case 'NEW':
        return t('partConditionNew');
      case 'REFURBISHED':
        return t('partConditionRefurbished');
      case 'USED_GOOD':
        return t('partConditionUsedGood');
      case 'USED_FAIR':
        return t('partConditionUsedFair');
      default:
        return condition;
    }
  };

  const getConditionDescription = (condition: string) => {
    switch (condition) {
      case 'NEW':
        return t('partConditionNewDesc');
      case 'REFURBISHED':
        return t('partConditionRefurbishedDesc');
      case 'USED_GOOD':
        return t('partConditionUsedGoodDesc');
      case 'USED_FAIR':
        return t('partConditionUsedFairDesc');
      default:
        return '';
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/parts" className="text-primary-600 hover:text-primary-700 mb-6 inline-flex items-center">
          <ChevronLeftIcon className="h-5 w-5 mr-1" />
          {t('backToParts')}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
          {/* Left Column - Images */}
          <div>
            <Card className="overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                {currentImage ? (
                  <>
                    <img 
                      src={currentImage.url} 
                      alt={part.name}
                      className="w-full h-full object-contain cursor-pointer"
                      onClick={() => setIsLightboxOpen(true)}
                    />
                    {partImages.length > 1 && (
                      <>
                        <button
                          onClick={previousImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                        >
                          <ChevronLeftIcon className="h-6 w-6" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                        >
                          <ChevronRightIcon className="h-6 w-6" />
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                          {currentImageIndex + 1} / {partImages.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <WrenchScrewdriverIcon className="h-32 w-32 text-gray-400" />
                )}
              </div>
            </Card>

            {partImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {partImages.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex ? 'border-primary-500' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img src={image.url} alt={`${part.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{part.name}</h1>
              <p className="text-xl text-gray-600">{part.make} {part.model} ({part.year})</p>
            </div>

            {/* Condition Badge */}
            <div>
              <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${getConditionBadgeColor(part.condition)}`}>
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                {getConditionLabel(part.condition)}
              </span>
              <p className="text-sm text-gray-600 mt-2">{getConditionDescription(part.condition)}</p>
            </div>

            {/* Price */}
            <Card className="p-6 bg-gradient-to-br from-primary-50 to-primary-100">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-600 mb-1">{t('price')}</div>
                  <div className="text-4xl font-bold text-primary-600">
                    €{part.price.toFixed(2)}
                  </div>
                </div>
                {part.quantity > 0 && (
                  <div className="text-right">
                    <div className="text-sm text-gray-600 mb-1">{t('inStock')}</div>
                    <div className="text-2xl font-semibold text-gray-900">
                      {part.quantity} {part.quantity === 1 ? t('unit') : t('units')}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                className="w-full" 
                size="lg"
                disabled={!part.quantity || part.quantity === 0}
              >
                {part.quantity > 0 ? t('contactSeller') : t('outOfStock')}
              </Button>
              {part.quantity > 0 && part.quantity <= 3 && (
                <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <InformationCircleIcon className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-orange-800">
                    {t('onlyXLeftWarning').replace('{count}', part.quantity.toString())}
                  </p>
                </div>
              )}
            </div>

            {/* Details Card */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">{t('partDetails')}</h2>
              <dl className="space-y-3">
                {part.partNumber && (
                  <div className="flex items-center justify-between py-2 border-b">
                    <dt className="text-gray-600 flex items-center">
                      <TagIcon className="h-5 w-5 mr-2" />
                      {t('partNumber')}
                    </dt>
                    <dd className="font-medium">{part.partNumber}</dd>
                  </div>
                )}
                <div className="flex items-center justify-between py-2 border-b">
                  <dt className="text-gray-600">{t('manufacturer')}</dt>
                  <dd className="font-medium">{part.make}</dd>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <dt className="text-gray-600">{t('model')}</dt>
                  <dd className="font-medium">{part.model}</dd>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <dt className="text-gray-600 flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    {t('year')}
                  </dt>
                  <dd className="font-medium">{part.year}</dd>
                </div>
                {part.location && (
                  <div className="flex items-center justify-between py-2 border-b">
                    <dt className="text-gray-600 flex items-center">
                      <MapPinIcon className="h-5 w-5 mr-2" />
                      {t('location')}
                    </dt>
                    <dd className="font-medium">{part.location}</dd>
                  </div>
                )}
                {part.categoryName && (
                  <div className="flex items-center justify-between py-2">
                    <dt className="text-gray-600">{t('category')}</dt>
                    <dd className="font-medium">{part.categoryName}</dd>
                  </div>
                )}
              </dl>
            </Card>

            {/* Description */}
            {part.description && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">{t('description')}</h2>
                <p className="text-gray-700 whitespace-pre-line">{part.description}</p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {isLightboxOpen && partImages.length > 0 && (
        <ImageLightbox
          images={partImages.map(img => img.url)}
          currentIndex={currentImageIndex}
          onClose={() => setIsLightboxOpen(false)}
          onNavigate={setCurrentImageIndex}
        />
      )}
    </Layout>
  );
}
