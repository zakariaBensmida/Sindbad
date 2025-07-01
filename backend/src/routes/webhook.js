const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  const { event } = req.body;
  console.log('Received webhook:', { event, payload: req.body });
  res.json({ message: `Webhook received: ${event}` });
});

router.post('/payment', (req, res) => {
  const { event, amount, currency } = req.body;
  console.log('Received payment webhook:', { event, amount, currency });
  res.json({ message: `Payment webhook received: ${event}, Amount: ${amount} ${currency}` });
});

module.exports = router;
