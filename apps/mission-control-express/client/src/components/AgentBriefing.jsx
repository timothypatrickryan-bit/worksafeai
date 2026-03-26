import { useState, useEffect } from 'react';

export default function AgentBriefing() {
  const [briefings, setBriefings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [selectedBriefing, setSelectedBriefing] = useState(null);
  const [newBriefing, setNewBriefing] = useState('');
  const [newBriefingType, setNewBriefingType] = useState('Work Briefing');

  // Load briefings on mount
  useEffect(() => {
    fetchBriefings();
  }, []);

  const fetchBriefings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/briefings');
      if (!res.ok) throw new Error('Failed to fetch briefings');
      const data = await res.json();
      setBriefings(data.briefings || []);
    } catch (err) {
      console.error('Failed to load briefings:', err);
      setBriefings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBriefing = async (id) => {
    try {
      const res = await fetch(`/api/briefings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved', actionRequired: null }),
      });
      if (!res.ok) throw new Error('Failed to approve');
      await fetchBriefings();
    } catch (err) {
      console.error('Failed to approve briefing:', err);
    }
  };

  const handleRejectBriefing = (id) => {
    setSelectedBriefing(id);
  };

  const handleSubmitRejection = async (id) => {
    if (!feedback.trim()) return;
    try {
      const res = await fetch(`/api/briefings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected',
          userFeedback: feedback,
          actionRequired: 'Provide feedback',
        }),
      });
      if (!res.ok) throw new Error('Failed to reject');
      setFeedback('');
      setSelectedBriefing(null);
      await fetchBriefings();
    } catch (err) {
      console.error('Failed to reject briefing:', err);
    }
  };

  const handleAddFeedback = async (id) => {
    if (!feedback.trim()) return;
    try {
      const res = await fetch(`/api/briefings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'feedback-received',
          userFeedback: feedback,
          actionRequired: null,
        }),
      });
      if (!res.ok) throw new Error('Failed to add feedback');
      setFeedback('');
      setSelectedBriefing(null);
      await fetchBriefings();
    } catch (err) {
      console.error('Failed to add feedback:', err);
    }
  };

  const handleRequestClarification = async () => {
    if (!newBriefing.trim()) return;
    try {
      const res = await fetch('/api/briefings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'Status Request',
          title: newBriefing,
          description: 'Awaiting your response...',
          actionRequired: 'Respond',
        }),
      });
      if (!res.ok) throw new Error('Failed to create briefing');
      setNewBriefing('');
      await fetchBriefings();
    } catch (err) {
      console.error('Failed to create briefing:', err);
    }
  };

  const pendingBriefings = briefings.filter((b) => b.actionRequired);
  const statusLabels = {
    'approved': '✅ Approved',
    'rejected': '❌ Rejected',
    'feedback-received': '📝 Feedback Received',
    'awaiting-approval': '⏳ Awaiting Approval',
    'pending-response': '⏳ Awaiting Response',
  };

  return (
    <div className="space-y-4">
      {/* Alert Banner if actions needed */}
      {pendingBriefings.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded p-4">
          <h3 className="text-sm font-bold text-blue-900">
            ⚠️ {pendingBriefings.length} Action(s) Required
          </h3>
          <p className="text-xs text-blue-700 mt-1">
            Lucy needs approval, feedback, or clarification to proceed.
          </p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-8 text-gray-500">Loading briefings...</div>
      )}

      {/* Briefing Cards */}
      {!loading && (
        <div className="space-y-3">
          {briefings.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">No briefings yet</div>
          ) : (
            briefings.map((briefing) => (
              <div
                key={briefing.id}
                className={`rounded border p-4 ${
                  briefing.status === 'approved'
                    ? 'bg-green-50 border-green-200'
                    : briefing.status === 'rejected'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-white border-gray-200'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-xs font-bold text-gray-600 uppercase">{briefing.type}</div>
                    <h3 className="text-sm font-bold text-gray-900 mt-1">{briefing.title}</h3>
                  </div>
                  <div
                    className={`text-xs font-bold px-2 py-1 rounded whitespace-nowrap ${
                      briefing.status === 'approved'
                        ? 'bg-green-200 text-green-900'
                        : briefing.status === 'rejected'
                        ? 'bg-red-200 text-red-900'
                        : briefing.status === 'feedback-received'
                        ? 'bg-blue-200 text-blue-900'
                        : 'bg-yellow-200 text-yellow-900'
                    }`}
                  >
                    {statusLabels[briefing.status] || briefing.status}
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-3">{briefing.description}</p>

                {/* User Feedback (if provided) */}
                {briefing.userFeedback && (
                  <div className="bg-gray-100 rounded p-2 mb-3 border border-gray-300">
                    <div className="text-xs font-bold text-gray-700">Your Feedback:</div>
                    <div className="text-xs text-gray-600 mt-1">{briefing.userFeedback}</div>
                  </div>
                )}

                {/* Actions */}
                {briefing.actionRequired === 'Approve/Reject' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveBriefing(briefing.id)}
                      className="flex-1 px-3 py-2 bg-green-500 text-white text-xs font-bold rounded hover:bg-green-600 transition"
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => handleRejectBriefing(briefing.id)}
                      className="flex-1 px-3 py-2 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600 transition"
                    >
                      ❌ Reject
                    </button>
                  </div>
                )}

                {briefing.actionRequired === 'Provide feedback' && (
                  <div className="space-y-2">
                    <textarea
                      value={selectedBriefing === briefing.id ? feedback : ''}
                      onChange={(e) => setFeedback(e.target.value)}
                      onFocus={() => setSelectedBriefing(briefing.id)}
                      placeholder="Why did you reject this? What should change?"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:border-red-400"
                      rows="2"
                    />
                    {selectedBriefing === briefing.id && (
                      <button
                        onClick={() => handleSubmitRejection(briefing.id)}
                        className="px-3 py-2 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600 transition"
                      >
                        Submit Feedback
                      </button>
                    )}
                  </div>
                )}

                {briefing.actionRequired === 'Respond' && (
                  <div className="space-y-2">
                    <textarea
                      value={selectedBriefing === briefing.id ? feedback : ''}
                      onChange={(e) => setFeedback(e.target.value)}
                      onFocus={() => setSelectedBriefing(briefing.id)}
                      placeholder="Provide your response or guidance..."
                      className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:border-blue-400"
                      rows="2"
                    />
                    {selectedBriefing === briefing.id && (
                      <button
                        onClick={() => handleAddFeedback(briefing.id)}
                        className="px-3 py-2 bg-blue-500 text-white text-xs font-bold rounded hover:bg-blue-600 transition"
                      >
                        Send Response
                      </button>
                    )}
                  </div>
                )}

                {/* Metadata */}
                <div className="text-xs text-gray-500 mt-3 border-t border-gray-200 pt-2">
                  <span>{briefing.agent}</span> • <span>{new Date(briefing.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Request Clarification/Status Section */}
      <div className="bg-white rounded border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-2">💬 Create New Briefing</h3>
        <p className="text-xs text-gray-600 mb-3">
          Ask Lucy for clarification, status updates, or provide guidance on current work.
        </p>
        <div className="flex gap-2 mb-3">
          <select
            value={newBriefingType}
            onChange={(e) => setNewBriefingType(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-400"
          >
            <option>Work Briefing</option>
            <option>Status Request</option>
          </select>
          <input
            type="text"
            value={newBriefing}
            onChange={(e) => setNewBriefing(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleRequestClarification()}
            placeholder="e.g., 'Status on Mission Control features?'"
            className="flex-1 px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-400"
          />
          <button
            onClick={handleRequestClarification}
            className="px-4 py-2 bg-blue-500 text-white text-xs font-bold rounded hover:bg-blue-600 transition"
          >
            Create
          </button>
        </div>
      </div>

      {/* Summary */}
      {!loading && (
        <div className="bg-gray-50 rounded border border-gray-200 p-3">
          <div className="text-xs font-bold text-gray-700">Briefing Summary</div>
          <div className="text-xs text-gray-600 mt-2 space-y-1">
            <div>✅ Approved: {briefings.filter((b) => b.status === 'approved').length}</div>
            <div>⏳ Awaiting Action: {pendingBriefings.length}</div>
            <div>📋 Total: {briefings.length}</div>
          </div>
        </div>
      )}
    </div>
  );
}
