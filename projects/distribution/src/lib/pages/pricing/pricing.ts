import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { OutletService, PricingService } from '../../services/distribution.services';
import {
  MarginLadderDto, MrpRevisionDto, OutletDto, PaginationMetadata, PriceListDto,
  PriceListLineDto, PriceResolutionDto, SavePriceListDto,
} from '../../models/distribution.models';
import {
  OUTLET_CHANNEL_LABELS, PRICE_SCOPE_LABELS, PriceScope, enumOptions,
} from '../../models/distribution.enums';
import { PageHelpComponent } from '../shared/page-help';
import { ScopeBarComponent } from '../shared/scope-bar';
import { EmptyStateComponent, PagerComponent, StatusPillComponent } from '../shared/ui-bits';
import { FieldErrorComponent, FieldErrors, required, validate } from '../shared/validation';

type Tab = 'lists' | 'ladder' | 'mrp';

/**
 * Price lists and the margin ladder.
 *
 * Two things share this screen because they answer the same argument from opposite ends. A price
 * list says what somebody pays; the ladder says what each tier makes on it. A distributor who
 * says "there is no margin in this" is making a claim the ladder either supports or refutes, and
 * having the two in separate products is how those conversations go badly.
 *
 * "Test a price" exists because the scope chain is genuinely hard to reason about from a list of
 * lists. Asking the server what a real outlet would pay today, and seeing every candidate it
 * rejected, is faster and more honest than reading seven overlapping definitions.
 */
@Component({
  standalone: true,
  selector: 'lib-distribution-pricing',
  imports: [
    CommonModule, FormsModule, PageHelpComponent, ScopeBarComponent,
    PagerComponent, EmptyStateComponent, StatusPillComponent, FieldErrorComponent,
  ],
  templateUrl: './pricing.html',
  styleUrls: ['../distribution-shared.css', './pricing.css'],
})
export class PricingComponent implements OnInit {
  private pricing = inject(PricingService);
  private outlets = inject(OutletService);
  private cdr = inject(ChangeDetectorRef);

  tab: Tab = 'lists';

  lists: PriceListDto[] = [];
  listsMeta: PaginationMetadata | null = null;
  ladder: MarginLadderDto[] = [];
  ladderMeta: PaginationMetadata | null = null;
  revisions: MrpRevisionDto[] = [];
  revisionsMeta: PaginationMetadata | null = null;

  loading = true;
  busy = false;
  error = '';
  notice = '';

  search = '';
  scopeFilter = '' as '' | number;
  page = 1;
  pageSize = 25;
  territoryId: string | null = null;

  // Editor
  showEditor = false;
  editing: SavePriceListDto & { id?: string } = this.blank();
  editorErrors: FieldErrors = {};

  // Price test
  showTest = false;
  testOutlets: OutletDto[] = [];
  testOutletSearch = '';
  test = { outletId: '', itemId: '', uom: 'EA', quantity: 1 };
  testResult: PriceResolutionDto | null = null;
  testing = false;

  readonly scopeOptions = enumOptions(PRICE_SCOPE_LABELS);
  readonly scopeLabels = PRICE_SCOPE_LABELS;
  readonly channelLabels = OUTLET_CHANNEL_LABELS;

  private searchTimer?: ReturnType<typeof setTimeout>;

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  async onScope(scope: { territoryId: string | null }): Promise<void> {
    this.territoryId = scope.territoryId;
    this.page = 1;
    await this.load();
  }

  onSearch(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.page = 1; void this.load(); }, 320);
  }

  async setTab(tab: Tab): Promise<void> {
    this.tab = tab;
    this.page = 1;
    await this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.cdr.detectChanges();

    const query = {
      page: this.page,
      pageSize: this.pageSize,
      search: this.search || undefined,
      territoryId: this.territoryId || undefined,
    };

    if (this.tab === 'lists') {
      const res = await firstValueFrom(this.pricing.list({
        ...query, scope: this.scopeFilter || undefined,
      })).catch(() => null);
      this.lists = res?.data ?? [];
      this.listsMeta = res?.pagination ?? null;
      if (!res) this.error = 'Could not load the price lists.';
    } else if (this.tab === 'ladder') {
      const res = await firstValueFrom(this.pricing.margins(query)).catch(() => null);
      this.ladder = res?.data ?? [];
      this.ladderMeta = res?.pagination ?? null;
      if (!res) this.error = 'Could not load the margin ladder.';
    } else {
      const res = await firstValueFrom(this.pricing.mrpRevisions(query)).catch(() => null);
      this.revisions = res?.data ?? [];
      this.revisionsMeta = res?.pagination ?? null;
      if (!res) this.error = 'Could not load the MRP revisions.';
    }

    this.loading = false;
    this.cdr.detectChanges();
  }

  get meta(): PaginationMetadata | null {
    return this.tab === 'lists' ? this.listsMeta : this.tab === 'ladder' ? this.ladderMeta : this.revisionsMeta;
  }

  async changePage(page: number): Promise<void> { this.page = page; await this.load(); }
  async changeSize(size: number): Promise<void> { this.pageSize = size; this.page = 1; await this.load(); }

  // ── Editor ─────────────────────────────────────────────────────────────────

  private blank(): SavePriceListDto {
    return {
      name: '',
      scope: PriceScope.Company,
      effectiveFrom: new Date().toISOString().slice(0, 10),
      priority: 100,
      isTaxInclusive: false,
      isActive: true,
      lines: [],
    };
  }

  create(): void {
    this.editing = this.blank();
    this.editorErrors = {};
    this.showEditor = true;
  }

  async edit(row: PriceListDto): Promise<void> {
    const res = await firstValueFrom(this.pricing.get(row.id)).catch(() => null);
    this.editing = { ...(res?.data ?? row) };
    this.editorErrors = {};
    this.showEditor = true;
    this.cdr.detectChanges();
  }

  addLine(): void {
    this.editing.lines = [...this.editing.lines, {
      id: crypto.randomUUID(),
      itemId: '',
      itemName: '',
      uom: 'EA',
      uomFactor: 1,
      unitPrice: 0,
      mrp: 0,
      minimumPrice: 0,
      maxDiscountPercent: 0,
      taxPercent: 0,
      slabs: [],
    } as PriceListLineDto];
  }

  removeLine(line: PriceListLineDto): void {
    this.editing.lines = this.editing.lines.filter(l => l !== line);
  }

  /** A line priced below its own floor is a margin leak that only surfaces at month end. */
  get lineProblems(): string[] {
    return this.editing.lines
      .filter(l => l.minimumPrice > 0 && l.unitPrice < l.minimumPrice)
      .map(l => `${l.itemName || 'A line'} is priced below its floor of ${l.minimumPrice}.`);
  }

  async save(): Promise<void> {
    this.editorErrors = validate(this.editing as unknown as Record<string, unknown>, {
      name: [required('A list name')],
      effectiveFrom: [required('A start date')],
    });

    if (Object.keys(this.editorErrors).length > 0) { this.cdr.detectChanges(); return; }

    this.busy = true;
    this.cdr.detectChanges();

    const res = await firstValueFrom(
      this.pricing.save(this.editing.id ?? null, this.editing),
    ).catch(() => null);

    if (res?.data) {
      this.showEditor = false;
      this.notice = 'Saved. The list has to be approved before it prices anything.';
      await this.load();
    } else {
      this.error = 'The price list could not be saved.';
    }

    this.busy = false;
    this.cdr.detectChanges();
  }

  async approve(row: PriceListDto): Promise<void> {
    const res = await firstValueFrom(this.pricing.approve(row.id)).catch(() => null);
    if (res?.data) { this.notice = `${row.name} approved and live.`; await this.load(); }
    else this.error = 'The list could not be approved.';
    this.cdr.detectChanges();
  }

  // ── Price test ─────────────────────────────────────────────────────────────

  openTest(): void {
    this.showTest = true;
    this.testResult = null;
    this.testOutlets = [];
  }

  async searchTestOutlets(): Promise<void> {
    if (this.testOutletSearch.trim().length < 2) { this.testOutlets = []; return; }

    const res = await firstValueFrom(
      this.outlets.list({ search: this.testOutletSearch, pageSize: 15 }),
    ).catch(() => null);

    this.testOutlets = res?.data ?? [];
    this.cdr.detectChanges();
  }

  async runTest(): Promise<void> {
    if (!this.test.itemId || this.testing) return;

    this.testing = true;
    this.testResult = null;
    this.cdr.detectChanges();

    const res = await firstValueFrom(this.pricing.resolve({
      itemId: this.test.itemId,
      uom: this.test.uom,
      quantity: this.test.quantity,
      outletId: this.test.outletId || undefined,
    })).catch(() => null);

    this.testResult = res?.data ?? null;
    if (!res?.data) this.error = 'The price could not be resolved. Check the item id.';

    this.testing = false;
    this.cdr.detectChanges();
  }

  /** Where the money goes between the factory and the shelf, as widths that add to 100. */
  ladderSegments(row: MarginLadderDto): { label: string; percent: number; tone: string }[] {
    const mrp = row.mrp || 1;
    return [
      { label: 'Cost', percent: (row.landedCost / mrp) * 100, tone: 'seg-cost' },
      { label: 'Us', percent: ((row.priceToDistributor - row.landedCost) / mrp) * 100, tone: 'seg-company' },
      { label: 'Distributor', percent: ((row.priceToWholesaler - row.priceToDistributor) / mrp) * 100, tone: 'seg-distributor' },
      { label: 'Wholesaler', percent: ((row.priceToRetailer - row.priceToWholesaler) / mrp) * 100, tone: 'seg-wholesaler' },
      { label: 'Retailer', percent: ((mrp - row.priceToRetailer) / mrp) * 100, tone: 'seg-retailer' },
    ].filter(s => s.percent > 0.5);
  }

  scopeLabelFor(row: PriceListDto): string {
    return row.outletName || row.partnerName || row.territoryName
      || (row.channel != null ? this.channelLabels[row.channel] : '')
      || 'Everyone';
  }

  trackList = (_: number, row: PriceListDto) => row.id;
  trackLine = (_: number, l: PriceListLineDto) => l.id;
  trackLadder = (_: number, row: MarginLadderDto) => row.id;
  trackRevision = (_: number, row: MrpRevisionDto) => row.id;
}
