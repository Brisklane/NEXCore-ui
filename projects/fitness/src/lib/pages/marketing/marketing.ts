import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { RetentionService } from '../../services/fitness.services';
import {
  CampaignDto, EngagementJourneyDto, MemberSummaryDto, MessageTemplateDto, SegmentDto,
} from '../../models/fitness.models';
import {
  JOURNEY_TRIGGER_LABELS, MessageChannel, MESSAGE_CHANNEL_LABELS,
} from '../../models/fitness.enums';
import { ClubPickerComponent } from '../shared/club-picker';
import { PageHelpComponent } from '../shared/page-help';

/**
 * Campaigns, journeys and segments.
 *
 * The rule this screen enforces above all others: a new journey is created **switched off**. An
 * automation that starts messaging two thousand members the moment somebody presses save is an
 * automation that gets the club reported, and no amount of undo afterwards fixes it.
 *
 * Consent and quiet hours are enforced on the server rather than here, so the same rules apply
 * however a message is triggered. This screen just makes both visible before anything is sent.
 */
@Component({
  standalone: true,
  selector: 'lib-fitness-marketing',
  imports: [CommonModule, FormsModule, ClubPickerComponent, PageHelpComponent],
  templateUrl: './marketing.html',
  styleUrls: ['../fitness-shared.css', './marketing.css'],
})
export class MarketingComponent {
  private retention = inject(RetentionService);
  private cdr = inject(ChangeDetectorRef);

  campaigns: CampaignDto[] = [];
  journeys: EngagementJourneyDto[] = [];
  segments: SegmentDto[] = [];
  templates: MessageTemplateDto[] = [];
  loading = true;
  error = '';
  notice = '';
  clubId: string | null = null;

  tab: 'campaigns' | 'journeys' | 'segments' = 'campaigns';

  /** Segment preview. */
  previewing: SegmentDto | null = null;
  previewMembers: MemberSummaryDto[] = [];
  previewTotal = 0;
  previewLoading = false;

  /** Sending. */
  sending: CampaignDto | null = null;
  busy = false;

  readonly channelLabels = MESSAGE_CHANNEL_LABELS;
  readonly triggerLabels = JOURNEY_TRIGGER_LABELS;
  readonly MessageChannel = MessageChannel;

  async onClub(id: string | null): Promise<void> {
    this.clubId = id;
    await this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = '';

    const [campaigns, journeys, segments, templates] = await Promise.all([
      firstValueFrom(this.retention.listCampaigns(this.clubId ?? undefined, { size: 40 })).catch(() => null),
      firstValueFrom(this.retention.getJourneys(this.clubId ?? undefined)).catch(() => null),
      firstValueFrom(this.retention.getSegments(this.clubId ?? undefined)).catch(() => null),
      firstValueFrom(this.retention.getTemplates(this.clubId ?? undefined)).catch(() => null),
    ]);

    this.campaigns = campaigns?.data ?? [];
    this.journeys = journeys?.data ?? [];
    this.segments = segments?.data ?? [];
    this.templates = templates?.data ?? [];

    if (!campaigns) this.error = 'Could not load marketing.';

    this.loading = false;
    this.cdr.detectChanges();
  }

  // ── Journeys ───────────────────────────────────────────────────────────

  async toggleJourney(j: EngagementJourneyDto): Promise<void> {
    const turningOn = !j.isActive;

    const res = await firstValueFrom(this.retention.setJourneyActive(j.id, turningOn))
      .catch(() => null);

    if (res?.data) {
      this.notice = turningOn
        ? `${j.name} is live. Members matching the trigger will start being enrolled.`
        : `${j.name} paused. Anyone part-way through stays where they are.`;
      await this.load();
    } else {
      this.error = 'Could not change that journey.';
    }
  }

  // ── Segments ───────────────────────────────────────────────────────────

  async previewSegment(s: SegmentDto): Promise<void> {
    this.previewing = s;
    this.previewLoading = true;
    this.previewMembers = [];

    const res = await firstValueFrom(this.retention.previewSegment(s.id, { size: 25 }))
      .catch(() => null);

    this.previewMembers = res?.data ?? [];
    this.previewTotal = res?.pagination?.totalCount ?? this.previewMembers.length;
    this.previewLoading = false;
    this.cdr.detectChanges();
  }

  // ── Campaigns ──────────────────────────────────────────────────────────

  async send(): Promise<void> {
    if (!this.sending) return;

    this.busy = true;
    const res = await firstValueFrom(this.retention.sendCampaign({
      campaignId: this.sending.id,
      testSendOnly: false,
    } as never)).catch(() => null);

    this.busy = false;

    if (res?.data) {
      const c = res.data;
      this.notice = `Sent to ${c.sentCount}. `
        + (c.suppressedCount > 0
          ? `${c.suppressedCount} were skipped — no consent, or it would have landed in quiet hours.`
          : '');
      this.sending = null;
      await this.load();
    } else {
      this.error = 'Could not send that campaign.';
    }

    this.cdr.detectChanges();
  }

  // ── Presentation ───────────────────────────────────────────────────────

  campaignClass(c: CampaignDto): string {
    if (c.sentAt) return 'is-good';
    return '';
  }

  /**
   * What the campaign was actually worth.
   *
   * Open rate is vanity next to this: a campaign that opens at 40% and converts nobody cost money
   * and achieved nothing.
   */
  worthIt(c: CampaignDto): string | null {
    if (!c.isSent) return null;
    if (c.joinsAttributed === 0 && c.revenueAttributed === 0) return null;

    const parts: string[] = [];
    if (c.joinsAttributed > 0) parts.push(`${c.joinsAttributed} joined`);
    if (c.revenueAttributed > 0) parts.push(`${c.revenueAttributed.toFixed(0)} attributed`);
    if (c.returnOnSpend != null && c.cost > 0) parts.push(`${c.returnOnSpend.toFixed(1)}x on spend`);

    return parts.join(' · ');
  }
}
