import os
from google import genai
from google.genai import types as genai_types

KEY = os.getenv("GOOGLE_API_KEY")
client = genai.Client(api_key=KEY)

models_to_try = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-flash-lite-latest",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite",
    "gemini-3-flash-preview",
]

for model in models_to_try:
    try:
        resp = client.models.generate_content(
            model=model,
            contents="Say hello in one word",
            config=genai_types.GenerateContentConfig(response_mime_type="application/json")
        )
        print(f"SUCCESS: {model} -> {resp.text.strip()}")
    except Exception as e:
        err = str(e)
        if "limit: 0" in err:
            print(f"QUOTA_ZERO: {model}")
        elif "429" in err:
            print(f"RATE_LIMITED: {model}")
        elif "404" in err:
            print(f"NOT_FOUND: {model}")
        else:
            print(f"ERROR: {model} -> {err[:100]}")

