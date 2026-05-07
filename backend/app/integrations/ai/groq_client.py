import json
import logging
from groq import Groq
from app.core.config import settings

# Настраиваем логгер для отладки
logger = logging.getLogger(__name__)

client = Groq(api_key=settings.GROQ_API_KEY)

def generate_json_completion(system_prompt: str, user_prompt: str, model: str = "llama-3.3-70b-versatile") -> dict:
    completion = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.2,    
        max_tokens=8192,
        response_format={"type": "json_object"}
    )
    
    response_content = completion.choices[0].message.content
    try:
        return json.loads(response_content)
    except json.JSONDecodeError:    
        logger.error(f"Failed to parse JSON. Raw response from Groq: {response_content}")
        return {"error": "Failed to parse JSON response", "raw": response_content}

def generate_text_completion(system_prompt: str, user_prompt: str, model: str = "llama-3.1-8b-instant") -> str:
    completion = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.6,
        max_tokens=1024
    )
    return completion.choices[0].message.content