import React, { useState, useEffect } from 'react';

export default function TaskDetailsPanel({ taskId, onClose }) {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadTaskDetails();
  }, [taskId]);

  const loadTaskDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/tasks/${taskId}`);
      if (response.ok) {
        const data = await response.json();
        setTask(data);
      }
    } catch (err) {
      console.error('Error loading task:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading task details...</div>;
  }

  if (!task) {
    return <div className="p-6 text-center text-gray-500">Task not found</div>;
  }

  const { task: taskData, delegation, agent, lucyPlan, agentBriefing } = task;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-300 shadow-lg overflow-y-auto z-50">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 p-4 flex justify-between items-start">
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-900">{taskData.title}</h2>
          <p className="text-xs text-gray-600 mt-1">
            {taskData.status.toUpperCase()} • {taskData.category || 'general'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 sticky top-16 bg-white">
        {['overview', 'lucy-plan', 'agent-plan', 'progress'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-3 text-xs font-medium border-b-2 transition ${
              activeTab === tab
                ? 'border-blue-600 text-slate-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'overview' && '📋 Overview'}
            {tab === 'lucy-plan' && '🧠 Lucy\'s Plan'}
            {tab === 'agent-plan' && '📊 Agent Plan'}
            {tab === 'progress' && '📈 Progress'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Task Details */}
            <div>
              <p className="text-xs font-semibold text-gray-700 uppercase mb-2">Task Description</p>
              <p className="text-sm text-gray-800 leading-relaxed">{taskData.description}</p>
            </div>

            {/* Assigned Agent */}
            {agent && (
              <div className="bg-gray-100 border border-blue-200 rounded p-3">
                <p className="text-xs font-semibold text-gray-900 uppercase mb-2">Assigned To</p>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                  <p className="text-xs text-slate-700">{agent.title}</p>
                  <p className="text-xs text-slate-600 mt-1">{agent.specialty}</p>
                </div>
              </div>
            )}

            {/* Task Metadata */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold text-gray-700 uppercase">Created</p>
                <p className="text-xs text-gray-600 mt-1">{new Date(taskData.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-700 uppercase">Status</p>
                <p className="text-xs text-gray-600 mt-1 capitalize">{taskData.status}</p>
              </div>
              {taskData.dueDate && (
                <div>
                  <p className="text-xs font-semibold text-gray-700 uppercase">Due</p>
                  <p className="text-xs text-gray-600 mt-1">{new Date(taskData.dueDate).toLocaleDateString()}</p>
                </div>
              )}
              {delegation && (
                <div>
                  <p className="text-xs font-semibold text-gray-700 uppercase">Match Score</p>
                  <p className="text-xs text-gray-600 mt-1">{delegation.matchScore}/10</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lucy's Plan Tab */}
        {activeTab === 'lucy-plan' && lucyPlan && (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded p-3">
              <p className="text-xs font-semibold text-purple-900 uppercase mb-2">Lucy's Analysis</p>
              <div className="space-y-2 text-sm text-purple-900">
                <p><strong>Category:</strong> {lucyPlan.category}</p>
                <p><strong>Primary Match:</strong> {lucyPlan.primaryAgent.name} ({lucyPlan.primaryAgent.matchScore}/10)</p>
                <p><strong>Reason:</strong> {lucyPlan.primaryAgent.reason}</p>
              </div>
            </div>

            {lucyPlan.subtasks && lucyPlan.subtasks.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-700 uppercase mb-2">Subtasks</p>
                <div className="space-y-2">
                  {lucyPlan.subtasks.map((subtask, idx) => (
                    <div key={idx} className="bg-gray-50 border border-gray-200 rounded p-2">
                      <p className="text-xs font-medium text-gray-800">{subtask.phase}</p>
                      <p className="text-xs text-gray-600 mt-1">{subtask.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Agent Plan Tab */}
        {activeTab === 'agent-plan' && (
          <div className="space-y-4">
            {agentBriefing ? (
              <>
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <p className="text-xs font-semibold text-green-900 uppercase mb-2">✅ Execution Plan Received</p>
                  <p className="text-xs text-green-700">{new Date(agentBriefing.submittedAt).toLocaleString()}</p>
                </div>

                {agentBriefing.deliverables && (
                  <div>
                    <p className="text-xs font-semibold text-gray-700 uppercase mb-2">📦 Deliverables</p>
                    <ul className="space-y-2">
                      {agentBriefing.deliverables.map((d, idx) => (
                        <li key={idx} className="bg-gray-50 border border-gray-200 rounded p-2">
                          <p className="text-xs font-medium text-gray-800">{d.title}</p>
                          {d.description && <p className="text-xs text-gray-600 mt-1">{d.description}</p>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {agentBriefing.milestones && agentBriefing.milestones.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-700 uppercase mb-2">🎯 Milestones</p>
                    <ul className="space-y-2">
                      {agentBriefing.milestones.map((m, idx) => (
                        <li key={idx} className="text-xs text-gray-700">
                          <strong>{m.title}:</strong> {m.dueDate ? new Date(m.dueDate).toLocaleDateString() : 'TBD'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {agentBriefing.timeline && (
                  <div>
                    <p className="text-xs font-semibold text-gray-700 uppercase mb-2">⏱️ Timeline</p>
                    <p className="text-xs text-gray-700">{agentBriefing.timeline}</p>
                  </div>
                )}

                {agentBriefing.blockers && agentBriefing.blockers.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-orange-700 uppercase mb-2">⚠️ Blockers</p>
                    <ul className="space-y-1">
                      {agentBriefing.blockers.map((b, idx) => (
                        <li key={idx} className="text-xs text-orange-700">• {b}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-xs font-semibold text-yellow-900 uppercase mb-1">⏳ Awaiting Execution Plan</p>
                <p className="text-xs text-yellow-700">Agent will submit their detailed execution plan soon</p>
              </div>
            )}
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-semibold text-gray-700 uppercase">Progress</p>
                <p className="text-sm font-bold text-slate-600">{taskData.progress || 0}%</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-slate-600 h-2 rounded-full transition-all"
                  style={{ width: `${taskData.progress || 0}%` }}
                />
              </div>
            </div>

            {/* Updates */}
            {taskData.updates && taskData.updates.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-700 uppercase mb-2">📝 Updates</p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {taskData.updates.map((update, idx) => (
                    <div key={idx} className="bg-gray-50 border border-gray-200 rounded p-2">
                      <p className="text-xs text-gray-600">{new Date(update.timestamp).toLocaleString()}</p>
                      <p className="text-xs text-gray-800 mt-1">{update.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!taskData.updates || taskData.updates.length === 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded p-3 text-center">
                <p className="text-xs text-gray-600">No updates yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
