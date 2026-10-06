import Section from "@/components/Section";
import { CardLink } from "@/components/Card";
import { getJSON } from "@/lib/api";

export default async function RoutesPage() {
  const routes = await getJSON<any[]>("/api/routes");
  return (
    <main>
      <Section title="Trasee tematice" subtitle="Selectează un traseu pentru detalii și opriri recomandate.">
        <div className="grid gap-5 md:grid-cols-2">
          {routes.map((r) => (
            <CardLink key={r.slug} href={`/routes/${r.slug}`} title={r.name} description={r.description} meta={`${r.theme} • ${r.duration_min} min • ${r.difficulty}`} />
          ))}
        </div>
      </Section>
    </main>
  );
}
