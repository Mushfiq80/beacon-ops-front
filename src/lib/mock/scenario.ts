/* SIMULATION DATA — a fictional exercise cyclone ("KESTREL") crossing the
   south-west coast of Bangladesh. All numbers, reports and news items here are
   synthetic and exist only to demonstrate the product. Live data replaces this
   module through src/lib/data.ts once the backend is connected. */

import { at } from "@/lib/time";
import type {
  DisasterEvent,
  Site,
  Task,
  FieldReport,
  DamageArea,
  ResponseAllocation,
  RestorationItem,
} from "@/lib/types";

export const activeEvent: DisasterEvent = {
  id: "evt-kestrel-26",
  name: "Exercise Cyclone KESTREL",
  hazard: "cyclone",
  country: "BD",
  status: "active",
  phase: "respond",
  severity: 4,
  startedAt: at(-60),
  landfallAt: at(-6),
  signal: "Great Danger Signal 10 (simulated)",
  summary:
    "Severe cyclonic storm crossed the Patuakhali–Barguna coast with 3–4 m surge. Heavy rain and river flooding across Bhola, Bagerhat and Khulna.",
  simulated: true,
  track: [
    { lng: 89.55, lat: 18.6, at: at(-60), windKt: 45, forecast: false },
    { lng: 89.7, lat: 19.4, at: at(-42), windKt: 60, forecast: false },
    { lng: 89.85, lat: 20.3, at: at(-24), windKt: 80, forecast: false },
    { lng: 89.98, lat: 21.2, at: at(-12), windKt: 95, forecast: false },
    { lng: 90.12, lat: 21.95, at: at(-6), windKt: 90, forecast: false },
    { lng: 90.3, lat: 22.6, at: at(0), windKt: 60, forecast: false },
    { lng: 90.5, lat: 23.3, at: at(6), windKt: 40, forecast: true },
    { lng: 90.75, lat: 24.0, at: at(12), windKt: 30, forecast: true },
  ],
};

export const otherEvents: DisasterEvent[] = [
  {
    id: "evt-jamuna-flood",
    name: "Jamuna monsoon flood watch",
    hazard: "flood",
    country: "BD",
    status: "watch",
    phase: "prepare",
    severity: 2,
    startedAt: at(-30),
    summary: "River levels rising at Bahadurabad and Sirajganj; danger level possible within 72 h (simulated).",
    simulated: true,
  },
  {
    id: "evt-north-cold",
    name: "Northern cold wave advisory",
    hazard: "coldwave",
    country: "BD",
    status: "watch",
    phase: "prepare",
    severity: 1,
    startedAt: at(-10),
    summary: "Minimum temperature forecast 7–9 °C in Rangpur division (simulated).",
    simulated: true,
  },
];

export const sites: Site[] = [
  { id: "s1", name: "Kalapara Tower KP-07", type: "telecom_tower", operator: "Demo Telecom", lat: 21.98, lng: 90.24, district: "Patuakhali", upazila: "Kalapara", criticality: 5, backupHours: 8, populationServed: 64000, risk: { wind: 0.92, surge: 0.88, flood: 0.71, overall: 0.9 }, status: "down" },
  { id: "s2", name: "Pathorghata 33/11 kV Substation", type: "substation", operator: "Demo Power", lat: 22.04, lng: 89.97, district: "Barguna", upazila: "Pathorghata", criticality: 5, backupHours: 0, populationServed: 118000, risk: { wind: 0.86, surge: 0.9, flood: 0.8, overall: 0.87 }, status: "down" },
  { id: "s3", name: "Payra Port Berth 2", type: "port", operator: "Demo Ports", lat: 21.83, lng: 90.3, district: "Patuakhali", upazila: "Kalapara", criticality: 5, backupHours: 24, populationServed: 0, risk: { wind: 0.9, surge: 0.93, flood: 0.6, overall: 0.88 }, status: "secured" },
  { id: "s4", name: "Barguna Sadar Tower BG-02", type: "telecom_tower", operator: "Demo Telecom", lat: 22.15, lng: 90.12, district: "Barguna", upazila: "Barguna Sadar", criticality: 4, backupHours: 6, populationServed: 52000, risk: { wind: 0.81, surge: 0.62, flood: 0.66, overall: 0.74 }, status: "at_risk" },
  { id: "s5", name: "Mongla EPZ Feeder", type: "industrial_zone", operator: "Demo EPZ", lat: 22.49, lng: 89.6, district: "Bagerhat", upazila: "Mongla", criticality: 4, backupHours: 12, populationServed: 21000, risk: { wind: 0.68, surge: 0.74, flood: 0.62, overall: 0.69 }, status: "secured" },
  { id: "s6", name: "Char Fasson Tower CF-11", type: "telecom_tower", operator: "Demo Telecom", lat: 22.19, lng: 90.76, district: "Bhola", upazila: "Char Fasson", criticality: 4, backupHours: 4, populationServed: 47000, risk: { wind: 0.77, surge: 0.81, flood: 0.84, overall: 0.8 }, status: "down" },
  { id: "s7", name: "Bhola 132 kV Grid", type: "substation", operator: "Demo Power", lat: 22.69, lng: 90.65, district: "Bhola", upazila: "Bhola Sadar", criticality: 5, backupHours: 0, populationServed: 260000, risk: { wind: 0.62, surge: 0.4, flood: 0.58, overall: 0.56 }, status: "at_risk" },
  { id: "s8", name: "Sarankhola Tower SK-03", type: "telecom_tower", operator: "Demo Telecom", lat: 22.31, lng: 89.79, district: "Bagerhat", upazila: "Sarankhola", criticality: 3, backupHours: 6, populationServed: 28000, risk: { wind: 0.72, surge: 0.7, flood: 0.65, overall: 0.7 }, status: "restored" },
  { id: "s9", name: "Kalapara Upazila Health Complex", type: "hospital", operator: "Public", lat: 21.99, lng: 90.25, district: "Patuakhali", upazila: "Kalapara", criticality: 5, backupHours: 10, populationServed: 230000, risk: { wind: 0.85, surge: 0.7, flood: 0.68, overall: 0.79 }, status: "at_risk" },
  { id: "s10", name: "Koyra Tower KY-05", type: "telecom_tower", operator: "Demo Telecom", lat: 22.34, lng: 89.3, district: "Khulna", upazila: "Koyra", criticality: 3, backupHours: 6, populationServed: 33000, risk: { wind: 0.55, surge: 0.66, flood: 0.72, overall: 0.63 }, status: "normal" },
  { id: "s11", name: "Dacope Cyclone Shelter #14", type: "shelter", operator: "Public", lat: 22.57, lng: 89.51, district: "Khulna", upazila: "Dacope", criticality: 4, backupHours: 0, populationServed: 1800, risk: { wind: 0.5, surge: 0.62, flood: 0.7, overall: 0.6 }, status: "normal" },
  { id: "s12", name: "Hatiya Tower HT-01", type: "telecom_tower", operator: "Demo Telecom", lat: 22.36, lng: 91.12, district: "Noakhali", upazila: "Hatiya", criticality: 3, backupHours: 6, populationServed: 39000, risk: { wind: 0.48, surge: 0.57, flood: 0.5, overall: 0.52 }, status: "secured" },
];

export const tasks: Task[] = [
  { id: "t1", siteId: "s4", title: "Refuel generator to 100% and log level", titleBn: "জেনারেটরে পূর্ণ জ্বালানি দিন এবং মাত্রা লিখে রাখুন", sopRef: "TEL-SOP 4.2", dueAt: at(1), assignee: "Rahim (BG field crew)", channel: "whatsapp", status: "pending_approval", aiConfidence: 0.94, reasoning: "Backup 6 h < expected outage 18–30 h (wind 0.81)." },
  { id: "t2", siteId: "s7", title: "Pre-position mobile transformer at Bhola grid yard", titleBn: "ভোলা গ্রিড ইয়ার্ডে মোবাইল ট্রান্সফর্মার প্রস্তুত রাখুন", sopRef: "PWR-SOP 2.7", dueAt: at(3), assignee: "Bhola O&M team", channel: "sms", status: "pending_approval", aiConfidence: 0.81, reasoning: "Serves 260k people; flood risk 0.58 on access road." },
  { id: "t3", siteId: "s9", title: "Move medical stock to first floor; test generator", titleBn: "ওষুধ দোতলায় সরান; জেনারেটর পরীক্ষা করুন", sopRef: "HLT-SOP 1.3", dueAt: at(2), assignee: "UHC duty manager", channel: "whatsapp", status: "pending_approval", aiConfidence: 0.88, reasoning: "Surge 0.70; ground floor flooded in 2 past events (synthetic history)." },
  { id: "t4", siteId: "s1", title: "Secure antenna mounts and shut down radio units", titleBn: "অ্যান্টেনা মাউন্ট শক্ত করুন এবং রেডিও ইউনিট বন্ধ করুন", sopRef: "TEL-SOP 3.1", dueAt: at(-14), assignee: "Kalapara crew", channel: "whatsapp", status: "confirmed", aiConfidence: 0.97, reasoning: "Wind risk 0.92 within 24 h of landfall." },
  { id: "t5", siteId: "s3", title: "Suspend berth operations and double moor vessels", titleBn: "বার্থ কার্যক্রম বন্ধ করুন এবং জাহাজ দ্বিগুণ বাঁধুন", sopRef: "PRT-SOP 5.0", dueAt: at(-20), assignee: "Payra harbour master", channel: "sms", status: "confirmed", aiConfidence: 0.96, reasoning: "Surge 0.93; signal raised." },
  { id: "t6", siteId: "s6", title: "Evacuate site guard to shelter #22", titleBn: "সাইট গার্ডকে ২২ নম্বর আশ্রয়কেন্দ্রে নিন", sopRef: "TEL-SOP 0.4", dueAt: at(-10), assignee: "Char Fasson guard", channel: "sms", status: "late", aiConfidence: 0.99, reasoning: "Life safety rule: evacuate when surge > 2.5 m forecast." },
  { id: "t7", siteId: "s2", title: "Isolate feeders before surge peak", titleBn: "জলোচ্ছ্বাসের আগে ফিডার বিচ্ছিন্ন করুন", sopRef: "PWR-SOP 3.4", dueAt: at(-8), assignee: "Pathorghata shift engineer", channel: "whatsapp", status: "confirmed", aiConfidence: 0.92, reasoning: "Avoid equipment loss; surge 0.90." },
  { id: "t8", siteId: "s10", title: "Raise battery cabinet on plinth blocks", titleBn: "ব্যাটারি ক্যাবিনেট উঁচু প্লিন্থে তুলুন", sopRef: "TEL-SOP 4.6", dueAt: at(-2), assignee: "Koyra crew", channel: "whatsapp", status: "blocked", aiConfidence: 0.74, reasoning: "Flood 0.72; crew reports road cut at Koyra bazar." },
  { id: "t9", siteId: "s5", title: "Shut chemical storage and confirm headcount", titleBn: "রাসায়নিক গুদাম বন্ধ করুন এবং কর্মী গণনা নিশ্চিত করুন", sopRef: "IND-SOP 2.1", dueAt: at(-16), assignee: "EPZ safety officer", channel: "sms", status: "sent", aiConfidence: 0.9, reasoning: "Industrial hazard rule." },
];

export const fieldReports: FieldReport[] = [
  { id: "r1", channel: "whatsapp", reporter: "Volunteer #2231", text: "কলাপাড়া বাজারে কোমর পানি, দোকান ডুবে গেছে", lang: "bn", lat: 21.985, lng: 90.245, area: "Kalapara", receivedAt: at(-3), media: "photo", tags: ["flood", "market"], checks: { relevance: "pass", duplicate: "pass", location: "pass", recency: "pass" }, floodDepthCm: [85, 105], confidence: 0.91, verdict: "verified", humanReviewed: true },
  { id: "r2", channel: "field_team", reporter: "Demo Telecom crew KP", text: "Tower KP-07 shelter flooded, rectifier submerged, site down.", lang: "en", lat: 21.98, lng: 90.24, area: "Kalapara", receivedAt: at(-2.5), media: "photo", tags: ["telecom", "outage"], checks: { relevance: "pass", duplicate: "pass", location: "pass", recency: "pass" }, floodDepthCm: [60, 75], confidence: 0.95, verdict: "verified", humanReviewed: true },
  { id: "r3", channel: "whatsapp", reporter: "Unknown +8801•••", text: "পাথরঘাটায় বেড়িবাঁধ ভেঙে গেছে, তিন গ্রাম প্লাবিত", lang: "bn", lat: 22.03, lng: 89.98, area: "Pathorghata", receivedAt: at(-1.5), media: "video", tags: ["embankment", "breach"], checks: { relevance: "pass", duplicate: "pass", location: "unsure", recency: "pass" }, confidence: 0.63, verdict: "unsure", humanReviewed: false },
  { id: "r4", channel: "whatsapp", reporter: "Unknown +8801•••", text: "Photo of collapsed bridge in Bhola", lang: "en", lat: 22.68, lng: 90.64, area: "Bhola Sadar", receivedAt: at(-1), media: "photo", tags: ["bridge"], checks: { relevance: "pass", duplicate: "fail", location: "fail", recency: "fail" }, confidence: 0.12, verdict: "rejected", humanReviewed: false },
  { id: "r5", channel: "voice", reporter: "Union Parishad member, Char Kukri Mukri", text: "চর কুকরি মুকরিতে ৪০০ পরিবার আশ্রয়কেন্দ্রে, খাবার পানি দরকার", lang: "bn", lat: 22.0, lng: 90.85, area: "Char Fasson", receivedAt: at(-0.8), media: "voice", tags: ["shelter", "water"], checks: { relevance: "pass", duplicate: "pass", location: "pass", recency: "pass" }, confidence: 0.84, verdict: "verified", humanReviewed: false },
  { id: "r6", channel: "web", reporter: "NGO field officer", text: "Road Barguna–Amtali blocked by fallen trees at km 12.", lang: "en", lat: 22.13, lng: 90.2, area: "Barguna Sadar", receivedAt: at(-0.6), media: "photo", tags: ["road", "blocked"], checks: { relevance: "pass", duplicate: "pass", location: "pass", recency: "pass" }, confidence: 0.88, verdict: "pending", humanReviewed: false },
  { id: "r7", channel: "whatsapp", reporter: "Volunteer #1180", text: "মোংলায় পানি নামছে, হাঁটু পানি", lang: "bn", lat: 22.48, lng: 89.6, area: "Mongla", receivedAt: at(-0.4), media: "photo", tags: ["flood", "receding"], checks: { relevance: "pass", duplicate: "pass", location: "pass", recency: "pass" }, floodDepthCm: [35, 50], confidence: 0.86, verdict: "pending", humanReviewed: false },
];

export const damageAreas: DamageArea[] = [
  { id: "a1", name: "Kalapara", district: "Patuakhali", level: "upazila", lat: 21.98, lng: 90.24, population: 246000, housesDamaged: { low: 9800, expected: 14200, high: 19600 }, displaced: { low: 31000, expected: 46000, high: 62000 }, roadsBlockedKm: 38, towersDown: 9, substationsDown: 1, priority: 1, confidence: 0.72, drivers: ["Landfall 15 km west", "Surge 3.2–3.8 m", "61% kutcha housing", "12 verified ground reports"] },
  { id: "a2", name: "Pathorghata", district: "Barguna", level: "upazila", lat: 22.04, lng: 89.97, population: 165000, housesDamaged: { low: 7200, expected: 10900, high: 15800 }, displaced: { low: 22000, expected: 34000, high: 49000 }, roadsBlockedKm: 27, towersDown: 6, substationsDown: 1, priority: 2, confidence: 0.64, drivers: ["Embankment breach (unverified)", "Surge 3.0–3.5 m", "Sentinel-1: 41 km² new water"] },
  { id: "a3", name: "Char Fasson", district: "Bhola", level: "upazila", lat: 22.19, lng: 90.76, population: 455000, housesDamaged: { low: 6100, expected: 9400, high: 14100 }, displaced: { low: 18000, expected: 29000, high: 44000 }, roadsBlockedKm: 22, towersDown: 7, substationsDown: 0, priority: 3, confidence: 0.6, drivers: ["Island chars exposed", "River + surge flooding", "Low report density — range widened"] },
  { id: "a4", name: "Barguna Sadar", district: "Barguna", level: "upazila", lat: 22.15, lng: 90.12, population: 262000, housesDamaged: { low: 4200, expected: 6600, high: 9300 }, displaced: { low: 11000, expected: 17500, high: 26000 }, roadsBlockedKm: 19, towersDown: 4, substationsDown: 0, priority: 4, confidence: 0.69, drivers: ["Wind 75–85 kt", "Road blockages confirmed"] },
  { id: "a5", name: "Sarankhola", district: "Bagerhat", level: "upazila", lat: 22.31, lng: 89.79, population: 125000, housesDamaged: { low: 2600, expected: 4100, high: 6200 }, displaced: { low: 7000, expected: 11000, high: 17000 }, roadsBlockedKm: 11, towersDown: 2, substationsDown: 0, priority: 5, confidence: 0.66, drivers: ["Sundarbans buffer reduced wind", "Surge 2.0–2.6 m"] },
  { id: "a6", name: "Mongla", district: "Bagerhat", level: "upazila", lat: 22.49, lng: 89.6, population: 140000, housesDamaged: { low: 1500, expected: 2600, high: 4000 }, displaced: { low: 4000, expected: 7000, high: 11000 }, roadsBlockedKm: 6, towersDown: 1, substationsDown: 0, priority: 6, confidence: 0.74, drivers: ["Water receding (ground reports)", "Port secured"] },
  { id: "a7", name: "Koyra", district: "Khulna", level: "upazila", lat: 22.34, lng: 89.3, population: 205000, housesDamaged: { low: 1900, expected: 3300, high: 5400 }, displaced: { low: 6000, expected: 10000, high: 16000 }, roadsBlockedKm: 9, towersDown: 1, substationsDown: 0, priority: 7, confidence: 0.58, drivers: ["Old embankments", "Road cut reported", "Sparse data"] },
  { id: "a8", name: "Hatiya", district: "Noakhali", level: "upazila", lat: 22.36, lng: 91.12, population: 450000, housesDamaged: { low: 900, expected: 1700, high: 3000 }, displaced: { low: 2500, expected: 4500, high: 8000 }, roadsBlockedKm: 4, towersDown: 0, substationsDown: 0, priority: 8, confidence: 0.7, drivers: ["Outside core wind field"] },
];

export const allocations: ResponseAllocation[] = [
  { areaId: "a1", boats: 24, reliefPacks: 9200, medicalTeams: 6, waterLitres: 180000, route: "partial", etaHours: 5, reason: "Highest expected displacement; health complex at risk; Amtali road partly open." },
  { areaId: "a2", boats: 18, reliefPacks: 6800, medicalTeams: 4, waterLitres: 130000, route: "blocked", etaHours: 9, reason: "Embankment breach report — boats first; road access blocked." },
  { areaId: "a3", boats: 20, reliefPacks: 5800, medicalTeams: 4, waterLitres: 120000, route: "blocked", etaHours: 11, reason: "Island chars need boat access; 400 families in shelter need water." },
  { areaId: "a4", boats: 6, reliefPacks: 3500, medicalTeams: 2, waterLitres: 70000, route: "partial", etaHours: 4, reason: "Road blocked at km 12; clearance team assigned." },
  { areaId: "a5", boats: 6, reliefPacks: 2200, medicalTeams: 1, waterLitres: 44000, route: "open", etaHours: 3, reason: "Moderate damage; open road from Bagerhat." },
  { areaId: "a7", boats: 5, reliefPacks: 2000, medicalTeams: 1, waterLitres: 40000, route: "partial", etaHours: 6, reason: "Sparse data; fairness floor applied so low-report areas are not dropped." },
];

export const restoration: RestorationItem[] = [
  { siteId: "s2", rank: 1, populationRestored: 118000, crew: "Power crew P-3 + mobile transformer", etaHours: 14, dependency: "Dewatering pump at yard" },
  { siteId: "s1", rank: 2, populationRestored: 64000, crew: "Telecom crew KP + generator", etaHours: 8, dependency: "Feeds UHC data link" },
  { siteId: "s6", rank: 3, populationRestored: 47000, crew: "Telecom crew CF (boat)", etaHours: 16 },
  { siteId: "s7", rank: 4, populationRestored: 26000, crew: "Bhola O&M", etaHours: 6, dependency: "Partial load only" },
];
