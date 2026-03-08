import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import apiClient from '../api/client';
import useAuthStore from '../stores/authStore';
import { Plus, Eye, CheckCircle } from 'lucide-react';
import { ListSkeleton } from '../components/SkeletonLoader';

export default function JTSAListPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [jtsas, setJtsas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchJtsas = async () => {
      try {
        const response = await apiClient.get(`/companies/${user.companyId}/jtsas`, {
          params: {
            status: filter === 'all' ? undefined : filter,
            limit: 50,
            offset: 0,
          },
        });
        setJtsas(response.data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.companyId) {
      fetchJtsas();
    }
  }, [user, filter]);

  const handleCreateJTSA = () => {
    navigate('/jtsa/create');
  };

  const handleViewJTSA = (id) => {
    navigate(`/jtsa/${id}`);
  };



  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">JTSAs</h2>
          <button
            onClick={handleCreateJTSA}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create JTSA
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800">
            Error: {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {['all', 'in_progress', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {status === 'all' ? 'All' : status === 'in_progress' ? 'In Progress' : 'Completed'}
            </button>
          ))}
        </div>

        {/* JTSA List */}
        {loading ? (
          <ListSkeleton />
        ) : jtsas.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 mb-4">No JTSAs yet. Create one to get started!</p>
            <button
              onClick={handleCreateJTSA}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create First JTSA
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {jtsas.map((jtsa) => (
              <div key={jtsa.id} className="card flex items-center justify-between hover:shadow-lg transition-shadow">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{jtsa.task_description}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Project: {jtsa.project?.name || 'Unknown'} · Date: {jtsa.date}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Created by: {jtsa.created_by_user?.full_name || jtsa.created_by_user?.email || 'Unknown'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      jtsa.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {jtsa.status === 'completed' ? '✓ Completed' : 'In Progress'}
                  </span>
                  <button
                    onClick={() => handleViewJTSA(jtsa.id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
