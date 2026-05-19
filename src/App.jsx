import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PageTracker } from './components/PageTracker';
import {
  AiArchitecturePage,
  GoalsPage,
  HeroPage,
  HowItWorksPage,
  PartnersPage,
  TechStackPage,
  StudentPathPage,
  CompanyPathPage,
} from './pages/Pages';
import { ContactsPage } from './pages/ContactsPage';

function RoutedContent() {
  return (
    <Routes>
      <Route path="/" element={<HeroPage />} />
      <Route path="/company-path" element={<CompanyPathPage />} />
      <Route path="/student-path" element={<StudentPathPage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/ai-architecture" element={<AiArchitecturePage />} />
      <Route path="/russian-stack" element={<TechStackPage />} />
      <Route path="/partners" element={<PartnersPage />} />
      <Route path="/goals" element={<GoalsPage />} />
      <Route path="/contacts" element={<ContactsPage />} />
      <Route path="*" element={<HeroPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <PageTracker />
      <Layout>
        <ErrorBoundary>
          <RoutedContent />
        </ErrorBoundary>
      </Layout>
    </Router>
  );
}
