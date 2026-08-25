import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AppointmentService, CatalogueService, MemberService } from '../../services/fitness.services';
import {
  AppointmentServiceDto, AppointmentSummaryDto, AvailabilitySlotDto,
  BookableStaffDto, MemberSummaryDto, TrainerDayDto,
} from '../../models/fitness.models';
import { AppointmentStatus, APPOINTMENT_STATUS_LABELS } from '../../models/fitness.enums';
import { ClubPickerComponent } from '../shared/club-picker';
import { PageHelpComponent } from '../shared/page-help';

/**
 * The trainer's diary.
 *
 * Two things happen here that do not happen anywhere else in the app. Finding a slot offers the
 * member's own coach first, because continuity is most of what somebody is paying a trainer for.
 * And signing a session off is one action that consumes the credit, accrues the trainer's
 * commission and releases the deferred revenue together — doing any one of those without the
 * others leaves the books wrong.
 */
@Component({
  standalone: true,
  selector: 'lib-fitness-appointments',
  imports: [CommonModule, FormsModule, ClubPickerComponent, PageHelpComponent],
  templateUrl: './appointments.html',
  styleUrls: ['../fitness-shared.css', './appointments.css'],
})
export class AppointmentsComponent {
  private appointments = inject(AppointmentService);
  private catalogue = inject(CatalogueService);
  private members = inject(MemberService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  diary: AppointmentSummaryDto[] = [];
  trainers: BookableStaffDto[] = [];
  services: AppointmentServiceDto[] = [];
  trainerDay: TrainerDayDto | null = null;
  loading = true;
  error = '';
  notice = '';
  clubId: string | null = null;

  forDate = new Date().toISOString().slice(0, 10);
  staffId: string | null = null;

  /** Booking flow. */
  booking = false;
  serviceId: string | null = null;
  member: MemberSummaryDto | null = null;
  memberSearch = '';
  memberResults: MemberSummaryDto[] = [];
  slots: AvailabilitySlotDto[] = [];
  searchingSlots = false;
  chosenSlot: AvailabilitySlotDto | null = null;
  saving = false;

  /** Sign-off. */
  signingOff: AppointmentSummaryDto | null = null;
  sessionNotes = '';
  memberProgressed = true;

  readonly statusLabels = APPOINTMENT_STATUS_LABELS;
  readonly AppointmentStatus = AppointmentStatus;

  private searchTimer?: ReturnType<typeof setTimeout>;

  async onClub(id: string | null): Promise<void> {
    this.clubId = id;
    this.staffId = this.route.snapshot.queryParamMap.get('staffId');
    await this.load();
  }

  async load(): Promise<void> {
    if (!this.clubId) { this.loading = false; return; }

    this.loading = true;
    this.error = '';

    const [diary, trainers, services] = await Promise.all([
      firstValueFrom(this.appointments.getDiary(
        this.clubId, new Date(this.forDate).toISOString(), this.staffId ?? undefined,
      )).catch(() => null),
      firstValueFrom(this.appointments.getBookableStaff(this.clubId)).catch(() => null),
      firstValueFrom(this.catalogue.getServices(this.clubId)).catch(() => null),
    ]);

    this.diary = diary?.data ?? [];
    this.trainers = trainers?.data ?? [];
    this.services = services?.data ?? [];

    if (this.staffId) {
      const day = await firstValueFrom(
        this.appointments.getTrainerDay(this.staffId, new Date(this.forDate).toISOString()),
      ).catch(() => null);
      this.trainerDay = day?.data ?? null;
    } else {
      this.trainerDay = null;
    }

    if (!diary) this.error = 'Could not load the diary.';

    this.loading = false;
    this.cdr.detectChanges();
  }

  shiftDay(days: number): void {
    const d = new Date(this.forDate);
    d.setDate(d.getDate() + days);
    this.forDate = d.toISOString().slice(0, 10);
    void this.load();
  }

  today(): void {
    this.forDate = new Date().toISOString().slice(0, 10);
    void this.load();
  }

  // ── Booking ────────────────────────────────────────────────────────────

  startBooking(): void {
    this.booking = true;
    this.serviceId = this.services[0]?.id ?? null;
    this.member = null;
    this.memberSearch = '';
    this.slots = [];
    this.chosenSlot = null;
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

  async chooseMember(m: MemberSummaryDto): Promise<void> {
    this.member = m;
    this.memberSearch = '';
    this.memberResults = [];
    await this.findSlots();
  }

  async findSlots(): Promise<void> {
    if (!this.clubId || !this.serviceId) return;

    this.searchingSlots = true;
    const from = new Date(this.forDate);
    const to = new Date(from);
    to.setDate(to.getDate() + 7);

    const res = await firstValueFrom(this.appointments.findAvailability({
      clubId: this.clubId,
      serviceId: this.serviceId,
      memberId: this.member?.id ?? null,
      staffId: this.staffId,
      from: from.toISOString(),
      to: to.toISOString(),
      anyStaff: !this.staffId,
    } as never)).catch(() => null);

    this.slots = res?.data ?? [];
    this.searchingSlots = false;
    this.cdr.detectChanges();
  }

  async confirmBooking(): Promise<void> {
    if (!this.chosenSlot || !this.member || !this.serviceId || !this.clubId) return;

    this.saving = true;
    const res = await firstValueFrom(this.appointments.create({
      clubId: this.clubId,
      serviceId: this.serviceId,
      staffId: this.chosenSlot.staffId,
      memberId: this.member.id,
      startsAt: this.chosenSlot.startsAt,
    } as never)).catch(() => null);

    this.saving = false;

    if (res?.data) {
      this.notice = `Booked ${this.member.preferredName || this.member.fullName} in with ${this.chosenSlot.staffName}.`;
      this.booking = false;
      await this.load();
    } else {
      this.error = 'That booking did not go through.';
    }

    this.cdr.detectChanges();
  }

  // ── Sign-off ───────────────────────────────────────────────────────────

  startSignOff(a: AppointmentSummaryDto): void {
    this.signingOff = a;
    this.sessionNotes = '';
    this.memberProgressed = true;
  }

  async confirmSignOff(): Promise<void> {
    if (!this.signingOff) return;

    this.saving = true;
    const res = await firstValueFrom(this.appointments.signOff({
      appointmentId: this.signingOff.id,
      memberId: this.signingOff.memberId,
      sessionNotes: this.sessionNotes.trim() || null,
      memberConfirmed: this.memberProgressed,
      creditsConsumed: 1,
    } as never)).catch(() => null);

    this.saving = false;

    if (res?.data) {
      this.notice = 'Signed off — credit used and commission accrued.';
      this.signingOff = null;
      await this.load();
    } else {
      this.error = 'Could not sign that session off.';
    }

    this.cdr.detectChanges();
  }

  async checkIn(a: AppointmentSummaryDto): Promise<void> {
    const res = await firstValueFrom(this.appointments.checkIn(a.id, a.memberId ?? undefined))
      .catch(() => null);
    if (res?.data) await this.load();
    else this.error = 'Could not check them in.';
  }

  async markNoShow(a: AppointmentSummaryDto): Promise<void> {
    const res = await firstValueFrom(this.appointments.markNoShow(a.id, a.memberId ?? undefined, false))
      .catch(() => null);
    if (res?.data) {
      this.notice = 'Recorded as a no-show. The credit is consumed unless you waive it on their record.';
      await this.load();
    } else {
      this.error = 'Could not record that.';
    }
  }

  go(route: string): void { void this.router.navigateByUrl(route); }

  // ── Presentation ───────────────────────────────────────────────────────

  statusClass(a: AppointmentSummaryDto): string {
    switch (a.status) {
      case AppointmentStatus.Completed: return 'is-good';
      case AppointmentStatus.NoShow: return 'is-alert';
      case AppointmentStatus.Cancelled: return 'is-warn';
      default: return '';
    }
  }

  /** Slots grouped by day, so a week of availability reads as a week. */
  get slotsByDay(): { label: string; slots: AvailabilitySlotDto[] }[] {
    const groups = new Map<string, AvailabilitySlotDto[]>();

    for (const s of this.slots) {
      const key = new Date(s.startsAt).toDateString();
      groups.set(key, [...(groups.get(key) ?? []), s]);
    }

    return [...groups.entries()].map(([label, slots]) => ({ label, slots }));
  }

  initials(name: string | null | undefined): string {
    if (!name) return '?';
    return name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();
  }
}
