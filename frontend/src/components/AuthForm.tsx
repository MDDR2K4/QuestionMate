'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Lottie from 'lottie-react';
import { motion, AnimatePresence } from 'framer-motion';
import animationData from '../../public/auth-animation.json';

export default function AuthForm() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    const endpoint = isLoginMode ? '/users/login' : '/users/signup';
    const body = isLoginMode ? new URLSearchParams({ username, password }) : JSON.stringify({ username, password });
    try {
      const response = await fetch(`http://127.0.0.1:8000${endpoint}`, {
        method: 'POST',
        headers: isLoginMode ? {} : { 'Content-Type': 'application/json' },
        body,
      });
      const data = await response.json();
      if (!response.ok) { throw new Error(data.detail || 'An error occurred.'); }
      if (isLoginMode) {
        login(data.access_token);
        router.push('/');
      } else {
        setIsLoginMode(true);
        setUsername('');
        setPassword('');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full max-w-4xl mt-10">
      <div className="grid md:grid-cols-2 gap-10 items-center bg-white p-8 rounded-xl shadow-2xl">
        <div className="hidden md:block">
          <Lottie animationData={animationData} loop={true} />
        </div>
        <div>
          <div className="flex border-b border-gray-200 mb-6">
            <button onClick={() => setIsLoginMode(true)} className={`flex-1 py-2 text-center font-semibold transition-colors ${isLoginMode ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}>Login</button>
            <button onClick={() => setIsLoginMode(false)} className={`flex-1 py-2 text-center font-semibold transition-colors ${!isLoginMode ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}>Sign Up</button>
          </div>
          <AnimatePresence mode="wait">
            <motion.h2 key={isLoginMode ? 'login' : 'signup'} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="text-2xl font-bold text-center mb-6">{isLoginMode ? 'Welcome Back!' : 'Create Your Account'}</motion.h2>
          </AnimatePresence>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <AnimatePresence>
              {error && (<motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-red-500 text-sm text-center">{error}</motion.p>)}
            </AnimatePresence>
            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400">{isLoading ? 'Processing...' : isLoginMode ? 'Login' : 'Sign Up'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}