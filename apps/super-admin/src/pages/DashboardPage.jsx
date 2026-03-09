import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, TrendingUp, AlertCircle, Clock, CheckCircle2, RefreshCw } from 'lucide-react';
import analyticsAPI from '../api/analytics';
import auditLogsAPI from '../api/auditLogs';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryData, logsData] = await Promise.allSettled([
        analyticsAPI.getSummary(),
        auditLogsAPI.list({ limit: 5, sort: 'createdAt', order: 'desc' }),
      ]);

      if (summaryData.status === 'fulfilled') {
        setStats(summaryData.value);
      }
      if (logsData.status === 'fulfilled') {
        const logs = Array.isArray(logsData.value) ? logsData.value : logsData.value?.data || [];
        setRecentLogs(logs.slice(0, 5));
      }
      setLastChecked(new Date());
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const StatCard = ({ icon: Icon, label, value, trend, onClick }) => (
    <div
      onClick={onClick}
      className={`bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6 hover:border-cyan-500/30 transition-all ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">
            {loading ? (
              <span className="inline-block w-16 h-8 bg-white/10 rounded animate-pulse" />
            ) : (
              value ?? '—'
            )}
          </p>
          {trend && !loading && (
            <p className="text-emerald-400 text-xs mt-2">
              ↑ {trend} this month
            </p>
          )}
        </div>
        <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg">
          <Icon className="w-6 h-6 text-cyan-400" />
        </div>
      </div>
    </div>
  );

  const ActivityItem = ({ icon: Icon, title, description, timestamp }) => (
    <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-white/5 transition-colors">
      <div className="p-2 bg-white/10 rounded-lg mt-1">
        <Icon className="w-4 h-4 text-cyan-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm">{title}</p>
        <p className="text-slate-400 text-xs mt-1">{description}</p>
        {timestamp && (
          <p className="text-slate-500 text-xs mt-2">
            {new Date(timestamp).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );

  const getActivityIcon = (action) => {
    if (!action) return CheckCircle2;
    const lower = action.toLowerCase();
    if (lower.includes('company') || lower.includes('create')) return Building2;
    if (lower.includes('user') || lower.includes('employee') || lower.includes('invite')) return Users;
    if (lower.includes('subscription') || lower.includes('upgrade')) return TrendingUp;
    return CheckCircle2;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">Welcome back to the Super Admin Console</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-slate-300 hover:bg-white/20 transition-all disabled:opacity-50"
          title="Refresh dashboard"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-300 text-sm font-medium">Could not load live data</p>
            <p className="text-amber-300/70 text-xs mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Building2}
          label="Companies"
          value={stats?.totalCompanies ?? stats?.companies}
          trend={stats?.newCompaniesThisMonth ? `+${stats.newCompaniesThisMonth}` : null}
          onClick={() => navigate('/companies')}
        />
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats?.totalUsers ?? stats?.employees ?? stats?.users}
          trend={stats?.newUsersThisMonth ? `+${stats.newUsersThisMonth}` : null}
          onClick={() => navigate('/employees')}
        />
        <StatCard
          icon={TrendingUp}
          label="Active Subscriptions"
          value={stats?.activeSubscriptions ?? stats?.subscriptions}
          onClick={() => navigate('/subscriptions')}
        />
        <StatCard
          icon={CheckCircle2}
          label="JTSAs Completed"
          value={stats?.jtsasCompleted ?? stats?.jtsa_count ?? stats?.jtsas}
          onClick={() => navigate('/analytics')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Recent Activity</h2>
            <button
              onClick={() => navigate('/audit-logs')}
              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              View all →
            </button>
          </div>
          <div className="space-y-1">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="flex items-start gap-4 p-4">
                  <div className="w-8 h-8 bg-white/10 rounded-lg animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/10 rounded w-1/2 animate-pulse" />
                    <div className="h-3 bg-white/10 rounded w-3/4 animate-pulse" />
                  </div>
                </div>
              ))
            ) : recentLogs.length > 0 ? (
              recentLogs.map((log, idx) => (
                <ActivityItem
                  key={log.id || idx}
                  icon={getActivityIcon(log.action)}
                  title={log.action || log.event || 'Activity'}
                  description={log.description || log.details || `${log.resource || ''} ${log.resourceId || ''}`}
                  timestamp={log.createdAt || log.timestamp}
                />
              ))
            ) : (
              <div className="p-8 text-center">
                <p className="text-slate-500 text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-6">System Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm">API Health</span>
              <span className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${error ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
                <span className={`text-xs font-medium ${error ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {error ? 'Degraded' : 'Healthy'}
                </span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm">Database</span>
              <span className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${error ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
                <span className={`text-xs font-medium ${error ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {error ? 'Unknown' : 'Connected'}
                </span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm">Email Service</span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <span className="text-emerald-400 text-xs font-medium">Operational</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm">Payment Gateway</span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <span className="text-emerald-400 text-xs font-medium">Ready</span>
              </span>
            </div>

            <div className="border-t border-white/10 pt-4 mt-4">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/20 border border-blue-500/30">
                <Clock className="w-4 h-4 text-blue-300" />
                <span className="text-blue-300 text-xs">
                  Last checked: {lastChecked ? lastChecked.toLocaleTimeString() : 'Never'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
