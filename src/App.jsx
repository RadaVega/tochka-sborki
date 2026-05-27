/**
 * src/App.jsx — eager imports (no lazy loading) for diagnosis
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { Layout }        from './components/Layout';
import { PageTracker }   from './components/PageTracker';
import { PerformanceTracker } from './components/PerformanceTracker';
import { ErrorBoundary } from './components/ErrorBoundary';

// Eager imports — no lazy loading
import {
  HeroPage,
  ProblemPage,
  SolutionPage,
  CommunicationsPage,
  MoneyFlowPage,
  IndustriesPage,
  MentorsPage,
  TransformationPage,
  CompanyPathPage,
  StudentPathPage,
  HowItWorksPage,
  AiArchitecturePage,
  TechStackPage,
  PartnersPage,
  GoalsPage,
  PrivacyPage,
} from './pages/Pages';
import { ContactsPage } from './pages/ContactsPage';
import { HermesPage } from './pages/HermesPage';
import HermesDemo from './pages/HermesDemo';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"                element={<ErrorBoundary><HeroPage /></ErrorBoundary>} />
      <Route path="/problem"         element={<ErrorBoundary><ProblemPage /></ErrorBoundary>} />
      <Route path="/solution"        element={<ErrorBoundary><SolutionPage /></ErrorBoundary>} />
      <Route path="/company-path"    element={<ErrorBoundary><CompanyPathPage /></ErrorBoundary>} />
      <Route path="/student-path"    element={<ErrorBoundary><StudentPathPage /></ErrorBoundary>} />
      <Route path="/how-it-works"    element={<ErrorBoundary><HowItWorksPage /></ErrorBoundary>} />
      <Route path="/ai-architecture" element={<ErrorBoundary><AiArchitecturePage /></ErrorBoundary>} />
      <Route path="/tech-stack"      element={<ErrorBoundary><TechStackPage /></ErrorBoundary>} />
      <Route path="/russian-stack"   element={<ErrorBoundary><TechStackPage /></ErrorBoundary>} />
      <Route path="/communications"  element={<ErrorBoundary><CommunicationsPage /></ErrorBoundary>} />
      <Route path="/partners"        element={<ErrorBoundary><PartnersPage /></ErrorBoundary>} />
      <Route path="/money-flow"      element={<ErrorBoundary><MoneyFlowPage /></ErrorBoundary>} />
      <Route path="/industries"      element={<ErrorBoundary><IndustriesPage /></ErrorBoundary>} />
      <Route path="/mentors"         element={<ErrorBoundary><MentorsPage /></ErrorBoundary>} />
      <Route path="/transformation"  element={<ErrorBoundary><TransformationPage /></ErrorBoundary>} />
      <Route path="/goals"           element={<ErrorBoundary><GoalsPage /></ErrorBoundary>} />
      <Route path="/contacts"        element={<ErrorBoundary><ContactsPage /></ErrorBoundary>} />
      <Route path="/privacy"         element={<ErrorBoundary><PrivacyPage /></ErrorBoundary>} />
      <Route path="/hermes"          element={<ErrorBoundary><HermesPage /></ErrorBoundary>} />
      <Route path="/demo"            element={<ErrorBoundary><HermesDemo /></ErrorBoundary>} />
      <Route path="*"                element={<ErrorBoundary><HeroPage /></ErrorBoundary>} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <PageTracker />
      <PerformanceTracker />
      <Layout>
        <AppRoutes />
      </Layout>
    </Router>
  );
}