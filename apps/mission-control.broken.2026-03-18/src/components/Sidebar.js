import { useState } from 'react';

const Sidebar = ({ activeSection, onSectionChange }) => {
  const sections = [
    { id: 'agents', label: 'Agents', icon: '🤖' },
    { id: 'projects', label: 'Projects', icon: '📊' },
    { id: 'inbox', label: 'Inbox', icon: '📥' },
    { id: 'alerts', label: 'Alerts', icon: '⚠️' },
    { id: 'contacts', label: 'Contacts', icon: '👥' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          🎯 Mission Control
        </h1>
        <p className="text-xs text-secondary mt-1">Agent Monitoring Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
              activeSection === section.id
                ? 'bg-primary text-white shadow-sm'
                : 'text-dark hover:bg-gray-100'
            }`}
          >
            <span className="mr-3">{section.icon}</span>
            {section.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-secondary text-center">
          🍀 Lucy's Mission Control
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
