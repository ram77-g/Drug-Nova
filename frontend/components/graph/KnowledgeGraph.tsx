"use client";

import { useEffect, useState, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  BackgroundVariant,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import type { KnowledgeGraphResponse, GraphNode } from "@/types";
import { nodeTypeColor } from "@/lib/utils";
import { getKnowledgeGraph } from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { NodeDetailSidebar } from "@/components/graph/NodeDetailSidebar";

// Custom node colors and layout config by type
const NODE_CONFIG: Record<string, { bg: string; border: string; glow: string; size: number }> = {
  disease: { bg: "#1a0a0a", border: "#ef4444", glow: "rgba(239,68,68,0.4)", size: 60 },
  gene: { bg: "#0a1a0a", border: "#22c55e", glow: "rgba(34,197,94,0.4)", size: 40 },
  protein: { bg: "#0a1a1a", border: "#00d4ff", glow: "rgba(0,212,255,0.4)", size: 45 },
  drug: { bg: "#110a1a", border: "#a855f7", glow: "rgba(168,85,247,0.4)", size: 50 },
};

function buildFlowNodes(graphNodes: GraphNode[]): Node[] {
  const typeGroups: Record<string, GraphNode[]> = {
    disease: [], gene: [], protein: [], drug: [],
  };
  graphNodes.forEach((n) => {
    const t = n.type || "gene";
    if (typeGroups[t]) typeGroups[t].push(n);
    else typeGroups["gene"].push(n);
  });

  const nodes: Node[] = [];
  const cx = 500, cy = 400;

  // Disease — center
  typeGroups.disease.forEach((n) => {
    nodes.push({
      id: n.id,
      data: { label: n.label, type: "disease", ...n.data },
      position: { x: cx, y: cy },
      style: nodeStyle("disease", n.label),
    });
  });

  // Genes — semicircle top
  typeGroups.gene.forEach((n, i) => {
    const angle = (Math.PI / (typeGroups.gene.length + 1)) * (i + 1);
    nodes.push({
      id: n.id,
      data: { label: n.label, type: "gene", ...n.data },
      position: { x: cx + Math.cos(angle) * 250 - 125, y: cy - Math.sin(angle) * 200 },
      style: nodeStyle("gene", n.label),
    });
  });

  // Proteins — semicircle left/right
  typeGroups.protein.forEach((n, i) => {
    const angle = -(Math.PI * 0.5) + (Math.PI / (typeGroups.protein.length + 1)) * (i + 1);
    nodes.push({
      id: n.id,
      data: { label: n.label, type: "protein", ...n.data },
      position: { x: cx + Math.cos(angle) * 320, y: cy + Math.sin(angle) * 200 },
      style: nodeStyle("protein", n.label),
    });
  });

  // Drugs — semicircle bottom
  typeGroups.drug.forEach((n, i) => {
    const angle = Math.PI + (Math.PI / (typeGroups.drug.length + 1)) * (i + 1);
    nodes.push({
      id: n.id,
      data: { label: n.label, type: "drug", ...n.data },
      position: { x: cx + Math.cos(angle) * 300, y: cy + Math.sin(angle) * 250 },
      style: nodeStyle("drug", n.label),
    });
  });

  return nodes;
}

function nodeStyle(type: string, label: string) {
  const cfg = NODE_CONFIG[type] || NODE_CONFIG.gene;
  return {
    background: cfg.bg,
    border: `1.5px solid ${cfg.border}`,
    borderRadius: type === "disease" ? "12px" : "8px",
    color: cfg.border,
    fontSize: type === "disease" ? "12px" : "10px",
    fontWeight: type === "disease" ? "700" : "500",
    fontFamily: "Inter, sans-serif",
    padding: "8px 12px",
    minWidth: `${cfg.size}px`,
    boxShadow: `0 0 12px ${cfg.glow}`,
    maxWidth: "120px",
    textAlign: "center" as const,
    cursor: "pointer",
  };
}

function buildFlowEdges(graphEdges: { id: string; source: string; target: string; label: string; weight: number }[]): Edge[] {
  return graphEdges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    animated: true,
    style: {
      stroke: `rgba(0,212,255,${0.2 + e.weight * 0.3})`,
      strokeWidth: 1.5,
    },
    labelStyle: { fill: "#4b5a78", fontSize: 9 },
    labelBgStyle: { fill: "#050810", fillOpacity: 0.8 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#1e2d4a", width: 12, height: 12 },
  }));
}

interface KnowledgeGraphProps {
  diseaseName: string;
}

// Legend items
const LEGEND = [
  { type: "disease", label: "Disease" },
  { type: "gene", label: "Gene" },
  { type: "protein", label: "Protein" },
  { type: "drug", label: "Drug" },
];

export function KnowledgeGraph({ diseaseName }: KnowledgeGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<KnowledgeGraphResponse | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  useEffect(() => {
    if (!diseaseName) return;
    setLoading(true);
    setError(null);
    getKnowledgeGraph(diseaseName)
      .then((data) => {
        setGraphData(data);
        setNodes(buildFlowNodes(data.nodes));
        setEdges(buildFlowEdges(data.edges));
      })
      .catch(() => setError("Failed to load knowledge graph."))
      .finally(() => setLoading(false));
  }, [diseaseName, setNodes, setEdges]);

  if (loading) return <LoadingSpinner message="Building knowledge graph..." />;
  if (error) return <p className="text-red-400 text-sm text-center py-8">{error}</p>;

  return (
    <div className="relative w-full h-[500px] rounded-xl overflow-hidden border border-[#1e2d4a]/60 bg-[#050810]">
      {/* Stats bar */}
      {graphData && (
        <div className="absolute top-3 left-3 z-10 flex gap-2 flex-wrap">
          {LEGEND.map((l) => {
            const count = graphData.nodes.filter((n) => n.type === l.type).length;
            if (count === 0) return null;
            return (
              <div
                key={l.type}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono"
                style={{
                  background: NODE_CONFIG[l.type]?.bg,
                  border: `1px solid ${nodeTypeColor(l.type)}33`,
                  color: nodeTypeColor(l.type),
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: nodeTypeColor(l.type) }}
                />
                {count} {l.label}
              </div>
            );
          })}
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => {
          const originalData = graphData?.nodes.find((n) => n.id === node.id);
          if (originalData) setSelectedNode(originalData);
        }}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        attributionPosition="bottom-right"
        style={{ height: 480, background: "transparent" }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="rgba(0,212,255,0.08)"
          gap={24}
          size={1}
        />
        <Controls
          style={{
            background: "#0d1425",
            border: "1px solid #1e2d4a",
            borderRadius: "8px",
          }}
        />
        <MiniMap
          nodeColor={(n) => nodeTypeColor((n.data as { type?: string })?.type || "gene")}
          style={{
            background: "#080d1a",
            border: "1px solid #1e2d4a",
            borderRadius: "8px",
          }}
          maskColor="rgba(5,8,16,0.8)"
        />
      </ReactFlow>

      {/* Node Detail Sidebar */}
      <NodeDetailSidebar
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  );
}
