"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Bot, Clock, Play, Wrench, Workflow } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader, Stat } from "@/components/shared";
import { agents, agentRuns } from "@/lib/mock/platform";
import { useBeacon } from "@/lib/store";
import { fmtTime, relTime } from "@/lib/time";
import type { AgentInfo } from "@/lib/types";

const statusVariant: Record<AgentInfo["status"], "success" | "warning" | "secondary" | "danger"> = {
  running: "success",
  waiting_approval: "warning",
  idle: "secondary",
  error: "danger",
};

const pipeline = [
  { step: "Hazard Watch", out: "event + alert" },
  { step: "SOP Planner", out: "site tasks" },
  { step: "Human approval", out: "approved tasks", human: true },
  { step: "Dispatch", out: "WhatsApp / SMS" },
  { step: "Intel Harvester · Evidence Verifier · Satellite · Camera", out: "verified evidence" },
  { step: "Damage Forecaster", out: "area ranges" },
  { step: "Response Optimizer", out: "allocation + restoration" },
  { step: "Press Verifier", out: "scored claims" },
  { step: "Human confirmation", out: "publishable figures", human: true },
  { step: "After-Action Reporter", out: "lessons → SOPs + model" },
];

export function AgentsView() {
  const audit = useBeacon((s) => s.audit);
  const [running, setRunning] = useState<string | null>(null);
  const run = (a: AgentInfo) => {
    setRunning(a.id);
    toast.info(`${a.name} triggered`, { description: `Tools: ${a.tools.slice(0, 3).join(", ")}…` });
    setTimeout(() => setRunning(null), 1400);
  };

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6">
      <PageHeader
        title="AI agents"
        subtitle="Twelve agents share one tool layer (MCP) with scoped permissions. Agents read and propose; people approve anything that leaves the system."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Agents" value={agents.length} />
        <Stat label="Running now" value={agents.filter((a) => a.status === "running").length} tone="success" />
        <Stat label="Waiting for a human" value={agents.filter((a) => a.status === "waiting_approval").length} tone="warning" />
        <Stat label="Runs today" value={agents.reduce((s, a) => s + a.runsToday, 0)} />
      </div>

      <Tabs defaultValue="roster">
        <TabsList>
          <TabsTrigger value="roster">Roster</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="runs">Run log</TabsTrigger>
          <TabsTrigger value="audit">Human audit ({audit.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="roster">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {agents.map((a) => (
              <Card key={a.id} className="gap-3">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Bot className="text-primary size-4" /> {a.name}
                    </CardTitle>
                    <Badge variant={statusVariant[a.status]}>{a.status.replace("_", " ")}</Badge>
                  </div>
                  <CardDescription>{a.role}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 text-xs">
                  <p className="text-muted-foreground">{a.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {a.tools.map((t) => (
                      <Badge key={t} variant="outline" className="font-mono text-[10px]">
                        <Wrench /> {t}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-muted-foreground flex flex-wrap gap-x-3">
                    <span>Model: {a.model}</span>
                    <span className="flex items-center gap-1"><Clock className="size-3" /> {relTime(a.lastRunAt)}</span>
                    <span>{a.runsToday} runs</span>
                    <span>~{(a.avgLatencyMs / 1000).toFixed(1)} s</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button size="sm" variant="outline" onClick={() => run(a)} disabled={running === a.id || a.id === "copilot"}>
                    <Play /> {running === a.id ? "Running…" : "Run now"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pipeline">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="size-4" /> One storm, end to end
              </CardTitle>
              <CardDescription>Amber steps are human gates</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="relative flex flex-col gap-3 border-l pl-6">
                {pipeline.map((p, i) => (
                  <li key={p.step} className="relative">
                    <span
                      className={`absolute top-1 -left-[31px] grid size-5 place-items-center rounded-full text-[10px] font-bold ${p.human ? "bg-warning text-white" : "bg-primary text-primary-foreground"}`}
                    >
                      {i + 1}
                    </span>
                    <div className="text-sm font-medium">{p.step}</div>
                    <div className="text-muted-foreground text-xs">→ {p.out}</div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="runs">
          <Card className="py-2">
            <CardContent className="px-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Tool calls</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agentRuns.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{fmtTime(r.startedAt)}</TableCell>
                      <TableCell className="font-medium">{agents.find((a) => a.id === r.agentId)?.name}</TableCell>
                      <TableCell className="max-w-[360px] text-xs whitespace-normal">{r.summary}</TableCell>
                      <TableCell className="font-mono text-[11px]">{r.toolCalls.join(" → ")}</TableCell>
                      <TableCell>{(r.durationMs / 1000).toFixed(1)} s</TableCell>
                      <TableCell>
                        <Badge variant={r.status === "ok" ? "success" : r.status === "needs_approval" ? "warning" : "danger"}>{r.status.replace("_", " ")}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardContent>
              {audit.length === 0 ? (
                <p className="text-muted-foreground py-6 text-center text-sm">No human actions in this session yet. Approve a task or confirm a claim to see it here.</p>
              ) : (
                <ul className="flex flex-col divide-y text-sm">
                  {audit.map((a, i) => (
                    <li key={i} className="flex justify-between gap-2 py-2">
                      <span>
                        <b>{a.actor}</b> {a.action} <span className="font-mono text-xs">{a.target}</span>
                      </span>
                      <span className="text-muted-foreground text-xs">{fmtTime(a.at)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
