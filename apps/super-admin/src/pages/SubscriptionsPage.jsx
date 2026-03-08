import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';

const mockSubscriptionsAPI = {
  list: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            company: 'ABC Construction',
            plan: 'Pro',
            status: 'active',
            employees: 45,
            monthlyRevenue: 79.99,
            trialEndsAt: null,
            createdAt: '2026-01-15',
            nextBillingDate: '2026-04-15',
          },
          {
            id: 2,
            company: 'XYZ Contractors',
            plan: 'Starter',
            status: 'active',
            employees: 12,
            monthlyRevenue: 29.99,
            trialEndsAt: null,
            createdAt: '2026-02-10',
            nextBillingDate: '2026-04-10',
          },
          {
            id: 3,
            company: 'Safety First Inc',
            plan: 'Enterprise',
            status: 'trial',
            employees: 120,
            monthlyRevenue: 299.99,
            trialEndsAt: '2026-04-05',
            createdAt: '2026-03-07',
            nextBillingDate: '2026-04-05',
          },
        ]);
      }, 1000);
    });
  },
  refund: async (id) => ({ success: true }),
};

export default function SubscriptionsPage() {
  const [search, setSearch] = useState('');
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const { data: subscriptions = [], loading } = useFetch(
    mockSubscriptionsAPI.list,
    [],
    { initialData: [] }
  );

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((s) =>
      s.company?.toLowerCase().includes(search.toLowerCase())
    );
  }, [subscriptions, search]);

  const columns = [
    { key: 'company', label: 'Company', sortable: true },
    { key: 'plan', label: 'Plan', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            val === 'active'
              ? 'bg-emerald-500/20 text-emerald-300'
              : 'bg-amber-500/20 text-amber-300'
          }`}
        >
          {val}
        </span>
      ),
    },
    { key: 'employees', label: 'Employees', sortable: true },
    {
      key: 'monthlyRevenue',
      label: 'MRR',
      sortable: true,
      render: (val) => `$${val.toFixed(2)}`,
    },
    {
      key: 'nextBillingDate',
      label: 'Next Billing',
      render: (val) => new Date(val).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Subscriptions</h1>
        <p className="text-slate-400">Manage customer subscriptions and billing</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <p className="text-slate-400 text-sm mb-1">Active Subscriptions</p>
          <p className="text-2xl font-bold text-white">{subscriptions.length}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <p className="text-slate-400 text-sm mb-1">Total MRR</p>
          <p className="text-2xl font-bold text-white">
            ${subscriptions.reduce((sum, s) => sum + s.monthlyRevenue, 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <p className="text-slate-400 text-sm mb-1">Total Employees</p>
          <p className="text-2xl font-bold text-white">
            {subscriptions.reduce((sum, s) => sum + s.employees, 0)}
          </p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <p className="text-slate-400 text-sm mb-1">Trials Active</p>
          <p className="text-2xl font-bold text-white">
            {subscriptions.filter((s) => s.status === 'trial').length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <DataTable
        data={filteredSubscriptions}
        columns={columns}
        onEdit={(subscription) => {
          setSelectedSubscription(subscription);
          setShowDetailModal(true);
        }}
        loading={loading}
        emptyMessage="No subscriptions found"
      />

      {/* Subscription Detail Modal */}
      {selectedSubscription && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title={`${selectedSubscription.company} - ${selectedSubscription.plan}`}
          size="lg"
        >
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-slate-400 mb-1">Plan</p>
              <p className="text-lg font-semibold text-white">{selectedSubscription.plan}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Status</p>
              <p className="text-lg font-semibold text-white capitalize">{selectedSubscription.status}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Employees</p>
              <p className="text-lg font-semibold text-white">{selectedSubscription.employees}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Monthly Revenue</p>
              <p className="text-lg font-semibold text-white">${selectedSubscription.monthlyRevenue}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Created</p>
              <p className="text-lg font-semibold text-white">
                {new Date(selectedSubscription.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Next Billing</p>
              <p className="text-lg font-semibold text-white">
                {new Date(selectedSubscription.nextBillingDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          {selectedSubscription.trialEndsAt && (
            <div className="mt-6 p-4 bg-amber-500/20 border border-amber-500/50 rounded-lg">
              <p className="text-sm text-amber-300">
                <strong>Trial ends on:</strong> {new Date(selectedSubscription.trialEndsAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
