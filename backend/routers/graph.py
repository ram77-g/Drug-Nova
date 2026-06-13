"""
Knowledge Graph router — generates nodes and edges for visualization from MongoDB.
"""
from fastapi import APIRouter, HTTPException, Query
from models.schemas import KnowledgeGraphResponse, GraphNode, GraphEdge
from db.mongodb import get_db

router = APIRouter()

@router.get("/", response_model=KnowledgeGraphResponse)
async def get_graph(disease: str = Query(..., description="Disease name")):
    """Build knowledge graph data for disease → gene → protein → drug relationships from MongoDB."""
    db = get_db()
    disease_lower = disease.lower().strip()
    
    disease_doc = await db.diseases.find_one({"$text": {"$search": disease_lower}})
    if not disease_doc:
        disease_doc = await db.diseases.find_one({"name": {"$regex": disease_lower, "$options": "i"}})
    if not disease_doc:
        disease_doc = await db.diseases.find_one({"key": {"$regex": disease_lower, "$options": "i"}})
        
    if not disease_doc:
        raise HTTPException(status_code=404, detail=f"Disease '{disease}' not found")
        
    key = disease_doc["key"]
    
    # Fetch related entities
    genes = await db.genes.find({"disease_key": key}).to_list(100)
    proteins = await db.proteins.find({"disease_key": key}).to_list(100)
    drugs = await db.drugs.find({"disease_key": key}).to_list(100)
    
    nodes: list[GraphNode] = []
    edges: list[GraphEdge] = []

    # Disease node
    disease_node_id = f"disease_{key}"
    nodes.append(
        GraphNode(
            id=disease_node_id,
            label=disease_doc.get("name", key),
            type="disease",
            data={"icd": disease_doc.get("icd_code", ""), "description": disease_doc.get("description", "")[:120]},
        )
    )

    # Gene nodes + edges to disease
    for gene in genes:
        gid = f"gene_{gene.get('symbol')}"
        nodes.append(
            GraphNode(
                id=gid,
                label=gene.get("symbol", ""),
                type="gene",
                data={"name": gene.get("name", ""), "chromosome": gene.get("chromosome", ""), "score": gene.get("relevance_score", 0)},
            )
        )
        edges.append(
            GraphEdge(
                id=f"e_{disease_node_id}_{gid}",
                source=disease_node_id,
                target=gid,
                label="associated_with",
                weight=gene.get("relevance_score", 0),
            )
        )

    # Protein nodes + edges to related genes
    for i, protein in enumerate(proteins):
        pid = f"protein_{protein.get('uniprot_id')}"
        name = protein.get("name", "Unknown").split("/")[0].strip()
        nodes.append(
            GraphNode(
                id=pid,
                label=name,
                type="protein",
                data={"uniprot_id": protein.get("uniprot_id", ""), "function": protein.get("function", "")[:100]},
            )
        )
        # Link protein to first gene (simplified association)
        if genes:
            linked_gene_id = f"gene_{genes[min(i, len(genes)-1)].get('symbol')}"
            edges.append(
                GraphEdge(
                    id=f"e_{linked_gene_id}_{pid}",
                    source=linked_gene_id,
                    target=pid,
                    label="encodes",
                    weight=0.9,
                )
            )

    # Drug nodes + edges to target proteins
    for drug in drugs:
        did = f"drug_{drug.get('id')}"
        nodes.append(
            GraphNode(
                id=did,
                label=drug.get("name", ""),
                type="drug",
                data={
                    "confidence": drug.get("confidence_score", 0),
                    "mechanism": drug.get("mechanism", "")[:100],
                    "approval": drug.get("approval_status", ""),
                },
            )
        )
        # Edge from drug to first matched protein
        target_proteins = drug.get("target_proteins", [])
        for protein in proteins:
            p_name = protein.get("name", "").lower()
            if any(t.lower() in p_name for t in target_proteins):
                edges.append(
                    GraphEdge(
                        id=f"e_{did}_protein_{protein.get('uniprot_id')}",
                        source=did,
                        target=f"protein_{protein.get('uniprot_id')}",
                        label="targets",
                        weight=drug.get("confidence_score", 0),
                    )
                )
                break  # one primary edge per drug for clarity

    return KnowledgeGraphResponse(nodes=nodes, edges=edges)
