import { useNavigate } from 'react-router-dom';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠', path: '/' },
  { id: 'tasks', label: 'Tasks', icon: '📋', path: '/tasks' },
  { id: 'briefing-queue', label: 'Briefings', icon: '📬', path: '/briefing-queue' },
  { id: 'improvements', label: 'Improvements', icon: '🤖', path: '/improvements' },
  { id: 'team', label: 'Team', icon: '👥', path: '/team' },
  { id: 'contacts', label: 'Contacts', icon: '👤', path: '/contacts' },
  { id: 'calendar', label: 'Calendar', icon: '📅', path: '/calendar' },
  { id: 'memory', label: 'Memory', icon: '📔', path: '/memory' },
  { id: 'docs', label: 'Docs', icon: '📚', path: '/docs' },
  { id: 'skills', label: 'Skills', icon: '⚙️', path: '/skills' },
];

export default function Sidebar({ currentPath }) {
  const navigate = useNavigate();

  return (
    <div className="w-56 bg-slate-900 text-white flex flex-col shrink-0">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-slate-700">
        <span className="text-lg font-bold tracking-tight">🚀 Mission Control</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-700">
        <div className="text-xs text-slate-500">Mission Control v2.0</div>
        <div className="text-xs text-slate-600">Express + React + Vite</div>
      </div>
    </div>
  );
}
