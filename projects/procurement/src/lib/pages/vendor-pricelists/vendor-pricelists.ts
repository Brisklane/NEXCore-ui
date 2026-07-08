import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AppPageHeaderComponent, AppAlertComponent,
  AppInputComponent, AppSelectComponent, AppDataTableComponent,
  TableColumn, TableAction, RowActionEvent, SelectOption, RowHighlighter,
} from '@nexcore/shared';
import {
  EntityPickerInputComponent, EntityPickerItem, EntityPickerColumn, EntityPickerDisplayField,
} from '@nexcore/core';
import { VendorPricelistService } from '../../services/master-data.service';
import { VendorService } from '../../services/vendor.service';
import { CurrencyLookupService } from '../../services/currency-lookup.service';
import { UomLookupService, UnitOption } from '../../services/uom-lookup.service';
import { VendorPricelistDto, CreateVendorPricelistDto, CreateVendorPricelistItemDto } from '../../models/master-data.model';
import { VendorDto } from '../../models/vendor.model';
import { CURRENCY_OPTIONS, requiredText } from '../../models/procurement-constants';

@Component({
  selector: 'lib-vendor-pricelists',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    AppPageHeaderComponent, AppAlertComponent,
    AppInputComponent, AppSelectComponent, AppDataTableComponent,
    EntityPickerInputComponent,
  ],
  templateUrl: './vendor-pricelists.html',
  styleUrl: './vendor-pricelists.css',
})
export class VendorPricelistsPage implements OnInit {
  vendors: VendorDto[] = [];
  pricelists: VendorPricelistDto[] = [];
  selectedVendorId = '';
  loading = false;
  error = '';
  success = '';

  showForm = false;
  editing: VendorPricelistDto | null = null;
  submitted = false;
  saving = false;

  showDeleteConfirm = false;
  deleteTarget: VendorPricelistDto | null = null;

  highlighter = new RowHighlighter();

  form = { name: '', currencyCode: 'PKR', validFrom: '', validTo: '' };
  formItems: CreateVendorPricelistItemDto[] = [];
  newItem: Partial<CreateVendorPricelistItemDto> = { unitPrice: 0, minimumQuantity: 1 };

  currencyOptions: SelectOption[] = CURRENCY_OPTIONS;
  vendorOptions: SelectOption[] = [];
  uomOptions: SelectOption[] = [];
  units: UnitOption[] = [];

  // Item entity-picker (Core /api/Item/basic — paginated + searchable)
  readonly itemApiUrl = '/api/Item/basic';
  readonly itemDisplayFields: EntityPickerDisplayField[] = [
    { key: 'code', style: 'code' },
    { key: 'name', style: 'name' },
  ];
  readonly itemColumns: EntityPickerColumn[] = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'shortDescription', header: 'Description' },
  ];

  onItemSelect(item: EntityPickerItem): void {
    this.newItem.itemId = item['id'];
    this.newItem.itemCode = item['code'] ?? '';
    this.newItem.itemDescription = item['shortDescription'] || item['name'] || this.newItem.itemDescription;
    // Auto-fill unit price from the item's default purchase price (editable).
    if (item['purchasePrice'] != null) this.newItem.unitPrice = item['purchasePrice'];
    this.cdr.detectChanges();
  }

  readonly columns: TableColumn[] = [
    { key: 'name', label: 'Name' },
    { key: 'currencyCode', label: 'Currency', align: 'center', width: '100px' },
    { key: 'validFrom', label: 'Valid From', type: 'date' },
    { key: 'validTo', label: 'Valid To', format: (v) => v ? new Date(v).toLocaleDateString() : '—' },
    { key: 'items', label: 'Items', align: 'center', format: (v) => String((v ?? []).length) },
    { key: 'isActive', label: 'Status', type: 'badge', align: 'center',
      badgeClass: (v) => (v ? 'badge-active' : 'badge-inactive'), format: (v) => (v ? 'Active' : 'Inactive') },
  ];

  readonly actions: TableAction[] = [
    { eventName: 'edit', label: 'Edit', icon: '✏️' },
    { eventName: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger' },
  ];

  constructor(
    private service: VendorPricelistService,
    private vendorService: VendorService,
    private currencyService: CurrencyLookupService,
    private uomService: UomLookupService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.vendorService.getAll({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (r) => {
        this.vendors = r.data ?? [];
        this.vendorOptions = this.vendors.map(v => ({ value: v.id, label: `${v.vendorNumber} — ${v.name}` }));
        this.cdr.detectChanges();
      },
    });
    this.currencyService.getOptions().subscribe(opts => { this.currencyOptions = opts; this.cdr.detectChanges(); });
    this.uomService.getUnits().subscribe(u => {
      this.units = u;
      this.uomOptions = u.map(x => ({ value: x.id, label: `${x.code} — ${x.name}` }));
      this.cdr.detectChanges();
    });
  }

  unitName(id?: string): string { return this.units.find(u => u.id === id)?.name ?? ''; }

  onVendorChange(): void { this.loadPricelists(); }

  loadPricelists(): void {
    if (!this.selectedVendorId) { this.pricelists = []; return; }
    this.loading = true; this.error = '';
    this.service.getAll(this.selectedVendorId).subscribe({
      next: (r) => { this.pricelists = r.data ?? []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load pricelists'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  // ── Form ──────────────────────────────────────────────────────────────────────
  openCreate(): void {
    if (!this.selectedVendorId) { this.error = 'Select a vendor first.'; return; }
    this.editing = null;
    this.form = { name: '', currencyCode: 'PKR', validFrom: '', validTo: '' };
    this.formItems = [];
    this.newItem = { unitPrice: 0, minimumQuantity: 1 };
    this.submitted = false;
    this.showForm = true;
    this.error = ''; this.success = '';
  }

  openEdit(pl: VendorPricelistDto): void {
    this.editing = pl;
    this.form = {
      name: pl.name,
      currencyCode: pl.currencyCode,
      validFrom: pl.validFrom?.split('T')[0] ?? '',
      validTo: pl.validTo?.split('T')[0] ?? '',
    };
    this.formItems = pl.items.map(i => ({
      itemId: i.itemId,
      itemCode: i.itemCode,
      itemDescription: i.itemDescription,
      unitPrice: i.unitPrice,
      minimumQuantity: i.minimumQuantity,
      unitOfMeasureId: i.unitOfMeasureId,
      validFrom: i.validFrom?.split('T')[0],
      validTo: i.validTo?.split('T')[0],
    }));
    this.newItem = { unitPrice: 0, minimumQuantity: 1 };
    this.submitted = false;
    this.showForm = true;
    this.error = ''; this.success = '';
  }

  cancelForm(): void { this.showForm = false; this.editing = null; }

  // ── Line items ──────────────────────────────────────────────────────────────
  get newItemError(): string {
    if (!this.newItem.itemDescription?.trim()) return 'Item description is required.';
    if ((this.newItem.unitPrice ?? 0) <= 0) return 'Unit price must be greater than zero.';
    return '';
  }

  addItem(): void {
    if (this.newItemError) { this.error = this.newItemError; return; }
    this.error = '';
    this.formItems.push({
      itemId: this.newItem.itemId || undefined,
      itemCode: this.newItem.itemCode?.trim() || undefined,
      itemDescription: this.newItem.itemDescription!.trim(),
      unitPrice: Number(this.newItem.unitPrice),
      minimumQuantity: this.newItem.minimumQuantity != null ? Number(this.newItem.minimumQuantity) : undefined,
      unitOfMeasureId: this.newItem.unitOfMeasureId || undefined,
      validFrom: this.newItem.validFrom || undefined,
      validTo: this.newItem.validTo || undefined,
    });
    this.newItem = { unitPrice: 0, minimumQuantity: 1 };
  }

  removeItem(i: number): void { this.formItems.splice(i, 1); }

  // ── Validation ────────────────────────────────────────────────────────────────
  get errors() {
    const dateRange = (this.form.validFrom && this.form.validTo && this.form.validTo < this.form.validFrom)
      ? 'Valid To must be on or after Valid From.' : '';
    return {
      name: requiredText(this.form.name, 'Pricelist name'),
      validTo: dateRange,
      items: this.formItems.length === 0 ? 'Add at least one price line.' : '',
    };
  }
  get isValid(): boolean { const e = this.errors; return !e.name && !e.validTo && !e.items; }

  save(): void {
    this.submitted = true;
    if (!this.isValid) { this.error = this.errors.items || this.errors.validTo || 'Please correct the highlighted fields.'; this.cdr.detectChanges(); return; }
    this.saving = true; this.error = '';

    const dto: CreateVendorPricelistDto = {
      name: this.form.name.trim(),
      currencyCode: this.form.currencyCode || 'PKR',
      validFrom: this.form.validFrom || undefined,
      validTo: this.form.validTo || undefined,
      items: this.formItems,
    };
    const isCreate = !this.editing;
    const obs = this.editing
      ? this.service.update(this.selectedVendorId, this.editing.id, dto)
      : this.service.create(this.selectedVendorId, dto);
    obs.subscribe({
      next: (res) => { this.saving = false; this.success = this.editing ? 'Pricelist updated' : 'Pricelist created'; this.showForm = false; this.loadPricelists(); if (isCreate) this.highlighter.flash(res.data?.id, this.cdr); },
      error: (e) => { this.saving = false; this.error = e?.error?.message ?? 'Failed to save pricelist'; this.cdr.detectChanges(); },
    });
  }

  onRowAction(e: RowActionEvent<VendorPricelistDto>): void {
    if (e.eventName === 'edit') this.openEdit(e.row);
    if (e.eventName === 'delete') { this.deleteTarget = e.row; this.showDeleteConfirm = true; }
  }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    this.service.delete(this.selectedVendorId, this.deleteTarget.id).subscribe({
      next: () => { this.success = 'Pricelist deleted'; this.showDeleteConfirm = false; this.deleteTarget = null; this.loadPricelists(); },
      error: (e) => { this.error = e?.error?.message ?? 'Failed to delete'; this.showDeleteConfirm = false; this.cdr.detectChanges(); },
    });
  }
}
