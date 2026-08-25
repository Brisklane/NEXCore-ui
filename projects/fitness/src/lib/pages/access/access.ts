import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AccessService } from '../../services/fitness.services';
import {
  AccessControllerDto, AccessEventDto, AccessRuleDto, DoorDto,
} from '../../models/fitness.models';
import {
  AccessDecision, ACCESS_DECISION_LABELS, ACCESS_DENIAL_REASON_LABELS,
  READER_DIRECTION_LABELS,
} from '../../models/fitness.enums';
import { ClubPickerComponent } from '../shared/club-picker';
import { PageHelpComponent } from '../shared/page-help';

/**
 * Doors, controllers and the rules that decide who gets through.
 *
 * The event log is the most-used part: when a member says "my card didn't work last Tuesday",
 * this is where the answer is, in a sentence rather than a code. Every refusal is stored with the
 * reason it was refused, so the conversation starts with a fact instead of an apology.
 *
 * A controller that stops sending a heartbeat is shown as offline here *and* on the dashboard,
 * because a barrier nobody knows is broken is a barrier that gets propped open.
 */
@Component({
  standalone: true,
  selector: 'lib-fitness-access',
  imports: [CommonModule, FormsModule, ClubPickerComponent, PageHelpComponent],
  templateUrl: './access.html',
  styleUrls: ['../fitness-shared.css', './access.css'],
})
export class AccessComponent {
  private access = inject(AccessService);
  private cdr = inject(ChangeDetectorRef);

  doors: DoorDto[] = [];
  controllers: AccessControllerDto[] = [];
  rules: AccessRuleDto[] = [];
  events: AccessEventDto[] = [];
  loading = true;
  error = '';
  notice = '';
  clubId: string | null = null;

  tab: 'events' | 'doors' | 'rules' = 'events';
  decisionFilter: AccessDecision | null = null;

  /** Hold-open dialog. */
  releasing: DoorDto | null = null;
  releaseReason = '';
  saving = false;

  readonly decisionLabels = ACCESS_DECISION_LABELS;
  readonly denialLabels = ACCESS_DENIAL_REASON_LABELS;
  readonly directionLabels = READER_DIRECTION_LABELS;
  readonly AccessDecision = AccessDecision;

  async onClub(id: string | null): Promise<void> {
    this.clubId = id;
    await this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = '';

    const [doors, controllers, rules, events] = await Promise.all([
      firstValueFrom(this.access.getDoors(this.clubId ?? undefined)).catch(() => null),
      firstValueFrom(this.access.getControllers(this.clubId ?? undefined)).catch(() => null),
      firstValueFrom(this.access.getRules(this.clubId ?? undefined)).catch(() => null),
      firstValueFrom(this.access.getEvents({
        clubId: this.clubId ?? undefined,
        decision: this.decisionFilter ?? undefined,
        size: 60,
      })).catch(() => null),
    ]);

    this.doors = doors?.data ?? [];
    this.controllers = controllers?.data ?? [];
    this.rules = rules?.data ?? [];
    this.events = events?.data ?? [];

    if (!doors) this.error = 'Could not load access control.';

    this.loading = false;
    this.cdr.detectChanges();
  }

  async release(): Promise<void> {
    if (!this.releasing || this.releaseReason.trim().length < 3) return;

    this.saving = true;
    const res = await firstValueFrom(
      this.access.releaseDoor(this.releasing.id, this.releaseReason.trim()),
    ).catch(() => null);

    this.saving = false;

    if (res?.data) {
      this.notice = `${this.releasing.name} held open. This is recorded against your name.`;
      this.releasing = null;
      this.releaseReason = '';
      await this.load();
    } else {
      this.error = 'Could not release that door.';
    }

    this.cdr.detectChanges();
  }

  // ── Presentation ───────────────────────────────────────────────────────

  get offlineControllers(): AccessControllerDto[] {
    return this.controllers.filter(c => !c.isOnline);
  }

  decisionClass(e: AccessEventDto): string {
    if (e.decision === AccessDecision.Denied) return 'is-alert';
    if (e.decision === AccessDecision.ManualOverride) return 'is-warn';
    return '';
  }

  /** The sentence a member would be told, rather than the enum name. */
  eventReason(e: AccessEventDto): string {
    if (e.decision === AccessDecision.Denied) return e.decisionMessage || this.denialLabels[e.denialReason];
    if (e.decision === AccessDecision.ManualOverride) return e.overrideReason || 'Let in by staff';
    return e.decisionMessage || 'Let in';
  }

  heartbeat(c: AccessControllerDto): string {
    if (!c.lastHeartbeatAt) return 'never heard from';
    const minutes = Math.round((Date.now() - new Date(c.lastHeartbeatAt).getTime()) / 60000);
    if (minutes < 2) return 'just now';
    if (minutes < 60) return `${minutes} min ago`;
    return `${Math.round(minutes / 60)}h ago`;
  }
}
