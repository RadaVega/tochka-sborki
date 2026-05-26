import { useEffect } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';

export function HermesDemo() {
  const { goal, GOALS } = useAnalytics();
  useEffect(() => {
    goal(GOALS.DEMO_VIEW);
  }, []);

  return (
    <main className="page">
      <section className="section">
        <h1>Hermes Demo</h1>
        <p>Демонстрация оркестрации Hermes.</p>
        <button
          className="primary-button"
          type="button"
          onClick={() => {
            goal(GOALS.HERMES_LAUNCH);
          }}
        >
          ЗАПУСТИТЬ HERMES
        </button>
      </section>
    </main>
  );
}
