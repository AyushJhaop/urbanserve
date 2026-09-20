'use client';

import Link from 'next/link';
import { MapPin, Phone, Mail, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="main-footer" className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 text-2xl font-black text-white mb-4">
              <span className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white font-black text-lg shadow-sm">
                U
              </span>
              Urban<span className="text-emerald-400">Serve</span>
            </Link>
            <p className="text-stone-400 text-sm leading-relaxed mb-6">
              On-demand local service marketplace connecting homeowners with background-checked professionals.
            </p>
            <div className="flex items-center gap-2.5 text-xs text-stone-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Platform Online & Operational</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Marketplace</h4>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li><Link href="/services" className="hover:text-emerald-400 transition-colors">All Services</Link></li>
              <li><Link href="/services?type=QUICK" className="hover:text-emerald-400 transition-colors">Quick Service Mode</Link></li>
              <li><Link href="/bookings" className="hover:text-emerald-400 transition-colors">Track My Bookings</Link></li>
              <li><Link href="/services?category=2" className="hover:text-emerald-400 transition-colors">Plumbing & Leaks</Link></li>
              <li><Link href="/services?category=1" className="hover:text-emerald-400 transition-colors">Home Cleaning</Link></li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Portals & Roles</h4>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li><Link href="/professional" className="hover:text-emerald-400 transition-colors">Professional Portal</Link></li>
              <li><Link href="/admin" className="hover:text-emerald-400 transition-colors">Admin Dashboard</Link></li>
              <li><Link href="/login" className="hover:text-emerald-400 transition-colors">Customer Login</Link></li>
              <li><Link href="/register?role=professional" className="hover:text-emerald-400 transition-colors">Become a Partner</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Support & Contact</h4>
            <ul className="space-y-3 text-sm text-stone-400">
              <li className="flex items-center gap-2.5">
                <MapPin size={16} className="text-emerald-500 shrink-0" />
                <span>742 Evergreen Terrace, Springfield</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="text-emerald-500 shrink-0" />
                <span>+1 (800) 555-URBAN</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="text-emerald-500 shrink-0" />
                <span>support@urbanserve.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-stone-800 flex flex-col md:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} UrbanServe Platform. Academic Project — Phase 1. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/services" className="hover:text-stone-300 transition-colors">Terms of Service</Link>
            <Link href="/services" className="hover:text-stone-300 transition-colors">Privacy Policy</Link>
            <Link href="/services" className="hover:text-stone-300 transition-colors">Security Standards</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
