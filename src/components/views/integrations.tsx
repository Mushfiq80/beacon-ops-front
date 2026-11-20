"use client";

import { useMemo, useState } from "react";
import { ExternalLink, KeyRound } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/misc";
import { PageHeader, Stat } from "@/components/shared";
import { dataSources } from "@/lib/mock/platform";
import type { DataSource } from "@/lib/types";

const cats: { key: "all" | DataSource["category"]; label: string }[] = [
  { key: "all", label: "All" },
  { key: "agency", label: "Authorities" },
  { key: "news", label: "News" },
  { key: "video", label: "Video" },
  { key: "satellite", label: "Satellite" },
  { key: "forecast", label: "Forecast" },
  { key: "exposure", label: "Exposure" },
  { key: "camera", label: "Cameras" },
  { key: "messaging", label: "Messaging" },
  { key: "ai", label: "AI" },
  { key: "database", label: "Database" },
];

const statusVariant = { connected: "success", needs_key: "warning", planned: "secondary", error: "danger" } as const;

export function IntegrationsView() {
  const [cat, setCat] = useState<(typeof cats)[number]["key"]>("all");
  const list = useMemo(() => dataSources.filter((d) => cat === "all" || d.category === cat), [cat]);

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6">
      <PageHeader
        title="Integrations"
        subtitle="Every data source sits behind an adapter, so a country's official source can replace a global open one without code changes."
      />
      <Alert>
        <KeyRound />
        <AlertTitle>Where keys go</AlertTitle>
        <AlertDescription>
          Browser-safe keys (NEXT_PUBLIC_*) in <code>frontend/.env.local</code>. All secret keys (service role, LLM, WhatsApp, satellite) in <code>backend/.env</code> only — never in the frontend.
        </AlertDescription>
      </Alert>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Connectors" value={dataSources.length} />
        <Stat label="Connected" value={dataSources.filter((d) => d.status === "connected").length} tone="success" />
        <Stat label="Need a key / sign-up" value={dataSources.filter((d) => d.status === "needs_key").length} tone="warning" />
        <Stat label="Planned (no key needed)" value={dataSources.filter((d) => d.status === "planned").length} />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {cats.map((c) => (
          <Button key={c.key} size="sm" variant={cat === c.key ? "default" : "outline"} onClick={() => setCat(c.key)}>
            {c.label}
          </Button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {list.map((d) => (
          <Card key={d.id} className="gap-3">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-sm">{d.name}</CardTitle>
                <Badge variant={statusVariant[d.status]}>{d.status.replace("_", " ")}</Badge>
              </div>
              <CardDescription>
                {d.coverage} · {d.access}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-xs">
              <p className="text-muted-foreground">{d.notes}</p>
              {d.envKey && (
                <div className="bg-muted rounded px-2 py-1 font-mono text-[11px]">{d.envKey}</div>
              )}
            </CardContent>
            <CardFooter>
              <Button size="sm" variant="ghost" asChild>
                <a href={d.url} target="_blank" rel="noreferrer">
                  <ExternalLink /> Open
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
