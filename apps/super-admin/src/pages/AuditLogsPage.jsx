import { useState } from 'react';
import { Search, Filter, Download, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import auditLogsAPI from '../api/auditLogs';
import useNotificationStore from '../stores/notificationStore';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';

export default function AuditLogsPage() {
  const { addNotification } = useNotificationStore();

  // State
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ action: 'all', resource: 'all' });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [expandedRow, setExpandedRow] = useState(null);
  const [detailModal, setDetailModal] = useState(null);

  // Fetch logs
  const { data: rawData, loading, refetch } = useFetch(
    () => auditLogsAPI.list({ search, ...filters, page, pageSize }),
    [search, filters, page, pageSize],
    { initialData: [] }
  );

  const logs = Array.isArray(rawData) ? rawData : rawData?.data || [];
  const total = rawData?.meta?.total ?? rawData?.total ?? logs.length;

  // Export handler
  const handleExport = async () => {
    try {
      await auditLogsAPI.export('csv');
      addNotification('Audit logs exported successfully', 'success');
    } catch (err) {
      // Fallback: export from current data
      const csv = [
        ['Timestamp', 'Action', 'Resource', 'User', 'Details'].join(','),
        ...logs.map((log) =>
          [
            log.createdAt || log.timestamp || '',
            log.action || '',
            log.resource || '',
            log.userEmail || log.user || '',
            (log.description || log.details || '').replace(/,/g, ';'),
          ].join(',')
        ),
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addNotification('Audit logs exported from current view', 'success');
    }
  };

  const getActionColor = (action) => {
    if (!action) return 'bg-slate-600 text-slate-300';
    const lower = action.toLowerCase();
    if (lower.includes('create') || lower.includes('add')) return 'bg-emerald-500/20 text-emerald-300';
    if (lower.includes('delete') || lower.includes('remove')) return 'bg-red-500/20 text-red-300';
    if (lower.includes('update') || lower.includes('edit')) return 'bg-blue-500/20 text-blue-300';
    if (lower.includes('login') || lower.includes('auth')) return 'bg-purple-500/20 text-purple-300';
    return 'bg-slate-600 text-slate-300';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Audit Logs</h1>
          <p className="text-slate-400">System audit trail and compliance logging</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-4 flex-wrap items-end">
        <div className="flex-1 min-w-64 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all ${
            showFilters
              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
              : 'bg-white/10 border-white/20 text-slate-300 hover:bg-white/20'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="flex gap-4 p-4 bg-white/5 border border-white/10 rounded-lg">
          <select
            value={filters.action}
            onChange={(e) => { setFilters({ ...filters, action: e.target.value }); setPage(1); }}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="login">Login</option>
          </select>
          <select
            value={filters.resource}
            onChange={(e) => { setFilters({ ...filters, resource: e.target.value }); setPage(1); }}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Resources</option>
            <option value="company">Company</option>
            <option value="employee">Employee</option>
            <option value="subscription">Subscription</option>
            <option value="jtsa">JTSA</option>
          </select>
          <button
            onClick={() => { setFilters({ action: 'all', resource: 'all' }); setPage(1); }}
            className="px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        {loading ? (
          <div className="animate-pulse space-y-2 p-4">
            {[...Array(8)].map((_, i) => <div key={i} className="h-10 bg-slate-700 rounded" />)}
          </div>
        ) : logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700 border-b border-slate-600">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Timestamp</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Action</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Resource</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">User</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Description</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-slate-200"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {logs.map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-3 text-slate-300 text-sm whitespace-nowrap">
                      {log.createdAt || log.timestamp
                        ? new Date(log.createdAt || log.timestamp).toLocaleString()
                        : '—'}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getActionColor(log.action)}`}>
                        {log.action || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-300 text-sm capitalize">{log.resource || log.entity || '—'}</td>
                    <td className="px-6 py-3 text-slate-300 text-sm">{log.userEmail || log.user || '—'}</td>
                    <td className="px-6 py-3 text-slate-400 text-sm max-w-xs truncate">
                      {log.description || log.details || '—'}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => setDetailModal(log)}
                        className="p-1.5 hover:bg-slate-600 rounded text-slate-400 hover:text-white transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-slate-400">No audit logs found</p>
            <p className="text-slate-500 text-sm mt-1">Adjust your search or filters</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={setPageSize} />

      {/* Detail Modal */}
      {detailModal && (
        <Modal
          isOpen
          onClose={() => setDetailModal(null)}
          title="Audit Log Detail"
          size="lg"
          actions={{
            secondary: { label: 'Close', onClick: () => setDetailModal(null) },
          }}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-400 text-xs mb-1">Timestamp</p>
                <p className="text-white text-sm">
                  {detailModal.createdAt || detailModal.timestamp
                    ? new Date(detailModal.createdAt || detailModal.timestamp).toLocaleString()
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Action</p>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getActionColor(detailModal.action)}`}>
                  {detailModal.action || '—'}
                </span>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Resource</p>
                <p className="text-white text-sm capitalize">{detailModal.resource || '—'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">User</p>
                <p className="text-white text-sm">{detailModal.userEmail || detailModal.user || '—'}</p>
              </div>
            </div>
            {(detailModal.description || detailModal.details) && (
              <div>
                <p className="text-slate-400 text-xs mb-1">Description</p>
                <p className="text-white text-sm">{detailModal.description || detailModal.details}</p>
              </div>
            )}
            {detailModal.metadata && (
              <div>
                <p className="text-slate-400 text-xs mb-1">Metadata</p>
                <pre className="text-xs text-slate-300 bg-slate-900 rounded-lg p-3 overflow-auto max-h-48">
                  {typeof detailModal.metadata === 'string'
                    ? detailModal.metadata
                    : JSON.stringify(detailModal.metadata, null, 2)}
                </pre>
              </div>
            )}
            {detailModal.ipAddress && (
              <div>
                <p className="text-slate-400 text-xs mb-1">IP Address</p>
                <p className="text-white text-sm font-mono">{detailModal.ipAddress}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
