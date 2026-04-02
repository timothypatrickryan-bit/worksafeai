import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';

export default function App() {
  const location = useLocation();

  // Determine active section from path
  const getPageTitle = () => {
    if (location.pathname.includes('/kpi')) return 'Warp Speed KPI Dashboard';
    if (location.pathname.includes('/edit')) return 'Edit Project';
    if (location.pathname.startsWith('/projects/')) return 'Project Details';
    if (location.pathname === '/tasks') return 'Task Management';
    if (location.pathname === '/improvements') return 'Improvements Pipeline';
    if (location.pathname === '/team') return 'Team';
    if (location.pathname === '/contacts') return 'Contacts';
    if (location.pathname === '/calendar') return 'Calendar';
    if (location.pathname === '/memory') return 'Memory';
    if (location.pathname === '/docs') return 'Docs';
    if (location.pathname === '/skills') return 'Skills Management';
    if (location.pathname === '/briefing-queue') return 'Briefing Approval Queue';
    return 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPath={location.pathname} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <div className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6 shrink-0">
          <h1 className="text-lg font-bold text-slate-900">{getPageTitle()}</h1>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">Online</span>
          </div>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
