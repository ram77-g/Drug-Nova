import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

def test():
    try:
        key = os.getenv("GEMINI_API_KEY")
        print(f"Key loaded: {key[:5]}...")
        client = genai.Client(api_key=key)
        print("Client loaded, testing generate gemini-2.5-flash...")
        res = client.models.generate_content(
            model='gemini-2.5-flash',
            contents='hello'
        )
        print("Success:", res.text)
    except Exception as e:
        print("ERROR:", e)

if __name__ == "__main__":
    test()
