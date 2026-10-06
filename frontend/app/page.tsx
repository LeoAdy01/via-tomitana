import Section from "@/components/Section";
import { Card, CardLink } from "@/components/Card";
import { getJSON } from "@/lib/api";

export default async function Home() {
  const categories = await getJSON<any[]>("/api/categories");
  const poisFC = await getJSON<any>("/api/pois");
  const pois = poisFC.features ?? [];

  return (
    <main>
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_20%_10%,rgba(56,189,248,0.18),transparent_40%),radial-gradient(900px_circle_at_80%_20%,rgba(167,139,250,0.16),transparent_35%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
              Demo fullstack • hartă • tururi 360° • recomandări
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white md:text-5xl">Via Tomitana</h1>
            <p className="mt-4 text-lg text-slate-300">
              Platformă web pentru explorarea obiectivelor turistice și a moștenirii culturale din Constanța.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-100" href="/map">
                Explorează harta
              </a>
              <a className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10" href="/ai">
                Cere recomandări AI
              </a>
            </div>
          </div>
        </div>
      </section>

      <Section title="Categorii de patrimoniu" subtitle="Structurare pe categorii pentru filtrare și trasee tematice.">
        <div className="grid gap-4 md:grid-cols-4">
          {categories.map((c) => (
            <Card key={c.slug}>
              <div className="text-sm text-slate-300">Categorie</div>
              <div className="mt-2 text-lg font-semibold text-white">{c.name}</div>
              <div className="mt-3 text-xs text-slate-400">slug: {c.slug}</div>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Obiective populare" subtitle="Pagini separate, tururi cu prețuri, localizare și (opțional) tur virtual.">
        <div className="grid gap-5 md:grid-cols-2">
          {pois.slice(0, 4).map((p: any) => (
            <CardLink
              key={p.properties.slug}
              href={`/poi/${p.properties.slug}`}
              title={p.properties.name}
              description={p.properties.short}
              meta={p.properties.category?.name}
              image={p.properties.cover_image}
            />
          ))}
        </div>
      </Section>

      <Section title="Trasee tematice" subtitle="Rute desenate pe hartă (GeoJSON) cu opriri recomandate.">
        <div className="grid gap-4 md:grid-cols-2">
          <CardLink href="/routes" title="Vezi traseele" description="Tomis antic, Belle Époque pe faleză, etc." meta="GeoJSON • hartă" />
          <CardLink href="/map" title="Harta completă" description="Obiective + trasee + pop-up cu link către paginile POI." meta="Leaflet • OSM" />
        </div>
      </Section>
    </main>
  );
}
