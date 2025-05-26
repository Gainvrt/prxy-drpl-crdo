const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Прокси для POST-запросов OpenAI chat
app.post('/v1/chat/completions', async (req, res) => {
  try {
    const apiKey = req.headers['authorization']?.replace('Bearer ', '');
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      error: error.toString(),
      details: error.response?.data,
    });
  }
});

app.get('/', (req, res) => res.send('OpenAI Proxy server is running.'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
