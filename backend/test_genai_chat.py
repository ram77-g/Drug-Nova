import os
import asyncio
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

async def test():
    try:
        key = os.getenv("GEMINI_API_KEY")
        client = genai.Client(api_key=key)
        
        contents = [
            types.Content(role="user", parts=[types.Part.from_text(text="hi, I am Bob")]),
            types.Content(role="model", parts=[types.Part.from_text(text="Hi Bob, I am your assistant.")]),
            types.Content(role="user", parts=[types.Part.from_text(text="what is my name?")]),
        ]
        
        print("Testing aio...")
        res = await client.aio.models.generate_content(
            model='gemini-2.5-flash',
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction="You are a helpful assistant."
            )
        )
        print("Success:", res.text)
    except Exception as e:
        print("ERROR:", e)

if __name__ == "__main__":
    asyncio.run(test())
