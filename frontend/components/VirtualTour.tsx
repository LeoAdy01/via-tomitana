"use client";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    PhotoSphereViewer?: any;
  }
}

/**
 * Tur 360°: încarcă Photo Sphere Viewer din CDN.
 * IMPORTANT: în unele rețele (firewall / antivirus / școală) CDN-ul poate fi blocat.
 * De aceea:
 *  - încercăm 2 surse (jsDelivr, unpkg)
 *  - NU mai aruncăm eroare runtime; afișăm fallback UI.
 */
export default function VirtualTour({ panoUrl }: { panoUrl: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    let viewer: any = null;
    let cancelled = false;

    async function loadCssOnce() {
      const cssId = "psv-css";
      if (document.getElementById(cssId)) return;

      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = "https://cdn.jsdelivr.net/npm/photo-sphere-viewer@5/dist/photo-sphere-viewer.min.css";
      document.head.appendChild(link);
    }

    function loadScriptFrom(src: string) {
      return new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.crossOrigin = "anonymous";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("CDN blocked or unavailable"));
        document.body.appendChild(script);
      });
    }

    async function loadPsv() {
      try {
        setStatus("loading");
        await loadCssOnce();

        // If already available (cached), skip network
        if (!window.PhotoSphereViewer?.Viewer) {
          // Try jsDelivr first, then unpkg
          try {
            await loadScriptFrom("https://cdn.jsdelivr.net/npm/photo-sphere-viewer@5/dist/photo-sphere-viewer.min.js");
          } catch {
            await loadScriptFrom("https://unpkg.com/photo-sphere-viewer@5/dist/photo-sphere-viewer.min.js");
          }
        }

        if (cancelled) return;
        if (!ref.current) return;

        const PSV = window.PhotoSphereViewer;
        if (!PSV?.Viewer) throw new Error("PhotoSphereViewer not found on window");

        viewer = new PSV.Viewer({
          container: ref.current,
          panorama: panoUrl,
          navbar: ["zoom", "fullscreen"],
        });

        if (!cancelled) setStatus("ready");
      } catch {
        if (!cancelled) setStatus("failed");
      }
    }

    loadPsv();

    return () => {
      cancelled = true;
      try { viewer?.destroy?.(); } catch {}
    };
  }, [panoUrl]);

  return (
    <div className="h-[520px] w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-soft">
      <div ref={ref} className="h-full w-full" />

      {status !== "ready" ? (
        <div className="pointer-events-none -mt-[520px] grid h-[520px] place-items-center px-6 text-center">
          <div className="pointer-events-auto max-w-md rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-200">
            {status === "loading" ? (
              <>Se încarcă turul 360°…</>
            ) : (
              <>
                <div className="font-semibold text-white">Turul 360° nu a putut fi încărcat.</div>
                <div className="mt-2 text-slate-300">
                  De obicei se întâmplă când conexiunea blochează CDN-uri (firewall/antivirus/rețea școlară) sau nu ai internet.
                </div>
                <div className="mt-3 text-xs text-slate-400">
                  Soluții rapide: încearcă altă rețea / dezactivează temporar blocarea CDN / sau cere o versiune offline (fișiere locale).
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
