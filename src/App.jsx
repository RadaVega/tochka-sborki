/**
 * src/App.jsx — updated with:
 *   1. PageTracker (Яндекс Метрика auto page-hit on every route change)
 *   2. AnimatePresence for smooth page transitions
 *   3. React.lazy() code-splitting per route (reduces initial JS bundle)
 *   4. ErrorBoundary wrapping each lazy page
 */

import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import { Layout }      from './components/Layout';
import { PageTracker } from './components/PageTracker'; // ← NEW
import { ErrorBoundary } from './components/ErrorBoundary'; // ← NEW (file below)

// ── Lazy-loaded pages (code-split per route) ───────
// Each page only loads when the user navigates to it.
const HomePage         = lazy(() => import('./pages/Pages').then(m => ({ default: m.HomePage })));
const CompanyPathPage  = lazy(() => import('./pages/Pages').then(m => ({ default: m.CompanyPathPage })));
const StudentPathPage  = lazy(() => import('./pages/Pages').then(m => ({ default: m.StudentPathPage })));
const HowItWorksPage   = lazy(() => import('./pages/Pages').then(m => ({ default: m.HowItWorksPage })));
const AIArchPage       = lazy(() => import('./pages/Pages').then(m => ({ default: m.AIArchPage })));
const RussianStackPage = lazy(() => import('./pages/Pages').then(m => ({ default: m.RussianStackPage })));
const PartnersPage     = lazy(() => import('./pages/Pages').then(m => ({ default: m.PartnersPage })));
const GoalsPage        = lazy(() => import('./pages/Pages').then(m => ({ default: m.GoalsPage })));
const ContactsPage     = lazy(() => import('./pages/ContactsPage').then(m => ({ default: m.ContactsPage })));
const NotFoundPage     = lazy(() => import('./pages/Pages').then(m => ({ default: m.NotFoundPage })));

// ── Page transition variants ────────────────────────
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};
const pageTransition = { duration: 0.28, ease: [0.22, 1, 0.36, 1] };

// ── Loading fallback ────────────────────────────────
function PageSkeleton() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg, #06080f)',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '3px solid rgba(124,58,237,.3)',
        borderTopColor: '#7c3aed',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Animated routes (must be inside Router) ─────────
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
        style={{ minHeight: '100vh' }}
      >
        <Suspense fallback={<PageSkeleton />}>
          <Routes location={location}>
            <Route path="/"                element={<ErrorBoundary><HomePage /></ErrorBoundary>} />
            <Route path="/company-path"    element={<ErrorBoundary><CompanyPathPage /></ErrorBoundary>} />
            <Route path="/student-path"    element={<ErrorBoundary><StudentPathPage /></ErrorBoundary>} />
            <Route path="/how-it-works"    element={<ErrorBoundary><HowItWorksPage /></ErrorBoundary>} />
            <Route path="/ai-architecture" element={<ErrorBoundary><AIArchPage /></ErrorBoundary>} />
            <Route path="/russian-stack"   element={<ErrorBoundary><RussianStackPage /></ErrorBoundary>} />
            <Route path="/partners"        element={<ErrorBoundary><PartnersPage /></ErrorBoundary>} />
            <Route path="/goals"           element={<ErrorBoundary><GoalsPage /></ErrorBoundary>} />
            <Route path="/contacts"        element={<ErrorBoundary><ContactsPage /></ErrorBoundary>} />
            <Route path="*"               element={<ErrorBoundary><NotFoundPage /></ErrorBoundary>} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Root app ────────────────────────────────────────
export default function App() {
  return (
    <Router>
      {/* Auto page-hit + scroll depth on every route change */}
      <PageTracker />

      <Layout>
        <AnimatedRoutes />
      </Layout>
    </Router>
  );
}