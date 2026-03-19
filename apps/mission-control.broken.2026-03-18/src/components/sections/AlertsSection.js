const AlertsSection = ({ state }) => {
  const alerts = state?.alerts || [];

  if (!alerts || alerts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-success text-lg font-medium">✅ No active alerts</p>
        <p className="text-secondary mt-2">Everything is running smoothly!</p>
      </div>
    );
  }

  const getSeverityColor = (severity) => {
    if (severity === 'critical') return 'border-l-4 border-danger bg-red-50';
    if (severity === 'warning') return 'border-l-4 border-warning bg-orange-50';
    if (severity === 'info') return 'border-l-4 border-primary bg-blue-50';
    return 'border-l-4 border-secondary bg-gray-50';
  };

  const getSeverityBadgeColor = (severity) => {
    if (severity === 'critical') return 'bg-red-100 text-danger';
    if (severity === 'warning') return 'bg-orange-100 text-warning';
    if (severity === 'info') return 'bg-blue-100 text-primary';
    return 'bg-gray-100 text-secondary';
  };

  const getSeverityIcon = (severity) => {
    if (severity === 'critical') return '🔴';
    if (severity === 'warning') return '🟠';
    if (severity === 'info') return '🔵';
    return '⚪';
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-dark mb-6">⚠️ Alerts</h2>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-lg p-4 hover:shadow-md transition-shadow ${getSeverityColor(
              alert.severity
            )}`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-start gap-3 flex-1">
                <span className="text-xl">{getSeverityIcon(alert.severity)}</span>
                <div>
                  <h3 className="font-semibold text-dark">{alert.title}</h3>
                  <p className="text-sm text-secondary mt-1">{alert.message}</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ml-2 ${getSeverityBadgeColor(alert.severity)}`}>
                {alert.severity}
              </div>
            </div>

            {/* Details */}
            {alert.details && (
              <div className="mt-3 pl-8 text-sm">
                <p className="text-secondary">
                  <strong>Source:</strong> {alert.source}
                </p>
                {alert.timestamp && (
                  <p className="text-secondary mt-1">
                    <strong>Time:</strong> {alert.timestamp}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            {alert.actionable && (
              <div className="mt-3 pl-8 flex gap-2">
                {alert.action && (
                  <button className="px-3 py-1 bg-primary text-white text-sm rounded hover:bg-blue-700 transition-colors">
                    {alert.action}
                  </button>
                )}
                <button className="px-3 py-1 bg-gray-300 text-dark text-sm rounded hover:bg-gray-400 transition-colors">
                  Dismiss
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsSection;
