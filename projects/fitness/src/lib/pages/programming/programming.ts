import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { TrainingService } from '../../services/fitness.services';
import {
  ProgramDayDto, ProgramTrackDto, WodBoardDto, WorkoutDto,
} from '../../models/fitness.models';
import { SCORE_TYPE_LABELS, WORKOUT_SECTION_KIND_LABELS } from '../../models/fitness.enums';
import { ClubPickerComponent } from '../shared/club-picker';
import { PageHelpComponent } from '../shared/page-help';

/**
 * What the club is training this week, by track.
 *
 * Sessions are held back until published. A coach writing Thursday's workout on Tuesday does not
 * want members reading it and turning up having already done half of it — so the draft is visible
 * to staff and invisible to everybody else until somebody presses publish.
 */
@Component({
  standalone: true,
  selector: 'lib-fitness-programming',
  imports: [CommonModule, FormsModule, ClubPickerComponent, PageHelpComponent],
  templateUrl: './programming.html',
  styleUrls: ['../fitness-shared.css', './programming.css'],
})
export class ProgrammingComponent {
  private training = inject(TrainingService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  tracks: ProgramTrackDto[] = [];
  days: ProgramDayDto[] = [];
  workouts: WorkoutDto[] = [];
  board: WodBoardDto | null = null;
  loading = true;
  error = '';
  notice = '';
  clubId: string | null = null;

  tab: 'week' | 'board' | 'library' = 'week';
  weekStart = this.mondayOf(new Date());
  trackId: string | null = null;
  busy = false;

  readonly sectionLabels = WORKOUT_SECTION_KIND_LABELS;
  readonly scoreLabels = SCORE_TYPE_LABELS;

  async onClub(id: string | null): Promise<void> {
    this.clubId = id;
    await this.load();
  }

  async load(): Promise<void> {
    if (!this.clubId) { this.loading = false; return; }

    this.loading = true;
    this.error = '';

    const to = new Date(this.weekStart);
    to.setDate(to.getDate() + 7);

    const [tracks, days, workouts, board] = await Promise.all([
      firstValueFrom(this.training.getTracks(this.clubId)).catch(() => null),
      firstValueFrom(this.training.getProgramming(
        this.clubId, this.weekStart.toISOString(), to.toISOString(), this.trackId ?? undefined,
      )).catch(() => null),
      firstValueFrom(this.training.getWorkouts({ clubId: this.clubId, size: 40 })).catch(() => null),
      firstValueFrom(this.training.getWodBoard(this.clubId, new Date().toISOString())).catch(() => null),
    ]);

    this.tracks = tracks?.data ?? [];
    this.days = days?.data ?? [];
    this.workouts = workouts?.data ?? [];
    this.board = board?.data ?? null;

    if (!tracks) this.error = 'Could not load the programming.';

    this.loading = false;
    this.cdr.detectChanges();
  }

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

  async publish(day: ProgramDayDto): Promise<void> {
    this.busy = true;
    const res = await firstValueFrom(this.training.publishProgramDay(day.id)).catch(() => null);
    this.busy = false;

    if (res?.data) {
      this.notice = `${new Date(day.scheduledOn).toLocaleDateString()} published — members can see it now.`;
      await this.load();
    } else {
      this.error = 'Could not publish that day.';
    }

    this.cdr.detectChanges();
  }

  go(route: string): void { void this.router.navigateByUrl(route); }

  // ── Presentation ───────────────────────────────────────────────────────

  get weekDays(): Date[] {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(this.weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }

  daysOn(day: Date): ProgramDayDto[] {
    const key = day.toDateString();
    return this.days.filter(d => new Date(d.scheduledOn).toDateString() === key);
  }

  isToday(day: Date): boolean {
    return day.toDateString() === new Date().toDateString();
  }

  /** Unpublished days a coach still has to release before the week starts. */
  get unpublished(): number {
    return this.days.filter(d => !d.isPublished).length;
  }

  private mondayOf(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d;
  }
}
