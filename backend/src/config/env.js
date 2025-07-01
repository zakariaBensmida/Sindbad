require('dotenv').config();

module.exports = {
  SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY || 'your-shopify-api-key',
  SHOPIFY_API_SECRET: process.env.SHOPIFY_API_SECRET || 'your-shopify-api-secret',
  WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN || 'your-whatsapp-token',
  XAI_API_KEY: process.env.XAI_API_KEY || 'your-xai-api-key',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || 'your-stripe-secret-key',
};
