import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, UtensilsCrossed, Coffee, Baby } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  fetchMainSections,
  createMainSection,
  updateMainSection,
  deleteMainSection,
  reorderMainSections,
} from '../store/slices/mainSectionsSlice';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { BilingualInput } from '../components/ui/BilingualField';
import { SortableMainSectionCard } from '../components/sortable/SortableMainSectionCard';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  nameAr: z.string().optional(),
  slug: z.string().optional(),
});

const SECTION_ICONS = { food: UtensilsCrossed, kids: Baby, beverages: Coffee };

export function MainSections() {
  const dispatch = useDispatch();
  const { items: sections, loading } = useSelector((s) => s.mainSections);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', nameAr: '', slug: '' },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    dispatch(fetchMainSections());
  }, [dispatch]);

  const onSubmit = async (data) => {
    try {
      const slug = data.slug || data.name?.toLowerCase().replace(/\s+/g, '-');
      const payload = { ...data, slug };
      if (editing) {
        await dispatch(updateMainSection({ id: editing.id, updates: payload })).unwrap();
        toast.success('Main section updated');
      } else {
        await dispatch(createMainSection(payload)).unwrap();
        toast.success('Main section created');
      }
      setModalOpen(false);
      setEditing(null);
      reset();
    } catch (e) {
      toast.error(e?.message || 'Failed');
    }
  };

  const openEdit = (section) => {
    setEditing(section);
    reset({ name: section.name, nameAr: section.nameAr || '', slug: section.slug || '' });
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await dispatch(deleteMainSection(deleteTarget.id)).unwrap();
      toast.success('Main section deleted');
      setDeleteTarget(null);
    } catch (e) {
      toast.error(e?.message || 'Failed');
    }
  };

  const getIcon = (slug) => {
    const key = slug?.toLowerCase().includes('food') ? 'food' : slug?.toLowerCase().includes('kid') ? 'kids' : 'beverages';
    return SECTION_ICONS[key] || UtensilsCrossed;
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ordered = [...sections];
    const oldIndex = ordered.findIndex((s) => s.id === active.id);
    const newIndex = ordered.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const [moved] = ordered.splice(oldIndex, 1);
    ordered.splice(newIndex, 0, moved);
    dispatch(reorderMainSections(ordered.map((s) => s.id)));
    toast.success('Main section order updated');
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold text-sayo-accent">Main Menu Sections</h1>
          <p className="text-sayo-creamMuted mt-1">Food menu, Kids menu, Beverages menu — the top-level navigation</p>
        </div>
        <Button onClick={() => { setEditing(null); reset(); setModalOpen(true); }}>
          <Plus className="w-5 h-5 mr-2 inline" />
          Add Section
        </Button>
      </div>

      <div>
        {loading ? (
          <p className="text-sayo-creamMuted py-8">Loading...</p>
        ) : sections.length === 0 ? (
          <p className="text-sayo-creamMuted py-8">No main sections yet. Add Food menu, Kids menu, and Beverages menu.</p>
        ) : (
          <>
            <p className="text-sm text-sayo-creamMuted mb-3">Showing {sections.length} sections</p>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {sections.map((section) => {
                    const Icon = getIcon(section.slug);
                    return (
                      <SortableMainSectionCard
                        key={section.id}
                        section={section}
                        Icon={Icon}
                        onEdit={() => openEdit(section)}
                        onDelete={() => setDeleteTarget(section)}
                      />
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          </>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); reset(); }} title={editing ? 'Edit Main Section' : 'Add Main Section'}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
            <BilingualInput
              label="Name"
              nameEn="name"
              nameAr="nameAr"
              errorEn={errors.name?.message}
              placeholderEn="e.g. Food menu"
              placeholderAr="e.g. قائمة الطعام"
              register={register}
            />
            <Input label="Slug (optional)" placeholder="auto-generated from name" {...register('slug')} />
          </div>
          <div className="modal-footer-glass shrink-0 p-6 pt-4 border-t border-sayo-border flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Main Section"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Classifications under it will be orphaned.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
