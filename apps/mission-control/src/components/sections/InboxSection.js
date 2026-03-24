import React, { useState } from 'react'

export default function InboxSection({ state }) {
  const inbox = state?.inbox || []
  const [sending, setSending] = useState(null)

  const handleSend = async (id) => {
    setSending(id)
    try {
      await fetch(`http://localhost:3000/api/inbox/send/${id}`, {
        method: 'POST',
      })
    } catch (err) {
      console.error('Error sending item:', err)
    }
    setSending(null)
  }

  if (inbox.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-sm">No inbox items</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {inbox.map((item) => {
        const isReady = item.status === 'ready-to-send'
        
        return (
          <div 
            key={item.id} 
            className={`border rounded-md p-4 transition-all ${
              isReady
                ? 'border-blue-200 bg-blue-50 hover:border-blue-300'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                  <span className="text-gray-700">{item.from}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-gray-700">{item.to}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1 truncate">"{item.message}"</p>
                <p className="text-xs text-gray-500 mt-1">
                  {item.type} • {new Date(item.timestamp).toLocaleTimeString()}
                </p>
              </div>

              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                <span className={`text-xs font-semibold px-2 py-1 rounded-sm ${
                  isReady 
                    ? 'bg-blue-200 text-blue-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {item.status === 'ready-to-send' ? 'Ready' : 'Sent'}
                </span>
                
                {isReady && (
                  <button
                    onClick={() => handleSend(item.id)}
                    disabled={sending === item.id}
                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {sending === item.id ? '...' : 'Send'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
