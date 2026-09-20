'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, LogIn, Shield, Briefcase, UserCheck, ArrowRight } from 'lucide-react';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/authStore';
import GoogleAuthModal from '@/components/auth/GoogleAuthModal';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const handleLogin = async (loginEmail?: string, loginPassword?: string) => {
    const submitEmail = loginEmail || email;
    const submitPassword = loginPassword || password;

    if (!submitEmail || !submitPassword) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiClient.post('/auth/login', {
        email: submitEmail,
        password: submitPassword,
      });

      const { user, token, refreshToken } = res.data.data;
      setAuth(user, token, refreshToken);

      // Route by role
      if (user.role === 'ADMIN') {
        router.push('/admin');
      } else if (user.role === 'PROFESSIONAL') {
        router.push('/professional');
      } else {
        router.push('/services');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-32 pb-20 px-4 gradient-soothing-bg flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 md:p-10 shadow-medium border border-emerald-100 relative">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl gradient-primary text-white flex items-center justify-center mx-auto mb-4 font-black text-2xl shadow-md shadow-emerald-600/25">
              U
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight">Welcome Back</h1>
            <p className="text-stone-600 text-sm mt-1">Sign in to your UrbanServe account</p>
            <div className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-semibold text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Secured with Google OAuth & JWT
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            id="google-signin-btn"
            onClick={() => setIsGoogleModalOpen(true)}
            className="w-full py-3.5 px-4 mb-5 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200 hover:border-emerald-300 text-stone-800 font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-xs hover:shadow-md cursor-pointer group"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex py-2 items-center mb-5">
            <div className="flex-grow border-t border-stone-200"></div>
            <span className="flex-shrink mx-4 text-xs font-semibold text-stone-400 uppercase tracking-wider">
              or continue with email
            </span>
            <div className="flex-grow border-t border-stone-200"></div>
          </div>

          {/* Quick Demo Logins */}
          <div className="mb-6 p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
            <span className="text-[11px] font-bold text-stone-500 tracking-wider uppercase block mb-2.5 text-center">
              ⚡ Quick 1-Click Demo Logins
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                id="demo-login-customer"
                onClick={() => {
                  setEmail('customer@test.com');
                  setPassword('Customer@123');
                  handleLogin('customer@test.com', 'Customer@123');
                }}
                className="p-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-stone-200 text-xs font-bold text-stone-800 hover:text-emerald-800 hover:border-emerald-300 transition-all flex flex-col items-center gap-1 shadow-xs cursor-pointer"
              >
                <UserCheck size={16} className="text-emerald-600" />
                <span>Customer</span>
              </button>
              <button
                type="button"
                id="demo-login-pro"
                onClick={() => {
                  setEmail('professional@test.com');
                  setPassword('Professional@123');
                  handleLogin('professional@test.com', 'Professional@123');
                }}
                className="p-2.5 rounded-xl bg-white hover:bg-teal-50 border border-stone-200 text-xs font-bold text-stone-800 hover:text-teal-800 hover:border-teal-300 transition-all flex flex-col items-center gap-1 shadow-xs cursor-pointer"
              >
                <Briefcase size={16} className="text-teal-600" />
                <span>Professional</span>
              </button>
              <button
                type="button"
                id="demo-login-admin"
                onClick={() => {
                  setEmail('admin@urbanserve.com');
                  setPassword('Admin@123');
                  handleLogin('admin@urbanserve.com', 'Admin@123');
                }}
                className="p-2.5 rounded-xl bg-white hover:bg-amber-50 border border-stone-200 text-xs font-bold text-stone-800 hover:text-amber-800 hover:border-amber-300 transition-all flex flex-col items-center gap-1 shadow-xs cursor-pointer"
              >
                <Shield size={16} className="text-amber-600" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1.5">Email Address</label>
              <div className="flex items-center px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus-within:border-emerald-500 focus-within:bg-white transition-all">
                <Mail size={18} className="text-stone-400 mr-3 shrink-0" />
                <input
                  type="email"
                  id="login-email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent flex-1 text-sm outline-none text-stone-900 placeholder-stone-400 font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1.5">Password</label>
              <div className="flex items-center px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus-within:border-emerald-500 focus-within:bg-white transition-all">
                <Lock size={18} className="text-stone-400 mr-3 shrink-0" />
                <input
                  type="password"
                  id="login-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent flex-1 text-sm outline-none text-stone-900 placeholder-stone-400 font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              id="login-submit-btn"
              disabled={loading}
              className="w-full py-4 mt-2 btn-primary disabled:opacity-50 text-white rounded-2xl font-bold text-sm tracking-wide transition-all shadow-md transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                'Signing in...'
              ) : (
                <>
                  <LogIn size={18} /> Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-stone-200 text-center text-xs text-stone-500">
            Don't have an account yet?{' '}
            <Link href="/register" className="font-bold text-emerald-700 hover:underline">
              Create an Account
            </Link>
          </div>
        </div>
      </div>

      {/* Google Auth Dialog Modal */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
      />
    </main>
  );
}
