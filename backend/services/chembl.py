import httpx
import logging

logger = logging.getLogger(__name__)

async def get_chembl_data(drug_name: str):
    """
    Fetches live chemical and bioactivity properties for a drug from the ChEMBL database.
    Uses the free, unauthenticated EBI ChEMBL API.
    """
    url = f"https://www.ebi.ac.uk/chembl/api/data/molecule/search?q={drug_name}&format=json"
    
    try:
        async with httpx.AsyncClient() as client:
            # ChEMBL can sometimes be slow, so we give it a reasonable timeout
            response = await client.get(url, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            molecules = data.get("molecules", [])
            if not molecules:
                return None
                
            # Take the best match (usually the first one)
            best_match = molecules[0]
            
            # Extract the most interesting bioactivity and chemical properties
            props = best_match.get("molecule_properties", {}) or {}
            
            return {
                "chembl_id": best_match.get("molecule_chembl_id"),
                "pref_name": best_match.get("pref_name"),
                "max_phase": best_match.get("max_phase"),
                "therapeutic_flag": best_match.get("therapeutic_flag"),
                "molecule_type": best_match.get("molecule_type"),
                "molecular_weight": props.get("full_mwt", "Unknown"),
                "alogp": props.get("alogp", "Unknown"), # Lipophilicity (important for drug design)
                "psa": props.get("psa", "Unknown"), # Polar Surface Area
                "ro3_pass": props.get("ro3_pass", "Unknown"), # Rule of 3 pass
                "num_lipinski_ro5_violations": props.get("num_lipinski_ro5_violations", 0),
                "structure_smiles": best_match.get("molecule_structures", {}).get("canonical_smiles") if best_match.get("molecule_structures") else None
            }
            
    except Exception as e:
        logger.error(f"Error fetching ChEMBL data for {drug_name}: {e}")
        return None
