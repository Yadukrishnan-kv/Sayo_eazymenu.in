import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { fetchSettings, updateSettings } from '../store/slices/settingsSlice';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { BilingualInput } from '../components/ui/BilingualField';

const schema = z.object({
  restaurantName: z.string().min(1, 'Restaurant name is required'),
  restaurantNameAr: z.string().optional(),
  tagline: z.string().optional(),
  taglineAr: z.string().optional(),
  currency: z.string().min(1, 'Currency is required'),
  menuPublicUrl: z.string().refine((v) => !v || /^https?:\/\/.+/.test(v), 'Invalid URL').optional(),
});

export function Settings() {
  const dispatch = useDispatch();
  const { data: settings, loading } = useSelector((s) => s.settings);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      restaurantName: 'SAYO',
      restaurantNameAr: '',
      tagline: 'Pan Asian Restaurant',
      taglineAr: '',
      currency: 'SAR',
      menuPublicUrl: '',
    },
  });

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    if (Object.keys(settings).length) {
      reset(settings);
    }
  }, [settings, reset]);

  const onSubmit = async (data) => {
    try {
      await dispatch(updateSettings(data)).unwrap();
      toast.success('Settings saved');
    } catch (e) {
      toast.error(e?.message || 'Failed to save');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-sayo-accent">Settings</h1>
        <p className="text-sayo-creamMuted mt-1">Configure your menu and restaurant details</p>
      </div>

      <div className="max-w-2xl">
        {loading ? (
          <p className="text-sayo-creamMuted py-8">Loading...</p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-lg border border-sayo-borderSubtle p-6">
            <BilingualInput
              label="Restaurant Name"
              nameEn="restaurantName"
              nameAr="restaurantNameAr"
              errorEn={errors.restaurantName?.message}
              placeholderEn="e.g. SAYO"
              placeholderAr="e.g. سايو"
              register={register}
            />
            <BilingualInput
              label="Tagline"
              nameEn="tagline"
              nameAr="taglineAr"
              placeholderEn="e.g. Pan Asian Restaurant"
              placeholderAr="e.g. مطعم آسيوي"
              register={register}
            />
            <Input
              label="Currency"
              placeholder="e.g. SAR, USD"
              error={errors.currency?.message}
              {...register('currency')}
            />
            <Input
              label="Public Menu URL"
              placeholder="https://..."
              error={errors.menuPublicUrl?.message}
              {...register('menuPublicUrl')}
            />
            <div className="pt-4">
              <Button type="submit">Save Settings</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
