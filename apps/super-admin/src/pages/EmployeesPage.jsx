import { useState, useCallback } from 'react';
import { Search, Plus, Filter, Mail, Trash2, Edit2, X, UserCheck, UserX } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import employeesAPI from '../api/employees';
import useNotificationStore from '../stores/notificationStore';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';

export default function EmployeesPage() {
  const { addNotification } = useNotificationStore();

  // State
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ role: 'all', status: 'all' });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Invite modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteCompanyId, setInviteCompanyId] = useState('');
  const [inviting, setInviting] = useState(false);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Fetch employees
  const { data: rawData, loading, refetch } = useFetch(
    () => employeesAPI.list({ search, ...filters, page, pageSize }),
    [search, filters, page, pageSize],
    { initialData: [] }
  );

  const employees = Array.isArray(rawData) ? rawData : rawData?.data || [];
  const total = rawData?.meta?.total ?? rawData?.total ?? employees.length;

  // Columns
  const columns = [
    {
      key: 'fullName',
      label: 'Name',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="text-white font-medium">{val || row.name || '—'}</span>
          {row.email && <p className="text-slate-400 text-xs mt-0.5">{row.email}</p>}
        </div>
      ),
    },
    { key: 'companyName', label: 'Company', sortable: true },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (val) => (
        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-300 capitalize">
          {val || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => {
        const isActive = val === 'active' || val === 'Active';
        return (
          <span className={`flex items-center gap-1.5 text-xs font-medium ${isActive ? 'text-emerald-300' : 'text-slate-400'}`}>
            {isActive ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
            {val || '—'}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (val) => val ? new Date(val).toLocaleDateString() : '—',
      sortable: true,
    },
  ];

  // Handlers
  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await employeesAPI.invite(inviteEmail, inviteCompanyId || null);
      addNotification(`Invitation sent to ${inviteEmail}`, 'success');
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteCompanyId('');
      refetch();
    } catch (err) {
      addNotification(`Failed to invite: ${err.message}`, 'error');
    } finally {
      setInviting(false);
    }
  };

  const handleDelete = (employee) => {
    setDeleteTarget(employee);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await employeesAPI.delete(deleteTarget.id);
      addNotification(`${deleteTarget.fullName || deleteTarget.name || 'Employee'} removed`, 'success');
      refetch();
    } catch (err) {
      addNotification(`Failed to remove employee: ${err.message}`, 'error');
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Employees</h1>
          <p className="text-slate-400">
            Monitor all team members across companies
            {!loading && <span className="ml-2 text-slate-500">({total} total)</span>}
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          Invite Employee
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-4 flex-wrap items-end">
        <div className="flex-1 min-w-64 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
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
            value={filters.role}
            onChange={(e) => { setFilters({ ...filters, role: e.target.value }); setPage(1); }}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="invited">Invited</option>
          </select>
          <button
            onClick={() => { setFilters({ role: 'all', status: 'all' }); setPage(1); }}
            className="px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Table */}
      <DataTable
        data={employees}
        columns={columns}
        onDelete={handleDelete}
        loading={loading}
        emptyMessage="No employees found. Invite your first team member to get started."
      />

      {/* Pagination */}
      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      {/* Invite Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => {
          setShowInviteModal(false);
          setInviteEmail('');
          setInviteCompanyId('');
        }}
        title="Invite Employee"
        actions={{
          primary: {
            label: inviting ? 'Sending...' : 'Send Invitation',
            onClick: handleInvite,
            loading: inviting,
          },
          secondary: {
            label: 'Cancel',
            onClick: () => { setShowInviteModal(false); setInviteEmail(''); setInviteCompanyId(''); },
          },
        }}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="invite-email" className="block text-sm font-medium text-slate-300 mb-2">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="employee@company.com"
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
          </div>
          <div>
            <label htmlFor="invite-company" className="block text-sm font-medium text-slate-300 mb-2">
              Company ID <span className="text-slate-500">(optional)</span>
            </label>
            <input
              id="invite-company"
              type="text"
              value={inviteCompanyId}
              onChange={(e) => setInviteCompanyId(e.target.value)}
              placeholder="Leave blank for no company assignment"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setDeleteTarget(null); }}
          title="Remove Employee"
          actions={{
            primary: { label: 'Remove', onClick: confirmDelete },
            secondary: { label: 'Cancel', onClick: () => { setShowDeleteModal(false); setDeleteTarget(null); } },
          }}
        >
          <p className="text-slate-300">
            Are you sure you want to remove <strong>{deleteTarget.fullName || deleteTarget.name || 'this employee'}</strong>?
            This action cannot be undone.
          </p>
        </Modal>
      )}
    </div>
  );
}
