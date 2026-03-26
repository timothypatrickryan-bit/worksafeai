import React, { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Dashboard from '../components/Dashboard'
import useWebSocket from '../hooks/useWebSocket'

export default function Home() {
  const [currentSection, setCurrentSection] = useState('unified-dashboard')
  const [state, isConnected, ws] = useWebSocket()

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        currentSection={currentSection} 
        setCurrentSection={setCurrentSection}
        state={state}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-xs">
          <h1 className="text-lg font-semibold text-gray-900">
            {getSectionTitle(currentSection)}
          </h1>
          <div className={`flex items-center gap-2 text-xs font-medium ${
            isConnected ? 'text-green-700' : 'text-gray-500'
          }`}>
            <span className={`inline-block w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-600' : 'bg-gray-400'
            }`}></span>
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-8 py-8">
            <Dashboard 
              section={currentSection}
              state={state}
              ws={ws}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function getSectionTitle(section) {
  const titles = {
    'unified-dashboard': 'Unified Dashboard',
    tasks: 'Task Board',
    'task-progress': 'Task Progress Dashboard',
    activity: 'Live Activity',
    memory: 'Memory & Journal',
    calendar: 'Schedule & Cron Jobs',
    team: 'Team',
    projects: 'Projects',
    inbox: 'Inbox',
    alerts: 'Alerts',
    contacts: 'Contacts & Platforms',
    docs: 'Docs',
    'gap-analysis': 'Gap Analysis',
  }
  return titles[section] || 'Mission Control'
}
