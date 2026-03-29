import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function BriefingQueue() {
  const navigate = useNavigate();
  const [briefings, setBriefings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchBriefings();
    const interval = setInterval(fetchBriefings, 5000); // Auto-refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchBriefings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/briefings');
      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      const data = await res.json();
      setBriefings(data.briefings || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch briefings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      setProcessingId(id);
      const res = await fetch(`/api/briefings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Approved' }),
      });
      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      const data = await res.json();
      setBriefings(briefings.map(b => b.id === id ? data.briefing : b));
      setProcessingId(null);
    } catch (err) {
      setError(err.message);
      setProcessingId(null);
    }
  };

  const handleRejectClick = (id) => {
    setRejectingId(id);
    setRejectReason('');
  };

  const handleRejectConfirm = async (id) => {
    try {
      setProcessingId(id);
      const res = await fetch(`/api/briefings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Rejected', reason: rejectReason }),
      });
      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      const data = await res.json();
      setBriefings(briefings.map(b => b.id === id ? data.briefing : b));
      setRejectingId(null);
      setRejectReason('');
      setProcessingId(null);
    } catch (err) {
      setError(err.message);
      setProcessingId(null);
    }
  };

  // Get briefings that need approval (Level 4 only)
  const approvableBriefings = briefings.filter(b => b.level === 4 && b.status === 'awaiting-approval');
  
  // Get all briefings for overview (sorted by timestamp, newest first)
  const allBriefingsSorted = [...briefings].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  // Filter by search
  const filteredApproval = approvableBriefings.filter(b =>
    !searchTerm || b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAll = allBriefingsSorted.filter(b =>
    !searchTerm || b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Summary stats
  const summary = {
    level1_2: briefings.filter(b => b.level === 1 || b.level === 2).length,
    level3: briefings.filter(b => b.level === 3).length,
    level4_pending: briefings.filter(b => b.level === 4 && b.status === 'awaiting-approval').length,
    level4_approved: briefings.filter(b => b.level === 4 && b.status === 'Approved').length,
    executing: briefings.filter(b => b.status === 'executing' || b.status === 'auto-executing').length,
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getLevelBadge = (level) => {
    switch (level) {
      case 1:
      case 2:
        return { label: `L${level}`, color: 'bg-blue-100 text-blue-800', desc: 'Routine' };
      case 3:
        return { label: 'L3', color: 'bg-purple-100 text-purple-800', desc: 'Strategic' };
      case 4:
        return { label: 'L4', color: 'bg-red-100 text-red-800', desc: 'External/Risky' };
      default:
        return { label: 'L?', color: 'bg-gray-100 text-gray-800', desc: 'Unknown' };
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'awaiting-approval':
        return { icon: '⏳', label: 'Awaiting Approval', color: 'bg-amber-100 text-amber-800' };
      case 'Approved':
        return { icon: '✅', label: 'Approved', color: 'bg-green-100 text-green-800' };
      case 'Rejected':
        return { icon: '❌', label: 'Rejected', color: 'bg-red-100 text-red-800' };
      case 'executing':
        return { icon: '⚡', label: 'Executing', color: 'bg-indigo-100 text-indigo-800' };
      case 'auto-executing':
        return { icon: '🚀', label: 'Auto-Executing', color: 'bg-green-100 text-green-800' };
      default:
        return { icon: '•', label: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">📬 Briefing Queue</h2>
        <p className="text-sm text-gray-600 mt-1">
          Option C (Maximum Autonomy): Only Level 4 briefings (external/destructive) require approval. 
          Levels 1-3 execute automatically.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded text-sm">
          ⚠️ Error: {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white rounded border border-gray-200 p-3">
          <div className="text-xs text-gray-500 font-semibold uppercase">L1-2: Routine</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{summary.level1_2}</div>
          <div className="text-xs text-gray-400 mt-1">Auto-executing</div>
        </div>
        <div className="bg-white rounded border border-gray-200 p-3">
          <div className="text-xs text-gray-500 font-semibold uppercase">L3: Strategic</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">{summary.level3}</div>
          <div className="text-xs text-gray-400 mt-1">Executing</div>
        </div>
        <div className="bg-white rounded border border-gray-200 p-3">
          <div className="text-xs text-gray-500 font-semibold uppercase">L4: Pending</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{summary.level4_pending}</div>
          <div className="text-xs text-gray-400 mt-1">Awaiting approval</div>
        </div>
        <div className="bg-white rounded border border-gray-200 p-3">
          <div className="text-xs text-gray-500 font-semibold uppercase">L4: Approved</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{summary.level4_approved}</div>
          <div className="text-xs text-gray-400 mt-1">Executed</div>
        </div>
        <div className="bg-white rounded border border-gray-200 p-3">
          <div className="text-xs text-gray-500 font-semibold uppercase">Executing</div>
          <div className="text-2xl font-bold text-indigo-600 mt-1">{summary.executing}</div>
          <div className="text-xs text-gray-400 mt-1">In progress</div>
        </div>
      </div>

      {/* Approval Queue Section */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-3">🔴 Level 4: Awaiting Your Approval</h3>
        
        {approvableBriefings.length === 0 ? (
          <div className="bg-white rounded border border-gray-200 px-4 py-8 text-center text-gray-500">
            ✅ No pending approvals! All Level 4 briefings have been reviewed.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApproval.map((briefing) => {
              const status = getStatusBadge(briefing.status);
              const level = getLevelBadge(briefing.level);
              const isExpanded = expandedId === briefing.id;
              const isRejecting = rejectingId === briefing.id;

              return (
                <div
                  key={briefing.id}
                  className="bg-white rounded border border-amber-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Card Header */}
                  <div
                    className="px-4 py-3 border-b border-amber-100 cursor-pointer hover:bg-amber-50 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : briefing.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded ${level.color}`}>
                            {level.label}
                          </span>
                          <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded ${status.color}`}>
                            {status.icon} {status.label}
                          </span>
                        </div>
                        <h4 className="font-semibold text-slate-900">{briefing.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {briefing.description?.substring(0, 120)}
                          {briefing.description?.length > 120 ? '...' : ''}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs text-gray-500">{formatDate(briefing.timestamp)}</div>
                        <div className="text-sm text-gray-400 mt-1">{isExpanded ? '▼' : '▶'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-4 py-4 bg-amber-50 border-t border-amber-200 space-y-4">
                      <div>
                        <h5 className="text-xs font-bold text-gray-700 uppercase mb-2">Details</h5>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">
                          {briefing.description}
                        </p>
                      </div>

                      {briefing.reason && (
                        <div className="bg-red-50 border border-red-200 rounded p-3">
                          <h5 className="text-xs font-bold text-red-700 uppercase mb-1">Rejection Reason</h5>
                          <p className="text-sm text-red-800">{briefing.reason}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      {briefing.status === 'awaiting-approval' && (
                        <div className="flex gap-2 pt-2">
                          {isRejecting ? (
                            <div className="flex-1 space-y-2">
                              <textarea
                                placeholder="Provide rejection reason (optional)..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-red-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                                rows="2"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleRejectConfirm(briefing.id)}
                                  disabled={processingId === briefing.id}
                                  className="flex-1 px-3 py-2 bg-red-500 text-white text-sm font-semibold rounded hover:bg-red-600 disabled:bg-gray-400 transition"
                                >
                                  {processingId === briefing.id ? 'Rejecting...' : 'Confirm Rejection'}
                                </button>
                                <button
                                  onClick={() => setRejectingId(null)}
                                  className="px-3 py-2 bg-gray-300 text-gray-800 text-sm font-semibold rounded hover:bg-gray-400 transition"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => handleApprove(briefing.id)}
                                disabled={processingId === briefing.id}
                                className="flex-1 px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded hover:bg-green-600 disabled:bg-gray-400 transition"
                              >
                                {processingId === briefing.id ? 'Approving...' : '✓ Approve & Execute'}
                              </button>
                              <button
                                onClick={() => handleRejectClick(briefing.id)}
                                className="flex-1 px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded hover:bg-red-600 transition"
                              >
                                ✗ Reject
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* All Briefings Section */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-3">📋 All Briefings (L1-L4)</h3>
        
        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search briefings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <div className="bg-white rounded border border-gray-200 px-4 py-8 text-center text-gray-500">
            Loading briefings...
          </div>
        ) : filteredAll.length === 0 ? (
          <div className="bg-white rounded border border-gray-200 px-4 py-8 text-center text-gray-500">
            No briefings found
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAll.map((briefing) => {
              const status = getStatusBadge(briefing.status);
              const level = getLevelBadge(briefing.level);

              return (
                <div
                  key={briefing.id}
                  className="bg-white rounded border border-gray-200 px-3 py-2 flex items-start justify-between hover:shadow-sm transition-shadow"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`inline-block px-1.5 py-0.5 text-xs font-bold rounded ${level.color}`}>
                        {level.label}
                      </span>
                      <span className={`inline-block px-1.5 py-0.5 text-xs font-bold rounded ${status.color}`}>
                        {status.icon}
                      </span>
                      <span className="text-xs text-gray-500">{formatDate(briefing.timestamp)}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 truncate">{briefing.title}</p>
                    <p className="text-xs text-gray-600 truncate">{briefing.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
