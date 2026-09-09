import React, { useEffect, Suspense, lazy } from 'react';
import AnalyticsTracker from './components/AnalyticsTracker';
import Lenis from 'lenis';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

import { DevEmptyStateText } from './components/DevEmptyStateText';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

const Storefront = lazy(() => import('./Storefront.tsx'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard.tsx'));
const ManagerDashboard = lazy(() => import('./components/ManagerDashboard.tsx'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy.tsx'));

const Loader = () => (
  <div className="flex items-center justify-center h-screen bg-stone-50">
    <div className="w-12 h-12 border-4 border-dhaba-orange/30 border-t-dhaba-orange rounded-full animate-spin"></div>
  </div>
);

/** Injects or removes a <meta name="robots" content="noindex"> for admin routes */
function RobotsManager() {
  const location = useLocation();
  useEffect(() => {
    const isPrivate = location.pathname.startsWith('/htd-ctrl-9x7k2m');
    let metaRobots = document.querySelector<HTMLMetaElement>('meta[name="robots"][data-dynamic]');
    if (isPrivate) {
      if (!metaRobots) {
        metaRobots = document.createElement('meta');
        metaRobots.name = 'robots';
        metaRobots.setAttribute('data-dynamic', 'true');
        document.head.appendChild(metaRobots);
      }
      metaRobots.content = 'noindex, nofollow';
    } else {
      metaRobots?.remove();
    }
  }, [location.pathname]);
  return null;
}

/** Proper 404 page */
function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-stone-50 text-stone-700 px-4 text-center">
      <h1 className="text-6xl font-bold text-stone-300 mb-4">404</h1>
      <h2 className="text-2xl font-serif font-bold text-stone-700 mb-3">Page Not Found</h2>
      <p className="text-stone-500 mb-8 max-w-sm">Sorry, the page you are looking for does not exist or has been moved.</p>
      <a
        href="/"
        className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-full transition-colors duration-200"
      >
        ← Back to Home
      </a>
    </div>
  );
}

/** Manages Lenis smooth scroll based on route */
function LenisScroller() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.includes('/admin') || location.pathname.includes('/manager')) {
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

    let rafId: number;

    lenis.on('scroll', ScrollTrigger.update);

    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      cancelAnimationFrame(rafId);
    };
  }, [location.pathname]);

  return null;
}

export default function App() {
  return (
    <>
      <Toaster position="top-center" />
      <BrowserRouter>
        <RobotsManager />
        <LenisScroller />
        <AnalyticsTracker />
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Storefront />} />
            <Route path="/htd-ctrl-9x7k2m/admin" element={<AdminDashboard />} />
            <Route path="/htd-ctrl-9x7k2m/manager" element={<ManagerDashboard />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  );
}
