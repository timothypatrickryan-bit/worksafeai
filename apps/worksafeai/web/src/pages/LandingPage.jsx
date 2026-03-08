import { useNavigate } from 'react-router-dom';
import { 
  Brain, Users, TrendingUp, CheckCircle2, ArrowRight, 
  Zap, Lock, BarChart3, Clock, AlertTriangle, Lightbulb,
  Target, Award, Heart
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex justify-between items-center px-6 md:px-12 py-6">
        <div className="flex items-center gap-3">
          <img src="/worksafe_icon.jpg" alt="WorkSafeAI" className="w-8 h-8 rounded" />
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            WorkSafeAI
          </span>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 text-slate-200 hover:text-white transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-20 md:py-32 text-center">
        <div className="mb-6 inline-block">
          <div className="px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-sm font-semibold">
            🚀 Powered by AI • OSHA Compliant • Real-Time Hazard Detection
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
            Intelligence That Protects
          </span>
        </h1>

        <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          WorkSafeAI combines advanced AI with job task safety analysis to protect your workforce. 
          Identify hazards, plan mitigations, and ensure compliance—all in minutes.
        </p>

        <div className="flex gap-4 justify-center mb-12 flex-wrap">
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2"
          >
            Start Free Trial <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Hero stats */}
        <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto mb-16">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-2xl font-bold text-cyan-300">50%</div>
            <div className="text-sm text-slate-400">Risk Reduction</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-2xl font-bold text-cyan-300">5 min</div>
            <div className="text-sm text-slate-400">Setup Time</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-2xl font-bold text-cyan-300">24/7</div>
            <div className="text-sm text-slate-400">AI Support</div>
          </div>
        </div>

        {/* Hero visual - Dashboard screenshot */}
        <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900">
            {/* Dashboard mockup */}
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="space-y-3 flex-1">
                <div className="h-2 bg-white/10 rounded w-32"></div>
                <div className="h-2 bg-white/10 rounded w-48"></div>
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                    <div className="h-2 bg-white/10 rounded mb-2 w-20"></div>
                    <div className="h-3 bg-cyan-400/50 rounded"></div>
                  </div>
                  <div className="p-4 bg-cyan-500/20 rounded-lg border border-cyan-500/30">
                    <div className="h-2 bg-white/10 rounded mb-2 w-16"></div>
                    <div className="h-3 bg-emerald-400/50 rounded"></div>
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  <div className="h-2 bg-white/10 rounded w-full"></div>
                  <div className="h-2 bg-white/10 rounded w-5/6"></div>
                  <div className="h-2 bg-white/10 rounded w-4/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 md:py-32 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Everything you need to protect your workforce and stay compliant
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 hover:bg-white/10 transition-all group">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-all">
                <Brain className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AI-Powered Analysis</h3>
              <p className="text-slate-400">
                GPT-4 analyzes job tasks and automatically identifies potential hazards with 95% accuracy
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 hover:bg-white/10 transition-all group">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-4 group-hover:bg-cyan-500/30 transition-all">
                <AlertTriangle className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Instant Hazard Detection</h3>
              <p className="text-slate-400">
                Real-time identification of safety risks before work begins, with mitigation suggestions
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 hover:bg-white/10 transition-all group">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-4 group-hover:bg-emerald-500/30 transition-all">
                <Award className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">OSHA Compliant</h3>
              <p className="text-slate-400">
                Automatic 5-year retention, audit trails, and compliance documentation built-in
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 hover:bg-white/10 transition-all group">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-all">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Team Collaboration</h3>
              <p className="text-slate-400">
                Invite team members, assign tasks, and track daily safety briefings in real-time
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 hover:bg-white/10 transition-all group">
              <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center mb-4 group-hover:bg-orange-500/30 transition-all">
                <BarChart3 className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Advanced Analytics</h3>
              <p className="text-slate-400">
                Dashboards track safety trends, incident patterns, and compliance metrics over time
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 hover:bg-white/10 transition-all group">
              <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center mb-4 group-hover:bg-pink-500/30 transition-all">
                <Zap className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">PDF Export & Sharing</h3>
              <p className="text-slate-400">
                Generate professional JTSA reports, share with teams, and archive for compliance audits
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative z-10 py-20 md:py-32 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - benefits list */}
            <div>
              <h2 className="text-4xl font-bold mb-8">
                <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  Why Choose WorkSafeAI
                </span>
              </h2>

              <div className="space-y-6">
                {[
                  { icon: TrendingUp, title: 'Reduce Incidents', desc: '50% fewer workplace injuries with proactive hazard detection' },
                  { icon: Clock, title: 'Save Time', desc: 'Complete JTSAs in minutes instead of hours' },
                  { icon: Lock, title: 'Stay Compliant', desc: 'Automatic OSHA documentation and 5-year retention' },
                  { icon: Lightbulb, title: 'Make Better Decisions', desc: 'AI-powered insights guide safety planning' },
                  { icon: Heart, title: 'Protect Your Team', desc: 'Peace of mind knowing hazards are identified upfront' },
                  { icon: Target, title: 'Scale Safely', desc: 'Same rigor whether you manage 10 or 1,000 employees' },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-cyan-500/20">
                        <item.icon className="w-6 h-6 text-cyan-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                      <p className="text-slate-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - visual - Dashboard mockup */}
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden p-4">
                {/* Dashboard mockup */}
                <div className="w-full h-full bg-gradient-to-b from-slate-700 to-slate-800 rounded-xl p-4 space-y-4">
                  <div className="h-3 bg-gradient-to-r from-blue-500/40 to-cyan-500/40 rounded w-1/3"></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                      <div className="h-1 bg-white/10 rounded mb-2"></div>
                      <div className="h-3 bg-blue-400/50 rounded"></div>
                    </div>
                    <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
                      <div className="h-1 bg-white/10 rounded mb-2"></div>
                      <div className="h-3 bg-emerald-400/50 rounded"></div>
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="h-2 bg-white/10 rounded"></div>
                    <div className="h-2 bg-white/10 rounded w-5/6"></div>
                    <div className="h-2 bg-white/10 rounded w-4/6"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 py-20 md:py-32 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
            <p className="text-slate-400 text-lg">Get up and running in 4 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { num: 1, title: 'Create Task', desc: 'Describe the job or task your team will perform' },
              { num: 2, title: 'AI Analysis', desc: 'AI identifies potential hazards and risks' },
              { num: 3, title: 'Review & Plan', desc: 'Team reviews hazards and plans mitigations' },
              { num: 4, title: 'Execute Safely', desc: 'Share brief with team and proceed with confidence' },
            ].map((step, idx) => (
              <div key={idx} className="relative">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 h-full">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-lg mb-4">
                    {step.num}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-slate-400">{step.desc}</p>
                </div>
                {idx < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-blue-600 to-transparent"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative z-10 py-20 md:py-32 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Simple, Transparent Pricing
              </span>
            </h2>
            <p className="text-slate-400 text-lg">Start free, upgrade when you need more</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Starter',
                price: '$29.99',
                desc: 'Perfect for small teams',
                features: ['10 employees', '5 projects', 'Basic analytics', 'Email support', '7-day free trial'],
              },
              {
                name: 'Pro',
                price: '$79.99',
                desc: 'For growing companies',
                features: ['50 employees', 'Unlimited projects', 'Advanced analytics', 'Priority support', '7-day free trial'],
                popular: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                desc: 'For large organizations',
                features: ['Unlimited everything', 'Custom integrations', '24/7 phone support', 'On-site training', '7-day free trial'],
              },
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`rounded-2xl border p-8 transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/50 ring-2 ring-cyan-400/30 scale-105'
                    : 'bg-white/5 border-white/10 hover:border-cyan-500/30'
                }`}
              >
                {plan.popular && (
                  <div className="inline-block px-3 py-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold rounded-full mb-4">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-slate-400 text-sm mb-4">{plan.desc}</p>
                <div className="text-4xl font-bold text-cyan-300 mb-6">
                  {plan.price}
                  {plan.price !== 'Custom' && <span className="text-lg text-slate-400">/mo</span>}
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/register')}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-500/30'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  }`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 md:py-32 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Protect Your Team?
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Start your 7-day free trial today. No credit card required. 
            Join hundreds of companies building a safer workplace.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2"
            >
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </button>
            <button
              className="px-8 py-4 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/5 transition-all"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/worksafe_icon.jpg" alt="WorkSafeAI" className="w-6 h-6 rounded" />
                <span className="font-bold text-white">WorkSafeAI</span>
              </div>
              <p className="text-slate-400 text-sm">Protecting workers with AI-powered safety intelligence.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; 2026 WorkSafeAI. All rights reserved. Protecting workers, powered by intelligence.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
