import os
from dotenv import load_dotenv
import google.generativeai as genai
import asyncio

load_dotenv()

async def test():
    try:
        key = os.getenv("GEMINI_API_KEY")
        print(f"Key loaded: {key[:5]}...")
        genai.configure(api_key=key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        print("Model loaded, testing generate...")
        res = await model.generate_content_async([{"role": "user", "parts": ["hello"]}])
        print("Success:", res.text)
    except Exception as e:
        print("ERROR:", e)

if __name__ == "__main__":
    asyncio.run(test())
