import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { InventoryService } from '../../services/realestate.services';
import { RealEstateContextService } from '../../services/realestate-context.service';
import type * as M from '../../models/realestate.models';
import {
  PropertyStatus, PROPERTY_STATUS_LABELS, PropertySubType, PROPERTY_SUB_TYPE_LABELS,
  Facing, FACING_LABELS, BLOCK_REASON_LABELS,
} from '../../models/realestate.enums';
import {
  DrawerComponent, EmptyStateComponent, SkeletonComponent, StatsComponent, ToastComponent,
  type StatCard,
} from '../shared/ui';
import { ProjectPickerComponent } from '../shared/project-picker';
import { PageHelpComponent } from '../shared/page-help';
import { FactsComponent, SectionComponent, type Fact } from '../shared/detail-bits';

/* =====================================================================================
 * The inventory board.
 *
 * This is the screen a sales floor lives on, and it is the one screen where a list would be the
 * wrong answer. A buyer asks for "something on a high floor facing the park", and the person
 * opposite them has to answer in seconds — so the units are laid out the way the building is,
 * block by block and floor by floor, with status carried by colour and confirmed in text.
 *
 * Three things it deliberately does:
 *
 *   - Colour is never the only signal. Every tile spells its status out, because roughly one man
 *     in twelve cannot reliably tell the red tile from the green one.
 *   - A hold shows the minutes it has left, not the timestamp it expires at. Nobody does that
 *     subtraction correctly under pressure.
 *   - Nothing is sold from here. Clicking a unit opens it; taking it off the market is a hold,
 *     which is reversible, and every hold has an owner and a clock.
 * ===================================================================================== */

type ViewMode = 'stack' | 'grid';

/** Joins block and floor into one map key. A unit tab character cannot occur in either. */
const SEPARATOR = '	';

@Component({
  standalone: true,
  selector: 'lib-re-inventory',
  imports: [
    CommonModule, FormsModule, StatsComponent, SkeletonComponent, EmptyStateComponent,
    DrawerComponent, ToastComponent, ProjectPickerComponent, PageHelpComponent,
    SectionComponent, FactsComponent,
  ],
  templateUrl: './inventory.html',
  styleUrls: [
    '../realestate-shared.css', '../shared/ui.css', '../shared/detail-bits.css',
    './inventory.css',
  ],
})
export class InventoryComponent implements OnInit {
  private inventory = inject(InventoryService);
  private router = inject(Router);
  protected ctx = inject(RealEstateContextService);

  readonly board = signal<M.InventoryBoardDto | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly toast = signal<string | null>(null);

  readonly view = signal<ViewMode>('stack');
  readonly blockId = signal<string | null>(null);
  readonly selected = signal<M.InventoryUnitDto | null>(null);

  /** Filters. Kept in signals rather than a form because the board redraws on every change. */
  readonly search = signal('');
  readonly statusFilter = signal<PropertyStatus | null>(null);
  readonly subTypeFilter = signal<PropertySubType | null>(null);
  readonly facingFilter = signal<Facing | null>(null);
  readonly bedroomsFilter = signal<number | null>(null);
  readonly cornerOnly = signal(false);
  readonly minPrice = signal<number | null>(null);
  readonly maxPrice = signal<number | null>(null);

  readonly statusOptions = Object.entries(PROPERTY_STATUS_LABELS)
    .map(([value, label]) => ({ value: Number(value) as PropertyStatus, label }));

  readonly subTypeOptions = Object.entries(PROPERTY_SUB_TYPE_LABELS)
    .map(([value, label]) => ({ value: Number(value) as PropertySubType, label }));

  readonly facingOptions = Object.entries(FACING_LABELS)
    .map(([value, label]) => ({ value: Number(value) as Facing, label }));

  readonly blocks = computed(() => this.board()?.blocks ?? []);

  readonly filtered = computed(() => {
    const all = this.board()?.units ?? [];
    const term = this.search().trim().toLowerCase();

    return all.filter(u => {
      if (this.blockId() && u.projectNodeId !== this.blockId()) return false;
      if (this.statusFilter() !== null && u.status !== this.statusFilter()) return false;
      if (this.subTypeFilter() !== null && u.subType !== this.subTypeFilter()) return false;
      if (this.facingFilter() !== null && u.facing !== this.facingFilter()) return false;
      if (this.bedroomsFilter() !== null && u.bedrooms !== this.bedroomsFilter()) return false;
      if (this.cornerOnly() && !u.isCorner) return false;
      if (this.minPrice() !== null && u.totalPrice < this.minPrice()!) return false;
      if (this.maxPrice() !== null && u.totalPrice > this.maxPrice()!) return false;
      if (term && !(u.unitNumber.toLowerCase().includes(term)
        || (u.blockName ?? '').toLowerCase().includes(term)
        || (u.buyerName ?? '').toLowerCase().includes(term)
        || (u.heldForName ?? '').toLowerCase().includes(term))) return false;
      return true;
    });
  });

  readonly isFiltered = computed(() =>
    !!this.search().trim() || this.statusFilter() !== null || this.subTypeFilter() !== null
    || this.facingFilter() !== null || this.bedroomsFilter() !== null || this.cornerOnly()
    || this.minPrice() !== null || this.maxPrice() !== null || !!this.blockId());

  /** Grouped the way the building is: block, then floor, descending — top floor at the top. */
  readonly floors = computed(() => {
    const groups = new Map<string, M.InventoryUnitDto[]>();

    for (const u of this.filtered()) {
      // Block names contain spaces, so the key is joined on a character that cannot appear in one.
      const key = (u.blockName ?? 'Units') + SEPARATOR + (u.floorNumber ?? 0);
      const bucket = groups.get(key);
      if (bucket) bucket.push(u);
      else groups.set(key, [u]);
    }

    return [...groups.entries()]
      .map(([key, units]) => {
        const [block, floor] = key.split(SEPARATOR);
        return {
          key,
          block,
          floor: Number(floor),
          label: units[0].floorLabel ?? (Number(floor) === 0 ? 'Ground' : 'Floor ' + floor),
          units: [...units].sort((a, b) =>
            (a.stackIndex ?? 0) - (b.stackIndex ?? 0)
            || a.unitNumber.localeCompare(b.unitNumber, undefined, { numeric: true })),
        };
      })
      .sort((a, b) => a.block.localeCompare(b.block) || b.floor - a.floor);
  });

  readonly stats = computed<StatCard[]>(() => {
    const b = this.board();
    if (!b) return [];

    const shown = this.filtered();
    const available = shown.filter(u => u.status === PropertyStatus.Available).length;
    const value = shown.reduce((sum, u) => sum + u.totalPrice, 0);

    return [
      {
        label: 'Showing', value: shown.length, icon: 'grid_view',
        hint: shown.length === b.totalUnits ? 'the whole scheme' : 'of ' + b.totalUnits + ' units',
      },
      { label: 'Available', value: available, icon: 'check_circle', tone: 'positive' },
      {
        label: 'Absorption', value: b.absorptionPercent.toFixed(1) + '%', icon: 'trending_up',
        tone: 'accent', hint: 'sold and booked',
      },
      { label: 'Value shown', value: this.money(value), icon: 'payments' },
      {
        label: 'Still to sell', value: this.money(b.availableValue), icon: 'sell',
        hint: 'at list price',
      },
    ];
  });

  /** The facts panel for the selected unit. Everything a salesperson is asked at the desk. */
  readonly selectedFacts = computed<Fact[]>(() => {
    const u = this.selected();
    if (!u) return [];

    const facts: Fact[] = [
      { label: 'Status', value: PROPERTY_STATUS_LABELS[u.status], tone: this.statusTone(u.status) },
      { label: 'Type', value: PROPERTY_SUB_TYPE_LABELS[u.subType] },
      { label: 'Block', value: u.blockName },
      { label: 'Floor', value: u.floorLabel ?? u.floorNumber },
      { label: 'Area', value: u.areaDisplay },
      { label: 'Bedrooms', value: u.bedrooms },
      { label: 'Facing', value: u.facing !== undefined ? FACING_LABELS[u.facing] : null },
      { label: 'Corner', value: u.isCorner ? 'Yes' : 'No' },
      { label: 'Base price', value: this.money(u.basePrice) },
      { label: 'Rate', value: this.money(u.ratePerSqFt) + ' per sq ft' },
      { label: 'Total price', value: this.money(u.totalPrice), tone: 'positive' },
    ];

    if (u.holdId) {
      facts.push({
        label: 'Held for', value: u.heldForName,
        hint: u.holdMinutesRemaining !== undefined
          ? this.remaining(u.holdMinutesRemaining) + ' left, placed by ' + (u.heldByName ?? 'someone')
          : null,
        tone: 'warning', wide: true,
      });
    }

    if (u.bookingId) {
      facts.push({
        label: 'Booked by', value: u.buyerName,
        hint: u.collectionPercent !== undefined
          ? u.collectionPercent.toFixed(0) + '% of the price collected'
          : null,
        wide: true,
      });
    }

    if (u.blockReason !== undefined) {
      facts.push({
        label: 'Blocked because', value: BLOCK_REASON_LABELS[u.blockReason],
        tone: 'danger', wide: true,
      });
    }

    const flags: string[] = [];
    if (u.isLandownerShare) flags.push('landowner’s share');
    if (u.hasLitigation) flags.push('under litigation');
    if (u.isMortgaged) flags.push('mortgaged');
    if (flags.length) {
      facts.push({ label: 'Flags', value: flags.join(', '), tone: 'danger', wide: true });
    }

    return facts;
  });

  async ngOnInit(): Promise<void> {
    await this.ctx.ensureLoaded();
    await this.load();
  }

  async load(): Promise<void> {
    const projectId = this.ctx.projectId();
    if (!projectId) {
      this.board.set(null);
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    // Filtering happens in the browser: the whole scheme is a few thousand small rows at most,
    // and a salesperson dragging a price slider must not wait on a round trip each time.
    const res = await firstValueFrom(this.inventory.getBoard({
      projectId,
      viewMode: this.view(),
    })).catch(() => null);

    if (res?.data) this.board.set(res.data);
    else this.error.set('We could not load the inventory board for this project.');

    this.loading.set(false);
  }

  onProject(): void {
    this.blockId.set(null);
    void this.load();
  }

  setView(v: ViewMode): void {
    this.view.set(v);
  }

  pick(unit: M.InventoryUnitDto): void {
    this.selected.set(unit);
  }

  close(): void {
    this.selected.set(null);
  }

  open(unit: M.InventoryUnitDto): void {
    void this.router.navigate(['/realestate/inventory/units', unit.id]);
  }

  book(unit: M.InventoryUnitDto): void {
    void this.router.navigate(['/realestate/bookings/new'], {
      queryParams: { unitId: unit.id },
    });
  }

  async releaseHold(unit: M.InventoryUnitDto): Promise<void> {
    if (!unit.holdId) return;

    const res = await firstValueFrom(this.inventory.releaseHold(unit.holdId)).catch(() => null);
    if (res?.success) {
      this.toast.set('The hold on ' + unit.unitNumber + ' has been released.');
      this.selected.set(null);
      await this.load();
    } else {
      this.toast.set('We could not release that hold. Nothing has changed.');
    }
  }

  clearFilters(): void {
    this.search.set('');
    this.statusFilter.set(null);
    this.subTypeFilter.set(null);
    this.facingFilter.set(null);
    this.bedroomsFilter.set(null);
    this.cornerOnly.set(false);
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.blockId.set(null);
  }

  statusClass(u: M.InventoryUnitDto): string {
    switch (u.status) {
      case PropertyStatus.Available:
        return 'is-available';
      case PropertyStatus.Held:
      case PropertyStatus.Reserved:
      case PropertyStatus.UnderOffer:
        return 'is-held';
      case PropertyStatus.Booked:
        return 'is-booked';
      case PropertyStatus.Sold:
      case PropertyStatus.Registered:
      case PropertyStatus.Possessed:
      case PropertyStatus.Let:
        return 'is-sold';
      default:
        return 'is-blocked';
    }
  }

  statusTone(s: PropertyStatus): 'positive' | 'warning' | 'danger' | 'neutral' {
    if (s === PropertyStatus.Available) return 'positive';
    if (s === PropertyStatus.Held || s === PropertyStatus.Reserved) return 'warning';
    if (s === PropertyStatus.Litigation || s === PropertyStatus.Blocked) return 'danger';
    return 'neutral';
  }

  /** Only a unit genuinely on the market can start a booking from here. */
  canBook(u: M.InventoryUnitDto): boolean {
    return u.status === PropertyStatus.Available;
  }

  statusLabel(s: PropertyStatus): string {
    return PROPERTY_STATUS_LABELS[s] ?? '—';
  }

  /** A hold with eleven minutes left is urgent; "expires 14:32" is a sum somebody has to do. */
  remaining(minutes: number): string {
    if (minutes <= 0) return 'expired';
    if (minutes < 60) return minutes + ' min';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m ? h + 'h ' + m + 'm' : h + 'h';
  }

  isExpiring(u: M.InventoryUnitDto): boolean {
    return u.holdMinutesRemaining !== undefined && u.holdMinutesRemaining <= 60;
  }

  money(v: number | undefined): string {
    const n = v ?? 0;
    const abs = Math.abs(n);
    const c = this.board()?.currencyCode ?? this.ctx.currency();
    if (abs >= 1_000_000_000) return c + ' ' + (n / 1_000_000_000).toFixed(2) + 'bn';
    if (abs >= 1_000_000) return c + ' ' + (n / 1_000_000).toFixed(2) + 'm';
    if (abs >= 1_000) return c + ' ' + (n / 1_000).toFixed(0) + 'k';
    return c + ' ' + n.toFixed(0);
  }
}
