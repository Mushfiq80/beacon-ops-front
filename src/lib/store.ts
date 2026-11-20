"use client";

/* Client state for the demo. In live mode the same actions call the backend
   API (src/lib/api.ts) and Supabase realtime keeps the store in sync. */

import { create } from "zustand";
import { tasks as seedTasks, fieldReports as seedReports } from "@/lib/mock/scenario";
import { pressClaims as seedClaims } from "@/lib/mock/intel";
import type { Task, FieldReport, PressClaim, ClaimStatus } from "@/lib/types";
import { SCENARIO_NOW } from "@/lib/time";

export type AuditEntry = { at: string; actor: string; action: string; target: string };

interface BeaconState {
  lang: "en" | "bn";
  setLang: (l: "en" | "bn") => void;
  tasks: Task[];
  reports: FieldReport[];
  claims: PressClaim[];
  audit: AuditEntry[];
  approveTask: (id: string) => void;
  rejectTask: (id: string) => void;
  approveAllPending: () => number;
  setReportVerdict: (id: string, verdict: FieldReport["verdict"]) => void;
  setClaimStatus: (id: string, status: ClaimStatus, note?: string, value?: number) => void;
}

const ACTOR = "Duty officer (demo)";

export const useBeacon = create<BeaconState>((set, get) => ({
  lang: "en",
  setLang: (lang) => set({ lang }),
  tasks: seedTasks,
  reports: seedReports,
  claims: seedClaims,
  audit: [],
  approveTask: (id) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, status: "sent" } : t)),
      audit: [{ at: SCENARIO_NOW, actor: ACTOR, action: "approved & dispatched task", target: id }, ...s.audit],
    })),
  rejectTask: (id) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, status: "draft" } : t)),
      audit: [{ at: SCENARIO_NOW, actor: ACTOR, action: "returned task to draft", target: id }, ...s.audit],
    })),
  approveAllPending: () => {
    const pending = get().tasks.filter((t) => t.status === "pending_approval");
    set((s) => ({
      tasks: s.tasks.map((t) => (t.status === "pending_approval" ? { ...t, status: "sent" } : t)),
      audit: [
        ...pending.map((t) => ({ at: SCENARIO_NOW, actor: ACTOR, action: "approved & dispatched task", target: t.id })),
        ...s.audit,
      ],
    }));
    return pending.length;
  },
  setReportVerdict: (id, verdict) =>
    set((s) => ({
      reports: s.reports.map((r) => (r.id === id ? { ...r, verdict, humanReviewed: true } : r)),
      audit: [{ at: SCENARIO_NOW, actor: ACTOR, action: `marked report ${verdict}`, target: id }, ...s.audit],
    })),
  setClaimStatus: (id, status, note, value) =>
    set((s) => ({
      claims: s.claims.map((c) =>
        c.id === id
          ? { ...c, status, reviewer: ACTOR, reviewNote: note ?? c.reviewNote, value: value ?? c.value }
          : c
      ),
      audit: [{ at: SCENARIO_NOW, actor: ACTOR, action: `set claim ${status}`, target: id }, ...s.audit],
    })),
}));
