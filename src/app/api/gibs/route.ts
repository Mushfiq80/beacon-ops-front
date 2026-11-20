/* NASA GIBS layer metadata (latest date, tile matrix set, format), read from the
   public WMTS capabilities file — the same approach as the Durjog demo server.
   Cached in memory for 30 minutes. No key needed. */

const CAPS = "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/1.0.0/WMTSCapabilities.xml";
const LAYERS = [
  "Himawari_AHI_Band13_Clean_Infrared",
  "IMERG_Precipitation_Rate_30min",
  "VIIRS_Combined_Flood_3-Day",
  "VIIRS_SNPP_CorrectedReflectance_TrueColor",
  "VIIRS_SNPP_DayNightBand",
];

type Meta = { time: string; tms: string; ext: "png" | "jpg" };
let cache: { at: number; layers: Record<string, Meta> } | null = null;

export async function GET() {
  if (cache && Date.now() - cache.at < 30 * 60_000) {
    return Response.json({ ok: true, generated: cache.at, layers: cache.layers });
  }
  try {
    const res = await fetch(CAPS, { cache: "no-store", signal: AbortSignal.timeout(60_000) });
    if (!res.ok) throw new Error(`GIBS ${res.status}`);
    const x = await res.text();
    const layers: Record<string, Meta> = {};
    for (const id of LAYERS) {
      const i = x.indexOf(`<ows:Identifier>${id}</ows:Identifier>`);
      if (i < 0) continue;
      const blk = x.slice(i, x.indexOf("</Layer>", i));
      const time = blk.match(/<Default>([^<]+)<\/Default>/)?.[1];
      const tms = blk.match(/<TileMatrixSet>([^<]+)<\/TileMatrixSet>/)?.[1];
      const fmt = blk.match(/<Format>([^<]+)<\/Format>/)?.[1];
      if (time && tms) layers[id] = { time, tms, ext: fmt === "image/jpeg" ? "jpg" : "png" };
    }
    cache = { at: Date.now(), layers };
    return Response.json({ ok: true, generated: cache.at, layers });
  } catch (e) {
    return Response.json({ ok: false, error: String((e as Error).message || e), layers: cache?.layers ?? {} }, { status: 200 });
  }
}
