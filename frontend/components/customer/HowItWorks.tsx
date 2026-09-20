'use client';

import { Search, CalendarCheck, ShieldCheck, Star } from 'lucide-react';

const steps = [
  {
    step: '01',
    title: 'Choose a Service',
    description: 'Select from over 30+ home services or request an urgent Quick-Service for immediate emergencies.',
    icon: Search,
  },
  {
    step: '02',
    title: 'Select Slot & Location',
    description: 'Pick your preferred date and time or request immediate dispatch. Provide your service address.',
    icon: CalendarCheck,
  },
  {
    step: '03',
    title: 'Verified Pro Arrives',
    description: 'A background-checked, insured professional arrives equipped to complete your job with care.',
    icon: ShieldCheck,
  },
  {
    step: '04',
    title: 'Pay & Review',
    description: 'Secure, hassle-free checkout with clear upfront pricing. Rate your professional to reward top talent.',
    icon: Star,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works-section" className="py-24 bg-white animate-section border-b border-stone-200/50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-emerald-700 font-bold text-xs tracking-widest uppercase">Simple & Seamless</span>
          <h2 className="text-3xl md:text-5xl font-black text-stone-900 mt-2 mb-4 tracking-tight">How UrbanServe Works</h2>
          <p className="text-stone-600 text-base md:text-lg">
            Book professional home maintenance in four transparent, effortless steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                id={`how-it-works-step-${index + 1}`}
                className="relative flex flex-col items-center text-center p-7 rounded-3xl bg-white border border-stone-200/80 shadow-soft hover:shadow-medium hover:border-emerald-300 transition-all transform hover:-translate-y-1"
              >
                <div className="absolute -top-3.5 right-6 gradient-primary text-white text-xs font-black px-3 py-0.5 rounded-full shadow-xs">
                  {item.step}
                </div>
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center mb-6 shadow-inner">
                  <Icon size={28} />
                </div>
                <h3 className="font-bold text-lg text-stone-900 mb-2.5">{item.title}</h3>
                <p className="text-stone-500 text-xs leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
