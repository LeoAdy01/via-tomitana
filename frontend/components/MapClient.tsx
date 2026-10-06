"use client";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(m => m.Popup), { ssr: false });
const GeoJSON = dynamic(() => import("react-leaflet").then(m => m.GeoJSON), { ssr: false });

const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function MapClient({ pois, routeFeatures, categories }: { pois: any[]; routeFeatures?: any[]; categories?: any[] }) {
  const center: [number, number] = [44.25, 28.55];
  const [selected, setSelected] = useState<string[]>([]);
  const filtered = useMemo(() => !selected.length ? pois : pois.filter((f:any)=>selected.includes(f.properties.category?.slug)), [pois, selected]);
  const toggle = (slug:string)=>setSelected(p=>p.includes(slug)?p.filter(x=>x!==slug):[...p,slug]);

  return (
    <div className="space-y-3">
      {categories?.length ? (
        <div className="flex flex-wrap gap-2 rounded-3xl border border-white/10 bg-white/5 p-3 shadow-soft">
          <div className="mr-2 text-sm text-slate-300">Filtre:</div>
          {categories.map((c:any)=>(
            <button key={c.slug} onClick={()=>toggle(c.slug)}
              className={`rounded-full px-3 py-1 text-xs border ${selected.includes(c.slug) ? "bg-white text-slate-950 border-white" : "bg-white/5 text-white border-white/10 hover:bg-white/10"}`}>
              {c.name}
            </button>
          ))}
          {selected.length ? <button onClick={()=>setSelected([])} className="rounded-full px-3 py-1 text-xs border border-white/10 bg-white/5 text-white hover:bg-white/10">Reset</button> : null}
          <div className="ml-auto text-xs text-slate-400">{filtered.length} obiective</div>
        </div>
      ) : null}

      <div className="h-[70vh] overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-soft">
        <MapContainer center={center} zoom={10} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {(routeFeatures || []).map((rf:any, idx:number)=><GeoJSON key={idx} data={rf} />)}
          {filtered.map((f:any)=>{
            const [lon, lat] = f.geometry.coordinates;
            return (
              <Marker key={f.properties.slug} position={[lat, lon]} icon={defaultIcon}>
                <Popup>
                  <div className="text-slate-900">
                    <div className="font-semibold">{f.properties.name}</div>
                    <div className="text-xs opacity-80">{f.properties.category?.name}</div>
                    <div className="mt-2"><a className="underline" href={`/poi/${f.properties.slug}`}>Detalii</a></div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
