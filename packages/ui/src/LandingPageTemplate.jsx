/**
 * @elevationai/ui - LandingPageTemplate
 * 
 * Fully parameterized SaaS landing page template.
 * Extracted from WorkSafeAI's LandingPage.jsx.
 * 
 * @example
 * <LandingPageTemplate
 *   appName="MyApp"
 *   appIcon="/icon.jpg"
 *   tagline="Tagline goes here"
 *   heroTitle="AI-Powered Solutions"
 *   heroDescription="Description of what the app does."
 *   stats={[
 *     { value: '50%', label: 'Improvement' },
 *     { value: '5 min', label: 'Setup' },
 *     { value: '24/7', label: 'Support' },
 *   ]}
 *   features={[
 *     { icon: Brain, title: 'Feature 1', description: 'Description' },
 *   ]}
 *   benefits={[
 *     { icon: TrendingUp, title: 'Benefit 1', description: 'Description' },
 *   ]}
 *   steps={[
 *     { title: 'Step 1', description: 'Do this' },
 *   ]}
 *   pricing={[
 *     { name: 'Starter', price: '$29', features: ['Feature 1'], popular: false },
 *   ]}
 *   ctaTitle="Ready to get started?"
 *   ctaDescription="Start your free trial today."
 *   onLogin={() => navigate('/login')}
 *   onRegister={() => navigate('/register')}
 *   footerLinks={{ product: [], company: [], legal: [] }}
 * />
 */

import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LandingPageTemplate({
  appName = 'App',
  appIcon = null,
  tagline = '',
  heroBadge = null,
  heroTitle = 'Welcome',
  heroDescription = '',
  stats = [],
  features = [],
  benefits = [],
  steps = [],
  pricing = [],
  ctaTitle = 'Ready to get started?',
  ctaDescription = '',
  onLogin,
  onRegister,
  footerLinks = {},
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex justify-between items-center px-6 md:px-12 py-6">
        <div className="flex items-center gap-3">
          {appIcon && <img src={appIcon} alt={appName} className="w-8 h-8 rounded" />}
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            {appName}
          </span>
        </div>
        <div className="flex gap-4">
          <button onClick={onLogin} className="px-6 py-2 text-slate-200 hover:text-white transition-colors">
            Sign In
          </button>
          <button onClick={onRegister} className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-20 md:py-32 text-center">
        {heroBadge && (
          <div className="mb-6 inline-block">
            <div className="px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-sm font-semibold">
              {heroBadge}
            </div>
          </div>
        )}

        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
            {heroTitle}
          </span>
        </h1>

        <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          {heroDescription}
        </p>

        <div className="flex gap-4 justify-center mb-12 flex-wrap">
          <button onClick={onRegister} className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2">
            Start Free Trial <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Stats */}
        {stats.length > 0 && (
          <div className={`grid grid-cols-${stats.length} gap-6 max-w-xl mx-auto`}>
            {stats.map((stat, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-2xl font-bold text-cyan-300">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Features Section */}
      {features.length > 0 && (
        <section className="relative z-10 py-20 md:py-32 border-t border-white/5">
          <div className="max-w-6xl mx-auto px-6 md:px-12">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  Powerful Features
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div key={idx} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 hover:bg-white/10 transition-all group">
                    {Icon && (
                      <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-all">
                        <Icon className="w-6 h-6 text-blue-400" />
                      </div>
                    )}
                    <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-slate-400">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      {steps.length > 0 && (
        <section className="relative z-10 py-20 md:py-32 border-t border-white/5">
          <div className="max-w-6xl mx-auto px-6 md:px-12">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  How It Works
                </span>
              </h2>
            </div>
            <div className={`grid grid-cols-1 md:grid-cols-${steps.length} gap-6`}>
              {steps.map((step, idx) => (
                <div key={idx} className="relative">
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 h-full">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-lg mb-4">
                      {idx + 1}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-slate-400">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing */}
      {pricing.length > 0 && (
        <section className="relative z-10 py-20 md:py-32 border-t border-white/5">
          <div className="max-w-6xl mx-auto px-6 md:px-12">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  Simple, Transparent Pricing
                </span>
              </h2>
            </div>
            <div className={`grid grid-cols-1 md:grid-cols-${pricing.length} gap-6`}>
              {pricing.map((plan, idx) => (
                <div key={idx} className={`rounded-2xl border p-8 transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/50 ring-2 ring-cyan-400/30 scale-105'
                    : 'bg-white/5 border-white/10 hover:border-cyan-500/30'
                }`}>
                  {plan.popular && (
                    <div className="inline-block px-3 py-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold rounded-full mb-4">
                      MOST POPULAR
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  {plan.description && <p className="text-slate-400 text-sm mb-4">{plan.description}</p>}
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
                  <button onClick={onRegister} className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  }`}>
                    Get Started
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative z-10 py-20 md:py-32 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">{ctaTitle}</h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">{ctaDescription}</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button onClick={onRegister} className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2">
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                {appIcon && <img src={appIcon} alt={appName} className="w-6 h-6 rounded" />}
                <span className="font-bold text-white">{appName}</span>
              </div>
              {tagline && <p className="text-slate-400 text-sm">{tagline}</p>}
            </div>
            {Object.entries(footerLinks).map(([section, links]) => (
              <div key={section}>
                <h4 className="font-semibold text-white mb-4 capitalize">{section}</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                  {links.map((link, i) => (
                    <li key={i}>
                      <a href={link.href} className="hover:text-cyan-400 transition-colors">{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; {new Date().getFullYear()} {appName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
