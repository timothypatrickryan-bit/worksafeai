import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import apiClient from '../api/client';
import { ArrowRight, ArrowLeft, CheckCircle2, Loader, AlertCircle } from 'lucide-react';

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

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29.99,
    description: 'Perfect for small teams',
    features: [
      '10 employees',
      '5 projects',
      'Basic safety training',
      'Email support',
      '7-day free trial',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 79.99,
    description: 'For growing companies',
    features: [
      '50 employees',
      'Unlimited projects',
      'Advanced analytics',
      'Priority support',
      '7-day free trial',
    ],
    highlighted: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations',
    features: [
      'Unlimited employees',
      'Unlimited projects',
      'Custom features',
      '24/7 phone support',
      '7-day free trial',
    ],
  },
];

export default function CompanyOnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
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
    selectedPlan: '',
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
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
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      // Complete the onboarding with the profile data
      await apiClient.post(`/companies/${user.companyId}/onboarding`, formData);
      
      // Note: Free trial is automatically created in backend during registration
      // Billing subscription creation is handled in production separately
      // For now, just skip directly to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.log('Full error:', err);
      console.log('Response data:', err.response?.data);
      
      let errorMsg = err.response?.data?.error || 'Failed to complete onboarding';
      setError(errorMsg);
      setSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.industry && formData.companySize && formData.yearsInBusiness && formData.primaryLocations;
      case 2:
        return formData.safetyProfile.certifications.length > 0 &&
               formData.safetyProfile.complianceRequirements.length > 0 &&
               formData.safetyProfile.incidentHistory;
      case 3:
        return formData.operationalContext.workTypes.length > 0 &&
               formData.operationalContext.typicalTeamSize;
      case 4:
        return formData.safetyPriorities.concerns.length > 0 &&
               formData.safetyPriorities.riskTolerance;
      case 5:
        return true; // Allow skipping in development
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-12 flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    s <= step
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white'
                      : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {s < step ? <CheckCircle2 className="w-5 h-5" /> : s}
                </div>
                {s < 5 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded ${
                      s < step ? 'bg-gradient-to-r from-blue-600 to-cyan-500' : 'bg-white/10'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-slate-400 text-sm">Step {step} of 5</p>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-2">
            {step === 1 && 'Company & Industry'}
            {step === 2 && 'Safety Profile'}
            {step === 3 && 'Operations'}
            {step === 4 && 'Safety Priorities'}
            {step === 5 && 'Select Your Plan'}
          </h1>
          <p className="text-slate-400 text-sm">
            {step === 1 && 'Select your industry and company details'}
            {step === 2 && 'Tell us about your safety certifications'}
            {step === 3 && 'Describe your operational context'}
            {step === 4 && 'What safety concerns matter most'}
            {step === 5 && 'Choose the perfect plan for your team'}
          </p>
        </div>

        {/* Form Card */}
        <div className="relative rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl p-8 mb-6">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Company Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">Industry/Trade</label>
                <select
                  value={formData.industry}
                  onChange={(e) => handleChange('industry', e.target.value)}
                  required
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
          )}

          {/* Step 2: Safety Profile */}
          {step === 2 && (
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
          )}

          {/* Step 3: Operations */}
          {step === 3 && (
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
          )}

          {/* Step 4: Safety Priorities */}
          {step === 4 && (
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
          )}

          {/* Step 5: Select Plan */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">Choose Your Plan</label>
                <p className="text-slate-400 text-sm mb-6">Start with a 7-day free trial. No credit card required to get started.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {PLANS.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => handleChange('selectedPlan', plan.id)}
                      className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all transform hover:scale-105 ${
                        formData.selectedPlan === plan.id
                          ? 'bg-cyan-500/20 border-cyan-500 shadow-lg shadow-cyan-500/20'
                          : 'bg-white/5 border-white/20 hover:border-white/40'
                      } ${plan.highlighted ? 'ring-2 ring-cyan-400/50 md:scale-105' : ''}`}
                    >
                      {plan.highlighted && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          MOST POPULAR
                        </div>
                      )}
                      
                      <div className="mb-6">
                        <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                        <p className="text-slate-400 text-sm">{plan.description}</p>
                      </div>

                      <div className="mb-6">
                        <div className="text-3xl font-bold text-cyan-300">
                          ${plan.price}
                          {typeof plan.price === 'number' && <span className="text-sm text-slate-400">/month</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-6 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-yellow-300 flex-shrink-0" />
                        <div className="text-xs text-yellow-200">
                          <p className="font-semibold">7-Day Free Trial</p>
                          <p>After trial ends, card will be charged ${typeof plan.price === 'number' ? plan.price : 'custom price'}/month</p>
                        </div>
                      </div>

                      <ul className="space-y-3">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-slate-300 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="flex-1 px-6 py-3 rounded-xl border border-white/20 text-slate-200 font-semibold hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {step < 5 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!isStepValid()}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:shadow-depth disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!isStepValid() || submitting}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold hover:shadow-depth disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Start Free Trial
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
