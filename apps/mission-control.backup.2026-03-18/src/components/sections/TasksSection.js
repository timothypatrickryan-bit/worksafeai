import React, { useState, useEffect } from 'react'

export default function TasksSection({ state, ws }) {
  const [showNewTaskForm, setShowNewTaskForm] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', assignedTo: 'lucy', description: '' })
  const [activity, setActivity] = useState([])
  const [draggedTask, setDraggedTask] = useState(null)

  // Load activity feed from state
  useEffect(() => {
    if (state?.activity) {
      setActivity(state.activity.slice(-30)) // Last 30 activities
    }
  }, [state?.activity])

  // Subscribe to WebSocket updates
  useEffect(() => {
    if (!ws) return
    const handleMessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'activity') {
        setActivity(prev => [data.event, ...prev.slice(0, 29)])
      }
    }
    ws.addEventListener('message', handleMessage)
    return () => ws.removeEventListener('message', handleMessage)
  }, [ws])

  // Organize tasks by status & assignee
  const tasksByStatus = {
    review: [],
    queued: [],
    working: [],
    complete: [],
  }

  // Manual tasks from state
  if (state?.tasks) {
    state.tasks.forEach((task) => {
      const status = task.status || 'queued'
      if (tasksByStatus[status]) tasksByStatus[status].push(task)
    })
  }

  // Agent tasks (also tracked as tasks)
  if (state?.agents) {
    Object.entries(state.agents).forEach(([id, agent]) => {
      if (!agent.currentTask) return
      
      const agentTask = {
        id: `agent-${id}`,
        title: agent.currentTask,
        assignedTo: agent.name,
        assigneeId: id,
        description: agent.spec || '',
        status: agent.status === 'working' ? 'working' : agent.status === 'complete' ? 'complete' : 'queued',
        createdAt: agent.taskStarted || new Date().toISOString(),
        completedAt: agent.taskCompleted,
        output: agent.output,
        isAgent: true,
        model: agent.model,
      }
      
      if (tasksByStatus[agentTask.status]) {
        tasksByStatus[agentTask.status].push(agentTask)
      }
    })
  }

  // Get assignee info (agent or person)
  const getAssigneeInfo = (assigneeId) => {
    if (!assigneeId) return { name: 'Unassigned', color: 'gray' }
    if (state?.agents?.[assigneeId]) {
      const agent = state.agents[assigneeId]
      return { name: agent.name, color: 'blue', model: agent.model }
    }
    return { name: assigneeId, color: 'gray' }
  }

  // Format time elapsed
  const formatTimeElapsed = (startTime) => {
    if (!startTime) return ''
    const ms = Date.now() - new Date(startTime).getTime()
    const sec = Math.floor(ms / 1000)
    const min = Math.floor(sec / 60)
    const hours = Math.floor(min / 60)
    
    if (hours > 0) return `${hours}h ${min % 60}m`
    if (min > 0) return `${min}m ${sec % 60}s`
    return `${sec}s`
  }

  // Handle task creation
  const handleAddTask = async () => {
    if (!newTask.title.trim()) return

    try {
      await fetch('http://localhost:3000/api/tasks/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description,
          assignedTo: newTask.assignedTo,
          status: 'review',
          createdAt: new Date().toISOString(),
        }),
      })
      setNewTask({ title: '', assignedTo: 'lucy', description: '' })
      setShowNewTaskForm(false)
    } catch (err) {
      console.error('Error adding task:', err)
    }
  }

  // Handle task status change (drag & drop)
  const handleTaskMove = async (taskId, newStatus) => {
    try {
      await fetch(`http://localhost:3000/api/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
    } catch (err) {
      console.error('Error updating task:', err)
    }
  }

  // Handle approve/reject
  const handleApproveTask = async (taskId) => {
    try {
      await fetch(`http://localhost:3000/api/tasks/${taskId}/approve`, {
        method: 'POST',
      })
    } catch (err) {
      console.error('Error approving task:', err)
    }
  }

  const handleRejectTask = async (taskId) => {
    try {
      await fetch(`http://localhost:3000/api/tasks/${taskId}/reject`, {
        method: 'POST',
      })
    } catch (err) {
      console.error('Error rejecting task:', err)
    }
  }

  // Task Card Component
  const TaskCard = ({ task, onApprove, onReject, isReview, onDragStart }) => {
    const assignee = getAssigneeInfo(task.assigneeId || task.assignedTo)
    const elapsed = formatTimeElapsed(task.createdAt)

    return (
      <div
        draggable
        onDragStart={() => onDragStart(task)}
        className={`border rounded-lg p-3 transition-all cursor-grab active:cursor-grabbing ${
          isReview
            ? 'bg-yellow-50 border-yellow-200 hover:border-yellow-300 hover:shadow-md'
            : task.status === 'working'
            ? 'bg-blue-50 border-blue-200 hover:border-blue-300 animate-pulse'
            : task.status === 'complete'
            ? 'bg-green-50 border-green-200 hover:border-green-300'
            : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-gray-900 truncate">
              {task.title || task.name}
            </div>
            <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${
                assignee.color === 'blue' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {assignee.name}
              </span>
              {elapsed && <span className="text-gray-400">({elapsed})</span>}
            </div>
          </div>
          {task.status === 'working' && (
            <div className="text-lg animate-spin">⚙️</div>
          )}
          {task.status === 'complete' && (
            <div className="text-lg">✓</div>
          )}
        </div>

        {/* Description */}
        {(task.description || task.currentTask) && (
          <p className="text-xs text-gray-600 mt-2 line-clamp-2">
            {task.description || task.currentTask}
          </p>
        )}

        {/* Model info for agent tasks */}
        {task.isAgent && task.model && (
          <div className="mt-1.5 text-xs text-gray-500">
            Model: <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">{task.model}</span>
          </div>
        )}

        {/* Output */}
        {task.output && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-700">
              {task.output.type || 'Output Available'}
            </p>
            {task.output.summary && (
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                {task.output.summary}
              </p>
            )}
          </div>
        )}

        {/* Approval buttons (for review status) */}
        {isReview && task.id && (
          <div className="mt-3 pt-3 border-t border-yellow-100 flex gap-2">
            <button
              onClick={() => onApprove(task.id)}
              className="flex-1 px-2 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              ✓ Approve
            </button>
            <button
              onClick={() => onReject(task.id)}
              className="flex-1 px-2 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              ✕ Reject
            </button>
          </div>
        )}
      </div>
    )
  }

  // Agent Activity Feed Component (grouped by agent)
  const AgentActivityFeed = ({ state }) => {
    const formatActivityTime = (timestamp) => {
      if (!timestamp) return 'just now'
      const ms = Date.now() - new Date(timestamp).getTime()
      const sec = Math.floor(ms / 1000)
      const min = Math.floor(sec / 60)
      const hours = Math.floor(min / 60)
      
      if (hours > 0) return `${hours}h ago`
      if (min > 0) return `${min}m ago`
      if (sec > 0) return `${sec}s ago`
      return 'just now'
    }

    const getStatusIcon = (status) => {
      switch (status) {
        case 'working':
          return '⚙️'
        case 'complete':
          return '✓'
        case 'idle':
          return '⏸️'
        default:
          return '•'
      }
    }

    const getStatusColor = (status) => {
      switch (status) {
        case 'working':
          return 'bg-blue-50 border-blue-200'
        case 'complete':
          return 'bg-green-50 border-green-200'
        case 'idle':
          return 'bg-gray-50 border-gray-200'
        default:
          return 'bg-gray-50 border-gray-200'
      }
    }

    const getStatusBadgeColor = (status) => {
      switch (status) {
        case 'working':
          return 'bg-blue-100 text-blue-700'
        case 'complete':
          return 'bg-green-100 text-green-700'
        case 'idle':
          return 'bg-gray-100 text-gray-700'
        default:
          return 'bg-gray-100 text-gray-700'
      }
    }

    // Build agent activity list from state.agents (only working or complete agents)
    const agents = state?.agents || {}
    const agentActivities = Object.entries(agents)
      .map(([id, agent]) => ({
        id,
        name: agent.name,
        status: agent.status || 'idle',
        currentTask: agent.currentTask,
        lastActivity: agent.lastActivity || agent.taskStarted,
        output: agent.output,
        model: agent.model,
      }))
      .filter(agent => agent.status === 'working' || agent.status === 'complete') // Only show active agents
      .sort((a, b) => {
        // Sort by: working first, then complete
        const statusOrder = { working: 0, complete: 1 }
        return (statusOrder[a.status] || 3) - (statusOrder[b.status] || 3)
      })

    return (
      <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-300px)]">
        {agentActivities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400">No active agents</p>
          </div>
        ) : (
          agentActivities.map((agent) => (
            <div
              key={agent.id}
              className={`border rounded-lg p-3 text-xs transition-all ${getStatusColor(
                agent.status
              )}`}
            >
              {/* Agent Header */}
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg flex-shrink-0">{getStatusIcon(agent.status)}</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{agent.name}</p>
                    <p className="text-gray-500 text-xs">{agent.model || 'Unknown Model'}</p>
                  </div>
                </div>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${getStatusBadgeColor(
                    agent.status
                  )}`}
                >
                  {agent.status === 'working' ? 'Working' : agent.status === 'complete' ? 'Done' : 'Idle'}
                </span>
              </div>

              {/* Current Task or Last Activity */}
              {agent.currentTask && (
                <div className="pl-6 border-l-2 border-gray-300 space-y-1">
                  <p className="font-medium text-gray-900 line-clamp-2">{agent.currentTask}</p>
                  <p className="text-gray-500">
                    {formatActivityTime(agent.lastActivity)} {agent.status === 'working' ? '(in progress)' : ''}
                  </p>
                </div>
              )}

              {/* Output Summary */}
              {agent.output && agent.status === 'complete' && (
                <div className="pl-6 border-l-2 border-green-300 space-y-1 mt-1.5 pt-1.5">
                  <p className="text-green-700 font-medium">Output:</p>
                  <p className="text-gray-600 line-clamp-2">{agent.output.summary || agent.output.type}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    )
  }

  const columns = [
    { key: 'review', label: 'Awaiting Review', color: 'yellow' },
    { key: 'queued', label: 'Queued', color: 'gray' },
    { key: 'working', label: 'In Progress', color: 'blue' },
    { key: 'complete', label: 'Completed', color: 'green' },
  ]

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Task Board & Activity</h2>
        {!showNewTaskForm && (
          <button
            onClick={() => setShowNewTaskForm(true)}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            + New Task
          </button>
        )}
      </div>

      {/* New Task Form */}
      {showNewTaskForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-sm text-gray-900 mb-3">Create New Task</h3>
          <input
            type="text"
            placeholder="Task title..."
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            placeholder="Description (optional)..."
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2 resize-none h-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">Assign to:</label>
            <select
              value={newTask.assignedTo}
              onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="lucy">Lucy (Orchestrator)</option>
              <option value="laura">Laura (Brand Strategy)</option>
              <option value="chief">Chief (Infrastructure)</option>
              <option value="opus">Opus (Code Review)</option>
              <option value="johnny">Johnny (Design)</option>
              <option value="jarvis">Jarvis (Development)</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddTask}
              className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Task
            </button>
            <button
              onClick={() => setShowNewTaskForm(false)}
              className="flex-1 px-3 py-2 bg-gray-200 text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main Layout: Kanban + Activity */}
      <div className="flex-1 grid grid-cols-12 gap-4 overflow-hidden">
        {/* Kanban Board (9 cols) */}
        <div className="col-span-9 flex flex-col overflow-hidden">
          <div className="grid grid-cols-4 gap-4 flex-1 overflow-auto">
            {columns.map((column) => (
              <div
                key={column.key}
                className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex flex-col min-h-0"
              >
                {/* Column Header */}
                <div className="flex-shrink-0 mb-3">
                  <h3 className="font-semibold text-sm text-gray-900">
                    {column.label}
                    {tasksByStatus[column.key]?.length > 0 && (
                      <span className={`ml-2 text-xs font-normal ${
                        column.color === 'yellow'
                          ? 'text-yellow-700'
                          : column.color === 'blue'
                          ? 'text-blue-700'
                          : column.color === 'green'
                          ? 'text-green-700'
                          : 'text-gray-600'
                      }`}>
                        ({tasksByStatus[column.key].length})
                      </span>
                    )}
                  </h3>
                  <div
                    className={`h-0.5 w-12 rounded-sm mt-2 ${
                      column.color === 'yellow'
                        ? 'bg-yellow-400'
                        : column.color === 'blue'
                        ? 'bg-blue-400'
                        : column.color === 'green'
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  ></div>
                </div>

                {/* Tasks */}
                <div
                  className="flex-1 space-y-2 overflow-y-auto"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    if (draggedTask) {
                      handleTaskMove(draggedTask.id, column.key)
                      setDraggedTask(null)
                    }
                  }}
                >
                  {tasksByStatus[column.key]?.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-8">Empty</p>
                  ) : (
                    tasksByStatus[column.key].map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        isReview={column.key === 'review'}
                        onApprove={handleApproveTask}
                        onReject={handleRejectTask}
                        onDragStart={setDraggedTask}
                      />
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Activity Feed (3 cols) */}
        <div className="col-span-3 flex flex-col border border-gray-200 rounded-lg bg-white p-4 overflow-hidden">
          <h3 className="font-semibold text-sm text-gray-900 mb-4 flex-shrink-0">
            🤖 Agent Activity
          </h3>
          <AgentActivityFeed state={state} />
        </div>
      </div>
    </div>
  )
}
