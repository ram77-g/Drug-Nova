"""
inject_smiles.py  — v2
──────────────────────
Run ONCE from the backend/ folder to write SMILES strings into every
drug document in MongoDB so the GNN can actually run on them.

Usage:
    cd backend
    python inject_smiles.py
"""

import asyncio, os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

# ── Complete SMILES lookup ────────────────────────────────────────────────
# Covers every drug currently in the Drug Nova MongoDB collection.
# None = antibody / large peptide — no small-molecule SMILES exists,
#        GNN will fall back to hash formula for these automatically.

SMILES_DB = {

    # ── GNN training set (Colab 10 drugs) ────────────────────────────────
    "imatinib":     "Cc1ccc(NC(=O)c2ccc(CN3CCN(C)CC3)cc2)cc1Nc1nccc(-c2cccnc2)n1",
    "gleevec":      "Cc1ccc(NC(=O)c2ccc(CN3CCN(C)CC3)cc2)cc1Nc1nccc(-c2cccnc2)n1",
    "erlotinib":    "COCCOC1=CC2=C(C=C1OCCO)C(=NC=N2)NC1=CC=CC(=C1)C#C",
    "tarceva":      "COCCOC1=CC2=C(C=C1OCCO)C(=NC=N2)NC1=CC=CC(=C1)C#C",
    "gefitinib":    "COc1cc2ncnc(Nc3ccc(F)c(Cl)c3)c2cc1OCCCN1CCOCC1",
    "iressa":       "COc1cc2ncnc(Nc3ccc(F)c(Cl)c3)c2cc1OCCCN1CCOCC1",
    "sorafenib":    "CNC(=O)c1cc(Oc2ccc(NC(=O)Nc3ccc(Cl)c(C(F)(F)F)c3)cc2)ccn1",
    "nexavar":      "CNC(=O)c1cc(Oc2ccc(NC(=O)Nc3ccc(Cl)c(C(F)(F)F)c3)cc2)ccn1",
    "vemurafenib":  "CCCS(=O)(=O)Nc1ccc(F)c(C(=O)c2c[nH]c3cc(Cl)ccc23)c1",
    "zelboraf":     "CCCS(=O)(=O)Nc1ccc(F)c(C(=O)c2c[nH]c3cc(Cl)ccc23)c1",
    "ruxolitinib":  "C[C@@H](Cc1c[nH]c2ncc(-c3ccnc4[nH]cc(-c5cn6ccocc6=O)cc34)cc12)N",
    "jakafi":       "C[C@@H](Cc1c[nH]c2ncc(-c3ccnc4[nH]cc(-c5cn6ccocc6=O)cc34)cc12)N",
    "metformin":    "CN(C)C(=N)NC(=N)N",
    "glucophage":   "CN(C)C(=N)NC(=N)N",
    "aspirin":      "CC(=O)Oc1ccccc1C(=O)O",
    "tamoxifen":    "CCC(=C1C=CC(=CC1)OCCN(C)C)C2=CC=CC=C2",
    "nolvadex":     "CCC(=C1C=CC(=CC1)OCCN(C)C)C2=CC=CC=C2",
    "dasatinib":    "Cc1nc(Nc2ncc(C(=O)Nc3c(C)cccc3Cl)s2)cc(N2CCN(CCO)CC2)n1",
    "sprycel":      "Cc1nc(Nc2ncc(C(=O)Nc3c(C)cccc3Cl)s2)cc(N2CCN(CCO)CC2)n1",

    # ── Newly added from your MongoDB collection ──────────────────────────

    # Neurology / Alzheimer's
    "memantine":    "CC12CC(CC(C1)(CN)C)C2",
    "namenda":      "CC12CC(CC(C1)(CN)C)C2",

    # Parkinson's
    "entacapone":   "CCN(CC)/C(=N/O)C(=O)/C=C/c1cc(O)c(O)c([N+](=O)[O-])c1",
    "comtan":       "CCN(CC)/C(=N/O)C(=O)/C=C/c1cc(O)c(O)c([N+](=O)[O-])c1",

    # Diabetes (GLP-1 agonist peptide — no small-mol SMILES)
    "semaglutide":  None,
    "ozempic":      None,
    "wegovy":       None,

    # Biologics / antibodies — no small-mol SMILES
    "adalimumab":   None,
    "humira":       None,
    "rituximab":    None,
    "rituxan":      None,
    "mepolizumab":  None,
    "nucala":       None,
    "dupilumab":    None,
    "dupixent":     None,
    "denosumab":    None,
    "prolia":       None,
    "xgeva":        None,
    "teriparatide": None,
    "forteo":       None,
    "romosozumab":  None,
    "evenity":      None,
    "pembrolizumab":None,
    "keytruda":     None,
    "trastuzumab":  None,
    "herceptin":    None,
    "bevacizumab":  None,
    "avastin":      None,
    "cetuximab":    None,
    "erbitux":      None,
    "nivolumab":    None,
    "opdivo":       None,
    "tocilizumab":  None,
    "actemra":      None,

    # Respiratory
    "albuterol":        "CC(C)(C)NCC(O)c1ccc(O)c(CO)c1",
    "salbutamol":       "CC(C)(C)NCC(O)c1ccc(O)c(CO)c1",
    "ventolin":         "CC(C)(C)NCC(O)c1ccc(O)c(CO)c1",
    "fluticasone":      "C[C@@H]1C[C@H]2[C@@H]3CC[C@@H]([C@]3(C[C@@H]([C@@H]2[C@]4(C)C=CC(=O)C=C14)F)C(=O)SCF)OC(=O)CCC",
    "flonase":          "C[C@@H]1C[C@H]2[C@@H]3CC[C@@H]([C@]3(C[C@@H]([C@@H]2[C@]4(C)C=CC(=O)C=C14)F)C(=O)SCF)OC(=O)CCC",
    "montelukast":      "OC(=O)CCc1ccc(/C=C/c2ccc3c(c2)c(CC(C)(C)c2cccs2)cn3Cc2ccc(Cl)cc2)cc1",
    "singulair":        "OC(=O)CCc1ccc(/C=C/c2ccc3c(c2)c(CC(C)(C)c2cccs2)cn3Cc2ccc(Cl)cc2)cc1",

    # Osteoporosis
    "raloxifene":       "c1ccc(cc1)C(c2ccc(cc2)O)c3ccc(cc3)OCCN4CCCCC4",
    "evista":           "c1ccc(cc1)C(c2ccc(cc2)O)c3ccc(cc3)OCCN4CCCCC4",
    "alendronate":      "NCCCC(O)(P(=O)(O)O)P(=O)(O)O",
    "fosamax":          "NCCCC(O)(P(=O)(O)O)P(=O)(O)O",

    # Psychiatry / antidepressants
    "fluoxetine":       "CNCCC(Oc1ccc(C(F)(F)F)cc1)c1ccccc1",
    "prozac":           "CNCCC(Oc1ccc(C(F)(F)F)cc1)c1ccccc1",
    "mirtazapine":      "CN1CCN2c3ncccc3CC2C1",
    "remeron":          "CN1CCN2c3ncccc3CC2C1",
    "venlafaxine":      "COc1ccc(C(CCN(C)C)C2(O)CCCCC2)cc1",
    "effexor":          "COc1ccc(C(CCN(C)C)C2(O)CCCCC2)cc1",
    "bupropion":        "CC(C)(N)C(=O)c1cccc(Cl)c1",
    "wellbutrin":       "CC(C)(N)C(=O)c1cccc(Cl)c1",
    "zyban":            "CC(C)(N)C(=O)c1cccc(Cl)c1",
    "ketamine":         "O=C1CCCCC1(Cl)Nc1ccccc1",
    "ketalar":          "O=C1CCCCC1(Cl)Nc1ccccc1",

    # Oncology — targeted small molecules
    "crizotinib":       "OC(CN1CCC[C@@H]1Cn1cnc2c(Nc3cc(F)c(Cl)cc3C(=O)NC(C)C)ccc(C#N)c12)CF",
    "xalkori":          "OC(CN1CCC[C@@H]1Cn1cnc2c(Nc3cc(F)c(Cl)cc3C(=O)NC(C)C)ccc(C#N)c12)CF",
    "sotorasib":        "O=C1/C=C/CN2CC[C@H](c3nc(Nc4ccc(F)c(Cl)c4)ncc3-n3cnc4ccccc43)CC2=C1",
    "lumakras":         "O=C1/C=C/CN2CC[C@H](c3nc(Nc4ccc(F)c(Cl)c4)ncc3-n3cnc4ccccc43)CC2=C1",
    "capmatinib":       "Fc1cnc(Nc2cc3c(cn2)CN(C(=O)c2ccncc2N)CC3)nc1",
    "tabrecta":         "Fc1cnc(Nc2cc3c(cn2)CN(C(=O)c2ccncc2N)CC3)nc1",
    "dabrafenib":       "Cc1nc(NS(=O)(=O)c2c(F)cccc2F)sc1-c1cc(F)c(-c2cc(NC(=O)c3ccccn3)ccn2)cc1",
    "tafinlar":         "Cc1nc(NS(=O)(=O)c2c(F)cccc2F)sc1-c1cc(F)c(-c2cc(NC(=O)c3ccccn3)ccn2)cc1",
    "lapatinib":        "N#Cc1cccc(Nc2ncnc3cc(OCC4CCCO4)c(NC(=O)c4cccc(Cl)c4F)cc23)c1",
    "tykerb":           "N#Cc1cccc(Nc2ncnc3cc(OCC4CCCO4)c(NC(=O)c4cccc(Cl)c4F)cc23)c1",
    "palbociclib":      "CC1=C(C(=O)N2CCN(C)CC2)C(c2ccc(N3CCCCC3=O)nc2)=NC1=C",
    "ibrance":          "CC1=C(C(=O)N2CCN(C)CC2)C(c2ccc(N3CCCCC3=O)nc2)=NC1=C",
    "olaparib":         "O=C(c1ccc(N2CC(=O)c3ccccc32)cc1)c1nnc(C2CC2)c(=O)n1",
    "lynparza":         "O=C(c1ccc(N2CC(=O)c3ccccc32)cc1)c1nnc(C2CC2)c(=O)n1",
    "venetoclax":       "Cc1ccc(-n2nc(C(F)(F)F)cc2-c2ccc(OCC3(CCC(=O)N3)C3CCOCC3)c(Cl)c2)cc1NS(=O)(=O)c1ccc(NCC2CCNCC2)c([N+](=O)[O-])c1",
    "venclexta":        "Cc1ccc(-n2nc(C(F)(F)F)cc2-c2ccc(OCC3(CCC(=O)N3)C3CCOCC3)c(Cl)c2)cc1NS(=O)(=O)c1ccc(NCC2CCNCC2)c([N+](=O)[O-])c1",
    "ibrutinib":        "O=C(/C=C/c1ccccc1)N1CC[C@@H](n2nc(-c3ccccc3)c3c(N)ncnc32)C1",
    "imbruvica":        "O=C(/C=C/c1ccccc1)N1CC[C@@H](n2nc(-c3ccccc3)c3c(N)ncnc32)C1",
    "nilotinib":        "Cc1cn(-c2cc(NC(=O)c3ccc(CF)cc3)ccc2-c2ccnc(NC(c3ccccc3)c3ccccc3)n2)nn1",
    "tasigna":          "Cc1cn(-c2cc(NC(=O)c3ccc(CF)cc3)ccc2-c2ccnc(NC(c3ccccc3)c3ccccc3)n2)nn1",
    "axitinib":         "CNC(=O)c1ccc2c(C=Cc3cccs3)c[nH]c2c1",
    "inlyta":           "CNC(=O)c1ccc2c(C=Cc3cccs3)c[nH]c2c1",
    "sunitinib":        "CCN(CC)CCNC(=O)c1c(C)[nH]c(/C=C2\\C(=O)Nc3ccc(F)cc32)c1C",
    "sutent":           "CCN(CC)CCNC(=O)c1c(C)[nH]c(/C=C2\\C(=O)Nc3ccc(F)cc32)c1C",
    "regorafenib":      "CNC(=O)c1cc(Oc2ccc(NC(=O)Nc3ccc(F)c(C(F)(F)F)c3)cc2F)ccn1",
    "stivarga":         "CNC(=O)c1cc(Oc2ccc(NC(=O)Nc3ccc(F)c(C(F)(F)F)c3)cc2F)ccn1",

    # COVID-19
    "remdesivir":       "CCC(CC)COC(=O)[C@@H](NS(=O)(=O)c1ccc(C)cc1)OC(=O)[C@H](O)[C@@H](O)[C@H](O)C#N",
    "veklury":          "CCC(CC)COC(=O)[C@@H](NS(=O)(=O)c1ccc(C)cc1)OC(=O)[C@H](O)[C@@H](O)[C@H](O)C#N",
    "baricitinib":      "C[S@@](=O)c1ccc(-c2ccnc3[nH]ncc23)cc1",
    "olumiant":         "C[S@@](=O)c1ccc(-c2ccnc3[nH]ncc23)cc1",

    # Other common drugs
    "sitagliptin":      "O=C(C[C@@H](CC(=O)NCc1ncc(F)cn1)N1CCC(F)(F)C1)NCC(F)(F)F",
    "januvia":          "O=C(C[C@@H](CC(=O)NCc1ncc(F)cn1)N1CCC(F)(F)C1)NCC(F)(F)F",
    "paclitaxel":       "CC1=C2[C@H](C(=O)[C@@H]3[C@@H]([C@]2(OC(=O)C)[C@H]([C@@H]([C@@H]3OC(=O)C1)O)OC(=O)c4ccccc4)OC(=O)[C@@H](NC(=O)c5ccccc5)c6ccccc6)O",
    "taxol":            "CC1=C2[C@H](C(=O)[C@@H]3[C@@H]([C@]2(OC(=O)C)[C@H]([C@@H]([C@@H]3OC(=O)C1)O)OC(=O)c4ccccc4)OC(=O)[C@@H](NC(=O)c5ccccc5)c6ccccc6)O",
    "doxorubicin":      "COc1cccc2C(=O)c3c(O)c4c(c(O)c3C(=O)c12)C[C@@](O)(C(=O)CO)C[C@@H]4O[C@H]1C[C@@H](N)[C@H](O)[C@@H](C)O1",
    "cisplatin":        "[NH3][Pt]([NH3])(Cl)Cl",
    "methotrexate":     "CN(Cc1cnc2nc(N)nc(N)c2n1)c1ccc(C(=O)N[C@@H](CCC(=O)O)C(=O)O)cc1",
    "fluorouracil":     "O=C1NC(=O)C(F)=CN1",
    "atorvastatin":     "CC(C)c1n(CC[C@@H](O)C[C@@H](O)CC(=O)O)c2ccc(F)cc2c1/C=C/c1ccc(F)cc1",
    "lipitor":          "CC(C)c1n(CC[C@@H](O)C[C@@H](O)CC(=O)O)c2ccc(F)cc2c1/C=C/c1ccc(F)cc1",
    "hydroxychloroquine":"CCN(CCO)CCCC(C)Nc1ccnc2cc(Cl)ccc12",
    "plaquenil":        "CCN(CCO)CCCC(C)Nc1ccnc2cc(Cl)ccc12",
    "omeprazole":       "COc1ccc2[nH]c(S(=O)Cc3ncc(C)c(OC)c3C)nc2c1",
    "prilosec":         "COc1ccc2[nH]c(S(=O)Cc3ncc(C)c(OC)c3C)nc2c1",
    "losartan":         "CCCCc1nc(Cl)c(CO)n1Cc1ccc(-c2ccccc2-c2nnn[nH]2)cc1",
    "cozaar":           "CCCCc1nc(Cl)c(CO)n1Cc1ccc(-c2ccccc2-c2nnn[nH]2)cc1",
    "lisinopril":       "OC(=O)[C@@H](N)CCc1ccccc1",
    "zestril":          "OC(=O)[C@@H](N)CCc1ccccc1",
    "amlodipine":       "CCOC(=O)C1=C(COCCN)NC(C)=C(C(=O)OC)C1c1ccccc1Cl",
    "norvasc":          "CCOC(=O)C1=C(COCCN)NC(C)=C(C(=O)OC)C1c1ccccc1Cl",
    "warfarin":         "OC(=O)Cc1ccccc1/C(=C/c1ccccc1)\\c1ccccc1",
    "coumadin":         "OC(=O)Cc1ccccc1/C(=C/c1ccccc1)\\c1ccccc1",
    "clopidogrel":      "COC(=O)[C@@H](N1CCc2sccc2C1)c1ccccc1Cl",
    "plavix":           "COC(=O)[C@@H](N1CCc2sccc2C1)c1ccccc1Cl",
    "dexamethasone":    "C[C@@H]1C[C@H]2[C@@H]3CC[C@@H]([C@]3(C[C@@H]([C@@H]2[C@]4(C)C=CC(=O)C=C14)O)F)C(=O)CO",
    "amoxicillin":      "CC1([C@@H](N2[C@H](S1)[C@@H](C2=O)NC(=O)[C@@H](N)c3ccc(O)cc3)C(=O)O)C",
    "insulin":          None,
    "liraglutide":      None,
    "levothyroxine":    "N[C@@H](Cc1cc(I)c(Oc2cc(I)c(O)c(I)c2)c(I)c1)C(=O)O",
    "synthroid":        "N[C@@H](Cc1cc(I)c(Oc2cc(I)c(O)c(I)c2)c(I)c1)C(=O)O",
    "empagliflozin":    "OC[C@H]1OC(Oc2cc3c(cc2Cc2ccc(Cl)cc2)cc[nH]3)[C@H](O)[C@@H](O)[C@@H]1O",
    "jardiance":        "OC[C@H]1OC(Oc2cc3c(cc2Cc2ccc(Cl)cc2)cc[nH]3)[C@H](O)[C@@H](O)[C@@H]1O",
    "linagliptin":      "Cn1c(=O)c2nc[nH]c2n(Cc2cccc3ccccc23)c1=O",
    "tradjenta":        "Cn1c(=O)c2nc[nH]c2n(Cc2cccc3ccccc23)c1=O",
    "metoprolol":       "CC(C)NCC(O)COc1ccc(CCOC)cc1",
    "lopressor":        "CC(C)NCC(O)COc1ccc(CCOC)cc1",
    "atenolol":         "CC(C)NCC(O)COc1ccc(CC(N)=O)cc1",
    "tenormin":         "CC(C)NCC(O)COc1ccc(CC(N)=O)cc1",
    "pantoprazole":     "COc1ccc2nc(S(=O)Cc3ncc(OC(F)F)c(OC)c3C)n[nH]c2c1",
    "protonix":         "COc1ccc2nc(S(=O)Cc3ncc(OC(F)F)c(OC)c3C)n[nH]c2c1",
    "doxycycline":      "C[C@@H]1c2cccc(O)c2C(=O)C3=C(O)[C@]4(O)C(=O)C(C(N)=O)=C(O)[C@@H]4[C@H](N(C)C)[C@@H]13",
    "azithromycin":     "CC[C@@H]1OC(=O)[C@H](C)[C@@H](O[C@@H]2C[C@@](C)(OC)[C@@H](O)[C@H](C)O2)[C@H](C)[C@@H](O[C@H]2C[C@H](N(C)C)[C@@H](O)[C@H](C)O2)[C@](C)(O)C[C@@H](C)CN(C)[C@@H]1C",
    "prednisone":       "O=C1CC[C@H]2[C@@H]3CC=C4C[C@@H](O)CC[C@]4(C)[C@H]3C(=O)C[C@@]2(C)C1=O",
    "rosuvastatin":     "CC(C)c1nc(N(C)S(C)(=O)=O)nc(CC[C@@H](O)C[C@@H](O)CC(=O)O)c1/C=C/c1ccc(F)cc1",
    "crestor":          "CC(C)c1nc(N(C)S(C)(=O)=O)nc(CC[C@@H](O)C[C@@H](O)CC(=O)O)c1/C=C/c1ccc(F)cc1",
    "simvastatin":      "CCC(C)(C)C(=O)O[C@H]1C[C@@H](C)C=C2C=C[C@H](C)[C@H](CC[C@@H]3C[C@@H](O)CC(=O)O3)[C@@H]21",
    "zocor":            "CCC(C)(C)C(=O)O[C@H]1C[C@@H](C)C=C2C=C[C@H](C)[C@H](CC[C@@H]3C[C@@H](O)CC(=O)O3)[C@@H]21",
}


def _norm(name):
    return name.lower().strip()


async def inject():
    uri     = os.getenv("MONGO_URI")
    db_name = os.getenv("MONGO_DB_NAME", "drug_nova")
    if not uri:
        print("❌  MONGO_URI not set in .env")
        return

    client = AsyncIOMotorClient(uri)
    db     = client[db_name]

    lookup = {_norm(k): v for k, v in SMILES_DB.items()}

    cursor   = db.drugs.find({})
    updated_gnn   = []
    updated_null  = []
    not_found = []

    async for doc in cursor:
        name    = doc.get("name", "")
        generic = doc.get("generic_name", "")
        smiles  = lookup.get(_norm(name)) or lookup.get(_norm(generic))

        if smiles is not None:
            # real SMILES found
            await db.drugs.update_one({"_id": doc["_id"]}, {"$set": {"smiles": smiles}})
            updated_gnn.append(name)
        elif _norm(name) in lookup or _norm(generic) in lookup:
            # explicitly None (antibody/peptide)
            await db.drugs.update_one({"_id": doc["_id"]}, {"$set": {"smiles": None}})
            updated_null.append(name)
        else:
            # not in lookup at all — set None so field exists
            await db.drugs.update_one({"_id": doc["_id"]}, {"$set": {"smiles": None}})
            not_found.append(name)

    client.close()

    print(f"\n{'='*55}")
    print(f"  ✅  GNN-ready (SMILES written): {len(updated_gnn)}")
    for n in updated_gnn:
        print(f"        {n}")
    print(f"\n  ⚠️   Antibody/peptide (no SMILES, hash fallback): {len(updated_null)}")
    for n in updated_null:
        print(f"        {n}")
    if not_found:
        print(f"\n  ❓  Not in dictionary (hash fallback): {len(not_found)}")
        for n in not_found:
            print(f"        {n}  ← add to SMILES_DB manually if needed")
    print(f"\n  Restart the backend to pick up changes.")
    print(f"{'='*55}\n")


if __name__ == "__main__":
    asyncio.run(inject())