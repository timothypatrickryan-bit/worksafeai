import React from 'react'

const navItems = [
  // EXECUTION LAYER — Active work
  { id: 'task-progress', icon: '📈', label: 'Task Progress', countKey: 'task-progress' },
  { id: 'tasks', icon: '◉', label: 'Tasks', countKey: 'tasks' },
  { id: 'inbox', icon: '⊕', label: 'Inbox', countKey: 'inbox' },
  
  // OVERSIGHT LAYER — System health & analytics
  { id: 'alerts', icon: '⚠', label: 'Alerts', countKey: 'alerts' },
  { id: 'gap-analysis', icon: '📊', label: 'Gap Analysis', countKey: 'gap-analysis' },
  
  // ORGANIZATION LAYER — Team & structure
  { id: 'team', icon: '👥', label: 'Team', countKey: 'team' },
  { id: 'projects', icon: '📦', label: 'Projects', countKey: 'projects' },
  { id: 'contacts', icon: '👤', label: 'Contacts', countKey: 'contacts' },
  
  // OPERATIONS LAYER — Supporting systems
  { id: 'calendar', icon: '📅', label: 'Calendar', countKey: 'calendar' },
  { id: 'memory', icon: '📔', label: 'Memory', countKey: 'memory' },
  { id: 'docs', icon: '📚', label: 'Docs', countKey: 'docs' },
]

export default function Sidebar({ currentSection, setCurrentSection, state }) {
  const getCount = (key) => {
    if (!state) return 0
    if (key === 'tasks') {
      const inProgress = Object.values(state.agents || {}).filter(a => a.status === 'working').length
      return inProgress
    }
    if (key === 'team') return (state.team?.members || []).length
    if (key === 'projects') return Object.keys(state.projects || {}).length
    if (key === 'inbox') return (state.inbox || []).length
    if (key === 'alerts') return (state.alerts || []).length
    if (key === 'contacts') return Object.keys(state.contacts || {}).length
    if (key === 'docs') return (state.docs || []).length
    return 0
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto flex flex-col h-screen">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-custom"></div>
          <h1 className="text-base font-semibold text-gray-900">
            Mission Control
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-0.5 flex-1 px-3 py-4">
        {navItems.map((item) => {
          const count = getCount(item.countKey)
          const isActive = currentSection === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => setCurrentSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-sm">{item.icon}</span>
              <span className="flex-1 text-left">{item.label}</span>
              {count > 0 && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-sm ${
                  item.id === 'inbox' && count > 0
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
          <span>Connected</span>
        </div>
      </div>
    </div>
  )
}
