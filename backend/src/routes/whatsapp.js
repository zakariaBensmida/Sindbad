
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { WHATSAPP_TOKEN } = require('../config/env');

router.post('/send', async (req, res) => {
  const { phoneNumber, message } = req.body;
  try {
    const response = await axios.post(
      'https://graph.facebook.com/v17.0/your-phone-number-id/messages',
      {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    res.json({ message: 'WhatsApp message sent', response: response.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
