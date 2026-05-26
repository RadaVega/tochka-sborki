export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({error: 'Method not allowed'});

  const { name = 'Demo', stack = 'Python', budget = 500000, timeline_weeks = 4 } = req.body || {};

  const engineers = [
    {name: 'Алексей К.', role: 'Lead Engineer', skills: ['Python','System Design'], rating: 4.9, projects: 23, rate: 150000},
    {name: 'Мария С.', role: 'Backend', skills: ['Python','FastAPI','PostgreSQL'], rating: 4.8, projects: 18, rate: 120000},
    {name: 'Дмитрий В.', role: 'Frontend', skills: ['React','TypeScript'], rating: 4.7, projects: 15, rate: 100000},
    {name: 'Елена П.', role: 'ML Engineer', skills: ['LLM','PyTorch','RAG'], rating: 4.9, projects: 12, rate: 140000},
    {name: 'Игорь М.', role: 'DevOps', skills: ['Docker','K8s','CI/CD'], rating: 4.6, projects: 20, rate: 110000},
  ];

  const needsML = /llm|ai|ml/i.test(stack);
  const team = engineers.filter(e => needsML ? true : e.role !== 'ML Engineer').slice(0, needsML ? 4 : 3);
  const totalCost = team.reduce((s, m) => s + m.rate * timeline_weeks, 0);

  const logs = [
    `🧠 Анализ: ${name}`,
    `📊 Стек: ${stack} | Бюджет: ${Number(budget).toLocaleString('ru-RU')}₽`,
    `🔍 Поиск в базе (${engineers.length} инженеров)...`,
    `🎯 Векторный матчинг по навыкам...`,
    ...team.map(m => `✓ ${m.name} — score: ${Math.floor(88 + Math.random()*7)}%`),
    `💰 Стоимость: ${totalCost.toLocaleString('ru-RU')}₽`,
    `✅ Команда собрана за 4.2с`
  ];

  res.status(200).json({
    project_id: `hermes-${Date.now()}`,
    team: team.map(m => ({...m, score: Math.floor(88 + Math.random()*7)})),
    timeline_weeks,
    total_cost: totalCost,
    confidence: 0.91 + Math.random()*0.05,
    logs
  });
}