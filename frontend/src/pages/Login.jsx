import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Truck, LogIn, AlertCircle } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // In a real app, this points to your backend. 
      // If no users exist, you might need to hit /register first manually or create a seed script.
      const { data } = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });
      
      login(data);
      navigate('/');
    } catch (err) {
      console.error("Login Error Details:", err.response?.data || err.message);
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] dark:bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
      {/* Glassmorphic Container */}
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white/60 p-8 shadow-2xl backdrop-blur-xl ring-1 ring-slate-900/5 dark:bg-slate-900/60 dark:ring-white/10 sm:p-10">
        
        {/* Brand Header */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
            <Truck className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            TransitOps
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Enterprise Fleet Management
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="flex items-center gap-3 rounded-xl bg-red-50/80 p-4 text-sm text-red-800 backdrop-blur-md dark:bg-red-900/30 dark:text-red-300 ring-1 ring-red-500/20">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
              <p>{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-2xl border-0 bg-white/50 px-4 py-3.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300/50 backdrop-blur-md placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-slate-800/50 dark:text-white dark:ring-slate-700/50 dark:focus:bg-slate-800 sm:text-sm sm:leading-6 transition-all duration-200"
                placeholder="admin@transitops.com"
              />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-2xl border-0 bg-white/50 px-4 py-3.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300/50 backdrop-blur-md placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-slate-800/50 dark:text-white dark:ring-slate-700/50 dark:focus:bg-slate-800 sm:text-sm sm:leading-6 transition-all duration-200"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative flex w-full justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-500/30 hover:from-indigo-500 hover:to-purple-500 hover:shadow-indigo-500/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <span className="flex items-center gap-2">
                Sign in <LogIn className="h-4 w-4" />
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
