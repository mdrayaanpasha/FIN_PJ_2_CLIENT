import React from 'react';

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

const ExternalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
  </svg>
);

const SERVICES = [
  { id: "Service 1", name: "Producer", desc: "Fetches OHLCV data every minute via cron.", github: "https://github.com/mdrayaanpasha/FIN_PIP_SERVER_1", url: "https://fin-pip-server-1.onrender.com/", host: "Render" },
  { id: "Service 2", name: "Anomaly Detector", desc: "Flags price moves greater than 5%.", github: "https://github.com/mdrayaanpasha/FIN_PIP_SERVER_2", url: "https://fin-pip-server-2.onrender.com/", host: "Render" },
  { id: "Service 3", name: "Indicators", desc: "Computes SMA, EMA, and RSI metrics.", github: "https://github.com/mdrayaanpasha/FIN_PIP_SERVER_3", url: "https://fin-pip-server-3.onrender.com/", host: "Render" },
  { id: "Service 4", name: "Persistence & API", desc: "Unified REST API with Prisma & PostgreSQL.", github: "https://github.com/mdrayaanpasha/FIN_PIP_SERVER_4", url: "https://fin-pip-server-4.onrender.com/", host: "Render" },
  { id: "Client", name: "Dashboard", desc: "Live React frontend for data visualization.", github: "https://github.com/mdrayaanpasha/FIN_PJ_2_CLIENT", url: "https://arbit-finance.vercel.app/", host: "Vercel", primary: true },
];

export default function Links() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col items-center py-12 px-6">
      
      {/* Header */}
      <div className="w-full max-w-2xl mb-10 text-center">
        <h1 className="text-3xl font-black tracking-tight italic">ARBIT<span className="text-blue-600">.</span></h1>
        <p className="text-sm text-zinc-500 mt-2">Distributed microservices pipeline for financial data.</p>
        
        <div className="mt-6 inline-flex items-center gap-2 bg-amber-100/50 text-amber-800 px-4 py-1.5 rounded-full text-[11px] font-bold border border-amber-200">
          <span>⚠️</span> Render backends cold-start (30s delay)
        </div>
      </div>

      {/* Services List */}
      <div className="w-full max-w-2xl space-y-3">
        {SERVICES.map((s) => (
          <div key={s.id} className="group bg-white p-5 rounded-2xl border border-zinc-200 hover:shadow-md transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold bg-zinc-900 text-white px-2 py-0.5 rounded uppercase">{s.id}</span>
                  <h2 className="font-bold text-base">{s.name}</h2>
                </div>
                <p className="text-xs text-zinc-500 mt-1">{s.desc}</p>
              </div>

              <div className="flex gap-2">
                <a href={s.github} target="_blank" className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl text-xs font-bold transition-transform active:scale-95">
                  <GitHubIcon /> GitHub
                </a>
                <a href={s.url} target="_blank" className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-transform active:scale-95 border
                  ${s.primary ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700' : 'bg-white border-zinc-200 hover:border-zinc-900'}`}>
                  <ExternalIcon /> {s.host}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tech Stack Footer */}
      <footer className="mt-12 text-center">
        <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest bg-zinc-100 px-4 py-2 rounded-full border border-zinc-200">
          Node.js • Kafka • Redis • PostgreSQL • Prisma • React
        </div>
        <p className="mt-6 text-[11px] text-zinc-400">Built by Rayaan Pasha</p>
      </footer>
    </div>
  );
}