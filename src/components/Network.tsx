"use client";

import { useMemo, useState } from "react";
import type { SimulationLinkDatum, SimulationNodeDatum } from "d3-force";
import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation } from "d3-force";
import { canonicalKey } from "@/lib/csv";
import type { DatasetRow } from "@/store/useStore";

interface GraphNode extends SimulationNodeDatum {
  id: string;
  label: string;
  system: DatasetRow["system"];
  category: DatasetRow["category"];
  subcategory: string;
  totalWeight: number;
  hasUnknown: boolean;
  conflict: boolean;
  merged: boolean;
}

interface GraphLink extends SimulationLinkDatum<GraphNode> {
  id: string;
  source: GraphNode["id"] | GraphNode;
  target: GraphNode["id"] | GraphNode;
  type: "overlap" | "conflict";
  weight: number;
}

interface NetworkProps {
  rows: DatasetRow[];
}

const nodeColour = (index: number) =>
  `color-mix(in srgb, hsl(var(--colour-accent)) ${60 + (index % 6) * 6}%, hsl(var(--colour-muted)) 30%)`;

const groupRows = (rows: DatasetRow[]) => {
  const nodeMap = new Map<string, GraphNode>();
  const nodeRows = new Map<string, DatasetRow[]>();

  rows.forEach((row) => {
    const key = `${row.system}|${row.category}|${row.subcategory || "—"}`;
    const existing = nodeMap.get(key);
    const weight = row.weight_system * Math.abs(row.strength) * row.confidence;
    if (!existing) {
      const node: GraphNode = {
        id: key,
        label: `${row.system} · ${row.category}${row.subcategory ? ` · ${row.subcategory}` : ""}`,
        system: row.system,
        category: row.category,
        subcategory: row.subcategory ?? "",
        totalWeight: weight,
        hasUnknown: row.verbatim_text === "UNKNOWN" || row.notes.includes("UNKNOWN"),
        conflict: Boolean(row.conflict_set),
        merged: (row.merged_from?.length ?? 0) > 0,
        fx: undefined,
        fy: undefined,
        x: undefined,
        y: undefined,
      };
      nodeMap.set(key, node);
      nodeRows.set(key, [row]);
    } else {
      existing.totalWeight += weight;
      existing.hasUnknown =
        existing.hasUnknown || row.verbatim_text === "UNKNOWN" || row.notes.includes("UNKNOWN");
      existing.conflict = existing.conflict || Boolean(row.conflict_set);
      existing.merged = existing.merged || (row.merged_from?.length ?? 0) > 0;
      nodeRows.get(key)?.push(row);
    }
  });

  const nodes = Array.from(nodeMap.values());
  const rowsByNode = nodeRows;

  const overlapLinks: GraphLink[] = [];
  const canonicalGroups = new Map<string, Set<string>>();
  rows.forEach((row) => {
    const canonical = canonicalKey(row.data_point);
    const nodeKey = `${row.system}|${row.category}|${row.subcategory || "—"}`;
    if (!canonicalGroups.has(canonical)) {
      canonicalGroups.set(canonical, new Set());
    }
    canonicalGroups.get(canonical)!.add(nodeKey);
  });
  canonicalGroups.forEach((group, canonical) => {
    const ids = Array.from(group.values());
    for (let i = 0; i < ids.length; i += 1) {
      for (let j = i + 1; j < ids.length; j += 1) {
        overlapLinks.push({
          id: `overlap-${canonical}-${ids[i]}-${ids[j]}`,
          source: ids[i],
          target: ids[j],
          type: "overlap",
          weight: 1,
        });
      }
    }
  });

  const conflictLinks: GraphLink[] = [];
  const conflictGroups = new Map<string, Set<string>>();
  rows
    .filter((row) => row.conflict_set)
    .forEach((row) => {
      const setId = row.conflict_set!;
      const nodeKey = `${row.system}|${row.category}|${row.subcategory || "—"}`;
      if (!conflictGroups.has(setId)) {
        conflictGroups.set(setId, new Set());
      }
      conflictGroups.get(setId)!.add(nodeKey);
    });
  conflictGroups.forEach((group, conflictId) => {
    const ids = Array.from(group.values());
    for (let i = 0; i < ids.length; i += 1) {
      for (let j = i + 1; j < ids.length; j += 1) {
        conflictLinks.push({
          id: `conflict-${conflictId}-${ids[i]}-${ids[j]}`,
          source: ids[i],
          target: ids[j],
          type: "conflict",
          weight: 2,
        });
      }
    }
  });

  return {
    nodes,
    links: [...overlapLinks, ...conflictLinks],
    rowsByNode,
  };
};

export const Network = ({ rows }: NetworkProps) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [showMerged, setShowMerged] = useState(false);

  const { nodes, links: preparedLinks, rowsByNode } = useMemo(() => groupRows(rows), [rows]);

  const { positions, links } = useMemo(() => {
    const simulation = forceSimulation<GraphNode>(nodes)
      .force(
        "link",
        forceLink<GraphNode, GraphLink>(preparedLinks)
          .id((node) => node.id)
          .distance(80)
          .strength((link) => (link.type === "conflict" ? 0.5 : 0.3)),
      )
      .force("charge", forceManyBody().strength(-160))
      .force("center", forceCenter(0, 0))
      .force("collision", forceCollide<GraphNode>().radius((node) => 20 + node.totalWeight * 6))
      .stop();

    for (let i = 0; i < 160; i += 1) {
      simulation.tick();
    }

    const positioned = simulation.nodes().map((node, index) => ({ ...node, index }));
    const lookup = new Map(positioned.map((node) => [node.id, node]));
    const resolvedLinks = preparedLinks.map((link) => {
      const sourceId = typeof link.source === "string" ? link.source : link.source.id;
      const targetId = typeof link.target === "string" ? link.target : link.target.id;
      return {
        ...link,
        source: lookup.get(sourceId) ?? link.source,
        target: lookup.get(targetId) ?? link.target,
      };
    });

    return { positions: positioned, links: resolvedLinks };
  }, [nodes, preparedLinks]);

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <div className="flex-1 rounded-lg border border-muted/50 bg-white p-4 shadow-card dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="font-semibold">Overlap network</span>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={showMerged}
              onChange={(event) => setShowMerged(event.target.checked)}
            />
            Highlight merged entries
          </label>
        </div>
        <svg
          viewBox="-200 -160 400 320"
          role="img"
          aria-label="Network graph showing overlaps and conflicts"
          className="h-[320px] w-full"
        >
          <defs>
            <marker
              id="arrow-conflict"
              viewBox="0 0 10 10"
              refX="5"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--colour-conflict)" />
            </marker>
          </defs>
          {links.map((link) => {
            const source = link.source as GraphNode;
            const target = link.target as GraphNode;
            if (!source || !target || source.x == null || source.y == null || target.x == null || target.y == null) {
              return null;
            }
            return (
              <line
                key={link.id}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={link.type === "conflict" ? "var(--colour-conflict)" : "var(--colour-muted)"}
                strokeWidth={link.type === "conflict" ? 2 : 1}
                strokeDasharray={link.type === "conflict" ? "4 2" : "none"}
                markerEnd={link.type === "conflict" ? "url(#arrow-conflict)" : undefined}
                opacity={0.7}
              />
            );
          })}
          {positions.map((node, index) => {
            if (node.x == null || node.y == null) return null;
            const radius = 14 + node.totalWeight * 8;
            const fill = nodeColour(index);
            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedNode(node)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedNode(node);
                  }
                }}
              >
                <circle
                  r={radius}
                  fill={fill}
                  fillOpacity={node.hasUnknown ? 0.45 : 0.7}
                  stroke="var(--colour-foreground)"
                  strokeWidth={node.conflict ? 2 : 1}
                  strokeDasharray={showMerged && node.merged ? "6 2" : "none"}
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none fill-background text-[10px] font-semibold"
                >
                  {node.system}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <aside className="w-full rounded-lg border border-muted/50 bg-white p-4 shadow-card dark:bg-slate-900 lg:w-80">
        <h2 className="text-base font-semibold">Details</h2>
        {selectedNode ? (
          <div className="mt-3 space-y-2 text-sm">
            <p className="font-medium">{selectedNode.label}</p>
            <p>
              Weighted impact:{" "}
              <span className="font-semibold">{selectedNode.totalWeight.toFixed(2)}</span>
            </p>
            <p>Unknown entries: {selectedNode.hasUnknown ? "Includes UNKNOWN" : "All labelled"}</p>
            <p>
              Conflicts: {selectedNode.conflict ? "Has conflict links" : "None recorded"}
            </p>
            <p>Merged entries: {selectedNode.merged ? "Yes" : "No"}</p>
            <ul className="space-y-1 pt-2">
              {rowsByNode
                .get(selectedNode.id)
                ?.map((row) => (
                  <li key={row.id} className="rounded bg-background/60 p-2 shadow-sm">
                    <span className="font-medium">{row.data_point}</span>
                    <br />
                    <span className="text-xs text-muted">
                      Strength {row.strength} · Confidence {row.confidence}
                    </span>
                    {row.notes && (
                      <p className="mt-1 text-xs text-muted">Notes: {row.notes}</p>
                    )}
                  </li>
                ))}
            </ul>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">
            Select a node to inspect data points. Solid outlines indicate conflict links, dashed
            outlines highlight merged sources. UNKNOWN entries are shown with lower opacity.
          </p>
        )}
      </aside>
    </div>
  );
};

