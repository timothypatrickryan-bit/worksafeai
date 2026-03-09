import { useState } from 'react';
import { CreditCard, ArrowUpRight, Search, Filter, RefreshCw, DollarSign, Clock } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import subscriptionsAPI from '../api/subscriptions';
import analyticsAPI from '../api/analytics';
import useNotificationStore from '../stores/notificationStore';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';

export default function SubscriptionsPage() {
  const { addNotification } = useNotificationStore();

  // State
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ plan: 'all', status: 'all' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Action modals
  const [actionModal, setActionModal] = useState(null); // { type, subscription }
  const [actionLoading, setActionLoading] = useState(false);
  const [extendDays, setExtendDays] = useState(14);
  const [refundReason, setRefundReason] = useState('');

  // Fetch subscriptions
  const { data: rawData, loading, refetch } = useFetch(
    () => subscriptionsAPI.list({ search, ...filters, page, pageSize }),
    [search, filters, page, pageSize],
    { initialData: [] }
  );

  // Fetch revenue summary
  const { data: revenue } = useFetch(
    () => analyticsAPI.getRevenueTrend('month'),
    [],
    { initialData: null }
  );

  const subscriptions = Array.isArray(rawData) ? rawData : rawData?.data || [];
  const total = rawData?.meta?.total ?? rawData?.total ?? subscriptions.length;

  // Compute summary stats from subscription data
  const activeSubs = subscriptions.filter(s => s.status === 'active' || s.status === 'Active').length;
  const trialSubs = subscriptions.filter(s => s.status === 'trial' || s.status === 'trialing').length;

  // Columns
  const columns = [
    {
      key: 'companyName',
      label: 'Company',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="text-white font-medium">{val || row.company?.name || '—'}</span>
          {row.companyEmail && <p className="text-slate-400 text-xs mt-0.5">{row.companyEmail}</p>}
        </div>
      ),
    },
    {
      key: 'plan',
      label: 'Plan',
      sortable: true,
      render: (val) => (
        <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-medium capitalize">
          {val || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => {
        const colors = {
          active: 'bg-emerald-500/20 text-emerald-300',
          trial: 'bg-blue-500/20 text-blue-300',
          trialing: 'bg-blue-500/20 text-blue-300',
          cancelled: 'bg-red-500/20 text-red-300',
          canceled: 'bg-red-500/20 text-red-300',
          past_due: 'bg-amber-500/20 text-amber-300',
          expired: 'bg-slate-600 text-slate-300',
        };
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[val?.toLowerCase()] || 'bg-slate-600 text-slate-300'}`}>
            {val || '—'}
          </span>
        );
      },
    },
    {
      key: 'currentPeriodEnd',
      label: 'Renews',
      render: (val) => val ? new Date(val).toLocaleDateString() : '—',
      sortable: true,
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (val, row) => {
        const amt = val || row.price;
        return amt != null ? `$${(amt / 100).toFixed(2)}/mo` : '—';
      },
      sortable: true,
    },
  ];

  // Action handlers
  const openAction = (type, subscription) => {
    setActionModal({ type, subscription });
    setRefundReason('');
    setExtendDays(14);
  };

  const closeAction = () => {
    setActionModal(null);
    setActionLoading(false);
  };

  const executeAction = async () => {
    if (!actionModal) return;
    setActionLoading(true);
    const { type, subscription } = actionModal;

    try {
      switch (type) {
        case 'cancel':
          await subscriptionsAPI.cancel(subscription.id);
          addNotification(`Subscription cancelled for ${subscription.companyName || 'company'}`, 'success');
          break;
        case 'refund':
          await subscriptionsAPI.refund(subscription.id, refundReason);
          addNotification(`Refund processed for ${subscription.companyName || 'company'}`, 'success');
          break;
        case 'extend':
          await subscriptionsAPI.extendTrial(subscription.id, extendDays);
          addNotification(`Trial extended by ${extendDays} days`, 'success');
          break;
        default:
          break;
      }
      refetch();
      closeAction();
    } catch (err) {
      addNotification(`Action failed: ${err.message}`, 'error');
      setActionLoading(false);
    }
  };

  // Custom actions renderer for rows
  const renderRowActions = (row) => (
    <div className="flex gap-1 justify-end">
      {(row.status === 'trial' || row.status === 'trialing') && (
        <button
          onClick={(e) => { e.stopPropagation(); openAction('extend', row); }}
          className="p-2 hover:bg-slate-600 rounded-lg text-blue-400 transition-colors"
          title="Extend Trial"
        >
          <Clock className="w-4 h-4" />
        </button>
      )}
      {(row.status === 'active' || row.status === 'Active') && (
        <button
          onClick={(e) => { e.stopPropagation(); openAction('refund', row); }}
          className="p-2 hover:bg-slate-600 rounded-lg text-amber-400 transition-colors"
          title="Refund"
        >
          <DollarSign className="w-4 h-4" />
        </button>
      )}
      {row.status !== 'cancelled' && row.status !== 'canceled' && (
        <button
          onClick={(e) => { e.stopPropagation(); openAction('cancel', row); }}
          className="p-2 hover:bg-slate-600 rounded-lg text-red-400 transition-colors"
          title="Cancel Subscription"
        >
          <CreditCard className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Subscriptions</h1>
          <p className="text-slate-400">Track all active subscriptions and billing</p>
        </div>
        <button
          onClick={refetch}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-slate-300 hover:bg-white/20 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-slate-400 text-sm">Active Subscriptions</p>
              <p className="text-2xl font-bold text-white">{loading ? '—' : activeSubs}</p>
            </div>
            <div className="p-3 bg-emerald-500/20 rounded-lg">
              <CreditCard className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6">
          <p className="text-slate-400 text-sm mb-2">In Trial</p>
          <p className="text-3xl font-bold text-white">{loading ? '—' : trialSubs}</p>
        </div>
        <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6">
          <p className="text-slate-400 text-sm mb-2">Total</p>
          <p className="text-3xl font-bold text-white">{loading ? '—' : total}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-4 flex-wrap items-end">
        <div className="flex-1 min-w-64 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by company name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
          />
        </div>
        <select
          value={filters.plan}
          onChange={(e) => { setFilters({ ...filters, plan: e.target.value }); setPage(1); }}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Plans</option>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <select
          value={filters.status}
          onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="trial">Trial</option>
          <option value="cancelled">Cancelled</option>
          <option value="past_due">Past Due</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        {loading ? (
          <div className="animate-pulse space-y-2 p-4">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-slate-700 rounded" />)}
          </div>
        ) : subscriptions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700 border-b border-slate-600">
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} className="px-6 py-3 text-left text-sm font-semibold text-slate-200">
                      {col.label}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-right text-sm font-semibold text-slate-200">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {subscriptions.map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-slate-700 transition-colors">
                    {columns.map((col) => (
                      <td key={col.key} className="px-6 py-4 text-slate-200">
                        {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                      </td>
                    ))}
                    <td className="px-6 py-4">{renderRowActions(row)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <CreditCard className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No subscriptions found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={setPageSize} />

      {/* Action Modals */}
      {actionModal?.type === 'cancel' && (
        <Modal
          isOpen
          onClose={closeAction}
          title="Cancel Subscription"
          actions={{
            primary: { label: 'Cancel Subscription', onClick: executeAction, loading: actionLoading },
            secondary: { label: 'Keep Active', onClick: closeAction },
          }}
        >
          <p className="text-slate-300">
            Are you sure you want to cancel the subscription for{' '}
            <strong>{actionModal.subscription.companyName || 'this company'}</strong>?
            This will take effect at the end of the current billing period.
          </p>
        </Modal>
      )}

      {actionModal?.type === 'refund' && (
        <Modal
          isOpen
          onClose={closeAction}
          title="Process Refund"
          actions={{
            primary: { label: 'Process Refund', onClick: executeAction, loading: actionLoading },
            secondary: { label: 'Cancel', onClick: closeAction },
          }}
        >
          <div className="space-y-4">
            <p className="text-slate-300">
              Process a refund for <strong>{actionModal.subscription.companyName || 'this company'}</strong>.
            </p>
            <div>
              <label htmlFor="refund-reason" className="block text-sm font-medium text-slate-300 mb-2">
                Reason for refund
              </label>
              <textarea
                id="refund-reason"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows={3}
                placeholder="Enter reason..."
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        </Modal>
      )}

      {actionModal?.type === 'extend' && (
        <Modal
          isOpen
          onClose={closeAction}
          title="Extend Trial"
          actions={{
            primary: { label: `Extend by ${extendDays} days`, onClick: executeAction, loading: actionLoading },
            secondary: { label: 'Cancel', onClick: closeAction },
          }}
        >
          <div className="space-y-4">
            <p className="text-slate-300">
              Extend the trial period for <strong>{actionModal.subscription.companyName || 'this company'}</strong>.
            </p>
            <div>
              <label htmlFor="extend-days" className="block text-sm font-medium text-slate-300 mb-2">
                Number of days
              </label>
              <select
                id="extend-days"
                value={extendDays}
                onChange={(e) => setExtendDays(Number(e.target.value))}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
                <option value={60}>60 days</option>
              </select>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
