# Inventory (`@nexcore/inventory`)

Inventory module: items, item categories, stock lists, adjustments, and inventory documents.

Part of the **NexCore ERP** Angular workspace. The host application is `projects/nexcore`; this library is consumed from source through the `@nexcore/inventory` path mapping declared in the root `tsconfig.json`.

## Usage

```ts
import { /* ... */ } from '@nexcore/inventory';
```

## Build

```bash
ng build inventory
```

ng-packagr emits the packaged library to `dist/inventory`.

## Unit tests

```bash
ng test inventory
```

Tests run on [Vitest](https://vitest.dev/) (jsdom environment) via the `@angular/build:unit-test` builder.
