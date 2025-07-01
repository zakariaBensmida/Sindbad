const express = require('express');
const router = express.Router();
const axios = require('axios');
const { XAI_API_KEY } = require('../config/env');

router.post('/chat', async (req, res) => {
  const { event, message } = req.body;
  try {
    const response = await axios.post(
      'https://api.x.ai/v1/chat',
      { prompt: message, max_tokens: 100 },
      {
        headers: {
          Authorization: `Bearer ${XAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    res.json({ message: `Chatbot response: ${event}`, response: response.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
