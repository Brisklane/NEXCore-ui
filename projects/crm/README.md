# CRM (`@nexcore/crm`)

Customer relationship management module: leads and contacts.

Part of the **NexCore ERP** Angular workspace. The host application is `projects/nexcore`; this library is consumed from source through the `@nexcore/crm` path mapping declared in the root `tsconfig.json`.

## Usage

```ts
import { /* ... */ } from '@nexcore/crm';
```

## Build

```bash
ng build crm
```

ng-packagr emits the packaged library to `dist/crm`.

## Unit tests

```bash
ng test crm
```

Tests run on [Vitest](https://vitest.dev/) (jsdom environment) via the `@angular/build:unit-test` builder.
