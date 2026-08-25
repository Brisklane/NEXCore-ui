import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ComplianceService } from '../../services/fitness.services';
import {
  MedicalClearanceDto, MemberSummaryDto, WaiverSignatureDto, WaiverTemplateDto,
} from '../../models/fitness.models';
import {
  ClearanceStatus, CLEARANCE_STATUS_LABELS, SIGNATURE_STATUS_LABELS,
} from '../../models/fitness.enums';
import { ClubPickerComponent } from '../shared/club-picker';
import { PageHelpComponent } from '../shared/page-help';

/**
 * Waivers, health screening and medical clearances.
 *
 * Editing a published waiver creates a new version rather than rewriting the old one. What
 * somebody signed in March is what they signed, and a waiver that can be silently amended
 * afterwards is worth nothing to anybody — least of all to the club relying on it.
 *
 * The outstanding list is the working screen: it is everybody who cannot get through the barrier
 * until they sign, which is the thing the desk deals with rather than the template library.
 */
@Component({
  standalone: true,
  selector: 'lib-fitness-waivers',
  imports: [CommonModule, FormsModule, ClubPickerComponent, PageHelpComponent],
  templateUrl: './waivers.html',
  styleUrls: ['../fitness-shared.css', './waivers.css'],
})
export class WaiversComponent {
  private compliance = inject(ComplianceService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  templates: WaiverTemplateDto[] = [];
  outstanding: MemberSummaryDto[] = [];
  signatures: WaiverSignatureDto[] = [];
  clearances: MedicalClearanceDto[] = [];
  loading = true;
  error = '';
  notice = '';
  clubId: string | null = null;

  tab: 'outstanding' | 'templates' | 'clearances' = 'outstanding';

  /** Template preview. */
  preview: WaiverTemplateDto | null = null;

  /** Clearance review. */
  reviewing: MedicalClearanceDto | null = null;
  reviewApproved = true;
  reviewNote = '';
  busy = false;

  readonly signatureLabels = SIGNATURE_STATUS_LABELS;
  readonly clearanceLabels = CLEARANCE_STATUS_LABELS;
  readonly ClearanceStatus = ClearanceStatus;

  async onClub(id: string | null): Promise<void> {
    this.clubId = id;
    await this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = '';

    const [templates, outstanding, clearances] = await Promise.all([
      firstValueFrom(this.compliance.getWaiverTemplates(this.clubId ?? undefined, false)).catch(() => null),
      firstValueFrom(this.compliance.getOutstandingWaivers(this.clubId ?? undefined, { size: 50 }))
        .catch(() => null),
      firstValueFrom(this.compliance.getClearances(this.clubId ?? undefined)).catch(() => null),
    ]);

    this.templates = templates?.data ?? [];
    this.outstanding = outstanding?.data ?? [];
    this.clearances = clearances?.data ?? [];

    if (!templates) this.error = 'Could not load waivers.';

    this.loading = false;
    this.cdr.detectChanges();
  }

  async publish(t: WaiverTemplateDto): Promise<void> {
    const res = await firstValueFrom(this.compliance.publishWaiver(t.id)).catch(() => null);

    if (res?.data) {
      this.notice = `${t.name} v${res.data.version} published. `
        + 'Members on the previous version will be asked to sign again.';
      await this.load();
    } else {
      this.error = 'Could not publish that waiver.';
    }
  }

  startReview(c: MedicalClearanceDto): void {
    this.reviewing = c;
    this.reviewApproved = true;
    this.reviewNote = '';
  }

  async confirmReview(): Promise<void> {
    if (!this.reviewing) return;

    this.busy = true;
    const res = await firstValueFrom(this.compliance.reviewClearance({
      clearanceId: this.reviewing.id,
      approve: this.reviewApproved,
      note: this.reviewNote.trim() || null,
    } as never)).catch(() => null);

    this.busy = false;

    if (res?.data) {
      this.notice = this.reviewApproved
        ? 'Cleared — their access is open.'
        : 'Recorded. Access stays closed until this is resolved.';
      this.reviewing = null;
      await this.load();
    } else {
      this.error = 'Could not record that.';
    }

    this.cdr.detectChanges();
  }

  go(route: string): void { void this.router.navigateByUrl(route); }

  // ── Presentation ───────────────────────────────────────────────────────

  get pendingClearances(): MedicalClearanceDto[] {
    return this.clearances.filter(c => c.status === ClearanceStatus.Submitted);
  }

  clearanceClass(c: MedicalClearanceDto): string {
    switch (c.status) {
      case ClearanceStatus.Approved: return 'is-good';
      case ClearanceStatus.Rejected: return 'is-alert';
      case ClearanceStatus.Submitted: return 'is-warn';
      default: return '';
    }
  }

  /** The version currently in force, which is what a new joiner signs. */
  get liveTemplate(): WaiverTemplateDto | null {
    const live = this.templates.filter(t => t.isPublished && t.isActive);
    return live.sort((a, b) => b.version - a.version)[0] ?? null;
  }
}
