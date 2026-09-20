'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Search, Filter, Star, Clock, Zap, ShieldCheck, 
  ArrowRight, CheckCircle2, ChevronRight 
} from 'lucide-react';
import apiClient from '@/lib/api/client';
import { Suspense } from 'react';

function ServicesContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category');
  const initialType = searchParams.get('type');

  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'ALL');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>(initialType || 'ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initData() {
      try {
        const [catRes, svcRes] = await Promise.all([
          apiClient.get('/services/categories'),
          apiClient.get('/services'),
        ]);
        setCategories(catRes.data.data || []);
        setServices(svcRes.data.data?.services || svcRes.data.data || []);
      } catch (err) {
        console.error('Failed to load services:', err);
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, []);

  // Filter logic
  const filteredServices = services.filter((svc) => {
    // Category filter
    if (selectedCategory !== 'ALL' && svc.category_id?.toString() !== selectedCategory) {
      return false;
    }
    // Type filter
    if (serviceTypeFilter === 'QUICK' && svc.service_type !== 'QUICK' && svc.service_type !== 'BOTH') {
      return false;
    }
    if (serviceTypeFilter === 'SCHEDULED' && svc.service_type !== 'SCHEDULED' && svc.service_type !== 'BOTH') {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = svc.name?.toLowerCase().includes(q);
      const matchDesc = svc.description?.toLowerCase().includes(q);
      const matchCat = svc.category_name?.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat) return false;
    }
    return true;
  });

  return (
    <main className="min-h-screen gradient-soothing-bg pt-28 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header Breadcrumbs & Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
            <Link href="/" className="hover:text-emerald-700 font-medium transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span className="text-stone-900 font-bold">Service Catalog</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tight">
            Find & Book Trusted Local Services
          </h1>
          <p className="text-stone-600 text-sm md:text-base mt-1">
            Choose from vetted professionals for standard scheduled jobs or immediate emergency response.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 md:p-6 shadow-soft border border-emerald-100/80 mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1 flex items-center px-4 py-3 bg-stone-50 rounded-2xl border border-stone-200/60 focus-within:border-emerald-500 focus-within:bg-white transition-all">
              <Search className="text-stone-400 mr-3 shrink-0" size={18} />
              <input
                type="text"
                id="services-search-input"
                placeholder="Search plumbing, deep clean, fan install..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none text-stone-900 placeholder-stone-400 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-stone-500 hover:text-stone-900 cursor-pointer font-semibold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Service Type Selector */}
            <div className="flex items-center gap-1.5 bg-stone-100 p-1.5 rounded-2xl">
              <button
                onClick={() => setServiceTypeFilter('ALL')}
                id="filter-type-all"
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  serviceTypeFilter === 'ALL'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                All Types
              </button>
              <button
                onClick={() => setServiceTypeFilter('SCHEDULED')}
                id="filter-type-scheduled"
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  serviceTypeFilter === 'SCHEDULED'
                    ? 'gradient-primary text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Scheduled
              </button>
              <button
                onClick={() => setServiceTypeFilter('QUICK')}
                id="filter-type-quick"
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  serviceTypeFilter === 'QUICK'
                    ? 'gradient-warm text-white shadow-sm'
                    : 'text-amber-700 hover:text-amber-800'
                }`}
              >
                <Zap size={13} className={serviceTypeFilter === 'QUICK' ? 'fill-white' : 'fill-amber-500'} /> ⚡ 10-Min Flash Service
              </button>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-2 border-t border-stone-200/60">
            <button
              onClick={() => setSelectedCategory('ALL')}
              id="category-pill-all"
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              All Categories ({services.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                id={`category-pill-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id.toString())}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id.toString()
                    ? 'gradient-primary text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-emerald-50 hover:text-emerald-800'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Services Results Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-stone-500 text-sm font-medium">Loading services catalog...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl p-8 border border-stone-200 shadow-soft">
            <p className="text-stone-900 font-bold text-lg mb-2">No matching services found</p>
            <p className="text-stone-500 text-sm mb-6">Try clearing your filters or search keywords.</p>
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setServiceTypeFilter('ALL');
                setSearchQuery('');
              }}
              className="px-6 py-2.5 btn-primary text-white rounded-xl text-sm font-bold transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((svc) => (
              <div
                key={svc.id}
                id={`catalog-service-card-${svc.id}`}
                className="bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-soft hover:shadow-medium hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                      {svc.category_name}
                    </span>
                    {(svc.service_type === 'QUICK' || svc.service_type === 'BOTH') && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                        <Zap size={11} className="text-amber-600 fill-amber-500" /> Urgent Available
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-stone-900 mb-2 group-hover:text-emerald-700 transition-colors">
                    <Link href={`/services/${svc.id}`}>{svc.name}</Link>
                  </h3>
                  <p className="text-stone-500 text-xs leading-relaxed line-clamp-2 mb-4">
                    {svc.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-stone-500 pt-3 border-t border-stone-200/60 font-medium">
                    <span className="flex items-center gap-1 text-amber-600 font-bold">
                      <Star size={13} className="fill-amber-500 text-amber-500" /> 4.9
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={13} className="text-stone-400" /> {svc.estimated_duration_minutes || 60} min
                    </span>
                    <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                      <ShieldCheck size={13} className="text-emerald-600" /> Insured
                    </span>
                  </div>
                </div>

                <div className="bg-stone-50/80 px-6 py-4 flex items-center justify-between border-t border-stone-200/60">
                  <div>
                    <span className="text-[10px] text-stone-500 block uppercase font-bold tracking-wider">Price</span>
                    <span className="text-xl font-black text-stone-900">₹{svc.base_price}</span>
                  </div>
                  <Link
                    href={`/services/${svc.id}`}
                    id={`view-service-btn-${svc.id}`}
                    className="px-4 py-2.5 btn-primary rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 transform hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    Select & Book <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ServicesContent />
    </Suspense>
  );
}
