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
 * Help copy for every Fitness screen, in one place.
 *
 * Central rather than inline so the whole product's guidance can be read and edited as a set —
 * it is much easier to keep thirty explanations consistent in tone when they sit next to each
 * other than when they are scattered across thirty templates.
 */
export const FITNESS_HELP: Record<string, HelpCopy> = {
  dashboard: {
    what: 'Your club at a glance — who is in, what is on, and the handful of things that need you today.',
    steps: [
      'The "Needs attention" list is ordered by what costs most if ignored, not by how many there are.',
      'Every item links straight to the screen that fixes it.',
      'The figures below compare against last month, so a bad month is obvious before it ends.',
    ],
    note: 'Churn here is leavers over the average active count for the period — not the closing count, which flatters a shrinking club.',
  },

  'front-desk': {
    what: 'The desk. Who is in the building, what is starting soon, who is due, and what needs doing.',
    steps: [
      'Search or scan to bring a member up. The result shows their status, balance and any blocking alerts before you speak.',
      'Anything red stops them at the barrier — a waiver they have not signed, a balance they owe, a medical clearance outstanding.',
      'Use "Let them in" to override, and say why. Every override is recorded against your name.',
    ],
    note: 'Loads in one call, so it is usable on a slow connection while a queue is forming.',
  },

  kiosk: {
    what: 'Self check-in. A member taps a fob, scans a QR code, or types their number.',
    steps: [
      'Leave this screen open on the tablet by the barrier.',
      'A green panel means they are in. Amber means they got in but something needs sorting.',
      'Red means the barrier stayed shut, and says why in a sentence the member can read themselves.',
    ],
    note: 'If the network drops, the door controller keeps deciding from its own cache and replays what it did when the link comes back.',
  },

  members: {
    what: 'Everybody on the books — current, frozen, in arrears and gone.',
    steps: [
      'Search by name, member number, phone or email. Exact matches come first.',
      'Filter by status, plan or risk band to work a list: everyone at risk, everyone in arrears, everyone on the plan you are retiring.',
      'Click through for the full record.',
    ],
  },

  member: {
    what: 'One member, everything about them, on one screen.',
    steps: [
      'The header carries the facts that change how you speak to them: status, balance, risk band, and any alert that would stop them at the door.',
      'Tabs below hold the detail — visits, bookings, money, agreements, notes, documents.',
      'Actions on the right are the things you are most often asked for: freeze, change plan, take a payment, issue a fob.',
    ],
    note: 'Medical information is only shown to staff whose role allows it, and every time it is opened the app records who opened it.',
  },

  join: {
    what: 'Signing somebody up, start to finish.',
    steps: [
      'Details, then plan, then health screening and waiver, then payment.',
      'The screening gates the rest: a "yes" on any of the seven flagged questions means the membership starts, but access waits for a clinician to sign off.',
      'Everything is saved in one go at the end, so a half-joined member is not possible.',
    ],
    note: 'Card details never reach this app. Payment is taken through the provider and only a token, brand and last four come back.',
  },

  timetable: {
    what: 'The published class timetable, and every booking on it.',
    steps: [
      'Pick a week. Classes show their fill as a bar and as a number — "14/20" and "nearly full" are different facts.',
      'Click a class for its roster, spot map and the medical flags the instructor needs.',
      'Book a member straight from the class, or add them to the waitlist if it is full.',
    ],
  },

  'schedule-builder': {
    what: 'The recurring timetable behind the classes — edit "Spin, Mondays at 6:30" once, not fifty-two times.',
    steps: [
      'Add a recurring slot: class type, room, instructor, days and time.',
      'Run "Check conflicts" before publishing. It finds double-booked rooms, double-booked instructors and rooms too small for the capacity you set.',
      'Publish when you are happy. Dated classes are generated ahead and become bookable.',
    ],
    note: 'A timetable that puts one instructor in two studios at 18:30 is a discovery best made on a Tuesday afternoon, not at 18:29 on a Monday.',
  },

  roster: {
    what: 'One class: who is booked, who turned up, and where they stand.',
    steps: [
      'Mark the register as people arrive, or bulk-mark at the end.',
      'Medical flags appear beside the names that have them — that is the whole reason this screen shows them.',
      'Cancelling the class returns every credit and notifies everyone booked.',
    ],
  },

  appointments: {
    what: 'Personal training and other one-to-one sessions.',
    steps: [
      'Find a slot by service and date. The member\'s own coach is offered first.',
      'Book, then sign off after the session — that is what consumes the credit and pays the trainer.',
      'A no-show still consumes the credit unless you waive it.',
    ],
    note: 'Trainers are paid per session delivered, not per pack sold, so the incentive is to get the member to turn up.',
  },

  sessions: {
    what: 'Session packs and the credits inside them.',
    steps: [
      'Sell a pack, and the credits appear on the member\'s record with an expiry.',
      'Credits are a ledger, not a counter — every movement says what consumed it and when.',
      'Adjust manually only when something went wrong, and say why.',
    ],
  },

  programming: {
    what: 'What the club is training this week, by track.',
    steps: [
      'Write the session against a date and a track.',
      'Publish when you want members to see it — a session written on Tuesday for Thursday stays hidden until then.',
      'The board screen shows today\'s session and the scores so far.',
    ],
  },

  leaderboards: {
    what: 'Scores, personal records and the board.',
    steps: [
      'Filter by workout, class or challenge.',
      'Scores are stored in one comparable form, so a leaderboard sorts correctly whether the workout is for time, for rounds or for load.',
    ],
    note: 'Members who have opted out of leaderboards do not appear on one, anywhere.',
  },

  assessments: {
    what: 'Body composition, measurements and progress over time.',
    steps: [
      'Enter what you actually measured. BMI, fat mass, lean mass and waist–hip ratio are worked out from those.',
      'Every value comes back with the change since last time and whether that change is in the right direction.',
      'Progress photos need the member\'s consent on file before they can be stored or shown.',
    ],
    note: 'This is health data. Access is restricted by role and every read is recorded.',
  },

  leads: {
    what: 'The sales pipeline — enquiries, tours, trials and joins.',
    steps: [
      'New enquiries are assigned automatically to whoever has fewest open leads.',
      'Log the first contact as soon as it happens; that stops the response clock.',
      'Move a lead along the board as it progresses, and convert it when they join.',
    ],
    note: 'Conversion falls sharply after the first few minutes. Anything past the response target is flagged and counted, not just coloured.',
  },

  billing: {
    what: 'Billing runs — collecting the month\'s dues.',
    steps: [
      'Preview first. It shows exactly what would be billed, to whom, and what it would total.',
      'Run it for real when the preview looks right.',
      'A run that stops halfway can be restarted without billing anyone twice.',
    ],
  },

  invoices: {
    what: 'Every invoice raised, and what has been paid against it.',
    steps: [
      'Filter by status or date, or narrow to overdue only.',
      'Open an invoice for its lines, its payments and its history.',
      'Credit notes, refunds and write-offs all live here and all require a reason.',
    ],
  },

  collections: {
    what: 'Members in arrears, and the ladder chasing them.',
    steps: [
      'The ageing bands show how old the debt is; the failure reasons show why it did not collect.',
      'Retry, pause, assign, log a promise to pay, or write off.',
      'A promise to pay pauses the ladder until the date promised.',
    ],
    note: 'Most failures are an expired card, not a refusal to pay — which is why access is only suspended after two weeks.',
  },

  pos: {
    what: 'The pro shop till and the cash drawer.',
    steps: [
      'Scan or tap items, take payment, or charge to the member\'s account.',
      'Open the drawer at the start of the shift and close it at the end.',
      'The close is a blind count: enter what you counted before the app shows what it expected.',
    ],
    note: 'Stock lives in Inventory. Selling here depletes it there, exactly as the Point of Sale app does.',
  },

  retention: {
    what: 'Who is drifting away, and what to do about it.',
    steps: [
      'Members are scored nightly and banded: healthy, watch, at risk, critical.',
      'Every score comes with the reasons behind it, in plain English, weighted.',
      'Work the task list. A completed task records what was done and what happened next.',
    ],
    note: 'The score is a prompt to have a conversation, not a verdict. The reasons matter more than the number.',
  },

  marketing: {
    what: 'Campaigns, journeys and segments.',
    steps: [
      'Build a segment, preview exactly who is in it, then send.',
      'Journeys run automatically on a trigger — joining, going quiet, hitting a milestone.',
      'New journeys are created switched off. Turn one on deliberately.',
    ],
    note: 'Consent is enforced on send, and anything that would land inside quiet hours waits until morning.',
  },

  loyalty: {
    what: 'Points, tiers, challenges and badges.',
    steps: [
      'Points come from turning up, not from spending — which is the behaviour that keeps members.',
      'Tiers unlock benefits and earn faster.',
      'Challenges and badges are recalculated nightly.',
    ],
  },

  access: {
    what: 'Doors, controllers and the rules that decide who gets through.',
    steps: [
      'Rules set the conditions: balance limit, waiver, medical clearance, hours, age, anti-passback.',
      'The event log shows every decision, including every refusal and why.',
      'A controller that stops sending a heartbeat is shown as offline here and on the dashboard.',
    ],
    note: 'Controllers hold an offline cache so the barrier keeps working if the network drops, and replay what they did when it returns.',
  },

  lockers: {
    what: 'Locker banks, rentals and day use.',
    steps: [
      'Assign a locker to a member, with a rate and an end date.',
      'Day-use lockers are cleared overnight.',
      'Expired rentals are flagged rather than silently released.',
    ],
  },

  resources: {
    what: 'Courts, lanes, studios and anything else booked by the hour.',
    steps: [
      'The grid shows every resource down one side and the day along the other.',
      'Click an empty slot to book it.',
      'A resource attached to equipment that goes out of service stops being bookable.',
    ],
  },

  equipment: {
    what: 'Every machine, its condition, and the work outstanding on it.',
    steps: [
      'Scan the QR sticker on a machine to bring it up.',
      'Set a machine out of service and it disappears from spot maps and bookings, and anyone already booked is moved.',
      'Servicing due by date or by hours run raises its own work orders.',
    ],
  },

  incidents: {
    what: 'Accidents, near misses, complaints and lost property.',
    steps: [
      'Record what happened, when, who was involved and what was done.',
      'Serious incidents raise their own follow-up actions automatically.',
      'An incident cannot be closed until its actions are complete and a root cause is written.',
    ],
    note: 'These records are kept even when a member asks to be erased, because the law requires the club to keep them.',
  },

  waivers: {
    what: 'Waivers, health screening and medical clearances.',
    steps: [
      'Editing a published waiver creates a new version; it does not rewrite what people already signed.',
      'The outstanding list is everyone who cannot get through the door until they sign.',
      'PAR-Q answers that flag a risk raise a clearance for a clinician to sign off.',
    ],
  },

  staff: {
    what: 'The team, their roles, their qualifications and their rota.',
    steps: [
      'Roles set what somebody can do and how much they can discount, refund or write off.',
      'The rota shows coverage gaps against the club\'s opening hours.',
      'Expiring qualifications are surfaced before they lapse.',
    ],
    note: 'PINs are hashed and never shown, to anybody. A manager override is a PIN check that is recorded.',
  },

  commission: {
    what: 'What the team has earned, and what has been paid.',
    steps: [
      'Accruals build as sessions are signed off, classes are taught and memberships are sold.',
      'Generate statements for the period, review them, then approve.',
      'Exporting marks a statement paid so it cannot go through payroll twice.',
    ],
  },

  corporate: {
    what: 'Employer schemes and third-party payers.',
    steps: [
      'Set the billing model: employer pays all, subsidised, or discount only.',
      'Eligibility can be checked by email domain, employee reference or an access code.',
      'The consolidated invoice carries the per-employee breakdown and their usage.',
    ],
    note: 'Usage is on the invoice because it is usually why the employer bought it — and an invoice with no evidence of use gets queried at renewal.',
  },

  plans: {
    what: 'What the club sells: memberships, packs, passes and promotions.',
    steps: [
      'Changing a plan\'s terms creates a new version. Existing members keep the terms they signed.',
      'Pushing a price change onto existing members is a separate, deliberate action.',
      'Change paths control which upgrades and downgrades are allowed, and how they are prorated.',
    ],
  },

  clubs: {
    what: 'Sites, opening hours, rooms and closures.',
    steps: [
      'Opening hours and staffed hours are separate, because a 24-hour club is open at 3am with nobody in it.',
      'Rooms can carry a spot map — bike numbers, mat positions, rig stations.',
      'A closure cancels the classes inside it and can extend everyone\'s agreement.',
    ],
  },

  reports: {
    what: 'The numbers the club is run on.',
    steps: [
      'Pick a period and a club, or leave it at all clubs.',
      'Membership, revenue, MRR movement, attendance, class performance, sales, staff and operations.',
      'Cohort retention is the one that tells you which channel brings members who stay.',
    ],
    note: 'MRR movement is split into new, expansion, contraction, churn and reactivation — "revenue is down" is not a finding, but "eleven downgrades and four cancellations" is.',
  },

  settings: {
    what: 'How the app behaves for this company.',
    steps: [
      'Billing defaults, notice periods, freeze allowances and approval thresholds.',
      'Quiet hours, so nothing automated texts a member at 11pm.',
      'The response target that decides when an enquiry counts as overdue.',
    ],
  },
  'setup-classes': {
    what: 'What the club runs, and the spaces it runs them in.',
    steps: [
      'A class type is what "Spin" means — its length, its places, what it costs a drop-in and whether it needs a clearance. The timetable cannot be built until one exists.',
      'A room can carry a spot map. Draw it: click a square to place a bike, click the spanner to mark one out for repair.',
      'An area is a part of the building that can fill up, close, or need a door — the gym floor, the pool, the creche.',
    ],
    note: 'A class type that has been scheduled is retired, never deleted. What members attended has to keep making sense.',
  },

  households: {
    what: 'Families and couples billed together, and who may collect the children.',
    steps: [
      'One member is the primary — the person the combined invoice goes to.',
      'Set who may collect children. Reception is asked at the desk and needs an answer that is recorded, not remembered.',
      'A junior who is about to age out is flagged here before their plan stops being valid.',
    ],
    note: "Being in a household never moves a member's medical or assessment data to anybody else in it.",
  },
};

/**
 * The dismissible explanation at the top of a screen.
 *
 * Open by default and remembered per screen, because the person who needs it most is the one who
 * has never seen the screen before — and the person who does not need it dismisses it once.
 */
@Component({
  standalone: true,
  selector: 'fit-page-help',
  imports: [CommonModule],
  template: `
    @if (copy) {
      @if (open()) {
        <aside class="hb" role="note">
          <div class="hb-head">
            <span class="material-symbols-outlined hb-icon">lightbulb</span>
            <h2 class="hb-title">{{ title || 'About this screen' }}</h2>
            <button type="button" class="hb-close" (click)="dismiss()" aria-label="Hide this explanation">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <p class="hb-what">{{ copy.what }}</p>

          <ol class="hb-steps">
            @for (step of copy.steps; track step) {
              <li>{{ step }}</li>
            }
          </ol>

          @if (copy.note) {
            <p class="hb-note">
              <span class="material-symbols-outlined">info</span>{{ copy.note }}
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
      margin-bottom: 18px; padding: 15px 18px; border-radius: 14px;
      background: var(--accent-soft, rgba(43, 127, 255, .07));
      border: 1px solid var(--accent-border, rgba(43, 127, 255, .22));
    }
    .hb-head { display: flex; align-items: center; gap: 9px; margin-bottom: 9px; }
    .hb-icon { font-size: 19px; color: var(--accent, #2b7fff); }
    .hb-title {
      flex: 1; margin: 0; font-size: 13.5px; font-weight: 700;
      color: var(--text-heading, #0f172a); letter-spacing: -.01em;
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
  /** Key into {@link FITNESS_HELP}. */
  @Input({ required: true }) key = '';

  /** Overrides the default heading. */
  @Input() title = '';

  readonly open = signal(true);
  copy?: HelpCopy;

  private get storageKey(): string { return `nexcore.fitness.help.${this.key}`; }

  ngOnInit(): void {
    this.copy = FITNESS_HELP[this.key];

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
