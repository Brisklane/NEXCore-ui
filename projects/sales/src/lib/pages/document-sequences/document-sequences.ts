import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentSequenceService } from '../../services/document-sequence.service';
import {
  DocumentSequenceDto,
  CreateDocumentSequenceDto,
  UpdateDocumentSequenceDto,
  PreviewSequenceFormatResultDto,
  DocumentType,
  SequenceYearFormat,
  SequenceResetPeriod,
} from '../../models/document-sequence.model';
import { RowHighlighter } from '@nexcore/shared';

/** Form model — the create shape plus the edit-only `isActive` flag. */
type SequenceForm = CreateDocumentSequenceDto & { isActive: boolean };

@Component({
  selector: 'lib-document-sequences',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './document-sequences.html',
  styleUrl: './document-sequences.css',
})
export class DocumentSequencesComponent implements OnInit {
  sequences: DocumentSequenceDto[] = [];
  loading = false;
  error = '';
  successMsg = '';

  showForm = false;
  editing: DocumentSequenceDto | null = null;
  highlighter = new RowHighlighter();
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  sort(column: string): void {
    if (this.sortBy === column) this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else { this.sortBy = column; this.sortDirection = 'asc'; }
    this.cdr.detectChanges();
  }

  get displaySequences(): DocumentSequenceDto[] {
    const rows: any[] = [...this.sequences];
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

  form: SequenceForm = this.blankForm();
  resetTo = 1;

  // Server-rendered preview of the configured format (authoritative).
  previewResult: PreviewSequenceFormatResultDto | null = null;
  previewLoading = false;
  private previewTimer: any = null;

  readonly documentTypes = [
    { value: DocumentType.SalesOrder, label: 'Sales Order' },
    { value: DocumentType.Quotation, label: 'Quotation' },
    { value: DocumentType.Invoice, label: 'Invoice' },
    { value: DocumentType.CreditNote, label: 'Credit Note' },
    { value: DocumentType.Payment, label: 'Payment' },
    { value: DocumentType.Delivery, label: 'Delivery' },
    { value: DocumentType.SalesReturn, label: 'Sales Return' },
    { value: DocumentType.PosSession, label: 'POS Session' },
    { value: DocumentType.PosTransaction, label: 'POS Transaction' },
    { value: DocumentType.RiderAssignment, label: 'Rider Assignment' },
  ];
  readonly yearFormats = [
    { value: SequenceYearFormat.Full, label: 'Full (e.g. 2026)' },
    { value: SequenceYearFormat.Short, label: 'Short (e.g. 26)' },
  ];
  readonly resetPeriods = [
    { value: SequenceResetPeriod.Never,   label: 'Never' },
    { value: SequenceResetPeriod.Yearly,  label: 'Yearly' },
    { value: SequenceResetPeriod.Monthly, label: 'Monthly' },
    { value: SequenceResetPeriod.Daily,   label: 'Daily' },
  ];

  constructor(private svc: DocumentSequenceService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.load();
  }

  private blankForm(): SequenceForm {
    return {
      documentType: DocumentType.SalesOrder,
      description: '',
      prefix: '',
      suffix: '',
      separator: '-',
      includeYear: true,
      yearFormat: SequenceYearFormat.Full,
      includeMonth: false,
      includeDay: false,
      sequencePadding: 5,
      resetOn: SequenceResetPeriod.Yearly,
      startFrom: 1,
      isActive: true,
    };
  }

  load() {
    this.loading = true;
    this.error = '';
    this.svc.getAll().subscribe({
      next: (res) => {
        this.sequences = (res.data ?? []).sort((a, b) => +a.documentType - +b.documentType);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load document sequences.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ── Labels ──────────────────────────────────────────────────────────────────
  documentTypeLabel(v: DocumentType | number): string {
    return this.documentTypes.find(d => d.value === +v)?.label ?? String(v);
  }
  resetLabel(v: SequenceResetPeriod | number): string {
    return this.resetPeriods.find(r => r.value === +v)?.label ?? String(v);
  }

  /** A human-readable mask of the configured format, e.g. SO-YYYY-MM-DD-00001. */
  formatMask(s: DocumentSequenceDto): string {
    const sep = s.separator ?? '';
    const parts: string[] = [];
    if (s.prefix) parts.push(s.prefix);
    if (s.includeYear) parts.push(+s.yearFormat === SequenceYearFormat.Short ? 'YY' : 'YYYY');
    if (s.includeYear && s.includeMonth) parts.push('MM');
    if (s.includeYear && s.includeMonth && s.includeDay) parts.push('DD');
    parts.push(''.padStart(Math.max(1, s.sequencePadding), '0'));
    return parts.join(sep) + (s.suffix ?? '');
  }

  /** Document types that don't yet have a sequence (one per type). */
  get availableDocumentTypes() {
    const used = new Set(this.sequences.map(s => +s.documentType));
    return this.documentTypes.filter(d => !used.has(d.value));
  }

  // ── Create / Edit ─────────────────────────────────────────────────────────────
  openCreateForm() {
    this.editing = null;
    this.form = this.blankForm();
    const avail = this.availableDocumentTypes;
    if (avail.length) this.form.documentType = avail[0].value;
    this.error = '';
    this.showForm = true;
    this.schedulePreview();
  }

  openEditForm(s: DocumentSequenceDto) {
    this.editing = s;
    this.form = {
      documentType: +s.documentType,
      description: s.description ?? '',
      prefix: s.prefix ?? '',
      suffix: s.suffix ?? '',
      separator: s.separator ?? '',
      includeYear: s.includeYear,
      yearFormat: +s.yearFormat,
      includeMonth: s.includeMonth,
      includeDay: s.includeDay,
      sequencePadding: s.sequencePadding,
      resetOn: +s.resetOn,
      startFrom: s.nextSequenceNumber,
      isActive: s.isActive,
    };
    this.resetTo = s.nextSequenceNumber;
    this.error = '';
    this.showForm = true;
    this.schedulePreview();
  }

  cancelForm() {
    this.showForm = false;
    this.editing = null;
  }

  // ── Live preview (debounced, authoritative server format) ─────────────────────
  schedulePreview() {
    if (this.previewTimer) clearTimeout(this.previewTimer);
    this.previewLoading = true;
    this.previewTimer = setTimeout(() => this.runPreview(), 300);
  }

  private runPreview() {
    this.svc.preview({
      prefix: this.form.prefix,
      suffix: this.form.suffix,
      separator: this.form.separator,
      includeYear: this.form.includeYear,
      yearFormat: this.form.yearFormat,
      includeMonth: this.form.includeMonth,
      includeDay: this.form.includeDay,
      sequencePadding: this.form.sequencePadding,
      sampleNumber: this.form.startFrom || 1,
    }).subscribe({
      next: (res) => { this.previewResult = res.data ?? null; this.previewLoading = false; this.cdr.detectChanges(); },
      error: () => { this.previewResult = null; this.previewLoading = false; this.cdr.detectChanges(); },
    });
  }

  save() {
    if (!this.form.sequencePadding || this.form.sequencePadding < 1) { this.error = 'Number padding must be at least 1.'; return; }
    this.error = '';

    if (this.editing) {
      const dto: UpdateDocumentSequenceDto = {
        description:    this.form.description || null,
        prefix:         this.form.prefix || '',
        suffix:         this.form.suffix || null,
        separator:      this.form.separator || null,
        includeYear:    this.form.includeYear,
        yearFormat:     this.form.yearFormat,
        includeMonth:   this.form.includeMonth,
        includeDay:     this.form.includeDay,
        sequencePadding: this.form.sequencePadding,
        resetOn:        this.form.resetOn,
        isActive:       this.form.isActive,
      };
      this.svc.update(this.editing.id, dto).subscribe({
        next: () => { this.successMsg = 'Document sequence updated.'; this.cancelForm(); this.load(); },
        error: (err) => { this.error = this.apiError(err) || 'Failed to update sequence.'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateDocumentSequenceDto = {
        documentType:   this.form.documentType,
        description:    this.form.description || null,
        prefix:         this.form.prefix || '',
        suffix:         this.form.suffix || null,
        separator:      this.form.separator || null,
        includeYear:    this.form.includeYear,
        yearFormat:     this.form.yearFormat,
        includeMonth:   this.form.includeMonth,
        includeDay:     this.form.includeDay,
        sequencePadding: this.form.sequencePadding,
        resetOn:        this.form.resetOn,
        startFrom:      this.form.startFrom,
      };
      this.svc.create(dto).subscribe({
        next: (res) => { this.successMsg = 'Document sequence created.'; this.cancelForm(); this.load(); this.highlighter.flash(res.data?.id, this.cdr); },
        error: (err) => { this.error = this.apiError(err) || 'Failed to create sequence.'; this.cdr.detectChanges(); },
      });
    }
  }

  // ── Reset counter ─────────────────────────────────────────────────────────────
  resetCounter() {
    if (!this.editing) return;
    const n = Math.floor(Number(this.resetTo));
    if (!n || n < 1) { this.error = 'Reset value must be a positive number.'; return; }
    if (!confirm(
      `Reset the ${this.documentTypeLabel(this.editing.documentType)} counter to ${n}? ` +
      `The next document will be numbered from here — only do this if no documents already use those numbers.`,
    )) return;
    this.svc.reset(this.editing.id, { resetTo: n }).subscribe({
      next: () => { this.successMsg = 'Counter reset.'; this.cancelForm(); this.load(); },
      error: (err) => { this.error = this.apiError(err) || 'Failed to reset counter.'; this.cdr.detectChanges(); },
    });
  }

  private apiError(err: any): string {
    const body = err?.error;
    return body?.message ?? body?.errors?.[0] ?? '';
  }
}
