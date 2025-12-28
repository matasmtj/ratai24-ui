import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { carsApi } from '../../api/cars';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { LoadingSpinner } from '../ui/Loading';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { ImageLightbox } from '../ui/ImageLightbox';
import { useLanguage } from '../../contexts/LanguageContext';
import { PhotoIcon, TrashIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface CarImagesManagerProps {
  carId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function CarImagesManager({ carId, isOpen, onClose }: CarImagesManagerProps) {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deleteImageId, setDeleteImageId] = useState<number | null>(null);
  const [lightboxImageIndex, setLightboxImageIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [localImages, setLocalImages] = useState<typeof images>([]);

  const { data: imagesData, isLoading } = useQuery({
    queryKey: ['car-images', carId],
    queryFn: () => carsApi.getImages(carId),
    enabled: isOpen,
  });

  const images = imagesData?.images || [];

  // Update local images when data changes
  useEffect(() => {
    setLocalImages(images);
  }, [images]);

  const reorderMutation = useMutation({
    mutationFn: (imageIds: number[]) => carsApi.reorderImages(carId, imageIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['car-images', carId] });
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      queryClient.invalidateQueries({ queryKey: ['car', carId] });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => carsApi.uploadImages(carId, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['car-images', carId] });
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      queryClient.invalidateQueries({ queryKey: ['car', carId] });
      setSelectedFiles([]);
      setUploading(false);
    },
    onError: (error: any) => {
      console.error('Upload error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = 'Failed to upload images. ';
      if (error.response?.status === 401) {
        errorMessage += 'Authentication failed. Please log in again.';
      } else if (error.response?.status === 403) {
        errorMessage += 'You do not have permission to upload images.';
      } else if (error.response?.status === 413) {
        errorMessage += 'Files are too large. Maximum size is 10MB per file.';
      } else if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else {
        errorMessage += 'Please check the console for details.';
      }
      
      alert(errorMessage);
      setUploading(false);
    },
  });

  const setMainMutation = useMutation({
    mutationFn: (imageId: number) => carsApi.setMainImage(carId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['car-images', carId] });
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      queryClient.invalidateQueries({ queryKey: ['car', carId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (imageId: number) => carsApi.deleteImage(carId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['car-images', carId] });
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      queryClient.invalidateQueries({ queryKey: ['car', carId] });
      setDeleteImageId(null);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length > 10) {
        alert(t('maxImagesWarning'));
        return;
      }
      setSelectedFiles(files);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    uploadMutation.mutate(selectedFiles);
  };

  const handleSetMain = (imageId: number) => {
    setMainMutation.mutate(imageId);
  };

  const handleDelete = (imageId: number) => {
    setDeleteImageId(imageId);
  };

  const confirmDelete = () => {
    if (deleteImageId) {
      deleteMutation.mutate(deleteImageId);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newImages = [...localImages];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);
    
    setLocalImages(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null) {
      const imageIds = localImages.map(img => img.id);
      reorderMutation.mutate(imageIds);
      // Set first image as main automatically
      if (localImages.length > 0 && !localImages[0].isMain) {
        setMainMutation.mutate(localImages[0].id);
      }
    }
    setDraggedIndex(null);
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= localImages.length) return;
    
    const newImages = [...localImages];
    const temp = newImages[index];
    newImages[index] = newImages[newIndex];
    newImages[newIndex] = temp;
    
    setLocalImages(newImages);
    const imageIds = newImages.map(img => img.id);
    reorderMutation.mutate(imageIds);
    
    // Set first image as main automatically
    if (newImages.length > 0 && !newImages[0].isMain) {
      setMainMutation.mutate(newImages[0].id);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={t('manageImages')} size="2xl">
        <div className="space-y-6">
          {/* Upload Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4 flex flex-col items-center gap-3">
                <div>
                  <span className="block text-sm font-medium text-gray-900">
                    {t('uploadImages')}
                  </span>
                  <span className="block text-xs text-gray-500 mt-1">
                    {t('uploadImagesDesc')}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <label 
                    htmlFor="image-upload" 
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    {t('selectFiles')}
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleFileSelect}
                    className="sr-only"
                  />
                </div>
              </div>
              {selectedFiles.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    {selectedFiles.length} {t('filesSelected')}
                  </p>
                  <ul className="text-xs text-gray-500 mb-3 max-h-20 overflow-y-auto">
                    {selectedFiles.map((file, idx) => (
                      <li key={idx}>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</li>
                    ))}
                  </ul>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={handleUpload} isLoading={uploading} disabled={uploading}>
                      {t('uploadButton')} {selectedFiles.length} {t('photos')}
                    </Button>
                    <Button variant="ghost" onClick={() => setSelectedFiles([])}>
                      {t('cancel')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

        {/* Images Grid */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            {t('currentImages')} ({images.length})
          </h3>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : images.length === 0 ? (
            <p className="text-center text-gray-500 py-8">{t('noImagesUploaded')}</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {localImages.map((image, index) => (
                <div 
                  key={image.id} 
                  className="relative group"
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  <div 
                    className="aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-move"
                    onClick={() => setLightboxImageIndex(index)}
                  >
                    <img
                      src={image.url}
                      alt={`Car image ${image.id}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Arrow buttons for reordering */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    {index > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveImage(index, 'left');
                        }}
                        className="p-1.5 rounded-full bg-white/90 text-gray-700 hover:bg-primary-500 hover:text-white transition-colors"
                        title={t('moveLeft')}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    )}
                    {index < localImages.length - 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveImage(index, 'right');
                        }}
                        className="p-1.5 rounded-full bg-white/90 text-gray-700 hover:bg-primary-500 hover:text-white transition-colors"
                        title={t('moveRight')}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetMain(image.id);
                      }}
                      className={`p-1.5 rounded-full ${
                        image.isMain
                          ? 'bg-yellow-500 text-white'
                          : 'bg-white/90 text-gray-700 hover:bg-yellow-500 hover:text-white'
                      } transition-colors`}
                      title={image.isMain ? t('mainImage') : t('setAsMain')}
                    >
                      {image.isMain ? (
                        <StarIconSolid className="h-4 w-4" />
                      ) : (
                        <StarIcon className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(image.id);
                      }}
                      className="p-1.5 rounded-full bg-white/90 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                      title={t('deleteImage')}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded">
                      {t('mainImage')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
    
    {/* Image Lightbox */}
    {lightboxImageIndex !== null && images.length > 0 && (
      <ImageLightbox
        images={images}
        initialIndex={lightboxImageIndex}
        isOpen={true}
        onClose={() => setLightboxImageIndex(null)}
      />
    )}
    
    <ConfirmDialog
      isOpen={deleteImageId !== null}
      onClose={() => setDeleteImageId(null)}
      onConfirm={confirmDelete}
      title={t('delete')}
      message={t('confirmDeleteImage')}
      confirmText={t('delete')}
      cancelText={t('cancel')}
      isLoading={deleteMutation.isPending}
    />
    </>
  );
}
