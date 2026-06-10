import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { partsApi } from '../../api/parts';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Alert } from '../ui/Alert';
import { LoadingSpinner } from '../ui/Loading';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { ImageLightbox } from '../ui/ImageLightbox';
import { useLanguage } from '../../contexts/useLanguage';
import { PhotoIcon, TrashIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface PartImagesManagerProps {
  partId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function PartImagesManager({ partId, isOpen, onClose }: PartImagesManagerProps) {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteImageId, setDeleteImageId] = useState<number | null>(null);
  const [lightboxImageIndex, setLightboxImageIndex] = useState<number | null>(null);

  const { data: imagesData, isLoading } = useQuery({
    queryKey: ['part-images', partId],
    queryFn: () => partsApi.getImages(partId),
    enabled: isOpen,
  });

  const images = imagesData?.images || [];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['part-images', partId] });
    queryClient.invalidateQueries({ queryKey: ['parts'] });
    queryClient.invalidateQueries({ queryKey: ['part', partId] });
  };

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => partsApi.uploadImages(partId, files),
    onSuccess: () => {
      invalidate();
      setSelectedFiles([]);
      setError(null);
      setUploading(false);
    },
    onError: () => {
      setError(t('uploadFailed'));
      setUploading(false);
    },
  });

  const setMainMutation = useMutation({
    mutationFn: (imageId: number) => partsApi.setMainImage(partId, imageId),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (imageId: number) => partsApi.deleteImage(partId, imageId),
    onSuccess: () => {
      invalidate();
      setDeleteImageId(null);
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (imageIds: number[]) => partsApi.reorderImages(partId, imageIds),
    onSuccess: invalidate,
  });

  const handleUpload = () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    uploadMutation.mutate(selectedFiles);
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;
    const newImages = [...images];
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    reorderMutation.mutate(newImages.map((img) => img.id));
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={t('manageImages')} size="2xl">
        <div className="space-y-6">
          {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={(e) => setSelectedFiles(e.target.files ? Array.from(e.target.files) : [])}
                  className="block mx-auto text-sm"
                />
              </div>
              {selectedFiles.length > 0 && (
                <div className="mt-4 flex gap-2 justify-center">
                  <Button onClick={handleUpload} isLoading={uploading}>{t('upload')}</Button>
                  <Button variant="ghost" onClick={() => setSelectedFiles([])}>{t('cancel')}</Button>
                </div>
              )}
            </div>
          </div>
          {isLoading ? (
            <LoadingSpinner />
          ) : images.length === 0 ? (
            <p className="text-center text-gray-500">{t('noImagesUploaded')}</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <div key={image.id} className="relative">
                  <div className="aspect-video bg-gray-100 rounded overflow-hidden cursor-pointer" onClick={() => setLightboxImageIndex(index)}>
                    <img src={image.url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button type="button" onClick={() => setMainMutation.mutate(image.id)} className="p-1.5 rounded-full bg-white/90">
                      {image.isMain ? <StarIconSolid className="h-4 w-4 text-yellow-500" /> : <StarIcon className="h-4 w-4" />}
                    </button>
                    <button type="button" onClick={() => setDeleteImageId(image.id)} className="p-1.5 rounded-full bg-white/90 text-red-600">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex justify-center gap-2 mt-2">
                    <Button size="sm" variant="ghost" disabled={index === 0} onClick={() => moveImage(index, 'left')}>←</Button>
                    <Button size="sm" variant="ghost" disabled={index === images.length - 1} onClick={() => moveImage(index, 'right')}>→</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
      {lightboxImageIndex !== null && (
        <ImageLightbox images={images} initialIndex={lightboxImageIndex} isOpen onClose={() => setLightboxImageIndex(null)} />
      )}
      <ConfirmDialog
        isOpen={deleteImageId !== null}
        onClose={() => setDeleteImageId(null)}
        onConfirm={() => deleteImageId && deleteMutation.mutate(deleteImageId)}
        title={t('delete')}
        message={t('confirmDeleteImage')}
        confirmText={t('delete')}
        cancelText={t('cancel')}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
