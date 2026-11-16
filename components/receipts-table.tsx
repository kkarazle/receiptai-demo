"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Receipt } from "@/lib/schema";

function money(n?: number | null, currency?: string | null) {
  if (n == null) return "–";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
    }).format(n);
  } catch {
    return n.toFixed(2);
  }
}

export function ReceiptsTable({ receipts }: { receipts: Receipt[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Receipts ({receipts.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {receipts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing here yet. Upload a receipt photo to get started.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Merchant</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipts.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.merchant}</TableCell>
                  <TableCell>{r.date ?? "–"}</TableCell>
                  <TableCell>{r.category}</TableCell>
                  <TableCell>{r.items.length}</TableCell>
                  <TableCell className="text-right">{money(r.total, r.currency)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
