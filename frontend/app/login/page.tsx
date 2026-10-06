"use client";
import Section from "@/components/Section";
import { Card } from "@/components/Card";
import { postJSON } from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setErr(null);
    setLoading(true);
    try {
      const r = await postJSON<any>("/api/auth/login", { email, password });
      if (r.error) {
        setErr("Email sau parolă incorecte.");
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
      <Section title="Login" subtitle="Autentificare cu email/parolă sau cu Google.">
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          <Card>
            <div className="text-sm text-slate-300">Email + parolă</div>
            <label className="mt-4 block text-xs text-slate-400">Email</label>
            <input value={email} onChange={(e)=>setEmail(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none focus:border-sky-400/50" />
            <label className="mt-4 block text-xs text-slate-400">Parolă</label>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none focus:border-sky-400/50" />
            {err ? <div className="mt-3 text-sm text-rose-300">{err}</div> : null}
            <button disabled={loading} onClick={submit}
              className="mt-5 w-full rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-100 disabled:opacity-50">
              {loading ? "Se autentifică…" : "Login"}
            </button>
            <div className="mt-4 text-sm text-slate-300">
              Nu ai cont? <Link className="underline" href="/signup">Creează cont</Link>
            </div>
          </Card>

          <Card>
            <div className="text-sm text-slate-300">Conectare rapidă cu Google</div>
            <div className="mt-3 text-xs text-slate-400">
              După login-ul cu Google, contul este sincronizat automat cu backend-ul și poți programa trasee și obiective.
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
