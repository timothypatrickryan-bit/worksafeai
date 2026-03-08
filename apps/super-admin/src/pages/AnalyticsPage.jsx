import { useMemo } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';

const mockAnalyticsAPI = {
  getSummary: async () => ({
    totalCompanies: 47,
    totalEmployees: 312,
    activeSubscriptions: 45,
    monthlyRevenue: 3450,
    monthlyGrowth: 12.5,
    churnRate: 2.1,
    trialConversionRate: 68,
  }),
};

export default function AnalyticsPage() {
  const stats = {
    totalCompanies: 47,
    totalEmployees: 312,
    activeSubscriptions: 45,
    monthlyRevenue: 3450,
    monthlyGrowth: 12.5,
    churnRate: 2.1,
    trialConversionRate: 68,
  };

  const revenueData = [
    { month: 'Jan', revenue: 1200 },
    { month: 'Feb', revenue: 2100 },
    { month: 'Mar', revenue: 3450 },
  ];

  const statCards = [
    {
      icon: Users,
      label: 'Total Companies',
      value: stats.totalCompanies,
      color: 'from-blue-500 to-blue-600',
      change: '+5 this month',
    },
    {
      icon: Users,
      label: 'Total Employees',
      value: stats.totalEmployees,
      color: 'from-emerald-500 to-emerald-600',
      change: '+23 this month',
    },
    {
      icon: DollarSign,
      label: 'Monthly Revenue',
      value: `$${stats.monthlyRevenue}`,
      color: 'from-purple-500 to-purple-600',
      change: `+${stats.monthlyGrowth}% growth`,
    },
    {
      icon: TrendingUp,
      label: 'Churn Rate',
      value: `${stats.churnRate}%`,
      color: 'from-amber-500 to-amber-600',
      change: 'Down from 2.8%',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
        <p className="text-slate-400">System performance and metrics overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`bg-gradient-to-br ${card.color} rounded-lg p-6 text-white shadow-lg`}
            >
              <div className="flex items-start justify-between mb-4">
                <Icon className="w-8 h-8 opacity-50" />
              </div>
              <p className="text-sm font-medium opacity-90 mb-1">{card.label}</p>
              <p className="text-3xl font-bold mb-2">{card.value}</p>
              <p className="text-xs opacity-75">{card.change}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Revenue Trend
          </h2>
          <div className="space-y-4">
            {revenueData.map((item) => (
              <div key={item.month}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-slate-300">{item.month}</span>
                  <span className="text-sm font-semibold text-white">${item.revenue}</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                    style={{ width: `${(item.revenue / 3450) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-lg font-bold text-white mb-4">Plan Distribution</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-300">Starter</span>
                <span className="font-semibold text-white">18 customers (40%)</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-slate-500" style={{ width: '40%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-300">Pro</span>
                <span className="font-semibold text-white">22 customers (49%)</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: '49%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-300">Enterprise</span>
                <span className="font-semibold text-white">5 customers (11%)</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: '11%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-lg font-bold text-white mb-6">Key Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-slate-400 text-sm mb-2">Trial Conversion Rate</p>
            <p className="text-3xl font-bold text-emerald-400">{stats.trialConversionRate}%</p>
            <p className="text-xs text-slate-400 mt-1">Trials → Paid</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-2">Average Revenue Per User</p>
            <p className="text-3xl font-bold text-blue-400">
              ${(stats.monthlyRevenue / stats.activeSubscriptions).toFixed(0)}
            </p>
            <p className="text-xs text-slate-400 mt-1">Per Active Subscription</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-2">Churn Rate</p>
            <p className="text-3xl font-bold text-amber-400">{stats.churnRate}%</p>
            <p className="text-xs text-slate-400 mt-1">Monthly</p>
          </div>
        </div>
      </div>
    </div>
  );
}
