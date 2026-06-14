import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.mock_data import DISEASE_CATALOG, GENES_BY_DISEASE, PROTEINS_BY_DISEASE, DRUGS_BY_DISEASE
from protein_structures_data import PROTEIN_STRUCTURES

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("MONGO_DB_NAME", "drug_nova")

async def seed_db():
    print(f"Connecting to MongoDB Atlas at {DB_NAME}...")
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]

    print("Clearing existing collections...")
    await db.diseases.drop()
    await db.genes.drop()
    await db.proteins.drop()
    await db.drugs.drop()
    await db.protein_structures.drop()

    # 1. Insert Diseases
    print("Inserting Diseases...")
    disease_docs = []
    for key, disease in DISEASE_CATALOG.items():
        doc = disease.model_dump()
        doc["key"] = key  # store the internal search key
        disease_docs.append(doc)
    if disease_docs:
        await db.diseases.insert_many(disease_docs)

    # 2. Insert Genes
    print("Inserting Genes...")
    gene_docs = []
    for disease_key, genes in GENES_BY_DISEASE.items():
        for g in genes:
            doc = g.model_dump()
            doc["disease_key"] = disease_key
            gene_docs.append(doc)
    if gene_docs:
        await db.genes.insert_many(gene_docs)

    # 3. Insert Proteins (Basic metadata linked to disease)
    print("Inserting Proteins...")
    protein_docs = []
    for disease_key, proteins in PROTEINS_BY_DISEASE.items():
        for p in proteins:
            doc = p.model_dump()
            doc["disease_key"] = disease_key
            protein_docs.append(doc)
    if protein_docs:
        await db.proteins.insert_many(protein_docs)

    # 4. Insert Drugs
    print("Inserting Drugs...")
    drug_docs = []
    for disease_key, drugs in DRUGS_BY_DISEASE.items():
        for d in drugs:
            doc = d.model_dump()
            doc["disease_key"] = disease_key
            drug_docs.append(doc)
    if drug_docs:
        await db.drugs.insert_many(drug_docs)

    # 5. Insert Protein Structures (Rich metadata)
    print("Inserting Protein Structures...")
    structure_docs = []
    for key, struct in PROTEIN_STRUCTURES.items():
        structure_docs.append(struct.model_dump())
    if structure_docs:
        await db.protein_structures.insert_many(structure_docs)

    # Create Text Indexes for powerful search
    print("Creating text indexes...")
    await db.diseases.create_index([("name", "text"), ("description", "text")])
    await db.genes.create_index([("symbol", "text"), ("name", "text")])
    await db.proteins.create_index([("name", "text"), ("function", "text")])
    await db.protein_structures.create_index([("protein_name", "text"), ("description", "text"), ("uniprot_id", "text")])
    await db.drugs.create_index([("name", "text"), ("generic_name", "text"), ("mechanism", "text")])

    print("Database seeding completed successfully!")

if __name__ == "__main__":
    asyncio.run(seed_db())
