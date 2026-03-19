import { Check, Zap, Users, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

export default function PricingPage() {
  const { isAuthenticated } = useAuthStore();

  const tiers = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Perfect for small teams getting started',
      price: '$29.99',
      period: '/month',
      icon: Zap,
      features: [
        { text: 'Up to 10 employees', included: true },
        { text: 'Up to 5 projects', included: true },
        { text: '10 JTSAs per month', included: true },
        { text: 'Basic hazard assessment', included: true },
        { text: 'Community support', included: true },
        { text: 'Advanced analytics', included: false },
        { text: 'Custom integrations', included: false },
        { text: 'Dedicated support', included: false },
      ],
      cta: 'Get Started',
      highlighted: false,
    },
    {
      id: 'pro',
      name: 'Professional',
      description: 'For growing teams with advanced needs',
      price: '$79.99',
      period: '/month',
      icon: Users,
      features: [
        { text: 'Up to 50 employees', included: true },
        { text: 'Unlimited projects', included: true },
        { text: '500 JTSAs per month', included: true },
        { text: 'Advanced hazard assessment', included: true },
        { text: 'Priority email support', included: true },
        { text: 'Advanced analytics', included: true },
        { text: 'API access', included: true },
        { text: 'Dedicated support', included: false },
      ],
      cta: 'Start Free Trial',
      highlighted: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large organizations with custom needs',
      price: 'Custom',
      period: 'pricing',
      icon: Award,
      features: [
        { text: 'Unlimited employees', included: true },
        { text: 'Unlimited projects', included: true },
        { text: 'Unlimited JTSAs', included: true },
        { text: 'Advanced hazard assessment', included: true },
        { text: 'Dedicated account manager', included: true },
        { text: '24/7 phone & email support', included: true },
        { text: 'Custom integrations', included: true },
        { text: 'On-premise deployment option', included: true },
      ],
      cta: 'Contact Sales',
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Choose the perfect plan for your team. All plans include a 3-day free trial.
        </p>
        
        {!isAuthenticated && (
          <div className="flex gap-4 justify-center">
            <Link
              to="/login"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Create Account
            </Link>
          </div>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          return (
            <div
              key={tier.id}
              className={`rounded-lg overflow-hidden transition-all transform hover:scale-105 ${
                tier.highlighted
                  ? 'ring-2 ring-blue-500 shadow-2xl scale-105'
                  : 'bg-white shadow-lg'
              }`}
            >
              {/* Card Header */}
              <div className={`p-8 ${tier.highlighted ? 'bg-blue-600 text-white' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <Icon className={`w-6 h-6 ${tier.highlighted ? 'text-white' : 'text-blue-600'}`} />
                  <h3 className="text-2xl font-bold">{tier.name}</h3>
                </div>
                <p className={`text-sm mb-6 ${tier.highlighted ? 'text-blue-100' : 'text-gray-600'}`}>
                  {tier.description}
                </p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className={`text-sm ml-2 ${tier.highlighted ? 'text-blue-100' : 'text-gray-600'}`}>
                    {tier.period}
                  </span>
                </div>

                {/* CTA Button */}
                <button
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    tier.highlighted
                      ? 'bg-white text-blue-600 hover:bg-gray-100'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {tier.cta}
                </button>
              </div>

              {/* Features List */}
              <div className="p-8 bg-white">
                <ul className="space-y-4">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <div className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5">✕</div>
                      )}
                      <span className={feature.included ? 'text-gray-900' : 'text-gray-400'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto bg-gray-50 rounded-lg p-8 mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I change plans anytime?</h3>
            <p className="text-gray-700">
              Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate charges accordingly.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">What happens after my trial ends?</h3>
            <p className="text-gray-700">
              After your 3-day free trial, your plan will automatically start billing on a monthly basis. You can manage your subscription settings anytime.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Do you offer annual plans?</h3>
            <p className="text-gray-700">
              We currently offer monthly billing. For annual billing or custom arrangements, contact our sales team for Enterprise plans.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">What if I exceed my plan limits?</h3>
            <p className="text-gray-700">
              When you approach or reach your limits, we'll notify you. You can easily upgrade to the next tier to continue working without interruption.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Is there a long-term contract?</h3>
            <p className="text-gray-700">
              No contracts required! You can cancel anytime. Your subscription will remain active through the end of your current billing period.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">What about refunds?</h3>
            <p className="text-gray-700">
              If you cancel before your trial ends, no charges will be applied. For paid periods, contact our support team to discuss refund eligibility.
            </p>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="max-w-4xl mx-auto text-center bg-blue-600 rounded-lg p-12 text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-blue-100 mb-8 text-lg">
          Join hundreds of organizations using WorkSafeAI to streamline their JTSA process.
        </p>
        <div className="flex gap-4 justify-center">
          <button className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Start Free Trial
          </button>
          <a
            href="mailto:sales@worksafeai.com"
            className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:bg-opacity-10 transition-colors"
          >
            Contact Sales
          </a>
        </div>
      </div>

      {/* Footer Note */}
      <div className="max-w-4xl mx-auto text-center mt-12">
        <p className="text-gray-600 text-sm">
          All plans come with a 3-day free trial. No credit card required. Cancel anytime.
        </p>
      </div>
    </div>
  );
}
