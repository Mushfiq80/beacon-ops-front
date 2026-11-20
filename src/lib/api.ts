/* Thin client for the Beacon Ops backend (FastAPI, backend/). Used once
   NEXT_PUBLIC_API_URL is set; until then pages read the demo scenario. */

const API = process.env.NEXT_PUBLIC_API_URL;

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API) throw new Error("NEXT_PUBLIC_API_URL is not set — running in demo mode.");
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export const endpoints = {
  events: "/v1/events",
  sites: "/v1/sites",
  tasks: "/v1/tasks",
  approveTask: (id: string) => `/v1/tasks/${id}/approve`,
  reports: "/v1/reports",
  damage: (eventId: string) => `/v1/events/${eventId}/damage`,
  allocations: (eventId: string) => `/v1/events/${eventId}/allocations`,
  intel: "/v1/intel",
  claims: (eventId: string) => `/v1/events/${eventId}/claims`,
  reviewClaim: (id: string) => `/v1/claims/${id}/review`,
  pressRelease: (eventId: string) => `/v1/events/${eventId}/press-release`,
  agents: "/v1/agents",
  copilot: "/v1/copilot/ask",
};
