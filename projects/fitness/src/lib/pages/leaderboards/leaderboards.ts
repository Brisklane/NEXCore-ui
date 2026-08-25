import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { TrainingService } from '../../services/fitness.services';
import { LeaderboardDto, WorkoutDto, WorkoutResultDto } from '../../models/fitness.models';
import { SCORE_TYPE_LABELS } from '../../models/fitness.enums';
import { ClubPickerComponent } from '../shared/club-picker';
import { PageHelpComponent } from '../shared/page-help';

/**
 * Scores, records and the board.
 *
 * Every score is normalised into one comparable number when it is written, which is why a
 * leaderboard for a workout scored in rounds-and-reps sorts correctly beside one scored for time.
 * Parsing "4 rounds + 7 reps" at read time is how boards end up subtly wrong and nobody notices.
 *
 * Members who have opted out of leaderboards do not appear on one. Not dimmed, not anonymised —
 * absent. Somebody who does not want their name on a screen in a gym has a good reason.
 */
@Component({
  standalone: true,
  selector: 'lib-fitness-leaderboards',
  imports: [CommonModule, FormsModule, ClubPickerComponent, PageHelpComponent],
  templateUrl: './leaderboards.html',
  styleUrls: ['../fitness-shared.css', './leaderboards.css'],
})
export class LeaderboardsComponent {
  private training = inject(TrainingService);
  private cdr = inject(ChangeDetectorRef);

  board: LeaderboardDto | null = null;
  workouts: WorkoutDto[] = [];
  recent: WorkoutResultDto[] = [];
  loading = true;
  error = '';
  clubId: string | null = null;

  workoutId: string | null = null;
  division: string | null = null;

  readonly scoreLabels = SCORE_TYPE_LABELS;
  readonly divisions = ['Rx', 'Scaled', 'Masters'];

  async onClub(id: string | null): Promise<void> {
    this.clubId = id;
    await this.loadWorkouts();
    await this.load();
  }

  private async loadWorkouts(): Promise<void> {
    const res = await firstValueFrom(this.training.getWorkouts({
      clubId: this.clubId ?? undefined,
      benchmarksOnly: true,
      size: 40,
    })).catch(() => null);

    this.workouts = res?.data ?? [];
    if (!this.workoutId) this.workoutId = this.workouts[0]?.id ?? null;
  }

  async load(): Promise<void> {
    if (!this.clubId) { this.loading = false; return; }

    this.loading = true;
    this.error = '';

    const [board, recent] = await Promise.all([
      firstValueFrom(this.training.getLeaderboard({
        clubId: this.clubId,
        workoutId: this.workoutId ?? undefined,
        division: this.division ?? undefined,
      })).catch(() => null),
      firstValueFrom(this.training.getResults({
        clubId: this.clubId,
        workoutId: this.workoutId ?? undefined,
        size: 30,
      })).catch(() => null),
    ]);

    this.board = board?.data ?? null;
    this.recent = recent?.data ?? [];

    if (!board) this.error = 'Could not load the leaderboard.';

    this.loading = false;
    this.cdr.detectChanges();
  }

  // ── Presentation ───────────────────────────────────────────────────────

  get chosenWorkout(): WorkoutDto | null {
    return this.workouts.find(w => w.id === this.workoutId) ?? null;
  }

  /** Medal colouring for the top three, plus a plain rank for everyone else. */
  rankClass(rank: number): string {
    if (rank === 1) return 'is-first';
    if (rank === 2) return 'is-second';
    if (rank === 3) return 'is-third';
    return '';
  }

  initials(name: string): string {
    return name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();
  }
}
