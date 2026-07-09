"use client";
import { useEffect, useState } from "react";

export default function OperatorPanel() {
  const [authed, setAuthed] = useState(null);
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/operator/data", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { setData(d); setAuthed(true); })
      .catch(() => setAuthed(false));
  }, []);

  async function login() {
    setErr("");
    const res = await fetch("/api/operator/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    if (res.ok) {
      const d = await fetch("/api/operator/data", { cache: "no-store" }).then((r) => r.json());
      setData(d); setAuthed(true);
    } else setErr("Hatalı şifre. Demo için: operator123");
  }

  if (authed === null) return <div className="max-w-md mx-auto px-4 py-24 text-center text-mute font-mono text-sm">Yükleniyor…</div>;

  if (!authed) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="panel p-6">
          <h1 className="text-xl font-bold text-bone">Operatör Girişi</h1>
          <p className="text-sm text-mute mt-1 mb-4">B2B paneline erişmek için giriş yapın. Demo şifresi: <span className="font-mono text-mint">operator123</span></p>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()} placeholder="Şifre"
            className="w-full bg-ink border border-edge rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:border-mint/60" />
          {err && <p className="text-chip text-xs mt-2">{err}</p>}
          <button onClick={login} className="w-full bg-mint text-ink font-semibold text-sm rounded-md py-2 mt-3 hover:opacity-90">Giriş yap</button>
          <p className="text-[11px] font-mono text-mute mt-4 text-center">
            Operatör hesabı için <a href="/for-operators" className="text-mint hover:underline">teklif iste →</a>
          </p>
        </div>
      </div>
    );
  }

  return <OperatorDashboard data={data} onLogout={() => { fetch("/api/operator/login", { method: "DELETE" }); setAuthed(false); }} />;
}

function OperatorDashboard({ data, onLogout }) {
  const [tab, setTab] = useState("overview");
  const tabs = [
    ["overview", "Genel Bakış"],
    ["competitors", "Rakipler"],
    ["streamers", "Yayıncılar"],
    ["alerts", "Uyarılar"],
    ["reports", "Raporlar"]
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-bone">Operatör Paneli</h1>
          <p className="text-xs text-mute font-mono">Demo hesap · örnek veri</p>
        </div>
        <button onClick={onLogout} className="text-xs font-mono text-mute hover:text-chip">Çıkış</button>
      </div>

      <div className="flex gap-1 border-b border-edge mb-6 overflow-x-auto">
        {tabs.map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-4 py-2 text-sm whitespace-nowrap border-b-2 -mb-px transition ${tab === k ? "border-mint text-bone" : "border-transparent text-mute hover:text-bone2"}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid md:grid-cols-4 gap-4">
          {data.overview.map((o) => (
            <div key={o.label} className="panel p-4">
              <div className="panel-title mb-2">{o.label}</div>
              <div className={`stat-num ${o.accent || ""}`}>{o.value}</div>
              {o.sub && <div className={`text-xs font-mono mt-1 ${o.up ? "text-mint" : "text-chip"}`}>{o.sub}</div>}
            </div>
          ))}
        </div>
      )}

      {tab === "competitors" && (
        <div className="panel p-4 overflow-x-auto">
          <h2 className="panel-title mb-3">Rakip karşılaştırması</h2>
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-left text-xs font-mono uppercase text-mute border-b border-edge">
                <th className="p-2">Casino</th><th className="p-2">7g Hacim</th><th className="p-2">Pazar payı</th>
                <th className="p-2">Güven</th><th className="p-2">Yayıncı</th><th className="p-2">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-edge">
              {data.competitors.map((c) => (
                <tr key={c.name}>
                  <td className="p-2 text-bone2">{c.name}{c.you && <span className="ml-2 text-[10px] font-mono text-mint">SİZ</span>}</td>
                  <td className="p-2 font-mono text-gold">{c.volume}</td>
                  <td className="p-2 font-mono text-mute">{c.share}</td>
                  <td className="p-2 font-mono text-bone2">{c.trust}</td>
                  <td className="p-2 font-mono text-mute">{c.streamers}</td>
                  <td className={`p-2 font-mono ${c.change >= 0 ? "text-mint" : "text-chip"}`}>{c.change >= 0 ? "▲" : "▼"} {Math.abs(c.change)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "streamers" && (
        <div className="panel p-4">
          <h2 className="panel-title mb-3">Yayıncı istihbaratı</h2>
          <ul className="divide-y divide-edge">
            {data.streamers.map((s) => (
              <li key={s.handle} className="py-3 flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-sm text-bone2">{s.handle} <span className="text-[10px] font-mono text-mute">{s.platform}</span></div>
                  <div className="text-xs text-mute">{s.casino} · fit skoru {s.fit}/100</div>
                </div>
                <span className="font-mono text-xs text-bone2">{s.viewers}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "alerts" && (
        <div className="space-y-2">
          {data.alerts.map((a, i) => (
            <div key={i} className={`panel p-4 border-l-2 ${a.level === "high" ? "border-chip" : a.level === "med" ? "border-gold" : "border-mint"}`}>
              <div className="text-sm text-bone2">{a.text}</div>
              <div className="text-[10px] font-mono text-mute mt-1">{a.time}</div>
            </div>
          ))}
        </div>
      )}

      {tab === "reports" && (
        <div className="grid md:grid-cols-2 gap-4">
          {data.reports.map((r) => (
            <div key={r.title} className="panel p-5">
              <h3 className="font-semibold text-bone">{r.title}</h3>
              <p className="text-sm text-mute mt-1">{r.desc}</p>
              <button className="mt-3 text-xs font-mono text-mint hover:underline">İndir (demo) →</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
