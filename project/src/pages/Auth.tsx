import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, TrendingUp, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface FormData {
  email: string;
  password: string;
  name?: string;
}

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const { login, signup, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      if (isLogin) {
        await login(data.email, data.password);
      } else {
        await signup(data.email, data.password, data.name || '');
      }
      navigate('/dashboard');
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    reset();
  };

  return (
    <div className="relative min-h-screen bg-slate-50/50 dark:bg-slate-950 flex items-center justify-center p-4 overflow-hidden">
      {/* Abstract Glowing Decorative Elements */}
      <div className="gradient-blob bg-blue-400 dark:bg-blue-600 top-20 -left-40"></div>
      <div className="gradient-blob bg-purple-400 dark:bg-purple-600 bottom-10 -right-40"></div>
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link
          to="/"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="glass-panel rounded-3xl shadow-2xl p-8 border border-slate-200/50 dark:border-slate-800/80 hover-card-trigger transition-all duration-300 relative z-10"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-4">
              <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {isLogin 
                ? 'Sign in to access your trading dashboard' 
                : 'Start your AI-powered trading journey'
              }
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  {...register('name', { 
                    required: !isLogin ? 'Name is required' : false,
                    minLength: { value: 2, message: 'Name must be at least 2 characters' }
                  })}
                  type="text"
                  className="w-full px-4 py-3 border border-slate-200/50 dark:border-slate-800/80 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 transition-all focus:outline-none"
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                type="email"
                className="w-full px-4 py-3 border border-slate-200/50 dark:border-slate-800/80 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 transition-all focus:outline-none"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 pr-12 border border-slate-200/50 dark:border-slate-800/80 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 transition-all focus:outline-none"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
              )}
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 dark:bg-blue-500 text-white py-3 px-4 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-300 font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 hover-card-trigger disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={toggleMode}
                className="ml-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          {/* Demo Notice */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
              <strong>Demo Mode:</strong> Use any email and password to explore the platform
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;