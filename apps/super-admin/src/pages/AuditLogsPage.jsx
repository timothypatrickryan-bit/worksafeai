import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import DataTable from '../components/DataTable';

const mockAuditAPI = {
  list: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            user: 'admin@example.com',
            action: 'Created company',
            resource: 'ABC Construction',
            details: 'New company created',
            timestamp: '2026-03-07T14:23:00Z',
            status: 'success',
          },
          {
            id: 2,
            user: 'admin@example.com',
            action: 'Updated subscription',
            resource: 'XYZ Contractors',
            details: 'Upgraded from Starter to Pro',
            timestamp: '2026-03-07T13:45:00Z',
            status: 'success',
          },
          {
            id: 3,
            user: 'admin@example.com',
            action: 'Deleted employee',
            resource: 'john@example.com',
            details: 'Employee record deleted',
            timestamp: '2026-03-07T12:10:00Z',
            status: 'success',
          },
          {
            id: 4,
            user: 'admin@example.com',
            action: 'Failed login attempt',
            resource: 'User authentication',
            details: 'Invalid credentials',
            timestamp: '2026-03-06T22:30:00Z',
            status: 'error',
          },
        ]);
      }, 1000);
    });
  },
};

export default function AuditLogsPage() {
  const [search, setSearch] = useState('');

  const { data: logs = [], loading } = useFetch(
    mockAuditAPI.list,
    [],
    { initialData: [] }
  );

  const filteredLogs = useMemo(() => {
    return logs.filter(
      (log) =>
        log.user?.toLowerCase().includes(search.toLowerCase()) ||
        log.action?.toLowerCase().includes(search.toLowerCase()) ||
        log.resource?.toLowerCase().includes(search.toLowerCase())
    );
  }, [logs, search]);

  const columns = [
    { key: 'user', label: 'User', sortable: true },
    { key: 'action', label: 'Action', sortable: true },
    { key: 'resource', label: 'Resource' },
    { key: 'details', label: 'Details' },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            val === 'success'
              ? 'bg-emerald-500/20 text-emerald-300'
              : 'bg-red-500/20 text-red-300'
          }`}
        >
          {val}
        </span>
      ),
    },
    {
      key: 'timestamp',
      label: 'Time',
      render: (val) => new Date(val).toLocaleString(),
      sortable: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Audit Logs</h1>
        <p className="text-slate-400">Track all administrative actions and system events</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <p className="text-slate-400 text-sm mb-1">Total Events</p>
          <p className="text-2xl font-bold text-white">{logs.length}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <p className="text-slate-400 text-sm mb-1">Successful</p>
          <p className="text-2xl font-bold text-emerald-400">
            {logs.filter((l) => l.status === 'success').length}
          </p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <p className="text-slate-400 text-sm mb-1">Failed</p>
          <p className="text-2xl font-bold text-red-400">
            {logs.filter((l) => l.status === 'error').length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by user, action, or resource..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <DataTable
        data={filteredLogs}
        columns={columns}
        loading={loading}
        emptyMessage="No audit logs found"
      />
    </div>
  );
}
