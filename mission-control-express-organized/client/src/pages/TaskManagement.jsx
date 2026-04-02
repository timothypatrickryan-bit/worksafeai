import { useState, useEffect } from 'react';

export default function TaskManagement() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterAgent, setFilterAgent] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    fetchTasks();
    fetchAgents();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tasks');
      if (!res.ok) {
        throw new Error(`API returned ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      setTasks(data.tasks || data || []);
      setError(null);
    } catch (err) {
      console.error('Task fetch error:', err);
      setError(`Failed to load tasks: ${err.message}`);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/agents');
      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }
      const data = await res.json();
      setAgents(data.agents || data || []);
    } catch (err) {
      console.error('Failed to fetch agents:', err);
      setAgents([]);
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      setUpdatingId(taskId);
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update task');
      }
      const data = await res.json();
      setTasks(tasks.map(t => t.id === taskId ? data.task : t));
      setError(null);
    } catch (err) {
      console.error('Task update error:', err);
      setError(`Failed to update task: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter and sort
  const filtered = tasks.filter(t => {
    if (filterAgent !== 'all' && t.agent !== filterAgent) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'dueDate') {
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    if (sortBy === 'priority') {
      const pOrder = { high: 0, medium: 1, low: 2 };
      return (pOrder[a.priority] || 2) - (pOrder[b.priority] || 2);
    }
    if (sortBy === 'status') {
      const sOrder = { queued: 0, 'in-progress': 1, blocked: 2, 'on-hold': 3, complete: 4 };
      return (sOrder[a.status] || 0) - (sOrder[b.status] || 0);
    }
    return 0;
  });

  const getStatusColor = (status) => {
    const colors = {
      'queued': 'bg-gray-100 text-gray-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'blocked': 'bg-red-100 text-red-800',
      'on-hold': 'bg-yellow-100 text-yellow-800',
      'complete': 'bg-green-100 text-green-800',
    };
    return colors[status] || colors.queued;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'high': 'bg-red-50 text-red-700',
      'medium': 'bg-orange-50 text-orange-700',
      'low': 'bg-green-50 text-green-700',
    };
    return colors[priority] || colors.low;
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getOverdueStatus = (dueDate, status) => {
    if (status === 'complete') return null;
    // Parse date and compare only the date part, not the time
    const due = new Date(dueDate);
    const now = new Date();
    
    // Set both to midnight to compare dates only
    const dueDate_Only = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const now_Only = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (dueDate_Only < now_Only) return '🔴 OVERDUE';
    if (dueDate_Only.getTime() === now_Only.getTime()) return '🟡 Due today';
    return null;
  };

  const stats = {
    total: filtered.length,
    queued: filtered.filter(t => t.status === 'queued').length,
    inProgress: filtered.filter(t => t.status === 'in-progress').length,
    blocked: filtered.filter(t => t.status === 'blocked').length,
    complete: filtered.filter(t => t.status === 'complete').length,
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8">
        <div className="text-center text-gray-500">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">📋 Task Management</h1>
        <p className="text-sm text-gray-600 mt-1">
          Operational center for all work execution. Real-time task visibility across all agents.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-white rounded border border-gray-200 p-3">
          <div className="text-xs text-gray-500 font-semibold">Total</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</div>
        </div>
        <div className="bg-white rounded border border-gray-200 p-3">
          <div className="text-xs text-gray-500 font-semibold">Queued</div>
          <div className="text-2xl font-bold text-gray-600 mt-1">{stats.queued}</div>
        </div>
        <div className="bg-white rounded border border-gray-200 p-3">
          <div className="text-xs text-gray-500 font-semibold">In Progress</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{stats.inProgress}</div>
        </div>
        <div className="bg-white rounded border border-gray-200 p-3">
          <div className="text-xs text-gray-500 font-semibold">Blocked</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{stats.blocked}</div>
        </div>
        <div className="bg-white rounded border border-gray-200 p-3">
          <div className="text-xs text-gray-500 font-semibold">Complete</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{stats.complete}</div>
        </div>
      </div>

      {/* Filters & Sort */}
      <div className="bg-white rounded border border-gray-200 p-4 space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Agent</label>
            <select
              value={filterAgent}
              onChange={(e) => setFilterAgent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Agents</option>
              {agents.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Status</option>
              <option value="queued">Queued</option>
              <option value="in-progress">In Progress</option>
              <option value="blocked">Blocked</option>
              <option value="on-hold">On Hold</option>
              <option value="complete">Complete</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {sorted.length === 0 ? (
          <div className="bg-white rounded border border-gray-200 px-4 py-8 text-center text-gray-500">
            No tasks match your filters.
          </div>
        ) : (
          sorted.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Row */}
              <div
                className="px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedId(expandedId === task.id ? null : task.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                      <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      {getOverdueStatus(task.dueDate, task.status) && (
                        <span className="text-xs font-bold text-red-600">
                          {getOverdueStatus(task.dueDate, task.status)}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-900 truncate">{task.title}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-gray-600">👤 {task.agent || 'Unassigned'}</span>
                      <span className="text-xs text-gray-600">📅 Due: {formatDate(task.dueDate)}</span>
                      {task.blockers && (
                        <span className="text-xs text-red-600 font-bold">🚫 Blocked: {task.blockers}</span>
                      )}
                      {task.progress !== undefined && (
                        <span className="text-xs text-gray-600">{task.progress}% complete</span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <div className="text-gray-400">{expandedId === task.id ? '▼' : '▶'}</div>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === task.id && (
                <div className="px-4 py-4 bg-gray-50 border-t border-gray-200 space-y-4">
                  {task.description && (
                    <div>
                      <h4 className="text-xs font-bold text-gray-700 uppercase mb-1">Description</h4>
                      <p className="text-sm text-gray-800">{task.description}</p>
                    </div>
                  )}

                  {task.blockers && (
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                      <h4 className="text-xs font-bold text-red-700 uppercase mb-1">Blockers</h4>
                      <p className="text-sm text-red-800">{task.blockers}</p>
                    </div>
                  )}

                  {task.executionNotes && (
                    <div>
                      <h4 className="text-xs font-bold text-gray-700 uppercase mb-1">Execution Notes</h4>
                      <p className="text-sm text-gray-800">{task.executionNotes}</p>
                    </div>
                  )}

                  {task.status !== 'complete' && (
                    <div className="flex gap-2 pt-2 border-t border-gray-300">
                      <button
                        onClick={() => handleStatusUpdate(task.id, 'in-progress')}
                        disabled={updatingId === task.id}
                        className="px-3 py-2 bg-blue-500 text-white text-xs font-semibold rounded hover:bg-blue-600 disabled:bg-gray-400 transition"
                      >
                        Start
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(task.id, 'blocked')}
                        disabled={updatingId === task.id}
                        className="px-3 py-2 bg-red-500 text-white text-xs font-semibold rounded hover:bg-red-600 disabled:bg-gray-400 transition"
                      >
                        Block
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(task.id, 'complete')}
                        disabled={updatingId === task.id}
                        className="px-3 py-2 bg-green-500 text-white text-xs font-semibold rounded hover:bg-green-600 disabled:bg-gray-400 transition"
                      >
                        Complete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

