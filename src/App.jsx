/**
 * src/App.jsx — diagnostic version (no AnimatePresence, explicit logging)
 */

import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { Layout }        from './components/Layout';
import { PageTracker }   from './components/PageTracker';
import { ErrorBoundary } from './components/ErrorBoundary';

const HeroPage           = lazy(() => import('./pages/Pages').then(m => ({ default: m.HeroPage })));
const CompanyPathPage    = lazy(() => import('./pages/Pages').then(m => ({ default: m.CompanyPathPage })));
const StudentPathPage    = lazy(() => import('./pages/Pages').then(m => ({ default: m.StudentPathPage })));
const HowItWorksPage     = lazy(() => import('./pages/Pages').then(m => ({ default: m.HowItWorksPage })));
const AiArchitecturePage = lazy(() => import('./pages/Pages').then(m => ({ default: m.AiArchitecturePage })));
const TechStackPage      = lazy(() => import('./pages/Pages').then(m => ({ default: m.TechStackPage })));
const PartnersPage       = lazy(() => import('./pages/Pages').then(m => ({ default: m.PartnersPage })));
const GoalsPage          = lazy(() => import('./pages/Pages').then(m => ({ default: m.GoalsPage })));
const ContactsPage       = lazy(() => import('./pages/ContactsPage').then(m => ({ default: m.ContactsPage })));

function PageSkeleton() {
  return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa' }}>Загрузка…</div>;
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/"                element={<ErrorBoundary><HeroPage /></ErrorBoundary>} />
        <Route path="/company-path"    element={<ErrorBoundary><CompanyPathPage /></ErrorBoundary>} />
        <Route path="/student-path"    element={<ErrorBoundary><StudentPathPage /></ErrorBoundary>} />
        <Route path="/how-it-works"    element={<ErrorBoundary><HowItWorksPage /></ErrorBoundary>} />
        <Route path="/ai-architecture" element={<ErrorBoundary><AiArchitecturePage /></ErrorBoundary>} />
        <Route path="/russian-stack"   element={<ErrorBoundary><TechStackPage /></ErrorBoundary>} />
        <Route path="/partners"        element={<ErrorBoundary><PartnersPage /></ErrorBoundary>} />
        <Route path="/goals"           element={<ErrorBoundary><GoalsPage /></ErrorBoundary>} />
        <Route path="/contacts"        element={<ErrorBoundary><ContactsPage /></ErrorBoundary>} />
        <Route path="*"               element={<ErrorBoundary><HeroPage /></ErrorBoundary>} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <Router>
      <PageTracker />
      <Layout>
        <AppRoutes />
      </Layout>
    </Router>
  );
}