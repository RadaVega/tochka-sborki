// src/pages/HermesDemo.jsx
import { useState, useEffect, useRef } from 'react';

const API = import.meta.env.VITE_API_BASE_URL || '';

const SAMPLES = [
  { id: 1, name: 'AI SaaS MVP', stack: 'Python + React + LLM', budget: 500000, weeks: 14 },
  { id: 2, name: 'Fintech Dashboard', stack: 'Go + TypeScript + Redis', budget: 85000, weeks: 8 },
  { id: 3, name: 'ML Pipeline', stack: 'Python + PyTorch + K8s', budget: 160000, weeks: 16 },
];

const STEPS = [
  { id: 'parse', label: 'Parsing requirements', icon: '📋' },
  { id: 'stack', label: 'Analyzing stack', icon: '🔍' },
  { id: 'match', label: 'Matching engineers', icon: '🔗' },
  { id: 'avail', label: 'Checking availability', icon: '📅' },
  { id: 'team', label: 'Building team', icon: '👥' },
  { id: 'roadmap', label: 'Generating roadmap', icon: '🗺' },
  { id: 'score', label: 'Computing confidence', icon: '📊' },
  { id: 'launch', label: 'Launching', icon: '🚀' },
];

export function HermesDemo() {
  const [project, setProject] = useState(SAMPLES[0]);
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(-1);
  const [logs, setLogs] = useState([]);
  const [team, setTeam] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const logRef = useRef(null);

  useEffect(() => {
    if (typeof window!== 'undefined' && typeof window.ym === 'function') {
      window.ym(109303611, 'reachGoal', 'demo_view');
    }
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  const addLog = (text, type = 'info') => {
    const ts = new Date().toLocaleTimeString('ru-RU');
    setLogs(l => [...l, { text, ts, type }]);
  };

  const run = async () => {
    if (typeof window!== 'undefined' && typeof window.ym === 'function') {
      window.ym(109303611, 'reachGoal', 'hermes_launch');
    }

    setRunning(true);
    setStep(-1);
    setLogs([]);
    setTeam(null);
    setConfidence(0);

    addLog('[HERMES] Initializing v2.4.1', 'sys');
    addLog(`Project: ${project.name}`, 'sys');

    for (let i = 0; i < STEPS.length; i++) {
      setStep(i);
      addLog(`${STEPS[i].icon} ${STEPS[i].label}...`, 'proc');
      await new Promise(r => setTimeout(r, 400));
      addLog(`✓ Complete`, 'ok');
    }

    try {
      addLog('Calling /api/orchestrate...', 'proc');
      const res = await fetch(`${API}/api/orchestrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: project.name,
          stack: project.stack,
          budget: project.budget,
          timeline_weeks: project.weeks
        })
      });

      const data = await res.json();
      setTeam(data.team);

      for (let c = 0; c <= data.team.confidence_score; c += 2) {
        setConfidence(c);
        await new Promise(r => setTimeout(r, 15));
      }

      addLog(`✓ Team ready: ${data.team.members.length} engineers`, 'ok');
      addLog(`Confidence: ${data.team.confidence_score}%`, 'sys');
    } catch (e) {
      addLog('API failed, using demo', 'err');
    }

    setRunning(false);
  };

  return (
    <div className="hermes-page">
      {/* AMVERA TEST BANNER — RED */}
      <div style={{background:'red', color:'white', padding:'20px', fontSize:'24px', textAlign:'center', fontWeight:'bold'}}>
        AMVERA TEST CHANGE 1 — HERMES DEMO
      </div>

      <section className="hm-hero">
        <div className="hm-glow" />
        <h1>Hermes Live</h1>
        <p>Сборка инженерной команды в реальном времени</p>
        <div className="hm-stats">
          <div><strong>48ч</strong><span>сборка</span></div>
          <div><strong>80%</strong><span>автоматизация</span></div>
          <div><strong>120+</strong><span>инженеров</span></div>
          <div><strong>91%</strong><span>точность</span></div>
        </div>
      </section>

      <section className="hm-demo">
        <div className="hm-grid">
          <div className="hm-card">
            <h3>ПРОЕКТ</h3>
            <div className="hm-samples">
              {SAMPLES.map(s => (
                <button key={s.id} className={project.id === s.id? 'active' : ''} onClick={() => setProject(s)} disabled={running}>
                  {s.name}
                </button>
              ))}
            </div>
            <input value={project.name} onChange={e => setProject({...project, name: e.target.value})} />
            <input value={project.stack} onChange={e => setProject({...project, stack: e.target.value})} />
            <div className="hm-row">
              <input type="number" value={project.budget} onChange={e => setProject({...project, budget: +e.target.value})} />
              <input type="number" value={project.weeks} onChange={e => setProject({...project, weeks: +e.target.value})} />
            </div>
            <button className="hm-run" onClick={run} disabled={running}>
              {running? '⟳ Orchestrating...' : '⚡ ЗАПУСТИТЬ HERMES'}
            </button>
          </div>

          <div className="hm-card">
            <h3>ORCHESTRATION</h3>
            <div className="hm-steps">
              {STEPS.map((s, i) => (
                <div key={s.id} className={`hm-step ${i < step? 'done' : i === step? 'active' : ''}`}>
                  <span>{i < step? '✓' : s.icon}</span>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
            <div className="hm-logs" ref={logRef}>
              {logs.map((l, i) => (
                <div key={i} className={`log-${l.type}`}>
                  <span>{l.ts}</span> {l.text}
                </div>
              ))}
            </div>
          </div>

          <div className="hm-card">
            <h3>TEAM</h3>
            {!team? (
              <div className="hm-empty">Запустите оркестрацию</div>
            ) : (
              <div>
                <div className="hm-conf">
                  <div className="hm-conf-bar" style={{width: `${confidence}%`}} />
                  <span>{confidence}%</span>
                </div>
                {team.members.map(m => (
                  <div key={m.name} className="hm-member">
                    <div className="hm-avatar">{m.name[0]}</div>
                    <div>
                      <strong>{m.name}</strong>
                      <small>{m.role} · {m.match_score}%</small>
                    </div>
                  </div>
                ))}
                <div className="hm-total">
                  Бюджет: {(team.total_cost / 1000).toFixed(0)}k ₽ · {team.eta_weeks} нед
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default HermesDemo;