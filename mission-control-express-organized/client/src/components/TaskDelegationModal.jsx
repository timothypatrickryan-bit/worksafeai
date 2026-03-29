import { useState, useEffect } from 'react';

export default function TaskDelegationModal({ isOpen, onClose, agents, selectedAgentId, onTaskCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 'Medium',
    estimatedHours: 2,
    dueDate: '',
    assignedTo: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const priorityOptions = ['Low', 'Medium', 'High', 'Critical'];
  const priorityColors = {
    Low: 'bg-blue-100 text-blue-700 border-blue-300',
    Medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    High: 'bg-orange-100 text-orange-700 border-orange-300',
    Critical: 'bg-red-100 text-red-700 border-red-300',
  };

  useEffect(() => {
    if (isOpen && selectedAgentId) {
      // Pre-fill assignedTo when agent is selected
      setFormData(prev => ({
        ...prev,
        assignedTo: selectedAgentId,
      }));
    } else if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        name: '',
        description: '',
        priority: 'Medium',
        estimatedHours: 2,
        dueDate: '',
        assignedTo: '',
      });
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, selectedAgentId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'estimatedHours' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!formData.name.trim()) {
      setError('Task name is required');
      return;
    }

    if (!formData.assignedTo) {
      setError('Please select an agent to assign this task');
      return;
    }

    if (formData.estimatedHours <= 0) {
      setError('Estimated hours must be greater than 0');
      return;
    }

    try {
      setLoading(true);

      // Create task
      const taskRes = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          priority: formData.priority,
          estimatedHours: formData.estimatedHours,
          dueDate: formData.dueDate || null,
          assignedTo: formData.assignedTo,
          status: 'pending',
          createdAt: new Date().toISOString(),
        }),
      });

      if (!taskRes.ok) {
        throw new Error('Failed to create task');
      }

      const taskData = await taskRes.json();
      const taskId = taskData.task.id;

      // Assign task to agent
      const assignRes = await fetch(`/api/agents/${formData.assignedTo}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      });

      if (!assignRes.ok) {
        console.warn('Task created but assignment failed:', await assignRes.text());
      }

      setSuccess(true);
      onTaskCreated?.({
        ...taskData.task,
        id: taskId,
        assignedTo: formData.assignedTo,
      });

      // Close modal after 1.5 seconds
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Delegate Task</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Task Created!</h3>
              <p className="text-sm text-gray-600">
                Your task has been assigned to{' '}
                <span className="font-semibold">
                  {agents.find(a => a.id === formData.assignedTo)?.name || 'the agent'}
                </span>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Task Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Task Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Build API endpoint for user registration"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Additional details about the task..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Priority *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {priorityOptions.map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() =>
                        setFormData(prev => ({ ...prev, priority: p }))
                      }
                      className={`px-3 py-2 text-xs font-semibold rounded border-2 transition ${
                        formData.priority === p
                          ? priorityColors[p] + ' border-current'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                      disabled={loading}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Estimated Hours */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Estimated Hours *
                  </label>
                  <input
                    type="number"
                    name="estimatedHours"
                    value={formData.estimatedHours}
                    onChange={handleChange}
                    min="0.5"
                    step="0.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Assign To */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Assign To *
                </label>
                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="">Select an agent...</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.avatar} {agent.name} - {agent.role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition disabled:opacity-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 transition disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block w-3 h-3 bg-white rounded-full animate-pulse"></span>
                      Creating...
                    </span>
                  ) : (
                    'Create Task'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
