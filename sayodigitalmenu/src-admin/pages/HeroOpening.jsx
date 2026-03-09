import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Film, Image } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchSettings, updateSettings } from '../store/slices/settingsSlice';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { BilingualInput, BilingualTextarea } from '../components/ui/BilingualField';

const defaultDescription = "SAYO is a name inspired by the initials of its visionary founders, and in Japanese, it beautifully means 'Born at Night.' Just as the night gives birth to new possibilities, SAYO represents a bold, fresh beginning in the culinary landscape of Jubail, KSA.";

const schema = z.object({
  openingVideoUrl: z.string().optional(),
  openingImageUrl: z.string().optional(),
  openingDescription: z.string().optional(),
  openingDescriptionAr: z.string().optional(),
  openingTagline: z.string().optional(),
  openingTaglineAr: z.string().optional(),
  openingButtonText: z.string().optional(),
  openingButtonTextAr: z.string().optional(),
  heroVideoUrl: z.string().optional(),
  heroImageUrl: z.string().optional(),
  heroDescription: z.string().optional(),
  heroDescriptionAr: z.string().optional(),
  heroTagline: z.string().optional(),
  heroTaglineAr: z.string().optional(),
});

const defaultValues = {
  openingVideoUrl: '',
  openingImageUrl: '',
  openingDescription: defaultDescription,
  openingDescriptionAr: '',
  openingTagline: 'Journey through Asian Cuisine',
  openingTaglineAr: 'رحلة عبر المطبخ الأسيوي',
  openingButtonText: 'Continue to Menu',
  openingButtonTextAr: 'انتقل إلى القائمة',
  heroVideoUrl: '',
  heroImageUrl: '',
  heroDescription: defaultDescription,
  heroDescriptionAr: '',
  heroTagline: 'PAN ASIAN CUISINE',
  heroTaglineAr: 'المطبخ الآسيوي',
};

export function HeroOpening() {
  const dispatch = useDispatch();
  const { data: settings, loading } = useSelector((s) => s.settings);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    if (Object.keys(settings).length) {
      reset({
        ...defaultValues,
        ...settings,
      });
    }
  }, [settings, reset]);

  const onSubmit = async (data) => {
    try {
      await dispatch(updateSettings(data)).unwrap();
      toast.success('Hero & opening content saved');
    } catch (e) {
      toast.error(e?.message || 'Failed to save');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-sayo-accent">Hero & Opening</h1>
        <p className="text-sayo-creamMuted mt-1">Manage the opening splash screen and hero section content for your public menu</p>
      </div>

      <div className="max-w-2xl space-y-8">
        {loading ? (
          <p className="text-sayo-creamMuted py-8">Loading...</p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Opening screen */}
            <div className="rounded-lg border border-sayo-borderSubtle p-6 space-y-4">
              <h2 className="font-display text-xl font-semibold text-sayo-cream flex items-center gap-2">
                <Film className="w-5 h-5 text-sayo-accent" />
                Opening Screen (Splash)
              </h2>
              <p className="text-sm text-sayo-creamMuted">The intro screen visitors see first, with video/image background and &quot;Continue to Menu&quot; button.</p>
              <Input
                label="Opening Video URL"
                placeholder="https://... (MP4, WebM)"
                {...register('openingVideoUrl')}
              />
              <Input
                label="Opening Image URL (fallback if no video)"
                placeholder="https://... (JPG, PNG)"
                {...register('openingImageUrl')}
              />
              <BilingualTextarea
                label="Description"
                nameEn="openingDescription"
                nameAr="openingDescriptionAr"
                placeholderEn="Restaurant story and brand message"
                placeholderAr="قصة المطعم والعلامة التجارية"
                register={register}
              />
              <BilingualInput
                label="Tagline (short text by logo)"
                nameEn="openingTagline"
                nameAr="openingTaglineAr"
                placeholderEn="e.g. Journey through Asian Cuisine"
                placeholderAr="e.g. رحلة عبر المطبخ الأسيوي"
                register={register}
              />
              <BilingualInput
                label="Button Text"
                nameEn="openingButtonText"
                nameAr="openingButtonTextAr"
                placeholderEn="Continue to Menu"
                placeholderAr="انتقل إلى القائمة"
                register={register}
              />
            </div>

            {/* Hero section */}
            <div className="rounded-lg border border-sayo-borderSubtle p-6 space-y-4">
              <h2 className="font-display text-xl font-semibold text-sayo-cream flex items-center gap-2">
                <Image className="w-5 h-5 text-sayo-accent" />
                Hero Section
              </h2>
              <p className="text-sm text-sayo-creamMuted">The hero area at the top of the menu page, with background video/image and overlay content.</p>
              <Input
                label="Hero Video URL"
                placeholder="https://... (MP4, WebM)"
                {...register('heroVideoUrl')}
              />
              <Input
                label="Hero Image URL (fallback if no video)"
                placeholder="https://... (JPG, PNG)"
                {...register('heroImageUrl')}
              />
              <BilingualTextarea
                label="Description"
                nameEn="heroDescription"
                nameAr="heroDescriptionAr"
                placeholderEn="Restaurant story and brand message"
                placeholderAr="قصة المطعم والعلامة التجارية"
                register={register}
              />
              <BilingualInput
                label="Tagline"
                nameEn="heroTagline"
                nameAr="heroTaglineAr"
                placeholderEn="e.g. PAN ASIAN CUISINE"
                placeholderAr="e.g. المطبخ الآسيوي"
                register={register}
              />
            </div>

            <div className="pt-4">
              <Button type="submit">Save Hero & Opening</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
