import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AppPageHeaderComponent, AppAlertComponent,
  AppInputComponent, AppSelectComponent, AppTextareaComponent, AppDataTableComponent,
  TableColumn, TableAction, RowActionEvent, SelectOption, RowHighlighter,
} from '@nexcore/shared';
import { GoodsReceiptService } from '../../services/goods-receipt.service';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { WarehouseLookupService } from '../../services/warehouse-lookup.service';
import {
  GoodsReceiptDto, CreateGoodsReceiptDto, CreateGoodsReceiptLineDto, InspectGoodsReceiptLineDto,
} from '../../models/goods-receipt.model';
import {
  GoodsReceiptStatus, ReceiptType, QualityInspectionStatus,
  GRN_STATUS_LABELS, RECEIPT_TYPE_LABELS, QUALITY_STATUS_LABELS,
} from '../../models/procurement-enums';
import { PurchaseOrderDto, PurchaseOrderStatus } from '../../models/purchase-order.model';
import { enumOptions } from '../../models/procurement-constants';

interface GrnLineRow extends CreateGoodsReceiptLineDto {
  itemCode?: string;
  itemDescription: string;
  quantityOrdered: number;
  quantityRemaining: number;
}

@Component({
  selector: 'lib-goods-receipt',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    AppPageHeaderComponent, AppAlertComponent,
    AppInputComponent, AppSelectComponent, AppTextareaComponent, AppDataTableComponent,
  ],
  templateUrl: './goods-receipt.html',
  styleUrl: './goods-receipt.css',
})
export class GoodsReceiptPage implements OnInit {
  receipts: GoodsReceiptDto[] = [];
  orders: PurchaseOrderDto[] = [];
  selectedPO: PurchaseOrderDto | null = null;
  loading = false;
  error = '';
  success = '';

  search = '';
  statusFilter: number | '' = '';

  page = 1; pageSize = 10; totalCount = 0; sortBy = ''; sortDirection: 'asc' | 'desc' = 'desc';
  private searchDebounce?: ReturnType<typeof setTimeout>;

  showForm = false;
  editing: GoodsReceiptDto | null = null;
  submitted = false;
  saving = false;

  showInspectModal = false;
  inspectTargetId = '';
  inspectReceiptNumber = '';
  inspectWarehouseId = '';
  inspectHint = '';
  inspectLines: (InspectGoodsReceiptLineDto & { itemDescription: string; quantityReceived: number })[] = [];

  showDeleteConfirm = false;
  deleteTarget: GoodsReceiptDto | null = null;

  posting = false;

  highlighter = new RowHighlighter();

  form = {
    purchaseOrderId: '', vendorDeliveryNoteNumber: '',
    receiptDate: new Date().toISOString().split('T')[0],
    receiptType: ReceiptType.Standard as number, warehouseId: '', notes: '', internalNotes: '',
  };
  formLines: GrnLineRow[] = [];

  poOptions: SelectOption[] = [];
  warehouseOptions: SelectOption[] = [];
  readonly receiptTypeOptions = enumOptions(RECEIPT_TYPE_LABELS);
  readonly qualityOptions = enumOptions(QUALITY_STATUS_LABELS);
  readonly statusFilterOptions = enumOptions(GRN_STATUS_LABELS);

  // POs eligible to receive against
  private readonly receivableStatuses = [
    PurchaseOrderStatus.Confirmed, PurchaseOrderStatus.SentToVendor,
    PurchaseOrderStatus.Acknowledged, PurchaseOrderStatus.PartiallyReceived,
  ];

  readonly columns: TableColumn[] = [
    { key: 'receiptNumber', label: 'Receipt #', width: '140px' },
    { key: 'purchaseOrderNumber', label: 'PO #', format: (v, row) => v ?? this.poNumber(row.purchaseOrderId) },
    { key: 'vendorName', label: 'Vendor', format: (v) => v ?? '—' },
    { key: 'receiptDate', label: 'Receipt Date', type: 'date' },
    { key: 'status', label: 'Status', type: 'badge', align: 'center',
      badgeClass: (v) => this.statusBadge(v), format: (v) => GRN_STATUS_LABELS[v as GoodsReceiptStatus] ?? String(v) },
    { key: 'lines', label: 'Lines', align: 'center', format: (v) => String((v ?? []).length) },
  ];

  readonly actions: TableAction[] = [
    { eventName: 'inspect', label: 'Open / Review', icon: '📋', visible: (r: GoodsReceiptDto) => r.status === GoodsReceiptStatus.Draft },
    { eventName: 'post', label: 'Post', icon: '✓', variant: 'primary', visible: (r: GoodsReceiptDto) => r.status === GoodsReceiptStatus.Draft },
    { eventName: 'cancel', label: 'Cancel', icon: '⊘', variant: 'danger', visible: (r: GoodsReceiptDto) => r.status === GoodsReceiptStatus.Posted },
    { eventName: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger', visible: (r: GoodsReceiptDto) => r.status === GoodsReceiptStatus.Draft },
  ];

  constructor(
    private service: GoodsReceiptService,
    private poService: PurchaseOrderService,
    private warehouseService: WarehouseLookupService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
    this.warehouseService.getOptions().subscribe(o => { this.warehouseOptions = o; this.cdr.detectChanges(); });
    this.poService.getAll({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (r) => {
        this.orders = r.data ?? [];
        this.poOptions = this.orders
          .filter(o => this.receivableStatuses.includes(o.status))
          .map(o => ({ value: o.id, label: `${o.orderNumber} — ${o.vendorName ?? ''}` }));
        this.cdr.detectChanges();
      },
    });
  }

  load(): void {
    this.loading = true; this.error = '';
    this.service.getAll({
      pageNumber: this.page, pageSize: this.pageSize, searchTerm: this.search.trim() || undefined,
      status: this.statusFilter === '' ? undefined : Number(this.statusFilter), sortBy: this.sortBy || undefined, sortDirection: this.sortDirection,
    }).subscribe({
      next: (r) => { this.receipts = r.data ?? []; this.totalCount = r.pagination?.totalCount ?? this.receipts.length; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load receipts'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  onSearchChange(): void { clearTimeout(this.searchDebounce); this.searchDebounce = setTimeout(() => { this.page = 1; this.load(); }, 300); }
  onStatusChange(): void { this.page = 1; this.load(); }
  onPageChange(page: number): void { this.page = page; this.load(); }
  onPageSizeChange(size: number): void { this.pageSize = size; this.page = 1; this.load(); }
  onSortChange(e: { sortBy: string; sortDirection: 'asc' | 'desc' }): void { this.sortBy = e.sortBy; this.sortDirection = e.sortDirection; this.page = 1; this.load(); }

  statusBadge(s: GoodsReceiptStatus): string {
    switch (s) {
      case GoodsReceiptStatus.Posted: return 'badge-active';
      case GoodsReceiptStatus.Cancelled: return 'badge-blocked';
      default: return 'badge-draft';
    }
  }
  poNumber(id: string): string { return this.orders.find(o => o.id === id)?.orderNumber ?? '—'; }
  qualityLabel(s: QualityInspectionStatus): string { return QUALITY_STATUS_LABELS[s] ?? String(s); }

  // ── Form ──────────────────────────────────────────────────────────────────────
  openCreate(): void {
    this.editing = null; this.resetForm(); this.submitted = false; this.showForm = true;
    this.error = ''; this.success = '';
  }

  onPOChange(): void {
    this.formLines = [];
    this.selectedPO = null;
    if (!this.form.purchaseOrderId) return;
    // Fetch the full PO so its lines (and remaining quantities) are available.
    this.poService.getById(this.form.purchaseOrderId).subscribe({
      next: (res) => {
        this.selectedPO = res.data ?? null;
        this.formLines = (this.selectedPO?.lines ?? [])
          .filter(l => l.quantityRemaining > 0)
          .map(l => ({
            purchaseOrderLineId: l.id,
            itemCode: l.itemCode,
            itemDescription: l.itemDescription,
            quantityOrdered: l.quantity,
            quantityRemaining: l.quantityRemaining,
            quantityReceived: l.quantityRemaining,
            quantityAccepted: l.quantityRemaining,
            quantityRejected: 0,
            storageLocationId: undefined,
            lotNumber: undefined,
            serialNumber: undefined,
            expiryDate: undefined,
            manufacturerBatchNumber: undefined,
            notes: undefined,
          }));
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load PO lines'; this.cdr.detectChanges(); },
    });
  }

  cancelForm(): void { this.showForm = false; this.editing = null; this.resetForm(); }

  resetForm(): void {
    this.form = {
      purchaseOrderId: '', vendorDeliveryNoteNumber: '',
      receiptDate: new Date().toISOString().split('T')[0],
      receiptType: ReceiptType.Standard, warehouseId: '', notes: '', internalNotes: '',
    };
    this.formLines = []; this.selectedPO = null;
  }

  /** Keep accepted + rejected within received for a line. */
  onQtyChange(l: GrnLineRow): void {
    const recv = Number(l.quantityReceived ?? 0);
    let accepted = Math.max(0, Number(l.quantityAccepted ?? 0));
    let rejected = Math.max(0, Number(l.quantityRejected ?? 0));
    // If the two over-fill the received total, trim rejected first so a just-entered
    // accepted value survives; otherwise back-fill accepted from the remainder.
    if (accepted + rejected > recv) {
      rejected = Math.max(0, recv - accepted);
      if (accepted > recv) { accepted = recv; rejected = 0; }
    } else if (accepted + rejected !== recv) {
      accepted = recv - rejected;
      if (accepted < 0) { accepted = 0; rejected = recv; }
    }
    l.quantityAccepted = accepted;
    l.quantityRejected = rejected;
  }

  get errors() {
    const anyReceived = this.formLines.some(l => Number(l.quantityReceived ?? 0) > 0);
    const overReceived = this.formLines.some(l => Number(l.quantityReceived ?? 0) > l.quantityRemaining);
    const unbalanced = this.formLines.some(l =>
      Number(l.quantityAccepted ?? 0) + Number(l.quantityRejected ?? 0) !== Number(l.quantityReceived ?? 0));
    return {
      po: this.form.purchaseOrderId ? '' : 'Select a purchase order.',
      warehouse: this.form.warehouseId ? '' : 'Select a destination warehouse — received stock lands here on posting.',
      lines: this.formLines.length === 0 ? 'The selected PO has no outstanding lines to receive.'
        : !anyReceived ? 'Enter a received quantity on at least one line.'
        : overReceived ? 'Received quantity cannot exceed the outstanding quantity.' : '',
      linesBalance: unbalanced ? 'Accepted + rejected must equal received on every line.' : '',
    };
  }
  get isValid(): boolean { const e = this.errors; return !e.po && !e.warehouse && !e.lines && !e.linesBalance; }

  save(): void {
    this.submitted = true;
    if (!this.isValid) { this.error = this.errors.po || this.errors.warehouse || this.errors.lines || this.errors.linesBalance; this.cdr.detectChanges(); return; }
    this.saving = true; this.error = '';
    const dto: CreateGoodsReceiptDto = {
      purchaseOrderId: this.form.purchaseOrderId,
      vendorDeliveryNoteNumber: this.form.vendorDeliveryNoteNumber.trim() || undefined,
      receiptDate: this.form.receiptDate,
      receiptType: Number(this.form.receiptType) as ReceiptType,
      warehouseId: this.form.warehouseId,
      notes: this.form.notes.trim() || undefined,
      internalNotes: this.form.internalNotes.trim() || undefined,
      // Only send lines actually being received.
      lines: this.formLines
        .filter(l => Number(l.quantityReceived ?? 0) > 0)
        .map(l => ({
          purchaseOrderLineId: l.purchaseOrderLineId,
          quantityReceived: Number(l.quantityReceived),
          quantityAccepted: Number(l.quantityAccepted ?? 0),
          quantityRejected: Number(l.quantityRejected ?? 0),
          storageLocationId: l.storageLocationId || undefined,
          lotNumber: l.lotNumber?.trim() || undefined,
          serialNumber: l.serialNumber?.trim() || undefined,
          expiryDate: l.expiryDate || undefined,
          manufacturerBatchNumber: l.manufacturerBatchNumber?.trim() || undefined,
          notes: l.notes?.trim() || undefined,
        })),
    };
    this.service.create(dto).subscribe({
      next: (res) => { this.saving = false; this.success = 'Goods receipt created'; this.showForm = false; this.page = 1; this.load(); this.highlighter.flash(res.data?.id, this.cdr); },
      error: (e) => { this.saving = false; this.error = e?.error?.message ?? 'Failed to create receipt'; this.cdr.detectChanges(); },
    });
  }

  // ── Row actions ───────────────────────────────────────────────────────────────
  onRowAction(e: RowActionEvent<GoodsReceiptDto>): void {
    switch (e.eventName) {
      case 'inspect': this.openInspect(e.row); break;
      case 'post': this.handlePost(e.row); break;
      case 'cancel': this.runAction(this.service.cancel(e.row.id), 'Receipt cancelled'); break;
      case 'delete': this.deleteTarget = e.row; this.showDeleteConfirm = true; break;
    }
  }

  /**
   * Post a draft receipt. Stock only lands in inventory when a receiving warehouse AND accepted
   * quantities are set, so if either is missing we open the Open/Review modal and prompt for them
   * first; once Saved (& Posted) there, the accepted quantities are added to that warehouse.
   */
  handlePost(row: GoodsReceiptDto): void {
    this.error = '';
    this.service.getById(row.id).subscribe({
      next: (res) => {
        const receipt = res.data ?? row;
        const totalAccepted = (receipt.lines ?? []).reduce((s, l) => s + (l.quantityAccepted || 0), 0);
        if (receipt.warehouseId && totalAccepted > 0) {
          this.doPost(receipt.id);
          return;
        }
        // Not ready to post — open the review modal and tell the user what's missing.
        this.populateInspect(receipt);
        this.inspectHint = !receipt.warehouseId
          ? 'Please select a receiving warehouse, confirm the accepted quantities, then Save & Post.'
          : 'Enter the accepted quantity on at least one line, then Save & Post.';
        this.showInspectModal = true;
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load receipt for posting'; this.cdr.detectChanges(); },
    });
  }

  /** Post the receipt and show exactly how much stock was added, and to which warehouse. */
  private doPost(id: string): void {
    this.posting = true;
    this.service.post(id).subscribe({
      next: (res) => {
        this.posting = false;
        this.showInspectModal = false;
        const r = res.data;
        const lines = r?.lines ?? [];
        const totalAccepted = lines.reduce((s, l) => s + (l.quantityAccepted || 0), 0);
        const whName = this.warehouseOptions.find(o => o.value === r?.warehouseId)?.label ?? 'inventory';
        this.success = `Receipt ${r?.receiptNumber ?? ''} posted — ${totalAccepted} unit${totalAccepted === 1 ? '' : 's'} added to ${whName}.`;
        this.load();
      },
      error: (e) => { this.posting = false; this.error = e?.error?.message ?? 'Failed to post receipt'; this.cdr.detectChanges(); },
    });
  }

  private runAction(obs: ReturnType<GoodsReceiptService['post']>, msg: string): void {
    obs.subscribe({
      next: () => { this.success = msg; this.load(); },
      error: (e) => { this.error = e?.error?.message ?? 'Action failed'; this.cdr.detectChanges(); },
    });
  }

  openInspect(r: GoodsReceiptDto): void {
    this.error = '';
    this.inspectHint = '';
    this.service.getById(r.id).subscribe({
      next: (res) => { this.populateInspect(res.data!); this.showInspectModal = true; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load receipt for inspection'; this.cdr.detectChanges(); },
    });
  }

  private populateInspect(receipt: GoodsReceiptDto): void {
    this.inspectTargetId = receipt.id;
    this.inspectReceiptNumber = receipt.receiptNumber;
    this.inspectWarehouseId = receipt.warehouseId ?? '';
    this.inspectLines = receipt.lines.map(l => ({
      lineId: l.id, itemDescription: l.itemDescription, qualityStatus: l.qualityStatus,
      qualityNotes: l.qualityNotes, quantityAccepted: l.quantityAccepted, quantityRejected: l.quantityRejected,
      quantityReceived: l.quantityReceived,
    }));
  }

  get inspectBalanced(): boolean {
    return this.inspectLines.every(l =>
      Number(l.quantityAccepted ?? 0) + Number(l.quantityRejected ?? 0) === Number(l.quantityReceived ?? 0));
  }

  /** Save the inspection (warehouse + accepted/rejected). When postAfter is true, post once saved
   *  so the accepted quantities are added to the chosen warehouse in one step. */
  submitInspection(postAfter = false): void {
    if (!this.inspectBalanced) {
      this.error = 'Accepted + rejected must equal received on every line.';
      this.cdr.detectChanges();
      return;
    }
    if (postAfter && !this.inspectWarehouseId) {
      this.error = 'Please select a receiving warehouse before posting.';
      this.cdr.detectChanges();
      return;
    }
    const lines: InspectGoodsReceiptLineDto[] = this.inspectLines.map(l => ({
      lineId: l.lineId, qualityStatus: Number(l.qualityStatus) as QualityInspectionStatus,
      qualityNotes: l.qualityNotes, quantityAccepted: Number(l.quantityAccepted), quantityRejected: Number(l.quantityRejected),
    }));
    const recordInspection = () => this.service.inspect(this.inspectTargetId, lines).subscribe({
      next: () => {
        if (postAfter) { this.doPost(this.inspectTargetId); }
        else { this.success = 'Receipt updated'; this.showInspectModal = false; this.load(); }
      },
      error: (e) => { this.error = e?.error?.message ?? 'Failed to save'; this.showInspectModal = false; this.cdr.detectChanges(); },
    });
    // Persist the chosen warehouse first (the header field), then the line quantities/QC.
    if (this.inspectWarehouseId) {
      this.service.update(this.inspectTargetId, { warehouseId: this.inspectWarehouseId }).subscribe({
        next: () => recordInspection(),
        error: (e) => { this.error = e?.error?.message ?? 'Failed to set warehouse'; this.cdr.detectChanges(); },
      });
    } else {
      recordInspection();
    }
  }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    this.service.delete(this.deleteTarget.id).subscribe({
      next: () => { this.success = 'Receipt deleted'; this.showDeleteConfirm = false; this.deleteTarget = null; this.load(); },
      error: (e) => { this.error = e?.error?.message ?? 'Failed to delete'; this.showDeleteConfirm = false; this.cdr.detectChanges(); },
    });
  }
}
