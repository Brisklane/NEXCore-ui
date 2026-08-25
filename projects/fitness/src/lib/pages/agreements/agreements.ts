import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AgreementService, CatalogueService } from '../../services/fitness.services';
import {
  AgreementSummaryDto, CancellationPreviewDto, FreezePreviewDto,
  MembershipPlanDto, PlanChangePreviewDto,
} from '../../models/fitness.models';
import {
  AgreementStatus, AGREEMENT_STATUS_LABELS, FreezeReason, FREEZE_REASON_LABELS,
  LeaveReason, LEAVE_REASON_LABELS, enumOptions,
} from '../../models/fitness.enums';
import { ClubPickerComponent } from '../shared/club-picker';
import { PageHelpComponent } from '../shared/page-help';

/**
 * Memberships, and the three things members most often ask to do to them.
 *
 * Freezing, changing plan and cancelling all have a preview before they have an effect, and every
 * preview returns the arithmetic *and* a sentence. A receptionist who cannot answer "what will it
 * cost me to freeze for six weeks" loses the freeze and gets a cancellation instead — so the
 * sentence is the point of these dialogs, not the numbers above it.
 */
@Component({
  standalone: true,
  selector: 'lib-fitness-agreements',
  imports: [CommonModule, FormsModule, ClubPickerComponent, PageHelpComponent],
  templateUrl: './agreements.html',
  styleUrls: ['../fitness-shared.css', './agreements.css'],
})
export class AgreementsComponent {
  private agreements = inject(AgreementService);
  private catalogue = inject(CatalogueService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  rows: AgreementSummaryDto[] = [];
  plans: MembershipPlanDto[] = [];
  total = 0;
  page = 1;
  readonly size = 25;

  loading = true;
  error = '';
  notice = '';
  clubId: string | null = null;
  memberId: string | null = null;
  status: AgreementStatus | null = null;

  /** Freeze. */
  freezing: AgreementSummaryDto | null = null;
  freezeFrom = new Date().toISOString().slice(0, 10);
  freezeTo = '';
  freezeReason = FreezeReason.Travel;
  freezePreview: FreezePreviewDto | null = null;

  /** Plan change. */
  changing: AgreementSummaryDto | null = null;
  newPlanId: string | null = null;
  changePreview: PlanChangePreviewDto | null = null;

  /** Cancellation. */
  cancelling: AgreementSummaryDto | null = null;
  cancelPreview: CancellationPreviewDto | null = null;
  leaveReason = LeaveReason.Other;
  leaveNote = '';

  busy = false;

  readonly statusLabels = AGREEMENT_STATUS_LABELS;
  readonly freezeReasonOptions = enumOptions(FREEZE_REASON_LABELS);
  readonly leaveReasonOptions = enumOptions(LEAVE_REASON_LABELS);
  readonly statusOptions = enumOptions(AGREEMENT_STATUS_LABELS);
  readonly AgreementStatus = AgreementStatus;

  async onClub(id: string | null): Promise<void> {
    this.clubId = id;
    this.memberId = this.route.snapshot.queryParamMap.get('memberId');
    await Promise.all([this.load(), this.loadPlans()]);
  }

  private async loadPlans(): Promise<void> {
    const res = await firstValueFrom(this.catalogue.getPlans(this.clubId ?? undefined)).catch(() => null);
    this.plans = res?.data ?? [];
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = '';

    const res = await firstValueFrom(this.agreements.list({
      clubId: this.clubId ?? undefined,
      memberId: this.memberId ?? undefined,
      status: this.status ?? undefined,
      page: this.page,
      size: this.size,
    })).catch(() => null);

    if (!res) {
      this.error = 'Could not load memberships.';
    } else {
      this.rows = res.data ?? [];
      this.total = res.pagination?.totalCount ?? this.rows.length;
    }

    this.loading = false;
    this.cdr.detectChanges();
  }

  // ── Freeze ─────────────────────────────────────────────────────────────

  startFreeze(a: AgreementSummaryDto): void {
    this.freezing = a;
    this.freezePreview = null;
    this.freezeFrom = new Date().toISOString().slice(0, 10);
    this.freezeTo = '';
    this.freezeReason = FreezeReason.Travel;
  }

  async previewFreeze(): Promise<void> {
    if (!this.freezing || !this.freezeTo) return;

    this.busy = true;
    const res = await firstValueFrom(this.agreements.previewFreeze({
      agreementId: this.freezing.id,
      startsOn: new Date(this.freezeFrom).toISOString(),
      endsOn: new Date(this.freezeTo).toISOString(),
      reason: this.freezeReason,
    } as never)).catch(() => null);

    this.freezePreview = res?.data ?? null;
    this.busy = false;
    this.cdr.detectChanges();
  }

  async confirmFreeze(): Promise<void> {
    if (!this.freezing || !this.freezeTo) return;

    this.busy = true;
    const res = await firstValueFrom(this.agreements.freeze({
      agreementId: this.freezing.id,
      startsOn: new Date(this.freezeFrom).toISOString(),
      endsOn: new Date(this.freezeTo).toISOString(),
      reason: this.freezeReason,
    } as never)).catch(() => null);

    this.busy = false;

    if (res?.data) {
      this.notice = 'Membership frozen.';
      this.freezing = null;
      await this.load();
    } else {
      this.error = 'Could not freeze that membership.';
    }

    this.cdr.detectChanges();
  }

  // ── Plan change ────────────────────────────────────────────────────────

  startChange(a: AgreementSummaryDto): void {
    this.changing = a;
    this.newPlanId = null;
    this.changePreview = null;
  }

  async previewChange(): Promise<void> {
    if (!this.changing || !this.newPlanId) return;

    this.busy = true;
    const res = await firstValueFrom(
      this.agreements.previewPlanChange(this.changing.id, this.newPlanId),
    ).catch(() => null);

    this.changePreview = res?.data ?? null;
    this.busy = false;
    this.cdr.detectChanges();
  }

  async confirmChange(): Promise<void> {
    if (!this.changing || !this.newPlanId) return;

    this.busy = true;
    const res = await firstValueFrom(this.agreements.changePlan({
      agreementId: this.changing.id,
      newPlanId: this.newPlanId,
    } as never)).catch(() => null);

    this.busy = false;

    if (res?.data) {
      this.notice = 'Plan changed.';
      this.changing = null;
      await this.load();
    } else {
      this.error = 'Could not change that plan.';
    }

    this.cdr.detectChanges();
  }

  // ── Cancellation ───────────────────────────────────────────────────────

  async startCancel(a: AgreementSummaryDto): Promise<void> {
    this.cancelling = a;
    this.leaveReason = LeaveReason.Other;
    this.leaveNote = '';

    const res = await firstValueFrom(this.agreements.previewCancellation(a.id)).catch(() => null);
    this.cancelPreview = res?.data ?? null;
    this.cdr.detectChanges();
  }

  async confirmCancel(): Promise<void> {
    if (!this.cancelling) return;

    this.busy = true;
    const res = await firstValueFrom(this.agreements.requestCancellation({
      agreementId: this.cancelling.id,
      reason: this.leaveReason,
      reasonNote: this.leaveNote.trim() || null,
    } as never)).catch(() => null);

    this.busy = false;

    if (res?.data) {
      this.notice = 'Cancellation logged. The membership runs until the end of the notice period.';
      this.cancelling = null;
      await this.load();
    } else {
      this.error = 'Could not log that cancellation.';
    }

    this.cdr.detectChanges();
  }

  get totalPages(): number { return Math.max(1, Math.ceil(this.total / this.size)); }

  goPage(n: number): void {
    if (n < 1 || n > this.totalPages) return;
    this.page = n;
    void this.load();
  }

  go(route: string): void { void this.router.navigateByUrl(route); }

  // ── Presentation ───────────────────────────────────────────────────────

  rowClass(a: AgreementSummaryDto): string {
    if (a.status === AgreementStatus.Cancelled || a.status === AgreementStatus.Expired) return 'is-alert';
    if (a.isFrozen) return 'is-warn';
    if (a.status === AgreementStatus.Active) return 'is-good';
    return '';
  }

  /** The plans this member could move to, excluding the one they are on. */
  get changeOptions(): MembershipPlanDto[] {
    return this.plans.filter(p => p.id !== this.changing?.planId && p.isActive);
  }
}
