const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Универсальный прокси для всех методов и любых путей под /v1/
app.use('/v1/', async (req, res) => {
  try {
    const apiKey = req.headers['authorization']?.replace('Bearer ', '');
    if (!apiKey) {
      return res.status(401).json({error: 'Missing Authorization header'});
    }

    const url = `https://api.openai.com${req.originalUrl}`;
    const axiosConfig = {
      method: req.method,
      url: url,
      headers: {
        ...req.headers, // Пробрасываем все оригинальные заголовки (можно сузить)
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      data: req.body,
      params: req.query,
      validateStatus: () => true, // Возвращаем любые коды ответа (в том числе 4xx, 5xx)
    };

    const response = await axios(axiosConfig);
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.toString(),
      details: error.response?.data,
    });
  }
});

// Пинг для проверки статуса сервера
app.get('/', (req, res) => res.send('OpenAI Proxy server is running.'));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
