import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, UtensilsCrossed, Coffee, Baby } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  fetchMainSections,
  createMainSection,
  updateMainSection,
  deleteMainSection,
} from '../store/slices/mainSectionsSlice';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { BilingualInput } from '../components/ui/BilingualField';

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sections.map((section) => {
            const Icon = getIcon(section.slug);
            return (
              <div
                key={section.id}
                className="flex items-center gap-4 py-4 px-4 rounded-lg border border-sayo-borderSubtle hover:bg-sayo-surface/50 transition-colors group"
              >
                <div className="p-3 rounded-lg bg-[rgba(212,165,116,0.12)] text-sayo-accent">
                  <Icon className="w-8 h-8" aria-hidden />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sayo-cream">{section.name}</p>
                  <p className="text-sm text-sayo-creamMuted">{section.slug}</p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button type="button" onClick={() => openEdit(section)} className="btn-ghost p-2" aria-label={`Edit ${section.name}`}>
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => setDeleteTarget(section)} className="btn-ghost p-2 text-red-400 hover:text-red-300" aria-label={`Delete ${section.name}`}>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
            </div>
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
