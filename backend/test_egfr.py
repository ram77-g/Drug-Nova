import httpx
import asyncio

async def test_uniprot():
    url = "https://rest.uniprot.org/uniprotkb/P00533" # EGFR
    async with httpx.AsyncClient() as client:
        res = await client.get(url)
        data = res.json()
        features = data.get("features", [])
        
        sites = []
        all_feature_types = set()
        
        for f in features:
            f_type = f.get("type")
            all_feature_types.add(f_type)
            if f_type in ["Binding site", "Active site", "Site"]:
                start = f.get("location", {}).get("start", {}).get("value")
                end = f.get("location", {}).get("end", {}).get("value")
                desc = f.get("description", "")
                sites.append(f"{f_type}: {start}-{end} ({desc})")
                
        print("EGFR Sites found:", sites)
        print("All feature types present:", all_feature_types)

asyncio.run(test_uniprot())
