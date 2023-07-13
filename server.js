const express = require('express');
const Redis = require('ioredis');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');


const app = express();
const port = 3000;

// Middleware for parsing JSON bodies from HTTP requests
app.use(express.json());
app.use(cors());



app.get('/prompts/:id', async (req, res) => {
  try {
    const promptId = req.params.id;
    const prompt = await redis.get(`prompts:${promptId}`);
    if (prompt) {
      res.json(JSON.parse(prompt));
    } else {
      res.status(404).send('Prompt not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/prompts', async (req, res) => {
    try{
    const keys = await redis.keys('prompts:*');
    const prompts = await redis.mget(keys);
    const result = keys.map((key, index) => {
      const prompt = JSON.parse(prompts[index]);
      return { id: key.replace('prompts:', ''), ...prompt };
    });
    res.json(result);}
    catch(error){
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
  });
  

app.post('/prompts', async (req, res) => {
    try{
  const prompt = req.body;
  console.log(prompt);
  const promptId = uuidv4();
  await redis.set(`prompts:${promptId}`, JSON.stringify(prompt));
  res.json({ id: promptId,prompt:JSON.stringify(prompt) });}
  catch(error){
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.put('/prompts/:id', async (req, res) => {
    try{
  const promptId = req.params.id;
  const prompt = req.body;
  const result = await redis.set(`prompts:${promptId}`, JSON.stringify(prompt), 'XX');
  if (result === 'OK') {
    res.json({ id: promptId, prompt: JSON.stringify(prompt) });
  } else {
    res.status(404).send('Prompt not found');
  }}
  catch(error){
    console.error(error);
    res.status(500).send('Internal Server Error');}
});

app.delete('/prompts/:id', async (req, res) => {
    try{
  const promptId = req.params.id;
  const result = await redis.del(`prompts:${promptId}`);
  if (result === 1) {
    res.send('Prompt deleted');
  } else {
    res.status(404).send('Prompt not found');
  }}
  catch(error){
    console.error(error);
    res.status(500).send('Internal Server Error');}
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

const redis = new Redis({
  host: 'redis',
  port: 6379,
});

redis.on('connect', () => {
  console.log('Connected to Redis...');
});

redis.on('error', (err) => {
  console.log('Redis error:', err);
});
