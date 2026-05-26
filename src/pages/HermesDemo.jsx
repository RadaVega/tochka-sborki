import React, { useEffect, useState, useRef } from 'react';
import styles from './HermesPage.module.css';
import { createClient } from '@supabase/supabase-js';

const supabase = import.meta.env.VITE_SUPABASE_URL
? createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
  : null;

export default function HermesDemo() {
  const [logs, setLogs] = useState([]);
  const [team, setTeam] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [project, setProject] = useState({
    name: 'AI SaaS MVP',
    stack: 'Python + React + LLM',
    budget: '500000',
    timeline: '14 дней'
  });

  const heroCanvasRef = useRef(null);

  // Canvas частицы (фиолетовые, под твой --p)
  useEffect(() => {
    const canvas = heroCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 1.8 + 0.5,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      // Фиолетовое свечение
      const gradient = ctx.createRadialGradient(
        canvas.offsetWidth/2, canvas.offsetHeight/2, 0,
        canvas.offsetWidth/2, canvas.offsetHeight/2, canvas.offsetWidth/2
      );
      gradient.addColorStop(0, 'rgba(124, 58, 237, 0.15)');
      gradient.addColorStop(0.5, 'rgba(167, 139, 250, 0.08)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.offsetWidth) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.offsetHeight) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(167, 139, 250, 0.7)';
        ctx.fill();

        particles.slice(i + 1).forEach(p2 => {
          const dx = p.x - p2.x, dy = p.y - p2.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(124, 58, 237, ${0.12 * (1 - dist/110)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Supabase realtime
  useEffect(() => {
    if (!supabase) return;
    const channel = supabase.channel('hermes-demo')
   .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'execution_logs'
      }, (payload) => {
        setLogs(prev => [...prev.slice(-40), payload.new]);
      })
   .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleStart = async (e) => {
    e.preventDefault();
    setIsRunning(true);
    setLogs([]);
    setTeam(null);

    try {
      const API = import.meta.env.VITE_HERMES_API || 'http://localhost:8000';

      // Конвертируем данные для API
      const apiPayload = {
        name: project.name,
        stack: project.stack,
        budget: parseInt(project.budget) || 500000,
        timeline_weeks: parseInt(project.timeline) || 14
      };

      const response = await fetch(`${API}/orchestrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload)
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();

      // Анимируем логи из реального API
      for (let i = 0; i < data.logs.length; i++) {
        await new Promise(r => setTimeout(r, 280));
        const log = data.logs[i];
        setLogs(prev => [...prev, {
          id: i,
          message: log.message,
          level: log.message.includes('✓') || log.message.includes('✨')? 'success' :
                 log.message.includes('⚠')? 'warning' : 'info',
          created_at: new Date().toISOString(),
          timestamp: log.timestamp
        }]);
      }

      // Устанавливаем команду из API
      setTeam({
        members: data.team.members,
        confidence: data.team.confidence_score,
        eta: `${data.team.eta_weeks} недель`,
        totalCost: data.team.total_cost
      });

    } catch (error) {
      console.error('Hermes API failed, using demo mode:', error);

      // Fallback демо-режим
      const steps = [
        'Инициализация Hermes AI...',
        `Проект: ${project.name}`,
        `Стек: ${project.stack} • Бюджет: ${project.budget}₽`,
        'Анализ требований и сложности...',
        'Поиск в базе инженеров (1,247 профилей)...',
        'Векторный матчинг по навыкам...',
        'Проверка доступности и загрузки...',
        'Расчет оптимальной команды...',
        'Генерация confidence score...',
        'Сборка команды завершена ✓',
        'Запуск проекта...'
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(r => setTimeout(r, 450));
        setLogs(prev => [...prev, {
          id: i,
          message: steps[i],
          level: i === steps.length-1? 'success' : i > 7? 'warning' : 'info',
          created_at: new Date().toISOString()
        }]);
      }

      setTeam({
        members: [
          {name: 'Алексей К.', role: 'Lead Engineer', rating: 4.9, projects: 23, match_score: 97},
          {name: 'Мария С.', role: 'Backend', rating: 4.8, projects: 18, match_score: 89},
          {name: 'Дмитрий В.', role: 'Frontend', rating: 4.7, projects: 15, match_score: 97},
          {name: 'Елена П.', role: 'ML Engineer', rating: 4.9, projects: 12, match_score: 95},
          {name: 'Игорь М.', role: 'DevOps', rating: 4.6, projects: 31, match_score: 91},
        ],
        confidence: 94,
        eta: '14 дней'
      });
    }

    setIsRunning(false);
  };

  const steps = ['Анализ', 'Поиск', 'Матчинг', 'Сборка', 'Запуск'];
  const activeStep = Math.min(Math.floor(logs.length / 2.2), steps.length - 1);

  return (
    <div className={styles.page}>
      <div className={styles.grid} />
      <div className={styles.glow} />

      <section className={styles.hero}>
        <canvas ref={heroCanvasRef} className={styles.heroCanvas} />
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <span className={styles.dot} />
            LIVE DEMO
          </div>
          <h1>Hermes Live</h1>
          <p>Сборка инженерной команды в реальном времени</p>
        </div>
      </section>

      <section className={styles.execution}>
        <div className={styles.threeCol}>
          {/* Левая колонка */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <span>ПРОЕКТ</span>
              <span>ВВОД</span>
            </div>
            <form onSubmit={handleStart} className={styles.form}>
              <label>
                Название
                <input
                  value={project.name}
                  onChange={e => setProject({...project, name: e.target.value})}
                />
              </label>
              <label>
                Технологии
                <input
                  value={project.stack}
                  onChange={e => setProject({...project, stack: e.target.value})}
                />
              </label>
              <div className={styles.row}>
                <label>
                  Бюджет
                  <input
                    value={project.budget}
                    onChange={e => setProject({...project, budget: e.target.value})}
                  />
                </label>
                <label>
                  Срок
                  <input
                    value={project.timeline}
                    onChange={e => setProject({...project, timeline: e.target.value})}
                  />
                </label>
              </div>
              <button disabled={isRunning}>
                {isRunning? 'СОБИРАЕМ КОМАНДУ...' : 'ЗАПУСТИТЬ HERMES'}
              </button>
            </form>
          </div>

          {/* Центральная колонка */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <span>ОРКЕСТРАЦИЯ</span>
              <span className={isRunning? styles.active : ''}>
                {isRunning? 'В ПРОЦЕССЕ' : 'ГОТОВ'}
              </span>
            </div>

            <div className={styles.pipeline}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
                {steps.map((s, i) => (
                  <div key={s} style={{textAlign: 'center', flex: 1}}>
                    <div className={`${styles.node} ${i <= activeStep? styles.nodeActive : ''} ${i < activeStep? styles.nodeDone : ''}`}
                         style={{margin: '0 auto 6px'}}>
                      {i < activeStep? '✓' : i+1}
                    </div>
                    <div style={{fontSize: '10px', color: 'var(--li)', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
                      {s}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.terminal}>
              <div className={styles.termHead}>
                <span>hermes@orchestrator:~$</span>
                <span>LIVE</span>
              </div>
              <div className={styles.logStream}>
                {logs.length === 0? (
                  <div className={styles.empty}>Нажмите "ЗАПУСТИТЬ HERMES" для демо</div>
                ) : (
                  logs.map(l => (
                    <div key={l.id} className={styles.logLine}>
                      <span>{new Date(l.created_at).toLocaleTimeString('ru-RU')}</span>
                      <span className={styles[l.level || 'info']}>{l.message}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Правая колонка */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <span>КОМАНДА</span>
              <span>{team? `${team.confidence}%` : '--'}</span>
            </div>
            {!team? (
              <div className={styles.teamEmpty}>
                <div>◯</div>
                <p>Ожидание запуска оркестрации</p>
              </div>
            ) : (
              <div className={styles.team}>
                {team.members.map(m => (
                  <div key={m.name} className={styles.member}>
                    <div className={styles.avatar}>{m.name[0]}</div>
                    <div>
                      <div>{m.name}</div>
                      <span>{m.role}</span>
                    </div>
                    <div>
                      <span>★ {m.rating}</span>
                      <span>{m.projects} проектов</span>
                    </div>
                  </div>
                ))}
                <div className={styles.meta}>
                  <div>
                    <span>Готовность</span>
                    <strong>{team.eta}</strong>
                  </div>
                  <div>
                    <span>Точность</span>
                    <strong>{team.confidence}%</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}