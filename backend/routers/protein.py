"""
Protein structure router — returns AlphaFold structure URLs and metadata.
"""
from fastapi import APIRouter, HTTPException, Path
from models.schemas import ProteinStructureResponse

router = APIRouter()

# AlphaFold structures available for key proteins
PROTEIN_STRUCTURES: dict[str, ProteinStructureResponse] = {
    "P02649": ProteinStructureResponse(
        uniprot_id="P02649",
        protein_name="Apolipoprotein E",
        alphafold_url="https://alphafold.ebi.ac.uk/entry/P02649",
        pdb_id="1NFN",
        description="APOE is central to lipid metabolism and Alzheimer's risk. APOE4 allele dramatically increases AD susceptibility.",
    ),
    "P05067": ProteinStructureResponse(
        uniprot_id="P05067",
        protein_name="Amyloid Precursor Protein",
        alphafold_url="https://alphafold.ebi.ac.uk/entry/P05067",
        pdb_id="1AAP",
        description="APP is cleaved by secretases to produce amyloid-beta peptides that aggregate in AD plaques.",
    ),
    "P37840": ProteinStructureResponse(
        uniprot_id="P37840",
        protein_name="Alpha-synuclein",
        alphafold_url="https://alphafold.ebi.ac.uk/entry/P37840",
        pdb_id="1XQ8",
        description="Alpha-synuclein misfolding and aggregation forms Lewy bodies, the hallmark of Parkinson's disease.",
    ),
    "Q9BYF1": ProteinStructureResponse(
        uniprot_id="Q9BYF1",
        protein_name="ACE2 Receptor",
        alphafold_url="https://alphafold.ebi.ac.uk/entry/Q9BYF1",
        pdb_id="6M0J",
        description="ACE2 is the primary receptor for SARS-CoV-2 spike protein, enabling viral entry into human cells.",
    ),
    "P04626": ProteinStructureResponse(
        uniprot_id="P04626",
        protein_name="HER2/ErbB2",
        alphafold_url="https://alphafold.ebi.ac.uk/entry/P04626",
        pdb_id="1N8Z",
        description="HER2 amplification drives ~20% of breast cancers. Targeted therapies like lapatinib and trastuzumab exploit this receptor.",
    ),
    "P01375": ProteinStructureResponse(
        uniprot_id="P01375",
        protein_name="TNF-alpha",
        alphafold_url="https://alphafold.ebi.ac.uk/entry/P01375",
        pdb_id="2AZ5",
        description="TNF-alpha is the master inflammatory cytokine in rheumatoid arthritis and other autoimmune conditions.",
    ),
    "P05231": ProteinStructureResponse(
        uniprot_id="P05231",
        protein_name="Interleukin-6",
        alphafold_url="https://alphafold.ebi.ac.uk/entry/P05231",
        pdb_id="1IL6",
        description="IL-6 drives cytokine storm in COVID-19 and promotes synovial inflammation in RA.",
    ),
    "P23458": ProteinStructureResponse(
        uniprot_id="P23458",
        protein_name="JAK1",
        alphafold_url="https://alphafold.ebi.ac.uk/entry/P23458",
        pdb_id="3EYG",
        description="JAK1 is a key signal transducer in inflammatory cytokine pathways, targeted by baricitinib and other JAK inhibitors.",
    ),
    "P49768": ProteinStructureResponse(
        uniprot_id="P49768",
        protein_name="Presenilin-1",
        alphafold_url="https://alphafold.ebi.ac.uk/entry/P49768",
        pdb_id=None,
        description="Gamma-secretase catalytic subunit; regulates Notch/Abeta42 production in Alzheimer's.",
    ),
    "Q5S007": ProteinStructureResponse(
        uniprot_id="Q5S007",
        protein_name="LRRK2",
        alphafold_url="https://alphafold.ebi.ac.uk/entry/Q5S007",
        pdb_id=None,
        description="Serine/threonine kinase; regulates vesicle trafficking. Mutations are a major genetic cause of Parkinson's.",
    ),
    "Q99497": ProteinStructureResponse(
        uniprot_id="Q99497",
        protein_name="DJ-1",
        alphafold_url="https://alphafold.ebi.ac.uk/entry/Q99497",
        pdb_id=None,
        description="Oxidative stress sensor and neuroprotector implicated in Parkinson's disease.",
    ),
    "P38398": ProteinStructureResponse(
        uniprot_id="P38398",
        protein_name="BRCA1",
        alphafold_url="https://alphafold.ebi.ac.uk/entry/P38398",
        pdb_id=None,
        description="DNA repair, transcription regulation, and tumor suppression. Highly relevant in breast cancer.",
    ),
    "P04637": ProteinStructureResponse(
        uniprot_id="P04637",
        protein_name="p53",
        alphafold_url="https://alphafold.ebi.ac.uk/entry/P04637",
        pdb_id=None,
        description="Transcription factor; apoptosis inducer; genome guardian. Often mutated in cancers.",
    ),
    "P01308": ProteinStructureResponse(
        uniprot_id="P01308",
        protein_name="Insulin",
        alphafold_url="https://alphafold.ebi.ac.uk/entry/P01308",
        pdb_id=None,
        description="Glucose homeostasis hormone; anabolic regulator central to Type 2 Diabetes.",
    ),
    "P37231": ProteinStructureResponse(
        uniprot_id="P37231",
        protein_name="PPARG",
        alphafold_url="https://alphafold.ebi.ac.uk/entry/P37231",
        pdb_id=None,
        description="Nuclear receptor; adipogenesis and insulin sensitivity regulator.",
    ),
    "O15393": ProteinStructureResponse(
        uniprot_id="O15393",
        protein_name="TMPRSS2",
        alphafold_url="https://alphafold.ebi.ac.uk/entry/O15393",
        pdb_id=None,
        description="Serine protease priming spike protein for cell entry in COVID-19.",
    ),
}


@router.get("/{uniprot_id}", response_model=ProteinStructureResponse)
async def get_protein_structure(uniprot_id: str = Path(..., description="UniProt protein ID")):
    """Return protein structure metadata and AlphaFold URL."""
    uniprot_id_upper = uniprot_id.upper()
    if uniprot_id_upper not in PROTEIN_STRUCTURES:
        # Return a generic AlphaFold link for any valid-looking UniProt ID
        if len(uniprot_id_upper) in (6, 10):
            return ProteinStructureResponse(
                uniprot_id=uniprot_id_upper,
                protein_name="Protein Structure",
                alphafold_url=f"https://alphafold.ebi.ac.uk/entry/{uniprot_id_upper}",
                description="Structure available via AlphaFold Protein Structure Database.",
            )
        raise HTTPException(status_code=404, detail=f"Protein '{uniprot_id}' not found")
    return PROTEIN_STRUCTURES[uniprot_id_upper]


@router.get("/")
async def list_proteins():
    """Return all available protein structures."""
    return {
        "proteins": [
            {"uniprot_id": p.uniprot_id, "name": p.protein_name, "pdb_id": p.pdb_id}
            for p in PROTEIN_STRUCTURES.values()
        ]
    }
