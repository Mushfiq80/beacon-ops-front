/* Beacon Ops domain model.
   These types mirror the Supabase schema (backend/supabase/migrations) so the
   frontend can switch from mock data to live data without UI changes. */

export type Hazard = "cyclone" | "flood" | "heatwave" | "landslide" | "coldwave" | "earthquake";
export type Phase = "prepare" | "respond" | "recover";
export type Range = { low: number; expected: number; high: number };

export interface DisasterEvent {
  id: string;
  name: string;
  hazard: Hazard;
  country: string;
  status: "watch" | "warning" | "active" | "recovery" | "closed";
  phase: Phase;
  severity: 1 | 2 | 3 | 4 | 5;
  startedAt: string;
  landfallAt?: string;
  summary: string;
  signal?: string; // e.g. national warning signal
  track?: { lng: number; lat: number; at: string; windKt: number; forecast: boolean }[];
  simulated: boolean;
}

export type SiteType = "telecom_tower" | "substation" | "port" | "industrial_zone" | "hospital" | "shelter";

export interface Site {
  id: string;
  name: string;
  type: SiteType;
  operator: string;
  lat: number;
  lng: number;
  district: string;
  upazila: string;
  criticality: 1 | 2 | 3 | 4 | 5;
  backupHours: number;
  populationServed: number;
  risk: { wind: number; surge: number; flood: number; overall: number };
  status: "normal" | "at_risk" | "secured" | "down" | "restored";
}

export type TaskStatus = "draft" | "pending_approval" | "sent" | "confirmed" | "late" | "blocked";

export interface Task {
  id: string;
  siteId: string;
  title: string;
  titleBn: string;
  sopRef: string;
  dueAt: string;
  assignee: string;
  channel: "whatsapp" | "sms";
  status: TaskStatus;
  aiConfidence: number;
  reasoning: string;
}

export type CheckResult = "pass" | "fail" | "unsure";

export interface FieldReport {
  id: string;
  channel: "whatsapp" | "web" | "voice" | "field_team";
  reporter: string;
  text: string;
  lang: "bn" | "en";
  lat: number;
  lng: number;
  area: string;
  receivedAt: string;
  media: "photo" | "video" | "voice" | "text";
  tags: string[];
  checks: { relevance: CheckResult; duplicate: CheckResult; location: CheckResult; recency: CheckResult };
  floodDepthCm?: [number, number];
  confidence: number;
  verdict: "verified" | "unsure" | "rejected" | "pending";
  humanReviewed: boolean;
}

export interface DamageArea {
  id: string;
  name: string;
  district: string;
  level: "union" | "upazila";
  lat: number;
  lng: number;
  population: number;
  housesDamaged: Range;
  displaced: Range;
  roadsBlockedKm: number;
  towersDown: number;
  substationsDown: number;
  priority: number; // 1 = highest
  confidence: number;
  drivers: string[];
}

export interface ResponseAllocation {
  areaId: string;
  boats: number;
  reliefPacks: number;
  medicalTeams: number;
  waterLitres: number;
  route: "open" | "partial" | "blocked";
  etaHours: number;
  reason: string;
}

export interface RestorationItem {
  siteId: string;
  rank: number;
  populationRestored: number;
  crew: string;
  etaHours: number;
  dependency?: string;
}

export type SourceType = "agency" | "news_local" | "news_global" | "youtube" | "social" | "satellite" | "camera";

export interface IntelItem {
  id: string;
  sourceType: SourceType;
  sourceName: string;
  title: string;
  url?: string;
  publishedAt: string;
  lang: "bn" | "en";
  summary: string;
  extracted: {
    hazard?: Hazard;
    areas: string[];
    deaths?: number;
    injured?: number;
    displaced?: number;
    housesDamaged?: number;
    signal?: string;
  };
  credibility: number;
  synthetic: boolean;
}

export type ClaimMetric =
  | "deaths"
  | "injured"
  | "missing"
  | "displaced"
  | "houses_damaged"
  | "houses_destroyed"
  | "crops_ha"
  | "roads_km";

export type ClaimStatus = "ai_verified" | "conflict" | "needs_review" | "human_confirmed" | "rejected";

export interface ClaimSource {
  name: string;
  type: SourceType;
  value: number;
  at: string;
  url?: string;
  weight: number;
}

export interface PressClaim {
  id: string;
  eventId: string;
  metric: ClaimMetric;
  area: string;
  lat: number;
  lng: number;
  value: number;
  range: [number, number];
  agreement: number;
  sources: ClaimSource[];
  status: ClaimStatus;
  aiNote: string;
  reviewer?: string;
  reviewNote?: string;
  updatedAt: string;
}

export interface AgentInfo {
  id: string;
  name: string;
  role: string;
  phase: Phase | "all";
  model: string;
  tools: string[];
  status: "running" | "idle" | "waiting_approval" | "error";
  lastRunAt: string;
  runsToday: number;
  avgLatencyMs: number;
  description: string;
}

export interface AgentRun {
  id: string;
  agentId: string;
  startedAt: string;
  durationMs: number;
  summary: string;
  toolCalls: string[];
  status: "ok" | "needs_approval" | "error";
}

export interface DataSource {
  id: string;
  name: string;
  category: "agency" | "news" | "video" | "satellite" | "forecast" | "exposure" | "camera" | "messaging" | "ai" | "database";
  coverage: string;
  status: "connected" | "needs_key" | "planned" | "error";
  access: string;
  envKey?: string;
  url: string;
  notes: string;
}

export interface Camera {
  id: string;
  name: string;
  provider: string;
  lat: number;
  lng: number;
  area: string;
  status: "live" | "offline";
  lastFrameAt: string;
  aiObservation: string;
  waterLevel?: "none" | "low" | "medium" | "high";
}

export interface SatelliteProduct {
  id: string;
  sensor: string;
  product: string;
  acquiredAt: string;
  area: string;
  floodedKm2: number;
  changeKm2: number;
  displacedEstimate: Range;
  confidence: number;
  notes: string;
}
