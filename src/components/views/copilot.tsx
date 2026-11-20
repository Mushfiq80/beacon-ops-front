"use client";

import { useRef, useState } from "react";
import { Bot, Send, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader, AiTag } from "@/components/shared";
import { answerLocally, type CopilotAnswer } from "@/lib/copilot-local";
import { api, endpoints } from "@/lib/api";

type Msg = { role: "user" | "assistant"; text: string; sources?: string[]; mode?: "live" | "offline" };

const suggestions = [
  "Where should rescue teams go first?",
  "Which critical sites are down?",
  "How many deaths are confirmed?",
  "How many people are displaced?",
  "How are boats and relief allocated?",
  "কোন কাজগুলো অনুমোদনের অপেক্ষায়?",
];

export function CopilotView() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", text: "I'm Beacon, the read-only operations copilot. I answer from live records and always show what I used.", mode: "offline" },
  ]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  const ask = async (question: string) => {
    if (!question.trim()) return;
    setMsgs((m) => [...m, { role: "user", text: question }]);
    setQ("");
    setBusy(true);
    let ans: CopilotAnswer & { mode: "live" | "offline" };
    try {
      const r = await api<CopilotAnswer>(endpoints.copilot, { method: "POST", body: JSON.stringify({ question }) });
      ans = { ...r, mode: "live" };
    } catch {
      await new Promise((r) => setTimeout(r, 450));
      ans = { ...answerLocally(question), mode: "offline" };
    }
    setMsgs((m) => [...m, { role: "assistant", ...ans }]);
    setBusy(false);
    setTimeout(() => end.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  return (
    <div className="flex h-full flex-col gap-4 p-4 md:p-6">
      <PageHeader
        title="Ask Beacon"
        subtitle="Ask in Bangla or English. The copilot is read-only: it cannot send messages or change records."
      />
      <Card className="flex min-h-0 flex-1 flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Operations copilot <AiTag>LLM + MCP tools</AiTag>
          </CardTitle>
          <CardDescription>Without a backend it answers from the demo scenario (offline mode).</CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-[380px] flex-1 flex-col gap-3 overflow-y-auto">
          {msgs.map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : ""}`}>
              {m.role === "assistant" && (
                <div className="bg-primary text-primary-foreground grid size-7 shrink-0 place-items-center rounded-full">
                  <Bot className="size-4" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                <div className="whitespace-pre-wrap">{m.text}</div>
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {m.sources.map((s) => (
                      <Badge key={s} variant="outline" className="font-mono text-[10px]">
                        {s}
                      </Badge>
                    ))}
                    {m.mode && <Badge variant={m.mode === "live" ? "success" : "secondary"}>{m.mode}</Badge>}
                  </div>
                )}
              </div>
              {m.role === "user" && (
                <div className="bg-secondary grid size-7 shrink-0 place-items-center rounded-full">
                  <User className="size-4" />
                </div>
              )}
            </div>
          ))}
          {busy && <div className="text-muted-foreground text-xs">Beacon is checking records…</div>}
          <div ref={end} />
        </CardContent>
        <div className="flex flex-col gap-2 border-t p-4">
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <Button key={s} size="sm" variant="outline" className="h-7 text-xs" onClick={() => ask(s)}>
                {s}
              </Button>
            ))}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              ask(q);
            }}
          >
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask about the situation…" />
            <Button type="submit" disabled={busy}>
              <Send /> Ask
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
