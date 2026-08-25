import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  AppointmentService, CatalogueService, MemberService,
} from '../../services/fitness.services';
import {
  MembershipPlanDto, MemberSummaryDto, SessionPackagePurchaseDto,
} from '../../models/fitness.models';
import { PaymentMethod, PAYMENT_METHOD_LABELS, PlanKind, enumOptions } from '../../models/fitness.enums';
import { ClubPickerComponent } from '../shared/club-picker';
import { PageHelpComponent } from '../shared/page-help';

/**
 * Session packs and the credits inside them.
 *
 * Credits are a ledger rather than a counter: every movement records what consumed it and when,
 * so "she says she has three left and the system says two" is answerable instead of an argument.
 * A manual adjustment always asks why, for the same reason.
 *
 * Packs that are close to expiring are surfaced at the top, because unused credits are both a
 * refund risk and a strong signal that somebody has stopped coming.
 */
@Component({
  standalone: true,
  selector: 'lib-fitness-sessions',
  imports: [CommonModule, FormsModule, ClubPickerComponent, PageHelpComponent],
  templateUrl: './sessions.html',
  styleUrls: ['../fitness-shared.css', './sessions.css'],
})
export class SessionsComponent {
  private appointments = inject(AppointmentService);
  private catalogue = inject(CatalogueService);
  private members = inject(MemberService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  packages: SessionPackagePurchaseDto[] = [];
  packs: MembershipPlanDto[] = [];
  loading = true;
  error = '';
  notice = '';
  clubId: string | null = null;
  activeOnly = true;

  /** Selling a pack. */
  selling = false;
  packPlanId: string | null = null;
  member: MemberSummaryDto | null = null;
  memberSearch = '';
  memberResults: MemberSummaryDto[] = [];
  paymentMethod = PaymentMethod.Card;
  saving = false;

  readonly methodOptions = enumOptions(PAYMENT_METHOD_LABELS);
  readonly PaymentMethod = PaymentMethod;

  private searchTimer?: ReturnType<typeof setTimeout>;

  async onClub(id: string | null): Promise<void> {
    this.clubId = id;
    await this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = '';

    const [packages, plans] = await Promise.all([
      firstValueFrom(this.appointments.getPackages(this.clubId ?? undefined, undefined, this.activeOnly))
        .catch(() => null),
      firstValueFrom(this.catalogue.getPlans(this.clubId ?? undefined, PlanKind.SessionPack, true))
        .catch(() => null),
    ]);

    this.packages = packages?.data ?? [];
    this.packs = plans?.data ?? [];

    if (!packages) this.error = 'Could not load session packs.';

    this.loading = false;
    this.cdr.detectChanges();
  }

  // ── Selling ────────────────────────────────────────────────────────────

  startSell(): void {
    this.selling = true;
    this.packPlanId = this.packs[0]?.id ?? null;
    this.member = null;
    this.memberSearch = '';
    this.memberResults = [];
  }

  onMemberSearch(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    if (this.memberSearch.trim().length < 2) { this.memberResults = []; return; }

    this.searchTimer = setTimeout(async () => {
      const res = await firstValueFrom(this.members.search({
        query: this.memberSearch.trim(),
        clubId: this.clubId,
        includeInactive: false,
        limit: 6,
      })).catch(() => null);

      this.memberResults = res?.data ?? [];
      this.cdr.detectChanges();
    }, 240);
  }

  chooseMember(m: MemberSummaryDto): void {
    this.member = m;
    this.memberSearch = '';
    this.memberResults = [];
  }

  get chosenPack(): MembershipPlanDto | null {
    return this.packs.find(p => p.id === this.packPlanId) ?? null;
  }

  /** What each session works out at, which is how members compare packs. */
  perSession(p: MembershipPlanDto): number {
    return p.creditCount > 0 ? p.price / p.creditCount : p.price;
  }

  async sell(): Promise<void> {
    if (!this.clubId || !this.packPlanId || !this.member) return;

    this.saving = true;
    const res = await firstValueFrom(this.appointments.sellPackage({
      memberId: this.member.id,
      clubId: this.clubId,
      planId: this.packPlanId,
      sessions: this.chosenPack?.creditCount ?? 0,
      paymentMethod: this.paymentMethod,
      takePaymentNow: true,
    } as never)).catch(() => null);

    this.saving = false;

    if (res?.data) {
      this.notice = `Sold — ${res.data.sessionsPurchased} sessions for `
        + `${this.member.preferredName || this.member.fullName}.`;
      this.selling = false;
      await this.load();
    } else {
      this.error = 'That sale did not go through.';
    }

    this.cdr.detectChanges();
  }

  go(route: string): void { void this.router.navigateByUrl(route); }

  // ── Presentation ───────────────────────────────────────────────────────

  /** Packs about to expire with credits left — a refund risk, and a churn signal. */
  get expiring(): SessionPackagePurchaseDto[] {
    return this.packages.filter(p => p.expiringSoon && p.sessionsRemaining > 0);
  }

  usedPercent(p: SessionPackagePurchaseDto): number {
    if (p.sessionsPurchased <= 0) return 0;
    return Math.round((p.sessionsUsed / p.sessionsPurchased) * 100);
  }

  packClass(p: SessionPackagePurchaseDto): string {
    if (p.isExpired && p.sessionsRemaining > 0) return 'is-alert';
    if (p.expiringSoon && p.sessionsRemaining > 0) return 'is-warn';
    return '';
  }
}
