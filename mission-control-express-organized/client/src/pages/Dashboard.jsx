import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({ active: 0, tasks: 0, completion: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    owner: 'Lucy',
    timeline: '',
    goals: '',
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects');
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        const data = await res.json();
        setProjects(data.projects || []);

        if (data.projects) {
          const active = data.projects.filter(p => p.status === 'Active').length;
          const tasks = data.projects.reduce((sum, p) => sum + (p.taskCount || 0), 0);
          const completion = data.projects.length > 0
            ? Math.round(data.projects.reduce((sum, p) => sum + (p.progress || 0), 0) / data.projects.length)
            : 0;
          setStats({ active, tasks, completion, pending: data.pendingApprovals || 0 });
        }
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(p => {
    const status = (p.status || '').toLowerCase();
    if (activeTab === 'all') return status !== 'archived';
    if (activeTab === 'completed') return status === 'completed';
    if (activeTab === 'archived') return status === 'archived';
    return true;
  });

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setCreateError('Project name is required');
      return;
    }

    try {
      setCreateLoading(true);
      setCreateError(null);
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create project');
      }

      const data = await res.json();
      setProjects([...projects, data.project]);
      setFormData({ name: '', description: '', owner: 'Lucy', timeline: '', goals: '' });
      setShowCreateModal(false);
      setCreateLoading(false);
    } catch (err) {
      setCreateError(err.message);
      setCreateLoading(false);
    }
  };

  const recentUpdates = [
    { id: 1, activity: 'Mission Control redesign specs delivered', time: '2 hours ago', status: 'Complete' },
    { id: 2, activity: 'LinkedIn post generated and published', time: '5 hours ago', status: 'Complete' },
    { id: 3, activity: 'Gap Analysis assessment saved', time: '1 day ago', status: 'Complete' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Projects</h2>
        <p className="text-sm text-gray-500 mt-1">Overview of all active projects and tasks</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active', value: stats.active, meta: 'Projects' },
          { label: 'Tasks', value: stats.tasks, meta: 'In progress' },
          { label: 'Completion', value: `${stats.completion}%`, meta: 'Overall rate' },
          { label: 'Pending', value: stats.pending, meta: 'Approvals' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded border border-gray-200 p-4">
            <div className="text-xs text-gray-500 font-semibold uppercase">{stat.label}</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</div>
            <div className="text-xs text-gray-400 mt-1">{stat.meta}</div>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded text-sm">
          ⚠️ API Error: {error}
        </div>
      )}

      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Active Projects</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded hover:bg-blue-600 transition-colors"
        >
          + New Project
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {['all', 'completed', 'archived'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'all' ? ` (${projects.length})` : ''}
          </button>
        ))}
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-4 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
          <div>Name</div>
          <div>Status</div>
          <div>Progress</div>
          <div>Action</div>
        </div>

        {loading ? (
          <div className="px-4 py-8 text-center text-gray-500">Loading projects...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">No projects found</div>
        ) : (
          filteredProjects.map((project) => (
            <div
              key={project.id}
              className="grid grid-cols-4 gap-4 px-4 py-3 border-b border-gray-100 items-center hover:bg-gray-50 transition-colors"
            >
              <div>
                <div className="text-sm font-bold text-slate-900">{project.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">Owner: {project.owner || 'Team'}</div>
              </div>
              <div>
                <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${
                  project.status === 'Active' ? 'bg-green-100 text-green-700' :
                  project.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {project.status}
                </span>
              </div>
              <div>
                <div className="w-full bg-gray-200 rounded h-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full transition-all"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">{project.progress}%</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    // Special routing for Improvements project
                    if (project.id === 7) {
                      navigate('/improvements');
                    } else {
                      navigate(`/projects/${project.id}`);
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-bold bg-sky-500 text-white rounded hover:bg-sky-600 transition-colors"
                >
                  View
                </button>
                {project.id !== 7 && (
                  <button
                    onClick={() => navigate(`/projects/${project.id}/edit`)}
                    className="px-3 py-1.5 text-xs font-bold bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Recent Updates */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Recent Updates</h3>
        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-3 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
            <div>Activity</div>
            <div>Time</div>
            <div>Status</div>
          </div>
          {recentUpdates.map((update) => (
            <div
              key={update.id}
              className="grid grid-cols-3 gap-4 px-4 py-3 border-b border-gray-100 items-center"
            >
              <div className="text-sm font-medium text-slate-900">{update.activity}</div>
              <div className="text-sm text-gray-500">{update.time}</div>
              <div className="text-sm font-semibold text-green-600">{update.status}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-slate-900">Create New Project</h2>
              <p className="text-sm text-gray-500 mt-1">
                Define a new project. It will be executed with all normal routines and schedules.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              {createError && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded text-sm">
                  {createError}
                </div>
              )}

              {/* Project Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Q2 Infrastructure Upgrade"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What is this project about? Goals and context..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Owner */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Owner
                </label>
                <select
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  <option>Lucy</option>
                  <option>Chief</option>
                  <option>Velma</option>
                  <option>Johnny</option>
                  <option>Jarvis</option>
                  <option>Opus</option>
                  <option>Scout</option>
                  <option>Mark</option>
                  <option>Steven</option>
                </select>
              </div>

              {/* Timeline */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Timeline
                </label>
                <input
                  type="text"
                  value={formData.timeline}
                  onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                  placeholder="e.g., 2 weeks, March 29 - April 15"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Goals */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Goals/Success Criteria
                </label>
                <textarea
                  value={formData.goals}
                  onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                  placeholder="What does success look like? Measurable outcomes..."
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateError(null);
                    setFormData({ name: '', description: '', owner: 'Lucy', timeline: '', goals: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
                >
                  {createLoading ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
