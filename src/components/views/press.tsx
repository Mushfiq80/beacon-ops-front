"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCheck, Copy, FileText, Pencil, ShieldCheck, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label, Alert, AlertDescription, AlertTitle } from "@/components/ui/misc";
import { PageHeader, Stat, OpsMap, Confidence, AiTag } from "@/components/shared";
import { useBeacon } from "@/lib/store";
import { activeEvent } from "@/lib/mock/scenario";
import { metricLabel, claimStatusLabel, sourceTypeLabel } from "@/lib/labels";
import { fmt } from "@/lib/utils";
import { fmtTime, SCENARIO_NOW } from "@/lib/time";
import type { PressClaim, ClaimStatus } from "@/lib/types";

function draftRelease(claims: PressClaim[]) {
  const ok = claims.filter((c) => c.status === "human_confirmed");
  const lines = ok.map((c) => `- ${metricLabel[c.metric]}: ${fmt(c.value)} (${c.area})`);
  return [
    `PRESS RELEASE — ${activeEvent.name}`,
    `Status as of ${fmtTime(SCENARIO_NOW)} (UTC+6)`,
    "",
    ok.length
      ? "Figures below have been cross-checked across national authorities and media and confirmed by the duty officer:"
      : "No figures have been human-confirmed yet. Confirm claims in the review queue before publishing.",
    ...lines,
    "",
    "Figures are preliminary and will be updated as assessments continue.",
    "Sources: national disaster management authority situation reports, meteorological and flood-warning agencies, verified field reports.",
  ].join("\n");
}

export function PressView() {
  const { claims, setClaimStatus } = useBeacon();
  const [filter, setFilter] = useState<"all" | ClaimStatus>("all");
  const [editing, setEditing] = useState<PressClaim | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editNote, setEditNote] = useState("");
  const [showRelease, setShowRelease] = useState(false);
  const list = useMemo(() => claims.filter((c) => filter === "all" || c.status === filter), [claims, filter]);
  const n = (s: ClaimStatus) => claims.filter((c) => c.status === s).length;

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6">
      <PageHeader
        title="Press verification"
        subtitle="The Press Verifier Agent groups every damage figure by metric and area, weighs each source by credibility and recency, and flags conflicts. A person confirms each figure on the map before anything is published."
        actions={
          <Button onClick={() => setShowRelease(true)}>
            <FileText /> Draft press release
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="Claims tracked" value={claims.length} />
        <Stat label="AI verified" value={n("ai_verified")} hint="sources agree" />
        <Stat label="Conflicts" value={n("conflict")} tone="danger" />
        <Stat label="Needs review" value={n("needs_review")} tone="warning" />
        <Stat label="Human confirmed" value={n("human_confirmed")} tone="success" />
      </div>

      <Alert>
        <ShieldCheck />
        <AlertTitle>Two-step rule</AlertTitle>
        <AlertDescription>
          AI verification is step one only. A figure becomes publishable after a named reviewer confirms it. Different definitions (e.g. &ldquo;evacuated before landfall&rdquo; vs. &ldquo;in shelters now&rdquo;) are never merged.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 xl:grid-cols-5">
        <div className="flex flex-col gap-3 xl:col-span-3">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="conflict">Conflict</TabsTrigger>
              <TabsTrigger value="needs_review">Needs review</TabsTrigger>
              <TabsTrigger value="ai_verified">AI verified</TabsTrigger>
              <TabsTrigger value="human_confirmed">Confirmed</TabsTrigger>
            </TabsList>
          </Tabs>
          {list.map((c) => (
            <Card key={c.id} className="gap-3 py-4">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={claimStatusLabel[c.status].variant}>{claimStatusLabel[c.status].text}</Badge>
                  <span className="text-muted-foreground text-xs">{c.area} · updated {fmtTime(c.updatedAt)}</span>
                </div>
                <CardTitle className="flex items-baseline gap-2">
                  <span className="text-2xl tabular-nums">{fmt(c.value)}</span>
                  <span className="text-muted-foreground text-sm font-normal">{metricLabel[c.metric]}</span>
                  {c.range[0] !== c.range[1] && (
                    <span className="text-muted-foreground text-xs font-normal">
                      (sources range {fmt(c.range[0])}–{fmt(c.range[1])})
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-start gap-2 text-sm">
                  <AiTag>analysis</AiTag>
                  <span>{c.aiNote}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Source agreement</span>
                  <Confidence value={c.agreement} />
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Reported</TableHead>
                      <TableHead>Weight</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {c.sources.map((s) => (
                      <TableRow key={s.name + s.value}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell>{sourceTypeLabel[s.type]}</TableCell>
                        <TableCell className="tabular-nums">{fmt(s.value)}</TableCell>
                        <TableCell>{fmtTime(s.at)}</TableCell>
                        <TableCell>{s.weight.toFixed(1)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {c.reviewer && (
                  <div className="text-muted-foreground text-xs">
                    Reviewed by {c.reviewer}
                    {c.reviewNote ? ` — “${c.reviewNote}”` : ""}
                  </div>
                )}
              </CardContent>
              {c.status !== "human_confirmed" && c.status !== "rejected" && (
                <CardFooter className="gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      setClaimStatus(c.id, "human_confirmed");
                      toast.success("Figure confirmed", { description: `${metricLabel[c.metric]} · ${c.area}` });
                    }}
                  >
                    <CheckCheck /> Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditing(c);
                      setEditValue(String(c.value));
                      setEditNote("");
                    }}
                  >
                    <Pencil /> Correct & confirm
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setClaimStatus(c.id, "rejected")}>
                    <X /> Reject
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
        <div className="flex flex-col gap-3 xl:col-span-2">
          <Card className="xl:sticky xl:top-4">
            <CardHeader>
              <CardTitle>Claims on the map</CardTitle>
              <CardDescription>Check location before confirming</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <OpsMap layers={["claims", "damage"]} className="h-[420px]" />
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Correct and confirm</DialogTitle>
            <DialogDescription>
              {editing && `${metricLabel[editing.metric]} · ${editing.area}`}. Your value and note are saved to the audit log.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="v">Confirmed value</Label>
              <Input id="v" type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="n">Note (source you checked)</Label>
              <Textarea id="n" value={editNote} onChange={(e) => setEditNote(e.target.value)} placeholder="e.g. Confirmed by phone with district relief officer" />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (!editing) return;
                setClaimStatus(editing.id, "human_confirmed", editNote || undefined, Number(editValue));
                setEditing(null);
                toast.success("Corrected figure confirmed");
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRelease} onOpenChange={setShowRelease}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Press release draft <AiTag>drafted</AiTag>
            </DialogTitle>
            <DialogDescription>Only human-confirmed figures are included.</DialogDescription>
          </DialogHeader>
          <pre className="bg-muted max-h-[50vh] overflow-auto rounded-md p-4 text-xs whitespace-pre-wrap">{draftRelease(claims)}</pre>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard?.writeText(draftRelease(claims));
                toast.success("Copied");
              }}
            >
              <Copy /> Copy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
