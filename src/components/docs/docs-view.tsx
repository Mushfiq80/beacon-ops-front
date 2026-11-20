"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { ArrowRight, Download, ExternalLink, FileText, Link2, Lock, Printer, Search, Settings2 } from "lucide-react";
import { useDocs, docsAvailability } from "@/lib/docs-store";
import { CHANGELOG, REPOS, ROADMAP, STACK, type DocsSection } from "@/lib/docs-content";
import { useBeacon } from "@/lib/store";
import { agents, dataSources } from "@/lib/mock/platform";
import { activeEvent, sites } from "@/lib/mock/scenario";
import { endpoints } from "@/lib/api";
import { BeaconLogo } from "@/components/layout/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/* ---------- small helpers ---------- */

function Prose({ text }: { text: string }) {
  if (!text) return null;
  const blocks = text.split(/\n\s*\n/);
  return (
    <div className="flex flex-col gap-3 text-[15px] leading-relaxed text-foreground/90">
      {blocks.map((b, i) => {
        const lines = b.split("\n").filter(Boolean);
        if (lines.every((l) => /^(- |\d+\. )/.test(l))) {
          const ordered = /^\d+\. /.test(lines[0]);
          const Tag = ordered ? "ol" : "ul";
          return (
            <Tag key={i} className={cn("flex flex-col gap-1.5 pl-5", ordered ? "list-decimal" : "list-disc")}>
              {lines.map((l, j) => (
                <li key={j}>{l.replace(/^(- |\d+\. )/, "")}</li>
              ))}
            </Tag>
          );
        }
        return <p key={i}>{b}</p>;
      })}
    </div>
  );
}

function Box({ title, sub, tone = "default" }: { title: string; sub?: string; tone?: "default" | "ai" | "gate" | "data" }) {
  const tones = {
    default: "border-border bg-card",
    ai: "border-primary/40 bg-primary/5",
    gate: "border-amber-500/60 bg-amber-500/10",
    data: "border-emerald-600/40 bg-emerald-600/5",
  };
  return (
    <div className={cn("rounded-lg border px-3 py-2.5 text-center shadow-sm", tones[tone])}>
      <div className="text-sm font-semibold">{title}</div>
      {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

function Arrow({ vertical }: { vertical?: boolean }) {
  return <div className={cn("flex items-center justify-center text-primary", vertical ? "py-1" : "px-1")}>{vertical ? "↓" : "→"}</div>;
}

/* ---------- live widgets ---------- */

const MODULES = [
  { name: "Overview map", href: "/", note: "Track, cone, sites, reports, GIBS layers" },
  { name: "Prepare", href: "/prepare", note: "SOP plans, dispatch approvals" },
  { name: "Respond", href: "/respond", note: "Evidence board" },
  { name: "Recover", href: "/recover", note: "Damage ranges, allocation" },
  { name: "Intel & Sources", href: "/intel", note: "News, agencies, YouTube, satellite" },
  { name: "Press Verification", href: "/press", note: "AI verify + human confirm on map" },
  { name: "AI Agents", href: "/agents", note: "12 agents, MCP tools, runs" },
  { name: "Ask Beacon", href: "/copilot", note: "Bangla/English copilot" },
  { name: "Integrations", href: "/integrations", note: "20 data sources" },
  { name: "Settings", href: "/settings", note: "Roles, languages" },
];

function useLiveMetrics() {
  const tasks = useBeacon((s) => s.tasks);
  const reports = useBeacon((s) => s.reports);
  const claims = useBeacon((s) => s.claims);
  return {
    pendingApprovals: tasks.filter((t) => t.status === "pending_approval").length,
    tasksSent: tasks.filter((t) => t.status === "sent" || t.status === "confirmed").length,
    reports: reports.length,
    reportsReviewed: reports.filter((r) => (r as { humanReviewed?: boolean }).humanReviewed).length,
    claims: claims.length,
    claimsConfirmed: claims.filter((c) => c.status === "human_confirmed").length,
    agents: agents.length,
    agentsRunning: agents.filter((a) => a.status === "running").length,
    runsToday: agents.reduce((n, a) => n + a.runsToday, 0),
    sources: dataSources.length,
    sourcesConnected: dataSources.filter((d) => d.status === "connected").length,
    sites: sites.length,
    sitesDown: sites.filter((s) => s.status === "down").length,
  };
}

function LiveWidget({ kind, team }: { kind: NonNullable<DocsSection["live"]>; team: ReturnType<typeof useDocs.getState>["team"] }) {
  const m = useLiveMetrics();
  switch (kind) {
    case "features":
      return (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr><th className="px-3 py-2">Module</th><th className="px-3 py-2">What it does</th><th className="px-3 py-2">Status</th></tr>
            </thead>
            <tbody>
              {MODULES.map((x) => (
                <tr key={x.href} className="border-t">
                  <td className="px-3 py-2 font-medium"><Link className="text-primary hover:underline" href={x.href}>{x.name}</Link></td>
                  <td className="px-3 py-2 text-muted-foreground">{x.note}</td>
                  <td className="px-3 py-2"><Badge variant="success">Live · demo data</Badge></td>
                </tr>
              ))}
              {ROADMAP[0].items.map((x) => (
                <tr key={x} className="border-t">
                  <td className="px-3 py-2 font-medium">{x}</td>
                  <td className="px-3 py-2 text-muted-foreground">Backend phase</td>
                  <td className="px-3 py-2"><Badge variant="warning">Upcoming</Badge></td>
                </tr>
              ))}
              {ROADMAP[1].items.map((x) => (
                <tr key={x} className="border-t">
                  <td className="px-3 py-2 font-medium">{x}</td>
                  <td className="px-3 py-2 text-muted-foreground">Pilot phase</td>
                  <td className="px-3 py-2"><Badge variant="outline">Planned</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "architecture":
      return (
        <div className="grid gap-2 rounded-lg border bg-muted/20 p-4 md:grid-cols-[1fr_auto_1fr_auto_1.4fr_auto_1fr] md:items-stretch">
          <div className="flex flex-col gap-2"><div className="text-xs font-semibold uppercase text-muted-foreground">UI</div><Box title="Next.js web app" sub="10 modules · Leaflet map" /><Box title="Ask Beacon" sub="copilot" /></div>
          <Arrow />
          <div className="flex flex-col gap-2"><div className="text-xs font-semibold uppercase text-muted-foreground">API</div><Box title="FastAPI /v1" sub="JWT · RBAC" /><Box title="Supabase Realtime" sub="live updates" /></div>
          <Arrow />
          <div className="flex flex-col gap-2"><div className="text-xs font-semibold uppercase text-muted-foreground">Services</div><Box tone="ai" title={`${agents.length} LangGraph agents`} sub="provider-neutral LLMs" /><Box tone="ai" title="5 MCP servers" sub="ops · intel · geo · docs · camera" /><Box tone="gate" title="Human approval gate" sub="messages + published figures" /><Box title="RQ workers" sub="harvest · satellite · models" /></div>
          <Arrow />
          <div className="flex flex-col gap-2"><div className="text-xs font-semibold uppercase text-muted-foreground">Data</div><Box tone="data" title="Supabase Postgres" sub="PostGIS · pgvector · RLS" /><Box tone="data" title="MongoDB" sub="raw docs · traces" /><Box tone="data" title="Redis · Storage" sub="queues · photos · rasters" /></div>
        </div>
      );
    case "dataflow":
      return (
        <div className="grid gap-2 rounded-lg border bg-muted/20 p-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">
          <Box title="Input" sub="BMD · FFWC · GDACS · news · YouTube · satellite · field" />
          <Arrow /><Box title="Processing" sub="parse · OCR · speech · dedup · geocode" />
          <Arrow /><Box tone="ai" title="AI" sub="extract · RAG on SOPs · verify · forecast · optimise" />
          <Arrow /><Box tone="gate" title="Human gate" sub="approve · confirm on map" />
          <Arrow /><Box title="Output" sub="tasks · alerts · press figures · AAR" />
          <Arrow /><Box tone="data" title="Feedback" sub="officer decisions → evals" />
        </div>
      );
    case "stack":
      return (
        <div className="grid gap-2 sm:grid-cols-2">
          {STACK.map((s) => (
            <div key={s.layer} className="rounded-lg border bg-card p-3">
              <div className="text-xs font-semibold uppercase text-muted-foreground">{s.layer}</div>
              <div className="mt-1 text-sm">{s.items}</div>
            </div>
          ))}
        </div>
      );
    case "api": {
      const rows = Object.entries(endpoints).map(([k, v]) => [k, typeof v === "function" ? (v as (x: string) => string)("{id}") : String(v)]);
      const method = (k: string) => (/approve|review|pressRelease|copilot/.test(k) ? "POST" : "GET");
      return (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground"><tr><th className="px-3 py-2">Method</th><th className="px-3 py-2">Endpoint</th><th className="px-3 py-2">Name</th></tr></thead>
            <tbody>
              {rows.map(([k, p]) => (
                <tr key={k} className="border-t"><td className="px-3 py-1.5"><Badge variant={method(k) === "POST" ? "warning" : "info"}>{method(k)}</Badge></td><td className="px-3 py-1.5 font-mono text-xs">{p}</td><td className="px-3 py-1.5 text-muted-foreground">{k}</td></tr>
              ))}
            </tbody>
          </table>
          <div className="border-t px-3 py-2 text-xs text-muted-foreground">APIs used: BMD, FFWC, GDACS, ReliefWeb, GDELT, Open-Meteo, YouTube Data, Copernicus, NASA Earthdata/GIBS, WhatsApp Business, SMS gateway. Full OpenAPI at <span className="font-mono">/docs</span> on the API server.</div>
        </div>
      );
    }
    case "ai":
      return (
        <div className="flex flex-col gap-3">
          <Prose text={`- Models: Gemini Flash (extraction), Claude (planning, verification), Llama/Qwen/Gemma via Ollama for on-premise; BGE-M3 embeddings; Whisper; XGBoost + CLIMADA; OR-Tools.
- RAG: SOP clauses with contextual headers in pgvector, hybrid search + reranker, every plan cites its clause; corrective step answers "unsure" when retrieval is weak.
- GraphRAG: evidence graph links each damage claim to sources, places and agencies; the Press Verifier walks it to score agreement.
- Personalisation: per-agency SOPs, language and thresholds; per-role views.
- Explainability: every fact keeps its source sentence; every agent run logs prompt version, model, tools and the human decision.`} />
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((a) => (
              <div key={a.id} className="rounded-lg border bg-card p-3">
                <div className="flex items-center justify-between gap-2"><div className="text-sm font-semibold">{a.name}</div><Badge variant={a.status === "running" ? "success" : a.status === "waiting_approval" ? "warning" : "outline"}>{a.status.replace("_", " ")}</Badge></div>
                <div className="mt-1 text-xs text-muted-foreground">{a.model} · {a.tools.length} tools · {a.runsToday} runs today</div>
              </div>
            ))}
          </div>
        </div>
      );
    case "metrics":
      return (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {[
            ["Tasks awaiting approval", m.pendingApprovals],
            ["Tasks sent after approval", m.tasksSent],
            ["Field reports", m.reports],
            ["Reports human-reviewed", m.reportsReviewed],
            ["Damage claims tracked", m.claims],
            ["Claims human-confirmed", m.claimsConfirmed],
            ["Agent runs today", m.runsToday],
            ["Data sources defined", m.sources],
          ].map(([k, v]) => (
            <div key={k as string} className="rounded-lg border bg-card p-3"><div className="text-xs text-muted-foreground">{k}</div><div className="font-display text-2xl font-bold">{v}</div></div>
          ))}
          <div className="col-span-2 text-xs text-muted-foreground md:col-span-4">Pilot KPIs: warning → dispatch draft under 5 min · claim check in minutes, not hours · 100% human sign-off · Bangla + English from day one.</div>
        </div>
      );
    case "team":
      return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((p) => (
            <div key={p.name} className="flex items-center gap-3 rounded-xl border bg-card p-4">
              {p.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.photo} alt={p.name} className="size-16 shrink-0 rounded-full object-cover ring-2 ring-primary/20" />
              ) : (
                <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-lg font-bold text-primary ring-2 ring-primary/20">
                  {p.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </div>
              )}
              <div className="min-w-0">
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.role}</div>
                {p.email && <a className="text-xs text-primary hover:underline" href={`mailto:${p.email}`}>{p.email}</a>}
              </div>
            </div>
          ))}
        </div>
      );
    case "roadmap":
      return (
        <div className="grid gap-3 md:grid-cols-3">
          {ROADMAP.map((r, i) => (
            <div key={r.term} className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 text-sm font-semibold"><span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">{i + 1}</span>{r.term}</div>
              <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">{r.items.map((x) => <li key={x}>{x}</li>)}</ul>
            </div>
          ))}
        </div>
      );
    case "changelog":
      return (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <tbody>
              {CHANGELOG.map((c) => (
                <tr key={c.version} className="border-t first:border-t-0"><td className="px-3 py-2 font-mono text-xs">v{c.version}</td><td className="px-3 py-2 text-xs text-muted-foreground">{c.date}</td><td className="px-3 py-2">{c.note}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

/* ---------- export ---------- */

function toMarkdown(sections: DocsSection[]) {
  const out = ["# Beacon Ops: AI for Disaster Operations", "", `Live demo: ${REPOS.demo}`, `Frontend: ${REPOS.frontend}`, `Backend: ${REPOS.backend}`, ""];
  for (const s of sections) {
    out.push(`## ${s.title}`, "", s.body || "(live section, see the web version)", "");
  }
  return out.join("\n");
}

/* ---------- page ---------- */

const noop = () => () => {};

export function DocsView() {
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const { config, sections, team, publishedAt } = useDocs();
  const [q, setQ] = useState("");
  const m = useLiveMetrics();

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return sections;
    return sections.filter((s) => (s.title + " " + s.body).toLowerCase().includes(t));
  }, [q, sections]);

  if (!mounted) return <div className="p-10 text-sm text-muted-foreground">Loading documentation…</div>;

  const avail = docsAvailability(config);
  if (!avail.open) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
        <Lock className="size-10 text-muted-foreground" />
        <h1 className="font-display text-3xl font-bold">Not available</h1>
        <p className="max-w-md text-muted-foreground">{avail.reason}</p>
        <Link href="/docs/admin" className="text-sm text-primary hover:underline">Administrator sign-in</Link>
      </div>
    );
  }

  const pitch = filtered.filter((s) => s.group === "pitch");
  const tech = filtered.filter((s) => s.group === "tech");

  const download = () => {
    const blob = new Blob([toMarkdown(sections)], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "beacon-ops-docs.md";
    a.click();
  };

  const renderSection = (s: DocsSection, i: number) => (
    <section key={s.id} id={s.id} className="scroll-mt-24 border-b py-10 last:border-b-0">
      <div className="mb-1 font-mono text-xs uppercase tracking-widest text-primary">{s.group === "pitch" ? `Pitch · ${String(i + 1).padStart(2, "0")}` : "Technical"}</div>
      <h2 className="font-display mb-4 text-2xl font-bold">
        <a href={`#${s.id}`} className="hover:underline">{s.title}</a>
      </h2>
      <div className="flex flex-col gap-5">
        <Prose text={s.body} />
        {s.live && <LiveWidget kind={s.live} team={team} />}
      </div>
    </section>
  );

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-2"><BeaconLogo /></Link>
          <Badge variant="outline" className="hidden sm:inline-flex">/docs</Badge>
          <div className="relative ml-auto w-full max-w-xs">
            <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the docs…" className="pl-8" />
          </div>
          <Button variant="outline" size="sm" onClick={download} title="Export Markdown"><Download className="size-4" /><span className="hidden md:inline">Markdown</span></Button>
          <Button variant="outline" size="sm" onClick={() => window.print()} title="Export PDF"><Printer className="size-4" /><span className="hidden md:inline">PDF</span></Button>
          <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(window.location.href)} title="Copy link"><Link2 className="size-4" /></Button>
          <Link href="/docs/admin" title="Admin"><Button variant="ghost" size="sm"><Settings2 className="size-4" /></Button></Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-[220px_1fr]">
        <aside className="sticky top-16 hidden h-[calc(100dvh-5rem)] overflow-y-auto py-8 lg:block print:hidden">
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Pitch deck</div>
          <nav className="mb-6 flex flex-col gap-0.5">{pitch.map((s) => <a key={s.id} href={`#${s.id}`} className="rounded px-2 py-1 text-sm text-foreground/80 hover:bg-muted">{s.title}</a>)}</nav>
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Technical docs</div>
          <nav className="flex flex-col gap-0.5">{tech.map((s) => <a key={s.id} href={`#${s.id}`} className="rounded px-2 py-1 text-sm text-foreground/80 hover:bg-muted">{s.title}</a>)}</nav>
        </aside>

        <main className="min-w-0 pb-24">
          <div className="border-b py-12">
            <div className="font-mono text-xs uppercase tracking-widest text-primary">Late Light Labs · International AI Builders Congress 2026</div>
            <h1 className="font-display mt-3 text-4xl font-extrabold tracking-tight md:text-5xl">Beacon Ops</h1>
            <p className="mt-2 text-xl text-muted-foreground">AI for Disaster Operations · Prepare · Respond · Recover</p>
            <p className="mt-4 max-w-3xl text-[15px]">An AI operations desk for disaster agencies. Twelve agents read official feeds, media, satellites and field reports; officers approve every message and confirm every published number. <span className="font-semibold">AI proposes, humans decide.</span></p>
            <div className="mt-6 flex flex-wrap gap-2">
              <a href={REPOS.demo} target="_blank" rel="noreferrer"><Button size="sm">Open live demo <ArrowRight className="size-4" /></Button></a>
              <a href={REPOS.frontend} target="_blank" rel="noreferrer"><Button size="sm" variant="outline">Frontend repo <ExternalLink className="size-3.5" /></Button></a>
              <a href={REPOS.backend} target="_blank" rel="noreferrer"><Button size="sm" variant="outline">Backend repo <ExternalLink className="size-3.5" /></Button></a>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-2 md:grid-cols-4">
              {[
                ["Active drill", activeEvent.name],
                ["AI agents", `${m.agents} (${m.agentsRunning} running)`],
                ["Awaiting human approval", String(m.pendingApprovals)],
                ["Critical sites down", `${m.sitesDown} / ${m.sites}`],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg border bg-card p-3"><div className="text-xs text-muted-foreground">{k}</div><div className="mt-0.5 truncate text-sm font-semibold">{v}</div></div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><FileText className="size-3.5" /> Live view of the running app (synthetic drill data){publishedAt ? ` · last published ${new Date(publishedAt).toLocaleString()}` : ""}</div>
          </div>

          {pitch.length > 0 && <div className="pt-6 font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">Pitch deck</div>}
          {pitch.map(renderSection)}
          {tech.length > 0 && <div className="pt-6 font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">Technical documentation</div>}
          {tech.map(renderSection)}
          {filtered.length === 0 && <div className="py-20 text-center text-muted-foreground">No section matches “{q}”.</div>}
        </main>
      </div>
    </div>
  );
}
