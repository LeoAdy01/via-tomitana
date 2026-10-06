import Section from "@/components/Section";
import MapClient from "@/components/MapClient";
import { Card, CardLink } from "@/components/Card";
import { getJSON } from "@/lib/api";

export default async function RouteDetail({ params }: { params: { slug: string } }) {
  const route = await getJSON<any>(`/api/routes/${params.slug}`);
  const poisFC = await getJSON<any>("/api/pois");
  const pois = (poisFC.features ?? []).filter((f: any) => route.stops.includes(f.properties.slug));

  return (
    <main>
      <Section title={route.name} subtitle={`${route.theme} • ${route.duration_min} min • ${route.difficulty}`}>
        <MapClient pois={pois} routeFeatures={[route.geojson]} />

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card>
            <div className="text-sm text-slate-300">Descriere</div>
            <div className="mt-2 text-slate-100">{route.description}</div>
          </Card>
          <Card>
            <div className="text-sm text-slate-300">Opriri</div>
            <div className="mt-2 text-sm text-slate-200">{route.stops.join(", ") || "—"}</div>
          </Card>
          <Card>
            <div className="text-sm text-slate-300">Sugestie</div>
            <div className="mt-2 text-sm text-slate-200">Poți împărți traseele în „etape” ca în ghidurile long-distance.</div>
          </Card>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold text-white">Obiective din traseu</h3>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            {pois.map((p: any) => (
              <CardLink key={p.properties.slug} href={`/poi/${p.properties.slug}`} title={p.properties.name} description={p.properties.short} meta={p.properties.category?.name} image={p.properties.cover_image} />
            ))}
          </div>
        </div>
      </Section>
    </main>
  );
}
