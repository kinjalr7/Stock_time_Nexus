import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Shield, 
  CheckCircle, 
  Star, 
  Zap, 
  Crown, 
  Users, 
  Database, 
  MessageCircle,
  ArrowRight,
  Lock,
  Globe,
  Clock,
  Headphones
} from 'lucide-react';
import toast from 'react-hot-toast';
import PricingPlans from '../components/PricingPlans';
import PaymentProcessor from '../components/PaymentProcessor';
import SubscriptionManager from '../components/SubscriptionManager';

const Pricing: React.FC = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showSubscriptionManager, setShowSubscriptionManager] = useState(false);

  const handlePlanSelect = (plan: any) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (paymentId: string) => {
    setShowPaymentModal(false);
    setShowSubscriptionManager(true);
    toast.success(`Successfully subscribed to ${selectedPlan?.name} plan!`, {
      icon: '🎉',
      duration: 4000
    });
  };

  const handlePaymentError = (error: string) => {
    setShowPaymentModal(false);
    toast.error(`Payment failed: ${error}`);
  };

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Bank-Level Security',
      description: 'SSL encryption and PCI DSS compliance'
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: '99.9% Uptime',
      description: 'Guaranteed availability with SLA'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: '24/7 Support',
      description: 'Round-the-clock customer support'
    },
    {
      icon: <Headphones className="w-6 h-6" />,
      title: 'Priority Support',
      description: 'Faster response times for paid plans'
    }
  ];

  const faqs = [
    {
      question: 'Can I change my plan anytime?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately for upgrades and at the end of your billing cycle for downgrades.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover) and debit cards. All payments are processed securely through Stripe.'
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes, we offer a 14-day free trial for all paid plans. No credit card required to start your trial.'
    },
    {
      question: 'Can I cancel my subscription?',
      answer: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access to your plan features until the end of your current billing period.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 30-day money-back guarantee. If you\'re not satisfied with our service, contact our support team for a full refund.'
    },
    {
      question: 'What happens if I exceed my plan limits?',
      answer: 'You\'ll receive a notification when you approach your limits. You can either upgrade your plan or wait until your next billing cycle when limits reset.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/20 text-gray-900 dark:text-white transition-colors pt-16">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center space-x-2 mb-6">
              <CreditCard className="w-8 h-8 text-purple-600" />
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Pricing Plans
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Choose the perfect plan for your business. All plans include our advanced AI chatbot with different feature sets and usage limits.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>14-day free trial</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <Lock className="w-4 h-4" />
                <span>Secure payments</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4" />
                <span>30-day guarantee</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Pricing Plans */}
      <PricingPlans onPlanSelect={handlePlanSelect} />

      {/* Features Section */}
      <div className="py-20 bg-white dark:bg-slate-800 transition-colors border-t border-b border-gray-100 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We provide enterprise-grade features with simple, transparent pricing.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="py-20 bg-gray-50 dark:bg-slate-900/50 transition-colors border-b border-gray-100 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Plan Comparison
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Compare features across all our plans to find the perfect fit for your needs.
            </p>
          </motion.div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-slate-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Features</th>
                    <th className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Zap className="w-5 h-5 text-blue-500" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Starter</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Star className="w-5 h-5 text-purple-500" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Professional</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Crown className="w-5 h-5 text-orange-500" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Enterprise</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-200">Monthly Messages</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">100</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">1,000</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-200">User Accounts</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">1</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">5</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-200">Storage</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">1GB</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">10GB</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-200">Support</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">Email</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">Priority</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">24/7 Phone</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-200">API Access</td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-red-500">✕</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-green-500">✓</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-green-500">✓</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-200">Custom Integrations</td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-red-500">✕</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-green-500">✓</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-green-500">✓</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-200">White-label Solution</td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-red-500">✕</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-red-500">✕</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-green-500">✓</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20 bg-white dark:bg-slate-800 transition-colors border-b border-gray-100 dark:border-slate-700/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Everything you need to know about our pricing and plans.
            </p>
          </motion.div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 dark:bg-slate-700/40 rounded-xl p-6 border border-gray-100 dark:border-slate-700"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Join thousands of businesses using our AI chatbot platform.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center space-x-2 bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span>Choose Your Plan</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <PaymentProcessor
            amount={selectedPlan.price}
            planName={selectedPlan.name}
            billingCycle={selectedPlan.billingCycle}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onCancel={() => setShowPaymentModal(false)}
          />
        </div>
      )}

      {/* Subscription Manager Modal */}
      {showSubscriptionManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-700">
            <SubscriptionManager />
            <div className="p-6 border-t border-gray-200 dark:border-slate-700">
              <button
                onClick={() => setShowSubscriptionManager(false)}
                className="w-full px-6 py-3 bg-gray-900 dark:bg-slate-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-slate-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pricing;
