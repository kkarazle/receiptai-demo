import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { groq, CHAT_MODEL } from "@/lib/groq";

export const maxDuration = 60;

type Msg = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as { messages: Msg[] };

    // Simple approach: put the most recent receipts in the prompt.
    // See README for how to scale this beyond a few hundred receipts.
    const db = await getDb();
    const docs = await db
      .collection("receipts")
      .find({}, { projection: { _id: 0, fileName: 0 } })
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();

    const system = `You are a helpful assistant that answers questions about the user's receipts.
Today is ${new Date().toISOString().slice(0, 10)}.
Answer ONLY from the receipt data below. Do the arithmetic carefully, show totals with currency, and say so if the data can't answer the question.
Receipts (JSON, newest first):
${JSON.stringify(docs)}`;

    const res = await groq.chat.completions.create({
      model: CHAT_MODEL,
      temperature: 0.2,
      messages: [{ role: "system", content: system }, ...messages.slice(-10)],
    });

    return NextResponse.json({ reply: res.choices[0]?.message?.content ?? "" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}
