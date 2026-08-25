import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MemberService, ScheduleService } from '../../services/fitness.services';
import {
  BookingEligibilityDto, ClassOccurrenceSummaryDto, MemberSummaryDto, TimetableDto,
} from '../../models/fitness.models';
import { BookingChannel, ClassOccurrenceStatus } from '../../models/fitness.enums';
import { ClubPickerComponent } from '../shared/club-picker';
import { PageHelpComponent } from '../shared/page-help';

/**
 * The published timetable, and every booking on it.
 *
 * Laid out as a week of columns because that is how a member reads a timetable and how a manager
 * reads their week. On a phone it becomes one day at a time rather than a squashed week — seven
 * columns at 380px is unreadable no matter how carefully it is designed.
 *
 * Fill is shown as a bar *and* as "14/20". Those are different facts: the bar is for scanning a
 * week at once, the number is for answering "is there space for my friend".
 */
@Component({
  standalone: true,
  selector: 'lib-fitness-timetable',
  imports: [CommonModule, FormsModule, ClubPickerComponent, PageHelpComponent],
  templateUrl: './timetable.html',
  styleUrls: ['../fitness-shared.css', './timetable.css'],
})
export class TimetableComponent implements OnInit {
  private schedule = inject(ScheduleService);
  private members = inject(MemberService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  data: TimetableDto | null = null;
  loading = true;
  error = '';
  notice = '';
  clubId: string | null = null;

  /** Monday of the week being shown. */
  weekStart = this.mondayOf(new Date());

  classTypeId: string | null = null;
  instructorStaffId: string | null = null;
  roomId: string | null = null;

  /**
   * When a member is chosen, the whole timetable is answered from their point of view — what they
   * are already booked into, and what they are allowed to book. Arrives as a query parameter from
   * the member record, so "book a class for this person" is one click from where they are.
   */
  viewerMember: MemberSummaryDto | null = null;
  memberSearch = '';
  memberResults: MemberSummaryDto[] = [];

  /** Booking dialog. */
  bookingFor: ClassOccurrenceSummaryDto | null = null;
  eligibility: BookingEligibilityDto | null = null;
  chosenSpotId: string | null = null;
  booking = false;

  readonly ClassOccurrenceStatus = ClassOccurrenceStatus;

  private searchTimer?: ReturnType<typeof setTimeout>;

  async ngOnInit(): Promise<void> {
    const memberId = this.route.snapshot.queryParamMap.get('memberId');
    if (memberId) {
      const res = await firstValueFrom(this.members.getById(memberId)).catch(() => null);
      if (res?.data) {
        this.viewerMember = {
          id: res.data.id,
          fullName: res.data.fullName,
          preferredName: res.data.preferredName,
          memberNumber: res.data.memberNumber,
        } as MemberSummaryDto;
      }
    }
  }

  async onClub(id: string | null): Promise<void> {
    this.clubId = id;
    await this.load();
  }

  async load(): Promise<void> {
    if (!this.clubId) { this.loading = false; return; }

    this.loading = true;
    this.error = '';

    const from = this.weekStart;
    const to = new Date(from);
    to.setDate(to.getDate() + 7);

    const res = await firstValueFrom(this.schedule.getTimetable({
      clubId: this.clubId,
      from: from.toISOString(),
      to: to.toISOString(),
      classTypeId: this.classTypeId ?? undefined,
      instructorStaffId: this.instructorStaffId ?? undefined,
      roomId: this.roomId ?? undefined,
      viewerMemberId: this.viewerMember?.id ?? undefined,
    })).catch(() => null);

    if (!res?.data) this.error = 'Could not load the timetable.';
    else this.data = res.data;

    this.loading = false;
    this.cdr.detectChanges();
  }

  // ── Week navigation ────────────────────────────────────────────────────

  shiftWeek(weeks: number): void {
    const next = new Date(this.weekStart);
    next.setDate(next.getDate() + weeks * 7);
    this.weekStart = next;
    void this.load();
  }

  thisWeek(): void {
    this.weekStart = this.mondayOf(new Date());
    void this.load();
  }

  /** The seven dates of the week on show. */
  get days(): Date[] {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(this.weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }

  classesOn(day: Date): ClassOccurrenceSummaryDto[] {
    const key = this.dayKey(day);
    return (this.data?.occurrences ?? [])
      .filter(o => this.dayKey(new Date(o.startsAt)) === key)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  }

  isToday(day: Date): boolean {
    return this.dayKey(day) === this.dayKey(new Date());
  }

  // ── Member context ─────────────────────────────────────────────────────

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
    this.viewerMember = m;
    this.memberSearch = '';
    this.memberResults = [];
    void this.load();
  }

  clearMember(): void {
    this.viewerMember = null;
    void this.load();
  }

  // ── Booking ────────────────────────────────────────────────────────────

  async openBooking(o: ClassOccurrenceSummaryDto): Promise<void> {
    if (!this.viewerMember) { this.go('/fitness/classes/' + o.id); return; }

    this.bookingFor = o;
    this.eligibility = null;
    this.chosenSpotId = null;

    const res = await firstValueFrom(
      this.schedule.checkEligibility(o.id, this.viewerMember.id),
    ).catch(() => null);

    this.eligibility = res?.data ?? null;
    this.cdr.detectChanges();
  }

  async confirmBooking(joinWaitlist = false): Promise<void> {
    if (!this.bookingFor || !this.viewerMember) return;

    this.booking = true;
    const res = await firstValueFrom(this.schedule.book({
      classOccurrenceId: this.bookingFor.id,
      memberId: this.viewerMember.id,
      spotId: this.chosenSpotId,
      channel: BookingChannel.FrontDesk,
      joinWaitlistIfFull: joinWaitlist,
      overridePolicy: false,
    })).catch(() => null);

    this.booking = false;

    if (res?.data) {
      this.notice = joinWaitlist
        ? `${this.viewerMember.preferredName || this.viewerMember.fullName} is on the waitlist.`
        : `Booked ${this.bookingFor.classTypeName}.`;
      this.bookingFor = null;
      await this.load();
    } else {
      this.error = 'That booking did not go through.';
    }

    this.cdr.detectChanges();
  }

  closeBooking(): void {
    this.bookingFor = null;
    this.eligibility = null;
  }

  go(route: string): void { void this.router.navigateByUrl(route); }

  // ── Presentation ───────────────────────────────────────────────────────

  fillClass(o: ClassOccurrenceSummaryDto): string {
    if (o.fillPercent >= 100) return 'is-full';
    if (o.fillPercent < 35) return 'is-quiet';
    return '';
  }

  private mondayOf(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - day);
    return d;
  }

  private dayKey(d: Date): string {
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }
}
