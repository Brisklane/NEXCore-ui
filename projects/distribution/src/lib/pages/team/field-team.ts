import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { FieldService, RouteService } from '../../services/distribution.services';
import {
  FieldDeviceDto, FieldRepDto, PaginationMetadata, SaveFieldRepDto, TerritoryDto,
} from '../../models/distribution.models';
import {
  DAY_STATUS_LABELS, DAY_STATUS_TONE, FIELD_ROLE_LABELS, FieldRole, enumOptions,
} from '../../models/distribution.enums';
import { PageHelpComponent } from '../shared/page-help';
import { ScopeBarComponent } from '../shared/scope-bar';
import { ConfirmDialogComponent, EmptyStateComponent, PagerComponent, StatusPillComponent } from '../shared/ui-bits';
import { FieldErrorComponent, FieldErrors, digits, email, notNegative, phone, required, validate } from '../shared/validation';

type Tab = 'people' | 'devices';

/**
 * The field team and the devices they carry.
 *
 * Last-sync time is the operationally important column, not the roster. A rep whose device has
 * not synced since yesterday morning is either off sick or holding a day's orders that nobody has
 * seen — and those two need very different responses.
 *
 * Blocking a device is immediate and reversible. Wiping it also clears the queued offline data,
 * so it is behind a confirmation that says exactly that.
 */
@Component({
  standalone: true,
  selector: 'lib-field-team',
  imports: [
    CommonModule, FormsModule, PageHelpComponent, ScopeBarComponent,
    PagerComponent, EmptyStateComponent, StatusPillComponent, ConfirmDialogComponent,
    FieldErrorComponent,
  ],
  templateUrl: './field-team.html',
  styleUrls: ['../distribution-shared.css', './field-team.css'],
})
export class FieldTeamComponent implements OnInit {
  private field = inject(FieldService);
  private routeSvc = inject(RouteService);
  private cdr = inject(ChangeDetectorRef);

  tab: Tab = 'people';

  reps: FieldRepDto[] = [];
  devices: FieldDeviceDto[] = [];
  territories: TerritoryDto[] = [];
  meta: PaginationMetadata | null = null;

  loading = true;
  busy = false;
  error = '';
  notice = '';

  search = '';
  roleFilter = '' as '' | number;
  page = 1;
  pageSize = 25;
  territoryId: string | null = null;

  showEditor = false;
  editing: SaveFieldRepDto & { id?: string } = this.blank();
  editorErrors: FieldErrors = {};

  wipeTarget: FieldDeviceDto | null = null;

  readonly roleOptions = enumOptions(FIELD_ROLE_LABELS);
  readonly roleLabels = FIELD_ROLE_LABELS;
  readonly dayStatusLabels = DAY_STATUS_LABELS;
  readonly dayStatusTone = DAY_STATUS_TONE;

  private searchTimer?: ReturnType<typeof setTimeout>;

  async ngOnInit(): Promise<void> {
    const res = await firstValueFrom(this.routeSvc.territories({ pageSize: 200 })).catch(() => null);
    this.territories = res?.data ?? [];
    await this.load();
  }

  async onScope(scope: { territoryId: string | null }): Promise<void> {
    this.territoryId = scope.territoryId;
    this.page = 1;
    await this.load();
  }

  async setTab(tab: Tab): Promise<void> {
    this.tab = tab;
    this.page = 1;
    await this.load();
  }

  onSearch(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.page = 1; void this.load(); }, 320);
  }

  async load(): Promise<void> {
    this.loading = true;
    this.cdr.detectChanges();

    if (this.tab === 'people') {
      const res = await firstValueFrom(this.field.reps({
        page: this.page,
        pageSize: this.pageSize,
        search: this.search || undefined,
        role: this.roleFilter || undefined,
        territoryId: this.territoryId || undefined,
      })).catch(() => null);
      this.reps = res?.data ?? [];
      this.meta = res?.pagination ?? null;
      if (!res) this.error = 'Could not load the field team.';
    } else {
      const res = await firstValueFrom(this.field.devices({
        search: this.search || undefined,
      })).catch(() => null);
      this.devices = res?.data ?? [];
      this.meta = null;
      if (!res) this.error = 'Could not load the devices.';
    }

    this.loading = false;
    this.cdr.detectChanges();
  }

  async changePage(page: number): Promise<void> { this.page = page; await this.load(); }
  async changeSize(size: number): Promise<void> { this.pageSize = size; this.page = 1; await this.load(); }

  // ── Reps ───────────────────────────────────────────────────────────────────

  private blank(): SaveFieldRepDto {
    return {
      fullName: '',
      role: FieldRole.SalesRep,
      cashHoldingLimit: 0,
      discountAuthorityPercent: 0,
      canOnboardOutlets: true,
      canCollectPayments: true,
      canAcceptReturns: false,
      isActive: true,
    };
  }

  create(): void {
    this.editing = this.blank();
    this.editorErrors = {};
    this.showEditor = true;
  }

  async edit(r: FieldRepDto): Promise<void> {
    const res = await firstValueFrom(this.field.rep(r.id)).catch(() => null);
    this.editing = { ...(res?.data ?? r) };
    this.editorErrors = {};
    this.showEditor = true;
    this.cdr.detectChanges();
  }

  async save(): Promise<void> {
    this.editorErrors = validate(this.editing as unknown as Record<string, unknown>, {
      fullName: [required('A name')],
      phone: [phone('The phone number')],
      email: [email('The email address')],
      pin: [digits(4, 6, 'The PIN')],
      cashHoldingLimit: [notNegative('The cash holding limit')],
    });

    if (Object.keys(this.editorErrors).length > 0) { this.cdr.detectChanges(); return; }

    this.busy = true;
    const res = await firstValueFrom(
      this.field.saveRep(this.editing.id ?? null, this.editing),
    ).catch(() => null);

    if (res?.data) {
      this.showEditor = false;
      this.notice = 'Saved.';
      await this.load();
    } else {
      this.error = 'The rep could not be saved.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  // ── Devices ────────────────────────────────────────────────────────────────

  async block(d: FieldDeviceDto, isBlocked: boolean): Promise<void> {
    if (this.busy) return;
    this.busy = true;

    const res = await firstValueFrom(this.field.blockDevice(
      d.id, isBlocked, isBlocked ? 'Blocked from the device list' : undefined,
    )).catch(() => null);

    if (res?.data) {
      this.notice = isBlocked
        ? 'Device blocked. It cannot sync or log in until it is unblocked.'
        : 'Device unblocked.';
      await this.load();
    } else {
      this.error = 'That change did not go through.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  async confirmWipe(): Promise<void> {
    if (!this.wipeTarget || this.busy) return;

    this.busy = true;
    const res = await firstValueFrom(this.field.wipeDevice(this.wipeTarget.id)).catch(() => null);

    if (res?.data) {
      this.wipeTarget = null;
      this.notice = 'Wipe requested. It runs the next time the device connects.';
      await this.load();
    } else {
      this.error = 'The wipe could not be requested.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  // ── Presentation ───────────────────────────────────────────────────────────

  get staleDevices(): number {
    return this.devices.filter(d => (d.minutesSinceSync ?? 0) > 720 && !d.isBlocked).length;
  }

  get queuedRecords(): number {
    return this.devices.reduce((sum, d) => sum + d.pendingOutboxCount, 0);
  }

  syncTone(d: FieldDeviceDto): string {
    if (d.isBlocked) return 'neutral';
    const minutes = d.minutesSinceSync ?? 99999;
    if (minutes > 1440) return 'bad';
    return minutes > 240 ? 'warn' : 'good';
  }

  syncLabel(d: FieldDeviceDto): string {
    if (!d.lastSyncAt) return 'Never synced';
    const minutes = d.minutesSinceSync ?? 0;
    if (minutes < 60) return `${Math.round(minutes)} min ago`;
    if (minutes < 1440) return `${Math.round(minutes / 60)} hours ago`;
    return `${Math.round(minutes / 1440)} days ago`;
  }

  trackRep = (_: number, r: FieldRepDto) => r.id;
  trackDevice = (_: number, d: FieldDeviceDto) => d.id;
}
