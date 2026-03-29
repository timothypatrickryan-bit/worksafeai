import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ProjectCustom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projectType, setProjectType] = useState('general');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/${id}`);
        if (!res.ok) throw new Error('Project not found');
        const data = await res.json();
        setProject(data.project);
        setProjectType(detectProjectType(data.project.name, data.project.description));
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  // Detect project type from name and description
  const detectProjectType = (name, description = '') => {
    const text = `${name} ${description}`.toLowerCase();
    
    if (text.includes('infrastructure') || text.includes('devops') || text.includes('deployment') || text.includes('ci/cd') || text.includes('server')) {
      return 'infrastructure';
    }
    if (text.includes('feature') || text.includes('development') || text.includes('code') || text.includes('bug') || text.includes('refactor')) {
      return 'development';
    }
    if (text.includes('research') || text.includes('analysis') || text.includes('market') || text.includes('competitive') || text.includes('study')) {
      return 'research';
    }
    if (text.includes('marketing') || text.includes('campaign') || text.includes('linkedin') || text.includes('post') || text.includes('content')) {
      return 'marketing';
    }
    if (text.includes('strategy') || text.includes('planning') || text.includes('roadmap') || text.includes('vision') || text.includes('direction')) {
      return 'strategy';
    }
    if (text.includes('operations') || text.includes('process') || text.includes('workflow') || text.includes('automation') || text.includes('system')) {
      return 'operations';
    }
    if (text.includes('design') || text.includes('ui') || text.includes('ux') || text.includes('interface') || text.includes('visual')) {
      return 'design';
    }
    
    return 'general';
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <div className="text-center text-gray-500">Loading project...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <div className="text-center text-gray-500">Project not found</div>
      </div>
    );
  }

  // Render type-specific UI
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              ← Back to Dashboard
            </button>
            <span className={`px-2 py-1 text-xs font-bold rounded ${getTypeColor(projectType)}`}>
              {projectType.charAt(0).toUpperCase() + projectType.slice(1)}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
          <p className="text-gray-600 mt-2">{project.description}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Status</div>
          <div className="text-2xl font-bold text-green-600">{project.status}</div>
          <div className="text-sm text-gray-500 mt-2">{Math.round(project.progress)}% Complete</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded border border-gray-200 p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
          <span className="text-sm font-bold text-gray-900">{Math.round(project.progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-500 h-3 rounded-full transition-all"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Type-Specific Content */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left Column: Details */}
        <div className="space-y-6">
          {/* Project Details */}
          <div className="bg-white rounded border border-gray-200 p-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">📋 Project Details</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500 font-semibold">Owner</span>
                <p className="text-slate-900">{project.owner || 'Unassigned'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500 font-semibold">Timeline</span>
                <p className="text-slate-900">{project.timeline || 'TBD'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500 font-semibold">Created</span>
                <p className="text-slate-900">{new Date(project.createdAt).toLocaleDateString()}</p>
              </div>
              {project.goals && (
                <div>
                  <span className="text-sm text-gray-500 font-semibold">Goals</span>
                  <p className="text-slate-900 whitespace-pre-wrap">{project.goals}</p>
                </div>
              )}
            </div>
          </div>

          {/* Type-Specific Metrics */}
          {renderTypeMetrics(projectType, project)}
        </div>

        {/* Right Column: Tasks & Execution */}
        <div className="space-y-6">
          {/* Auto-Generated Tasks */}
          <div className="bg-white rounded border border-gray-200 p-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">✅ Auto-Generated Tasks</h3>
            <p className="text-sm text-gray-600 mb-4">
              These tasks were automatically created based on the "{projectType}" project type.
            </p>
            <div className="space-y-2">
              {getTypeSpecificTasks(projectType).map((task, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 border border-gray-200 rounded hover:bg-gray-50">
                  <input type="checkbox" className="mt-1" />
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-slate-900">{task.title}</div>
                    <div className="text-xs text-gray-600 mt-1">{task.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Execution Status */}
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <h3 className="font-bold text-blue-900 mb-2">⚡ Execution Status</h3>
            <p className="text-sm text-blue-800 mb-3">
              This project was automatically executed when created. Briefings have been generated and distributed to the team.
            </p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✅ Tasks decomposed by type</li>
              <li>✅ Briefings generated for Level 1-3</li>
              <li>✅ L1-2 work executing automatically</li>
              <li>✅ L3 work executing with notifications</li>
              <li>✅ L4 work in Briefing Queue for approval</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Type-Specific Panels */}
      {renderTypeSpecificPanels(projectType, project)}
    </div>
  );
}

function getTypeColor(type) {
  const colors = {
    infrastructure: 'bg-orange-100 text-orange-800',
    development: 'bg-blue-100 text-blue-800',
    research: 'bg-purple-100 text-purple-800',
    marketing: 'bg-pink-100 text-pink-800',
    strategy: 'bg-indigo-100 text-indigo-800',
    operations: 'bg-cyan-100 text-cyan-800',
    design: 'bg-green-100 text-green-800',
    general: 'bg-gray-100 text-gray-800',
  };
  return colors[type] || colors.general;
}

function getTypeSpecificTasks(type) {
  const tasks = {
    infrastructure: [
      { title: 'Architecture design', description: 'Plan infrastructure and deployment strategy' },
      { title: 'Environment setup', description: 'Configure dev, staging, and production' },
      { title: 'Deployment pipeline', description: 'Build CI/CD pipeline and automation' },
      { title: 'Monitoring & alerts', description: 'Set up monitoring and alerting' },
      { title: 'Security hardening', description: 'Apply security best practices' },
      { title: 'Testing & validation', description: 'Test systems and performance' },
    ],
    development: [
      { title: 'Requirements & design', description: 'Finalize requirements and technical design' },
      { title: 'Implementation', description: 'Code implementation and unit testing' },
      { title: 'Code review', description: 'Peer review and address feedback' },
      { title: 'Integration testing', description: 'Test integration with other systems' },
      { title: 'Documentation', description: 'Create API and technical docs' },
      { title: 'Deployment', description: 'Deploy to production and verify' },
    ],
    research: [
      { title: 'Literature review', description: 'Gather and analyze relevant research' },
      { title: 'Data collection', description: 'Collect primary and secondary data' },
      { title: 'Analysis', description: 'Analyze findings and identify patterns' },
      { title: 'Synthesis', description: 'Synthesize into insights and recommendations' },
      { title: 'Reporting', description: 'Create research report and presentation' },
    ],
    marketing: [
      { title: 'Strategy & positioning', description: 'Define audience and messaging' },
      { title: 'Content creation', description: 'Create marketing materials' },
      { title: 'Campaign launch', description: 'Execute campaign across channels' },
      { title: 'Monitoring & optimization', description: 'Track metrics and optimize' },
      { title: 'Reporting & analysis', description: 'Report on results and ROI' },
    ],
    strategy: [
      { title: 'Situation analysis', description: 'Analyze current state and context' },
      { title: 'Strategic planning', description: 'Develop strategic roadmap' },
      { title: 'Resource planning', description: 'Allocate resources and timeline' },
      { title: 'Communication', description: 'Communicate strategy to stakeholders' },
      { title: 'Execution tracking', description: 'Monitor execution and adjust' },
    ],
    operations: [
      { title: 'Process design', description: 'Define workflow and process steps' },
      { title: 'System setup', description: 'Configure tools and systems' },
      { title: 'Documentation', description: 'Create process documentation' },
      { title: 'Testing', description: 'Test process and identify improvements' },
      { title: 'Rollout & training', description: 'Train team and deploy' },
    ],
    design: [
      { title: 'Concept & wireframes', description: 'Create design concepts and wireframes' },
      { title: 'High-fidelity design', description: 'Develop high-fidelity mockups' },
      { title: 'Design system', description: 'Create design system and components' },
      { title: 'Handoff & specs', description: 'Prepare specs for development' },
      { title: 'Validation & iteration', description: 'Test with users and iterate' },
    ],
    general: [
      { title: 'Plan and scope', description: 'Define scope and requirements' },
      { title: 'Execute work', description: 'Complete core deliverables' },
      { title: 'Review and validate', description: 'Quality assurance and verification' },
      { title: 'Document and close', description: 'Final documentation and closure' },
    ],
  };
  return tasks[type] || tasks.general;
}

function renderTypeMetrics(type, project) {
  const metricsByType = {
    infrastructure: (
      <div className="bg-white rounded border border-gray-200 p-4">
        <h3 className="text-lg font-bold text-slate-900 mb-4">📊 Infrastructure Metrics</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-orange-50 rounded p-3">
            <div className="text-xs text-gray-600">Target Uptime</div>
            <div className="text-xl font-bold text-orange-700">99.9%</div>
          </div>
          <div className="bg-orange-50 rounded p-3">
            <div className="text-xs text-gray-600">Deployment Time</div>
            <div className="text-xl font-bold text-orange-700">&lt;5m</div>
          </div>
          <div className="bg-orange-50 rounded p-3">
            <div className="text-xs text-gray-600">Systems</div>
            <div className="text-xl font-bold text-orange-700">3+</div>
          </div>
          <div className="bg-orange-50 rounded p-3">
            <div className="text-xs text-gray-600">Environments</div>
            <div className="text-xl font-bold text-orange-700">3</div>
          </div>
        </div>
      </div>
    ),
    development: (
      <div className="bg-white rounded border border-gray-200 p-4">
        <h3 className="text-lg font-bold text-slate-900 mb-4">💻 Development Metrics</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded p-3">
            <div className="text-xs text-gray-600">Code Coverage</div>
            <div className="text-xl font-bold text-blue-700">80%+</div>
          </div>
          <div className="bg-blue-50 rounded p-3">
            <div className="text-xs text-gray-600">Test Pass Rate</div>
            <div className="text-xl font-bold text-blue-700">100%</div>
          </div>
          <div className="bg-blue-50 rounded p-3">
            <div className="text-xs text-gray-600">Code Review</div>
            <div className="text-xl font-bold text-blue-700">2+ Eyes</div>
          </div>
          <div className="bg-blue-50 rounded p-3">
            <div className="text-xs text-gray-600">Documentation</div>
            <div className="text-xl font-bold text-blue-700">Complete</div>
          </div>
        </div>
      </div>
    ),
    research: (
      <div className="bg-white rounded border border-gray-200 p-4">
        <h3 className="text-lg font-bold text-slate-900 mb-4">🔬 Research Metrics</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-purple-50 rounded p-3">
            <div className="text-xs text-gray-600">Sources</div>
            <div className="text-xl font-bold text-purple-700">10+</div>
          </div>
          <div className="bg-purple-50 rounded p-3">
            <div className="text-xs text-gray-600">Data Points</div>
            <div className="text-xl font-bold text-purple-700">50+</div>
          </div>
          <div className="bg-purple-50 rounded p-3">
            <div className="text-xs text-gray-600">Analysis Depth</div>
            <div className="text-xl font-bold text-purple-700">Deep</div>
          </div>
          <div className="bg-purple-50 rounded p-3">
            <div className="text-xs text-gray-600">Insights</div>
            <div className="text-xl font-bold text-purple-700">5+</div>
          </div>
        </div>
      </div>
    ),
    marketing: (
      <div className="bg-white rounded border border-gray-200 p-4">
        <h3 className="text-lg font-bold text-slate-900 mb-4">📈 Marketing Metrics</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-pink-50 rounded p-3">
            <div className="text-xs text-gray-600">Target Reach</div>
            <div className="text-xl font-bold text-pink-700">10k+</div>
          </div>
          <div className="bg-pink-50 rounded p-3">
            <div className="text-xs text-gray-600">Engagement Rate</div>
            <div className="text-xl font-bold text-pink-700">5%+</div>
          </div>
          <div className="bg-pink-50 rounded p-3">
            <div className="text-xs text-gray-600">Channels</div>
            <div className="text-xl font-bold text-pink-700">3+</div>
          </div>
          <div className="bg-pink-50 rounded p-3">
            <div className="text-xs text-gray-600">Content Pieces</div>
            <div className="text-xl font-bold text-pink-700">5+</div>
          </div>
        </div>
      </div>
    ),
    strategy: (
      <div className="bg-white rounded border border-gray-200 p-4">
        <h3 className="text-lg font-bold text-slate-900 mb-4">🎯 Strategy Metrics</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-indigo-50 rounded p-3">
            <div className="text-xs text-gray-600">Priorities</div>
            <div className="text-xl font-bold text-indigo-700">3-5</div>
          </div>
          <div className="bg-indigo-50 rounded p-3">
            <div className="text-xs text-gray-600">Timeline</div>
            <div className="text-xl font-bold text-indigo-700">6-12m</div>
          </div>
          <div className="bg-indigo-50 rounded p-3">
            <div className="text-xs text-gray-600">Stakeholders</div>
            <div className="text-xl font-bold text-indigo-700">5+</div>
          </div>
          <div className="bg-indigo-50 rounded p-3">
            <div className="text-xs text-gray-600">Alignment</div>
            <div className="text-xl font-bold text-indigo-700">High</div>
          </div>
        </div>
      </div>
    ),
    default: null,
  };
  return metricsByType[type] || metricsByType.default;
}

function renderTypeSpecificPanels(type, project) {
  // Can be extended with type-specific workflows, kanban boards, etc.
  return null;
}
