import React, { useState, useEffect } from 'react'

export default function DocsSection({ state }) {
  const [docs, setDocs] = useState([])
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  const categories = [
    { id: 'all', label: '📚 All Docs', color: 'bg-gray-100' },
    { id: 'setup', label: '🔧 Setup Guides', color: 'bg-blue-100' },
    { id: 'architecture', label: '🏗️ Architecture', color: 'bg-purple-100' },
    { id: 'deployment', label: '🚀 Deployment', color: 'bg-green-100' },
    { id: 'api', label: '📡 API Docs', color: 'bg-orange-100' },
    { id: 'agent', label: '🤖 Agent Guides', color: 'bg-pink-100' },
    { id: 'automation', label: '⚙️ Automation', color: 'bg-yellow-100' },
    { id: 'project', label: '📋 Projects', color: 'bg-cyan-100' },
    { id: 'other', label: '📄 Other', color: 'bg-gray-100' },
  ]

  useEffect(() => {
    loadDocs()
  }, [])

  const loadDocs = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:3000/api/docs/list')
      if (response.ok) {
        const docsList = await response.json()
        setDocs(docsList)
      }
    } catch (err) {
      console.error('Error loading docs:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredDocs = docs
    .filter(doc => selectedCategory === 'all' || doc.category === selectedCategory)
    .filter(doc => {
      if (!searchQuery) return true
      return (
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })

  const getCategoryColor = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId)
    return cat?.color || 'bg-gray-100'
  }

  const getCategoryLabel = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId)
    return cat?.label || categoryId
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-gray-200 rounded-md p-3 text-center">
          <p className="text-2xl font-bold text-gray-900">{docs.length}</p>
          <p className="text-xs text-gray-600 mt-1">Total Documents</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-md p-3 text-center">
          <p className="text-2xl font-bold text-gray-900">
            {new Set(docs.map(d => d.category)).size}
          </p>
          <p className="text-xs text-gray-600 mt-1">Categories</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-md p-3 text-center">
          <p className="text-2xl font-bold text-gray-900">
            {docs.reduce((sum, d) => sum + (d.lines || 0), 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-600 mt-1">Total Lines</p>
        </div>
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search docs by title, description, or filename..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1 rounded-sm text-xs font-medium transition-all ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white shadow-sm'
                : `${cat.color} text-gray-700 hover:shadow-sm`
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-3 gap-4">
        {/* Doc List */}
        <div className="col-span-1 border border-gray-200 rounded-md overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
            <p className="text-xs font-semibold text-gray-700">
              {filteredDocs.length} Document{filteredDocs.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500 text-xs">
                Loading docs...
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-xs">
                No documents found
              </div>
            ) : (
              filteredDocs.map(doc => (
                <button
                  key={doc.filename}
                  onClick={() => setSelectedDoc(doc)}
                  className={`w-full text-left px-4 py-2 border-b border-gray-100 hover:bg-gray-50 transition-colors text-xs ${
                    selectedDoc?.filename === doc.filename
                      ? 'bg-blue-50 border-l-2 border-l-blue-600'
                      : ''
                  }`}
                >
                  <p className="font-medium text-gray-900 truncate">{doc.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{doc.filename}</p>
                  <div className="mt-1">
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-sm ${getCategoryColor(doc.category)} font-medium`}>
                      {doc.category}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Doc Viewer */}
        <div className="col-span-2 border border-gray-200 rounded-md overflow-hidden">
          {selectedDoc ? (
            <div className="h-96 flex flex-col">
              {/* Header */}
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">{selectedDoc.title}</h3>
                <p className="text-xs text-gray-600 mt-1">
                  📄 {selectedDoc.filename} • {selectedDoc.lines || 0} lines • Updated{' '}
                  {new Date(selectedDoc.modified).toLocaleDateString()}
                </p>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {selectedDoc.preview ? (
                  <pre className="text-xs font-mono text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                    {selectedDoc.preview}
                  </pre>
                ) : (
                  <p className="text-xs text-gray-500">Click "View Full" to read</p>
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex justify-between items-center">
                <span className={`text-xs px-2 py-1 rounded-sm font-medium ${getCategoryColor(selectedDoc.category)}`}>
                  {getCategoryLabel(selectedDoc.category)}
                </span>
                <button className="text-xs bg-blue-600 text-white px-3 py-1 rounded-sm hover:bg-blue-700 transition-colors">
                  View Full
                </button>
              </div>
            </div>
          ) : (
            <div className="h-96 flex items-center justify-center">
              <p className="text-gray-500 text-sm">Select a document to view</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Documents */}
      {docs.length > 0 && (
        <div className="border border-gray-200 rounded-md p-4">
          <p className="text-xs font-semibold text-gray-700 mb-3">📌 Recently Updated</p>
          <div className="space-y-2">
            {docs.slice(0, 5).map((doc) => (
              <button
                key={doc.filename}
                onClick={() => setSelectedDoc(doc)}
                className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-sm transition-colors"
              >
                <p className="text-xs font-medium text-gray-900 truncate">{doc.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(doc.modified).toLocaleDateString()} • {doc.lines} lines
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
