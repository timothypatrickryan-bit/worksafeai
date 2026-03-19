const ProjectsSection = ({ state }) => {
  const projects = state?.projects || [];

  if (!projects || projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary text-lg">No projects available</p>
      </div>
    );
  }

  const getHealthColor = (health) => {
    if (health === 'healthy') return 'bg-green-100 text-success';
    if (health === 'warning') return 'bg-warning bg-opacity-10 text-warning';
    if (health === 'critical') return 'bg-red-100 text-danger';
    return 'bg-gray-100 text-secondary';
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-dark mb-6">📊 Projects</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-dark">{project.name}</h3>
                <p className="text-sm text-secondary">{project.description}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(project.health)}`}>
                {project.health}
              </div>
            </div>

            {/* Progress */}
            {project.progress !== undefined && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-secondary">Progress</p>
                  <p className="text-sm font-medium text-dark">{project.progress}%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Alerts */}
            {project.alerts && project.alerts.length > 0 && (
              <div className="mb-4 p-3 bg-orange-50 rounded-md">
                <p className="text-sm font-medium text-warning mb-2">Alerts ({project.alerts.length})</p>
                <ul className="text-sm text-dark space-y-1">
                  {project.alerts.map((alert, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span>•</span>
                      <span>{alert}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-secondary">Status</p>
                <p className="font-semibold text-dark">{project.status || '—'}</p>
              </div>
              <div>
                <p className="text-secondary">Updated</p>
                <p className="font-semibold text-dark">{project.updated || '—'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsSection;
