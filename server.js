const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

const redis = require('redis');
const client = redis.createClient();

client.on('connect', function() {
    console.log('Connected to Redis...');
});

client.on('error', function (err) {
    console.log('Redis error: ' + err);
});


