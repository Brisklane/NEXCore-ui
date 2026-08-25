import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { CatalogueService } from '../../services/fitness.services';
import { MembershipPlanDto, PromotionRuleDto, SavePlanDto } from '../../models/fitness.models';
import {
  BillingPeriod, BILLING_PERIOD_LABELS, DISCOUNT_KIND_LABELS, PlanKind, PLAN_KIND_LABELS,
  ProrationRule, PRORATION_RULE_LABELS, RevenueRecognitionBasis, enumOptions,
} from '../../models/fitness.enums';
import { ClubPickerComponent } from '../shared/club-picker';
import { PageHelpComponent } from '../shared/page-help';
import { FieldErrorComponent, FieldErrors, notNegative, required, validate } from '../shared/validation';

/**
 * What the club sells.
 *
 * The important behaviour on this screen is what happens when a price changes. Editing a plan
 * creates a new version; members already on the old terms keep them, because the terms somebody
 * signed are the terms they signed. Pushing a new price onto existing members is a separate,
 * explicit choice with its own checkbox and its own warning — never a side effect of saving a form.
 */
@Component({
  standalone: true,
  selector: 'lib-fitness-plans',
  imports: [CommonModule, FormsModule, ClubPickerComponent, PageHelpComponent, FieldErrorComponent],
  templateUrl: './plans.html',
  styleUrls: ['../fitness-shared.css', './plans.css'],
})
export class PlansComponent {
  private catalogue = inject(CatalogueService);
  private cdr = inject(ChangeDetectorRef);

  plans: MembershipPlanDto[] = [];
  promotions: PromotionRuleDto[] = [];
  loading = true;
  error = '';
  notice = '';
  clubId: string | null = null;

  tab: 'plans' | 'promotions' = 'plans';
  kind: PlanKind | null = null;

  /** Editor. */
  editing: MembershipPlanDto | null = null;
  draft: SavePlanDto | null = null;
  errors: FieldErrors = {};
  saving = false;

  readonly kindLabels = PLAN_KIND_LABELS;
  readonly periodLabels = BILLING_PERIOD_LABELS;
  readonly prorationLabels = PRORATION_RULE_LABELS;
  readonly discountLabels = DISCOUNT_KIND_LABELS;
  readonly kindOptions = enumOptions(PLAN_KIND_LABELS);
  readonly periodOptions = enumOptions(BILLING_PERIOD_LABELS);
  readonly prorationOptions = enumOptions(PRORATION_RULE_LABELS);
  readonly PlanKind = PlanKind;
  readonly BillingPeriod = BillingPeriod;

  async onClub(id: string | null): Promise<void> {
    this.clubId = id;
    await this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = '';

    const [plans, promos] = await Promise.all([
      firstValueFrom(this.catalogue.getPlans(this.clubId ?? undefined, this.kind ?? undefined)).catch(() => null),
      firstValueFrom(this.catalogue.getPromotions(this.clubId ?? undefined, false)).catch(() => null),
    ]);

    this.plans = plans?.data ?? [];
    this.promotions = promos?.data ?? [];

    if (!plans) this.error = 'Could not load the price list.';

    this.loading = false;
    this.cdr.detectChanges();
  }

  // ── Editing ────────────────────────────────────────────────────────────

  edit(plan: MembershipPlanDto): void {
    this.editing = plan;
    this.errors = {};
    this.draft = {
      ...plan,
      applyPriceChangeToExisting: false,
    } as unknown as SavePlanDto;
  }

  create(): void {
    this.editing = null;
    this.errors = {};
    this.draft = {
      name: '',
      kind: PlanKind.RecurringMembership,
      price: 0,
      currencyCode: 'USD',
      taxPercent: 0,
      priceIncludesTax: true,
      billingPeriod: BillingPeriod.Monthly,
      joinProration: ProrationRule.Daily,
      cancelProration: ProrationRule.None,
      joiningFee: 0,
      adminFee: 0,
      cardFee: 0,
      annualMaintenanceFee: 0,
      minimumTermMonths: 0,
      noticePeriodDays: 30,
      autoRenews: true,
      earlyTerminationFee: 0,
      earlyTerminationPercentOfRemaining: 0,
      creditCount: 0,
      validForDays: 0,
      creditsTransferable: false,
      creditsRefundable: false,
      allowsCrossClubAccess: true,
      visitsPerPeriod: 0,
      guestPassesPerPeriod: 0,
      bookingWindowDays: 14,
      maxConcurrentBookings: 0,
      sellableAtDesk: true,
      sellableOnline: true,
      sellableInApp: true,
      sellableAtKiosk: false,
      isPrivate: false,
      requiresHealthScreening: true,
      recognitionBasis: RevenueRecognitionBasis.StraightLine,
      displayOrder: this.plans.length + 1,
      isActive: true,
      clubPrices: [],
      entitlements: [],
      applyPriceChangeToExisting: false,
    } as unknown as SavePlanDto;
  }

  /** True when the price has moved on a plan people are already paying. */
  get priceChanged(): boolean {
    return !!this.editing && !!this.draft && this.draft.price !== this.editing.price;
  }

  async save(): Promise<void> {
    if (!this.draft) return;

    this.errors = validate(this.draft as unknown as Record<string, unknown>, {
      name: [required('A plan name')],
      price: [notNegative('The price')],
      joiningFee: [notNegative('The joining fee')],
    });

    if (Object.keys(this.errors).length > 0) return;

    this.saving = true;
    const res = this.editing
      ? await firstValueFrom(this.catalogue.updatePlan(this.editing.id, this.draft)).catch(() => null)
      : await firstValueFrom(this.catalogue.createPlan(this.draft)).catch(() => null);

    this.saving = false;

    if (res?.data) {
      this.notice = this.editing
        ? `${res.data.name} saved${this.draft.applyPriceChangeToExisting ? ' and the new price pushed to existing members' : ''}.`
        : `${res.data.name} added to the price list.`;
      this.draft = null;
      this.editing = null;
      await this.load();
    } else {
      this.error = 'Could not save that plan.';
    }

    this.cdr.detectChanges();
  }

  async withdraw(plan: MembershipPlanDto): Promise<void> {
    const res = await firstValueFrom(this.catalogue.deletePlan(plan.id)).catch(() => null);
    if (res) {
      this.notice = `${plan.name} withdrawn from sale. Existing members are not affected.`;
      await this.load();
    } else {
      this.error = 'Could not withdraw that plan.';
    }
  }

  // ── Presentation ───────────────────────────────────────────────────────

  /** "£39.99 a month" reads better on a price list than "39.99 / Monthly". */
  priceLine(p: MembershipPlanDto): string {
    const money = p.price.toFixed(2);
    switch (p.billingPeriod) {
      case BillingPeriod.Weekly: return `${money} a week`;
      case BillingPeriod.Fortnightly: return `${money} a fortnight`;
      case BillingPeriod.Monthly: return `${money} a month`;
      case BillingPeriod.Quarterly: return `${money} a quarter`;
      case BillingPeriod.Annual: return `${money} a year`;
      default: return `${money} one-off`;
    }
  }

  termLine(p: MembershipPlanDto): string {
    const parts: string[] = [];
    if (p.minimumTermMonths > 0) parts.push(`${p.minimumTermMonths}-month minimum`);
    if (p.noticePeriodDays > 0) parts.push(`${p.noticePeriodDays} days' notice`);
    if (p.creditCount > 0) parts.push(`${p.creditCount} credits`);
    if (p.validForDays > 0) parts.push(`valid ${p.validForDays} days`);
    return parts.join(' · ') || 'No commitment';
  }
}
