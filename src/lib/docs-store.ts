"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DEFAULT_SECTIONS, DEFAULT_TEAM, type DocsSection, type TeamMember } from "@/lib/docs-content";

/* Admin-controlled settings for /docs.
   Default window covers the judging period; admins change it in /docs/admin.
   Stored in localStorage for the prototype; the backend version keeps the same
   shape in a `docs_settings` table so every visitor sees the same state. */

export type DocsConfig = {
  enabled: boolean;
  startAt: string; // ISO
  endAt: string; // ISO
};

type DocsState = {
  config: DocsConfig;
  sections: DocsSection[];
  team: TeamMember[];
  draft: boolean;
  publishedAt: string | null;
  setConfig: (c: Partial<DocsConfig>) => void;
  updateSection: (id: string, patch: Partial<DocsSection>) => void;
  move: (id: string, dir: -1 | 1) => void;
  setTeam: (t: TeamMember[]) => void;
  publish: () => void;
  reset: () => void;
};

export const DEFAULT_CONFIG: DocsConfig = {
  enabled: true,
  startAt: "2026-11-20T00:00:00+06:00",
  endAt: "2026-12-31T23:59:00+06:00",
};

export const useDocs = create<DocsState>()(
  persist(
    (set) => ({
      config: DEFAULT_CONFIG,
      sections: DEFAULT_SECTIONS,
      team: DEFAULT_TEAM,
      draft: false,
      publishedAt: null,
      setConfig: (c) => set((s) => ({ config: { ...s.config, ...c } })),
      updateSection: (id, patch) =>
        set((s) => ({ draft: true, sections: s.sections.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      move: (id, dir) =>
        set((s) => {
          const arr = [...s.sections];
          const i = arr.findIndex((x) => x.id === id);
          const j = i + dir;
          if (i < 0 || j < 0 || j >= arr.length || arr[j].group !== arr[i].group) return s;
          [arr[i], arr[j]] = [arr[j], arr[i]];
          return { sections: arr, draft: true };
        }),
      setTeam: (team) => set({ team, draft: true }),
      publish: () => set({ draft: false, publishedAt: new Date().toISOString() }),
      reset: () => set({ config: DEFAULT_CONFIG, sections: DEFAULT_SECTIONS, team: DEFAULT_TEAM, draft: false, publishedAt: null }),
    }),
    { name: "beacon.docs", version: 1, storage: createJSONStorage(() => localStorage) }
  )
);

export function docsAvailability(c: DocsConfig, now = new Date()): { open: boolean; reason: string } {
  if (!c.enabled) return { open: false, reason: "Documentation is turned off by an administrator." };
  const s = new Date(c.startAt);
  const e = new Date(c.endAt);
  if (now < s) return { open: false, reason: `Documentation opens on ${s.toLocaleString()}.` };
  if (now > e) return { open: false, reason: `Documentation closed on ${e.toLocaleString()}.` };
  return { open: true, reason: "" };
}

export const ADMIN_CODE = process.env.NEXT_PUBLIC_DOCS_ADMIN_CODE || "beacon-admin";
