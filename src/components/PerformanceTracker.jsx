import { useEffect } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';

export function PerformanceTracker() {
  const { track } = useAnalytics();

  useEffect(() => {
    const observers = [];

    const observe = (type, handler) => {
      if (!('PerformanceObserver' in window)) return;
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach(handler);
        });
        observer.observe({ type, buffered: true });
        observers.push(observer);
      } catch {
        // silent: unsupported browser entry type
      }
    };

    observe('paint', (entry) => {
      if (entry.name === 'first-contentful-paint') {
        track('web_vital_fcp', { value: Math.round(entry.startTime) });
      }
    });

    observe('largest-contentful-paint', (entry) => {
      track('web_vital_lcp', { value: Math.round(entry.startTime) });
    });

    observe('layout-shift', (entry) => {
      if (!entry.hadRecentInput && entry.value > 0) {
        track('web_vital_cls', { value: Number(entry.value.toFixed(4)) });
      }
    });

    observe('first-input', (entry) => {
      track('web_vital_fid', { value: Math.round(entry.processingStart - entry.startTime) });
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [track]);

  return null;
}
