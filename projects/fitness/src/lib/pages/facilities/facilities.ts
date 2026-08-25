import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { FacilityService, MemberService } from '../../services/fitness.services';
import {
  LockerAssignmentDto, LockerBankDto, LockerDto, MemberSummaryDto,
  ResourceGridDto, ResourceGridSlotDto,
} from '../../models/fitness.models';
import {
  LockerSize, LOCKER_SIZE_LABELS, LockerStatus, LOCKER_STATUS_LABELS,
  ResourceKind, RESOURCE_KIND_LABELS, enumOptions,
} from '../../models/fitness.enums';
import { ClubPickerComponent } from '../shared/club-picker';
import { PageHelpComponent } from '../shared/page-help';

/**
 * Lockers, courts and anything else booked by the hour.
 *
 * The court grid is the shape people actually think in: resources down one side, the day along
 * the other, and an empty cell is a booking waiting to be made. A list of bookings sorted by time
 * answers a different question from the one anybody is asking at the desk.
 */
@Component({
  standalone: true,
  selector: 'lib-fitness-facilities',
  imports: [CommonModule, FormsModule, ClubPickerComponent, PageHelpComponent],
  templateUrl: './facilities.html',
  styleUrls: ['../fitness-shared.css', './facilities.css'],
})
export class FacilitiesComponent {
  private facilities = inject(FacilityService);
  private members = inject(MemberService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  banks: LockerBankDto[] = [];
  assignments: LockerAssignmentDto[] = [];
  grid: ResourceGridDto | null = null;
  loading = true;
  error = '';
  notice = '';
  clubId: string | null = null;

  tab: 'lockers' | 'courts' = 'lockers';
  forDate = new Date().toISOString().slice(0, 10);
  resourceKind: ResourceKind | null = null;

  /** Assigning a locker. */
  assigning: LockerDto | null = null;
  assignBank: LockerBankDto | null = null;
  member: MemberSummaryDto | null = null;
  memberSearch = '';
  memberResults: MemberSummaryDto[] = [];
  assignMonths = 1;
  busy = false;

  /** Booking a slot. */
  bookingSlot: ResourceGridSlotDto | null = null;
  bookingResourceId: string | null = null;
  bookingResourceName = '';

  readonly sizeLabels = LOCKER_SIZE_LABELS;
  readonly statusLabels = LOCKER_STATUS_LABELS;
  readonly kindLabels = RESOURCE_KIND_LABELS;
  readonly kindOptions = enumOptions(RESOURCE_KIND_LABELS);
  readonly LockerStatus = LockerStatus;
  readonly LockerSize = LockerSize;

  private searchTimer?: ReturnType<typeof setTimeout>;

  async onClub(id: string | null): Promise<void> {
    this.clubId = id;
    await this.load();
  }

  async load(): Promise<void> {
    if (!this.clubId) { this.loading = false; return; }

    this.loading = true;
    this.error = '';

    const [banks, assignments, grid] = await Promise.all([
      firstValueFrom(this.facilities.getLockerBanks(this.clubId)).catch(() => null),
      firstValueFrom(this.facilities.getLockerAssignments({
        clubId: this.clubId, activeOnly: true, size: 50,
      })).catch(() => null),
      firstValueFrom(this.facilities.getGrid(
        this.clubId, new Date(this.forDate).toISOString(), this.resourceKind ?? undefined,
      )).catch(() => null),
    ]);

    this.banks = banks?.data ?? [];
    this.assignments = assignments?.data ?? [];
    this.grid = grid?.data ?? null;

    if (!banks) this.error = 'Could not load the facilities.';

    this.loading = false;
    this.cdr.detectChanges();
  }

  shiftDay(days: number): void {
    const d = new Date(this.forDate);
    d.setDate(d.getDate() + days);
    this.forDate = d.toISOString().slice(0, 10);
    void this.load();
  }

  // ── Lockers ────────────────────────────────────────────────────────────

  startAssign(bank: LockerBankDto, locker: LockerDto): void {
    if (locker.status !== LockerStatus.Free) return;
    this.assigning = locker;
    this.assignBank = bank;
    this.member = null;
    this.memberSearch = '';
    this.memberResults = [];
    this.assignMonths = 1;
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

  async confirmAssign(): Promise<void> {
    if (!this.assigning || !this.member) return;

    const endsOn = new Date();
    endsOn.setMonth(endsOn.getMonth() + this.assignMonths);

    this.busy = true;
    const res = await firstValueFrom(this.facilities.assignLocker({
      lockerId: this.assigning.id,
      memberId: this.member.id,
      startsOn: new Date().toISOString(),
      endsOn: endsOn.toISOString(),
      isDayUse: false,
      deposit: this.assigning.deposit,
      autoRenews: true,
      chargeNow: true,
    } as never)).catch(() => null);

    this.busy = false;

    if (res?.data) {
      this.notice = `Locker ${this.assigning.number} assigned to `
        + `${this.member.preferredName || this.member.fullName}.`;
      this.assigning = null;
      await this.load();
    } else {
      this.error = 'Could not assign that locker.';
    }

    this.cdr.detectChanges();
  }

  async release(a: LockerAssignmentDto): Promise<void> {
    const res = await firstValueFrom(this.facilities.releaseLocker({
      assignmentId: a.id,
      keyReturned: true,
      depositReturned: a.depositHeld,
      wasReclaimed: false,
    } as never)).catch(() => null);

    if (res?.data) {
      this.notice = `Locker ${a.lockerNumber} released.`;
      await this.load();
    } else {
      this.error = 'Could not release that locker.';
    }
  }

  go(route: string): void { void this.router.navigateByUrl(route); }

  // ── Presentation ───────────────────────────────────────────────────────

  lockerClass(l: LockerDto): string {
    switch (l.status) {
      case LockerStatus.Free: return 'is-free';
      case LockerStatus.Rented: return 'is-taken';
      case LockerStatus.DayUse: return 'is-inuse';
      case LockerStatus.Reserved: return 'is-inuse';
      case LockerStatus.OutOfOrder: return 'is-out';
      default: return '';
    }
  }

  /** How full a bank is — the number that says whether to build more. */
  bankUsage(b: LockerBankDto): number {
    return b.occupancyPercent;
  }

  slotClass(s: ResourceGridSlotDto): string {
    if (s.bookingId) return 'is-booked';
    if (s.blockReason) return 'is-blocked';
    return 'is-free';
  }
}
