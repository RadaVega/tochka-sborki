[export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({error: 'Method not allowed'});

  const { name = 'AI SaaS', stack = 'Python', budget = 500000, timeline_weeks = 14 } = req.body || {};
  
  const db = [
    {name:"Алексей К.",role:"Lead Engineer",skills:["Python","Architecture"],rating:4.9,projects:23,rate:150000},
    {name:"Мария С.",role:"Backend",skills:["Python","FastAPI","PostgreSQL"],rating:4.8,projects:18,rate:120000},
    {name:"Дмитрий В.",role:"Frontend",skills:["React","TypeScript"],rating:4.7,projects:15,rate:100000},
    {name:"Елена П.",role:"ML Engineer",skills:["LLM","PyTorch","RAG"],rating:4.9,projects:12,rate:140000},
    {name:"Игорь М.",role:"DevOps",skills:["Docker","K8s"],rating:4.6,projects:20,rate:110000},
  ];

  const match = (eng) => {
    let s = 70;
    eng.skills.forEach(sk => { if (stack.toLowerCase().includes(sk.toLowerCase())) s += 8; });
    return Math.min(98, s + Math.floor((eng.rating-4.5)*10));
  };

  const needs = {
    ml: /llm|ai|ml|pytorch/i.test(stack),
    front: /react|vue|front/i.test(stack),
    back: /python|node|back|api/i.test(stack),
    devops: budget > 400000
  };

  let team = db.map(e => ({...e, match_score: match(e)}))
    .sort((a,b) => b.match_score - a.match_score)
    .filter(e => 
      e.role === 'Lead Engineer' ||
      (needs.ml && e.role === 'ML Engineer') ||
      (needs.front && e.role === 'Frontend') ||
      (needs.back && e.role === 'Backend') ||
      (needs.devops && e.role === 'DevOps')
    ).slice(0, 5);

  if (team.length < 3) team = db.slice(0,3).map(e => ({...e, match_score: match(e)}));

  const now = new Date().toISOString();
  const logs = [
    {message:"🧠 Hermes AI v2.0", timestamp: now},
    {message:`📋 ${name}`, timestamp: now},
    {message:`📊 ${stack} • ${budget.toLocaleString('ru-RU')}₽`, timestamp: now},
    {message:`🔍 Поиск (${db.length} инженеров)`, timestamp: now},
    {message:"🎯 Векторный матчинг", timestamp: now},
    ...team.map(t => ({message:`✓ ${t.name} — ${t.match_score}%`, timestamp: now})),
    {message:"✅ Команда готова", timestamp: now},
  ];

  await new Promise(r => setTimeout(r, 600));

  res.json({
    project_id: `hms-${Date.now()}`,
    logs,
    team: {
      members: team,
      confidence_score: Math.round(team.reduce((s,t) => s+t.match_score,0)/team.length),
      eta_weeks: timeline_weeks,
      total_cost: team.reduce((s,t) => s + t.rate * timeline_weeks, 0)
    }
  });
}]