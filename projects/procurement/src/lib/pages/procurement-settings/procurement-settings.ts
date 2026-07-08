import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectOption } from '@nexcore/shared';
import { ProcurementSettingsService, ApprovalWorkflowService } from '../../services/master-data.service';
import { CurrencyLookupService } from '../../services/currency-lookup.service';
import { ProcurementSettingsDto, UpdateProcurementSettingsDto } from '../../models/master-data.model';
import { PAYMENT_TERMS_LABELS } from '../../models/vendor.model';
import { ApprovalDocumentType } from '../../models/procurement-enums';

@Component({
  selector: 'lib-procurement-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './procurement-settings.html',
  styleUrl: './procurement-settings.css',
})
export class ProcurementSettingsPage implements OnInit {
  settings: ProcurementSettingsDto | null = null;
  loading = false;
  saving = false;
  error = '';
  success = '';

  readonly paymentTermOptions = Object.entries(PAYMENT_TERMS_LABELS).map(([k, v]) => ({ value: Number(k), label: v }));
  currencyOptions: SelectOption[] = [];

  // Approval workflows, split by the document type they apply to.
  poWorkflows: SelectOption[] = [];
  requisitionWorkflows: SelectOption[] = [];
  invoiceWorkflows: SelectOption[] = [];

  constructor(
    private service: ProcurementSettingsService,
    private currencyService: CurrencyLookupService,
    private workflowService: ApprovalWorkflowService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.currencyService.getOptions().subscribe(opts => { this.currencyOptions = opts; this.cdr.detectChanges(); });
    this.workflowService.getAll().subscribe({
      next: (r) => {
        const all = r.data ?? [];
        const byType = (t: ApprovalDocumentType) =>
          all.filter(w => w.documentType === t && w.isActive).map(w => ({ value: w.id, label: w.name }));
        this.poWorkflows = byType(ApprovalDocumentType.PurchaseOrder);
        this.requisitionWorkflows = byType(ApprovalDocumentType.PurchaseRequisition);
        this.invoiceWorkflows = byType(ApprovalDocumentType.PurchaseInvoice);
        this.cdr.detectChanges();
      },
    });
    this.service.get().subscribe({
      next: (r) => {
        this.settings = r.data ?? null;
        // Default the currency to PKR when none has been set yet.
        if (this.settings && !this.settings.defaultCurrencyCode) this.settings.defaultCurrencyCode = 'PKR';
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load settings'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  save(): void {
    if (!this.settings) return;
    this.saving = true;
    const dto: UpdateProcurementSettingsDto = { ...this.settings };
    this.service.update(dto).subscribe({
      next: (r) => { this.settings = r.data ?? this.settings; this.success = 'Settings saved'; this.saving = false; this.cdr.detectChanges(); },
      error: (e) => { this.error = e?.error?.message ?? 'Failed to save'; this.saving = false; this.cdr.detectChanges(); },
    });
  }
}
