import asyncio
import httpx

async def check():
    headers = {"User-Agent": "Drug-Nova/1.0 (contact@example.com)"}
    async with httpx.AsyncClient(headers=headers) as client:
        resp = await client.get("https://rest.uniprot.org/uniprotkb/P05231", timeout=5.0)
        data = resp.json()
        features = data.get("features", [])
        types = set(f.get("type") for f in features)
        print("IL6 Feature types:", types)

asyncio.run(check())
