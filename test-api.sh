#!/usr/bin/env bash
set -u

BASE_URL="${BASE_URL:-http://localhost:3001}"

echo "== Health =="
curl -sS "$BASE_URL/api/health"
printf "\n\n"

echo "== Contact: invalid =="
curl -sS -X POST "$BASE_URL/api/contact" \
  -H "Content-Type: application/json" \
  -d '{"name":"","email":"bad-email","message":"short","consent":false}'
printf "\n\n"

echo "== Contact: valid =="
curl -sS -X POST "$BASE_URL/api/contact" \
  -H "Content-Type: application/json" \
  -d '{"name":"Тестовый пользователь","email":"test-contact@example.com","message":"Тестовое сообщение для проверки контактной формы.","consent":true}'
printf "\n\n"

echo "== Subscribe: invalid =="
curl -sS -X POST "$BASE_URL/api/subscribe" \
  -H "Content-Type: application/json" \
  -d '{"email":"bad-email","consent":false}'
printf "\n\n"

echo "== Subscribe: valid =="
curl -sS -X POST "$BASE_URL/api/subscribe" \
  -H "Content-Type: application/json" \
  -d '{"email":"test-subscribe@example.com","consent":true}'
printf "\n\n"

echo "== Submit project: invalid =="
curl -sS -X POST "$BASE_URL/api/submit-project" \
  -H "Content-Type: application/json" \
  -d '{"companyName":"","contactName":"","email":"bad-email","stack":"","description":"short","budget":"","deadline":"not-a-date","consent":false}'
printf "\n\n"

echo "== Submit project: valid =="
curl -sS -X POST "$BASE_URL/api/submit-project" \
  -H "Content-Type: application/json" \
  -d '{"companyName":"ООО Тест","contactName":"Анна Тестова","email":"test-project@example.com","stack":"React, Node.js, Prisma","description":"Тестовое техническое задание для проверки формы подачи проекта.","budget":"150000 ₽","deadline":"2026-06-30","consent":true}'
printf "\n"
