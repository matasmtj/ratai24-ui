import { useState, useMemo } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useNavigate } from 'react-router-dom';

import { Card } from '../../components/ui/Card';

import { Button } from '../../components/ui/Button';

import { LoadingSpinner } from '../../components/ui/Loading';

import { Modal } from '../../components/ui/Modal';

import { Input } from '../../components/ui/Input';

import { Select } from '../../components/ui/Select';

import { SearchableSelect } from '../../components/ui/SearchableSelect';

import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

import { PartImagesManager } from '../../components/admin/PartImagesManager';

import { getAllMakes, getModelsForMake, registerMakeModel } from '../../data/customCarData';

import { partYears } from '../../data/partData';

import { useLanguage } from '../../contexts/useLanguage';

import { useLocalizedPath } from '../../hooks/useLocalizedPath';

import { partsApi } from '../../api/parts';

import type { Part, PartCreate, PartCondition } from '../../types/api';

import { PlusIcon, PencilIcon, TrashIcon, PhotoIcon, EyeIcon } from '@heroicons/react/24/outline';



interface PartFormState {

  partName: string;

  oemNumber: string;

  make: string;

  model: string;

  year: number;

  colour: string;

  engineCapacityL: number | undefined;

  powerKW: number | undefined;

  fuelType: PartCreate['fuelType'];

  gearbox: PartCreate['gearbox'];

  bodyType: PartCreate['bodyType'];

  description: string;

  condition: PartCondition;

  price: string;

}



const emptyForm = (): PartFormState => ({

  partName: '',

  oemNumber: '',

  make: '',

  model: '',

  year: new Date().getFullYear(),

  colour: '',

  engineCapacityL: undefined,

  powerKW: undefined,

  fuelType: undefined,

  gearbox: undefined,

  bodyType: undefined,

  description: '',

  condition: 'USED',

  price: '',

});



const FUEL_OPTIONS = [

  'PETROL',

  'PETROL_LPG',

  'DIESEL',

  'ELECTRIC',

  'HYBRID_HEV',

  'HYBRID_PHEV',

] as const;



function getConditionLabel(t: (key: string) => string, condition: PartCondition) {

  switch (condition) {

    case 'NEW':

      return t('partConditionNew');

    case 'USED':

      return t('partConditionUsed');

    case 'DAMAGED':

      return t('partConditionDamaged');

    default:

      return condition;

  }

}



export function AdminPartsPage() {

  const queryClient = useQueryClient();

  const { t } = useLanguage();

  const lp = useLocalizedPath();

  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingPart, setEditingPart] = useState<Part | null>(null);

  const [deletePartId, setDeletePartId] = useState<number | null>(null);

  const [imagesPartId, setImagesPartId] = useState<number | null>(null);

  const [formData, setFormData] = useState<PartFormState>(emptyForm);

  const [makeOptionsVersion, setMakeOptionsVersion] = useState(0);



  const { data: parts, isLoading } = useQuery({

    queryKey: ['parts'],

    queryFn: () => partsApi.getAll(),

  });



  const createMutation = useMutation({

    mutationFn: partsApi.create,

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['parts'] });

      handleCloseModal();

    },

  });



  const updateMutation = useMutation({

    mutationFn: ({ id, data }: { id: number; data: PartCreate }) => partsApi.update(id, data),

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['parts'] });

      handleCloseModal();

    },

  });



  const deleteMutation = useMutation({

    mutationFn: partsApi.delete,

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ['parts'] });

      setDeletePartId(null);

    },

  });



  const makeOptionsList = useMemo(() => {

    void makeOptionsVersion;

    const all = getAllMakes();

    const current = formData.make?.trim();

    if (current && !all.includes(current)) {

      return [current, ...all];

    }

    return all;

  }, [formData.make, makeOptionsVersion]);



  const modelOptionsList = useMemo(() => {

    void makeOptionsVersion;

    const mk = formData.make?.trim();

    if (!mk) return [] as string[];

    const fromData = getModelsForMake(mk);

    const mod = formData.model?.trim();

    if (mod && !fromData.includes(mod)) {

      return [mod, ...fromData];

    }

    return fromData;

  }, [formData.make, formData.model, makeOptionsVersion]);



  const handleOpenModal = (part?: Part) => {

    if (part) {

      setEditingPart(part);

      setFormData({

        partName: part.partName,

        oemNumber: part.oemNumber || '',

        make: part.make,

        model: part.model,

        year: part.year,

        colour: part.colour || '',

        engineCapacityL: part.engineCapacityL ?? undefined,

        powerKW: part.powerKW ?? undefined,

        fuelType: part.fuelType ?? undefined,

        gearbox: part.gearbox ?? undefined,

        bodyType: part.bodyType ?? undefined,

        description: part.description || '',

        condition: part.condition,

        price: part.price ? String(part.price) : '',

      });

    } else {

      setEditingPart(null);

      setFormData(emptyForm());

    }

    setIsModalOpen(true);

  };



  const handleCloseModal = () => {

    setIsModalOpen(false);

    setEditingPart(null);

    setFormData(emptyForm());

  };



  const handleSubmit = (e: React.FormEvent) => {

    e.preventDefault();

    const price = Number(formData.price);

    if (!formData.price.trim() || Number.isNaN(price) || price < 0) {

      return;

    }



    registerMakeModel(formData.make, formData.model);

    setMakeOptionsVersion((v) => v + 1);



    const payload: PartCreate = {

      partName: formData.partName,

      oemNumber: formData.oemNumber || null,

      make: formData.make.trim(),

      model: formData.model.trim(),

      year: Number(formData.year),

      colour: formData.colour || null,

      description: formData.description || null,

      engineCapacityL: formData.engineCapacityL ? Number(formData.engineCapacityL) : null,

      powerKW: formData.powerKW ? Number(formData.powerKW) : null,

      fuelType: formData.fuelType ?? null,

      gearbox: formData.gearbox ?? null,

      bodyType: formData.bodyType ?? null,

      condition: formData.condition,

      price,

    };



    if (editingPart) {

      updateMutation.mutate({ id: editingPart.id, data: payload });

    } else {

      createMutation.mutate(payload);

    }

  };



  return (

    <div>

      <div className="flex justify-between items-center mb-6">

        <h2 className="text-xl font-semibold">{t('manageParts')}</h2>

        <Button onClick={() => handleOpenModal()}>

          <PlusIcon className="h-5 w-5 mr-2" />

          {t('addPart')}

        </Button>

      </div>



      {isLoading ? (

        <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>

      ) : !parts?.length ? (

        <Card className="p-8 text-center text-gray-500">{t('noPartsYet')}</Card>

      ) : (

        <div className="space-y-3">

          {parts.map((part) => (

            <Card key={part.id} className="p-4">

              <div className="flex flex-wrap items-center justify-between gap-4">

                <div>

                  <h3 className="font-semibold">{part.partName}</h3>

                  <p className="text-sm text-gray-600">

                    {part.make} {part.model} ({part.year}) — €{Number(part.price).toFixed(2)}

                  </p>

                  <p className="text-xs text-gray-500">{getConditionLabel(t, part.condition)}</p>

                </div>

                <div className="flex gap-2">

                  <Button size="sm" variant="ghost" onClick={() => navigate(`${lp('/parts')}/${part.id}`)}>

                    <EyeIcon className="h-4 w-4" />

                  </Button>

                  <Button size="sm" variant="ghost" onClick={() => setImagesPartId(part.id)}>

                    <PhotoIcon className="h-4 w-4" />

                  </Button>

                  <Button size="sm" variant="ghost" onClick={() => handleOpenModal(part)}>

                    <PencilIcon className="h-4 w-4" />

                  </Button>

                  <Button size="sm" variant="ghost" onClick={() => setDeletePartId(part.id)}>

                    <TrashIcon className="h-4 w-4 text-red-600" />

                  </Button>

                </div>

              </div>

            </Card>

          ))}

        </div>

      )}



      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingPart ? t('editPart') : t('addPart')} size="lg">

        <form onSubmit={handleSubmit} className="space-y-4">

          <p className="text-sm font-semibold text-gray-800 border-b pb-2">{t('partFormBasicInfo')}</p>

          <Input

            label={t('partName')}

            value={formData.partName}

            onChange={(e) => setFormData({ ...formData, partName: e.target.value })}

            required

          />

          <Input

            label={t('partOemNumber')}

            value={formData.oemNumber}

            onChange={(e) => setFormData({ ...formData, oemNumber: e.target.value })}

          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <Input

              label={t('partPriceField')}

              type="number"

              step="0.01"

              min="0"

              value={formData.price}

              onChange={(e) => setFormData({ ...formData, price: e.target.value })}

              required

            />

            <Select

              label={t('partConditionField')}

              value={formData.condition}

              onChange={(e) => setFormData({ ...formData, condition: e.target.value as PartCondition })}

              options={[

                { value: 'NEW', label: t('partConditionNew') },

                { value: 'USED', label: t('partConditionUsed') },

                { value: 'DAMAGED', label: t('partConditionDamaged') },

              ]}

            />

          </div>



          <p className="text-sm font-semibold text-gray-800 border-b pb-2 pt-2">{t('partFormVehicleInfo')}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <SearchableSelect

              label={t('carMake')}

              value={formData.make}

              onChange={(value) =>

                setFormData({

                  ...formData,

                  make: Array.isArray(value) ? value[0] : value,

                  model: '',

                })

              }

              options={makeOptionsList}

              allowCustom

              customOptionLabel={t('common.comboboxUseCustom')}

              required

            />

            <SearchableSelect

              label={t('model')}

              value={formData.model}

              onChange={(value) =>

                setFormData({ ...formData, model: Array.isArray(value) ? value[0] : value })

              }

              options={modelOptionsList}

              disabled={!formData.make?.trim()}

              allowCustom

              customOptionLabel={t('common.comboboxUseCustom')}

              required

            />

          </div>

          <Select

            label={t('yearField')}

            value={String(formData.year)}

            onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}

            options={partYears.map((y) => ({ value: String(y), label: String(y) }))}

          />



          <p className="text-sm font-semibold text-gray-800 border-b pb-2 pt-2">{t('partFormSpecsOptional')}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <Input

              label={t('colour')}

              value={formData.colour}

              onChange={(e) => setFormData({ ...formData, colour: e.target.value })}

            />

            <Input

              label={t('engineCapacity')}

              type="number"

              step="0.1"

              value={formData.engineCapacityL ?? ''}

              onChange={(e) =>

                setFormData({

                  ...formData,

                  engineCapacityL: e.target.value ? Number(e.target.value) : undefined,

                })

              }

            />

            <Input

              label={t('power')}

              type="number"

              value={formData.powerKW ?? ''}

              onChange={(e) =>

                setFormData({

                  ...formData,

                  powerKW: e.target.value ? Number(e.target.value) : undefined,

                })

              }

            />

            <Select

              label={t('gearboxType')}

              value={formData.gearbox || ''}

              onChange={(e) => setFormData({ ...formData, gearbox: e.target.value as PartCreate['gearbox'] })}

              options={[

                { value: '', label: '' },

                { value: 'MANUAL', label: t('manual') },

                { value: 'AUTOMATIC', label: t('automatic') },

              ]}

            />

            <Select

              label={t('fuelType')}

              value={formData.fuelType || ''}

              onChange={(e) => setFormData({ ...formData, fuelType: e.target.value as PartCreate['fuelType'] })}

              options={[

                { value: '', label: '' },

                ...FUEL_OPTIONS.map((fuel) => ({

                  value: fuel,

                  label: t(

                    fuel === 'PETROL'

                      ? 'petrol'

                      : fuel === 'PETROL_LPG'

                        ? 'petrolLpg'

                        : fuel === 'DIESEL'

                          ? 'diesel'

                          : fuel === 'ELECTRIC'

                            ? 'electric'

                            : fuel === 'HYBRID_HEV'

                              ? 'hybridHev'

                              : 'hybridPhev'

                  ),

                })),

              ]}

            />

          </div>



          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.description')}</label>

            <textarea

              value={formData.description}

              onChange={(e) => setFormData({ ...formData, description: e.target.value })}

              placeholder={t('partDescriptionPlaceholder')}

              rows={3}

              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"

            />

          </div>



          <div className="flex justify-end gap-2 pt-2">

            <Button type="button" variant="ghost" onClick={handleCloseModal}>{t('cancel')}</Button>

            <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>{t('save')}</Button>

          </div>

        </form>

      </Modal>



      {imagesPartId !== null && (

        <PartImagesManager partId={imagesPartId} isOpen onClose={() => setImagesPartId(null)} />

      )}



      <ConfirmDialog

        isOpen={deletePartId !== null}

        onClose={() => setDeletePartId(null)}

        onConfirm={() => deletePartId && deleteMutation.mutate(deletePartId)}

        title={t('delete')}

        message={t('confirmDeletePart')}

        confirmText={t('delete')}

        cancelText={t('cancel')}

        isLoading={deleteMutation.isPending}

      />

    </div>

  );

}


