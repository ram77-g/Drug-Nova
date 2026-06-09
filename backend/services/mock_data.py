"""
Mock biomedical data service.
Provides realistic-looking data for diseases, genes, proteins, and drugs.
Replace individual methods with live API calls (OpenFDA, ChEMBL, DisGeNET) as needed.
"""

from models.schemas import Gene, Protein, Drug, DiseaseInfo

# ---------------------------------------------------------------------------
# Disease catalog
# ---------------------------------------------------------------------------
DISEASE_CATALOG: dict[str, DiseaseInfo] = {
    "alzheimer": DiseaseInfo(
        id="MONDO:0004975",
        name="Alzheimer's Disease",
        description=(
            "A progressive neurodegenerative disorder characterized by amyloid-beta "
            "plaques, neurofibrillary tangles, and synaptic loss leading to cognitive decline."
        ),
        prevalence="~55 million people worldwide",
        icd_code="G30",
    ),
    "parkinson": DiseaseInfo(
        id="MONDO:0005180",
        name="Parkinson's Disease",
        description=(
            "A chronic neurodegenerative disorder affecting dopaminergic neurons in the "
            "substantia nigra, causing motor and non-motor symptoms."
        ),
        prevalence="~10 million people worldwide",
        icd_code="G20",
    ),
    "breast cancer": DiseaseInfo(
        id="MONDO:0007254",
        name="Breast Cancer",
        description=(
            "A malignancy arising from breast tissue, most commonly from the cells lining "
            "the milk ducts or lobules, driven by hormonal, genetic, and environmental factors."
        ),
        prevalence="~2.3 million new cases/year globally",
        icd_code="C50",
    ),
    "type 2 diabetes": DiseaseInfo(
        id="MONDO:0005148",
        name="Type 2 Diabetes Mellitus",
        description=(
            "A metabolic disorder characterized by insulin resistance and relative insulin "
            "deficiency, resulting in chronic hyperglycemia and multisystem complications."
        ),
        prevalence="~537 million adults affected",
        icd_code="E11",
    ),
    "covid-19": DiseaseInfo(
        id="MONDO:0100096",
        name="COVID-19",
        description=(
            "An infectious disease caused by SARS-CoV-2, presenting as respiratory illness "
            "ranging from mild symptoms to severe pneumonia, ARDS, and multi-organ failure."
        ),
        prevalence="Global pandemic with >700 million confirmed cases",
        icd_code="U07.1",
    ),
    "rheumatoid arthritis": DiseaseInfo(
        id="MONDO:0008383",
        name="Rheumatoid Arthritis",
        description=(
            "A chronic autoimmune inflammatory disorder predominantly affecting synovial joints, "
            "driven by dysregulated immune activation and pro-inflammatory cytokine cascades."
        ),
        prevalence="~18 million people worldwide",
        icd_code="M05",
    ),
}

# ---------------------------------------------------------------------------
# Gene data keyed by disease
# ---------------------------------------------------------------------------
GENES_BY_DISEASE: dict[str, list[Gene]] = {
    "alzheimer": [
        Gene(id="ENSG00000130203", symbol="APOE", name="Apolipoprotein E", chromosome="19q13.32", relevance_score=0.97),
        Gene(id="ENSG00000142192", symbol="APP", name="Amyloid Precursor Protein", chromosome="21q21.3", relevance_score=0.94),
        Gene(id="ENSG00000080815", symbol="PSEN1", name="Presenilin-1", chromosome="14q24.2", relevance_score=0.91),
        Gene(id="ENSG00000143801", symbol="PSEN2", name="Presenilin-2", chromosome="1q42.13", relevance_score=0.87),
        Gene(id="ENSG00000106211", symbol="MAPT", name="Microtubule-Associated Protein Tau", chromosome="17q21.31", relevance_score=0.85),
    ],
    "parkinson": [
        Gene(id="ENSG00000145335", symbol="SNCA", name="Synuclein Alpha", chromosome="4q22.1", relevance_score=0.96),
        Gene(id="ENSG00000188906", symbol="LRRK2", name="Leucine Rich Repeat Kinase 2", chromosome="12q12", relevance_score=0.92),
        Gene(id="ENSG00000185345", symbol="PARK7", name="Parkinson Protein 7 (DJ-1)", chromosome="1p36.23", relevance_score=0.88),
        Gene(id="ENSG00000131050", symbol="PINK1", name="PTEN Induced Kinase 1", chromosome="1p36.12", relevance_score=0.85),
        Gene(id="ENSG00000197747", symbol="PARKIN", name="Parkin RBR E3 Ubiquitin Ligase", chromosome="6q26", relevance_score=0.83),
    ],
    "breast cancer": [
        Gene(id="ENSG00000012048", symbol="BRCA1", name="Breast Cancer Gene 1", chromosome="17q21.31", relevance_score=0.98),
        Gene(id="ENSG00000139618", symbol="BRCA2", name="Breast Cancer Gene 2", chromosome="13q12.3", relevance_score=0.96),
        Gene(id="ENSG00000141736", symbol="ERBB2", name="Erb-B2 Receptor Tyrosine Kinase 2", chromosome="17q12", relevance_score=0.93),
        Gene(id="ENSG00000171862", symbol="PTEN", name="Phosphatase and Tensin Homolog", chromosome="10q23.31", relevance_score=0.89),
        Gene(id="ENSG00000012048", symbol="TP53", name="Tumor Protein P53", chromosome="17p13.1", relevance_score=0.87),
    ],
    "type 2 diabetes": [
        Gene(id="ENSG00000254647", symbol="INS", name="Insulin", chromosome="11p15.5", relevance_score=0.97),
        Gene(id="ENSG00000254647", symbol="PPARG", name="Peroxisome Proliferator Activated Receptor Gamma", chromosome="3p25.2", relevance_score=0.93),
        Gene(id="ENSG00000169047", symbol="IRS1", name="Insulin Receptor Substrate 1", chromosome="2q36.3", relevance_score=0.89),
        Gene(id="ENSG00000180401", symbol="GLUT4", name="Glucose Transporter Type 4", chromosome="17p13", relevance_score=0.86),
        Gene(id="ENSG00000141736", symbol="TCF7L2", name="Transcription Factor 7 Like 2", chromosome="10q25.2", relevance_score=0.84),
    ],
    "covid-19": [
        Gene(id="ENSG00000105329", symbol="ACE2", name="Angiotensin Converting Enzyme 2", chromosome="Xp22.2", relevance_score=0.98),
        Gene(id="ENSG00000187492", symbol="TMPRSS2", name="Transmembrane Serine Protease 2", chromosome="21q22.3", relevance_score=0.95),
        Gene(id="ENSG00000197253", symbol="IL6", name="Interleukin 6", chromosome="7p15.3", relevance_score=0.91),
        Gene(id="ENSG00000115415", symbol="STAT3", name="Signal Transducer And Activator Of Transcription 3", chromosome="17q21.2", relevance_score=0.87),
        Gene(id="ENSG00000232810", symbol="TNF", name="Tumor Necrosis Factor", chromosome="6p21.33", relevance_score=0.85),
    ],
    "rheumatoid arthritis": [
        Gene(id="ENSG00000197253", symbol="IL6", name="Interleukin 6", chromosome="7p15.3", relevance_score=0.95),
        Gene(id="ENSG00000232810", symbol="TNF", name="Tumor Necrosis Factor", chromosome="6p21.33", relevance_score=0.93),
        Gene(id="ENSG00000115415", symbol="JAK1", name="Janus Kinase 1", chromosome="1p31.3", relevance_score=0.90),
        Gene(id="ENSG00000105397", symbol="TYK2", name="Tyrosine Kinase 2", chromosome="19p13.2", relevance_score=0.86),
        Gene(id="ENSG00000171791", symbol="PTPN22", name="Protein Tyrosine Phosphatase Non-Receptor 22", chromosome="1p13.2", relevance_score=0.83),
    ],
}

# ---------------------------------------------------------------------------
# Protein data keyed by disease
# ---------------------------------------------------------------------------
PROTEINS_BY_DISEASE: dict[str, list[Protein]] = {
    "alzheimer": [
        Protein(id="P02649", name="Apolipoprotein E", uniprot_id="P02649", function="Lipid transport, Aβ clearance mediator", structure_available=True),
        Protein(id="P05067", name="Amyloid Precursor Protein", uniprot_id="P05067", function="Cell adhesion, synaptogenesis; cleaved to Aβ peptides", structure_available=True),
        Protein(id="P49768", name="Presenilin-1", uniprot_id="P49768", function="Gamma-secretase catalytic subunit; regulates Notch/Aβ42 production", structure_available=True),
        Protein(id="P10636", name="Tau protein", uniprot_id="P10636", function="Microtubule stabilization; hyperphosphorylated in tangles", structure_available=False),
    ],
    "parkinson": [
        Protein(id="P37840", name="Alpha-synuclein", uniprot_id="P37840", function="Synaptic vesicle regulation; aggregates into Lewy bodies", structure_available=True),
        Protein(id="Q5S007", name="LRRK2", uniprot_id="Q5S007", function="Serine/threonine kinase; regulates vesicle trafficking", structure_available=True),
        Protein(id="Q99497", name="DJ-1", uniprot_id="Q99497", function="Oxidative stress sensor and neuroprotector", structure_available=True),
    ],
    "breast cancer": [
        Protein(id="P38398", name="BRCA1", uniprot_id="P38398", function="DNA repair, transcription regulation, tumor suppression", structure_available=True),
        Protein(id="P04637", name="p53", uniprot_id="P04637", function="Transcription factor; apoptosis inducer; genome guardian", structure_available=True),
        Protein(id="P04626", name="HER2/ErbB2", uniprot_id="P04626", function="Receptor tyrosine kinase; cell proliferation signaling", structure_available=True),
    ],
    "type 2 diabetes": [
        Protein(id="P01308", name="Insulin", uniprot_id="P01308", function="Glucose homeostasis hormone; anabolic regulator", structure_available=True),
        Protein(id="P37231", name="PPARG", uniprot_id="P37231", function="Nuclear receptor; adipogenesis and insulin sensitivity regulator", structure_available=True),
        Protein(id="P15941", name="Mucin-1", uniprot_id="P15941", function="Cell surface glycoprotein implicated in insulin resistance", structure_available=False),
    ],
    "covid-19": [
        Protein(id="Q9BYF1", name="ACE2 receptor", uniprot_id="Q9BYF1", function="Viral entry receptor for SARS-CoV-2 spike protein", structure_available=True),
        Protein(id="O15393", name="TMPRSS2", uniprot_id="O15393", function="Serine protease priming spike protein for cell entry", structure_available=True),
        Protein(id="P05231", name="Interleukin-6", uniprot_id="P05231", function="Cytokine driving cytokine storm in severe COVID-19", structure_available=True),
    ],
    "rheumatoid arthritis": [
        Protein(id="P05231", name="Interleukin-6", uniprot_id="P05231", function="Pro-inflammatory cytokine mediating joint destruction", structure_available=True),
        Protein(id="P01375", name="TNF-alpha", uniprot_id="P01375", function="Master inflammatory cytokine in RA pathogenesis", structure_available=True),
        Protein(id="P23458", name="JAK1", uniprot_id="P23458", function="Signal transduction kinase in JAK-STAT inflammatory cascade", structure_available=True),
    ],
}

# ---------------------------------------------------------------------------
# Drug repurposing candidates keyed by disease
# ---------------------------------------------------------------------------
DRUGS_BY_DISEASE: dict[str, list[Drug]] = {
    "alzheimer": [
        Drug(
            id="DB00933",
            name="Metformin",
            generic_name="metformin hydrochloride",
            confidence_score=0.82,
            mechanism="AMPK activation reduces neuroinflammation and inhibits mTOR-mediated tau hyperphosphorylation",
            target_proteins=["AMPK", "mTOR", "Tau protein"],
            side_effects=["GI discomfort", "Lactic acidosis (rare)", "B12 deficiency"],
            rationale="Epidemiological studies show diabetic patients on metformin have ~40% reduced AD risk. AMPK activation mirrors exercise-induced neuroprotection.",
            approval_status="FDA Approved (T2DM)",
            original_indication="Type 2 Diabetes Mellitus",
            pubmed_refs=["PMID:28598354", "PMID:31248742", "PMID:35219462"],
        ),
        Drug(
            id="DB00945",
            name="Aspirin",
            generic_name="acetylsalicylic acid",
            confidence_score=0.71,
            mechanism="COX inhibition reduces neuroinflammation; antiplatelet effects improve cerebrovascular flow",
            target_proteins=["COX-1", "COX-2", "NF-κB"],
            side_effects=["GI bleeding", "Peptic ulcers", "Tinnitus at high doses"],
            rationale="Anti-inflammatory properties may slow amyloid plaque formation. Population studies suggest neuroprotective benefit in low-dose regimens.",
            approval_status="OTC Approved",
            original_indication="Pain / Cardiovascular prevention",
            pubmed_refs=["PMID:26959863", "PMID:30224539"],
        ),
        Drug(
            id="DB01043",
            name="Memantine",
            generic_name="memantine hydrochloride",
            confidence_score=0.89,
            mechanism="NMDA receptor antagonism reduces glutamate excitotoxicity and calcium overload in neurons",
            target_proteins=["NMDA receptor", "Sigma-1 receptor", "APOE pathway"],
            side_effects=["Dizziness", "Headache", "Confusion", "Constipation"],
            rationale="Directly targets excitotoxic pathways implicated in AD progression. Approved for moderate-severe AD with evidence of cognitive stabilization.",
            approval_status="FDA Approved (AD)",
            original_indication="Alzheimer's Disease",
            pubmed_refs=["PMID:15304572", "PMID:24895920"],
        ),
    ],
    "parkinson": [
        Drug(
            id="DB00494",
            name="Entacapone",
            generic_name="entacapone",
            confidence_score=0.85,
            mechanism="COMT inhibition prolongs levodopa bioavailability and stabilizes dopaminergic signaling",
            target_proteins=["COMT", "Dopamine receptors", "LRRK2 pathway"],
            side_effects=["Dyskinesia", "Nausea", "Urine discoloration", "Diarrhea"],
            rationale="Adjunct therapy extending dopamine replacement efficacy. Evidence suggests neuroprotective synergy with mitochondrial pathway modulation.",
            approval_status="FDA Approved (PD)",
            original_indication="Parkinson's Disease",
            pubmed_refs=["PMID:10443701", "PMID:22786789"],
        ),
        Drug(
            id="DB00533",
            name="Rofecoxib",
            generic_name="rofecoxib",
            confidence_score=0.63,
            mechanism="Selective COX-2 inhibition reduces neuroinflammation and microglial activation in substantia nigra",
            target_proteins=["COX-2", "TNF-alpha", "NF-κB"],
            side_effects=["Cardiovascular risk", "GI issues", "Hypertension"],
            rationale="COX-2 overexpression detected in PD post-mortem brains. Experimental models show dopaminergic neuroprotection but cardiovascular risk limits clinical use.",
            approval_status="Withdrawn (cardiovascular risk)",
            original_indication="Arthritis (withdrawn)",
            pubmed_refs=["PMID:12473399", "PMID:15010907"],
        ),
        Drug(
            id="DB01418",
            name="Deferiprone",
            generic_name="deferiprone",
            confidence_score=0.78,
            mechanism="Iron chelation reduces reactive oxygen species and alpha-synuclein aggregation driven by iron accumulation",
            target_proteins=["Ferritin", "Alpha-synuclein", "Complex I"],
            side_effects=["Agranulocytosis", "Neutropenia", "GI disturbance"],
            rationale="Iron accumulates in PD substantia nigra. Deferiprone clinical trials (FAIRPARK-II) showed reduced brain iron and slower motor decline.",
            approval_status="EMA Approved (Thalassemia)",
            original_indication="Iron overload disorders",
            pubmed_refs=["PMID:31003049", "PMID:27010311"],
        ),
    ],
    "breast cancer": [
        Drug(
            id="DB01259",
            name="Lapatinib",
            generic_name="lapatinib ditosylate",
            confidence_score=0.91,
            mechanism="Dual EGFR/HER2 tyrosine kinase inhibition blocks proliferation signals in HER2+ tumors",
            target_proteins=["HER2/ErbB2", "EGFR", "PI3K/AKT pathway"],
            side_effects=["Diarrhea", "Hepatotoxicity", "QTc prolongation", "Rash"],
            rationale="Directly targets HER2 amplification, the key oncogenic driver in ~20% of breast cancers. Approved for HER2+ metastatic breast cancer.",
            approval_status="FDA Approved (Breast Cancer)",
            original_indication="HER2+ Breast Cancer",
            pubmed_refs=["PMID:16899776", "PMID:21159339"],
        ),
        Drug(
            id="DB00674",
            name="Metformin",
            generic_name="metformin hydrochloride",
            confidence_score=0.74,
            mechanism="AMPK activation inhibits mTOR signaling, reduces cancer cell glucose uptake, and sensitizes to chemotherapy",
            target_proteins=["AMPK", "mTOR", "BRCA1 pathway"],
            side_effects=["GI discomfort", "Lactic acidosis (rare)"],
            rationale="Epidemiological evidence links metformin use with 25-40% reduced breast cancer risk. Synergizes with HER2-targeted therapies in preclinical models.",
            approval_status="FDA Approved (T2DM)",
            original_indication="Type 2 Diabetes",
            pubmed_refs=["PMID:24699378", "PMID:31038695"],
        ),
    ],
    "type 2 diabetes": [
        Drug(
            id="DB01076",
            name="Atorvastatin",
            generic_name="atorvastatin calcium",
            confidence_score=0.79,
            mechanism="HMG-CoA reductase inhibition improves endothelial function and insulin sensitivity via PPARG-related pathways",
            target_proteins=["HMG-CoA reductase", "PPARG", "IRS1"],
            side_effects=["Myopathy", "Liver enzyme elevation", "Rhabdomyolysis (rare)"],
            rationale="Statins shown to reduce T2DM comorbid cardiovascular risk. Some evidence suggests insulin sensitization. Concerns about statin-induced T2DM risk require risk-benefit analysis.",
            approval_status="FDA Approved (Hyperlipidemia)",
            original_indication="Cardiovascular / Dyslipidemia",
            pubmed_refs=["PMID:19933345", "PMID:22284590"],
        ),
        Drug(
            id="DB09025",
            name="Semaglutide",
            generic_name="semaglutide",
            confidence_score=0.94,
            mechanism="GLP-1 receptor agonism enhances glucose-dependent insulin secretion, inhibits glucagon, and reduces appetite",
            target_proteins=["GLP-1R", "Insulin receptor", "GLUT4"],
            side_effects=["Nausea", "Vomiting", "Pancreatitis risk", "Thyroid C-cell tumors (animal)"],
            rationale="Direct therapeutic target engagement. FDA-approved for T2DM with additional cardiovascular mortality benefit demonstrated in SUSTAIN-6 trial.",
            approval_status="FDA Approved (T2DM, Obesity)",
            original_indication="Type 2 Diabetes / Obesity",
            pubmed_refs=["PMID:27633186", "PMID:32798932"],
        ),
    ],
    "covid-19": [
        Drug(
            id="DB14761",
            name="Remdesivir",
            generic_name="remdesivir",
            confidence_score=0.88,
            mechanism="Nucleotide analogue inhibits SARS-CoV-2 RNA-dependent RNA polymerase (RdRp), blocking viral replication",
            target_proteins=["RdRp", "NSP12", "ACE2 pathway"],
            side_effects=["Nausea", "Liver enzyme elevation", "Bradycardia", "Infusion reactions"],
            rationale="Direct antiviral mechanism targeting essential viral machinery. FDA Emergency Use Authorization granted; shortens hospitalization in clinical trials.",
            approval_status="FDA Approved (COVID-19)",
            original_indication="COVID-19 / Broad antiviral",
            pubmed_refs=["PMID:32445440", "PMID:32678530"],
        ),
        Drug(
            id="DB00563",
            name="Methotrexate",
            generic_name="methotrexate",
            confidence_score=0.67,
            mechanism="Anti-inflammatory via dihydrofolate reductase inhibition; dampens cytokine storm and autoimmune hyperactivation",
            target_proteins=["DHFR", "IL-6", "TNF-alpha"],
            side_effects=["Hepatotoxicity", "Immunosuppression", "Mucositis", "Teratogenicity"],
            rationale="Cytokine storm in severe COVID-19 resembles autoimmune pathology. Immunosuppressive properties may attenuate hyperinflammation, though evidence is preliminary.",
            approval_status="FDA Approved (Autoimmune, Cancer)",
            original_indication="Cancer / Rheumatoid Arthritis",
            pubmed_refs=["PMID:32640462", "PMID:33428861"],
        ),
    ],
    "rheumatoid arthritis": [
        Drug(
            id="DB00051",
            name="Adalimumab",
            generic_name="adalimumab",
            confidence_score=0.96,
            mechanism="Human monoclonal antibody neutralizes TNF-alpha, blocking downstream NF-κB and inflammatory cascade",
            target_proteins=["TNF-alpha", "NF-κB", "IL-6"],
            side_effects=["Infection risk", "Tuberculosis reactivation", "Injection site reactions", "Lymphoma risk"],
            rationale="Gold standard biologic for RA. Direct TNF-alpha neutralization addresses the primary inflammatory driver in RA synovitis.",
            approval_status="FDA Approved (RA, multiple indications)",
            original_indication="Rheumatoid Arthritis",
            pubmed_refs=["PMID:12583753", "PMID:21221101"],
        ),
        Drug(
            id="DB11817",
            name="Baricitinib",
            generic_name="baricitinib",
            confidence_score=0.92,
            mechanism="Selective JAK1/JAK2 inhibitor blocking STAT signaling downstream of IL-6 and other inflammatory cytokines",
            target_proteins=["JAK1", "JAK2", "STAT3", "IL-6R"],
            side_effects=["DVT/PE risk", "Infections", "Anemia", "Lipid elevation"],
            rationale="Targets JAK-STAT pathway critical in RA pathogenesis. Oral bioavailability and rapid onset make it advantageous over injectable biologics.",
            approval_status="FDA Approved (RA, COVID-19)",
            original_indication="Rheumatoid Arthritis",
            pubmed_refs=["PMID:28402771", "PMID:31622559"],
        ),
    ],
}


def search_disease(query: str) -> str | None:
    """Return the best matching disease key for a search query."""
    query_lower = query.lower().strip()
    # Exact match first
    if query_lower in DISEASE_CATALOG:
        return query_lower
    # Partial match
    for key in DISEASE_CATALOG:
        if query_lower in key or key in query_lower:
            return key
    return None


def get_disease_data(disease_key: str):
    """Return disease, genes, proteins, and drugs for a given disease key."""
    disease = DISEASE_CATALOG.get(disease_key)
    genes = GENES_BY_DISEASE.get(disease_key, [])
    proteins = PROTEINS_BY_DISEASE.get(disease_key, [])
    drugs = DRUGS_BY_DISEASE.get(disease_key, [])
    return disease, genes, proteins, drugs
