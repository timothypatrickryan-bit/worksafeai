import { useState, useEffect } from 'react';
import { TrendingUp, Target, Users, DollarSign, Award, BarChart3, Zap } from 'lucide-react';

export default function WarpSpeedKPI() {
  const [kpis, setKpis] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKPIData = async () => {
      try {
        const res = await fetch('/api/projects/6/kpi');
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        const data = await res.json();
        setKpis(data.kpis || []);
        setMilestones(data.milestones || []);
        setError(null);
      } catch (err) {
        setError(err.message);
        // Fallback: load from local data
        setKpis(getDefaultKPIs());
        setMilestones(getDefaultMilestones());
      } finally {
        setLoading(false);
      }
    };
    fetchKPIData();
  }, []);

  const getDefaultKPIs = () => [
    { metric: 'Market Share Growth', target: '+15% in Northeast region', tracking: 'Quarterly', icon: 'TrendingUp', category: 'Market' },
    { metric: 'Revenue Growth', target: '+30% YoY', tracking: 'Monthly', icon: 'DollarSign', category: 'Revenue' },
    { metric: 'Pipeline Value', target: '$5M+ qualified opportunities', tracking: 'Monthly', icon: 'BarChart3', category: 'Sales' },
    { metric: 'New Customers', target: '12+ new customers', tracking: 'Monthly', icon: 'Users', category: 'Sales' },
    { metric: 'Team Growth', target: '+5-8 new employees', tracking: 'Monthly', icon: 'Award', category: 'Team' },
    { metric: 'Win Rate Improvement', target: '+20% vs historical', tracking: 'Quarterly', icon: 'Target', category: 'Sales' },
    { metric: 'Brand Mentions', target: '40+ industry mentions/month', tracking: 'Quarterly', icon: 'Zap', category: 'Marketing' },
    { metric: 'Customer Acquisition Cost', target: 'TBD (baseline current)', tracking: 'Monthly', icon: 'DollarSign', category: 'Finance' },
  ];

  const getDefaultMilestones = () => [
    { date: '2026-03-25', milestone: 'Project launch & kickoff briefing', status: 'active' },
    { date: '2026-04-15', milestone: 'Market analysis delivered', status: 'pending' },
    { date: '2026-04-30', milestone: 'Strategic plan finalized', status: 'pending' },
    { date: '2026-05-15', milestone: 'SWOT/capabilities assessment complete', status: 'pending' },
    { date: '2026-05-30', milestone: 'Marketing plan launched', status: 'pending' },
    { date: '2026-06-15', milestone: 'BD plan & sales playbook ready', status: 'pending' },
    { date: '2026-06-30', milestone: 'First wave of hires onboarded', status: 'pending' },
    { date: '2026-07-01', milestone: 'Full execution mode (campaigns live)', status: 'pending' },
    { date: '2026-09-25', milestone: '6-month checkpoint & recalibration', status: 'pending' },
  ];

  const getIcon = (iconName) => {
    const icons = {
      TrendingUp: <TrendingUp className="w-6 h-6" />,
      Target: <Target className="w-6 h-6" />,
      Users: <Users className="w-6 h-6" />,
      DollarSign: <DollarSign className="w-6 h-6" />,
      Award: <Award className="w-6 h-6" />,
      BarChart3: <BarChart3 className="w-6 h-6" />,
      Zap: <Zap className="w-6 h-6" />,
    };
    return icons[iconName] || <BarChart3 className="w-6 h-6" />;
  };

  const getCategoryColor = (category) => {
    const colors = {
      Market: 'from-blue-600 to-blue-700',
      Revenue: 'from-green-600 to-green-700',
      Sales: 'from-purple-600 to-purple-700',
      Team: 'from-orange-600 to-orange-700',
      Marketing: 'from-pink-600 to-pink-700',
      Finance: 'from-amber-600 to-amber-700',
    };
    return colors[category] || 'from-slate-600 to-slate-700';
  };

  const getTrackingBadgeColor = (tracking) => {
    if (tracking === 'Monthly') return 'bg-green-100 text-green-800';
    if (tracking === 'Quarterly') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getMilestoneStatusColor = (status) => {
    if (status === 'active') return 'bg-green-100 text-green-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-300 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && kpis.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <p>Error loading KPI data: {error}</p>
          <p className="text-sm mt-2">Loading local default KPIs...</p>
        </div>
      </div>
    );
  }

  const displayKpis = kpis.length > 0 ? kpis : getDefaultKPIs();
  const displayMilestones = milestones.length > 0 ? milestones : getDefaultMilestones();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Project Warp Speed KPI Dashboard</h2>
        <p className="text-sm text-gray-600 mt-2">Pro-Tel Growth Acceleration Initiative — Northeast PA/Upstate NY Market Leadership</p>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total KPIs</p>
              <p className="text-3xl font-bold mt-2">{displayKpis.length}</p>
            </div>
            <BarChart3 className="w-10 h-10 text-blue-200 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Monthly Tracked</p>
              <p className="text-3xl font-bold mt-2">{displayKpis.filter(k => k.tracking === 'Monthly').length}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-200 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Quarterly Tracked</p>
              <p className="text-3xl font-bold mt-2">{displayKpis.filter(k => k.tracking === 'Quarterly').length}</p>
            </div>
            <Target className="w-10 h-10 text-purple-200 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Key Milestones</p>
              <p className="text-3xl font-bold mt-2">{displayMilestones.length}</p>
            </div>
            <Zap className="w-10 h-10 text-orange-200 opacity-50" />
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-4">KPI Targets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayKpis.map((kpi, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Gradient Header */}
              <div className={`bg-gradient-to-r ${getCategoryColor(kpi.category)} p-4`}>
                <div className="flex items-center justify-between">
                  <div className="text-white opacity-80">
                    {getIcon(kpi.icon)}
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${getTrackingBadgeColor(kpi.tracking)}`}>
                    {kpi.tracking}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h4 className="font-semibold text-gray-900 text-sm mb-3">{kpi.metric}</h4>
                <div className="bg-gray-50 rounded p-3 border border-gray-100">
                  <p className="text-sm font-medium text-gray-700">{kpi.target}</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">Category</span>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium">{kpi.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Milestones Timeline */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-4">Key Milestones</h3>
        <div className="space-y-3">
          {displayMilestones.map((milestone, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-lg p-4 flex items-start gap-4 hover:shadow-md transition-shadow"
            >
              <div className="flex-shrink-0 mt-1">
                <div className={`w-2.5 h-2.5 rounded-full ${milestone.status === 'active' ? 'bg-green-500' : 'bg-yellow-400'}`}></div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{milestone.milestone}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(milestone.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
              </div>
              <div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getMilestoneStatusColor(milestone.status)}`}>
                  {milestone.status === 'active' ? '🚀 Active' : '⏳ Pending'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Summary Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-8 text-white shadow-xl">
        <h3 className="text-2xl font-bold mb-4">Warp Speed Initiative</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-slate-200 mb-3">Timeline</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>📅 <strong>Duration:</strong> March 25 - September 25, 2026 (6 months)</li>
              <li>💰 <strong>Investment:</strong> $650K</li>
              <li>🎯 <strong>Status:</strong> Active</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-200 mb-3">Annual Targets</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>📊 <strong>Revenue:</strong> $15-25M annual</li>
              <li>👥 <strong>Team Expansion:</strong> 50+ people by Q3</li>
              <li>🏆 <strong>Reference Projects:</strong> 2-3 completed by Q4</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
