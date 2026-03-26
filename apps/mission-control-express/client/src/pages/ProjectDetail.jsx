import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import projectMetadata from '../data/projectMetadata';
import DocumentViewer from '../components/DocumentViewer';
import TaskManagement from '../components/TaskManagement';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/${id}`);
        if (!res.ok) throw new Error('Failed to fetch project');
        const data = await res.json();
        setProject(data.project);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const metadata = projectMetadata[parseInt(id)];

  if (loading) return <div className="text-center py-16 text-gray-500">Loading...</div>;
  if (error) return <div className="text-center py-16 text-red-600">Error: {error}</div>;
  if (!project) return <div className="text-center py-16 text-gray-500">Project not found</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
        <p className="text-gray-600 text-sm mt-1">{project.description}</p>
      </div>

      {/* Key Stats Bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Status', value: project.status },
          { label: 'Progress', value: `${project.progress}%` },
          { label: 'Tasks', value: project.taskCount },
          { label: 'Owner', value: project.owner || 'Team' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded p-3 border border-gray-200">
            <div className="text-xs text-gray-600 font-semibold uppercase">{stat.label}</div>
            <div className="text-lg font-bold text-gray-900 mt-1">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700">Overall Progress</h3>
          <span className="text-sm font-bold text-gray-900">{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded h-2 overflow-hidden">
          <div
            className="bg-blue-500 h-full transition-all"
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Dynamic Sections from metadata */}
      {metadata && metadata.sections && (
        <div className="space-y-6">
          {metadata.sections.map((section, idx) => (
            <div key={idx} className="bg-white rounded border border-gray-200 overflow-hidden">
              <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                <h2 className="text-sm font-bold text-gray-900">{section.title}</h2>
              </div>
              <div className="p-4">
                {/* Metrics Grid */}
                {section.metrics && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {section.metrics.map((metric, i) => (
                      <div key={i} className="border border-gray-200 rounded p-3">
                        <div className="text-xs text-gray-600 font-semibold">{metric.label}</div>
                        <div className="text-xl font-bold text-gray-900 mt-1">{metric.value}</div>
                        <div className="text-xs text-gray-500 mt-1">{metric.trend}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Status Items / Milestones */}
                {section.items && (
                  <div className="space-y-2">
                    {section.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 border border-gray-200 rounded hover:bg-gray-50 transition"
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
                          <div className="text-xs text-gray-600">{item.date}</div>
                        </div>
                        <div className="text-sm font-bold">{item.status}</div>
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
                        className="flex items-center justify-between p-2 border border-gray-200 rounded hover:bg-gray-50 transition"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-900">{task.name}</div>
                          <div className="text-xs text-gray-600">Assigned to: {task.assignee}</div>
                        </div>
                        <div className="text-sm font-bold">{task.status}</div>
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

      {/* Documents Section */}
      <DocumentViewer projectId={parseInt(id)} />

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate(`/projects/${id}/edit`)}
          className="flex-1 px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded hover:bg-blue-600 transition"
        >
          Edit Project
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 text-sm font-semibold rounded hover:bg-gray-300 transition"
        >
          Back to Projects
        </button>
      </div>
    </div>
  );
}
