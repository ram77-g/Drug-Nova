import httpx
import asyncio

async def test_uniprot():
    url = "https://rest.uniprot.org/uniprotkb/P04626" # HER2
    async with httpx.AsyncClient() as client:
        res = await client.get(url)
        data = res.json()
        features = data.get("features", [])
        binding_sites = []
        for f in features:
            if f.get("type") in ["Binding site", "Active site", "Site"]:
                start = f.get("location", {}).get("start", {}).get("value")
                end = f.get("location", {}).get("end", {}).get("value")
                desc = f.get("description", "")
                if start and end:
                    if start == end:
                        binding_sites.append(str(start))
                    else:
                        binding_sites.extend([str(i) for i in range(start, end + 1)])
        print("HER2 Binding Sites:", ",".join(binding_sites))

asyncio.run(test_uniprot())
