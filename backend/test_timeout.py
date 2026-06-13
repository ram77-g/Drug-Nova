import asyncio
import httpx
import time

async def test_uniprot():
    url = "https://rest.uniprot.org/uniprotkb/P00533"
    headers = {"User-Agent": "Drug-Nova/1.0 (contact@example.com)"}
    start = time.time()
    
    async with httpx.AsyncClient(headers=headers) as client:
        try:
            print("Fetching...")
            resp = await client.get(url, timeout=5.0)
            print("Status:", resp.status_code)
        except Exception as e:
            print("Exception:", type(e).__name__)
    print("Time taken:", time.time() - start)

asyncio.run(test_uniprot())
