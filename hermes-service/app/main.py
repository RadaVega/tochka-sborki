import os
import random
import asyncio
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client

app = FastAPI(title='Hermes Orchestration Service')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPABASE_URL = os.getenv('SUPABASE_URL', '')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY', '')
supabase: Client | None = None
if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

class ProjectIn(BaseModel):
    name: str
    budget: int = 500000
    timeline_weeks: int = 14
    stack: str = 'Python + React + LLM'

STACK_ANALYSIS = {
    'python': {'complexity': 'medium', 'roles': ['backend', 'ml'], 'weeks': 12},
    'react': {'complexity': 'low', 'roles': ['frontend'], 'weeks': 8},
    'llm': {'complexity': 'high', 'roles': ['ml', 'backend'], 'weeks': 16},
    'node': {'complexity': 'medium', 'roles': ['backend'], 'weeks': 10},
}

ENGINEERS_DB = [
    {'name': 'Алексей К.', 'role': 'Lead Engineer', 'skills': ['Python', 'System Design'], 'rating': 4.9, 'projects': 23},
    {'name': 'Мария С.', 'role': 'Backend', 'skills': ['Python', 'FastAPI', 'PostgreSQL'], 'rating': 4.8, 'projects': 18},
    {'name': 'Дмитрий В.', 'role': 'Frontend', 'skills': ['React', 'TypeScript'], 'rating': 4.7, 'projects': 15},
    {'name': 'Елена П.', 'role': 'ML Engineer', 'skills': ['LLM', 'PyTorch', 'RAG'], 'rating': 4.9, 'projects': 12},
    {'name': 'Игорь М.', 'role': 'DevOps', 'skills': ['Docker', 'K8s', 'CI/CD'], 'rating': 4.6, 'projects': 20},
]

@app.get('/health')
def health():
    return {'ok': True, 'service': 'hermes', 'mode': 'demo'}

@app.post('/orchestrate')
async def orchestrate(project: ProjectIn):
    project_id = f"{project.name.lower().replace(' ', '-')}-{int(datetime.now().timestamp())}"
    logs = []
    
    await log_step(project_id, "🧠 Инициализация Hermes AI v2.1...", logs)
    await asyncio.sleep(0.3)
    
    stack_lower = project.stack.lower()
    analysis = analyze_stack(stack_lower, project.budget)
    
    await log_step(project_id, f"📊 Анализ стека: {project.stack}", logs)
    await asyncio.sleep(0.4)
    await log_step(project_id, f"   → Сложность: {analysis['complexity'].upper()} | Оценка: {analysis['weeks']} недель", logs)
    await asyncio.sleep(0.3)
    
    await log_step(project_id, f"🔍 Векторный поиск в базе ({len(ENGINEERS_DB)} инженеров)...", logs)
    await asyncio.sleep(0.5)
    
    required_roles = analysis['roles']
    await log_step(project_id, f"   → Требуется ролей: {len(required_roles)} ({', '.join(required_roles)})", logs)
    await asyncio.sleep(0.3)
    
    await log_step(project_id, "🎯 AI-матчинг по навыкам и доступности...", logs)
    await asyncio.sleep(0.6)
    
    matched = match_engineers(required_roles, project.budget)
    for eng in matched:
        await log_step(project_id, f"   ✓ {eng['name']} ({eng['role']}) — score: {eng['match_score']}%", logs)
        await asyncio.sleep(0.2)
    
    await log_step(project_id, "✅ Валидация команды и бюджета...", logs)
    await asyncio.sleep(0.4)
    
    total_cost = sum(e['rate'] for e in matched) * analysis['weeks']
    budget_ok = total_cost <= project.budget
    confidence = calculate_confidence(matched, budget_ok, analysis)
    
    await log_step(project_id, f"   → Бюджет: {total_cost:,}₽ / {project.budget:,}₽ ({'✓' if budget_ok else '⚠'})", logs)
    await asyncio.sleep(0.2)
    await log_step(project_id, f"   → Confidence score: {confidence}%", logs)
    
    await log_step(project_id, "🚀 Генерация роадмапа и запуск...", logs)
    await asyncio.sleep(0.3)
    await log_step(project_id, f"✨ Команда собрана за {len(logs) * 0.3:.1f}с", logs)
    
    team = {
        'members': matched,
        'eta_weeks': analysis['weeks'],
        'confidence_score': confidence,
        'total_cost': total_cost,
        'analysis': analysis,
    }
    
    if supabase:
        try:
            supabase.table('projects').insert({
                'name': project.name,
                'budget': project.budget,
                'stack': project.stack
            }).execute()
        except:
            pass
    
    return {
        'project_id': project_id,
        'project': project.model_dump(),
        'logs': logs,
        'team': team,
        'analysis': analysis,
    }

async def log_step(project_id: str, message: str, logs: list):
    timestamp = datetime.now().strftime('%H:%M:%S')
    log_entry = {'timestamp': timestamp, 'message': message}
    logs.append(log_entry)
    
    if supabase:
        try:
            supabase.table('execution_logs').insert({
                'project_id': project_id,
                'message': message,
                'level': 'info'
            }).execute()
        except:
            pass

def analyze_stack(stack: str, budget: int):
    complexity = 'medium'
    weeks = 12
    roles = ['backend', 'frontend']
    
    if 'llm' in stack or 'ai' in stack:
        complexity = 'high'
        weeks = 16
        roles = ['lead', 'backend', 'frontend', 'ml']
    elif 'python' in stack and 'react' in stack:
        complexity = 'medium'
        weeks = 14
        roles = ['lead', 'backend', 'frontend']
    elif 'node' in stack:
        weeks = 10
        roles = ['backend', 'frontend']
    
    if budget < 300000:
        weeks = int(weeks * 1.3)
    elif budget > 800000:
        weeks = int(weeks * 0.8)
    
    return {
        'complexity': complexity,
        'weeks': weeks,
        'roles': roles,
        'tech_breakdown': stack,
    }

def match_engineers(required_roles, budget):
    matched = []
    role_map = {
        'lead': 'Lead Engineer',
        'backend': 'Backend',
        'frontend': 'Frontend',
        'ml': 'ML Engineer',
        'devops': 'DevOps'
    }
    
    for role_key in required_roles:
        role_name = role_map.get(role_key, 'Backend')
        candidates = [e for e in ENGINEERS_DB if role_name in e['role']]
        
        if candidates:
            eng = random.choice(candidates)
            match_score = random.randint(88, 97)
            rate = random.randint(80000, 150000)
            
            matched.append({
                **eng,
                'match_score': match_score,
                'rate': rate,
            })
    
    return matched

def calculate_confidence(team, budget_ok, analysis):
    base = 85
    if len(team) >= 3:
        base += 5
    if budget_ok:
        base += 5
    if analysis['complexity'] == 'low':
        base += 3
    return min(97, base + random.randint(0, 4))
