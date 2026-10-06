import Section from "@/components/Section";
import MapClient from "@/components/MapClient";
import { getJSON } from "@/lib/api";

export default async function MapPage() {
  const categories = await getJSON<any[]>("/api/categories");
  const poisFC = await getJSON<any>("/api/pois");
  const routes = await getJSON<any[]>("/api/routes");
  return (
    <main>
      <Section title="Hartă (filtre pe categorii)" subtitle="Selectează categorii ca să vezi doar obiectivele relevante.">
        <MapClient pois={poisFC.features ?? []} routeFeatures={routes.map((r:any)=>r.geojson)} categories={categories} />
      </Section>
    </main>
  );
}
