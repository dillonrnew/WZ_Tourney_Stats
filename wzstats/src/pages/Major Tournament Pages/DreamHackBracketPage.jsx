import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../../styles/Major Tournament Pages/DreamHackBracketPage.css";

// ─── Layout constants ────────────────────────────────────────────────────────
const NODE_WIDTH    = 220;
const NODE_HEIGHT   = 58;   // R2 and beyond
const R1_NODE_H     = 36;   // compact R1 nodes
const X_STRIDE      = 265;  // horizontal gap between columns
const R1_Y_START    = 30;
const R1_Y_STEP     = 44;   // 44px step, 36px height → 8px gap between R1 nodes
const CANVAS_WIDTH  = 3990; // EU R1 right edge (3740+220) + 30 padding
const CANVAS_HEIGHT = 1540;

// ─── Path helpers ─────────────────────────────────────────────────────────────
function nodeH(item) {
  return item.round === 1 ? R1_NODE_H : NODE_HEIGHT;
}

function anchorPoint(item, anchor) {
  const h = nodeH(item);
  switch (anchor) {
    case "top":    return { x: item.x + NODE_WIDTH / 2, y: item.y };
    case "bottom": return { x: item.x + NODE_WIDTH / 2, y: item.y + h };
    case "left":   return { x: item.x,                  y: item.y + h / 2 };
    default:       return { x: item.x + NODE_WIDTH,     y: item.y + h / 2 }; // right
  }
}

function buildPath(from, to, fromAnchor = "right", toAnchor = "left") {
  const s = anchorPoint(from, fromAnchor);
  const e = anchorPoint(to,   toAnchor);
  const isV = fromAnchor === "top" || fromAnchor === "bottom"
           || toAnchor   === "top" || toAnchor   === "bottom";
  if (isV) {
    const midY = (s.y + e.y) / 2;
    return `M ${s.x} ${s.y} L ${s.x} ${midY} L ${e.x} ${midY} L ${e.x} ${e.y}`;
  }
  const midX = (s.x + e.x) / 2;
  return `M ${s.x} ${s.y} L ${midX} ${s.y} L ${midX} ${e.y} L ${e.x} ${e.y}`;
}

// ─── Bracket builder ──────────────────────────────────────────────────────────
// direction: +1 for NA (left → right), -1 for EU (right → left)
function buildRegion(prefix, r1X, direction, regionLabel) {
  const nodes = [];
  const conns = [];

  const nextX   = (col) => r1X + direction * X_STRIDE * col;
  const fromA   = direction > 0 ? "right" : "left";
  const toA     = direction > 0 ? "left"  : "right";
  const midOfTwo = (a, b) => (a + b) / 2;

  function getAnchorY(item) {
    return item.y + nodeH(item) / 2;
  }

  function mkNode(id, x, y, label, sublabel = "", round = 2, extra = {}) {
    return { id, x, y, label, sublabel, round, ...extra };
  }

  // ── Round 1: 32 lobbies ──────────────────────────────────────────────────
  const r1 = Array.from({ length: 32 }, (_, i) =>
    mkNode(`${prefix}-r1-${i + 1}`, nextX(0), R1_Y_START + i * R1_Y_STEP,
      `Lobby ${i + 1}`, "", 1)
  );
  nodes.push(...r1);

  // ── Round 2: 16 lobbies ──────────────────────────────────────────────────
  const r2 = Array.from({ length: 16 }, (_, i) => {
    const ay = midOfTwo(getAnchorY(r1[i * 2]), getAnchorY(r1[i * 2 + 1]));
    const n  = mkNode(`${prefix}-r2-${i + 1}`, nextX(1), ay - NODE_HEIGHT / 2,
      `R2 Lobby ${i + 1}`);
    conns.push(
      { from: r1[i * 2].id,     to: n.id, fromA, toA },
      { from: r1[i * 2 + 1].id, to: n.id, fromA, toA },
    );
    return n;
  });
  nodes.push(...r2);

  // ── Round 3: 8 lobbies ───────────────────────────────────────────────────
  const r3 = Array.from({ length: 8 }, (_, i) => {
    const ay = midOfTwo(getAnchorY(r2[i * 2]), getAnchorY(r2[i * 2 + 1]));
    const n  = mkNode(`${prefix}-r3-${i + 1}`, nextX(2), ay - NODE_HEIGHT / 2,
      `R3 Lobby ${i + 1}`);
    conns.push(
      { from: r2[i * 2].id,     to: n.id, fromA, toA },
      { from: r2[i * 2 + 1].id, to: n.id, fromA, toA },
    );
    return n;
  });
  nodes.push(...r3);

  // ── Round 4: 4 lobbies ───────────────────────────────────────────────────
  const r4 = Array.from({ length: 4 }, (_, i) => {
    const ay = midOfTwo(getAnchorY(r3[i * 2]), getAnchorY(r3[i * 2 + 1]));
    const n  = mkNode(`${prefix}-r4-${i + 1}`, nextX(3), ay - NODE_HEIGHT / 2,
      `R4 Lobby ${i + 1}`);
    conns.push(
      { from: r3[i * 2].id,     to: n.id, fromA, toA },
      { from: r3[i * 2 + 1].id, to: n.id, fromA, toA },
    );
    return n;
  });
  nodes.push(...r4);

  // ── Semifinals: 2 lobbies ────────────────────────────────────────────────
  const semis = Array.from({ length: 2 }, (_, i) => {
    const ay = midOfTwo(getAnchorY(r4[i * 2]), getAnchorY(r4[i * 2 + 1]));
    const n  = mkNode(`${prefix}-semi-${i + 1}`, nextX(4), ay - NODE_HEIGHT / 2,
      `Semifinal ${i + 1}`);
    conns.push(
      { from: r4[i * 2].id,     to: n.id, fromA, toA },
      { from: r4[i * 2 + 1].id, to: n.id, fromA, toA },
    );
    return n;
  });
  nodes.push(...semis);

  // ── Regional Final: 1 lobby ──────────────────────────────────────────────
  const finalAY   = midOfTwo(getAnchorY(semis[0]), getAnchorY(semis[1]));
  const finalNode = mkNode(
    `${prefix}-final`, nextX(5), finalAY - NODE_HEIGHT / 2,
    `${regionLabel} Final`, "Top 5 → LAN", 6, { isFinal: true },
  );
  nodes.push(finalNode);
  conns.push(
    { from: semis[0].id, to: finalNode.id, fromA, toA },
    { from: semis[1].id, to: finalNode.id, fromA, toA },
  );

  return { nodes, conns, finalNode };
}

// ─── Build both regions (module-level, runs once) ────────────────────────────
// NA:  R1 at x=20,   strides right (+1) → Final at x=1345, right edge=1565
// EU:  R1 at x=3740, strides left  (-1) → Final at x=2415, left  edge=2415
// LAN A left edge (1615) is 50px clear of NA Final right edge (1565) ✓
// LAN B right edge (2365) is 50px clear of EU Final left edge (2415) ✓
const NA = buildRegion("na", 20,   +1, "NA");
const EU = buildRegion("eu", 3740, -1, "EU");

// ─── LAN section (center) ────────────────────────────────────────────────────
// Center of gap between NA Final right edge (1565) and EU Final left edge (2415):
//   mid = (1565 + 2415) / 2 = 1990  →  LAN Finals x = 1990 - 110 = 1880
const LAN_FINALS_X = 1880;
const LAN_FINALS_Y = NA.finalNode.y; // vertically matched with NA / EU finals
const LAN_QUAL_X   = LAN_FINALS_X;
const LAN_QUAL_Y   = LAN_FINALS_Y + 290;
const LAN_A_X      = LAN_FINALS_X - X_STRIDE;  // 1615
const LAN_B_X      = LAN_FINALS_X + X_STRIDE;  // 2145
const LAN_AB_Y     = LAN_QUAL_Y + 240;

const LAN_NODES = [
  {
    id: "lan-a", x: LAN_A_X, y: LAN_AB_Y,
    label: "LAN Lobby A", sublabel: "Top 8 → Open Qualifier", round: 7,
  },
  {
    id: "lan-b", x: LAN_B_X, y: LAN_AB_Y,
    label: "LAN Lobby B", sublabel: "Top 8 → Open Qualifier", round: 7,
  },
  {
    id: "lan-qualifier", x: LAN_QUAL_X, y: LAN_QUAL_Y,
    label: "LAN Open Qualifier", sublabel: "Top 6 → LAN Finals", round: 7,
  },
  {
    id: "lan-finals", x: LAN_FINALS_X, y: LAN_FINALS_Y,
    label: "LAN Finals", sublabel: "5 NA  ·  6 Qualifier  ·  5 EU", round: 8,
    isLanFinals: true,
  },
];

const LAN_CONNS = [
  // LAN A/B feed upward — arrows land at the horizontal center-bottom of the qualifier
  { from: "lan-a",         to: "lan-qualifier", fromA: "top",   toA: "bottom" },
  { from: "lan-b",         to: "lan-qualifier", fromA: "top",   toA: "bottom" },
  // Open Qualifier feeds upward into LAN Finals (center-bottom → center-bottom keeps a clean vertical)
  { from: "lan-qualifier", to: "lan-finals",    fromA: "top",   toA: "bottom" },
  // Regional finals feed sideways into LAN Finals
  { from: "na-final",      to: "lan-finals",    fromA: "right", toA: "left"   },
  { from: "eu-final",      to: "lan-finals",    fromA: "left",  toA: "right"  },
];

// ─── Combined data ────────────────────────────────────────────────────────────
const ALL_NODES = [...NA.nodes, ...EU.nodes, ...LAN_NODES];
const ALL_CONNS = [...NA.conns, ...EU.conns, ...LAN_CONNS];
const NODE_MAP  = new Map(ALL_NODES.map((n) => [n.id, n]));

// ─── Column header definitions ────────────────────────────────────────────────
const NA_COL_LABELS = [
  { label: "Round 1",    x: 20   + NODE_WIDTH / 2 },
  { label: "Round 2",    x: 285  + NODE_WIDTH / 2 },
  { label: "Round 3",    x: 550  + NODE_WIDTH / 2 },
  { label: "Round 4",    x: 815  + NODE_WIDTH / 2 },
  { label: "Semifinals", x: 1080 + NODE_WIDTH / 2 },
  { label: "NA Final",   x: 1345 + NODE_WIDTH / 2 },
];

const EU_COL_LABELS = [
  { label: "EU Final",   x: 2415 + NODE_WIDTH / 2 },
  { label: "Semifinals", x: 2680 + NODE_WIDTH / 2 },
  { label: "Round 4",    x: 2945 + NODE_WIDTH / 2 },
  { label: "Round 3",    x: 3210 + NODE_WIDTH / 2 },
  { label: "Round 2",    x: 3475 + NODE_WIDTH / 2 },
  { label: "Round 1",    x: 3740 + NODE_WIDTH / 2 },
];

// LAN Qualifier and LAN Finals share the same x-column (1695); show one combined label
const LAN_COL_LABELS = [
  { label: "LAN Lobby A",          x: LAN_A_X     + NODE_WIDTH / 2 },
  { label: "Finals · Qualifier",   x: LAN_QUAL_X  + NODE_WIDTH / 2 },
  { label: "LAN Lobby B",          x: LAN_B_X     + NODE_WIDTH / 2 },
];

// ─── Scroll targets for each section ─────────────────────────────────────────
// These are the canvas-space x centres of the "headline" node in each region.
// The viewport scroll is set so that node appears near the centre of the screen.
// Per-section scroll targets. LAN Y is the midpoint between LAN Finals and
// LAN A/B so all four LAN nodes fit comfortably in the viewport.
const SECTION_FOCUS = {
  na:  { x: NA.finalNode.x + NODE_WIDTH / 2,  y: NA.finalNode.y + NODE_HEIGHT / 2 },
  lan: { x: LAN_FINALS_X   + NODE_WIDTH / 2,  y: (LAN_FINALS_Y + LAN_AB_Y) / 2   },
  eu:  { x: EU.finalNode.x + NODE_WIDTH / 2,  y: EU.finalNode.y + NODE_HEIGHT / 2 },
};

// ─── Component ───────────────────────────────────────────────────────────────
function DreamHackBracketPage({ eventName = "DreamHack" }) {
  const [searchParams]                = useSearchParams();
  const section                       = searchParams.get("section") || "na";
  const viewportRef = useRef(null);
  const dragRef     = useRef({ startX: 0, startY: 0, startLeft: 0, startTop: 0 });
  const [isDragging, setIsDragging]   = useState(false);
  const [showPage,   setShowPage]     = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowPage(true), 350);
    return () => clearTimeout(t);
  }, []);

  // Once the canvas is visible, jump to the requested section
  useEffect(() => {
    if (!showPage) return;
    const vp = viewportRef.current;
    if (!vp) return;
    const focus = SECTION_FOCUS[section] ?? SECTION_FOCUS.na;
    vp.scrollLeft = Math.max(0, focus.x - vp.clientWidth  / 2);
    vp.scrollTop  = Math.max(0, focus.y - vp.clientHeight / 2);
  }, [showPage, section]);

  function startDrag(e) {
    const vp = viewportRef.current;
    if (!vp) return;
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX, startY: e.clientY,
      startLeft: vp.scrollLeft, startTop: vp.scrollTop,
    };
  }
  function onDrag(e) {
    if (!isDragging) return;
    const vp = viewportRef.current;
    if (!vp) return;
    const { startX, startY, startLeft, startTop } = dragRef.current;
    vp.scrollLeft = startLeft - (e.clientX - startX);
    vp.scrollTop  = startTop  - (e.clientY - startY);
  }
  const endDrag = () => setIsDragging(false);

  return (
    <div className="dh-page">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="dh-topbar">
        <h1 className="dh-topbar__title">{eventName}</h1>
        <p className="dh-topbar__sub">
          NA Bracket (left) · LAN (center) · EU Bracket (right) — Click and drag to navigate
        </p>
      </div>

      {/* ── Region jump buttons ─────────────────────────────────────────── */}
      <div className="dh-region-stripe">
        {[
          { key: "na",  label: "← NA BRACKET", cls: "dh-region-stripe__na"  },
          { key: "lan", label: "LAN",           cls: "dh-region-stripe__lan" },
          { key: "eu",  label: "EU BRACKET →",  cls: "dh-region-stripe__eu"  },
        ].map(({ key, label, cls }) => (
          <button
            key={key}
            type="button"
            className={`${cls}${section === key ? " dh-region-active" : ""}`}
            onClick={() => {
              const vp = viewportRef.current;
              if (!vp) return;
              const focus = SECTION_FOCUS[key];
              vp.scrollLeft = Math.max(0, focus.x - vp.clientWidth  / 2);
              vp.scrollTop  = Math.max(0, focus.y - vp.clientHeight / 2);
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Draggable viewport ──────────────────────────────────────────── */}
      <div
        ref={viewportRef}
        className={`dh-viewport${isDragging ? " dh-viewport--dragging" : ""}`}
        onMouseDown={startDrag}
        onMouseMove={onDrag}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
      >
        {showPage ? (
          <div
            className="dh-canvas"
            style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
          >
            {/* ── Column labels ─────────────────────────────────────────── */}
            <div className="dh-col-labels dh-col-labels--na">
              {NA_COL_LABELS.map((item) => (
                <span
                  key={item.label}
                  className="dh-col-label dh-col-label--na"
                  style={{ left: item.x }}
                >
                  {item.label}
                </span>
              ))}
            </div>

            <div className="dh-col-labels dh-col-labels--eu">
              {EU_COL_LABELS.map((item) => (
                <span
                  key={item.label}
                  className="dh-col-label dh-col-label--eu"
                  style={{ left: item.x }}
                >
                  {item.label}
                </span>
              ))}
            </div>

            <div className="dh-col-labels dh-col-labels--lan">
              {LAN_COL_LABELS.map((item) => (
                <span
                  key={item.label}
                  className="dh-col-label dh-col-label--lan"
                  style={{ left: item.x }}
                >
                  {item.label}
                </span>
              ))}
            </div>

            {/* ── SVG connection lines ───────────────────────────────────── */}
            <svg
              className="dh-lines"
              viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
              preserveAspectRatio="none"
            >
              <defs>
                {/* single auto-orient marker works for all directions */}
                <marker
                  id="dh-arrow-na"
                  markerWidth="7" markerHeight="7"
                  refX="6" refY="3.5"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M 0 0 L 7 3.5 L 0 7 z" fill="#3d8ef0" />
                </marker>
                <marker
                  id="dh-arrow-eu"
                  markerWidth="7" markerHeight="7"
                  refX="6" refY="3.5"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M 0 0 L 7 3.5 L 0 7 z" fill="#e05c5c" />
                </marker>
                <marker
                  id="dh-arrow-lan"
                  markerWidth="7" markerHeight="7"
                  refX="6" refY="3.5"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M 0 0 L 7 3.5 L 0 7 z" fill="#d4920a" />
                </marker>
              </defs>

              {ALL_CONNS.map((conn, idx) => {
                const fromNode = NODE_MAP.get(conn.from);
                const toNode   = NODE_MAP.get(conn.to);
                if (!fromNode || !toNode) return null;

                const isLanConn = conn.from.startsWith("lan") || conn.to.startsWith("lan")
                               || conn.from === "na-final" || conn.from === "eu-final";
                const isEuConn  = !isLanConn && conn.from.startsWith("eu");
                const markerId  = isLanConn ? "dh-arrow-lan" : isEuConn ? "dh-arrow-eu" : "dh-arrow-na";
                const stroke    = isLanConn ? "#d4920a"      : isEuConn ? "#e05c5c"     : "#3d8ef0";

                return (
                  <path
                    key={idx}
                    d={buildPath(fromNode, toNode, conn.fromA, conn.toA)}
                    stroke={stroke}
                    strokeWidth="1.5"
                    fill="none"
                    markerEnd={`url(#${markerId})`}
                    opacity="0.75"
                  />
                );
              })}
            </svg>

            {/* ── Bracket nodes ──────────────────────────────────────────── */}
            {ALL_NODES.map((item) => {
              const h  = nodeH(item);
              const isNA       = item.id.startsWith("na");
              const isEU       = item.id.startsWith("eu");
              const isLan      = item.id.startsWith("lan");
              const isLanFinal = item.isLanFinals;
              const isFinal    = item.isFinal;

              let cls = "dh-node";
              if (item.round === 1)  cls += " dh-node--r1";
              if (isFinal)           cls += " dh-node--final";
              if (isLanFinal)        cls += " dh-node--lan-finals";
              else if (isLan)        cls += " dh-node--lan";
              else if (isEU)         cls += " dh-node--eu";
              else                   cls += " dh-node--na";

              return (
                <div
                  key={item.id}
                  className={cls}
                  style={{ left: item.x, top: item.y, width: NODE_WIDTH, height: h }}
                >
                  <span className="dh-node__label">{item.label}</span>
                  {item.sublabel && (
                    <span className="dh-node__sub">{item.sublabel}</span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="dh-loading">Loading bracket…</div>
        )}
      </div>
    </div>
  );
}

export default DreamHackBracketPage;
