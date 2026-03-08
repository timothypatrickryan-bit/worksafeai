import { useEffect, useState, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import useAppStore from '../stores/appStore';
import useNotificationStore from '../stores/notificationStore';
import useFetch from '../hooks/useFetch';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';

// Mock API for employees
const mockEmployeesAPI = {
  list: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            name: 'John Doe',
            email: 'john@abc.com',
            company: 'ABC Construction',
            role: 'Safety Manager',
            status: 'active',
            createdAt: '2026-01-15',
          },
          {
            id: 2,
            name: 'Jane Smith',
            email: 'jane@abc.com',
            company: 'ABC Construction',
            role: 'Project Manager',
            status: 'active',
            createdAt: '2026-02-10',
          },
          {
            id: 3,
            name: 'Mike Johnson',
            email: 'mike@xyz.com',
            company: 'XYZ Contractors',
            role: 'Employee',
            status: 'inactive',
            createdAt: '2025-12-20',
          },
        ]);
      }, 1000);
    });
  },
  delete: async (id) => ({ success: true }),
};

export default function EmployeesPage() {
  const { selectedApp } = useAppStore();
  const { addNotification } = useNotificationStore();
  const [search, setSearch] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: employees = [], loading, refetch } = useFetch(
    mockEmployeesAPI.list,
    [selectedApp],
    { initialData: [] }
  );

  const filteredEmployees = useMemo(() => {
    return employees.filter(
      (e) =>
        e.name?.toLowerCase().includes(search.toLowerCase()) ||
        e.email?.toLowerCase().includes(search.toLowerCase()) ||
        e.company?.toLowerCase().includes(search.toLowerCase())
    );
  }, [employees, search]);

  const handleDelete = async (employee) => {
    setDeleteTarget(employee);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await mockEmployeesAPI.delete(deleteTarget.id);
      addNotification(`${deleteTarget.name} removed successfully`, 'success');
      refetch();
    } catch (err) {
      addNotification(`Failed to remove employee: ${err.message}`, 'error');
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail) {
      addNotification('Please enter an email address', 'warning');
      return;
    }

    try {
      // TODO: Call API to invite employee
      addNotification(`Invite sent to ${inviteEmail}`, 'success');
      setInviteEmail('');
      setShowInviteModal(false);
    } catch (err) {
      addNotification(`Failed to send invite: ${err.message}`, 'error');
    }
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'company', label: 'Company', sortable: true },
    { key: 'role', label: 'Role' },
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
      label: 'Joined',
      render: (val) => new Date(val).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Employees</h1>
          <p className="text-slate-400">Manage team members across all companies</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Invite Employee
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, email, or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <DataTable
        data={filteredEmployees}
        columns={columns}
        onDelete={handleDelete}
        loading={loading}
        emptyMessage="No employees found"
      />

      {/* Invite Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite Employee"
        actions={{
          primary: { label: 'Send Invite', onClick: handleInvite },
          secondary: { label: 'Cancel', onClick: () => setShowInviteModal(false) },
        }}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="invite-email" className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <input
              id="invite-email"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="employee@company.com"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <p className="text-sm text-slate-400">
            An invitation email will be sent to this address. The employee can then create their account.
          </p>
        </div>
      </Modal>

      {/* Delete Modal */}
      {deleteTarget && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeleteTarget(null);
          }}
          title="Remove Employee"
          actions={{
            primary: { label: 'Remove', onClick: confirmDelete },
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
            Are you sure you want to remove <strong>{deleteTarget.name}</strong> from the system?
          </p>
        </Modal>
      )}
    </div>
  );
}
