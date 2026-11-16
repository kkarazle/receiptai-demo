"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "How much did I spend in total?",
  "What was my biggest purchase?",
  "Break down my spending by category",
];

export function Chat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function send(text: string) {
    if (!text.trim() || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const json = await res.json();
      setMessages([
        ...next,
        { role: "assistant", content: res.ok ? json.reply : "Something went wrong. Try again." },
      ]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Network error. Try again." }]);
    }
    setBusy(false);
  }

  return (
    <Card className="flex h-[600px] flex-col">
      <CardHeader>
        <CardTitle>Ask about your receipts</CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <Button key={s} variant="outline" size="sm" onClick={() => send(s)}>
                  {s}
                </Button>
              ))}
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={
                m.role === "user"
                  ? "ml-auto w-fit max-w-[85%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
                  : "w-fit max-w-[85%] whitespace-pre-wrap rounded-lg bg-muted px-3 py-2 text-sm"
              }
            >
              {m.content}
            </div>
          ))}
          {busy && <div className="text-sm text-muted-foreground">Thinking…</div>}
          <div ref={endRef} />
        </div>
        <div className="flex gap-2">
          <Input
            value={input}
            placeholder="e.g. What did I spend on dining last month?"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
          />
          <Button onClick={() => send(input)} disabled={busy || !input.trim()} aria-label="Send">
            <Send />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
