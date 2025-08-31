import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Calendar, 
  Download, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Users,
  Database,
  Zap,
  Crown,
  Star,
  ArrowRight,
  RefreshCw,
  Edit,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Subscription {
  id: string;
  planId: string;
  planName: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  amount: number;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: Date;
  features: string[];
  limits: {
    users: number;
    storage: string;
    messages: number;
  };
}

interface Invoice {
  id: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  date: Date;
  description: string;
  pdfUrl?: string;
}

interface SubscriptionManagerProps {
  className?: string;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ className = '' }) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock subscription data
      const mockSubscription: Subscription = {
        id: 'sub_123456789',
        planId: 'pro_monthly',
        planName: 'Professional',
        status: 'active',
        currentPeriodStart: new Date('2024-01-01'),
        currentPeriodEnd: new Date('2024-02-01'),
        amount: 29,
        billingCycle: 'monthly',
        nextBillingDate: new Date('2024-02-01'),
        features: [
          'Advanced AI Chatbot',
          '1,000 messages per month',
          'Priority support',
          'Advanced analytics',
          'Up to 5 user accounts',
          'Faster response time',
          'Custom integrations',
          'API access'
        ],
        limits: {
          users: 5,
          storage: '10GB',
          messages: 1000
        }
      };

      const mockInvoices: Invoice[] = [
        {
          id: 'inv_001',
          amount: 29,
          status: 'paid',
          date: new Date('2024-01-01'),
          description: 'Professional Plan - January 2024',
          pdfUrl: '#'
        },
        {
          id: 'inv_002',
          amount: 29,
          status: 'paid',
          date: new Date('2023-12-01'),
          description: 'Professional Plan - December 2023',
          pdfUrl: '#'
        },
        {
          id: 'inv_003',
          amount: 29,
          status: 'paid',
          date: new Date('2023-11-01'),
          description: 'Professional Plan - November 2023',
          pdfUrl: '#'
        }
      ];

      setSubscription(mockSubscription);
      setInvoices(mockInvoices);
    } catch (error) {
      toast.error('Failed to load subscription data');
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'starter': return <Zap className="w-6 h-6" />;
      case 'professional': return <Star className="w-6 h-6" />;
      case 'enterprise': return <Crown className="w-6 h-6" />;
      default: return <Star className="w-6 h-6" />;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'starter': return 'from-blue-500 to-blue-600';
      case 'professional': return 'from-purple-500 to-purple-600';
      case 'enterprise': return 'from-orange-500 to-red-500';
      default: return 'from-purple-500 to-purple-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'canceled': return 'text-red-600 bg-red-100';
      case 'past_due': return 'text-yellow-600 bg-yellow-100';
      case 'trialing': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleCancelSubscription = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (subscription) {
        setSubscription({
          ...subscription,
          status: 'canceled' as const
        });
        toast.success('Subscription canceled successfully');
        setShowCancelModal(false);
      }
    } catch (error) {
      toast.error('Failed to cancel subscription');
    }
  };

  const handleUpgradePlan = async (newPlan: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`Successfully upgraded to ${newPlan} plan!`);
      setShowUpgradeModal(false);
    } catch (error) {
      toast.error('Failed to upgrade plan');
    }
  };

  const downloadInvoice = async (invoiceId: string) => {
    toast.success('Invoice download started');
    // Here you would trigger the actual PDF download
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-purple-600" />
          <span className="text-gray-600">Loading subscription details...</span>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Subscription</h3>
        <p className="text-gray-600 mb-4">You don't have an active subscription plan.</p>
        <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
          Choose a Plan
        </button>
      </div>
    );
  }

  return (
    <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Management</h1>
        <p className="text-gray-600">Manage your subscription, billing, and plan settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Plan */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
          >
            <div className={`bg-gradient-to-r ${getPlanColor(subscription.planName)} text-white p-6`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getPlanIcon(subscription.planName)}
                  <div>
                    <h2 className="text-2xl font-bold">{subscription.planName} Plan</h2>
                    <p className="text-purple-100">Active Subscription</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">${subscription.amount}</div>
                  <div className="text-purple-100">
                    per {subscription.billingCycle === 'monthly' ? 'month' : 'year'}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Status */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    Upgrade Plan
                  </button>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* Billing Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-gray-900">Next Billing</span>
                  </div>
                  <p className="text-gray-600">
                    {subscription.nextBillingDate.toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-gray-900">Amount</span>
                  </div>
                  <p className="text-gray-600">
                    ${subscription.amount} / {subscription.billingCycle}
                  </p>
                </div>
              </div>

              {/* Plan Limits */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Limits</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-900">
                      {subscription.limits.users === -1 ? '∞' : subscription.limits.users}
                    </div>
                    <div className="text-sm text-blue-700">Users</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Database className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-900">
                      {subscription.limits.storage}
                    </div>
                    <div className="text-sm text-green-700">Storage</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Zap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-900">
                      {subscription.limits.messages === -1 ? '∞' : subscription.limits.messages.toLocaleString()}
                    </div>
                    <div className="text-sm text-purple-700">Messages</div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {subscription.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Billing History */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Billing History</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{invoice.description}</div>
                      <div className="text-sm text-gray-500">
                        {invoice.date.toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900">${invoice.amount}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {invoice.status}
                      </span>
                      {invoice.pdfUrl && (
                        <button
                          onClick={() => downloadInvoice(invoice.id)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Cancel Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Cancel Subscription</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your current billing period.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Keep Subscription
                  </button>
                  <button
                    onClick={handleCancelSubscription}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Cancel Plan
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <div className="text-center">
                <Crown className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Upgrade to Enterprise</h3>
                <p className="text-gray-600 mb-6">
                  Get unlimited access to all features, priority support, and dedicated account management.
                </p>
                <div className="bg-purple-50 rounded-lg p-4 mb-6">
                  <div className="text-2xl font-bold text-purple-900">$99/month</div>
                  <div className="text-purple-700">Unlimited everything</div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowUpgradeModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Maybe Later
                  </button>
                  <button
                    onClick={() => handleUpgradePlan('Enterprise')}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Upgrade Now
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubscriptionManager;
