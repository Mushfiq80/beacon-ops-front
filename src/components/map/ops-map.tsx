"use client";

/* Operational map — Leaflet, built the same way as the Durjog / Disaster Monitor
   System console:
   - "Blank" basemap = OSM tiles shown monochrome (inverted in dark mode)
   - everything outside Bangladesh dimmed by a world mask with the country cut out
   - country border with a soft glow, dashed division lines + division names,
     optional 64 districts
   - hazard-coloured round pins with a white icon, pulse ring for severe items
   - infrastructure as red "watch" diamonds with a dashed radius
   - cyclone as a shaded cone + dashed track + position dots + mono label
   - "Map layers" panel top-right, legend bottom-left, zoom bottom-right
   - NASA GIBS satellite overlays (Himawari IR, IMERG rain, VIIRS flood, true colour, night lights)
   Boundaries: geoBoundaries (CC BY 4.0), served from /public/data. */

import { useEffect, useMemo, useRef, useState } from "react";
import * as L from "leaflet";
import { useTheme } from "next-themes";
import { activeEvent, sites, damageAreas } from "@/lib/mock/scenario";
import { cameras } from "@/lib/mock/intel";
import { useBeacon } from "@/lib/store";
import { siteTypeLabel, metricLabel, claimStatusLabel } from "@/lib/labels";
import { fmt } from "@/lib/utils";
import type { FieldReport, PressClaim } from "@/lib/types";

export type MapLayer = "track" | "sites" | "reports" | "damage" | "claims" | "cameras";

/* ---------- icons and hazard keys (same set as Durjog) ---------- */
const IC: Record<string, string> = {
  flood: '<path d="M12 3s-5.5 6.2-5.5 9.6a5.5 5.5 0 0 0 11 0C17.5 9.2 12 3 12 3z"/>',
  surge:
    '<circle cx="12" cy="12" r="2.2"/><path d="M4.5 9.5A8 8 0 0 1 18 6.5M19.5 14.5A8 8 0 0 1 6 17.5M9 4.5a8 8 0 0 1 9.5 4M15 19.5a8 8 0 0 1-9.5-4"/>',
  landslide: '<path d="M3 20h18L14 7l-3 6-2.5-2.5z"/><circle cx="18" cy="16" r="1.2"/>',
  waterlog:
    '<path d="M3 9c2 0 2-2 4.5-2S10 9 12 9s2-2 4.5-2S19 9 21 9M3 14c2 0 2-2 4.5-2S10 14 12 14s2-2 4.5-2S19 14 21 14M3 19c2 0 2-2 4.5-2S10 19 12 19s2-2 4.5-2S19 19 21 19"/>',
  road: '<path d="M5 16h14v-4l-2-5H7l-2 5zM7 16v3M17 16v3M5 12h14"/>',
  quake: '<path d="M2 12h4l2-6 3 12 3-9 2 3h6"/>',
  heat: '<path d="M14 14.8V4a2 2 0 0 0-4 0v10.8a4 4 0 1 0 4 0z"/>',
  collapse: '<path d="M4 21V9l6-4 6 4v3M14 21l3-6 3 2-2 4M4 21h16M8 13h3M8 17h3"/>',
};
const HZ_NAME: Record<string, string> = {
  flood: "Flood",
  surge: "Cyclone / surge",
  landslide: "Landslide",
  waterlog: "Waterlogging",
  road: "Road blocked",
  quake: "Earthquake",
  heat: "Heat / cold",
  collapse: "Structure damage",
};
const svg = (h: string, size: number) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${IC[h] ?? IC.flood}</svg>`;

function reportHazard(r: FieldReport) {
  const t = r.tags.join(" ");
  if (/road/.test(t)) return "road";
  if (/bridge|telecom|outage/.test(t)) return "collapse";
  if (/shelter|water/.test(t)) return "surge";
  if (/embankment|breach/.test(t)) return "waterlog";
  return "flood";
}

const DIST_FIX: Record<string, string> = {
  Chittagong: "Chattogram", Barisal: "Barishal", Bogra: "Bogura", Comilla: "Cumilla", Jessore: "Jashore",
  Brahamanbaria: "Brahmanbaria", Maulvibazar: "Moulvibazar", Nawabganj: "Chapainawabganj", Netrakona: "Netrokona",
  Jhalokati: "Jhalokathi", Rajshani: "Rajshahi",
};
const BD_BOUNDS: L.LatLngBoundsExpression = [[20.55, 88.0], [26.65, 92.7]];
const COAST_BOUNDS: L.LatLngBoundsExpression = [[21.35, 88.95], [23.5, 91.55]];

const OSM = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const BASES = {
  blank: { label: "Blank map", src: "OSM" },
  plain: { label: "Plain (boundaries only)", src: "" },
  osm: { label: "OpenStreetMap", src: "OSM" },
  sat: { label: "Satellite imagery", src: "Esri" },
} as const;
type BaseKey = keyof typeof BASES;

const GIBS = {
  g_ir: { id: "Himawari_AHI_Band13_Clean_Infrared", label: "Himawari-9 infrared", fb: { tms: "GoogleMapsCompatible_Level6", ext: "png" } },
  g_imerg: { id: "IMERG_Precipitation_Rate_30min", label: "GPM IMERG rain rate", fb: { tms: "GoogleMapsCompatible_Level6", ext: "png" } },
  g_flood: { id: "VIIRS_Combined_Flood_3-Day", label: "VIIRS flood map 3-day", fb: { tms: "GoogleMapsCompatible_Level9", ext: "png" } },
  g_true: { id: "VIIRS_SNPP_CorrectedReflectance_TrueColor", label: "VIIRS true colour", fb: { tms: "GoogleMapsCompatible_Level9", ext: "jpg" } },
  g_night: { id: "VIIRS_SNPP_DayNightBand", label: "Night lights", fb: { tms: "GoogleMapsCompatible_Level8", ext: "png" } },
} as const;
type GibsKey = keyof typeof GIBS;
type GibsMeta = Record<string, { time: string; tms: string; ext: string }>;
let gibsMeta: Promise<GibsMeta> | null = null;
const loadGibs = () =>
  (gibsMeta ??= fetch("/api/gibs")
    .then((r) => r.json())
    .then((j) => (j.layers ?? {}) as GibsMeta)
    .catch(() => ({}) as GibsMeta));

const OVERLAY_LABEL: Record<MapLayer, string> = {
  track: "Cyclone track & cone",
  damage: "Damage forecast by area",
  reports: "Ground reports",
  sites: "Infrastructure watch sites",
  claims: "Press claims",
  cameras: "Cameras",
};
type CtxKey = "mask" | "div" | "dist";

let geoCache: Promise<[GeoJSON.FeatureCollection, GeoJSON.FeatureCollection, GeoJSON.FeatureCollection]> | null = null;
const loadGeo = () =>
  (geoCache ??= Promise.all(["/data/bd-adm0.json", "/data/bd-adm1.json", "/data/bd-adm2.json"].map((u) => fetch(u).then((r) => r.json()))) as Promise<
    [GeoJSON.FeatureCollection, GeoJSON.FeatureCollection, GeoJSON.FeatureCollection]
  >);

const cssv = (v: string) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const siteColorVar: Record<string, string> = {
  down: "--danger",
  at_risk: "--warning",
  secured: "--info",
  restored: "--success",
  normal: "--muted-foreground",
};
const claimColorVar: Record<PressClaim["status"], string> = {
  human_confirmed: "--success",
  ai_verified: "--info",
  needs_review: "--warning",
  conflict: "--danger",
  rejected: "--muted-foreground",
};

/* simple cone of uncertainty around the track, widening along the path */
function coneFor(track: { lat: number; lng: number }[]) {
  const left: [number, number][] = [];
  const right: [number, number][] = [];
  track.forEach((p, i) => {
    const a = track[Math.max(0, i - 1)];
    const b = track[Math.min(track.length - 1, i + 1)];
    const dx = b.lng - a.lng;
    const dy = b.lat - a.lat;
    const n = Math.hypot(dx, dy) || 1;
    const r = 0.08 + 0.035 * i;
    left.push([p.lat + (dx / n) * r, p.lng - (dy / n) * r]);
    right.push([p.lat - (dx / n) * r, p.lng + (dy / n) * r]);
  });
  return [...left, ...right.reverse()];
}

export function OpsMap({
  layers = ["track", "sites", "reports", "damage"],
  className = "h-[420px]",
  fit = "coast",
}: {
  layers?: MapLayer[];
  className?: string;
  fit?: "coast" | "country";
}) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const groups = useRef<Record<string, L.LayerGroup>>({});
  const baseRef = useRef<L.Layer | null>(null);
  const gibsRef = useRef<Partial<Record<GibsKey, L.TileLayer>>>({});
  const { resolvedTheme } = useTheme();
  const reports = useBeacon((s) => s.reports);
  const claims = useBeacon((s) => s.claims);
  const key = layers.join(",");

  const [base, setBase] = useState<BaseKey>("blank");
  const [ctx, setCtx] = useState<Record<CtxKey, boolean>>({ mask: true, div: true, dist: false });
  const [on, setOn] = useState<Record<string, boolean>>(() => Object.fromEntries(layers.map((l) => [l, true])));
  const [sat, setSat] = useState<Partial<Record<GibsKey, boolean>>>({});
  const [satNote, setSatNote] = useState<string[]>([]);
  const [ready, setReady] = useState(0);

  /* ---------- build map (once per theme / layer set) ---------- */
  useEffect(() => {
    if (!el.current) return;
    const map = L.map(el.current, { zoomControl: false, attributionControl: true, minZoom: 5, maxZoom: 16, worldCopyJump: true });
    map.fitBounds(fit === "country" ? BD_BOUNDS : COAST_BOUNDS);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    map.attributionControl.setPrefix('<a href="https://leafletjs.com">Leaflet</a> · Beacon Ops by Late Light Labs');
    map.createPane("gibs").style.zIndex = "250";
    map.createPane("mask").style.zIndex = "360";
    map.createPane("border").style.zIndex = "370";
    map.createPane("track").style.zIndex = "390";
    map.getPane("mask")!.style.pointerEvents = "none";
    mapRef.current = map;

    const g = (name: string) => (groups.current[name] = L.layerGroup());
    ["mask", "border", "div", "dist", "damage", "track", "sites", "claims", "cameras", "reports"].forEach(g);

    const line = cssv("--map-line");
    let cancelled = false;
    loadGeo().then(([a0, a1, a2]) => {
      if (cancelled) return;
      // world mask with Bangladesh cut out
      const holes: L.LatLngExpression[][] = [];
      for (const f of a0.features) {
        const geom = f.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon;
        const polys = geom.type === "Polygon" ? [geom.coordinates] : geom.coordinates;
        for (const p of polys) holes.push(p[0].map(([x, y]) => [y, x] as L.LatLngTuple));
      }
      L.polygon(
        [
          [
            [-89, -360],
            [-89, 360],
            [89, 360],
            [89, -360],
          ],
          ...holes,
        ] as L.LatLngExpression[][],
        { pane: "mask", stroke: false, fillColor: cssv("--mask"), fillOpacity: Number(cssv("--mask-op")) || 0.4, interactive: false }
      ).addTo(groups.current.mask);
      L.geoJSON(a0, { pane: "border", interactive: false, style: () => ({ color: line, weight: 7, opacity: 0.18, fill: false }) }).addTo(groups.current.border);
      L.geoJSON(a0, { pane: "border", interactive: false, style: () => ({ color: line, weight: 2.2, opacity: 0.95, fill: false }) }).addTo(groups.current.border);
      L.geoJSON(a1, { pane: "border", interactive: false, style: () => ({ color: line, weight: 1, opacity: 0.55, dashArray: "4 4", fill: false }) }).addTo(groups.current.div);
      a1.features.forEach((f) => {
        const name = DIST_FIX[f.properties?.name] || f.properties?.name;
        const c = L.geoJSON(f).getBounds().getCenter();
        L.marker(c, {
          interactive: false,
          icon: L.divIcon({
            className: "",
            html: `<div style="font:600 10px var(--font-display);letter-spacing:.14em;text-transform:uppercase;color:var(--muted-foreground);opacity:.8;white-space:nowrap;transform:translate(-50%,-50%)">${esc(name)}</div>`,
          }),
        }).addTo(groups.current.div);
      });
      L.geoJSON(a2, {
        style: () => ({ color: line, weight: 0.6, opacity: 0.45, fillOpacity: 0 }),
        onEachFeature: (f, l) => l.bindTooltip(`<b>${esc(DIST_FIX[f.properties?.name] || f.properties?.name)}</b>`, { className: "dw-tip", sticky: true }),
      }).addTo(groups.current.dist);
      setReady((n) => n + 1);
    });

    // damage forecast circles
    damageAreas.forEach((a) => {
      const c = cssv(a.priority <= 2 ? "--danger" : a.priority <= 5 ? "--warning" : "--hz-flood");
      L.circle([a.lat, a.lng], { radius: 4000 + a.displaced.expected * 0.35, color: c, weight: 1, dashArray: "3 4", fillColor: c, fillOpacity: 0.12 })
        .bindTooltip(
          `<b>#${a.priority} ${esc(a.name)} · ${esc(a.district)}</b><br><span style="font-family:var(--font-mono)">Displaced ${fmt(a.displaced.low)}–${fmt(a.displaced.high)} (exp. ${fmt(a.displaced.expected)})<br>Houses damaged exp. ${fmt(a.housesDamaged.expected)}</span><br><small style="color:var(--muted-foreground)">Open Cat Model · confidence ${Math.round(a.confidence * 100)}%</small>`,
          { className: "dw-tip", sticky: true }
        )
        .addTo(groups.current.damage);
    });

    // cyclone: cone + track + dots + label (Durjog drill style)
    if (activeEvent.track) {
      const c = cssv("--hz-surge");
      const t = activeEvent.track;
      const obs = t.filter((p) => !p.forecast);
      const fc = t.filter((p, i, arr) => p.forecast || arr[i + 1]?.forecast);
      L.polygon(coneFor(t), { pane: "track", color: c, weight: 1, opacity: 0.4, fillOpacity: 0.1, interactive: false }).addTo(groups.current.track);
      L.polyline(obs.map((p) => [p.lat, p.lng] as L.LatLngTuple), { pane: "track", color: c, weight: 2.5 }).addTo(groups.current.track);
      L.polyline(fc.map((p) => [p.lat, p.lng] as L.LatLngTuple), { pane: "track", color: c, weight: 2.5, dashArray: "7 6" }).addTo(groups.current.track);
      const nowIdx = t.findIndex((p, i) => !p.forecast && t[i + 1]?.forecast);
      t.forEach((p, i) =>
        L.circleMarker([p.lat, p.lng], { pane: "track", radius: i === nowIdx ? 7 : 4, color: c, fillColor: p.forecast ? cssv("--card") : c, fillOpacity: 1, weight: 2 })
          .bindTooltip(`<b>${p.forecast ? "Forecast" : "Observed"}</b> · ${p.windKt} kt`, { className: "dw-tip", direction: "top" })
          .addTo(groups.current.track)
      );
      const s = t[0];
      L.marker([s.lat - 0.15, s.lng + 0.2], {
        interactive: false,
        icon: L.divIcon({
          className: "",
          html: `<div style="font:600 11px var(--font-mono);color:${c};white-space:nowrap">SIMULATION · ${esc(activeEvent.name)} · ${esc(activeEvent.signal ?? "")}</div>`,
        }),
      }).addTo(groups.current.track);
    }

    // infrastructure watch sites
    sites.forEach((s) => {
      const c = cssv(siteColorVar[s.status]);
      if (s.status === "down" || s.status === "at_risk")
        L.circle([s.lat, s.lng], { radius: 8000, color: c, weight: 1, dashArray: "3 4", fillOpacity: 0.04, interactive: false }).addTo(groups.current.sites);
      L.marker([s.lat, s.lng], {
        icon: L.divIcon({ className: "", iconSize: [14, 14], html: `<div class="watch-mk" style="background:${c};box-shadow:0 0 0 3px color-mix(in srgb,${c} 35%,transparent)"></div>` }),
      })
        .bindTooltip(
          `<b>Watch site · ${esc(s.name)}</b><br>${esc(siteTypeLabel[s.type])} · <b style="color:${c}">${esc(s.status.replace("_", " "))}</b><br><span style="font-family:var(--font-mono)">risk ${Math.round(s.risk.overall * 100)}% · serves ${fmt(s.populationServed)}</span>`,
          { className: "dw-tip" }
        )
        .addTo(groups.current.sites);
    });

    // cameras as label chips
    cameras.forEach((cam) => {
      const cls = cam.status === "offline" ? "off" : cam.waterLevel === "high" ? "alert" : "";
      L.marker([cam.lat, cam.lng], {
        icon: L.divIcon({ className: "", iconAnchor: [0, 10], html: `<div class="chip-mk ${cls}">◉ ${esc(cam.area)} ${cam.status === "offline" ? "offline" : "water " + cam.waterLevel}</div>` }),
      })
        .bindTooltip(`<b>${esc(cam.name)}</b><br>${esc(cam.aiObservation)}<br><small style="color:var(--muted-foreground)">${esc(cam.provider)}</small>`, { className: "dw-tip" })
        .addTo(groups.current.cameras);
    });

    setReady((n) => n + 1);
    return () => {
      cancelled = true;
      map.remove();
      mapRef.current = null;
      baseRef.current = null;
      gibsRef.current = {};
    };
  }, [resolvedTheme, key, fit]);

  /* ---------- live layers from the store ---------- */
  useEffect(() => {
    const gr = groups.current.reports;
    const gc = groups.current.claims;
    if (!gr || !gc) return;
    gr.clearLayers();
    const byLoc: Record<string, FieldReport[]> = {};
    reports.forEach((r) => (byLoc[`${r.lat.toFixed(2)},${r.lng.toFixed(2)}`] ??= []).push(r));
    Object.values(byLoc).forEach((grp) =>
      grp.forEach((r, i) => {
        let lat = r.lat;
        let lng = r.lng;
        if (grp.length > 1) {
          const a = (i / grp.length) * Math.PI * 2;
          lat += Math.sin(a) * 0.045;
          lng += Math.cos(a) * 0.045;
        }
        const hz = reportHazard(r);
        const st = r.verdict === "verified" ? "verified" : r.verdict === "rejected" ? "false" : "review";
        const sev = r.verdict === "verified" ? 3 : 2;
        const size = 22 + sev * 4;
        const color = `var(--hz-${hz})`;
        const pulse = sev >= 3 && st !== "false";
        L.marker([lat, lng], {
          zIndexOffset: sev * 10,
          title: `${HZ_NAME[hz]} · ${r.area}`,
          icon: L.divIcon({
            className: "",
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
            html: `<div class="mk ${st}" style="width:${size}px;height:${size}px;background:${color};color:${color}">${pulse ? '<span class="pulse"></span>' : ""}<span style="color:#fff;display:grid;place-items:center;width:100%;height:100%">${svg(hz, Math.round(size * 0.55))}</span>${activeEvent.simulated ? '<span class="drl">SIM</span>' : ""}</div>`,
          }),
        })
          .bindTooltip(
            `<b>${esc(HZ_NAME[hz])} · ${esc(r.area)}</b><br>${esc(r.text)}<br><span style="font-family:var(--font-mono)">${esc(r.verdict)} · ${Math.round(r.confidence * 100)}%${r.floodDepthCm ? ` · depth ${r.floodDepthCm[0]}–${r.floodDepthCm[1]} cm` : ""}</span>`,
            { className: "dw-tip", direction: "top", offset: [0, -14] }
          )
          .addTo(gr);
      })
    );

    gc.clearLayers();
    claims.forEach((c) => {
      const col = cssv(claimColorVar[c.status]);
      L.marker([c.lat + 0.06, c.lng + 0.06], {
        icon: L.divIcon({ className: "", iconSize: [14, 12], html: `<div class="trig-mk" style="border-bottom-color:${col}"></div>` }),
      })
        .bindTooltip(
          `<b>${esc(metricLabel[c.metric])}: ${fmt(c.value)}</b><br>${esc(c.area)}<br><span style="color:${col}">${esc(claimStatusLabel[c.status].text)}</span> · agreement ${Math.round(c.agreement * 100)}%`,
          { className: "dw-tip" }
        )
        .addTo(gc);
    });
  }, [reports, claims, ready]);

  /* ---------- basemap ---------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (baseRef.current) map.removeLayer(baseRef.current);
    const layer =
      base === "blank"
        ? L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: OSM, maxZoom: 19, className: "tiles-muted" })
        : base === "osm"
          ? L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: OSM, maxZoom: 19 })
          : base === "sat"
            ? L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
                attribution: "Imagery &copy; Esri, Maxar, Earthstar Geographics",
                maxZoom: 18,
              })
            : L.layerGroup();
    layer.addTo(map);
    baseRef.current = layer;
  }, [base, ready]);

  /* ---------- context + data overlays ---------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const want: Record<string, boolean> = { ...ctx, border: true };
    layers.forEach((l) => (want[l] = on[l] !== false));
    Object.entries(groups.current).forEach(([k, g]) => {
      const show = want[k] ?? false;
      if (show && !map.hasLayer(g)) g.addTo(map);
      if (!show && map.hasLayer(g)) map.removeLayer(g);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx, on, ready, key]);

  /* ---------- NASA GIBS overlays ---------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    let cancelled = false;
    (async () => {
      const meta = await loadGibs();
      if (cancelled) return;
      const notes: string[] = [];
      (Object.keys(GIBS) as GibsKey[]).forEach((k) => {
        const def = GIBS[k];
        const existing = gibsRef.current[k];
        if (!sat[k]) {
          if (existing) {
            map.removeLayer(existing);
            delete gibsRef.current[k];
          }
          return;
        }
        const m = meta[def.id];
        const yesterday = new Date(Date.now() - 86400_000).toISOString().slice(0, 10);
        const time = m?.time ?? yesterday;
        const tms = m?.tms ?? def.fb.tms;
        const ext = m?.ext ?? def.fb.ext;
        const maxN = Number(tms.match(/Level(\d+)/)?.[1] ?? 9);
        notes.push(`🛰 ${def.label} · ${time}`);
        if (existing) return;
        gibsRef.current[k] = L.tileLayer(`https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${def.id}/default/${time}/${tms}/{z}/{y}/{x}.${ext}`, {
          pane: "gibs",
          maxNativeZoom: maxN,
          maxZoom: 16,
          opacity: k === "g_true" ? 1 : 0.78,
          attribution: 'Satellite: <a href="https://earthdata.nasa.gov/gibs">NASA GIBS</a>',
        }).addTo(map);
      });
      setSatNote(notes);
    })();
    return () => {
      cancelled = true;
    };
  }, [sat, ready]);

  /* ---------- legend ---------- */
  const legend = useMemo(() => {
    const items: { kind: "dot" | "diamond" | "tri" | "line"; color: string; label: string }[] = [];
    if (layers.includes("reports"))
      ["flood", "surge", "road", "waterlog", "collapse"].forEach((h) => items.push({ kind: "dot", color: `var(--hz-${h})`, label: HZ_NAME[h] }));
    if (layers.includes("sites")) {
      items.push({ kind: "diamond", color: "var(--danger)", label: "Site down" });
      items.push({ kind: "diamond", color: "var(--warning)", label: "Site at risk" });
      items.push({ kind: "diamond", color: "var(--info)", label: "Secured" });
    }
    if (layers.includes("claims")) {
      items.push({ kind: "tri", color: "var(--success)", label: "Claim confirmed" });
      items.push({ kind: "tri", color: "var(--danger)", label: "Claim conflict" });
    }
    if (layers.includes("track")) items.push({ kind: "line", color: "var(--hz-surge)", label: "Track (dashed = forecast)" });
    if (layers.includes("damage")) items.push({ kind: "dot", color: "var(--danger)", label: "Damage forecast area" });
    return items;
  }, [layers]);

  return (
    <div className={`@container relative isolate w-full overflow-hidden rounded-lg border ${className}`}>
      <div ref={el} className="absolute inset-0" role="region" aria-label="Situation map" />

      {/* layers panel — top right */}
      <div className="absolute top-2.5 right-2.5 z-[500]">
        <details className="bg-card/95 text-card-foreground w-[230px] @2xl:w-[250px] overflow-auto rounded-[10px] border shadow-[var(--shadow)]" style={{ maxHeight: "calc(100% - 20px)" }}>
          <summary className="font-display flex cursor-pointer list-none items-center justify-between px-3 py-2 text-[11px] font-bold tracking-[.09em] uppercase">
            Map layers <span aria-hidden>▾</span>
          </summary>
          <div className="border-t px-3 pt-1 pb-2.5">
            <h5 className="text-muted-foreground mt-1.5 mb-1 text-[10.5px] font-semibold tracking-[.08em] uppercase">Basemap</h5>
            {(Object.keys(BASES) as BaseKey[]).map((b) => (
              <label key={b} className="flex cursor-pointer items-center gap-2 py-0.5 text-xs">
                <input type="radio" name={`base-${key}`} checked={base === b} onChange={() => setBase(b)} /> {BASES[b].label}
                {BASES[b].src && <small className="text-muted-foreground ml-auto font-mono text-[10.5px]">{BASES[b].src}</small>}
              </label>
            ))}
          </div>
          <div className="border-t px-3 pt-1 pb-2.5">
            <h5 className="text-muted-foreground mt-1.5 mb-1 text-[10.5px] font-semibold tracking-[.08em] uppercase">Boundaries</h5>
            {(
              [
                ["mask", "Dim outside Bangladesh"],
                ["div", "Divisions"],
                ["dist", "Districts (64)"],
              ] as const
            ).map(([k, label]) => (
              <label key={k} className="flex cursor-pointer items-center gap-2 py-0.5 text-xs">
                <input type="checkbox" checked={ctx[k]} onChange={(e) => setCtx((c) => ({ ...c, [k]: e.target.checked }))} /> {label}
              </label>
            ))}
          </div>
          <div className="border-t px-3 pt-1 pb-2.5">
            <h5 className="text-muted-foreground mt-1.5 mb-1 text-[10.5px] font-semibold tracking-[.08em] uppercase">Operations</h5>
            {layers.map((l) => (
              <label key={l} className="flex cursor-pointer items-center gap-2 py-0.5 text-xs">
                <input type="checkbox" checked={on[l] !== false} onChange={(e) => setOn((o) => ({ ...o, [l]: e.target.checked }))} /> {OVERLAY_LABEL[l]}
                {activeEvent.simulated && <small className="text-muted-foreground ml-auto font-mono text-[10.5px]">sim</small>}
              </label>
            ))}
          </div>
          <div className="border-t px-3 pt-1 pb-2.5">
            <h5 className="text-muted-foreground mt-1.5 mb-1 text-[10.5px] font-semibold tracking-[.08em] uppercase">Satellite (NASA GIBS)</h5>
            {(Object.keys(GIBS) as GibsKey[]).map((k) => (
              <label key={k} className="flex cursor-pointer items-center gap-2 py-0.5 text-xs">
                <input type="checkbox" checked={!!sat[k]} onChange={(e) => setSat((s) => ({ ...s, [k]: e.target.checked }))} /> {GIBS[k].label}
                <small className="text-muted-foreground ml-auto font-mono text-[10.5px]">live</small>
              </label>
            ))}
          </div>
        </details>
      </div>

      {/* legend — bottom left */}
      {legend.length > 0 && (
        <div className="bg-card/92 absolute bottom-5 left-2.5 z-[500] grid max-w-[calc(100%-64px)] grid-cols-2 gap-x-3 gap-y-0.5 rounded-[9px] border px-2.5 py-1.5 text-[10.5px] shadow-[var(--shadow)] @2xl:grid-cols-3 @2xl:text-[11px]">
          {legend.map((i) => (
            <span key={i.label} className="inline-flex items-center gap-1.5 whitespace-nowrap">
              {i.kind === "dot" && <i className="inline-block size-[9px] rounded-full" style={{ background: i.color }} />}
              {i.kind === "diamond" && <i className="inline-block size-[8px] rotate-45" style={{ background: i.color }} />}
              {i.kind === "tri" && (
                <i className="inline-block size-0" style={{ borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderBottom: `8px solid ${i.color}` }} />
              )}
              {i.kind === "line" && <i className="inline-block h-0 w-3.5 border-t-2 border-dashed" style={{ borderColor: i.color }} />}
              {i.label}
            </span>
          ))}
        </div>
      )}

      {/* active satellite overlays — bottom right, above zoom */}
      {satNote.length > 0 && (
        <div className="bg-card/92 text-muted-foreground absolute right-12 bottom-5 z-[500] max-w-[330px] rounded-lg border px-2 py-1 font-mono text-[11px]">
          {satNote.map((n) => (
            <div key={n}>{n}</div>
          ))}
        </div>
      )}
    </div>
  );
}
