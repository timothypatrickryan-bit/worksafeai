import React, { useState, useEffect } from 'react';
import missionControlState from '../../../.mission-control-state.json';

export default function TaskProgressDashboard() {
  // Initialize directly from JSON to avoid async state timing issues
  const initialTasks = missionControlState.tasks || [];
  const initialDelegations = missionControlState.delegations || [];
  const initialAgents = (missionControlState.team?.members || []).reduce((acc, member) => {
    acc[member.id] = member;
    return acc;
  }, {});

  const [tasks, setTasks] = useState(initialTasks);
  const [delegations, setDelegations] = useState(initialDelegations);
  const [agents, setAgents] = useState(initialAgents);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, queued, in-progress, completed
  const [selectedTask, setSelectedTask] = useState(null);

  // Categorize tasks by status
  const getTasksByStatus = () => {
    const queued = tasks.filter(t => t.status === 'queued');
    const inProgress = tasks.filter(t => t.status === 'in-progress');
    const completed = tasks.filter(t => t.status === 'completed');
    return { queued, inProgress, completed };
  };

  const tasksByStatus = getTasksByStatus();

  const getFilteredTasks = function() {
    if (filter === 'queued') {
      return tasksByStatus.queued;
    }
    if (filter === 'in-progress') {
      return tasksByStatus.inProgress;
    }
    if (filter === 'completed') {
      return tasksByStatus.completed;
    }
    return [
      ...tasksByStatus.queued,
      ...tasksByStatus.inProgress,
      ...tasksByStatus.completed
    ];
  };

  const filteredTasks = getFilteredTasks();

  const getAssignedAgent = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task?.assignedTo) {
      return agents[task.assignedTo];
    }
    return null;
  };

  const getDelegationForTask = (taskId) => {
    return delegations.find(d => d.linkedTask === taskId || (tasks.find(t => t.id === taskId)?.assignedTo && d.assignedAgent === tasks.find(t => t.id === taskId)?.assignedTo));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'in-progress':
        return 'bg-gray-100 text-blue-800 border-blue-300';
      case 'queued':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getProgressColor = (progress = 0) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-gray-1000';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading mission control state...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-600 p-4 rounded">
        <h2 className="text-lg font-bold text-gray-900">📊 Task Progress Dashboard</h2>
        <p className="text-xs text-gray-600 mt-1">Real-time mission control state • Queued, In-Progress, Completed</p>
        <p className="text-xs text-gray-500 mt-2">Last update: {new Date(missionControlState.lastUpdate).toLocaleString()}</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-xs font-semibold text-yellow-900 uppercase">Queued</p>
          <p className="text-2xl font-bold text-yellow-700 mt-2">{tasksByStatus.queued.length}</p>
          <p className="text-xs text-yellow-600 mt-1">Ready for briefing</p>
        </div>
        <div className="bg-gray-100 border border-blue-200 rounded-lg p-4">
          <p className="text-xs font-semibold text-gray-900 uppercase">In Progress</p>
          <p className="text-2xl font-bold text-slate-700 mt-2">{tasksByStatus.inProgress.length}</p>
          <p className="text-xs text-slate-600 mt-1">Actively executing</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-xs font-semibold text-green-900 uppercase">Completed</p>
          <p className="text-2xl font-bold text-green-700 mt-2">{tasksByStatus.completed.length}</p>
          <p className="text-xs text-green-600 mt-1">Delivered & closed</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'queued', 'in-progress', 'completed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded text-sm font-medium transition ${
              filter === f
                ? 'bg-slate-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {f === 'all' && `All (${tasks.length})`}
            {f === 'queued' && `Queued (${tasksByStatus.queued.length})`}
            {f === 'in-progress' && `In-Progress (${tasksByStatus.inProgress.length})`}
            {f === 'completed' && `Completed (${tasksByStatus.completed.length})`}
          </button>
        ))}
      </div>

      {/* Tasks by Status Sections */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500 font-medium">No tasks in this category</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* QUEUED SECTION */}
          {(filter === 'all' || filter === 'queued') && tasksByStatus.queued.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-semibold">QUEUED</span>
                <span className="text-gray-600 font-normal">Ready for briefing ({tasksByStatus.queued.length})</span>
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {tasksByStatus.queued.map(task => (
                  <TaskCard key={task.id} task={task} agent={getAssignedAgent(task.id)} delegation={getDelegationForTask(task.id)} getStatusColor={getStatusColor} />
                ))}
              </div>
            </div>
          )}

          {/* IN-PROGRESS SECTION */}
          {(filter === 'all' || filter === 'in-progress') && tasksByStatus.inProgress.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="bg-gray-100 text-slate-700 px-2 py-1 rounded text-xs font-semibold">IN-PROGRESS</span>
                <span className="text-gray-600 font-normal">Live execution ({tasksByStatus.inProgress.length})</span>
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {tasksByStatus.inProgress.map(task => (
                  <TaskCard key={task.id} task={task} agent={getAssignedAgent(task.id)} delegation={getDelegationForTask(task.id)} getStatusColor={getStatusColor} getProgressColor={getProgressColor} />
                ))}
              </div>
            </div>
          )}

          {/* COMPLETED SECTION */}
          {(filter === 'all' || filter === 'completed') && tasksByStatus.completed.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">COMPLETED</span>
                <span className="text-gray-600 font-normal">Delivered ({tasksByStatus.completed.length})</span>
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {tasksByStatus.completed.map(task => (
                  <TaskCard key={task.id} task={task} agent={getAssignedAgent(task.id)} delegation={getDelegationForTask(task.id)} getStatusColor={getStatusColor} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Timeline View */}
      {filteredTasks.some(t => t.dueDate) && (
        <div>
          <h3 className="text-base font-bold text-gray-900 mb-3">📅 Timeline by Due Date</h3>
          <div className="space-y-2">
            {filteredTasks
              .filter(t => t.dueDate)
              .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
              .map(task => {
                const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';
                return (
                  <div key={task.id} className={`flex items-center gap-3 p-3 rounded border transition ${
                    isOverdue ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <span className={`text-xs font-medium min-w-fit ${
                      isOverdue ? 'text-red-900 font-bold' : 'text-gray-900'
                    }`}>
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                    <div className="flex-1 truncate">
                      <p className="text-xs font-medium text-gray-900 truncate">{task.title}</p>
                      <p className="text-xs text-gray-600">{getAssignedAgent(task.id)?.name || 'Unassigned'}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(task.status)}`}
                    >
                      {task.status.toUpperCase()}
                    </span>
                    {isOverdue && <span className="text-xs text-red-600 font-bold">⚠️ OVERDUE</span>}
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

// Task Card Component
function TaskCard({ task, agent, delegation, getStatusColor, getProgressColor }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition cursor-pointer bg-white">
      {/* Task Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 pr-3">
          <h3 className="font-bold text-gray-900">{task.title}</h3>
          {task.description && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{task.description}</p>
          )}
        </div>
        <span
          className={`px-2 py-1 rounded text-xs font-medium border whitespace-nowrap ${getStatusColor(task.status)}`}
        >
          {task.status === 'in-progress' ? '▶ IN-PROGRESS' : task.status === 'queued' ? '⏳ QUEUED' : '✅ DONE'}
        </span>
      </div>

      {/* Agent Assignment */}
      {agent && (
        <div className="bg-gray-100 border border-blue-200 rounded p-2 mb-3">
          <p className="text-xs font-semibold text-gray-900">👤 Assigned to: {agent.name}</p>
          <p className="text-xs text-slate-700">{agent.title}</p>
          {delegation && (
            <p className="text-xs text-slate-600 mt-1">
              <span className="font-semibold">Match Score:</span> {parseFloat(delegation.matchScore).toFixed(2)}/10
            </p>
          )}
        </div>
      )}

      {/* Progress Bar - Only for In-Progress */}
      {task.status === 'in-progress' && (
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <p className="text-xs font-semibold text-gray-700">Execution Progress</p>
            <p className="text-xs font-bold text-gray-900">{task.progress || 0}%</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${getProgressColor ? getProgressColor(task.progress || 0) : 'bg-gray-1000'}`}
              style={{ width: `${task.progress || 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Task Metadata */}
      <div className="space-y-2 text-xs mb-3">
        {task.priority && (
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded font-semibold ${
              task.priority === 'critical' ? 'bg-red-100 text-red-700' :
              task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {task.priority.toUpperCase()}
            </span>
          </div>
        )}
        {task.dueDate && (
          <div className="flex items-center gap-2">
            <span className="text-gray-600">📅 Due:</span>
            <span className="font-medium text-gray-900">
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
            {new Date(task.dueDate) < new Date() && task.status !== 'completed' && (
              <span className="text-red-600 font-bold">OVERDUE</span>
            )}
          </div>
        )}
        {task.createdAt && (
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Created:</span>
            <span className="text-gray-700">{new Date(task.createdAt).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Lucy's Plan - if exists */}
      {task.lucyPlan && (
        <div className="bg-purple-50 border border-purple-200 rounded p-2 mb-3">
          <p className="text-xs font-semibold text-purple-900">🎯 Lucy's Plan</p>
          {task.lucyPlan.primaryAgent && (
            <p className="text-xs text-purple-700 mt-1">
              Primary: {task.lucyPlan.primaryAgent.name} (Match: {task.lucyPlan.primaryAgent.matchScore}/10)
            </p>
          )}
          {task.lucyPlan.subtasks?.length > 0 && (
            <p className="text-xs text-purple-600 mt-1">
              {task.lucyPlan.subtasks.length} subtask{task.lucyPlan.subtasks.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}

      {/* Briefing Status - if in progress */}
      {task.status === 'in-progress' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
          <p className="text-xs font-semibold text-yellow-900">⏳ Execution Underway</p>
          <p className="text-xs text-yellow-700 mt-1">Check back for live updates</p>
        </div>
      )}

      {/* Completion Info - if completed */}
      {task.status === 'completed' && task.completedAt && (
        <div className="bg-green-50 border border-green-200 rounded p-2">
          <p className="text-xs font-semibold text-green-900">✅ Task Delivered</p>
          <p className="text-xs text-green-700 mt-1">
            Completed {new Date(task.completedAt).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}
