import { useState, useEffect } from 'react';
import useAuthStore from '../stores/authStore';
import apiClient from '../api/client';
import Layout from '../components/Layout';
import { Save, AlertCircle, CheckCircle2, Loader } from 'lucide-react';

const WORK_TYPES_BY_INDUSTRY = {
  'General Contracting': ['Site Prep', 'Foundation', 'Framing', 'Interior', 'Management', 'Inspection'],
  'Electrical': ['Residential', 'Commercial', 'Industrial', 'High Voltage', 'Maintenance', 'Installation'],
  'Plumbing & HVAC': ['Installation', 'Design', 'Maintenance', 'Inspection', 'Repair', 'Emergency'],
  'Excavation & Demolition': ['Excavation', 'Demolition', 'Grading', 'Equipment Op', 'Material Removal'],
  'Heavy Equipment Operation': ['Crane', 'Excavator', 'Loader', 'Paver', 'Compactor', 'Inspection'],
  'Utility Services': ['Gas', 'Electric', 'Water', 'Sewer', 'Emergency', 'Maintenance'],
  'Concrete & Masonry': ['Pouring', 'Finishing', 'Brick/Block', 'Sealing', 'Repair', 'Patching'],
  'Roofing': ['Shingles', 'Metal', 'Membrane', 'Flashing', 'Inspection', 'Fall Protection'],
  'Steel Erection': ['Beams', 'Columns', 'Connections', 'Rigging', 'Safety', 'Welding'],
  'Pipeline & Underground Utilities': ['Installation', 'Trenching', 'Assembly', 'Testing', 'Protection'],
  'Telecommunications': ['Network Installation', 'Cable Splicing', 'Tower Maintenance', 'Fiber Optic', 'Equipment Testing', 'Infrastructure'],
  'Other': ['Custom', 'Mixed', 'Other'],
};

const CERTIFICATION_OPTIONS = ['OSHA', 'ISO 45001', 'ANSI', 'Other', 'None'];
const COMPLIANCE_OPTIONS = ['OSHA', 'EPA', 'DOT', 'State-specific', 'None'];
const SAFETY_CONCERNS = ['Electrical hazards', 'Fall protection', 'Chemical exposure', 'Equipment safety', 'Ergonomics', 'Heat/cold stress', 'Confined spaces', 'Noise'];
const ENVIRONMENTAL_CHALLENGES = ['High-altitude', 'Extreme temps', 'Confined spaces', 'Noise', 'Hazmat', 'Weather', 'Dust'];

export default function CompanyProfilePage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    industry: '',
    companySize: '',
    yearsInBusiness: '',
    primaryLocations: '',
    annualRevenue: '',
    safetyProfile: {
      certifications: [],
      complianceRequirements: [],
      incidentHistory: '',
      insuranceRequired: false,
    },
    operationalContext: {
      workTypes: [],
      environmentalChallenges: [],
      typicalTeamSize: '',
    },
    safetyPriorities: {
      concerns: [],
      riskTolerance: '',
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get(`/companies/${user.companyId}/profile`);
        const { profile, industry } = response.data;
        
        if (profile) {
          setFormData(profile);
        } else if (industry) {
          setFormData(prev => ({ ...prev, industry }));
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load company profile');
        setLoading(false);
      }
    };

    if (user?.companyId) {
      fetchProfile();
    }
  }, [user?.companyId]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setSuccess(null);
  };

  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setSuccess(null);
  };

  const handleCheckboxChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section][field].includes(value)
          ? prev[section][field].filter(v => v !== value)
          : [...prev[section][field], value]
      }
    }));
    setSuccess(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await apiClient.put(`/companies/${user.companyId}/profile`, formData);
      setSuccess('Company profile saved successfully!');
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to save company profile';
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-cyan-400" />
            <p className="text-slate-400">Loading company profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-2">
            Company Profile
          </h1>
          <p className="text-slate-400">Manage your company's safety profile and operational details</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/20 border border-green-500/30 text-green-200 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Section 1: Company & Industry */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Company & Industry</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">Industry/Trade</label>
                <select
                  value={formData.industry}
                  onChange={(e) => handleChange('industry', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 backdrop-blur-sm"
                >
                  <option value="">Select your industry...</option>
                  {Object.keys(WORK_TYPES_BY_INDUSTRY).map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">Company Size</label>
                <div className="grid grid-cols-2 gap-3">
                  {['1-10', '11-50', '51-200', '200+'].map((size) => (
                    <button
                      key={size}
                      onClick={() => handleChange('companySize', size)}
                      className={`p-3 rounded-lg border transition-all ${
                        formData.companySize === size
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                          : 'bg-white/5 border-white/20 text-slate-300 hover:border-white/30'
                      }`}
                    >
                      {size} employees
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">Years in Business</label>
                <div className="grid grid-cols-2 gap-3">
                  {['<1', '1-5', '5-10', '10+'].map((years) => (
                    <button
                      key={years}
                      onClick={() => handleChange('yearsInBusiness', years)}
                      className={`p-3 rounded-lg border transition-all ${
                        formData.yearsInBusiness === years
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                          : 'bg-white/5 border-white/20 text-slate-300 hover:border-white/30'
                      }`}
                    >
                      {years} years
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">Primary Locations</label>
                <div className="grid grid-cols-3 gap-3">
                  {['single', 'multi', 'mobile'].map((loc) => (
                    <button
                      key={loc}
                      onClick={() => handleChange('primaryLocations', loc)}
                      className={`p-3 rounded-lg border transition-all capitalize ${
                        formData.primaryLocations === loc
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                          : 'bg-white/5 border-white/20 text-slate-300 hover:border-white/30'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Safety Profile */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Safety Profile</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">Safety Certifications</label>
                <div className="flex flex-wrap gap-2">
                  {CERTIFICATION_OPTIONS.map((cert) => (
                    <button
                      key={cert}
                      onClick={() => handleCheckboxChange('safetyProfile', 'certifications', cert)}
                      className={`px-4 py-2 rounded-lg border transition-all text-sm ${
                        formData.safetyProfile.certifications.includes(cert)
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                          : 'bg-white/5 border-white/20 text-slate-300'
                      }`}
                    >
                      {cert}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">Compliance Requirements</label>
                <div className="flex flex-wrap gap-2">
                  {COMPLIANCE_OPTIONS.map((comp) => (
                    <button
                      key={comp}
                      onClick={() => handleCheckboxChange('safetyProfile', 'complianceRequirements', comp)}
                      className={`px-4 py-2 rounded-lg border transition-all text-sm ${
                        formData.safetyProfile.complianceRequirements.includes(comp)
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                          : 'bg-white/5 border-white/20 text-slate-300'
                      }`}
                    >
                      {comp}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">Safety Incident History</label>
                <select
                  value={formData.safetyProfile.incidentHistory}
                  onChange={(e) => handleNestedChange('safetyProfile', 'incidentHistory', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white"
                >
                  <option value="">Select...</option>
                  <option value="no-incidents">No incidents</option>
                  <option value="minor">Minor (0-3/year)</option>
                  <option value="moderate">Moderate (3-10/year)</option>
                  <option value="frequent">Frequent (10+/year)</option>
                </select>
              </div>

              <label className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/20 cursor-pointer hover:bg-white/10">
                <input
                  type="checkbox"
                  checked={formData.safetyProfile.insuranceRequired}
                  onChange={(e) => handleNestedChange('safetyProfile', 'insuranceRequired', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-slate-200">Insurance liability requirements</span>
              </label>
            </div>
          </div>

          {/* Section 3: Operations */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Operations</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">Work Types (select all that apply)</label>
                <div className="flex flex-wrap gap-2">
                  {(WORK_TYPES_BY_INDUSTRY[formData.industry] || []).map((type) => (
                    <button
                      key={type}
                      onClick={() => handleCheckboxChange('operationalContext', 'workTypes', type)}
                      className={`px-4 py-2 rounded-lg border transition-all text-sm ${
                        formData.operationalContext.workTypes.includes(type)
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                          : 'bg-white/5 border-white/20 text-slate-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">Environmental Challenges</label>
                <div className="flex flex-wrap gap-2">
                  {ENVIRONMENTAL_CHALLENGES.map((env) => (
                    <button
                      key={env}
                      onClick={() => handleCheckboxChange('operationalContext', 'environmentalChallenges', env)}
                      className={`px-4 py-2 rounded-lg border transition-all text-sm ${
                        formData.operationalContext.environmentalChallenges.includes(env)
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                          : 'bg-white/5 border-white/20 text-slate-300'
                      }`}
                    >
                      {env}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">Typical Team Size</label>
                <select
                  value={formData.operationalContext.typicalTeamSize}
                  onChange={(e) => handleNestedChange('operationalContext', 'typicalTeamSize', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white"
                >
                  <option value="">Select...</option>
                  <option value="solo">Solo</option>
                  <option value="2-5">2-5 people</option>
                  <option value="5-20">5-20 people</option>
                  <option value="20+">20+ people</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Safety Priorities */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Safety Priorities</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">Top Safety Concerns</label>
                <div className="flex flex-wrap gap-2">
                  {SAFETY_CONCERNS.map((concern) => (
                    <button
                      key={concern}
                      onClick={() => handleCheckboxChange('safetyPriorities', 'concerns', concern)}
                      className={`px-4 py-2 rounded-lg border transition-all text-sm ${
                        formData.safetyPriorities.concerns.includes(concern)
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                          : 'bg-white/5 border-white/20 text-slate-300'
                      }`}
                    >
                      {concern}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">Risk Tolerance</label>
                <div className="grid grid-cols-3 gap-3">
                  {['conservative', 'moderate', 'aggressive'].map((tolerance) => (
                    <button
                      key={tolerance}
                      onClick={() => handleNestedChange('safetyPriorities', 'riskTolerance', tolerance)}
                      className={`p-3 rounded-lg border transition-all capitalize ${
                        formData.safetyPriorities.riskTolerance === tolerance
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                          : 'bg-white/5 border-white/20 text-slate-300 hover:border-white/30'
                      }`}
                    >
                      {tolerance}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:shadow-depth disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </Layout>
  );
}
