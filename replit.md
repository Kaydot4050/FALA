# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Project: DataMart GH Reseller Portal

A customer-facing data bundle purchase website that proxies the DataMart GH API.

### Architecture

- **Frontend** (`artifacts/datamart-dashboard`): React + Vite, served at `/`
- **Backend** (`artifacts/api-server`): Express proxy server at `/api`
  - Proxies all requests to `https://api.datamartgh.shop/api/developer`
  - Uses `DATAMART_API_KEY` secret for authentication

### Pages

- `/` — Home: browse data packages by network (YELLO/MTN, TELECEL, AT_PREMIUM) and purchase
- `/order/:reference` — Order status check
- `/tracker` — Live delivery tracker (polls every 15s)
- `/transactions` — Transaction history

### Configuration Required

Set the `DATAMART_API_KEY` secret (from DataMart GH developer portal) to enable live data.

### DataMart API

Base URL: `https://api.datamartgh.shop/api/developer`  
Auth: `X-API-Key` header

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
