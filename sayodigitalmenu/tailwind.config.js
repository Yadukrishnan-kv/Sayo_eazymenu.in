/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './admin/index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './src-admin/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        sayo: {
          dark: 'var(--sayo-dark)',
          darker: 'var(--sayo-darker)',
          surface: 'var(--sayo-surface)',
          surfaceHover: 'var(--sayo-surface-hover)',
          border: 'var(--sayo-border)',
          borderSubtle: 'var(--sayo-border-subtle)',
          muted: 'var(--sayo-muted)',
          accent: 'var(--sayo-accent)',
          accentSoft: 'var(--sayo-accent-soft)',
          gold: 'var(--sayo-gold)',
          goldLight: 'var(--sayo-gold-light)',
          goldDark: 'var(--sayo-gold-dark)',
          cream: 'var(--sayo-cream)',
          creamMuted: 'var(--sayo-cream-muted)',
        },
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        body: ['Outfit', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        'sayo': '12px',
        'sayo-lg': '16px',
      },
      boxShadow: {
        'sayo': '0 2px 12px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04)',
        'sayo-gold': '0 0 20px rgba(212, 165, 116, 0.06)',
      },
    },
  },
  plugins: [],
}
