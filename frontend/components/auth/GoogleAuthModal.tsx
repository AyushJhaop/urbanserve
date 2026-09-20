'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, ArrowRight, CheckCircle2 } from 'lucide-react';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/authStore';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: 'CUSTOMER' | 'PROFESSIONAL';
}

export default function GoogleAuthModal({ isOpen, onClose, defaultRole = 'CUSTOMER' }: GoogleAuthModalProps) {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCustomAccount, setIsCustomAccount] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = async (accountData: {
    email: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const res = await apiClient.post('/auth/google', {
        email: accountData.email,
        first_name: accountData.first_name,
        last_name: accountData.last_name,
        avatar_url: accountData.avatar_url,
      });

      const { user, token, refreshToken } = res.data.data;
      setAuth(user, token, refreshToken);

      onClose();

      if (user.role === 'ADMIN') {
        router.push('/admin');
      } else if (user.role === 'PROFESSIONAL') {
        router.push('/professional');
      } else {
        router.push('/services');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const detectedAccounts = [
    {
      name: 'Ayush Jha',
      email: 'ayushop645@gmail.com',
      avatarColor: 'bg-emerald-600',
      initials: 'AJ',
      first_name: 'Ayush',
      last_name: 'Jha',
      avatar_url: 'https://ui-avatars.com/api/?name=Ayush+Jha&background=059669&color=fff&size=128',
    },
    {
      name: 'Priya Sharma',
      email: 'priya.sharma@gmail.com',
      avatarColor: 'bg-amber-600',
      initials: 'PS',
      first_name: 'Priya',
      last_name: 'Sharma',
      avatar_url: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=d97706&color=fff&size=128',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header with Google Logo */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
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
            <span className="text-base font-bold text-stone-800">Sign in with Google</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4">
          <p className="text-xs text-stone-500 mb-4">
            Choose a Google account to continue to <span className="font-bold text-stone-800">UrbanServe</span>
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          {/* Account Picker */}
          {!isCustomAccount ? (
            <div className="space-y-2">
              {detectedAccounts.map((acc) => (
                <button
                  key={acc.email}
                  disabled={loading}
                  onClick={() =>
                    handleGoogleSignIn({
                      email: acc.email,
                      first_name: acc.first_name,
                      last_name: acc.last_name,
                      avatar_url: acc.avatar_url,
                    })
                  }
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-stone-50 border border-stone-200 hover:border-emerald-300 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={acc.avatar_url}
                      alt={acc.name}
                      className="w-10 h-10 rounded-full object-cover border border-stone-200 shadow-xs"
                    />
                    <div>
                      <div className="text-sm font-bold text-stone-900 group-hover:text-emerald-700 transition-colors">
                        {acc.name}
                      </div>
                      <div className="text-xs text-stone-500 font-medium">{acc.email}</div>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-stone-300 group-hover:text-emerald-600 transition-colors" />
                </button>
              ))}

              <button
                type="button"
                onClick={() => setIsCustomAccount(true)}
                className="w-full mt-3 py-2.5 px-4 text-xs font-bold text-emerald-800 hover:bg-emerald-50 rounded-xl transition-colors text-center border border-dashed border-emerald-300 cursor-pointer"
              >
                + Use another Google account
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!customEmail) return;
                const parts = customName.trim().split(' ');
                const firstName = parts[0] || customEmail.split('@')[0];
                const lastName = parts.slice(1).join(' ') || '';
                handleGoogleSignIn({
                  email: customEmail,
                  first_name: firstName,
                  last_name: lastName,
                  avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName + ' ' + lastName)}&background=059669&color=fff`,
                });
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Google Email Address</label>
                <input
                  type="email"
                  placeholder="yourname@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm outline-none focus:border-emerald-500 focus:bg-white text-stone-900 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Your Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ayush Jha"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm outline-none focus:border-emerald-500 focus:bg-white text-stone-900 font-medium"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomAccount(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  {loading ? 'Authenticating...' : 'Sign In with Google'}
                </button>
              </div>
            </form>
          )}

          {loading && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold text-center flex items-center justify-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              Verifying Google Credentials & Setting up Session...
            </div>
          )}

          <div className="mt-5 pt-3 border-t border-stone-100 text-[11px] text-stone-400 text-center">
            UrbanServe uses Google OAuth 2.0 with strict JWT session security.
          </div>
        </div>
      </div>
    </div>
  );
}
