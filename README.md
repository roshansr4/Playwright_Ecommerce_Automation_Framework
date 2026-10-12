# Playwright E-Commerce Automation Framework

Enterprise-grade, scalable UI test automation for [automationexercise.com](https://automationexercise.com),
built with Playwright + TypeScript. Covers 9 pages/flows: Login, Signup, Home,
Products (catalog + search), Product Detail, Cart, Checkout, Payment, and
Contact Us.

## Why automationexercise.com

It's a purpose-built, stable practice site with a real signup/login flow and
a public REST API (`/api/*`), which lets this framework demonstrate
production-grade auth handling (API-based user provisioning + storageState
reuse) rather than hardcoded demo credentials.

## Architecture

```
src/
  pages/        Page Object Model — one class per page, locators + actions only
  components/   Shared UI fragments reused across pages (e.g. header/nav)
  fixtures/      Custom Playwright fixtures: page objects, API client, auth state
  data/          Test data factories (@faker-js/faker) — unique data per run
  utils/         Cross-cutting helpers: API client, logger
  config/        Environment configuration (.env driven)
  types/         Shared TypeScript domain types
tests/
  auth/          Login + Signup specs, and the auth.setup.ts bootstrap project
  home/          Home page specs
  products/      Catalog, search, brand filter, product detail specs
  cart/          Cart specs
  checkout/      Checkout + payment (authenticated) specs
  contact/       Contact Us specs
```

### Design principles

- **Page Object Model**: every page exposes locators and business-level
  actions (`login()`, `addToCart()`) — no raw selectors in spec files.
- **Component objects**: the header/nav is modeled once (`HeaderComponent`)
  and composed into every page that needs it, instead of being duplicated.
- **Fixtures over setup/teardown soup**: `src/fixtures/test-options.ts`
  injects every page object and the API client directly into each test via
  Playwright's fixture system.
- **Auth handling, the Playwright-recommended way**: a dedicated `setup`
  project (`tests/auth/auth.setup.ts`) provisions a unique user through the
  AUT's REST API (fast, non-flaky) and performs **one** real UI login to
  capture `storageState` to `.auth/user.json`. Specs that need to run as a
  logged-in user opt in per-file with `test.use({ storageState: STORAGE_STATE_PATH })`;
  specs that must be logged out (login/signup) simply don't, and run with a
  clean, cookie-less context. `global-teardown.ts` deletes the provisioned
  account via the API after the run.
- **Data-driven, collision-free test data**: `buildTestUser()` /
  `buildCardDetails()` generate unique, realistic data per invocation so
  parallel workers never collide on uniqueness constraints (e.g. email).
- **Environment-driven config**: `src/config/env.config.ts` centralizes
  base URL, timeouts, retries, and credentials, loaded from `.env` /
  `.env.<ENV>` via `dotenv`, so the same suite targets QA/staging/prod by
  changing `ENV`.
- **Resilience**: `BasePage` centralizes wait-then-act helpers
  (`click`/`fill` wait for visibility first); cart/session state is
  explicitly cleared between tests that share `storageState` to avoid
  server-side cross-test pollution.
- **Tagging**: tests are tagged `@smoke` / `@regression` in their titles for
  selective execution (`npm run test:smoke`).

## Getting started

```bash
npm install
npx playwright install --with-deps   # first time only
cp .env.example .env

npm test                 # full suite, all browsers
npm run test:chromium    # a single browser
npm run test:smoke       # @smoke-tagged tests only
npm run test:ui          # interactive UI mode
npm run report           # open the last HTML report
```

## Configuration

All runtime config lives in `.env` (see `.env.example`):

| Variable | Purpose |
|---|---|
| `ENV` | Selects `.env.<ENV>` overrides (qa/staging/prod) |
| `BASE_URL` / `API_BASE_URL` | Target application + API |
| `HEADLESS`, `WORKERS`, `RETRIES` | Execution tuning |
| `TRACE`, `VIDEO` | Debug artifact capture |

## CI

`.github/workflows/playwright.yml` runs the full suite across Chromium,
Firefox, and WebKit on every push/PR to `main`, plus a nightly regression
run, publishing the HTML and JUnit reports as build artifacts.

## Extending the framework

1. Add a new page object in `src/pages/`, extending `BasePage`.
2. Register it as a fixture in `src/fixtures/test-options.ts`.
3. Add specs under `tests/<area>/`, tagging each with `@smoke` or
   `@regression`.
4. If the flow needs auth, add `test.use({ storageState: STORAGE_STATE_PATH })`
   at the top of the spec file.
