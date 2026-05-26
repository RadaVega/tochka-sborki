import os
import random
from datetime import datetime
from fastapi import FastAPI
from pydantic import BaseModel
from supabase import create_client, Client

app = FastAPI(title='Hermes Orchestration Service')

SUPABASE_URL = os.getenv('SUPABASE_URL', '')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY', '')
supabase: Client | None = None
if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

class ProjectIn(BaseModel):
    name: str
    budget: int = 80000
    timeline_weeks: int = 14
    stack: str = 'Python + React + LLM'

@app.get('/health')
def health():
    return {'ok': True, 'service': 'hermes'}

@app.post('/orchestrate')
def orchestrate(project: ProjectIn):
    steps = ['Parsing requirements','Matching engineers','Checking availability','Building team','Generating roadmap','Launching project']
    logs = []
    for i, step in enumerate(steps, start=1):
        msg = f"[{datetime.utcnow().isoformat()}Z] {step} for {project.name}"
        logs.append({'step': i, 'message': msg, 'state': 'ok'})
        if supabase:
            supabase.table('execution_logs').insert({'project_name': project.name, 'message': msg, 'state': 'ok'}).execute()

    team = {
        'lead_engineer': 'Systems Lead',
        'backend': 'Python Engineer',
        'frontend': 'React Engineer',
        'ml_engineer': 'LLM Engineer',
        'devops': 'Platform Engineer',
        'eta_weeks': project.timeline_weeks,
        'confidence_score': random.randint(86, 97),
    }
    if supabase:
        supabase.table('projects').insert({'name': project.name, 'budget': project.budget, 'timeline_weeks': project.timeline_weeks, 'stack': project.stack}).execute()
        supabase.table('teams').insert({'project_name': project.name, **team}).execute()

    return {'project': project.model_dump(), 'logs': logs, 'team': team}
