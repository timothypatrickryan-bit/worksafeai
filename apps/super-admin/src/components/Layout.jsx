import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import useAppStore from '../stores/appStore';
import { Menu, LogOut, X, Shield, Settings, Database, BarChart3, FileText, Users } from 'lucide-react';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { selectedApp, setSelectedApp, apps } = useAppStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentApp = apps.find(app => app.id === selectedApp);

  const navItems = [
    { href: '/', label: 'Dashboard', icon: BarChart3 },
    { href: '/companies', label: 'Companies', icon: Database },
    { href: '/employees', label: 'Employees', icon: Users },
    { href: '/subscriptions', label: 'Subscriptions', icon: Shield },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/audit-logs', label: 'Audit Logs', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-slate-700 rounded-lg text-slate-300"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-400" />
              <div>
                <h1 className="text-lg font-bold text-white">SuperAdmin</h1>
                <p className="text-xs text-slate-400">{currentApp?.name}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-slate-100">{user?.email}</p>
              <p className="text-xs text-slate-400">Super Admin</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700 hover:bg-red-600 text-slate-100 text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed md:relative w-64 h-[calc(100vh-80px)] bg-slate-800 border-r border-slate-700 overflow-y-auto transition-all duration-300 z-30 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <nav className="p-4 space-y-2">
            {/* App Selector */}
            <div className="mb-6 pb-4 border-b border-slate-700">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Select App
              </p>
              <select
                value={selectedApp}
                onChange={(e) => {
                  setSelectedApp(e.target.value);
                  setSidebarOpen(false);
                }}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {apps.map(app => (
                  <option key={app.id} value={app.id}>
                    {app.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Navigation */}
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </a>
              );
            })}

            {/* Settings */}
            <div className="pt-4 mt-4 border-t border-slate-700">
              <a
                href="/settings"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">Settings</span>
              </a>
            </div>
          </nav>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-8">
          <div className="animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
