import { useEffect, useState } from 'react';
import useAppStore from '../stores/appStore';
import { Users, Building2, CreditCard, BarChart3, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { selectedApp } = useAppStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch from API based on selectedApp
    // Mock data for now
    setStats({
      totalCompanies: 45,
      totalEmployees: 312,
      activeSubscriptions: 42,
      monthlyRevenue: 3450,
      recentActivities: [
        { id: 1, action: 'Created company', company: 'ABC Construction', time: '2 hours ago' },
        { id: 2, action: 'Added employee', company: 'XYZ Contractors', time: '4 hours ago' },
        { id: 3, action: 'Upgraded subscription', company: 'Safety First Inc', time: '1 day ago' },
      ],
    });
    setLoading(false);
  }, [selectedApp]);

  const statCards = [
    {
      icon: Building2,
      label: 'Total Companies',
      value: stats?.totalCompanies || 0,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-100',
    },
    {
      icon: Users,
      label: 'Total Employees',
      value: stats?.totalEmployees || 0,
      color: 'from-emerald-500 to-emerald-600',
      textColor: 'text-emerald-100',
    },
    {
      icon: CreditCard,
      label: 'Active Subscriptions',
      value: stats?.activeSubscriptions || 0,
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-100',
    },
    {
      icon: BarChart3,
      label: 'Monthly Revenue',
      value: `$${stats?.monthlyRevenue || 0}`,
      color: 'from-amber-500 to-amber-600',
      textColor: 'text-amber-100',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">System overview and quick actions</p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-700 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className={`bg-gradient-to-br ${card.color} rounded-lg p-6 text-white shadow-lg`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`text-sm font-medium ${card.textColor} opacity-90`}>
                      {card.label}
                    </p>
                    <p className="text-3xl font-bold mt-2">{card.value}</p>
                  </div>
                  <Icon className="w-8 h-8 opacity-50" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a
          href="/companies"
          className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer"
        >
          <Building2 className="w-8 h-8 text-blue-400 mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">Manage Companies</h3>
          <p className="text-sm text-slate-400">Create, edit, or delete companies</p>
        </a>

        <a
          href="/employees"
          className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-emerald-500 transition-all hover:shadow-lg hover:shadow-emerald-500/10 cursor-pointer"
        >
          <Users className="w-8 h-8 text-emerald-400 mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">Manage Employees</h3>
          <p className="text-sm text-slate-400">Add, invite, or remove employees</p>
        </a>

        <a
          href="/analytics"
          className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/10 cursor-pointer"
        >
          <BarChart3 className="w-8 h-8 text-purple-400 mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">View Analytics</h3>
          <p className="text-sm text-slate-400">Performance metrics and reports</p>
        </a>
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Recent Activity
        </h2>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-700 rounded" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {stats?.recentActivities?.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                <div>
                  <p className="text-white font-medium">{activity.action}</p>
                  <p className="text-sm text-slate-400">{activity.company}</p>
                </div>
                <p className="text-sm text-slate-500">{activity.time}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
