import os

MOCK_DATA_CONTENT = '''"""
Mock biomedical data service.
"""

from models.schemas import Gene, Protein, Drug, DiseaseInfo

DISEASE_CATALOG: dict[str, DiseaseInfo] = {
    "alzheimer": DiseaseInfo(id="MONDO:0004975", name="Alzheimer's Disease", description="A progressive neurodegenerative disorder...", prevalence="~55 million", icd_code="G30"),
    "parkinson": DiseaseInfo(id="MONDO:0005180", name="Parkinson's Disease", description="A chronic neurodegenerative disorder...", prevalence="~10 million", icd_code="G20"),
    "breast cancer": DiseaseInfo(id="MONDO:0007254", name="Breast Cancer", description="A malignancy arising from breast tissue...", prevalence="~2.3 million", icd_code="C50"),
    "type 2 diabetes": DiseaseInfo(id="MONDO:0005148", name="Type 2 Diabetes Mellitus", description="A metabolic disorder...", prevalence="~537 million", icd_code="E11"),
    "covid-19": DiseaseInfo(id="MONDO:0100096", name="COVID-19", description="An infectious disease caused by SARS-CoV-2...", prevalence=">700 million", icd_code="U07.1"),
    "rheumatoid arthritis": DiseaseInfo(id="MONDO:0008383", name="Rheumatoid Arthritis", description="A chronic autoimmune inflammatory disorder...", prevalence="~18 million", icd_code="M05"),
    "asthma": DiseaseInfo(id="MONDO:0004979", name="Asthma", description="A chronic respiratory condition characterized by airway inflammation.", prevalence="~262 million", icd_code="J45"),
    "osteoporosis": DiseaseInfo(id="MONDO:0005265", name="Osteoporosis", description="A systemic skeletal disease characterized by low bone mass.", prevalence="~200 million", icd_code="M81"),
    "depression": DiseaseInfo(id="MONDO:0002050", name="Major Depressive Disorder", description="A mental disorder characterized by at least two weeks of pervasive low mood.", prevalence="~280 million", icd_code="F32"),
    "nsclc": DiseaseInfo(id="MONDO:0005233", name="Non-Small Cell Lung Cancer", description="The most common type of lung cancer.", prevalence="~1.8 million", icd_code="C34"),
}

GENES_BY_DISEASE: dict[str, list[Gene]] = {
    "alzheimer": [
        Gene(id="ENSG00000130203", symbol="APOE", name="Apolipoprotein E", chromosome="19q13.32", relevance_score=0.97),
        Gene(id="ENSG00000142192", symbol="APP", name="Amyloid Precursor Protein", chromosome="21q21.3", relevance_score=0.94),
        Gene(id="ENSG00000080815", symbol="PSEN1", name="Presenilin-1", chromosome="14q24.2", relevance_score=0.91),
        Gene(id="ENSG00000143801", symbol="PSEN2", name="Presenilin-2", chromosome="1q42.13", relevance_score=0.87),
        Gene(id="ENSG00000106211", symbol="MAPT", name="Microtubule-Associated Protein Tau", chromosome="17q21.31", relevance_score=0.85),
        Gene(id="ENSG00000185973", symbol="BACE1", name="Beta-secretase 1", chromosome="11q23.3", relevance_score=0.88),
        Gene(id="ENSG00000082701", symbol="GSK3B", name="Glycogen synthase kinase-3 beta", chromosome="3q13.33", relevance_score=0.82),
    ],
    "parkinson": [
        Gene(id="ENSG00000145335", symbol="SNCA", name="Synuclein Alpha", chromosome="4q22.1", relevance_score=0.96),
        Gene(id="ENSG00000188906", symbol="LRRK2", name="Leucine Rich Repeat Kinase 2", chromosome="12q12", relevance_score=0.92),
        Gene(id="ENSG00000185345", symbol="PARK7", name="Parkinson Protein 7 (DJ-1)", chromosome="1p36.23", relevance_score=0.88),
        Gene(id="ENSG00000131050", symbol="PINK1", name="PTEN Induced Kinase 1", chromosome="1p36.12", relevance_score=0.85),
        Gene(id="ENSG00000197747", symbol="PARKIN", name="Parkin RBR E3 Ubiquitin Ligase", chromosome="6q26", relevance_score=0.83),
        Gene(id="ENSG00000069535", symbol="MAOB", name="Monoamine oxidase B", chromosome="Xp11.3", relevance_score=0.86),
        Gene(id="ENSG00000093010", symbol="COMT", name="Catechol-O-methyltransferase", chromosome="22q11.21", relevance_score=0.84),
    ],
    "breast cancer": [
        Gene(id="ENSG00000012048", symbol="BRCA1", name="Breast Cancer Gene 1", chromosome="17q21.31", relevance_score=0.98),
        Gene(id="ENSG00000141736", symbol="ERBB2", name="Erb-B2 Receptor Tyrosine Kinase 2", chromosome="17q12", relevance_score=0.93),
        Gene(id="ENSG00000171862", symbol="PTEN", name="Phosphatase and Tensin Homolog", chromosome="10q23.31", relevance_score=0.89),
        Gene(id="ENSG00000141510", symbol="TP53", name="Tumor Protein P53", chromosome="17p13.1", relevance_score=0.87),
        Gene(id="ENSG00000091831", symbol="ESR1", name="Estrogen Receptor 1", chromosome="6q25.1", relevance_score=0.95),
        Gene(id="ENSG00000135446", symbol="CDK4", name="Cyclin Dependent Kinase 4", chromosome="12q14.1", relevance_score=0.85),
        Gene(id="ENSG00000105810", symbol="CDK6", name="Cyclin Dependent Kinase 6", chromosome="7q21.2", relevance_score=0.84),
    ],
    "type 2 diabetes": [
        Gene(id="ENSG00000254647", symbol="INS", name="Insulin", chromosome="11p15.5", relevance_score=0.97),
        Gene(id="ENSG00000132170", symbol="PPARG", name="Peroxisome Proliferator Activated Receptor Gamma", chromosome="3p25.2", relevance_score=0.93),
        Gene(id="ENSG00000169047", symbol="IRS1", name="Insulin Receptor Substrate 1", chromosome="2q36.3", relevance_score=0.89),
        Gene(id="ENSG00000180401", symbol="GLUT4", name="Glucose Transporter Type 4", chromosome="17p13", relevance_score=0.86),
        Gene(id="ENSG00000141736", symbol="TCF7L2", name="Transcription Factor 7 Like 2", chromosome="10q25.2", relevance_score=0.84),
        Gene(id="ENSG00000112837", symbol="GLP1R", name="Glucagon-like peptide 1 receptor", chromosome="6p21.2", relevance_score=0.92),
        Gene(id="ENSG00000197635", symbol="DPP4", name="Dipeptidyl peptidase 4", chromosome="2q24.2", relevance_score=0.88),
    ],
    "covid-19": [
        Gene(id="ENSG00000105329", symbol="ACE2", name="Angiotensin Converting Enzyme 2", chromosome="Xp22.2", relevance_score=0.98),
        Gene(id="ENSG00000187492", symbol="TMPRSS2", name="Transmembrane Serine Protease 2", chromosome="21q22.3", relevance_score=0.95),
        Gene(id="ENSG00000197253", symbol="IL6", name="Interleukin 6", chromosome="7p15.3", relevance_score=0.91),
        Gene(id="ENSG00000115415", symbol="STAT3", name="Signal Transducer And Activator Of Transcription 3", chromosome="17q21.2", relevance_score=0.87),
        Gene(id="ENSG00000232810", symbol="TNF", name="Tumor Necrosis Factor", chromosome="6p21.33", relevance_score=0.85),
        Gene(id="ENSG00000125538", symbol="IL1B", name="Interleukin 1 Beta", chromosome="2q14.1", relevance_score=0.89),
    ],
    "rheumatoid arthritis": [
        Gene(id="ENSG00000197253", symbol="IL6", name="Interleukin 6", chromosome="7p15.3", relevance_score=0.95),
        Gene(id="ENSG00000232810", symbol="TNF", name="Tumor Necrosis Factor", chromosome="6p21.33", relevance_score=0.93),
        Gene(id="ENSG00000115415", symbol="JAK1", name="Janus Kinase 1", chromosome="1p31.3", relevance_score=0.90),
        Gene(id="ENSG00000105397", symbol="TYK2", name="Tyrosine Kinase 2", chromosome="19p13.2", relevance_score=0.86),
        Gene(id="ENSG00000171791", symbol="PTPN22", name="Protein Tyrosine Phosphatase Non-Receptor 22", chromosome="1p13.2", relevance_score=0.83),
        Gene(id="ENSG00000096968", symbol="JAK2", name="Janus Kinase 2", chromosome="9p24.1", relevance_score=0.85),
        Gene(id="ENSG00000105369", symbol="JAK3", name="Janus Kinase 3", chromosome="19p13.11", relevance_score=0.84),
        Gene(id="ENSG00000156738", symbol="MS4A1", name="CD20", chromosome="11q12.2", relevance_score=0.88),
    ],
    "asthma": [
        Gene(id="ENSG00000077238", symbol="IL4R", name="Interleukin 4 Receptor", chromosome="16p12.1", relevance_score=0.95),
        Gene(id="ENSG00000113525", symbol="IL5", name="Interleukin 5", chromosome="5q31.1", relevance_score=0.92),
        Gene(id="ENSG00000169252", symbol="ADRB2", name="Adrenoceptor Beta 2", chromosome="5q32", relevance_score=0.98),
    ],
    "osteoporosis": [
        Gene(id="ENSG00000120889", symbol="TNFSF11", name="RANKL", chromosome="13q14.11", relevance_score=0.97),
        Gene(id="ENSG00000143228", symbol="CTSK", name="Cathepsin K", chromosome="1q21.3", relevance_score=0.93),
        Gene(id="ENSG00000091831", symbol="ESR1", name="Estrogen Receptor 1", chromosome="6q25.1", relevance_score=0.90),
    ],
    "depression": [
        Gene(id="ENSG00000108576", symbol="SLC6A4", name="Serotonin Transporter", chromosome="17q11.2", relevance_score=0.96),
        Gene(id="ENSG00000102468", symbol="HTR2A", name="5-Hydroxytryptamine Receptor 2A", chromosome="13q14.2", relevance_score=0.91),
        Gene(id="ENSG00000189221", symbol="MAOA", name="Monoamine Oxidase A", chromosome="Xp11.3", relevance_score=0.89),
    ],
    "nsclc": [
        Gene(id="ENSG00000146648", symbol="EGFR", name="Epidermal Growth Factor Receptor", chromosome="7p11.2", relevance_score=0.98),
        Gene(id="ENSG00000171094", symbol="ALK", name="Anaplastic Lymphoma Kinase", chromosome="2p23.2", relevance_score=0.95),
        Gene(id="ENSG00000188157", symbol="PDCD1", name="Programmed Cell Death 1", chromosome="2q37.3", relevance_score=0.94),
        Gene(id="ENSG00000047936", symbol="ROS1", name="ROS Proto-Oncogene 1", chromosome="6q22.1", relevance_score=0.91),
    ]
}

PROTEINS_BY_DISEASE: dict[str, list[Protein]] = {
    "alzheimer": [
        Protein(id="P02649", name="Apolipoprotein E", uniprot_id="P02649", function="Lipid transport, Aβ clearance mediator", structure_available=True),
        Protein(id="P05067", name="Amyloid Precursor Protein", uniprot_id="P05067", function="Cell adhesion, synaptogenesis; cleaved to Aβ peptides", structure_available=True),
        Protein(id="P49768", name="Presenilin-1", uniprot_id="P49768", function="Gamma-secretase catalytic subunit; regulates Notch/Aβ42 production", structure_available=True),
        Protein(id="P49810", name="Presenilin-2", uniprot_id="P49810", function="Gamma-secretase catalytic subunit", structure_available=True),
        Protein(id="P10636", name="Tau protein", uniprot_id="P10636", function="Microtubule stabilization; hyperphosphorylated in tangles", structure_available=True),
        Protein(id="P56817", name="BACE1", uniprot_id="P56817", function="Beta-secretase 1", structure_available=True),
        Protein(id="P49841", name="GSK3B", uniprot_id="P49841", function="Glycogen synthase kinase-3 beta", structure_available=True),
    ],
    "parkinson": [
        Protein(id="P37840", name="Alpha-synuclein", uniprot_id="P37840", function="Synaptic vesicle regulation; aggregates into Lewy bodies", structure_available=True),
        Protein(id="Q5S007", name="LRRK2", uniprot_id="Q5S007", function="Serine/threonine kinase; regulates vesicle trafficking", structure_available=True),
        Protein(id="Q99497", name="DJ-1", uniprot_id="Q99497", function="Oxidative stress sensor and neuroprotector", structure_available=True),
        Protein(id="Q9BXM7", name="PINK1", uniprot_id="Q9BXM7", function="Mitochondrial quality control kinase", structure_available=True),
        Protein(id="O60260", name="PARKIN", uniprot_id="O60260", function="E3 ubiquitin ligase targeting damaged mitochondria", structure_available=True),
        Protein(id="P27338", name="MAOB", uniprot_id="P27338", function="Monoamine oxidase B", structure_available=True),
        Protein(id="P21964", name="COMT", uniprot_id="P21964", function="Catechol-O-methyltransferase", structure_available=True),
    ],
    "breast cancer": [
        Protein(id="P38398", name="BRCA1", uniprot_id="P38398", function="DNA repair, transcription regulation, tumor suppression", structure_available=True),
        Protein(id="P04637", name="p53", uniprot_id="P04637", function="Transcription factor; apoptosis inducer; genome guardian", structure_available=True),
        Protein(id="P04626", name="HER2/ErbB2", uniprot_id="P04626", function="Receptor tyrosine kinase; cell proliferation signaling", structure_available=True),
        Protein(id="P00533", name="EGFR", uniprot_id="P00533", function="Receptor tyrosine kinase binding ligands of the EGF family", structure_available=True),
        Protein(id="P60484", name="PTEN", uniprot_id="P60484", function="Tumor suppressor; antagonizes PI3K-AKT signaling", structure_available=True),
        Protein(id="P03372", name="ESR1", uniprot_id="P03372", function="Estrogen Receptor 1", structure_available=True),
        Protein(id="P11802", name="CDK4", uniprot_id="P11802", function="Cyclin Dependent Kinase 4", structure_available=True),
        Protein(id="Q00534", name="CDK6", uniprot_id="Q00534", function="Cyclin Dependent Kinase 6", structure_available=True),
    ],
    "type 2 diabetes": [
        Protein(id="P01308", name="Insulin", uniprot_id="P01308", function="Glucose homeostasis hormone; anabolic regulator", structure_available=True),
        Protein(id="P37231", name="PPARG", uniprot_id="P37231", function="Nuclear receptor; adipogenesis and insulin sensitivity regulator", structure_available=True),
        Protein(id="P35568", name="IRS1", uniprot_id="P35568", function="Insulin receptor substrate 1; metabolic signaling", structure_available=True),
        Protein(id="P14672", name="GLUT4", uniprot_id="P14672", function="Insulin-responsive glucose transporter", structure_available=True),
        Protein(id="Q9NQB0", name="TCF7L2", uniprot_id="Q9NQB0", function="Transcription factor involved in blood glucose homeostasis", structure_available=True),
        Protein(id="P43220", name="GLP1R", uniprot_id="P43220", function="Glucagon-like peptide 1 receptor", structure_available=True),
        Protein(id="P27487", name="DPP4", uniprot_id="P27487", function="Dipeptidyl peptidase 4", structure_available=True),
    ],
    "covid-19": [
        Protein(id="Q9BYF1", name="ACE2 receptor", uniprot_id="Q9BYF1", function="Viral entry receptor for SARS-CoV-2 spike protein", structure_available=True),
        Protein(id="O15393", name="TMPRSS2", uniprot_id="O15393", function="Serine protease priming spike protein for cell entry", structure_available=True),
        Protein(id="P05231", name="Interleukin-6", uniprot_id="P05231", function="Cytokine driving cytokine storm in severe COVID-19", structure_available=True),
        Protein(id="P40763", name="STAT3", uniprot_id="P40763", function="Signal transducer in hyperinflammatory cascade", structure_available=True),
        Protein(id="P01584", name="IL1B", uniprot_id="P01584", function="Interleukin 1 Beta", structure_available=True),
    ],
    "rheumatoid arthritis": [
        Protein(id="P05231", name="Interleukin-6", uniprot_id="P05231", function="Pro-inflammatory cytokine mediating joint destruction", structure_available=True),
        Protein(id="P01375", name="TNF-alpha", uniprot_id="P01375", function="Master inflammatory cytokine in RA pathogenesis", structure_available=True),
        Protein(id="P23458", name="JAK1", uniprot_id="P23458", function="Signal transduction kinase in JAK-STAT inflammatory cascade", structure_available=True),
        Protein(id="P29597", name="TYK2", uniprot_id="P29597", function="Non-receptor tyrosine-protein kinase", structure_available=True),
        Protein(id="Q9Y2R2", name="PTPN22", uniprot_id="Q9Y2R2", function="Tyrosine-protein phosphatase non-receptor type 22", structure_available=True),
        Protein(id="O60674", name="JAK2", uniprot_id="O60674", function="Janus Kinase 2", structure_available=True),
        Protein(id="P52333", name="JAK3", uniprot_id="P52333", function="Janus Kinase 3", structure_available=True),
        Protein(id="P11836", name="CD20", uniprot_id="P11836", function="B-lymphocyte antigen CD20", structure_available=True),
    ],
    "asthma": [
        Protein(id="P24394", name="IL4R", uniprot_id="P24394", function="Interleukin 4 Receptor", structure_available=True),
        Protein(id="P05113", name="IL5", uniprot_id="P05113", function="Interleukin 5", structure_available=True),
        Protein(id="P07550", name="ADRB2", uniprot_id="P07550", function="Adrenoceptor Beta 2", structure_available=True),
    ],
    "osteoporosis": [
        Protein(id="O14788", name="RANKL", uniprot_id="O14788", function="Receptor activator of nuclear factor kappa-B ligand", structure_available=True),
        Protein(id="P43235", name="Cathepsin K", uniprot_id="P43235", function="Cathepsin K", structure_available=True),
        Protein(id="P03372", name="ESR1", uniprot_id="P03372", function="Estrogen Receptor 1", structure_available=True),
    ],
    "depression": [
        Protein(id="P31645", name="SERT", uniprot_id="P31645", function="Serotonin Transporter", structure_available=True),
        Protein(id="P28223", name="HTR2A", uniprot_id="P28223", function="5-Hydroxytryptamine Receptor 2A", structure_available=True),
        Protein(id="P21397", name="MAOA", uniprot_id="P21397", function="Monoamine Oxidase A", structure_available=True),
    ],
    "nsclc": [
        Protein(id="P00533", name="EGFR", uniprot_id="P00533", function="Epidermal Growth Factor Receptor", structure_available=True),
        Protein(id="Q9UM73", name="ALK", uniprot_id="Q9UM73", function="Anaplastic Lymphoma Kinase", structure_available=True),
        Protein(id="Q15116", name="PD-1", uniprot_id="Q15116", function="Programmed Cell Death 1", structure_available=True),
        Protein(id="P08922", name="ROS1", uniprot_id="P08922", function="ROS Proto-Oncogene 1", structure_available=True),
    ]
}

DRUGS_BY_DISEASE: dict[str, list[Drug]] = {
    "alzheimer": [
        Drug(id="DB01043", name="Memantine", generic_name="memantine hydrochloride", confidence_score=0.89, mechanism="NMDA receptor antagonism", target_proteins=["NMDA receptor"], side_effects=["Dizziness"], rationale="Directly targets excitotoxic pathways", approval_status="FDA Approved", original_indication="Alzheimer's", pubmed_refs=[]),
    ],
    "parkinson": [
        Drug(id="DB00494", name="Entacapone", generic_name="entacapone", confidence_score=0.85, mechanism="COMT inhibition", target_proteins=["COMT"], side_effects=["Dyskinesia"], rationale="Adjunct therapy extending dopamine", approval_status="FDA Approved", original_indication="Parkinson's", pubmed_refs=[]),
    ],
    "breast cancer": [
        Drug(id="DB01259", name="Lapatinib", generic_name="lapatinib", confidence_score=0.91, mechanism="Dual EGFR/HER2 tyrosine kinase inhibition", target_proteins=["HER2/ErbB2", "EGFR"], side_effects=["Diarrhea"], rationale="Directly targets HER2 amplification", approval_status="FDA Approved", original_indication="HER2+ Breast Cancer", pubmed_refs=[]),
        Drug(id="DB11776", name="Palbociclib", generic_name="palbociclib", confidence_score=0.95, mechanism="CDK4/6 inhibition", target_proteins=["CDK4", "CDK6"], side_effects=["Neutropenia"], rationale="Blocks cell cycle progression", approval_status="FDA Approved", original_indication="Breast Cancer", pubmed_refs=[]),
    ],
    "type 2 diabetes": [
        Drug(id="DB09025", name="Semaglutide", generic_name="semaglutide", confidence_score=0.94, mechanism="GLP-1 receptor agonism", target_proteins=["GLP1R"], side_effects=["Nausea"], rationale="Direct therapeutic target engagement", approval_status="FDA Approved", original_indication="Type 2 Diabetes", pubmed_refs=[]),
        Drug(id="DB06203", name="Sitagliptin", generic_name="sitagliptin", confidence_score=0.92, mechanism="DPP-4 inhibition", target_proteins=["DPP4"], side_effects=["Nasopharyngitis"], rationale="Prevents GLP-1 breakdown", approval_status="FDA Approved", original_indication="Type 2 Diabetes", pubmed_refs=[]),
    ],
    "covid-19": [
        Drug(id="DB14761", name="Remdesivir", generic_name="remdesivir", confidence_score=0.88, mechanism="RdRp inhibitor", target_proteins=["RdRp"], side_effects=["Nausea"], rationale="Antiviral mechanism", approval_status="FDA Approved", original_indication="COVID-19", pubmed_refs=[]),
    ],
    "rheumatoid arthritis": [
        Drug(id="DB00051", name="Adalimumab", generic_name="adalimumab", confidence_score=0.96, mechanism="TNF-alpha neutralization", target_proteins=["TNF-alpha"], side_effects=["Infection risk"], rationale="Gold standard biologic", approval_status="FDA Approved", original_indication="Rheumatoid Arthritis", pubmed_refs=[]),
        Drug(id="DB11817", name="Baricitinib", generic_name="baricitinib", confidence_score=0.92, mechanism="JAK1/JAK2 inhibitor", target_proteins=["JAK1", "JAK2", "JAK3"], side_effects=["Infections"], rationale="Targets JAK-STAT pathway", approval_status="FDA Approved", original_indication="Rheumatoid Arthritis", pubmed_refs=[]),
        Drug(id="DB00073", name="Rituximab", generic_name="rituximab", confidence_score=0.90, mechanism="Anti-CD20 antibody", target_proteins=["CD20"], side_effects=["Infusion reactions"], rationale="Depletes B cells", approval_status="FDA Approved", original_indication="Rheumatoid Arthritis", pubmed_refs=[]),
    ],
    "asthma": [
        Drug(id="DB00171", name="Albuterol", generic_name="albuterol", confidence_score=0.98, mechanism="Beta-2 adrenergic agonism", target_proteins=["ADRB2"], side_effects=["Tremor", "Tachycardia"], rationale="Bronchodilator", approval_status="FDA Approved", original_indication="Asthma", pubmed_refs=[]),
        Drug(id="DB08885", name="Mepolizumab", generic_name="mepolizumab", confidence_score=0.95, mechanism="IL-5 antagonism", target_proteins=["IL5"], side_effects=["Headache"], rationale="Reduces eosinophils", approval_status="FDA Approved", original_indication="Asthma", pubmed_refs=[]),
        Drug(id="DB14246", name="Dupilumab", generic_name="dupilumab", confidence_score=0.93, mechanism="IL-4R alpha antagonism", target_proteins=["IL4R"], side_effects=["Injection site reaction"], rationale="Blocks IL-4 and IL-13 signaling", approval_status="FDA Approved", original_indication="Asthma", pubmed_refs=[]),
    ],
    "osteoporosis": [
        Drug(id="DB06681", name="Denosumab", generic_name="denosumab", confidence_score=0.96, mechanism="RANKL inhibition", target_proteins=["RANKL"], side_effects=["Hypocalcemia"], rationale="Inhibits osteoclast formation", approval_status="FDA Approved", original_indication="Osteoporosis", pubmed_refs=[]),
        Drug(id="DB00965", name="Raloxifene", generic_name="raloxifene", confidence_score=0.88, mechanism="SERM", target_proteins=["ESR1"], side_effects=["Hot flashes"], rationale="Estrogen agonist in bone", approval_status="FDA Approved", original_indication="Osteoporosis", pubmed_refs=[]),
    ],
    "depression": [
        Drug(id="DB00153", name="Fluoxetine", generic_name="fluoxetine", confidence_score=0.97, mechanism="SSRI", target_proteins=["SERT"], side_effects=["Insomnia", "Nausea"], rationale="Increases synaptic serotonin", approval_status="FDA Approved", original_indication="Major Depressive Disorder", pubmed_refs=[]),
        Drug(id="DB00804", name="Mirtazapine", generic_name="mirtazapine", confidence_score=0.90, mechanism="Alpha-2 and 5-HT2A antagonist", target_proteins=["HTR2A"], side_effects=["Weight gain", "Sedation"], rationale="Enhances noradrenergic and serotonergic release", approval_status="FDA Approved", original_indication="Major Depressive Disorder", pubmed_refs=[]),
    ],
    "nsclc": [
        Drug(id="DB08916", name="Crizotinib", generic_name="crizotinib", confidence_score=0.94, mechanism="ALK/ROS1 inhibitor", target_proteins=["ALK", "ROS1"], side_effects=["Vision disorder", "Nausea"], rationale="Targets specific oncogenic fusions", approval_status="FDA Approved", original_indication="NSCLC", pubmed_refs=[]),
        Drug(id="DB09037", name="Pembrolizumab", generic_name="pembrolizumab", confidence_score=0.96, mechanism="PD-1 inhibitor", target_proteins=["PD-1"], side_effects=["Fatigue", "Immune-mediated adverse events"], rationale="Reverses T-cell exhaustion", approval_status="FDA Approved", original_indication="NSCLC", pubmed_refs=[]),
        Drug(id="DB00317", name="Gefitinib", generic_name="gefitinib", confidence_score=0.92, mechanism="EGFR inhibitor", target_proteins=["EGFR"], side_effects=["Rash", "Diarrhea"], rationale="Targets EGFR mutations", approval_status="FDA Approved", original_indication="NSCLC", pubmed_refs=[]),
    ]
}

def search_disease(query: str) -> str | None:
    query_lower = query.lower().strip()
    if query_lower in DISEASE_CATALOG:
        return query_lower
    for key in DISEASE_CATALOG:
        if query_lower in key or key in query_lower:
            return key
    return None

def get_disease_data(disease_key: str):
    disease = DISEASE_CATALOG.get(disease_key)
    genes = GENES_BY_DISEASE.get(disease_key, [])
    proteins = PROTEINS_BY_DISEASE.get(disease_key, [])
    drugs = DRUGS_BY_DISEASE.get(disease_key, [])
    return disease, genes, proteins, drugs
'''

with open(r"c:\Users\praka\OneDrive\Documents\Drug-Nova\backend\services\mock_data.py", "w", encoding="utf-8") as f:
    f.write(MOCK_DATA_CONTENT)
print("Updated mock_data.py")
