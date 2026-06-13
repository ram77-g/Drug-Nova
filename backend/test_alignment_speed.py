import time
from Bio.Align import PairwiseAligner
import httpx
import asyncio

async def fetch_uniprot_fasta(uniprot_id: str) -> str:
    url = f"https://rest.uniprot.org/uniprotkb/{uniprot_id}.fasta"
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, follow_redirects=True)
        lines = resp.text.split("\n")
        return "".join(lines[1:])

async def main():
    print("Fetching sequences...")
    seq_a = await fetch_uniprot_fasta("P04626") # HER2 1255 aa
    seq_b = await fetch_uniprot_fasta("P00533") # EGFR 1210 aa
    print(f"Len A: {len(seq_a)}, Len B: {len(seq_b)}")
    
    print("Starting alignment...")
    start = time.time()
    aligner = PairwiseAligner()
    aligner.mode = 'global'
    alignments = aligner.align(seq_a, seq_b)
    
    best = alignments[0]
    print("Best alignment score:", best.score)
    print("Time taken:", time.time() - start)

asyncio.run(main())
