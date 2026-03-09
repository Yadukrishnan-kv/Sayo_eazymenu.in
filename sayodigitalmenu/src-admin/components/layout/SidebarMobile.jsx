import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Logo } from '../ui/Logo';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/main-sections', label: 'Main Sections' },
  { to: '/classifications', label: 'Classifications' },
  { to: '/menu-items', label: 'Menu Items' },
  { to: '/filters-tags', label: 'Tags' },
  { to: '/hero-opening', label: 'Hero & Opening' },
  { to: '/settings', label: 'Settings' },
];

export function SidebarMobile() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-sayo-surface border-b border-sayo-border">
      <div className="flex items-center justify-between p-4">
        <Logo className="h-7" />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
          type="button"
          onClick={() => setOpen(!open)}
          className="btn-ghost p-2"
          aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="mobile-nav"
          className="border-t border-sayo-border p-4 space-y-1"
          role="navigation"
        >
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-full ${
                  isActive ? 'bg-[rgba(212,165,116,0.12)] text-sayo-accent' : 'text-sayo-creamMuted hover:text-sayo-cream'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}
