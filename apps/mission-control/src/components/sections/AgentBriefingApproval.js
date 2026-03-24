import React, { useState, useEffect } from 'react';

export default function AgentBriefingApproval({
  taskId,
  agentName = 'Agent',
  briefing = {},
  onApprove,
  onRequestChanges,
  onClose,
}) {
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [changeFeedback, setChangeFeedback] = useState('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  // Extract briefing data with defaults
  const {
    title = 'Task Execution Plan',
    description = '',
    deliverables = [],
    milestones = [],
    timeline = '',
    blockers = [],
    estimatedHours = null,
  } = briefing;

  // Handle approval
  const handleApprove = async () => {
    setApproving(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/tasks/${taskId}/briefing/approve`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentName,
            briefing,
            approvedAt: new Date().toISOString(),
          }),
        }
      );

      if (response.ok) {
        onApprove?.();
      } else {
        alert('Error approving briefing');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error: ' + err.message);
    } finally {
      setApproving(false);
    }
  };

  // Handle request for changes
  const handleRequestChanges = async () => {
    if (!changeFeedback.trim()) {
      alert('Please provide feedback for changes');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/tasks/${taskId}/briefing/request-changes`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentName,
            feedback: changeFeedback,
            requestedAt: new Date().toISOString(),
          }),
        }
      );

      if (response.ok) {
        setChangeFeedback('');
        setShowFeedbackForm(false);
        onRequestChanges?.();
      } else {
        alert('Error requesting changes');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      {/* Glasmorphic Overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-md" />

      {/* Modal */}
      <div className="relative bg-white/40 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-white/50 to-blue-50/50 backdrop-blur-lg border-b border-white/20 px-6 py-4 flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">✨</span>
              <h2 className="text-xl font-bold text-gray-900">Agent Execution Plan</h2>
            </div>
            <p className="text-sm text-gray-600">From: <span className="font-semibold">{agentName}</span></p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none transition hover:scale-110"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {/* Task Title & Description */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
            {description && (
              <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
            )}
          </div>

          {/* Timeline Overview */}
          {timeline && (
            <div className="bg-gradient-to-br from-blue-50/60 to-indigo-50/60 backdrop-blur border border-blue-200/40 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">⏱️</span>
                <div>
                  <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide">
                    Timeline Overview
                  </p>
                  <p className="text-sm text-gray-800 mt-1 leading-relaxed">{timeline}</p>
                  {estimatedHours && (
                    <p className="text-xs text-blue-700 mt-2">
                      📌 Estimated: <span className="font-semibold">{estimatedHours} hours</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Deliverables */}
          {deliverables && deliverables.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">📦</span>
                <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Deliverables
                </p>
                <span className="ml-auto px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                  {deliverables.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {deliverables.map((d, idx) => (
                  <div
                    key={idx}
                    className="bg-white/50 backdrop-blur border border-white/40 rounded-lg p-3 hover:bg-white/60 transition"
                  >
                    <p className="text-sm font-semibold text-gray-900">{d.title || `Deliverable ${idx + 1}`}</p>
                    {d.description && (
                      <p className="text-xs text-gray-600 mt-1">{d.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Milestones */}
          {milestones && milestones.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🎯</span>
                <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Milestones
                </p>
                <span className="ml-auto px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                  {milestones.length}
                </span>
              </div>
              <div className="space-y-2">
                {milestones.map((m, idx) => (
                  <div
                    key={idx}
                    className="bg-white/50 backdrop-blur border border-white/40 rounded-lg p-3 hover:bg-white/60 transition flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">✓</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{m.title || `Milestone ${idx + 1}`}</p>
                      </div>
                    </div>
                    {m.dueDate && (
                      <span className="text-xs text-gray-600 whitespace-nowrap ml-4">
                        {new Date(m.dueDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Blockers Warning */}
          {blockers && blockers.length > 0 && (
            <div className="bg-gradient-to-br from-orange-50/60 to-red-50/60 backdrop-blur border border-orange-200/40 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-orange-900 uppercase tracking-wide">
                    Known Blockers & Dependencies
                  </p>
                  <ul className="mt-2 space-y-1">
                    {blockers.map((b, idx) => (
                      <li key={idx} className="text-xs text-gray-800 flex items-start gap-2">
                        <span className="text-orange-600 mt-0.5">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Feedback Form (Hidden by Default) */}
        {showFeedbackForm && (
          <div className="border-t border-white/20 bg-white/30 backdrop-blur px-6 py-4 space-y-3">
            <div>
              <label className="text-sm font-semibold text-gray-900 block mb-2">
                What changes would you like?
              </label>
              <textarea
                value={changeFeedback}
                onChange={(e) => setChangeFeedback(e.target.value)}
                placeholder="Be specific about what needs adjustment..."
                className="w-full px-3 py-2 border border-white/40 bg-white/60 backdrop-blur rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/80 resize-none h-24"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowFeedbackForm(false);
                  setChangeFeedback('');
                }}
                className="px-4 py-2 bg-white/40 hover:bg-white/60 text-gray-900 rounded-lg text-sm font-semibold transition border border-white/40"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestChanges}
                disabled={loading || !changeFeedback.trim()}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition"
              >
                {loading ? '⏳ Sending...' : '📤 Send Feedback'}
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="border-t border-white/20 bg-gradient-to-r from-white/30 to-blue-50/30 backdrop-blur px-6 py-4 flex gap-3 justify-end sticky bottom-0">
          {!showFeedbackForm ? (
            <>
              <button
                onClick={() => setShowFeedbackForm(true)}
                className="px-6 py-2 bg-white/50 hover:bg-white/70 text-gray-900 rounded-lg text-sm font-semibold transition border border-white/40 flex items-center gap-2"
              >
                <span>📝</span>
                Request Changes
              </button>
              <button
                onClick={handleApprove}
                disabled={approving}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 text-white rounded-lg text-sm font-bold transition flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <span>✅</span>
                {approving ? 'Approving...' : 'Approve & Execute'}
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
