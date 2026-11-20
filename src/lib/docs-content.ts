/* Default content for the /docs module. Admins can override any section text,
   reorder sections and edit the team from /docs/admin. Overrides are stored per
   browser (localStorage) until the backend `docs_sections` table is wired. */

export type DocsSection = {
  id: string;
  group: "pitch" | "tech";
  title: string;
  body: string; // plain text: blank line = new paragraph, "- " = bullet
  live?: "features" | "architecture" | "dataflow" | "stack" | "api" | "ai" | "metrics" | "team" | "roadmap" | "changelog";
};

export type TeamMember = { name: string; role: string; email: string; photo?: string };

export const DEFAULT_TEAM: TeamMember[] = [
  { name: "Mushfiq Us Saleheen", role: "Team lead · Full-stack · AI/ML · GIS · Presenter", email: "saleheen.musfiq@gmail.com" },
  { name: "Asif Mahmud", role: "Domain expert · System design · DevOps · GIS", email: "" },
  { name: "Shahriar Emtiaz", role: "AI/ML engineer · Product & UX · AI analyst", email: "" },
  { name: "Miftahul Jannat Miftah", role: "Communication · Copy & script writing · Health tech", email: "" },
  { name: "MD Ziaur Rahman Joy", role: "Full-stack · Database administrator · Data engineer", email: "" },
  { name: "Mohaimenul Islam", role: "Business analyst · Growth", email: "" },
];

export const DEFAULT_SECTIONS: DocsSection[] = [
  { id: "problem", group: "pitch", title: "Problem", body:
`When a cyclone or flood hits, a district control room is flooded with data: official bulletins, river levels, WhatsApp and voice reports, news, YouTube clips and satellite images, in Bangla and English, of very different reliability.

- Dispatch is slow because every item is read, checked and re-typed by hand.
- Damage numbers from agencies and media conflict, and no one can say quickly which to trust.
- Standard operating procedures sit in long PDFs that nobody opens under pressure.

Bangladesh lives this almost every year. So do coastal and river nations across South and Southeast Asia, Africa and the Pacific.` },
  { id: "solution", group: "pitch", title: "Solution", body:
`Beacon Ops is one AI operations desk for the whole disaster cycle: Prepare, Respond, Recover. Twelve specialised AI agents read official feeds, news, YouTube, satellite data and field reports, and turn them into tasks, evidence and damage estimates on one map.

Design principle: AI proposes, humans decide.
- No message leaves the system without a named human approver.
- No damage figure is published until an officer confirms it on the map.` },
  { id: "why-now", group: "pitch", title: "Why now", body:
`- Multilingual LLMs now read Bangla and English bulletins, news and voice notes well enough to extract structured facts.
- Free satellite flood products (Sentinel-1, VIIRS, NASA GIBS) arrive within hours of an event.
- Agent tooling (MCP, LangGraph) makes it practical to give AI scoped, auditable access instead of free rein.
- Climate change is making cyclones and floods more intense, while response teams stay small.` },
  { id: "demo", group: "pitch", title: "Product demo", body:
`The live prototype runs a fully synthetic drill, "Exercise Cyclone KESTREL", labelled SIMULATION on every screen. Open any module from the links below: Overview map, Prepare, Respond evidence board, Recover, Intel, Press Verification, AI Agents and the Ask Beacon copilot (Bangla or English).` },
  { id: "market", group: "pitch", title: "Market opportunity", body:
`- Beachhead: Bangladesh's disaster management agencies, district and upazila control rooms, and humanitarian NGOs.
- Expansion: national disaster management agencies in other cyclone- and flood-exposed countries (South and Southeast Asia, East Africa, Pacific islands).
- Adjacent users: utilities, port authorities, insurers and development partners that run their own emergency operations.

Market sizing will be validated with sourced figures during the pilot.` },
  { id: "business-model", group: "pitch", title: "Business model", body:
`- Government and agency licence per country or per control room (SaaS or on-premise).
- Implementation and localisation fee: connectors, languages, SOP ingestion, training.
- Donor- and development-bank-funded deployments for national programmes.
- Optional managed service during the cyclone and monsoon seasons.` },
  { id: "traction", group: "pitch", title: "Traction", body:
`- Working prototype with 10 modules and 12 agent definitions, running on a synthetic drill.
- Backend architecture, database schema and MCP tool contracts defined.
- Team background in government hydro-meteorological and disaster data platforms in Bangladesh.

Next milestone: live BMD, FFWC and GDACS feeds and one district pilot.` },
  { id: "competition", group: "pitch", title: "Competition", body:
`- Social-media disaster monitoring tools: strong at detection, but not tied to agency SOPs, dispatch or press verification.
- Generic GIS dashboards: show layers, but do not read, verify or draft.
- Spreadsheets, WhatsApp groups and phone calls: today's real competitor.

Beacon Ops combines detection, verification, planning and press confirmation in one desk, in local languages, with human sign-off built in.` },
  { id: "advantage", group: "pitch", title: "Unique advantage", body:
`- Human gate enforced in the tool layer, not just in policy.
- Every number traceable to its source sentence and to the officer who confirmed it.
- Bangla-first, country-agnostic: connectors, languages and SOPs are configuration.
- On-premise model option for data sovereignty.` },
  { id: "gtm", group: "pitch", title: "Go-to-market", body:
`1. Pilot with one district control room in Bangladesh during the next cyclone or monsoon season.
2. Publish results against the pilot targets (time to dispatch draft, time to verify a claim).
3. Expand nationally with the disaster management department and partner NGOs.
4. Offer to other countries through development partners and regional disaster networks.` },
  { id: "team", group: "pitch", title: "Team", body: "Late Light Labs · Steady light for uncertain hours.", live: "team" },
  { id: "vision", group: "pitch", title: "Vision", body:
`Every disaster control room, in every at-risk country, has a calm, trustworthy AI desk that reads everything, proposes clearly, and leaves the decisions, and the accountability, with people.` },

  { id: "overview", group: "tech", title: "Product overview", body:
`What it does: monitors hazards, plans with the agency's own SOPs, verifies field reports and media, forecasts damage as ranges, and verifies press figures with human confirmation.

Target users: national disaster agencies, district control rooms, NGOs, government press offices.

Core use cases: pre-landfall preparation, live response coordination, damage verification and press release, after-action reporting.` },
  { id: "features", group: "tech", title: "Feature matrix", body: "Live status of every module, read from the running app.", live: "features" },
  { id: "architecture", group: "tech", title: "Architecture", body: "UI → API → services → data. Agents reach data only through MCP tools with scoped permissions.", live: "architecture" },
  { id: "dataflow", group: "tech", title: "Data flow", body: "Input → processing → AI → human gate → output → feedback into evaluation.", live: "dataflow" },
  { id: "stack", group: "tech", title: "Technology stack", body: "", live: "stack" },
  { id: "api", group: "tech", title: "API documentation", body:
`Auth model: Supabase Auth (JWT) with roles officer, reviewer and admin; row-level security on every table. Write endpoints that change the world (approve a task, confirm a claim, publish a press release) require a named human reviewer.`, live: "api" },
  { id: "data", group: "tech", title: "Data layer", body:
`- Sources: BMD, FFWC/BWDB, DDM, GDACS, ReliefWeb, GDELT, news RSS, YouTube, Sentinel-1/2, VIIRS, NASA GIBS, WhatsApp/SMS/voice, licensed public cameras.
- Acquisition: n8n schedules and webhooks, Firecrawl and Playwright scrapers, MCP connectors.
- Parsing: Unstructured.io, PyMuPDF, Tesseract (Bangla), Whisper, LLM JSON extraction with the exact source sentence.
- Storage: Supabase Postgres + PostGIS + pgvector; MongoDB for raw documents; Redis queues; object storage for photos and rasters.
- Privacy: PII masked before LLM calls, RLS, consent notice for reporters, retention limits, no private cameras.` },
  { id: "ai", group: "tech", title: "AI layer", body: "", live: "ai" },
  { id: "roadmap", group: "tech", title: "Product roadmap", body: "", live: "roadmap" },
  { id: "performance", group: "tech", title: "Performance & scalability", body:
`- Expected load: tens of control-room users per country, bursts of thousands of reports and articles per hour during landfall.
- Cheap-first cascade (rules and small models before LLMs), caching, deduplication before any model call.
- Heavy satellite and model jobs in Redis workers; dashboards updated by Supabase Realtime.
- Map tiles from CDN; offline-capable local models for district setups when internet fails.` },
  { id: "security", group: "tech", title: "Security", body:
`- Supabase Auth, role-based access (officer, reviewer, admin), row-level security.
- Agents use scoped MCP tokens: read and propose only.
- All secrets server-side; only public anon keys in the browser.
- Full audit log of prompts, models, tool calls and human decisions.
- Prompt-injection defence: web and social text is data, never instructions.` },
  { id: "analytics", group: "tech", title: "Analytics & KPIs", body: "", live: "metrics" },
  { id: "changelog", group: "tech", title: "Changelog", body: "", live: "changelog" },
];

export const ROADMAP = [
  { term: "Short term (0–3 months)", items: ["Live BMD, FFWC, GDACS and ReliefWeb connectors", "Supabase backend and auth", "Evidence Verifier and Press Verifier on real data"] },
  { term: "Mid term (3–9 months)", items: ["District pilot in Bangladesh", "Satellite flood mapping and damage ranges in production", "WhatsApp/SMS dispatch with approvals"] },
  { term: "Long term (9–24 months)", items: ["National roll-out", "Second country deployment", "On-premise package for data-sovereign agencies"] },
];

export const CHANGELOG = [
  { version: "0.4.0", date: "2026-11-20", note: "/docs module: pitch deck, technical docs, live metrics, admin visibility and scheduling" },
  { version: "0.3.0", date: "2026-11-20", note: "Separate frontend and backend repositories; FastAPI scaffold, Supabase schema, 5 MCP servers" },
  { version: "0.2.0", date: "2026-11-20", note: "House design system (light/dark), Leaflet ops map with track, cone, pins and NASA GIBS layers" },
  { version: "0.1.0", date: "2026-11-19", note: "First prototype: 10 modules, 12 agents, synthetic Exercise Cyclone KESTREL" },
];

export const STACK = [
  { layer: "Frontend", items: "Next.js 16, React, TypeScript, Tailwind v4, shadcn/ui, Leaflet, Recharts, Zustand" },
  { layer: "Backend", items: "FastAPI, Pydantic, Redis + RQ workers, n8n" },
  { layer: "Database", items: "Supabase Postgres + PostGIS + pgvector, MongoDB Atlas, Supabase Storage" },
  { layer: "AI", items: "Gemini, Claude, Llama/Qwen/Gemma via Ollama, BGE-M3, Whisper, LangGraph, MCP, XGBoost + CLIMADA, OR-Tools" },
  { layer: "Infra", items: "Vercel (frontend), Docker (API, MCP servers, workers), Supabase Cloud" },
];

export const REPOS = {
  frontend: "https://github.com/Mushfiq80/beacon-ops-front",
  backend: "https://github.com/Mushfiq80/beacon-ops-back",
  demo: "https://beacon-ops-seven.vercel.app",
};
