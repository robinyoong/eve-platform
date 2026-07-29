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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Ask about eve

The page includes a chatbot that answers questions about eve, grounded in the tutorial content
from `src/lib/tutorial.ts`. Answers stream token by token from `POST /api/chat`, and the panel has
a toggle to switch between Grok 4.5, Claude Opus 5 and ChatGPT-5.6.

All three models are called through [Vercel AI Gateway](https://vercel.com/docs/ai-gateway), so a
single credential is all that is needed:

```bash
AI_GATEWAY_API_KEY=your_gateway_key
```

Without it the launcher still renders and the endpoint answers `503`. Set the optional
`AI_GATEWAY_BASE_URL` to point the app at a gateway-compatible proxy instead of `ai-gateway.vercel.sh`.

Model ids live in `src/lib/chat-models.ts`. Only ids from that catalog can reach the gateway; the
browser never sends a raw model slug.

Run the tests with:

```bash
npm test
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
