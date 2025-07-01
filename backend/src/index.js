const express = require('express');
const cors = require('cors');
const webhookRoutes = require('./routes/webhook');
const shopifyRoutes = require('./routes/shopify');
const whatsappRoutes = require('./routes/whatsapp');
const llmRoutes = require('./routes/llm');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/webhook', webhookRoutes);
app.use('/api/shopify', shopifyRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/llm', llmRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Sindbad Backend Running' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
