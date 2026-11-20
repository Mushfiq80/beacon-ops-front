"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Building2, Globe2, Newspaper, RefreshCw, Satellite, Search, MonitorPlay as Youtube, Users, Camera as CameraIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader, Stat, AiTag, Confidence, OpsMap } from "@/components/shared";
import { intel, satellite, cameras } from "@/lib/mock/intel";
import { dataSources } from "@/lib/mock/platform";
import { sourceTypeLabel, hazardLabel } from "@/lib/labels";
import { fmt } from "@/lib/utils";
import { fmtTime, relTime } from "@/lib/time";
import type { SourceType } from "@/lib/types";

const typeIcon: Record<SourceType, React.ComponentType<{ className?: string }>> = {
  agency: Building2,
  news_local: Newspaper,
  news_global: Globe2,
  youtube: Youtube,
  social: Users,
  satellite: Satellite,
  camera: CameraIcon,
};

const monitored = {
  agencies: ["BMD — cyclone signals & bulletins", "FFWC / BWDB — river levels & flood forecast", "DDM / NDRCC — situation reports", "GDACS — global multi-hazard alerts", "ReliefWeb — humanitarian updates"],
  local: ["National Bangla dailies (RSS)", "National English dailies (RSS)", "Online news portals (RSS / sitemap)", "District-level news portals"],
  youtube: ["National TV news channels (live + uploads)", "Regional TV channels", "Official agency channels"],
  global: ["International wire services", "GDELT global event stream", "International broadcasters"],
};

export function IntelView() {
  const [type, setType] = useState<"all" | SourceType>("all");
  const [q, setQ] = useState("");
  const list = useMemo(
    () =>
      intel
        .filter((i) => type === "all" || i.sourceType === type)
        .filter((i) => !q || (i.title + i.summary + i.extracted.areas.join(" ")).toLowerCase().includes(q.toLowerCase()))
        .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)),
    [type, q]
  );

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6">
      <PageHeader
        title="Intelligence & sources"
        subtitle="The Intel Harvester Agent reads national authorities, local and global news, YouTube news channels, satellite products and licensed cameras — and pulls out structured facts with the exact source line."
        actions={
          <Button variant="outline" onClick={() => toast.info("Harvest cycle started", { description: "RSS · agency sites · YouTube · GDELT (demo)" })}>
            <RefreshCw /> Harvest now
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="Items today" value={intel.length} hint="after de-duplication" />
        <Stat label="Agency bulletins" value={intel.filter((i) => i.sourceType === "agency").length} />
        <Stat label="With casualty figures" value={intel.filter((i) => i.extracted.deaths !== undefined).length} tone="warning" />
        <Stat label="Satellite products" value={satellite.length} />
        <Stat label="Connectors live" value={`${dataSources.filter((d) => d.status === "connected").length} / ${dataSources.length}`} hint="see Integrations" />
      </div>

      <Tabs defaultValue="feed">
        <TabsList>
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="satellite">Satellite & displacement</TabsTrigger>
          <TabsTrigger value="cameras">Cameras</TabsTrigger>
          <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search area, title…" className="w-64 pl-8" />
            </div>
            {(["all", "agency", "news_local", "news_global", "youtube", "social", "satellite"] as const).map((t) => (
              <Button key={t} size="sm" variant={type === t ? "default" : "outline"} onClick={() => setType(t)}>
                {t === "all" ? "All" : sourceTypeLabel[t]}
              </Button>
            ))}
          </div>
          {list.map((i) => {
            const Icon = typeIcon[i.sourceType];
            return (
              <Card key={i.id} className="gap-2 py-4">
                <CardHeader>
                  <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
                    <Icon className="size-3.5" /> {sourceTypeLabel[i.sourceType]} · {i.sourceName} · {fmtTime(i.publishedAt)} ({relTime(i.publishedAt)})
                    {i.synthetic && <Badge variant="warning">demo</Badge>}
                    <Badge variant="outline">{i.lang.toUpperCase()}</Badge>
                  </div>
                  <CardTitle className="text-sm">{i.title}</CardTitle>
                  <CardDescription>{i.summary}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-2">
                  <AiTag>extracted</AiTag>
                  {i.extracted.hazard && <Badge variant="secondary">{hazardLabel[i.extracted.hazard].en}</Badge>}
                  {i.extracted.signal && <Badge variant="danger">Signal {i.extracted.signal}</Badge>}
                  {i.extracted.areas.map((a) => (
                    <Badge key={a} variant="outline">{a}</Badge>
                  ))}
                  {i.extracted.deaths !== undefined && <Badge variant="danger">deaths {i.extracted.deaths}</Badge>}
                  {i.extracted.displaced !== undefined && <Badge variant="warning">displaced {fmt(i.extracted.displaced)}</Badge>}
                  {i.extracted.housesDamaged !== undefined && <Badge variant="warning">houses {fmt(i.extracted.housesDamaged)}</Badge>}
                  <span className="text-muted-foreground ml-auto text-xs">credibility</span>
                  <Confidence value={i.credibility} />
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="satellite" className="grid gap-4 xl:grid-cols-5">
          <div className="flex flex-col gap-3 xl:col-span-3">
            {satellite.map((s) => (
              <Card key={s.id} className="gap-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Satellite className="size-4" /> {s.product}
                  </CardTitle>
                  <CardDescription>
                    {s.sensor} · {s.area} · acquired {fmtTime(s.acquiredAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm md:grid-cols-4">
                  <div>
                    <div className="text-muted-foreground text-xs">Flooded</div>
                    <div className="text-lg font-semibold">{s.floodedKm2} km²</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Change vs. baseline</div>
                    <div className="text-lg font-semibold">{s.changeKm2} km²</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">People displaced (est.)</div>
                    <div className="text-lg font-semibold">{s.displacedEstimate.expected ? fmt(s.displacedEstimate.expected) : "—"}</div>
                    {s.displacedEstimate.expected > 0 && (
                      <div className="text-muted-foreground text-xs">
                        {fmt(s.displacedEstimate.low)} – {fmt(s.displacedEstimate.high)}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Confidence</div>
                    <Confidence value={s.confidence} />
                  </div>
                  <div className="text-muted-foreground text-xs md:col-span-4">{s.notes}</div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>How displacement is estimated</CardTitle>
              <CardDescription>Satellite Analyst Agent pipeline</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <ol className="text-muted-foreground list-decimal space-y-1.5 pl-4">
                <li>Search Copernicus Data Space for the newest Sentinel-1 pass over the event area.</li>
                <li>Compare with a pre-event baseline; threshold backscatter change to map new water.</li>
                <li>Overlay building footprints and population grid inside new water.</li>
                <li>People in flooded buildings × household size → displaced range.</li>
                <li>Cross-check with VIIRS night-lights loss and verified ground reports.</li>
              </ol>
              <OpsMap layers={["damage", "reports"]} className="mt-2 h-[260px]" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cameras">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {cameras.map((c) => (
              <Card key={c.id} className="gap-3 overflow-hidden pt-0">
                <div className="bg-muted relative grid aspect-video place-items-center">
                  <CameraIcon className="text-muted-foreground size-8" />
                  <Badge className="absolute top-2 left-2" variant={c.status === "live" ? "danger" : "secondary"}>
                    {c.status === "live" ? "● LIVE" : "offline"}
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-sm">{c.name}</CardTitle>
                  <CardDescription>{c.provider}</CardDescription>
                </CardHeader>
                <CardContent className="text-xs">
                  <AiTag>VLM</AiTag> <span className="ml-1">{c.aiObservation}</span>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-muted-foreground mt-3 text-xs">
            Policy: Beacon Ops uses only licensed public webcam APIs, official public cameras and operator- or municipality-shared feeds under agreement. It does not search for or access unsecured private cameras.
          </p>
        </TabsContent>

        <TabsContent value="watchlist" className="grid gap-4 md:grid-cols-2">
          {(
            [
              ["National authorities", monitored.agencies, Building2],
              ["Local news portals", monitored.local, Newspaper],
              ["YouTube / TV channels", monitored.youtube, Youtube],
              ["Global news", monitored.global, Globe2],
            ] as const
          ).map(([title, items, Icon]) => (
            <Card key={title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="size-4" /> {title}
                </CardTitle>
                <CardDescription>Configured per country in Settings</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-1.5 text-sm">
                  {items.map((x) => (
                    <li key={x} className="flex items-center gap-2">
                      <span className="bg-success size-1.5 rounded-full" /> {x}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
