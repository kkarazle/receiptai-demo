# Receipt AI

Next.js + shadcn/ui + Tailwind + Groq + MongoDB Atlas.

## Setup

```bash
npx create-next-app@latest receipt-ai --typescript --tailwind --eslint --app --src-dir=false --import-alias "@/*"
cd receipt-ai
npx shadcn@latest init
npx shadcn@latest add button card input table
npm i groq-sdk mongodb zod lucide-react
```

Then copy `app/`, `components/` (not `components/ui`), `lib/` and `.env.example` from this
folder over the generated project (overwrite `app/page.tsx`), and:

```bash
cp .env.example .env.local   # fill in GROQ_API_KEY and MONGODB_URI
npm run dev
```

In MongoDB Atlas, add your IP under Network Access (or 0.0.0.0/0 while testing, and for Vercel).

## How it works

- `POST /api/receipts`: image -> base64 -> Groq vision model (JSON mode) -> zod validation -> MongoDB.
- `GET /api/receipts`: latest 100 receipts.
- `POST /api/chat`: loads the latest 200 receipts into the system prompt and asks Groq to answer.

## Scaling the chat

Stuffing receipts into the prompt is fine for a few hundred rows. Beyond that, switch to Groq tool
calling: expose tools like `sum_spend({category, from, to})` or `search_receipts({merchant, from, to})`
that run MongoDB aggregations server-side. Don't let the model write raw Mongo queries.
