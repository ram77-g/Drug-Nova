import urllib.request
import json

genes = ["PSEN2", "PINK1", "PRKN", "BRCA2", "PTEN", "IRS1", "SLC2A4", "TCF7L2", "STAT3", "TYK2", "PTPN22"]

def get_uniprot_id(gene_name):
    url = f"https://rest.uniprot.org/uniprotkb/search?query=(gene_exact:{gene_name})%20AND%20(organism_id:9606)%20AND%20(reviewed:true)&fields=accession,protein_name&format=json&size=1"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            if data["results"]:
                res = data["results"][0]
                acc = res["primaryAccession"]
                name = res.get("proteinDescription", {}).get("recommendedName", {}).get("fullName", {}).get("value", "")
                print(f"{gene_name}: {acc} - {name}")
            else:
                print(f"{gene_name}: NOT FOUND")
    except Exception as e:
        print(f"Error for {gene_name}: {e}")

for g in genes:
    get_uniprot_id(g)
