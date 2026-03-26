import { useState, useEffect } from 'react';

const REAL_AGENTS = {
  'lucy': { name: 'Lucy', role: 'Lead AI Agent', avatar: '🍀', specialty: 'Full-stack development, project management', tasks: 142, uptime: '99.2%' },
  'builder-bot': { name: 'Builder Bot', role: 'Frontend Engineer', avatar: '🔨', specialty: 'React, Tailwind, UI/UX implementation', tasks: 87, uptime: '97.8%' },
  'data-agent': { name: 'Data Agent', role: 'Backend / Data', avatar: '📊', specialty: 'APIs, databases, data pipelines', tasks: 64, uptime: '98.5%' },
  'scout': { name: 'Scout', role: 'Research & Analysis', avatar: '🔍', specialty: 'Web research, competitive analysis', tasks: 53, uptime: '96.1%' },
  'watchdog': { name: 'Watchdog', role: 'Security & Monitoring', avatar: '🛡️', specialty: 'Security audits, uptime monitoring', tasks: 31, uptime: '99.9%' },
  'scribe': { name: 'Scribe', role: 'Documentation', avatar: '📝', specialty: 'Technical writing, knowledge base', tasks: 28, uptime: '94.3%' },
  'velma': { name: 'Velma', role: 'QA & Testing', avatar: '🧪', specialty: 'Test automation, quality assurance, bug detection', tasks: 45, uptime: '98.7%' },
  'opus-reviewer': { name: 'Opus Reviewer', role: 'Code Quality', avatar: '👓', specialty: 'Deep code review, security analysis, architecture validation', tasks: 22, uptime: '99.5%' },
};

export default function Team() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState({});

  useEffect(() => {
    // Note: In a real system, would fetch from API
    // For now, we show all defined agents + their session status
    const displayAgents = Object.entries(REAL_AGENTS).map(([key, data], idx) => ({
      id: idx + 1,
      key,
      ...data,
      status: getAgentStatus(key),
    }));

    setAgents(displayAgents);
    setLoading(false);
  }, []);

  const getAgentStatus = (agentKey) => {
    // In real system, check if agent has active sessions
    // For now, online if not explicitly offline
    const offlineAgents = ['scribe']; // Placeholder
    return offlineAgents.includes(agentKey) ? 'Offline' : 'Online';
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
  const totalTasks = agents.reduce((sum, a) => sum + a.tasks, 0);

  if (loading) {
    return <div className="text-center py-16 text-gray-500">Loading team...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Team</h2>
        <p className="text-sm text-gray-500 mt-1">AI agents available for delegation and collaboration</p>
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
