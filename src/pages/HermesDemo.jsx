import { useEffect } from 'react';

export function HermesDemo() {
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.ym === 'function') {
      // METRIKA GOAL
      window.ym(109303611, 'reachGoal', 'demo_view');
    }
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
            if (typeof window !== 'undefined' && typeof window.ym === 'function') {
              // METRIKA GOAL
              window.ym(109303611, 'reachGoal', 'hermes_launch');
            }
          }}
        >
          ЗАПУСТИТЬ HERMES
        </button>
      </section>
    </main>
  );
}
