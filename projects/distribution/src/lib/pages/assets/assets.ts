import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { OutletService } from '../../services/distribution.services';
import { OutletAssetDto, OutletDto } from '../../models/distribution.models';
import {
  ASSET_CONDITION_LABELS, ASSET_CONDITION_TONE, ASSET_KIND_LABELS,
  AssetCondition, OutletAssetKind, enumOptions,
} from '../../models/distribution.enums';
import { PageHelpComponent } from '../shared/page-help';
import { ScopeBarComponent } from '../shared/scope-bar';
import { EmptyStateComponent, StatusPillComponent } from '../shared/ui-bits';
import { FieldErrorComponent, FieldErrors, notNegative, required, validate } from '../shared/validation';

/**
 * Assets in the trade: things you own but do not hold.
 *
 * A cooler disappears slowly. It is verified, then it is not verified for a while, then the shop
 * changes hands and nobody knows where it went. So the list leads with time-since-verification
 * rather than with the asset register — the register is never wrong, it is just increasingly
 * fictional.
 */
@Component({
  standalone: true,
  selector: 'lib-trade-assets',
  imports: [
    CommonModule, FormsModule, RouterLink, PageHelpComponent, ScopeBarComponent,
    EmptyStateComponent, StatusPillComponent, FieldErrorComponent,
  ],
  templateUrl: './assets.html',
  styleUrls: ['../distribution-shared.css', './assets.css'],
})
export class TradeAssetsComponent implements OnInit {
  private outlets = inject(OutletService);
  private cdr = inject(ChangeDetectorRef);

  rows: OutletAssetDto[] = [];
  outletOptions: OutletDto[] = [];

  loading = true;
  busy = false;
  error = '';
  notice = '';

  search = '';
  kindFilter = '' as '' | number;
  conditionFilter = '' as '' | number;
  staleOnly = false;
  territoryId: string | null = null;

  showEditor = false;
  editing: Partial<OutletAssetDto> = this.blank();
  editorErrors: FieldErrors = {};
  outletSearch = '';

  verifyTarget: OutletAssetDto | null = null;
  verify = { condition: AssetCondition.Working, note: '' };

  readonly kindOptions = enumOptions(ASSET_KIND_LABELS);
  readonly conditionOptions = enumOptions(ASSET_CONDITION_LABELS);
  readonly kindLabels = ASSET_KIND_LABELS;
  readonly conditionLabels = ASSET_CONDITION_LABELS;
  readonly conditionTone = ASSET_CONDITION_TONE;

  private searchTimer?: ReturnType<typeof setTimeout>;

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  async onScope(scope: { territoryId: string | null }): Promise<void> {
    this.territoryId = scope.territoryId;
    await this.load();
  }

  onSearch(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => void this.load(), 320);
  }

  async load(): Promise<void> {
    this.loading = true;
    this.cdr.detectChanges();

    const res = await firstValueFrom(this.outlets.assets({
      search: this.search || undefined,
      kind: this.kindFilter || undefined,
      condition: this.conditionFilter || undefined,
      territoryId: this.territoryId || undefined,
      unverifiedOnly: this.staleOnly || undefined,
    })).catch(() => null);

    if (res) this.rows = res.data ?? [];
    else this.error = 'Could not load the asset register.';

    this.loading = false;
    this.cdr.detectChanges();
  }

  // ── Editor ─────────────────────────────────────────────────────────────────

  private blank(): Partial<OutletAssetDto> {
    return {
      kind: OutletAssetKind.Cooler,
      assetTag: '',
      condition: AssetCondition.Working,
      placedOn: new Date().toISOString().slice(0, 10),
      assetValue: 0,
      depositTaken: 0,
    };
  }

  create(): void {
    this.editing = this.blank();
    this.editorErrors = {};
    this.outletSearch = '';
    this.outletOptions = [];
    this.showEditor = true;
  }

  edit(a: OutletAssetDto): void {
    this.editing = { ...a };
    this.editorErrors = {};
    this.outletSearch = a.outletName ?? '';
    this.showEditor = true;
  }

  async searchOutlets(): Promise<void> {
    if (this.outletSearch.trim().length < 2) { this.outletOptions = []; return; }

    const res = await firstValueFrom(
      this.outlets.list({ search: this.outletSearch, pageSize: 12 }),
    ).catch(() => null);

    this.outletOptions = res?.data ?? [];
    this.cdr.detectChanges();
  }

  pickOutlet(o: OutletDto): void {
    this.editing.outletId = o.id;
    this.editing.outletName = o.name;
    this.outletSearch = o.name;
    this.outletOptions = [];
  }

  async save(): Promise<void> {
    this.editorErrors = validate(this.editing as unknown as Record<string, unknown>, {
      assetTag: [required('An asset tag')],
      outletId: [required('An outlet')],
      assetValue: [notNegative('The asset value')],
    });

    if (Object.keys(this.editorErrors).length > 0) { this.cdr.detectChanges(); return; }

    this.busy = true;
    const res = await firstValueFrom(
      this.editing.id
        ? this.outlets.updateAsset(this.editing.id, this.editing as OutletAssetDto)
        : this.outlets.createAsset(this.editing as OutletAssetDto),
    ).catch(() => null);

    if (res?.data) { this.showEditor = false; await this.load(); }
    else this.error = 'The asset could not be saved.';

    this.busy = false;
    this.cdr.detectChanges();
  }

  // ── Verification ───────────────────────────────────────────────────────────

  startVerify(a: OutletAssetDto): void {
    this.verifyTarget = a;
    this.verify = { condition: a.condition, note: '' };
  }

  async confirmVerify(): Promise<void> {
    if (!this.verifyTarget || this.busy) return;

    this.busy = true;
    const res = await firstValueFrom(this.outlets.verifyAsset(this.verifyTarget.id, {
      condition: Number(this.verify.condition),
      note: this.verify.note || undefined,
    })).catch(() => null);

    if (res?.data) {
      this.verifyTarget = null;
      this.notice = 'Verified. The clock resets from today.';
      await this.load();
    } else {
      this.error = 'The verification could not be recorded.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  // ── Presentation ───────────────────────────────────────────────────────────

  get totalValue(): number {
    return this.rows.reduce((sum, a) => sum + a.assetValue, 0);
  }

  get staleCount(): number {
    return this.rows.filter(a => (a.daysSinceVerified ?? 9999) > 180).length;
  }

  get faultyCount(): number {
    return this.rows.filter(
      a => a.condition === AssetCondition.Faulty
        || a.condition === AssetCondition.NeedsService
        || a.condition === AssetCondition.Missing,
    ).length;
  }

  get depositHeld(): number {
    return this.rows.reduce((sum, a) => sum + a.depositTaken, 0);
  }

  /** Anything unseen for six months is on its way to being written off quietly. */
  isStale(a: OutletAssetDto): boolean {
    return (a.daysSinceVerified ?? 9999) > 180;
  }

  serviceDue(a: OutletAssetDto): boolean {
    if (!a.serviceDueOn) return false;
    return new Date(a.serviceDueOn).getTime() < Date.now();
  }

  trackAsset = (_: number, a: OutletAssetDto) => a.id;
}
