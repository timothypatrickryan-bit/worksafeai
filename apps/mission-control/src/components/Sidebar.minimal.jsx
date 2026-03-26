export default function SidebarMinimal({ currentSection, setCurrentSection, state }) {
  const navItems = [
    { id: 'unified-dashboard', label: '🎯 Dashboard' },
    { id: 'gap-analysis', label: '📊 Gap Analysis' },
    { id: 'team', label: '👥 Team' },
    { id: 'contacts', label: '👤 Contacts' },
    { id: 'calendar', label: '📅 Calendar' },
    { id: 'memory', label: '📔 Memory' },
    { id: 'docs', label: '📚 Docs' },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto flex flex-col h-screen" data-testid="sidebar">
      <div className="px-6 py-6 border-b border-gray-200">
        <h2 className="text-lg font-bold text-slate-900">Mission Control</h2>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentSection(item.id)}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition-all ${
              currentSection === item.id
                ? 'bg-blue-500 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            data-testid={`nav-${item.id}`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="px-6 py-4 border-t border-gray-200 flex items-center gap-2" data-testid="sidebar-status">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-sm text-gray-600">Connected</span>
      </div>
    </aside>
  )
}
