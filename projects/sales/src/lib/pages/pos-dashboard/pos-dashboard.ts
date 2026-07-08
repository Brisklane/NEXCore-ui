import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PosDashboardService } from '../../services/pos-dashboard.service';
import { PosStoreService } from '../../services/pos-store.service';
import { PosSettingsService } from '../../services/pos-settings.service';
import { OfflineService } from '../../services/offline.service';
import { PosBranchStatusDto, PosTerminalStatusDto } from '../../models/pos-dashboard.model';
import { PosStoreDto } from '../../models/pos-store.model';

@Component({
  selector: 'lib-pos-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pos-dashboard.html',
  styleUrl: './pos-dashboard.css',
})
export class PosDashboardComponent implements OnInit, OnDestroy {
  stores: PosStoreDto[] = [];
  branchStatuses: PosBranchStatusDto[] = [];
  terminalStatuses: PosTerminalStatusDto[] = [];
  loading = false;
  error = '';
  searchQuery = '';
  lastUpdated: Date | null = null;
  activeView: 'stores' | 'terminals' = 'stores';
  isOnline = navigator.onLine;
  posMode: string = 'Online';
  pwaInstallPrompt: any = null;
  private pollTimer: any;
  private onlineSub!: Subscription;
  private readonly onPwaInstallable = () => {
    this.pwaInstallPrompt = (window as any).__deferredInstallPrompt ?? null;
    this.cdr.detectChanges();
  };
  private readonly onAppInstalled = () => {
    this.pwaInstallPrompt = null;
    (window as any).__deferredInstallPrompt = null;
    this.cdr.detectChanges();
  };

  constructor(
    private dashboardService: PosDashboardService,
    private storeService: PosStoreService,
    private posSettingsService: PosSettingsService,
    private offline: OfflineService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  get cfgPosMode(): string { return this.posMode; }

  openPOS(branchId: string) {
    this.router.navigate(['/sales/pos'], { queryParams: { storeId: branchId } });
  }

  ngOnInit() {
    this.onlineSub = this.offline.online$.subscribe(v => { this.isOnline = v; this.cdr.detectChanges(); });
    this.posSettingsService.getSettings().subscribe({
      next: (res) => { this.posMode = res.data?.operatingMode ?? 'Online'; this.cdr.detectChanges(); },
    });
    this.pwaInstallPrompt = (window as any).__deferredInstallPrompt ?? null;
    window.addEventListener('pwa-installable', this.onPwaInstallable);
    window.addEventListener('pwa-installed', this.onAppInstalled);
    this.loadAll();
    this.pollTimer = setInterval(() => this.loadAll(), 30_000);
  }

  ngOnDestroy() {
    clearInterval(this.pollTimer);
    this.onlineSub?.unsubscribe();
    window.removeEventListener('pwa-installable', this.onPwaInstallable);
    window.removeEventListener('pwa-installed', this.onAppInstalled);
  }

  installApp() {
    if (!this.pwaInstallPrompt) return;
    this.pwaInstallPrompt.prompt();
    this.pwaInstallPrompt.userChoice.then(() => {
      this.pwaInstallPrompt = null;
      this.cdr.detectChanges();
    });
  }

  loadAll() {
    this.loading = true;
    this.error = '';
    // Load terminals in parallel with store branch stats.
    this.dashboardService.getTerminalStatuses().subscribe({
      next: (res) => { this.terminalStatuses = res.data ?? []; this.cdr.detectChanges(); },
      error: () => { /* terminals panel will be empty */ },
    });
    this.storeService.getAll().subscribe({
      next: (res) => {
        this.stores = res.data ?? [];
        if (!this.stores.length) { this.loading = false; this.cdr.detectChanges(); return; }
        const ids = this.stores.map(s => s.id);
        this.dashboardService.getBulkBranchStatus({ branchIds: ids }).subscribe({
          next: (bulk) => {
            this.branchStatuses = bulk.data ?? [];
            this.loading = false;
            this.lastUpdated = new Date();
            this.cdr.detectChanges();
          },
          error: () => {
            this.error = 'Failed to load branch stats.';
            this.loading = false;
            this.cdr.detectChanges();
          },
        });
      },
      error: () => {
        this.error = 'Failed to load stores.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  get filtered(): PosBranchStatusDto[] {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return this.branchStatuses;
    return this.branchStatuses.filter(b => {
      const store = this.stores.find(s => s.id === b.branchId);
      return (store?.tradingName ?? '').toLowerCase().includes(q) ||
             (b.activeCashierName ?? '').toLowerCase().includes(q);
    });
  }

  get filteredTerminals(): PosTerminalStatusDto[] {
    const q = this.searchQuery.toLowerCase().trim();
    const list = this.terminalStatuses;
    if (!q) return list;
    return list.filter(t =>
      t.terminalName.toLowerCase().includes(q) ||
      t.terminalCode.toLowerCase().includes(q) ||
      t.storeName.toLowerCase().includes(q) ||
      (t.activeCashierName ?? '').toLowerCase().includes(q)
    );
  }

  // ── Overall KPI totals (across all branches) ──────────────────────
  get grossSalesToday(): number { return this.branchStatuses.reduce((s, b) => s + (b.todayTotalSales ?? 0), 0); }
  get txnsToday(): number       { return this.branchStatuses.reduce((s, b) => s + (b.todayTransactionCount ?? 0), 0); }
  get openSessions(): number    { return this.branchStatuses.reduce((s, b) => s + (b.openSessionCount ?? 0), 0); }
  get storeCount(): number      { return this.stores.length; }

  get terminalTotalSales(): number { return this.filteredTerminals.reduce((s, t) => s + t.todayTotalSales, 0); }
  get terminalTotalTxns(): number  { return this.filteredTerminals.reduce((s, t) => s + t.todayTransactionCount, 0); }
  get terminalTotalCash(): number  { return this.filteredTerminals.reduce((s, t) => s + t.todayCashCollected, 0); }
  get terminalTotalCard(): number  { return this.filteredTerminals.reduce((s, t) => s + t.todayCardCollected, 0); }

  storeName(branchId: string): string {
    return this.stores.find(s => s.id === branchId)?.tradingName ?? branchId;
  }

  sessionStatusClass(status: number | string): string {
    // PosBranchSessionStatus: 0=NoSession, 1=Open, 2=Closed
    const n = typeof status === 'number' ? status : +status;
    if (n === 1) return 'badge badge-accepted';
    if (n === 2) return 'badge badge-cancelled';
    return 'badge badge-pending';
  }

  sessionStatusLabel(status: number | string): string {
    const n = typeof status === 'number' ? status : +status;
    if (n === 1) return 'Open';
    if (n === 2) return 'Closed';
    return 'No Session';
  }
}
