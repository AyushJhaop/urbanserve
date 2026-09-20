'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, User, LogOut, Shield, Briefcase, Calendar, Zap, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';

export default function Header() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, clearAuth } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    clearAuth();
    router.push('/');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-soft py-3 border-b border-emerald-100/60'
          : 'bg-white/85 backdrop-blur-sm py-4 border-b border-stone-200/40'
      }`}
    >
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform shadow-md shadow-emerald-600/25">
              <span className="text-white font-black text-xl">U</span>
            </div>
            <span className="text-2xl font-black tracking-tight text-stone-900">
              Urban<span className="text-emerald-700">Serve</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {/* If Authenticated: Show Portal Links */}
            {isAuthenticated ? (
              <>
                <Link
                  href="/bookings"
                  id="nav-bookings"
                  className="text-stone-700 hover:text-emerald-700 transition-colors font-semibold text-sm flex items-center gap-1.5"
                >
                  <Calendar size={15} className="text-emerald-600" />
                  My Bookings
                </Link>

                {(user?.role === 'PROFESSIONAL' || user?.role === 'ADMIN') && (
                  <Link
                    href="/professional"
                    id="nav-pro-portal"
                    className="text-stone-700 hover:text-teal-700 transition-colors font-semibold text-sm flex items-center gap-1.5"
                  >
                    <Briefcase size={15} className="text-teal-600" />
                    Pro Portal
                  </Link>
                )}

                {user?.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    id="nav-admin-dashboard"
                    className="text-stone-700 hover:text-amber-700 transition-colors font-semibold text-sm flex items-center gap-1.5"
                  >
                    <Shield size={15} className="text-amber-600" />
                    Admin
                  </Link>
                )}
              </>
            ) : (
              /* If Not Authenticated: Show Landing Informational Anchors */
              <>
                <a
                  href="/#how-it-works"
                  id="nav-how-it-works"
                  className="text-stone-700 hover:text-emerald-700 transition-colors font-semibold text-sm"
                >
                  How It Works
                </a>
                <a
                  href="/#features"
                  id="nav-features"
                  className="text-stone-700 hover:text-emerald-700 transition-colors font-semibold text-sm"
                >
                  Why UrbanServe
                </a>
              </>
            )}
          </nav>

          {/* Auth Controls */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
                  <User size={15} className="text-emerald-700" />
                  <span className="text-xs font-bold text-stone-800">
                    {user?.first_name || user?.email?.split('@')[0] || 'Member'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black tracking-wider uppercase shadow-xs">
                    {user?.role || 'CUSTOMER'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  id="header-logout-btn"
                  className="p-2 text-stone-500 hover:text-red-700 transition-colors rounded-xl hover:bg-red-50 cursor-pointer"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  id="nav-login-btn"
                  className="px-5 py-2 text-stone-700 hover:text-emerald-700 transition-colors font-semibold text-sm"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  id="nav-register-btn"
                  className="px-5 py-2.5 btn-primary rounded-full font-semibold text-sm shadow-md"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-stone-700 hover:text-emerald-700 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 px-3 bg-white rounded-2xl shadow-strong border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
            <nav className="flex flex-col space-y-2">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/bookings"
                    className="px-4 py-2.5 rounded-xl hover:bg-emerald-50 text-stone-800 font-semibold text-sm flex items-center gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Calendar size={16} className="text-emerald-600" /> My Bookings
                  </Link>
                  {(user?.role === 'PROFESSIONAL' || user?.role === 'ADMIN') && (
                    <Link
                      href="/professional"
                      className="px-4 py-2.5 rounded-xl hover:bg-teal-50 text-stone-800 font-semibold text-sm flex items-center gap-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Briefcase size={16} className="text-teal-600" /> Professional Portal
                    </Link>
                  )}
                  {user?.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="px-4 py-2.5 rounded-xl hover:bg-amber-50 text-stone-800 font-semibold text-sm flex items-center gap-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Shield size={16} className="text-amber-600" /> Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-red-600 font-bold text-sm hover:bg-red-50 rounded-xl"
                  >
                    Sign Out ({user?.email})
                  </button>
                </>
              ) : (
                <>
                  <a
                    href="/#how-it-works"
                    className="px-4 py-2.5 rounded-xl hover:bg-emerald-50 text-stone-800 font-semibold text-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    How It Works
                  </a>
                  <a
                    href="/#features"
                    className="px-4 py-2.5 rounded-xl hover:bg-emerald-50 text-stone-800 font-semibold text-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Why UrbanServe
                  </a>
                  <div className="flex gap-2 pt-2 border-t border-stone-200">
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex-1 py-2.5 text-center bg-stone-100 rounded-xl font-bold text-xs text-stone-800"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex-1 py-2.5 text-center btn-primary text-white rounded-xl font-bold text-xs shadow-md"
                    >
                      Get Started
                    </Link>
                  </div>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
