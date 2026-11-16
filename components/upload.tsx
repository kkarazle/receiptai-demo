"use client";

import { useRef, useState } from "react";
import { Loader2, Upload as UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Upload({ onDone }: { onDone: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string[]>([]);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setStatus([]);
    for (const file of Array.from(files)) {
      const body = new FormData();
      body.append("file", file);
      try {
        const res = await fetch("/api/receipts", { method: "POST", body });
        const json = await res.json();
        setStatus((s) => [
          ...s,
          res.ok ? `${file.name}: saved (${json.receipt.merchant})` : `${file.name}: ${json.error}`,
        ]);
      } catch {
        setStatus((s) => [...s, `${file.name}: upload failed`]);
      }
    }
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
    onDone();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add receipts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Button onClick={() => inputRef.current?.click()} disabled={busy}>
          {busy ? <Loader2 className="animate-spin" /> : <UploadIcon />}
          {busy ? "Reading receipts…" : "Choose images"}
        </Button>
        <p className="text-sm text-muted-foreground">JPEG, PNG or WebP, up to 3 MB each.</p>
        {status.length > 0 && (
          <ul className="space-y-1 text-sm">
            {status.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
