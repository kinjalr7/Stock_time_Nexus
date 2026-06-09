import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Sparkles, MessageCircle, X, Maximize2, Minimize2, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_BASE = 'http://localhost:8000';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type: 'text' | 'info' | 'error' | 'success';
  metadata?: {
    confidence?: number;
    sources?: string[];
    processingTime?: number;
    tokens?: number;
    model?: string;
    live?: boolean;
  };
}

interface ChatbotProps {
  className?: string;
  /** Optional portfolio context injected so the AI can answer portfolio questions */
  portfolioContext?: string;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ className = '', portfolioContext }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your Stock Time Nexus AI assistant. Ask me about stocks, your portfolio, or market trends! 📈",
      sender: 'bot',
      timestamp: new Date(),
      type: 'text',
      metadata: { confidence: 1, processingTime: 0, tokens: 0, live: false },
    },
  ]);
  const [history, setHistory] = useState<ConversationMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const callChatAPI = async (userText: string): Promise<Message> => {
    const start = Date.now();

    // Add user message to history
    const newHistory: ConversationMessage[] = [
      ...history,
      { role: 'user', content: userText },
    ];

    const res = await axios.post(`${API_BASE}/api/chat/`, {
      messages: newHistory,
      context: portfolioContext || null,
      username: user?.username || 'demo',
    });

    const data = res.data;
    const elapsed = (Date.now() - start) / 1000;

    // Update conversation history with assistant reply
    setHistory([...newHistory, { role: 'assistant', content: data.reply }]);

    return {
      id: Date.now().toString(),
      text: data.reply,
      sender: 'bot',
      timestamp: new Date(),
      type: 'success',
      metadata: {
        tokens: data.tokens || 0,
        processingTime: elapsed,
        model: data.model,
        live: data.live,
        confidence: data.live ? 0.92 : 0.75,
      },
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date(),
      type: 'text',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const botResponse = await callChatAPI(userMessage.text);
      setMessages((prev) => [...prev, botResponse]);

      if (botResponse.metadata?.live) {
        toast.success('AI response received!', { icon: '✨', duration: 2000 });
      }
    } catch (error: any) {
      const errorMsg: Message = {
        id: Date.now().toString(),
        text: 'Sorry, I encountered an error. Please check that the backend is running and try again.',
        sender: 'bot',
        timestamp: new Date(),
        type: 'error',
      };
      setMessages((prev) => [...prev, errorMsg]);
      toast.error('Failed to get response');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getTypeColor = (type: string, sender: string) => {
    if (sender === 'user') return 'bg-blue-500 text-white border-blue-500';
    switch (type) {
      case 'success': return 'border-green-200 bg-green-50 text-gray-800 dark:bg-green-900/30 dark:border-green-700 dark:text-gray-100';
      case 'error':   return 'border-red-200 bg-red-50 text-gray-800 dark:bg-red-900/30 dark:border-red-700 dark:text-gray-100';
      case 'info':    return 'border-blue-200 bg-blue-50 text-gray-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-gray-100';
      default:        return 'border-gray-200 bg-white text-gray-800 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-100';
    }
  };

  const suggestedQuestions = [
    'How is AAPL performing today?',
    'What is the outlook for NVDA?',
    'Explain RSI to me',
    'What is my portfolio doing?',
  ];

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`fixed bottom-4 right-4 z-50 ${className}`}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMinimized(false)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <MessageCircle className="w-6 h-6" />
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      className={`fixed bottom-4 right-4 z-50 ${className}`}
    >
      <div
        className={`bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col transition-all duration-300 ${
          isExpanded ? 'w-[420px] h-[640px]' : 'w-80 h-[520px]'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Bot className="w-6 h-6" />
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-white"
              />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Stock Nexus AI</h3>
              <p className="text-xs text-purple-200 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Powered by LLM
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex items-start gap-2 max-w-[85%] ${
                    message.sender === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div className="flex-shrink-0 w-7 h-7 bg-gray-100 dark:bg-slate-600 rounded-full flex items-center justify-center">
                    {message.sender === 'user'
                      ? <User className="w-4 h-4 text-blue-500" />
                      : <Bot className="w-4 h-4 text-purple-500" />}
                  </div>
                  <div
                    className={`rounded-2xl px-3 py-2 border text-sm leading-relaxed whitespace-pre-wrap ${getTypeColor(
                      message.type,
                      message.sender
                    )}`}
                  >
                    {message.text}
                    {/* Metadata bar */}
                    {message.sender === 'bot' && message.metadata?.model && (
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-slate-600 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                        <span>{message.metadata.model}</span>
                        {message.metadata.processingTime != null && (
                          <span>{message.metadata.processingTime.toFixed(1)}s</span>
                        )}
                        {message.metadata.live && (
                          <span className="text-green-500 font-medium">● Live</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex justify-start"
              >
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 bg-gray-100 dark:bg-slate-600 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-2xl px-4 py-3">
                    <div className="flex items-center space-x-1">
                      {[0, 0.2, 0.4].map((delay) => (
                        <motion.div
                          key={delay}
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay }}
                          className="w-2 h-2 bg-purple-400 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested questions (show only on first load) */}
        {messages.length === 1 && (
          <div className="px-3 pb-2 flex flex-wrap gap-1">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => { setInputValue(q); inputRef.current?.focus(); }}
                className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 flex-shrink-0">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about stocks, portfolio..."
              className="flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400"
              disabled={isTyping}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
            >
              {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </motion.button>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Not financial advice
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Chatbot;
