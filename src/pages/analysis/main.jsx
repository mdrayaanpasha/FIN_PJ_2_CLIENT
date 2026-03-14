/**
 * Quantiva Dashboard v3
 * Light mode · DM Mono + DM Sans · Swiss editorial × Bloomberg
 *
 * Add to index.html / global CSS:
 * <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
 */

import { useState, useEffect, useCallback, useRef } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────
export const TICKERS = [
  "AAPL","MSFT","GOOGL","AMZN","NVDA","META","TSLA","BRK-B","JPM","V",
  "UNH","XOM","JNJ","WMT","MA","PG","LLY","CVX","HD","MRK",
  "ABBV","PEP","KO","AVGO","COST","ADBE","CSCO","TMO","ACN","MCD",
  "BAC","NKE","DHR","TXN","NEE","PM","UPS","MS","INTC","AMGN",
  "RTX","SCHW","INTU","QCOM","IBM","CAT","SPGI","GS","BLK","AXP",
  "ISRG","AMD","GILD","DE","SYK","ADP","PLD","MDLZ","ADI","REGN",
  "VRTX","MO","ZTS","CI","TJX","EOG","SO","DUK","NOC","MMC",
  "ITW","BSX","HCA","SLB","APD","PGR","CME","ETN","EW","AON",
  "BDX","FISV","MCO","KLAC","NSC","EMR","MET","PSA","WM","F",
  "GM","UBER","ABNB","SNAP","SHOP","SQ","PLTR","COIN","RBLX","HOOD",
];

const API = "https://fin-pip-server-4.onrender.com/data/";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt     = (n, d = 2) => n == null ? "—" : parseFloat(n).toFixed(d);
const fmtVol  = (n) => {
  if (n == null) return "—";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(n);
};
const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", timeZone: "UTC",
  });
};

// ─── Tokens ───────────────────────────────────────────────────────────────────
// accent: deep ink-blue
// up: forest green  down: crimson
const T = {
  accent:    "#1a3a6b",
  accentBg:  "#f0f4fa",
  up:        "#1a7a45",
  upBg:      "#f0faf4",
  upBorder:  "#b6dfc9",
  down:      "#b91c1c",
  downBg:    "#fef2f2",
  downBorder:"#fccaca",
  border:    "#e5e7eb",
  borderMid: "#d1d5db",
  surface:   "#f9fafb",
  muted:     "#9ca3af",
  label:     "#6b7280",
  body:      "#111827",
  mono:      "'DM Mono', monospace",
  sans:      "'DM Sans', sans-serif",
};

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ ohlcv }) {
  if (!ohlcv?.open) return (
    <div className="flex items-center justify-center h-full">
      <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, letterSpacing: "0.1em" }}>
        NO DATA
      </span>
    </div>
  );

  const o = +ohlcv.open, h = +ohlcv.high, l = +ohlcv.low, c = +ohlcv.close;
  const isUp = c >= o;
  const mx = (a, b, t) => a * t + b * (1 - t);
  const raw = [
    o, mx(h,l,.12), mx(h,l,.28), mx(h,l,.44), mx(h,l,.6),
    mx(h,l,.76), mx(l,h,.1), mx(l,h,.3), mx(h,l,.35),
    mx(h,l,.45), mx(h,l,.82), h, mx(h,l,.08), mx(h,l,.22),
    mx(h,l,.5), mx(l,h,.38), mx(l,h,.62), mx(l,h,.82),
    mx(l,h,.92), l, mx(l,h,.18), mx(l,h,.34), mx(c,o,.28),
    mx(c,o,.12), c,
  ];
  const mn = Math.min(...raw), mx2 = Math.max(...raw), rng = mx2 - mn || 1;
  const W = 700, H = 100, P = 16;
  const pts = raw.map((p, i) => {
    const x = P + (i / (raw.length - 1)) * (W - P * 2);
    const y = P + (1 - (p - mn) / rng) * (H - P * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const fill = [`${P},${H}`, ...pts, `${W - P},${H}`].join(" ");
  const lc = isUp ? T.up : T.down;
  const fc = isUp ? "rgba(26,122,69,0.07)" : "rgba(185,28,28,0.06)";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
      <polygon points={fill} fill={fc} />
      <polyline points={pts.join(" ")} fill="none" stroke={lc} strokeWidth="1.5"
        strokeLinejoin="round" strokeLinecap="round" />
      <text x="12" y="13" style={{ fontFamily: T.mono, fontSize: "9px", fill: T.muted, letterSpacing: "0.06em" }}>
        H {fmt(h)}
      </text>
      <text x="12" y={H - 5} style={{ fontFamily: T.mono, fontSize: "9px", fill: T.muted, letterSpacing: "0.06em" }}>
        L {fmt(l)}
      </text>
    </svg>
  );
}

// ─── RSI Gauge ────────────────────────────────────────────────────────────────
function RSIGauge({ value }) {
  const v = Math.min(Math.max(+value || 0, 0), 100);
  const zone = v >= 70 ? { label: "OVERBOUGHT", color: T.down } :
               v <= 30 ? { label: "OVERSOLD",   color: T.up   } :
                         { label: "NEUTRAL",    color: T.accent };
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1.5">
        <span style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 400, color: T.body }}>{fmt(v)}</span>
        <span style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: "0.12em", color: zone.color }}>{zone.label}</span>
      </div>
      <div style={{ background: T.border, height: 3, position: "relative" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "30%", background: "rgba(26,122,69,0.15)" }} />
        <div style={{ position: "absolute", left: "70%", right: 0, top: 0, bottom: 0, background: "rgba(185,28,28,0.15)" }} />
        <div style={{ height: "100%", width: `${v}%`, background: zone.color, transition: "width 0.8s ease" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
        {["0","30","50","70","100"].map(m => (
          <span key={m} style={{ fontFamily: T.mono, fontSize: 8, color: T.muted }}>{m}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Search ───────────────────────────────────────────────────────────────────
function Search({ onSelect }) {
  const [q, setQ]         = useState("");
  const [open, setOpen]   = useState(false);
  const [cur, setCur]     = useState(0);
  const wrapRef           = useRef(null);

  const matches = q.length > 0 ? TICKERS.filter(t => t.startsWith(q.toUpperCase())).slice(0, 9) : [];

  useEffect(() => {
    const h = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const go = t => { setQ(""); setOpen(false); setCur(0); onSelect(t); };

  const onKey = e => {
    if (e.key === "ArrowDown") { setCur(c => Math.min(c + 1, matches.length - 1)); e.preventDefault(); }
    if (e.key === "ArrowUp")   { setCur(c => Math.max(c - 1, 0)); e.preventDefault(); }
    if (e.key === "Enter")     go(matches[cur] || q.toUpperCase());
    if (e.key === "Escape")    setOpen(false);
  };

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <div style={{ display: "flex", border: `1px solid ${T.borderMid}`, background: "#fff" }}>
        <input
          value={q}
          onChange={e => { setQ(e.target.value.toUpperCase()); setOpen(true); setCur(0); }}
          onKeyDown={onKey}
          onFocus={() => q && setOpen(true)}
          placeholder="Search symbol…"
          maxLength={8}
          style={{
            fontFamily: T.mono, fontSize: 13, fontWeight: 400,
            letterSpacing: "0.06em", padding: "8px 14px", width: 180,
            border: "none", outline: "none", background: "transparent",
            color: T.body,
          }}
        />
        <button
          onClick={() => go(matches[cur] || q.toUpperCase())}
          style={{
            fontFamily: T.mono, fontSize: 11, fontWeight: 500,
            letterSpacing: "0.1em", padding: "0 16px",
            background: T.accent, color: "#fff", border: "none",
            cursor: "pointer", transition: "opacity .15s",
          }}
          onMouseEnter={e => e.target.style.opacity = ".85"}
          onMouseLeave={e => e.target.style.opacity = "1"}
        >
          GO
        </button>
      </div>

      {open && matches.length > 0 && (
        <div style={{
          position: "absolute", top: "100%", left: 0, zIndex: 100,
          width: "100%", background: "#fff", border: `1px solid ${T.borderMid}`,
          borderTop: "none", boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        }}>
          {matches.map((t, i) => (
            <button
              key={t}
              onClick={() => go(t)}
              style={{
                display: "block", width: "100%", textAlign: "left",
                fontFamily: T.mono, fontSize: 12, letterSpacing: "0.08em",
                padding: "8px 14px", border: "none", cursor: "pointer",
                transition: "background .1s",
                background: i === cur ? T.accentBg : "#fff",
                color: i === cur ? T.accent : T.body,
              }}
            >
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ active, onSelect, watchlist, onRemove }) {
  const [tab, setTab]     = useState("watch");
  const [filter, setFilter] = useState("");

  const allFiltered = TICKERS.filter(t => !filter || t.includes(filter.toUpperCase()));

  const tabStyle = (id) => ({
    flex: 1, fontFamily: T.mono, fontSize: 9, letterSpacing: "0.12em",
    padding: "10px 0", border: "none", cursor: "pointer",
    borderBottom: tab === id ? `2px solid ${T.accent}` : `2px solid transparent`,
    background: "transparent",
    color: tab === id ? T.accent : T.muted,
    transition: "color .15s",
  });

  return (
    <aside style={{
      width: 168, flexShrink: 0,
      borderRight: `1px solid ${T.border}`,
      display: "flex", flexDirection: "column",
      background: "#fff", overflow: "hidden",
    }}>
      {/* tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid ${T.border}` }}>
        <button style={tabStyle("watch")} onClick={() => setTab("watch")}>WATCH</button>
        <button style={tabStyle("all")}   onClick={() => setTab("all")}>ALL 100</button>
      </div>

      {tab === "watch" ? (
        <div style={{ flex: 1, overflowY: "auto" }}>
          {watchlist.length === 0 ? (
            <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, textAlign: "center", padding: "32px 12px", lineHeight: 2, letterSpacing: "0.08em" }}>
              SEARCH &amp; ADD<br />TICKERS TO<br />WATCHLIST
            </div>
          ) : watchlist.map(t => (
            <WatchItem key={t} ticker={t} active={t === active} onSelect={onSelect} onRemove={onRemove} />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
          <div style={{ padding: "8px", borderBottom: `1px solid ${T.border}` }}>
            <input
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Filter…"
              style={{
                width: "100%", fontFamily: T.mono, fontSize: 11,
                padding: "6px 10px", border: `1px solid ${T.border}`,
                outline: "none", color: T.body, background: T.surface,
                letterSpacing: "0.06em",
              }}
            />
          </div>
          <div style={{ overflowY: "auto", flex: 1, padding: "6px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              {allFiltered.map(t => (
                <button
                  key={t}
                  onClick={() => onSelect(t)}
                  style={{
                    fontFamily: T.mono, fontSize: 10, letterSpacing: "0.06em",
                    padding: "6px 4px", textAlign: "left", border: "none",
                    cursor: "pointer", transition: "all .1s",
                    background: t === active ? T.accentBg : "transparent",
                    color: t === active ? T.accent : T.label,
                    fontWeight: t === active ? 500 : 400,
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function WatchItem({ ticker, active, onSelect, onRemove }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={() => onSelect(ticker)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 14px", cursor: "pointer", transition: "background .1s",
        borderLeft: active ? `2px solid ${T.accent}` : "2px solid transparent",
        background: active ? T.accentBg : hov ? T.surface : "#fff",
      }}
    >
      <span style={{
        fontFamily: T.mono, fontSize: 11, letterSpacing: "0.08em",
        color: active ? T.accent : T.body, fontWeight: active ? 500 : 400,
      }}>
        {ticker}
      </span>
      {hov && (
        <button
          onClick={e => { e.stopPropagation(); onRemove(ticker); }}
          style={{
            fontFamily: T.mono, fontSize: 9, color: T.muted,
            border: "none", background: "none", cursor: "pointer", padding: "0 2px",
            transition: "color .1s",
          }}
          onMouseEnter={e => e.target.style.color = T.down}
          onMouseLeave={e => e.target.style.color = T.muted}
        >
          ✕
        </button>
      )}
    </div>
  );
}

// ─── Data Row ─────────────────────────────────────────────────────────────────
function DataRow({ label, value, valueColor, right = true }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "9px 0", borderBottom: `1px solid ${T.border}`,
    }}>
      <span style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.1em", color: T.label, textTransform: "uppercase" }}>
        {label}
      </span>
      <span style={{ fontFamily: T.mono, fontSize: 14, color: valueColor || T.body, fontWeight: 400 }}>
        {value}
      </span>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function Card({ label, children, right }) {
  return (
    <div style={{ border: `1px solid ${T.border}`, background: "#fff" }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 16px", borderBottom: `1px solid ${T.border}`,
      }}>
        <span style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: "0.14em", color: T.muted, textTransform: "uppercase" }}>
          {label}
        </span>
        {right && <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted }}>{right}</span>}
      </div>
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function QuantivaDashboard() {
  const [active,      setActive]      = useState("HOOD");
  const [data,        setData]        = useState(null);
  const [status,      setStatus]      = useState("idle");
  const [errMsg,      setErrMsg]      = useState("");
  const [updated,     setUpdated]     = useState("");
  const [watchlist,   setWatchlist]   = useState(["HOOD","AAPL","NVDA","TSLA","MSFT"]);
  const [sidebar,     setSidebar]     = useState(true);

  const fetchData = useCallback(async (sym) => {
    if (!sym) return;
    setStatus("loading"); setErrMsg("");
    try {
      const res  = await fetch(API + sym);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json); setStatus("live");
      setUpdated(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
    } catch (e) {
      setStatus("error"); setErrMsg(e.message); setData(null);
    }
  }, []);

  const pick = useCallback((sym) => { setActive(sym); fetchData(sym); }, [fetchData]);

  useEffect(() => { fetchData("HOOD"); }, []);

  const addWatch    = t => { if (!watchlist.includes(t)) setWatchlist(p => [t, ...p]); };
  const rmWatch     = t => setWatchlist(p => p.filter(x => x !== t));
  const inWatch     = watchlist.includes(active);

  const ohlcv     = data?.ohlcv?.[0]                  || {};
  const ind       = data?.indicators?.historical?.[0] || {};
  const latest    = data?.indicators?.latest;
  const anomalies = data?.anomalies                    || [];

  const close  = +ohlcv.close || 0;
  const openP  = +ohlcv.open  || 0;
  const chg    = close - openP;
  const chgPct = openP ? (chg / openP) * 100 : 0;
  const isUp   = chg >= 0;
  const rsi    = +ind.rsi || 0;

  const statusMeta = {
    idle:    { color: T.muted,   dot: T.muted,    text: "IDLE"    },
    loading: { color: "#d97706", dot: "#d97706",  text: "LOADING" },
    live:    { color: T.up,      dot: T.up,        text: "LIVE"    },
    error:   { color: T.down,    dot: T.down,      text: "ERROR"   },
  }[status];

  return (
    <div style={{ minHeight: "100vh", background: T.surface, fontFamily: T.sans, display: "flex", flexDirection: "column" }}>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", height: 52, borderBottom: `1px solid ${T.border}`,
        background: "#fff", flexShrink: 0, gap: 16,
      }}>
        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            onClick={() => setSidebar(s => !s)}
            style={{ fontFamily: T.mono, fontSize: 14, color: T.muted, border: "none", background: "none", cursor: "pointer", lineHeight: 1, padding: "0 4px", transition: "color .15s" }}
            onMouseEnter={e => e.target.style.color = T.body}
            onMouseLeave={e => e.target.style.color = T.muted}
          >
            ☰
          </button>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", cursor:"pointer", gap: 8 }} onClick={e=>window.location.href="/"}>
            <svg width="20" height="20" viewBox="0 0 28 28">
              <polygon points="14,2 25,8 25,20 14,26 3,20 3,8" fill={T.accent} />
            </svg>
            <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 500, letterSpacing: "0.18em", color: T.accent }}>
              QUANTIVA
            </span>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Search onSelect={pick} />
          {/* Status pill */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%", background: statusMeta.dot,
              animation: status === "loading" ? "pulse 1s ease-in-out infinite" : "none",
            }} />
            <span style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: "0.14em", color: statusMeta.color }}>
              {statusMeta.text}
            </span>
            {updated && <span style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginLeft: 4 }}>{updated}</span>}
          </div>
        </div>
      </header>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>

        {/* Sidebar */}
        {sidebar && (
          <Sidebar active={active} onSelect={pick} watchlist={watchlist} onRemove={rmWatch} />
        )}

        {/* Main scroll area */}
        <main style={{ flex: 1, overflowY: "auto", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Error banner */}
          {status === "error" && (
            <div style={{
              display: "flex", gap: 12, alignItems: "center",
              padding: "12px 16px", background: "#fef2f2", border: `1px solid ${T.downBorder}`,
            }}>
              <span style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.1em", color: T.down }}>ERR</span>
              <span style={{ fontFamily: T.mono, fontSize: 11, color: T.body }}>{errMsg}</span>
            </div>
          )}

          {/* Empty */}
          {!data && status === "idle" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 12, paddingTop: 80 }}>
              <svg width="36" height="36" viewBox="0 0 28 28" style={{ opacity: .2 }}>
                <polygon points="14,2 25,8 25,20 14,26 3,20 3,8" fill={T.accent} />
              </svg>
              <span style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: "0.14em", color: T.muted }}>
                SELECT OR SEARCH A TICKER
              </span>
            </div>
          )}

          {/* Skeleton */}
          {status === "loading" && !data && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[72, 64, 140, 200].map((h, i) => (
                <div key={i} style={{ height: h, background: T.border, animation: "pulse 1.4s ease-in-out infinite", animationDelay: `${i * .1}s` }} />
              ))}
            </div>
          )}

          {/* Data */}
          {data && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* ── Hero ── */}
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
                {/* Left */}
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: T.mono, fontSize: 44, fontWeight: 300, letterSpacing: "-0.01em", color: T.body, lineHeight: 1 }}>
                    {data.ticker}
                  </span>
                  <button
                    onClick={() => inWatch ? rmWatch(active) : addWatch(active)}
                    style={{
                      fontFamily: T.mono, fontSize: 9, letterSpacing: "0.12em",
                      padding: "5px 12px", border: `1px solid ${inWatch ? T.accent : T.borderMid}`,
                      background: inWatch ? T.accentBg : "#fff",
                      color: inWatch ? T.accent : T.label,
                      cursor: "pointer", transition: "all .15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accent; }}
                    onMouseLeave={e => { if (!inWatch) { e.currentTarget.style.borderColor = T.borderMid; e.currentTarget.style.color = T.label; } }}
                  >
                    {inWatch ? "★ WATCHING" : "☆ ADD TO WATCHLIST"}
                  </button>
                </div>
                {/* Right */}
                <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: T.mono, fontSize: 38, fontWeight: 300, color: T.body, lineHeight: 1 }}>
                    ${fmt(close)}
                  </span>
                  <span style={{
                    fontFamily: T.mono, fontSize: 12, fontWeight: 400,
                    padding: "4px 10px", letterSpacing: "0.04em",
                    background: isUp ? T.upBg : T.downBg,
                    color: isUp ? T.up : T.down,
                    border: `1px solid ${isUp ? T.upBorder : T.downBorder}`,
                  }}>
                    {isUp ? "+" : ""}{fmt(chg)} ({isUp ? "+" : ""}{fmt(chgPct)}%)
                  </span>
                </div>
              </div>

              {/* ── OHLCV stat strip ── */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", border: `1px solid ${T.border}`, background: "#fff" }}>
                {[
                  { label: "OPEN",   val: `${fmt(openP)}`,       color: T.body   },
                  { label: "HIGH",   val: `${fmt(ohlcv.high)}`,  color: T.up     },
                  { label: "LOW",    val: `${fmt(ohlcv.low)}`,   color: T.down   },
                  { label: "VOLUME", val: fmtVol(ohlcv.volume),  color: T.body   },
                ].map((s, i) => (
                  <div key={s.label} style={{
                    padding: "12px 16px",
                    borderRight: i < 3 ? `1px solid ${T.border}` : "none",
                  }}>
                    <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: "0.12em", color: T.muted, marginBottom: 4 }}>
                      {s.label}
                    </div>
                    <div style={{ fontFamily: T.mono, fontSize: 18, color: s.color, fontWeight: 400 }}>
                      {s.val}
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Sparkline ── */}
              <div style={{ height: 130, border: `1px solid ${T.border}`, background: "#fff", overflow: "hidden" }}>
                <Sparkline ohlcv={ohlcv} />
              </div>

              {/* ── Two-col ── */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

                {/* Indicators */}
                <Card label="Technical Indicators" right={fmtDate(ind.timestamp)}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: "0.1em", color: T.muted, marginBottom: 8, textTransform: "uppercase" }}>
                      RSI
                    </div>
                    <RSIGauge value={rsi} />
                  </div>
                  <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
                    {[
                      { label: "EMA", val: `$${fmt(ind.ema)}` },
                      { label: "SMA", val: `$${fmt(ind.sma)}` },
                    ].map(r => (
                      <div key={r.label} style={{
                        display: "flex", justifyContent: "space-between", padding: "7px 0",
                        borderBottom: `1px solid ${T.border}`,
                      }}>
                        <span style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.1em", color: T.label, textTransform: "uppercase" }}>{r.label}</span>
                        <span style={{ fontFamily: T.mono, fontSize: 14, color: T.body }}>{r.val}</span>
                      </div>
                    ))}
                  </div>
                  {latest?.rsi != null && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
                      <div style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: "0.12em", color: T.muted, marginBottom: 8 }}>LATEST SNAPSHOT</div>
                      {[
                        { label: "RSI", val: fmt(latest.rsi) },
                        { label: "EMA", val: `$${fmt(latest.ema)}` },
                        { label: "SMA", val: `$${fmt(latest.sma)}` },
                      ].map(r => (
                        <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${T.border}` }}>
                          <span style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.1em", color: T.label, textTransform: "uppercase" }}>{r.label}</span>
                          <span style={{ fontFamily: T.mono, fontSize: 13, color: T.body }}>{r.val}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Anomalies */}
                <Card label="Anomaly Alerts" right={
                  <span style={{
                    fontFamily: T.mono, fontSize: 9, letterSpacing: "0.1em",
                    padding: "2px 8px",
                    background: anomalies.length > 0 ? T.downBg : T.surface,
                    color:      anomalies.length > 0 ? T.down   : T.muted,
                    border: `1px solid ${anomalies.length > 0 ? T.downBorder : T.border}`,
                  }}>
                    {anomalies.length}
                  </span>
                }>
                  {anomalies.length === 0 ? (
                    <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted, textAlign: "center", padding: "24px 0", letterSpacing: "0.1em" }}>
                      NO ANOMALIES DETECTED
                    </div>
                  ) : anomalies.map((a, i) => {
                    const msg = a.message.replace(/Anomaly detected for \w+ on [^:]+: /, "");
                    return (
                      <div key={i} style={{
                        borderLeft: `2px solid ${T.down}`, background: T.downBg,
                        padding: "10px 12px", marginBottom: 8,
                      }}>
                        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.muted, marginBottom: 4, letterSpacing: "0.06em" }}>
                          {fmtDate(a.date)}
                        </div>
                        <div style={{ fontFamily: T.sans, fontSize: 12, color: T.body, lineHeight: 1.5 }}>
                          {msg}
                        </div>
                        <div style={{ fontFamily: T.mono, fontSize: 13, color: T.down, marginTop: 4 }}>
                          ${fmt(a.price)}
                        </div>
                      </div>
                    );
                  })}
                </Card>
              </div>

              {/* ── OHLCV table ── */}
              <Card label="OHLCV Record" right={fmtDate(ohlcv.timestamp)}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.mono }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                      {["Field", "Value"].map((h, i) => (
                        <th key={h} style={{
                          textAlign: i === 0 ? "left" : "right",
                          fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
                          color: T.muted, paddingBottom: 8, fontWeight: 500,
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: "Open",   val: `$${fmt(openP)}`,        color: T.body },
                      { label: "High",   val: `$${fmt(ohlcv.high)}`,   color: T.up   },
                      { label: "Low",    val: `$${fmt(ohlcv.low)}`,    color: T.down },
                      { label: "Close",  val: `$${fmt(ohlcv.close)}`,  color: T.accent },
                      { label: "Volume", val: fmtVol(ohlcv.volume),    color: T.body },
                    ].map(row => (
                      <tr key={row.label} style={{ borderBottom: `1px solid ${T.border}` }}>
                        <td style={{ padding: "9px 0", fontSize: 11, color: T.label, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                          {row.label}
                        </td>
                        <td style={{ padding: "9px 0", fontSize: 14, color: row.color, textAlign: "right" }}>
                          {row.val}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>

            </div>
          )}
        </main>
      </div>

      <style>{`
        @keyframes pulse {
          0%,100% { opacity:1; }
          50%      { opacity:.5; }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 0; }
        ::-webkit-scrollbar-thumb:hover { background: ${T.borderMid}; }
      `}</style>
    </div>
  );
}