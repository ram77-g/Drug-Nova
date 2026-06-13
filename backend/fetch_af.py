import httpx
import os
import asyncio

async def fetch_cif():
    url = "https://alphafold.ebi.ac.uk/files/AF-P00533-F1-model_v4.cif"
    async with httpx.AsyncClient() as client:
        res = await client.get(url)
        with open(r"c:\Users\praka\OneDrive\Documents\Drug-Nova\frontend\public\structures\P00533.cif", "wb") as f:
            f.write(res.content)
            
    print("Downloaded P00533.cif")

asyncio.run(fetch_cif())
