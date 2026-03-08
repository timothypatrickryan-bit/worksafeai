import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import apiClient from '../api/client';
import useAuthStore from '../stores/authStore';
import { Plus, Users, LogOut, Loader } from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuthStore();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteData, setInviteData] = useState({ email: '', fullName: '', role: 'employee' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, [user]);

  const fetchEmployees = async () => {
    try {
      const response = await apiClient.get(`/companies/${user.companyId}/users`);
      setEmployees(response.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteEmployee = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await apiClient.post(`/companies/${user.companyId}/users`, {
        email: inviteData.email,
        fullName: inviteData.fullName,
        role: inviteData.role,
      });
      setInviteData({ email: '', fullName: '', role: 'employee' });
      setShowInviteForm(false);
      await fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to invite employee');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Layout><div className="text-center py-8">Loading admin panel...</div></Layout>;

  // Only allow owners and admins
  if (user?.role !== 'owner' && user?.role !== 'admin') {
    return (
      <Layout>
        <div className="card text-center py-12">
          <p className="text-red-600 font-semibold mb-4">Access Denied</p>
          <p className="text-gray-600">Only admins can access this section.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
          <button
            onClick={() => setShowInviteForm(!showInviteForm)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Invite Employee
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800">
            {error}
          </div>
        )}

        {/* Invite Form */}
        {showInviteForm && (
          <div className="card mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Invite New Employee</h3>
            <form onSubmit={handleInviteEmployee} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={inviteData.email}
                    onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                    placeholder="employee@company.com"
                    required
                    className="input-field"
                  />
                </div>

                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={inviteData.fullName}
                    onChange={(e) => setInviteData({ ...inviteData, fullName: e.target.value })}
                    placeholder="John Doe"
                    required
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  id="role"
                  value={inviteData.role}
                  onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                  className="input-field"
                >
                  <option value="employee">Employee</option>
                  <option value="project_manager">Project Manager</option>
                  <option value="safety_manager">Safety Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex items-center gap-2"
                >
                  {submitting && <Loader className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Sending...' : 'Send Invite'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteForm(false);
                    setInviteData({ email: '', fullName: '', role: 'employee' });
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Employees List */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Team Members ({employees.length})
          </h3>

          {employees.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No team members yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900 font-medium">{emp.full_name}</td>
                      <td className="py-3 px-4 text-gray-600">{emp.email}</td>
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize">
                          {emp.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            emp.email_verified
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {emp.email_verified ? 'Active' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button className="text-red-600 hover:text-red-700 font-medium text-sm">
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Admin Info */}
        <div className="card mt-8 bg-blue-50 border border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Admin Information</h3>
          <p className="text-gray-700 text-sm">
            You are logged in as <strong>{user?.fullName || user?.email}</strong> with <strong>{user?.role}</strong> permissions.
          </p>
        </div>
      </div>
    </Layout>
  );
}
