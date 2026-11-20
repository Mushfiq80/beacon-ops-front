import type { Hazard, SiteType, ClaimMetric, ClaimStatus, SourceType, TaskStatus } from "@/lib/types";

export const hazardLabel: Record<Hazard, { en: string; bn: string; color: string }> = {
  cyclone: { en: "Cyclone", bn: "ঘূর্ণিঝড়", color: "var(--chart-2)" },
  flood: { en: "Flood", bn: "বন্যা", color: "var(--chart-2)" },
  heatwave: { en: "Heatwave", bn: "তাপপ্রবাহ", color: "var(--chart-3)" },
  landslide: { en: "Landslide", bn: "ভূমিধস", color: "var(--chart-5)" },
  coldwave: { en: "Cold wave", bn: "শৈত্যপ্রবাহ", color: "var(--chart-4)" },
  earthquake: { en: "Earthquake", bn: "ভূমিকম্প", color: "var(--chart-1)" },
};

export const siteTypeLabel: Record<SiteType, string> = {
  telecom_tower: "Telecom tower",
  substation: "Substation",
  port: "Port",
  industrial_zone: "Industrial zone",
  hospital: "Hospital",
  shelter: "Shelter",
};

export const metricLabel: Record<ClaimMetric, string> = {
  deaths: "Deaths",
  injured: "Injured",
  missing: "Missing",
  displaced: "Displaced / in shelters",
  houses_damaged: "Houses damaged",
  houses_destroyed: "Houses destroyed",
  crops_ha: "Crops affected (ha)",
  roads_km: "Roads blocked (km)",
};

export const claimStatusLabel: Record<ClaimStatus, { text: string; variant: "success" | "warning" | "danger" | "info" | "secondary" }> = {
  ai_verified: { text: "AI verified", variant: "info" },
  conflict: { text: "Conflict", variant: "danger" },
  needs_review: { text: "Needs review", variant: "warning" },
  human_confirmed: { text: "Human confirmed", variant: "success" },
  rejected: { text: "Rejected", variant: "secondary" },
};

export const sourceTypeLabel: Record<SourceType, string> = {
  agency: "National authority",
  news_local: "Local news",
  news_global: "Global news",
  youtube: "YouTube / TV",
  social: "Social / field",
  satellite: "Satellite / model",
  camera: "Camera",
};

export const taskStatusLabel: Record<TaskStatus, { text: string; variant: "success" | "warning" | "danger" | "info" | "secondary" | "outline" }> = {
  draft: { text: "Draft", variant: "outline" },
  pending_approval: { text: "Needs approval", variant: "warning" },
  sent: { text: "Sent", variant: "info" },
  confirmed: { text: "Confirmed", variant: "success" },
  late: { text: "Late", variant: "danger" },
  blocked: { text: "Blocked", variant: "danger" },
};

export const nav = {
  en: {
    overview: "Overview",
    prepare: "Prepare",
    respond: "Respond",
    recover: "Recover",
    intel: "Intel & Sources",
    press: "Press Verification",
    agents: "AI Agents",
    copilot: "Ask Beacon",
    sources: "Integrations",
    settings: "Settings",
  },
  bn: {
    overview: "সারসংক্ষেপ",
    prepare: "প্রস্তুতি",
    respond: "সাড়া",
    recover: "পুনরুদ্ধার",
    intel: "তথ্য ও উৎস",
    press: "প্রেস যাচাই",
    agents: "এআই এজেন্ট",
    copilot: "বিকনকে জিজ্ঞাসা",
    sources: "সংযোগ",
    settings: "সেটিংস",
  },
};
