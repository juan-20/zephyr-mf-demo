# zephyr-mf-demo

Monorepo (Turborepo + npm workspaces) with two Vite + React + TypeScript apps connected by Module Federation (`@module-federation/vite`) and deployed with [Zephyr Cloud](https://docs.zephyr-cloud.io/).

- `apps/remote` — micro-frontend exposing `./Card`
- `apps/host` — shell that lazy-loads `remote/Card`

## Run locally

```bash
npm install
npm run dev        # host :5173, remote :5174
```

## Deploy with Zephyr

```bash
npm run build -w remote   # first run opens a browser to sign in to Zephyr
npm run build -w host
```

Each build prints its deployed URL. Build the remote first so the host can resolve it.
