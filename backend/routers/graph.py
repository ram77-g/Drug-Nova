"""
Knowledge Graph router — generates nodes and edges for visualization.
"""
from fastapi import APIRouter, HTTPException, Query
from models.schemas import KnowledgeGraphResponse, GraphNode, GraphEdge
from services.mock_data import search_disease, get_disease_data

router = APIRouter()


@router.get("/", response_model=KnowledgeGraphResponse)
async def get_graph(disease: str = Query(..., description="Disease name")):
    """Build knowledge graph data for disease → gene → protein → drug relationships."""
    key = search_disease(disease)
    if not key:
        raise HTTPException(status_code=404, detail=f"Disease '{disease}' not found")

    disease_obj, genes, proteins, drugs = get_disease_data(key)
    nodes: list[GraphNode] = []
    edges: list[GraphEdge] = []

    # Disease node
    disease_node_id = f"disease_{key}"
    nodes.append(
        GraphNode(
            id=disease_node_id,
            label=disease_obj.name,
            type="disease",
            data={"icd": disease_obj.icd_code, "description": disease_obj.description[:120]},
        )
    )

    # Gene nodes + edges to disease
    for gene in genes:
        gid = f"gene_{gene.symbol}"
        nodes.append(
            GraphNode(
                id=gid,
                label=gene.symbol,
                type="gene",
                data={"name": gene.name, "chromosome": gene.chromosome, "score": gene.relevance_score},
            )
        )
        edges.append(
            GraphEdge(
                id=f"e_{disease_node_id}_{gid}",
                source=disease_node_id,
                target=gid,
                label="associated_with",
                weight=gene.relevance_score,
            )
        )

    # Protein nodes + edges to related genes
    for i, protein in enumerate(proteins):
        pid = f"protein_{protein.uniprot_id}"
        nodes.append(
            GraphNode(
                id=pid,
                label=protein.name.split("/")[0].strip(),
                type="protein",
                data={"uniprot_id": protein.uniprot_id, "function": protein.function[:100]},
            )
        )
        # Link protein to first gene (simplified association)
        if genes:
            linked_gene_id = f"gene_{genes[min(i, len(genes)-1)].symbol}"
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
        did = f"drug_{drug.id}"
        nodes.append(
            GraphNode(
                id=did,
                label=drug.name,
                type="drug",
                data={
                    "confidence": drug.confidence_score,
                    "mechanism": drug.mechanism[:100],
                    "approval": drug.approval_status,
                },
            )
        )
        # Edge from drug to first matched protein
        for protein in proteins:
            if any(p.lower() in protein.name.lower() for p in drug.target_proteins):
                edges.append(
                    GraphEdge(
                        id=f"e_{did}_protein_{protein.uniprot_id}",
                        source=did,
                        target=f"protein_{protein.uniprot_id}",
                        label="targets",
                        weight=drug.confidence_score,
                    )
                )
                break  # one primary edge per drug for clarity

    return KnowledgeGraphResponse(nodes=nodes, edges=edges)
