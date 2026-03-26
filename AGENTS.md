# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js App Router pages, layouts, and API routes. Example: `app/api/checkout/route.ts`.
- `components/`: Reusable UI components such as `CheckoutButton.tsx`.
- `hooks/`: Shared React hooks (e.g., `use-mobile.ts`).
- `lib/`: Shared utilities like `utils.ts`.
- `app/globals.css`: Global styles. Tailwind is wired via `postcss.config.mjs`.

## Build, Test, and Development Commands
- `npm install`: Install dependencies.
- `npm run dev`: Start the local Next.js dev server.
- `npm run build`: Build for production.
- `npm run start`: Run the production build.
- `npm run lint`: Run ESLint with the Next.js config.
- `npm run clean`: Clear Next.js build artifacts.

## Coding Style & Naming Conventions
- TypeScript + React (Next.js App Router).
- Indentation is 2 spaces. Use semicolons and single quotes to match existing files.
- Components use `PascalCase.tsx`. Hooks use `use-*.ts`. Utilities live in `lib/*.ts`.
- Use the `@/` path alias for root-relative imports (see `tsconfig.json`).

## Testing Guidelines
- No automated test runner is configured yet (no `test` script in `package.json`).
- If adding tests, keep them close to modules, for example:
  `components/__tests__/CheckoutButton.test.tsx`, and add `npm test`.

## Security & Configuration
- Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY`, `STRIPE_SECRET_KEY`,
  `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, and `APP_URL`.
- Never commit `.env.local` or real secrets.

## Commit & Pull Request Guidelines
- This workspace has no Git history. If you initialize Git, use concise, imperative
  subjects (optional Conventional Commits like `feat: add checkout flow`).
- PRs should include a summary, testing notes (e.g., `npm run lint`), and screenshots
  for UI changes.
