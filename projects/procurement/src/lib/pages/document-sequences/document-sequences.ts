import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentSequenceService } from '../../services/master-data.service';
import { DocumentSequenceDto, UpdateDocumentSequenceDto } from '../../models/master-data.model';
import { PROCUREMENT_DOC_TYPE_LABELS, SEQUENCE_RESET_LABELS, SequenceResetPeriod } from '../../models/procurement-enums';

@Component({
  selector: 'lib-document-sequences',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './document-sequences.html',
  styleUrl: './document-sequences.css',
})
export class DocumentSequencesPage implements OnInit {
  sequences: DocumentSequenceDto[] = [];
  loading = false;
  error = '';
  success = '';
  editingId: string | null = null;

  readonly resetPeriodOptions = Object.entries(SEQUENCE_RESET_LABELS).map(([k, v]) => ({ value: Number(k), label: v }));

  // ── Client-side column sorting ──────────────────────────────────────────────
  sortBy = '';
  sortDir: 'asc' | 'desc' = 'asc';
  sort(key: string): void {
    if (this.sortBy === key) this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    else { this.sortBy = key; this.sortDir = 'asc'; }
    this.page = 1;
  }
  sortIcon(key: string): string { return this.sortBy === key ? (this.sortDir === 'asc' ? '▲' : '▼') : '↕'; }
  get sortedSequences(): DocumentSequenceDto[] {
    if (!this.sortBy) return this.sequences;
    const key = this.sortBy as keyof DocumentSequenceDto;
    const dir = this.sortDir === 'asc' ? 1 : -1;
    return [...this.sequences].sort((a, b) => dir * cmpVals(a[key], b[key]));
  }

  // Client-side pagination (small config list loaded in full).
  page = 1;
  pageSize = 10;
  readonly pageSizeOptions = [10, 20, 50];
  get totalPages(): number { return Math.max(1, Math.ceil(this.sequences.length / this.pageSize)); }
  get pagedSequences(): DocumentSequenceDto[] {
    const start = (this.page - 1) * this.pageSize;
    return this.sortedSequences.slice(start, start + this.pageSize);
  }
  onPageSizeChange(): void { this.page = 1; }

  constructor(private service: DocumentSequenceService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.service.getAll().subscribe({
      next: (r) => { this.sequences = r.data ?? []; this.page = 1; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load sequences'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  docTypeLabel(dt: number): string { return PROCUREMENT_DOC_TYPE_LABELS[dt as keyof typeof PROCUREMENT_DOC_TYPE_LABELS] ?? String(dt); }
  resetLabel(r: SequenceResetPeriod): string { return SEQUENCE_RESET_LABELS[r] ?? String(r); }
  preview(seq: DocumentSequenceDto): string {
    const year = seq.includeYear ? '-2026' : '';
    const month = seq.includeMonth ? '-06' : '';
    const num = String(seq.nextSequenceNumber).padStart(seq.sequencePadding, '0');
    return `${seq.prefix}${year}${month}${seq.separator}${num}${seq.suffix ?? ''}`;
  }

  edit(seq: DocumentSequenceDto): void { this.editingId = seq.id; }
  cancelEdit(): void { this.editingId = null; }

  save(seq: DocumentSequenceDto): void {
    const dto: UpdateDocumentSequenceDto = {
      prefix: seq.prefix, suffix: seq.suffix || undefined, separator: seq.separator,
      includeYear: seq.includeYear, includeMonth: seq.includeMonth,
      sequencePadding: seq.sequencePadding, resetOn: seq.resetOn, isActive: seq.isActive,
    };
    this.service.update(seq.id, dto).subscribe({
      next: () => { this.success = 'Sequence updated'; this.editingId = null; },
      error: (e) => { this.error = e?.error?.message ?? 'Failed'; this.cdr.detectChanges(); },
    });
  }
}

/** Generic value comparator for client-side table sorting (numbers, booleans, dates, text). */
function cmpVals(a: any, b: any): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === 'boolean') return a === b ? 0 : a ? 1 : -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}
