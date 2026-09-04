import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function generateToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function getBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("SamsungBrowser")) return "Samsung Internet";
  if (ua.includes("Opera") || ua.includes("OPR")) return "Opera";
  if (ua.includes("Trident")) return "Internet Explorer";
  if (ua.includes("Edge") || ua.includes("Edg")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  return "Unknown";
}

function getOS() {
  const ua = navigator.userAgent;
  if (ua.includes("Win")) return "Windows";
  if (ua.includes("Mac")) return "MacOS";
  if (ua.includes("X11")) return "UNIX";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  return "Unknown";
}

function getDeviceType() {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "Tablet";
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return "Mobile";
  return "Desktop";
}

export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    let visitorToken = localStorage.getItem('visitor_token');
    if (!visitorToken) {
      visitorToken = generateToken();
      localStorage.setItem('visitor_token', visitorToken);
    }

    let sessionToken = sessionStorage.getItem('session_token');
    let isNewSession = false;
    if (!sessionToken) {
      sessionToken = generateToken();
      sessionStorage.setItem('session_token', sessionToken);
      isNewSession = true;
    }

    const trackVisit = async () => {
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            visitorToken,
            sessionToken,
            deviceType: getDeviceType(),
            os: getOS(),
            browser: getBrowser(),
            referrer: document.referrer || 'Direct',
            landingPage: isNewSession ? window.location.pathname : undefined,
            path: window.location.pathname
          })
        });
      } catch (e) {
        // Silently ignore tracking errors to prevent console spam during dev server restarts
      }
    };

    trackVisit();

    const pingInterval = setInterval(async () => {
      try {
        await fetch('/api/analytics/ping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionToken: sessionStorage.getItem('session_token'),
            path: window.location.pathname
          })
        });
      } catch (e) {
        // Silently ignore ping errors
      }
    }, 120000); // ping every 2 minutes

    return () => clearInterval(pingInterval);
  }, [location.pathname]);

  return null;
}
