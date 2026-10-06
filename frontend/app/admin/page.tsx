"use client";
import Section from "@/components/Section";
import { Card } from "@/components/Card";
import { delJSON, getJSON, postJSON } from "@/lib/api";
import { getToken, getUser } from "@/lib/auth";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminPage() {
  const token = getToken();
  const user = getUser();
  const isAdmin = user?.email === "admin@viatomitana.local";
  const [tab, setTab] = useState<"bookings" | "pois">("bookings");
  const [bookings, setBookings] = useState<any[]>([]);
  const [pois, setPois] = useState<any[]>([]);
  const [form, setForm] = useState<any>({
    slug: "", name: "", category_slug: "urban", short: "", description: "",
    address: "", opening_hours: "", website: "", lat: 44.17, lon: 28.66, cover_image: ""
  });

  async function load() {
    if (!token) return;
    const b = await getJSON<any>("/api/admin/bookings", token).catch(() => ({ items: [] }));
    const p = await getJSON<any>("/api/pois", token).catch(() => ({ features: [] }));
    setBookings(b.items || []);
    setPois(p.features || []);
  }

  useEffect(() => { load(); }, []);

  if (!isAdmin) {
    return (
      <main>
        <Section title="Dashboard admin" subtitle="Acces restricționat.">
          <Card>
            <div className="text-slate-200">Nu ai drepturi admin.</div>
            <div className="mt-3"><Link className="underline" href="/account">Înapoi</Link></div>
          </Card>
        </Section>
      </main>
    );
  }

  async function savePoi() {
    const r = await postJSON<any>("/api/admin/pois", form, token);
    if (r.error) return alert(JSON.stringify(r));
    alert("Obiectiv salvat.");
    await load();
  }

  async function deletePoi(slug: string) {
    if (!confirm("Ștergi obiectivul?")) return;
    const r = await delJSON<any>(`/api/admin/pois/${slug}`, token);
    if (r.error) return alert(JSON.stringify(r));
    await load();
  }

  return (
    <main>
      <Section title="Dashboard admin" subtitle="Vezi toate programările turiștilor și gestionează obiectivele.">
        <div className="mb-4 flex gap-2">
          <button onClick={() => setTab("bookings")} className={`rounded-xl px-4 py-2 text-sm ${tab === "bookings" ? "bg-white text-slate-950" : "border border-white/10 bg-white/5 text-white"}`}>Programări</button>
          <button onClick={() => setTab("pois")} className={`rounded-xl px-4 py-2 text-sm ${tab === "pois" ? "bg-white text-slate-950" : "border border-white/10 bg-white/5 text-white"}`}>Obiective</button>
        </div>

        {tab === "bookings" ? (
          <Card>
            <div className="text-sm text-slate-300">Toate programările</div>
            <div className="mt-4 space-y-2">
              {bookings.length === 0 ? <div className="text-sm text-slate-400">Nicio programare.</div> : null}
              {bookings.map((b) => (
                <div key={b.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-white font-semibold">#{b.id} • {b.user_email}</div>
                  <div className="mt-1 text-xs text-slate-400">{b.kind === "route" ? "Traseu" : "Obiectiv"}: {b.ref_slug} • {b.when_iso} • {b.persons} persoane • {b.status}</div>
                  {b.notes ? <div className="mt-2 text-sm text-slate-200">{b.notes}</div> : null}
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <div className="text-sm text-slate-300">Adaugă / editează obiectiv</div>
              <div className="mt-4 grid gap-3">
                {["slug","name","category_slug","short","address","opening_hours","website","cover_image"].map((k) => (
                  <div key={k}>
                    <div className="text-xs text-slate-400">{k}</div>
                    <input value={form[k] ?? ""} onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-2 text-sm text-white outline-none" />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-slate-400">lat</div>
                    <input value={form.lat} onChange={(e) => setForm({ ...form, lat: parseFloat(e.target.value) })}
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-2 text-sm text-white outline-none" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">lon</div>
                    <input value={form.lon} onChange={(e) => setForm({ ...form, lon: parseFloat(e.target.value) })}
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-2 text-sm text-white outline-none" />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">description</div>
                  <textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="mt-1 h-28 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-2 text-sm text-white outline-none" />
                </div>
              </div>
              <button onClick={savePoi} className="mt-4 w-full rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-100">Salvează obiectivul</button>
              <div className="mt-3 text-xs text-slate-400">Admin: admin@viatomitana.local / admin123</div>
            </Card>

            <Card>
              <div className="text-sm text-slate-300">Obiective existente</div>
              <div className="mt-4 max-h-[560px] space-y-2 overflow-auto pr-2">
                {pois.map((p: any) => (
                  <div key={p.properties.slug} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-white font-semibold">{p.properties.name}</div>
                        <div className="text-xs text-slate-400">{p.properties.slug} • {p.properties.category?.name}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setForm({
                          slug: p.properties.slug, name: p.properties.name, category_slug: p.properties.category?.slug || "urban",
                          short: p.properties.short || "", description: "", address: "", opening_hours: "", website: "",
                          lat: p.geometry.coordinates[1], lon: p.geometry.coordinates[0], cover_image: p.properties.cover_image || ""
                        })} className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-white hover:bg-white/10">Edit</button>
                        <button onClick={() => deletePoi(p.properties.slug)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-rose-200 hover:bg-white/10">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </Section>
    </main>
  );
}
