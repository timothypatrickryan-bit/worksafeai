import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import apiClient from '../api/client';
import useAuthStore from '../stores/authStore';
import { Users, FolderOpen, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { StatCardSkeleton } from '../components/SkeletonLoader';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.get(`/companies/${user.companyId}/dashboard`);
        setStats(response.data.stats);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.companyId) {
      fetchStats();
    }
  }, [user]);

  if (error) return (
    <Layout>
      <div className="text-red-400 py-8 text-center">
        <p className="text-lg font-semibold">Error loading dashboard</p>
        <p className="text-sm text-red-300 mt-1">{error}</p>
      </div>
    </Layout>
  );

  const statCards = [
    {
      icon: Users,
      label: 'Total Employees',
      value: stats?.totalEmployees || 0,
      gradient: 'from-blue-500 to-cyan-500',
      accentColor: 'text-cyan-400',
    },
    {
      icon: FolderOpen,
      label: 'Total Projects',
      value: stats?.totalProjects || 0,
      gradient: 'from-emerald-500 to-teal-500',
      accentColor: 'text-emerald-400',
    },
    {
      icon: Clock,
      label: "Today's JTSAs",
      value: stats?.todaysJtsas || 0,
      gradient: 'from-amber-500 to-orange-500',
      accentColor: 'text-amber-400',
    },
    {
      icon: CheckCircle2,
      label: 'Completed This Week',
      value: stats?.completedThisWeek || 0,
      gradient: 'from-violet-500 to-purple-500',
      accentColor: 'text-violet-400',
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent mb-2">
            Welcome back, {user?.fullName?.split(' ')[0]}
          </h1>
          <p className="text-slate-400">Your workplace safety intelligence dashboard</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            statCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:bg-white/15 hover:border-white/30"
                >
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  
                  {/* Icon background */}
                  <div className={`absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br ${card.gradient} rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 bg-gradient-to-br ${card.gradient} rounded-xl shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className={`text-2xl font-bold ${card.accentColor}`}>{card.value}</span>
                    </div>
                    <p className="text-slate-300 text-sm font-medium">{card.label}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <button onClick={() => navigate('/jtsa/create')} className="group col-span-1 lg:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/40 to-cyan-600/40 backdrop-blur-md border border-white/20 p-8 shadow-lg transition-all duration-300 hover:shadow-2xl hover:border-white/40 text-left">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-white mb-2">Analyze Workplace Hazards</h3>
              <p className="text-slate-300 text-sm mb-4">Use AI to identify and assess safety risks in your operations</p>
              <div className="flex items-center text-cyan-400 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                Get Started <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          </button>

          <button onClick={() => navigate('/jtsa')} className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600/40 to-teal-600/40 backdrop-blur-md border border-white/20 p-8 shadow-lg transition-all duration-300 hover:shadow-2xl hover:border-white/40 text-left">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-white mb-2">View JTSAs</h3>
              <p className="text-slate-300 text-sm mb-4">Browse and manage all Job Task Safety Analyses</p>
              <div className="flex items-center text-emerald-400 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                Browse <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          </button>
        </div>

        {/* Stats Breakdown */}
        {stats && (
          <div className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-8 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-600/20 via-transparent to-transparent" />
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-white mb-6">Quick Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <p className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    {stats?.totalEmployees || 0}
                  </p>
                  <p className="text-slate-400 text-sm mt-1">Team Members</p>
                </div>
                <div>
                  <p className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    {stats?.totalProjects || 0}
                  </p>
                  <p className="text-slate-400 text-sm mt-1">Active Projects</p>
                </div>
                <div>
                  <p className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                    {stats?.todaysJtsas || 0}
                  </p>
                  <p className="text-slate-400 text-sm mt-1">Today's Tasks</p>
                </div>
                <div>
                  <p className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                    {stats?.completedThisWeek || 0}
                  </p>
                  <p className="text-slate-400 text-sm mt-1">Completed</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
