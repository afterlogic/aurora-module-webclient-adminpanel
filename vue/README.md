# admin-panel (admin-panel-vue-webclient)

Admin panel

## Install the dependencies
```bash
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
npm run dev
```

### Lint the files
```bash
npm run lint
```

### Build the app for production
```bash
npm run build-production
```

**NB:** don't call the `quasar` CLI directly (e.g. `npx quasar build`/`quasar dev` from a shell where the Quasar CLI happens to be installed globally) — this project's `npm run` scripts always resolve `quasar` from the local `node_modules/.bin`, which is pinned to the Quasar/`@quasar/app-webpack` version this app was built against. The mobile webclient (`modules/CoreMobileWebclient/vue-mobile`) uses a different Quasar version in the same repo, so relying on a global install can silently build against the wrong CLI version.

### Customize the configuration
See [Configuring quasar.conf.js](https://v1.quasar.dev/quasar-cli/quasar-conf-js).
