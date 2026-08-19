import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { OutletService, RouteService } from '../../services/distribution.services';
import { DistributionContextService } from '../../services/distribution-context.service';
import {
  DuplicateCandidateDto, OnboardOutletDto, OutletDto, PaginationMetadata, RouteDto,
} from '../../models/distribution.models';
import {
  OUTLET_CHANNEL_ICONS, OUTLET_CHANNEL_LABELS, OUTLET_GRADE_LABELS, OUTLET_STATUS_LABELS,
  OUTLET_STATUS_TONE, OutletChannel, OutletGrade, OutletStatus, enumOptions,
} from '../../models/distribution.enums';
import { PageHelpComponent } from '../shared/page-help';
import { ScopeBarComponent } from '../shared/scope-bar';
import { EmptyStateComponent, PagerComponent, StatusPillComponent } from '../shared/ui-bits';
import { FieldErrorComponent, FieldErrors, phone, required, validate } from '../shared/validation';

/**
 * The retail universe.
 *
 * A distributor's outlet list is the asset the whole app is built on, and it rots quietly: shops
 * close, phones change, and the same shop gets captured three times by three reps. So this screen
 * leads with the health of the list — pending approvals, possible duplicates, shops nobody has
 * visited — rather than presenting a clean table that hides all of it.
 */
@Component({
  standalone: true,
  selector: 'lib-distribution-outlets',
  imports: [
    CommonModule, FormsModule, PageHelpComponent, ScopeBarComponent,
    PagerComponent, EmptyStateComponent, StatusPillComponent, FieldErrorComponent,
  ],
  templateUrl: './outlets.html',
  styleUrls: ['../distribution-shared.css', './outlets.css'],
})
export class OutletsComponent implements OnInit {
  private outlets = inject(OutletService);
  private routeSvc = inject(RouteService);
  private ctx = inject(DistributionContextService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  rows: OutletDto[] = [];
  meta: PaginationMetadata | null = null;
  routes: RouteDto[] = [];

  loading = true;
  error = '';

  filters = {
    search: '',
    channel: '' as '' | number,
    grade: '' as '' | number,
    status: '' as '' | number,
    routeId: '',
    pendingOnly: false,
    unvisitedOnly: false,
  };

  page = 1;
  pageSize = 25;
  territoryId: string | null = null;

  // Onboarding
  showOnboard = false;
  onboard: OnboardOutletDto = this.blankOnboard();
  onboardErrors: FieldErrors = {};
  duplicates: DuplicateCandidateDto[] = [];
  checkingDuplicates = false;
  saving = false;

  // Merge
  mergeSource: OutletDto | null = null;
  mergeTargetId = '';

  readonly channelOptions = enumOptions(OUTLET_CHANNEL_LABELS);
  readonly gradeOptions = enumOptions(OUTLET_GRADE_LABELS);
  readonly statusOptions = enumOptions(OUTLET_STATUS_LABELS);
  readonly channelLabels = OUTLET_CHANNEL_LABELS;
  readonly channelIcons = OUTLET_CHANNEL_ICONS;
  readonly gradeLabels = OUTLET_GRADE_LABELS;
  readonly statusLabels = OUTLET_STATUS_LABELS;
  readonly statusTone = OUTLET_STATUS_TONE;
  readonly OutletStatus = OutletStatus;

  private searchTimer?: ReturnType<typeof setTimeout>;

  async ngOnInit(): Promise<void> {
    const res = await firstValueFrom(this.routeSvc.list({ pageSize: 300 })).catch(() => null);
    this.routes = res?.data ?? [];
  }

  async onScope(scope: { territoryId: string | null }): Promise<void> {
    this.territoryId = scope.territoryId;
    this.page = 1;
    await this.load();
  }

  /** Debounced so typing a shop name is one query, not one per keystroke. */
  onSearch(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.page = 1; void this.load(); }, 320);
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    const res = await firstValueFrom(this.outlets.list({
      page: this.page,
      pageSize: this.pageSize,
      search: this.filters.search || undefined,
      territoryId: this.territoryId || undefined,
      routeId: this.filters.routeId || undefined,
      channel: this.filters.channel || undefined,
      grade: this.filters.grade || undefined,
      status: this.filters.status || undefined,
      pendingApproval: this.filters.pendingOnly || undefined,
      unvisited: this.filters.unvisitedOnly || undefined,
    })).catch(() => null);

    if (res) {
      this.rows = res.data ?? [];
      this.meta = res.pagination ?? null;
    } else {
      this.error = 'Could not load the outlet list.';
    }

    this.loading = false;
    this.cdr.detectChanges();
  }

  async applyFilters(): Promise<void> {
    this.page = 1;
    await this.load();
  }

  async changePage(page: number): Promise<void> { this.page = page; await this.load(); }
  async changeSize(size: number): Promise<void> { this.pageSize = size; this.page = 1; await this.load(); }

  clearFilters(): void {
    this.filters = { search: '', channel: '', grade: '', status: '', routeId: '', pendingOnly: false, unvisitedOnly: false };
    void this.applyFilters();
  }

  get activeFilterCount(): number {
    const f = this.filters;
    return [f.channel, f.grade, f.status, f.routeId].filter(v => v !== '').length
      + (f.pendingOnly ? 1 : 0) + (f.unvisitedOnly ? 1 : 0);
  }

  open(row: OutletDto): void {
    void this.router.navigate(['/distribution/outlets', row.id]);
  }

  // ── Approvals ──────────────────────────────────────────────────────────────

  async approve(row: OutletDto, isApproved: boolean): Promise<void> {
    const res = await firstValueFrom(
      this.outlets.approve(row.id, isApproved, isApproved ? undefined : 'Rejected from the outlet list'),
    ).catch(() => null);

    if (res?.data) await this.load();
    else this.error = 'That decision could not be saved.';
    this.cdr.detectChanges();
  }

  // ── Onboarding ─────────────────────────────────────────────────────────────

  private blankOnboard(): OnboardOutletDto {
    return {
      name: '', ownerName: '', ownerPhone: '',
      channel: OutletChannel.GeneralTrade, grade: OutletGrade.C,
      addressLine: '', area: '', city: '', routeId: '',
      idempotencyKey: crypto.randomUUID(),
    };
  }

  startOnboard(): void {
    this.onboard = this.blankOnboard();
    this.onboardErrors = {};
    this.duplicates = [];
    this.showOnboard = true;
  }

  /**
   * Duplicate check runs as the phone or name is typed rather than on save, because the moment to
   * stop a duplicate is before somebody has filled in ten fields, not after.
   */
  async checkDuplicates(): Promise<void> {
    const name = this.onboard.name?.trim();
    const phoneNumber = this.onboard.ownerPhone?.trim();
    if ((name?.length ?? 0) < 3 && (phoneNumber?.length ?? 0) < 6) { this.duplicates = []; return; }

    this.checkingDuplicates = true;
    this.cdr.detectChanges();

    const res = await firstValueFrom(this.outlets.duplicates({
      name, phone: phoneNumber,
      latitude: this.onboard.latitude, longitude: this.onboard.longitude,
    })).catch(() => null);

    this.duplicates = res?.data ?? [];
    this.checkingDuplicates = false;
    this.cdr.detectChanges();
  }

  async saveOnboard(): Promise<void> {
    this.onboardErrors = validate(this.onboard as unknown as Record<string, unknown>, {
      name: [required('A shop name')],
      ownerPhone: [required('The owner\'s phone'), phone('The owner\'s phone')],
    });

    if (Object.keys(this.onboardErrors).length > 0) { this.cdr.detectChanges(); return; }

    this.saving = true;
    this.cdr.detectChanges();

    const res = await firstValueFrom(this.outlets.onboard({
      ...this.onboard,
      overrideDuplicateWarning: this.duplicates.length > 0,
    })).catch(() => null);

    if (res?.data) {
      this.showOnboard = false;
      await this.load();
    } else {
      this.error = 'The shop could not be added.';
    }

    this.saving = false;
    this.cdr.detectChanges();
  }

  // ── Merge ──────────────────────────────────────────────────────────────────

  startMerge(row: OutletDto): void {
    this.mergeSource = row;
    this.mergeTargetId = '';
  }

  async confirmMerge(): Promise<void> {
    if (!this.mergeSource || !this.mergeTargetId) return;

    // The survivor keeps its id, so every order, visit and receipt stays attached to something
    // real. The duplicate becomes an alias rather than being deleted.
    const res = await firstValueFrom(
      this.outlets.merge(this.mergeTargetId, this.mergeSource.id),
    ).catch(() => null);

    if (res?.data) {
      this.mergeSource = null;
      await this.load();
    } else {
      this.error = 'The merge did not go through. Nothing has been changed.';
    }

    this.cdr.detectChanges();
  }

  trackRow = (_: number, row: OutletDto) => row.id;
}
