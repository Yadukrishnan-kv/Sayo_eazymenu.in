import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchCountries, createCountry, updateCountry, deleteCountry } from '../store/slices/countriesSlice';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { BilingualInput } from '../components/ui/BilingualField';

const schema = z.object({
  code: z.string().min(1, 'Code is required').max(10, 'Code too long'),
  name: z.string().min(1, 'Name is required'),
  nameAr: z.string().optional(),
  flagImageUrl: z.string().optional(),
});

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export function Countries() {
  const dispatch = useDispatch();
  const { items: countries, loading } = useSelector((s) => s.countries);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const flagInputRef = useRef(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { code: '', name: '', nameAr: '', flagImageUrl: '' },
  });

  const flagImageUrl = watch('flagImageUrl');

  useEffect(() => {
    dispatch(fetchCountries());
  }, [dispatch]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        code: (data.code || '').trim().toUpperCase(),
        name: data.name,
        nameAr: data.nameAr || undefined,
        flagImageUrl: data.flagImageUrl || undefined,
      };
      if (editing) {
        await dispatch(updateCountry({ id: editing.id, updates: payload })).unwrap();
        toast.success('Country updated');
      } else {
        await dispatch(createCountry(payload)).unwrap();
        toast.success('Country created');
      }
      setModalOpen(false);
      setEditing(null);
      reset();
    } catch (e) {
      toast.error(e?.message || 'Failed');
    }
  };

  const openEdit = (country) => {
    setEditing(country);
    reset({
      code: country.code || '',
      name: country.name || '',
      nameAr: country.nameAr || '',
      flagImageUrl: country.flagImageUrl || '',
    });
    setModalOpen(true);
  };

  const handleFlagUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file?.type.startsWith('image/')) {
      toast.error('Please select an image file');
      e.target.value = '';
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      setValue('flagImageUrl', dataUrl);
      toast.success('Flag image added');
    } catch {
      toast.error('Failed to upload image');
    }
    e.target.value = '';
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await dispatch(deleteCountry(deleteTarget.id)).unwrap();
      toast.success('Country deleted');
      setDeleteTarget(null);
    } catch (e) {
      toast.error(e?.message || 'Failed');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold text-sayo-accent">Countries</h1>
          <p className="text-sayo-creamMuted mt-1">Master data: country name and flag for menu items</p>
        </div>
        <Button onClick={() => { setEditing(null); reset({ code: '', name: '', nameAr: '', flagImageUrl: '' }); setModalOpen(true); }}>
          <Plus className="w-5 h-5 mr-2 inline" />
          Add Country
        </Button>
      </div>

      <div>
        {loading ? (
          <p className="text-sayo-creamMuted py-8">Loading...</p>
        ) : countries.length === 0 ? (
          <p className="text-sayo-creamMuted py-8">No countries yet. Add one to get started.</p>
        ) : (
          <>
            <p className="text-sm text-sayo-creamMuted mb-3">Showing {countries.length} countries</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {countries.map((country) => (
                <div
                  key={country.id}
                  className="flex items-center gap-4 py-4 px-4 rounded-lg border border-sayo-borderSubtle hover:bg-sayo-surface/50 transition-colors group"
                >
                  <div className="w-12 h-8 rounded overflow-hidden bg-sayo-surface border border-sayo-border shrink-0 flex items-center justify-center">
                    {country.flagImageUrl ? (
                      <img src={country.flagImageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sayo-creamMuted text-xs">No flag</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sayo-cream">{country.name}</p>
                    <p className="text-sm text-sayo-creamMuted">{country.code}</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={() => openEdit(country)} className="btn-ghost p-2" aria-label={"Edit " + country.name}>
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => setDeleteTarget(country)} className="btn-ghost p-2 text-red-400 hover:text-red-300" aria-label={"Delete " + country.name}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); reset(); }}
        title={editing ? 'Edit Country' : 'Add Country'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
            <Input
              label="Code (e.g. SA, US)"
              placeholder="SA"
              error={errors.code?.message}
              {...register('code')}
            />
            <BilingualInput
              label="Name"
              nameEn="name"
              nameAr="nameAr"
              errorEn={errors.name?.message}
              placeholderEn="e.g. Saudi Arabia"
              placeholderAr="e.g. المملكة العربية السعودية"
              register={register}
            />
            <div>
              <label className="block text-sm font-medium text-sayo-creamMuted mb-1.5">Flag image (optional)</label>
              <div className="flex items-center gap-3">
                {flagImageUrl ? (
                  <div className="relative group">
                    <img src={flagImageUrl} alt="" className="w-16 h-10 object-cover rounded border border-sayo-border" />
                    <button
                      type="button"
                      onClick={() => setValue('flagImageUrl', '')}
                      className="absolute -top-1 -right-1 p-1 rounded-full bg-red-500/90 text-white hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove flag"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : null}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => flagInputRef.current?.click()}
                  onKeyDown={(e) => e.key === 'Enter' && flagInputRef.current?.click()}
                  className="w-16 h-10 rounded border-2 border-dashed border-sayo-border flex items-center justify-center cursor-pointer hover:border-sayo-accent transition-colors shrink-0"
                  aria-label="Upload flag"
                >
                  <Upload className="w-5 h-5 text-sayo-muted" />
                </div>
                <input
                  ref={flagInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFlagUpload}
                  className="hidden"
                  aria-label="Upload flag image"
                />
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
        title="Delete Country"
        message={"Are you sure you want to delete \"" + (deleteTarget?.name || '') + "\"?"}
        confirmLabel="Delete"
      />
    </div>
  );
}
