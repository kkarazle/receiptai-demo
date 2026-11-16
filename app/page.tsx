"use client";

import { useCallback, useEffect, useState } from "react";
import { Upload } from "@/components/upload";
import { ReceiptsTable } from "@/components/receipts-table";
import { Chat } from "@/components/chat";
import type { Receipt } from "@/lib/schema";

export default function Home() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/receipts");
    if (res.ok) setReceipts((await res.json()).receipts);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Receipt AI</h1>
        <p className="text-muted-foreground">
          Upload receipt photos, then ask questions about your spending.
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <Upload onDone={load} />
          <ReceiptsTable receipts={receipts} />
        </div>
        <Chat />
      </div>
    </main>
  );
}
