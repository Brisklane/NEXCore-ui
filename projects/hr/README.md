# HR (`@nexcore/hr`)

Human resources module: recruitment, candidate pipeline, interviews, hiring management, payroll, and reporting.

Part of the **NexCore ERP** Angular workspace. The host application is `projects/nexcore`; this library is consumed from source through the `@nexcore/hr` path mapping declared in the root `tsconfig.json`.

## Usage

```ts
import { /* ... */ } from '@nexcore/hr';
```

## Build

```bash
ng build hr
```

ng-packagr emits the packaged library to `dist/hr`.

## Unit tests

```bash
ng test hr
```

Tests run on [Vitest](https://vitest.dev/) (jsdom environment) via the `@angular/build:unit-test` builder.
