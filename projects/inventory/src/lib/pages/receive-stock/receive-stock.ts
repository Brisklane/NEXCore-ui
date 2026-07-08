import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ItemService } from '../../services/item.service';
import { WarehouseService } from '../../services/warehouse.service';
import { InventoryDocumentService } from '../../services/inventory-document.service';
import { ItemDto } from '../../models/item.model';
import { WarehouseDto } from '../../models/warehouse.model';
import { CreateInventoryDocumentLineDto } from '../../models/inventory-document.model';

interface ReceiveLine {
  itemId: string;
  quantity: number | null;
  unitCost: number | null;
  // lot capture
  batchNumber: string;
  manufactureDate: string;
  expiryDate: string;
  // serial capture (one per line in the textarea)
  serialText: string;
}

/** Receive Stock (GRN) — create + post a goods receipt, capturing serials / batch details per line. */
@Component({
  selector: 'lib-receive-stock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './receive-stock.html',
  styleUrl: './receive-stock.css',
})
export class ReceiveStockPage implements OnInit {
  warehouses: WarehouseDto[] = [];
  items: ItemDto[] = [];
  loading = false;
  saving = false;
  error = '';

  warehouseId = '';
  reference = '';
  documentDate = new Date().toISOString().split('T')[0];
  lines: ReceiveLine[] = [];

  constructor(
    private itemService: ItemService,
    private warehouseService: WarehouseService,
    private documentService: InventoryDocumentService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.warehouseService.getActive().subscribe({ next: (r) => { this.warehouses = r.data ?? []; if (this.warehouses.length === 1) this.warehouseId = this.warehouses[0].id; this.cdr.detectChanges(); } });
    this.itemService.getAll({ pageNumber: 1, pageSize: 1000 }).subscribe({ next: (r) => { this.items = r.data ?? []; this.cdr.detectChanges(); } });
    this.addLine();
  }

  addLine(): void { this.lines.push({ itemId: '', quantity: null, unitCost: null, batchNumber: '', manufactureDate: '', expiryDate: '', serialText: '' }); }
  removeLine(i: number): void { this.lines.splice(i, 1); }

  itemOf(id: string): ItemDto | undefined { return this.items.find(i => i.id === id); }
  tracking(id: string): 'Serial' | 'Lot' | 'None' {
    const it = this.itemOf(id);
    if (!it) return 'None';
    return it.trackingType === 'Serial' || it.isSerialTracked ? 'Serial'
      : it.trackingType === 'Lot' || it.isBatchTracked ? 'Lot' : 'None';
  }
  baseUnitName(id: string): string { const it = this.itemOf(id); return it ? '' : ''; }

  parsedSerials(line: ReceiveLine): string[] {
    return line.serialText.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
  }
  /** Effective quantity for a line: serial lines are driven by the serial count. */
  lineQty(line: ReceiveLine): number {
    if (this.tracking(line.itemId) === 'Serial') return this.parsedSerials(line).length;
    return line.quantity ?? 0;
  }

  get totalQty(): number { return this.lines.reduce((s, l) => s + this.lineQty(l), 0); }
  get totalCost(): number { return this.lines.reduce((s, l) => s + this.lineQty(l) * (l.unitCost ?? 0), 0); }

  private lineError(line: ReceiveLine, idx: number): string | null {
    if (!line.itemId) return `Line ${idx + 1}: choose an item`;
    const track = this.tracking(line.itemId);
    if (track === 'Serial') {
      const serials = this.parsedSerials(line);
      if (serials.length === 0) return `Line ${idx + 1}: enter at least one serial`;
      if (new Set(serials).size !== serials.length) return `Line ${idx + 1}: duplicate serials`;
    } else {
      if (!line.quantity || line.quantity <= 0) return `Line ${idx + 1}: enter a quantity`;
      if (track === 'Lot' && !line.batchNumber.trim()) return `Line ${idx + 1}: enter a batch number`;
    }
    return null;
  }

  get canSave(): boolean {
    if (!this.warehouseId || this.lines.length === 0) return false;
    return this.lines.every((l, i) => !this.lineError(l, i));
  }

  save(): void {
    if (!this.warehouseId) { this.error = 'Select a destination warehouse'; return; }
    for (let i = 0; i < this.lines.length; i++) {
      const e = this.lineError(this.lines[i], i);
      if (e) { this.error = e; return; }
    }
    this.error = '';
    this.saving = true;

    const dtoLines: CreateInventoryDocumentLineDto[] = this.lines.map((l, i) => {
      const it = this.itemOf(l.itemId)!;
      const track = this.tracking(l.itemId);
      const qty = this.lineQty(l);
      const line: CreateInventoryDocumentLineDto = {
        itemId: l.itemId,
        warehouseId: this.warehouseId,
        quantity: qty,
        unitId: it.baseUnitId,
        unitCost: l.unitCost ?? 0,
        lineNumber: i + 1,
      };
      if (track === 'Serial') {
        line.serials = this.parsedSerials(l).map(sn => ({ serialNumber: sn }));
      } else if (track === 'Lot') {
        line.batchNumber = l.batchNumber.trim();
        line.manufactureDate = l.manufactureDate || null;
        line.expiryDate = l.expiryDate || null;
      }
      return line;
    });

    this.documentService.create({
      documentType: 'GRN',
      documentDate: this.documentDate,
      description: this.reference || 'Goods receipt',
      toWarehouseId: this.warehouseId,
      lines: dtoLines,
    }).subscribe({
      next: (res) => {
        const id = res.data?.id;
        if (!id) { this.error = res.message || 'Failed to create receipt'; this.saving = false; this.cdr.detectChanges(); return; }
        this.documentService.post(id, { documentId: id, postingDate: this.documentDate }).subscribe({
          next: (pr) => {
            this.saving = false;
            if (!pr.success) { this.error = pr.message || 'Receipt created but posting failed'; this.cdr.detectChanges(); return; }
            this.router.navigate(['../documents'], { relativeTo: this.route });
          },
          error: (err: HttpErrorResponse) => { this.saving = false; this.error = err.error?.message || 'Receipt created but posting failed'; this.cdr.detectChanges(); },
        });
      },
      error: (err: HttpErrorResponse) => { this.saving = false; this.error = err.error?.message || 'Failed to create receipt'; this.cdr.detectChanges(); },
    });
  }

  cancel(): void { this.router.navigate(['../documents'], { relativeTo: this.route }); }
}
