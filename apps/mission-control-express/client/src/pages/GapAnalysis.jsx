import { useState } from 'react';

const metrics = [
  { name: 'Autonomy', grade: 'A-', score: 91, color: 'bg-green-500', description: 'Ability to operate independently and make decisions without human intervention' },
  { name: 'Value Generation', grade: 'B+', score: 84, color: 'bg-blue-500', description: 'Revenue impact, cost savings, and measurable business outcomes produced' },
  { name: 'Organization', grade: 'A', score: 95, color: 'bg-emerald-500', description: 'File structure, documentation quality, and systematic workflow management' },
  { name: 'Scalability', grade: 'B', score: 78, color: 'bg-yellow-500', description: 'Capacity to handle increased workload and expand to new domains' },
  { name: 'Reliability', grade: 'A-', score: 89, color: 'bg-purple-500', description: 'Uptime, error rate, and consistency of task completion' },
  { name: 'Collaboration', grade: 'B+', score: 82, color: 'bg-indigo-500', description: 'Effectiveness of human-AI interaction and multi-agent coordination' },
];

const recommendations = [
  { priority: 'High', area: 'Scalability', action: 'Implement auto-scaling for parallel task execution', status: 'In Progress' },
  { priority: 'Medium', area: 'Collaboration', action: 'Add structured feedback loops for task outcomes', status: 'Planned' },
  { priority: 'Medium', area: 'Value Generation', action: 'Set up ROI tracking dashboard for completed tasks', status: 'Planned' },
  { priority: 'Low', area: 'Reliability', action: 'Add redundancy for critical automation workflows', status: 'Backlog' },
];

export default function GapAnalysis() {
  const [selectedMetric, setSelectedMetric] = useState(null);
  const overallScore = Math.round(metrics.reduce((sum, m) => sum + m.score, 0) / metrics.length);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Gap Analysis</h2>
        <p className="text-sm text-gray-500 mt-1">System performance metrics and improvement opportunities</p>
      </div>

      {/* Overall Score */}
      <div className="bg-white rounded border border-gray-200 p-6 flex items-center gap-6">
        <div className="w-20 h-20 rounded-full border-4 border-blue-500 flex items-center justify-center">
          <span className="text-2xl font-bold text-slate-900">{overallScore}</span>
        </div>
        <div>
          <div className="text-lg font-bold text-slate-900">Overall System Score</div>
          <div className="text-sm text-gray-500 mt-1">Based on 6 core metrics · Last assessed March 25, 2026</div>
        </div>
        <div className="ml-auto">
          <span className="px-3 py-1 text-sm font-semibold rounded bg-green-100 text-green-700">Healthy</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <button
            key={metric.name}
            onClick={() => setSelectedMetric(selectedMetric === metric.name ? null : metric.name)}
            className={`bg-white rounded border p-4 text-left transition-all ${
              selectedMetric === metric.name ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">{metric.name}</div>
              <div className="text-lg font-bold text-slate-900">{metric.grade}</div>
            </div>
            <div className="mt-3 w-full bg-gray-200 rounded h-2 overflow-hidden">
              <div className={`${metric.color} h-full transition-all`} style={{ width: `${metric.score}%` }}></div>
            </div>
            <div className="text-xs text-gray-500 mt-2">{metric.score}/100</div>
            {selectedMetric === metric.name && (
              <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600">
                {metric.description}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Recommendations</h3>
        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-4 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
            <div>Priority</div>
            <div>Area</div>
            <div>Action</div>
            <div>Status</div>
          </div>
          {recommendations.map((rec, i) => (
            <div key={i} className="grid grid-cols-4 gap-4 px-4 py-3 border-b border-gray-100 items-center">
              <div>
                <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${
                  rec.priority === 'High' ? 'bg-red-100 text-red-700' :
                  rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-600'
                }`}>{rec.priority}</span>
              </div>
              <div className="text-sm font-medium text-slate-900">{rec.area}</div>
              <div className="text-sm text-gray-600">{rec.action}</div>
              <div className="text-sm text-gray-500">{rec.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
