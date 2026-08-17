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
 * Help copy for every Restaurant screen, in one place.
 *
 * Central rather than inline so the whole product's guidance can be read and edited as a set —
 * it is much easier to keep fifteen explanations consistent in tone when they sit next to each
 * other than when they are scattered across fifteen templates.
 */
export const RESTAURANT_HELP: Record<string, HelpCopy> = {
  dashboard: {
    what: 'Your restaurant at a glance — today\'s trading, and anything that needs you in the next five minutes.',
    steps: [
      'The "Right now" tiles are live. A red tile means someone should act — an overdue kitchen ticket, a table nobody has been to.',
      'Click any tile to jump straight to the screen that fixes it.',
      'Today\'s figures below compare against yesterday, so a bad night is obvious before it ends.',
    ],
    note: 'Refreshes itself every minute, so it can be left on a back-office screen all service.',
  },

  floor: {
    what: 'The live room. Every table shows what state it is in, who is serving it, and how long it has been that way.',
    steps: [
      'Tap a free table to seat guests — it opens the order at the same time.',
      'Tap a busy table for its actions: open the order, move the party, join tables, assign a server, mark it for clearing.',
      'A flashing red badge means the table has waited too long in one state — seated with no order, or served with no bill.',
    ],
    note: 'Table state is shown by colour and by a written label, so it stays readable on any screen.',
  },

  order: {
    what: 'The waiter\'s screen: the menu on the left, the running check on the right.',
    steps: [
      'Tap a dish to add it. Dishes with sizes or choices open a panel; simple ones go straight on.',
      'Use the seat bar to attribute lines to a guest — that is what makes splitting the bill by seat exact later.',
      'Hold a course to keep it back from the kitchen, then Fire when the table is ready for it.',
      'Bill produces the check, where you can split it and take payment.',
    ],
    note: 'Every price comes from the server, including happy hour. Nothing on this screen calculates money.',
  },

  kitchen: {
    what: 'The kitchen display. One card per ticket, oldest and priority first.',
    steps: [
      'Pick your station at the top. "Everything" is the pass view — it shows every station\'s work for a table.',
      'Tap a dish to mark it ready. Tap Bump when the whole ticket leaves the pass.',
      'The "All day" strip counts what is still outstanding across every ticket, for batching.',
    ],
    note: 'Late tickets change colour, gain a heavier border, and say LATE — never colour alone.',
  },

  orders: {
    what: 'Every order and the bills raised against it — the manager\'s view, not the waiter\'s.',
    steps: [
      'Filter by date, status or search for an order number, table or customer.',
      'View shows the full order, its checks, the payments taken and the timeline.',
      'Open in the terminal picks an order back up on the waiter\'s screen.',
    ],
  },

  reservations: {
    what: 'Bookings, the walk-in queue and the guest book — everything a host works from.',
    steps: [
      'New booking: fill in the party, then "Which tables are free?" offers the tables that actually fit at that time.',
      'Seat moves a booking or a waiting party onto a table and opens their order.',
      'The waitlist quotes a wait automatically from the queue and how fast tables are turning.',
    ],
    note: 'A booking holds its table for its whole duration, so two parties can never be double-booked.',
  },

  menu: {
    what: 'Menus, categories, dishes, modifier groups, combos and what is off the menu today.',
    steps: [
      'Dishes is where you spend most time — price, cost, station, allergens and dietary tags.',
      'Modifier groups ("Choose your crust", "Add toppings") are shared, so editing one reaches every dish that uses it.',
      'The 86 tab is what the kitchen touches when something runs out — it greys the dish out on every order pad instantly.',
    ],
    note: 'Fill in cost as well as price. Every margin and menu-engineering report depends on it.',
  },

  recipes: {
    what: 'What each dish is made of, what that costs, and what got thrown away.',
    steps: [
      'Add a recipe, then a line per ingredient with its quantity, yield and waste.',
      'Yield is the usable share after trimming; waste is what gets lost in preparation. Both push the true cost up.',
      'Saving re-costs the recipe and pushes the figure onto the dish automatically.',
    ],
    note: 'Map ingredients to inventory items and closing a check will deplete stock by itself.',
  },

  stations: {
    what: 'Kitchen stations, the rules that route dishes to them, and the printers behind them.',
    steps: [
      'Add a station per section of the kitchen, and mark exactly one as the pass.',
      'Routing rules decide where a dish appears. A rule naming a dish beats one naming its category, which beats the catch-all.',
      'The rules table is shown in the order the router actually evaluates them.',
    ],
    note: 'Set each station\'s SLA — it is what turns a ticket red on the kitchen screen.',
  },

  compliance: {
    what: 'Food safety: temperature logs, checklists and prep labels — the record an inspector asks for.',
    steps: [
      'Today shows what is due now. Log a reading, or run a checklist.',
      'A reading outside the safe range asks what you did about it before it will save.',
      'Prep labels give each batch a code and a use-by, so the kitchen can see what is still good.',
    ],
    note: 'A failed critical check cannot be signed off until an action is recorded against it.',
  },

  sessions: {
    what: 'The cash drawer: opening float, movements during service, and the X/Z reads that close the day.',
    steps: [
      'Open a session with a float before taking payments — every tender is stamped with it.',
      'Cash in / out records anything that is not a sale: drops, payouts, petty cash.',
      'Close & count asks for the drawer count, then produces the Z-read.',
    ],
    note: 'With blind close on, the expected total is hidden until you have counted. That is the point of it.',
  },

  reports: {
    what: 'Sales, menu engineering, servers, tables, kitchen and leakage over any date range.',
    steps: [
      'Menu engineering is the one to read first — it labels every dish Star, Plowhorse, Puzzle or Dog with a next step.',
      'Voids & discounts puts both on one screen, because leakage rarely shows up in only one.',
      'Reports read from settled checks, so an open table is never counted as revenue.',
    ],
  },

  staff: {
    what: 'People, till PINs, the weekly roster and tip pooling.',
    steps: [
      'Add each person, set what they may do on the till, then give them a PIN.',
      'The roster is a week at a time — click a blank cell to add a shift.',
      'A tip pool gathers a period\'s tips and splits them by hours, sales or an equal share.',
    ],
    note: 'PINs are hashed and never shown again. If somebody forgets theirs, set a new one.',
  },

  layout: {
    what: 'Draw your room. What you build here is exactly what the host sees on the floor plan.',
    steps: [
      'Create a floor, then add tables and drag them where they sit in the real room.',
      'Click a table to change its number, seats, shape and section.',
      'Fixtures — walls, the bar, the pass — are decoration that make the plan readable.',
    ],
    note: 'Everything saves in one go. A table with guests on it can be moved but not removed.',
  },

  settings: {
    what: 'Everything you configure once: how service behaves, how money is handled, outlets, reason codes and delivery zones.',
    steps: [
      'Service controls the timers that flag a neglected table on the floor plan.',
      'Money covers tips, rounding, tax handling and the threshold above which a discount needs a manager.',
      'Reason codes are what make the voids and discounts report mean anything — keep them specific.',
    ],
    note: 'Delivery zones are enforced. An address outside every zone is refused when the order is taken.',
  },
};

/**
 * A dismissible "what is this screen" box.
 *
 * Shown expanded the first time somebody opens a page and collapsed to a single line after they
 * dismiss it — a new user gets the explanation without an experienced one having to scroll past
 * it every shift. The choice is remembered per screen, per browser.
 */
@Component({
  standalone: true,
  selector: 'rst-help',
  imports: [CommonModule],
  template: `
    @if (copy) {
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
      font-size: 12.5px; font-weight: 600; cursor: pointer;
    }
    .hb-reopen:hover { border-color: var(--accent, #2b7fff); color: var(--accent, #2b7fff); }
    .hb-reopen:focus-visible { outline: none; box-shadow: var(--focus-ring); }
    .hb-reopen .material-symbols-outlined { font-size: 17px; }
  `],
})
export class PageHelpComponent implements OnInit {
  /** Key into {@link RESTAURANT_HELP}. */
  @Input({ required: true }) key = '';

  /** Overrides the default heading. */
  @Input() title = '';

  readonly open = signal(true);
  copy?: HelpCopy;

  private get storageKey(): string { return `nexcore.restaurant.help.${this.key}`; }

  ngOnInit(): void {
    this.copy = RESTAURANT_HELP[this.key];

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
