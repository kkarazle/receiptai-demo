import Groq from "groq-sdk";
import { receiptSchema, type ReceiptData } from "./schema";

export const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const VISION_MODEL = "qwen/qwen3.8-27b";
export const CHAT_MODEL = "openai/gpt-oss-120b";

const EXTRACTION_PROMPT = `You extract structured data from a photo of a receipt or invoice.
Return ONLY a JSON object with this shape:
{
  "merchant": string,
  "date": "YYYY-MM-DD" | null,
  "currency": ISO 4217 code | null,
  "category": one of "groceries" | "dining" | "transport" | "shopping" | "health" | "utilities" | "entertainment" | "travel" | "other",
  "items": [{ "name": string, "quantity": number | null, "unitPrice": number | null, "total": number | null }],
  "subtotal": number | null,
  "tax": number | null,
  "tip": number | null,
  "total": number | null,
  "paymentMethod": string | null
}
Rules: numbers are plain numbers (no currency symbols). Use null when a value is not visible; never guess.
If the image is not a receipt, return {"merchant":"Unknown","category":"other","items":[],"total":null}.`;

export async function extractReceipt(dataUrl: string): Promise<ReceiptData> {
  const res = await groq.chat.completions.create({
    model: VISION_MODEL,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: EXTRACTION_PROMPT },
          { type: "image_url", image_url: { url: dataUrl } },
        ],
      },
    ],
  });
  const raw = res.choices[0]?.message?.content ?? "{}";
  return receiptSchema.parse(JSON.parse(raw));
}
