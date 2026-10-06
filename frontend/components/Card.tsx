import Link from "next/link";

export function Card({ children, className="" }: any) {
  return <div className={"rounded-3xl border border-white/10 bg-white/5 p-5 shadow-soft "+className}>{children}</div>;
}

export function CardLink({ href, title, description, meta, image }: any) {
  return (
    <Link href={href} className="group block overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-soft transition hover:bg-white/10">
      {image ? (
        <div className="aspect-[16/9] w-full overflow-hidden bg-slate-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
        </div>
      ) : null}
      <div className="p-5">
        <div className="text-lg font-semibold text-white">{title}</div>
        <div className="mt-1 text-sm text-slate-300 line-clamp-2">{description}</div>
        {meta ? <div className="mt-3 text-xs text-slate-400">{meta}</div> : null}
      </div>
    </Link>
  );
}
