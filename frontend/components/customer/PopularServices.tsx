'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star, Clock, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import apiClient from '@/lib/api/client';

export default function PopularServices() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadServices() {
      try {
        const res = await apiClient.get('/services?limit=6');
        setServices(res.data.data?.services || res.data.data || []);
      } catch (err) {
        setServices([
          {
            id: '1',
            name: 'Deep House Cleaning',
            category_name: 'Home Cleaning',
            base_price: 120,
            estimated_duration_minutes: 180,
            service_type: 'BOTH',
            average_rating: 4.9,
            total_reviews: 48,
          },
          {
            id: '2',
            name: 'Pipe Leak Repair',
            category_name: 'Plumbing',
            base_price: 90,
            estimated_duration_minutes: 90,
            service_type: 'BOTH',
            average_rating: 4.8,
            total_reviews: 32,
          },
          {
            id: '3',
            name: 'Circuit Breaker & Switch Repair',
            category_name: 'Electrical',
            base_price: 85,
            estimated_duration_minutes: 90,
            service_type: 'BOTH',
            average_rating: 4.9,
            total_reviews: 29,
          },
          {
            id: '4',
            name: 'Emergency Plumbing Response',
            category_name: 'Plumbing',
            base_price: 130,
            estimated_duration_minutes: 60,
            service_type: 'QUICK',
            average_rating: 5.0,
            total_reviews: 19,
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, []);

  return (
    <section id="popular-services-section" className="py-24 bg-stone-50/30 animate-section border-b border-stone-200/50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14">
          <div>
            <span className="text-emerald-700 font-bold text-xs tracking-widest uppercase">Top Rated Services</span>
            <h2 className="text-3xl md:text-5xl font-black text-stone-900 mt-2 tracking-tight">Most Requested by Customers</h2>
          </div>
          <Link
            href="/services"
            id="view-all-popular-btn"
            className="mt-4 md:mt-0 btn-secondary px-6 py-2.5 rounded-full text-sm inline-flex items-center gap-2 group cursor-pointer"
          >
            Explore Catalog
            <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform text-emerald-700" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.slice(0, 6).map((service) => (
            <div
              key={service.id}
              id={`service-card-${service.id}`}
              className="bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-soft hover:shadow-medium hover:border-emerald-300 transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between"
            >
              <div className="p-7">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-semibold text-xs rounded-full">
                    {service.category_name || 'Home Service'}
                  </span>
                  {service.service_type === 'QUICK' && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                      <Zap size={13} className="text-amber-600 fill-amber-500" /> Quick Service
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-xl text-stone-900 mb-2 hover:text-emerald-700 transition-colors">
                  <Link href={`/services/${service.id}`}>{service.name}</Link>
                </h3>
                <p className="text-stone-600 text-sm line-clamp-2 mb-6 leading-relaxed">
                  {service.description || 'Professional home service delivered by certified and background-verified technicians.'}
                </p>

                <div className="flex items-center gap-4 text-xs text-stone-500 border-t border-stone-200/60 pt-4 font-medium">
                  <span className="flex items-center gap-1 text-amber-600 font-bold">
                    <Star size={14} className="fill-amber-500 text-amber-500" /> {service.average_rating || '4.9'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} className="text-stone-400" /> {service.estimated_duration_minutes || 60} mins
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <ShieldCheck size={14} className="text-emerald-600" /> Verified Pro
                  </span>
                </div>
              </div>

              <div className="bg-stone-50/80 px-7 py-4.5 flex items-center justify-between border-t border-stone-200/60">
                <div>
                  <span className="text-[11px] text-stone-500 font-semibold uppercase tracking-wider block">Starting from</span>
                  <span className="text-2xl font-black text-stone-900">₹{service.base_price || 499}</span>
                </div>
                <Link
                  href={`/services/${service.id}`}
                  id={`book-service-btn-${service.id}`}
                  className="px-6 py-2.5 btn-primary rounded-xl font-bold text-sm transition-all shadow-md transform hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
