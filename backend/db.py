import asyncpg
import os

async def init_db():
    conn = await asyncpg.connect(
        user=os.getenv("DB_USER", "user"),
        password=os.getenv("DB_PASSWORD", "pass"),
        database=os.getenv("DB_NAME", "sindbad"),
        host=os.getenv("DB_HOST", "postgres")
    )
    try:
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                phone TEXT,
                email TEXT,
                opt_in BOOLEAN DEFAULT FALSE,
                opt_in_email BOOLEAN DEFAULT FALSE,
                language TEXT DEFAULT 'en',
                segment TEXT DEFAULT 'all',
                plan TEXT DEFAULT 'free',
                customer_id TEXT,
                created_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(phone, email)
            );
            CREATE TABLE IF NOT EXISTS campaigns (
                id TEXT NOT NULL,
                name TEXT NOT NULL,
                message TEXT NOT NULL,
                subject TEXT,
                audience TEXT,
                channel TEXT DEFAULT 'whatsapp',
                variant TEXT,
                sent INTEGER DEFAULT 0,
                opened INTEGER DEFAULT 0,
                clicked INTEGER DEFAULT 0,
                converted INTEGER DEFAULT 0,
                converted_value FLOAT DEFAULT 0.0,
                created_at TIMESTAMP DEFAULT NOW(),
                PRIMARY KEY (id, variant)
            );
            CREATE TABLE IF NOT EXISTS chatbot_flows (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT NOT NULL,
                trigger TEXT NOT NULL,
                response TEXT NOT NULL,
                status TEXT DEFAULT 'active',
                usage INTEGER DEFAULT 0,
                language TEXT DEFAULT 'en',
                created_at TIMESTAMP DEFAULT NOW()
            );
            CREATE TABLE IF NOT EXISTS messages (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id TEXT,
                email TEXT,
                content TEXT NOT NULL,
                response TEXT,
                channel TEXT DEFAULT 'whatsapp',
                campaign_id TEXT,
                variant TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            );
            CREATE TABLE IF NOT EXISTS integrations (
                id TEXT PRIMARY KEY,
                api_key TEXT,
                gdpr_opt_in BOOLEAN DEFAULT FALSE,
                updated_at TIMESTAMP DEFAULT NOW()
            );
            CREATE TABLE IF NOT EXISTS chatbot_settings (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT DEFAULT 'Sindbad Assistant',
                default_response TEXT DEFAULT 'Hi! I''m here to help.',
                languages TEXT[] DEFAULT ARRAY['en', 'de', 'es', 'nl', 'fr']
            );
        """)
        print("Database schema initialized")
    finally:
        await conn.close()

if __name__ == "__main__":
    import asyncio
    asyncio.run(init_db())
