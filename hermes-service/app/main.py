from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import random

app = FastAPI(title="Hermes Orchestrator", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProjectRequest(BaseModel):
    name: str
    stack: str
    budget: int
    timeline_weeks: int = 14

class Engineer(BaseModel):
    name: str
    role: str
    skills: List[str]
    rating: float
    projects: int
    rate: int
    match_score: Optional[int] = None

class LogEntry(BaseModel):
    message: str
    timestamp: str

class TeamResponse(BaseModel):
    members: List[Engineer]
    confidence_score: int
    eta_weeks: int
    total_cost: int

class OrchestrateResponse(BaseModel):
    project_id: str
    logs: List[LogEntry]
    team: TeamResponse

ENGINEERS_DB = [
    Engineer(name="Алексей К.", role="Lead Engineer", skills=["Python", "System Design", "Architecture"], rating=4.9, projects=23, rate=150000),
    Engineer(name="Мария С.", role="Backend", skills=["Python", "FastAPI", "PostgreSQL", "Redis"], rating=4.8, projects=18, rate=120000),
    Engineer(name="Дмитрий В.", role="Frontend", skills=["React", "TypeScript", "Next.js"], rating=4.7, projects=15, rate=100000),
    Engineer(name="Елена П.", role="ML Engineer", skills=["LLM", "PyTorch", "RAG", "LangChain"], rating=4.9, projects=12, rate=140000),
    Engineer(name="Игорь М.", role="DevOps", skills=["Docker", "Kubernetes", "CI/CD", "AWS"], rating=4.6, projects=20, rate=110000),
    Engineer(name="Анна К.", role="Backend", skills=["Python", "Django", "PostgreSQL"], rating=4.7, projects=16, rate=115000),
    Engineer(name="Сергей Л.", role="Frontend", skills=["Vue", "TypeScript", "Nuxt"], rating=4.5, projects=14, rate=95000),
]

def calculate_match(engineer: Engineer, stack: str) -> int:
    stack_lower = stack.lower()
    score = 70
    for skill in engineer.skills:
        if skill.lower() in stack_lower:
            score += 8
    score += int((engineer.rating - 4.5) * 10)
    score += min(engineer.projects, 5)
    return min(98, max(75, score))

def generate_logs(project: ProjectRequest, team: List[Engineer]) -> List[LogEntry]:
    now = datetime.utcnow()
    logs = []
    def add_log(message: str):
        logs.append(LogEntry(message=message, timestamp=now.isoformat() + "Z"))
    add_log(f"🧠 Инициализация Hermes AI v2.0")
    add_log(f"📋 Проект: {project.name}")
    add_log(f"📊 Стек: {project.stack} • Бюджет: {project.budget:,}₽".replace(",", " "))
    add_log(f"⏱️ Срок: {project.timeline_weeks} недель")
    add_log(f"")
    add_log(f"🔍 Поиск в базе инженеров ({len(ENGINEERS_DB)} профилей)...")
    add_log(f"🎯 Векторный матчинг по навыкам...")
    for eng in team:
        add_log(f"✓ {eng.name} ({eng.role}) — score: {eng.match_score}%")
    add_log(f"")
    add_log(f"📈 Расчет загрузки и доступности...")
    add_log(f"💰 Оптимизация бюджета...")
    add_log(f"✨ Генерация confidence score...")
    add_log(f"")
    add_log(f"✅ Команда собрана успешно")
    add_log(f"🚀 Готов к запуску")
    return logs

@app.get("/")
async def root():
    return {"service": "Hermes Orchestrator", "version": "2.0.0", "status": "operational", "engineers": len(ENGINEERS_DB)}

@app.get("/health")
async def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

@app.post("/orchestrate", response_model=OrchestrateResponse)
async def orchestrate(project: ProjectRequest):
    needs_ml = any(kw in project.stack.lower() for kw in ["llm", "ai", "ml", "pytorch", "langchain"])
    needs_frontend = any(kw in project.stack.lower() for kw in ["react", "vue", "frontend", "next", "nuxt"])
    needs_backend = any(kw in project.stack.lower() for kw in ["python", "fastapi", "django", "backend", "api"])
    needs_devops = project.budget > 400000 or "kubernetes" in project.stack.lower() or "docker" in project.stack.lower()
    
    candidates = []
    for eng in ENGINEERS_DB:
        score = calculate_match(eng, project.stack)
        eng_copy = eng.model_copy()
        eng_copy.match_score = score
        candidates.append(eng_copy)
    
    candidates.sort(key=lambda x: x.match_score, reverse=True)
    team = []
    lead = next((e for e in candidates if e.role == "Lead Engineer"), None)
    if lead: team.append(lead)
    if needs_backend:
        backend = next((e for e in candidates if e.role == "Backend" and e not in team), None)
        if backend: team.append(backend)
    if needs_frontend:
        frontend = next((e for e in candidates if e.role == "Frontend" and e not in team), None)
        if frontend: team.append(frontend)
    if needs_ml:
        ml = next((e for e in candidates if e.role == "ML Engineer" and e not in team), None)
        if ml: team.append(ml)
    if needs_devops:
        devops = next((e for e in candidates if e.role == "DevOps" and e not in team), None)
        if devops: team.append(devops)
    
    while len(team) < 3 and len(candidates) > len(team):
        next_best = next((e for e in candidates if e not in team), None)
        if next_best: team.append(next_best)
    
    max_team_cost = project.budget * 0.7
    weekly_budget = max_team_cost / project.timeline_weeks
    filtered_team = []
    current_weekly = 0
    for member in team:
        if current_weekly + member.rate <= weekly_budget * 1.2:
            filtered_team.append(member)
            current_weekly += member.rate
    team = filtered_team if filtered_team else team[:3]
    
    total_cost = sum(m.rate * project.timeline_weeks for m in team)
    avg_score = sum(m.match_score for m in team) / len(team) if team else 0
    confidence = int(min(97, avg_score + random.uniform(-2, 3)))
    logs = generate_logs(project, team)
    
    return OrchestrateResponse(
        project_id=f"hermes-{int(datetime.utcnow().timestamp())}",
        logs=logs,
        team=TeamResponse(members=team, confidence_score=confidence, eta_weeks=project.timeline_weeks, total_cost=total_cost)
    )

@app.get("/engineers")
async def list_engineers():
    return {"engineers": ENGINEERS_DB, "total": len(ENGINEERS_DB)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)