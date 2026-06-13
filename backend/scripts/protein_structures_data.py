from models.schemas import ProteinStructureResponse

PROTEIN_STRUCTURES = {
    # Alzheimer's
    "P02649": ProteinStructureResponse(uniprot_id="P02649", protein_name="Apolipoprotein E", alphafold_url="https://alphafold.ebi.ac.uk/entry/P02649", pdb_id="2L7B", description="A major cholesterol carrier that supports lipid transport and injury repair in the brain."),
    "P05067": ProteinStructureResponse(uniprot_id="P05067", protein_name="Amyloid Precursor Protein", alphafold_url="https://alphafold.ebi.ac.uk/entry/P05067", pdb_id=None, description="An integral membrane protein whose cleavage generates amyloid beta (Aβ) peptides."),
    "P49768": ProteinStructureResponse(uniprot_id="P49768", protein_name="Presenilin-1", alphafold_url="https://alphafold.ebi.ac.uk/entry/P49768", pdb_id=None, description="Gamma-secretase catalytic subunit; regulates Notch/Abeta42 production in Alzheimer's."),
    "P49810": ProteinStructureResponse(uniprot_id="P49810", protein_name="Presenilin-2", alphafold_url="https://alphafold.ebi.ac.uk/entry/P49810", pdb_id=None, description="Gamma-secretase catalytic subunit variant."),
    
    # Parkinson's
    "P37840": ProteinStructureResponse(uniprot_id="P37840", protein_name="Alpha-synuclein", alphafold_url="https://alphafold.ebi.ac.uk/entry/P37840", pdb_id="1XQ8", description="Abundant in the brain, misfolding of alpha-synuclein is the primary component of Lewy bodies."),
    "Q5S007": ProteinStructureResponse(uniprot_id="Q5S007", protein_name="LRRK2", alphafold_url="https://alphafold.ebi.ac.uk/entry/Q5S007", pdb_id=None, description="Serine/threonine kinase; regulates vesicle trafficking. Mutations are a major genetic cause of Parkinson's."),
    "Q99497": ProteinStructureResponse(uniprot_id="Q99497", protein_name="DJ-1", alphafold_url="https://alphafold.ebi.ac.uk/entry/Q99497", pdb_id=None, description="Oxidative stress sensor and neuroprotector implicated in Parkinson's disease."),
    "Q9BXM7": ProteinStructureResponse(uniprot_id="Q9BXM7", protein_name="PINK1", alphafold_url="https://alphafold.ebi.ac.uk/entry/Q9BXM7", pdb_id=None, description="Mitochondrial quality control kinase protecting neurons from stress-induced mitochondrial dysfunction."),
    "O60260": ProteinStructureResponse(uniprot_id="O60260", protein_name="PARKIN", alphafold_url="https://alphafold.ebi.ac.uk/entry/O60260", pdb_id=None, description="E3 ubiquitin ligase targeting damaged mitochondria for degradation via mitophagy."),
    
    # Breast Cancer
    "P38398": ProteinStructureResponse(uniprot_id="P38398", protein_name="BRCA1", alphafold_url="https://alphafold.ebi.ac.uk/entry/P38398", pdb_id=None, description="DNA repair, transcription regulation, and tumor suppression. Highly relevant in breast cancer."),
    "P04637": ProteinStructureResponse(uniprot_id="P04637", protein_name="p53", alphafold_url="https://alphafold.ebi.ac.uk/entry/P04637", pdb_id=None, description="Transcription factor; apoptosis inducer; genome guardian. Often mutated in cancers."),
    "P04626": ProteinStructureResponse(uniprot_id="P04626", protein_name="HER2/ErbB2", alphafold_url="https://alphafold.ebi.ac.uk/entry/P04626", pdb_id="3RCD", description="A receptor tyrosine kinase that promotes cell proliferation and opposes apoptosis."),
    "P60484": ProteinStructureResponse(uniprot_id="P60484", protein_name="PTEN", alphafold_url="https://alphafold.ebi.ac.uk/entry/P60484", pdb_id=None, description="Tumor suppressor that negatively regulates the PI3K-AKT signaling pathway."),
    
    # Type 2 Diabetes
    "P01308": ProteinStructureResponse(uniprot_id="P01308", protein_name="Insulin", alphafold_url="https://alphafold.ebi.ac.uk/entry/P01308", pdb_id=None, description="Glucose homeostasis hormone; anabolic regulator central to Type 2 Diabetes."),
    "P37231": ProteinStructureResponse(uniprot_id="P37231", protein_name="PPARG", alphafold_url="https://alphafold.ebi.ac.uk/entry/P37231", pdb_id=None, description="Nuclear receptor; adipogenesis and insulin sensitivity regulator."),
    "P35568": ProteinStructureResponse(uniprot_id="P35568", protein_name="IRS1", alphafold_url="https://alphafold.ebi.ac.uk/entry/P35568", pdb_id=None, description="Plays a key role in transmitting signals from the insulin and IGF-1 receptors to intracellular pathways."),
    "P14672": ProteinStructureResponse(uniprot_id="P14672", protein_name="GLUT4", alphafold_url="https://alphafold.ebi.ac.uk/entry/P14672", pdb_id=None, description="Insulin-regulated glucose transporter responsible for insulin-stimulated glucose uptake into muscle and adipose tissue."),
    "Q9NQB0": ProteinStructureResponse(uniprot_id="Q9NQB0", protein_name="TCF7L2", alphafold_url="https://alphafold.ebi.ac.uk/entry/Q9NQB0", pdb_id=None, description="Transcription factor implicated in blood glucose homeostasis. Polymorphisms are strongly associated with Type 2 Diabetes risk."),
    
    # COVID-19
    "Q9BYF1": ProteinStructureResponse(uniprot_id="Q9BYF1", protein_name="ACE2", alphafold_url="https://alphafold.ebi.ac.uk/entry/Q9BYF1", pdb_id="6M0J", description="An enzyme attached to the cell membranes of cells in the lungs, arteries, heart, kidney, and intestines. Viral entry receptor for SARS-CoV-2."),
    "O15393": ProteinStructureResponse(uniprot_id="O15393", protein_name="TMPRSS2", alphafold_url="https://alphafold.ebi.ac.uk/entry/O15393", pdb_id=None, description="Serine protease priming spike protein for cell entry in COVID-19."),
    "P40763": ProteinStructureResponse(uniprot_id="P40763", protein_name="STAT3", alphafold_url="https://alphafold.ebi.ac.uk/entry/P40763", pdb_id=None, description="Signal transducer and transcription activator that mediates cellular responses to interleukins, KITLG/SCF and other growth factors."),
    
    # Rheumatoid Arthritis / COVID-19 shared
    "P05231": ProteinStructureResponse(uniprot_id="P05231", protein_name="Interleukin-6", alphafold_url="https://alphafold.ebi.ac.uk/entry/P05231", pdb_id="1ALU", description="A cytokine that acts as both a pro-inflammatory cytokine and an anti-inflammatory myokine."),
    "P01375": ProteinStructureResponse(uniprot_id="P01375", protein_name="TNF-alpha", alphafold_url="https://alphafold.ebi.ac.uk/entry/P01375", pdb_id="1TNF", description="A multifunctional proinflammatory cytokine that belongs to the tumor necrosis factor (TNF) superfamily."),
    "P23458": ProteinStructureResponse(uniprot_id="P23458", protein_name="JAK1", alphafold_url="https://alphafold.ebi.ac.uk/entry/P23458", pdb_id="3EYG", description="JAK1 is a key signal transducer in inflammatory cytokine pathways, targeted by baricitinib and other JAK inhibitors."),
    
    # Rheumatoid Arthritis specific
    "P29597": ProteinStructureResponse(uniprot_id="P29597", protein_name="TYK2", alphafold_url="https://alphafold.ebi.ac.uk/entry/P29597", pdb_id=None, description="Member of the JAK family of protein tyrosine kinases, involved in signaling pathways of inflammatory cytokines."),
    "Q9Y2R2": ProteinStructureResponse(uniprot_id="Q9Y2R2", protein_name="PTPN22", alphafold_url="https://alphafold.ebi.ac.uk/entry/Q9Y2R2", pdb_id=None, description="Lymphoid-specific intracellular phosphatase that negatively regulates T-cell receptor signaling."),
}
