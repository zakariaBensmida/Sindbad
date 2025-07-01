const express = require('express');
const router = express.Router();
const { SHOPIFY_API_KEY, SHOPIFY_API_SECRET } = require('../config/env');
const shopify = require('shopify-api-node');

const shopifyClient = new shopify({
  shopName: 'your-shop-name.myshopify.com',
  apiKey: SHOPIFY_API_KEY,
  password: SHOPIFY_API_SECRET,
});

router.get('/orders', async (req, res) => {
  try {
    const orders = await shopifyClient.order.list({ limit: 10 });
    res.json({ message: 'Fetched Shopify orders', orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/webhook/order', async (req, res) => {
  const { id, total_price, currency } = req.body;
  console.log('Received Shopify order webhook:', { id, total_price, currency });
  res.json({ message: `Shopify order webhook received: Order ${id}` });
});

module.exports = router;
