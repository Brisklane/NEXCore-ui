import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ClubService, ScheduleService, StaffService } from '../../services/fitness.services';
import {
  ClassScheduleDto, ClassTypeDto, RoomDto, SaveClassScheduleDto,
  ScheduleConflictDto, StaffSummaryDto,
} from '../../models/fitness.models';
import { ClubPickerComponent } from '../shared/club-picker';
import { PageHelpComponent } from '../shared/page-help';

/**
 * The schedule builder — the recurring pattern behind the timetable.
 *
 * A schedule is the rule ("Spin, Tuesdays and Thursdays, 18:30, Studio 2, Amara") and the
 * timetable is what that rule generated. Editing the rule here changes the classes that have
 * not happened yet; it never rewrites a class members have already been to.
 *
 * Nothing reaches a member until it is published. Conflicts are checked first and blocking ones
 * stop the publish outright, because an instructor booked into two rooms at 18:30 is a problem
 * discovered at 18:29 by a room full of people otherwise.
 */
@Component({
  standalone: true,
  selector: 'lib-fitness-schedule',
  imports: [CommonModule, FormsModule, ClubPickerComponent, PageHelpComponent],
  templateUrl: './schedule.html',
  styleUrls: ['../fitness-shared.css', './schedule.css'],
})
export class ScheduleComponent {
  private schedules = inject(ScheduleService);
  private clubs = inject(ClubService);
  private staffApi = inject(StaffService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  rows: ClassScheduleDto[] = [];
  classTypes: ClassTypeDto[] = [];
  rooms: RoomDto[] = [];
  instructors: StaffSummaryDto[] = [];
  conflicts: ScheduleConflictDto[] = [];

  loading = true;
  error = '';
  notice = '';
  busy = false;
  clubId: string | null = null;

  seasonCode: string | null = null;
  showDraftsOnly = false;

  /** The schedule being written. Null when nothing is open. */
  draft: SaveClassScheduleDto | null = null;
  draftId: string | null = null;
  draftStartTime = '18:30';
  formError = '';

  /** Deleting asks what to do with the classes already generated. */
  deleting: ClassScheduleDto | null = null;
  cancelFuture = true;

  readonly dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  readonly dayLongNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  /** Monday first, which is how a timetable is read, but the bit is still 1 << DayOfWeek. */
  readonly weekOrder = [1, 2, 3, 4, 5, 6, 0];

  async onClub(id: string | null): Promise<void> {
    this.clubId = id;
    await this.load();
  }

  async load(): Promise<void> {
    if (!this.clubId) { this.loading = false; return; }

    this.loading = true;
    this.error = '';

    const [rows, types, rooms, staff, conflicts] = await Promise.all([
      firstValueFrom(this.schedules.getSchedules(this.clubId, this.seasonCode ?? undefined))
        .catch(() => null),
      firstValueFrom(this.schedules.getClassTypes(this.clubId)).catch(() => null),
      firstValueFrom(this.clubs.getRooms(this.clubId)).catch(() => null),
      firstValueFrom(this.staffApi.list({ clubId: this.clubId, activeOnly: true, size: 100 }))
        .catch(() => null),
      firstValueFrom(this.schedules.checkConflicts(this.clubId, this.seasonCode ?? undefined))
        .catch(() => null),
    ]);

    this.rows = rows?.data ?? [];
    this.classTypes = types?.data ?? [];
    this.rooms = (rooms?.data ?? []).filter(r => r.isActive);
    this.instructors = (staff?.data ?? []).filter(s => s.isBookable);
    this.conflicts = conflicts?.data ?? [];

    if (!rows) this.error = 'Could not load the schedules.';

    this.loading = false;
    this.cdr.detectChanges();
  }

  /**
   * Re-run the conflict check on demand.
   *
   * A manager who has just moved three classes wants to know now, not after a publish is refused.
   */
  async recheck(): Promise<void> {
    if (!this.clubId) return;

    this.busy = true;
    const res = await firstValueFrom(
      this.schedules.checkConflicts(this.clubId, this.seasonCode ?? undefined)).catch(() => null);
    this.busy = false;

    this.conflicts = res?.data ?? [];
    this.notice = this.conflicts.length === 0
      ? 'No conflicts. The timetable is clean.'
      : `${this.blocking.length} blocking, ${this.warnings.length} to look at.`;

    this.cdr.detectChanges();
  }

  // ── Writing a schedule ─────────────────────────────────────────────────

  create(): void {
    if (!this.clubId) return;

    const type = this.classTypes[0];
    const today = new Date();

    this.draftId = null;
    this.draftStartTime = '18:30';
    this.formError = '';
    this.draft = {
      clubId: this.clubId,
      classTypeId: type?.id ?? '',
      roomId: null,
      instructorStaffId: null,
      daysOfWeekMask: 0,
      startsAt: '18:30:00',
      durationMinutes: type?.defaultDurationMinutes ?? 45,
      capacity: type?.defaultCapacity ?? 20,
      marketplaceCapacity: 0,
      effectiveFrom: today.toISOString().slice(0, 10),
      effectiveTo: null,
      repeatEveryWeeks: 1,
      generateAheadDays: 60,
      // New schedules start unpublished. Nobody publishes a timetable they have not read back.
      isPublished: false,
      seasonCode: this.seasonCode,
    };
  }

  edit(row: ClassScheduleDto): void {
    this.draftId = row.id;
    this.draftStartTime = (row.startsAt ?? '18:30:00').slice(0, 5);
    this.formError = '';
    this.draft = {
      clubId: row.clubId,
      classTypeId: row.classTypeId,
      roomId: row.roomId ?? null,
      instructorStaffId: row.instructorStaffId ?? null,
      daysOfWeekMask: row.daysOfWeekMask,
      startsAt: row.startsAt,
      durationMinutes: row.durationMinutes,
      capacity: row.capacity,
      marketplaceCapacity: row.marketplaceCapacity,
      effectiveFrom: row.effectiveFrom.slice(0, 10),
      effectiveTo: row.effectiveTo ? row.effectiveTo.slice(0, 10) : null,
      repeatEveryWeeks: row.repeatEveryWeeks,
      generateAheadDays: row.generateAheadDays,
      isPublished: row.isPublished,
      seasonCode: row.seasonCode ?? null,
    };
  }

  /** A class type carries sensible defaults; picking one fills them in rather than making somebody type them. */
  onClassTypeChosen(): void {
    if (!this.draft) return;

    const type = this.classTypes.find(t => t.id === this.draft!.classTypeId);
    if (!type) return;

    this.draft.durationMinutes = type.defaultDurationMinutes;
    this.draft.capacity = type.defaultCapacity;
  }

  toggleDay(day: number): void {
    if (!this.draft) return;
    this.draft.daysOfWeekMask ^= 1 << day;
  }

  isDayOn(mask: number, day: number): boolean {
    return (mask & (1 << day)) !== 0;
  }

  async save(): Promise<void> {
    if (!this.draft) return;

    this.formError = '';

    if (!this.draft.classTypeId) { this.formError = 'Choose which class this is.'; return; }
    if (this.draft.daysOfWeekMask === 0) { this.formError = 'Pick at least one day of the week.'; return; }
    if (this.draft.capacity < 1) { this.formError = 'Capacity has to be at least one place.'; return; }

    if (this.draft.marketplaceCapacity > this.draft.capacity) {
      this.formError = 'Marketplace places cannot exceed the capacity of the class.';
      return;
    }

    if (this.draft.effectiveTo && this.draft.effectiveTo < this.draft.effectiveFrom) {
      this.formError = 'The schedule cannot end before it starts.';
      return;
    }

    this.draft.startsAt = `${this.draftStartTime}:00`;

    this.busy = true;
    const res = await firstValueFrom(
      this.schedules.saveSchedule(this.draft, this.draftId ?? undefined)).catch(() => null);
    this.busy = false;

    if (res?.data) {
      this.notice = this.draftId
        ? 'Schedule updated. Classes that have not happened yet were rebuilt.'
        : 'Schedule created. It is a draft until you publish it.';
      this.draft = null;
      this.draftId = null;
      await this.load();
    } else {
      this.formError = 'Could not save that schedule.';
    }

    this.cdr.detectChanges();
  }

  // ── Publishing ─────────────────────────────────────────────────────────

  /** Blocking conflicts that belong to this schedule. Publish is refused while any exist. */
  blockersFor(row: ClassScheduleDto): ScheduleConflictDto[] {
    return this.conflicts.filter(c => c.isBlocking && c.scheduleId === row.id);
  }

  async publish(row: ClassScheduleDto): Promise<void> {
    const blockers = this.blockersFor(row);
    if (blockers.length > 0) {
      this.error = `Cannot publish ${row.classTypeName}: ${blockers[0].message}`;
      this.cdr.detectChanges();
      return;
    }

    this.busy = true;
    const res = await firstValueFrom(this.schedules.publishSchedule(row.id)).catch(() => null);
    this.busy = false;

    if (res?.data) {
      this.notice = `${row.classTypeName} is live — members can book it now.`;
      await this.load();
    } else {
      this.error = 'Could not publish that schedule.';
    }

    this.cdr.detectChanges();
  }

  async confirmDelete(): Promise<void> {
    if (!this.deleting) return;

    const row = this.deleting;
    this.busy = true;
    const res = await firstValueFrom(
      this.schedules.deleteSchedule(row.id, this.cancelFuture)).catch(() => null);
    this.busy = false;

    if (res) {
      this.notice = this.cancelFuture
        ? `${row.classTypeName} removed and its future classes cancelled — anybody booked was told.`
        : `${row.classTypeName} removed. Classes already generated stay on the timetable.`;
      this.deleting = null;
      await this.load();
    } else {
      this.error = 'Could not remove that schedule.';
    }

    this.cdr.detectChanges();
  }

  go(route: string): void { void this.router.navigateByUrl(route); }

  // ── Presentation ───────────────────────────────────────────────────────

  get visible(): ClassScheduleDto[] {
    return this.showDraftsOnly ? this.rows.filter(r => !r.isPublished) : this.rows;
  }

  get drafts(): number { return this.rows.filter(r => !r.isPublished).length; }
  get published(): number { return this.rows.filter(r => r.isPublished).length; }

  get blocking(): ScheduleConflictDto[] { return this.conflicts.filter(c => c.isBlocking); }
  get warnings(): ScheduleConflictDto[] { return this.conflicts.filter(c => !c.isBlocking); }

  /** The schedules that run on a given weekday, earliest first. */
  onDay(day: number): ClassScheduleDto[] {
    return this.visible
      .filter(r => this.isDayOn(r.daysOfWeekMask, day))
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  }

  dayLabel(mask: number): string {
    const on = this.weekOrder.filter(d => this.isDayOn(mask, d));
    if (on.length === 7) return 'Every day';
    if (on.length === 0) return 'No days chosen';
    return on.map(d => this.dayNames[d]).join(', ');
  }

  time(value: string | null | undefined): string {
    return (value ?? '').slice(0, 5);
  }

  /** The time a class finishes, which is what tells a manager whether two of them overlap. */
  endTime(row: ClassScheduleDto): string {
    const [h, m] = this.time(row.startsAt).split(':').map(Number);
    const total = (h * 60 + m + row.durationMinutes) % (24 * 60);
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  }

  /** How far ahead classes have actually been created — the gap members would otherwise find. */
  generatedThroughLabel(row: ClassScheduleDto): string {
    if (!row.generatedThrough) return 'Nothing generated yet';

    const through = new Date(row.generatedThrough);
    const days = Math.round((through.getTime() - Date.now()) / 86_400_000);

    if (days < 0) return 'Generated up to a past date — republish to extend';
    if (days === 0) return 'Generated to today only';
    return `Generated ${days} days ahead`;
  }

  colourFor(row: ClassScheduleDto): string {
    return row.colourHex || '#2b7fff';
  }
}
