import os
import sys

# Make sure we can import from services
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.mock_data import PROTEINS_BY_DISEASE

structures = []
seen = set()

for d_key, prots in PROTEINS_BY_DISEASE.items():
    for p in prots:
        if p.uniprot_id not in seen:
            seen.add(p.uniprot_id)
            # Create a basic entry matching ProteinStructureResponse schema
            entry = f'''    "{p.uniprot_id}": ProteinStructureResponse(
        uniprot_id="{p.uniprot_id}",
        protein_name="{p.name}",
        pdb_id=None,
        alphafold_url="https://alphafold.ebi.ac.uk/entry/{p.uniprot_id}",
        description="AlphaFold v4 predicted structure for {p.name}."
    ),'''
            structures.append(entry)

# Manually fix P00533 (EGFR) which we know uses PDB 1M17
p00533_fixed = False
for i, s in enumerate(structures):
    if '"P00533"' in s:
        structures[i] = '''    "P00533": ProteinStructureResponse(
        uniprot_id="P00533",
        protein_name="EGFR",
        pdb_id="1M17",
        alphafold_url="https://alphafold.ebi.ac.uk/entry/P00533",
        description="X-ray crystal structure of Epidermal Growth Factor Receptor kinase domain."
    ),'''
        p00533_fixed = True

content = """from models.schemas import ProteinStructureResponse

PROTEIN_STRUCTURES: dict[str, ProteinStructureResponse] = {
""" + "\n".join(structures) + "\n}\n"

with open(r"c:\Users\praka\OneDrive\Documents\Drug-Nova\backend\scripts\protein_structures_data.py", "w", encoding="utf-8") as f:
    f.write(content)

print("Updated protein_structures_data.py")
