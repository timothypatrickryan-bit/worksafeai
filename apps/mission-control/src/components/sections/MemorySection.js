import React, { useState, useEffect } from 'react'
import missionControlState from '../../../.mission-control-state.json'

export default function MemorySection({ state }) {
  const stateData = state || missionControlState
  const [memories, setMemories] = useState([])
  const [longTermMemory, setLongTermMemory] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMemory, setSelectedMemory] = useState(null)
  const [activeTab, setActiveTab] = useState('daily')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMemories()
  }, []) // Only load once on mount

  const loadMemories = async () => {
    try {
      setLoading(true)

      // Fetch from backend
      const dailyRes = await fetch('/api/memories/load-daily')
      const dailyMemories = await dailyRes.json()
      
      // Set memories array (now returns array of all daily memories)
      if (Array.isArray(dailyMemories) && dailyMemories.length > 0) {
        setMemories(dailyMemories)
        setSelectedMemory(dailyMemories[0]) // Select most recent
      } else {
        setMemories([])
      }

      // Fetch long-term memory
      const longtermRes = await fetch('/api/memories/load-longterm')
      const longtermData = await longtermRes.json()
      
      if (longtermData && longtermData.content) {
        setLongTermMemory(longtermData.content)
      }
    } catch (err) {
      console.error('Error loading memories:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr + 'T00:00:00')
      const options = { weekday: 'short', month: 'short', day: 'numeric' }
      return date.toLocaleDateString('en-US', options)
    } catch {
      return dateStr
    }
  }

  const filteredMemories = (memories || []).filter(memory => {
    if (!searchQuery) return true
    return memory.date.includes(searchQuery) || 
           memory.title?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('daily')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'daily'
              ? 'text-slate-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📅 Daily Notes
        </button>
        <button
          onClick={() => setActiveTab('longterm')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'longterm'
              ? 'text-slate-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📚 Long-Term Memory
        </button>
      </div>

      {/* Daily Notes Tab - Docs-style Layout */}
      {activeTab === 'daily' && (
        <div className="grid grid-cols-3 gap-4">
          {/* Memory List (Left) */}
          <div className="col-span-1 border border-gray-200 rounded-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <p className="text-xs font-semibold text-gray-700">
                {filteredMemories.length} Entry{filteredMemories.length !== 1 ? 'ies' : ''}
              </p>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search memories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded-sm text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Memory Entries List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500 text-xs">
                  Loading memories...
                </div>
              ) : filteredMemories.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-xs">
                  No memories found
                </div>
              ) : (
                filteredMemories.map((memory) => (
                  <button
                    key={memory.date}
                    onClick={() => setSelectedMemory(memory)}
                    className={`w-full text-left px-4 py-2 border-b border-gray-100 hover:bg-gray-50 transition-colors text-xs ${
                      selectedMemory?.date === memory.date
                        ? 'bg-gray-100 border-l-2 border-l-blue-600'
                        : ''
                    }`}
                  >
                    <p className="font-medium text-gray-900">{formatDate(memory.date)}</p>
                    <p className="text-gray-600 text-xs mt-0.5 line-clamp-2">
                      {memory.title || memory.preview?.split('\n')[0] || 'Untitled'}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Memory Viewer (Right) */}
          <div className="col-span-2 border border-gray-200 rounded-md overflow-hidden">
            {selectedMemory ? (
              <div className="h-96 flex flex-col">
                {/* Header */}
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">
                    {selectedMemory.title || formatDate(selectedMemory.date)}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
                    📄 {selectedMemory.filename}
                  </p>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                  <pre className="text-xs font-mono text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                    {selectedMemory.content}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center">
                <p className="text-gray-500 text-sm">Select a memory to view</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Long-Term Memory Tab */}
      {activeTab === 'longterm' && (
        <div className="grid grid-cols-3 gap-4">
          {/* Long-Term Memory List (Left) */}
          <div className="col-span-1 border border-gray-200 rounded-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <p className="text-xs font-semibold text-gray-700">📚 Long-Term Memory</p>
            </div>

            <div className="p-3 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search MEMORY.md..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded-sm text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="p-3">
              <p className="text-xs text-gray-600 font-medium mb-2">📄 MEMORY.md</p>
              <p className="text-xs text-gray-700">
                Your curated long-term memory and life context
              </p>
            </div>
          </div>

          {/* Long-Term Memory Viewer (Right) */}
          <div className="col-span-2 border border-gray-200 rounded-md overflow-hidden">
            {loading ? (
              <div className="h-96 flex items-center justify-center">
                <p className="text-gray-500 text-sm">Loading long-term memory...</p>
              </div>
            ) : !longTermMemory ? (
              <div className="h-96 flex items-center justify-center">
                <p className="text-gray-500 text-sm">No long-term memory loaded</p>
              </div>
            ) : (
              <div className="h-96 flex flex-col">
                {/* Header */}
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">MEMORY.md</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    📄 Your curated long-term memory
                  </p>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                  <pre className="text-xs font-mono text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                    {longTermMemory}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      {activeTab === 'daily' && memories.length > 0 && !loading && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-gray-200 rounded-md p-3 text-center">
            <p className="text-lg font-bold text-gray-900">{memories.length}</p>
            <p className="text-xs text-gray-600 mt-1">Daily entries</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-md p-3 text-center">
            <p className="text-lg font-bold text-gray-900">{memories[0]?.date || 'N/A'}</p>
            <p className="text-xs text-gray-600 mt-1">Latest entry</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-md p-3 text-center">
            <p className="text-lg font-bold text-gray-900">
              {memories.reduce((sum, m) => sum + (m.lines || 0), 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-600 mt-1">Total lines</p>
          </div>
        </div>
      )}
    </div>
  )
}
