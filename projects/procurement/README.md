# Procurement (`@nexcore/procurement`)

Procurement module: purchase orders, requisitions, vendors, invoices, goods receipts, and procurement reports.

Part of the **NexCore ERP** Angular workspace. The host application is `projects/nexcore`; this library is consumed from source through the `@nexcore/procurement` path mapping declared in the root `tsconfig.json`.

## Usage

```ts
import { /* ... */ } from '@nexcore/procurement';
```

## Build

```bash
ng build procurement
```

ng-packagr emits the packaged library to `dist/procurement`.

## Unit tests

```bash
ng test procurement
```

Tests run on [Vitest](https://vitest.dev/) (jsdom environment) via the `@angular/build:unit-test` builder.
