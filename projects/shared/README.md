# Shared (`@nexcore/shared`)

Framework-level shared types, UI components, and utilities (including the `AppEnvironment` contract) used across the workspace.

Part of the **NexCore ERP** Angular workspace. The host application is `projects/nexcore`; this library is consumed from source through the `@nexcore/shared` path mapping declared in the root `tsconfig.json`.

## Usage

```ts
import { /* ... */ } from '@nexcore/shared';
```

## Build

```bash
ng build shared
```

ng-packagr emits the packaged library to `dist/shared`.

## Unit tests

```bash
ng test shared
```

Tests run on [Vitest](https://vitest.dev/) (jsdom environment) via the `@angular/build:unit-test` builder.
