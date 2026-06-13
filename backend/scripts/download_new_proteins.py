import urllib.request
import os
import json
import sys

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from services.mock_data import PROTEINS_BY_DISEASE

uniprot_ids = set()
for d_key, prots in PROTEINS_BY_DISEASE.items():
    for p in prots:
        uniprot_ids.add(p.uniprot_id)

save_dir = r"c:\Users\praka\OneDrive\Documents\Drug-Nova\frontend\public\structures"
os.makedirs(save_dir, exist_ok=True)

def download_structure(uniprot_id):
    # Skip EGFR because we use PDB 1M17 manually
    if uniprot_id == "P00533":
        return

    # Check if already downloaded (pdb or cif)
    pdb_path = os.path.join(save_dir, f"{uniprot_id}.pdb")
    cif_path = os.path.join(save_dir, f"{uniprot_id}.cif")
    af_pdb_path = os.path.join(save_dir, f"AF-{uniprot_id}-F1-model_v4.pdb")
    af_cif_path = os.path.join(save_dir, f"AF-{uniprot_id}-F1-model_v4.cif")
    
    if os.path.exists(pdb_path) or os.path.exists(cif_path) or os.path.exists(af_pdb_path) or os.path.exists(af_cif_path):
        print(f"Skipping {uniprot_id}, already exists.")
        return

    api_url = f"https://alphafold.ebi.ac.uk/api/prediction/{uniprot_id}"
    try:
        req = urllib.request.Request(api_url)
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            if data and isinstance(data, list) and len(data) > 0:
                cif_url = data[0].get("cifUrl")
                pdb_url = data[0].get("pdbUrl")
                
                download_url = pdb_url if pdb_url else cif_url
                if download_url:
                    filename = download_url.split("/")[-1]
                    filepath = os.path.join(save_dir, filename)
                    
                    if not os.path.exists(filepath):
                        print(f"Downloading {filename} for {uniprot_id}...")
                        urllib.request.urlretrieve(download_url, filepath)
                    else:
                        print(f"{filename} already exists.")
            else:
                print(f"No AlphaFold prediction found for {uniprot_id}")
    except Exception as e:
        print(f"Error fetching data for {uniprot_id}: {e}")

print(f"Found {len(uniprot_ids)} unique proteins to download.")
for uid in list(uniprot_ids):
    download_structure(uid)

print("Download complete.")
