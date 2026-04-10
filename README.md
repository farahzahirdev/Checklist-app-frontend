# Checklist App Web

Next.js frontend for the Checklist App platform.

## What this app is about

This app is the user-facing interface for the Checklist platform. It contains the public website experience and the authenticated application shell, and it communicates with the backend API for data, auth, and workflow actions.

## How it works

- The App Router serves route groups for public and app areas.
- Shared components provide reusable UI structure.
- `src/lib/api.ts` centralizes API base URL and fetch helpers.
- Environment variables control backend URL and app-level settings.

## Frontend structure

- `src/app/`: route groups, layouts, pages, and global styles.
- `src/components/`: reusable UI components.
- `src/lib/`: client utilities and API helper functions.
- `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`: framework/tooling configuration.

## Prerequisites

- Node.js 20+
- pnpm 10+

## Install dependencies

From `apps/web`:

```bash
pnpm install
```

## Run the frontend

From `apps/web`:

```bash
pnpm dev
```

## Build and typecheck

From `apps/web`:

```bash
pnpm typecheck
pnpm build
```

## Lint

From `apps/web`:

```bash
pnpm lint
```

## Environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Default API base URL points to `http://localhost:8000`.

