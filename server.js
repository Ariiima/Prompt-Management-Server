const express = require('express');
const Redis = require('ioredis');
const { v4: uuidv4 } = require('uuid');


const app = express();
const port = 3000;

// Middleware for parsing JSON bodies from HTTP requests
app.use(express.json());

app.get('/prompts/:id', async (req, res) => {
  const promptId = req.params.id;
  const prompt = await redis.get(`prompts:${promptId}`);
  if (prompt) {
    res.json(JSON.parse(prompt));
  } else {
    res.status(404).send('Prompt not found');
  }
});

app.post('/prompts', async (req, res) => {
  const prompt = req.body;
  console.log(prompt);
  const promptId = uuidv4();
  await redis.set(`prompts:${promptId}`, JSON.stringify(prompt));
  res.json({ id: promptId,prompt:JSON.stringify(prompt) });
});

app.put('/prompts/:id', async (req, res) => {
  const promptId = req.params.id;
  const prompt = req.body;
  const result = await redis.set(`prompts:${promptId}`, JSON.stringify(prompt), 'XX');
  if (result === 'OK') {
    res.json({ id: promptId, prompt: JSON.stringify(prompt) });
  } else {
    res.status(404).send('Prompt not found');
  }
});

app.delete('/prompts/:id', async (req, res) => {
  const promptId = req.params.id;
  const result = await redis.del(`prompts:${promptId}`);
  if (result === 1) {
    res.send('Prompt deleted');
  } else {
    res.status(404).send('Prompt not found');
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

const redis = new Redis({
  host: '127.0.0.1',
  port: 6379,
});

redis.on('connect', () => {
  console.log('Connected to Redis...');
});

redis.on('error', (err) => {
  console.log('Redis error:', err);
});
