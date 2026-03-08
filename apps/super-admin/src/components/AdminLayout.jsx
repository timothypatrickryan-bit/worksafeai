import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import {
  BarChart3, Building2, Users, CreditCard, TrendingUp,
  FileText, Settings, LogOut, Menu, X, Shield
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/companies', label: 'Companies', icon: Building2 },
    { path: '/employees', label: 'Employees', icon: Users },
    { path: '/subscriptions', label: 'Subscriptions', icon: CreditCard },
    { path: '/analytics', label: 'Analytics', icon: TrendingUp },
    { path: '/audit-logs', label: 'Audit Logs', icon: FileText },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-800/40 border-r border-white/10 backdrop-blur-sm transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <img src="/worksafe_icon.jpg" alt="WorkSafeAI" className="w-8 h-8 rounded" />
          {sidebarOpen && <span className="ml-3 text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Admin</span>}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-all group relative"
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              {!sidebarOpen && (
                <div className="absolute left-20 bg-slate-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-white/10 p-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-300 hover:bg-red-500/20 transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="m-3 p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          {sidebarOpen ? (
            <X className="w-5 h-5 text-slate-400" />
          ) : (
            <Menu className="w-5 h-5 text-slate-400" />
          )}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-white/10 backdrop-blur-sm bg-white/5 flex items-center justify-between px-8">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-cyan-400" />
            <h1 className="text-xl font-bold text-white">Super Admin Console</h1>
          </div>
          <div className="text-sm text-slate-400">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
