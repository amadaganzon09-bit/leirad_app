import React, { useState, useEffect } from 'react';
import { User, ArrowRight, Sparkles, Lock, KeyRound, UserPlus, LogIn, Loader2 } from 'lucide-react';
import { AddToastFunction, ToastType } from '../types';
import Footer from './Footer';
import { api } from '../utils/api';

interface LoginProps {
  onLogin: (username: string) => void;
  addToast: AddToastFunction;
}

const Login: React.FC<LoginProps> = ({ onLogin, addToast }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [passcode, setPasscode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const handleFacebookLogin = async () => {
    await api.loginWithFacebook();
  };

  // Reset form when switching modes
  useEffect(() => {
    setUsername('');
    setPasscode('');
  }, [isRegistering]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Slight delay for UI feel
    setTimeout(() => {
      processAuth();
    }, 500);
  };

  const processAuth = async () => {
    const trimmedUsername = username.trim();

    // Basic Validation
    if (!trimmedUsername) {
      addToast("Please enter a username", ToastType.WARNING);
      setIsLoading(false);
      return;
    }

    if (!passcode || passcode.length !== 6 || !/^\d+$/.test(passcode)) {
      addToast("Passcode must be exactly 6 digits", ToastType.WARNING);
      setIsLoading(false);
      return;
    }

    try {
      if (isRegistering) {
        // Registration via API
        await api.register(trimmedUsername, passcode);
        addToast("Account created successfully! Logging in...", ToastType.SUCCESS);
        // Auto login after register
        await api.login(trimmedUsername, passcode);
        onLogin(trimmedUsername);
      } else {
        // Login via API
        await api.login(trimmedUsername, passcode);
        addToast("Welcome back!", ToastType.SUCCESS);
        onLogin(trimmedUsername);
      }
    } catch (error: any) {
      addToast(error.message || "Authentication failed", ToastType.ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasscodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and max 6 digits
    if (value === '' || (/^\d+$/.test(value) && value.length <= 6)) {
      setPasscode(value);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 relative overflow-hidden font-sans">
      {/* Animated Background Decoration */}
      <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-[10%] left-[20%] w-[35%] h-[35%] bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl border border-white/50 w-full max-w-md relative z-10 transition-all duration-500 hover:shadow-indigo-100/50">
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${isRegistering ? 'from-pink-500 to-rose-600' : 'from-indigo-500 to-purple-600'} text-white rounded-2xl shadow-lg mb-6 transform -rotate-6 transition-all duration-500`}>
            {isRegistering ? <UserPlus className="w-10 h-10" /> : <Sparkles className="w-10 h-10" />}
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
            {isRegistering ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-gray-500">
            {isRegistering
              ? 'Join LeiradMaster to get organized.'
              : 'Enter your credentials to access your tasks.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="username" className="text-sm font-semibold text-gray-700 ml-1">
              Username
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none text-gray-900 placeholder-gray-400"
                placeholder="Enter username"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="passcode" className="text-sm font-semibold text-gray-700 ml-1">
              6-Digit Passcode
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <KeyRound className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                type="password"
                id="passcode"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={passcode}
                onChange={handlePasscodeChange}
                className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none text-gray-900 placeholder-gray-400 tracking-widest font-mono"
                placeholder="••••••"
                autoComplete="current-password"
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <Lock className={`h-4 w-4 ${passcode.length === 6 ? 'text-green-500' : 'text-gray-300'} transition-colors`} />
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium text-right">Must be exactly 6 digits</p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`
                w-full group relative flex items-center justify-center py-3.5 px-6 border border-transparent rounded-xl text-white font-semibold shadow-lg transition-all duration-200
                ${isLoading ? 'bg-indigo-400 cursor-wait' : isRegistering ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/30 hover:shadow-rose-500/50' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30 hover:shadow-indigo-500/50'}
            `}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              <>
                <span className="mr-2">{isRegistering ? 'Sign Up' : 'Login'}</span>
                {isRegistering ? (
                  <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                ) : (
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                )}
              </>
            )}
          </button>
        </form>

        <div className="mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400 font-semibold uppercase">Or</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          <button
            onClick={handleFacebookLogin}
            className="w-full group relative flex items-center justify-center py-3.5 px-6 rounded-xl border border-blue-600 text-blue-700 bg-blue-50 hover:bg-blue-100 font-semibold transition-all duration-200"
          >
            <span className="mr-2">Continue with Facebook</span>
            <LogIn className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500 mb-3">
            {isRegistering ? "Already have an account?" : "First time using LeiradMaster?"}
          </p>
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 flex items-center justify-center gap-1 mx-auto transition-colors"
          >
            {isRegistering ? (
              <>
                <LogIn className="w-4 h-4" />
                Switch to Login
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Create New Account
              </>
            )}
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default Login;
