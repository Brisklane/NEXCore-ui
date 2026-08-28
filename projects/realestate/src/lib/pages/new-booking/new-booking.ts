import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  AdminService, BookingService, BrokerageService, CrmService, InventoryService, MoneyService,
} from '../../services/realestate.services';
import { RealEstateContextService } from '../../services/realestate-context.service';
import type * as M from '../../models/realestate.models';
import {
  PartyKind, PROPERTY_STATUS_LABELS, PaymentInstrument, PAYMENT_INSTRUMENT_LABELS,
  PropertyStatus, SourcingChannel, SOURCING_CHANNEL_LABELS, NotificationChannel,
} from '../../models/realestate.enums';
import {
  GateComponent, SkeletonComponent, ToastComponent, type GateCondition,
} from '../shared/ui';
import { PageHelpComponent } from '../shared/page-help';
import { SectionComponent } from '../shared/detail-bits';

/* =====================================================================================
 * The booking wizard.
 *
 * This is the most consequential screen in the product: at the end of it a unit leaves the market
 * and somebody owes money. So it is deliberately slow in the right places.
 *
 *   - Nothing is committed until the last step. Every earlier step only refreshes a preview.
 *   - The cost sheet is computed by the server, never in the browser. A price the salesperson
 *     calculates and a price the ledger raises must be the same number, and the only way to
 *     guarantee that is to have one of them do the arithmetic.
 *   - The gate is shown before the button, not after it. A blocked booking says which condition
 *     failed and where to go and fix it, because "not allowed" with no reason is how people learn
 *     to route around a system.
 *   - Discounts beyond the configured threshold do not fail. They warn, in advance, that the
 *     booking will need approval before it can be confirmed.
 * ===================================================================================== */

type Step = 1 | 2 | 3 | 4 | 5;

@Component({
  standalone: true,
  selector: 'lib-re-new-booking',
  imports: [
    CommonModule, FormsModule, GateComponent, SkeletonComponent, ToastComponent,
    PageHelpComponent, SectionComponent,
  ],
  templateUrl: './new-booking.html',
  styleUrls: [
    '../realestate-shared.css', '../shared/ui.css', '../shared/detail-bits.css',
    './new-booking.css',
  ],
})
export class NewBookingComponent implements OnInit {
  private bookings = inject(BookingService);
  private inventory = inject(InventoryService);
  private plans = inject(MoneyService);
  private crm = inject(CrmService);
  private brokerage = inject(BrokerageService);
  private admin = inject(AdminService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  protected ctx = inject(RealEstateContextService);

  readonly step = signal<Step>(1);
  readonly loading = signal(true);
  readonly previewing = signal(false);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly toast = signal<string | null>(null);

  readonly units = signal<M.InventoryUnitDto[]>([]);
  readonly templates = signal<M.PaymentPlanTemplateDto[]>([]);
  readonly partners = signal<M.LookupDto[]>([]);
  readonly agents = signal<M.LookupDto[]>([]);
  readonly people = signal<M.LookupDto[]>([]);
  readonly preview = signal<M.BookingPreviewDto | null>(null);

  // ── Step 1: the unit ──────────────────────────────────────────────
  readonly unitId = signal<string | null>(null);
  readonly unitSearch = signal('');

  // ── Step 2: the buyer ─────────────────────────────────────────────
  readonly buyerMode = signal<'existing' | 'new'>('existing');
  readonly partyId = signal<string | null>(null);
  readonly partySearch = signal('');
  readonly firstName = signal('');
  readonly lastName = signal('');
  readonly guardian = signal('');
  readonly phone = signal('');
  readonly email = signal('');

  // ── Step 3: price and plan ────────────────────────────────────────
  readonly discountAmount = signal(0);
  readonly discountPercent = signal(0);
  readonly discountNote = signal('');
  readonly templateId = signal<string | null>(null);
  readonly sourcingChannel = signal<SourcingChannel>(SourcingChannel.Direct);
  readonly partnerId = signal<string | null>(null);
  readonly agentId = signal<string | null>(null);

  // ── Step 4: the booking payment ───────────────────────────────────
  readonly takePayment = signal(true);
  readonly payAmount = signal<number | null>(null);
  readonly payInstrument = signal<PaymentInstrument>(PaymentInstrument.BankTransfer);
  readonly payReference = signal('');
  readonly payBank = signal('');
  readonly payDate = signal(new Date().toISOString().slice(0, 10));

  readonly notes = signal('');

  readonly steps = [
    { n: 1 as Step, label: 'Unit', icon: 'grid_view' },
    { n: 2 as Step, label: 'Buyer', icon: 'person' },
    { n: 3 as Step, label: 'Price and plan', icon: 'request_quote' },
    { n: 4 as Step, label: 'Payment', icon: 'payments' },
    { n: 5 as Step, label: 'Review', icon: 'fact_check' },
  ];

  readonly instruments = Object.entries(PAYMENT_INSTRUMENT_LABELS)
    .map(([value, label]) => ({ value: Number(value) as PaymentInstrument, label }));

  readonly channels = Object.entries(SOURCING_CHANNEL_LABELS)
    .map(([value, label]) => ({ value: Number(value) as SourcingChannel, label }));

  readonly availableUnits = computed(() => {
    const term = this.unitSearch().trim().toLowerCase();
    return this.units()
      .filter(u => u.status === PropertyStatus.Available || u.id === this.unitId())
      .filter(u => !term || u.unitNumber.toLowerCase().includes(term)
        || (u.blockName ?? '').toLowerCase().includes(term));
  });

  readonly unit = computed(() => this.units().find(u => u.id === this.unitId()) ?? null);

  readonly costSheet = computed(() => this.preview()?.costSheet ?? null);
  readonly plan = computed(() => this.preview()?.paymentPlan ?? null);

  readonly gateConditions = computed<GateCondition[]>(() => {
    const gate = this.preview()?.gate;
    if (!gate) return [];

    return gate.failures.map(f => ({
      label: f.label,
      satisfied: f.isSatisfied,
      mandatory: f.isMandatory,
      reason: f.note ?? null,
      route: f.url ?? null,
      canOverride: gate.canOverride,
    }));
  });

  readonly gatePassed = computed(() => this.preview()?.gate?.passed ?? false);

  readonly buyerName = computed(() => {
    if (this.buyerMode() === 'new') {
      return [this.firstName(), this.lastName()].filter(Boolean).join(' ');
    }
    return this.people().find(p => p.id === this.partyId())?.label ?? '';
  });

  /** Whether the current step is complete enough to move on. */
  canAdvance(step: Step): boolean {
    switch (step) {
      case 1: return !!this.unitId();
      case 2: return this.buyerMode() === 'existing'
        ? !!this.partyId()
        : !!this.firstName().trim() && !!this.lastName().trim() && !!this.phone().trim();
      case 3: return !!this.templateId();
      case 4: return !this.takePayment() || (!!this.payAmount() && this.payAmount()! > 0);
      default: return true;
    }
  }

  async ngOnInit(): Promise<void> {
    await this.ctx.ensureLoaded();

    const projectId = this.ctx.projectId();
    if (!projectId) {
      this.error.set('Pick a project before starting a booking.');
      this.loading.set(false);
      return;
    }

    const [board, templates, partners, agents] = await Promise.all([
      firstValueFrom(this.inventory.getBoard({ projectId, viewMode: 'grid' })).catch(() => null),
      firstValueFrom(this.plans.getTemplates(projectId, true)).catch(() => null),
      firstValueFrom(this.brokerage.getPartners({ pageSize: 200 })).catch(() => null),
      firstValueFrom(this.admin.getAgentLookup(this.ctx.officeId() ?? undefined))
        .catch(() => null),
    ]);

    if (board?.data) this.units.set(board.data.units);
    if (templates?.data) {
      this.templates.set(templates.data);
      const preferred = templates.data.find(t => t.isDefault) ?? templates.data[0];
      if (preferred) this.templateId.set(preferred.id);
    }
    if (partners?.data) {
      this.partners.set(partners.data.map(p => ({ id: p.id, label: p.name } as M.LookupDto)));
    }
    if (agents?.data) this.agents.set(agents.data);

    // Arriving from the inventory board with a unit already chosen.
    const preselected = this.route.snapshot.queryParamMap.get('unitId');
    if (preselected && this.units().some(u => u.id === preselected)) {
      this.unitId.set(preselected);
      this.step.set(2);
    }

    this.loading.set(false);
  }

  async searchPeople(): Promise<void> {
    const term = this.partySearch().trim();
    if (term.length < 2) {
      this.people.set([]);
      return;
    }

    const res = await firstValueFrom(this.crm.lookupParties(term, undefined, 20))
      .catch(() => null);
    this.people.set(res?.data ?? []);
  }

  pickUnit(u: M.InventoryUnitDto): void {
    this.unitId.set(u.id);
    this.preview.set(null);
  }

  /** Discount can be entered either way; whichever is typed drives the other. */
  setDiscountAmount(v: number): void {
    this.discountAmount.set(v);
    const list = this.unit()?.totalPrice ?? 0;
    this.discountPercent.set(list ? +((v / list) * 100).toFixed(2) : 0);
  }

  setDiscountPercent(v: number): void {
    this.discountPercent.set(v);
    const list = this.unit()?.totalPrice ?? 0;
    this.discountAmount.set(+((list * v) / 100).toFixed(2));
  }

  async go(step: Step): Promise<void> {
    // Never let somebody skip forward past an incomplete step.
    for (let s = 1 as Step; s < step; s = (s + 1) as Step) {
      if (!this.canAdvance(s)) return;
    }

    this.step.set(step);
    if (step >= 3) await this.refreshPreview();
  }

  async next(): Promise<void> {
    if (!this.canAdvance(this.step())) return;
    await this.go(Math.min(5, this.step() + 1) as Step);
  }

  back(): void {
    this.step.set(Math.max(1, this.step() - 1) as Step);
  }

  /** Builds the request. One place, used by both the preview and the commit. */
  private build(): M.BookingCreateDto {
    return {
      projectId: this.ctx.projectId()!,
      unitId: this.unitId() ?? undefined,
      bookingDate: new Date().toISOString().slice(0, 10),
      primaryApplicantPartyId: this.buyerMode() === 'existing'
        ? (this.partyId() ?? undefined) : undefined,
      newApplicant: this.buyerMode() === 'new'
        ? {
            kind: PartyKind.Individual,
            firstName: this.firstName(),
            lastName: this.lastName(),
            fatherOrGuardianName: this.guardian() || undefined,
            primaryPhone: this.phone(),
            primaryEmail: this.email() || undefined,
            preferredChannel: NotificationChannel.Sms,
            preferredLanguage: 'en',
            contacts: [],
            addresses: [],
            identities: [],
            relationships: [],
            addRoles: [],
            acknowledgeDuplicate: false,
          } as M.PartyUpsertDto
        : undefined,
      coApplicants: [],
      sourcingChannel: this.sourcingChannel(),
      channelPartnerId: this.partnerId() ?? undefined,
      salesExecutiveId: this.agentId() ?? undefined,
      discountAmount: this.discountAmount(),
      discountPercent: this.discountPercent(),
      discountNote: this.discountNote() || undefined,
      declinedOptionalCharges: [],
      paymentPlanTemplateId: this.templateId() ?? undefined,
      bookingPayment: this.takePayment() && this.payAmount()
        ? {
            receivedOn: this.payDate(),
            amount: this.payAmount()!,
            exchangeRate: 1,
            instrument: this.payInstrument(),
            instrumentNumber: this.payReference() || undefined,
            bankName: this.payBank() || undefined,
            isPostDated: false,
            manualAllocations: [],
            printReceipt: true,
          } as M.ReceiptCreateDto
        : undefined,
      notes: this.notes() || undefined,
      suppressDocuments: false,
    };
  }

  async refreshPreview(): Promise<void> {
    if (!this.unitId()) return;

    this.previewing.set(true);
    this.error.set(null);

    const res = await firstValueFrom(this.bookings.preview(this.build())).catch(() => null);

    if (res?.data) {
      this.preview.set(res.data);
      // Default the booking payment to the down payment the plan asks for.
      if (this.payAmount() === null && res.data.paymentPlan.downPayment > 0) {
        this.payAmount.set(res.data.paymentPlan.downPayment);
      }
    } else {
      this.error.set('We could not price that. Check the unit and the plan and try again.');
    }

    this.previewing.set(false);
  }

  async submit(): Promise<void> {
    if (!this.gatePassed()) return;

    this.submitting.set(true);
    this.error.set(null);

    const res = await firstValueFrom(this.bookings.create(this.build())).catch(() => null);

    this.submitting.set(false);

    if (res?.data) {
      void this.router.navigate(['/realestate/bookings', res.data.id], {
        state: { justCreated: true },
      });
    } else {
      this.error.set('The booking was not created. Nothing has been taken off the market and no '
        + 'money has been recorded.');
    }
  }

  /** A failed gate condition tells you where to go and fix it. */
  goTo(condition: GateCondition): void {
    if (condition.route) void this.router.navigateByUrl(condition.route);
  }

  cancel(): void {
    void this.router.navigateByUrl('/realestate/bookings');
  }

  statusLabel(s: PropertyStatus): string {
    return PROPERTY_STATUS_LABELS[s] ?? '—';
  }

  money(v: number | undefined | null): string {
    if (v === undefined || v === null) return '—';
    const c = this.costSheet()?.currencyCode ?? this.ctx.currency();
    return c + ' ' + v.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }

  needsPartner(): boolean {
    return this.sourcingChannel() === SourcingChannel.ChannelPartner;
  }
}
