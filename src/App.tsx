import AnalyticsTracker from './components/AnalyticsTracker';
import DemoNoticeModal from './components/DemoNoticeModal';
import React, { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

import { DevEmptyStateText } from './components/DevEmptyStateText';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Storefront from './Storefront.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import ManagerDashboard from './components/ManagerDashboard.tsx';
import PrivacyPolicy from './components/PrivacyPolicy.tsx';

export default function App() {

  useEffect(() => {
    if (window.location.pathname.includes('/admin') || window.location.pathname.includes('/manager')) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <>
      <Toaster position="top-center" />
      <DemoNoticeModal />
      <BrowserRouter>
        <AnalyticsTracker />
        <Routes>
          <Route path="/" element={<Storefront />} />
          <Route path="/htd-ctrl-9x7k2m/admin" element={<AdminDashboard />} />
          <Route path="/htd-ctrl-9x7k2m/manager" element={<ManagerDashboard />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="*" element={<div className="flex items-center justify-center h-screen bg-stone-50"><p className="text-xl font-medium text-stone-500"><DevEmptyStateText /></p></div>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
