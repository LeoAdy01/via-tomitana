"use client";
import Section from "@/components/Section";
import { Card } from "@/components/Card";
import { postJSON } from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function OAuthSyncPage() {
  const { data: session, status } = useSession();
  const [msg, setMsg] = useState("Se procesează autentificarea...");

  useEffect(() => {
    async function sync() {
      if (status === "loading") return;
      if (status === "unauthenticated") {
        setMsg("Nu există sesiune OAuth. Redirecționez...");
        setTimeout(() => { window.location.href = "/login"; }, 1000);
        return;
      }
      const email = session?.user?.email;
      const name = session?.user?.name || "";
      if (!email) {
        setMsg("Nu am primit email de la provider.");
        return;
      }
      try {
        const r = await postJSON<any>("/api/auth/oauth", { email, name, provider: "google" });
        if (r.error) {
          setMsg("Nu am putut sincroniza contul cu backend-ul.");
          return;
        }
        saveAuth(r.token, r.user);
        window.location.href = "/account";
      } catch {
        setMsg("Backend indisponibil. Pornește serverul pe :8000.");
      }
    }
    sync();
  }, [session, status]);

  return (
    <main>
      <Section title="Autentificare socială" subtitle="Sincronizare cont social cu backend-ul aplicației.">
        <div className="mx-auto max-w-xl">
          <Card><div className="text-slate-200">{msg}</div></Card>
        </div>
      </Section>
    </main>
  );
}
