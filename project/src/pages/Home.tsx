import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimation, useInView } from 'framer-motion';
import {
  ArrowRight,
  TrendingUp,
  Brain,
  Shield,
  Zap,
  BarChart3,
  Bot,
  Star,
  Check,
  ChevronRight,
  Play,
  Award,
  Users,
  Target,
  Sparkles,
  ChevronLeft,
  Home as HomeIcon,
  Newspaper,
  Cpu,
  MessageCircle,
  X,
  Send,
  HelpCircle,
  Settings,
  BarChart,
  DollarSign,
  TrendingDown,
  AlertCircle,
  Info,
  Crown,
  Globe,
  Clock,
  Headphones,
  Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import PricingPlans from '../components/PricingPlans';
import PaymentProcessor from '../components/PaymentProcessor';
import SubscriptionManager from '../components/SubscriptionManager';

// Animated Counter component
const AnimatedCounter = ({ value }: { value: string }) => {
  const [count, setCount] = React.useState(0);
  const end = parseInt(value.replace(/\D/g, '')) || 0;
  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const step = Math.ceil(end / (duration / 16));
    if (end === 0) return;
    const interval = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(interval);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(interval);
  }, [end]);
  return <span>{value.includes('%') ? count + '%' : value.includes('K') ? count + 'K+' : value.includes('M') ? count + 'M+' : value}</span>;
};


// Pricing system state
const [showPaymentModal, setShowPaymentModal] = useState(false);
const [selectedPlan, setSelectedPlan] = useState<any>(null);
const [showSubscriptionManager, setShowSubscriptionManager] = useState(false);

// Pricing system handlers
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
    icon: Brain,
    title: 'AI-Powered Forecasting',
    description: 'Advanced machine learning models including LSTM, Prophet, and ARIMA for accurate stock predictions.'
  },
  {
    icon: BarChart3,
    title: 'Model Comparison',
    description: 'Compare performance metrics across different models to find the best predictions for your portfolio.'
  },
  {
    icon: Bot,
    title: 'Auto Trading',
    description: 'Automated trading simulation with real-time portfolio tracking and performance analytics.'
  },
  {
    icon: Shield,
    title: 'News Analysis',
    description: 'Sentiment analysis of financial news using BERT and NLP to enhance prediction accuracy.'
  },
  {
    icon: Target,
    title: 'Stock Clustering',
    description: 'Discover similar stocks and get personalized recommendations based on advanced clustering algorithms.'
  },
  {
    icon: Zap,
    title: 'Real-time Data',
    description: 'Live market data integration with instant updates and real-time performance monitoring.'
  }
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Portfolio Manager',
    company: 'Goldman Sachs',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
    content: 'Nexus has revolutionized how I approach stock analysis. The AI predictions are incredibly accurate.',
    rating: 5
  },
  {
    name: 'Michael Rodriguez',
    role: 'Quantitative Analyst',
    company: 'JP Morgan',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
    content: 'The model comparison feature helped me optimize my trading strategy. ROI increased by 34%.',
    rating: 5
  },
  {
    name: 'Emily Watson',
    role: 'Hedge Fund Manager',
    company: 'Bridgewater',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
    content: 'Exceptional platform. The news sentiment analysis gives us a significant edge in the market.',
    rating: 5
  }
];

const platformFeatures = [
  {
    icon: Brain,
    title: 'AI-Powered Forecasting',
    description: 'Advanced machine learning models including LSTM, Prophet, and ARIMA for accurate stock predictions.'
  },
  {
    icon: BarChart3,
    title: 'Model Comparison',
    description: 'Compare performance metrics across different models to find the best predictions for your portfolio.'
  },
  {
    icon: Bot,
    title: 'Auto Trading',
    description: 'Automated trading simulation with real-time portfolio tracking and performance analytics.'
  },
  {
    icon: Shield,
    title: 'News Analysis',
    description: 'Sentiment analysis of financial news using BERT and NLP to enhance prediction accuracy.'
  },
  {
    icon: Target,
    title: 'Stock Clustering',
    description: 'Discover similar stocks and get personalized recommendations based on advanced clustering algorithms.'
  },
  {
    icon: Zap,
    title: 'Real-time Data',
    description: 'Live market data integration with instant updates and real-time performance monitoring.'
  }
];

const pricingFeatures = [
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



const stats = [
  { label: 'Active Users', value: '50K+', icon: Users },
  { label: 'Predictions Made', value: '2M+', icon: TrendingUp },
  { label: 'Accuracy Rate', value: '94%', icon: Target },
  { label: 'Awards Won', value: '12', icon: Award }
];

const navigate = useNavigate();
const handleNav = (path: string) => {
  navigate(path);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

return (
  <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 relative overflow-hidden">
    {/* Animated Gradient Blobs */}
    <motion.div
      className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-30 blur-3xl z-0"
      animate={{ y: [0, 40, 0], x: [0, 30, 0] }}
      transition={{ duration: 10, repeat: Infinity, repeatType: 'loop' }}
      style={{ filter: 'blur(120px)' }}
    />
    <motion.div
      className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-green-400 to-blue-500 rounded-full opacity-20 blur-3xl z-0"
      animate={{ y: [0, -40, 0], x: [0, -30, 0] }}
      transition={{ duration: 12, repeat: Infinity, repeatType: 'loop' }}
      style={{ filter: 'blur(120px)' }}
    />
    {/* Hero Section with Parallax */}
    <section className="relative overflow-hidden pt-20 pb-16 sm:pt-24 sm:pb-20 z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/20"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-center space-x-2 mb-6">
              <Sparkles className="h-6 w-6 text-blue-600" />
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                AI-Powered Trading Platform
              </span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              <motion.span
                initial={{ y: 0 }}
                whileInView={{ y: [-10, 0] }}
                transition={{ duration: 0.8 }}
                className="inline-block"
              >
                Smart Trading with
              </motion.span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {' '}AI Predictions
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Harness the power of advanced machine learning to forecast stock prices, analyze market sentiment,
              and automate your trading strategies with unprecedented accuracy.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                to="/dashboard"
                className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
              >
                <span className="font-semibold">Start Trading Now</span>
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <button className="group inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:border-blue-600 hover:text-blue-600 transition-all">
                <Play className="mr-2 h-5 w-5" />
                <span className="font-semibold">Watch Demo</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                  className="text-center"
                  whileHover={{ scale: 1.08 }}
                >
                  <stat.icon className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    <AnimatedCounter value={stat.value} />
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative glass-panel rounded-3xl shadow-2xl p-8 border border-slate-200/50 dark:border-slate-850">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-green-400 to-blue-500 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Live Portfolio</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-600 dark:text-green-400">Live</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">AAPL</div>
                        <div className="text-sm text-gray-500">Apple Inc.</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">+2.34%</div>
                      <div className="text-sm text-gray-500">$182.52</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">TSLA</div>
                        <div className="text-sm text-gray-500">Tesla Inc.</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">+5.67%</div>
                      <div className="text-sm text-gray-500">$248.91</div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">+$12,458</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Today's Profit</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Features Section */}
    <section id="features" className="py-20 bg-slate-50/50 dark:bg-slate-900/10 z-10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Powerful Features for Smart Trading
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Comprehensive suite of AI-powered tools designed to give you the edge in financial markets
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {platformFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}
              className="group p-8 bg-white/70 dark:bg-slate-700/70 backdrop-blur-lg rounded-2xl hover:bg-white dark:hover:bg-slate-600 transition-all hover:shadow-xl"
            >
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Testimonials Section */}
    <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-900 dark:to-blue-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Trusted by Finance Professionals
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            See what industry experts say about Nexus
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="glass-panel p-8 rounded-3xl shadow-xl hover:shadow-2xl hover-card-trigger transition-all duration-300 border border-slate-205 dark:border-slate-800/80"
            >
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
                "{testimonial.content}"
              </p>
              <div className="flex items-center">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Pricing Section */}
    <section id="pricing" className="py-20 bg-slate-50/50 dark:bg-slate-900/10 z-10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Integrated Pricing Plans Component */}
        <PricingPlans onPlanSelect={handlePlanSelect} />
      </div>
    </section>

    {/* Features Section for Pricing */}
    <div className="py-20 bg-gray-50 dark:bg-slate-700">
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
          {pricingFeatures.map((feature, index) => (
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



    {/* CTA Section */}
    <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Trading?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of traders who are already using AI to maximize their returns
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-all font-semibold shadow-lg"
            >
              Start Free Trial
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
            <button className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white rounded-xl hover:bg-white hover:text-blue-600 transition-all font-semibold">
              Schedule Demo
            </button>
          </div>
        </motion.div>
      </div>
    </section>

    {/* Team Section */}
    <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-blue-900/30">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Meet Our Team
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            The passionate minds behind our AI-powered trading platform
          </p>
        </motion.div>
        {(() => {
          const team = [
            {
              name: 'Dushyant Chawda',
              role: 'Mentor Of This Project',
              avatar: 'tirthpicc.png',
              work: ' The project mentor by guiding team members and coordinating project activities to ensure successful and timely completion.'
            },
            {
              name: 'Tirth Patel',
              role: 'Data Analyst',
              avatar: 'tirthpic.png',
              work: 'Developed and optimized machine learning models for stock prediction and sentiment analysis.'
            },
            {
              name: 'Kinjal Rathod',
              role: 'Python Developer',
              avatar: 'Kinjal_1.jpg',
              work: 'Python backend developer to coordinate tasks and contribute to the successful execution of the project.'
            },
            {
              name: 'Trusha Savaliya',
              role: 'Python Developer',
              avatar: 'Trusha.jpg',
              work: 'Managed DataBase deployment and ensured high availability.'
            },
            {
              name: 'Hardik Chauhan',
              role: 'Frontend Developer',
              avatar: 'Hardik.jpg',
              work: 'esigned the modern, user-friendly interface and 3D visual effects for the platform.'
            }
          ];
          const [current, setCurrent] = React.useState(0);
          // Remove any previous timerRef declaration, only use this:
          const timerRef = React.useRef<number | null>(null);
          const prev = () => {
            setCurrent((c) => (c === 0 ? team.length - 1 : c - 1));
            resetTimer();
          };
          const next = () => {
            setCurrent((c) => (c === team.length - 1 ? 0 : c + 1));
            resetTimer();
          };
          const goTo = (idx: number) => {
            setCurrent(idx);
            resetTimer();
          };
          const resetTimer = () => {
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = window.setInterval(() => {
              setCurrent((c) => (c === team.length - 1 ? 0 : c + 1));
            }, 10000);
          };
          React.useEffect(() => {
            timerRef.current = window.setInterval(() => {
              setCurrent((c) => (c === team.length - 1 ? 0 : c + 1));
            }, 10000);
            return () => {
              if (timerRef.current) clearInterval(timerRef.current);
            };
          }, []);
          const member = team[current];
          const getInitials = (name: string) => {
            const parts = name.trim().split(' ');
            if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
            return name.slice(0, 2).toUpperCase();
          };
          return (
            <div className="flex flex-col items-center">
              <div className="relative w-full flex items-center justify-center mb-8" style={{ perspective: '1200px' }}>
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, rotateY: 60 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  exit={{ opacity: 0, rotateY: -60 }}
                  transition={{ duration: 0.6 }}
                  className="glass-panel rounded-3xl shadow-2xl p-10 flex flex-col items-center text-center hover:shadow-blue-500/10 hover-card-trigger transition-all duration-300 border border-slate-200/50 dark:border-slate-800/80 group"
                  style={{ transformStyle: 'preserve-3d', minWidth: 320, maxWidth: 400 }}
                >
                  <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-lg mb-4 border-4 border-blue-100 dark:border-blue-900 group-hover:scale-110 transition-transform bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                    <span>{getInitials(member.name)}</span>
                    <img
                      src={member.avatar}
                      alt={member.name}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{member.name}</h3>
                  <p className="text-blue-600 dark:text-blue-400 font-semibold mb-2">{member.role}</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{member.work}</p>
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-lg opacity-40 group-hover:opacity-80 transition-all"></div>
                </motion.div>
                <button
                  onClick={prev}
                  className="absolute left-0 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-700 rounded-full shadow p-2 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-700 rounded-full shadow p-2 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                  aria-label="Next"
                >
                  <ChevronRight className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </button>
              </div>
              <div className="flex gap-2 mt-2">
                {team.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goTo(idx)}
                    className={`w-3 h-3 rounded-full ${current === idx ? 'bg-blue-600' : 'bg-blue-200 dark:bg-blue-900/40'} transition-colors`}
                    aria-label={`Go to member ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </section>

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
        <div className="glass-panel rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-200/50 dark:border-slate-800/80 shadow-2xl">
          <SubscriptionManager selectedPlan={selectedPlan} />
          <div className="p-6 border-t border-gray-200 dark:border-slate-600">
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

export default Home;