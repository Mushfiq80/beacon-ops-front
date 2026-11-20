"use client";

import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/misc";
import { cn } from "@/lib/utils";
import type { CheckResult } from "@/lib/types";
import { CheckCircle2, CircleHelp, XCircle } from "lucide-react";

export const OpsMap = dynamic(() => import("@/components/map/ops-map").then((m) => m.OpsMap), {
  ssr: false,
  loading: () => <div className="bg-muted h-[420px] w-full animate-pulse rounded-lg" />,
});

export function PageHeader({
  title,
  subtitle,
  actions,
  phase,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  phase?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        {phase && <div className="text-primary font-display mb-1 text-[11px] font-bold tracking-[.12em] uppercase">{phase}</div>}
        <h1 className="font-display text-xl font-extrabold tracking-tight md:text-2xl">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-1 max-w-3xl text-sm">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: "default" | "danger" | "warning" | "success";
}) {
  return (
    <Card className="gap-1 py-4">
      <CardContent className="flex items-start justify-between gap-2">
        <div>
          <div className="text-muted-foreground text-xs">{label}</div>
          <div
            className={cn(
              "font-display mt-0.5 text-2xl font-bold tabular-nums",
              tone === "danger" && "text-destructive",
              tone === "warning" && "text-warning",
              tone === "success" && "text-success"
            )}
          >
            {value}
          </div>
          {hint && <div className="text-muted-foreground mt-0.5 text-xs">{hint}</div>}
        </div>
        {Icon && <Icon className="text-muted-foreground size-5" />}
      </CardContent>
    </Card>
  );
}

export function Confidence({ value, className }: { value: number; className?: string }) {
  const tone = value >= 0.8 ? "bg-success" : value >= 0.55 ? "bg-warning" : "bg-danger";
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Progress value={value * 100} className="h-1.5 w-16" indicatorClassName={tone} />
      <span className="text-muted-foreground text-xs tabular-nums">{Math.round(value * 100)}%</span>
    </div>
  );
}

export function CheckIcon({ result, label }: { result: CheckResult; label: string }) {
  const Icon = result === "pass" ? CheckCircle2 : result === "fail" ? XCircle : CircleHelp;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs",
        result === "pass" && "text-success",
        result === "fail" && "text-destructive",
        result === "unsure" && "text-warning"
      )}
      title={`${label}: ${result}`}
    >
      <Icon className="size-3.5" />
      {label}
    </span>
  );
}

export function RangeBar({ low, expected, high, max }: { low: number; expected: number; high: number; max: number }) {
  const l = (low / max) * 100;
  const h = (high / max) * 100;
  const e = (expected / max) * 100;
  return (
    <div className="bg-muted relative h-2 w-full rounded-full" title={`${low} – ${high} (expected ${expected})`}>
      <div className="bg-primary/30 absolute h-full rounded-full" style={{ left: `${l}%`, width: `${h - l}%` }} />
      <div className="bg-primary absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-background" style={{ left: `${e}%` }} />
    </div>
  );
}

export function AiTag({ children = "AI" }: { children?: React.ReactNode }) {
  return (
    <span className="bg-info-soft text-info inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
      ✦ {children}
    </span>
  );
}
