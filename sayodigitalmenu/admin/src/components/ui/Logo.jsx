import { useTheme } from '../../context/ThemeContext';

const LOGOS = {
  dark: '/assets/Logo_lgt_EN.svg',  // light-colored logo on dark background
  light: '/assets/Logo_EN.svg',     // dark-colored logo on light background
};

export function Logo({ className = '', ...props }) {
  const { theme } = useTheme();
  const src = LOGOS[theme] || LOGOS.dark;

  return (
    <img
      src={src}
      alt="SAYO"
      className={`h-8 w-auto object-contain object-left ${className}`}
      {...props}
    />
  );
}
