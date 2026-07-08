# Sales (`@nexcore/sales`)

Sales module: quotations, sales orders, POS terminals, price lists, promotions, and payments.

Part of the **NexCore ERP** Angular workspace. The host application is `projects/nexcore`; this library is consumed from source through the `@nexcore/sales` path mapping declared in the root `tsconfig.json`.

## Usage

```ts
import { /* ... */ } from '@nexcore/sales';
```

## Build

```bash
ng build sales
```

ng-packagr emits the packaged library to `dist/sales`.

## Unit tests

```bash
ng test sales
```

Tests run on [Vitest](https://vitest.dev/) (jsdom environment) via the `@angular/build:unit-test` builder.
