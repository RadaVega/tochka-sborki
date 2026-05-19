/**
 * src/components/PageTracker.jsx
 *
 * Drop this ONCE inside <Router> in App.jsx — it auto-tracks every route change.
 *
 * SETUP in App.jsx:
 *   import { PageTracker } from './components/PageTracker';
 *
 *   function App() {
 *     return (
 *       <Router>
 *         <PageTracker />   ← add this line right here
 *         <Layout>
 *           ...routes...
 *         </Layout>
 *       </Router>
 *     );
 *   }
 */

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from '../hooks/useAnalytics';

// Human-readable page names for Metrika reports
const PAGE_NAMES = {
  '/':                 'Главная',
  '/company-path':     'Для компаний',
  '/student-path':     'Для студентов',
  '/how-it-works':     'Как это работает',
  '/ai-architecture':  'Архитектура Hermes',
  '/russian-stack':    'Российский стек',
  '/partners':         'Партнёры',
  '/goals':            'Цели и метрики',
  '/contacts':         'Контакты',
};

export function PageTracker() {
  const location = useLocation();
  const { hit, trackScrollDepth, track } = useAnalytics();
  const prevPath = useRef(null);

  useEffect(() => {
    const path = location.pathname;
    const pageName = PAGE_NAMES[path] || path;

    // Don't double-fire on first render if Metrika already caught it
    if (prevPath.current !== null) {
      hit(path, `Точка Сборки — ${pageName}`);
    }
    prevPath.current = path;

    // Track page view with page name for segmentation
    track('page_view', { page: path, name: pageName });

    // Scroll depth tracking — clean up when route changes
    const cleanup = trackScrollDepth(pageName);
    // Reset scroll to top on navigation
    window.scrollTo(0, 0);

    return cleanup;
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return null; // renders nothing
}
