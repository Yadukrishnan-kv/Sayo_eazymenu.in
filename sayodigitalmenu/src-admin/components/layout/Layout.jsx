import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { SidebarMobile } from './SidebarMobile';
import { Toaster } from 'react-hot-toast';

export function Layout() {
  return (
    <div className="min-h-screen bg-sayo-dark">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--sayo-surface)',
            color: 'var(--sayo-text)',
            border: '1px solid var(--sayo-border)',
          },
          success: { iconTheme: { primary: 'var(--sayo-accent)' } },
        }}
      />
      <Sidebar />
      <SidebarMobile />
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
