'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, Wrench, Zap, Hammer, Paintbrush, 
  Tv, ShieldAlert, Trees, ArrowRight 
} from 'lucide-react';
import apiClient from '@/lib/api/client';

const iconMap: Record<string, any> = {
  'Home Cleaning': Sparkles,
  'Plumbing': Wrench,
  'Electrical': Zap,
  'Carpentry': Hammer,
  'Painting': Paintbrush,
  'Appliance Repair': Tv,
  'Pest Control': ShieldAlert,
  'Gardening': Trees,
};

const categoryImages: Record<string, string> = {
  'Home Cleaning': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80',
  'Plumbing': 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600&auto=format&fit=crop&q=80',
  'Electrical': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
  'Carpentry': 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&auto=format&fit=crop&q=80',
  'Painting': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80',
  'Appliance Repair': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80',
  'Pest Control': 'https://images.unsplash.com/photo-1632923891392-4a0b677a28e5?w=600&auto=format&fit=crop&q=80',
  'Gardening': 'https://images.unsplash.com/photo-1558904541-efa8c4a52d33?w=600&auto=format&fit=crop&q=80',
};

export default function Categories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await apiClient.get('/services/categories');
        setCategories(res.data.data || []);
      } catch (err) {
        setCategories([
          { id: 1, name: 'Home Cleaning', description: 'Deep sanitization & dusting' },
          { id: 2, name: 'Plumbing', description: 'Leaks, pipes & drainage' },
          { id: 3, name: 'Electrical', description: 'Wiring, fixtures & safety' },
          { id: 4, name: 'Carpentry', description: 'Furniture & woodwork' },
          { id: 5, name: 'Painting', description: 'Interior & exterior walls' },
          { id: 6, name: 'Appliance Repair', description: 'Fridges, washers & ovens' },
          { id: 7, name: 'Pest Control', description: 'Safe pest extermination' },
          { id: 8, name: 'Gardening', description: 'Lawn mowing & landscaping' },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  return (
    <section id="categories-section" className="py-20 bg-stone-50/50 animate-section border-b border-stone-200/50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-emerald-700 font-bold text-xs tracking-widest uppercase">Explore Our Offerings</span>
            <h2 className="text-3xl md:text-4xl font-black text-stone-900 mt-2 tracking-tight">Popular Categories</h2>
          </div>
          <Link
            href="/services"
            id="view-all-categories-btn"
            className="mt-4 md:mt-0 btn-secondary px-6 py-2.5 rounded-full text-sm inline-flex items-center gap-2 group cursor-pointer"
          >
            Browse All Services
            <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform text-emerald-700" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => {
            const Icon = iconMap[cat.name] || Sparkles;
            const imgUrl = categoryImages[cat.name] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600';
            return (
              <Link
                key={cat.id || idx}
                href={`/services?category=${cat.id}`}
                id={`category-card-${cat.id || idx}`}
                className="group rounded-3xl bg-white border border-stone-200/80 hover:border-emerald-300 shadow-soft hover:shadow-medium transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col overflow-hidden"
              >
                {/* Image Banner with Hover Zoom */}
                <div className="h-36 w-full relative overflow-hidden bg-stone-100">
                  <img
                    src={imgUrl}
                    alt={cat.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md flex items-center justify-center text-emerald-700 shadow-sm">
                    <Icon size={20} />
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="font-bold text-stone-900 text-base group-hover:text-emerald-800 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-stone-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                      {cat.description || 'Verified local trade experts'}
                    </p>
                  </div>
                  <span className="mt-4 text-xs font-bold text-emerald-700 opacity-80 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    Explore Services →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
