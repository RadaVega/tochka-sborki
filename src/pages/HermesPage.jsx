import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './HermesPage.module.css';
import { createClient } from '@supabase/supabase-js';

const FLOW_STEPS = [
  'Parsing requirements',
  'Matching engineers',
  'Checking availability',
  'Building team',
  'Generating roadmap',
  'Launching project',
];

const TEAM = [
  ['Lead Engineer', 'Distributed systems / architecture'],
  ['Backend', 'Python + FastAPI + Postgres'],
  ['Frontend', 'React + Vite + Realtime UX'],
  ['ML Engineer', 'LLM orchestration + evals'],
  ['DevOps', 'Docker + CI/CD + observability'],
];

const GRAPH_NODES = ['students', 'startups', 'companies', 'mentors', 'research', 'open source'];

const supabase = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
  ? createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
  : null;

export function HermesPage() {
  const location = useLocation();
  const [activeStep, setActiveStep] = useState(0);
  const [logs, setLogs] = useState(['[boot] Hermes orchestration runtime initialized']);
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % FLOW_STEPS.length);
      setProgress((prev) => Math.min(100, prev + 9));
      setLogs((prev) => {
        const next = `[${new Date().toLocaleTimeString()}] ${FLOW_STEPS[(activeStep + 1) % FLOW_STEPS.length]}...ok`;
        return [...prev.slice(-7), next];
      });
    }, 1800);
    return () => clearInterval(timer);
  }, [activeStep]);

  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('hermes-execution-logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'execution_logs' }, (payload) => {
        setLogs((prev) => [...prev.slice(-7), payload.new.message ?? '[event] execution update']);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);


  useEffect(() => {
    if (location.pathname === '/demo' && typeof window !== 'undefined' && typeof window.ym === 'function') {
      // METRIKA GOAL
      window.ym(109303611, 'reachGoal', 'demo_view');
    }
  }, [location.pathname]);

  const confidence = useMemo(() => `${Math.min(99, 82 + Math.floor(progress / 6))}%`, [progress]);

  return (
    <main className={styles.hermesPage}>
      <section className={styles.hero}>
        <div className={styles.glow} />
        <p className={styles.kicker}>Hermes AI</p>
        <h1>AI-оркестратор инженерной экосистемы</h1>
        <p className={styles.subtitle}>Hermes analyzes projects, assembles engineering teams, routes delivery, and accelerates MVP creation.</p>
        <button className="primary-button" type="button" onClick={() => {
          if (typeof window !== 'undefined' && typeof window.ym === 'function') {
            // METRIKA GOAL
            window.ym(109303611, 'reachGoal', 'hermes_launch');
          }
        }}>ЗАПУСТИТЬ HERMES</button>
      </section>

      <section className={styles.flowGrid}>
        <article className={styles.panel}>
          <h3>Project Input</h3>
          <ul>
            <li>AI SaaS MVP</li><li>Python + React + LLM</li><li>Budget: $80k</li><li>Timeline: 14 weeks</li>
          </ul>
        </article>

        <article className={styles.panel}>
          <h3>Live Execution Flow</h3>
          <div className={styles.pipeline}>
            {FLOW_STEPS.map((step, idx) => (
              <div key={step} className={`${styles.step} ${idx <= activeStep ? styles.stepActive : ''}`}>{step}</div>
            ))}
          </div>
          <div className={styles.progress}><span style={{ width: `${progress}%` }} /></div>
          <div className={styles.logs}>{logs.map((line) => <p key={line}>{line}</p>)}</div>
        </article>

        <article className={styles.panel}>
          <h3>Generated Team</h3>
          <ul>{TEAM.map(([role, desc]) => <li key={role}><strong>{role}:</strong> {desc}</li>)}</ul>
          <p className={styles.meta}>ETA: 14 weeks</p>
          <p className={styles.meta}>Confidence score: {confidence}</p>
        </article>
      </section>

      <section className={styles.graphSection}>
        <h2>Ecosystem Graph</h2>
        <div className={styles.graph}>
          <div className={styles.center}>HERMES AI</div>
          {GRAPH_NODES.map((node, idx) => (
            <div key={node} className={styles.node} style={{ '--i': idx }}>{node}</div>
          ))}
        </div>
      </section>
    </main>
  );
}
