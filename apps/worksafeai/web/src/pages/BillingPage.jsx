import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import apiClient from '../api/client';
import useAuthStore from '../stores/authStore';
import { Check, AlertCircle, Loader } from 'lucide-react';

export default function BillingPage() {
  const { user } = useAuthStore();
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    const fetchBillingStatus = async () => {
      try {
        const response = await apiClient.get('/billing/status');
        setBilling(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBillingStatus();
  }, []);

  const handleUpgradeTier = async (tier) => {
    setUpgrading(true);
    try {
      const response = await apiClient.post('/billing/change-tier', { tier });
      setBilling((prev) => ({ ...prev, current_tier: tier }));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upgrade tier');
    } finally {
      setUpgrading(false);
    }
  };

  const handleSubscribe = async (tier) => {
    setUpgrading(true);
    try {
      const response = await apiClient.post('/billing/subscribe', { tier });
      setBilling((prev) => ({ ...prev, current_tier: tier, status: 'trialing' }));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to subscribe');
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) return <Layout><div className="text-center py-8">Loading billing info...</div></Layout>;

  const tiers = [
    {
      name: 'Starter',
      id: 'starter',
      price: '$29.99',
      period: '/month',
      features: [
        '10 employees',
        '5 projects',
        'Basic JTSA workflow',
        'Email support',
      ],
      color: 'border-blue-500',
    },
    {
      name: 'Professional',
      id: 'pro',
      price: '$79.99',
      period: '/month',
      features: [
        '50 employees',
        'Unlimited projects',
        'Full JTSA workflow',
        'AI hazard analysis',
        'Audit logging',
        'Priority support',
      ],
      color: 'border-green-500',
    },
    {
      name: 'Enterprise',
      id: 'enterprise',
      price: 'Custom',
      period: 'pricing',
      features: [
        'Unlimited employees',
        'Unlimited projects',
        'Custom integrations',
        'Dedicated support',
        'SLA guarantee',
      ],
      color: 'border-purple-500',
    },
  ];

  return (
    <Layout>
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Billing & Subscription</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Current Plan */}
        {billing && (
          <div className="card mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Current Plan</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-gray-600 text-sm">Current Tier</p>
                <p className="text-2xl font-bold text-blue-600 capitalize">{billing.current_tier}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Status</p>
                <p className="text-2xl font-bold text-green-600 capitalize">{billing.status}</p>
              </div>
              {billing.billing_period_end && (
                <div>
                  <p className="text-gray-600 text-sm">Billing Cycle Ends</p>
                  <p className="text-lg font-semibold text-gray-900">{billing.billing_period_end}</p>
                </div>
              )}
            </div>

            {/* Tier Limits */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-3">Your Limits</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">
                    {billing.tier_limits?.max_employees === -1
                      ? 'Unlimited'
                      : billing.tier_limits?.max_employees}{' '}
                    employees
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">
                    {billing.tier_limits?.max_projects === -1
                      ? 'Unlimited'
                      : billing.tier_limits?.max_projects}{' '}
                    projects
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Plans */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Upgrade Your Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className={`border-2 rounded-lg p-6 ${
                  billing?.current_tier === tier.id
                    ? `${tier.color} bg-blue-50`
                    : 'border-gray-200 bg-white'
                } transition-all hover:shadow-lg`}
              >
                {billing?.current_tier === tier.id && (
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-green-600 text-white text-sm font-semibold rounded-full">
                      Current Plan
                    </span>
                  </div>
                )}

                <h4 className="text-xl font-bold text-gray-900">{tier.name}</h4>
                <div className="mt-2 mb-4">
                  <span className="text-3xl font-bold text-gray-900">{tier.price}</span>
                  <span className="text-gray-600 text-sm ml-2">{tier.period}</span>
                </div>

                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-700">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {billing?.current_tier !== tier.id && (
                  <button
                    onClick={() =>
                      billing?.status === 'trial' || billing?.status === 'trialing'
                        ? handleSubscribe(tier.id)
                        : handleUpgradeTier(tier.id)
                    }
                    disabled={upgrading}
                    className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                      tier.id === 'enterprise'
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    } disabled:opacity-50`}
                  >
                    {upgrading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        Processing...
                      </span>
                    ) : billing?.status === 'trial' || billing?.status === 'trialing' ? (
                      'Subscribe'
                    ) : (
                      'Upgrade'
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Payment Info */}
        <div className="card bg-blue-50 border border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Payment Information</h3>
          <p className="text-gray-700 text-sm mb-4">
            We securely process payments through Stripe. Your payment information is never stored on our servers.
          </p>
          <p className="text-gray-600 text-sm">
            For billing questions or to view invoices, please contact{' '}
            <a href="mailto:billing@jtsa.com" className="text-blue-600 hover:text-blue-700 font-medium">
              billing@jtsa.com
            </a>
          </p>
        </div>
      </div>
    </Layout>
  );
}
