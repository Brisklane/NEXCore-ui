import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RiderService } from '../../services/rider.service';
import { PosStoreService } from '../../services/pos-store.service';
import { RiderDto, CreateRiderDto, UpdateRiderDto } from '../../models/rider.model';
import { PosStoreDto } from '../../models/pos-store.model';
import { RowHighlighter } from '@nexcore/shared';

@Component({
  selector: 'lib-riders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './riders.html',
  styleUrl: './riders.css',
})
export class RidersComponent implements OnInit {
  riders: RiderDto[] = [];
  loading = false;
  error = '';
  successMsg = '';
  showForm = false;
  editingRider: RiderDto | null = null;
  searchQuery = '';
  highlighter = new RowHighlighter();
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  stores: PosStoreDto[] = [];
  formName = '';
  formPhone = '';
  formStoreId = '';
  formIsActive = true;

  /** Full display name from the backend's first/last name fields. */
  riderName(r: RiderDto): string {
    return `${r.firstName ?? ''} ${r.lastName ?? ''}`.trim();
  }
  /** Store name resolved from the rider's home-branch (= POS store) id. */
  storeName(r: RiderDto): string {
    const s = this.stores.find(x => x.id === r.homeBranchId);
    return s?.tradingName ?? '';
  }

  get filteredRiders(): RiderDto[] {
    const q = this.searchQuery.toLowerCase().trim();
    let rows = !q ? [...this.riders] : this.riders.filter(r =>
      this.riderName(r).toLowerCase().includes(q) ||
      (r.phone ?? '').toLowerCase().includes(q)
    );
    rows = [...rows];
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
    const hid = this.highlighter.id;
    if (hid != null) { const i = rows.findIndex(r => r?.id === hid); if (i > 0) { const [x] = rows.splice(i, 1); rows.unshift(x); } }
    return rows;
  }

  sort(column: string): void {
    if (this.sortBy === column) this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else { this.sortBy = column; this.sortDirection = 'asc'; }
    this.cdr.detectChanges();
  }

  constructor(
    private riderService: RiderService,
    private storeService: PosStoreService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.load();
    this.storeService.getAll().subscribe({
      next: (res) => { this.stores = res.data ?? []; this.cdr.detectChanges(); },
      error: () => {},
    });
  }

  load() {
    this.loading = true;
    this.error = '';
    this.riderService.getAll().subscribe({
      next: (res) => {
        this.riders = res.data ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load riders.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openCreateForm() {
    this.editingRider = null;
    this.resetForm();
    this.showForm = true;
  }

  openEditForm(rider: RiderDto) {
    this.editingRider = rider;
    this.formName = this.riderName(rider);
    this.formPhone = rider.phone ?? '';
    this.formStoreId = rider.homeBranchId ?? '';
    this.formIsActive = rider.isActive;
    this.showForm = true;
  }

  resetForm() {
    this.formName = '';
    this.formPhone = '';
    this.formStoreId = '';
    this.formIsActive = true;
  }

  /** Split a single "Name" input into the backend's first/last name fields. */
  private splitName(): { firstName: string; lastName: string | null } {
    const parts = this.formName.trim().split(/\s+/);
    return { firstName: parts[0] ?? '', lastName: parts.length > 1 ? parts.slice(1).join(' ') : null };
  }

  cancelForm() {
    this.showForm = false;
    this.editingRider = null;
    this.resetForm();
  }

  save() {
    if (!this.formName.trim()) {
      this.error = 'Name is required.';
      return;
    }
    if (!this.formPhone.trim()) {
      this.error = 'Phone is required.';
      return;
    }
    const { firstName, lastName } = this.splitName();
    if (this.editingRider) {
      const dto: UpdateRiderDto = {
        firstName,
        lastName,
        phone: this.formPhone.trim(),
        homeBranchId: this.formStoreId || null,
        isActive: this.formIsActive,
      };
      this.riderService.update(this.editingRider.id, dto).subscribe({
        next: () => { this.successMsg = 'Rider updated.'; this.cancelForm(); this.load(); },
        error: (err) => { this.error = this.extractError(err, 'Failed to update rider.'); this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateRiderDto = {
        firstName,
        lastName,
        phone: this.formPhone.trim(),
        homeBranchId: this.formStoreId || null,
      };
      this.riderService.create(dto).subscribe({
        next: (res) => { this.successMsg = 'Rider created.'; this.cancelForm(); this.load(); this.highlighter.flash(res.data?.id, this.cdr); },
        error: (err) => { this.error = this.extractError(err, 'Failed to create rider.'); this.cdr.detectChanges(); },
      });
    }
  }

  private extractError(err: unknown, fallback: string): string {
    const body = (err as { error?: { message?: string; errors?: string[] } })?.error;
    if (body?.message) return body.message;
    if (Array.isArray(body?.errors) && body.errors.length) return body.errors.join(' | ');
    return fallback;
  }

  deleteRider(id: string) {
    if (!confirm('Delete this rider?')) return;
    this.riderService.delete(id).subscribe({
      next: () => {
        this.successMsg = 'Rider deleted.';
        this.load();
      },
      error: () => {
        this.error = 'Failed to delete rider.';
        this.cdr.detectChanges();
      },
    });
  }
}
