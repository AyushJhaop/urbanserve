'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Search, MapPin, Zap } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate hero content
      gsap.from('.hero-title', {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power3.out',
      });

      gsap.from('.hero-subtitle', {
        opacity: 0,
        y: 30,
        duration: 1,
        delay: 0.3,
        ease: 'power3.out',
      });

      gsap.from('.hero-search', {
        opacity: 0,
        y: 30,
        duration: 1,
        delay: 0.6,
        ease: 'power3.out',
      });

      gsap.from('.hero-features', {
        opacity: 0,
        y: 20,
        duration: 1,
        delay: 0.9,
        stagger: 0.2,
        ease: 'power3.out',
      });

      // Floating animation for decorative elements
      gsap.to('.floating', {
        y: -20,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search
    console.log('Search:', searchQuery, location);
  };

  return (
    <div ref={heroRef} className="relative gradient-soothing-bg overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32">
      {/* Decorative Soothing Elements (Emerald & Amber ambient lights) */}
      <div className="absolute top-16 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl floating pointer-events-none" />
      <div className="absolute bottom-16 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl floating pointer-events-none" style={{ animationDelay: '1s' }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <div className="hero-title mb-6">
            <h1 className="text-5xl md:text-7xl font-black text-stone-900 leading-tight mb-4 tracking-tight">
              Quality Services
              <br />
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 bg-clip-text text-transparent">
                At Your Doorstep
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="hero-subtitle text-lg md:text-2xl text-stone-600 mb-10 max-w-2xl mx-auto leading-relaxed font-normal">
            Connect with verified local professionals for all your home service needs. 
            From emergency repairs to deep home care, we've got you covered.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hero-search mb-12">
            <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-strong p-3 flex flex-col md:flex-row gap-3 max-w-3xl mx-auto border border-emerald-100/80">
              {/* Service Search */}
              <div className="flex-1 flex items-center px-4 py-3 bg-stone-50 rounded-2xl border border-stone-200/60 focus-within:border-emerald-500 focus-within:bg-white transition-all">
                <Search className="text-stone-400 mr-3 shrink-0" size={20} />
                <input
                  type="text"
                  placeholder="What service do you need?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-stone-900 placeholder-stone-400 text-sm font-medium"
                />
              </div>

              {/* Location Search */}
              <div className="flex-1 flex items-center px-4 py-3 bg-stone-50 rounded-2xl border border-stone-200/60 focus-within:border-emerald-500 focus-within:bg-white transition-all">
                <MapPin className="text-stone-400 mr-3 shrink-0" size={20} />
                <input
                  type="text"
                  placeholder="Your location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-stone-900 placeholder-stone-400 text-sm font-medium"
                />
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="px-8 py-4 btn-primary rounded-2xl font-bold text-sm tracking-wide transition-all transform hover:scale-105 shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Search size={18} /> Search Services
              </button>
            </div>
          </form>

          {/* Quick Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="hero-features bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-soft hover:shadow-medium border border-stone-200/80 hover:border-amber-200 transition-all transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-inner">
                <Zap className="fill-amber-500 text-amber-600" size={24} />
              </div>
              <h3 className="font-bold text-stone-900 mb-1.5">5-Min Quick Dispatch</h3>
              <p className="text-stone-600 text-xs leading-relaxed">Urgent emergency response radar matching available pros within minutes</p>
            </div>

            <div className="hero-features bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-soft hover:shadow-medium border border-stone-200/80 hover:border-emerald-200 transition-all transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-inner">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-stone-900 mb-1.5">Verified Pros</h3>
              <p className="text-stone-600 text-xs leading-relaxed">100% background-checked, insured, and KYC-approved technicians</p>
            </div>

            <div className="hero-features bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-soft hover:shadow-medium border border-stone-200/80 hover:border-teal-200 transition-all transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-inner">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-stone-900 mb-1.5">Fair Pricing</h3>
              <p className="text-stone-600 text-xs leading-relaxed">Transparent upfront quotes with zero hidden surcharges or surprise fees</p>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 md:h-24">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#ffffff"></path>
        </svg>
      </div>
    </div>
  );
}
