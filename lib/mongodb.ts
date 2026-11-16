import { MongoClient } from "mongodb";

// Reuse one client across hot reloads (dev) and warm invocations (serverless).
const g = globalThis as unknown as { _mongo?: Promise<MongoClient> };

export async function getDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  g._mongo ??= new MongoClient(uri).connect();
  const client = await g._mongo;
  return client.db(process.env.MONGODB_DB ?? "receipt_ai");
}
