Sindbad
A WhatsApp/SMS/Email-first conversational commerce app for SMEs and freelancers, integrating Shopify, Mollie payments, SendGrid email, and a multilingual AI chatbot powered by Mistral.
Features

Multi-Channel Campaigns: Send campaigns via WhatsApp, SMS, email, or all channels (CampaignManager.tsx).
A/B Testing: Test two message variants to optimize performance (CampaignManager.tsx).
Multilingual Chatbot: AI responses (Mistral) in English, German, Spanish, Dutch, French (llm.py). Note: Commercial use requires a paid Mistral license or Hugging Face Inference API plan.
Shopify Integration: Sync products/orders (IntegrationsManager.tsx).
Mollie Payments: Process transactions with iDEAL, Sofort, credit cards.
Subscription Billing: Recurring plans (Free, Starter, Pro, Enterprise).
Analytics Dashboard: Campaign performance, conversion funnel, segment engagement, message volume, ROI (AnalyticsDashboard.tsx).
GDPR Compliance: Double opt-in, encryption.

Pricing

Free: 300 messages/month, basic chatbot, Shopify/Mollie sync.
Starter: €10/month, 3,000 messages, analytics, email support.
Pro: €30/month, 30,000 messages, multi-channel campaigns, A/B testing, SMS/email support.
Enterprise: €80/month, unlimited messages, custom integrations, advanced analytics.

Setup

Clone Repository:
git clone https://github.com/your-username/sindbad.git
cd sindbad


Frontend:
cd frontend
npm install
cp .env.example .env
# Update .env with VITE_API_URL, VITE_SHOPIFY_TOKEN, VITE_WHATSAPP_TOKEN
npm start


Access: http://localhost:3000


Backend:
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
psql -U user -d sindbad -h localhost < init.sql
cp .env.example .env
# Update .env with DB, WHATSAPP, SHOPIFY, MOLLIE, TWILIO, SENDGRID, HUGGINGFACE keys
docker-compose up -d


APIs: http://localhost:8000/docs
Webhooks: Run ngrok http 8000 and update Meta/Twilio/SendGrid/Mollie dashboards.


API Keys:

WhatsApp: Meta Business Platform.
Shopify: Admin > Apps > Develop apps.
Mollie: mollie.com.
Twilio: twilio.com.
SendGrid: sendgrid.com.
Hugging Face: huggingface.co (paid plan for commercial use).



Testing

Multi-Channel Contact: Use CampaignManager.tsx with Meta/Twilio/SendGrid test accounts, select "multi" channel.
A/B Testing: Enable A/B test in CampaignManager.tsx, input two messages/subjects, and compare performance in AnalyticsDashboard.tsx.
Transaction: Send Shopify checkout or Mollie payment link via IntegrationsManager.tsx.
Subscription: Create plans via IntegrationsManager.tsx.
Analytics: View campaign, funnel, segment, time-series, and ROI metrics in AnalyticsDashboard.tsx.

Deployment

Frontend: Vercel (npm run build).
Backend: Hetzner (€40/month, AX41).
Database: PostgreSQL (Dockerized).

Costs

WhatsApp: €0.05/message, €30–€120/user/year.
Twilio: €0.06/SMS (Europe).
SendGrid: €0.003/email (100K emails/month free tier).
Mollie: €0.29 (iDEAL), 1.8% + €0.25 (cards).
Hugging Face: Paid plan for Mistral (check huggingface.co/pricing).
Hosting: €480/year (Hetzner).
Total (5,000 users): €31,480–€122,480.

Revenue

5,000 users: €480,000 (~$500,000).
Free (60%): 3,000 × €0.
Starter (25%): 1,250 × €10 × 12 = €150,000.
Pro (13%): 650 × €30 × 12 = €234,000.
Enterprise (2%): 100 × €80 × 12 = €96,000.



Market

Netherlands: 159,000–217,250 users.
France: 103,080–161,160 users.
Germany, Spain, Italy: 473,500–719,000 users.
Total: 735,580–1,097,410 users.

