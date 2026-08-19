import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { OrderService } from '../../services/distribution.services';
import {
  CatalogueItemDto, CreateOrderDto, DistributionOrderDto, OrderQuoteDto, SaveOrderLineDto,
} from '../../models/distribution.models';
import { DistributionOrderKind, OrderSource } from '../../models/distribution.enums';

/** One row being built on the sheet — the catalogue entry plus what has been typed against it. */
interface SheetLine {
  item: CatalogueItemDto;
  uom: string;
  quantity: number;
}

/**
 * The order pad: a catalogue on one side, the running order on the other.
 *
 * The same component serves the rep standing in a shop and the tele-sales desk taking the call,
 * because they are doing the identical thing and the rules — authorised products, live schemes,
 * the credit ceiling — must not differ by who is typing.
 *
 * Nothing here calculates money. Every quantity change re-quotes on the server, which returns the
 * priced lines, the schemes that fired, the free goods they generated and the credit decision. A
 * client-side total that disagrees with the invoice by a rounding unit destroys trust faster than
 * a slow screen does.
 */
@Component({
  standalone: true,
  selector: 'dst-order-sheet',
  imports: [CommonModule, FormsModule],
  templateUrl: './order-sheet.html',
  styleUrls: ['../distribution-shared.css', './order-sheet.css'],
})
export class OrderSheetComponent implements OnInit {
  private orders = inject(OrderService);
  private cdr = inject(ChangeDetectorRef);

  @Input() outletId?: string;
  @Input() partnerId?: string;
  @Input() outletName = '';

  /** Field context — present when the sheet is opened from a visit. */
  @Input() visitId?: string;
  @Input() fieldDayId?: string;
  @Input() fieldRepId?: string;
  @Input() routeId?: string;
  @Input() warehouseId?: string;

  /** A van sale ships from the van's stock and settles immediately. */
  @Input() vanUnitId?: string;
  @Input() isVanSale = false;

  @Input() kind: DistributionOrderKind = DistributionOrderKind.Standard;
  @Input() source: OrderSource = OrderSource.FieldTerminal;

  /** Bigger targets, larger type — set on the field terminal. */
  @Input() touch = false;

  @Output() placed = new EventEmitter<DistributionOrderDto>();
  @Output() closed = new EventEmitter<void>();

  catalogue: CatalogueItemDto[] = [];
  lines: SheetLine[] = [];
  quote: OrderQuoteDto | null = null;

  search = '';
  brandFilter = '';
  onlyFocus = false;
  onlySuggested = false;

  loading = true;
  quoting = false;
  saving = false;
  error = '';
  note = '';
  requestedDeliveryDate = '';

  /** Idempotency key minted once per sheet, so a double tap on a flaky link cannot double-order. */
  private readonly idempotencyKey = crypto.randomUUID();
  private quoteTimer?: ReturnType<typeof setTimeout>;

  async ngOnInit(): Promise<void> {
    const res = await firstValueFrom(this.orders.catalogue({
      outletId: this.outletId,
      partnerId: this.partnerId,
      vanUnitId: this.vanUnitId,
      warehouseId: this.warehouseId,
    })).catch(() => null);

    this.catalogue = res?.data ?? [];
    if (!res?.data) this.error = 'Could not load the product list.';

    this.loading = false;
    this.cdr.detectChanges();
  }

  // ── Filtering ──────────────────────────────────────────────────────────────

  get brands(): string[] {
    return [...new Set(this.catalogue.map(i => i.brandName).filter((b): b is string => !!b))].sort();
  }

  get visibleCatalogue(): CatalogueItemDto[] {
    const term = this.search.trim().toLowerCase();

    return this.catalogue.filter(item => {
      if (this.onlyFocus && !item.isFocusItem) return false;
      if (this.onlySuggested && item.suggestedQuantity <= 0) return false;
      if (this.brandFilter && item.brandName !== this.brandFilter) return false;
      if (!term) return true;
      return item.itemName.toLowerCase().includes(term)
        || (item.itemCode ?? '').toLowerCase().includes(term)
        || (item.barcode ?? '') === term;
    });
  }

  // ── Building the order ─────────────────────────────────────────────────────

  lineFor(item: CatalogueItemDto): SheetLine | undefined {
    return this.lines.find(l => l.item.itemId === item.itemId);
  }

  quantityOf(item: CatalogueItemDto): number {
    return this.lineFor(item)?.quantity ?? 0;
  }

  add(item: CatalogueItemDto, quantity = 1): void {
    if (!item.isAuthorised) return;

    const existing = this.lineFor(item);
    if (existing) {
      existing.quantity += quantity;
    } else {
      const uom = item.uoms.find(u => u.isDefault)?.uom ?? item.uoms[0]?.uom ?? 'EA';
      this.lines.push({ item, uom, quantity });
    }

    this.scheduleQuote();
  }

  /** The suggested quantity is the reorder the server derived from this outlet's own offtake. */
  addSuggested(item: CatalogueItemDto): void {
    const existing = this.lineFor(item);
    const target = Math.max(1, item.suggestedQuantity);
    if (existing) existing.quantity = target;
    else this.add(item, target);
    this.scheduleQuote();
  }

  setQuantity(line: SheetLine, value: number): void {
    line.quantity = Math.max(0, Number(value) || 0);
    if (line.quantity === 0) this.remove(line);
    else this.scheduleQuote();
  }

  step(line: SheetLine, by: number): void {
    this.setQuantity(line, line.quantity + by);
  }

  setUom(line: SheetLine, uom: string): void {
    line.uom = uom;
    this.scheduleQuote();
  }

  remove(line: SheetLine): void {
    this.lines = this.lines.filter(l => l !== line);
    if (this.lines.length === 0) this.quote = null;
    this.scheduleQuote();
  }

  clear(): void {
    this.lines = [];
    this.quote = null;
    this.cdr.detectChanges();
  }

  // ── Quoting ────────────────────────────────────────────────────────────────

  /**
   * Debounced because a rep tapping "+" five times should cost one round trip, not five — and on
   * a phone in a shop the fifth answer arriving out of order would show the wrong total.
   */
  private scheduleQuote(): void {
    if (this.quoteTimer) clearTimeout(this.quoteTimer);
    this.cdr.detectChanges();

    if (this.lines.length === 0) return;

    this.quoteTimer = setTimeout(() => void this.requote(), 350);
  }

  private async requote(): Promise<void> {
    this.quoting = true;
    this.cdr.detectChanges();

    const res = await firstValueFrom(this.orders.quote({
      outletId: this.outletId,
      partnerId: this.partnerId,
      warehouseId: this.warehouseId,
      vanUnitId: this.vanUnitId,
      fieldRepId: this.fieldRepId,
      lines: this.saveLines(),
    })).catch(() => null);

    if (res?.data) {
      this.quote = res.data;
      this.error = '';
    } else {
      this.error = 'Could not price this order. The totals below may be out of date.';
    }

    this.quoting = false;
    this.cdr.detectChanges();
  }

  private saveLines(): SaveOrderLineDto[] {
    return this.lines
      .filter(l => l.quantity > 0)
      .map(l => ({ itemId: l.item.itemId, uom: l.uom, quantity: l.quantity }));
  }

  /** Takes the shortfall from a slab hint straight onto the sheet — the whole point of showing it. */
  topUpToSlab(itemId: string | undefined, shortfall: number): void {
    if (!itemId || shortfall <= 0) return;
    const item = this.catalogue.find(i => i.itemId === itemId);
    if (item) this.add(item, shortfall);
  }

  // ── Placing ────────────────────────────────────────────────────────────────

  get canPlace(): boolean {
    return this.lines.length > 0
      && !this.saving
      && !this.quoting
      && (this.quote?.blockers.length ?? 0) === 0;
  }

  async place(submit: boolean): Promise<void> {
    if (!this.canPlace) return;

    this.saving = true;
    this.error = '';
    this.cdr.detectChanges();

    const dto: CreateOrderDto = {
      source: this.source,
      kind: this.kind,
      outletId: this.outletId,
      partnerId: this.partnerId,
      visitId: this.visitId,
      fieldDayId: this.fieldDayId,
      fieldRepId: this.fieldRepId,
      routeId: this.routeId,
      warehouseId: this.warehouseId,
      vanUnitId: this.vanUnitId,
      requestedDeliveryDate: this.requestedDeliveryDate || undefined,
      note: this.note || undefined,
      lines: this.saveLines(),
      submitImmediately: submit,
      isVanSale: this.isVanSale,
      idempotencyKey: this.idempotencyKey,
    };

    const res = await firstValueFrom(this.orders.create(dto)).catch(() => null);

    if (res?.data) {
      this.placed.emit(res.data);
    } else {
      this.error = 'The order could not be placed. Nothing has been saved — try again.';
    }

    this.saving = false;
    this.cdr.detectChanges();
  }

  trackItem = (_: number, item: CatalogueItemDto) => item.itemId;
  trackLine = (_: number, line: SheetLine) => line.item.itemId;
}
