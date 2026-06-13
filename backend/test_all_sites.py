import asyncio
import httpx

uniprot_ids = [
    "P04626", "P00533", "P49810", "Q9BXM7", "O60260", "P51587", "P60484",
    "P35568", "P14672", "Q9NQB0", "P40763", "P29597", "Q9Y2R2", "P38398",
    "P04637", "P05067", "P01308", "P01375", "O15393", "P37840", "P23458",
    "P37231", "P02649", "Q5S007", "P05231", "Q99497", "P49768"
]

async def check_all():
    headers = {"User-Agent": "Drug-Nova/1.0 (contact@example.com)"}
    async with httpx.AsyncClient(headers=headers) as client:
        for uid in uniprot_ids:
            url = f"https://rest.uniprot.org/uniprotkb/{uid}"
            try:
                resp = await client.get(url, timeout=5.0)
                data = resp.json()
                features = data.get("features", [])
                
                def extract_sites(allowed_types, require_interact_keyword=False):
                    sites = []
                    for f in features:
                        f_type = f.get("type")
                        if f_type in allowed_types:
                            if require_interact_keyword:
                                desc = f.get("description", "").lower()
                                if "interact" not in desc and "bind" not in desc:
                                    continue
                            start = f.get("location", {}).get("start", {}).get("value")
                            end = f.get("location", {}).get("end", {}).get("value")
                            if start and end:
                                if start == end:
                                    sites.append(start)
                                else:
                                    sites.extend(range(start, end + 1))
                    return sites

                sites = extract_sites(["Binding site", "Active site", "Site"])
                if not sites: sites = extract_sites(["Domain", "DNA-binding region"])
                if not sites: sites = extract_sites(["Region"], require_interact_keyword=True)
                if not sites: sites = extract_sites(["Peptide", "Chain"])
                
                print(f"{uid}: Found {len(set(sites))} residues")
            except Exception as e:
                pass

asyncio.run(check_all())
