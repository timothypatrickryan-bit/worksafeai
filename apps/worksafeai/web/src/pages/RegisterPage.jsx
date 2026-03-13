import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { setTokens } = useAuthStore();
  const navigate = useNavigate();

  const passwordRequirements = [
    { label: 'At least 12 characters', met: password.length >= 12 },
    { label: 'Uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'Lowercase letter (a-z)', met: /[a-z]/.test(password) },
    { label: 'Number (0-9)', met: /[0-9]/.test(password) },
    { label: 'Special character (!@#$%^&*)', met: /[!@#$%^&*]/.test(password) },
  ];

  const allRequirementsMet = passwordRequirements.every(r => r.met);
  const canSubmit = email && password && fullName && companyName && allRequirementsMet;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          fullName,
          companyName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show friendly message if available (e.g., "Company already exists")
        setError(data.message || data.error || 'Registration failed');
        return;
      }

      // CRITICAL: Don't auto-login - user must verify email first
      if (data.requiresEmailVerification) {
        setSuccess(true);
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
        return;
      }

      // If email verification is skipped (dev mode), auto-login
      if (data.accessToken && data.user) {
        setTokens(data.accessToken, data.refreshToken, data.user);
        navigate('/onboarding');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center overflow-hidden relative py-12 px-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-6">
            <img 
              src="/worksafe_icon.jpg" 
              alt="WorkSafeAI" 
              className="w-16 h-16 rounded-2xl shadow-lg object-cover"
            />
          </div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Get Started with WorkSafeAI
            </span>
          </h1>
          <p className="text-slate-400 text-sm">Create your account in 30 seconds</p>
        </div>

        {/* Form & Requirements */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Registration Form */}
          <div className="rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl p-8">
            {success ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
                <p className="text-slate-300 mb-4">We've sent a verification link to <strong>{email}</strong></p>
                <p className="text-sm text-slate-400">Redirecting to login...</p>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/20 border border-red-500/30">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-green-500/20 border border-green-500/30">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-200">Registration successful! Check your email to verify your account.</p>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Corp"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!canSubmit || loading}
                className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                  canSubmit && !loading
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-400 hover:shadow-lg hover:shadow-cyan-500/30 text-white'
                    : 'bg-slate-600 text-slate-300 cursor-not-allowed'
                }`}
              >
                {loading ? 'Creating Account...' : <>Create Account<ArrowRight className="w-4 h-4" /></>}
              </button>

              {/* Sign In Link */}
              <p className="text-center text-sm text-slate-400">
                Already have an account? <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold">Sign in</Link>
              </p>
            </form>
            )}
          </div>

          {/* Password Requirements */}
          <div className="rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle2 className="w-6 h-6 text-cyan-400" />
              <h3 className="text-lg font-semibold text-white">Password Requirements</h3>
            </div>

            <p className="text-sm text-slate-300 mb-4">Your password must include:</p>

            <div className="space-y-3">
              {passwordRequirements.map((req, idx) => (
                <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  req.met 
                    ? 'bg-green-500/20 border border-green-500/30' 
                    : 'bg-slate-500/20 border border-slate-500/30'
                }`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                    req.met ? 'bg-green-500/40' : 'bg-slate-500/40'
                  }`}>
                    {req.met && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                  </div>
                  <span className={req.met ? 'text-green-300' : 'text-slate-400'}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Features */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <h4 className="text-sm font-semibold text-white mb-4">WorkSafeAI Features:</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                  AI-powered hazard intelligence
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                  Automated risk assessment
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                  Compliance & safety tracking
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                  Workplace protection at scale
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-8">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
