import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex items-center justify-center w-10 h-10 rounded-full text-sayo-creamMuted hover:text-sayo-accent hover:bg-sayo-surfaceHover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sayo-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sayo-surface)]"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5" aria-hidden />
      ) : (
        <Moon className="w-5 h-5" aria-hidden />
      )}
    </button>
  );
}
