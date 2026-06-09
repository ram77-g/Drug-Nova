import urllib.request
import os
import json

uniprot_ids = [
    "P49810",  # PSEN2
    "Q9BXM7",  # PINK1
    "O60260",  # PARKIN
    "P51587",  # BRCA2
    "P60484",  # PTEN
    "P35568",  # IRS1
    "P14672",  # GLUT4
    "Q9NQB0",  # TCF7L2
    "P40763",  # STAT3
    "P29597",  # TYK2
    "Q9Y2R2",  # PTPN22
]

save_dir = r"c:\Users\praka\OneDrive\Documents\Drug-Nova\frontend\public\structures"
os.makedirs(save_dir, exist_ok=True)

def download_structure(uniprot_id):
    api_url = f"https://alphafold.ebi.ac.uk/api/prediction/{uniprot_id}"
    try:
        req = urllib.request.Request(api_url)
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            if data and isinstance(data, list) and len(data) > 0:
                # prefer v4 or latest
                cif_url = data[0].get("cifUrl")
                if cif_url:
                    # e.g., AF-P49810-F1-model_v4.cif
                    filename = cif_url.split("/")[-1]
                    # We usually want .pdb for NGL, but AlphaFold API sometimes only gives .cif for large or newer.
                    # NGL viewer supports .cif files perfectly too. Let's get the pdbUrl if available, else cif.
                    pdb_url = data[0].get("pdbUrl")
                    
                    download_url = pdb_url if pdb_url else cif_url
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

for uid in uniprot_ids:
    download_structure(uid)

print("Download complete.")
