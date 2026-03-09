import { useTranslation } from 'react-i18next'
import { useLanguage } from '../contexts/LanguageContext'
import './Hero.css'

const LOGOS = { en: '/assets/Logo_lgt_EN.svg', ar: '/assets/Logo_lgt_AR.svg' } as const

interface HeroProps {
  onOpenCustomerForm?: () => void
}

export function Hero({ onOpenCustomerForm }: HeroProps) {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const logoSrc = LOGOS[language === 'ar' ? 'ar' : 'en']

  return (
    <section className="hero" aria-label={t('hero.title')}>
      <video
        className="hero__video"
        src="/assets/intro-video.mp4"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden
      />
      <div className="hero__overlay" aria-hidden />
      <div className="hero__inner">
        <div className="hero__logo-wrap">
          <img
            src={logoSrc}
            alt="SAYO"
            className="hero__logo"
            width={180}
            height={86}
          />
        </div>
        <p className="hero__intro">{t('hero.description')}</p>
        {t('hero.tagline') && (
          <p className="hero__tagline">{t('hero.tagline')}</p>
        )}
        {onOpenCustomerForm && (
          <button
            type="button"
            className="hero__cta-btn"
            onClick={onOpenCustomerForm}
          >
            Join our guest list
          </button>
        )}
      </div>
    </section>
  )
}
