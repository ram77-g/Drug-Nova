import httpx
import os
import asyncio

async def fetch_pdb():
    url = "https://files.rcsb.org/download/1M17.pdb"
    async with httpx.AsyncClient() as client:
        res = await client.get(url)
        with open("1M17.pdb", "wb") as f:
            f.write(res.content)

    residues = set()
    with open("1M17.pdb", "r") as f:
        for line in f:
            if line.startswith("ATOM  "):
                res_num = int(line[22:26].strip())
                residues.add(res_num)
    print("Min residue:", min(residues) if residues else "None")
    print("Max residue:", max(residues) if residues else "None")

asyncio.run(fetch_pdb())
