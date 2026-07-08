# Manufacturing (`@nexcore/manufacturing`)

Manufacturing module: production orders, bills of material, scheduling, costing, and shop-floor workflows.

Part of the **NexCore ERP** Angular workspace. The host application is `projects/nexcore`; this library is consumed from source through the `@nexcore/manufacturing` path mapping declared in the root `tsconfig.json`.

## Usage

```ts
import { /* ... */ } from '@nexcore/manufacturing';
```

## Build

```bash
ng build manufacturing
```

ng-packagr emits the packaged library to `dist/manufacturing`.

## Unit tests

```bash
ng test manufacturing
```

Tests run on [Vitest](https://vitest.dev/) (jsdom environment) via the `@angular/build:unit-test` builder.
