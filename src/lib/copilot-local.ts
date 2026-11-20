/* Offline fallback for "Ask Beacon" so the demo works without an LLM key.
   It answers from the scenario data with simple intent matching and always
   returns the records it used. The live copilot (backend /v1/copilot/ask)
   uses an LLM with read-only MCP tools and the same answer + sources shape. */

import { damageAreas, sites, allocations, tasks, activeEvent } from "@/lib/mock/scenario";
import { pressClaims, satellite } from "@/lib/mock/intel";
import { fmt } from "@/lib/utils";

export type CopilotAnswer = { text: string; sources: string[] };

export function answerLocally(q: string): CopilotAnswer {
  const s = q.toLowerCase();
  if (/(priority|where.*first|কোথায়|অগ্রাধিকার)/.test(s)) {
    const top = damageAreas.slice(0, 3);
    return {
      text:
        `Send teams first to ${top.map((a) => a.name).join(", ")}. ` +
        top.map((a) => `${a.name}: ${fmt(a.displaced.low)}–${fmt(a.displaced.high)} people displaced (expected ${fmt(a.displaced.expected)}), confidence ${Math.round(a.confidence * 100)}%.`).join(" "),
      sources: top.map((a) => `damage_area:${a.id}`).concat("model:open-cat v0.1"),
    };
  }
  if (/(down|outage|tower|substation|বিদ্যুৎ|টাওয়ার)/.test(s)) {
    const down = sites.filter((x) => x.status === "down");
    return {
      text: `${down.length} critical sites are down: ${down.map((d) => d.name).join("; ")}. Together they serve about ${fmt(down.reduce((a, d) => a + d.populationServed, 0))} people. Restore Pathorghata substation first (≈118,000 people).`,
      sources: down.map((d) => `site:${d.id}`).concat("restoration:v4"),
    };
  }
  if (/(death|dead|died|মৃত|নিহত)/.test(s)) {
    const c = pressClaims.filter((x) => x.metric === "deaths");
    return {
      text: `Confirmed deaths are not final. Kalapara: 4 (AI-verified, sources agree). National: agency reports 6, an older wire report says at least 5 — this conflict needs human confirmation before publishing.`,
      sources: c.map((x) => `claim:${x.id}`),
    };
  }
  if (/(displac|shelter|আশ্রয়|বাস্তুচ্যুত)/.test(s)) {
    return {
      text: `Two different numbers are circulating: 41,200 people currently in shelters (agency sitRep) and 500,000 evacuated before landfall (wire). They measure different things and are not merged. Satellite estimate for Barguna + Patuakhali: ${fmt(satellite[0].displacedEstimate.low)}–${fmt(satellite[0].displacedEstimate.high)} people in newly flooded buildings.`,
      sources: ["claim:c3", "claim:c5", `satellite:${satellite[0].id}`],
    };
  }
  if (/(boat|relief|allocat|নৌকা|ত্রাণ)/.test(s)) {
    return {
      text: `Allocation v4: ${allocations.reduce((a, x) => a + x.boats, 0)} boats and ${fmt(allocations.reduce((a, x) => a + x.reliefPacks, 0))} relief packs across ${allocations.length} upazilas. Kalapara gets the most (24 boats, 9,200 packs). Pathorghata and Char Fasson need boat access — roads are blocked.`,
      sources: allocations.map((a) => `allocation:${a.areaId}`),
    };
  }
  if (/(task|approve|pending|কাজ)/.test(s)) {
    const p = tasks.filter((t) => t.status === "pending_approval");
    return {
      text: `${p.length} AI-drafted tasks are waiting for approval: ${p.map((t) => t.title).join("; ")}. One task is late (guard evacuation at Char Fasson) and one is blocked (Koyra road cut).`,
      sources: p.map((t) => `task:${t.id}`),
    };
  }
  return {
    text: `${activeEvent.name}: ${activeEvent.summary} Ask me about priority areas, sites down, deaths, displacement, boat allocation or pending tasks.`,
    sources: [`event:${activeEvent.id}`],
  };
}
