import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ScheduleService } from '../../services/fitness.services';
import { ClassBookingDto, ClassOccurrenceDetailDto } from '../../models/fitness.models';
import { BookingStatus, ClassOccurrenceStatus } from '../../models/fitness.enums';

/**
 * One class: the roster, the spot map and the register.
 *
 * Designed for the studio screen — an instructor marking people in with one hand while setting up
 * with the other. Names are large, the tap target is the whole row, and marking somebody in is
 * one tap with no confirmation, because the cost of a mis-tap is one more tap.
 *
 * Medical flags appear beside the names that carry them. That is the whole reason this screen
 * shows any health information at all: an instructor about to load a barbell needs to know about
 * the shoulder before the set, not after it.
 */
@Component({
  standalone: true,
  selector: 'lib-class-roster',
  imports: [CommonModule, FormsModule],
  templateUrl: './class-roster.html',
  styleUrls: ['../fitness-shared.css', './class-roster.css'],
})
export class ClassRosterComponent implements OnInit {
  private schedule = inject(ScheduleService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  occurrence: ClassOccurrenceDetailDto | null = null;
  loading = true;
  error = '';
  notice = '';
  saving = false;

  /** Local register state, applied in one call when the class is closed. */
  attended = new Set<string>();
  noShow = new Set<string>();

  /** Cancel dialog. */
  cancelling = false;
  cancelReason = '';
  notifyMembers = true;
  refundCredits = true;

  readonly BookingStatus = BookingStatus;
  readonly ClassOccurrenceStatus = ClassOccurrenceStatus;

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.error = 'No class was chosen.'; this.loading = false; return; }
    await this.load(id);
  }

  async load(id?: string): Promise<void> {
    const occurrenceId = id ?? this.occurrence?.id;
    if (!occurrenceId) return;

    this.loading = true;
    const res = await firstValueFrom(this.schedule.getOccurrence(occurrenceId)).catch(() => null);

    if (!res?.data) {
      this.error = 'Could not load that class.';
    } else {
      this.occurrence = res.data;
      this.attended = new Set(res.data.bookings.filter(b => b.status === BookingStatus.Attended).map(b => b.id));
      this.noShow = new Set(res.data.bookings.filter(b => b.status === BookingStatus.NoShow).map(b => b.id));
    }

    this.loading = false;
    this.cdr.detectChanges();
  }

  // ── Register ───────────────────────────────────────────────────────────

  /** One tap cycles: not marked → here → no-show → not marked. */
  cycle(b: ClassBookingDto): void {
    if (this.attended.has(b.id)) {
      this.attended.delete(b.id);
      this.noShow.add(b.id);
    } else if (this.noShow.has(b.id)) {
      this.noShow.delete(b.id);
    } else {
      this.attended.add(b.id);
    }
  }

  markAllHere(): void {
    for (const b of this.occurrence?.bookings ?? []) {
      if (b.status === BookingStatus.Cancelled || b.status === BookingStatus.LateCancelled) continue;
      this.attended.add(b.id);
      this.noShow.delete(b.id);
    }
  }

  async saveRegister(complete: boolean): Promise<void> {
    if (!this.occurrence) return;

    this.saving = true;
    const res = await firstValueFrom(this.schedule.markAttendance({
      classOccurrenceId: this.occurrence.id,
      attendedBookingIds: [...this.attended],
      noShowBookingIds: [...this.noShow],
      walkInMemberIds: [],
      completeClass: complete,
    })).catch(() => null);

    this.saving = false;

    if (res?.data) {
      this.occurrence = res.data;
      this.notice = complete ? 'Class closed and the register saved.' : 'Register saved.';
    } else {
      this.error = 'Could not save the register.';
    }

    this.cdr.detectChanges();
  }

  // ── Cancelling ─────────────────────────────────────────────────────────

  async confirmCancel(): Promise<void> {
    if (!this.occurrence || this.cancelReason.trim().length < 3) return;

    this.saving = true;
    const res = await firstValueFrom(this.schedule.cancelOccurrence({
      occurrenceId: this.occurrence.id,
      reason: this.cancelReason.trim(),
      notifyBookedMembers: this.notifyMembers,
      refundCredits: this.refundCredits,
    })).catch(() => null);

    this.saving = false;

    if (res?.data) {
      this.occurrence = res.data;
      this.cancelling = false;
      this.notice = 'Class cancelled. Everyone booked has been told and their credits returned.';
    } else {
      this.error = 'Could not cancel that class.';
    }

    this.cdr.detectChanges();
  }

  go(route: string): void { void this.router.navigateByUrl(route); }

  // ── Presentation ───────────────────────────────────────────────────────

  get liveBookings(): ClassBookingDto[] {
    return (this.occurrence?.bookings ?? []).filter(
      b => b.status !== BookingStatus.Cancelled && b.status !== BookingStatus.LateCancelled,
    );
  }

  get markedCount(): number { return this.attended.size; }

  state(b: ClassBookingDto): 'here' | 'noshow' | 'unmarked' {
    if (this.attended.has(b.id)) return 'here';
    if (this.noShow.has(b.id)) return 'noshow';
    return 'unmarked';
  }

  spotFor(b: ClassBookingDto): string {
    return b.spotLabel ?? '';
  }

  initials(name: string | null | undefined): string {
    if (!name) return '?';
    return name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();
  }
}
