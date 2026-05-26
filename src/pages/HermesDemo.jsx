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

export default function HermesDemo() {
  const [project, setProject] = useState(SAMPLES[0]);
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(-1);
  const [logs, setLogs] = useState([]);
  const [team, setTeam] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const logRef = useRef(null);

  // METRIKA: demo_view on mount
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
    // METRIKA: hermes_launch on click
    if (typeof window!== 'undefined' && typeof window.ym === 'function') {
      window.ym(109303611, 'reachGoal', 'hermes_launch');
    }

    setRunning(true); setStep(-1); setLogs([]); setTeam(null); setConfidence(0);

    addLog('[HERMES] Initializing v2.4.1', 'sys');
    addLog(`Project: ${project.name}`, 'sys');

    // Анимация шагов
    for (let i = 0; i < STEPS.length; i++) {
      setStep(i);
      addLog(`${STEPS[i].icon} ${STEPS[i].label}...`, 'proc');
      await new Promise(r => setTimeout(r, 400));
      addLog(`✓ Complete`, 'ok');
    }

    // Реальный API вызов
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

      // Анимация confidence
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
      {/* HERO */}
      <section className="hm-hero">
        <div className="hm-glow" />
        <h1>Hermes Live</h1>
        <p>Сборка инженерной команды в реальном времени</p>
        <div className="hm-stats">