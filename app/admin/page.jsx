"use client";
import { useEffect, useState, useMemo } from "react";
import { Play } from "lucide-react";
import { BRAND } from "../../lib/brand";

const TABS = [
  { key: "casinos", label: "Casinolar", fields: ["name", "slug", "website", "logo", "description", "share7d", "volume7d", "deposits7d", "trustScore", "sentiment"], main: "name" },
  { key: "streamers", label: "Yayıncılar", fields: ["handle", "slug", "platform", "casino", "bio", "channelUrl", "telegram", "twitter", "youtube", "title", "viewers", "live"], main: "handle" },
  { key: "transactions", label: "İşlemler", fields: ["casino", "chain", "type", "amountUsd", "tx"], main: "casino" },
  { key: "reviews", label: "Casino Yorumları", fields: ["casino", "author", "rating", "text", "verified", "approved"], main: "author" },
  { key: "streamerReviews", label: "Yayıncı Yorumları", fields: ["streamer", "author", "rating", "text", "approved"], main: "author" },
  { key: "wallets", label: "İzlenen Cüzdanlar", fields: ["casino", "chain", "address"], main: "casino" },
  { key: "kickChannels", label: "Kick Kanalları", fields: ["slug"], main: "slug" }
];

const NUMERIC = new Set(["share7d", "volume7d", "deposits7d", "trustScore", "sentiment", "viewers", "amountUsd", "rating"]);
const BOOLEAN = new Set(["live", "verified", "approved"]);

function fmtUsd(n) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}Mr`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n || 0}`;
}
function timeAgo(ts) {
  if (!ts) return "";
  const s = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (s < 60) return `${s}sn önce`;
  if (s < 3600) return `${Math.floor(s / 60)}dk önce`;
  if (s < 86400) return `${Math.floor(s / 3600)}sa önce`;
  return `${Math.floor(s / 86400)}g önce`;
}

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [view, setView] = useState("overview"); // overview | tab key
  const [stats, setStats] = useState(null);

  async function login() {
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    if (res.ok) { setAuthed(true); loadStats(); }
    else setError("Hatalı parola. Varsayılan: admin123 (ADMIN_PASSWORD ile değiştirin)");
  }
  async function logout() {
    await fetch("/api/auth/login", { method: "DELETE" });
    setAuthed(false); setPassword(""); setStats(null); setView("overview");
  }
  async function loadStats() {
    const res = await fetch("/api/admin/stats", { cache: "no-store" });
    if (res.status === 401) return setAuthed(false);
    if (res.ok) setStats(await res.json());
  }

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto px-4 py-24">
        <div className="panel p-6">
          <h1 className="text-xl font-bold text-bone mb-1">Operatör girişi</h1>
          <p className="text-xs text-mute mb-4 font-mono">Yönetim paneline erişmek için giriş yap.</p>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()} placeholder="Parola"
            className="w-full bg-ink border border-edge rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:border-mint/60" />
          {error && <p className="text-chip text-xs mt-2">{error}</p>}
          <button onClick={login} className="mt-4 w-full bg-mint text-ink font-semibold text-sm rounded-md py-2 hover:opacity-90">Giriş yap</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-bone">Yönetim paneli</h1>
          <p className="text-xs text-mute font-mono">{BRAND.name} operatör kontrol merkezi</p>
        </div>
        <button onClick={logout} className="text-xs font-mono border border-edge rounded-md px-3 py-1.5 text-mute hover:text-chip hover:border-chip/50">Çıkış yap</button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        <NavBtn active={view === "overview"} onClick={() => { setView("overview"); loadStats(); }}>Genel Bakış</NavBtn>
        {TABS.map((t) => (
          <NavBtn key={t.key} active={view === t.key} onClick={() => setView(t.key)}>
            {t.label}
            {t.key === "reviews" && stats?.counts.pendingReviews > 0 && (
              <span className="ml-1.5 bg-chip text-ink rounded-full px-1.5 text-[10px]">{stats.counts.pendingReviews}</span>
            )}
          </NavBtn>
        ))}
      </div>

      {view === "overview"
        ? <Overview stats={stats} reload={loadStats} onJump={setView} />
        : <Manager tab={TABS.find((t) => t.key === view)} onChange={loadStats} onLogout={() => setAuthed(false)} />}
    </div>
  );
}

function NavBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} className={`text-sm rounded-md px-3 py-1.5 border flex items-center ${active ? "bg-mint text-ink border-mint font-semibold" : "border-edge text-mute hover:text-bone2"}`}>
      {children}
    </button>
  );
}

/* ---------------- GENEL BAKIŞ ---------------- */
function Overview({ stats, reload, onJump }) {
  const [running, setRunning] = useState("");
  const [runMsg, setRunMsg] = useState("");
  const [wAddr, setWAddr] = useState("");
  const [wChain, setWChain] = useState("ETH");
  const [wState, setWState] = useState({ busy: false, err: "", related: null });

  async function runCron(which) {
    setRunning(which); setRunMsg("");
    try {
      const res = await fetch(`/api/cron/${which}`, { cache: "no-store" });
      const data = await res.json();
      if (which === "streamers") setRunMsg(`Yayıncılar güncellendi: ${data.updated} otomatik, ${data.kept_manual} elle. ${data.report?.twitch || ""} · ${data.report?.kick || ""}`);
      else setRunMsg(`Zincir tarandı: ${data.new_txs} yeni işlem. ${data.errors?.length ? "Uyarı: " + data.errors.join("; ") : ""}`);
      reload();
    } catch (e) { setRunMsg("Hata: " + e.message); }
    setRunning("");
  }

  async function exploreWallet() {
    if (!wAddr.trim()) return;
    setWState({ busy: true, err: "", related: null });
    try {
      const res = await fetch("/api/admin/wallet-explore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: wAddr.trim(), chain: wChain })
      });
      const data = await res.json();
      if (!res.ok) { setWState({ busy: false, err: data.error || "Keşif başarısız.", related: null }); return; }
      setWState({ busy: false, err: "", related: data.related });
    } catch (e) {
      setWState({ busy: false, err: e.message, related: null });
    }
  }

  if (!stats) return <div className="text-mute text-sm font-mono">Yükleniyor…</div>;
  const c = stats.counts;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="Casinolar" value={c.casinos} onClick={() => onJump("casinos")} />
        <StatBox label="Yayıncılar" value={c.streamers} sub={`${c.liveStreamers} canlı · ${c.autoStreamers} otomatik`} onClick={() => onJump("streamers")} />
        <StatBox label="İşlemler" value={c.transactions} sub={fmtUsd(stats.totalVolume) + " toplam"} onClick={() => onJump("transactions")} />
        <StatBox label="Bekleyen yorum" value={c.pendingReviews} accent={c.pendingReviews > 0 ? "text-chip" : "text-mint"} sub={`${c.reviews} toplam`} onClick={() => onJump("reviews")} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="panel p-4">
          <div className="panel-title mb-3">Veri çekme kontrolü</div>
          <p className="text-xs text-mute mb-3">Cron otomatik çalışır; buradan elle de tetikleyebilirsin.</p>
          <div className="flex gap-2">
            <button onClick={() => runCron("streamers")} disabled={running} className="flex-1 inline-flex items-center justify-center gap-1.5 bg-edge hover:bg-edge/70 text-bone2 text-sm rounded-md py-2 disabled:opacity-50">
              {running === "streamers" ? "Çekiliyor…" : <><Play size={13} strokeWidth={2} /> Yayıncıları çek</>}
            </button>
            <button onClick={() => runCron("chain")} disabled={running} className="flex-1 inline-flex items-center justify-center gap-1.5 bg-edge hover:bg-edge/70 text-bone2 text-sm rounded-md py-2 disabled:opacity-50">
              {running === "chain" ? "Çekiliyor…" : <><Play size={13} strokeWidth={2} /> Zinciri tara</>}
            </button>
          </div>
          {runMsg && <p className="text-xs text-mint font-mono mt-3 leading-relaxed">{runMsg}</p>}
          <div className="mt-4 pt-3 border-t border-edge grid grid-cols-2 gap-2 text-xs font-mono text-mute">
            <span>İzlenen cüzdan: <b className="text-bone2">{c.wallets}</b></span>
            <span>Kick kanalı: <b className="text-bone2">{c.kickChannels}</b></span>
          </div>
        </div>

        <div className="panel p-4">
          <div className="panel-title mb-3">Son işlemler</div>
          <ul className="divide-y divide-edge">
            {stats.recentTx.map((t) => (
              <li key={t.id} className="flex items-center gap-2 py-2 text-xs font-mono">
                <span className={t.type === "deposit" ? "text-mint" : "text-chip"}>{t.type === "deposit" ? "▲" : "▼"}</span>
                <span className="text-bone2">{t.casino}</span>
                <span className="text-mute">{t.chain}</span>
                <span className="text-gold ml-auto">{fmtUsd(t.amountUsd)}</span>
              </li>
            ))}
            {!stats.recentTx.length && <li className="text-mute text-xs py-2">Kayıt yok.</li>}
          </ul>
        </div>
      </div>

      <div className="panel p-4">
        <div className="panel-title mb-1">Cüzdan keşfi</div>
        <p className="text-xs text-mute mb-3">
          Bir sıcak cüzdan adresi gir; en çok stablecoin transferi yaptığı diğer adresleri gör. Casinonun cüzdan kümesini haritalamak için kullan.
        </p>
        <div className="flex gap-2">
          <select value={wChain} onChange={(e) => setWChain(e.target.value)}
            className="bg-ink border border-edge rounded-md px-2 py-2 text-sm font-mono">
            <option value="ETH">ETH</option>
            <option value="TRX">TRX</option>
          </select>
          <input value={wAddr} onChange={(e) => setWAddr(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && exploreWallet()}
            placeholder="0x… veya T…"
            className="flex-1 bg-ink border border-edge rounded-md px-2 py-2 text-sm font-mono focus:outline-none focus:border-mint/60" />
          <button onClick={exploreWallet} disabled={wState.busy}
            className="bg-edge hover:bg-edge/70 text-bone2 text-sm rounded-md px-4 disabled:opacity-50">
            {wState.busy ? "…" : "Keşfet"}
          </button>
        </div>
        {wState.err && <p className="text-chip text-xs mt-2 font-mono">{wState.err}</p>}
        {wState.related && (
          <div className="mt-3 overflow-x-auto">
            {wState.related.length === 0 ? (
              <p className="text-xs text-mute">İlişkili adres bulunamadı (stablecoin transferi yok ya da adres boş).</p>
            ) : (
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="text-left text-mute border-b border-edge">
                    <th className="p-2">İlişkili adres</th>
                    <th className="p-2">İşlem</th>
                    <th className="p-2">Toplam hacim</th>
                    <th className="p-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-edge">
                  {wState.related.map((r) => (
                    <tr key={r.address}>
                      <td className="p-2 text-bone2">{r.short}</td>
                      <td className="p-2 text-mute">{r.count}</td>
                      <td className="p-2 text-gold">${r.volume.toLocaleString("tr-TR")}</td>
                      <td className="p-2 text-right">
                        <button onClick={() => { setWAddr(r.address); }}
                          className="text-mint hover:underline">bunu keşfet</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <p className="text-[10px] font-mono text-mute mt-2">
              En çok hacimli adresler genelde casinonun kendi cold/işlemci cüzdanlarıdır. "bunu keşfet" ile zinciri genişletebilirsin.
            </p>
          </div>
        )}
      </div>

      <div className="panel p-4">
        <div className="panel-title mb-3">Aktivite günlüğü</div>
        <ul className="divide-y divide-edge">
          {(stats.log || []).map((l) => (
            <li key={l.id} className="flex items-center justify-between py-2 text-xs">
              <span className="text-bone2">{l.message}</span>
              <span className="text-mute font-mono shrink-0 ml-3">{timeAgo(l.ts)}</span>
            </li>
          ))}
          {!(stats.log || []).length && <li className="text-mute text-xs py-2">Henüz aktivite yok.</li>}
        </ul>
      </div>
    </div>
  );
}

function StatBox({ label, value, sub, accent, onClick }) {
  return (
    <button onClick={onClick} className="panel p-4 text-left hover:border-mint/40 transition">
      <div className="panel-title mb-2">{label}</div>
      <div className={`font-mono text-2xl font-semibold ${accent || "text-bone"}`}>{value}</div>
      {sub && <div className="text-[10px] text-mute mt-1 font-mono">{sub}</div>}
    </button>
  );
}

/* ---------------- KOLEKSİYON YÖNETİCİSİ ---------------- */
function Manager({ tab, onChange, onLogout }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [importUrl, setImportUrl] = useState("");
  const [importState, setImportState] = useState({ busy: false, msg: "", err: "" });

  async function runImport() {
    if (!importUrl.trim()) return;
    setImportState({ busy: true, msg: "", err: "" });
    try {
      const res = await fetch("/api/admin/import-casino", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: importUrl })
      });
      const data = await res.json();
      if (res.status === 401) return onLogout();
      if (!res.ok) { setImportState({ busy: false, msg: "", err: data.error || "Çekilemedi." }); return; }
      const d = data.data;
      // formu ön-doldur (mevcut boş alanlar dolar, kullanıcı düzenleyebilir)
      setForm((f) => ({
        ...f,
        name: d.name || f.name || "",
        slug: d.slug || f.slug || "",
        website: d.website || "",
        logo: d.logo || "",
        description: d.description || ""
      }));
      const chainNote = d.chains?.length ? ` · Zincirler: ${d.chains.join(", ")}` : "";
      setImportState({ busy: false, msg: `Çekildi: ${d.name}${chainNote}. Formu kontrol edip cüzdan verisini ayrıca ekle.`, err: "" });
    } catch (e) {
      setImportState({ busy: false, msg: "", err: e.message });
    }
  }

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/${tab.key}`, { cache: "no-store" });
    if (res.status === 401) return onLogout();
    setItems(await res.json());
    setSelected(new Set());
    setLoading(false);
  }
  useEffect(() => { load(); setForm({}); setEditId(null); setQuery(""); /* eslint-disable-next-line */ }, [tab.key]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter((it) => tab.fields.some((f) => String(it[f] ?? "").toLowerCase().includes(q)));
  }, [items, query, tab]);

  function coerce(field, value) {
    if (NUMERIC.has(field)) return Number(value) || 0;
    if (BOOLEAN.has(field)) return value === true || value === "true";
    return value;
  }
  async function save() {
    setBusy(true);
    const payload = {};
    for (const f of tab.fields) payload[f] = coerce(f, form[f] ?? "");
    if (editId) payload.id = editId;
    const res = await fetch(`/api/${tab.key}`, {
      method: editId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setBusy(false);
    if (res.status === 401) return onLogout();
    setForm({}); setEditId(null); load(); onChange();
  }
  async function remove(id) {
    if (!confirm("Bu kaydı silmek istediğine emin misin?")) return;
    const res = await fetch(`/api/${tab.key}`, {
      method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id })
    });
    if (res.status === 401) return onLogout();
    load(); onChange();
  }
  async function bulk(action, patch) {
    const ids = [...selected];
    if (!ids.length) return;
    const label = action === "delete" ? `${ids.length} kaydı sil` : `${ids.length} kaydı güncelle`;
    if (!confirm(`${label}?`)) return;
    const res = await fetch("/api/admin/bulk", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collection: tab.key, ids, action, patch })
    });
    if (res.status === 401) return onLogout();
    load(); onChange();
  }
  function startEdit(item) {
    setEditId(item.id);
    const f = {};
    for (const key of tab.fields) f[key] = item[key];
    setForm(f);
  }
  function toggle(id) {
    const n = new Set(selected);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelected(n);
  }
  function toggleAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((x) => x.id)));
  }

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      {/* form */}
      <div className="panel p-4 h-fit">
        <h2 className="panel-title mb-3">{editId ? "Kaydı düzenle" : "Yeni kayıt ekle"}</h2>

        {tab.key === "casinos" && !editId && (
          <div className="mb-4 pb-4 border-b border-edge">
            <label className="text-[10px] font-mono uppercase text-mute">URL'den içe aktar</label>
            <div className="flex gap-2 mt-1">
              <input
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runImport()}
                placeholder="ornek-casino.com"
                className="flex-1 bg-ink border border-edge rounded-md px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-mint/60"
              />
              <button onClick={runImport} disabled={importState.busy}
                className="bg-edge hover:bg-edge/70 text-bone2 text-xs rounded-md px-3 disabled:opacity-50">
                {importState.busy ? "…" : "Çek"}
              </button>
            </div>
            {importState.err && <p className="text-chip text-[11px] mt-2">{importState.err}</p>}
            {importState.msg && <p className="text-mint text-[11px] mt-2 leading-relaxed">{importState.msg}</p>}
            <p className="text-[10px] font-mono text-mute mt-2">
              Casino sitesinin adresini gir; isim, logo, açıklama ve zincirler otomatik dolar. Cüzdan adresini ayrıca "İzlenen Cüzdanlar"dan ekle.
            </p>
          </div>
        )}

        <div className="space-y-2">
          {tab.fields.map((f) => (
            <div key={f}>
              <label className="text-[10px] font-mono uppercase text-mute">{f}</label>
              {BOOLEAN.has(f) ? (
                <select value={String(form[f] ?? "false")} onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                  className="w-full bg-ink border border-edge rounded-md px-2 py-1.5 text-sm font-mono">
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              ) : f === "text" || f === "title" ? (
                <textarea value={form[f] ?? ""} onChange={(e) => setForm({ ...form, [f]: e.target.value })} rows={2}
                  className="w-full bg-ink border border-edge rounded-md px-2 py-1.5 text-sm resize-none focus:outline-none focus:border-mint/60" />
              ) : (
                <input value={form[f] ?? ""} onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                  className="w-full bg-ink border border-edge rounded-md px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-mint/60" />
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={save} disabled={busy} className="flex-1 bg-mint text-ink font-semibold text-sm rounded-md py-2 hover:opacity-90 disabled:opacity-50">
            {editId ? "Kaydet" : "Ekle"}
          </button>
          {editId && <button onClick={() => { setEditId(null); setForm({}); }} className="text-xs font-mono border border-edge rounded-md px-3 text-mute">Vazgeç</button>}
        </div>
      </div>

      {/* liste */}
      <div className="panel p-4 lg:col-span-2">
        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
          <h2 className="panel-title">{tab.label} · {filtered.length}/{items.length}</h2>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ara…"
            className="bg-ink border border-edge rounded-md px-2 py-1 text-xs font-mono w-40 focus:outline-none focus:border-mint/60" />
        </div>

        {selected.size > 0 && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-ink rounded-md flex-wrap">
            <span className="text-xs font-mono text-mute">{selected.size} seçili</span>
            {(tab.key === "reviews" || tab.key === "streamerReviews") && (
              <button onClick={() => bulk("patch", { approved: true })} className="text-xs font-mono text-mint hover:underline">✓ Onayla</button>
            )}
            {tab.key === "streamers" && (
              <button onClick={() => bulk("patch", { live: false })} className="text-xs font-mono text-gold hover:underline">Çevrimdışı yap</button>
            )}
            <button onClick={() => bulk("delete")} className="text-xs font-mono text-chip hover:underline ml-auto">Seçilenleri sil</button>
          </div>
        )}

        {loading ? (
          <div className="text-mute text-xs font-mono py-6">Yükleniyor…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="text-left text-mute border-b border-edge">
                  <th className="p-2 w-6"><input type="checkbox" checked={filtered.length > 0 && selected.size === filtered.length} onChange={toggleAll} /></th>
                  {tab.fields.slice(0, 4).map((f) => <th key={f} className="p-2 uppercase text-[10px]">{f}</th>)}
                  <th className="p-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-edge">
                {filtered.map((item) => (
                  <tr key={item.id} className={selected.has(item.id) ? "bg-mint/5" : ""}>
                    <td className="p-2"><input type="checkbox" checked={selected.has(item.id)} onChange={() => toggle(item.id)} /></td>
                    {tab.fields.slice(0, 4).map((f) => (
                      <td key={f} className="p-2 text-bone2 max-w-[160px] truncate">
                        {BOOLEAN.has(f)
                          ? (item[f] ? <span className="text-mint">✓</span> : <span className="text-mute">✗</span>)
                          : String(item[f] ?? "")}
                      </td>
                    ))}
                    <td className="p-2 text-right whitespace-nowrap">
                      <button onClick={() => startEdit(item)} className="text-mint hover:underline mr-3">Düzenle</button>
                      <button onClick={() => remove(item.id)} className="text-chip hover:underline">Sil</button>
                    </td>
                  </tr>
                ))}
                {!filtered.length && <tr><td colSpan={6} className="p-4 text-center text-mute">Kayıt bulunamadı.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
