import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  fetchClassifications,
  createClassification,
  updateClassification,
  deleteClassification,
  reorderClassifications,
} from '../store/slices/classificationsSlice';
import { fetchMainSections } from '../store/slices/mainSectionsSlice';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { BilingualInput } from '../components/ui/BilingualField';
import { SortableClassificationRow } from '../components/sortable/SortableClassificationRow';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  nameAr: z.string().optional(),
  mainSectionId: z.string().min(1, 'Select a main section'),
});

export function Classifications() {
  const dispatch = useDispatch();
  const { items: classifications = [], loading } = useSelector((s) => s.classifications);
  const { items: mainSections = [] } = useSelector((s) => s.mainSections);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [sectionFilter, setSectionFilter] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', nameAr: '', mainSectionId: '' },
  });

  useEffect(() => {
    dispatch(fetchClassifications());
    dispatch(fetchMainSections());
  }, [dispatch]);

  const onSubmit = async (data) => {
    try {
      if (editing) {
        await dispatch(updateClassification({ id: editing.id, updates: data })).unwrap();
        toast.success('Classification updated');
      } else {
        await dispatch(createClassification(data)).unwrap();
        toast.success('Classification created');
      }
      setModalOpen(false);
      setEditing(null);
      reset();
    } catch (e) {
      toast.error(e?.message || 'Failed');
    }
  };

  const openEdit = (classification) => {
    setEditing(classification);
    reset({ name: classification.name, nameAr: classification.nameAr || '', mainSectionId: classification.mainSectionId });
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await dispatch(deleteClassification(deleteTarget.id)).unwrap();
      toast.success('Classification deleted');
      setDeleteTarget(null);
    } catch (e) {
      toast.error(e?.message || 'Failed');
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const filtered = getFilteredClassifications();
    const oldIndex = filtered.findIndex((c) => c.id === active.id);
    const newIndex = filtered.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(filtered, oldIndex, newIndex);
    const mainSectionId = sectionFilter || mainSections[0]?.id;
    if (mainSectionId) {
      dispatch(reorderClassifications({ mainSectionId, orderedIds: reordered.map((c) => c.id) }));
      toast.success('Order updated');
    }
  };

  const getFilteredClassifications = () => {
    if (!sectionFilter) return classifications;
    return classifications.filter((c) => c.mainSectionId === sectionFilter).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  };

  const filtered = getFilteredClassifications();

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold text-sayo-accent">Classifications</h1>
          <p className="text-sayo-creamMuted mt-1">Soups, Salads, Sushi, Mains, Desserts — filters inside each main section</p>
        </div>
        <div className="flex gap-3">
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="input-field max-w-[200px]"
            aria-label="Filter by main section"
          >
            <option value="">All sections</option>
            {mainSections.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <Button onClick={() => { setEditing(null); reset({ name: '', nameAr: '', mainSectionId: sectionFilter || '' }); setModalOpen(true); }} className="whitespace-nowrap">
            <Plus className="w-5 h-5 mr-2 inline" />
            Add Classification
          </Button>
        </div>
      </div>

      <div>
        {loading ? (
          <p className="text-sayo-creamMuted py-8">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sayo-creamMuted py-8">
            {sectionFilter ? 'No classifications in this section.' : 'No classifications yet.'} Add Soups, Salads, Sushi, Mains, Desserts, etc.
          </p>
        ) : (
          <>
            <p className="text-sm text-sayo-creamMuted mb-3">Showing {filtered.length} of {classifications.length} classifications</p>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={filtered.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              <ul className="rounded-lg border border-sayo-borderSubtle overflow-hidden divide-y divide-sayo-borderSubtle">
                {filtered.map((classification) => (
                  <SortableClassificationRow
                    key={classification.id}
                    classification={classification}
                    mainSectionName={mainSections.find((s) => s.id === classification.mainSectionId)?.name}
                    onEdit={() => openEdit(classification)}
                    onDelete={() => setDeleteTarget(classification)}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
          </>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); reset(); }} title={editing ? 'Edit Classification' : 'Add Classification'}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
            <Select
              label="Main Section"
              error={errors.mainSectionId?.message}
              options={mainSections.map((s) => ({ value: s.id, label: s.name }))}
              {...register('mainSectionId')}
            />
            <BilingualInput
              label="Classification Name"
              nameEn="name"
              nameAr="nameAr"
              errorEn={errors.name?.message}
              placeholderEn="e.g. Soups, Salads, Mains"
              placeholderAr="e.g. الشوربات، السلطات"
              register={register}
            />
          </div>
          <div className="modal-footer-glass shrink-0 p-6 pt-4 border-t border-sayo-border flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} className="whitespace-nowrap">Cancel</Button>
            <button type="submit" className="btn-primary whitespace-nowrap">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Classification"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Menu items in this classification will need to be reassigned.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
