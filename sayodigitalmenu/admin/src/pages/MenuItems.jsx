import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, Search, Upload, X, UtensilsCrossed } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  fetchMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../store/slices/menuItemsSlice';
import { fetchMainSections } from '../store/slices/mainSectionsSlice';
import { fetchClassifications } from '../store/slices/classificationsSlice';
import { fetchTags } from '../store/slices/tagsSlice';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { BilingualInput, BilingualTextarea } from '../components/ui/BilingualField';
import { Toggle } from '../components/ui/Toggle';
import { getTagIcon } from '../lib/tagIcons';

const SPICE_LEVELS = [
  { value: 'mild', label: 'Mild' },
  { value: 'medium', label: 'Medium' },
  { value: 'spicy', label: 'Spicy' },
];

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  nameAr: z.string().optional(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be positive'),
  mainSectionId: z.string().min(1, 'Select a main section'),
  classificationId: z.string().min(1, 'Select a classification'),
  imageUrl: z.string().optional(),
  spiceLevel: z.string().optional(),
  isActive: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export function MenuItems() {
  const dispatch = useDispatch();
  const { items: menuItems, loading } = useSelector((s) => s.menuItems);
  const { items: mainSections } = useSelector((s) => s.mainSections);
  const { items: classifications } = useSelector((s) => s.classifications);
  const { items: tags } = useSelector((s) => s.tags);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [classificationFilter, setClassificationFilter] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const imageInputRef = useRef(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      nameAr: '',
      description: '',
      descriptionAr: '',
      price: 0,
      mainSectionId: '',
      classificationId: '',
      imageUrl: '',
      spiceLevel: 'mild',
      isActive: true,
      tags: [],
    },
  });

  const selectedMainSection = watch('mainSectionId');
  const selectedTags = watch('tags') || [];
  const imageUrl = watch('imageUrl');

  const classificationsForSection = selectedMainSection
    ? classifications.filter((c) => c.mainSectionId === selectedMainSection).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : [];

  useEffect(() => {
    dispatch(fetchMenuItems());
    dispatch(fetchMainSections());
    dispatch(fetchClassifications());
    dispatch(fetchTags());
  }, [dispatch]);

  useEffect(() => {
    if (!selectedMainSection) setValue('classificationId', '');
  }, [selectedMainSection, setValue]);

  useEffect(() => {
    setImagePreview(imageUrl || null);
  }, [imageUrl]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        mainSectionId: data.mainSectionId,
        classificationId: data.classificationId,
        tags: data.tags || [],
        spiceLevel: data.spiceLevel || 'mild',
        isActive: data.isActive !== false,
      };
      if (editing) {
        await dispatch(updateMenuItem({ id: editing.id, updates: payload })).unwrap();
        toast.success('Menu item updated');
      } else {
        await dispatch(createMenuItem(payload)).unwrap();
        toast.success('Menu item created');
      }
      setModalOpen(false);
      setEditing(null);
      setImagePreview(null);
      reset();
    } catch (e) {
      toast.error(e?.message || 'Failed');
    }
  };

  const openEdit = (item) => {
    setEditing(item);
    setImagePreview(item.imageUrl || null);
    reset({
      name: item.name,
      nameAr: item.nameAr || '',
      description: item.description || '',
      descriptionAr: item.descriptionAr || '',
      price: item.price ?? 0,
      mainSectionId: item.mainSectionId || '',
      classificationId: item.classificationId || '',
      imageUrl: item.imageUrl || '',
      spiceLevel: item.spiceLevel || 'mild',
      isActive: item.isActive !== false,
      tags: item.tags || [],
    });
    setModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      setValue('imageUrl', dataUrl);
      setImagePreview(dataUrl);
      toast.success('Image uploaded');
    } catch {
      toast.error('Failed to upload image');
    }
    e.target.value = '';
  };

  const clearImage = () => {
    setValue('imageUrl', '');
    setImagePreview(null);
  };

  const toggleTag = (tagId) => {
    const next = selectedTags.includes(tagId)
      ? selectedTags.filter((t) => t !== tagId)
      : [...selectedTags, tagId];
    setValue('tags', next);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await dispatch(deleteMenuItem(deleteTarget.id)).unwrap();
      toast.success('Menu item deleted');
      setDeleteTarget(null);
    } catch (e) {
      toast.error(e?.message || 'Failed');
    }
  };

  const toggleActive = async (item) => {
    try {
      await dispatch(updateMenuItem({ id: item.id, updates: { isActive: !item.isActive } })).unwrap();
      toast.success(item.isActive ? 'Item hidden from menu' : 'Item shown on menu');
    } catch (e) {
      toast.error(e?.message || 'Failed');
    }
  };

  const filtered = menuItems.filter((item) => {
    const matchSearch = !search || item.name?.toLowerCase().includes(search.toLowerCase());
    const matchSection = !sectionFilter || item.mainSectionId === sectionFilter;
    const matchClass = !classificationFilter || item.classificationId === classificationFilter;
    return matchSearch && matchSection && matchClass;
  });

  const getMainSectionName = (id) => mainSections.find((s) => s.id === id)?.name || '—';
  const getClassificationName = (id) => classifications.find((c) => c.id === id)?.name || '—';

  return (
    <div>
      <div className="flex flex-col gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold text-sayo-accent">Menu Items</h1>
          <p className="text-sayo-creamMuted mt-1">Add dishes under Main Section → Classification (e.g. Food menu → Soups)</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sayo-muted" aria-hidden />
            <input
              type="search"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
              aria-label="Search menu items"
            />
          </div>
          <select
            value={sectionFilter}
            onChange={(e) => { setSectionFilter(e.target.value); setClassificationFilter(''); }}
            className="input-field max-w-[180px]"
            aria-label="Filter by main section"
          >
            <option value="">All sections</option>
            {mainSections.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select
            value={classificationFilter}
            onChange={(e) => setClassificationFilter(e.target.value)}
            className="input-field max-w-[180px]"
            aria-label="Filter by classification"
          >
            <option value="">All classifications</option>
            {(sectionFilter ? classifications.filter((c) => c.mainSectionId === sectionFilter) : classifications).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <Button onClick={() => { setEditing(null); setImagePreview(null); reset(); setModalOpen(true); }}>
            <Plus className="w-5 h-5 mr-2 inline" />
            Add Item
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <p className="text-sayo-creamMuted py-8">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sayo-creamMuted py-8">No menu items found</p>
        ) : (
          <>
            <p className="text-sm text-sayo-creamMuted mb-3">Showing {filtered.length} of {menuItems.length} items</p>
            <table className="w-full rounded-lg border border-sayo-borderSubtle overflow-hidden">
            <thead>
              <tr className="bg-sayo-surface border-b border-sayo-border text-left">
                <th className="py-3 px-4 text-sayo-creamMuted font-medium w-16">Image</th>
                <th className="py-3 px-4 text-sayo-creamMuted font-medium">Name</th>
                <th className="py-3 px-4 text-sayo-creamMuted font-medium">Section</th>
                <th className="py-3 px-4 text-sayo-creamMuted font-medium">Classification</th>
                <th className="py-3 px-4 text-sayo-creamMuted font-medium">Price</th>
                <th className="py-3 px-4 text-sayo-creamMuted font-medium">Status</th>
                <th className="py-3 px-4 text-sayo-creamMuted font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className={`border-b border-sayo-borderSubtle hover:bg-sayo-surfaceHover/50 last:border-b-0 ${item.isActive === false ? 'opacity-60' : ''}`}>
                  <td className="py-4 px-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-sayo-surface border border-sayo-borderSubtle shrink-0 flex items-center justify-center">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <UtensilsCrossed className="w-6 h-6 text-sayo-creamMuted/50" aria-hidden />
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-medium text-sayo-cream">{item.name}</p>
                  </td>
                  <td className="py-4 px-4 text-sayo-creamMuted">{getMainSectionName(item.mainSectionId)}</td>
                  <td className="py-4 px-4 text-sayo-creamMuted">{getClassificationName(item.classificationId)}</td>
                  <td className="py-4 px-4 text-sayo-accent">{item.price} SAR</td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        item.isActive !== false
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {item.isActive !== false ? 'On menu' : 'Off menu'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={() => openEdit(item)} className="btn-ghost p-2" aria-label={`Edit ${item.name}`}>
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => setDeleteTarget(item)} className="btn-ghost p-2 text-red-400 hover:text-red-300" aria-label={`Delete ${item.name}`}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); setImagePreview(null); reset(); }}
        title={editing ? 'Edit Menu Item' : 'Add Menu Item'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
          <div className="rounded-lg border border-sayo-border p-4 bg-sayo-surface/50 space-y-4">
            <p className="text-sm font-medium text-sayo-cream">Where does this item go?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-sayo-creamMuted mb-1.5">1. Main Section</label>
                <select
                  className="input-field"
                  {...register('mainSectionId')}
                  onChange={(e) => {
                    setValue('mainSectionId', e.target.value);
                    setValue('classificationId', '');
                  }}
                  aria-label="Select main section"
                >
                  <option value="">Select section...</option>
                  {mainSections.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                {errors.mainSectionId && <p className="mt-1 text-sm text-red-400">{errors.mainSectionId.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-sayo-creamMuted mb-1.5">2. Classification</label>
                <select
                  className="input-field"
                  {...register('classificationId')}
                  disabled={!selectedMainSection}
                  aria-label="Select classification"
                >
                  <option value="">
                    {selectedMainSection ? 'Select classification...' : 'Select section first'}
                  </option>
                  {classificationsForSection.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.classificationId && <p className="mt-1 text-sm text-red-400">{errors.classificationId.message}</p>}
              </div>
            </div>
          </div>

          <BilingualInput
            label="Dish Name"
            nameEn="name"
            nameAr="nameAr"
            errorEn={errors.name?.message}
            placeholderEn="e.g. Tom Yum Soup - With Chicken"
            placeholderAr="e.g. شوربة توم يام - مع الدجاج"
            register={register}
          />
          <BilingualTextarea
            label="Description"
            nameEn="description"
            nameAr="descriptionAr"
            placeholderEn="A spicy and tangy Thai soup..."
            placeholderAr="شوربة تايلاندية حارة وحامضة..."
            register={register}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Price (SAR)" type="number" step="0.01" error={errors.price?.message} {...register('price')} />
            <div>
              <label className="block text-sm font-medium text-sayo-creamMuted mb-1.5">Spice Level</label>
              <select className="input-field" {...register('spiceLevel')} aria-label="Spice level">
                {SPICE_LEVELS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-sayo-creamMuted mb-1.5">Image</label>
            <div className="flex gap-4 items-start">
              <div className="shrink-0">
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-lg border border-sayo-border" />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500/80 text-white hover:bg-red-500"
                      aria-label="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    className="w-24 h-24 rounded-lg border-2 border-dashed border-sayo-border flex items-center justify-center cursor-pointer hover:border-sayo-accent transition-colors"
                  >
                    <Upload className="w-8 h-8 text-sayo-muted" />
                  </div>
                )}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  aria-label="Upload image"
                />
              </div>
              <div className="flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="btn-secondary text-sm flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {imagePreview ? 'Change image' : 'Upload image'}
                </button>
                <p className="text-xs text-sayo-creamMuted mt-1">PNG, JPG up to 5MB</p>
              </div>
            </div>
            <input type="hidden" {...register('imageUrl')} />
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg border border-sayo-border bg-sayo-surface/50">
            <Toggle
              checked={watch('isActive')}
              onChange={(v) => setValue('isActive', v)}
              aria-label="Show on menu"
            />
            <label className="text-sm text-sayo-cream cursor-pointer" onClick={() => setValue('isActive', !watch('isActive'))}>
              Show on menu (toggle off to temporarily hide this item)
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-sayo-creamMuted mb-2">Tags (Vegetarian, Spicy, etc.)</label>
            <div className="flex flex-wrap gap-3">
              {tags.map((tag) => {
                const TagIcon = getTagIcon(tag);
                const isSelected = selectedTags.includes(tag.slug || tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.slug || tag.id)}
                    aria-label={`${tag.name}${isSelected ? ' (selected)' : ''}`}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-colors min-w-[72px] ${
                      isSelected
                        ? 'border-sayo-accent bg-sayo-accent/10'
                        : 'border-sayo-border hover:border-sayo-accent/50'
                    }`}
                  >
                    <TagIcon
                      className="w-6 h-6 shrink-0"
                      style={{ color: tag.color || '#c9a227' }}
                    />
                    <span className="text-xs font-medium text-sayo-cream truncate w-full text-center">
                      {tag.name}
                    </span>
                  </button>
                );
              })}
            </div>
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
        title="Delete Menu Item"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete"
      />
    </div>
  );
}
