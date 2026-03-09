import { useState } from 'react';
import { TrendingUp, TrendingDown, Users, Building2, CreditCard, BarChart3, RefreshCw, AlertCircle } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import analyticsAPI from '../api/analytics';

function MetricCard({ label, value, change, icon: Icon, loading: isLoading }) {
  const isPositive = change && !String(change).startsWith('-');
  return (
    <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">{label}</p>
          {isLoading ? (
            <div className="h-8 w-20 bg-white/10 rounded animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
          )}
          {change && !isLoading && (
            <p className={`text-xs mt-2 flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {change}
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg">
            <Icon className="w-5 h-5 text-cyan-400" />
          </div>
        )}
      </div>
    </div>
  );
}

function SimpleBarChart({ data, label, loading: isLoading }) {
  if (isLoading) {
    return (
      <div className="h-48 flex items-end gap-2 px-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex-1 bg-white/10 rounded-t animate-pulse" style={{ height: `${30 + Math.random() * 70}%` }} />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
        No data available
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => d.value || 0), 1);

  return (
    <div className="h-48 flex items-end gap-2 px-4">
      {data.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-xs text-slate-400">{item.value}</span>
          <div
            className="w-full bg-gradient-to-t from-blue-600 to-cyan-500 rounded-t transition-all hover:opacity-80"
            style={{ height: `${(item.value / maxVal) * 100}%`, minHeight: '4px' }}
            title={`${item.label}: ${item.value}`}
          />
          <span className="text-[10px] text-slate-500 truncate max-w-full">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('month');

  // Fetch analytics data
  const { data: summary, loading: summaryLoading, error: summaryError, refetch: refetchSummary } = useFetch(
    () => analyticsAPI.getSummary(),
    [],
    { initialData: null }
  );

  const { data: revenueTrend, loading: revenueLoading } = useFetch(
    () => analyticsAPI.getRevenueTrend(period),
    [period],
    { initialData: null }
  );

  const { data: planDist, loading: planLoading } = useFetch(
    () => analyticsAPI.getPlanDistribution(),
    [],
    { initialData: null }
  );

  const { data: metrics, loading: metricsLoading } = useFetch(
    () => analyticsAPI.getMetrics(),
    [],
    { initialData: null }
  );

  const anyLoading = summaryLoading || revenueLoading || planLoading || metricsLoading;

  // Transform revenue data for chart
  const revenueChartData = Array.isArray(revenueTrend)
    ? revenueTrend.map(item => ({
        label: item.month || item.date || item.period || '',
        value: item.revenue || item.amount || item.value || 0,
      }))
    : revenueTrend?.data
      ? revenueTrend.data.map(item => ({
          label: item.month || item.date || item.period || '',
          value: item.revenue || item.amount || item.value || 0,
        }))
      : [];

  // Transform plan distribution for chart
  const planChartData = Array.isArray(planDist)
    ? planDist.map(item => ({
        label: item.plan || item.name || '',
        value: item.count || item.value || 0,
      }))
    : planDist?.data
      ? planDist.data.map(item => ({
          label: item.plan || item.name || '',
          value: item.count || item.value || 0,
        }))
      : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
          <p className="text-slate-400">Platform usage and performance analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button
            onClick={refetchSummary}
            disabled={anyLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-slate-300 hover:bg-white/20 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${anyLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error */}
      {summaryError && (
        <div className="p-4 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-300 flex-shrink-0" />
          <p className="text-amber-300 text-sm">Could not load analytics: {summaryError}</p>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Total Companies"
          value={summary?.totalCompanies ?? summary?.companies}
          change={summary?.companyGrowth}
          icon={Building2}
          loading={summaryLoading}
        />
        <MetricCard
          label="Total Users"
          value={summary?.totalUsers ?? summary?.users ?? summary?.employees}
          change={summary?.userGrowth}
          icon={Users}
          loading={summaryLoading}
        />
        <MetricCard
          label="Monthly Revenue"
          value={summary?.mrr != null ? `$${summary.mrr.toLocaleString()}` : summary?.monthlyRevenue != null ? `$${summary.monthlyRevenue.toLocaleString()}` : undefined}
          change={summary?.revenueGrowth}
          icon={CreditCard}
          loading={summaryLoading}
        />
        <MetricCard
          label="JTSAs This Month"
          value={summary?.jtsasThisMonth ?? summary?.jtsas}
          change={summary?.jtsaGrowth}
          icon={BarChart3}
          loading={summaryLoading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Revenue Trend</h3>
          <SimpleBarChart data={revenueChartData} label="Revenue" loading={revenueLoading} />
        </div>

        <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Plan Distribution</h3>
          <SimpleBarChart data={planChartData} label="Plans" loading={planLoading} />
        </div>
      </div>

      {/* Additional Metrics */}
      {metrics && (
        <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Platform Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metrics.avgResponseTime != null && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-300 text-sm">Avg. Response Time</span>
                  <span className="text-emerald-400 text-sm font-bold">{metrics.avgResponseTime}ms</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 h-2 rounded-full"
                    style={{ width: `${Math.min((metrics.avgResponseTime / 500) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
            {metrics.uptime != null && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-300 text-sm">Uptime</span>
                  <span className="text-emerald-400 text-sm font-bold">{metrics.uptime}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-600 to-emerald-500 h-2 rounded-full"
                    style={{ width: `${metrics.uptime}%` }}
                  />
                </div>
              </div>
            )}
            {metrics.errorRate != null && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-300 text-sm">Error Rate</span>
                  <span className="text-emerald-400 text-sm font-bold">{metrics.errorRate}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-red-600 to-orange-500 h-2 rounded-full"
                    style={{ width: `${Math.min(metrics.errorRate * 10, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
