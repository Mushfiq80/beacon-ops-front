import type { Metadata } from "next";
import { DocsView } from "@/components/docs/docs-view";

export const metadata: Metadata = {
  title: "Beacon Ops · Docs: pitch deck and technical documentation",
  description: "Beacon Ops: AI for Disaster Operations. Pitch deck, architecture, AI layer, APIs and live system view.",
};

export default function DocsPage() {
  return <DocsView />;
}
