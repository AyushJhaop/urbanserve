'use client';

import { ShieldCheck, Zap, HeartHandshake, Headphones, BadgeDollarSign, Award } from 'lucide-react';

const features = [
  {
    icon: ShieldCheck,
    title: '100% Verified Professionals',
    description: 'Every expert is vetted through identity verification, background checks, and trade license audits.',
  },
  {
    icon: Zap,
    title: 'Urgent Quick-Service Mode',
    description: 'Burst pipe or power blackout? Our real-time dispatch matches a nearby technician in under 5 minutes.',
  },
  {
    icon: BadgeDollarSign,
    title: 'Transparent Upfront Pricing',
    description: 'No surprise fees or hidden invoices. You know the exact baseline price before booking.',
  },
  {
    icon: Award,
    title: 'Quality & Happiness Guarantee',
    description: 'If you are unsatisfied with the workmanship, our platform resolution team will make it right.',
  },
  {
    icon: Headphones,
    title: 'Embedded AI Assistant',
    description: 'Our conversational AI helps you discover the right service, checks live booking status, and provides 24/7 support.',
  },
  {
    icon: HeartHandshake,
    title: 'Direct Pro Empowerment',
    description: 'We ensure fair compensation for local technicians with low platform fees and instant payouts.',
  },
];

export default function Features() {
  return (
    <section id="features-section" className="py-24 bg-stone-50/60 animate-section border-b border-stone-200/50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-emerald-700 font-bold text-xs tracking-widest uppercase">Why Choose UrbanServe</span>
          <h2 className="text-3xl md:text-5xl font-black text-stone-900 mt-2 mb-4 tracking-tight">
            The Modern Standard for Local Services
          </h2>
          <p className="text-stone-600 text-base md:text-lg">
            Built from the ground up for trust, rapid response, and complete peace of mind.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            const iconBg = index % 3 === 0 
              ? 'bg-emerald-100/80 text-emerald-700' 
              : index % 3 === 1 
              ? 'bg-amber-100/80 text-amber-700' 
              : 'bg-teal-100/80 text-teal-700';

            return (
              <div
                key={feat.title}
                id={`feature-item-${index + 1}`}
                className="p-8 rounded-3xl bg-white border border-stone-200/80 shadow-soft hover:shadow-medium hover:border-emerald-300 transition-all transform hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center mb-6 shadow-xs`}>
                  <Icon size={26} />
                </div>
                <h3 className="font-bold text-lg text-stone-900 mb-2.5">{feat.title}</h3>
                <p className="text-stone-500 text-xs leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
