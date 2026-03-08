import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import apiClient from '../api/client';
import useAuthStore from '../stores/authStore';
import HazardSeverityBadge from '../components/HazardSeverityBadge';
import MitigationStatusBadge from '../components/MitigationStatusBadge';
import { ArrowLeft, CheckCircle, Plus } from 'lucide-react';

export default function JTSADetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [jtsa, setJtsa] = useState(null);
  const [hazards, setHazards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedHazard, setSelectedHazard] = useState(null);

  useEffect(() => {
    const fetchJTSA = async () => {
      try {
        const response = await apiClient.get(`/jtsas/${id}`);
        setJtsa(response.data);
        
        // Hazards are included in the JTSA response
        setHazards(response.data.hazards || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJTSA();
    }
  }, [id]);

  const handleAcknowledgeHazard = async (hazardId) => {
    try {
      await apiClient.patch(`/hazards/${hazardId}`, {
        userAcknowledged: true,
      });
      // Refresh JTSA data to get updated hazards
      const response = await apiClient.get(`/jtsas/${id}`);
      setHazards(response.data.hazards || []);
    } catch (err) {
      console.error('Error acknowledging hazard:', err);
    }
  };

  const handleCompleteJTSA = async () => {
    try {
      await apiClient.post(`/jtsas/${id}/complete`);
      navigate('/jtsa');
    } catch (err) {
      console.error('Error completing JTSA:', err);
    }
  };

  if (loading) return <Layout><div className="text-center py-8">Loading JTSA...</div></Layout>;
  if (error) return <Layout><div className="text-red-600 py-8">{error}</div></Layout>;
  if (!jtsa) return <Layout><div className="text-gray-600 py-8">JTSA not found</div></Layout>;

  return (
    <Layout>
      <div>
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/jtsa')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to JTSAs
          </button>

          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{jtsa.task_description}</h2>
              <p className="text-gray-600 mt-2">
                Date: {jtsa.date} · Project: {jtsa.project?.name || 'Unknown'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`px-4 py-2 rounded-lg font-semibold ${
                  jtsa.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {jtsa.status === 'completed' ? '✓ Completed' : 'In Progress'}
              </span>
              {jtsa.status !== 'completed' && (
                <button
                  onClick={handleCompleteJTSA}
                  className="btn-success flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Complete JTSA
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Hazards Section */}
        <div className="card mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Hazards</h3>
            <button className="btn-primary flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Hazard
            </button>
          </div>

          {hazards.length === 0 ? (
            <p className="text-gray-600">No hazards identified.</p>
          ) : (
            <div className="space-y-4">
              {hazards.map((hazard) => (
                <div key={hazard.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{hazard.description}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {hazard.ai_suggested ? '🤖 AI Suggested' : 'User Submitted'}
                      </p>
                    </div>
                    <HazardSeverityBadge severity={hazard.severity} />
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-medium ${
                        hazard.user_acknowledged
                          ? 'text-green-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {hazard.user_acknowledged ? '✓ Acknowledged' : 'Not Acknowledged'}
                    </span>
                    {!hazard.user_acknowledged && (
                      <button
                        onClick={() => handleAcknowledgeHazard(hazard.id)}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Participants Section */}
        <div className="card">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Participants</h3>
          <p className="text-gray-600">Participant management coming soon.</p>
        </div>
      </div>
    </Layout>
  );
}
