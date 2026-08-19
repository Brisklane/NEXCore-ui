import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { OutletService } from '../../services/distribution.services';
import { CollectionDto, DistributionOrderDto, Outlet360Dto, OutletItemOfftakeDto } from '../../models/distribution.models';
import {
  ASSET_CONDITION_LABELS, ASSET_CONDITION_TONE, ASSET_KIND_LABELS, CLAIM_STATUS_LABELS,
  OUTLET_CHANNEL_ICONS, OUTLET_CHANNEL_LABELS, OUTLET_GRADE_LABELS, OUTLET_STATUS_LABELS,
  OUTLET_STATUS_TONE, ORDER_STATUS_LABELS, ORDER_STATUS_TONE, RETURN_STATUS_LABELS,
  RETURN_STATUS_TONE, TENDER_LABELS, VISIT_STATUS_LABELS, VISIT_STATUS_TONE,
} from '../../models/distribution.enums';
import { PageHelpComponent } from '../shared/page-help';
import { StatusPillComponent } from '../shared/ui-bits';
import { OrderSheetComponent } from '../shared/order-sheet';
import { CollectionSheetComponent } from '../shared/collection-sheet';

type Tab = 'offtake' | 'visits' | 'orders' | 'money' | 'returns' | 'assets' | 'execution' | 'notes';

/**
 * Everything known about one shop, arranged the way somebody standing outside it would want it.
 *
 * The header carries the four facts that change a decision — grade, route, credit position, when
 * anybody was last here — and nothing else. Detail lives in tabs, because a rep looking up a
 * credit balance should not have to scroll past a photo gallery to find it.
 *
 * The gap list is the commercially interesting one: products this shop's peers buy and it does
 * not. That is a call plan, not a report.
 */
@Component({
  standalone: true,
  selector: 'lib-outlet-360',
  imports: [
    CommonModule, FormsModule, RouterLink, PageHelpComponent, StatusPillComponent,
    OrderSheetComponent, CollectionSheetComponent,
  ],
  templateUrl: './outlet-360.html',
  styleUrls: ['../distribution-shared.css', './outlet-360.css'],
})
export class Outlet360Component implements OnInit {
  private outlets = inject(OutletService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  data: Outlet360Dto | null = null;
  loading = true;
  error = '';
  tab: Tab = 'offtake';

  showOrderSheet = false;
  showCollection = false;
  showNote = false;
  newNote = '';
  pinNote = false;
  savingNote = false;

  readonly channelLabels = OUTLET_CHANNEL_LABELS;
  readonly channelIcons = OUTLET_CHANNEL_ICONS;
  readonly gradeLabels = OUTLET_GRADE_LABELS;
  readonly statusLabels = OUTLET_STATUS_LABELS;
  readonly statusTone = OUTLET_STATUS_TONE;
  readonly visitStatusLabels = VISIT_STATUS_LABELS;
  readonly visitStatusTone = VISIT_STATUS_TONE;
  readonly orderStatusLabels = ORDER_STATUS_LABELS;
  readonly orderStatusTone = ORDER_STATUS_TONE;
  readonly returnStatusLabels = RETURN_STATUS_LABELS;
  readonly returnStatusTone = RETURN_STATUS_TONE;
  readonly assetKindLabels = ASSET_KIND_LABELS;
  readonly conditionLabels = ASSET_CONDITION_LABELS;
  readonly conditionTone = ASSET_CONDITION_TONE;
  readonly tenderLabels = TENDER_LABELS;
  readonly claimStatusLabels = CLAIM_STATUS_LABELS;

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.error = 'No shop was asked for.'; this.loading = false; return; }
    await this.load(id);
  }

  async load(id?: string): Promise<void> {
    const outletId = id ?? this.data?.outlet.id;
    if (!outletId) return;

    this.loading = true;
    this.cdr.detectChanges();

    const res = await firstValueFrom(this.outlets.get360(outletId)).catch(() => null);

    if (res?.data) this.data = res.data;
    else this.error = 'Could not load this shop.';

    this.loading = false;
    this.cdr.detectChanges();
  }

  back(): void { void this.router.navigate(['/distribution/outlets']); }

  onOrderPlaced(_: DistributionOrderDto): void {
    this.showOrderSheet = false;
    void this.load();
  }

  onCollectionRecorded(_: CollectionDto): void {
    this.showCollection = false;
    void this.load();
  }

  async saveNote(): Promise<void> {
    if (!this.data || !this.newNote.trim()) return;

    this.savingNote = true;
    this.cdr.detectChanges();

    await firstValueFrom(this.outlets.addNote({
      outletId: this.data.outlet.id,
      text: this.newNote.trim(),
      isPinned: this.pinNote,
    })).catch(() => null);

    this.newNote = '';
    this.pinNote = false;
    this.showNote = false;
    this.savingNote = false;
    await this.load();
  }

  /** Bar width for the offtake lists, scaled to the biggest line in the set. */
  barWidth(row: OutletItemOfftakeDto, rows: OutletItemOfftakeDto[]): number {
    const peak = Math.max(1, ...rows.map(r => r.value || r.peerAverageQuantity));
    return Math.max(2, Math.round(((row.value || row.peerAverageQuantity) / peak) * 100));
  }

  get creditUsedPercent(): number {
    const limit = this.data?.credit.effectiveLimit ?? 0;
    if (limit <= 0) return 0;
    return Math.min(100, Math.round(((this.data?.credit.outstandingAmount ?? 0) / limit) * 100));
  }

  get creditTone(): string {
    const c = this.data?.credit;
    if (!c) return 'tone-neutral';
    if (c.isBlocked || c.overdueAmount > 0) return 'tone-danger';
    return this.creditUsedPercent > 85 ? 'tone-warning' : 'tone-success';
  }

  trackId = (_: number, row: { id: string }) => row.id;
  trackItem = (_: number, row: OutletItemOfftakeDto) => row.itemId;
}
