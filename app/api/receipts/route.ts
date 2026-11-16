import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { extractReceipt } from "@/lib/groq";

export const maxDuration = 60;

// Groq limits base64 image payloads to 4MB, i.e. roughly 3MB of raw image.
const MAX_BYTES = 3 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export async function GET() {
  const db = await getDb();
  const docs = await db
    .collection("receipts")
    .find()
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();
  const receipts = docs.map(({ _id, ...rest }) => ({ id: _id.toString(), ...rest }));
  return NextResponse.json({ receipts });
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: "Use a JPEG, PNG or WebP image" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Image must be under 3 MB" }, { status: 400 });
    }

    const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
    const data = await extractReceipt(`data:${file.type};base64,${base64}`);

    const doc = { ...data, fileName: file.name, createdAt: new Date().toISOString() };
    const db = await getDb();
    const { insertedId } = await db.collection("receipts").insertOne({ ...doc });

    return NextResponse.json({ receipt: { id: insertedId.toString(), ...doc } });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not read this receipt. Try a clearer photo." },
      { status: 500 }
    );
  }
}
