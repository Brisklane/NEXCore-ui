# Accounting (`@nexcore/accounting`)

Accounting module: chart of accounts, journal entries, ledgers, dimensions, and the fiscal calendar.

Part of the **NexCore ERP** Angular workspace. The host application is `projects/nexcore`; this library is consumed from source through the `@nexcore/accounting` path mapping declared in the root `tsconfig.json`.

## Usage

```ts
import { /* ... */ } from '@nexcore/accounting';
```

## Build

```bash
ng build accounting
```

ng-packagr emits the packaged library to `dist/accounting`.

## Unit tests

```bash
ng test accounting
```

Tests run on [Vitest](https://vitest.dev/) (jsdom environment) via the `@angular/build:unit-test` builder.
