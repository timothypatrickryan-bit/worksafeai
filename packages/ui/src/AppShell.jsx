/**
 * @elevationai/ui - AppShell
 * 
 * Configurable application shell with sidebar navigation, header, and content area.
 * Extracted from WorkSafeAI Layout + Super Admin AdminLayout patterns.
 * 
 * @example
 * <AppShell
 *   appName="MyApp"
 *   appIcon="/icon.jpg"
 *   tagline="Powered by AI"
 *   navItems={[
 *     { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
 *     { path: '/settings', label: 'Settings', icon: Settings },
 *   ]}
 *   adminItems={[
 *     { path: '/admin', label: 'Admin', icon: Shield },
 *   ]}
 *   user={{ name: 'Tim', role: 'admin' }}
 *   onLogout={() => {}}
 *   collapsible={true}
 * >
 *   <DashboardPage />
 * </AppShell>
 */

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';

export default function AppShell({
  appName = 'App',
  appIcon = null,
  tagline = null,
  navItems = [],
  adminItems = [],
  user = null,
  onLogout,
  collapsible = false,
  children,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const handleNav = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    onLogout?.();
    navigate('/login');
  };

  const renderNavItem = (item) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    return (
      <button
        key={item.path}
        onClick={() => handleNav(item.path)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all group relative ${
          active
            ? 'bg-gradient-to-r from-blue-600/20 to-cyan-500/20 text-white border-l-2 border-cyan-400'
            : 'text-slate-300 hover:bg-white/10 hover:text-white'
        }`}
      >
        {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
        {(sidebarOpen || !collapsible) && (
          <span className="text-sm font-medium">{item.label}</span>
        )}
        {collapsible && !sidebarOpen && (
          <div className="absolute left-20 bg-slate-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
            {item.label}
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:relative z-40 h-screen bg-slate-800/40 border-r border-white/10 backdrop-blur-sm transition-all duration-300 flex flex-col ${
          collapsible ? (sidebarOpen ? 'w-64' : 'w-20') : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          {appIcon && <img src={appIcon} alt={appName} className="w-8 h-8 rounded" />}
          {(sidebarOpen || !collapsible) && (
            <div className="ml-3">
              <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                {appName}
              </span>
              {tagline && <p className="text-xs text-slate-400">{tagline}</p>}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          {navItems.map(renderNavItem)}

          {/* Admin Section */}
          {adminItems.length > 0 && (
            <div className="pt-4 mt-4 border-t border-white/10">
              {(sidebarOpen || !collapsible) && (
                <div className="px-4 py-2 mb-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Admin</p>
                </div>
              )}
              {adminItems.map(renderNavItem)}
            </div>
          )}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-white/10 p-3">
          {user && (sidebarOpen || !collapsible) && (
            <div className="px-4 py-2 mb-2">
              <p className="text-sm font-semibold text-slate-100">{user.name || user.email}</p>
              <p className="text-xs text-slate-400 capitalize">{user.role}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-300 hover:bg-red-500/20 transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {(sidebarOpen || !collapsible) && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>

        {/* Collapse Toggle */}
        {collapsible && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="m-3 p-2 rounded-lg hover:bg-white/10 transition-colors hidden md:block"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 text-slate-400" />
            ) : (
              <Menu className="w-5 h-5 text-slate-400" />
            )}
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-white/10 backdrop-blur-sm bg-white/5 flex items-center px-4">
          <button onClick={() => setMobileOpen(true)} className="p-2 text-white hover:bg-white/20 rounded-lg">
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-3 text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            {appName}
          </span>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 sm:p-8">
          <div className="animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
