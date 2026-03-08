import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import apiClient from '../api/client';
import useAuthStore from '../stores/authStore';
import { ArrowLeft, Loader } from 'lucide-react';

// Type of work options by industry
const WORK_TYPES_BY_INDUSTRY = {
  'General Contracting': [
    'Site Preparation',
    'Foundation Work',
    'Framing & Structural',
    'Interior Finish',
    'Project Management',
    'Quality Inspection',
    'Other'
  ],
  'Electrical': [
    'Residential Wiring',
    'Commercial Installation',
    'High Voltage Work',
    'Troubleshooting & Repair',
    'Panel Installation',
    'Cable Management',
    'Other'
  ],
  'Plumbing & HVAC': [
    'Pipe Installation',
    'System Design',
    'Maintenance & Repair',
    'Inspection & Testing',
    'Backflow Prevention',
    'Emergency Service',
    'Other'
  ],
  'Excavation & Demolition': [
    'Site Excavation',
    'Controlled Demolition',
    'Grade Work',
    'Equipment Operation',
    'Material Removal',
    'Debris Management',
    'Other'
  ],
  'Heavy Equipment Operation': [
    'Crane Operation',
    'Excavator Operation',
    'Loader Operation',
    'Paver Operation',
    'Compactor Operation',
    'Maintenance & Inspection',
    'Other'
  ],
  'Utility Services': [
    'Gas Line Installation',
    'Electric Distribution',
    'Water Main Work',
    'Sewer Services',
    'Emergency Response',
    'System Maintenance',
    'Other'
  ],
  'Concrete & Masonry': [
    'Concrete Pouring',
    'Finishing & Troweling',
    'Brick/Block Laying',
    'Mortar Preparation',
    'Curing & Sealing',
    'Repair & Patching',
    'Other'
  ],
  'Roofing': [
    'Shingle Installation',
    'Metal Roofing',
    'Membrane Installation',
    'Flashing & Sealing',
    'Inspection & Repair',
    'Safety Fall Protection',
    'Other'
  ],
  'Steel Erection': [
    'Beam Installation',
    'Column Placement',
    'Connection Work',
    'Rigging & Hoisting',
    'Safety Protocols',
    'Welding & Fastening',
    'Other'
  ],
  'Pipeline & Underground Utilities': [
    'Pipeline Installation',
    'Trenching & Backfill',
    'Joint Assembly',
    'Pressure Testing',
    'Cathodic Protection',
    'Maintenance & Repair',
    'Other'
  ],
  'Other': ['Custom Work', 'Mixed Scope', 'Other']
};

export default function CreateJTSAPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    projectNumber: '',
    location: '',
    typeOfWork: '',
    taskDescription: '',
  });
  const [companyIndustry, setCompanyIndustry] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch company info to get industry
  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const response = await apiClient.get(`/companies/${user.companyId}/dashboard`);
        setCompanyIndustry(response.data.company.industry);
      } catch (err) {
        setError('Failed to load company info');
      } finally {
        setLoading(false);
      }
    };

    if (user?.companyId) {
      fetchCompanyInfo();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.post(`/companies/${user.companyId}/jtsas`, {
        projectNumber: formData.projectNumber,
        location: formData.location,
        typeOfWork: formData.typeOfWork,
        taskDescription: formData.taskDescription,
      });
      navigate(`/jtsa/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create JTSA');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-cyan-500 mx-auto mb-2" />
            <p className="text-slate-400">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const availableWorkTypes = companyIndustry ? (WORK_TYPES_BY_INDUSTRY[companyIndustry] || []) : [];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-12">
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/jtsa')}
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to JTSAs
          </button>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-2">
              Create JTSA
            </h1>
            <p className="text-slate-400">
              Job Task Safety Analysis for {companyIndustry || 'your company'}
            </p>
          </div>

          {/* Form Card */}
          <div className="relative rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 text-sm font-medium">
                  {error}
                </div>
              )}

              {/* Row 1: Project Number & Location */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Project Number */}
                <div>
                  <label htmlFor="projectNumber" className="block text-sm font-semibold text-slate-200 mb-2">
                    Project #
                  </label>
                  <input
                    id="projectNumber"
                    name="projectNumber"
                    type="text"
                    value={formData.projectNumber}
                    onChange={handleChange}
                    placeholder="e.g., PRJ-2024-001"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 backdrop-blur-sm"
                  />
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-semibold text-slate-200 mb-2">
                    Location/Site
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Building A, Level 3"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Type of Work */}
              <div>
                <label htmlFor="typeOfWork" className="block text-sm font-semibold text-slate-200 mb-2">
                  Type of Work
                </label>
                <select
                  id="typeOfWork"
                  name="typeOfWork"
                  value={formData.typeOfWork}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 backdrop-blur-sm"
                >
                  <option value="">Select work type...</option>
                  {availableWorkTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Task Description */}
              <div>
                <label htmlFor="taskDescription" className="block text-sm font-semibold text-slate-200 mb-2">
                  Task Description
                </label>
                <textarea
                  id="taskDescription"
                  name="taskDescription"
                  value={formData.taskDescription}
                  onChange={handleChange}
                  placeholder="Describe the task in detail. Include specific hazards, equipment, conditions, and environmental factors..."
                  required
                  minLength="10"
                  rows="6"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 backdrop-blur-sm resize-none"
                />
                <p className="text-xs text-slate-400 mt-2">
                  Minimum 10 characters. AI will analyze this to identify potential hazards and safety risks.
                </p>
              </div>

              {/* Info Box */}
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                <p className="text-sm text-cyan-200">
                  <strong>💡 AI-Powered Analysis:</strong> Our AI will analyze your task description to identify potential hazards, suggest mitigation strategies, and provide safety recommendations.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => navigate('/jtsa')}
                  className="flex-1 px-6 py-3 rounded-xl border border-white/20 text-slate-200 font-semibold hover:bg-white/5 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:shadow-depth disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create JTSA'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
