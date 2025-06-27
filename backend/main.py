from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
import aiohttp
import asyncpg
import os
from mollie.api.client import Client
from twilio.rest import Client as TwilioClient
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from transformers import pipeline
import random

app = FastAPI()
mollie = Client()
mollie.set_api_key(os.getenv("MOLLIE_API_KEY"))
twilio = TwilioClient(os.getenv("TWILIO_ACCOUNT_SID"), os.getenv("TWILIO_AUTH_TOKEN"))
sendgrid = SendGridAPIClient(os.getenv("SENDGRID_API_KEY"))
mistral = pipeline("text-generation", model="mistralai/Mixtral-8x7B-Instruct-v0.1", token=os.getenv("HUGGINGFACE_API_KEY"))

# Models
class ProductRequest(BaseModel):
    product_id: str
    phone: str
    email: str | None
    channel: str  # 'whatsapp', 'sms', 'email', 'multi'

class PaymentRequest(BaseModel):
    amount: float
    description: str
    redirect_url: str
    phone: str
    email: str | None
    channel: str

class SubscriptionRequest(BaseModel):
    user_id: str
    plan: str  # 'starter', 'pro', 'enterprise'
    phone: str
    email: str | None

class CampaignRequest(BaseModel):
    name: str
    message: str
    subject: str | None  # For email
    audience: str
    channel: str  # 'whatsapp', 'sms', 'email', 'multi'

class ABCampaignRequest(BaseModel):
    name: str
    message_a: str
    message_b: str
    subject_a: str | None
    subject_b: str | None
    audience: str
    channel: str
    split_ratio: float = 0.5  # Percentage for variant A (0.0 to 1.0)

class AnalyticsRequest(BaseModel):
    start_date: str
    end_date: str

# Messaging Costs
MESSAGE_COSTS = {
    "whatsapp": 0.05,  # €0.05 per message
    "sms": 0.06,       # €0.06 per SMS
    "email": 0.003     # €0.003 per email
}

# Shopify
async def get_shopify_product(product_id: str):
    async with aiohttp.ClientSession() as session:
        url = f"{os.getenv('SHOPIFY_STORE_URL')}/admin/api/2023-10/products/{product_id}.json"
        headers = {"X-Shopify-Access-Token": os.getenv("SHOPIFY_TOKEN")}
        async with session.get(url, headers=headers) as resp:
            if resp.status != 200:
                raise HTTPException(status_code=resp.status, detail=await resp.text())
            return await resp.json()

async def create_shopify_checkout(product_id: str, quantity: int = 1):
    async with aiohttp.ClientSession() as session:
        url = f"{os.getenv('SHOPIFY_STORE_URL')}/admin/api/2023-10/checkouts.json"
        headers = {"X-Shopify-Access-Token": os.getenv("SHOPIFY_TOKEN")}
        payload = {"checkout": {"line_items": [{"variant_id": product_id, "quantity": quantity}]}}
        async with session.post(url, json=payload, headers=headers) as resp:
            if resp.status != 201:
                raise HTTPException(status_code=resp.status, detail=await resp.text())
            return await resp.json()

# Messaging
async def send_whatsapp_message(phone: str, message: str):
    async with aiohttp.ClientSession() as session:
        url = f"https://graph.facebook.com/v17.0/{os.getenv('PHONE_NUMBER_ID')}/messages"
        headers = {"Authorization": f"Bearer {os.getenv('WHATSAPP_TOKEN')}"}
        payload = {
            "messaging_product": "whatsapp",
            "to": phone,
            "type": "text",
            "text": {"body": message}
        }
        async with session.post(url, json=payload, headers=headers) as resp:
            if resp.status != 200:
                raise HTTPException(status_code=resp.status, detail=await resp.text())
            return await resp.json()

async def send_sms_message(phone: str, message: str):
    try:
        twilio.messages.create(
            body=message,
            from_=os.getenv("TWILIO_PHONE_NUMBER"),
            to=phone
        )
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def send_email_message(email: str, subject: str, message: str):
    try:
        mail = Mail(
            from_email=os.getenv("SENDGRID_FROM_EMAIL"),
            to_emails=email,
            subject=subject,
            plain_text_content=message
        )
        response = sendgrid.send(mail)
        if response.status_code != 202:
            raise HTTPException(status_code=response.status_code, detail="Email sending failed")
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def send_message(phone: str, email: str | None, message: str, subject: str | None, channel: str, campaign_id: str, variant: str = None):
    conn = await asyncpg.connect(
        user=os.getenv("DB_USER"), password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"), host=os.getenv("DB_HOST")
    )
    try:
        user = await conn.fetchrow("SELECT opt_in, opt_in_email, plan, segment FROM users WHERE phone = $1 OR email = $2", phone, email)
        if not user:
            raise HTTPException(status_code=403, detail="User not found")
        channels = []
        if channel == "multi":
            if user["opt_in"]:
                channels.extend(["whatsapp", "sms"])
            if user["opt_in_email"]:
                channels.append("email")
        else:
            channels = [channel]
        for ch in channels:
            if ch in ["whatsapp", "sms"] and not user["opt_in"]:
                continue
            if ch == "email" and not user["opt_in_email"]:
                continue
            if ch in ["whatsapp", "sms"] and user["plan"] in ["free", "starter"]:
                message_count = await conn.fetchval("SELECT COUNT(*) FROM messages WHERE user_id = $1 AND created_at > NOW() - INTERVAL '1 month'", phone)
                limit = 300 if user["plan"] == "free" else 3000
                if message_count >= limit:
                    continue
            if ch == "sms" and user["plan"] == "free":
                continue
            if ch == "email" and user["plan"] == "free":
                continue
            if ch == "whatsapp":
                await send_whatsapp_message(phone, message)
            elif ch == "sms":
                await send_sms_message(phone, message)
            elif ch == "email":
                await send_email_message(email, subject or "Sindbad Offer", message)
            await conn.execute(
                "INSERT INTO messages (user_id, email, content, response, channel, campaign_id, variant) VALUES ($1, $2, $3, $4, $5, $6, $7)",
                phone, email, message, message, ch, campaign_id, variant
            )
            await conn.execute(
                "UPDATE campaigns SET sent = sent + 1 WHERE id = $1 AND variant = $2",
                campaign_id, variant or ch
            )
    finally:
        await conn.close()

# LLM
async def process_message_with_mistral(message: str, language: str = "en"):
    try:
        prompts = {
            "en": f"Respond to the following customer message in English, keeping the tone friendly and professional: {message}",
            "de": f"Antworte auf die folgende Kundenmessage auf Deutsch, halte den Ton freundlich und professionell: {message}",
            "es": f"Responde al siguiente mensaje del cliente en Español, manteniendo un tono amable y profesional: {message}",
            "nl": f"Beantwoord het volgende klantbericht in het Nederlands, houd de toon vriendelijk en professioneel: {message}",
            "fr": f"Répondez au message client suivant en français, en gardant un ton amical et professionnel : {message}"
        }
        prompt = prompts.get(language, prompts["en"])
        result = mistral(prompt, max_length=150, num_return_sequences=1, temperature=0.7)
        response = result[0]["generated_text"].strip().replace(prompt, "")
        return response if response else "Hi! I'm here to help."
    except Exception as e:
        print(f"LLM processing failed: {str(e)}")
        return "Hi! I'm here to help."

# Analytics Update
async def update_analytics(campaign_id: str, url: str, metric: str, value: float = None):
    conn = await asyncpg.connect(
        user=os.getenv("DB_USER"), password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"), host=os.getenv("DB_HOST")
    )
    try:
        if metric == "clicked":
            await conn.execute(
                "UPDATE campaigns SET clicked = clicked + 1 WHERE id = $1 AND message LIKE $2",
                campaign_id, f"%{url}%"
            )
        elif metric == "converted":
            await conn.execute(
                "UPDATE campaigns SET converted = converted + 1, converted_value = converted_value + $3 WHERE id = $1 AND message LIKE $2",
                campaign_id, f"%{url}%", value or 0.0
            )
    finally:
        await conn.close()

# Endpoints
@app.post("/product")
async def send_product_checkout(request: ProductRequest):
    product_data = await get_shopify_product(request.product_id)
    product = product_data["product"]
    product_name = product["title"]
    product_price = float(product["variants"][0]["price"])
    checkout_data = await create_shopify_checkout(product["variants"][0]["id"])
    checkout_url = checkout_data["checkout"]["web_url"]
    campaign_id = str(random.randint(100000, 999999))
    message = f"Buy {product_name} for €{product_price}! Complete your purchase: {checkout_url}"
    await send_message(request.phone, request.email, message, f"Purchase {product_name}", request.channel, campaign_id)
    await update_analytics(campaign_id, checkout_url, "clicked")
    return {"status": "success", "checkout_url": checkout_url}

@app.post("/payment")
async def create_payment(request: PaymentRequest):
    try:
        payment = await mollie.payments.create({
            "amount": {"currency": "EUR", "value": f"{request.amount:.2f}"},
            "description": request.description,
            "redirectUrl": request.redirect_url,
            "webhookUrl": "https://your-ngrok-id.ngrok.io/payment/webhook",
            "method": ["creditcard", "ideal", "sofort", "paypal"]
        })
        campaign_id = str(random.randint(100000, 999999))
        await send_message(
            request.phone, request.email,
            f"Complete your payment: {payment.get_checkout_url()}",
            f"Payment for {request.description}", request.channel, campaign_id
        )
        await update_analytics(campaign_id, payment.get_checkout_url(), "clicked")
        return {"status": "success", "payment_url": payment.get_checkout_url()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/subscription")
async def create_subscription(request: SubscriptionRequest):
    plans = {"starter": 10.00, "pro": 30.00, "enterprise": 80.00}
    if request.plan not in plans:
        raise HTTPException(status_code=400, detail="Invalid plan")
    try:
        customer = await mollie.customers.create({"metadata": {"user_id": request.user_id}})
        subscription = await mollie.customers_subscriptions.create(
            customer_id=customer.id,
            amount={"currency": "EUR", "value": f"{plans[request.plan]:.2f}"},
            interval="1 month",
            description=f"Sindbad {request.plan} plan",
            webhookUrl="https://your-ngrok-id.ngrok.io/subscription/webhook"
        )
        conn = await asyncpg.connect(
            user=os.getenv("DB_USER"), password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME"), host=os.getenv("DB_HOST")
        )
        await conn.execute(
            "UPDATE users SET plan = $1, customer_id = $2 WHERE id = $3",
            request.plan, customer.id, request.user_id
        )
        await conn.close()
        campaign_id = str(random.randint(100000, 999999))
        await send_message(
            request.phone, request.email,
            f"Subscribed to {request.plan} plan!", "Sindbad Subscription", "whatsapp", campaign_id
        )
        return {"status": "success", "subscription_id": subscription.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/payment/webhook")
async def payment_webhook(request: Request):
    data = await request.json()
    payment_id = data.get("id")
    payment = await mollie.payments.get(payment_id)
    if payment.is_paid():
        print(f"Payment {payment_id} completed")
        campaign_id = str(random.randint(100000, 999999))
        await update_analytics(campaign_id, payment.get_checkout_url(), "converted", float(payment.amount["value"]))
    return {"status": "ok"}

@app.post("/subscription/webhook")
async def subscription_webhook(request: Request):
    data = await request.json()
    subscription_id = data.get("id")
    subscription = await mollie.subscriptions.get(subscription_id)
    if subscription.status == "active":
        print(f"Subscription {subscription_id} renewed")
    return {"status": "ok"}

@app.post("/webhook")
async def whatsapp_webhook(request: Request):
    data = await request.json()
    phone = data.get("from")
    message = data.get("text", {}).get("body")
    if message:
        conn = await asyncpg.connect(
            user=os.getenv("DB_USER"), password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME"), host=os.getenv("DB_HOST")
        )
        user = await conn.fetchrow("SELECT language, email FROM users WHERE phone = $1", phone)
        response = await process_message_with_mistral(message, user["language"] if user else "en")
        campaign_id = str(random.randint(100000, 999999))
        await send_message(phone, user["email"] if user else None, response, "Sindbad Response", "whatsapp", campaign_id)
        await conn.close()
    return {"status": "ok"}

@app.post("/sms/webhook")
async def sms_webhook(request: Request):
    data = await request.form()
    phone = data.get("From")
    message = data.get("Body")
    if message:
        conn = await asyncpg.connect(
            user=os.getenv("DB_USER"), password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME"), host=os.getenv("DB_HOST")
        )
        user = await conn.fetchrow("SELECT language, email FROM users WHERE phone = $1", phone)
        response = await process_message_with_mistral(message, user["language"] if user else "en")
        campaign_id = str(random.randint(100000, 999999))
        await send_message(phone, user["email"] if user else None, response, "Sindbad Response", "sms", campaign_id)
        await conn.close()
    return {"status": "ok"}

@app.post("/email/webhook")
async def email_webhook(request: Request):
    data = await request.json()
    email = data.get("from")
    message = data.get("text")
    if message:
        conn = await asyncpg.connect(
            user=os.getenv("DB_USER"), password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME"), host=os.getenv("DB_HOST")
        )
        user = await conn.fetchrow("SELECT language, phone FROM users WHERE email = $1", email)
        response = await process_message_with_mistral(message, user["language"] if user else "en")
        campaign_id = str(random.randint(100000, 999999))
        await send_message(user["phone"] if user else None, email, response, "Sindbad Response", "email", campaign_id)
        await conn.close()
    return {"status": "ok"}

@app.post("/campaign")
async def create_campaign(request: CampaignRequest):
    conn = await asyncpg.connect(
        user=os.getenv("DB_USER"), password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"), host=os.getenv("DB_HOST")
    )
    try:
        campaign_id = str(random.randint(100000, 999999))
        await conn.execute(
            "INSERT INTO campaigns (id, name, message, subject, audience, channel, variant) VALUES ($1, $2, $3, $4, $5, $6, $7)",
            campaign_id, request.name, request.message, request.subject, request.audience, request.channel, request.channel
        )
        users = await conn.fetch("SELECT phone, email, opt_in, opt_in_email FROM users WHERE segment = $1 AND (opt_in = TRUE OR opt_in_email = TRUE)", request.audience)
        for user in users:
            await send_message(user["phone"], user["email"], request.message, request.subject, request.channel, campaign_id)
        return {"status": "success", "campaign_id": campaign_id}
    finally:
        await conn.close()

@app.post("/ab_campaign")
async def create_ab_campaign(request: ABCampaignRequest):
    conn = await asyncpg.connect(
        user=os.getenv("DB_USER"), password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"), host=os.getenv("DB_HOST")
    )
    try:
        campaign_id = str(random.randint(100000, 999999))
        # Insert variant A
        await conn.execute(
            "INSERT INTO campaigns (id, name, message, subject, audience, channel, variant) VALUES ($1, $2, $3, $4, $5, $6, $7)",
            campaign_id, f"{request.name} (A)", request.message_a, request.subject_a, request.audience, request.channel, "A"
        )
        # Insert variant B
        await conn.execute(
            "INSERT INTO campaigns (id, name, message, subject, audience, channel, variant) VALUES ($1, $2, $3, $4, $5, $6, $7)",
            campaign_id, f"{request.name} (B)", request.message_b, request.subject_b, request.audience, request.channel, "B"
        )
        users = await conn.fetch("SELECT phone, email, opt_in, opt_in_email FROM users WHERE segment = $1 AND (opt_in = TRUE OR opt_in_email = TRUE)", request.audience)
        random.shuffle(users)
        split_index = int(len(users) * request.split_ratio)
        group_a = users[:split_index]
        group_b = users[split_index:]
        for user in group_a:
            await send_message(user["phone"], user["email"], request.message_a, request.subject_a, request.channel, campaign_id, "A")
        for user in group_b:
            await send_message(user["phone"], user["email"], request.message_b, request.subject_b, request.channel, campaign_id, "B")
        return {"status": "success", "campaign_id": campaign_id}
    finally:
        await conn.close()

@app.post("/analytics/detailed")
async def get_detailed_analytics(request: AnalyticsRequest):
    conn = await asyncpg.connect(
        user=os.getenv("DB_USER"), password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"), host=os.getenv("DB_HOST")
    )
    try:
        campaigns = await conn.fetch(
            "SELECT id, name, channel, sent, clicked, converted, variant, converted_value FROM campaigns WHERE created_at BETWEEN $1 AND $2",
            request.start_date, request.end_date
        )
        messages = await conn.fetch(
            "SELECT channel, COUNT(*) as count FROM messages WHERE created_at BETWEEN $1 AND $2 GROUP BY channel",
            request.start_date, request.end_date
        )
        segments = await conn.fetch(
            "SELECT u.segment, COUNT(m.id) as messages, SUM(c.sent) as sent, SUM(c.clicked) as clicked, SUM(c.converted) as converted "
            "FROM users u LEFT JOIN messages m ON u.phone = m.user_id "
            "LEFT JOIN campaigns c ON c.audience = u.segment "
            "WHERE m.created_at BETWEEN $1 AND $2 OR c.created_at BETWEEN $1 AND $2 "
            "GROUP BY u.segment",
            request.start_date, request.end_date
        )
        time_series = await conn.fetch(
            "SELECT DATE(created_at) as date, channel, COUNT(*) as count "
            "FROM messages WHERE created_at BETWEEN $1 AND $2 GROUP BY DATE(created_at), channel",
            request.start_date, request.end_date
        )
        return {"campaigns": campaigns, "messages": messages, "segments": segments, "time_series": time_series}
    finally:
        await conn.close()

@app.post("/analytics/roi")
async def get_roi_analytics(request: AnalyticsRequest):
    conn = await asyncpg.connect(
        user=os.getenv("DB_USER"), password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"), host=os.getenv("DB_HOST")
    )
    try:
        campaigns = await conn.fetch(
            "SELECT id, name, channel, sent, converted_value, variant FROM campaigns WHERE created_at BETWEEN $1 AND $2",
            request.start_date, request.end_date
        )
        roi_data = []
        for campaign in campaigns:
            cost = campaign["sent"] * MESSAGE_COSTS.get(campaign["channel"], 0.05)
            revenue = campaign["converted_value"] or 0.0
            roi = ((revenue - cost) / cost * 100) if cost > 0 else 0.0
            roi_data.append({
                "name": campaign["name"],
                "channel": campaign["channel"],
                "variant": campaign["variant"],
                "cost": round(cost, 2),
                "revenue": round(revenue, 2),
                "roi": round(roi, 2)
            })
        return {"roi_data": roi_data}
    finally:
        await conn.close()
