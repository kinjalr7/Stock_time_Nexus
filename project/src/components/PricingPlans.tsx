import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Crown, Shield, Users, Database, Globe, CreditCard, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

interface Plan {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
  color: string;
  maxUsers: number;
  maxData: string;
  support: string;
}

interface PricingPlansProps {
  onPlanSelect?: (plan: Plan) => void;
  className?: string;
}

const PricingPlans: React.FC<PricingPlansProps> = ({ onPlanSelect, className = '' }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const plans: Plan[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: billingCycle === 'monthly' ? 9 : 90,
      billingCycle,
      features: [
        'Basic AI Forecasting',
        'Basic AI Chatbot',
        '100 messages per month',
        'Basic Portfolio Tracking',
        'Standard response time'
      ],
      icon: <Zap className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600',
      maxUsers: 1,
      maxData: '1GB',
      support: 'Email'
    },
    {
      id: 'professional',
      name: 'Professional',
      price: billingCycle === 'monthly' ? 29 : 290,
      billingCycle,
      features: [
        'Advanced AI Chatbot',
        '1,000 messages per month',
        'All Forecasting Models',
        'Advanced analytics',
        'News Sentiment Analysis',
        'Auto Trading Simulation',
        'Faster response time',
        'Custom integrations',
        'Priority Support'
      ],
      popular: true,
      icon: <Star className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-600',
      maxUsers: 5,
      maxData: '10GB',
      support: 'Priority'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: billingCycle === 'monthly' ? 99 : 990,
      billingCycle,
      features: [
        'Premium AI Chatbot',
        'Unlimited messages',
        '24/7 phone support',
        'Everything in Professional',
        'Custom Model Training',
        'Instant response time',
        'API access',
        'White-label solution',
        'Dedicated account manager',
        'SLA guarantee'
      ],
      icon: <Crown className="w-6 h-6" />,
      color: 'from-orange-500 to-red-500',
      maxUsers: -1, // Unlimited
      maxData: 'Unlimited',
      support: '24/7 Phone'
    }
  ];

  const handlePlanSelect = async (plan: Plan) => {
    setSelectedPlan(plan.id);
    setIsProcessing(true);

    try {
      // Call the parent component's onPlanSelect callback
      if (onPlanSelect) {
        onPlanSelect(plan);
      }
    } catch (error) {
      toast.error('Failed to select plan. Please try again.');
      console.error('Plan selection error:', error);
    } finally {
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  };



  const getYearlySavings = (monthlyPrice: number) => {
    const yearlyPrice = monthlyPrice * 12;
    const discountedPrice = monthlyPrice * 10; // 2 months free
    return yearlyPrice - discountedPrice;
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${className}`}>
      {/* Header */}
      <div className="text-center mb-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-gray-900 mb-4"
        >
          Choose Your Plan
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-gray-600 max-w-2xl mx-auto"
        >
          Select the perfect plan for your needs. All plans include our advanced AI chatbot with different feature sets.
        </motion.p>
      </div>

      {/* Billing Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center mb-8"
      >
        <div className="bg-gray-100 rounded-xl p-1 flex items-center">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              billingCycle === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 relative ${
              billingCycle === 'yearly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Yearly
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              Save 17%
            </span>
          </button>
        </div>
      </motion.div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
              plan.popular
                ? 'border-purple-500 scale-105'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}

            <div className="p-8">
              {/* Plan Header */}
              <div className="text-center mb-6">
                <div className={`w-12 h-12 bg-gradient-to-r ${plan.color} rounded-xl flex items-center justify-center text-white mx-auto mb-4`}>
                  {plan.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                </div>
                {billingCycle === 'yearly' && (
                  <p className="text-sm text-green-600 font-medium">
                    Save ${getYearlySavings(plan.price / 10)} per year
                  </p>
                )}
              </div>

              {/* Plan Features */}
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Plan Limits */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {plan.maxUsers === -1 ? '∞' : plan.maxUsers}
                    </div>
                    <div className="text-gray-600">Users</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{plan.maxData}</div>
                    <div className="text-gray-600">Storage</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{plan.support}</div>
                    <div className="text-gray-600">Support</div>
                  </div>
                </div>
              </div>

              {/* Subscribe Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePlanSelect(plan)}
                disabled={isProcessing}
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isProcessing && selectedPlan === plan.id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                                 ) : (
                   <>
                     <CreditCard className="w-4 h-4" />
                     <span>Select Plan</span>
                   </>
                 )}
              </motion.button>

              {/* Security Note */}
              <div className="mt-4 text-center">
                <div className="flex items-center justify-center text-xs text-gray-500">
                  <Lock className="w-3 h-3 mr-1" />
                  <span>Secure payment powered by Stripe</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Additional Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-12 text-center"
      >
        <div className="bg-gray-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">What's Included in All Plans</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-green-500" />
              <div>
                <div className="font-semibold text-gray-900">SSL Security</div>
                <div className="text-sm text-gray-600">Bank-level encryption</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Database className="w-6 h-6 text-blue-500" />
              <div>
                <div className="font-semibold text-gray-900">Data Backup</div>
                <div className="text-sm text-gray-600">Daily automated backups</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Globe className="w-6 h-6 text-purple-500" />
              <div>
                <div className="font-semibold text-gray-900">99.9% Uptime</div>
                <div className="text-sm text-gray-600">Guaranteed availability</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PricingPlans;
