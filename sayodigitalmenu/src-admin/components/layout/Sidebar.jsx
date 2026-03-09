import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  ListTree,
  UtensilsCrossed,
  Tags,
  Globe,
  Film,
  Settings,
  Shield,
  UserCog,
  Users,
  UserPlus,
  ClipboardList,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import { api } from '../../api/api';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Logo } from '../ui/Logo';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/main-sections', icon: FolderOpen, label: 'Main Sections' },
  { to: '/classifications', icon: ListTree, label: 'Classifications' },
  { to: '/menu-items', icon: UtensilsCrossed, label: 'Menu Items' },
  { to: '/filters-tags', icon: Tags, label: 'Tags' },
  { to: '/countries', icon: Globe, label: 'Countries' },
  { to: '/hero-opening', icon: Film, label: 'Hero & Opening' },
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/user-roles', icon: Shield, label: 'User Roles' },
  { to: '/role-permissions', icon: UserCog, label: 'Role Permissions' },
  { to: '/users', icon: Users, label: 'Users' },
  { to: '/customers', icon: UserPlus, label: 'Customers' },
  { to: '/activity-log', icon: ClipboardList, label: 'Activity Log' },
];

export function Sidebar() {
  const navigate = useNavigate();

  function handleLogout() {
    api.auth.logout();
    navigate('/login', { replace: true });
  }

  return (
    <aside
      className="fixed left-0 top-0 z-40 h-screen w-64 bg-sayo-surface border-r border-sayo-border flex flex-col"
      aria-label="Main navigation"
    >
      <div className="p-6 border-b border-sayo-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <Logo className="shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-sayo-muted">Menu Admin</p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      <nav className="flex-1 p-4 space-y-1" role="navigation">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-full transition-colors duration-200 focus-visible:outline-none ${
                isActive
                  ? 'bg-[rgba(212,165,116,0.12)] text-sayo-accent'
                  : 'text-sayo-creamMuted hover:text-sayo-cream hover:bg-sayo-surfaceHover'
              }`
            }
          >
            <Icon className="w-5 h-5 shrink-0" aria-hidden />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-sayo-border space-y-1">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-3 rounded-full text-sayo-creamMuted hover:text-sayo-accent hover:bg-sayo-surfaceHover transition-colors"
        >
          <ExternalLink className="w-5 h-5" aria-hidden />
          <span>View Public Menu</span>
        </a>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-full text-sayo-creamMuted hover:text-sayo-accent hover:bg-sayo-surfaceHover transition-colors"
        >
          <LogOut className="w-5 h-5" aria-hidden />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
