import { useState } from 'react';
import { Search, Plus, MoreHorizontal, Building2 } from 'lucide-react';

export default function CompaniesPage() {
  const [companies] = useState([
    { id: 1, name: 'Acme Manufacturing', industry: 'Manufacturing', employees: 45, plan: 'Pro', status: 'Active' },
    { id: 2, name: 'BuildCo Contractors', industry: 'Construction', employees: 28, plan: 'Starter', status: 'Active' },
    { id: 3, name: 'Tech Solutions Inc', industry: 'Technology', employees: 12, plan: 'Starter', status: 'Trial' },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Companies</h1>
          <p className="text-slate-400">Manage all registered companies</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all">
          <Plus className="w-4 h-4" />
          Add Company
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search companies..."
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
        <select className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-500/50">
          <option>All Plans</option>
          <option>Starter</option>
          <option>Pro</option>
          <option>Enterprise</option>
        </select>
      </div>

      {/* Companies Table */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Company</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Industry</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Employees</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Plan</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300"></th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Building2 className="w-4 h-4 text-blue-400" />
                      </div>
                      <span className="text-white font-medium">{company.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{company.industry}</td>
                  <td className="px-6 py-4 text-slate-300">{company.employees}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-medium">
                      {company.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      company.status === 'Active'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {company.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <MoreHorizontal className="w-4 h-4 text-slate-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
