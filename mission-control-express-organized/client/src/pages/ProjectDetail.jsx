import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import projectMetadata from '../data/projectMetadata';
import TaskManagement from '../components/TaskManagement';

const STATUS_OPTIONS = ['Active', 'In Progress', 'Paused', 'Completed', 'Archived'];
const STATUS_COLORS = {
  'Active': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  'In Progress': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  'Paused': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  'Completed': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
  'Archived': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
};

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Active',
    progress: 0,
    owner: '',
    team: '',
  });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/${id}`);
        if (!res.ok) throw new Error('Failed to fetch project');
        const data = await res.json();
        setProject(data.project);
        setFormData({
          name: data.project.name,
          description: data.project.description || '',
          status: data.project.status,
          progress: data.project.progress || 0,
          owner: data.project.owner || '',
          team: data.project.team || '',
        });
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'progress' ? Math.min(100, Math.max(0, parseInt(value, 10) || 0)) : value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          status: formData.status,
          progress: formData.progress,
          owner: formData.owner,
          team: formData.team,
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save');
      }
      const data = await res.json();
      setProject(data.project);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: project.name,
      description: project.description || '',
      status: project.status,
      progress: project.progress || 0,
      owner: project.owner || '',
      team: project.team || '',
    });
    setIsEditing(false);
    setError(null);
  };

  const metadata = projectMetadata[parseInt(id)];
  const statusColor = STATUS_COLORS[project?.status] || STATUS_COLORS['Active'];

  if (loading) return <div className="text-center py-16 text-gray-500">Loading...</div>;
  if (error && !project) return <div className="text-center py-16 text-red-600">Error: {error}</div>;
  if (!project) return <div className="text-center py-16 text-gray-500">Project not found</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Error Alert */}
      {error && isEditing && (
        <div className="p-4 bg-red-100 text-red-700 rounded text-sm border border-red-300">
          {error}
        </div>
      )}

      {/* Header Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Project Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                maxLength={500}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-2xl font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
                <p className="text-gray-600 text-sm mt-2">{project.description || 'No description'}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}
              >
                {project.status}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Status Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-xs text-gray-600 font-semibold uppercase mb-2">Status</div>
          {isEditing ? (
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          ) : (
            <div
              className={`inline-block px-2 py-1 rounded-md text-sm font-semibold border ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}
            >
              {project.status}
            </div>
          )}
        </div>

        {/* Owner Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-xs text-gray-600 font-semibold uppercase mb-2">Owner</div>
          {isEditing ? (
            <input
              type="text"
              name="owner"
              value={formData.owner}
              onChange={handleInputChange}
              placeholder="Assign owner"
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          ) : (
            <div className="text-sm font-semibold text-gray-900">{project.owner || '—'}</div>
          )}
        </div>

        {/* Team Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-xs text-gray-600 font-semibold uppercase mb-2">Team</div>
          {isEditing ? (
            <input
              type="text"
              name="team"
              value={formData.team}
              onChange={handleInputChange}
              placeholder="e.g., Dev Team"
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          ) : (
            <div className="text-sm font-semibold text-gray-900">{project.team || '—'}</div>
          )}
        </div>

        {/* Task Count Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-xs text-gray-600 font-semibold uppercase mb-2">Tasks</div>
          <div className="text-lg font-bold text-gray-900">{project.taskCount || 0}</div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Overall Progress</h3>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="range"
                name="progress"
                min="0"
                max="100"
                value={formData.progress}
                onChange={handleInputChange}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm font-bold text-gray-900 w-12 text-right">
                {formData.progress}%
              </span>
            </div>
          ) : (
            <span className="text-sm font-bold text-gray-900">{project.progress || 0}%</span>
          )}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-300"
            style={{ width: `${project.progress || 0}%` }}
          ></div>
        </div>
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Dynamic Sections from metadata */}
      {metadata && metadata.sections && (
        <div className="space-y-6">
          {metadata.sections.map((section, idx) => (
            <div key={idx} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-sm font-bold text-gray-900">{section.title}</h2>
              </div>
              <div className="p-6">
                {/* Metrics Grid */}
                {section.metrics && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {section.metrics.map((metric, i) => (
                      <div key={i} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="text-xs text-gray-600 font-semibold uppercase">{metric.label}</div>
                        <div className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</div>
                        <div className="text-xs text-gray-500 mt-1">{metric.trend}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Status Items / Milestones */}
                {section.items && (
                  <div className="space-y-2 mb-6">
                    {section.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-900">
                            {item.link ? (
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {item.name} ↗
                              </a>
                            ) : (
                              item.name
                            )}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">{item.date}</div>
                        </div>
                        <div className="text-sm font-semibold text-gray-600 ml-4">{item.status}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tasks List */}
                {section.tasks && (
                  <div className="space-y-2">
                    {section.tasks.map((task, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-900">{task.name}</div>
                          <div className="text-xs text-gray-600 mt-1">Assigned to: {task.assignee}</div>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            task.status === 'Completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Management - Quick Adjustments */}
      <TaskManagement
        projectId={parseInt(id)}
        tasks={metadata?.sections?.find(s => s.tasks)?.tasks || []}
      />

      {/* Action Buttons */}
      <div className="flex gap-3">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-4 py-3 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex-1 px-4 py-3 bg-gray-300 text-gray-800 text-sm font-semibold rounded-lg hover:bg-gray-400 disabled:bg-gray-200 transition"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 px-4 py-3 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition"
            >
              Edit Project
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 text-sm font-semibold rounded-lg hover:bg-gray-300 transition"
            >
              Back to Projects
            </button>
          </>
        )}
      </div>
    </div>
  );
}
