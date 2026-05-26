# Hermes /hermes deployment (Amvera)

## 1) Integrate Hermes Agent repo
```bash
git clone https://github.com/nousresearch/hermes-agent.git hermes-agent
```
Use it as a separate service for future real agent execution. Current implementation uses simulation only.

## 2) Supabase setup
Run SQL from `db/hermes_supabase_schema.sql` in Supabase SQL editor.

Set env vars:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## 3) Run locally
```bash
docker compose -f docker-compose.hermes.yml up --build
```

## 4) Amvera
- Keep existing Node frontend service (amvera.yaml).
- Add Hermes FastAPI as extra service using `hermes-service/Dockerfile`.
- Configure same Supabase env vars in Amvera dashboard.
- Expose Hermes endpoint `/orchestrate` and connect through frontend or existing backend proxy.
