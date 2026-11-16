import { z } from "zod";

// Models are sloppy about nulls, so most fields are nullish.
export const receiptSchema = z.object({
  merchant: z.string().default("Unknown"),
  date: z.string().nullish(), // YYYY-MM-DD
  currency: z.string().nullish(), // ISO 4217, e.g. USD
  category: z.string().default("other"),
  items: z
    .array(
      z.object({
        name: z.string(),
        quantity: z.number().nullish(),
        unitPrice: z.number().nullish(),
        total: z.number().nullish(),
      })
    )
    .default([]),
  subtotal: z.number().nullish(),
  tax: z.number().nullish(),
  tip: z.number().nullish(),
  total: z.number().nullish(),
  paymentMethod: z.string().nullish(),
});

export type ReceiptData = z.infer<typeof receiptSchema>;

export type Receipt = ReceiptData & {
  id: string;
  fileName: string;
  createdAt: string;
};
