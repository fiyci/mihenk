"use client";
import { useState } from "react";

export function StreamerReviewForm({ streamerHandle }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");
  const [state, setState] = useState({ busy: false, msg: "", err: "" });

  async function submit() {
    setState({ busy: true, msg: "", err: "" });
    const res = await fetch("/api/streamerReviews/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ streamer: streamerHandle, rating, author, text })
    });
    const data = await res.json();
    if (res.ok) {
      setState({ busy: false, msg: data.message, err: "" });
      setText(""); setRating(0); setAuthor("");
    } else {
      setState({ busy: false, msg: "", err: data.error || "Bir hata oluştu." });
    }
  }

  return (
    <div className="panel p-4">
      <h2 className="panel-title mb-3">Bu yayıncıyı değerlendir</h2>
      <div className="space-y-3">
        <div>
          <label className="text-[10px] font-mono uppercase text-mute block mb-1">Puanın</label>
          <div className="flex gap-1 text-2xl">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setRating(n)} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
                className={(hover || rating) >= n ? "text-gold" : "text-edge"} aria-label={`${n} yıldız`}>★</button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[10px] font-mono uppercase text-mute block mb-1">Takma adın (opsiyonel)</label>
          <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="anonim" maxLength={40}
            className="w-full bg-ink border border-edge rounded-md px-2 py-2 text-sm font-mono" />
        </div>
        <div>
          <label className="text-[10px] font-mono uppercase text-mute block mb-1">Yorumun</label>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={600}
            placeholder="Yayın kalitesi, şeffaflık, davranış… gözlemini paylaş."
            className="w-full bg-ink border border-edge rounded-md px-2 py-2 text-sm resize-none" />
          <div className="text-[10px] font-mono text-mute text-right">{text.length}/600</div>
        </div>
        {state.err && <p className="text-chip text-xs">{state.err}</p>}
        {state.msg && <p className="text-mint text-xs">{state.msg}</p>}
        <button onClick={submit} disabled={state.busy}
          className="w-full bg-mint text-ink font-semibold text-sm rounded-md py-2 hover:opacity-90 disabled:opacity-50">
          {state.busy ? "Gönderiliyor…" : "Yorumu gönder"}
        </button>
        <p className="text-[10px] font-mono text-mute text-center">
          Yorumlar AI moderasyonundan geçer. Yalnızca gerçek gözlemlerini paylaş.
        </p>
      </div>
    </div>
  );
}

export function StreamerReviewCard({ review }) {
  const [votes, setVotes] = useState({ helpful: review.helpful || 0, notHelpful: review.notHelpful || 0 });
  const [voted, setVoted] = useState(false);

  async function vote(kind) {
    if (voted) return;
    setVoted(true);
    setVotes((v) => ({ ...v, [kind]: v[kind] + 1 }));
    await fetch("/api/streamerReviews/vote", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: review.id, kind })
    });
  }

  return (
    <li className="py-3">
      <div className="flex items-center gap-2 text-xs font-mono flex-wrap">
        <span className="text-mute">{review.author}</span>
        <span className="text-gold">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
      </div>
      <p className="text-sm text-slate-300 mt-1">{review.text}</p>
      <div className="flex items-center gap-3 mt-2 text-xs font-mono">
        <button onClick={() => vote("helpful")} disabled={voted} className="text-mute hover:text-mint disabled:opacity-60">▲ Faydalı {votes.helpful}</button>
        <button onClick={() => vote("notHelpful")} disabled={voted} className="text-mute hover:text-chip disabled:opacity-60">▼ {votes.notHelpful}</button>
      </div>
    </li>
  );
}
