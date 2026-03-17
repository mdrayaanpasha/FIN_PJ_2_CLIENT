# Arbit — Client Dashboard

Frontend for the Quantiva pipeline. Three-route SPA built with React + TailwindCSS, deployed on Vercel.

**Live:** https://arbit-finance.vercel.app/

---

## Routes

| Path         | Component            | Purpose                                      |
|--------------|----------------------|----------------------------------------------|
| `/`          | `QuantivaHome`       | Landing page — pipeline overview             |
| `/dashboard` | `QuantivaDashboard`  | Live ticker analysis — OHLCV, SMA/EMA/RSI, anomalies |
| `/links`     | `Links`              | Service endpoint references                  |

---

## Stack

| Layer    | Technology                  |
|----------|-----------------------------|
| Runtime  | React 18 (JSX)              |
| Styling  | TailwindCSS                 |
| Routing  | React Router v6             |
| Deploy   | Vercel                      |

---

## Data Source

All data fetched from `s_4` (persistence service) at port 3003. The dashboard consumes `/data/:ticker` which returns historical OHLCV, computed indicators, and live anomalies in one response.

---

## Running

```bash
npm install
npm run dev
```

```bash
# Production build
npm run build
```

Vercel deploys automatically on push to `main`.

---

## Structure

```
src/
├── App.jsx
└── pages/
    ├── home/main.jsx        # QuantivaHome
    ├── analysis/main.jsx    # QuantivaDashboard
    └── links/main.jsx       # Links
```
