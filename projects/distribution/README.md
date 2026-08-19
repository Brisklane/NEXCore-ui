# @nexcore/distribution

Route-to-market for companies that sell through a channel: field force, journey planning, van
sales, trade schemes, claims, route settlement and secondary sales.

The full feature specification lives in [`docs/distribution-app.md`](../../../docs/distribution-app.md).

## What this app owns, and what it does not

Distribution owns the **second tier** — the leg from a distributor out to ten thousand shops,
which is where the meaningful numbers in a channel business live. It does not own items, stock
ledgers, warehouses or bins: those stay in Inventory and are referenced here by id only. Every
physical movement Distribution causes is posted back to Inventory through shared-kernel events,
and every invoice it produces posts to Accounting the same way.

| Concern | Owner |
| --- | --- |
| Item master, batches, warehouses, bins, stock ledger | Inventory |
| Customers as accounting entities, invoices, credit notes | Sales / Accounting |
| Outlets, routes, beats, journey plans, field days, visits | **Distribution** |
| Van stock as a moving warehouse, load sheets, van counts | **Distribution** |
| Trade schemes, claims, secondary sales, route settlement | **Distribution** |

## Layout

```
src/lib/
  models/         enums and DTOs mirroring the Distribution API
  services/       one injectable per API area, plus the territory scope service
  pages/
    shared/       page help, validation, scope bar, order sheet, collection sheet, UI kit
    <screen>/     ts + html + css per screen
  distribution.routes.ts
```

Every screen imports `../distribution-shared.css` first and its own stylesheet second. Only
platform design tokens are used, so all five themes work without a second stylesheet.

## Conventions worth knowing

- **Money is never calculated in the browser.** Prices, scheme benefits, credit decisions and
  settlement totals all come from the server. The order sheet re-quotes on every quantity change
  rather than adding up line totals locally.
- **Status is never colour alone.** Every pill carries a word; colour is a second channel.
- **Field screens are touch-first.** 48px targets, no hover-only affordances, one column.
- **Reasons are mandatory where they are useful.** A no-order call, a short pick, a stock
  variance, a failed delivery and a cash difference all require a reason code, because the reason
  is the data and the number on its own is not.
- **Idempotency keys** are minted client-side for anything a rep might double-tap on a flaky
  connection: orders, check-ins, collections, day starts.

## Running it

The library is built as part of the workspace app:

```
ng build nexcore
ng serve nexcore
```

The app mounts at `/distribution` behind `appInstalledGuard`, so it only appears for companies
that have the Distribution app installed.
