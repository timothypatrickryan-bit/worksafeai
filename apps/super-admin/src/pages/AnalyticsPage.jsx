export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
        <p className="text-slate-400">Platform usage and performance analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Daily Active Users</h3>
          <div className="h-32 bg-white/5 rounded-lg flex items-center justify-center">
            <p className="text-slate-400">Chart visualization</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">JTSAs Completed</h3>
          <div className="h-32 bg-white/5 rounded-lg flex items-center justify-center">
            <p className="text-slate-400">Chart visualization</p>
          </div>
        </div>
      </div>
    </div>
  );
}
