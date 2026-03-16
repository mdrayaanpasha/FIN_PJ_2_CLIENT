/**
 * Quantiva — Homepage
 * Palette matches QuantivaDashboard.jsx exactly.
 *
 * Add to index.html:
 * <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
 */

import { useEffect, useRef, useState } from "react";

// ─── Exact dashboard palette ──────────────────────────────────────────────────
const C = {
  // backgrounds
  bg:          "#ffffff",
  surface:     "#f9fafb",
  surface2:    "#f3f4f6",
  // borders
  border:      "#e5e7eb",
  borderMid:   "#d1d5db",
  // type
  body:        "#111827",
  label:       "#6b7280",
  muted:       "#9ca3af",
  // accent (dashboard's ink-blue)
  accent:      "#1a3a6b",
  accentBg:    "#f0f4fa",
  accentMid:   "#d0ddf0",
  // semantic
  up:          "#1a7a45",
  upBg:        "#f0faf4",
  upBorder:    "#b6dfc9",
  down:        "#b91c1c",
  downBg:      "#fef2f2",
  downBorder:  "#fccaca",
  warn:        "#92400e",
  warnBg:      "#fffbeb",
  warnBorder:  "#fde68a",
  // fonts
  syne:        "'Syne', sans-serif",
  mono:        "'DM Mono', monospace",
  sans:        "'DM Sans', sans-serif",
};

// ─── useInView ────────────────────────────────────────────────────────────────
function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); io.disconnect(); } },
      { threshold }
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return [ref, vis];
}

function Reveal({ children, delay = 0 }) {
  const [ref, vis] = useInView();
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(24px)",
      transition: `opacity .65s ease ${delay}s, transform .65s ease ${delay}s`,
    }}>
      {children}
    </div>
  );
}

// ─── Ticker tape ──────────────────────────────────────────────────────────────
const TAPE_DATA = [
  ["AAPL","182.63",true], ["NVDA","487.21",true], ["TSLA","241.05",false],
  ["MSFT","378.92",true], ["HOOD","73.38",false],  ["AMZN","178.25",true],
  ["META","492.17",true], ["GOOGL","152.44",false],["COIN","184.30",true],
  ["PLTR","21.88",true],  ["AMD","142.50",false],  ["UBER","68.20",true],
];

function TickerTape() {
  const items = [...TAPE_DATA, ...TAPE_DATA];
  return (
    <div style={{ overflow: "hidden", borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, background: C.surface }}>
      <div style={{ display: "flex", animation: "tape 32s linear infinite", width: "max-content" }}>
        {items.map(([sym, price, up], i) => (
          <span key={i} style={{
            fontFamily: C.mono, fontSize: 11, letterSpacing: "0.06em",
            padding: "8px 24px", whiteSpace: "nowrap",
            borderRight: `1px solid ${C.border}`,
            display: "inline-flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ color: C.label }}>{sym}</span>
            <span style={{ color: up ? C.up : C.down }}>{up ? "▲" : "▼"} {price}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Render cold-start banner ─────────────────────────────────────────────────
function RenderBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div style={{
      background: C.warnBg, borderBottom: `1px solid ${C.warnBorder}`,
      padding: "10px 48px", display: "flex", alignItems: "center",
      justifyContent: "space-between", gap: 16, flexWrap: "wrap",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 14 }}>⏱</span>
        <div>
          <span style={{ fontFamily: C.mono, fontSize: 11, fontWeight: 500, color: C.warn, letterSpacing: "0.06em" }}>
            COLD START — 
          </span>
          <span style={{ fontFamily: C.sans, fontSize: 12, color: C.warn }}>
            {" "}The API runs on Render's free tier. First request after inactivity may take <strong>30–60 seconds</strong> to wake up. Subsequent requests are fast.
          </span>
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        style={{ fontFamily: C.mono, fontSize: 10, color: C.warn, background: "none", border: "none", cursor: "pointer", letterSpacing: "0.08em", flexShrink: 0 }}
      >
        DISMISS ✕
      </button>
    </div>
  );
}

// ─── Pipeline diagram ─────────────────────────────────────────────────────────
const PIPE_NODES = [
  { id: 0, x: 20,  label: "Yahoo Finance", sub: "OHLCV feed",      color: C.accent, bg: C.accentBg  },
  { id: 1, x: 178, label: "Kafka",         sub: "Event stream",    color: C.warn,   bg: C.warnBg    },
  { id: 2, x: 336, label: "Redis",         sub: "Primary store",   color: C.down,   bg: C.downBg    },
  { id: 3, x: 494, label: "Indicators",    sub: "SMA · EMA · RSI", color: C.up,     bg: C.upBg      },
  { id: 4, x: 652, label: "Anomaly Det.",  sub: "7.5% threshold",  color: "#6d28d9",bg: "#f5f3ff"   },
];
const STEP_LABELS = ["FETCHING OHLCV DATA","PUBLISHING TO KAFKA","CACHING IN REDIS","COMPUTING INDICATORS","DETECTING ANOMALIES"];

function PipelineDiagram() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep(s => (s + 1) % 5), 1500);
    return () => clearInterval(id);
  }, []);
  const NW = 120, NH = 60, NY = 30, W = 792, H = 130;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%" }}>
      {/* Connector lines */}
      {PIPE_NODES.slice(0, -1).map((n, i) => {
        const x1 = n.x + NW + 1, x2 = PIPE_NODES[i + 1].x - 1;
        const active = step === i || step === i + 1;
        return (
          <g key={i}>
            <line x1={x1} y1={NY + NH / 2} x2={x2} y2={NY + NH / 2}
              stroke={active ? C.accent : C.borderMid}
              strokeWidth={active ? 1.5 : 1}
              style={{ transition: "stroke .4s" }}
            />
            <polygon
              points={`${x2},${NY+NH/2-4} ${x2+7},${NY+NH/2} ${x2},${NY+NH/2+4}`}
              fill={active ? C.accent : C.borderMid}
              style={{ transition: "fill .4s" }}
            />
            {step === i && (
              <circle r="4" fill={C.accent}>
                <animateMotion dur="1.5s" fill="freeze"
                  path={`M ${x1} ${NY + NH / 2} L ${x2} ${NY + NH / 2}`} />
              </circle>
            )}
          </g>
        );
      })}
      {/* Nodes */}
      {PIPE_NODES.map(n => {
        const active = step === n.id;
        return (
          <g key={n.id}>
            <rect x={n.x} y={NY} width={NW} height={NH} rx={3}
              fill={active ? n.bg : C.surface}
              stroke={active ? n.color : C.border}
              strokeWidth={active ? 1.5 : 1}
              style={{ transition: "all .4s" }}
            />
            <text x={n.x + NW / 2} y={NY + 22} textAnchor="middle"
              style={{ fontFamily: C.mono, fontSize: 11, fontWeight: 500, fill: active ? n.color : C.body, transition: "fill .4s" }}>
              {n.label}
            </text>
            <text x={n.x + NW / 2} y={NY + 38} textAnchor="middle"
              style={{ fontFamily: C.mono, fontSize: 9, fill: C.muted, letterSpacing: "0.04em" }}>
              {n.sub}
            </text>
          </g>
        );
      })}
      {/* Step label */}
      <text x={W / 2} y={H - 6} textAnchor="middle"
        style={{ fontFamily: C.mono, fontSize: 9, fill: C.accent, letterSpacing: "0.12em" }}>
        {STEP_LABELS[step]}
      </text>
    </svg>
  );
}

// ─── Stat ─────────────────────────────────────────────────────────────────────
function Stat({ value, label, color }) {
  return (
    <div style={{ padding: "24px 20px", borderRight: `1px solid ${C.border}` }}>
      <div style={{ fontFamily: C.syne, fontSize: 36, fontWeight: 700, color: color || C.accent, lineHeight: 1, marginBottom: 6 }}>
        {value}
      </div>
      <div style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", color: C.muted, textTransform: "uppercase" }}>
        {label}
      </div>
    </div>
  );
}

// ─── Feature card ─────────────────────────────────────────────────────────────
function Feature({ icon, title, body, color }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "28px 24px",
        border: `1px solid ${hov ? color : C.border}`,
        background: hov ? C.surface : C.bg,
        transition: "border-color .2s, background .2s",
      }}
    >
      <div style={{
        width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
        background: `${color}15`, border: `1px solid ${color}30`,
        marginBottom: 16, fontFamily: C.mono, fontSize: 14, color,
      }}>
        {icon}
      </div>
      <div style={{ fontFamily: C.syne, fontSize: 15, fontWeight: 700, color: C.body, marginBottom: 8 }}>{title}</div>
      <div style={{ fontFamily: C.sans, fontSize: 13, color: C.label, lineHeight: 1.75 }}>{body}</div>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ label, color }) {
  return (
    <span style={{
      fontFamily: C.mono, fontSize: 10, letterSpacing: "0.08em",
      padding: "5px 12px",
      border: `1px solid ${color}40`,
      background: `${color}0d`,
      color, textTransform: "uppercase",
    }}>
      {label}
    </span>
  );
}

// ─── Arch step ────────────────────────────────────────────────────────────────
function ArchStep({ n, title, detail, color }) {
  return (
    <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
      <div style={{
        fontFamily: C.mono, fontSize: 11, fontWeight: 500, flexShrink: 0,
        width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
        border: `1px solid ${color}`, color, background: `${color}0d`,
      }}>
        {String(n).padStart(2, "0")}
      </div>
      <div>
        <div style={{ fontFamily: C.syne, fontSize: 14, fontWeight: 700, color: C.body, marginBottom: 4 }}>{title}</div>
        <div style={{ fontFamily: C.sans, fontSize: 13, color: C.label, lineHeight: 1.75 }}>{detail}</div>
      </div>
    </div>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────
function SectionEyebrow({ text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <div style={{ width: 20, height: 1, background: C.accent }} />
      <span style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.16em", color: C.accent, textTransform: "uppercase" }}>
        {text}
      </span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function QuantivaHome() {
  return (
    <div style={{ background: C.bg, color: C.body, fontFamily: C.sans, minHeight: "100vh" }}>

      <style>{`
        @keyframes tape { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes livePulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.85)} }
        *{box-sizing:border-box;margin:0;padding:0;}
        ::selection{background:${C.accentBg};color:${C.accent};}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:${C.borderMid};}
        a{text-decoration:none;}
      `}</style>

      {/* ── Render cold-start banner ──────────────────────────────────── */}
      <RenderBanner />

      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 48px", height: 56,
        borderBottom: `1px solid ${C.border}`,
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="20" height="20" viewBox="0 0 28 28">
            <polygon points="14,2 25,8 25,20 14,26 3,20 3,8" fill={C.accent} />
          </svg>
          <span style={{ fontFamily: C.syne, fontSize: 14, fontWeight: 800, letterSpacing: "0.12em", color: C.accent }}>
            Arbit
          </span>
        </div>
        <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
          {[["Architecture","#architecture"],["Features","#features"],["Stack","#stack"],["API","#api"]].map(([l, h]) => (
            <a key={l} href={h} style={{ fontFamily: C.mono, fontSize: 11, letterSpacing: "0.06em", color: C.label, transition: "color .15s" }}
              onMouseEnter={e => e.target.style.color = C.body}
              onMouseLeave={e => e.target.style.color = C.label}>
              {l}
            </a>
          ))}
          <a href="/dashboard" style={{
            fontFamily: C.mono, fontSize: 11, letterSpacing: "0.08em", fontWeight: 500,
            padding: "8px 18px", background: C.accent, color: "#fff",
            transition: "opacity .15s",
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = ".85"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            DASHBOARD →
          </a>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section style={{ padding: "88px 48px 64px", maxWidth: 1100, margin: "0 auto" }}>
        {/* live badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 12px", border: `1px solid ${C.upBorder}`, background: C.upBg, marginBottom: 28, animation: "fadeUp .5s ease both" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.up, animation: "livePulse 2s ease-in-out infinite" }} />
          <span style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.14em", color: C.up }}>
            LIVE PIPELINE — REAL-TIME MARKET DATA
          </span>
        </div>

        <h1 style={{
          fontFamily: C.syne, fontWeight: 800, lineHeight: 1.05,
          fontSize: "clamp(38px, 5.5vw, 70px)", letterSpacing: "-0.02em",
          color: C.body, marginBottom: 20,
          animation: "fadeUp .6s ease .08s both",
        }}>
          Distributed financial<br />
          <span style={{ color: C.accent }}>data infrastructure</span><br />
          at stream speed.
        </h1>

        <p style={{
          fontFamily: C.sans, fontSize: 17, fontWeight: 300, color: C.label,
          maxWidth: 560, lineHeight: 1.75, marginBottom: 36,
          animation: "fadeUp .6s ease .16s both",
        }}>
          Arbit ingests live OHLCV data via Yahoo Finance, streams it through Apache Kafka, persists in Redis, and runs parallel consumers for technical indicators and anomaly detection — all in real time.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", animation: "fadeUp .6s ease .24s both" }}>
          <a href="/dashboard" style={{
            fontFamily: C.mono, fontSize: 12, letterSpacing: "0.1em", fontWeight: 500,
            padding: "12px 28px", background: C.accent, color: "#fff",
            display: "inline-block", transition: "opacity .15s",
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = ".85"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            OPEN DASHBOARD →
          </a>
          <a href="#architecture" style={{
            fontFamily: C.mono, fontSize: 12, letterSpacing: "0.1em",
            padding: "12px 28px", border: `1px solid ${C.borderMid}`, color: C.label,
            display: "inline-block", transition: "border-color .15s, color .15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.accent; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.borderMid; e.currentTarget.style.color = C.label; }}>
            VIEW ARCHITECTURE
          </a>
        </div>

        {/* Render notice inline */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          marginTop: 20, padding: "7px 14px",
          background: C.warnBg, border: `1px solid ${C.warnBorder}`,
          animation: "fadeUp .6s ease .32s both",
        }}>
          <span style={{ fontSize: 12 }}>⏱</span>
          <span style={{ fontFamily: C.sans, fontSize: 12, color: C.warn, lineHeight: 1.5 }}>
            <strong>Cold start notice:</strong> The API is on Render free tier — first load after inactivity takes ~30–60s to wake up.
          </span>
        </div>
      </section>

      {/* ── Ticker tape ──────────────────────────────────────────────── */}
      <TickerTape />

      {/* ── Stats ────────────────────────────────────────────────────── */}
      <section style={{ padding: "64px 48px", maxWidth: 1100, margin: "0 auto" }}>
        <Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", border: `1px solid ${C.border}`, background: C.surface }}>
            <Stat value="100+"  label="Tracked tickers"     color={C.accent} />
            <Stat value="2"     label="Kafka consumers"      color={C.up}     />
            <Stat value="3"     label="Indicators / ticker"  color={C.accent} />
            <div style={{ padding: "24px 20px" }}>
              <div style={{ fontFamily: C.syne, fontSize: 36, fontWeight: 700, color: C.down, lineHeight: 1, marginBottom: 6 }}>7.5%</div>
              <div style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", color: C.muted, textTransform: "uppercase" }}>Anomaly threshold</div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Pipeline ─────────────────────────────────────────────────── */}
      <section id="architecture" style={{ padding: "0 48px 72px", maxWidth: 1100, margin: "0 auto" }}>
        <Reveal>
          <SectionEyebrow text="Pipeline Architecture" />
          <h2 style={{ fontFamily: C.syne, fontSize: "clamp(24px,3vw,36px)", fontWeight: 800, color: C.body, marginBottom: 32, letterSpacing: "-0.01em" }}>
            Event-driven. Parallel. Persistent.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div style={{ border: `1px solid ${C.border}`, background: C.surface, padding: "28px 20px" }}>
            <PipelineDiagram />
          </div>
        </Reveal>

        {/* Arch steps */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, marginTop: 40 }}>
          {[
            { n:1, title:"Yahoo Finance Producer",     color: C.accent, detail:"Node.js producer fetches OHLCV candles via yahoo-finance2 and publishes lightweight trigger messages to Kafka topics — one per ticker." },
            { n:2, title:"Kafka Event Broker",         color: C.warn,   detail:"Apache Kafka on Aiven acts as the durable event log. Messages fan out to multiple consumers simultaneously without coupling." },
            { n:3, title:"Redis Primary Store",        color: C.down,   detail:"Full OHLCV data is written to Redis — Kafka carries only trigger keys, keeping the broker lean. Sub-millisecond reads power every downstream service." },
            { n:4, title:"Indicator Consumer",         color: C.up,     detail:"Dedicated consumer computes per-ticker SMA, EMA, and RSI from seeded historical windows. Results are written back to Redis per cycle." },
            { n:5, title:"Anomaly Detection Consumer", color: "#6d28d9",detail:"Parallel consumer flags close-price movements exceeding 7.5% against the prior candle. Alerts stored independently with timestamps." },
            { n:6, title:"REST API + Dashboard",       color: C.accent, detail:"Express exposes /data/:ticker aggregating OHLCV, indicator snapshot, and anomaly alerts from Redis into a single clean JSON response." },
          ].map((s, i) => (
            <Reveal key={s.n} delay={i * 0.07}>
              <ArchStep {...s} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: "0 48px 80px", maxWidth: 1100, margin: "0 auto" }}>
        <Reveal>
          <SectionEyebrow text="Capabilities" />
          <h2 style={{ fontFamily: C.syne, fontSize: "clamp(24px,3vw,36px)", fontWeight: 800, color: C.body, marginBottom: 36, letterSpacing: "-0.01em" }}>
            What Arbit does
          </h2>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: C.border }}>
          {[
            { icon:"⟳", color: C.up,      title:"Real-time ingestion",      body:"Continuous OHLCV data fetch across 100+ tickers via Yahoo Finance. Every candle is immediately published to the Kafka event stream." },
            { icon:"▤", color: C.warn,    title:"Kafka fan-out",             body:"Kafka decouples producers from consumers entirely. New consumers plug in without touching existing services — true horizontal scalability." },
            { icon:"◈", color: C.down,    title:"Redis cache-aside",         body:"All market data lives in Redis with per-ticker namespacing. Sub-millisecond reads power the API and consumers with zero DB overhead." },
            { icon:"∿", color: C.accent,  title:"Technical indicators",      body:"SMA, EMA, and RSI computed per-ticker using seeded historical windows. State persists across polling cycles for accurate rolling results." },
            { icon:"⚑", color: "#6d28d9", title:"Anomaly detection",         body:"Parallel consumer flags close-price movements exceeding 7.5%. Alerts are timestamped and stored independently of indicator data." },
            { icon:"⬡", color: C.up,      title:"Single API surface",        body:"One endpoint — /data/:ticker — aggregates OHLCV, indicators, and anomaly alerts into a clean JSON payload." },
          ].map((f, i) => (
            <Reveal key={f.title} delay={i * 0.07}>
              <Feature {...f} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── API ──────────────────────────────────────────────────────── */}
      <section id="api" style={{ padding: "0 48px 80px", maxWidth: 1100, margin: "0 auto" }}>
        <Reveal>
          <SectionEyebrow text="REST API" />
          <h2 style={{ fontFamily: C.syne, fontSize: "clamp(24px,3vw,36px)", fontWeight: 800, color: C.body, marginBottom: 32, letterSpacing: "-0.01em" }}>
            Simple. Consistent. Fast.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", border: `1px solid ${C.border}` }}>
            <div style={{ padding: 28, borderRight: `1px solid ${C.border}` }}>
              <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.14em", color: C.muted, marginBottom: 14, textTransform: "uppercase" }}>Endpoint</div>
              <div style={{ fontFamily: C.mono, fontSize: 14, color: C.accent, marginBottom: 10 }}>GET /data/:ticker</div>
              <div style={{ fontFamily: C.sans, fontSize: 13, color: C.label, lineHeight: 1.75, marginBottom: 20 }}>
                Returns aggregated market data — OHLCV candles, latest indicator snapshot, and all anomaly alerts — for any of 100 tracked tickers.
              </div>
              {/* cold-start reminder in API section */}
              <div style={{ padding: "10px 14px", background: C.warnBg, border: `1px solid ${C.warnBorder}`, marginBottom: 16 }}>
                <span style={{ fontFamily: C.mono, fontSize: 10, color: C.warn, letterSpacing: "0.06em" }}>
                  ⏱ FREE TIER — First request after inactivity may take 30–60s (Render cold start).
                </span>
              </div>
              <div style={{ fontFamily: C.mono, fontSize: 11, padding: "10px 14px", background: C.surface, border: `1px solid ${C.border}` }}>
                <span style={{ color: C.accent }}>curl </span>
                <span style={{ color: C.body }}>https://fin-pip-server-4.onrender.com/data/HOOD</span>
              </div>
            </div>
            <div style={{ padding: 28, background: C.surface }}>
              <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.14em", color: C.muted, marginBottom: 14, textTransform: "uppercase" }}>Response Shape</div>
              <pre style={{ fontFamily: C.mono, fontSize: 11, color: C.label, lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{`{
  "ticker": "HOOD",
  "ohlcv": [{
    "open":   75.91,
    "high":   79.65,
    "low":    75.55,
    "close":  79.34,
    "volume": 25186600
  }],
  "indicators": {
    "historical": [{
      "rsi": 46.08,
      "ema": 78.78,
      "sma": 78.72
    }]
  },
  "anomalies": [{
    "date":    "2026-03-13T13:30:00Z",
    "message": "close changed by 7.51%",
    "price":   73.38
  }]
}`}</pre>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Stack ────────────────────────────────────────────────────── */}
      <section id="stack" style={{ padding: "0 48px 80px", maxWidth: 1100, margin: "0 auto" }}>
        <Reveal>
          <SectionEyebrow text="Technology Stack" />
          <h2 style={{ fontFamily: C.syne, fontSize: "clamp(24px,3vw,36px)", fontWeight: 800, color: C.body, marginBottom: 28, letterSpacing: "-0.01em" }}>
            Built with production-grade tools
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {[
              ["Node.js",        C.up     ],
              ["Apache Kafka",   C.warn   ],
              ["Redis",          C.down   ],
              ["Express",        C.accent ],
              ["Prisma",         C.label  ],
              ["PostgreSQL",     C.accent ],
              ["yahoo-finance2", C.up     ],
              ["Docker",         C.accent ],
              ["Render",         C.warn   ],
              ["Aiven",          "#6d28d9"],
              ["React",          C.accent ],
              ["Tailwind CSS",   C.accent ],
            ].map(([l, c]) => <Badge key={l} label={l} color={c} />)}
          </div>
        </Reveal>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section style={{ padding: "0 48px 100px", maxWidth: 1100, margin: "0 auto" }}>
        <Reveal>
          <div style={{
            border: `1px solid ${C.accentMid}`,
            background: C.accentBg,
            padding: "56px 48px",
            display: "flex", alignItems: "center",
            justifyContent: "space-between", flexWrap: "wrap", gap: 28,
          }}>
            <div>
              <div style={{ fontFamily: C.syne, fontSize: "clamp(20px,2.5vw,30px)", fontWeight: 800, color: C.body, marginBottom: 8, letterSpacing: "-0.01em" }}>
                See it live.
              </div>
              <div style={{ fontFamily: C.sans, fontSize: 14, color: C.label, maxWidth: 400, lineHeight: 1.75 }}>
                The dashboard pulls real data from the live pipeline. Search 100 tickers, track anomalies, and monitor technical indicators in real time.
              </div>
              <div style={{ fontFamily: C.sans, fontSize: 12, color: C.warn, marginTop: 10 }}>
                ⏱ Allow 30–60s on first load — Render free tier cold start.
              </div>
            </div>
            <a href="/dashboard" style={{
              fontFamily: C.mono, fontSize: 12, letterSpacing: "0.1em", fontWeight: 500,
              padding: "14px 32px", background: C.accent, color: "#fff",
              display: "inline-block", transition: "opacity .15s", whiteSpace: "nowrap",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = ".85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
              OPEN LIVE DASHBOARD →
            </a>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: `1px solid ${C.border}`, padding: "20px 48px",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 28 28"><polygon points="14,2 25,8 25,20 14,26 3,20 3,8" fill={C.accent} /></svg>
          <span style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", color: C.muted }}>Arbit</span>
        </div>
        <span style={{ fontFamily: C.mono, fontSize: 10, color: C.muted, letterSpacing: "0.06em" }}>
          Built by Rayaan Pasha · St. Joseph's University, Bengaluru
        </span>
        <div style={{ display: "flex", gap: 20 }}>
          {["GitHub","API Docs","Dashboard"].map(l => (
            <a key={l} href="#" style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.06em", color: C.muted, transition: "color .15s" }}
              onMouseEnter={e => e.target.style.color = C.body}
              onMouseLeave={e => e.target.style.color = C.muted}>
              {l}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}