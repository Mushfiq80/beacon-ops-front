"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, FileText, MessageCircle, Send, Smartphone, Sparkles, Undo2, Upload } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label, Progress } from "@/components/ui/misc";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, Stat, OpsMap, Confidence, AiTag } from "@/components/shared";
import { useBeacon } from "@/lib/store";
import { sites } from "@/lib/mock/scenario";
import { siteTypeLabel, taskStatusLabel } from "@/lib/labels";
import { fmt } from "@/lib/utils";
import { fmtTime } from "@/lib/time";

const sops = [
  { id: "TEL-SOP", name: "Telecom tower cyclone & flood SOP v3.2", owner: "Demo Telecom", clauses: 64, tasks: 22, lang: "EN/BN" },
  { id: "PWR-SOP", name: "Grid substation storm readiness v1.8", owner: "Demo Power", clauses: 41, tasks: 15, lang: "EN" },
  { id: "PRT-SOP", name: "Port cyclone signal procedure", owner: "Demo Ports", clauses: 28, tasks: 9, lang: "EN" },
  { id: "HLT-SOP", name: "Health facility emergency plan", owner: "Public", clauses: 33, tasks: 11, lang: "BN" },
  { id: "IND-SOP", name: "Industrial zone hazmat & evacuation", owner: "Demo EPZ", clauses: 19, tasks: 7, lang: "EN" },
];

function RiskBar({ v }: { v: number }) {
  return (
    <Progress
      value={v * 100}
      className="h-1.5 w-16"
      indicatorClassName={v >= 0.8 ? "bg-destructive" : v >= 0.6 ? "bg-warning" : "bg-success"}
    />
  );
}

export function PrepareView() {
  const { tasks, approveTask, rejectTask, approveAllPending, lang } = useBeacon();
  const [generating, setGenerating] = useState(false);
  const pending = tasks.filter((t) => t.status === "pending_approval");
  const siteName = (id: string) => sites.find((s) => s.id === id)?.name ?? id;
  const counts = (st: string) => tasks.filter((t) => t.status === st).length;

  const generate = () => {
    setGenerating(true);
    toast.info("SOP Planner Agent started", { description: "Retrieving SOP clauses for 12 sites × cyclone + flood…" });
    setTimeout(() => {
      setGenerating(false);
      toast.success("Plans refreshed", { description: "No new tasks beyond the 3 already waiting for approval." });
    }, 1600);
  };

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6">
      <PageHeader
        phase="Phase 1 · Prepare"
        title="Site plans & dispatch"
        subtitle="The SOP Planner Agent turns each operator's own procedures into time-ordered tasks per site. Nothing is sent until a named person approves it."
        actions={
          <>
            <Button variant="outline" onClick={generate} disabled={generating}>
              <Sparkles /> {generating ? "Planning…" : "Re-plan with AI"}
            </Button>
            <Button
              disabled={pending.length === 0}
              onClick={() => {
                const n = approveAllPending();
                toast.success(`${n} tasks approved and dispatched`, { description: "WhatsApp / SMS queued · audit log updated" });
              }}
            >
              <Send /> Approve all ({pending.length})
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="Sites monitored" value={sites.length} hint={`${sites.filter((s) => s.risk.overall >= 0.75).length} high risk`} />
        <Stat label="Needs approval" value={counts("pending_approval")} tone="warning" />
        <Stat label="Sent" value={counts("sent")} />
        <Stat label="Confirmed" value={counts("confirmed")} tone="success" />
        <Stat label="Late / blocked" value={counts("late") + counts("blocked")} tone="danger" />
      </div>

      <Tabs defaultValue="queue">
        <TabsList>
          <TabsTrigger value="queue">Approval queue</TabsTrigger>
          <TabsTrigger value="tasks">All tasks</TabsTrigger>
          <TabsTrigger value="sites">Sites & risk</TabsTrigger>
          <TabsTrigger value="sop">SOP library</TabsTrigger>
        </TabsList>

        <TabsContent value="queue">
          {pending.length === 0 ? (
            <Card>
              <CardContent className="text-muted-foreground py-8 text-center text-sm">All AI-drafted tasks have been reviewed.</CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 lg:grid-cols-3">
              {pending.map((t) => (
                <Card key={t.id}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <AiTag>drafted</AiTag>
                      <Badge variant="outline">{t.sopRef}</Badge>
                    </div>
                    <CardTitle className="text-base">{lang === "bn" ? t.titleBn : t.title}</CardTitle>
                    <CardDescription>
                      {siteName(t.siteId)} · due {fmtTime(t.dueAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3 text-sm">
                    <div className="bg-muted rounded-md p-3">
                      <div className="text-muted-foreground mb-1 flex items-center gap-1.5 text-xs">
                        {t.channel === "whatsapp" ? <MessageCircle className="size-3.5" /> : <Smartphone className="size-3.5" />}
                        Message to {t.assignee}
                      </div>
                      <div className="font-medium">{t.titleBn}</div>
                      <div className="text-muted-foreground text-xs">EN: {t.title}</div>
                    </div>
                    <div className="text-xs">
                      <span className="text-muted-foreground">Why: </span>
                      {t.reasoning}
                    </div>
                    <Confidence value={t.aiConfidence} />
                  </CardContent>
                  <CardFooter className="gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        approveTask(t.id);
                        toast.success("Approved and dispatched", { description: `${t.channel.toUpperCase()} to ${t.assignee}` });
                      }}
                    >
                      <Check /> Approve & send
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => rejectTask(t.id)}>
                      <Undo2 /> Return
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tasks">
          <Card className="py-2">
            <CardContent className="px-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>SOP</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>AI conf.</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="max-w-[320px] truncate font-medium">{lang === "bn" ? t.titleBn : t.title}</TableCell>
                      <TableCell>{siteName(t.siteId)}</TableCell>
                      <TableCell>{t.sopRef}</TableCell>
                      <TableCell>{fmtTime(t.dueAt)}</TableCell>
                      <TableCell className="capitalize">{t.channel}</TableCell>
                      <TableCell>
                        <Confidence value={t.aiConfidence} />
                      </TableCell>
                      <TableCell>
                        <Badge variant={taskStatusLabel[t.status].variant}>{taskStatusLabel[t.status].text}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sites" className="grid gap-4 xl:grid-cols-5">
          <Card className="py-2 xl:col-span-3">
            <CardContent className="px-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Wind</TableHead>
                    <TableHead>Surge</TableHead>
                    <TableHead>Flood</TableHead>
                    <TableHead>Backup</TableHead>
                    <TableHead>Serves</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...sites]
                    .sort((a, b) => b.risk.overall - a.risk.overall)
                    .map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <div className="font-medium">{s.name}</div>
                          <div className="text-muted-foreground text-xs">
                            {s.upazila}, {s.district} · crit. {s.criticality}
                          </div>
                        </TableCell>
                        <TableCell>{siteTypeLabel[s.type]}</TableCell>
                        <TableCell><RiskBar v={s.risk.wind} /></TableCell>
                        <TableCell><RiskBar v={s.risk.surge} /></TableCell>
                        <TableCell><RiskBar v={s.risk.flood} /></TableCell>
                        <TableCell>{s.backupHours} h</TableCell>
                        <TableCell>{fmt(s.populationServed)}</TableCell>
                        <TableCell>
                          <Badge variant={s.status === "down" ? "danger" : s.status === "at_risk" ? "warning" : s.status === "normal" ? "outline" : "success"}>
                            {s.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Site risk map</CardTitle>
              <CardDescription>Risk = hazard forecast × site exposure × backup gap</CardDescription>
            </CardHeader>
            <CardContent>
              <OpsMap layers={["track", "sites"]} className="h-[380px]" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sop">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2 py-2">
              <CardContent className="px-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SOP</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Clauses indexed</TableHead>
                      <TableHead>Tasks extracted</TableHead>
                      <TableHead>Language</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sops.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="flex items-center gap-2 font-medium">
                          <FileText className="text-muted-foreground size-4" /> {s.name}
                        </TableCell>
                        <TableCell>{s.owner}</TableCell>
                        <TableCell>{s.clauses}</TableCell>
                        <TableCell>{s.tasks}</TableCell>
                        <TableCell>{s.lang}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Add an SOP</CardTitle>
                <CardDescription>PDF, Word or text. The agent splits it into clauses, embeds them (pgvector) and proposes tasks for human confirmation.</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full" variant="outline">
                      <Upload /> Upload SOP
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload SOP</DialogTitle>
                      <DialogDescription>Stored in Supabase Storage; parsed by the backend ingestion worker.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3">
                      <div className="grid gap-1.5">
                        <Label htmlFor="sop-file">File</Label>
                        <Input id="sop-file" type="file" accept=".pdf,.doc,.docx,.txt,.md" />
                      </div>
                      <div className="grid gap-1.5">
                        <Label>Applies to</Label>
                        <Select defaultValue="telecom_tower">
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(siteTypeLabel).map(([k, v]) => (
                              <SelectItem key={k} value={k}>
                                {v}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={() => toast.info("Upload needs the backend", { description: "Connect Supabase + backend API to enable ingestion." })}>
                        Upload & extract
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
