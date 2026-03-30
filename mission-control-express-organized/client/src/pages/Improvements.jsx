import { useState, useEffect } from 'react';

export default function Improvements() {
  const [pipeline, setPipeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedDeployments, setExpandedDeployments] = useState(false);

  useEffect(() => {
    const fetchImprovements = async () => {
      try {
        const res = await fetch('/api/improvements');
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        const data = await res.json();
        setPipeline(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Failed to load improvements:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchImprovements();
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getSafetyColor = (rating) => {
    switch (rating) {
      case 'low':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'high':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-700';
      case 'review-needed':
        return 'bg-blue-100 text-blue-700';
      case 'in-progress':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-8 text-gray-500">Loading improvements pipeline...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          ⚠️ Failed to load improvements: {error}
        </div>
      </div>
    );
  }

  const { pipeline: pipelineData, research, staged, deployed } = pipeline || {};

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Autonomous Improvements Pipeline</h2>
        <p className="text-sm text-gray-500 mt-1">Self-improving AI system with nightly research and staged builds</p>
      </div>

      {/* Pipeline Status Card */}
      {pipelineData && (
        <div className="bg-white rounded border border-gray-200 p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Status */}
            <div>
              <div className="text-xs text-gray-500 font-semibold uppercase">Pipeline Status</div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-block w-2 h-2 rounded-full ${pipelineData.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                <span className="text-lg font-bold text-slate-900 capitalize">{pipelineData.status}</span>
              </div>
            </div>

            {/* Last Research */}
            <div>
              <div className="text-xs text-gray-500 font-semibold uppercase">Last Research Scan</div>
              <div className="text-lg font-bold text-slate-900 mt-2">{formatDate(pipelineData.lastResearch)}</div>
              {research?.lastScan && (
                <div className="text-sm text-gray-600 mt-1">
                  {research.lastScan.itemsScanned} items • {research.lastScan.topicsFound} topics
                </div>
              )}
            </div>

            {/* Next Research */}
            <div>
              <div className="text-xs text-gray-500 font-semibold uppercase">Next Research</div>
              <div className="text-lg font-bold text-slate-900 mt-2">{formatDate(pipelineData.nextResearch)}</div>
              <div className="text-sm text-gray-600 mt-1">Today @ {formatTime(pipelineData.nextResearch)}</div>
            </div>

            {/* Next Build */}
            <div>
              <div className="text-xs text-gray-500 font-semibold uppercase">Next Build</div>
              <div className="text-lg font-bold text-slate-900 mt-2">{formatDate(pipelineData.nextBuild)}</div>
              <div className="text-sm text-gray-600 mt-1">Tomorrow @ {formatTime(pipelineData.nextBuild)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Recently Deployed */}
      {deployed && deployed.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-slate-900">Recently Deployed</h3>
          <div className="bg-white rounded border border-gray-200 overflow-hidden">
            {deployed.map((item) => (
              <div key={item.id} className="px-4 py-4 border-b border-gray-100 last:border-b-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-900">{item.title}</div>
                    <div className="text-xs text-gray-500 mt-2">
                      Deployed: {formatDate(item.deployedAt)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Monitoring until: {formatDate(item.monitoringUntil)}
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className="inline-block px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded">
                      ✅ Monitoring
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Staged Improvements */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900">Staged Improvements</h3>
        
        {staged && staged.length > 0 ? (
          <div className="bg-white rounded border border-gray-200 overflow-hidden">
            {staged.map((item) => (
              <div key={item.id} className="px-4 py-4 border-b border-gray-100 last:border-b-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-900">{item.title}</div>
                    <div className="text-xs text-gray-600 mt-1">{item.area}</div>
                    <div className="flex gap-2 mt-3">
                      <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${getPriorityColor(item.priority)}`}>
                        {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} Priority
                      </span>
                      <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${getSafetyColor(item.safetyRating)}`}>
                        Safety: {item.safetyRating.charAt(0).toUpperCase() + item.safetyRating.slice(1)}
                      </span>
                      <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${getStatusColor(item.status)}`}>
                        {item.status === 'review-needed' ? '⏳ Review Needed' : '✅ Approved'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded border border-gray-200 px-4 py-4 text-center text-gray-500">
            No staged improvements
          </div>
        )}
      </div>

      {/* Recent Deployments - Autonomous Pipeline Only - Expandable */}
      {deployed && deployed.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Recent Deployments (Autonomous Pipeline)</h3>
            <button
              onClick={() => setExpandedDeployments(!expandedDeployments)}
              className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              {expandedDeployments ? '▼ Collapse' : '▶ Expand'} ({deployed.length})
            </button>
          </div>
          
          {!expandedDeployments && deployed.length > 0 && (
            // Collapsed view - show first 2
            <div className="bg-white rounded border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-3 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                <div>Improvement</div>
                <div>Deployed</div>
                <div>Status</div>
              </div>
              {deployed.slice(0, 2).map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-3 gap-4 px-4 py-3 border-b border-gray-100 items-center last:border-b-0"
                >
                  <div className="text-sm font-medium text-slate-900">{item.title}</div>
                  <div className="text-sm text-gray-500">{formatDate(item.deployedAt)}</div>
                  <div>
                    <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-green-100 text-green-700">
                      ✅ Monitoring
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {expandedDeployments && deployed.length > 0 && (
            // Expanded view - show all with full details
            <div className="bg-white rounded border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-4 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                <div>Improvement</div>
                <div>Area</div>
                <div>Deployed</div>
                <div>Details</div>
              </div>
              {deployed.map((item) => (
                <div
                  key={item.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-b-0"
                >
                  <div className="grid grid-cols-4 gap-4 px-4 py-4 items-start">
                    <div className="text-sm font-bold text-slate-900">{item.title}</div>
                    <div className="text-xs text-gray-600">{item.area || 'Self-Improvement'}</div>
                    <div className="text-sm text-gray-500">{formatDate(item.deployedAt)}</div>
                    <div className="text-xs text-gray-600 leading-relaxed">
                      <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-green-100 text-green-700 mb-2">
                        ✅ Monitoring until {formatDate(item.monitoringUntil)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Metrics Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="text-xs text-gray-500 font-semibold uppercase">Staged</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{staged ? staged.length : 0}</div>
          <div className="text-xs text-gray-400 mt-1">Improvements pending</div>
        </div>
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="text-xs text-gray-500 font-semibold uppercase">Deployed</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{deployed ? deployed.length : 0}</div>
          <div className="text-xs text-gray-400 mt-1">This cycle</div>
        </div>
        <div className="bg-white rounded border border-gray-200 p-4">
          <div className="text-xs text-gray-500 font-semibold uppercase">Approved</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {staged ? staged.filter(s => s.approved).length : 0}
          </div>
          <div className="text-xs text-gray-400 mt-1">Ready to build</div>
        </div>
      </div>
    </div>
  );
}
