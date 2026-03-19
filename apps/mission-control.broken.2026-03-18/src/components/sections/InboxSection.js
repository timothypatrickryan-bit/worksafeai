import { useState } from 'react';

const InboxSection = ({ state }) => {
  const messages = state?.inbox || [];
  const [sending, setSending] = useState({});

  const handleSend = async (messageId) => {
    setSending((prev) => ({ ...prev, [messageId]: true }));
    try {
      const response = await fetch('http://localhost:3000/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId }),
      });
      if (response.ok) {
        console.log('✅ Message sent:', messageId);
      }
    } catch (error) {
      console.error('❌ Failed to send message:', error);
    } finally {
      setSending((prev) => ({ ...prev, [messageId]: false }));
    }
  };

  if (!messages || messages.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary text-lg">No messages in inbox</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-dark mb-6">📥 Inbox ({messages.length})</h2>

      <div className="space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-dark">{message.title}</h3>
                <p className="text-xs text-secondary mt-1">{message.recipient}</p>
              </div>
              <div
                className={`px-2 py-1 rounded text-xs font-medium ${
                  message.channel === 'telegram'
                    ? 'bg-blue-100 text-primary'
                    : message.channel === 'email'
                    ? 'bg-gray-100 text-secondary'
                    : 'bg-gray-100 text-secondary'
                }`}
              >
                {message.channel}
              </div>
            </div>

            {/* Message Preview */}
            <div className="mb-4 p-3 bg-gray-50 rounded-md max-h-24 overflow-y-auto">
              <p className="text-sm text-dark whitespace-pre-wrap">{message.preview}</p>
            </div>

            {/* Action Button */}
            <div className="flex justify-end">
              <button
                onClick={() => handleSend(message.id)}
                disabled={sending[message.id]}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  sending[message.id]
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-blue-700'
                }`}
              >
                {sending[message.id] ? '⏳ Sending...' : '✉️ Send'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InboxSection;
