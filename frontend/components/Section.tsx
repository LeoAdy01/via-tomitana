export default function Section({ title, subtitle, children }: any) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        {subtitle ? <p className="mt-2 max-w-3xl text-slate-300">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}
