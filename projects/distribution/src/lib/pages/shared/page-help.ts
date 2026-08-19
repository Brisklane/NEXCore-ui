import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface HelpCopy {
  /** One sentence: what this screen is for. */
  what: string;
  /** How it is actually used, in the order a person does it. */
  steps: string[];
  /** The thing people get wrong, or the rule the screen quietly enforces. */
  note?: string;
}

/**
 * Help copy for every Distribution screen, in one place.
 *
 * Central rather than inline so the whole product's guidance can be read and edited as a set — it
 * is much easier to keep thirty explanations consistent in tone when they sit next to each other
 * than when they are scattered across thirty templates.
 */
export const DISTRIBUTION_HELP: Record<string, HelpCopy> = {
  dashboard: {
    what: 'The distribution business on one screen — today\'s secondary sales, coverage and the exceptions that are costing you money right now.',
    steps: [
      'Pick a territory at the top; everything below narrows to it.',
      'The top row is today against the same day last week, so a bad day is obvious before it ends.',
      'The exception queue on the right is ranked by money at risk, not by age. Click any row to go straight to the screen that clears it.',
    ],
    note: 'Refreshes every two minutes and pushes live changes over the hub, so it can sit on a wall screen all day.',
  },

  terminal: {
    what: 'The field rep\'s day: start of day, the beat in order, and every visit from check-in to the order.',
    steps: [
      'Start the day — that stamps your opening odometer and, for a van, opens the load.',
      'Work the beat top to bottom. The next call is always the big card at the top.',
      'Check in at the outlet, do what the visit asks (stock check, order, collection, audit), then check out.',
      'Close the day when the beat is done. Anything unfinished has to be given a reason first.',
    ],
    note: 'It works with no signal — everything queues on the device and syncs when a connection comes back. A check-in outside the outlet\'s geofence is allowed, but it is recorded and needs a reason.',
  },

  journey: {
    what: 'The permanent journey plan (PJP): which rep is on which route on which day, for a whole cycle.',
    steps: [
      'Generate a cycle from the route\'s visit frequency, then adjust the exceptions by hand.',
      'Drag or edit a day to move a route, add a market working day, or mark a leave day.',
      'Publish when it is right. Reps only see published plans.',
    ],
    note: 'Coverage across the cycle is shown as you edit, so an outlet that would be visited zero times is caught before the plan reaches anybody.',
  },

  routes: {
    what: 'Routes and beats: the ordered list of outlets a rep walks, and who owns each territory.',
    steps: [
      'Pick a territory on the left to see its routes.',
      'Open a route to reorder its stops — drag a stop, or use the arrows. The sequence is what the rep\'s day follows.',
      'Add unrouted outlets from the panel at the bottom; a split makes two routes out of one that has grown too long.',
    ],
    note: 'Travel time between stops is an estimate from straight-line distance, not turn-by-turn routing — treat a long beat as a signal, not a schedule.',
  },

  outlets: {
    what: 'The retail universe: every shop you sell to, whoever services it.',
    steps: [
      'Search by name, phone or code. The filters narrow by channel, grade, route and status.',
      'Open an outlet for its full history — orders, visits, stock, credit and assets.',
      'New outlets captured in the field land here as pending; approve or reject them from the same list.',
    ],
    note: 'Possible duplicates are flagged on the row. Merging keeps the surviving outlet\'s id, so history is never orphaned.',
  },

  outlet360: {
    what: 'Everything known about one outlet, in the order somebody standing in front of it would want it.',
    steps: [
      'The header carries the decision-making facts: grade, route, credit position and last visit.',
      'The tabs below hold offtake, visits, orders, returns, assets, photos and notes.',
      'Actions in the header start an order, log a collection or open a service ticket without leaving the page.',
    ],
    note: 'Offtake is secondary sales — what this outlet actually sold, not what it bought.',
  },

  partners: {
    what: 'Channel partners: distributors, super-stockists, wholesalers and sub-dealers, and the tier structure between them.',
    steps: [
      'The tree shows who supplies whom. A partner\'s servicing model decides which screens apply to them.',
      'Open a partner for their territory, credit terms, documents and downstream network.',
      'Documents with an expiry are tracked — the list warns before a licence lapses.',
    ],
    note: 'Suspending a partner blocks new orders immediately but leaves open orders, claims and settlements intact.',
  },

  partner360: {
    what: 'One partner: their business with you, their downstream reach, and everything outstanding between you.',
    steps: [
      'Primary sales, secondary declarations and the gap between them sit at the top.',
      'Credit, claims and returns each have a tab with the open items and their age.',
      'Data quality shows how reliably this partner reports secondary sales — the number to fix before you trust their offtake.',
    ],
  },

  orders: {
    what: 'Every order in the pipe: captured in the field, taken on the phone, or uploaded by a partner.',
    steps: [
      'The tabs split by what has to happen next — needs approval, ready to allocate, ready to pick, blocked.',
      'Open an order to see its price and scheme workings line by line, including which rule won and why.',
      'Approve, hold or cancel from the list; bulk approve is available once a filter is applied.',
    ],
    note: 'Prices and scheme benefits are always computed on the server. Nothing on this screen calculates money.',
  },

  orderDetail: {
    what: 'One order, with the full audit trail: pricing, schemes, credit decision, allocation and fulfilment.',
    steps: [
      'The lines show list price, the applied price and the rule that produced it.',
      'Free goods appear as their own lines, marked with the scheme that generated them.',
      'The trail at the bottom records who did what, and when, in real time.',
    ],
    note: '"Why this price" opens the full ladder — every candidate that was considered and the one that won.',
  },

  dispatch: {
    what: 'The load and dispatch desk: what has to leave the warehouse today, and whether it can.',
    steps: [
      'Orders ready to go are grouped by route and by delivery date.',
      'Select a group and build a pick wave; the wave becomes tasks on the warehouse handhelds.',
      'Packed and staged loads move to a trip; a trip that is short a vehicle or a driver says so.',
    ],
    note: 'Live — carton scans in the warehouse update this screen without a refresh.',
  },

  waves: {
    what: 'Pick waves: the batched picking work in the warehouse, and how far each one has got.',
    steps: [
      'Open a wave to see its tasks and who is on them.',
      'A task shows its lines in pick-path order, with the batch the picker must take.',
      'Short picks are recorded against a reason and roll straight into the exception queue.',
    ],
    note: 'Batches are proposed FEFO — first to expire, first out — so nothing ages on a shelf while newer stock ships.',
  },

  vanSales: {
    what: 'Vans as moving warehouses: what is loaded, what has been sold from the van, and what comes back.',
    steps: [
      'Load a van against a plan or by hand; the load sheet needs approving before stock moves.',
      'During the day the balance is a projection of the movement ledger, so any number can be walked back to its transactions.',
      'Unload at the end of the day — that count is what the settlement is measured against.',
    ],
    note: 'Compartments matter: chilled and ambient stock are separate balances on the same van.',
  },

  trips: {
    what: 'Delivery trips: vehicle, driver, stops in order, and where each one has got to.',
    steps: [
      'Build a trip from staged loads, then sequence its stops.',
      'Start the trip with the odometer and fuel issued; every stop is timestamped from there.',
      'A failed stop needs a reason and, usually, a reschedule date.',
    ],
    note: 'Expenses recorded on the trip flow into route profitability, not just into a fuel total.',
  },

  pod: {
    what: 'Proof of delivery: what actually reached the outlet, signed for, with anything short or damaged recorded at the door.',
    steps: [
      'The queue holds PODs with a discrepancy, oldest first.',
      'Open one to compare dispatched against received, line by line.',
      'Resolve it by raising a return, a claim, or by accepting the difference with a reason.',
    ],
    note: 'A short delivery is worthless as data unless it is captured at the door — the driver\'s device forces the count before the signature.',
  },

  returns: {
    what: 'Returns from the trade: damages, expiries, recalls and plain refusals, from request to credit.',
    steps: [
      'Requests come from the field, the POD screen, or straight from a partner.',
      'Approve or reject; approved returns are expected at a warehouse and receipted there.',
      'Disposition each receipt — back to saleable, to quarantine, or to destruction — then raise the credit.',
    ],
    note: 'Destruction needs a witness and a certificate reference. Nothing goes back to saleable stock without an inspection record.',
  },

  schemes: {
    what: 'Trade schemes: the discounts, free goods and slabs that drive the trade, with budgets and caps.',
    steps: [
      'Build the scheme from a kind, a slab table, the products it applies to and the scope it runs in.',
      'Simulate before you launch — it replays the last period\'s real orders through the new rules.',
      'Approve and activate. Live schemes show spend against budget as it happens.',
    ],
    note: 'Stacking is explicit: exclusive schemes only win when they beat everything else combined. The calculation is deterministic, because a claim gets audited against it weeks later.',
  },

  pricing: {
    what: 'Price lists and the margin ladder: what each tier pays, and what each tier makes.',
    steps: [
      'Lists are scoped — company, channel, territory, tier, partner, contract, outlet — and the narrowest live list wins.',
      'The ladder shows factory price through to consumer MRP, with the margin at every hop.',
      'A list has to be approved before it can price anything.',
    ],
    note: 'Use "Test a price" to ask exactly what a given outlet would pay for a given item today, and see every candidate that was considered.',
  },

  claims: {
    what: 'Partner claims: scheme, damage, freight and rebate money owed back to the trade, and how fast you settle it.',
    steps: [
      'The queue is ordered by SLA — a claim that has waited too long is the first thing you see.',
      'Open a claim to compare what was claimed against what the system computed.',
      'Approve in full or in part, query it back for documents, or reject with a reason.',
    ],
    note: 'Settlement can be a credit note, a cash payment or an adjustment on the next invoice. Claim ageing is the single number distributors judge you on.',
  },

  credit: {
    what: 'Credit control and collections: exposure by partner and outlet, the ageing behind it, and money coming in.',
    steps: [
      'The ageing buckets across the top are clickable — each one filters the list below.',
      'A blocked account shows why, and who can override it.',
      'Collections are recorded here: cash, cheque, bank transfer or wallet, against specific invoices.',
    ],
    note: 'Money is recorded, never processed — no card details are accepted or stored anywhere in this app.',
  },

  settlement: {
    what: 'Route settlement: the end of a rep\'s or a driver\'s day, reconciled — stock out against stock back, sales against cash.',
    steps: [
      'The board lists days waiting to settle, oldest first.',
      'Open one to see both sides recomputed from source documents, with every variance itemised.',
      'Every variance needs a reason before the settlement can close.',
    ],
    note: 'Closing posts the day to accounting once and only once. A mistake is reversed with a counter-entry, never edited away.',
  },

  secondary: {
    what: 'Secondary sales: what your distributors actually sold onward, however it reaches you.',
    steps: [
      'Three ways in — a partner portal declaration, a file upload, or a direct feed.',
      'Uploads land in a staging batch. Anything that cannot be matched to a real outlet or item waits in the exception list.',
      'Resolve an exception once and the mapping profile learns it, so the same row matches next month.',
    ],
    note: 'Nothing posts until the batch is clean. Half-mapped secondary data is worse than none — it silently understates the market.',
  },

  targets: {
    what: 'Targets and incentives: what each rep, route and territory is carrying, and what they have earned.',
    steps: [
      'Set targets by metric and period, then break them down to route and rep.',
      'Pace shows whether they are on track for the period, not just what they have done.',
      'Incentive payouts are computed from the same numbers and need approving before they reach payroll.',
    ],
    note: 'A published target is frozen. Changing it after the period starts creates a revision, so the original commitment is still on the record.',
  },

  merchandising: {
    what: 'Retail execution: planogram audits, share of shelf, POSM placement and competitor activity.',
    steps: [
      'Audits and surveys captured in the field arrive here with their photos.',
      'Compliance is scored per outlet against the planogram it is meant to run.',
      'Competitor observations feed the intelligence view — pricing, new launches and visible activity.',
    ],
  },

  assets: {
    what: 'Assets in the trade: coolers, freezers, racks and branded units you own but do not hold.',
    steps: [
      'Every asset sits against an outlet with a serial and a condition.',
      'Verification is a field task — an asset unverified for too long is flagged.',
      'Moves, repairs and recoveries are all recorded against the same asset record.',
    ],
    note: 'An asset that has not been seen in a physical verification for a year is the usual way a cooler quietly disappears.',
  },

  planning: {
    what: 'Demand planning and replenishment: what the network will need, and where stock should move.',
    steps: [
      'Generate a forecast from history, targets or a blend, then override lines with a reason.',
      'Replenishment suggestions compare each stocking point against its norm.',
      'Turn suggestions into transfer requests; approving one hands it to Inventory to execute.',
    ],
    note: 'Overrides are kept alongside the statistical number, so forecast accuracy can be judged on both.',
  },

  traceability: {
    what: 'Batch, expiry, cold chain and recall — knowing exactly where a batch went and getting it back.',
    steps: [
      'Trace forward from a batch to every outlet that received it, or backwards from an outlet.',
      'Near-expiry stock is listed by remaining shelf life so it can be pushed or pulled in time.',
      'A recall turns the trace into notices, tracks returns against them, and closes with a report.',
    ],
    note: 'Cold-chain excursions are logged against the checkpoint and the affected stock value, so the loss is visible, not just the temperature.',
  },

  fleet: {
    what: 'Vehicles and drivers: what you run, who drives it, and what expires when.',
    steps: [
      'Each vehicle carries its compliance documents with their expiry dates.',
      'Drivers carry licence and training records on the same basis.',
      'The warning list at the top is anything expiring in the next month.',
    ],
    note: 'A vehicle with expired compliance cannot be put on a trip — the trip builder will not offer it.',
  },

  team: {
    what: 'Field team and devices: who is out there, what they carry, and whether their device is trusted.',
    steps: [
      'Reps are created here and given a PIN for the field terminal.',
      'Devices bind to a rep on first login; a lost device is blocked or wiped from this screen.',
      'Last-sync time tells you who has been offline longer than they should be.',
    ],
    note: 'Blocking a device is immediate. Wiping it clears the queued offline data too, so use it only when the device is genuinely gone.',
  },

  reports: {
    what: 'The analytical set: sales, coverage and productivity, logistics, receivables, returns, claims and stock.',
    steps: [
      'Pick a report, then set the period and scope once — it applies across the tabs.',
      'Every table can be grouped differently without re-running the query.',
      'Export takes the current view, filters and all.',
    ],
    note: 'Coverage numbers here are the standard trade definitions: outlets billed over outlets covered, lines per call, drop size.',
  },

  settings: {
    what: 'How this app behaves for your company: numbering, tolerances, SLAs, reason codes and approval thresholds.',
    steps: [
      'Reason codes are grouped by where they appear — a reason for a failed delivery is not a reason for a returned case.',
      'Tolerances decide when a variance is an exception rather than rounding.',
      'Approval thresholds decide which orders, claims and settlements need a second pair of eyes.',
    ],
    note: 'Changing a tolerance does not re-open settled work. It applies from the next document.',
  },
};

/**
 * A dismissible explanation at the top of a screen.
 *
 * Dismissal is remembered per screen, so an experienced user sees it once and a new one can bring
 * it back. It is a `<aside role="note">` rather than a tooltip because guidance that disappears
 * when the pointer moves is guidance nobody can read twice.
 */
@Component({
  standalone: true,
  selector: 'dst-help',
  imports: [CommonModule],
  template: `
    @if (copy; as copy) {
      @if (open()) {
        <aside class="hb" role="note" [attr.aria-labelledby]="'hb-' + key">
          <div class="hb-head">
            <span class="material-symbols-outlined hb-icon">help</span>
            <h3 class="hb-title" [id]="'hb-' + key">{{ title || 'About this screen' }}</h3>
            <button type="button" class="hb-close" (click)="dismiss()" aria-label="Hide this help">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <p class="hb-what">{{ copy.what }}</p>

          <ol class="hb-steps">
            @for (s of copy.steps; track s) { <li>{{ s }}</li> }
          </ol>

          @if (copy.note) {
            <p class="hb-note">
              <span class="material-symbols-outlined">lightbulb</span>{{ copy.note }}
            </p>
          }
        </aside>
      } @else {
        <button type="button" class="hb-reopen" (click)="reopen()">
          <span class="material-symbols-outlined">help</span>
          What is this screen for?
        </button>
      }
    }
  `,
  styles: [`
    .hb {
      position: relative;
      margin-bottom: 18px;
      padding: 16px 18px;
      border-radius: 14px;
      background: var(--accent-softer, rgba(43, 127, 255, .06));
      border: 1px solid var(--accent-border, rgba(43, 127, 255, .3));
    }
    .hb-head { display: flex; align-items: center; gap: 9px; margin-bottom: 8px; }
    .hb-icon { font-size: 20px; color: var(--accent, #2b7fff); }
    .hb-title {
      flex: 1; margin: 0; font-size: 13.5px; font-weight: 750;
      color: var(--text-heading, #0f172a);
    }
    .hb-close {
      width: 30px; height: 30px; border: none; border-radius: 8px; background: transparent;
      color: var(--text-muted, #94a3b8); cursor: pointer; display: grid; place-items: center;
    }
    .hb-close:hover { background: var(--bg-hover, rgba(15,23,42,.05)); color: var(--text-heading, #0f172a); }
    .hb-close:focus-visible { outline: none; box-shadow: var(--focus-ring); }
    .hb-close .material-symbols-outlined { font-size: 17px; }
    .hb-what {
      margin: 0 0 10px; font-size: 13.5px; line-height: 1.6;
      color: var(--text-primary, #1e293b); max-width: 88ch;
    }
    .hb-steps { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 5px; }
    .hb-steps li {
      font-size: 12.5px; line-height: 1.6; color: var(--text-secondary, #64748b); max-width: 88ch;
    }
    .hb-note {
      display: flex; align-items: flex-start; gap: 7px;
      margin: 12px 0 0; padding-top: 11px;
      border-top: 1px solid var(--accent-border, rgba(43, 127, 255, .25));
      font-size: 12.5px; line-height: 1.55; color: var(--text-secondary, #64748b); max-width: 88ch;
    }
    .hb-note .material-symbols-outlined { font-size: 16px; color: var(--warning, #f59e0b); flex-shrink: 0; }
    .hb-reopen {
      display: inline-flex; align-items: center; gap: 7px;
      margin-bottom: 14px; padding: 7px 13px; min-height: 36px;
      border-radius: 999px; border: 1px dashed var(--border-strong, #cbd5e1);
      background: transparent; color: var(--text-secondary, #64748b);
      font-size: 12.5px; font-weight: 600; cursor: pointer; font-family: inherit;
    }
    .hb-reopen:hover { border-color: var(--accent, #2b7fff); color: var(--accent, #2b7fff); }
    .hb-reopen:focus-visible { outline: none; box-shadow: var(--focus-ring); }
    .hb-reopen .material-symbols-outlined { font-size: 17px; }
  `],
})
export class PageHelpComponent implements OnInit {
  /** Key into {@link DISTRIBUTION_HELP}. */
  @Input({ required: true }) key = '';

  /** Overrides the default heading. */
  @Input() title = '';

  readonly open = signal(true);
  copy?: HelpCopy;

  private get storageKey(): string { return `nexcore.distribution.help.${this.key}`; }

  ngOnInit(): void {
    this.copy = DISTRIBUTION_HELP[this.key];

    try {
      this.open.set(localStorage.getItem(this.storageKey) !== 'hidden');
    } catch {
      // Blocked storage just means the box stays open — never a reason to fail.
    }
  }

  dismiss(): void {
    this.open.set(false);
    try { localStorage.setItem(this.storageKey, 'hidden'); } catch { /* ignore */ }
  }

  reopen(): void {
    this.open.set(true);
    try { localStorage.removeItem(this.storageKey); } catch { /* ignore */ }
  }
}
