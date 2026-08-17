# @nexcore/restaurant

The Restaurant app: floor plan, order terminal, kitchen display, menus, recipes, reservations,
staff and reporting.

Three screens carry the app and everything else is back office:

| Screen | Route | Who uses it |
|---|---|---|
| **Floor Plan** | `/restaurant/floor` | Host and manager — the live room |
| **Order Terminal** | `/restaurant/order` | Waiters — the order pad and the bill |
| **Kitchen Display** | `/restaurant/kitchen` | Chefs — tickets, courses, bump |

See `docs/restaurant-app.md` at the repository root for the full feature specification.

## Conventions

- Prices, taxes, service charges and splits are **always computed server-side**. Screens display
  what the API returns; they never calculate money.
- Every page uses the shared design tokens from `styles.css` — no bespoke restaurant palette, and
  all five themes must work.
- Operational screens (floor, order, kitchen) are touch-first: 44px minimum targets, no
  hover-only affordances.
