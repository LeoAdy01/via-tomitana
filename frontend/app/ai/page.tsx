"use client";
import Section from "@/components/Section";
import { Card } from "@/components/Card";
import { postJSON } from "@/lib/api";
import { useState } from "react";

export default function AIPage() {
  const [interests, setInterests] = useState("istorie, arhitectura, foto");
  const [time, setTime] = useState(180);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function run() {
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        interests: interests.split(",").map(s => s.trim()).filter(Boolean),
        time_minutes: time,
        start: { lat: 44.176, lon: 28.659 }
      };
      const r = await postJSON<any>("/api/recommendations", payload);
      setResult(r);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <Section title="Recomandări AI" subtitle="MVP: euristici + proximitate. Poți conecta ulterior un LLM pentru output narativ.">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <div className="text-sm text-slate-300">Preferințe</div>
            <label className="mt-4 block text-xs text-slate-400">Interese (separate prin virgulă)</label>
            <input value={interests} onChange={(e) => setInterests(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none focus:border-sky-400/50" />
            <label className="mt-4 block text-xs text-slate-400">Timp disponibil (minute)</label>
            <input type="number" value={time} onChange={(e) => setTime(parseInt(e.target.value || "0", 10))}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none focus:border-sky-400/50" />
            <button onClick={run} disabled={loading}
              className="mt-5 w-full rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-100 disabled:opacity-50">
              {loading ? "Generez..." : "Generează itinerar"}
            </button>
          </Card>

          <Card>
            <div className="text-sm text-slate-300">Rezultat</div>
            {!result ? (
              <div className="mt-4 text-sm text-slate-400">Apasă “Generează itinerar”.</div>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="text-white font-semibold">{result.summary}</div>
                <div className="text-xs text-slate-400">Timp: {result.time_minutes} min</div>
                <div className="space-y-2">
                  {result.itinerary.map((x: any) => (
                    <a key={x.slug} href={`/poi/${x.slug}`} className="block rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10">
                      <div className="font-semibold text-white">{x.name}</div>
                      <div className="mt-1 text-sm text-slate-300">{x.why}</div>
                    </a>
                  ))}
                </div>
                <div className="pt-2 text-xs text-slate-400">
                  {result.tips?.map((t: string, i: number) => <div key={i}>• {t}</div>)}
                </div>
              </div>
            )}
          </Card>
        </div>
      </Section>
    </main>
  );
}
