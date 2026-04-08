# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo Structure

```
/
├── app/    # Angular + Capacitor cross-platform app (web, Android, iOS)
├── api/    # Laravel API
├── CLAUDE.md
├── README.md
└── .editorconfig
```

All Angular/Capacitor work happens inside `app/`. Run all `npm` and Angular CLI commands from there.

## App Commands (`app/`)

```bash
npm start           # Dev server at http://localhost:4200
npm run build       # Production build (output: dist/sera-fe)
npm test            # Run Karma/Jasmine unit tests
npm run lint        # ESLint on TypeScript and HTML
npm run watch       # Watch mode build

# Mobile (requires Capacitor setup)
npm run android     # Build & sync Android
npm run android-run # Build & run on Android device with live reload
npm run ios         # Build & sync iOS
npm run ios-run     # Build & run on iOS device with live reload
```

## App Architecture (`app/`)

**Sera** is a greenhouse management app built with Angular 17 (standalone components) + Capacitor for cross-platform deployment (web, Android, iOS). The UI is in Albanian.

### Project Structure

```
app/src/app/
├── components/
│   ├── shared/          # Reusable UI components (prefixed se-)
│   └── [feature]/       # Feature-specific presentational components
├── pages/               # Route-level (smart) components
│   ├── authentication/login/
│   ├── tabs/            # Root tab layout + nested routes
│   ├── home/
│   ├── greenhouse/
│   ├── calendar/
│   ├── reports/
│   └── profile/
├── services/
│   └── core/            # Low-level Capacitor wrappers (http, storage, platform)
├── models/
│   ├── constants/       # Enums: RoutePaths, HttpPaths, StoragePaths, etc.
│   └── [dtos/errors]
└── directives/
```

### Routing

All authenticated routes are children of `TabsComponent`. Lazy loading via `loadComponent`/`loadChildren`.

```
/login              → LoginComponent (standalone)
/ → TabsComponent
    /home           → HomeComponent (default)
    /greenhouse/:id → GreenhouseComponent
    /calendar       → CalendarComponent
    /reports        → ReportsComponent
    /profile        → ProfileComponent
```

### Services

| Service | Purpose |
|---|---|
| `HttpService` | API calls via Capacitor HTTP; auto-injects auth token |
| `StorageService` | Device storage via Capacitor Preferences (JSON) |
| `ModalService` | Dynamic modals using `ComponentFactoryResolver` |
| `ToastService` | Native toasts via Capacitor Toast |
| `NavigationService` | Router navigation wrapper |
| `TabsService` | Active tab state (BehaviorSubject) |

`core/` services are lower-level wrappers; use the non-core counterparts in feature code.

### Key Conventions

- **All components are standalone** — no NgModules
- **`inject()` function** preferred over constructor injection
- **`se-` prefix** on all component/directive selectors
- **No NgRx** — state managed via RxJS services
- **Constants in enums** — use `RoutePaths`, `HttpPaths`, `StoragePaths` instead of raw strings
- **SCSS** for component styles, **Tailwind** for layout/utility classes

### Tailwind Custom Tokens

```js
se-green    // #0B3931 — dark background
se-lime     // #C4FE33 — accent/CTA
se-jungle   // #1A9E78 — primary brand color
```

### Environment

- Dev API: `http://localhost:3000` (`app/src/environments/environment.ts`)
- Production URL configured in `app/src/environments/environment.prod.ts`
- Capacitor dev server: `192.168.1.11:4200` (update `app/capacitor.config.ts` for your local IP)
