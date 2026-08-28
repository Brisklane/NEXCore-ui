import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface HelpCopy {
  /** One sentence: what this screen is for. */
  what: string;
  /** How it is actually used, in the order somebody does it. */
  steps: string[];
  /** The thing people get wrong, or the rule the screen quietly enforces. */
  note?: string;
}

/**
 * Help copy for every Real Estate screen, in one place.
 *
 * Central rather than inline, so the whole product's guidance can be read and edited as a set —
 * it is far easier to keep a hundred explanations consistent in tone when they sit next to each
 * other than when they are scattered across a hundred templates.
 *
 * The rule for writing these: say what the screen is for, then what somebody does on it, then the
 * one thing that catches people out. Never describe the interface — a person can see the buttons.
 */
export const REALESTATE_HELP: Record<string, HelpCopy> = {
  dashboard: {
    what: 'Your business at a glance — what is selling, what is owed, what is being built, and the handful of things that need somebody today.',
    steps: [
      'The "Needs attention" list is ordered by what costs most if ignored, not by how many there are.',
      'Every item links straight to the screen that fixes it.',
      'The figures below only show the lines of business you actually run — an agency never sees escrow, a plot developer never sees a rent roll.',
    ],
    note: 'Collection efficiency is measured against what was demanded this month, not against everything ever owed. The second number would flatter a bad month and hide a good one.',
  },

  portfolio: {
    what: 'Every project side by side: what has sold, what has been collected, how far along the building is, and whether it is running late.',
    steps: [
      'A slip is shown only when a project is running behind. A project running early is not news.',
      'Absorption is booked and sold over total saleable units — the number a land buyer asks for.',
      'Click any project to open it.',
    ],
  },

  reports: {
    what: 'Every report this business can run, filtered to the lines of business it operates.',
    steps: [
      'Pick a report, set the period and any filters, and run it.',
      'Results carry their own totals, so what is on screen is what is in the exported file.',
      'Reports are capped at five thousand rows — beyond that you want a file, not a screen, and the cap is reported rather than silently applied.',
    ],
  },

  properties: {
    what: 'The property register: the physical thing, permanent and re-used, outliving every listing it was ever advertised under.',
    steps: [
      'Search by reference, address or unit number.',
      'Before saving a new one, the duplicate check looks for a property already on file that this might be.',
      'Status changes are recorded with a reason, because "why is this off the market?" is asked constantly.',
    ],
    note: 'Re-pricing lives on the unit, not here. A property record must never be able to rewrite a signed cost sheet.',
  },

  parcels: {
    what: 'Land parcels, their chain of title, what is charged against them and where the verification got to.',
    steps: [
      'The title chain is append-only. A link once recorded is never edited — that is the whole point of a chain.',
      'Encumbrances block anything downstream until they are released.',
      'Verification items are the searches and enquiries somebody actually has to go and do.',
    ],
  },

  acquisitions: {
    what: 'Land being bought: what stage it is at, what has been paid, and what it has cost in total.',
    steps: [
      'Each stage carries its own approval, so nobody commits money before the stage before it cleared.',
      'Cost lines capture everything, not just the price — duty, brokerage, mutation, legal.',
    ],
  },

  projects: {
    what: 'Schemes under development: their structure, milestones, budget and cash flow.',
    steps: [
      'The structure is blocks, floors and units. Generating units creates them in one pass, numbered to the scheme convention.',
      'Milestones carry weights that add to a hundred — the escrow entitlement and every progress figure are computed from exactly these.',
      'Certifying a milestone raises the linked instalment to every buyer at once, so it gates on the milestones before it.',
    ],
  },

  inventory: {
    what: 'The board. Every unit in the scheme, what state it is in, and what it costs.',
    steps: [
      'Click a unit to see its cost sheet, hold it, or start a booking.',
      'A hold is a real record with an owner and an expiry, not a colour on a grid. Anything longer than the configured limit needs an approval.',
      'A pulsing border means the hold is nearly up.',
    ],
    note: 'Two people can be looking at this board at once, so it updates live. Every state carries a letter as well as a colour — roughly one man in twelve cannot tell the red from the green.',
  },

  holds: {
    what: 'Every unit currently off the board, who is holding it and when it lapses.',
    steps: [
      'Convert it to a booking, or release it so somebody else can sell it.',
      'Expired holds are swept automatically, but the sweep can be run by hand at any time.',
    ],
  },

  pricing: {
    what: 'Price lists and the premiums that sit on top of them.',
    steps: [
      'Build a list, then publish it. A published list is never edited afterwards — that is what makes an old cost sheet reproducible.',
      'Applying a list re-prices what is still available. Sold and booked units keep the price they were sold at.',
    ],
  },

  listings: {
    what: 'What is on the market, where it is advertised and how it is performing.',
    steps: [
      'The readiness check tells you exactly what is missing before a listing can go out — photographs, energy rating, permit number.',
      'Price changes record what the price was, so the history reads honestly.',
      'Publishing pushes to every mapped portal and reports each one back separately.',
    ],
  },

  instructions: {
    what: 'What the vendor or landlord actually signed: the fee, the term and the basis.',
    steps: [
      'The fee on every deal comes from here rather than from a house default, so a vendor is never billed the wrong amount.',
      'Ending an instruction needs a reason — it is the beginning of most fee disputes.',
    ],
  },

  'my-day': {
    what: 'Everything one person has to do today, in the order it has to happen.',
    steps: [
      'Viewings and site visits first, because they have times attached.',
      'Then callbacks and promises, ordered by how long somebody has been waiting.',
      'Anything past its promised response time is at the top, in red.',
    ],
  },

  contacts: {
    what: 'Everybody this business deals with: buyers, sellers, tenants, landlords, contractors and partners.',
    steps: [
      'One person, one record, however many roles they hold.',
      'The duplicate check runs before saving. A customer whose payments are split across two records cannot be shown a statement.',
      'Merging folds one record into another and moves everything across.',
    ],
  },

  kyc: {
    what: 'Identity and source-of-funds checks waiting on a decision.',
    steps: [
      'Every document is either verified, rejected with a reason, or waived with an approval.',
      'A booking cannot complete while KYC is outstanding, if the setting requires it.',
    ],
  },

  'caution-list': {
    what: 'People this business will not take new business from, and why.',
    steps: [
      'Every entry carries the reason and the evidence, and is approved by somebody senior.',
      'Entries expire unless renewed, so nobody stays on a list forever by accident.',
    ],
  },

  enquiries: {
    what: 'Every lead, what stage it is at, and how long it has been waiting.',
    steps: [
      'Anything not yet answered is at the top. The clock starts when the enquiry arrived, not when somebody opened it.',
      'Routing hands out anything unassigned by the office rules.',
      'Losing an enquiry needs a reason — it is the only way anybody finds out why.',
    ],
    note: 'A lead answered in five minutes converts several times better than one answered in an hour. Nothing else on this screen matters as much as the response time.',
  },

  viewings: {
    what: 'Viewings booked, done and missed, with the feedback from each.',
    steps: [
      'Feedback is captured against the viewing, then shared with the vendor as a separate step — some of it needs a conversation first.',
      'Access arrangements and keys are on the viewing, so nobody arrives without them.',
    ],
  },

  'site-visits': {
    what: 'Site visits to a scheme: who came, who brought them, and what happened.',
    steps: [
      'A visit brought by a channel partner counts towards their registration.',
      'Recording which units were shown is what makes the conversion figures mean anything.',
    ],
  },

  bookings: {
    what: 'Every booking on every scheme, with its money position.',
    steps: [
      'Search by reference, customer or unit.',
      'The presets are the lists somebody actually works: overdue, defaulting, awaiting agreement, ready for possession.',
      'Click through for the full statement, schedule and history.',
    ],
  },

  'new-booking': {
    what: 'Taking a booking: pick the unit, agree the price, choose the plan, and see exactly what the customer will owe and when.',
    steps: [
      'The preview shows the whole cost sheet and every gate the booking would have to clear, without writing anything.',
      'A discount beyond your authority raises an approval rather than silently failing.',
      'Committing re-checks everything the preview checked — what you were shown is what you get.',
    ],
  },

  'money/demands': {
    what: 'Instalments raised against buyers, and whether they have been sent.',
    steps: [
      'Run demands for a milestone or a date, and preview what would be raised before committing.',
      'Sending records the channel, so "we never received it" has an answer.',
    ],
  },

  'money/receipts': {
    what: 'Money in. Every receipt, what it was allocated against, and what is still unallocated.',
    steps: [
      'The preview shows where each unit of currency will land before anything is posted.',
      'Allocation follows the declared order — surcharge first, then oldest — unless somebody deliberately reallocates.',
      'Reallocating needs a reason. It moves money between a customer’s own buckets and somebody will ask why.',
    ],
  },

  'money/collections': {
    what: 'The worklist: who to chase today, in the order that will recover the most.',
    steps: [
      'Sorted by exposure and by how long it has been outstanding, not alphabetically.',
      'Record a promise to pay and the case pauses until the promised date.',
      'A promise that is broken puts the case straight back at the top.',
    ],
  },

  'money/dunning': {
    what: 'Cases climbing the escalation ladder, and where each one has got to.',
    steps: [
      'Each step has its own action, channel and wait.',
      'Suspending a case needs a reason — a suspended case is a case nobody is chasing.',
    ],
  },

  'money/cheques': {
    what: 'Post-dated cheques on hand, deposited, cleared and bounced.',
    steps: [
      'The maturity calendar shows what falls due when, so nothing is banked late or early.',
      'A bounce starts the statutory clock. Every day it sits unactioned is a day of notice period lost.',
    ],
  },

  'exit/cancellations': {
    what: 'Bookings being cancelled, what is deducted and what comes back.',
    steps: [
      'The preview is built by the same arithmetic as the commitment, so what a customer was shown is what they get.',
      'Deductions follow the policy slab for how far into the plan they got.',
      'The unit returns to inventory only once the cancellation is approved.',
    ],
  },

  'exit/transfers': {
    what: 'A file or unit changing hands, and the four gates it has to clear first.',
    steps: [
      'Dues, litigation, documents and identity. Each one names what is missing and where to fix it.',
      'Overriding the dues gate needs an approval and a reason, and is recorded as high risk.',
      'Completion writes a new link on the ownership chain. Nothing is ever overwritten.',
    ],
    note: 'This is the control everybody tries to go round, and a file transferred to the wrong person cannot be put back.',
  },

  'exit/possession': {
    what: 'Units ready to hand over, and what is stopping the ones that are not.',
    steps: [
      'The checklist is evaluated live: dues, occupancy certificate, snagging, documents.',
      'Overriding an item needs a reason, recorded against your name.',
      'Offering possession starts the delay-compensation clock, where the scheme has one.',
    ],
  },

  'exit/snagging': {
    what: 'Defects found at handover, who is fixing them, and what is still open.',
    steps: [
      'A critical snag blocks possession. A major one does not, but it is tracked to closure.',
      'Inspections can be recorded on a tablet with no signal and synchronised later.',
      'Photographs go on the snag, not in somebody’s phone.',
    ],
  },

  'exit/nocs': {
    what: 'No-objection certificates requested, issued and revoked.',
    steps: [
      'A NOC will not issue while dues are outstanding unless somebody overrides it with an approval.',
      'Each one carries a verification code, so the holder’s copy can be checked against what was actually issued.',
    ],
  },

  'brokerage/deals': {
    what: 'Sales agreed but not yet completed, and how long each has been stuck.',
    steps: [
      'Sorted by how long since anything moved, not by when it was agreed. The stuck ones are the ones needing a telephone call.',
      'The checklist is the product here — every step has an owner, a due date and whether it blocks.',
      'A deal that collapses is recorded with its cause. That is the only way anybody learns.',
    ],
    note: 'Somewhere between a quarter and a third of agreed sales fall through, almost always for reasons that were visible weeks earlier.',
  },

  'brokerage/chains': {
    what: 'Chains, who is in them, and which link is holding everything up.',
    steps: [
      'Links you own show their real progress. Links you do not are a name and a telephone number, which is all a chain ever gives.',
      'A break marks the position it broke at, so everybody affected can be told at once.',
    ],
  },

  'brokerage/commission': {
    what: 'Fees earned, split, deducted and paid.',
    steps: [
      'Every calculation shows its own workings: which plan, which tier, what the cap did, and what each deduction was for.',
      'Nothing is disbursed until the fee has actually been received.',
      'A cancellation claws back what was paid, not what was accrued.',
    ],
    note: 'Staff check this arithmetic every month, and one of them will eventually be right about something. That is why the trace is shown.',
  },

  'brokerage/partners': {
    what: 'The channel partner network: who sells for you, what they have brought, and what they are owed.',
    steps: [
      'A partner cannot be activated until their mandatory documents are verified and their licence is current.',
      'Authorisations control which projects they can sell and whether they see prices.',
    ],
  },

  'brokerage/registrations': {
    what: 'Leads registered by partners, and who owns each one.',
    steps: [
      'A registration claims a buyer for a fixed window. If the same person walks into the sales office next week, the commission still belongs to the partner who found them.',
      'Conflicts are refused outright, with the competing partner named.',
      'Two extensions, then it lapses.',
    ],
    note: 'Get this wrong and partners stop bringing buyers, which is the only thing they are for.',
  },

  'leasing/tenancies': {
    what: 'Every tenancy, its rent, its term and its arrears.',
    steps: [
      'The presets are the lists a property manager works: in arrears, ending soon, on notice.',
      'Every frequency is normalised to a month so the rent roll is one comparable number.',
    ],
  },

  'leasing/deposits': {
    what: 'Deposits taken, protected and returned.',
    steps: [
      'Protection has a hard deadline from the day the money was taken, and missing it costs a multiple of the deposit.',
      'Deductions are proposed, then agreed, then released — never simply taken.',
    ],
  },

  'leasing/rent-roll': {
    what: 'What is being collected, from whom, and what is missing.',
    steps: [
      'Every rent is annualised so a weekly and a quarterly tenancy can be compared.',
      'Arrears are shown against the tenancy, not the property — the same flat can have two different tenants owing.',
    ],
  },

  'leasing/service-charge': {
    what: 'Budgeted, invoiced, reconciled and recovered.',
    steps: [
      'On-account demands go out against the budget, then the year-end reconciliation settles the difference.',
      'The reconciliation applies exclusions, then gross-up, then caps — in that order, because that is the order the lease reads.',
      'Under-recovery is measured against actual cost, which is the number a landlord cares about.',
    ],
  },

  'leasing/client-money': {
    what: 'Money held on behalf of clients, reconciled three ways.',
    steps: [
      'Bank balance, ledger control account, and the sum of what every client is owed. All three have to agree.',
      'An unbalanced reconciliation cannot be signed off.',
      'The person who prepared it cannot be the person who signs it.',
    ],
    note: 'Client money that will not reconcile is the one finding that closes an agency down.',
  },

  gate: {
    what: 'Who is in the community right now, and everything that has come through today.',
    steps: [
      'Scan a pass, or record an entry by hand. A pre-approved visitor goes straight through.',
      'A guard can let somebody in without approval, but has to say why, and it is recorded.',
      'Entries recorded while the tablet had no signal are replayed when it comes back.',
    ],
    note: 'The first question after any incident is who was inside. That is why this screen exists.',
  },

  complaints: {
    what: 'What residents have reported, who is on it, and what is past its response time.',
    steps: [
      'Emergencies are things like no water, no power, or a lift with somebody in it. They are at the top, always.',
      'Every update is either visible to the resident or internal — decide which as you write it.',
      'Breached tickets escalate automatically.',
    ],
  },

  'facility/work-orders': {
    what: 'Repairs raised, assigned, authorised and done.',
    steps: [
      'Spend above the landlord’s repair limit needs authorising. Below it, no approval — asking a landlord to sign off a washer costs more than the washer.',
      'Who bears the cost is recorded on the order, because it decides who gets invoiced.',
    ],
  },

  'facility/meters': {
    what: 'Meters, their readings, and what the consumption actually was.',
    steps: [
      'The round shows the meters in walking order with the last reading to compare against.',
      'A reading that looks impossible is flagged and does not advance the meter.',
      'Bulk supply against the sum of the sub-meters shows theft and leakage separately from common-area use.',
    ],
    note: 'A bad reading accepted silently corrupts the next twelve bills, and by then the money has been collected.',
  },

  construction: {
    what: 'Sites under construction: the programme, the cost and what is holding them up.',
    steps: [
      'Progress is measured against the bill of quantities, so every quantity traces to a priced line.',
      'The critical path is recalculated on demand rather than assumed.',
    ],
  },

  'build/certificates': {
    what: 'Interim payment certificates: what a contractor gets paid, and every deduction on it.',
    steps: [
      'Built in the order the contract reads — gross value to date, less previously certified, less retention to its cap, less advance recovery, less contra-charges.',
      'The workings are shown in words next to the figure.',
    ],
    note: 'This is the most consequential arithmetic in the application, and every line of it is a conversation. A certificate a quantity surveyor cannot follow is one that gets disputed.',
  },

  'build/variations': {
    what: 'Changes to the works: what they cost, what time they add, and who approved them.',
    steps: [
      'A variation approved is written into the current bill of quantities, with omissions as negative quantities.',
      'Time impact is recorded separately from cost — a variation can cost nothing and still delay everything.',
    ],
  },

  'build/subcontracts': {
    what: 'Packages awarded, what has been certified, and what is held.',
    steps: [
      'Retention is held to its cap and released on the dates the contract sets.',
      'Contra-charges are recorded against the subcontract, with the reason.',
    ],
  },

  'client-builds': {
    what: 'Turnkey contracts: building on the client’s own land, to their specification.',
    steps: [
      'The specification is frozen before it becomes contractual. After that, changing a make or a finish is a variation with a price.',
      'The cost sheet attributes margin erosion to what caused it — variations absorbed, wastage, rework, delay, rate increases.',
      'Whatever cannot be attributed is labelled unexplained rather than quietly folded into one of the others.',
    ],
  },

  'finance/pnl': {
    what: 'Whether a scheme is making money, and where the margin is being made or lost.',
    steps: [
      'Collections are cash received. Revenue recognised is what may be reported as income under the project’s recognition basis — on an off-plan scheme these two are rarely close.',
      'Escrow money is legally the buyers’ until the construction it is tied to has been certified, so it is shown apart from spendable cash.',
      'The unit table is sorted worst-margin-first. That is usually where the answer is.',
    ],
    note: 'A project can be comfortably profitable on paper and still run out of cash, because the profit is in deferred revenue and the cash is in escrow. This screen keeps the two apart deliberately.',
  },

  'finance/escrow': {
    what: 'Buyers’ money held against certified progress, and what may be withdrawn.',
    steps: [
      'What may be taken out is a function of certified physical progress, never of what the bank balance happens to be.',
      'A withdrawal request that exceeds the entitlement is refused, with the arithmetic shown.',
      'Every withdrawal carries the certificates that justified it.',
    ],
    note: 'In two years an auditor will ask exactly that question about exactly that transfer. The answer has to already be on file.',
  },

  'finance/ventures': {
    what: 'Joint ventures with landowners: the split, what has been accrued and what has been paid.',
    steps: [
      'The landowner is a creditor whose balance moves every time a customer pays. That is why this is a ledger, not a field.',
      'Accrual is incremental — running it twice in a day does nothing the second time.',
      'Units given to the landowner come out of saleable inventory.',
    ],
  },

  'finance/recognition': {
    what: 'Of the money customers have paid, how much has actually been earned.',
    steps: [
      'The basis — over time or at a point in time — is a recorded decision with its rationale, made before any run happens.',
      'A run computes revenue to date and books the difference, so re-running a period cannot double-count.',
      'It runs as a dry run by default. A period close nobody can review before committing is one that gets committed wrong.',
    ],
  },

  'compliance/calendar': {
    what: 'Every dated obligation in one place, with one owner each.',
    steps: [
      'Approvals, licences, certificates, filings and covenant tests, all on the same calendar.',
      'Anything already overdue is shown whatever window you asked for.',
      'Completing a recurring item schedules the next one immediately.',
    ],
  },

  'compliance/qpr': {
    what: 'The quarterly return to the regulator, built from the ledgers rather than a spreadsheet.',
    steps: [
      'Sales, collections, escrow movement and physical progress all tie to the same records the rest of the app uses.',
      'The architect’s and accountant’s certificates have to be attached before it can be filed.',
      'Filing schedules the next quarter automatically.',
    ],
  },

  documents: {
    what: 'Everything this business has issued, and how to prove it issued it.',
    steps: [
      'Each document is tied to exactly one version of exactly one template.',
      'The verification code lets somebody holding a printed copy check it against what was actually issued.',
      'A superseded document stays on file — it is not deleted.',
    ],
  },

  'records/files': {
    what: 'The physical record room: where every original title file is, and who has it.',
    steps: [
      'Files are signed in and out. The chain of custody is the whole point.',
      'A file reported missing is escalated immediately, not surfaced in a monthly report.',
    ],
  },

  'legal/cases': {
    what: 'Litigation: what is running, what it is worth, and what is listed next.',
    steps: [
      'A live case that blocks transactions flags the unit, so nobody sells what is under dispute.',
      'A hearing nobody attended is escalated — that is how cases are lost by default.',
    ],
  },

  inbox: {
    what: 'Every conversation with a customer, in one place, whoever it is with.',
    steps: [
      'Unanswered first, oldest unanswered at the top. An inbox sorted by recency buries whoever has waited longest.',
      'A thread cannot be closed while the customer’s last message is unanswered.',
    ],
  },

  broadcasts: {
    what: 'Messaging a whole segment at once — and, mostly, deciding not to.',
    steps: [
      'It runs as a dry run first, showing exactly who would be suppressed and why.',
      'Consent, quiet hours and a per-person daily cap are all checked before anything sends.',
    ],
    note: 'Message everybody twice in a week and they stop reading anything you send — including the demand notice that matters.',
  },

  'setup/settings': {
    what: 'How this business works: which lines of business it runs, its currency and area unit, and the rules the app enforces.',
    steps: [
      'The four lines of business change what the whole application looks like. Turn on only what you actually do.',
      'Quiet hours and the daily message cap protect your customers from your own marketing.',
    ],
  },

  'setup/approval-inbox': {
    what: 'Decisions waiting on you, and the ones you have raised.',
    steps: [
      'Each request shows the amount, the summary and who asked.',
      'Anything past its escalation time is at the top — somebody downstream is waiting and does not know why.',
    ],
  },
};

/**
 * The dismissible explanation at the top of a screen.
 *
 * Dismissed per screen and remembered, so somebody who knows the app is not lectured every time
 * they open it — and can bring it back when they hit something they have not done before.
 */
@Component({
  standalone: true,
  selector: 're-page-help',
  imports: [CommonModule],
  template: `
    @if (copy) {
      @if (open()) {
        <aside class="hb" role="note">
          <div class="hb-head">
            <h3>
              <span class="material-symbols-outlined">lightbulb</span>
              {{ title || 'About this screen' }}
            </h3>
            <button type="button" class="hb-close" (click)="dismiss()" aria-label="Hide this">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <p class="hb-what">{{ copy.what }}</p>

          <ol class="hb-steps">
            @for (s of copy.steps; track s) { <li>{{ s }}</li> }
          </ol>

          @if (copy.note) {
            <p class="hb-note">
              <span class="material-symbols-outlined">info</span>
              {{ copy.note }}
            </p>
          }
        </aside>
      } @else {
        <button type="button" class="hb-reopen" (click)="reopen()">
          <span class="material-symbols-outlined">lightbulb</span>
          What is this screen for?
        </button>
      }
    }
  `,
  styles: [`
    .hb {
      margin-bottom: 16px;
      padding: 15px 18px;
      border-radius: 13px;
      border: 1px solid var(--accent-border, rgba(43, 127, 255, .25));
      background: var(--accent-bg, #eff6ff);
    }
    .hb-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; }
    .hb-head h3 {
      display: flex; align-items: center; gap: 7px;
      margin: 0 0 9px; font-size: 13px; font-weight: 700;
      letter-spacing: .03em; text-transform: uppercase;
      color: var(--accent-text, #1d4ed8);
    }
    .hb-head h3 .material-symbols-outlined { font-size: 17px; }
    .hb-close {
      border: none; background: transparent; cursor: pointer;
      color: var(--text-secondary, #64748b); padding: 0; line-height: 1; flex-shrink: 0;
    }
    .hb-close:hover { color: var(--text-primary, #1e293b); }
    .hb-close:focus-visible { outline: none; box-shadow: var(--focus-ring); border-radius: 5px; }
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
  /** Key into {@link REALESTATE_HELP}. */
  @Input({ required: true }) key = '';

  /** Overrides the default heading. */
  @Input() title = '';

  readonly open = signal(true);
  copy?: HelpCopy;

  private get storageKey(): string { return `nexcore.realestate.help.${this.key}`; }

  ngOnInit(): void {
    this.copy = REALESTATE_HELP[this.key];

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
