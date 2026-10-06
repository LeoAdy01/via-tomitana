"use client";
import Section from "@/components/Section";
import { Card } from "@/components/Card";
import { getToken, getUser } from "@/lib/auth";
import { getJSON } from "@/lib/api";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [favs, setFavs] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  async function refresh() {
    const u = getUser();
    setUser(u);
    const token = getToken();
    if (!token) return;
    const favRes = await getJSON<any>("/api/favorites", token).catch(() => ({ items: [] }));
    const bookRes = await getJSON<any>("/api/bookings/me", token).catch(() => ({ items: [] }));
    setFavs(favRes.items || []);
    setBookings(bookRes.items || []);
  }

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener("vt_auth", handler);
    return () => window.removeEventListener("vt_auth", handler);
  }, []);

  if (!user) {
    return (
      <main>
        <Section title="Cont" subtitle="Trebuie să fii autentificat.">
          <Card>
            <div className="text-slate-200">Nu ești logat.</div>
            <div className="mt-3"><Link className="underline" href="/login">Mergi la Login</Link></div>
          </Card>
        </Section>
      </main>
    );
  }

  const isAdmin = user?.email === "admin@viatomitana.local";

  return (
    <main>
      <Section title="Contul meu" subtitle="Favorite + programările tale pentru trasee și obiective.">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <div className="text-sm text-slate-300">Utilizator</div>
            <div className="mt-2 text-white font-semibold">{user.name || "—"}</div>
            <div className="mt-1 text-slate-200">{user.email}</div>
            {isAdmin ? <div className="mt-3 text-sm"><Link className="underline" href="/admin">Deschide dashboard admin</Link></div> : null}
          </Card>

          <Card className="md:col-span-2">
            <div className="text-sm text-slate-300">Programările mele</div>
            <div className="mt-3 space-y-2">
              {bookings.length === 0 ? <div className="text-sm text-slate-400">Nu ai programări.</div> : null}
              {bookings.map((b) => (
                <div key={b.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-white font-semibold">{b.kind === "route" ? "Traseu" : "Obiectiv"}: {b.ref_slug}</div>
                  <div className="text-xs text-slate-400">{b.when_iso} • {b.persons} persoane • {b.status}</div>
                  {b.notes ? <div className="mt-1 text-sm text-slate-200">{b.notes}</div> : null}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-semibold text-white">Favorite</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {favs.length === 0 ? <div className="text-sm text-slate-400">Nu ai favorite.</div> : null}
            {favs.map((f: any) => (
              <Link key={f.properties.slug} href={`/poi/${f.properties.slug}`} className="block rounded-3xl border border-white/10 bg-white/5 p-4 hover:bg-white/10">
                <div className="text-white font-semibold">{f.properties.name}</div>
                <div className="mt-1 text-sm text-slate-300">{f.properties.short}</div>
              </Link>
            ))}
          </div>
        </div>
      </Section>
    </main>
  );
}
