export default function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-slate-300 md:flex-row md:items-center md:justify-between">
        <div>© {new Date().getFullYear()} Via Tomitana • educațional</div>
        <div className="text-xs text-slate-400">Prețurile și programul sunt.</div>
      </div>
    </footer>
  );
}
