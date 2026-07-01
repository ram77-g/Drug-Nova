import os
import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from torch_geometric.data import Data, Batch
from torch_geometric.nn import GATConv, global_mean_pool
from rdkit import Chem

from models.schemas import Drug, DiseaseInfo, Gene, Protein

# ==============================================================================
# GNN MODEL ARCHITECTURE BLUEPRINT
# ==============================================================================
class DrugGATEncoder(nn.Module):
    def __init__(self, in_channels, hidden_channels=64, out_channels=128, heads=4, num_layers=3, dropout=0.2):
        super().__init__()
        self.dropout = dropout
        self.convs = nn.ModuleList()
        self.convs.append(GATConv(in_channels, hidden_channels, heads=heads, dropout=dropout))
        for _ in range(num_layers - 2):
            self.convs.append(GATConv(hidden_channels * heads, hidden_channels, heads=heads, dropout=dropout))
        self.convs.append(GATConv(hidden_channels * heads, out_channels, heads=heads, concat=False, dropout=dropout))

    def forward(self, x, edge_index, batch):
        for conv in self.convs[:-1]:
            x = F.elu(conv(x, edge_index))
            x = F.dropout(x, p=self.dropout, training=self.training)
        x = self.convs[-1](x, edge_index)
        return global_mean_pool(F.elu(x), batch)

class ProteinCNNEncoder(nn.Module):
    def __init__(self, vocab_size=21, embed_dim=128, num_filters=128, kernel_sizes=(3, 5, 7), out_channels=128, dropout=0.2):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=0)
        self.convs = nn.ModuleList([nn.Conv1d(embed_dim, num_filters, kernel_size=k, padding=k // 2) for k in kernel_sizes])
        self.dropout = nn.Dropout(dropout)
        self.proj = nn.Linear(num_filters * len(kernel_sizes), out_channels)

    def forward(self, protein_ids):
        x = self.embedding(protein_ids).transpose(1, 2)
        pooled = [torch.max(F.relu(conv(x)), dim=2).values for conv in self.convs]
        return F.relu(self.proj(self.dropout(torch.cat(pooled, dim=1))))

# NOTE: atom_feature_dim default corrected to 41 to match
# MolecularGraphFeaturizer.extract_atom_features() output size:
#   14 atoms(+1) + 6 degrees(+1) + 5 charges(+1) + 5 hybridizations(+1) + 1 aromatic + 5 Hs(+1) = 41
# This default is only a fallback — load_global_gnn_weights() always overrides it
# from the checkpoint, so a real training run never depends on this number.
class DrugTargetAffinityModel(nn.Module):
    def __init__(self, atom_feature_dim=41, drug_embed_dim=128, protein_embed_dim=128, fc_hidden=256, dropout=0.3):
        super().__init__()
        self.drug_encoder = DrugGATEncoder(in_channels=atom_feature_dim, out_channels=drug_embed_dim)
        self.protein_encoder = ProteinCNNEncoder(out_channels=protein_embed_dim)
        self.regressor = nn.Sequential(
            nn.Linear(drug_embed_dim + protein_embed_dim, fc_hidden),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(fc_hidden, fc_hidden // 2),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(fc_hidden // 2, 1)
        )

    def forward(self, data):
        drug_emb = self.drug_encoder(data.x, data.edge_index, data.batch)
        protein_emb = self.protein_encoder(data.protein)
        return self.regressor(torch.cat([drug_emb, protein_emb], dim=1)).squeeze(-1)

# ==============================================================================
# ON-THE-FLY BIOMEDICAL FEATURIZERS
# ==============================================================================
class MolecularGraphFeaturizer:
    def __init__(self):
        self.allowed_atoms = ['C', 'N', 'O', 'S', 'F', 'Cl', 'Br', 'I', 'P', 'B', 'Si', 'Se', 'H', 'UNK']
        self.hybridizations = [Chem.rdchem.HybridizationType.SP, Chem.rdchem.HybridizationType.SP2,
                               Chem.rdchem.HybridizationType.SP3, Chem.rdchem.HybridizationType.SP3D,
                               Chem.rdchem.HybridizationType.SP3D2]

    def one_hot(self, value, choices):
        vec = [0] * (len(choices) + 1)
        idx = choices.index(value) if value in choices else len(choices)
        vec[idx] = 1
        return vec

    def extract_atom_features(self, atom):
        feats = []
        feats += self.one_hot(atom.GetSymbol(), self.allowed_atoms)
        feats += self.one_hot(atom.GetDegree(), [0, 1, 2, 3, 4, 5])
        feats += self.one_hot(atom.GetFormalCharge(), [-2, -1, 0, 1, 2])
        feats += self.one_hot(atom.GetHybridization(), self.hybridizations)
        feats += [int(atom.GetIsAromatic())]
        feats += self.one_hot(atom.GetTotalNumHs(), [0, 1, 2, 3, 4])
        return feats

    def to_graph(self, smiles: str) -> Optional[Data]:
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            return None
        x = torch.tensor([self.extract_atom_features(a) for a in mol.GetAtoms()], dtype=torch.float)
        edge_index = []
        for bond in mol.GetBonds():
            i, j = bond.GetBeginAtomIdx(), bond.GetEndAtomIdx()
            edge_index += [[i, j], [j, i]]
        if len(edge_index) == 0:
            edge_index = [[0, 0]]
        edge_index = torch.tensor(edge_index, dtype=torch.long).t().contiguous()
        return Data(x=x, edge_index=edge_index)

class SequenceFeaturizer:
    def __init__(self, max_len=1000):
        self.max_len = max_len
        self.vocab = {aa: i + 1 for i, aa in enumerate("ACDEFGHIKLMNPQRSTVWY")}

    def encode(self, seq: str) -> torch.Tensor:
        idxs = [self.vocab.get(aa, 0) for aa in seq[:self.max_len]]
        if len(idxs) < self.max_len:
            idxs += [0] * (self.max_len - len(idxs))
        return torch.tensor(idxs, dtype=torch.long)

mol_featurizer = MolecularGraphFeaturizer()
seq_featurizer = SequenceFeaturizer()

DEFAULT_FALLBACK_SEQUENCE = (
    "MKTAYIAKQRQISFVKSHFSRQLEERLGLIEVQAPILSRVGDGTQDNLSGAEKAVQVKVKALPDAQFEVVHSLAKWKRQTLGQHDFSAGEGLYTHMKALRPDEDRLSPLHSVYVDQWDWELVMGDGDRQFSTLKSTVEAIWAGIKATEAAVSEEFGLAPFLPDQIHFVHSQELLSRYPDLDAKGRERAIAKDLGAVFLVGIGGKLSDGHRHDVRAPDYDDWSTPSELGHAGLNGDILVWNPVLEDAFELSSMGIRVDADTLKHQLALTGDEDRLELEWHQALLRGEMPQTIGGGIGQSRLTMLLLQLPHIGQVQAGVWPAAVRESVPSLL"
)

# ==============================================================================
# SCHEMAS & PREDICTION CORE
# ==============================================================================
class FeatureContribution(BaseModel):
    feature: str
    contribution: str
    score_value: float

class PredictionResult(BaseModel):
    drug_id: str
    drug_name: str
    generic_name: str
    repurposing_score: float
    protein_compatibility: float
    toxicity_risk_score: float
    toxicity_risk_label: str
    confidence_score: float
    recommendation_score: float
    is_primary_treatment: bool
    contributing_factors: List[FeatureContribution]
    target_proteins: List[str]

_gnn_model_instance = None
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

def load_global_gnn_weights(weights_path: str = "weights/drugnova_gat_affinity_model.pt"):
    """Loads weights from your Colab training package cleanly into memory."""
    global _gnn_model_instance
    if not os.path.exists(weights_path):
        print(f"⚠️ Model weights file not found at {weights_path}. Running with fallback simulation loop.")
        return
    try:
        checkpoint = torch.load(weights_path, map_location=DEVICE)
        _gnn_model_instance = DrugTargetAffinityModel(
            atom_feature_dim=checkpoint["atom_feature_dim"],
            drug_embed_dim=checkpoint["config"]["drug_embed_dim"],
            protein_embed_dim=checkpoint["config"]["protein_embed_dim"]
        ).to(DEVICE)
        _gnn_model_instance.load_state_dict(checkpoint["model_state_dict"])
        _gnn_model_instance.eval()
        print(f"🚀 GNN Engine safely initialized with weights from {weights_path}.")
    except Exception as e:
        print(f"❌ Critical error loading GNN state vectors: {e}")


def _resolve_target_sequence(drug: Drug, proteins: List[Protein]) -> str:
    """
    Pick the amino-acid sequence for THIS drug's own target, instead of
    reusing one global sequence for every drug in the candidate list.

    Resolution order:
      1. If the drug object itself carries a `sequence` (some schemas attach
         it directly), use that.
      2. Otherwise, match drug.target_proteins against the disease's protein
         list (by name) and use the first match's sequence.
      3. Otherwise, fall back to a placeholder sequence — but the caller is
         told this was a fallback so it can down-weight the score if desired.
    """
    direct_seq = getattr(drug, 'sequence', None)
    if direct_seq:
        return direct_seq

    drug_targets_lower = {t.lower() for t in getattr(drug, 'target_proteins', [])}
    for p in proteins:
        if p.name.lower() in drug_targets_lower:
            seq = getattr(p, 'sequence', None)
            if seq:
                return seq

    return DEFAULT_FALLBACK_SEQUENCE


def calculate_predictions(disease: DiseaseInfo, genes: List[Gene], proteins: List[Protein], drugs: List[Drug]) -> List[PredictionResult]:
    predictions = []
    disease_proteins = {p.name.lower() for p in proteins}
    disease_name_lower = disease.name.lower()

    # --- Build one graph + ITS OWN target-protein tensor per drug ---
    valid_drugs = []
    graph_list = []
    used_fallback_sequence = []  # track which entries used the generic fallback

    for d in drugs:
        smiles = getattr(d, 'smiles', 'CC(=O)OC1=CC=CC=C1C(=O)O')
        graph = mol_featurizer.to_graph(smiles)
        if graph is None:
            continue

        target_sequence = _resolve_target_sequence(d, proteins)
        is_fallback = (target_sequence == DEFAULT_FALLBACK_SEQUENCE) and not getattr(d, 'sequence', None)

        protein_tensor = seq_featurizer.encode(target_sequence).unsqueeze(0).to(DEVICE)
        graph.protein = protein_tensor

        graph_list.append(graph)
        valid_drugs.append(d)
        used_fallback_sequence.append(is_fallback)

    # --- Batch Execution Pipeline via loaded GNN weights ---
    gnn_outputs = {}
    gnn_used_fallback = {}
    if _gnn_model_instance is not None and graph_list:
        with torch.no_grad():
            batched_graphs = Batch.from_data_list(graph_list).to(DEVICE)
            model_predictions = _gnn_model_instance(batched_graphs)
            if model_predictions.dim() == 0:
                model_predictions = model_predictions.unsqueeze(0)
            preds_array = model_predictions.cpu().numpy()

            # NOTE: this 0.5 / 6.0 sigmoid calibration is a placeholder squashing
            # function, not something derived from validation data. Before
            # trusting these as calibrated probabilities, check them against
            # the actual pKd distribution from your test set (the notebook's
            # scatter plot) and recalibrate slope/midpoint if needed.
            normalized_scores = 1 / (1 + np.exp(-0.5 * (preds_array - 6.0)))

            for drug_obj, raw_pred, is_fallback in zip(valid_drugs, normalized_scores, used_fallback_sequence):
                gnn_outputs[drug_obj.id] = float(raw_pred)
                gnn_used_fallback[drug_obj.id] = is_fallback

    # --- Analytical Scoring Loop ---
    for drug in drugs:
        status = drug.approval_status.lower()
        indication = drug.original_indication.lower()
        is_primary_treatment = False
        clinical_evidence = 0.40

        if "approved" in status:
            if disease_name_lower in indication or indication in disease_name_lower:
                clinical_evidence = 1.0
                is_primary_treatment = True
            else:
                clinical_evidence = 0.60
        elif "investigational" in status or "experimental" in status:
            clinical_evidence = 0.20

        drug_targets = {t.lower() for t in drug.target_proteins}
        overlap = disease_proteins.intersection(drug_targets)
        shared_proteins_raw = min(len(overlap) / 2.0, 1.0)
        if is_primary_treatment or drug.confidence_score > 0.90:
            shared_proteins_raw = max(shared_proteins_raw, 0.90)

        binding_affinity = gnn_outputs.get(drug.id, 0.50)
        # If this score came from a generic fallback sequence (no real target
        # match found), don't let it inflate binding_pocket confidently.
        used_fallback = gnn_used_fallback.get(drug.id, True)
        binding_pocket = min(binding_affinity + (0.05 if not used_fallback else 0.0), 0.99)

        toxicity_inv = 0.75 if "approved" in status else 0.45
        kg_proximity = 0.85 if is_primary_treatment else (0.65 if shared_proteins_raw > 0 else 0.25)

        weights = {
            "Clinical Evidence": {"val": clinical_evidence, "weight": 0.30},
            "Binding Pocket Compatibility": {"val": binding_pocket, "weight": 0.15},
            "Binding Affinity": {"val": binding_affinity, "weight": 0.15},
            "Target Overlap": {"val": shared_proteins_raw, "weight": 0.10},
            "Toxicity Safety": {"val": toxicity_inv, "weight": 0.20},
            "Systemic Relevance": {"val": kg_proximity, "weight": 0.10},
        }

        final_score = sum(data["val"] * data["weight"] for data in weights.values())
        protein_compat = (binding_pocket + binding_affinity + shared_proteins_raw) / 3.0
        tox_risk_score = 1.0 - toxicity_inv
        tox_label = "Low" if tox_risk_score < 0.25 else ("Medium" if tox_risk_score < 0.55 else "High")

        base_confidence = (clinical_evidence + drug.confidence_score) / 2.0
        confidence_score = base_confidence if is_primary_treatment else (base_confidence * 0.75 if shared_proteins_raw > 0 else base_confidence * 0.40)

        factors = []
        for feature_name, data in weights.items():
            # Guard against division by zero if all weighted values happen to be 0.
            contribution_pct = ((data["val"] * data["weight"]) / final_score) * 100 if final_score > 0 else 0.0
            factors.append(FeatureContribution(feature=feature_name, contribution=f"+{contribution_pct:.1f}%", score_value=data["val"]))
        factors.sort(key=lambda x: float(x.contribution.replace("+", "").replace("%", "")), reverse=True)

        predictions.append(PredictionResult(
            drug_id=drug.id, drug_name=drug.name, generic_name=drug.generic_name,
            repurposing_score=round(final_score, 3), protein_compatibility=round(protein_compat, 3),
            toxicity_risk_score=round(tox_risk_score, 3), toxicity_risk_label=tox_label,
            confidence_score=round(confidence_score, 3), recommendation_score=round((final_score + confidence_score) / 2.0, 3),
            is_primary_treatment=is_primary_treatment, contributing_factors=factors, target_proteins=drug.target_proteins
        ))

    predictions.sort(key=lambda x: x.repurposing_score, reverse=True)
    return predictions