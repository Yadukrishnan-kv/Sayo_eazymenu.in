import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { TAG_ICON_OPTIONS, getTagIcon } from '../lib/tagIcons';
import toast from 'react-hot-toast';
import { fetchTags, createTag, updateTag, deleteTag } from '../store/slices/tagsSlice';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { BilingualInput } from '../components/ui/BilingualField';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  nameAr: z.string().optional(),
  slug: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  icon: z.string().optional(),
});

const DEFAULT_COLORS = ['#4ade80', '#f87171', '#60a5fa', '#c9a227', '#a78bfa', '#f472b6'];

export function FiltersTags() {
  const dispatch = useDispatch();
  const { items: tags, loading } = useSelector((s) => s.tags);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', nameAr: '', slug: '', color: '#c9a227', icon: 'default' },
  });

  useEffect(() => {
    dispatch(fetchTags());
  }, [dispatch]);

  const onSubmit = async (data) => {
    try {
      const slug = data.slug || data.name?.toLowerCase().replace(/\s+/g, '-');
      const payload = { ...data, slug };
      if (editing) {
        await dispatch(updateTag({ id: editing.id, updates: payload })).unwrap();
        toast.success('Tag updated');
      } else {
        await dispatch(createTag(payload)).unwrap();
        toast.success('Tag created');
      }
      setModalOpen(false);
      setEditing(null);
      reset();
    } catch (e) {
      toast.error(e?.message || 'Failed');
    }
  };

  const openEdit = (tag) => {
    setEditing(tag);
    reset({ name: tag.name, nameAr: tag.nameAr || '', slug: tag.slug || '', color: tag.color || '#c9a227', icon: tag.icon || 'default' });
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await dispatch(deleteTag(deleteTarget.id)).unwrap();
      toast.success('Tag deleted');
      setDeleteTarget(null);
    } catch (e) {
      toast.error(e?.message || 'Failed');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold text-sayo-accent">Filters & Tags</h1>
          <p className="text-sayo-creamMuted mt-1">Manage tags for filtering menu items</p>
        </div>
        <Button onClick={() => { setEditing(null); reset({ name: '', nameAr: '', slug: '', color: '#c9a227', icon: 'default' }); setModalOpen(true); }}>
          <Plus className="w-5 h-5 mr-2 inline" />
          Add Tag
        </Button>
      </div>

      <div>
        {loading ? (
          <p className="text-sayo-creamMuted py-8">Loading...</p>
        ) : tags.length === 0 ? (
          <p className="text-sayo-creamMuted py-8">No tags yet. Add one to get started.</p>
        ) : (
          <>
            <p className="text-sm text-sayo-creamMuted mb-3">Showing {tags.length} tags</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tags.map((tag) => {
              const TagIcon = getTagIcon(tag);
              return (
              <div
                key={tag.id}
                className="flex items-center gap-4 py-4 px-4 rounded-lg border border-sayo-borderSubtle hover:bg-sayo-surface/50 transition-colors group"
              >
                <div
                  className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: `${tag.color || '#c9a227'}30` }}
                  title={tag.name}
                >
                  <TagIcon className="w-5 h-5" style={{ color: tag.color || '#c9a227' }} aria-hidden />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sayo-cream">{tag.name}</p>
                  <p className="text-sm text-sayo-creamMuted">{tag.slug}</p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button type="button" onClick={() => openEdit(tag)} className="btn-ghost p-2" aria-label={`Edit ${tag.name}`}>
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => setDeleteTarget(tag)} className="btn-ghost p-2 text-red-400 hover:text-red-300" aria-label={`Delete ${tag.name}`}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
            })}
          </div>
          </>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); reset(); }}
        title={editing ? 'Edit Tag' : 'Add Tag'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
          <BilingualInput
            label="Name"
            nameEn="name"
            nameAr="nameAr"
            errorEn={errors.name?.message}
            placeholderEn="e.g. Vegetarian"
            placeholderAr="e.g. نباتي"
            register={register}
          />
          <Input label="Slug (optional)" placeholder="auto-generated from name" {...register('slug')} />
          <div>
            <label className="block text-sm font-medium text-sayo-creamMuted mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {TAG_ICON_OPTIONS.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setValue('icon', key)}
                  className={`p-2.5 rounded-full border-2 transition-colors ${
                    watch('icon') === key
                      ? 'border-sayo-accent bg-sayo-accent/10 text-sayo-accent'
                      : 'border-sayo-border hover:border-sayo-accent/50 text-sayo-creamMuted'
                  }`}
                  title={label}
                  aria-label={label}
                >
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-sayo-creamMuted mb-2">Color</label>
            <div className="flex gap-2 mb-2">
              {DEFAULT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setValue('color', c)}
                  className="w-8 h-8 rounded-full border-2 border-transparent hover:border-sayo-accent focus:border-sayo-accent transition-colors"
                  style={{ backgroundColor: c }}
                  aria-label={`Use color ${c}`}
                />
              ))}
            </div>
            <input
              type="color"
              className="h-10 w-full p-1 rounded cursor-pointer bg-sayo-surface border border-sayo-border"
              {...register('color')}
            />
            {errors.color && <p className="mt-1 text-sm text-red-400">{errors.color.message}</p>}
          </div>
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
        title="Delete Tag"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete"
      />
    </div>
  );
}
