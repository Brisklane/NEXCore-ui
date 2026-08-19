import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { DistributionAdminService } from '../../services/distribution.services';
import { DistributionSettingsDto, ReasonCodeDto } from '../../models/distribution.models';
import {
  ALLOCATION_LABELS, ENFORCEMENT_LABELS, REASON_SURFACE_LABELS, ReasonSurface, enumOptions,
} from '../../models/distribution.enums';
import { PageHelpComponent } from '../shared/page-help';
import { ConfirmDialogComponent, EmptyStateComponent } from '../shared/ui-bits';
import { FieldErrorComponent, FieldErrors, notNegative, percent, required, validate } from '../shared/validation';

type Tab = 'field' | 'orders' | 'credit' | 'stock' | 'settlement' | 'schemes' | 'reasons';

/**
 * How this app behaves for your company.
 *
 * Grouped by where the setting bites rather than by data type, because the person changing a
 * variance tolerance is thinking about settlement, not about decimals. Every tolerance and
 * threshold says what it actually does, in a sentence, next to the field.
 *
 * Changing a tolerance never re-opens settled work. It applies from the next document, which is
 * the only behaviour that keeps a closed period closed.
 */
@Component({
  standalone: true,
  selector: 'lib-distribution-settings',
  imports: [
    CommonModule, FormsModule, PageHelpComponent,
    EmptyStateComponent, ConfirmDialogComponent, FieldErrorComponent,
  ],
  templateUrl: './settings.html',
  styleUrls: ['../distribution-shared.css', './settings.css'],
})
export class DistributionSettingsComponent implements OnInit {
  private admin = inject(DistributionAdminService);
  private cdr = inject(ChangeDetectorRef);

  tab: Tab = 'field';

  settings: DistributionSettingsDto | null = null;
  reasons: ReasonCodeDto[] = [];

  loading = true;
  saving = false;
  error = '';
  notice = '';

  surfaceFilter = '' as '' | number;

  showReason = false;
  reason: Partial<ReasonCodeDto> = this.blankReason();
  reasonErrors: FieldErrors = {};
  deleteTarget: ReasonCodeDto | null = null;

  readonly enforcementOptions = enumOptions(ENFORCEMENT_LABELS);
  readonly allocationOptions = enumOptions(ALLOCATION_LABELS);
  readonly surfaceOptions = enumOptions(REASON_SURFACE_LABELS);
  readonly surfaceLabels = REASON_SURFACE_LABELS;

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.cdr.detectChanges();

    const [settingsRes, reasonsRes] = await Promise.all([
      firstValueFrom(this.admin.settings()).catch(() => null),
      firstValueFrom(this.admin.reasons({})).catch(() => null),
    ]);

    this.settings = settingsRes?.data ?? null;
    this.reasons = reasonsRes?.data ?? [];
    if (!settingsRes?.data) this.error = 'Could not load the settings.';

    this.loading = false;
    this.cdr.detectChanges();
  }

  async save(): Promise<void> {
    if (!this.settings || this.saving) return;

    this.saving = true;
    this.error = '';
    this.cdr.detectChanges();

    const res = await firstValueFrom(this.admin.saveSettings(this.settings)).catch(() => null);

    if (res?.data) {
      this.settings = res.data;
      this.notice = 'Saved. These apply from the next document — nothing already settled changes.';
    } else {
      this.error = 'The settings could not be saved.';
    }

    this.saving = false;
    this.cdr.detectChanges();
  }

  // ── Reason codes ───────────────────────────────────────────────────────────

  get visibleReasons(): ReasonCodeDto[] {
    return this.reasons
      .filter(r => !this.surfaceFilter || r.surface === Number(this.surfaceFilter))
      .sort((a, b) => a.surface - b.surface || a.displayOrder - b.displayOrder);
  }

  /** Grouped so it reads as "the reasons that appear here", which is how people think about them. */
  get reasonGroups(): { surface: number; label: string; rows: ReasonCodeDto[] }[] {
    const map = new Map<number, ReasonCodeDto[]>();
    for (const r of this.visibleReasons) {
      map.set(r.surface, [...(map.get(r.surface) ?? []), r]);
    }

    return [...map.entries()]
      .map(([surface, rows]) => ({ surface, label: this.surfaceLabels[surface], rows }))
      .sort((a, b) => a.surface - b.surface);
  }

  private blankReason(): Partial<ReasonCodeDto> {
    return {
      name: '',
      surface: ReasonSurface.NoOrder,
      displayOrder: 100,
      requiresNote: false,
      requiresApproval: false,
      isRecoverable: false,
      isNegative: false,
      isActive: true,
    };
  }

  createReason(surface?: number): void {
    this.reason = { ...this.blankReason(), surface: surface ?? ReasonSurface.NoOrder };
    this.reasonErrors = {};
    this.showReason = true;
  }

  editReason(r: ReasonCodeDto): void {
    this.reason = { ...r };
    this.reasonErrors = {};
    this.showReason = true;
  }

  async saveReason(): Promise<void> {
    this.reasonErrors = validate(this.reason as unknown as Record<string, unknown>, {
      name: [required('A reason')],
      displayOrder: [notNegative('The display order')],
    });

    if (Object.keys(this.reasonErrors).length > 0) { this.cdr.detectChanges(); return; }

    this.saving = true;
    const res = await firstValueFrom(
      this.admin.saveReason(this.reason.id ?? null, this.reason),
    ).catch(() => null);

    if (res?.data) { this.showReason = false; await this.load(); }
    else this.error = 'The reason could not be saved.';

    this.saving = false;
    this.cdr.detectChanges();
  }

  async confirmDelete(): Promise<void> {
    if (!this.deleteTarget) return;

    const res = await firstValueFrom(this.admin.deleteReason(this.deleteTarget.id)).catch(() => null);

    if (res) { this.deleteTarget = null; await this.load(); }
    else this.error = 'That reason is in use on existing documents and cannot be removed.';

    this.cdr.detectChanges();
  }

  trackReason = (_: number, r: ReasonCodeDto) => r.id;
  trackGroup = (_: number, g: { surface: number }) => g.surface;
}
