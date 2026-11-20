"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { ArrowDown, ArrowUp, ExternalLink, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { ADMIN_CODE, docsAvailability, useDocs } from "@/lib/docs-store";
import type { TeamMember } from "@/lib/docs-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label, Switch } from "@/components/ui/misc";
import { BeaconLogo } from "@/components/layout/logo";

/* ISO <-> <input type="datetime-local"> */
const toLocal = (iso: string) => {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};
const fromLocal = (v: string) => new Date(v).toISOString();

/* Resize an uploaded photo to a uniform 256×256 square (centre crop). */
function resizePhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(img.width, img.height);
      const c = document.createElement("canvas");
      c.width = c.height = 256;
      c.getContext("2d")!.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 256, 256);
      resolve(c.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

const noop = () => () => {};

export function DocsAdmin() {
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const [authed, setAuthed] = useState(() => {
    try { return typeof window !== "undefined" && sessionStorage.getItem("beacon.docs.admin") === "1"; } catch { return false; }
  });
  const [code, setCode] = useState("");
  const s = useDocs();

  if (!mounted) return null;

  if (!authed) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6">
        <form
          className="flex w-full max-w-sm flex-col gap-3 rounded-xl border bg-card p-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (code === ADMIN_CODE) {
              try { sessionStorage.setItem("beacon.docs.admin", "1"); } catch {}
              setAuthed(true);
            }
          }}
        >
          <BeaconLogo />
          <h1 className="font-display text-xl font-bold">/docs administrator</h1>
          <Input type="password" placeholder="Admin code" value={code} onChange={(e) => setCode(e.target.value)} />
          <Button type="submit">Sign in</Button>
          <p className="text-xs text-muted-foreground">Prototype gate. In production this uses Supabase Auth with the Admin / Super Admin role.</p>
        </form>
      </div>
    );
  }

  const avail = docsAvailability(s.config);
  const setMember = (i: number, patch: Partial<TeamMember>) => s.setTeam(s.team.map((m, j) => (j === i ? { ...m, ...patch } : m)));

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <div className="flex flex-wrap items-center gap-3">
        <BeaconLogo />
        <h1 className="font-display text-2xl font-bold">/docs admin</h1>
        <Badge variant={avail.open ? "success" : "danger"}>{avail.open ? "Public now" : "Not public"}</Badge>
        {s.draft && <Badge variant="warning">Unpublished changes</Badge>}
        <div className="ml-auto flex gap-2">
          <Link href="/docs" target="_blank"><Button variant="outline" size="sm"><ExternalLink className="size-4" /> View /docs</Button></Link>
          <Button size="sm" onClick={s.publish}><Save className="size-4" /> Publish</Button>
          <Button variant="ghost" size="sm" onClick={() => confirm("Reset all /docs content and settings to defaults?") && s.reset()}><RotateCcw className="size-4" /> Reset</Button>
        </div>
      </div>

      <section className="flex flex-col gap-4 rounded-xl border bg-card p-5">
        <h2 className="font-display text-lg font-bold">Visibility & schedule</h2>
        <div className="flex items-center gap-3">
          <Switch id="vis" checked={s.config.enabled} onCheckedChange={(v) => s.setConfig({ enabled: v })} />
          <Label htmlFor="vis">{s.config.enabled ? "ON: /docs is public within the window" : "OFF: /docs shows Not available"}</Label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1"><Label>Start (date + time)</Label><Input type="datetime-local" value={toLocal(s.config.startAt)} onChange={(e) => e.target.value && s.setConfig({ startAt: fromLocal(e.target.value) })} /></div>
          <div className="flex flex-col gap-1"><Label>End (date + time)</Label><Input type="datetime-local" value={toLocal(s.config.endAt)} onChange={(e) => e.target.value && s.setConfig({ endAt: fromLocal(e.target.value) })} /></div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground self-center">Quick duration from now:</span>
          {[["24 hours", 1], ["3 days", 3], ["7 days", 7], ["30 days", 30]].map(([l, d]) => (
            <Button key={l as string} variant="outline" size="sm" onClick={() => s.setConfig({ enabled: true, startAt: new Date().toISOString(), endAt: new Date(Date.now() + (d as number) * 864e5).toISOString() })}>{l}</Button>
          ))}
        </div>
        {!avail.open && <p className="text-sm text-danger">{avail.reason}</p>}
      </section>

      <section className="flex flex-col gap-4 rounded-xl border bg-card p-5">
        <h2 className="font-display text-lg font-bold">Team</h2>
        {s.team.map((m, i) => (
          <div key={i} className="grid items-center gap-2 sm:grid-cols-[64px_1fr_1fr_1fr_auto]">
            <label className="cursor-pointer" title="Upload photo">
              {m.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.photo} alt="" className="size-14 rounded-full object-cover" />
              ) : (
                <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">Photo</div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setMember(i, { photo: await resizePhoto(f) }); }} />
            </label>
            <Input value={m.name} placeholder="Full name" onChange={(e) => setMember(i, { name: e.target.value })} />
            <Input value={m.role} placeholder="Role" onChange={(e) => setMember(i, { role: e.target.value })} />
            <Input value={m.email} placeholder="Email" onChange={(e) => setMember(i, { email: e.target.value })} />
            <Button variant="ghost" size="icon" onClick={() => s.setTeam(s.team.filter((_, j) => j !== i))}><Trash2 className="size-4" /></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" className="self-start" onClick={() => s.setTeam([...s.team, { name: "", role: "", email: "" }])}><Plus className="size-4" /> Add member</Button>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-bold">Sections</h2>
        {s.sections.map((sec) => (
          <div key={sec.id} className="flex flex-col gap-2 rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{sec.group === "pitch" ? "Pitch" : "Technical"}</Badge>
              {sec.live && <Badge variant="info">live data</Badge>}
              <Input value={sec.title} onChange={(e) => s.updateSection(sec.id, { title: e.target.value })} className="font-semibold" />
              <Button variant="ghost" size="icon" onClick={() => s.move(sec.id, -1)}><ArrowUp className="size-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => s.move(sec.id, 1)}><ArrowDown className="size-4" /></Button>
            </div>
            <Textarea rows={Math.min(12, Math.max(3, sec.body.split("\n").length + 1))} value={sec.body} onChange={(e) => s.updateSection(sec.id, { body: e.target.value })} placeholder="Text. Blank line = new paragraph; lines starting with '- ' become bullets." />
          </div>
        ))}
      </section>
    </div>
  );
}
