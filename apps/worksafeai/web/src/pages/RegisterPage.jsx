import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const { register, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Industry will be selected in onboarding Step 1
    const success = await register(email, password, fullName, companyName, '');
    if (success) {
      navigate('/onboarding');
    }
  };

  const passwordRequirements = [
    { label: 'At least 12 characters', met: password.length >= 12 },
    { label: 'Uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'Lowercase letter (a-z)', met: /[a-z]/.test(password) },
    { label: 'Number (0-9)', met: /[0-9]/.test(password) },
    { label: 'Special character (!@#$%^&*)', met: /[!@#$%^&*]/.test(password) },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center overflow-hidden relative py-12 px-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl">
        {/* Logo & Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-6">
            <img 
              src="/worksafe_icon.jpg" 
              alt="WorkSafeAI" 
              className="w-16 h-16 rounded-2xl shadow-lg animate-pulse object-cover"
            />
          </div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Get Started with WorkSafeAI
            </span>
          </h1>
          <p className="text-slate-400 text-sm">Create your account and protect your workplace with AI intelligence</p>
        </div>

        {/* Registration Form */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Form */}
          <div className="relative rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl p-8">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-semibold text-slate-200 mb-2">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 backdrop-blur-sm"
                />
              </div>

              {/* Company Name */}
              <div>
                <label htmlFor="companyName" className="block text-sm font-semibold text-slate-200 mb-2">
                  Company Name
                </label>
                <input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Corp"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 backdrop-blur-sm"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-200 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 backdrop-blur-sm"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-200 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 backdrop-blur-sm"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 text-sm font-medium">
                  {error}
                </div>
              )}

              {/* Create Account Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3 px-4 font-semibold text-white transition-all duration-300 hover:shadow-depth disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-500 hover:to-cyan-400 mt-6"
              >
                <div className="flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </div>
              </button>

              {/* Sign In Link */}
              <div className="text-center">
                <p className="text-slate-400 text-sm">
                  Already have an account?{' '}
                  <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Password Requirements */}
          <div className="relative rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl p-8 hidden md:block">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                  Password Requirements
                </h3>
                <p className="text-slate-400 text-sm mb-6">Your password must include:</p>
              </div>

              <div className="space-y-3">
                {passwordRequirements.map((req, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                      req.met
                        ? 'bg-emerald-500/20 border border-emerald-500/30'
                        : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                        req.met ? 'bg-emerald-500 text-white' : 'bg-white/20 text-white/50'
                      }`}
                    >
                      {req.met ? <CheckCircle2 className="w-4 h-4" /> : '○'}
                    </div>
                    <span className={`text-sm font-medium ${req.met ? 'text-emerald-300' : 'text-slate-400'}`}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Features */}
              <div className="pt-6 border-t border-white/10">
                <h4 className="text-sm font-bold text-white mb-4">WorkSafeAI Features:</h4>
                <div className="space-y-2 text-sm text-slate-300">
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    AI-powered hazard intelligence
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    Automated risk assessment
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    Compliance & safety tracking
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    Workplace protection at scale
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-xs mt-8">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
