import type { Metadata } from "next";
import { DocsAdmin } from "@/components/docs/docs-admin";

export const metadata: Metadata = { title: "Beacon Ops · Docs admin", robots: { index: false } };

export default function DocsAdminPage() {
  return <DocsAdmin />;
}
