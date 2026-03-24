import React, { useState } from 'react';

export default function AgentBriefingForm({ taskId, agentName, onSubmit, onCancel }) {
  const [deliverables, setDeliverables] = useState([{ title: '', description: '' }]);
  const [timeline, setTimeline] = useState('');
  const [milestones, setMilestones] = useState([{ title: '', dueDate: '' }]);
  const [blockers, setBlockers] = useState(['']);
  const [submitting, setSubmitting] = useState(false);

  const addDeliverable = () => {
    setDeliverables([...deliverables, { title: '', description: '' }]);
  };

  const removeDeliverable = (idx) => {
    setDeliverables(deliverables.filter((_, i) => i !== idx));
  };

  const updateDeliverable = (idx, field, value) => {
    const updated = [...deliverables];
    updated[idx][field] = value;
    setDeliverables(updated);
  };

  const addMilestone = () => {
    setMilestones([...milestones, { title: '', dueDate: '' }]);
  };

  const removeMilestone = (idx) => {
    setMilestones(milestones.filter((_, i) => i !== idx));
  };

  const updateMilestone = (idx, field, value) => {
    const updated = [...milestones];
    updated[idx][field] = value;
    setMilestones(updated);
  };

  const updateBlocker = (idx, value) => {
    const updated = [...blockers];
    updated[idx] = value;
    setBlockers(updated);
  };

  const removeBlocker = (idx) => {
    setBlockers(blockers.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(`http://localhost:3000/api/tasks/${taskId}/briefing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent: agentName,
          deliverables: deliverables.filter(d => d.title),
          timeline,
          milestones: milestones.filter(m => m.title),
          blockers: blockers.filter(b => b),
        }),
      });

      if (response.ok) {
        alert('✅ Execution plan submitted!');
        onSubmit?.();
      } else {
        alert('Error submitting plan');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200 p-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Execution Plan</h2>
            <p className="text-xs text-gray-600 mt-1">From: {agentName}</p>
          </div>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">
            ✕
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Deliverables */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs font-semibold text-gray-700 uppercase">📦 Deliverables</p>
              <button
                onClick={addDeliverable}
                className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
              >
                + Add
              </button>
            </div>
            <div className="space-y-2">
              {deliverables.map((d, idx) => (
                <div key={idx} className="space-y-1">
                  <input
                    type="text"
                    placeholder="Deliverable title"
                    value={d.title}
                    onChange={(e) => updateDeliverable(idx, 'title', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:border-green-500"
                  />
                  <textarea
                    placeholder="Description"
                    value={d.description}
                    onChange={(e) => updateDeliverable(idx, 'description', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs resize-none h-8 focus:outline-none focus:border-green-500"
                  />
                  {deliverables.length > 1 && (
                    <button
                      onClick={() => removeDeliverable(idx)}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <p className="text-xs font-semibold text-gray-700 uppercase mb-2">⏱️ Overall Timeline</p>
            <textarea
              placeholder="e.g., 'Complete within 2 weeks. Phase 1: Research (3 days), Phase 2: Analysis (5 days), Phase 3: Delivery (4 days)'"
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-xs resize-none h-12 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Milestones */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs font-semibold text-gray-700 uppercase">🎯 Milestones</p>
              <button
                onClick={addMilestone}
                className="text-xs bg-slate-600 text-white px-2 py-1 rounded hover:bg-slate-700"
              >
                + Add
              </button>
            </div>
            <div className="space-y-2">
              {milestones.map((m, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Milestone title"
                    value={m.title}
                    onChange={(e) => updateMilestone(idx, 'title', e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="date"
                    value={m.dueDate}
                    onChange={(e) => updateMilestone(idx, 'dueDate', e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:border-blue-500"
                  />
                  {milestones.length > 1 && (
                    <button
                      onClick={() => removeMilestone(idx)}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Blockers */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs font-semibold text-gray-700 uppercase">⚠️ Known Blockers</p>
              <button
                onClick={() => setBlockers([...blockers, ''])}
                className="text-xs bg-orange-600 text-white px-2 py-1 rounded hover:bg-orange-700"
              >
                + Add
              </button>
            </div>
            <div className="space-y-2">
              {blockers.map((b, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Potential blocker or dependency"
                    value={b}
                    onChange={(e) => updateBlocker(idx, e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:border-orange-500"
                  />
                  {blockers.length > 1 && (
                    <button
                      onClick={() => removeBlocker(idx)}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 bg-gray-50 p-4 flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm font-medium hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {submitting ? '✨ Submitting...' : '✅ Submit Plan'}
          </button>
        </div>
      </div>
    </div>
  );
}
