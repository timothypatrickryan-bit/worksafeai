import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { Menu, LogOut, X, BarChart3, CheckCircle2, CreditCard, Settings, Building2 } from 'lucide-react';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/jtsa', label: 'JTSAs', icon: CheckCircle2 },
    { href: '/billing', label: 'Billing', icon: CreditCard },
  ];

  const adminItems = [
    { href: '/admin', label: 'Admin Dashboard', icon: Settings },
    { href: '/company-profile', label: 'Company Profile', icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header - Glassmorphism */}
      <header className="relative z-50 bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 text-white hover:bg-white/20 rounded-lg transition-all duration-300"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center gap-3">
              <img 
                src="/worksafe_icon.jpg" 
                alt="WorkSafeAI" 
                className="w-10 h-10 rounded-lg shadow-lg object-cover"
              />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  WorkSafeAI
                </h1>
                <p className="text-xs text-slate-400">Intelligence That Protects</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-slate-100">
                {user?.fullName || user?.email}
              </p>
              <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-red-500/20 text-slate-100 hover:text-red-300 transition-all duration-300 font-medium text-sm border border-white/10 hover:border-red-500/30"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="relative z-10 flex">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar - Modern glassmorphism */}
        <aside
          className={`fixed md:relative w-64 h-screen bg-white/10 backdrop-blur-md border-r border-white/20 z-40 transform md:transform-none transition-all duration-300 overflow-y-auto ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <nav className="p-4 space-y-2">
            {/* Main Navigation */}
            {navItems.map((item) => {
              const Icon = item.icon;
              
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-200 hover:text-white group transition-all duration-300 hover:bg-white/20 hover:shadow-glass"
                >
                  <Icon className="w-5 h-5 group-hover:text-cyan-400 transition-colors" />
                  <span className="font-medium">{item.label}</span>
                </a>
              );
            })}

            {/* Admin Section (only visible to admins/owners) */}
            {(user?.role === 'admin' || user?.role === 'owner') && (
              <div className="pt-4 mt-4 border-t border-white/10">
                <div className="px-4 py-2 mb-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Admin</p>
                </div>
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-200 hover:text-white group transition-all duration-300 hover:bg-white/20 hover:shadow-glass"
                    >
                      <Icon className="w-5 h-5 group-hover:text-cyan-400 transition-colors" />
                      <span className="font-medium">{item.label}</span>
                    </a>
                  );
                })}
              </div>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 sm:p-8">
          <div className="animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
