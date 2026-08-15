import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  InventoryDocumentService, InventoryDocumentDto,
  CatalogService, CatalogResolutionDto,
} from '@nexcore/inventory';
import { SearchableSelect, SearchableOption } from '@nexcore/core';
import { PosStoreService } from '../../services/pos-store.service';
import { PosStoreDto } from '../../models/pos-store.model';

/** A line being entered on a draft receipt. Quantity is always in the base unit. */
interface ReceiptLine {
  itemId: string;
  variantId: string | null;
  code: string;
  name: string;
  unitId: string;
  unitName: string;
  quantity: number | null;
  unitCost: number | null;
}

/**
 * Goods received into a store.
 *
 * A receipt is entered as a **draft** and then **posted**: only posting moves stock and
 * writes the cost into the moving average. That two-step is the API's own model, and it
 * matters here because posting cannot be undone — a mistake has to be corrected with a
 * counter-document, so this screen makes the boundary explicit rather than hiding it
 * behind a single "save" button.
 */
@Component({
  standalone: true,
  selector: 'lib-pos-receipts',
  imports: [CommonModule, FormsModule, SearchableSelect],
  templateUrl: './pos-receipts.html',
  styleUrls: ['./pos-receipts.css'],
})
export class PosReceiptsComponent implements OnInit {
  private documents = inject(InventoryDocumentService);
  private catalog = inject(CatalogService);
  private stores = inject(PosStoreService);
  private cdr = inject(ChangeDetectorRef);

  storeList: PosStoreDto[] = [];
  storeId = '';

  drafts: InventoryDocumentDto[] = [];
  posted: InventoryDocumentDto[] = [];
  loading = false;
  error = '';
  notice = '';

  /** Null when not entering a receipt. */
  entry: { description: string; lines: ReceiptLine[] } | null = null;
  saving = false;

  /** Set while confirming a post — posting is irreversible, so it is never one click. */
  confirming: InventoryDocumentDto | null = null;

  productOptions: SearchableOption[] = [];
  productSearching = false;
  private productsById = new Map<string, CatalogResolutionDto>();
  pickedProductId = '';

  async ngOnInit(): Promise<void> {
    const res = await firstValueFrom(this.stores.getActive()).catch(() => null);
    this.storeList = res?.data ?? [];
    const first = this.storeList.find(s => !!s.defaultWarehouseId) ?? this.storeList[0];
    if (first) this.storeId = first.id;

    await this.load();
    this.cdr.detectChanges();
  }

  get store(): PosStoreDto | undefined {
    return this.storeList.find(s => s.id === this.storeId);
  }

  get warehouseId(): string | null {
    return this.store?.defaultWarehouseId ?? null;
  }

  get storeOptions(): SearchableOption[] {
    return this.storeList.map(s => ({ value: s.id, label: s.tradingName ?? s.id }));
  }

  async onStoreChange(): Promise<void> {
    this.notice = '';
    await this.load();
  }

  async load(): Promise<void> {
    const warehouseId = this.warehouseId;
    if (!warehouseId) {
      this.drafts = [];
      this.posted = [];
      this.error = this.storeList.length
        ? 'This store has no default warehouse. Set one in POS Stores first.'
        : '';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.error = '';

    // Type, status and warehouse are all server-side filters — filtering after paging
    // would silently drop rows once a store has more than a page of documents.
    const [draftRes, postedRes] = await Promise.all([
      firstValueFrom(this.documents.getAll(
        { pageNumber: 1, pageSize: 50 }, 'GRN', 'Draft', warehouseId)).catch(() => null),
      firstValueFrom(this.documents.getAll(
        { pageNumber: 1, pageSize: 25 }, 'GRN', 'Posted', warehouseId)).catch(() => null),
    ]);

    if (!draftRes && !postedRes) this.error = 'Could not load receipts.';

    this.drafts = draftRes?.data ?? [];
    this.posted = postedRes?.data ?? [];

    this.loading = false;
    this.cdr.detectChanges();
  }

  // ── Entry ─────────────────────────────────────────────────────────────

  startReceipt(): void {
    if (!this.warehouseId) {
      this.error = 'This store has no default warehouse. Set one in POS Stores first.';
      return;
    }
    this.entry = { description: '', lines: [] };
    this.error = '';
    this.notice = '';
  }

  cancelEntry(): void {
    this.entry = null;
    this.pickedProductId = '';
    this.productOptions = [];
  }

  async onProductSearch(term: string): Promise<void> {
    if (!term?.trim()) { this.productOptions = []; return; }
    this.productSearching = true;
    const results = await firstValueFrom(this.catalog.search(term, 25)).catch(() => []);
    this.productOptions = results.map(r => {
      const key = this.keyOf(r.itemId, r.variantId ?? null);
      this.productsById.set(key, r);
      const label = r.variantName ? `${r.itemCode} — ${r.itemName} · ${r.variantName}`
                                  : `${r.itemCode} — ${r.itemName}`;
      return { value: key, label };
    });
    this.productSearching = false;
    this.cdr.detectChanges();
  }

  private keyOf(itemId: string, variantId: string | null): string {
    return variantId ? `${itemId}:${variantId}` : itemId;
  }

  addLine(): void {
    const hit = this.productsById.get(this.pickedProductId);
    if (!hit || !this.entry) { this.error = 'Pick a product to add.'; return; }

    const variantId = hit.variantId ?? null;
    if (this.entry.lines.some(l => l.itemId === hit.itemId && l.variantId === variantId)) {
      this.error = `${hit.itemName} is already on this receipt.`;
      return;
    }

    this.error = '';
    this.entry.lines.push({
      itemId: hit.itemId,
      variantId,
      code: hit.variantCode ?? hit.itemCode,
      name: hit.variantName ? `${hit.itemName} · ${hit.variantName}` : hit.itemName,
      // Receipts are entered in the base unit. A search hit can carry a pack unit
      // (a case barcode), and mixing units on a cost line is how averages go wrong.
      unitId: hit.baseUnitId,
      unitName: hit.baseUnitName ?? '',
      quantity: null,
      // Deliberately blank: listPrice is what the item *sells* for, and seeding it as
      // cost would inflate the moving average with a number nobody actually paid.
      unitCost: null,
    });

    this.pickedProductId = '';
    this.productOptions = [];
  }

  removeLine(i: number): void {
    this.entry?.lines.splice(i, 1);
  }

  get entryTotal(): number {
    return (this.entry?.lines ?? []).reduce(
      (sum, l) => sum + (l.quantity ?? 0) * (l.unitCost ?? 0), 0);
  }

  private validateEntry(): string | null {
    const e = this.entry;
    if (!e) return 'Nothing to save.';
    if (!e.lines.length) return 'Add at least one line.';

    for (const l of e.lines) {
      if (l.quantity == null || l.quantity <= 0) return `Enter a quantity for ${l.name}.`;
      // Cost drives the moving average, so a blank here is a silent devaluation.
      if (l.unitCost == null || l.unitCost < 0) return `Enter a unit cost for ${l.name}.`;
    }
    return null;
  }

  /** Save as a draft — nothing moves until it is posted. */
  async saveDraft(): Promise<void> {
    const problem = this.validateEntry();
    if (problem) { this.error = problem; this.cdr.detectChanges(); return; }

    const warehouseId = this.warehouseId!;
    const e = this.entry!;
    this.saving = true;
    this.error = '';

    const res = await firstValueFrom(this.documents.create({
      documentType: 'GRN',
      documentDate: new Date().toISOString(),
      description: e.description.trim() || null,
      toWarehouseId: warehouseId,
      lines: e.lines.map((l, index) => ({
        itemId: l.itemId,
        warehouseId,
        variantId: l.variantId,
        quantity: l.quantity!,
        unitId: l.unitId,
        unitCost: l.unitCost!,
        lineNumber: index + 1,
      })),
    })).catch((err: any) => {
      this.error = err?.error?.message ?? 'Could not save the receipt.';
      return null;
    });

    this.saving = false;

    if (res?.data) {
      this.notice = `Draft ${res.data.documentNumber ?? ''} saved. Post it to move the stock.`;
      this.entry = null;
      this.pickedProductId = '';
      this.productOptions = [];
      await this.load();
    }
    this.cdr.detectChanges();
  }

  // ── Posting ───────────────────────────────────────────────────────────

  askToPost(doc: InventoryDocumentDto): void {
    this.confirming = doc;
    this.error = '';
  }

  cancelPost(): void {
    this.confirming = null;
  }

  async confirmPost(): Promise<void> {
    const doc = this.confirming;
    if (!doc) return;

    this.saving = true;
    const res = await firstValueFrom(this.documents.post(doc.id, {
      documentId: doc.id,
      postingDate: new Date().toISOString(),
    })).catch((err: any) => {
      this.error = err?.error?.message ?? 'Could not post the receipt.';
      return null;
    });

    this.saving = false;
    this.confirming = null;

    if (res?.data) {
      this.notice = `Receipt ${doc.documentNumber ?? ''} posted — stock updated.`;
      await this.load();
    }
    this.cdr.detectChanges();
  }

  trackByDoc = (_: number, d: InventoryDocumentDto) => d.id;
}
