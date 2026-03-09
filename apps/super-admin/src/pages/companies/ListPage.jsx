import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Download, Trash2 } from 'lucide-react';
import useAppStore from '../../stores/appStore';
import useNotificationStore from '../../stores/notificationStore';
import useFetch from '../../hooks/useFetch';
import companiesAPI from '../../api/companies';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';

export default function CompaniesListPage() {
  const navigate = useNavigate();
  const { selectedApp } = useAppStore();
  const { addNotification } = useNotificationStore();

  // State
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: 'all', plan: 'all' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Fetch companies
  const { data: companies = [], loading, refetch } = useFetch(
    () => companiesAPI.list({ search, ...filters, page, pageSize }),
    [search, filters, page, pageSize, selectedApp],
    { initialData: [] }
  );

  // Columns
  const columns = [
    { key: 'name', label: 'Company Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'plan', label: 'Plan', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            val === 'active'
              ? 'bg-emerald-500/20 text-emerald-300'
              : 'bg-slate-600 text-slate-300'
          }`}
        >
          {val}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (val) => new Date(val).toLocaleDateString(),
      sortable: true,
    },
  ];

  // Handle delete
  const handleDelete = async (company) => {
    setDeleteTarget(company);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await companiesAPI.delete(deleteTarget.id);
      addNotification(`${deleteTarget.name} deleted successfully`, 'success');
      refetch();
    } catch (err) {
      addNotification(`Failed to delete company: ${err.message}`, 'error');
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      // Sanitize CSV values to prevent CSV injection (formula injection)
      const sanitizeCsvValue = (val) => {
        const str = String(val ?? '');
        // Prefix dangerous characters that could be interpreted as formulas
        if (/^[=+\-@\t\r]/.test(str)) {
          return `"'${str.replace(/"/g, '""')}"`;
        }
        // Quote values containing commas, quotes, or newlines
        if (/[",\n\r]/.test(str)) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const csv = [
        ['Name', 'Email', 'Plan', 'Status', 'Created'].join(','),
        ...companies.map((c) =>
          [c.name, c.email, c.plan, c.status, new Date(c.createdAt).toLocaleDateString()]
            .map(sanitizeCsvValue)
            .join(',')
        ),
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `companies-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addNotification('Companies exported successfully', 'success');
    } catch (err) {
      addNotification(`Export failed: ${err.message}`, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Companies</h1>
          <p className="text-slate-400">Manage all customer companies</p>
        </div>
        <button
          onClick={() => navigate('/companies/create')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Company
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-4 flex-wrap items-end">
        <div className="flex-1 min-w-64 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search companies..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={filters.status}
          onChange={(e) => {
            setFilters({ ...filters, status: e.target.value });
            setPage(1);
          }}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <select
          value={filters.plan}
          onChange={(e) => {
            setFilters({ ...filters, plan: e.target.value });
            setPage(1);
          }}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Plans</option>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
        >
          <Download className="w-5 h-5" />
          Export
        </button>
      </div>

      {/* Table */}
      <DataTable
        data={companies}
        columns={columns}
        onEdit={(company) => navigate(`/companies/${company.id}`)}
        onDelete={handleDelete}
        loading={loading}
        emptyMessage="No companies found"
      />

      {/* Pagination */}
      {/* TODO: Replace with actual total from API response (e.g., response.meta.total) */}
      <Pagination page={page} pageSize={pageSize} total={companies.length} onPageChange={setPage} onPageSizeChange={setPageSize} />

      {/* Delete Modal */}
      {deleteTarget && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeleteTarget(null);
          }}
          title="Delete Company"
          actions={{
            primary: { label: 'Delete', onClick: confirmDelete },
            secondary: {
              label: 'Cancel',
              onClick: () => {
                setShowDeleteModal(false);
                setDeleteTarget(null);
              },
            },
          }}
        >
          <p className="text-slate-300">
            Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.
          </p>
        </Modal>
      )}
    </div>
  );
}
