const docCategories = [
  {
    name: 'Architecture',
    icon: '🏗️',
    docs: [
      { title: 'System Architecture Overview', description: 'High-level architecture of the Elevation AI platform', updated: 'Mar 24, 2026' },
      { title: 'API Reference', description: 'REST API endpoints, authentication, and rate limits', updated: 'Mar 22, 2026' },
      { title: 'Database Schema', description: 'Supabase tables, relationships, and migrations', updated: 'Mar 20, 2026' },
    ],
  },
  {
    name: 'Deployment',
    icon: '🚀',
    docs: [
      { title: 'Vercel Deployment Guide', description: 'How to deploy and manage projects on Vercel', updated: 'Mar 23, 2026' },
      { title: 'Cloudflare DNS Setup', description: 'Domain configuration and SSL certificates', updated: 'Mar 18, 2026' },
      { title: 'CI/CD Pipeline', description: 'Automated testing and deployment workflows', updated: 'Mar 15, 2026' },
    ],
  },
  {
    name: 'Projects',
    icon: '📁',
    docs: [
      { title: 'WorkSafeAI Documentation', description: 'Safety compliance platform — features, API, admin guide', updated: 'Mar 25, 2026' },
      { title: 'Mission Control Specs', description: 'This dashboard — design decisions and component library', updated: 'Mar 25, 2026' },
      { title: 'Consensus App Guide', description: 'Team decision-making tool — setup and usage', updated: 'Mar 19, 2026' },
    ],
  },
  {
    name: 'Operations',
    icon: '⚙️',
    docs: [
      { title: 'Agent Playbook', description: 'Standard operating procedures for AI agents', updated: 'Mar 21, 2026' },
      { title: 'Security Policies', description: 'Access control, secrets management, audit procedures', updated: 'Mar 16, 2026' },
      { title: 'Incident Response', description: 'How to handle outages, breaches, and critical bugs', updated: 'Mar 10, 2026' },
    ],
  },
];

export default function Docs() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Documentation</h2>
          <p className="text-sm text-gray-500 mt-1">Knowledge base and reference materials</p>
        </div>
        <button className="px-4 py-2 text-sm font-bold bg-sky-500 text-white rounded hover:bg-sky-600 transition-colors">
          + New Document
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="text-xs text-gray-500 font-semibold uppercase">Total Documents</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{docCategories.reduce((sum, c) => sum + c.docs.length, 0)}</div>
        </div>
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="text-xs text-gray-500 font-semibold uppercase">Categories</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{docCategories.length}</div>
        </div>
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="text-xs text-gray-500 font-semibold uppercase">Last Updated</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">Today</div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {docCategories.map((category) => (
          <div key={category.name} className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {category.docs.map((doc) => (
                <div key={doc.title} className="bg-white rounded border border-gray-200 p-4 flex items-center justify-between hover:border-gray-300 transition-colors cursor-pointer">
                  <div>
                    <div className="text-sm font-bold text-slate-900">{doc.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{doc.description}</div>
                  </div>
                  <div className="text-xs text-gray-400 shrink-0 ml-4">Updated {doc.updated}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
