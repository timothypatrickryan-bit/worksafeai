import React from 'react'

const statusDot = {
  idle: 'bg-gray-400',
  working: 'bg-yellow-500',
  complete: 'bg-green-500',
  scheduled: 'bg-gray-1000',
  reviewing: 'bg-purple-500',
}

const statusText = {
  idle: 'text-gray-700',
  working: 'text-yellow-700',
  complete: 'text-green-700',
  scheduled: 'text-slate-700',
  reviewing: 'text-purple-700',
}

const statusBg = {
  idle: 'bg-gray-50',
  working: 'bg-yellow-50',
  complete: 'bg-green-50',
  scheduled: 'bg-gray-100',
  reviewing: 'bg-purple-50',
}

export default function AgentsSection({ state }) {
  const agents = state?.agents || {}

  if (Object.keys(agents).length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-sm">No agents configured</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {Object.entries(agents).map(([key, agent]) => (
        <div
          key={key}
          className={`bg-white border border-gray-200 rounded-md p-4 hover:border-gray-300 hover:shadow-xs transition-all`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="font-medium text-gray-900 flex items-center gap-2">
                <span className={`inline-block w-2 h-2 rounded-full ${statusDot[agent.status] || statusDot.idle}`}></span>
                {agent.name}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {agent.currentTask && `${agent.currentTask} • `}
                {agent.lastActivity && new Date(agent.lastActivity).toLocaleTimeString()}
              </p>
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-sm ${statusBg[agent.status] || statusBg.idle} ${statusText[agent.status] || statusText.idle}`}>
              {agent.status}
            </span>
          </div>
          
          {agent.output && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-600">
                <span className="font-medium">Output:</span> {agent.output.type}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
