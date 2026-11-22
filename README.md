# zephyr-mf-demo

A social feed built as **micro-frontends**: log in, see the newest posts, like them and write your own. The page is assembled at runtime from four independently deployed apps, hosted on [Zephyr Cloud](https://docs.zephyr-cloud.io/), and backed by a NestJS API. The monorepo is orchestrated with Turborepo.

| | |
|---|---|
| Staging | https://staging-shell-zephyr-mf-demo-juan-20-ze.zephyrcloud.app/ |
| Production | https://production-shell-zephyr-mf-demo-juan-20-ze.zephyrcloud.app/ |
| API (production) | https://zephyr-mf-demo-api.onrender.com |
| API (staging) | https://zephyr-mf-demo-api-staging.onrender.com |

Both APIs sleep when idle (Render's free tier), so the first request can take about 30 seconds. Staging uses a throwaway SQLite database that resets on every API deploy.

## Architecture

```
 browser ──▶ shell (host)  ──loads at runtime──▶  auth      ./LoginForm, ./UserMenu
               │  router, route guard             feed      ./Feed
               │  runtime config                  composer  ./PostComposer
               │
               └── shared singletons: react, react-dom, zustand, @repo/store
                                   │
                         one Zustand store (session + posts)
                                   │  fetch, cookie credentials
                                   ▼
                              apps/api  (NestJS + Postgres on Render)
```

| App | Role |
|---|---|
| `apps/shell` | Host: layout, hash router, route guard, loads the three remotes. |
| `apps/auth` | Remote: login and sign-up form, user menu. |
| `apps/feed` | Remote: the post list with like and unlike. |
| `apps/composer` | Remote: the "new post" form (280 characters). |
| `apps/api` | NestJS API: auth, posts, likes. |

| Package | Role |
|---|---|
| `@repo/store` | Zustand store (session and posts) plus the API client. Shared as a federation **singleton**, so every remote sees the same state. |
| `@repo/types` | `User`, `Post` and request types, shared by the API and the frontends. |
| `@repo/ui` | The theme (design tokens, fonts, component classes) and small shared components. |
| `@repo/config` | Base `tsconfig`. |

The remotes never import each other. They communicate through the store: `auth` writes the session, `composer` calls `createPost`, and `feed` re-renders from the same state. Each remote loads inside a `RemoteSlot` (an error boundary plus `Suspense`), so a failed remote shows a message with a retry button and does not take the shell down.

## Run it locally

```bash
npm install
npm run dev     # shell :5173, auth :5174, feed :5175, composer :5176, API :3000
npm test        # API e2e tests and store unit tests
```

The API uses a local SQLite file when `DATABASE_URL` is not set. The dev servers are fully local: the Zephyr plugin only runs on `vite build`, so the shell loads the remotes from `localhost` and nothing is deployed. A local build also works without a Zephyr login, but then nothing is deployed either.

## Design

The look is a dark theme with a crimson-to-coral brand gradient, defined once in [theme.css](packages/ui/src/theme.css): color tokens, Plus Jakarta Sans for headings, Inter for text and JetBrains Mono for metadata such as timestamps and counters. The **shell loads the stylesheet once**, and the remotes only use its class names (`.btn`, `.input`, `.post`, ...). That way styling never depends on whether a remote's own CSS gets injected when it loads. Each remote also imports the theme in its standalone preview.

## How Zephyr is used

1. **`withZephyr()`** from `vite-plugin-zephyr` is the last plugin in each app's `vite.config.ts`. A `vite build` uploads the output and prints a snapshot URL.
2. **Remote resolution.** The shell lists its remotes in `zephyr:dependencies`, by tag (`zephyr:auth@web_latest_<user>`). At build time Zephyr resolves each to the newest remote build and records it in `zephyr-manifest.json`. Zephyr's runtime plugin reads that manifest to replace the placeholder `localhost` entries in the bundle.
3. **Runtime configuration.** The API URL is not baked into the bundle. At startup the shell fetches `/zephyr-manifest.json` and reads `ZE_PUBLIC_API_URL`, with a build-time value and then `localhost:3000` as fallbacks ([runtime-config.ts](apps/shell/src/runtime-config.ts)). Each environment serves its own value, so one build can talk to staging or production APIs. These variables are public: never put secrets in `ZE_PUBLIC_*`.
4. **Environments.** The shell has `staging` and `production` environments, each tied to a tag whose condition is `environment is <name>`, with its own `ZE_PUBLIC_API_URL` set in the dashboard.

## Turborepo and CI

[.github/workflows/deploy.yml](.github/workflows/deploy.yml) has two jobs:

- **`check`** (pushes and pull requests): `turbo run typecheck test`, with `.turbo` cached between runs.
- **`deploy`** (pushes to `main` and manual runs, after `check` passes): `turbo run deploy --only --filter="...[<previous commit>]"`. Pull requests are never deployed.

What makes the deploy smart:

- `shell` lists `auth`, `feed` and `composer` as dev dependencies. Zephyr resolves remote versions when the shell is built, so a remote change must rebuild the shell too. With that edge in the graph, Turborepo orders the builds itself and includes the shell whenever a remote changes.
- `deploy` is its own task with caching off. Deploying is a side effect of `vite build`, and a cached replay would skip it.
- `--only` is needed: without it, Turborepo also runs the shell's `^deploy` dependencies and redeploys every remote.

Measured on real runs:

| Change pushed | Deployed |
|---|---|
| README only | nothing |
| `feed` only | `feed`, then `shell` |
| `shell` only | `shell` |
| `api` only | nothing |
| Shared package, or root files such as `turbo.json` | all four apps |

Pushes land in **staging**. To deploy to production, run the workflow manually (**Actions, Run workflow, environment: production**). Setup: add a Zephyr CI token (dashboard, Settings, Tokens, CI Tokens) as the repository secret `ZE_CI_TOKEN`. A guard step fails the job if it is missing, because the Zephyr plugin only logs authentication errors and exits successfully.

## API

NestJS with TypeORM, on Postgres (SQLite locally and in tests).

| Endpoint | |
|---|---|
| `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` | Session. |
| `GET /posts` | The 50 newest posts, with `likeCount` and `likedByMe`. |
| `POST /posts` | Create a post (1 to 280 characters). |
| `POST /posts/:id/like`, `DELETE /posts/:id/like` | Idempotent like and unlike. |

Security: bcrypt password hashes, a JWT in an `HttpOnly; Secure; SameSite=None` cookie (the frontends and the API are on different sites), and one error for both unknown user and wrong password. CORS only allows localhost and this project's Zephyr hostnames, matched by a pattern ([config.ts](apps/api/src/config.ts)) with a regression test. `render.yaml` defines both API services and the Postgres database.

## Technical decisions

| Decision | Why |
|---|---|
| Vite 7, React 19, TypeScript | Fast setup and a Zephyr plugin. Vite 8 was avoided because `@vitejs/plugin-react` 6 requires it. |
| `@module-federation/vite` | Module Federation for Vite, supported by the Zephyr plugin. |
| One Zustand store as a singleton | The remotes stay independent but share state without a custom event bus. |
| Hash router | I could not confirm that Zephyr serves deep links such as `/login` on refresh. |
| Runtime config from the manifest | One build for staging and production, and the API URL changes without a rebuild. |
| Tag selectors for remotes | Followed the newest remote build and, unlike semver ranges, were carried into environment manifests. |
| npm workspaces | No extra tooling for a reviewer. |
| NestJS on Render | Zephyr hosts static frontends only, so the API needs its own host. |

## Known limitations

- **Environment URLs serve old remote versions.** The staging and production manifests keep listing the first remote builds they were given, even after the remotes are redeployed. The shell's own version URL follows the tag and is always current. I did not find the cause. Selecting the remotes by environment (`auth@staging`) resolved to empty URLs, so I reverted that.
- **Promoting in the dashboard is not enough.** Promoting a shell version to production copies its variables but not its remote dependencies, leaving the page without remotes. Production is therefore deployed through the manual CI run.
- **The Dependencies panel of an environment is a read-only preview.** Selecting a version there saves nothing.
- Built bundles preload the `localhost` remote entries first, which fail harmlessly before the manifest takes over.
- `synchronize: true` creates tables automatically. A real product would use migrations.
- Render's free Postgres expires after about 30 days.

## Problems found along the way

| Problem | Cause and fix |
|---|---|
| `ZE10018` | No Zephyr login. Signed in interactively, then switched CI to `ZE_CI_TOKEN`. |
| `ZE10019` | The folder was not a git repository, so Zephyr guessed the organization. Creating the repository fixed it. |
| `ZE40003` | `@latest` pointed to a tag that does not exist. The automatic tag is named `web_latest_<user>`. |
| `process.env.ZE_PUBLIC_*` did nothing | In this plugin version it compiled to `undefined` or to the fallback. The manifest is read explicitly instead. |
| CORS blocked the deployed apps (twice) | Zephyr truncates long hostnames, and environment URLs have a different shape from version URLs. Fixed the pattern and added tests with real URLs. |
| Local dev showed a blank page | Reading `import.meta.env.ZE_PUBLIC_*` in source made the Zephyr plugin emit an `import "env:vars:..."` that only resolves on a deployed page. The code no longer reads those variables, and the plugin only runs on build. |
| `500` on sign-up in dev | `tsx` does not emit decorator metadata, so NestJS injection broke. The dev script uses `ts-node`. |
| Render build failed | `NODE_ENV=production` skips dev dependencies, which removed the type packages. The build uses `npm ci --include=dev`. |

## Feedback on the assignment

- The goal is clear, and the docs got me from zero to a federated app on the edge quickly. The Vite plugin needs very little configuration.
- Error codes link to docs, but `ZE10019` gave no actionable cause in the log. Naming the underlying reason (unknown organization, missing git remote) would save time.
- The documented way to read `ZE_PUBLIC_*` variables in a Vite app did not work for me in this plugin version, and the docs mention an import map that never appeared in the build output.
- Environment behavior is hard to predict: how remote dependencies get into an environment manifest, why promotion leaves them out, and what the Dependencies panel edits. A worked monorepo example with environments would help.
- Many Zephyr pages show a lot of page chrome and little text, which made them slow to search.
