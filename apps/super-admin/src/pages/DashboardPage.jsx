import { useEffect, useState } from 'react';
import { Building2, Users, TrendingUp, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalUsers: 0,
    activeSubscriptions: 0,
    jtsasCompleted: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setStats({
        totalCompanies: 24,
        totalUsers: 128,
        activeSubscriptions: 18,
        jtsasCompleted: 342,
      });
      setLoading(false);
    }, 1000);
  }, []);

  const StatCard = ({ icon: Icon, label, value, trend }) => (
    <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6 hover:border-cyan-500/30 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {trend && (
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
        <p className="text-slate-500 text-xs mt-2">{timestamp}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Welcome back to the Super Admin Console</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Building2}
          label="Companies"
          value={stats.totalCompanies}
          trend="+4"
        />
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats.totalUsers}
          trend="+12"
        />
        <StatCard
          icon={TrendingUp}
          label="Active Subscriptions"
          value={stats.activeSubscriptions}
          trend="+2"
        />
        <StatCard
          icon={CheckCircle2}
          label="JTSAs Completed"
          value={stats.jtsasCompleted}
          trend="+34"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-6">Recent Activity</h2>
          <div className="space-y-1">
            <ActivityItem
              icon={Building2}
              title="New Company Registered"
              description="Acme Manufacturing Co signed up for Pro plan"
              timestamp="2 hours ago"
            />
            <ActivityItem
              icon={Users}
              title="User Onboarded"
              description="Sarah Johnson (Acme Mfg) completed profile setup"
              timestamp="1 hour ago"
            />
            <ActivityItem
              icon={CheckCircle2}
              title="JTSA Completed"
              description="Safety analysis for roofing project submitted"
              timestamp="30 minutes ago"
            />
            <ActivityItem
              icon={TrendingUp}
              title="Subscription Upgraded"
              description="BuildCo upgraded from Starter to Pro plan"
              timestamp="10 minutes ago"
            />
          </div>
        </div>

        {/* System Status */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-6">System Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm">API Health</span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <span className="text-emerald-400 text-xs font-medium">Healthy</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-sm">Database</span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <span className="text-emerald-400 text-xs font-medium">Connected</span>
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
                  Last checked: Just now
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-6">Performance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-300 text-sm">Avg. Response Time</span>
              <span className="text-emerald-400 text-sm font-bold">142ms</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-500 h-2 rounded-full" style={{ width: '142px', maxWidth: '100%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-300 text-sm">Uptime</span>
              <span className="text-emerald-400 text-sm font-bold">99.98%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-gradient-to-r from-green-600 to-emerald-500 h-2 rounded-full" style={{ width: '99.98%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-300 text-sm">Error Rate</span>
              <span className="text-emerald-400 text-sm font-bold">0.02%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-gradient-to-r from-red-600 to-orange-500 h-2 rounded-full" style={{ width: '0.2%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
