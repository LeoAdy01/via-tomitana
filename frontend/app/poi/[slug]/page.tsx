import Section from "@/components/Section";
import { Card } from "@/components/Card";
import VirtualTour from "@/components/VirtualTour";
import MapClient from "@/components/MapClient";
import { getJSON } from "@/lib/api";
import PoiActions from "@/components/PoiActions";

export default async function PoiDetail({ params }: { params: { slug: string } }) {
  const poi = await getJSON<any>(`/api/pois/${params.slug}`);

  const feature = {
    type: "Feature",
    geometry: { type: "Point", coordinates: [poi.lon, poi.lat] },
    properties: { slug: poi.slug, name: poi.name, category: poi.category, short: poi.short, cover_image: poi.cover_image },
  };

  return (
    <main>
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={poi.cover_image} alt={poi.name} className="h-full w-full object-cover opacity-35 blur-[1px]" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/10" />
        <div className="relative mx-auto max-w-6xl px-4 py-14">
          <div className="max-w-3xl">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
              {poi.category?.name}
            </div>
            <h1 className="mt-4 text-4xl font-semibold text-white">{poi.name}</h1>
            <p className="mt-3 text-lg text-slate-300">{poi.short}</p>
            <div className="mt-6"><PoiActions poiSlug={poi.slug} poiName={poi.name} /></div>

            <div className="mt-6 grid gap-3 text-sm text-slate-200 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-slate-400">Adresă</div>
                <div className="mt-1">{poi.address || "—"}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-slate-400">Program</div>
                <div className="mt-1">{poi.opening_hours || "—"}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section title="Descriere" subtitle="Informații despre obiectivul turistic.">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card className="max-w-none">
              <p className="text-slate-200">{poi.description}</p>
            </Card>

            {poi.virtual_tour ? (
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-white">Tur virtual 360°</h3>
                <p className="mt-2 text-sm text-slate-300">{poi.virtual_tour.caption}</p>
                <div className="mt-4">
                  <VirtualTour panoUrl={poi.virtual_tour.pano_url} />
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <Card>
              <div className="text-sm text-slate-300">Tururi & prețuri</div>
              <div className="mt-3 space-y-3">
                {(poi.tours || []).map((t: any) => (
                  <div key={t.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-white font-semibold">{t.title}</div>
                    <div className="mt-1 text-xs text-slate-400">{t.duration_min} min • {t.price_ron} RON</div>
                    <div className="mt-2 text-sm text-slate-200">{t.includes}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div className="text-sm text-slate-300">Localizare</div>
              <div className="mt-3">
                <MapClient pois={[feature]} />
              </div>
              <div className="mt-3 text-xs text-slate-400">Coordonate: {poi.lat}, {poi.lon}</div>
            </Card>
          </div>
        </div>
      </Section>
    </main>
  );
}
