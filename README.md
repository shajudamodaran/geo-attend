This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Seeding the database

Load demo businesses, employees, and attendance history (about 30 days) for local development.

1. Set `MONGODB_URI` in `.env` at the project root (same connection string the app uses). The seed script loads `.env` from there when you run it below.
2. Run:

```bash
npm run seed
```

This runs `scripts/seed.ts` via `tsx`. **It deletes all existing businesses, employees, and attendance** in that database, then inserts fresh demo data.

After it finishes, the script prints login hints:

- **Owner (dashboard):** `demo@geoattend.in` / `Demo@1234`
- **Employee check-in:** open **Employee login**, enter a seeded employee’s **10-digit mobile** (from the seed output) and PIN **`1234`** — no business ID needed; if that number exists in more than one demo company, you’ll pick the workplace.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
