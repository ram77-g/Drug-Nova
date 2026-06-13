import asyncio
import httpx

async def check():
    headers = {"User-Agent": "Drug-Nova/1.0 (contact@example.com)"}
    async with httpx.AsyncClient(headers=headers) as client:
        resp = await client.get("https://rest.uniprot.org/uniprotkb/P40763", timeout=5.0)
        data = resp.json()
        features = data.get("features", [])
        types = set(f.get("type") for f in features)
        print("STAT3 Feature types:", types)
        
        # Print all features to see what might be a binding pocket
        for f in features:
            if f.get("type") in ["Domain", "Region", "Motif", "Zinc finger", "DNA-binding region", "Sequence variation"]:
                print(f['type'], f.get('description'), f.get('location', {}).get('start', {}).get('value'), "-", f.get('location', {}).get('end', {}).get('value'))

asyncio.run(check())
