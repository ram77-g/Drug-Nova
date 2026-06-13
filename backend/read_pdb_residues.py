import os

pdb_path = r"c:\Users\praka\OneDrive\Documents\Drug-Nova\frontend\public\structures\AF-P00533-3-F1-model_v6.pdb"
if not os.path.exists(pdb_path):
    print("File not found:", pdb_path)
else:
    residues = set()
    with open(pdb_path, "r") as f:
        for line in f:
            if line.startswith("ATOM  "):
                res_num = int(line[22:26].strip())
                residues.add(res_num)
    print("Min residue:", min(residues) if residues else "None")
    print("Max residue:", max(residues) if residues else "None")
