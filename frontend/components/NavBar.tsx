"use client";
import Link from "next/link";
import { Map, Route as RouteIcon, Sparkles, Landmark, LogIn, User2, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { clearAuth, getUser } from "@/lib/auth";

function Item({ href, label, icon: Icon }: any) {
  const path = usePathname();
  const active = path === href || (href !== "/" && path.startsWith(href));
  return (
    <Link href={href} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${active ? "bg-white/10 text-white" : "text-slate-200 hover:bg-white/5"}`}>
      <Icon size={16} />
      {label}
    </Link>
  );
}

export default function NavBar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getUser());
    const onStorage = () => setUser(getUser());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-sky-500 to-violet-500 shadow-soft">
            <Landmark size={18} />
          </span>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-white">Via Tomitana</div>
            <div className="text-xs text-slate-300">Constanța • patrimoniu & turism</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          <Item href="/" label="Acasă" icon={Landmark} />
          <Item href="/map" label="Hartă" icon={Map} />
          <Item href="/routes" label="Trasee" icon={RouteIcon} />
          <Item href="/ai" label="Recomandări AI" icon={Sparkles} />
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/account" className="hidden md:flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10">
                <User2 size={16} />
                {user.name ? user.name : user.email}
              </Link>
              <button
                onClick={() => { clearAuth(); setUser(null); window.location.href="/"; }}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
                title="Logout"
              >
                <LogOut size={16} />
                <span className="hidden md:inline">Logout</span>
              </button>
            </>
          ) : (
            <Link href="/login" className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10">
              <LogIn size={16} />
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
