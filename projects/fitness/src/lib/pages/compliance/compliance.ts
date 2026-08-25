import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ComplianceService } from '../../services/fitness.services';
import {
  ComplaintDto, FacilityCheckDto, IncidentDto, LostPropertyItemDto, SaveIncidentDto,
} from '../../models/fitness.models';
import {
  ComplaintStatus, COMPLAINT_STATUS_LABELS, IncidentKind, INCIDENT_KIND_LABELS,
  IncidentSeverity, INCIDENT_SEVERITY_LABELS, IncidentStatus, INCIDENT_STATUS_LABELS,
  LOST_PROPERTY_STATUS_LABELS, enumOptions,
} from '../../models/fitness.enums';
import { ClubPickerComponent } from '../shared/club-picker';
import { PageHelpComponent } from '../shared/page-help';
import { FieldErrorComponent, FieldErrors, required, validate } from '../shared/validation';

/**
 * Incidents, complaints, lost property and the daily safety checks.
 *
 * This is the part of the app that exists because something went wrong once. An incident cannot
 * be closed until its follow-up actions are complete and a root cause is written — not to be
 * bureaucratic, but because an incident report that can be closed with a shrug is a report nobody
 * learns anything from.
 *
 * These records survive a member asking to be erased, because the law requires the club to keep
 * them. The erasure screen says so; this one is where they live.
 */
@Component({
  standalone: true,
  selector: 'lib-fitness-compliance',
  imports: [CommonModule, FormsModule, ClubPickerComponent, PageHelpComponent, FieldErrorComponent],
  templateUrl: './compliance.html',
  styleUrls: ['../fitness-shared.css', './compliance.css'],
})
export class ComplianceComponent {
  private compliance = inject(ComplianceService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  incidents: IncidentDto[] = [];
  complaints: ComplaintDto[] = [];
  lostProperty: LostPropertyItemDto[] = [];
  checks: FacilityCheckDto[] = [];
  loading = true;
  error = '';
  notice = '';
  clubId: string | null = null;

  tab: 'incidents' | 'complaints' | 'checks' | 'lost' = 'incidents';

  /** New incident. */
  reporting = false;
  draft: SaveIncidentDto | null = null;
  errors: FieldErrors = {};
  saving = false;

  /** Closing an incident. */
  closing: IncidentDto | null = null;
  rootCause = '';
  preventiveAction = '';

  readonly kindLabels = INCIDENT_KIND_LABELS;
  readonly severityLabels = INCIDENT_SEVERITY_LABELS;
  readonly statusLabels = INCIDENT_STATUS_LABELS;
  readonly complaintLabels = COMPLAINT_STATUS_LABELS;
  readonly lostLabels = LOST_PROPERTY_STATUS_LABELS;
  readonly kindOptions = enumOptions(INCIDENT_KIND_LABELS);
  readonly severityOptions = enumOptions(INCIDENT_SEVERITY_LABELS);
  readonly IncidentStatus = IncidentStatus;
  readonly IncidentSeverity = IncidentSeverity;
  readonly ComplaintStatus = ComplaintStatus;

  async onClub(id: string | null): Promise<void> {
    this.clubId = id;
    await this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = '';

    const [incidents, complaints, lost, checks] = await Promise.all([
      firstValueFrom(this.compliance.getIncidents({ clubId: this.clubId ?? undefined, size: 50 }))
        .catch(() => null),
      firstValueFrom(this.compliance.getComplaints(this.clubId ?? undefined, undefined, { size: 50 }))
        .catch(() => null),
      firstValueFrom(this.compliance.getLostProperty(this.clubId ?? undefined, undefined, { size: 50 }))
        .catch(() => null),
      this.clubId
        ? firstValueFrom(this.compliance.getChecks(this.clubId, false)).catch(() => null)
        : Promise.resolve(null),
    ]);

    this.incidents = incidents?.data ?? [];
    this.complaints = complaints?.data ?? [];
    this.lostProperty = lost?.data ?? [];
    this.checks = checks?.data ?? [];

    if (!incidents) this.error = 'Could not load the compliance records.';

    this.loading = false;
    this.cdr.detectChanges();
  }

  // ── Reporting ──────────────────────────────────────────────────────────

  startReport(): void {
    this.reporting = true;
    this.errors = {};
    this.draft = {
      clubId: this.clubId ?? '',
      kind: IncidentKind.Injury,
      severity: IncidentSeverity.Minor,
      occurredAt: new Date().toISOString().slice(0, 16),
      summary: '',
      detail: null,
      immediateAction: null,
      firstAidGiven: false,
      aedUsed: false,
      ambulanceCalled: false,
      hospitalAttended: false,
      photoUrls: [],
      isReportable: false,
      insurerNotified: false,
      takeEquipmentOutOfService: false,
    } as unknown as SaveIncidentDto;
  }

  async saveIncident(): Promise<void> {
    if (!this.draft) return;

    this.errors = validate(this.draft as unknown as Record<string, unknown>, {
      summary: [required('A description of what happened')],
    });

    if (Object.keys(this.errors).length > 0) return;

    this.saving = true;
    const res = await firstValueFrom(this.compliance.saveIncident({
      ...this.draft,
      clubId: this.clubId ?? this.draft.clubId,
      occurredAt: new Date(this.draft.occurredAt).toISOString(),
    })).catch(() => null);

    this.saving = false;

    if (res?.data) {
      this.notice = res.data.isReportable
        ? `${res.data.incidentNumber} recorded. This one is reportable — follow-up actions have been raised.`
        : `${res.data.incidentNumber} recorded.`;
      this.reporting = false;
      await this.load();
    } else {
      this.error = 'Could not record that incident.';
    }

    this.cdr.detectChanges();
  }

  // ── Closing ────────────────────────────────────────────────────────────

  startClose(i: IncidentDto): void {
    this.closing = i;
    this.rootCause = '';
    this.preventiveAction = '';
  }

  async confirmClose(): Promise<void> {
    if (!this.closing || !this.rootCause.trim() || !this.preventiveAction.trim()) return;

    this.saving = true;
    const res = await firstValueFrom(this.compliance.closeIncident(
      this.closing.id, this.rootCause.trim(), this.preventiveAction.trim(),
    )).catch(() => null);

    this.saving = false;

    if (res?.data) {
      this.notice = `${this.closing.incidentNumber} closed.`;
      this.closing = null;
      await this.load();
    } else {
      this.error = 'Could not close that incident — check the follow-up actions are all done.';
    }

    this.cdr.detectChanges();
  }

  go(route: string): void { void this.router.navigateByUrl(route); }

  // ── Presentation ───────────────────────────────────────────────────────

  get openIncidents(): IncidentDto[] {
    return this.incidents.filter(i => i.status !== IncidentStatus.Closed);
  }

  get openComplaints(): ComplaintDto[] {
    return this.complaints.filter(c => c.status !== ComplaintStatus.Resolved
                                    && c.status !== ComplaintStatus.Closed);
  }

  incidentClass(i: IncidentDto): string {
    if (i.severity >= IncidentSeverity.Serious) return 'is-alert';
    if (i.status !== IncidentStatus.Closed) return 'is-warn';
    return '';
  }

  /** Whether an incident can be closed yet, and why not if it cannot. */
  blockedFrom(i: IncidentDto): string | null {
    if (i.openActions > 0) {
      return `${i.openActions} follow-up action${i.openActions === 1 ? '' : 's'} still open`;
    }
    return null;
  }

  checkClass(c: FacilityCheckDto): string {
    if (c.isOverdue) return 'is-alert';
    if (c.dueToday && !c.completedToday) return 'is-warn';
    return 'is-good';
  }
}
