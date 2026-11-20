"use client";

import Link from "next/link";
import { AlertTriangle, Bot, Radio, RadioTower, Users, Zap, ArrowRight, Satellite } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/misc";
import { PageHeader, Stat, OpsMap, AiTag } from "@/components/shared";
import { useBeacon } from "@/lib/store";
import { activeEvent, otherEvents, sites, damageAreas } from "@/lib/mock/scenario";
import { intel, satellite } from "@/lib/mock/intel";
import { agentRuns, agents } from "@/lib/mock/platform";
import { hazardLabel, sourceTypeLabel } from "@/lib/labels";
import { fmt } from "@/lib/utils";
import { fmtTime, relTime } from "@/lib/time";
import type { Hazard } from "@/lib/types";

const phases = [
  { key: "prepare", label: "Prepare", href: "/prepare", desc: "SOP plans · dispatch" },
  { key: "respond", label: "Respond", href: "/respond", desc: "Verified evidence · live updates" },
  { key: "recover", label: "Recover", href: "/recover", desc: "Damage forecast · response plan" },
] as const;

export function OverviewView() {
  const tasks = useBeacon((s) => s.tasks);
  const reports = useBeacon((s) => s.reports);
  const claims = useBeacon((s) => s.claims);

  const down = sites.filter((s) => s.status === "down");
  const pending = tasks.filter((t) => t.status === "pending_approval").length;
  const verified = reports.filter((r) => r.verdict === "verified").length;
  const disp = damageAreas.reduce(
    (a, d) => ({ low: a.low + d.displaced.low, exp: a.exp + d.displaced.expected, high: a.high + d.displaced.high }),
    { low: 0, exp: 0, high: 0 }
  );
  const review = claims.filter((c) => c.status === "needs_review" || c.status === "conflict").length;

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6">
      <PageHeader
        title="Situation overview"
        subtitle={activeEvent.summary}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/copilot">
                <Bot /> Ask Beacon
              </Link>
            </Button>
            <Button asChild>
              <Link href="/press">
                Review {review} claims <ArrowRight />
              </Link>
            </Button>
          </>
        }
      />

      {activeEvent.simulated && (
        <Alert variant="warning">
          <AlertTriangle />
          <AlertTitle>Simulation mode</AlertTitle>
          <AlertDescription>
            Exercise cyclone KESTREL. All figures, reports and news items on screen are synthetic demo data. Connect live sources in Integrations.
          </AlertDescription>
        </Alert>
      )}

      {/* phase rail */}
      <div className="grid gap-3 md:grid-cols-3">
        {phases.map((p) => {
          const current = p.key === activeEvent.phase;
          return (
            <Link key={p.key} href={p.href}>
              <Card className={`gap-1 py-3 transition-colors hover:border-primary ${current ? "border-primary ring-primary/25 ring-2" : ""}`}>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">{p.label}</div>
                    <div className="text-muted-foreground text-xs">{p.desc}</div>
                  </div>
                  {current ? <Badge variant="warning">Current phase</Badge> : <ArrowRight className="text-muted-foreground size-4" />}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Landfall" value={relTime(activeEvent.landfallAt!)} hint={activeEvent.signal} icon={Zap} tone="danger" />
        <Stat label="Critical sites down" value={`${down.length} / ${sites.length}`} hint={`${fmt(down.reduce((a, s) => a + s.populationServed, 0))} people affected`} icon={RadioTower} tone="danger" />
        <Stat label="Tasks awaiting approval" value={pending} hint={`${tasks.filter((t) => t.status === "confirmed").length} confirmed by field teams`} icon={Radio} tone="warning" />
        <Stat label="Displaced (forecast)" value={fmt(disp.exp)} hint={`range ${fmt(disp.low)} – ${fmt(disp.high)}`} icon={Users} />
        <Stat label="Ground reports verified" value={`${verified} / ${reports.length}`} hint="AI-checked, human-reviewed" icon={Satellite} tone="success" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Operational picture</CardTitle>
            <CardDescription>Track, sites, verified reports, forecast damage and claims on one map</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <OpsMap layers={["damage", "track", "sites", "reports", "claims", "cameras"]} className="h-[460px]" />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Hazard watch</CardTitle>
              <CardDescription>Six hazards monitored · Bangladesh pilot</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {[activeEvent, ...otherEvents].map((e) => (
                <div key={e.id} className="flex items-start justify-between gap-2 rounded-md border p-2.5">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{e.name}</div>
                    <div className="text-muted-foreground line-clamp-2 text-xs">{e.summary}</div>
                  </div>
                  <Badge variant={e.status === "active" ? "danger" : "warning"}>{hazardLabel[e.hazard].en}</Badge>
                </div>
              ))}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(Object.keys(hazardLabel) as Hazard[]).map((h) => (
                  <Badge key={h} variant="outline">
                    {hazardLabel[h].en}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Agent activity <AiTag>live</AiTag>
              </CardTitle>
              <CardAction>
                <Button variant="link" size="sm" asChild>
                  <Link href="/agents">All agents</Link>
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5">
              {agentRuns.slice(0, 5).map((r) => (
                <div key={r.id} className="flex gap-2 text-sm">
                  <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${r.status === "needs_approval" ? "bg-warning" : "bg-success"}`} />
                  <div className="min-w-0">
                    <div className="text-xs font-medium">{agents.find((a) => a.id === r.agentId)?.name}</div>
                    <div className="text-muted-foreground text-xs">{r.summary}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Latest intelligence</CardTitle>
            <CardDescription>Agencies, news, YouTube and satellite — extracted by the Intel Harvester</CardDescription>
            <CardAction>
              <Button variant="link" size="sm" asChild>
                <Link href="/intel">Open feed</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col divide-y">
            {intel.slice(0, 5).map((i) => (
              <div key={i.id} className="flex items-start justify-between gap-3 py-2.5 first:pt-0">
                <div className="min-w-0">
                  <div className="text-muted-foreground text-[11px]">
                    {sourceTypeLabel[i.sourceType]} · {i.sourceName} · {fmtTime(i.publishedAt)}
                  </div>
                  <div className="truncate text-sm font-medium">{i.title}</div>
                </div>
                <Badge variant="secondary">{Math.round(i.credibility * 100)}%</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top priority areas</CardTitle>
            <CardDescription>Open Cat Model forecast · ranges, not certainties</CardDescription>
            <CardAction>
              <Button variant="link" size="sm" asChild>
                <Link href="/recover">Response plan</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {damageAreas.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 rounded-md border p-2.5">
                <div className="flex items-center gap-3">
                  <div className="bg-destructive/15 text-destructive grid size-7 place-items-center rounded-md text-xs font-bold">#{a.priority}</div>
                  <div>
                    <div className="text-sm font-medium">
                      {a.name} <span className="text-muted-foreground font-normal">· {a.district}</span>
                    </div>
                    <div className="text-muted-foreground text-xs">
                      Displaced {fmt(a.displaced.low)}–{fmt(a.displaced.high)} · houses {fmt(a.housesDamaged.expected)}
                    </div>
                  </div>
                </div>
                <Badge variant="outline">{Math.round(a.confidence * 100)}% conf.</Badge>
              </div>
            ))}
            <div className="text-muted-foreground pt-1 text-xs">
              Latest satellite: {satellite[0].sensor} · {satellite[0].floodedKm2} km² flooded · {relTime(satellite[0].acquiredAt)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
