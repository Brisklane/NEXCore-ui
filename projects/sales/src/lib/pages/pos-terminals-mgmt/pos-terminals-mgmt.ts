import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PosTerminalService } from '../../services/pos-terminal.service';
import { PosStoreService } from '../../services/pos-store.service';
import { PosTerminalDto } from '../../models/pos-terminal.model';
import { PosStoreDto } from '../../models/pos-store.model';
import { RowHighlighter } from '@nexcore/shared';

@Component({
  selector: 'lib-pos-terminals-mgmt',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pos-terminals-mgmt.html',
  styleUrl: './pos-terminals-mgmt.css',
})
export class PosTerminalsMgmtComponent implements OnInit {
  allTerminals: PosTerminalDto[] = [];   // full dataset
  loading = false;
  error = '';
  successMsg = '';

  stores: PosStoreDto[] = [];
  storesLoading = false;
  filterStoreId = '';
  searchQuery = '';
  highlighter = new RowHighlighter();
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  showForm = false;
  editingTerminal: PosTerminalDto | null = null;
  formTerminalName = '';
  formTerminalCode = '';
  formPosStoreId = '';
  formDeviceIdentifier = '';
  formIpAddress = '';
  formCashDrawerId = '';
  formReceiptTemplateId = '';
  formIsActive = true;

  sort(column: string): void {
    if (this.sortBy === column) this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else { this.sortBy = column; this.sortDirection = 'asc'; }
    this.cdr.detectChanges();
  }

  // Client-side filter — no API call on store change
  get filteredTerminals(): PosTerminalDto[] {
    let list = this.filterStoreId
      ? this.allTerminals.filter(t => t.posStoreId === this.filterStoreId)
      : this.allTerminals;
    const q = this.searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(t =>
        (t.terminalName ?? '').toLowerCase().includes(q) ||
        (t.terminalCode ?? '').toLowerCase().includes(q) ||
        (t.deviceIdentifier ?? '').toLowerCase().includes(q),
      );
    }
    const rows: any[] = [...list];
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

  storeName(id: string): string {
    return this.stores.find(s => s.id === id)?.tradingName ?? '—';
  }

  constructor(
    private terminalService: PosTerminalService,
    private storeService: PosStoreService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadAll();
  }

  /** Load stores, then load all their terminals in parallel. */
  loadAll() {
    this.loading = true;
    this.storesLoading = true;
    this.error = '';
    this.storeService.getAll().subscribe({
      next: (res) => {
        this.stores = res.data ?? [];
        this.storesLoading = false;
        if (this.stores.length === 0) {
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }
        const requests = this.stores.map(s =>
          this.terminalService.getByBranch(s.id).pipe(catchError(() => of({ data: [] as PosTerminalDto[] }))),
        );
        forkJoin(requests).subscribe({
          next: (results) => {
            this.allTerminals = results.flatMap(r => (r as any).data ?? []);
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: () => {
            this.error = 'Failed to load terminals.';
            this.loading = false;
            this.cdr.detectChanges();
          },
        });
      },
      error: () => {
        this.error = 'Failed to load stores.';
        this.storesLoading = false;
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openCreateForm() {
    this.editingTerminal = null;
    this.formTerminalName = '';
    this.formTerminalCode = '';
    this.formPosStoreId = this.filterStoreId || (this.stores[0]?.id ?? '');
    this.formDeviceIdentifier = '';
    this.formIpAddress = '';
    this.formCashDrawerId = '';
    this.formReceiptTemplateId = '';
    this.formIsActive = true;
    this.error = '';
    this.showForm = true;
  }

  openEditForm(terminal: PosTerminalDto) {
    this.editingTerminal = terminal;
    this.formTerminalName = terminal.terminalName ?? '';
    this.formTerminalCode = terminal.terminalCode ?? '';
    this.formPosStoreId = terminal.posStoreId;
    this.formDeviceIdentifier = terminal.deviceIdentifier ?? '';
    this.formIpAddress = terminal.ipAddress ?? '';
    this.formCashDrawerId = terminal.cashDrawerId ?? '';
    this.formReceiptTemplateId = terminal.receiptTemplateId ?? '';
    this.formIsActive = terminal.isActive;
    this.error = '';
    this.showForm = true;
  }

  cancelForm() {
    this.showForm = false;
    this.editingTerminal = null;
  }

  save() {
    if (!this.formTerminalName || !this.formTerminalCode) {
      this.error = 'Terminal Name and Code are required.';
      return;
    }
    if (this.editingTerminal) {
      this.terminalService.update(this.editingTerminal.id, {
        terminalName: this.formTerminalName,
        deviceIdentifier: this.formDeviceIdentifier || null,
        ipAddress: this.formIpAddress || null,
        cashDrawerId: this.formCashDrawerId || null,
        receiptTemplateId: this.formReceiptTemplateId || null,
        isActive: this.formIsActive,
      }).subscribe({
        next: () => { this.successMsg = 'Terminal updated.'; this.cancelForm(); this.loadAll(); },
        error: () => { this.error = 'Failed to update terminal.'; this.cdr.detectChanges(); },
      });
    } else {
      if (!this.formPosStoreId) { this.error = 'Store is required.'; return; }
      this.terminalService.create({
        terminalName: this.formTerminalName,
        terminalCode: this.formTerminalCode,
        posStoreId: this.formPosStoreId,
        deviceIdentifier: this.formDeviceIdentifier || null,
        ipAddress: this.formIpAddress || null,
        cashDrawerId: this.formCashDrawerId || null,
        receiptTemplateId: this.formReceiptTemplateId || null,
      }).subscribe({
        next: (res) => { this.successMsg = 'Terminal created.'; this.cancelForm(); this.loadAll(); this.highlighter.flash(res.data?.id, this.cdr); },
        error: () => { this.error = 'Failed to create terminal.'; this.cdr.detectChanges(); },
      });
    }
  }

  deleteTerminal(id: string) {
    if (!confirm('Delete this terminal?')) return;
    this.terminalService.delete(id).subscribe({
      next: () => { this.successMsg = 'Terminal deleted.'; this.loadAll(); },
      error: () => { this.error = 'Failed to delete terminal.'; this.cdr.detectChanges(); },
    });
  }

  goOffline(id: string) {
    if (!confirm('Mark this terminal as offline?')) return;
    this.terminalService.goOffline(id).subscribe({
      next: () => { this.successMsg = 'Terminal marked offline.'; this.loadAll(); },
      error: () => { this.error = 'Failed to go offline.'; this.cdr.detectChanges(); },
    });
  }
}
