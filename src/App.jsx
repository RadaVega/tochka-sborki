import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from './components/Layout';
import {
  AiArchitecturePage,
  CommunicationsPage,
  CompanyPathPage,
  ContactsPage,
  GoalsPage,
  HeroPage,
  HowItWorksPage,
  IndustriesPage,
  MentorsPage,
  MoneyFlowPage,
  PartnersPage,
  PrivacyPage,
  ProblemPage,
  SolutionPage,
  StudentPathPage,
  TechStackPage,
  TransformationPage
} from './pages/Pages';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HeroPage /> },
      { path: 'problem', element: <ProblemPage /> },
      { path: 'solution', element: <SolutionPage /> },
      { path: 'how-it-works', element: <HowItWorksPage /> },
      { path: 'partners', element: <PartnersPage /> },
      { path: 'ai-architecture', element: <AiArchitecturePage /> },
      { path: 'tech-stack', element: <TechStackPage /> },
      { path: 'communications', element: <CommunicationsPage /> },
      { path: 'student-path', element: <StudentPathPage /> },
      { path: 'company-path', element: <CompanyPathPage /> },
      { path: 'money-flow', element: <MoneyFlowPage /> },
      { path: 'industries', element: <IndustriesPage /> },
      { path: 'mentors', element: <MentorsPage /> },
      { path: 'transformation', element: <TransformationPage /> },
      { path: 'goals', element: <GoalsPage /> },
      { path: 'contacts', element: <ContactsPage /> },
      { path: 'privacy', element: <PrivacyPage /> }
    ]
  }
]);

export default function App() {
  return <RouterProvider router={router} />;
}
