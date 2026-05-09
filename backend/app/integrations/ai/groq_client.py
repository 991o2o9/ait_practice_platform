import json
import logging
from groq import Groq
from app.core.config import settings

logger = logging.getLogger(__name__)

client = Groq(api_key=settings.GROQ_API_KEY)
validator_client = (
    Groq(api_key=settings.GROQ_VALIDATOR_API_KEY)
    if settings.GROQ_VALIDATOR_API_KEY
    else client
)

# Models
_JSON_MODEL = "llama-3.3-70b-versatile"
_TEXT_MODEL = "llama-3.1-8b-instant"
_MAX_RETRIES = 2


def generate_json_completion(
    system_prompt: str,
    user_prompt: str,
    model: str = _JSON_MODEL,
    use_validator: bool = False,
) -> dict:
    """
    Call Groq and return a parsed JSON dict.
    Retries up to _MAX_RETRIES times on JSON parse failure.
    Returns {"error": ..., "raw": ...} only if all retries fail.
    """
    active_client = validator_client if use_validator else client

    for attempt in range(1, _MAX_RETRIES + 1):
        try:
            completion = active_client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.2,
                max_tokens=8192,
                response_format={"type": "json_object"},
            )

            raw = completion.choices[0].message.content
            return json.loads(raw)

        except json.JSONDecodeError:
            logger.warning(
                "Attempt %d/%d: Failed to parse JSON from Groq. Raw: %.300s",
                attempt,
                _MAX_RETRIES,
                raw,
            )
            if attempt == _MAX_RETRIES:
                logger.error("All %d attempts failed. Returning error dict.", _MAX_RETRIES)
                return {"error": "Failed to parse JSON response after retries", "raw": raw}

        except Exception as e:
            logger.error("Groq API call failed on attempt %d: %s", attempt, str(e))
            if attempt == _MAX_RETRIES:
                return {"error": f"Groq API error: {str(e)}"}


def generate_text_completion(
    system_prompt: str,
    user_prompt: str,
    model: str = _TEXT_MODEL,
) -> str:
    """
    Call Groq and return a plain text response.
    Returns an error string on failure instead of raising.
    """
    try:
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.6,
            max_tokens=1024,
        )
        return completion.choices[0].message.content

    except Exception as e:
        logger.error("Groq text completion failed: %s", str(e))
        return f"Error generating hint: {str(e)}"