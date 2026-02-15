import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/Loading';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Alert } from '../../components/ui/Alert';
import { SearchableSelect } from '../../components/ui/SearchableSelect';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ImageLightbox } from '../../components/ui/ImageLightbox';
import { carMakes, carModels } from '../../data/carData';
import { partYears, commonPartNames } from '../../data/partData';
import { useLanguage } from '../../contexts/useLanguage';
import { partsApi } from '../../api/parts';
import type { Part, PartCreate, PartUpdate, PartCategory } from '../../types/api';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  WrenchScrewdriverIcon, 
  XMarkIcon, 
  EyeIcon 
} from '@heroicons/react/24/outline';

export function AdminPartsPage() {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [deletePartId, setDeletePartId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [makeFilter, setMakeFilter] = useState<string>('');
  const [modelFilter, setModelFilter] = useState<string>('');
  const [yearFilter, setYearFilter] = useState<string>('');
  const [conditionFilter, setConditionFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('');
  const [rowsPerPage, setRowsPerPage] = useState<number>(3);
  const [lightboxPartId, setLightboxPartId] = useState<number | null>(null);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);

  const { data: parts, isLoading } = useQuery({
    queryKey: ['parts'],
    queryFn: () => partsApi.getAll(),
  });

  const { data: categories } = useQuery({
    queryKey: ['part-categories'],
    queryFn: partsApi.getAllCategories,
  });

  const availableModels = useMemo(() => {
    if (!makeFilter) return [];
    return carModels[makeFilter] || [];
  }, [makeFilter]);

  const filteredAndSortedParts = useMemo(() => {
    if (!parts) return [];
    
    let filtered = parts.filter((part) => {
      const matchesSearch = 
        part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (part.partNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      const matchesMake = !makeFilter || part.make === makeFilter;
      const matchesModel = !modelFilter || part.model === modelFilter;
      const matchesYear = !yearFilter || part.year.toString() === yearFilter;
      const matchesCondition = !conditionFilter || part.condition === conditionFilter;
      const matchesCategory = !categoryFilter || (part.categoryId && part.categoryId.toString() === categoryFilter);
      return matchesSearch && matchesMake && matchesModel && matchesYear && matchesCondition && matchesCategory;
    });

    return filtered.sort((a, b) => {
      if (!sortBy) return 0;
      if (sortBy === 'nameAsc') return a.name.localeCompare(b.name);
      if (sortBy === 'nameDesc') return b.name.localeCompare(a.name);
      if (sortBy === 'yearAsc') return a.year - b.year;
      if (sortBy === 'yearDesc') return b.year - a.year;
      if (sortBy === 'priceAsc') return a.price - b.price;
      if (sortBy === 'priceDesc') return b.price - a.price;
      return 0;
    });
  }, [parts, searchTerm, makeFilter, modelFilter, yearFilter, conditionFilter, categoryFilter, sortBy]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setMakeFilter('');
    setModelFilter('');
    setYearFilter('');
    setConditionFilter('');
    setCategoryFilter('');
    setSortBy('');
  };

  const hasActiveFilters = searchTerm || makeFilter || modelFilter || yearFilter || conditionFilter || categoryFilter || sortBy;

  const paginatedParts = useMemo(() => {
    const partsPerRow = 3;
    const totalParts = rowsPerPage === -1 ? filteredAndSortedParts.length : rowsPerPage * partsPerRow;
    return filteredAndSortedParts.slice(0, totalParts);
  }, [filteredAndSortedParts, rowsPerPage]);

  const deleteMutation = useMutation({
    mutationFn: partsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      setDeletePartId(null);
    },
  });

  const handleDelete = (id: number) => {
    setDeletePartId(id);
  };

  const confirmDelete = () => {
    if (deletePartId !== null) {
      deleteMutation.mutate(deletePartId);
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('managecarParts')}</h1>
        <Button onClick={() => {
          setEditingPart(null);
          setIsModalOpen(true);
        }}>
          <PlusIcon className="h-5 w-5 mr-2" />
          {t('addPart')}
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-2">
            <Input
              placeholder={t('searchParts')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: '', label: t('sortBy') },
              { value: 'nameAsc', label: t('nameAsc') },
              { value: 'nameDesc', label: t('nameDesc') },
              { value: 'priceAsc', label: t('priceAsc') },
              { value: 'priceDesc', label: t('priceDesc') },
              { value: 'yearDesc', label: t('yearDesc') },
              { value: 'yearAsc', label: t('yearAsc') },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <SearchableSelect
            label={t('manufacturer')}
            value={makeFilter}
            onChange={(value) => setMakeFilter(typeof value === 'string' ? value : value[0] || '')}
            options={[
              { value: '', label: t('allMakes') },
              ...carMakes.map((make) => ({ value: make, label: make })),
            ]}
            placeholder={t('selectMake')}
          />
          <SearchableSelect
            label={t('model')}
            value={modelFilter}
            onChange={(value) => setModelFilter(typeof value === 'string' ? value : value[0] || '')}
            options={[
              { value: '', label: t('allModels') },
              ...availableModels.map((model) => ({ value: model, label: model })),
            ]}
            placeholder={t('selectModel')}
            disabled={!makeFilter}
          />
          <Select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            options={[
              { value: '', label: t('allYears') },
              ...partYears.map((year) => ({ value: year.toString(), label: year.toString() })),
            ]}
          />
          <Select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            options={[
              { value: '', label: t('allConditions') },
              { value: 'NEW', label: t('partConditionNew') },
              { value: 'REFURBISHED', label: t('partConditionRefurbished') },
              { value: 'USED_GOOD', label: t('partConditionUsedGood') },
              { value: 'USED_FAIR', label: t('partConditionUsedFair') },
            ]}
          />
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[
              { value: '', label: t('allCategories') },
              ...(categories?.map((cat) => ({ 
                value: cat.id.toString(), 
                label: t('locale') === 'lt' ? cat.nameLt : cat.nameEn 
              })) || []),
            ]}
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">{t('rowsPerPage')}:</label>
            <div className="w-20">
              <Select
                value={rowsPerPage.toString()}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                options={[
                  { value: '3', label: '3' },
                  { value: '7', label: '7' },
                  { value: '17', label: '17' },
                  { value: '-1', label: t('all') },
                ]}
              />
            </div>
          </div>
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleResetFilters}
              className="text-gray-600 hover:text-gray-900"
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              {t('resetFilters')}
            </Button>
          )}
        </div>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredAndSortedParts && filteredAndSortedParts.length > 0 ? (
        <>
          <div className="mb-6 text-gray-600">
            {t('showingXofY')
              .replace('{current}', paginatedParts.length.toString())
              .replace('{total}', filteredAndSortedParts.length.toString())}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedParts.map((part) => {
            const mainImage = part.images?.find(img => img.isMain);
            
            return (
            <Card key={part.id} className="overflow-hidden">
              <div 
                className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative cursor-pointer"
                onClick={() => {
                  setLightboxPartId(part.id);
                  setLightboxImageIndex(0);
                }}
              >
                {mainImage ? (
                  <img 
                    src={mainImage.url} 
                    alt={part.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <WrenchScrewdriverIcon className="h-16 w-16 text-gray-400" />
                )}
                <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-medium">
                  {part.images?.length || 0} {t('photos')}
                </div>
                <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium ${getConditionBadgeColor(part.condition)}`}>
                  {getConditionLabel(part.condition)}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                  {part.name}
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                  {part.make} {part.model} • {part.year}
                </p>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-primary-600 font-bold">€{part.price.toFixed(2)}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    part.quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {part.quantity > 0 ? `${part.quantity} ${t('inStock')}` : t('outOfStock')}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/parts/${part.id}`);
                    }}
                    title={t('view')}
                  >
                    <EyeIcon className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="flex-1" onClick={(e) => {
                    e.stopPropagation();
                    setEditingPart(part);
                    setIsModalOpen(true);
                  }}>
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(part.id);
                  }}>
                    <TrashIcon className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </Card>
          )})}
        </div>
        </>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-gray-600">{t('noPartsFound')}</p>
        </Card>
      )}

      <PartFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPart(null);
        }}
        part={editingPart}
        categories={categories || []}
      />
      
      {/* Image Lightbox */}
      {lightboxPartId && (() => {
        const lightboxPart = parts?.find(p => p.id === lightboxPartId);
        return lightboxPart?.images && lightboxPart.images.length > 0 ? (
          <ImageLightbox
            images={lightboxPart.images}
            initialIndex={lightboxImageIndex}
            isOpen={true}
            onClose={() => setLightboxPartId(null)}
          />
        ) : null;
      })()}
      
      <ConfirmDialog
        isOpen={deletePartId !== null}
        onClose={() => setDeletePartId(null)}
        onConfirm={confirmDelete}
        title={t('delete')}
        message={t('confirmDeletePart')}
        confirmText={t('delete')}
        cancelText={t('cancel')}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

function PartFormModal({ isOpen, onClose, part, categories }: { 
  isOpen: boolean; 
  onClose: () => void; 
  part: Part | null;
  categories: PartCategory[];
}) {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  
  type FormState = Omit<PartCreate, 'year' | 'price' | 'quantity'> & {
    year: number;
    price: string | number;
    quantity: string | number;
  };
  
  const [formData, setFormData] = useState<FormState>({
    name: '',
    description: null,
    partNumber: null,
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: '50',
    condition: 'USED_GOOD',
    quantity: '1',
    categoryId: null,
    location: null,
  });

  useEffect(() => {
    if (part) {
      setFormData({
        name: part.name,
        description: part.description || null,
        partNumber: part.partNumber || null,
        make: part.make,
        model: part.model,
        year: part.year,
        price: part.price.toString(),
        condition: part.condition,
        quantity: part.quantity.toString(),
        categoryId: part.categoryId || null,
        location: part.location || null,
      });
    } else {
      setFormData({
        name: '',
        description: null,
        partNumber: null,
        make: '',
        model: '',
        year: new Date().getFullYear(),
        price: '50',
        condition: 'USED_GOOD',
        quantity: '1',
        categoryId: null,
        location: null,
      });
    }
  }, [part]);

  const availableModels = useMemo(() => {
    if (!formData.make) return [];
    return carModels[formData.make] || [];
  }, [formData.make]);

  const createMutation = useMutation({
    mutationFn: partsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      setError(null);
      onClose();
    },
    onError: (error: any) => {
      const errorMsg = error?.response?.data?.error || error?.message || 'Failed to create part';
      setError(errorMsg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PartUpdate }) => partsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      setError(null);
      onClose();
    },
    onError: (error: any) => {
      const errorMsg = error?.response?.data?.error || error?.message || 'Failed to update part';
      setError(errorMsg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const submitData: PartCreate = {
      ...formData,
      price: typeof formData.price === 'string' ? Number(formData.price) : formData.price,
      quantity: typeof formData.quantity === 'string' ? Number(formData.quantity) : formData.quantity,
      description: formData.description || null,
      partNumber: formData.partNumber || null,
      location: formData.location || null,
    };
    
    if (part) {
      updateMutation.mutate({ id: part.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={part ? t('editPart') : t('addPart')}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
        {error && (
          <Alert type="error" message={error} onClose={() => setError(null)} />
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <SearchableSelect 
              label={t('partName')} 
              value={formData.name} 
              onChange={(value) => setFormData({ ...formData, name: Array.isArray(value) ? value[0] : value })} 
              options={commonPartNames}
              required 
            />
          </div>
          <SearchableSelect 
            label={t('manufacturer')} 
            value={formData.make} 
            onChange={(value) => setFormData({ ...formData, make: Array.isArray(value) ? value[0] : value, model: '' })} 
            options={carMakes}
            required 
          />
          <SearchableSelect 
            label={t('model')} 
            value={formData.model} 
            onChange={(value) => setFormData({ ...formData, model: Array.isArray(value) ? value[0] : value })} 
            options={availableModels}
            disabled={!formData.make}
            required 
          />
          <SearchableSelect 
            label={t('yearField')} 
            value={String(formData.year)} 
            onChange={(value) => setFormData({ ...formData, year: Number(value) })} 
            options={partYears.map(y => String(y))}
            required 
          />
          <Input 
            label={t('price')} 
            type="number" 
            step="0.01"
            value={formData.price || ''} 
            onChange={(e) => setFormData({ ...formData, price: e.target.value })} 
            required 
          />
          <Select 
            label={t('condition')} 
            value={formData.condition} 
            onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })} 
            options={[
              { value: 'NEW', label: t('partConditionNew') },
              { value: 'REFURBISHED', label: t('partConditionRefurbished') },
              { value: 'USED_GOOD', label: t('partConditionUsedGood') },
              { value: 'USED_FAIR', label: t('partConditionUsedFair') },
            ]} 
          />
          <Input 
            label={t('quantity')} 
            type="number" 
            value={formData.quantity || ''} 
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} 
            required 
          />
          <Input 
            label={t('partNumber') + ' (' + t('optional') + ')'} 
            value={formData.partNumber || ''} 
            onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })} 
          />
          <Select 
            label={t('category') + ' (' + t('optional') + ')'} 
            value={formData.categoryId?.toString() || ''} 
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value ? Number(e.target.value) : null })} 
            options={[
              { value: '', label: t('noCategory') },
              ...categories.map((cat) => ({ 
                value: cat.id.toString(), 
                label: t('locale') === 'lt' ? cat.nameLt : cat.nameEn 
              })),
            ]} 
          />
          <Input 
            label={t('location') + ' (' + t('optional') + ')'} 
            value={formData.location || ''} 
            onChange={(e) => setFormData({ ...formData, location: e.target.value })} 
          />
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('description')} ({t('optional')})
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={4}
              placeholder={t('partDescriptionPlaceholder')}
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>{t('cancel')}</Button>
          <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
            {part ? t('save') : t('add')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
