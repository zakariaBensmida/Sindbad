from transformers import pipeline
import os

mistral = pipeline("text-generation", model="mistralai/Mixtral-8x7B-Instruct-v0.1", token=os.getenv("HUGGINGFACE_API_KEY"))

async def process_message_with_mistral(message: str, language: str = "en", default_response: str = "Hi! I'm here to help.") -> str:
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
        return response if response else default_response
    except Exception as e:
        print(f"LLM processing failed: {str(e)}")
        return default_response
