import React, { useState, useEffect } from 'react';

export default function BriefingsSection({ state, ws }) {
  const [briefings, setBriefings] = useState([]);
  const [selectedBriefing, setSelectedBriefing] = useState(null);
  const [approving, setApproving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    loadBriefings();
  }, []);

  const loadBriefings = async () => {
    try {
      setLoading(true);
      // Fetch from backend API
      const response = await fetch('http://localhost:3000/api/status');
      if (response.ok) {
        const data = await response.json();
        // Filter for briefing status tasks
        const pending = (data.tasks || [])
          .filter(t => t.status === 'briefing' && t.briefing)
          .map(t => ({
            id: t.id,
            taskId: t.id,
            title: t.title,
            description: t.description,
            agent: t.assignedTo,
            briefing: t.briefing,
            createdAt: t.createdAt,
          }));
        setBriefings(pending);
        if (pending.length > 0) {
          setSelectedBriefing(pending[0]);
        }
      }
    } catch (err) {
      console.error('Error loading briefings:', err);
      // Fallback: extract from state prop
      if (state?.tasks) {
        const pending = state.tasks
          .filter(t => t.status === 'briefing' && t.briefing)
          .map(t => ({
            id: t.id,
            taskId: t.id,
            title: t.title,
            description: t.description,
            agent: t.assignedTo,
            briefing: t.briefing,
            createdAt: t.createdAt,
          }));
        setBriefings(pending);
        if (pending.length > 0) {
          setSelectedBriefing(pending[0]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const approveBriefing = async (briefingId) => {
    try {
      setApproving(true);
      setStatusMessage(null);
      
      const briefing = briefings.find(b => b.id === briefingId);
      
      // Call the approve endpoint
      const response = await fetch(
        `http://localhost:3000/api/tasks/${briefingId}/approve`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            approvedAt: new Date().toISOString()
          }),
        }
      );

      if (response.ok) {
        setStatusMessage({
          type: 'success',
          text: `✅ "${briefing?.title}" approved! ${briefing?.agent} will begin execution.`
        });
        
        // Remove from list and show next
        const remaining = briefings.filter(x => x.id !== briefingId);
        setBriefings(remaining);
        if (remaining.length > 0) {
          setSelectedBriefing(remaining[0]);
        } else {
          setSelectedBriefing(null);
        }
        
        // Auto-hide message after 5 seconds
        setTimeout(() => setStatusMessage(null), 5000);
      } else {
        const errorText = await response.text();
        setStatusMessage({
          type: 'error',
          text: `❌ Failed to approve: ${errorText}`
        });
        console.error('Response:', response.status, errorText);
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: `❌ Error: ${err.message}`
      });
      console.error('Error approving briefing:', err);
    } finally {
      setApproving(false);
    }
  };

  const rejectBriefing = async (briefingId) => {
    try {
      setApproving(true);
      setStatusMessage(null);
      
      const briefing = briefings.find(b => b.id === briefingId);
      
      // Call the reject endpoint
      const response = await fetch(
        `http://localhost:3000/api/tasks/${briefingId}/reject`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            rejectedAt: new Date().toISOString()
          }),
        }
      );

      if (response.ok) {
        setStatusMessage({
          type: 'error',
          text: `❌ "${briefing?.title}" rejected.`
        });
        
        const remaining = briefings.filter(x => x.id !== briefingId);
        setBriefings(remaining);
        if (remaining.length > 0) {
          setSelectedBriefing(remaining[0]);
        } else {
          setSelectedBriefing(null);
        }
        
        // Auto-hide message after 5 seconds
        setTimeout(() => setStatusMessage(null), 5000);
      } else {
        const errorText = await response.text();
        setStatusMessage({
          type: 'error',
          text: `Failed to reject: ${errorText}`
        });
        console.error('Response:', response.status, errorText);
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: `Error: ${err.message}`
      });
      console.error('Error rejecting briefing:', err);
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading briefings...</div>;
  }

  if (briefings.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-600 p-4 rounded">
          <h2 className="text-lg font-bold text-gray-900">✅ No Pending Briefings</h2>
          <p className="text-xs text-gray-600 mt-1">All briefings have been approved or rejected.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Message */}
      {statusMessage && (
        <div className={`p-4 rounded border-l-4 ${
          statusMessage.type === 'success'
            ? 'bg-green-50 border-green-600 text-green-900'
            : 'bg-red-50 border-red-600 text-red-900'
        }`}>
          <p className="text-sm font-medium">{statusMessage.text}</p>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-600 p-4 rounded">
        <h2 className="text-lg font-bold text-gray-900">📋 Agent Briefings</h2>
        <p className="text-xs text-gray-600 mt-1">Review and approve execution plans for assigned agents</p>
        <p className="text-xs text-gray-500 mt-2">{briefings.length} briefing{briefings.length !== 1 ? 's' : ''} awaiting approval</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Briefings List */}
        <div className="col-span-1">
          <div className="space-y-2">
            {briefings.map(b => (
              <button
                key={b.id}
                onClick={() => setSelectedBriefing(b)}
                className={`w-full text-left p-3 rounded border transition ${
                  selectedBriefing?.id === b.id
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="text-sm font-medium text-gray-900 truncate">{b.title}</p>
                <p className="text-xs text-gray-500 mt-1">→ {b.agent}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Briefing Details */}
        <div className="col-span-2">
          {selectedBriefing && (
            <div className="space-y-4 bg-white border border-gray-200 rounded-lg p-6">
              {/* Title & Agent */}
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedBriefing.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedBriefing.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Assigned to: <span className="font-semibold">{selectedBriefing.agent}</span>
                </p>
              </div>

              {/* Execution Plan */}
              {selectedBriefing.briefing?.executionPlan && (
                <div className="space-y-3 border-t border-gray-200 pt-4">
                  {/* Timeline */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <p className="text-xs font-semibold text-yellow-900 uppercase">Timeline</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      {selectedBriefing.briefing.executionPlan.timeline?.summary || 'N/A'}
                    </p>
                  </div>

                  {/* Deliverables */}
                  {selectedBriefing.briefing.executionPlan.deliverables && (
                    <div>
                      <p className="text-xs font-semibold text-gray-900 uppercase mb-2">Deliverables</p>
                      <ul className="space-y-1">
                        {selectedBriefing.briefing.executionPlan.deliverables.map((d, i) => (
                          <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                            <span className="text-gray-400 mt-0.5">•</span>
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Milestones */}
                  {selectedBriefing.briefing.executionPlan.milestones && (
                    <div>
                      <p className="text-xs font-semibold text-gray-900 uppercase mb-2">Milestones</p>
                      <div className="space-y-1">
                        {selectedBriefing.briefing.executionPlan.milestones.map((m, i) => (
                          <div key={i} className="text-xs bg-gray-50 border border-gray-200 rounded p-2">
                            <p className="font-medium text-gray-900">{m.name}</p>
                            <p className="text-gray-600">{m.description}</p>
                            <p className="text-gray-500 text-xs mt-1">~{m.estimatedDays} days</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 border-t border-gray-200 pt-4">
                <button
                  onClick={() => approveBriefing(selectedBriefing.id)}
                  disabled={approving}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition disabled:opacity-50"
                >
                  {approving ? 'Approving...' : '✅ Approve & Execute'}
                </button>
                <button
                  onClick={() => rejectBriefing(selectedBriefing.id)}
                  disabled={approving}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition disabled:opacity-50"
                >
                  {approving ? 'Processing...' : '❌ Reject'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
