import { CreditCard, ArrowUpRight, Filter } from 'lucide-react';

export default function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Subscriptions</h1>
        <p className="text-slate-400">Track all active subscriptions and billing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-slate-400 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-white">$45,230</p>
            </div>
            <div className="p-3 bg-emerald-500/20 rounded-lg">
              <CreditCard className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <p className="text-emerald-400 text-xs flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> +12% from last month
          </p>
        </div>

        <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6">
          <p className="text-slate-400 text-sm mb-2">Active Plans</p>
          <p className="text-3xl font-bold text-white">18</p>
        </div>

        <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6">
          <p className="text-slate-400 text-sm mb-2">MRR</p>
          <p className="text-3xl font-bold text-white">$3,845</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8 text-center">
        <p className="text-slate-400">Subscription details coming soon</p>
      </div>
    </div>
  );
}
