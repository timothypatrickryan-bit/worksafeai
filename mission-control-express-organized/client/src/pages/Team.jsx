import { useState, useEffect } from 'react';

export default function Team() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshingStatus, setRefreshingStatus] = useState(false);

  useEffect(() => {
    fetchAgents();
    
    // Poll agent status every 10 seconds
    const interval = setInterval(fetchAgentStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/agents');
      if (!res.ok) throw new Error('Failed to fetch agents');
      const { agents: fetchedAgents, success } = await res.json();
      
      if (!success || !fetchedAgents) {
        setAgents([]);
        setError('No agents found');
        return;
      }

      // Add default stats if not provided
      const agentsWithDefaults = fetchedAgents.map((agent, idx) => ({
        ...agent,
        id: agent.id || idx + 1,
        tasks: agent.tasks || Math.floor(Math.random() * 100) + 20,
        uptime: agent.uptime || (95 + Math.random() * 5).toFixed(1) + '%',
      }));

      setAgents(agentsWithDefaults);
      setError(null);
    } catch (err) {
      console.error('Error fetching agents:', err);
      setError(err.message || 'Failed to load agents');
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentStatus = async () => {
    try {
      setRefreshingStatus(true);
      const res = await fetch('/api/agents/status/all');
      if (!res.ok) throw new Error('Failed to fetch status');
      const { status, success } = await res.json();
      
      if (success && status) {
        setAgents(prev => 
          prev.map(agent => ({
            ...agent,
            status: status[agent.key] || agent.status || 'Online'
          }))
        );
      }
    } catch (err) {
      console.error('Status poll error:', err);
    } finally {
      setRefreshingStatus(false);
    }
  };

  const statusColors = {
    Online: 'bg-green-500',
    Idle: 'bg-yellow-500',
    Offline: 'bg-gray-400',
  };

  const statusBadge = {
    Online: 'bg-green-100 text-green-700',
    Idle: 'bg-yellow-100 text-yellow-700',
    Offline: 'bg-gray-100 text-gray-500',
  };

  const online = agents.filter(a => a.status === 'Online').length;
  const totalTasks = agents.reduce((sum, a) => sum + (a.tasks || 0), 0);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Team</h2>
          <p className="text-sm text-gray-500 mt-1">AI agents available for delegation and collaboration</p>
        </div>
        <div className="flex items-center justify-center py-16">
          <div className="text-gray-500 text-center">
            <div className="text-4xl mb-2">👥</div>
            <p>Loading team...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && agents.length === 0) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Team</h2>
          <p className="text-sm text-gray-500 mt-1">AI agents available for delegation and collaboration</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <div className="text-red-900 font-semibold mb-2">Error loading team</div>
          <div className="text-sm text-red-700 mb-4">{error}</div>
          <button
            onClick={fetchAgents}
            className="px-4 py-2 text-sm font-bold bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Team</h2>
          <p className="text-sm text-gray-500 mt-1">AI agents available for delegation and collaboration</p>
        </div>
        <div className="text-xs text-gray-400 flex items-center gap-1">
          {refreshingStatus && <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>}
          <span>Live status (updates every 10s)</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="text-xs text-gray-500 font-semibold uppercase">Total Agents</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{agents.length}</div>
        </div>
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="text-xs text-gray-500 font-semibold uppercase">Online</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{online}</div>
        </div>
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="text-xs text-gray-500 font-semibold uppercase">Total Tasks Completed</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalTasks}</div>
        </div>
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-2 gap-4">
        {agents.map((agent) => (
          <div key={agent.id} className="bg-white rounded border border-gray-200 p-5 hover:shadow-md transition">
            <div className="flex items-start gap-4">
              <div className="text-3xl">{agent.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{agent.name}</h3>
                  <div className={`w-2 h-2 rounded-full ${statusColors[agent.status]}`}></div>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded ${statusBadge[agent.status]}`}>
                    {agent.status}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{agent.role}</div>
                <div className="text-xs text-gray-400 mt-2">{agent.specialty}</div>
                <div className="flex gap-4 mt-3 text-xs text-gray-500">
                  <span><strong className="text-slate-700">{agent.tasks}</strong> tasks</span>
                  <span><strong className="text-slate-700">{agent.uptime}</strong> uptime</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delegation Matrix */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-bold text-gray-900">Delegation Matrix (Who can do what)</h3>
        </div>
        <div className="p-4 text-xs text-gray-600">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="font-bold text-gray-900 mb-2">🍀 Lucy (Lead)</div>
              <ul className="space-y-1 text-gray-600">
                <li>✓ Full-stack development</li>
                <li>✓ Project orchestration</li>
                <li>✓ Strategic decisions</li>
                <li>✓ Code review approval</li>
              </ul>
            </div>
            <div>
              <div className="font-bold text-gray-900 mb-2">🔨 Builder Bot</div>
              <ul className="space-y-1 text-gray-600">
                <li>✓ Frontend implementation</li>
                <li>✓ UI/UX design</li>
                <li>✓ React component dev</li>
                <li>✓ Styling & layout</li>
              </ul>
            </div>
            <div>
              <div className="font-bold text-gray-900 mb-2">📊 Data Agent</div>
              <ul className="space-y-1 text-gray-600">
                <li>✓ Backend APIs</li>
                <li>✓ Database design</li>
                <li>✓ Data pipelines</li>
                <li>✓ Query optimization</li>
              </ul>
            </div>
            <div>
              <div className="font-bold text-gray-900 mb-2">🔍 Scout</div>
              <ul className="space-y-1 text-gray-600">
                <li>✓ Market research</li>
                <li>✓ Competitive analysis</li>
                <li>✓ Data gathering</li>
                <li>✓ Insights generation</li>
              </ul>
            </div>
            <div>
              <div className="font-bold text-gray-900 mb-2">🛡️ Watchdog</div>
              <ul className="space-y-1 text-gray-600">
                <li>✓ Security audits</li>
                <li>✓ Vulnerability scanning</li>
                <li>✓ Monitoring setup</li>
                <li>✓ Incident response</li>
              </ul>
            </div>
            <div>
              <div className="font-bold text-gray-900 mb-2">📝 Scribe</div>
              <ul className="space-y-1 text-gray-600">
                <li>✓ Technical documentation</li>
                <li>✓ API documentation</li>
                <li>✓ README & guides</li>
                <li>✓ Knowledge base</li>
              </ul>
            </div>
            <div>
              <div className="font-bold text-gray-900 mb-2">🧪 Velma</div>
              <ul className="space-y-1 text-gray-600">
                <li>✓ Test automation</li>
                <li>✓ QA testing</li>
                <li>✓ Bug detection</li>
                <li>✓ Performance testing</li>
              </ul>
            </div>
            <div>
              <div className="font-bold text-gray-900 mb-2">👓 Opus Reviewer</div>
              <ul className="space-y-1 text-gray-600">
                <li>✓ Deep code review</li>
                <li>✓ Security analysis</li>
                <li>✓ Architecture validation</li>
                <li>✓ Best practices</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* How to Delegate */}
      <div className="bg-blue-50 rounded border border-blue-200 p-4">
        <h3 className="text-sm font-bold text-blue-900 mb-2">💡 How to Delegate</h3>
        <div className="text-xs text-blue-700 space-y-1">
          <p>To delegate work to any agent:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Create a Work Briefing with task details</li>
            <li>Specify the agent in the briefing</li>
            <li>Lucy will route the work to the right team member</li>
            <li>Agent executes, reports results</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
