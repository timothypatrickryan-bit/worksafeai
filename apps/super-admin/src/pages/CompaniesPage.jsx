import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../stores/appStore';
import { Plus, Search, Trash2, Edit2 } from 'lucide-react';

export default function CompaniesPage() {
  const navigate = useNavigate();
  const { selectedApp } = useAppStore();
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    industry: '',
    size: '',
  });

  useEffect(() => {
    // TODO: Fetch from API
    // Mock data for now
    setCompanies([
      {
        id: 1,
        name: 'ABC Construction',
        email: 'contact@abcconstruction.com',
        industry: 'General Contracting',
        employees: 45,
        plan: 'Pro',
        createdAt: '2026-01-15',
      },
      {
        id: 2,
        name: 'XYZ Contractors',
        email: 'info@xyzcontractors.com',
        industry: 'Electrical',
        employees: 28,
        plan: 'Starter',
        createdAt: '2026-02-10',
      },
      {
        id: 3,
        name: 'Safety First Inc',
        email: 'admin@safetyfirst.com',
        industry: 'Utility Services',
        employees: 120,
        plan: 'Enterprise',
        createdAt: '2025-11-20',
      },
    ]);
    setLoading(false);
  }, [selectedApp]);

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(search.toLowerCase()) ||
    company.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    // TODO: POST to API endpoint
    console.log('Creating company:', formData);
    setShowCreateModal(false);
    setFormData({ name: '', email: '', phone: '', industry: '', size: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Companies</h1>
          <p className="text-slate-400">Manage all companies in {selectedApp}</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Company
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Companies Table */}
      {loading ? (
        <div className="bg-slate-800 rounded-lg p-6 animate-pulse">
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-700 rounded" />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
          {filteredCompanies.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700 border-b border-slate-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Company Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Industry</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Employees</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Plan</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Created</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-slate-200">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredCompanies.map((company) => (
                    <tr key={company.id} className="hover:bg-slate-700 transition-colors">
                      <td className="px-6 py-4 text-white font-medium">{company.name}</td>
                      <td className="px-6 py-4 text-slate-300 text-sm">{company.email}</td>
                      <td className="px-6 py-4 text-slate-300 text-sm">{company.industry}</td>
                      <td className="px-6 py-4 text-slate-300 text-sm">{company.employees}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          company.plan === 'Enterprise'
                            ? 'bg-purple-500/20 text-purple-300'
                            : company.plan === 'Pro'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-slate-600 text-slate-300'
                        }`}>
                          {company.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-sm">{company.createdAt}</td>
                      <td className="px-6 py-4 text-right space-x-2 flex justify-end">
                        <button
                          onClick={() => navigate(`/companies/${company.id}`)}
                          className="p-2 hover:bg-slate-600 rounded-lg text-blue-400 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 hover:bg-slate-600 rounded-lg text-red-400 transition-colors"
                          onClick={() => {
                            if (confirm(`Delete ${company.name}?`)) {
                              // TODO: Delete company via API
                              setCompanies(companies.filter(c => c.id !== company.id));
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-slate-400">No companies found</p>
            </div>
          )}
        </div>
      )}

      {/* Create Company Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-4">Create Company</h2>

            <form onSubmit={handleCreateCompany} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Company Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ABC Construction"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="contact@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Industry</label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select industry</option>
                  <option value="General Contracting">General Contracting</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Plumbing & HVAC">Plumbing & HVAC</option>
                  <option value="Utility Services">Utility Services</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
