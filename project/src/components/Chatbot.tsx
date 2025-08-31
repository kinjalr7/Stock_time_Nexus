import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Sparkles, MessageCircle, X, Maximize2, Minimize2 } from 'lucide-react';
import toast from 'react-hot-toast';

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
  };
}

interface ChatbotProps {
  className?: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ className = '' }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date(),
      type: 'text',
      metadata: {
        confidence: 0.95,
        processingTime: 0.2,
        tokens: 15
      }
    }
  ]);
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

  const generateResponse = async (userMessage: string): Promise<Message> => {
    // Simulate API call with realistic delays
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const responses = [
      {
        text: "That's an interesting question! Let me analyze that for you. Based on the latest data, I can provide you with comprehensive insights on this topic.",
        type: 'info' as const,
        confidence: 0.87,
        sources: ['Database A', 'Research Paper B'],
        processingTime: 1.2,
        tokens: 45
      },
      {
        text: "I've found some relevant information for you. Here's what I discovered: The analysis shows significant trends in this area that could be valuable for your needs.",
        type: 'success' as const,
        confidence: 0.92,
        sources: ['Market Report C', 'Industry Analysis D'],
        processingTime: 0.8,
        tokens: 38
      },
      {
        text: "I understand your query. Let me break this down for you with detailed explanations and actionable insights.",
        type: 'text' as const,
        confidence: 0.89,
        sources: ['Expert Opinion E'],
        processingTime: 1.5,
        tokens: 52
      }
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      id: Date.now().toString(),
      text: randomResponse.text,
      sender: 'bot',
      timestamp: new Date(),
      type: randomResponse.type,
      metadata: {
        confidence: randomResponse.confidence,
        sources: randomResponse.sources,
        processingTime: randomResponse.processingTime,
        tokens: randomResponse.tokens
      }
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const botResponse = await generateResponse(userMessage.text);
      setMessages(prev => [...prev, botResponse]);
      
      // Show success toast for good responses
      if (botResponse.metadata?.confidence && botResponse.metadata.confidence > 0.9) {
        toast.success('High confidence response generated!', {
          icon: '✨',
          duration: 2000
        });
      }
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "I apologize, but I encountered an error processing your request. Please try again.",
        sender: 'bot',
        timestamp: new Date(),
        type: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to generate response');
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

  const getMessageIcon = (sender: 'user' | 'bot') => {
    return sender === 'user' ? (
      <User className="w-5 h-5 text-blue-500" />
    ) : (
      <Bot className="w-5 h-5 text-purple-500" />
    );
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'error': return 'border-red-200 bg-red-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-white';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return '';
    }
  };

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
      <div className={`bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300 ${
        isExpanded ? 'w-96 h-[600px]' : 'w-80 h-[500px]'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Bot className="w-6 h-6" />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
              />
            </div>
            <div>
              <h3 className="font-semibold">AI Assistant</h3>
              <p className="text-xs text-purple-200">Online • Ready to help</p>
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(100%-140px)]">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    {getMessageIcon(message.sender)}
                  </div>
                  <div className={`rounded-2xl px-4 py-3 border ${getTypeColor(message.type)} ${
                    message.sender === 'user' 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : 'text-gray-800'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      {getTypeIcon(message.type) && (
                        <span className="text-sm">{getTypeIcon(message.type)}</span>
                      )}
                      <span className="text-xs text-gray-500">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    
                    {/* Advanced Information Display */}
                    {message.metadata && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 pt-3 border-t border-gray-200 space-y-2"
                      >
                        {message.metadata.confidence && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">Confidence:</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                                  style={{ width: `${message.metadata.confidence * 100}%` }}
                                />
                              </div>
                              <span className="text-gray-700 font-medium">
                                {Math.round(message.metadata.confidence * 100)}%
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {message.metadata.processingTime && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">Processing:</span>
                            <span className="text-gray-700 font-medium">
                              {message.metadata.processingTime.toFixed(1)}s
                            </span>
                          </div>
                        )}
                        
                        {message.metadata.tokens && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">Tokens:</span>
                            <span className="text-gray-700 font-medium">
                              {message.metadata.tokens}
                            </span>
                          </div>
                        )}
                        
                        {message.metadata.sources && message.metadata.sources.length > 0 && (
                          <div className="text-xs">
                            <span className="text-gray-600">Sources:</span>
                            <div className="mt-1 space-y-1">
                              {message.metadata.sources.map((source, idx) => (
                                <div key={idx} className="text-purple-600 bg-purple-50 px-2 py-1 rounded text-xs">
                                  {source}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex justify-start"
              >
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl px-4 py-3">
                    <div className="flex items-center space-x-1">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                disabled={isTyping}
              />
              {isTyping && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
                </div>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>Press Enter to send</span>
            <div className="flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>AI Powered</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Chatbot;
