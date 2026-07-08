import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AppPageHeaderComponent, AppAlertComponent,
  AppInputComponent, AppSelectComponent, AppTextareaComponent, AppDataTableComponent,
  TableColumn, TableAction, RowActionEvent, SelectOption, RowHighlighter,
} from '@nexcore/shared';
import { VendorPerformanceService } from '../../services/vendor-sourcing.service';
import { VendorService } from '../../services/vendor.service';
import {
  VendorPerformanceDto, CreateVendorPerformanceDto, UpdateVendorPerformanceDto,
} from '../../models/vendor-sourcing.model';
import { VendorDto } from '../../models/vendor.model';
import { requiredText } from '../../models/procurement-constants';

@Component({
  selector: 'lib-vendor-performance',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    AppPageHeaderComponent, AppAlertComponent,
    AppInputComponent, AppSelectComponent, AppTextareaComponent, AppDataTableComponent,
  ],
  templateUrl: './vendor-performance.html',
  styleUrl: './vendor-performance.css',
})
export class VendorPerformancePage implements OnInit {
  scorecards: VendorPerformanceDto[] = [];
  vendors: VendorDto[] = [];
  loading = false;
  error = '';
  success = '';

  search = '';
  vendorFilter = '';

  showForm = false;
  editing: VendorPerformanceDto | null = null;
  submitted = false;
  saving = false;

  showDeleteConfirm = false;
  deleteTarget: VendorPerformanceDto | null = null;

  highlighter = new RowHighlighter();

  form = {
    vendorId: '', periodFrom: '', periodTo: '',
    onTimeDeliveryRate: 0 as number | null, qualityScore: 0 as number | null,
    priceComplianceRate: 0 as number | null, responsivenessScore: 0 as number | null,
    documentAccuracyScore: 0 as number | null,
    totalOrders: 0 as number | null, lateDeliveries: 0 as number | null,
    qualityRejections: 0 as number | null, invoiceDiscrepancies: 0 as number | null,
    totalPurchaseValue: 0 as number | null, comments: '',
  };

  vendorOptions: SelectOption[] = [];

  readonly columns: TableColumn[] = [
    { key: 'vendorNumber', label: 'Vendor #', width: '110px' },
    { key: 'vendorName', label: 'Vendor' },
    { key: 'period', label: 'Period', format: (_v, row) => `${this.d(row.periodFrom)} – ${this.d(row.periodTo)}` },
    { key: 'onTimeDeliveryRate', label: 'On-Time %', align: 'right', format: (v) => this.pct(v) },
    { key: 'qualityScore', label: 'Quality', align: 'right', format: (v) => this.pct(v) },
    { key: 'overallRating', label: 'Overall', type: 'badge', align: 'center',
      badgeClass: (v) => this.ratingClass(v), format: (v) => this.pct(v) },
    { key: 'totalOrders', label: 'Orders', align: 'right' },
    { key: 'totalPurchaseValue', label: 'Spend', type: 'currency', align: 'right' },
  ];

  readonly actions: TableAction[] = [
    { eventName: 'edit', label: 'Edit', icon: '✏️' },
    { eventName: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger' },
  ];

  constructor(
    private service: VendorPerformanceService,
    private vendorService: VendorService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
    this.vendorService.getAll({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (r) => {
        this.vendors = r.data ?? [];
        this.vendorOptions = this.vendors.map(v => ({ value: v.id, label: `${v.vendorNumber} — ${v.name}` }));
        this.cdr.detectChanges();
      },
    });
  }

  private d(v?: string): string { return v ? new Date(v).toLocaleDateString() : '—'; }
  private pct(v: number): string { return `${(+v).toFixed(1)}%`; }

  ratingClass(v: number): string {
    if (v >= 85) return 'badge-active';
    if (v >= 60) return 'badge-pending';
    return 'badge-blocked';
  }

  load(): void {
    this.loading = true; this.error = '';
    this.service.getAll().subscribe({
      next: (r) => { this.scorecards = r.data ?? []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load scorecards'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  get filteredScorecards(): VendorPerformanceDto[] {
    const term = this.search.trim().toLowerCase();
    return this.scorecards.filter(s => {
      const matchesVendor = !this.vendorFilter || s.vendorId === this.vendorFilter;
      const matchesTerm = !term ||
        s.vendorName.toLowerCase().includes(term) ||
        s.vendorNumber.toLowerCase().includes(term);
      return matchesVendor && matchesTerm;
    });
  }

  /** Live preview of the weighted overall score (mirrors the server formula). */
  get previewOverall(): number {
    const n = (x: number | null) => Number(x ?? 0);
    return Math.round(
      (n(this.form.onTimeDeliveryRate) * 0.30 +
       n(this.form.qualityScore) * 0.30 +
       n(this.form.priceComplianceRate) * 0.20 +
       n(this.form.responsivenessScore) * 0.10 +
       n(this.form.documentAccuracyScore) * 0.10) * 100) / 100;
  }

  // ── Form ──────────────────────────────────────────────────────────────────────
  openCreate(): void {
    this.editing = null;
    this.form = {
      vendorId: '', periodFrom: '', periodTo: '',
      onTimeDeliveryRate: 0, qualityScore: 0, priceComplianceRate: 0,
      responsivenessScore: 0, documentAccuracyScore: 0,
      totalOrders: 0, lateDeliveries: 0, qualityRejections: 0,
      invoiceDiscrepancies: 0, totalPurchaseValue: 0, comments: '',
    };
    this.submitted = false;
    this.showForm = true;
    this.error = ''; this.success = '';
  }

  openEdit(s: VendorPerformanceDto): void {
    this.editing = s;
    this.form = {
      vendorId: s.vendorId,
      periodFrom: s.periodFrom?.split('T')[0] ?? '',
      periodTo: s.periodTo?.split('T')[0] ?? '',
      onTimeDeliveryRate: s.onTimeDeliveryRate,
      qualityScore: s.qualityScore,
      priceComplianceRate: s.priceComplianceRate,
      responsivenessScore: s.responsivenessScore,
      documentAccuracyScore: s.documentAccuracyScore,
      totalOrders: s.totalOrders,
      lateDeliveries: s.lateDeliveries,
      qualityRejections: s.qualityRejections,
      invoiceDiscrepancies: s.invoiceDiscrepancies,
      totalPurchaseValue: s.totalPurchaseValue,
      comments: s.comments ?? '',
    };
    this.submitted = false;
    this.showForm = true;
    this.error = ''; this.success = '';
  }

  cancelForm(): void { this.showForm = false; this.editing = null; }

  get errors() {
    return {
      vendorId: this.form.vendorId ? '' : 'Vendor is required.',
      periodFrom: requiredText(this.form.periodFrom, 'Period start'),
      periodTo: !this.form.periodTo
        ? 'Period end is required.'
        : (this.form.periodTo < this.form.periodFrom ? 'Period end must be on or after start.' : ''),
    };
  }
  get isValid(): boolean { const e = this.errors; return !e.vendorId && !e.periodFrom && !e.periodTo; }

  private clamp(v: number | null): number {
    const n = Number(v ?? 0);
    return Math.min(100, Math.max(0, n));
  }

  save(): void {
    this.submitted = true;
    if (!this.isValid) { this.error = 'Please correct the highlighted fields.'; this.cdr.detectChanges(); return; }
    this.saving = true; this.error = '';

    if (this.editing) {
      const dto: UpdateVendorPerformanceDto = {
        periodFrom: this.form.periodFrom,
        periodTo: this.form.periodTo,
        onTimeDeliveryRate: this.clamp(this.form.onTimeDeliveryRate),
        qualityScore: this.clamp(this.form.qualityScore),
        priceComplianceRate: this.clamp(this.form.priceComplianceRate),
        responsivenessScore: this.clamp(this.form.responsivenessScore),
        documentAccuracyScore: this.clamp(this.form.documentAccuracyScore),
        totalOrders: Number(this.form.totalOrders ?? 0),
        lateDeliveries: Number(this.form.lateDeliveries ?? 0),
        qualityRejections: Number(this.form.qualityRejections ?? 0),
        invoiceDiscrepancies: Number(this.form.invoiceDiscrepancies ?? 0),
        totalPurchaseValue: Number(this.form.totalPurchaseValue ?? 0),
        comments: this.form.comments.trim() || undefined,
      };
      this.service.update(this.editing.id, dto).subscribe({
        next: () => { this.saving = false; this.success = 'Scorecard updated'; this.showForm = false; this.load(); },
        error: (e) => { this.saving = false; this.error = e?.error?.message ?? 'Failed to update'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateVendorPerformanceDto = {
        vendorId: this.form.vendorId,
        periodFrom: this.form.periodFrom,
        periodTo: this.form.periodTo,
        onTimeDeliveryRate: this.clamp(this.form.onTimeDeliveryRate),
        qualityScore: this.clamp(this.form.qualityScore),
        priceComplianceRate: this.clamp(this.form.priceComplianceRate),
        responsivenessScore: this.clamp(this.form.responsivenessScore),
        documentAccuracyScore: this.clamp(this.form.documentAccuracyScore),
        totalOrders: Number(this.form.totalOrders ?? 0),
        lateDeliveries: Number(this.form.lateDeliveries ?? 0),
        qualityRejections: Number(this.form.qualityRejections ?? 0),
        invoiceDiscrepancies: Number(this.form.invoiceDiscrepancies ?? 0),
        totalPurchaseValue: Number(this.form.totalPurchaseValue ?? 0),
        comments: this.form.comments.trim() || undefined,
      };
      this.service.create(dto).subscribe({
        next: (res) => { this.saving = false; this.success = 'Scorecard recorded'; this.showForm = false; this.load(); this.highlighter.flash(res.data?.id, this.cdr); },
        error: (e) => { this.saving = false; this.error = e?.error?.message ?? 'Failed to create'; this.cdr.detectChanges(); },
      });
    }
  }

  onRowAction(e: RowActionEvent<VendorPerformanceDto>): void {
    if (e.eventName === 'edit') this.openEdit(e.row);
    if (e.eventName === 'delete') { this.deleteTarget = e.row; this.showDeleteConfirm = true; }
  }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    this.service.delete(this.deleteTarget.id).subscribe({
      next: () => { this.success = 'Scorecard deleted'; this.showDeleteConfirm = false; this.deleteTarget = null; this.load(); },
      error: (e) => { this.error = e?.error?.message ?? 'Failed to delete'; this.showDeleteConfirm = false; this.cdr.detectChanges(); },
    });
  }
}
