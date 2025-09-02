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

// Chatbot Training Data
const chatbotResponses = {
  greetings: {
    patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
    responses: [
      "👋 Hello! I'm your AI trading assistant. How can I help you today?",
      "Hi there! Ready to explore the world of AI-powered trading?",
      "Welcome! I'm here to help you with stock analysis and trading insights."
    ]
  },
  website: {
    patterns: ['website', 'site', 'platform', 'nexus', 'trading platform', 'stock nexus'],
    responses: [
      "🌐 **Nexus Stock Trading Platform:**\n\n🎯 **What We Are:**\n• Advanced AI-powered stock trading and analysis platform\n• Professional-grade tools for individual traders and institutions\n• Real-time market data with predictive analytics\n\n🚀 **Platform Highlights:**\n• Modern, responsive web interface\n• Mobile-optimized design\n• Real-time data streaming\n• Interactive dashboards\n• Professional-grade security\n\n💡 **Why Choose Nexus:**\n• 94% AI prediction accuracy\n• Comprehensive feature set\n• Professional support\n• Competitive pricing\n• Continuous innovation",
      "🏢 **About Our Platform:**\n\nNexus is a cutting-edge AI-powered trading platform that combines:\n• **Machine Learning** - Advanced algorithms for stock prediction\n• **Real-time Data** - Live market feeds and analysis\n• **Professional Tools** - Institutional-grade trading features\n• **User Experience** - Intuitive interface for all skill levels\n\nWe're trusted by traders worldwide for our accuracy and reliability!"
    ]
  },
  features: {
    patterns: ['features', 'what can you do', 'capabilities', 'functions', 'help'],
    responses: [
      "🚀 **Complete Platform Features:**\n\n📊 **AI-Powered Forecasting:**\n• LSTM Neural Networks for complex patterns\n• Prophet for seasonal trends\n• ARIMA for statistical analysis\n• Ensemble methods for 94% accuracy\n\n📈 **Portfolio Management:**\n• Real-time portfolio tracking\n• Performance analytics & metrics\n• Risk assessment & diversification\n• AI-powered rebalancing\n• Historical performance analysis\n\n⚡ **Trading Features:**\n• Automated trading simulation\n• Real-time market data\n• AI buy/sell signals\n• Risk management tools\n• Strategy backtesting\n\n🔍 **Advanced Analytics:**\n• Stock clustering & recommendations\n• News sentiment analysis (BERT)\n• Technical indicators (RSI, MACD, Bollinger)\n• Model performance comparison\n• Interactive charts (Line & Candlestick)\n\n📰 **Market Intelligence:**\n• Real-time financial news\n• Sentiment impact analysis\n• Market trend identification\n• Economic indicator tracking\n\n💼 **Professional Tools:**\n• Custom model training\n• API access for developers\n• White-label solutions\n• Advanced security & compliance",
      "🎯 **All-In-One Trading Platform:**\n\n🤖 **AI Models:** LSTM, Prophet, ARIMA, BERT\n📊 **Charts:** Line, Candlestick, Volume, Technical\n📈 **Portfolio:** Tracking, Analytics, Rebalancing\n⚡ **Trading:** Auto-trading, Signals, Risk Management\n🔍 **Analysis:** Clustering, Sentiment, News\n📱 **Access:** Web, Mobile, API\n\nEverything you need for modern trading!"
    ]
  },
  models: {
    patterns: ['models', 'lstm', 'prophet', 'arima', 'machine learning', 'ai models', 'forecasting'],
    responses: [
      "📊 **Our Advanced AI Models:**\n\n🧠 **LSTM (Long Short-Term Memory):**\n• Best for complex time series patterns\n• Captures long-term dependencies\n• Handles non-linear relationships\n• 92% accuracy rate\n\n📈 **Prophet (Facebook's Tool):**\n• Excellent for seasonal trends\n• Handles missing data gracefully\n• Holiday and event modeling\n• 89% accuracy rate\n\n📊 **ARIMA (Statistical):**\n• Traditional statistical approach\n• Good for stationary data\n• Econometric modeling\n• 85% accuracy rate\n\n🔤 **BERT (NLP):**\n• News sentiment analysis\n• Market sentiment scoring\n• Text-based predictions\n• 91% accuracy rate\n\n🎯 **Ensemble Methods:**\n• Combines all models\n• 94% overall accuracy\n• Reduces individual model bias\n• Robust predictions",
      "🤖 **Machine Learning Architecture:**\n\nOur platform uses a sophisticated ensemble of AI models:\n\n• **LSTM Networks** - Deep learning for complex patterns\n• **Prophet** - Facebook's time series forecasting\n• **ARIMA** - Statistical time series analysis\n• **BERT** - Natural language processing for news\n• **Ensemble Methods** - Combines all models for best results\n\nEach model specializes in different market conditions, ensuring accurate predictions across various scenarios."
    ]
  },
  pricing: {
    patterns: ['price', 'cost', 'pricing', 'subscription', 'plan', 'free', 'paid'],
    responses: [
      "💰 **Our Transparent Pricing Plans:**\n\n🚀 **Starter Plan - $9/month:**\n• Basic AI forecasting models\n• 100 messages per month\n• Email support\n• Basic analytics\n• 1 user account\n• Standard response time\n• 1GB storage\n\n⭐ **Professional Plan - $29/month (Most Popular):**\n• All AI forecasting models\n• 1,000 messages per month\n• Priority support\n• Advanced analytics\n• Up to 5 user accounts\n• Faster response time\n• Custom integrations\n• API access\n• 10GB storage\n\n👑 **Enterprise Plan - $99/month:**\n• Unlimited messages\n• 24/7 phone support\n• Advanced analytics & reporting\n• Unlimited user accounts\n• Instant response time\n• Custom integrations\n• API access\n• White-label solution\n• Dedicated account manager\n• Custom training data\n• SLA guarantee\n• Unlimited storage\n\n💡 **All plans include:**\n• 14-day free trial\n• 30-day money-back guarantee\n• SSL security\n• 99.9% uptime guarantee",
      "💳 **Pricing & Value:**\n\nOur plans are designed to scale with your needs:\n\n• **Starter ($9/month)** - Perfect for individual traders\n• **Professional ($29/month)** - Ideal for serious traders and small teams\n• **Enterprise ($99/month)** - Complete solution for institutions\n\n🎁 **Special Offers:**\n• **Yearly billing** - Save 17% (2 months free)\n• **Free trial** - 14 days, no credit card required\n• **Money-back guarantee** - 30-day satisfaction guarantee\n\n💎 **Why Our Pricing is Fair:**\n• Professional-grade AI models\n• Institutional-level features\n• 24/7 support on higher plans\n• Continuous platform updates\n• No hidden fees or setup costs"
    ]
  },
  portfolio: {
    patterns: ['portfolio', 'investment', 'stocks', 'holdings', 'assets'],
    responses: [
      "📈 **Advanced Portfolio Management:**\n\n🔍 **Real-time Tracking:**\n• Live portfolio value updates\n• Individual stock performance\n• Sector allocation analysis\n• Market cap distribution\n• Dividend tracking\n\n📊 **Performance Analytics:**\n• Total return calculations\n• Risk-adjusted returns (Sharpe ratio)\n• Benchmark comparisons\n• Drawdown analysis\n• Volatility metrics\n\n⚖️ **Risk Management:**\n• Portfolio diversification scoring\n• Correlation analysis\n• Sector concentration alerts\n• Position sizing recommendations\n• Stop-loss suggestions\n\n🤖 **AI-Powered Insights:**\n• Automated rebalancing alerts\n• Optimal asset allocation\n• Risk assessment scoring\n• Performance forecasting\n• Market timing suggestions\n\n📈 **Historical Analysis:**\n• Performance over time\n• Rolling returns analysis\n• Risk metrics tracking\n• Comparison with market indices",
      "💼 **Portfolio Features Overview:**\n\nOur portfolio management system provides:\n\n• **Multi-asset Support** - Stocks, ETFs, bonds, and more\n• **Real-time Updates** - Live market data integration\n• **Advanced Analytics** - Professional-grade metrics\n• **AI Recommendations** - Data-driven insights\n• **Risk Assessment** - Comprehensive risk analysis\n• **Performance Tracking** - Detailed historical data\n• **Alert System** - Custom notifications\n• **Mobile Access** - Trade anywhere, anytime"
    ]
  },
  trading: {
    patterns: ['trading', 'buy', 'sell', 'trade', 'automated', 'auto trading'],
    responses: [
      "⚡ **Professional Trading Features:**\n\n🤖 **Automated Trading:**\n• Strategy backtesting\n• Paper trading simulation\n• Automated order execution\n• Risk management rules\n• Performance tracking\n\n📊 **Real-time Market Data:**\n• Live price feeds\n• Level 2 market data\n• Volume analysis\n• Order book visibility\n• Market depth information\n\n🎯 **AI Trading Signals:**\n• Buy/sell recommendations\n• Entry/exit timing\n• Position sizing suggestions\n• Risk assessment\n• Market sentiment analysis\n\n🛡️ **Risk Management:**\n• Stop-loss orders\n• Take-profit levels\n• Position sizing rules\n• Portfolio heat maps\n• Correlation alerts\n\n📈 **Performance Analytics:**\n• Trade history tracking\n• Win/loss ratios\n• Average returns\n• Risk metrics\n• Strategy performance",
      "🎯 **Smart Trading Capabilities:**\n\nOur platform offers institutional-grade trading tools:\n\n• **Automated Execution** - Set rules and let AI trade\n• **Real-time Monitoring** - Live market surveillance\n• **Signal Generation** - AI-powered trade recommendations\n• **Risk Controls** - Built-in safety mechanisms\n• **Performance Tracking** - Comprehensive analytics\n• **Strategy Testing** - Backtest before live trading\n• **Mobile Trading** - Trade on any device\n• **API Access** - Connect your own tools"
    ]
  },
  accuracy: {
    patterns: ['accuracy', 'precision', 'reliable', 'trust', 'performance', 'how accurate'],
    responses: [
      "🎯 **Proven AI Accuracy:**\n\n📊 **Overall Performance:**\n• **94% overall accuracy rate** across all models\n• **87% precision** in trend prediction\n• **91% recall** in market movements\n• **89% F1-score** for balanced performance\n\n🤖 **Individual Model Accuracy:**\n• **LSTM Networks:** 92% accuracy\n• **Prophet Model:** 89% accuracy\n• **ARIMA Statistical:** 85% accuracy\n• **BERT NLP:** 91% accuracy\n• **Ensemble Combined:** 94% accuracy\n\n📈 **Performance Metrics:**\n• **Backtesting:** 5+ years of historical data\n• **Live Trading:** Real-time performance tracking\n• **Continuous Learning:** Models improve over time\n• **Market Adaptation:** Adjusts to changing conditions\n• **Risk Management:** Built-in accuracy thresholds",
      "📊 **Model Performance & Reliability:**\n\nOur AI models are rigorously tested and validated:\n\n• **Historical Backtesting** - Tested on 5+ years of market data\n• **Cross-validation** - Multiple time periods and market conditions\n• **Live Performance** - Real-time accuracy monitoring\n• **Risk Controls** - Automatic adjustments for accuracy drops\n• **Continuous Training** - Models learn from new data\n• **Market Adaptation** - Adjusts to changing market conditions\n\n💡 **Why Our Accuracy is High:**\n• Ensemble methods reduce individual model bias\n• Multiple data sources for comprehensive analysis\n• Real-time market sentiment integration\n• Advanced feature engineering\n• Professional-grade model architecture"
    ]
  },
  news: {
    patterns: ['news', 'sentiment', 'analysis', 'market news', 'financial news'],
    responses: [
      "📰 **Advanced News Analysis System:**\n\n🔍 **Real-time Monitoring:**\n• 24/7 financial news scanning\n• 1000+ news sources monitored\n• Real-time sentiment scoring\n• Breaking news alerts\n• Market impact assessment\n\n🤖 **BERT AI Sentiment Analysis:**\n• Natural language processing\n• Context-aware sentiment scoring\n• Multi-language support\n• Emotion detection\n• Sentiment trend analysis\n\n📊 **Market Impact Analysis:**\n• Stock-specific news correlation\n• Sector-wide sentiment tracking\n• Market reaction prediction\n• Volatility impact assessment\n• Trading signal generation\n\n⚡ **News-Driven Features:**\n• Automated news alerts\n• Sentiment-based trading signals\n• News impact scoring\n• Historical sentiment trends\n• Market sentiment dashboard",
      "🔍 **News Sentiment Capabilities:**\n\nOur platform analyzes thousands of news sources in real-time:\n\n• **Source Coverage** - Major financial news outlets, social media, press releases\n• **Sentiment Scoring** - AI-powered positive/negative/neutral classification\n• **Impact Analysis** - How news affects specific stocks and sectors\n• **Signal Generation** - Trading recommendations based on news sentiment\n• **Trend Tracking** - Sentiment changes over time\n• **Alert System** - Notifications for significant news events\n• **Historical Data** - Sentiment analysis archives\n• **Custom Filters** - Focus on specific companies or sectors"
    ]
  },
  support: {
    patterns: ['support', 'help', 'contact', 'customer service', 'assistance'],
    responses: [
      "🛠️ **24/7 Support Available:**\n\n📧 **Email Support:**\n• support@nexus-trading.com\n• Response within 4 hours\n• Technical issue resolution\n• Account management help\n\n💬 **Live Chat Support:**\n• Available 24/7\n• Instant responses\n• Real-time problem solving\n• Priority queue for Pro users\n\n📚 **Documentation & Resources:**\n• Comprehensive user guides\n• Video tutorials\n• API documentation\n• Best practices guides\n• FAQ database\n\n👥 **Community Support:**\n• Active trading forum\n• User discussions\n• Strategy sharing\n• Peer-to-peer help\n• Expert Q&A sessions\n\n🎯 **Priority Support (Pro/Enterprise):**\n• Dedicated support team\n• Faster response times\n• Phone support available\n• One-on-one consultations",
      "💬 **Support Options & Resources:**\n\nOur comprehensive support system includes:\n\n• **AI Assistant (24/7)** - Instant help for common questions\n• **Human Support Team** - Expert assistance for complex issues\n• **Video Tutorials** - Step-by-step platform guides\n• **Community Forum** - Connect with other traders\n• **One-on-One Sessions** - Personalized training for Enterprise users\n• **Knowledge Base** - Searchable help articles\n• **API Support** - Technical assistance for developers\n• **Training Webinars** - Regular educational sessions"
    ]
  },
  security: {
    patterns: ['security', 'safe', 'secure', 'privacy', 'data protection', 'encryption'],
    responses: [
      "🔒 **Enterprise-Grade Security:**\n\n🛡️ **Data Protection:**\n• Bank-level SSL encryption\n• PCI DSS compliance\n• SOC 2 Type II certified\n• GDPR compliant\n• Regular security audits\n\n🔐 **Account Security:**\n• Two-factor authentication (2FA)\n• Biometric login support\n• Session management\n• IP whitelisting\n• Suspicious activity detection\n\n💳 **Payment Security:**\n• Stripe-powered payments\n• Encrypted payment data\n• No card storage on servers\n• Fraud detection systems\n• Secure payment processing\n\n📊 **Data Privacy:**\n• User data encryption\n• Anonymous analytics\n• Data retention policies\n• User consent management\n• Right to data deletion",
      "🛡️ **Security & Privacy Features:**\n\nOur platform implements industry-leading security measures:\n\n• **SSL Encryption** - Bank-level data protection\n• **PCI Compliance** - Secure payment processing\n• **SOC 2 Certification** - Industry security standards\n• **GDPR Compliance** - European data protection\n• **Regular Audits** - Continuous security monitoring\n• **2FA Support** - Enhanced account protection\n• **Data Encryption** - All data encrypted at rest and in transit\n• **Privacy Controls** - User-managed data preferences"
    ]
  },
  technology: {
    patterns: ['technology', 'tech', 'architecture', 'infrastructure', 'backend', 'frontend'],
    responses: [
      "⚙️ **Advanced Technology Stack:**\n\n🖥️ **Frontend Technology:**\n• React 18 with TypeScript\n• Framer Motion animations\n• Tailwind CSS styling\n• Responsive design\n• Progressive Web App (PWA)\n\n🔧 **Backend Infrastructure:**\n• Node.js/Express servers\n• Python ML services\n• Real-time WebSocket connections\n• RESTful API architecture\n• Microservices design\n\n🤖 **AI/ML Infrastructure:**\n• TensorFlow/PyTorch models\n• GPU-accelerated computing\n• Real-time data processing\n• Model versioning system\n• A/B testing framework\n\n☁️ **Cloud Infrastructure:**\n• AWS/Google Cloud hosting\n• Auto-scaling capabilities\n• 99.9% uptime guarantee\n• Global CDN distribution\n• Real-time monitoring",
      "🔬 **Technical Architecture:**\n\nOur platform is built with modern, scalable technology:\n\n• **Frontend** - React, TypeScript, Tailwind CSS\n• **Backend** - Node.js, Python, microservices\n• **AI/ML** - TensorFlow, PyTorch, real-time processing\n• **Database** - PostgreSQL, Redis, MongoDB\n• **Cloud** - AWS/Google Cloud with auto-scaling\n• **Security** - SSL, 2FA, encryption, compliance\n• **Performance** - CDN, caching, optimization\n• **Monitoring** - Real-time alerts, analytics, logging"
    ]
  },
  comparison: {
    patterns: ['compare', 'vs', 'better than', 'competitors', 'alternative', 'difference'],
    responses: [
      "🏆 **Why Nexus Stands Out:**\n\n🎯 **AI Superiority:**\n• 94% accuracy vs industry average 70-80%\n• Multiple AI models vs single model approach\n• Real-time sentiment analysis vs delayed data\n• Continuous learning vs static models\n\n📊 **Feature Comparison:**\n• **Nexus:** All-in-one platform\n• **Others:** Separate tools for different functions\n• **Nexus:** Real-time data + AI predictions\n• **Others:** Historical data only\n• **Nexus:** Integrated portfolio management\n• **Others:** Basic tracking only\n\n💰 **Value Proposition:**\n• Professional features at affordable prices\n• No hidden fees or setup costs\n• 14-day free trial\n• 30-day money-back guarantee\n• Transparent pricing\n\n🚀 **Innovation:**\n• Latest AI/ML technology\n• Regular platform updates\n• User-driven feature development\n• Community feedback integration",
      "⚖️ **Competitive Advantages:**\n\nOur platform offers unique benefits:\n\n• **AI Accuracy** - 94% vs industry average 70-80%\n• **Integration** - All tools in one platform vs separate apps\n• **Real-time Data** - Live updates vs delayed information\n• **User Experience** - Modern interface vs outdated designs\n• **Support** - 24/7 AI + human support vs limited help\n• **Pricing** - Transparent plans vs hidden costs\n• **Innovation** - Continuous updates vs stagnant platforms\n• **Community** - Active user forum vs isolated experience"
    ]
  },
  default: {
    responses: [
      "I'm not sure about that. Could you rephrase your question? I can help with trading, AI models, portfolio management, platform features, pricing, security, technology, and more.",
      "Let me help you with something else. I'm knowledgeable about stock predictions, trading strategies, platform features, security, technology, and our comprehensive trading solution.",
      "I'd be happy to help! Try asking about our AI models, trading features, portfolio management, pricing plans, security, technology, or how we compare to competitors.",
      "I can help you with many topics! Ask me about:\n• 🚀 Platform features and capabilities\n• 🤖 AI models and accuracy\n• 💰 Pricing plans and value\n• 📈 Trading and portfolio tools\n• 🔒 Security and privacy\n• ⚙️ Technology and architecture\n• 🆚 How we compare to others\n• 🛠️ Support and help options"
    ]
  }
};

// Chatbot Logic
const getChatbotResponse = (userMessage: string): string => {
  const message = userMessage.toLowerCase();
  
  // Check for greetings
  if (chatbotResponses.greetings.patterns.some(pattern => message.includes(pattern))) {
    return chatbotResponses.greetings.responses[Math.floor(Math.random() * chatbotResponses.greetings.responses.length)];
  }
  
  // Check for features
  if (chatbotResponses.features.patterns.some(pattern => message.includes(pattern))) {
    return chatbotResponses.features.responses[Math.floor(Math.random() * chatbotResponses.features.responses.length)];
  }
  
  // Check for models
  if (chatbotResponses.models.patterns.some(pattern => message.includes(pattern))) {
    return chatbotResponses.models.responses[Math.floor(Math.random() * chatbotResponses.models.responses.length)];
  }
  
  // Check for pricing
  if (chatbotResponses.pricing.patterns.some(pattern => message.includes(pattern))) {
    return chatbotResponses.pricing.responses[Math.floor(Math.random() * chatbotResponses.pricing.responses.length)];
  }
  
  // Check for portfolio
  if (chatbotResponses.portfolio.patterns.some(pattern => message.includes(pattern))) {
    return chatbotResponses.portfolio.responses[Math.floor(Math.random() * chatbotResponses.portfolio.responses.length)];
  }
  
  // Check for trading
  if (chatbotResponses.trading.patterns.some(pattern => message.includes(pattern))) {
    return chatbotResponses.trading.responses[Math.floor(Math.random() * chatbotResponses.trading.responses.length)];
  }
  
  // Check for accuracy
  if (chatbotResponses.accuracy.patterns.some(pattern => message.includes(pattern))) {
    return chatbotResponses.accuracy.responses[Math.floor(Math.random() * chatbotResponses.accuracy.responses.length)];
  }
  
  // Check for news
  if (chatbotResponses.news.patterns.some(pattern => message.includes(pattern))) {
    return chatbotResponses.news.responses[Math.floor(Math.random() * chatbotResponses.news.responses.length)];
  }
  
  // Check for support
  if (chatbotResponses.support.patterns.some(pattern => message.includes(pattern))) {
    return chatbotResponses.support.responses[Math.floor(Math.random() * chatbotResponses.support.responses.length)];
  }
  
  // Check for security
  if (chatbotResponses.security.patterns.some(pattern => message.includes(pattern))) {
    return chatbotResponses.security.responses[Math.floor(Math.random() * chatbotResponses.security.responses.length)];
  }
  
  // Check for technology
  if (chatbotResponses.technology.patterns.some(pattern => message.includes(pattern))) {
    return chatbotResponses.technology.responses[Math.floor(Math.random() * chatbotResponses.technology.responses.length)];
  }
  
  // Check for comparison
  if (chatbotResponses.comparison.patterns.some(pattern => message.includes(pattern))) {
    return chatbotResponses.comparison.responses[Math.floor(Math.random() * chatbotResponses.comparison.responses.length)];
  }
  
  // Check for website
  if (chatbotResponses.website.patterns.some(pattern => message.includes(pattern))) {
    return chatbotResponses.website.responses[Math.floor(Math.random() * chatbotResponses.website.responses.length)];
  }
  
  // Default response
  return chatbotResponses.default.responses[Math.floor(Math.random() * chatbotResponses.default.responses.length)];
};

// Message interface
interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const Home: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "👋 Hi! I'm your AI trading assistant. I can help you with stock analysis, portfolio optimization, and market insights. What would you like to know?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Pricing system state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showSubscriptionManager, setShowSubscriptionManager] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = getChatbotResponse(inputMessage);
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Add quick action buttons for common questions
  const quickActions = [
    { text: "What features do you offer?", icon: "🚀" },
    { text: "How accurate are your models?", icon: "📊" },
    { text: "Tell me about pricing", icon: "💰" },
    { text: "How does trading work?", icon: "⚡" },
    { text: "What makes Nexus special?", icon: "🏆" },
    { text: "Is my data secure?", icon: "🔒" },
    { text: "What technology do you use?", icon: "⚙️" },
    { text: "Tell me about your platform", icon: "🌐" }
  ];

  const handleQuickAction = (text: string) => {
    setInputMessage(text);
    // Auto-send after a brief delay
    setTimeout(() => {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        text: text,
        sender: 'user',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');
      setIsTyping(true);

      setTimeout(() => {
        const botResponse = getChatbotResponse(text);
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: botResponse,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1500);
    }, 100);
  };

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
              <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8">
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
      <section id="features" className="py-20 bg-white dark:bg-slate-800 z-10 relative">
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
                className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
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
      <section id="pricing" className="py-20 bg-white dark:bg-slate-800 z-10 relative">
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
            return (
              <div className="flex flex-col items-center">
                <div className="relative w-full flex items-center justify-center mb-8" style={{ perspective: '1200px' }}>
                  <motion.div
                    key={member.name}
                    initial={{ opacity: 0, rotateY: 60 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    exit={{ opacity: 0, rotateY: -60 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-10 flex flex-col items-center text-center hover:shadow-blue-200 dark:hover:shadow-blue-900 transition-all group"
                    style={{ transformStyle: 'preserve-3d', minWidth: 320, maxWidth: 400 }}
                  >
                    <div className="w-32 h-32 rounded-full overflow-hidden shadow-lg mb-4 border-4 border-blue-100 dark:border-blue-900 group-hover:scale-110 transition-transform bg-gradient-to-br from-blue-200 to-purple-200 dark:from-blue-900/40 dark:to-purple-900/40">
                      <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
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

      {/* Chat Bot Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Chat Window */}
        <AnimatePresence>
        {isChatOpen && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="absolute bottom-16 right-0 w-96 h-[500px] bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-slate-600/50 overflow-hidden"
            style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)' }}
          >
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 p-6 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <Bot className="h-6 w-6 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="bg-white/90 dark:bg-slate-900/40 rounded-xl px-3 py-1 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <p className="text-gray-700 dark:text-blue-100 text-xs font-medium">Online • Ready to help</p>
                    </div>
                  </div>
                </div>
                <motion.button
                  onClick={() => setIsChatOpen(false)}
                  whileTap={{ y: 2 }}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
                >
                  <X className="h-4 w-4 text-white" />
                </motion.button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="p-6 h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-600">
              <div className="space-y-6">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-start space-x-3 ${message.sender === 'user' ? 'justify-end' : ''}`}
                  >
                    {message.sender === 'bot' && (
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                    )}
                    
                    <div className={`rounded-2xl p-4 max-w-xs shadow-sm ${
                      message.sender === 'user' 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                        : 'bg-gray-50 dark:bg-slate-700/50'
                    }`}>
                      <div className={`text-sm leading-relaxed ${
                        message.sender === 'user' ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {message.text.split('\n').map((line, index) => (
                          <div key={index}>
                            {line}
                            {index < message.text.split('\n').length - 1 && <br />}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {message.sender === 'user' && (
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white text-sm font-bold">U</span>
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Quick Action Buttons - Show only when there's only the welcome message */}
                {messages.length === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-3"
                  >
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Quick questions:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {quickActions.map((action, index) => (
                        <motion.button
                          key={index}
                          onClick={() => handleQuickAction(action.text)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="p-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 transition-all duration-200 text-left"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{action.icon}</span>
                            <span className="truncate">{action.text}</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-start space-x-3"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-700/50 rounded-2xl p-4 shadow-sm">
                      <div className="flex space-x-1">
                        <motion.div
                          className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Chat Input */}
            <div className="p-6 border-t border-gray-100 dark:border-slate-600/50 bg-gray-50/50 dark:bg-slate-700/30">
              <div className="flex space-x-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="     Ask me anything "
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs"></span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Press Enter to send • Powered by AI
              </p>
            </div>
          </motion.div>
        )}
        </AnimatePresence>

        {/* Chat Button */}
        <motion.button
          onClick={() => {
            if (isChatOpen) {
              setIsChatOpen(false);
            } else {
              setIsChatOpen(true);
              setHasUnreadMessages(false);
              // Reset messages to initial state when opening
              setMessages([{
                id: '1',
                text: "👋 Hi! I'm your AI trading assistant. I can help you with stock analysis, portfolio optimization, and market insights. What would you like to know?",
                sender: 'bot',
                timestamp: new Date()
              }]);
            }
          }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95, y: 2 }}
          className="relative w-16 h-16 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center group backdrop-blur-sm cursor-pointer"
          style={{ 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #3B82F6 100%)'
          }}
        >
          <MessageCircle className="h-7 w-7 text-white" />
          
          {/* Unread Message Indicator */}
          {hasUnreadMessages && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <span className="text-white text-xs font-bold">3</span>
            </motion.div>
          )}

          {/* Pulse Animation */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 rounded-2xl opacity-75"
            animate={{ 
              scale: [1, 1.1, 1], 
              opacity: [0.75, 0, 0.75],
              rotate: [0, 5, 0]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </motion.button>
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
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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