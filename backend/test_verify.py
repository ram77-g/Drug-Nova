import asyncio
import httpx

async def test_shared_drugs():
    async with httpx.AsyncClient() as client:
        # P04626 = HER2, P00533 = EGFR
        res = await client.get("http://localhost:8000/api/drugs/shared?protein_a=P04626&protein_b=P00533")
        print("Shared Drugs (HER2 & EGFR):")
        if res.status_code == 200:
            for d in res.json().get("shared_drugs", []):
                print("-", d["name"])
        else:
            print("Error:", res.text)

async def test_sequence_alignment():
    async with httpx.AsyncClient() as client:
        # P49768 = Presenilin-1, P49810 = Presenilin-2 (Expect high similarity)
        res = await client.get("http://localhost:8000/api/protein/align?uniprot_a=P49768&uniprot_b=P49810")
        print("\nAlignment (PSEN1 & PSEN2):")
        if res.status_code == 200:
            print(res.json())
        else:
            print("Error:", res.text)
            
        # P04626 = HER2, P01308 = Insulin (Expect low similarity)
        res2 = await client.get("http://localhost:8000/api/protein/align?uniprot_a=P04626&uniprot_b=P01308")
        print("\nAlignment (HER2 & Insulin):")
        if res2.status_code == 200:
            print(res2.json())
        else:
            print("Error:", res2.text)

async def main():
    await test_shared_drugs()
    await test_sequence_alignment()

if __name__ == "__main__":
    asyncio.run(main())
