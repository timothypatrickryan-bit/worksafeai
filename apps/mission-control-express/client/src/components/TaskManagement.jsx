import { useState, useEffect } from 'react';

export default function TaskManagement({ projectId, tasks, onTaskUpdate }) {
  const [feedback, setFeedback] = useState('');
  const [focusedTaskIds, setFocusedTaskIds] = useState(new Set());
  const [adjustments, setAdjustments] = useState([]);
  const [showAdjustmentLog, setShowAdjustmentLog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ackNote, setAckNote] = useState('');
  const [ackingAdjId, setAckingAdjId] = useState(null);

  const statusOptions = ['⏳', '✅', '🔵'];
  const statusLabels = { '⏳': 'In Progress', '✅': 'Complete', '🔵': 'Queued' };

  // Load focused tasks and adjustments on mount
  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load focused tasks
      const focusRes = await fetch(`/api/projects/${projectId}/focused-tasks`);
      if (focusRes.ok) {
        const focusData = await focusRes.json();
        setFocusedTaskIds(new Set(focusData.focusedTasks || []));
      }

      // Load adjustments
      const adjRes = await fetch(`/api/projects/${projectId}/adjustments`);
      if (adjRes.ok) {
        const adjData = await adjRes.json();
        setAdjustments(adjData.adjustments || []);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskStatusChange = async (taskName, newStatus) => {
    // Log to backend
    try {
      await fetch(`/api/projects/${projectId}/adjustments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'Status Change',
          task: taskName,
          action: `Changed to ${statusLabels[newStatus]}`,
        }),
      });
      // Reload adjustments
      loadData();
    } catch (err) {
      console.error('Failed to log adjustment:', err);
    }

    onTaskUpdate?.(taskName, { status: newStatus });
  };

  const handleAddFeedback = async (taskName) => {
    if (!feedback.trim()) return;

    try {
      await fetch(`/api/projects/${projectId}/adjustments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'Feedback',
          task: taskName,
          action: feedback,
        }),
      });
      // Reload adjustments
      loadData();
    } catch (err) {
      console.error('Failed to log feedback:', err);
    }

    setFeedback('');
  };

  const handleFocusTask = async (taskIndex) => {
    const newFocused = new Set(focusedTaskIds);
    try {
      if (newFocused.has(taskIndex)) {
        newFocused.delete(taskIndex);
        await fetch(`/api/projects/${projectId}/focused-tasks/${taskIndex}`, {
          method: 'DELETE',
        });
      } else {
        newFocused.add(taskIndex);
        await fetch(`/api/projects/${projectId}/focused-tasks/${taskIndex}`, {
          method: 'POST',
        });
      }
      setFocusedTaskIds(newFocused);
    } catch (err) {
      console.error('Failed to update focus:', err);
    }
  };

  const handleAcknowledgeAdjustment = async (adjId) => {
    if (!ackNote.trim()) return;
    try {
      await fetch(`/api/projects/${projectId}/adjustments/${adjId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acknowledgmentNote: ackNote }),
      });
      setAckNote('');
      setAckingAdjId(null);
      loadData(); // Reload
    } catch (err) {
      console.error('Failed to acknowledge:', err);
    }
  };

  if (loading) {
    return <div className="text-gray-500 text-sm">Loading task controls...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Quick Adjustment Controls */}
      <div className="bg-white rounded border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3">🎯 Quick Adjustments</h3>

        {/* Add Feedback Input */}
        <div className="space-y-2 mb-4">
          <label className="text-xs font-semibold text-gray-700">Add Project Feedback</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddFeedback('Project')}
              placeholder="Add feedback, notes, or adjustments..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-400"
            />
            <button
              onClick={() => handleAddFeedback('Project')}
              className="px-3 py-2 bg-blue-500 text-white text-xs font-semibold rounded hover:bg-blue-600 transition"
            >
              Add
            </button>
          </div>
        </div>

        {/* Task Controls */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-700">Task Status Control</label>
          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
            {tasks?.map((task, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                <div className="flex-1">
                  <div className="text-xs font-semibold text-gray-900">{task.name}</div>
                  <div className="text-xs text-gray-600">{task.assignee}</div>
                </div>
                <div className="flex gap-1">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleTaskStatusChange(task.name, status)}
                      className={`text-lg px-2 py-1 rounded transition ${
                        task.status === status ? 'bg-blue-100' : 'hover:bg-gray-200'
                      }`}
                      title={statusLabels[status]}
                    >
                      {status}
                    </button>
                  ))}
                  <button
                    onClick={() => handleFocusTask(i)}
                    className={`text-lg px-2 py-1 rounded transition ${
                      focusedTaskIds.has(i) ? 'bg-yellow-100' : 'hover:bg-gray-200'
                    }`}
                    title="Focus on this task"
                  >
                    ⭐
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Focused Tasks */}
      {focusedTaskIds.size > 0 && (
        <div className="bg-yellow-50 rounded border border-yellow-200 p-4">
          <h3 className="text-sm font-bold text-yellow-900 mb-2">⭐ Focused Tasks</h3>
          {tasks && tasks.map((task, i) => 
            focusedTaskIds.has(i) ? (
              <div key={i} className="p-3 bg-white rounded border border-yellow-200 mb-2">
                <div className="text-sm font-bold text-gray-900">{task.name}</div>
                <div className="text-xs text-gray-600 mt-1">{task.assignee}</div>
                <div className="text-xs text-yellow-700 mt-2">
                  This task is prioritized. Make it a focal point until marked complete.
                </div>
              </div>
            ) : null
          )}
        </div>
      )}

      {/* Adjustment Log */}
      <div className="bg-white rounded border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900">📋 Adjustment Log</h3>
          <button
            onClick={() => setShowAdjustmentLog(!showAdjustmentLog)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            {showAdjustmentLog ? 'Hide' : `Show (${adjustments.length})`}
          </button>
        </div>

        {showAdjustmentLog && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {adjustments.length === 0 ? (
              <p className="text-xs text-gray-500">No adjustments yet</p>
            ) : (
              [...adjustments].reverse().map((adj, i) => (
                <div key={i} className={`p-2 rounded border text-xs ${
                  adj.acknowledgedBy 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{adj.type}</div>
                      <div className="text-gray-700">{adj.task} — {adj.action}</div>
                    </div>
                    {adj.acknowledgedBy && (
                      <div className="text-green-700 font-bold text-xs">✅</div>
                    )}
                  </div>
                  
                  {adj.acknowledgedBy ? (
                    <div className="mt-2 pt-2 border-t border-green-200">
                      <div className="text-green-700 font-semibold">✅ Lucy acknowledged:</div>
                      <div className="text-green-600 mt-1">{adj.acknowledgmentNote}</div>
                      <div className="text-gray-500 text-xs mt-1">
                        {new Date(adj.acknowledgmentTime).toLocaleString()}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <div className="text-yellow-700 font-semibold">⏳ Awaiting Lucy's acknowledgment</div>
                      {ackingAdjId === adj.id ? (
                        <div className="mt-2 space-y-2">
                          <textarea
                            value={ackNote}
                            onChange={(e) => setAckNote(e.target.value)}
                            placeholder="How I'm taking action on this feedback..."
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:border-blue-400"
                            rows="2"
                          />
                          <button
                            onClick={() => handleAcknowledgeAdjustment(adj.id)}
                            className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded hover:bg-blue-600 transition"
                          >
                            Acknowledge & Document Action
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAckingAdjId(adj.id)}
                          className="mt-1 text-xs text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          → Lucy: Click to acknowledge
                        </button>
                      )}
                    </div>
                  )}
                  
                  <div className="text-gray-500 text-xs mt-1">
                    Created: {new Date(adj.timestamp).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
