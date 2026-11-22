# zephyr-mf-demo

A micro-frontend demo: a **host** shell that loads a component from an independently deployed **remote** at runtime, built with Vite + React + TypeScript, wired with Module Federation, and deployed to the edge with [Zephyr Cloud](https://docs.zephyr-cloud.io/).

## Live deployments

| App | URL |
|---|---|
| Host | https://juanalvesandrade-12-host-zephyr-mf-demo-juan-20-910855371-ze.zephyrcloud.app/ |
| Remote (v0.2.0) | https://juanalvesandrade-9-remote-zephyr-mf-demo-juan-20-4935df086-ze.zephyrcloud.app/ |

Each URL is an immutable snapshot of one build. The host page shows the remote's `Card` (it prints its own version, `v0.2.0`).

## Architecture

```
                 build time                              runtime (browser)
 ┌────────┐  zephyr:dependencies   ┌─────────┐        ┌──────────────────────┐
 │  host  │ ─────────────────────▶ │ Zephyr  │        │ host bundle (edge)   │
 └────────┘  "remote@>=0.1.0 <1"   │ resolve │        │   └─ import('remote/Card')
                                    └────┬────┘        │        ▼             │
 ┌────────┐   deploy snapshot            │ picks       │ remoteEntry.js (edge)│
 │ remote │ ─────────────────────────────┘ highest     └──────────────────────┘
 └────────┘   version in range
```

- `apps/remote` exposes `./Card` through `@module-federation/vite` and shares `react` / `react-dom` as singletons.
- `apps/shell` declares the remote and lazy-loads `remote/Card` behind `Suspense` and an `ErrorBoundary` (with a retry button) so a failed remote does not take the shell down.
- Turborepo + npm workspaces orchestrate the two apps.

## Implementation and deployment process

1. **Scaffold** a Turborepo workspace with two Vite + React + TS apps.
2. **Federation:** `@module-federation/vite` in both apps; the remote has `exposes`, the host has `remotes`. The host's `entry` points to `localhost:5174` and is only used in local development.
3. **Zephyr:** `withZephyr()` from `vite-plugin-zephyr` is added last in each `plugins` array. On `vite build` it uploads the output and prints a snapshot URL.
4. **Dependency resolution:** the host's `package.json` declares

   ```json
   "zephyr:dependencies": { "remote": "zephyr:remote@>=0.1.0 <1.0.0" }
   ```

   At build time Zephyr resolves that selector to the highest matching remote version and rewrites the host's remote entry to the deployed URL. Shipping a new remote version in range therefore needs only a host rebuild, not a code change.
5. **CI/CD:** `.github/workflows/deploy.yml` typechecks, then builds and deploys the remote and the host (in that order) on every push to `main`.

## Run it

```bash
npm install
npm run dev                # host :5173, remote :5174 (local, no Zephyr resolution)
```

Deploy manually (the first run opens a browser to sign in to Zephyr):

```bash
npm run build -w remote    # remote first, so the host can resolve it
npm run build -w shell
```

For CI, create a token in the Zephyr dashboard (Settings → Tokens → CI Tokens) and add it as the repository secret `ZE_CI_TOKEN`.

## Technical decisions

| Decision | Why |
|---|---|
| Vite + React + TS | Fast setup and a first-class Zephyr plugin. |
| `@module-federation/vite` | Official Module Federation plugin for Vite. |
| Monorepo with Turborepo | Two apps in one repo, one `npm run build`, and Zephyr treats them as one project. |
| npm workspaces | No extra tooling for whoever reviews the repo (the local pnpm was very old). |
| Vite 7 / plugin-react 5 | `@vitejs/plugin-react` 6 requires Vite 8; Vite 7 is accepted by every plugin used. |
| Semver range in `zephyr:dependencies` | Follows new remote versions without editing the host. |
| `ErrorBoundary` in the host | A remote is a network dependency and can fail independently. |

## Problems found along the way

- **`ZE10018` (auth missing):** the first build ran without a Zephyr login. Fixed by signing in from an interactive terminal (or `ZE_CI_TOKEN` in CI).
- **`ZE10019` (cannot create Build ID):** appeared while the folder was not a git repository, so Zephyr guessed the organization and project. Creating the git repo and its GitHub remote fixed it.
- **`ZE40003` (cannot resolve app name with version):** the host could not resolve the remote with `@latest`. Exact versions and semver ranges resolve correctly; I did not confirm why the `latest` tag is missing (my guess is that tags must be created in the Zephyr dashboard first).
- **Remote not deployed before the host:** the host build cannot resolve a remote that does not exist yet, hence the build order.

## Feedback on the assignment

- The goal is clear and the Zephyr docs got me from zero to a deployed federated app quickly; the plugin needs almost no configuration.
- Error codes link to docs, which helps, but `ZE10019` gave no actionable reason in the log. Surfacing the underlying cause (for example, unknown organization or missing git remote) would save time.
- The dependency selector syntax is easy to get wrong: the docs show both short names and full application UIDs, and which one applies depends on whether the apps share a repository. A worked monorepo example would help.
- Unclear to me: how tags such as `latest` get created without the dashboard. A CLI or docs path for that would complete the story.
