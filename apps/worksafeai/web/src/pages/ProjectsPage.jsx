import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import apiClient from '../api/client';
import useAuthStore from '../stores/authStore';
import { Plus, Trash2, Edit2, Loader } from 'lucide-react';

export default function ProjectsPage() {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    try {
      const response = await apiClient.get(`/companies/${user.companyId}/projects`);
      setProjects(response.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await apiClient.post(`/companies/${user.companyId}/projects`, formData);
      setFormData({ name: '', description: '' });
      setShowForm(false);
      await fetchProjects();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchiveProject = async (projectId) => {
    if (!window.confirm('Archive this project? JTSAs will remain accessible.')) return;

    try {
      await apiClient.patch(`/projects/${projectId}`, { status: 'archived' });
      await fetchProjects();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to archive project');
    }
  };

  if (loading) return <Layout><div className="text-center py-8">Loading projects...</div></Layout>;

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Projects</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800">
            {error}
          </div>
        )}

        {/* Create Form */}
        {showForm && (
          <div className="card mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Warehouse Renovation"
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Project details and scope..."
                  rows="3"
                  className="input-field"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex items-center gap-2"
                >
                  {submitting && <Loader className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Creating...' : 'Create Project'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ name: '', description: '' });
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Projects List */}
        {projects.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 mb-4">No projects yet. Create one to get started!</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="card border-l-4 border-blue-600 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{project.name}</h3>
                    {project.description && (
                      <p className="text-gray-600 text-sm mt-2">{project.description}</p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      project.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {project.status === 'active' ? 'Active' : 'Archived'}
                  </span>
                </div>

                <p className="text-xs text-gray-500 mb-4">
                  Created: {new Date(project.created_at).toLocaleDateString()}
                </p>

                {project.status === 'active' && (
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                      <Edit2 className="w-4 h-4" />
                      <span className="text-sm">Edit</span>
                    </button>
                    <button
                      onClick={() => handleArchiveProject(project.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm">Archive</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
