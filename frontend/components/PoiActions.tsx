"use client";
import { useEffect, useState } from "react";
import { delJSON, getJSON, postJSON } from "@/lib/api";
import { getToken } from "@/lib/auth";

export default function PoiActions({ poiSlug, poiName }: { poiSlug: string; poiName: string }) {
  const [fav, setFav] = useState(false);
  const [busy, setBusy] = useState(false);
  const token = getToken();

  useEffect(() => {
    async function load() {
      if (!token) return;
      const r = await getJSON<any>("/api/favorites", token).catch(() => ({ items: [] }));
      const items = r.items || [];
      setFav(items.some((x: any) => x.properties.slug === poiSlug));
    }
    load();
  }, [poiSlug, token]);

  async function toggleFavorite() {
    if (!token) {
      window.location.href = "/login";
      return;
    }
    setBusy(true);
    try {
      if (fav) {
        await delJSON(`/api/favorites/${poiSlug}`, token);
        setFav(false);
      } else {
        await postJSON(`/api/favorites/${poiSlug}`, {}, token);
        setFav(true);
      }
    } finally {
      setBusy(false);
    }
  }

  async function bookPoi() {
    if (!token) {
      window.location.href = "/login";
      return;
    }
    const when = prompt(`Când vrei să programezi vizita la "${poiName}"? (ex: 2026-03-10 10:00)`);
    if (!when) return;
    const persons = parseInt(prompt("Număr persoane?", "1") || "1", 10);
    const notes = prompt("Note (opțional):", "") || "";
    const r = await postJSON<any>("/api/bookings", {
      kind: "tour",
      ref_slug: poiSlug,
      when_iso: when,
      persons,
      notes
    }, token);
    if (r.ok) alert("Programare trimisă!");
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={toggleFavorite}
        disabled={busy}
        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-50"
      >
        {fav ? "Elimină din favorite" : "Adaugă la favorite"}
      </button>

      <button
        onClick={bookPoi}
        className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-100"
      >
        Programează vizita
      </button>
    </div>
  );
}
