import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AppPageHeaderComponent, AppAlertComponent,
  AppInputComponent, AppSelectComponent, AppTextareaComponent, AppDataTableComponent,
  TableColumn, TableAction, RowActionEvent, SelectOption, RowHighlighter,
} from '@nexcore/shared';
import { VendorDocumentService } from '../../services/master-data.service';
import { VendorService } from '../../services/vendor.service';
import { VendorDocumentDto, CreateVendorDocumentDto, UpdateVendorDocumentDto } from '../../models/master-data.model';
import {
  VendorDocumentType, VendorDocumentStatus,
  VENDOR_DOC_TYPE_LABELS, VENDOR_DOC_STATUS_LABELS,
} from '../../models/procurement-enums';
import { VendorDto } from '../../models/vendor.model';
import { enumOptions, requiredText, nonNegativeNumber } from '../../models/procurement-constants';

@Component({
  selector: 'lib-vendor-documents',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    AppPageHeaderComponent, AppAlertComponent,
    AppInputComponent, AppSelectComponent, AppTextareaComponent, AppDataTableComponent,
  ],
  templateUrl: './vendor-documents.html',
  styleUrl: './vendor-documents.css',
})
export class VendorDocumentsPage implements OnInit {
  vendors: VendorDto[] = [];
  documents: VendorDocumentDto[] = [];
  loading = false;
  error = '';
  success = '';

  selectedVendorId = '';
  viewMode: 'vendor' | 'expiring' = 'vendor';

  showForm = false;
  editing: VendorDocumentDto | null = null;
  submitted = false;
  saving = false;

  showDeleteConfirm = false;
  deleteTarget: VendorDocumentDto | null = null;

  highlighter = new RowHighlighter();

  form = {
    documentType: VendorDocumentType.TradeLicense as number,
    documentName: '', documentNumber: '', issuedBy: '',
    issuedAt: '', expiryDate: '', neverExpires: false,
    reminderDays: 30 as number | null, fileName: '', filePath: '', notes: '',
  };

  readonly docTypeOptions = enumOptions(VENDOR_DOC_TYPE_LABELS);
  vendorOptions: SelectOption[] = [];

  readonly actions: TableAction[] = [
    { eventName: 'edit', label: 'Edit', icon: '✏️', visible: () => this.viewMode === 'vendor' },
    { eventName: 'verify', label: 'Verify', icon: '✓', variant: 'primary',
      visible: (r: VendorDocumentDto) => this.viewMode === 'vendor' && !r.isVerified },
    { eventName: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger', visible: () => this.viewMode === 'vendor' },
  ];

  constructor(
    private service: VendorDocumentService,
    private vendorService: VendorService,
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
  }

  get columns(): TableColumn[] {
    const cols: TableColumn[] = [];
    if (this.viewMode === 'expiring') {
      cols.push({ key: 'vendorId', label: 'Vendor', format: (v) => this.vendorName(v) });
    }
    cols.push(
      { key: 'documentType', label: 'Type', format: (v) => VENDOR_DOC_TYPE_LABELS[v as VendorDocumentType] ?? String(v) },
      { key: 'documentName', label: 'Document' },
      { key: 'documentNumber', label: 'Number', format: (v) => v ?? '—' },
      { key: 'issuedAt', label: 'Issued', type: 'date' },
      { key: 'expiryDate', label: 'Expiry', format: (v, row) => row.neverExpires ? 'Never' : (v ? new Date(v).toLocaleDateString() : '—') },
      { key: 'status', label: 'Status', type: 'badge', align: 'center',
        badgeClass: (_v, row) => this.statusBadgeClass(row), format: (_v, row) => this.statusLabel(row) },
      { key: 'isVerified', label: 'Verified', type: 'badge', align: 'center',
        badgeClass: (v) => (v ? 'badge-active' : 'badge-no'), format: (v) => (v ? 'Verified' : 'Unverified') },
    );
    return cols;
  }

  vendorName(id: string): string {
    const v = this.vendors.find(x => x.id === id);
    return v ? v.name : '—';
  }

  statusLabel(doc: VendorDocumentDto): string {
    if (doc.isExpired) return 'Expired';
    if (doc.daysUntilExpiry != null && doc.daysUntilExpiry <= (doc.reminderDays || 30)) return 'Expiring Soon';
    return VENDOR_DOC_STATUS_LABELS[doc.status] ?? String(doc.status);
  }

  statusBadgeClass(doc: VendorDocumentDto): string {
    if (doc.isExpired || doc.status === VendorDocumentStatus.Expired || doc.status === VendorDocumentStatus.Revoked) return 'badge-blocked';
    if (doc.daysUntilExpiry != null && doc.daysUntilExpiry <= (doc.reminderDays || 30)) return 'badge-pending';
    return 'badge-active';
  }

  onVendorChange(): void {
    this.viewMode = 'vendor';
    this.loadDocs();
  }

  loadDocs(): void {
    if (!this.selectedVendorId) { this.documents = []; return; }
    this.loading = true; this.error = '';
    this.service.getAll(this.selectedVendorId).subscribe({
      next: (r) => { this.documents = r.data ?? []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load documents'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  loadExpiring(): void {
    this.viewMode = 'expiring';
    this.loading = true; this.error = '';
    this.service.getExpiring(30).subscribe({
      next: (r) => { this.documents = r.data ?? []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load expiring documents'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  // ── Form ──────────────────────────────────────────────────────────────────────
  openCreate(): void {
    if (!this.selectedVendorId) { this.error = 'Select a vendor first.'; return; }
    this.editing = null;
    this.form = {
      documentType: VendorDocumentType.TradeLicense, documentName: '', documentNumber: '', issuedBy: '',
      issuedAt: '', expiryDate: '', neverExpires: false, reminderDays: 30, fileName: '', filePath: '', notes: '',
    };
    this.submitted = false;
    this.showForm = true;
    this.error = ''; this.success = '';
  }

  openEdit(doc: VendorDocumentDto): void {
    this.editing = doc;
    this.form = {
      documentType: doc.documentType,
      documentName: doc.documentName,
      documentNumber: doc.documentNumber ?? '',
      issuedBy: doc.issuedBy ?? '',
      issuedAt: doc.issuedAt?.split('T')[0] ?? '',
      expiryDate: doc.expiryDate?.split('T')[0] ?? '',
      neverExpires: doc.neverExpires,
      reminderDays: doc.reminderDays,
      fileName: doc.fileName ?? '',
      filePath: doc.filePath ?? '',
      notes: doc.notes ?? '',
    };
    this.submitted = false;
    this.showForm = true;
    this.error = ''; this.success = '';
  }

  cancelForm(): void { this.showForm = false; this.editing = null; }

  get errors() {
    return {
      documentName: requiredText(this.form.documentName, 'Document name'),
      expiryDate: (!this.form.neverExpires && !this.form.expiryDate) ? 'Expiry date is required (or mark “never expires”).' : '',
      reminderDays: nonNegativeNumber(this.form.reminderDays, 'Reminder days'),
    };
  }
  get isValid(): boolean { const e = this.errors; return !e.documentName && !e.expiryDate && !e.reminderDays; }

  save(): void {
    this.submitted = true;
    if (!this.isValid) { this.cdr.detectChanges(); return; }
    this.saving = true; this.error = '';

    if (this.editing) {
      const dto: UpdateVendorDocumentDto = {
        documentName: this.form.documentName.trim(),
        documentNumber: this.form.documentNumber.trim() || undefined,
        issuedBy: this.form.issuedBy.trim() || undefined,
        issuedAt: this.form.issuedAt || undefined,
        expiryDate: this.form.neverExpires ? undefined : (this.form.expiryDate || undefined),
        neverExpires: this.form.neverExpires,
        reminderDays: Number(this.form.reminderDays ?? 30),
        fileName: this.form.fileName.trim() || undefined,
        filePath: this.form.filePath.trim() || undefined,
        notes: this.form.notes.trim() || undefined,
      };
      this.service.update(this.selectedVendorId, this.editing.id, dto).subscribe({
        next: () => { this.saving = false; this.success = 'Document updated'; this.showForm = false; this.loadDocs(); },
        error: (e) => { this.saving = false; this.error = e?.error?.message ?? 'Failed to update document'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateVendorDocumentDto = {
        documentType: Number(this.form.documentType) as VendorDocumentType,
        documentName: this.form.documentName.trim(),
        documentNumber: this.form.documentNumber.trim() || undefined,
        issuedBy: this.form.issuedBy.trim() || undefined,
        issuedAt: this.form.issuedAt || undefined,
        expiryDate: this.form.neverExpires ? undefined : (this.form.expiryDate || undefined),
        neverExpires: this.form.neverExpires,
        reminderDays: Number(this.form.reminderDays ?? 30),
        fileName: this.form.fileName.trim() || undefined,
        filePath: this.form.filePath.trim() || undefined,
        notes: this.form.notes.trim() || undefined,
      };
      this.service.create(this.selectedVendorId, dto).subscribe({
        next: (res) => { this.saving = false; this.success = 'Document added'; this.showForm = false; this.loadDocs(); this.highlighter.flash(res.data?.id, this.cdr); },
        error: (e) => { this.saving = false; this.error = e?.error?.message ?? 'Failed to add document'; this.cdr.detectChanges(); },
      });
    }
  }

  onRowAction(e: RowActionEvent<VendorDocumentDto>): void {
    if (e.eventName === 'edit') this.openEdit(e.row);
    if (e.eventName === 'verify') this.verify(e.row);
    if (e.eventName === 'delete') { this.deleteTarget = e.row; this.showDeleteConfirm = true; }
  }

  verify(doc: VendorDocumentDto): void {
    this.service.verify(this.selectedVendorId, doc.id).subscribe({
      next: () => { this.success = 'Document verified'; this.loadDocs(); },
      error: (e) => { this.error = e?.error?.message ?? 'Failed to verify'; this.cdr.detectChanges(); },
    });
  }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    this.service.delete(this.selectedVendorId, this.deleteTarget.id).subscribe({
      next: () => { this.success = 'Document deleted'; this.showDeleteConfirm = false; this.deleteTarget = null; this.loadDocs(); },
      error: (e) => { this.error = e?.error?.message ?? 'Failed to delete'; this.showDeleteConfirm = false; this.cdr.detectChanges(); },
    });
  }
}
