'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Briefcase, Mail, Lock, Phone, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/authStore';
import GoogleAuthModal from '@/components/auth/GoogleAuthModal';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [role, setRole] = useState<'customer' | 'professional'>('customer');
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    bio: '',
    experience_years: 3,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endpoint = role === 'customer' ? '/auth/register/customer' : '/auth/register/professional';
      const payload: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      };

      if (role === 'professional') {
        payload.bio = formData.bio || 'Experienced home service specialist';
        payload.experience_years = Number(formData.experience_years) || 2;
        payload.service_ids = [];
      }

      const res = await apiClient.post(endpoint, payload);
      const { user, token, refreshToken } = res.data.data;
      setAuth(user, token, refreshToken);

      if (role === 'professional') {
        router.push('/professional');
      } else {
        router.push('/services');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please check your fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-32 pb-20 px-4 gradient-soothing-bg flex items-center justify-center">
      <div className="w-full max-w-lg">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 md:p-10 shadow-medium border border-emerald-100">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight">Join UrbanServe</h1>
            <p className="text-stone-600 text-sm mt-1">Select your account type to get started</p>
          </div>

          {/* Role Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-stone-100 rounded-2xl mb-6 border border-stone-200">
            <button
              type="button"
              id="role-tab-customer"
              onClick={() => setRole('customer')}
              className={`py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                role === 'customer'
                  ? 'gradient-primary text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <User size={16} /> I need Services
            </button>
            <button
              type="button"
              id="role-tab-professional"
              onClick={() => setRole('professional')}
              className={`py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                role === 'professional'
                  ? 'gradient-primary text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Briefcase size={16} /> I am a Professional
            </button>
          </div>

          {/* Google Quick Sign Up Button */}
          <button
            type="button"
            id="google-register-btn"
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
              or register with email
            </span>
            <div className="flex-grow border-t border-stone-200"></div>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">First Name</label>
                <input
                  type="text"
                  id="reg-first-name"
                  placeholder="Jane"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">Last Name</label>
                <input
                  type="text"
                  id="reg-last-name"
                  placeholder="Doe"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1.5">Email Address</label>
              <div className="flex items-center px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus-within:border-emerald-500 focus-within:bg-white transition-all">
                <Mail size={18} className="text-stone-400 mr-3 shrink-0" />
                <input
                  type="email"
                  id="reg-email"
                  placeholder="jane@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-transparent flex-1 text-sm outline-none text-stone-900 placeholder-stone-400 font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1.5">Phone Number</label>
              <div className="flex items-center px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus-within:border-emerald-500 focus-within:bg-white transition-all">
                <Phone size={18} className="text-stone-400 mr-3 shrink-0" />
                <input
                  type="tel"
                  id="reg-phone"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                  id="reg-password"
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-transparent flex-1 text-sm outline-none text-stone-900 placeholder-stone-400 font-medium"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Extra Professional Fields */}
            {role === 'professional' && (
              <div className="space-y-4 pt-2 border-t border-stone-200">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1.5">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    id="reg-pro-experience"
                    min="1"
                    max="40"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1.5">
                    Professional Bio & Skills
                  </label>
                  <textarea
                    id="reg-pro-bio"
                    rows={2}
                    placeholder="Describe your trade background and certifications..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              id="register-submit-btn"
              disabled={loading}
              className="w-full py-4 mt-4 btn-primary text-white rounded-2xl font-bold text-sm tracking-wide transition-all shadow-md transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                'Creating Account...'
              ) : (
                <>
                  <CheckCircle2 size={18} /> Complete Registration
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-stone-200 text-center text-xs text-stone-500">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-emerald-700 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Google Auth Dialog Modal */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        defaultRole={role === 'professional' ? 'PROFESSIONAL' : 'CUSTOMER'}
      />
    </main>
  );
}
