import React, { useState, useEffect } from 'react'

export default function TeamSection({ state }) {
  const [team, setTeam] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [showCreateSubagent, setShowCreateSubagent] = useState(false)
  const [briefDescription, setBriefDescription] = useState('')
  const [generatedAgent, setGeneratedAgent] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    title: '',
    specialty: '',
    notes: '',
  })

  useEffect(() => {
    loadTeam()
  }, [])

  const loadTeam = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/team')
      if (response.ok) {
        const teamData = await response.json()
        setTeam(teamData.team || teamData)
      }
    } catch (err) {
      console.error('Error loading team:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateAgent = async () => {
    if (!briefDescription.trim()) {
      alert('Please describe the agent (e.g., "content writer for tech blogs")')
      return
    }

    setIsGenerating(true)
    try {
      // Extract team from description (format: [TEAM:TeamName])
      const teamMatch = briefDescription.match(/\[TEAM:(Leadership|Oversight|Execution)\]/)
      const selectedTeam = teamMatch ? teamMatch[1] : 'Execution'
      const cleanDescription = briefDescription.replace(/\s*\[TEAM:.*?\]/, '')

      // Call backend to generate agent using smart generator
      const response = await fetch('/api/team/generate-subagent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: cleanDescription }),
      })

      if (response.ok) {
        const agent = await response.json()
        // Ensure all required fields are set
        agent.team = selectedTeam
        agent.type = agent.type || 'subagent'
        agent.role = agent.role || 'agent'
        agent.status = agent.status || 'idle'
        agent.device = agent.device || 'Cloud / OpenClaw'
        agent.capabilities = agent.capabilities || []
        setGeneratedAgent(agent)
      } else {
        alert('Failed to generate agent')
      }
    } catch (err) {
      console.error('Error generating agent:', err)
      alert('Error: ' + err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCreateFromGenerated = async () => {
    if (!generatedAgent) return

    // Validate required fields
    if (!generatedAgent.name || !generatedAgent.title || !generatedAgent.team) {
      alert('Please fill in all required fields: Name, Title, and Team')
      return
    }

    // Build agent payload matching backend API requirements: name, title, model (+ optional scope, specialties, skills)
    const agentPayload = {
      name: generatedAgent.name,
      title: generatedAgent.title,
      model: generatedAgent.model || 'Claude Sonnet 4.6', // REQUIRED by backend
      scope: generatedAgent.specialty || 'General',
      specialties: generatedAgent.specialties || [generatedAgent.specialty || 'General'],
      skills: generatedAgent.skills || {},
      team: generatedAgent.team,
    }

    try {
      const response = await fetch('/api/team/subagent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentPayload),
      })

      if (response.ok) {
        // Reset and reload
        setBriefDescription('')
        setGeneratedAgent(null)
        setShowCreateSubagent(false)
        loadTeam()
        alert(`✅ ${generatedAgent.name} created successfully!`)
      } else {
        try {
          const error = await response.json()
          console.error('Full server error:', error)
          alert(`Error: ${JSON.stringify(error, null, 2)}`)
        } catch (e) {
          alert(`Error: ${response.status} ${response.statusText}`)
          console.error('Response:', response)
        }
      }
    } catch (err) {
      console.error('Error creating subagent:', err)
      alert('Error: ' + err.message)
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading team...</div>
  }

  if (!team) {
    return <div className="text-center py-12 text-gray-500">No team data available</div>
  }

  const roleIcons = {
    leader: '👑',
    agent: '🤖',
    subagent: '🔄',
    tool: '⚙️',
  }

  const roleColors = {
    leader: 'bg-purple-50 border-purple-300',
    agent: 'bg-gray-100 border-blue-300',
    subagent: 'bg-cyan-50 border-cyan-300',
    tool: 'bg-orange-50 border-orange-300',
  }

  const statusIcons = {
    active: '🟢',
    idle: '⚪',
    offline: '🔴',
    scheduled: '⏰',
  }

  // Organize team members by role for org chart (exclude Tim)
  const agents = (team.members || []).filter(m => m.type === 'agent' && m.id !== 'tim-ryan')
  const subagents = (team.members || []).filter(m => m.type === 'subagent')
  const tools = (team.members || []).filter(m => m.type === 'tool')

  const handleEditStart = (member) => {
    setEditingId(member.id)
    setEditForm({
      name: member.name,
      title: member.title,
      specialty: member.specialty || '',
      notes: member.notes || '',
    })
  }

  const handleEditSave = async () => {
    if (!editingId) return
    try {
      const response = await fetch(`/api/team/member/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      if (response.ok) {
        // Clear editing state first
        setEditingId(null)
        setEditForm({ name: '', title: '', specialty: '', notes: '' })
        // Reload team data with a small delay to ensure server has persisted
        setTimeout(() => {
          loadTeam()
        }, 300)
      } else {
        alert('Failed to save changes')
      }
    } catch (err) {
      console.error('Error editing member:', err)
      alert('Error saving changes: ' + err.message)
    }
  }

  // Identify leadership hierarchy
  const isOrchestrator = (id) => id === 'lucy'
  const isSecondInCommand = (id) => id === 'chief' || id === 'velma'

  const TeamTile = ({ member }) => {
    const orchestratorBadge = isOrchestrator(member.id) ? ' 👑 ORCHESTRATOR' : isSecondInCommand(member.id) ? ' 📌 2ND IN COMMAND' : ''
    
    if (editingId === member.id) {
      return (
        <div className={`border-2 rounded-sm p-3 ${roleColors[member.role]}`}>
          <div className="space-y-2">
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="input w-full text-sm"
              placeholder="Name"
            />
            <input
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="input w-full text-sm"
              placeholder="Title"
            />
            <textarea
              value={editForm.specialty}
              onChange={(e) => setEditForm({ ...editForm, specialty: e.target.value })}
              className="input w-full text-sm resize-none h-16"
              placeholder="Specialty"
            />
            <textarea
              value={editForm.notes}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              className="input w-full text-sm resize-none h-16"
              placeholder="Notes"
            />
            <div className="flex gap-2">
              <button
                onClick={handleEditSave}
                className="btn btn-primary flex-1 text-xs"
              >
                Save
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="btn btn-secondary flex-1 text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div
        onClick={() => setExpandedId(expandedId === member.id ? null : member.id)}
        className={`cursor-pointer border-2 rounded-sm p-3 transition-all hover:shadow-md ${roleColors[member.role]} ${expandedId === member.id ? 'ring-2 ring-blue-400' : ''}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <p className="text-xs font-bold text-gray-900">{member.name}{orchestratorBadge}</p>
            <p className="text-xs text-gray-600 mt-0.5">{member.title}</p>
          </div>
          <span className="text-lg">{statusIcons[member.status] || '⚪'}</span>
        </div>

        {/* Quick Info */}
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Model:</span>
            <span className="font-mono text-gray-900 text-xs">{member.model ? member.model.split(' ').slice(0, 2).join(' ') : '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Device:</span>
            <span className="text-gray-900 text-xs">{member.device?.split('/')[0] || '—'}</span>
          </div>
        </div>

        {/* Expanded Details */}
        {expandedId === member.id && (
          <div className="border-t border-gray-300 mt-2 pt-2 space-y-2 text-xs">
            <div>
              <p className="text-gray-600 font-medium mb-1">Specialty</p>
              <p className="text-gray-900">{member.specialty}</p>
            </div>
            {member.capabilities && member.capabilities.length > 0 && (
              <div>
                <p className="text-gray-600 font-medium mb-1">Capabilities</p>
                <div className="flex flex-wrap gap-1">
                  {member.capabilities.slice(0, 3).map((cap, idx) => (
                    <span
                      key={idx}
                      className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-sm text-xs"
                    >
                      {cap}
                    </span>
                  ))}
                  {member.capabilities.length > 3 && (
                    <span className="text-gray-600 text-xs">+{member.capabilities.length - 3}</span>
                  )}
                </div>
              </div>
            )}
            {member.notes && (
              <div>
                <p className="text-gray-600 font-medium mb-1">Notes</p>
                <p className="text-gray-700 text-xs">{member.notes}</p>
              </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleEditStart(member)
              }}
              className="btn btn-secondary w-full text-xs mt-2"
            >
              Edit Agent
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Mission Statement */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-600 p-4 rounded-sm">
        <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-2">🎯 Mission</p>
        <p className="text-sm text-blue-800 leading-relaxed">
          {team.mission}
        </p>
      </div>

      {/* Create Subagent Button */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowCreateSubagent(!showCreateSubagent)}
          className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-sm text-sm font-medium transition-colors"
        >
          {showCreateSubagent ? '✕ Cancel' : '+ Create Subagent'}
        </button>
      </div>

      {/* Smart Agent Generator */}
      {showCreateSubagent && (
        <div className="bg-green-50 border border-green-200 rounded-sm p-4 space-y-3">
          <p className="text-xs font-semibold text-green-900 uppercase">✨ Smart Agent Generator</p>
          <p className="text-xs text-gray-600">Just describe the agent in a few words — we'll handle the rest!</p>

          {!generatedAgent ? (
            <>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Describe the Agent *</label>
                <input
                  type="text"
                  placeholder="e.g., 'content writer for tech blogs' or 'data analyst for metrics'"
                  value={briefDescription}
                  onChange={(e) => setBriefDescription(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleGenerateAgent()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 block mb-2">Team Assignment *</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="team"
                      value="Leadership"
                      checked={briefDescription.includes('[TEAM:') ? briefDescription.includes('[TEAM:Leadership]') : false}
                      onChange={(e) => {
                        if (e.target.checked && !briefDescription.includes('[TEAM:')) {
                          setBriefDescription(briefDescription + ' [TEAM:Leadership]')
                        } else if (e.target.checked) {
                          setBriefDescription(briefDescription.replace(/\[TEAM:.*?\]/, '[TEAM:Leadership]'))
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-xs text-gray-700">👑 Leadership</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="team"
                      value="Oversight"
                      checked={briefDescription.includes('[TEAM:') ? briefDescription.includes('[TEAM:Oversight]') : false}
                      onChange={(e) => {
                        if (e.target.checked && !briefDescription.includes('[TEAM:')) {
                          setBriefDescription(briefDescription + ' [TEAM:Oversight]')
                        } else if (e.target.checked) {
                          setBriefDescription(briefDescription.replace(/\[TEAM:.*?\]/, '[TEAM:Oversight]'))
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-xs text-gray-700">📌 Oversight</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="team"
                      value="Execution"
                      checked={briefDescription.includes('[TEAM:') ? briefDescription.includes('[TEAM:Execution]') : true}
                      onChange={(e) => {
                        if (e.target.checked && !briefDescription.includes('[TEAM:')) {
                          setBriefDescription(briefDescription + ' [TEAM:Execution]')
                        } else if (e.target.checked) {
                          setBriefDescription(briefDescription.replace(/\[TEAM:.*?\]/, '[TEAM:Execution]'))
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-xs text-gray-700">⚡ Execution</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">Default: Execution Team</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleGenerateAgent}
                  disabled={isGenerating}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded-sm text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {isGenerating ? '✨ Generating...' : '✨ Generate Agent'}
                </button>
                <button
                  onClick={() => {
                    setShowCreateSubagent(false)
                    setBriefDescription('')
                  }}
                  className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-sm text-sm font-medium hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs text-green-700 font-medium">✨ Generated Profile — Edit as needed, then create</p>
              
              <div className="bg-white border border-green-200 rounded-sm p-3 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">NAME</label>
                  <input
                    type="text"
                    value={generatedAgent.name}
                    onChange={(e) => setGeneratedAgent({ ...generatedAgent, name: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">TITLE</label>
                  <input
                    type="text"
                    value={generatedAgent.title}
                    onChange={(e) => setGeneratedAgent({ ...generatedAgent, title: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-2">TEAM</label>
                  <div className="flex gap-2">
                    {['Leadership', 'Oversight', 'Execution'].map(teamOption => (
                      <label key={teamOption} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="agentTeam"
                          value={teamOption}
                          checked={generatedAgent.team === teamOption}
                          onChange={(e) => setGeneratedAgent({ ...generatedAgent, team: e.target.value })}
                          className="w-3 h-3"
                        />
                        <span className="text-xs text-gray-700">{teamOption}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">SPECIALTIES</label>
                  <input
                    type="text"
                    value={generatedAgent.specialties?.join(' • ')}
                    onChange={(e) => setGeneratedAgent({ ...generatedAgent, specialties: e.target.value.split(' • ').map(s => s.trim()) })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">MODEL</label>
                  <select
                    value={generatedAgent.model}
                    onChange={(e) => setGeneratedAgent({ ...generatedAgent, model: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-green-500"
                  >
                    <option>Claude Haiku 4.5</option>
                    <option>Claude Sonnet 4.6</option>
                    <option>Claude Opus 4.6</option>
                  </select>
                </div>
                
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">SKILLS ({Object.keys(generatedAgent.skills || {}).length})</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(generatedAgent.skills || {})
                      .filter(([_, score]) => score >= 7)
                      .slice(0, 4)
                      .map(([skill, score]) => (
                        <span key={skill} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                          {skill.replace(/_/g, ' ')} ({score}/10)
                        </span>
                      ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Auto-generated • Edit in Team section after creation</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCreateFromGenerated}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded-sm text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  ✅ Create Agent
                </button>
                <button
                  onClick={() => {
                    setGeneratedAgent(null)
                    setBriefDescription('')
                  }}
                  className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-sm text-sm font-medium hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Overview Stats (exclude Tim) */}
      <div className="flex justify-center">
        <div className="grid grid-cols-4 gap-2 w-full max-w-2xl">
          <div className="bg-white border border-gray-200 rounded-sm p-2 text-center">
            <p className="text-lg font-bold text-gray-900">{team.members.length - 1}</p>
            <p className="text-xs text-gray-600">Agents</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-sm p-2 text-center">
            <p className="text-lg font-bold text-gray-900">1</p>
            <p className="text-xs text-gray-600">Orchestrator</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-sm p-2 text-center">
            <p className="text-lg font-bold text-gray-900">{subagents.length}</p>
            <p className="text-xs text-gray-600">Subagents</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-sm p-2 text-center">
            <p className="text-lg font-bold text-gray-900">{team.members.filter(m => m.status === 'active').length}</p>
            <p className="text-xs text-gray-600">Active</p>
          </div>
        </div>
      </div>

      {/* ORG CHART - HIERARCHY BASED (Exclude Tim) */}
      <div className="space-y-8">
        {/* Level 1: Orchestrator */}
        <div className="flex flex-col items-center">
          <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">👑 ORCHESTRATOR</p>
          <div className="grid gap-3 grid-cols-1 max-w-xs">
            {agents.filter(m => m.id === 'lucy').map(member => (
              <TeamTile key={member.id} member={member} />
            ))}
          </div>
        </div>

        {/* Level 2: Command Structure */}
        <div className="flex flex-col items-center">
          <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">📌 COMMAND LAYER</p>
          <div className="grid gap-3 grid-cols-2 max-w-2xl">
            {/* Chief in Command Layer */}
            {subagents.filter(m => m.id === 'chief').map(member => (
              <TeamTile key={member.id} member={member} />
            ))}
            {/* Velma in Command Layer */}
            {subagents.filter(m => m.id === 'velma').map(member => (
              <TeamTile key={member.id} member={member} />
            ))}
          </div>
        </div>

        {/* Level 3: Execution Team (Unified - All agents together, no subdivisions) */}
        <div className="flex flex-col items-center">
          <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">⚡ EXECUTION TEAM</p>
          <div className="grid gap-3 grid-cols-3 max-w-4xl">
            {/* Show all subagents from execution team - no subdivisions */}
            {subagents
              .filter(m => m.team === 'Execution' || (team.structure && team.structure.execution && team.structure.execution.includes(m.id)))
              .map(member => (
                <TeamTile key={member.id} member={member} />
              ))}
          </div>
        </div>

        {/* Tools */}
        {tools.length > 0 && (
          <div className="flex flex-col items-center">
            <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">⚙️ Tools & Services</p>
            <div className={`grid gap-3 ${tools.length === 1 ? 'grid-cols-1 max-w-xs' : 'grid-cols-2'}`}>
              {tools.map(member => (
                <TeamTile key={member.id} member={member} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Reference */}
      <div className="flex justify-center w-full">
        <div className="bg-gray-50 border border-gray-200 rounded-sm p-3 w-full max-w-2xl">
          <p className="text-xs font-semibold text-gray-700 mb-2 uppercase">📋 Quick Reference</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-gray-600 font-medium">Primary Models</p>
              <p className="text-gray-900 mt-1">🧠 Haiku (Daily)</p>
              <p className="text-gray-900">🧠 Opus (Deep Work)</p>
            </div>
            <div>
              <p className="text-gray-600 font-medium">Status Legend</p>
              <p className="text-gray-900 mt-1">🟢 Active 🔄 Idle</p>
              <p className="text-gray-900">⏰ Scheduled 🔴 Offline</p>
            </div>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="flex justify-center w-full">
        <div className="text-xs text-gray-500 border border-gray-200 rounded-sm p-2 bg-white w-full max-w-2xl">
          <p className="font-medium text-gray-600 mb-1">💡 Tip</p>
          <p>Click any team tile to expand and see full details (specialty, capabilities, notes)</p>
        </div>
      </div>
    </div>
  )
}
