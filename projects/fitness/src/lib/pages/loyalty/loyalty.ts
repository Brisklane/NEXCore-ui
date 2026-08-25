import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { RetentionService } from '../../services/fitness.services';
import { BadgeDto, ChallengeDto, LoyaltyTierDto } from '../../models/fitness.models';
import { CHALLENGE_METRIC_LABELS } from '../../models/fitness.enums';
import { ClubPickerComponent } from '../shared/club-picker';
import { PageHelpComponent } from '../shared/page-help';

/**
 * Points, tiers, challenges and badges.
 *
 * Points come from turning up rather than from spending, and that is the whole design. The
 * behaviour a gym wants to reward is the one that keeps a member: people who come three times a
 * week do not cancel. A scheme that rewards spending rewards the members who were never at risk.
 */
@Component({
  standalone: true,
  selector: 'lib-fitness-loyalty',
  imports: [CommonModule, FormsModule, ClubPickerComponent, PageHelpComponent],
  templateUrl: './loyalty.html',
  styleUrls: ['../fitness-shared.css', './loyalty.css'],
})
export class LoyaltyComponent {
  private retention = inject(RetentionService);
  private cdr = inject(ChangeDetectorRef);

  tiers: LoyaltyTierDto[] = [];
  challenges: ChallengeDto[] = [];
  badges: BadgeDto[] = [];
  loading = true;
  error = '';
  notice = '';
  clubId: string | null = null;

  tab: 'tiers' | 'challenges' | 'badges' = 'tiers';

  readonly metricLabels = CHALLENGE_METRIC_LABELS;

  async onClub(id: string | null): Promise<void> {
    this.clubId = id;
    await this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = '';

    const [tiers, challenges, badges] = await Promise.all([
      firstValueFrom(this.retention.getTiers(this.clubId ?? undefined)).catch(() => null),
      firstValueFrom(this.retention.getChallenges(this.clubId ?? undefined, false)).catch(() => null),
      firstValueFrom(this.retention.getBadges(this.clubId ?? undefined)).catch(() => null),
    ]);

    this.tiers = (tiers?.data ?? []).sort((a, b) => a.ordinal - b.ordinal);
    this.challenges = challenges?.data ?? [];
    this.badges = badges?.data ?? [];

    if (!tiers) this.error = 'Could not load the loyalty scheme.';

    this.loading = false;
    this.cdr.detectChanges();
  }

  // ── Presentation ───────────────────────────────────────────────────────

  get liveChallenges(): ChallengeDto[] {
    return this.challenges.filter(c => c.isRunning);
  }

  /** How far a tier sits along the ladder, for the visual step. */
  tierWidth(t: LoyaltyTierDto): number {
    const top = Math.max(1, ...this.tiers.map(x => x.pointsRequired));
    return Math.max(18, Math.round((t.pointsRequired / top) * 100));
  }

  challengeClass(c: ChallengeDto): string {
    if (c.isRunning) return 'is-good';
    if (new Date(c.endsOn) < new Date()) return '';
    return 'is-warn';
  }

  /** Days left, said the way somebody would say it. */
  timeLeft(c: ChallengeDto): string {
    const days = c.daysRemaining
      ?? Math.ceil((new Date(c.endsOn).getTime() - Date.now()) / 86_400_000);

    if (days < 0) return 'finished';
    if (days === 0) return 'ends today';
    if (days === 1) return 'ends tomorrow';
    return `${days} days left`;
  }

  /** What share of the people who entered actually finished. */
  completionPercent(c: ChallengeDto): number {
    return c.participantCount === 0
      ? 0
      : Math.round((c.completedCount / c.participantCount) * 100);
  }
}
