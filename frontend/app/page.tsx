'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Hero from '@/components/customer/Hero';
import Categories from '@/components/customer/Categories';
import HowItWorks from '@/components/customer/HowItWorks';
import PopularServices from '@/components/customer/PopularServices';
import Features from '@/components/customer/Features';
import CallToAction from '@/components/customer/CallToAction';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Smooth scroll reveal animations
    const sections = mainRef.current?.querySelectorAll('.animate-section');
    
    sections?.forEach((section) => {
      gsap.fromTo(
        section,
        {
          opacity: 0,
          y: 50,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            end: 'top 20%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <main ref={mainRef} className="min-h-screen bg-neutral-lighter">
      <Hero />
      <Categories />
      <HowItWorks />
      <PopularServices />
      <Features />
      <CallToAction />
    </main>
  );
}
