import React, { useState, useEffect } from 'react'

export default function ProjectsSection({ state }) {
  const [expandedProject, setExpandedProject] = useState(null)
  const [showNewRequest, setShowNewRequest] = useState(false)
  const [newRequest, setNewRequest] = useState({
    projectId: '',
    title: '',
    type: 'enhancement',
    description: '',
    priority: 'medium',
  })

  const projectsData = {
    worksafeai: {
      id: 'worksafeai',
      name: 'WorkSafeAI',
      icon: '🛡️',
      description: 'Job Task Safety Analysis tool - AI-powered hazard identification and mitigation for workplace safety',
      status: 'production',
      healthCheck: 'passing',
      lastWorkedOn: '2026-03-08T12:24:00Z',
      connectedTo: ['Supabase (Database)', 'Vercel (Hosting)', 'OpenAI (AI)', 'Gmail (Email)'],
      team: ['Lucy', 'Tim Ryan', 'Opus Code Reviewer'],
      todoItems: [
        'Stripe billing integration (payment processing)',
        'Redis caching (dashboard performance)',
        'Database migrations (schema versioning)',
        'WebSocket real-time collaboration',
        'Swagger/OpenAPI documentation',
      ],
      lastDeploy: '2026-03-08T12:24:00Z',
      repoUrl: 'https://github.com/timothypatrickryan-bit/worksafeai',
      deployed: ['Frontend', 'Backend', 'Dashboard'],
    },
    consensus: {
      id: 'consensus',
      name: 'Consensus',
      icon: '📊',
      description: 'Product Review Aggregation engine - Real-time aggregation of reviews from 40+ sources across 12+ categories',
      status: 'staging',
      healthCheck: 'passing',
      lastWorkedOn: '2026-03-14T12:45:00Z',
      connectedTo: ['Redis (Caching)', 'Vercel (Hosting)', 'Multiple Data Sources'],
      team: ['Lucy', 'Tim Ryan'],
      todoItems: [
        'Phase 2 expansion (17+ sources)',
        'Wirecutter Home integration',
        'ATK recipes integration',
        'Outside magazine integration',
        'Performance optimization',
        'Analytics dashboard',
      ],
      lastDeploy: '2026-03-14T12:45:00Z',
      repoUrl: 'https://github.com/timothypatrickryan-bit/consensus',
      deployed: ['Frontend', 'Backend', 'Real-time'],
    },
  }

  const projects = state?.projects || projectsData

  const handleSubmitRequest = async () => {
    if (!newRequest.projectId || !newRequest.title || !newRequest.description) {
      alert('Please fill in all fields')
      return
    }

    try {
      const response = await fetch('http://localhost:3000/api/projects/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newRequest,
          submittedAt: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        setNewRequest({ projectId: '', title: '', type: 'enhancement', description: '', priority: 'medium' })
        setShowNewRequest(false)
        alert('Request submitted successfully!')
      }
    } catch (err) {
      console.error('Error submitting request:', err)
    }
  }

  const getTimeAgo = (dateStr) => {
    const now = new Date()
    const date = new Date(dateStr)
    const seconds = Math.floor((now - date) / 1000)

    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  const statusColors = {
    production: 'bg-green-100 text-green-900 border-green-300',
    staging: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    development: 'bg-blue-100 text-blue-900 border-blue-300',
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Projects</h2>
          <p className="text-xs text-gray-600 mt-1">
            {Object.keys(projects).length} active projects
          </p>
        </div>
        <button
          onClick={() => setShowNewRequest(!showNewRequest)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-sm text-sm font-medium transition-colors"
        >
          {showNewRequest ? '✕ Cancel' : '+ New Request'}
        </button>
      </div>

      {/* New Request Form */}
      {showNewRequest && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-md p-4 space-y-3">
          <p className="text-xs font-semibold text-blue-900 uppercase">Submit Enhancement Request</p>

          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Project *</label>
            <select
              value={newRequest.projectId}
              onChange={(e) => setNewRequest({ ...newRequest, projectId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="">Select a project...</option>
              {Object.entries(projects).map(([key, proj]) => (
                <option key={key} value={key}>
                  {proj.name || key}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Title *</label>
            <input
              type="text"
              placeholder="e.g., Add dark mode, Fix login bug, Improve performance"
              value={newRequest.title}
              onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Type</label>
              <select
                value={newRequest.type}
                onChange={(e) => setNewRequest({ ...newRequest, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="enhancement">Enhancement</option>
                <option value="bug">Bug Fix</option>
                <option value="feature">Feature</option>
                <option value="optimization">Optimization</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Priority</label>
              <select
                value={newRequest.priority}
                onChange={(e) => setNewRequest({ ...newRequest, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Description *</label>
            <textarea
              placeholder="Describe what needs to be done, why it matters, and any specifics..."
              value={newRequest.description}
              onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-blue-500 resize-none h-20"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowNewRequest(false)}
              className="px-3 py-1 border border-gray-300 rounded-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitRequest}
              className="px-3 py-1 bg-blue-600 text-white rounded-sm text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      <div className="space-y-4">
        {Object.entries(projects).map(([key, project]) => (
          <div
            key={key}
            onClick={() => setExpandedProject(expandedProject === key ? null : key)}
            className="bg-white border-2 border-gray-200 rounded-md hover:border-gray-300 transition-all cursor-pointer"
          >
            {/* Collapsed View */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{project.icon || '📦'}</span>
                  <div>
                    <h3 className="font-bold text-gray-900">{project.name || key}</h3>
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-sm border ${statusColors[project.status] || 'bg-gray-100'}`}>
                  {project.status || 'unknown'}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-xs mt-3">
                <div className="bg-gray-50 rounded-sm p-2">
                  <p className="text-gray-600 font-medium">Health</p>
                  <p className="text-gray-900 font-bold mt-1">
                    {project.healthCheck === 'passing' ? '✅ Passing' : '⚠️ Issues'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-sm p-2">
                  <p className="text-gray-600 font-medium">Last Worked</p>
                  <p className="text-gray-900 font-bold mt-1">{getTimeAgo(project.lastWorkedOn)}</p>
                </div>
                <div className="bg-gray-50 rounded-sm p-2">
                  <p className="text-gray-600 font-medium">Todo</p>
                  <p className="text-gray-900 font-bold mt-1">{project.todoItems?.length || 0}</p>
                </div>
                <div className="bg-gray-50 rounded-sm p-2">
                  <p className="text-gray-600 font-medium">Team</p>
                  <p className="text-gray-900 font-bold mt-1">{project.team?.length || 0}</p>
                </div>
              </div>
            </div>

            {/* Expanded View */}
            {expandedProject === key && (
              <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
                {/* Description */}
                <div>
                  <p className="text-xs font-semibold text-gray-700 uppercase mb-2">📝 About</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{project.description}</p>
                </div>

                {/* Connected Services */}
                {project.connectedTo && project.connectedTo.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-700 uppercase mb-2">🔗 Connected To</p>
                    <div className="flex flex-wrap gap-2">
                      {project.connectedTo.map((service, idx) => (
                        <span
                          key={idx}
                          className="bg-white border border-gray-300 px-2 py-1 rounded-sm text-xs text-gray-700"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Team Members */}
                {project.team && project.team.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-700 uppercase mb-2">👥 Team</p>
                    <div className="flex flex-wrap gap-2">
                      {project.team.map((member, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-100 border border-blue-300 px-2 py-1 rounded-sm text-xs text-blue-900"
                        >
                          {member}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Todo Items */}
                {project.todoItems && project.todoItems.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-700 uppercase mb-2">
                      ✓ Todo ({project.todoItems.length})
                    </p>
                    <ul className="space-y-1">
                      {project.todoItems.map((item, idx) => (
                        <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                          <span className="text-gray-400 mt-1">▪</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Links */}
                <div className="flex gap-2">
                  {project.repoUrl && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-gray-600 text-white px-2 py-1 rounded-sm hover:bg-gray-700 transition-colors"
                    >
                      → GitHub Repo
                    </a>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setNewRequest({ ...newRequest, projectId: key })
                      setShowNewRequest(true)
                    }}
                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded-sm hover:bg-blue-700 transition-colors"
                  >
                    + Request Enhancement
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
