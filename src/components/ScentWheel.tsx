"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ScentWheelProps {
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  themeColor: string;
}

type ScentLayer = "top" | "heart" | "base" | null;

// Layer configuration for the three scent rings
const LAYERS: {
  id: ScentLayer & string;
  label: string;
  desc: string;
  // SVG ring geometry: inner and outer radii (in a 200x200 viewBox, center=100)
  inner: number;
  outer: number;
  // Visual fill opacity levels when inactive
  baseOpacity: string;
}[] = [
  {
    id: "base",
    label: "Base Notes",
    desc: "Enduring depth & sillage. Outlasts all other notes. Lingers for hours.",
    inner: 0,
    outer: 48,
    baseOpacity: "0.12",
  },
  {
    id: "heart",
    label: "Heart Notes",
    desc: "The true character of the fragrance. Emerges after 15–30 minutes on skin.",
    inner: 52,
    outer: 82,
    baseOpacity: "0.20",
  },
  {
    id: "top",
    label: "Top Notes",
    desc: "The immediate first impression. Bright, fleeting — lasts 15–30 minutes.",
    inner: 86,
    outer: 100,
    baseOpacity: "0.30",
  },
];

/**
 * Builds an SVG donut path (annular sector) for a full circle ring.
 * This is used both for the visual fill and as the pointer hit-target.
 */
function donutPath(cx: number, cy: number, innerR: number, outerR: number): string {
  // Full outer circle (clockwise)
  const outerCircle = `M ${cx + outerR} ${cy}
    A ${outerR} ${outerR} 0 1 1 ${cx + outerR - 0.001} ${cy}
    Z`;

  // If inner radius is 0, just return the full disc
  if (innerR <= 0) return outerCircle;

  // Full annular path using two arcs
  return `
    M ${cx + outerR} ${cy}
    A ${outerR} ${outerR} 0 1 1 ${cx - outerR} ${cy}
    A ${outerR} ${outerR} 0 1 1 ${cx + outerR} ${cy}
    Z
    M ${cx + innerR} ${cy}
    A ${innerR} ${innerR} 0 1 0 ${cx - innerR} ${cy}
    A ${innerR} ${innerR} 0 1 0 ${cx + innerR} ${cy}
    Z
  `;
}

export default function ScentWheel({
  topNotes,
  heartNotes,
  baseNotes,
  themeColor,
}: ScentWheelProps) {
  // pinnedLayer: set by click/tap — persists until another layer is tapped
  // hoveredLayer: set by mouse hover — desktop preview only, clears on mouse leave
  // activeLayer: what's currently displayed (hover takes priority, falls back to pin)
  const [pinnedLayer, setPinnedLayer] = useState<ScentLayer>(null);
  const [hoveredLayer, setHoveredLayer] = useState<ScentLayer>(null);
  const activeLayer: ScentLayer = hoveredLayer ?? pinnedLayer;

  const accentColor = themeColor || "#C5A880";

  /** Toggle the pinned layer — tap same layer again to deselect */
  const handlePin = (id: string) => {
    setPinnedLayer((prev) => (prev === id ? null : (id as ScentLayer)));
  };

  const getNotesForLayer = (layer: ScentLayer) => {
    if (layer === "top") return topNotes;
    if (layer === "heart") return heartNotes;
    if (layer === "base") return baseNotes;
    return [];
  };

  // Center & size of the SVG canvas
  const cx = 100;
  const cy = 100;
  const size = 200;
  // Gap between rings in SVG units
  const gap = 4;

  return (
    <div className="flex flex-col md:flex-row items-center gap-10 py-8 px-4 font-sans max-w-3xl mx-auto">

      {/* ── Left: SVG Wheel ── */}
      <div className="relative flex-shrink-0 w-56 h-56 md:w-64 md:h-64">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full select-none"
          aria-label="Scent layer wheel"
        >
          <defs>
            {/* Each ring gets a clipPath so the visible fill is exactly the donut zone */}
            {LAYERS.map((layer) => (
              <clipPath key={`clip-${layer.id}`} id={`clip-${layer.id}`}>
                <path d={donutPath(cx, cy, layer.inner * cx / 100, layer.outer * cx / 100)} fillRule="evenodd" />
              </clipPath>
            ))}
          </defs>

          {LAYERS.map((layer) => {
            const innerR = layer.inner * cx / 100;
            const outerR = layer.outer * cx / 100;
            const isActive = activeLayer === layer.id;

            return (
              <g key={layer.id}>
                {/* Visual ring — filled circle clipped to donut shape */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={outerR}
                  clipPath={`url(#clip-${layer.id})`}
                  fill={isActive ? accentColor : "currentColor"}
                  fillOpacity={isActive ? 0.9 : layer.baseOpacity}
                  className="transition-all duration-300"
                />

                {/* Invisible hit-target ring — full donut area, fully transparent */}
                <path
                  d={donutPath(cx, cy, innerR + gap / 2, outerR)}
                  fillRule="evenodd"
                  fill="transparent"
                  stroke="none"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoveredLayer(layer.id as ScentLayer)}
                  onMouseLeave={() => setHoveredLayer(null)}
                  onClick={() => handlePin(layer.id)}
                />
              </g>
            );
          })}

          {/* Thin separator rings for visual depth */}
          {[48, 82].map((r) => (
            <circle
              key={r}
              cx={cx}
              cy={cy}
              r={(r * cx) / 100}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.08}
              strokeWidth={gap}
            />
          ))}

          {/* Centre label */}
          <text
            x={cx}
            y={cy - 6}
            textAnchor="middle"
            fontSize="7"
            fill="currentColor"
            fillOpacity={0.5}
            fontFamily="serif"
            letterSpacing="1"
          >
            SCENT
          </text>
          <text
            x={cx}
            y={cy + 7}
            textAnchor="middle"
            fontSize="7"
            fill="currentColor"
            fillOpacity={0.5}
            fontFamily="serif"
            letterSpacing="1"
          >
            LAYERS
          </text>
        </svg>
      </div>

      {/* ── Right: Layer Info Panel ── */}
      <div className="flex-grow space-y-6 text-center md:text-left">

        {/* Clickable / tappable layer pills */}
        <div className="flex flex-wrap justify-center md:justify-start gap-2">
          {LAYERS.map((layer) => {
            const isPinned = pinnedLayer === layer.id;
            const isActive = activeLayer === layer.id;
            return (
              <button
                key={layer.id}
                onClick={() => handlePin(layer.id)}
                onMouseEnter={() => setHoveredLayer(layer.id as ScentLayer)}
                onMouseLeave={() => setHoveredLayer(null)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-semibold tracking-widest uppercase border transition-all duration-200 ${
                  isActive
                    ? "border-accent text-accent bg-accent/10"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                {layer.label}
                {/* Small dot indicator when pinned (persisted selection) */}
                {isPinned && (
                  <span className="ml-1.5 inline-block w-1 h-1 rounded-full bg-accent align-middle" />
                )}
              </button>
            );
          })}
        </div>

        {/* Notes detail card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeLayer ?? "default"}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="min-h-[120px] flex flex-col justify-center space-y-3"
          >
            {activeLayer ? (
              <>
                <div className="space-y-1">
                  <h4 className="text-xl font-serif font-light text-foreground tracking-wide">
                    {LAYERS.find((l) => l.id === activeLayer)?.label}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                    {LAYERS.find((l) => l.id === activeLayer)?.desc}
                  </p>
                </div>

                <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1">
                  {getNotesForLayer(activeLayer).map((note, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.06 }}
                      className="px-3 py-1.5 bg-black/10 border border-border/60 rounded-full text-xs font-sans text-foreground"
                    >
                      {note.trim()}
                    </motion.span>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-1">
                <h4 className="text-xl font-serif font-light text-foreground tracking-wide">
                  Scent Composition
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                  Hover over the rings or click a layer button above to explore the structural notes of this fragrance.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
