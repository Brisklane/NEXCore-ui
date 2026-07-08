# Core (`@nexcore/core`)

Cross-cutting primitives shared across every feature library: API configuration, HTTP plumbing, auth helpers, and common services.

Part of the **NexCore ERP** Angular workspace. The host application is `projects/nexcore`; this library is consumed from source through the `@nexcore/core` path mapping declared in the root `tsconfig.json`.

## Usage

```ts
import { /* ... */ } from '@nexcore/core';
```

## Build

```bash
ng build core
```

ng-packagr emits the packaged library to `dist/core`.

## Unit tests

```bash
ng test core
```

Tests run on [Vitest](https://vitest.dev/) (jsdom environment) via the `@angular/build:unit-test` builder.
