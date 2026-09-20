'use client';

import Link from 'next/link';
import { Sparkles, ArrowRight, Shield } from 'lucide-react';

export default function CallToAction() {
  return (
    <section id="cta-section" className="py-20 bg-white animate-section">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-stone-900 via-emerald-950 to-stone-900 p-10 md:p-16 text-white shadow-strong border border-emerald-900/60">
          {/* Decorative glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold uppercase tracking-wider mb-6 backdrop-blur-md">
              <Sparkles size={14} className="text-emerald-400" /> Get Started in 60 Seconds
            </div>

            <h2 className="text-3xl md:text-5xl font-black leading-tight mb-6 tracking-tight">
              Ready for Hassle-Free Home Services?
            </h2>

            <p className="text-stone-300 text-base md:text-lg mb-10 leading-relaxed max-w-2xl mx-auto">
              Join thousands of satisfied homeowners who trust UrbanServe for dependable, on-demand maintenance and verified expert repairs.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/services"
                id="cta-book-service-btn"
                className="w-full sm:w-auto px-8 py-4 btn-primary text-white rounded-2xl font-bold text-sm tracking-wide transition-all shadow-md transform hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
              >
                Book a Service Now
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/register?role=professional"
                id="cta-join-pro-btn"
                className="w-full sm:w-auto px-8 py-4 bg-white/15 hover:bg-white/25 text-white rounded-2xl font-bold text-sm tracking-wide transition-all backdrop-blur-md border border-white/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Shield size={18} className="text-emerald-400" />
                Join as a Professional
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
