"use client";
import Section from "@/components/Section";
import { Card } from "@/components/Card";
import { postJSON } from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setErr(null);
    setLoading(true);
    try {
      const r = await postJSON<any>("/api/auth/signup", { name, email, password });
      if (r.error) {
        if (r.error === "email_exists") setErr("Există deja un cont cu acest email.");
        else if (r.error === "weak_password") setErr("Parolă prea scurtă (minim 6 caractere).");
        else setErr("Date invalide.");
        return;
      }
      saveAuth(r.token, r.user);
      window.location.href = "/account";
    } catch {
      setErr("Nu pot contacta serverul. Pornește backend-ul pe :8000.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <Section title="Sign up" subtitle="Creare cont cu email/parolă sau continuă direct cu Google.">
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          <Card>
            <label className="block text-xs text-slate-400">Nume</label>
            <input value={name} onChange={(e)=>setName(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none focus:border-sky-400/50" />
            <label className="mt-4 block text-xs text-slate-400">Email</label>
            <input value={email} onChange={(e)=>setEmail(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none focus:border-sky-400/50" />
            <label className="mt-4 block text-xs text-slate-400">Parolă</label>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none focus:border-sky-400/50" />
            {err ? <div className="mt-3 text-sm text-rose-300">{err}</div> : null}
            <button disabled={loading} onClick={submit}
              className="mt-5 w-full rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-100 disabled:opacity-50">
              {loading ? "Se creează…" : "Creează cont"}
            </button>
            <div className="mt-4 text-sm text-slate-300">
              Ai deja cont? <Link className="underline" href="/login">Login</Link>
            </div>
          </Card>

          <Card>
            <div className="text-sm text-slate-300">Înregistrare rapidă cu Google</div>
            <div className="mt-3 text-xs text-slate-400">
              Dacă alegi Google, contul tău este creat automat și sincronizat cu backend-ul.
            </div>
            <button
              onClick={() => signIn("google", { callbackUrl: "/oauth-sync" })}
              className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Continuă cu Google
            </button>
          </Card>
        </div>
      </Section>
    </main>
  );
}
