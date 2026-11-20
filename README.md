# Beacon Ops – Frontend

**AI for Disaster Operations.** Prepare · Respond · Recover. *AI proposes, humans decide.*

Operations desk for national disaster agencies, built by **Late Light Labs** for the International AI Builders Congress 2026 (Idea to Unicorn). Bangladesh pilot, designed for any at-risk country.

Backend: [beacon-ops-back](https://github.com/Mushfiq80/beacon-ops-back)

> The demo runs on a fully synthetic drill, "Exercise Cyclone KESTREL", labelled SIMULATION on every screen. All figures are synthetic.

## Modules

| Module | What it does |
| --- | --- |
| Overview | One map: cyclone track and cone, critical sites, verified reports, damage forecast, NASA GIBS satellite layers |
| Prepare | SOP-grounded task plans, Bangla/English dispatch drafts in an approval queue |
| Respond | Evidence board: relevance, duplicate, location and recency checks on every field report |
| Recover | Damage forecasts as ranges, response allocation |
| Intel & Sources | News, agency bulletins, YouTube and satellite items with the exact source sentence |
| Press Verification | AI checks damage figures across sources; an officer confirms each one on the map |
| AI Agents | The 12 agents, their tools (MCP), runs and human audit |
| Ask Beacon | Read-only copilot in Bangla or English |
| Integrations | 20 data sources and the keys they need |
| Settings | Roles, languages, thresholds |

## Stack

Next.js 16 (App Router) · React · TypeScript · Tailwind CSS v4 · shadcn/ui · Leaflet · Recharts · Zustand · next-themes · Supabase JS

## Run locally

```bash
npm install
cp .env.example .env.local   # optional; demo mode needs no keys
npm run dev                   # http://localhost:3000
```

`NEXT_PUBLIC_DATA_MODE=demo` uses the synthetic scenario; `live` calls the FastAPI backend at `NEXT_PUBLIC_API_URL`. Only public (anon) keys belong here; every secret lives in the backend.

## Deploy

Vercel: import this repo, framework Next.js, no extra settings.

## Team

Late Light Labs · *Steady light for uncertain hours.*
