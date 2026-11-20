"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Camera, Check, Image as ImageIcon, Mic, Ruler, Video, X, HelpCircle, Type } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader, Stat, OpsMap, Confidence, CheckIcon, AiTag } from "@/components/shared";
import { useBeacon } from "@/lib/store";
import { cameras } from "@/lib/mock/intel";
import { fmtTime, relTime } from "@/lib/time";
import type { FieldReport } from "@/lib/types";

const mediaIcon = { photo: ImageIcon, video: Video, voice: Mic, text: Type } as const;
const verdictVariant = { verified: "success", unsure: "warning", rejected: "secondary", pending: "info" } as const;

export function RespondView() {
  const { reports, setReportVerdict } = useBeacon();
  const [filter, setFilter] = useState<"all" | FieldReport["verdict"]>("all");
  const list = useMemo(
    () => [...reports].filter((r) => filter === "all" || r.verdict === filter).sort((a, b) => b.receivedAt.localeCompare(a.receivedAt)),
    [reports, filter]
  );
  const count = (v: FieldReport["verdict"]) => reports.filter((r) => r.verdict === v).length;

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6">
      <PageHeader
        phase="Phase 2 · Respond"
        title="Evidence board"
        subtitle="Every ground report goes through the Evidence Verifier Agent: relevance, duplicate image, location and recency checks, plus flood depth from photos. It may answer 'unsure' — a person makes the final call."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="Reports received" value={reports.length} hint="WhatsApp, voice, web, field teams" />
        <Stat label="Verified" value={count("verified")} tone="success" />
        <Stat label="Pending review" value={count("pending")} />
        <Stat label="Unsure" value={count("unsure")} tone="warning" />
        <Stat label="Rejected" value={count("rejected")} hint="duplicate / wrong place / old" />
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        <div className="flex flex-col gap-3 xl:col-span-3">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="unsure">Unsure</TabsTrigger>
              <TabsTrigger value="verified">Verified</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>
          {list.map((r) => {
            const Icon = mediaIcon[r.media];
            return (
              <Card key={r.id} className="gap-3 py-4">
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={verdictVariant[r.verdict]} className="capitalize">
                      {r.verdict}
                    </Badge>
                    {r.humanReviewed && <Badge variant="outline">human reviewed</Badge>}
                    <span className="text-muted-foreground flex items-center gap-1 text-xs">
                      <Icon className="size-3.5" /> {r.channel.replace("_", " ")} · {r.reporter} · {r.area} · {relTime(r.receivedAt)}
                    </span>
                  </div>
                  <CardTitle className="text-sm leading-relaxed font-medium">{r.text}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <AiTag>checks</AiTag>
                  <CheckIcon result={r.checks.relevance} label="relevant" />
                  <CheckIcon result={r.checks.duplicate} label="original" />
                  <CheckIcon result={r.checks.location} label="location" />
                  <CheckIcon result={r.checks.recency} label="recent" />
                  {r.floodDepthCm && (
                    <span className="flex items-center gap-1 text-xs">
                      <Ruler className="size-3.5" /> depth {r.floodDepthCm[0]}–{r.floodDepthCm[1]} cm
                    </span>
                  )}
                  <Confidence value={r.confidence} className="ml-auto" />
                </CardContent>
                {(r.verdict === "pending" || r.verdict === "unsure") && (
                  <CardFooter className="gap-2">
                    <Button size="sm" onClick={() => { setReportVerdict(r.id, "verified"); toast.success("Report verified", { description: "Plan update proposed to the Command Centre." }); }}>
                      <Check /> Verify
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setReportVerdict(r.id, "unsure")}>
                      <HelpCircle /> Keep unsure
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setReportVerdict(r.id, "rejected")}>
                      <X /> Reject
                    </Button>
                  </CardFooter>
                )}
              </Card>
            );
          })}
        </div>

        <div className="flex flex-col gap-4 xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Live map</CardTitle>
              <CardDescription>Reports, sites and cameras</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <OpsMap layers={["track", "sites", "reports", "cameras"]} className="h-[480px]" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="size-4" /> Camera watch <AiTag>VLM</AiTag>
              </CardTitle>
              <CardDescription>Licensed public and operator-shared feeds only. Observations, not faces.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {cameras.map((c) => (
                <div key={c.id} className="flex items-start justify-between gap-2 rounded-md border p-2.5">
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{c.name}</div>
                    <div className="text-muted-foreground text-xs">{c.aiObservation}</div>
                    <div className="text-muted-foreground text-[11px]">{c.provider} · frame {fmtTime(c.lastFrameAt)}</div>
                  </div>
                  <Badge variant={c.status === "offline" ? "secondary" : c.waterLevel === "high" ? "danger" : "info"}>
                    {c.status === "offline" ? "offline" : `water ${c.waterLevel}`}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
