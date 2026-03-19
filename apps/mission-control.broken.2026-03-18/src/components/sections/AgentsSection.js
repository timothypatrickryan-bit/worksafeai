const AgentsSection = ({ state }) => {
  const agents = state?.agents || [];

  if (!agents || agents.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary text-lg">No agents running</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-dark mb-6">🤖 Agents</h2>

      <div className="grid grid-cols-1 gap-4">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-dark">{agent.name}</h3>
                <p className="text-sm text-secondary">{agent.id}</p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  agent.status === 'running'
                    ? 'bg-green-100 text-success'
                    : agent.status === 'idle'
                    ? 'bg-blue-100 text-primary'
                    : 'bg-gray-100 text-secondary'
                }`}
              >
                {agent.status}
              </div>
            </div>

            {/* Task Info */}
            {agent.task && (
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-secondary mb-1">Current Task:</p>
                <p className="text-dark font-medium">{agent.task}</p>
              </div>
            )}

            {/* Output */}
            {agent.output && (
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-secondary mb-1">Output:</p>
                <code className="text-xs text-dark break-words whitespace-pre-wrap">
                  {agent.output}
                </code>
              </div>
            )}

            {/* Stats */}
            <div className="flex gap-4 mt-4 text-sm">
              <div>
                <p className="text-secondary">Uptime</p>
                <p className="font-semibold text-dark">{agent.uptime || '—'}</p>
              </div>
              <div>
                <p className="text-secondary">Tasks Completed</p>
                <p className="font-semibold text-dark">{agent.tasksCompleted || 0}</p>
              </div>
              <div>
                <p className="text-secondary">Last Activity</p>
                <p className="font-semibold text-dark">{agent.lastActivity || '—'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentsSection;
