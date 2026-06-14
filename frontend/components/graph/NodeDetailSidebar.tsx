import { motion, AnimatePresence } from "framer-motion";
import type { GraphNode } from "@/types";
import { nodeTypeColor } from "@/lib/utils";

interface NodeDetailSidebarProps {
  node: GraphNode | null;
  onClose: () => void;
}

export function NodeDetailSidebar({ node, onClose }: NodeDetailSidebarProps) {
  return (
    <AnimatePresence>
      {node && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width: "320px",
            background: "rgba(10, 15, 28, 0.95)",
            backdropFilter: "blur(12px)",
            borderLeft: "1px solid rgba(30,45,74,0.6)",
            zIndex: 50,
            display: "flex",
            flexDirection: "column",
            boxShadow: "-8px 0 32px rgba(0,0,0,0.5)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid rgba(30,45,74,0.4)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontFamily: "monospace",
                  textTransform: "uppercase",
                  color: nodeTypeColor(node.type),
                  marginBottom: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: nodeTypeColor(node.type),
                    boxShadow: `0 0 8px ${nodeTypeColor(node.type)}80`,
                  }}
                />
                {node.type} Node
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#ffffff", lineHeight: 1.3 }}>
                {node.label}
              </h3>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                color: "#6b7fa3",
                cursor: "pointer",
                padding: "4px",
                fontSize: 20,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: "24px", flex: 1, overflowY: "auto" }}>
            {/* Render data dynamically based on type */}
            {node.type === "disease" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <DetailRow label="ICD Code" value={node.data.icd as string} />
                <DetailRow label="Description" value={node.data.description as string} />
              </div>
            )}

            {node.type === "gene" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <DetailRow label="Full Name" value={node.data.name as string} />
                <DetailRow label="Chromosome" value={node.data.chromosome as string} />
                <DetailRow label="Relevance Score" value={String(node.data.score)} />
              </div>
            )}

            {node.type === "protein" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <DetailRow label="UniProt ID" value={node.data.uniprot_id as string} />
                <DetailRow label="Function" value={node.data.function as string} />
              </div>
            )}

            {node.type === "drug" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <DetailRow label="Approval Status" value={node.data.approval as string} />
                <DetailRow label="Confidence Score" value={String(node.data.confidence)} />
                <DetailRow label="Mechanism" value={node.data.mechanism as string} />
              </div>
            )}

            {(!node.data || Object.keys(node.data).length === 0) && (
              <p style={{ color: "#4b5a78", fontSize: 13, fontStyle: "italic" }}>
                No additional data available.
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DetailRow({ label, value }: { label: string; value: string | undefined }) {
  if (!value) return null;
  return (
    <div>
      <div style={{ fontSize: 11, color: "#6b7fa3", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, color: "#c8d6f0", lineHeight: 1.5 }}>
        {value}
      </div>
    </div>
  );
}
