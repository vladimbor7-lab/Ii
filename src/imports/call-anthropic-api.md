A: Вызвать API из браузерного JS/HTML

5:21 PM
Понял! Вот полное решение для вызова Anthropic API из браузера.

Проблема: CORS + безопасность ключа
Браузер блокирует прямые запросы к api.anthropic.com по двум причинам:

CORS — сервер Anthropic не разрешает запросы с чужих доменов
Безопасность — API-ключ в браузерном коде виден всем
Решение: простой прокси-сервер
Схема: Браузер → Твой сервер → Anthropic API

Шаг 1 — Бэкенд (Node.js + Express)
javascript
// server.js
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ origin: 'http://localhost:3000' })); // твой домен
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY, // ключ только здесь!
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: req.body.messages
    })
  });

  const data = await response.json();
  res.json(data);
});

app.listen(3001);
Шаг 2 — Фронтенд (обычный JS)
javascript
// Запрос идёт НА ТВОЙ сервер, не на Anthropic напрямую
async function askClaude(userMessage) {
  const response = await fetch('http://localhost:3001/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: userMessage }]
    })
  });

  const data = await response.json();
  return data.content[0].text;
}

// Использование
const answer = await askClaude('Привет!');
console.log(answer);
Шаг 3 — Запуск
bash
# Установка
npm install express cors

# Ключ в .env файле (не в коде!)
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env

# Запуск с ключом
node -r dotenv/config server.js
Альтернатива без своего сервера
Если не хочешь поднимать бэкенд, можно использовать Cloudflare Workers или Vercel Edge Functions — они бесплатны для небольших объёмов и прячут ключ так же надёжно.

Хочешь пример для одного из этих вариантов?