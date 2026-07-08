import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, of, switchMap } from 'rxjs';
import { environment } from '@env';
import { AuthService } from '@nexcore/core';
import { PosSettingsService } from '../../services/pos-settings.service';
import { SALES_API } from '../../services/sales-api-config';
import {
  PosReceiptTemplateDto,
  CreatePosReceiptTemplateDto,
  UpdatePosReceiptTemplateDto,
  PaperSize,
} from '../../models/pos-settings.model';
import { RowHighlighter } from '@nexcore/shared';

interface ToggleField {
  key: keyof Pick<PosReceiptTemplateDto,
    'showBarcode' | 'showQrCode' | 'showCashierName' | 'showCustomerName' |
    'showDiscountLine' | 'showTaxBreakdown' | 'showLoyaltyPoints' | 'showSavingsAmount'>;
  label: string;
}

@Component({
  selector: 'lib-pos-receipt-templates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pos-receipt-templates.html',
  styleUrl: './pos-receipt-templates.css',
})
export class PosReceiptTemplatesComponent implements OnInit {
  templates: PosReceiptTemplateDto[] = [];
  loading = false;
  error = '';
  successMsg = '';

  showForm = false;
  editing: PosReceiptTemplateDto | null = null;
  highlighter = new RowHighlighter();
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  sort(column: string): void {
    if (this.sortBy === column) this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else { this.sortBy = column; this.sortDirection = 'asc'; }
    this.cdr.detectChanges();
  }

  get displayTemplates(): PosReceiptTemplateDto[] {
    const rows: any[] = [...this.templates];
    if (this.sortBy) {
      const dir = this.sortDirection === 'asc' ? 1 : -1;
      rows.sort((a: any, b: any) => {
        const av = a?.[this.sortBy], bv = b?.[this.sortBy];
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
        return String(av).localeCompare(String(bv), undefined, { numeric: true }) * dir;
      });
    }
    const hid = this.highlighter?.id;
    if (hid != null) { const i = rows.findIndex(r => r?.id === hid); if (i > 0) { const [x] = rows.splice(i, 1); rows.unshift(x); } }
    return rows;
  }

  readonly paperSizes: PaperSize[] = ['Thermal58mm', 'Thermal80mm', 'A4'];
  readonly toggles: ToggleField[] = [
    { key: 'showBarcode', label: 'Barcode' },
    { key: 'showQrCode', label: 'QR code' },
    { key: 'showCashierName', label: 'Cashier name' },
    { key: 'showCustomerName', label: 'Customer name' },
    { key: 'showDiscountLine', label: 'Discount line' },
    { key: 'showTaxBreakdown', label: 'Tax breakdown' },
    { key: 'showLoyaltyPoints', label: 'Loyalty points' },
    { key: 'showSavingsAmount', label: 'Savings amount' },
  ];

  // ── Form model ────────────────────────────────────────────────────────────────
  form: CreatePosReceiptTemplateDto = this.blankForm();

  /** Company logo (as a usable data URL) used as the default for new templates. */
  companyLogoDataUrl = '';
  /** Max upload size — keep logos small since they print on every receipt. */
  private readonly MAX_LOGO_BYTES = 1024 * 1024; // 1 MB

  // ── Logo upload state ───────────────────────────────────────────────────────
  // The logo is persisted via a dedicated multipart endpoint (upload-logo), not
  // inlined on the template DTO. We stage the chosen file + a preview here and
  // apply it after the template is saved (create → id → upload).
  pendingLogoFile: File | null = null;
  pendingLogoPreview = '';
  /** When editing, the user cleared an existing logo → delete it on save. */
  removeLogoOnSave = false;

  constructor(
    private settings: PosSettingsService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  ngOnInit() {
    this.load();
    this.loadCompanyLogo();
  }

  /** Fetch the company logo once so new templates can default to it. */
  private loadCompanyLogo() {
    const companyId = this.auth.getCompanyId();
    if (!companyId) return;
    this.http.get<any>(SALES_API.company.getById(companyId)).subscribe({
      next: (res) => {
        const b64 = res?.data?.companyLogo;
        this.companyLogoDataUrl = b64 ? this.toDataUrl(b64) : '';
        // If the form is already open on a fresh template with nothing staged, seed it.
        if (this.showForm && !this.editing && !this.pendingLogoFile && !this.form.logoUrl && this.companyLogoDataUrl) {
          this.useCompanyLogo();
        }
        this.cdr.detectChanges();
      },
      error: () => { /* logo is optional — leave the field blank */ },
    });
  }

  /** The company record stores the logo as bare base64; make it an <img>-usable URL. */
  private toDataUrl(b64: string): string {
    return b64.startsWith('data:') ? b64 : `data:image/*;base64,${b64}`;
  }

  private blankForm(): CreatePosReceiptTemplateDto {
    return {
      templateName: '',
      headerBusinessName: '',
      headerAddressLine1: '',
      headerAddressLine2: '',
      headerPhone: '',
      headerEmail: '',
      headerWebsite: '',
      taxRegistrationNumber: '',
      logoUrl: '',
      headerMessage: '',
      footerMessage: '',
      returnPolicy: '',
      showBarcode: false,
      showQrCode: false,
      showCashierName: true,
      showCustomerName: false,
      showDiscountLine: true,
      showTaxBreakdown: true,
      showLoyaltyPoints: false,
      showSavingsAmount: false,
      paperSize: 'Thermal80mm',
      isDefault: false,
    };
  }

  load() {
    this.loading = true;
    this.error = '';
    this.settings.getReceiptTemplates().subscribe({
      next: (res) => {
        this.templates = res.data ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load receipt templates.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openCreateForm() {
    this.editing = null;
    this.form = this.blankForm();
    this.resetLogoState();
    // New templates default to the company logo (the cashier can replace or clear it).
    if (this.companyLogoDataUrl) this.useCompanyLogo();
    this.error = '';
    this.showForm = true;
  }

  /** Stage a chosen image file for upload after the template is saved. */
  onLogoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.error = 'Please choose an image file for the logo.';
      input.value = '';
      return;
    }
    if (file.size > this.MAX_LOGO_BYTES) {
      this.error = 'Logo image must be under 1 MB.';
      input.value = '';
      return;
    }
    this.error = '';
    this.removeLogoOnSave = false;
    this.pendingLogoFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.pendingLogoPreview = reader.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
    // Reset so re-selecting the same file still fires (change).
    input.value = '';
  }

  /** Stage the company logo (a data URL) as a file to upload on save. */
  useCompanyLogo() {
    if (!this.companyLogoDataUrl) return;
    const file = this.dataUrlToFile(this.companyLogoDataUrl, 'company-logo');
    if (!file) { this.error = 'Could not read the company logo.'; return; }
    this.error = '';
    this.removeLogoOnSave = false;
    this.pendingLogoFile = file;
    this.pendingLogoPreview = this.companyLogoDataUrl;
  }

  clearLogo() {
    // A staged (not-yet-uploaded) logo is just discarded; a saved one is removed on save.
    if (!this.pendingLogoFile && this.editing && this.form.logoUrl) {
      this.removeLogoOnSave = true;
    }
    this.pendingLogoFile = null;
    this.pendingLogoPreview = '';
    this.form.logoUrl = '';
  }

  private resetLogoState() {
    this.pendingLogoFile = null;
    this.pendingLogoPreview = '';
    this.removeLogoOnSave = false;
  }

  /** What the preview/thumbnail shows: a staged file, else the saved (resolved) logo. */
  get logoPreviewSrc(): string {
    return this.pendingLogoPreview || this.resolveLogoUrl(this.form.logoUrl);
  }

  /** Saved logos may come back as a relative path — resolve against the API origin. */
  private resolveLogoUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (/^(data:|blob:|https?:\/\/)/i.test(url)) return url;
    const base = (environment.apiBaseUrl || '').replace(/\/+$/, '');
    return `${base}/${url.replace(/^\/+/, '')}`;
  }

  /** Convert a base64 data URL to a File, sniffing the image type from its bytes. */
  private dataUrlToFile(dataUrl: string, baseName: string): File | null {
    const comma = dataUrl.indexOf(',');
    if (comma < 0) return null;
    const b64 = dataUrl.slice(comma + 1);
    let bin: string;
    try { bin = atob(b64); } catch { return null; }
    const { mime, ext } = this.sniffImageType(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new File([bytes], `${baseName}.${ext}`, { type: mime });
  }

  /** Detect a common image type from the leading base64 (the source mime may be "image/*"). */
  private sniffImageType(b64: string): { mime: string; ext: string } {
    if (b64.startsWith('iVBOR')) return { mime: 'image/png', ext: 'png' };
    if (b64.startsWith('/9j/')) return { mime: 'image/jpeg', ext: 'jpg' };
    if (b64.startsWith('R0lGOD')) return { mime: 'image/gif', ext: 'gif' };
    if (b64.startsWith('UklGR')) return { mime: 'image/webp', ext: 'webp' };
    if (b64.startsWith('PHN2Zy') || b64.startsWith('PD94bWw')) return { mime: 'image/svg+xml', ext: 'svg' };
    return { mime: 'image/png', ext: 'png' };
  }

  openEditForm(t: PosReceiptTemplateDto) {
    this.editing = t;
    this.form = {
      templateName: t.templateName ?? '',
      headerBusinessName: t.headerBusinessName ?? '',
      headerAddressLine1: t.headerAddressLine1 ?? '',
      headerAddressLine2: t.headerAddressLine2 ?? '',
      headerPhone: t.headerPhone ?? '',
      headerEmail: t.headerEmail ?? '',
      headerWebsite: t.headerWebsite ?? '',
      taxRegistrationNumber: t.taxRegistrationNumber ?? '',
      logoUrl: t.logoUrl ?? '',
      headerMessage: t.headerMessage ?? '',
      footerMessage: t.footerMessage ?? '',
      returnPolicy: t.returnPolicy ?? '',
      showBarcode: t.showBarcode,
      showQrCode: t.showQrCode,
      showCashierName: t.showCashierName,
      showCustomerName: t.showCustomerName,
      showDiscountLine: t.showDiscountLine,
      showTaxBreakdown: t.showTaxBreakdown,
      showLoyaltyPoints: t.showLoyaltyPoints,
      showSavingsAmount: t.showSavingsAmount,
      paperSize: (t.paperSize as PaperSize) ?? 'Thermal80mm',
      isDefault: t.isDefault,
    };
    this.resetLogoState();
    this.error = '';
    this.showForm = true;
  }

  cancelForm() {
    this.showForm = false;
    this.editing = null;
  }

  save() {
    if (!this.form.templateName) { this.error = 'Template name is required.'; return; }
    this.error = '';

    if (this.editing) {
      const id = this.editing.id;
      const dto: UpdatePosReceiptTemplateDto = { ...this.form };
      this.settings.updateReceiptTemplate(id, dto).pipe(
        switchMap(() => this.applyLogo(id)),
      ).subscribe({
        next: () => { this.successMsg = 'Template updated.'; this.cancelForm(); this.load(); },
        error: (err) => { this.error = this.apiError(err) || 'Failed to update template.'; this.cdr.detectChanges(); },
      });
    } else {
      // Create first to obtain the id, then upload the staged logo against it.
      let createdId: string | undefined;
      this.settings.createReceiptTemplate(this.form).pipe(
        switchMap((res) => {
          const id = res.data?.id;
          createdId = id;
          return id ? this.applyLogo(id) : of(null);
        }),
      ).subscribe({
        next: () => { this.successMsg = 'Template created.'; this.cancelForm(); this.load(); this.highlighter.flash(createdId, this.cdr); },
        error: (err) => { this.error = this.apiError(err) || 'Failed to create template.'; this.cdr.detectChanges(); },
      });
    }
  }

  /** Upload a newly staged logo, or delete a cleared one — after the template is saved. */
  private applyLogo(id: string): Observable<unknown> {
    if (this.pendingLogoFile) return this.settings.uploadReceiptTemplateLogo(id, this.pendingLogoFile);
    if (this.removeLogoOnSave) return this.settings.deleteReceiptTemplateLogo(id);
    return of(null);
  }

  setDefault(t: PosReceiptTemplateDto) {
    if (t.isDefault) return;
    this.settings.setDefaultReceiptTemplate(t.id).subscribe({
      next: () => { this.successMsg = `"${t.templateName}" is now the default.`; this.load(); },
      error: () => { this.error = 'Failed to set default.'; this.cdr.detectChanges(); },
    });
  }

  remove(t: PosReceiptTemplateDto) {
    if (!confirm(`Delete template "${t.templateName}"?`)) return;
    this.settings.deleteReceiptTemplate(t.id).subscribe({
      next: () => { this.successMsg = 'Template deleted.'; this.load(); },
      error: () => { this.error = 'Failed to delete template.'; this.cdr.detectChanges(); },
    });
  }

  private apiError(err: any): string {
    const body = err?.error;
    return body?.message ?? body?.errors?.[0] ?? '';
  }

  // ── Live preview (client-side mock of the receipt) ────────────────────────────
  // There is no server "preview template" endpoint, so we render a representative
  // receipt from the current form values + sample data that updates as you type.
  readonly sample = {
    cashier: 'Jane D.',
    customer: 'Walk-in Customer',
    receiptNo: 'INV-2026-00042',
    date: '2026-06-08 14:32',
    lines: [
      { name: 'Cappuccino', qty: 2, price: 3.5 },
      { name: 'Blueberry Muffin', qty: 1, price: 2.75 },
    ],
    discount: 1.0,
    taxRate: 17,
    points: 9,
  };

  get sampleSubtotal(): number {
    return this.sample.lines.reduce((s, l) => s + l.qty * l.price, 0);
  }
  get sampleNet(): number { return this.sampleSubtotal - this.sample.discount; }
  get sampleTax(): number { return this.sampleNet * this.sample.taxRate / 100; }
  get sampleTotal(): number { return this.sampleNet + this.sampleTax; }

  /** Approximate paper width on screen so 58/80mm/A4 look distinct. */
  get previewWidthPx(): number {
    switch (this.form.paperSize) {
      case 'Thermal58mm': return 200;
      case 'A4': return 460;
      case 'Thermal80mm':
      default: return 300;
    }
  }
}
