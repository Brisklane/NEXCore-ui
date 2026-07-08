import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PosCashierService } from '../../services/pos-cashier.service';
import { PosStoreService } from '../../services/pos-store.service';
import { PosTerminalService } from '../../services/pos-terminal.service';
import { EmployeeService, EmployeeDto } from '@nexcore/hr';
import {
  PosCashierDto,
  PosSessionDto,
  PosCashMovementDto,
} from '../../models/pos-cashier.model';
import { PosStoreDto } from '../../models/pos-store.model';
import { PosTerminalDto } from '../../models/pos-terminal.model';
import { RowHighlighter } from '@nexcore/shared';

@Component({
  selector: 'lib-pos-cashiers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pos-cashiers.html',
  styleUrl: './pos-cashiers.css',
})
export class PosCashiersComponent implements OnInit {
  allCashiers: PosCashierDto[] = [];   // full dataset
  loading = false;
  error = '';
  successMsg = '';

  stores: PosStoreDto[] = [];
  storesLoading = false;
  employees: EmployeeDto[] = [];
  filterStoreId = '';
  searchQuery = '';
  highlighter = new RowHighlighter();
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // ── Create / Edit ─────────────────────────────────────────
  showForm = false;
  editingCashier: PosCashierDto | null = null;
  formDisplayName = '';
  formEmployeeId = '';
  formBadgeNumber = '';
  formStoreId = '';
  formIsActive = true;
  formCanApplyManualDiscount = false;
  formMaxManualDiscountPercentage: number | null = null;
  formCanVoidTransaction = false;
  formCanIssueRefund = false;
  formCanOpenDrawer = false;
  formCanOverridePrices = false;
  formCanApplyCoupons = false;
  formCanAccessReports = false;

  // ── Set PIN ───────────────────────────────────────────────
  showSetPinForm = false;
  pinCashierId = '';
  pinCashierName = '';
  formNewPin = '';
  formConfirmPin = '';

  // ── Change PIN ────────────────────────────────────────────
  showChangePinForm = false;
  formCurrentPin = '';

  // ── Check-in ──────────────────────────────────────────────
  showCheckInForm = false;
  checkInStoreId = '';
  checkInCashiers: PosCashierDto[] = [];
  checkInTerminals: PosTerminalDto[] = [];
  checkInCashierId = '';
  checkInTerminalId = '';
  checkInOpeningFloat = 0;

  // ── Session & cash movements ──────────────────────────────
  openSession: PosSessionDto | null = null;
  cashMovements: PosCashMovementDto[] = [];
  selectedCashierId = '';
  showCashMoveForm = false;
  activeCashMoveSessionId = '';
  cashMoveAmount = 0;
  cashMoveType: 'CashIn' | 'CashOut' = 'CashIn';
  cashMoveReason = '';

  /** Employees that don't yet have a cashier (or belong to the cashier being edited). */
  get availableEmployees() {
    const usedIds = new Set(
      this.allCashiers
        .filter(c => c.employeeId && c.id !== this.editingCashier?.id)
        .map(c => c.employeeId!)
    );
    return this.employees.filter(e => !usedIds.has(e.id));
  }

  sort(column: string): void {
    if (this.sortBy === column) this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else { this.sortBy = column; this.sortDirection = 'asc'; }
    this.cdr.detectChanges();
  }

  // Client-side filter — no API call on store change
  get filteredCashiers(): PosCashierDto[] {
    let list = this.filterStoreId
      ? this.allCashiers.filter(c => c.branchId === this.filterStoreId)
      : this.allCashiers;
    const q = this.searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(c =>
        (c.displayName ?? '').toLowerCase().includes(q) ||
        (c.badgeNumber ?? '').toLowerCase().includes(q) ||
        (c.employeeId ?? '').toLowerCase().includes(q),
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

  sessionStatusLabel(status: number): string {
    const labels: Record<number, string> = { 0: 'Open', 1: 'Closed', 2: 'Suspended', 3: 'Abandoned' };
    return labels[status] ?? String(status);
  }

  movementTypeLabel(type: number): string {
    const labels: Record<number, string> = { 0: 'Cash In', 1: 'Cash Out', 2: 'Float', 3: 'Adjustment', 4: 'Opening', 5: 'Closing' };
    return labels[type] ?? String(type);
  }

  constructor(
    private cashierService: PosCashierService,
    private storeService: PosStoreService,
    private terminalService: PosTerminalService,
    private employeeService: EmployeeService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadAll();
    this.employeeService.getAll().subscribe({
      next: (res) => { this.employees = res.data ?? []; this.cdr.detectChanges(); },
      error: () => {},
    });
  }

  /** Load stores, then load all their cashiers in parallel. */
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
          this.cashierService.getByStore(s.id).pipe(catchError(() => of({ data: [] as PosCashierDto[] }))),
        );
        forkJoin(requests).subscribe({
          next: (results) => {
            this.allCashiers = results.flatMap(r => (r as any).data ?? []);
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: () => {
            this.error = 'Failed to load cashiers.';
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

  onEmployeeSelect(employeeId: string) {
    const emp = this.employees.find(e => e.id === employeeId);
    if (!emp) return;
    if (!this.formDisplayName) {
      this.formDisplayName = `${emp.firstName ?? ''} ${emp.lastName ?? ''}`.trim();
    }
  }

  // ── CRUD ──────────────────────────────────────────────────
  openCreateForm() {
    this.editingCashier = null;
    this.formDisplayName = '';
    this.formEmployeeId = '';
    this.formBadgeNumber = '';
    this.formStoreId = this.filterStoreId || (this.stores[0]?.id ?? '');
    this.formIsActive = true;
    this.formCanApplyManualDiscount = false;
    this.formMaxManualDiscountPercentage = null;
    this.formCanVoidTransaction = false;
    this.formCanIssueRefund = false;
    this.formCanOpenDrawer = false;
    this.formCanOverridePrices = false;
    this.formCanApplyCoupons = false;
    this.formCanAccessReports = false;
    this.error = '';
    this.showForm = true;
  }

  openEditForm(cashier: PosCashierDto) {
    this.editingCashier = cashier;
    this.formDisplayName = cashier.displayName ?? '';
    this.formEmployeeId = cashier.employeeId ?? '';
    this.formBadgeNumber = cashier.badgeNumber ?? '';
    this.formStoreId = cashier.branchId;
    this.formIsActive = cashier.isActive;
    this.formCanApplyManualDiscount = cashier.canApplyManualDiscount;
    this.formMaxManualDiscountPercentage = cashier.maxManualDiscountPercentage;
    this.formCanVoidTransaction = cashier.canVoidTransaction;
    this.formCanIssueRefund = cashier.canIssueRefund;
    this.formCanOpenDrawer = cashier.canOpenDrawer;
    this.formCanOverridePrices = cashier.canOverridePrices;
    this.formCanApplyCoupons = cashier.canApplyCoupons;
    this.formCanAccessReports = cashier.canAccessReports;
    this.error = '';
    this.showForm = true;
  }

  cancelForm() {
    this.showForm = false;
    this.editingCashier = null;
  }

  save() {
    if (!this.formDisplayName) { this.error = 'Display Name is required.'; return; }
    if (this.editingCashier) {
      this.cashierService.update(this.editingCashier.id, {
        displayName: this.formDisplayName,
        badgeNumber: this.formBadgeNumber || null,
        branchId: this.formStoreId,
        isActive: this.formIsActive,
        canApplyManualDiscount: this.formCanApplyManualDiscount,
        maxManualDiscountPercentage: this.formMaxManualDiscountPercentage != null ? Number(this.formMaxManualDiscountPercentage) : null,
        canVoidTransaction: this.formCanVoidTransaction,
        canIssueRefund: this.formCanIssueRefund,
        canOpenDrawer: this.formCanOpenDrawer,
        canOverridePrices: this.formCanOverridePrices,
        canApplyCoupons: this.formCanApplyCoupons,
        canAccessReports: this.formCanAccessReports,
      }).subscribe({
        next: () => { this.successMsg = 'Cashier updated.'; this.cancelForm(); this.loadAll(); },
        error: () => { this.error = 'Failed to update cashier.'; this.cdr.detectChanges(); },
      });
    } else {
      if (!this.formStoreId) { this.error = 'Store is required.'; return; }
      if (this.formEmployeeId && this.allCashiers.some(c => c.employeeId === this.formEmployeeId)) {
        this.error = 'This employee already has a cashier assigned.'; return;
      }
      this.cashierService.create({
        displayName: this.formDisplayName,
        employeeId: this.formEmployeeId || null,
        badgeNumber: this.formBadgeNumber || null,
        posStoreId: this.formStoreId,
        canApplyManualDiscount: this.formCanApplyManualDiscount,
        maxManualDiscountPercentage: this.formMaxManualDiscountPercentage != null ? Number(this.formMaxManualDiscountPercentage) : null,
        canVoidTransaction: this.formCanVoidTransaction,
        canIssueRefund: this.formCanIssueRefund,
        canOpenDrawer: this.formCanOpenDrawer,
        canOverridePrices: this.formCanOverridePrices,
        canApplyCoupons: this.formCanApplyCoupons,
        canAccessReports: this.formCanAccessReports,
      }).subscribe({
        next: (res) => { this.successMsg = 'Cashier created.'; this.cancelForm(); this.loadAll(); this.highlighter.flash(res.data?.id, this.cdr); },
        error: () => { this.error = 'Failed to create cashier.'; this.cdr.detectChanges(); },
      });
    }
  }

  deleteCashier(id: string) {
    if (!confirm('Delete this cashier?')) return;
    this.cashierService.delete(id).subscribe({
      next: () => { this.successMsg = 'Cashier deleted.'; this.loadAll(); },
      error: () => { this.error = 'Failed to delete cashier.'; this.cdr.detectChanges(); },
    });
  }

  // ── Set PIN ───────────────────────────────────────────────
  openSetPin(cashier: PosCashierDto) {
    this.pinCashierId = cashier.id;
    this.pinCashierName = cashier.displayName ?? '';
    this.formNewPin = '';
    this.formConfirmPin = '';
    this.showChangePinForm = false;
    this.showSetPinForm = true;
  }

  submitSetPin() {
    if (!this.formNewPin || this.formNewPin.length < 4) { this.error = 'PIN must be at least 4 digits.'; return; }
    if (this.formNewPin !== this.formConfirmPin) { this.error = 'PINs do not match.'; return; }
    this.error = '';
    this.cashierService.setPin(this.pinCashierId, { pin: this.formNewPin }).subscribe({
      next: () => { this.successMsg = 'PIN set successfully for ' + this.pinCashierName + '.'; this.cancelPin(); this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to set PIN.'; this.cdr.detectChanges(); },
    });
  }

  // ── Change PIN ────────────────────────────────────────────
  openChangePin(cashier: PosCashierDto) {
    this.pinCashierId = cashier.id;
    this.pinCashierName = cashier.displayName ?? '';
    this.formCurrentPin = '';
    this.formNewPin = '';
    this.formConfirmPin = '';
    this.showSetPinForm = false;
    this.showChangePinForm = true;
  }

  submitChangePin() {
    if (!this.formCurrentPin) { this.error = 'Current PIN is required.'; return; }
    if (!this.formNewPin || this.formNewPin.length < 4) { this.error = 'New PIN must be at least 4 digits.'; return; }
    if (this.formNewPin !== this.formConfirmPin) { this.error = 'New PINs do not match.'; return; }
    this.error = '';
    this.cashierService.changePin(this.pinCashierId, {
      currentPin: this.formCurrentPin, newPin: this.formNewPin,
    }).subscribe({
      next: () => { this.successMsg = 'PIN changed successfully for ' + this.pinCashierName + '.'; this.cancelPin(); this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to change PIN.'; this.cdr.detectChanges(); },
    });
  }

  cancelPin() {
    this.showSetPinForm = false;
    this.showChangePinForm = false;
    this.formCurrentPin = '';
    this.formNewPin = '';
    this.formConfirmPin = '';
  }

  // ── Sessions ──────────────────────────────────────────────
  viewOpenSession(cashierId: string) {
    this.selectedCashierId = cashierId;
    this.openSession = null;
    this.cashMovements = [];
    this.cashierService.getOpenSession(cashierId).subscribe({
      next: (res) => { this.openSession = res.data ?? null; this.cdr.detectChanges(); },
      error: () => { this.openSession = null; this.cdr.detectChanges(); },
    });
  }

  loadCashMovements(sessionId: string) {
    this.activeCashMoveSessionId = sessionId;
    this.cashierService.getCashMovements(sessionId).subscribe({
      next: (res) => { this.cashMovements = res.data ?? []; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load cash movements.'; this.cdr.detectChanges(); },
    });
  }

  // ── Check-in ──────────────────────────────────────────────
  openCheckIn() {
    this.showCheckInForm = true;
    this.checkInCashierId = '';
    this.checkInTerminalId = '';
    this.checkInOpeningFloat = 0;
    this.checkInCashiers = [];
    this.checkInTerminals = [];
    this.checkInStoreId = this.filterStoreId || (this.stores[0]?.id ?? '');
    this.onCheckInStoreChange();
  }

  onCheckInStoreChange() {
    this.checkInCashierId = '';
    this.checkInTerminalId = '';
    this.checkInCashiers = [];
    this.checkInTerminals = [];
    if (!this.checkInStoreId) return;
    this.cashierService.getByStore(this.checkInStoreId).subscribe({
      next: (res) => { this.checkInCashiers = res.data ?? []; this.cdr.detectChanges(); },
      error: () => { this.checkInCashiers = []; this.cdr.detectChanges(); },
    });
    this.terminalService.getByBranch(this.checkInStoreId).subscribe({
      next: (res) => { this.checkInTerminals = res.data ?? []; this.cdr.detectChanges(); },
      error: () => { this.checkInTerminals = []; this.cdr.detectChanges(); },
    });
  }

  cancelCheckIn() {
    this.showCheckInForm = false;
    this.checkInStoreId = '';
    this.checkInCashierId = '';
    this.checkInTerminalId = '';
    this.checkInOpeningFloat = 0;
    this.checkInCashiers = [];
    this.checkInTerminals = [];
  }

  checkIn() {
    if (!this.checkInCashierId || !this.checkInTerminalId) {
      this.error = 'Cashier and Terminal are required.';
      return;
    }
    this.cashierService.checkIn({
      cashierId: this.checkInCashierId,
      terminalId: this.checkInTerminalId,
      openingFloat: this.checkInOpeningFloat,
    }).subscribe({
      next: () => { this.successMsg = 'Cashier checked in.'; this.cancelCheckIn(); },
      error: () => { this.error = 'Check-in failed.'; this.cdr.detectChanges(); },
    });
  }

  checkOut(sessionId: string) {
    if (!confirm('Check out this session?')) return;
    this.cashierService.checkOut(sessionId, { closingFloat: 0 }).subscribe({
      next: () => { this.successMsg = 'Session closed.'; this.openSession = null; this.cdr.detectChanges(); },
      error: () => { this.error = 'Check-out failed.'; this.cdr.detectChanges(); },
    });
  }

  openCashMove(sessionId: string) {
    this.activeCashMoveSessionId = sessionId;
    this.showCashMoveForm = true;
  }

  cancelCashMove() {
    this.showCashMoveForm = false;
    this.cashMoveAmount = 0;
    this.cashMoveType = 'CashIn';
    this.cashMoveReason = '';
  }

  recordCashMove() {
    if (!this.cashMoveAmount) { this.error = 'Amount is required.'; return; }
    const dto = { amount: this.cashMoveAmount, reason: this.cashMoveReason || null };
    const obs = this.cashMoveType === 'CashIn'
      ? this.cashierService.cashIn(this.activeCashMoveSessionId, dto)
      : this.cashierService.cashOut(this.activeCashMoveSessionId, dto);
    obs.subscribe({
      next: () => {
        this.successMsg = 'Cash movement recorded.';
        this.cancelCashMove();
        this.loadCashMovements(this.activeCashMoveSessionId);
      },
      error: () => { this.error = 'Failed to record cash movement.'; this.cdr.detectChanges(); },
    });
  }
}
