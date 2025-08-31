import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Lock, CheckCircle, AlertCircle, Loader2, Shield, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  last4: string;
  brand: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

interface PaymentProcessorProps {
  amount: number;
  planName: string;
  billingCycle: 'monthly' | 'yearly';
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

const PaymentProcessor: React.FC<PaymentProcessorProps> = ({
  amount,
  planName,
  billingCycle,
  onSuccess,
  onError,
  onCancel
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<PaymentMethod[]>([]);
  const [useSavedMethod, setUseSavedMethod] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('');

  // Simulate saved payment methods
  useEffect(() => {
    setSavedPaymentMethods([
      {
        id: 'pm_1',
        type: 'card',
        last4: '4242',
        brand: 'visa',
        expMonth: 12,
        expYear: 2025,
        isDefault: true
      },
      {
        id: 'pm_2',
        type: 'card',
        last4: '5555',
        brand: 'mastercard',
        expMonth: 8,
        expYear: 2026,
        isDefault: false
      }
    ]);
  }, []);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const validateForm = () => {
    if (!cardholderName.trim()) {
      toast.error('Please enter cardholder name');
      return false;
    }
    if (cardNumber.replace(/\s/g, '').length < 16) {
      toast.error('Please enter a valid card number');
      return false;
    }
    if (expiryDate.length < 5) {
      toast.error('Please enter a valid expiry date');
      return false;
    }
    if (cvv.length < 3) {
      toast.error('Please enter a valid CVV');
      return false;
    }
    return true;
  };

  const processPayment = async () => {
    if (useSavedMethod && !selectedMethod) {
      toast.error('Please select a saved payment method');
      return;
    }
    
    if (!useSavedMethod && !validateForm()) return;

    setIsProcessing(true);

    try {
      // Simulate Stripe payment processing
      const paymentResult = await simulateStripePayment({
        amount,
        cardNumber: useSavedMethod ? 'saved_method' : cardNumber.replace(/\s/g, ''),
        expiryDate: useSavedMethod ? 'saved_method' : expiryDate,
        cvv: useSavedMethod ? 'saved_method' : cvv,
        cardholderName: useSavedMethod ? 'saved_method' : cardholderName,
        savedMethodId: useSavedMethod ? selectedMethod : undefined
      });

      if (paymentResult.success) {
        toast.success('Payment successful!', {
          icon: '🎉',
          duration: 4000
        });
        onSuccess(paymentResult.paymentId);
      } else {
        throw new Error(paymentResult.error);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Payment failed');
      onError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateStripePayment = async (paymentData: any) => {
    // Simulate API call to Stripe
    return new Promise<{ success: boolean; paymentId?: string; error?: string }>((resolve) => {
      setTimeout(() => {
        // Simulate different failure scenarios
        const random = Math.random();
        
        if (random < 0.05) {
          resolve({
            success: false,
            error: 'Card declined. Please check your card details.'
          });
        } else if (random < 0.08) {
          resolve({
            success: false,
            error: 'Insufficient funds. Please try a different payment method.'
          });
        } else if (random < 0.1) {
          resolve({
            success: false,
            error: 'Invalid CVV. Please check your security code.'
          });
        } else {
          resolve({
            success: true,
            paymentId: `pi_${Math.random().toString(36).substr(2, 9)}`
          });
        }
      }, 2000);
    });
  };

  const getCardBrand = (number: string) => {
    const cleanNumber = number.replace(/\s/g, '');
    if (cleanNumber.startsWith('4')) return 'visa';
    if (cleanNumber.startsWith('5')) return 'mastercard';
    if (cleanNumber.startsWith('3')) return 'amex';
    if (cleanNumber.startsWith('6')) return 'discover';
    return 'unknown';
  };

  const cardBrand = getCardBrand(cardNumber);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Complete Payment</h2>
            <p className="text-purple-100 text-sm">
              {planName} Plan - {billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">${amount}</div>
            <div className="text-purple-100 text-sm">
              {billingCycle === 'monthly' ? 'per month' : 'per year'}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Saved Payment Methods */}
        {savedPaymentMethods.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">Saved Payment Methods</label>
              <button
                onClick={() => setUseSavedMethod(!useSavedMethod)}
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                {useSavedMethod ? 'Use New Card' : 'Use Saved Card'}
              </button>
            </div>
            
            {useSavedMethod && (
              <div className="space-y-2">
                {savedPaymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedMethod === method.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="savedMethod"
                      value={method.id}
                      checked={selectedMethod === method.id}
                      onChange={(e) => setSelectedMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {method.brand.charAt(0).toUpperCase() + method.brand.slice(1)} •••• {method.last4}
                        </div>
                        <div className="text-sm text-gray-500">
                          Expires {method.expMonth}/{method.expYear}
                        </div>
                      </div>
                      {method.isDefault && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* New Card Form */}
        {!useSavedMethod && (
          <div className="space-y-4">
            {/* Cardholder Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cardholder Name
              </label>
              <input
                type="text"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Card Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {cardBrand !== 'unknown' && (
                    <div className="w-8 h-5 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-600">
                        {cardBrand.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <input
                  type="text"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVV
                </label>
                <div className="relative">
                  <input
                    type={showCvv ? 'text' : 'password'}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                    placeholder="123"
                    maxLength={4}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCvv(!showCvv)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showCvv ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-green-500 mt-0.5" />
            <div className="text-sm text-gray-600">
              <div className="font-medium text-gray-900 mb-1">Secure Payment</div>
              <div>Your payment information is encrypted and secure. We never store your card details.</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={processPayment}
            disabled={isProcessing}
            className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing Payment...</span>
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                <span>Pay ${amount}</span>
              </>
            )}
          </motion.button>

          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="w-full py-3 px-6 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Cancel
          </button>
        </div>

        {/* Payment Methods */}
        <div className="mt-6 text-center">
          <div className="text-xs text-gray-500 mb-2">We accept</div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-8 h-5 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-xs font-bold text-gray-600">VISA</span>
            </div>
            <div className="w-8 h-5 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-xs font-bold text-gray-600">MC</span>
            </div>
            <div className="w-8 h-5 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-xs font-bold text-gray-600">AMEX</span>
            </div>
            <div className="w-8 h-5 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-xs font-bold text-gray-600">DISC</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PaymentProcessor;
