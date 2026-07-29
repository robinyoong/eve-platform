<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

- This is a single Next.js 16 (Turbopack) app named `eve-platform` — a fully static marketing/tutorial landing page. There is no backend, database, or required environment variables; nothing else needs to be running.
- Package manager is npm (`package-lock.json`). Dependencies are refreshed automatically by the startup update script.
- Standard commands live in `package.json`: `npm run dev` (dev server on http://localhost:3000), `npm run build`, `npm run lint` (flat ESLint config, `eslint.config.mjs`).
- The code panel "Copy" button toggles to "Copied" via `navigator.clipboard`, which requires clipboard permission / a secure context. In automated/headless browsers it may silently stay on "Copy" — this is expected, not a bug.
