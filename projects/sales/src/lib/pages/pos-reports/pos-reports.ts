import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { SearchableSelect, SearchableOption } from '@nexcore/core';
import { PosReportService } from '../../services/pos-report.service';
import { PosStoreService } from '../../services/pos-store.service';
import { PosCashierService } from '../../services/pos-cashier.service';
import { PosTerminalService } from '../../services/pos-terminal.service';
import { PosStoreDto } from '../../models/pos-store.model';
import { PosSessionDto } from '../../models/pos-cashier.model';
import {
  PosShiftReportDto, PosSalesSummaryDto, PosProductSalesDto,
  PosCashierSalesDto, PosHourlySalesDto, PosTenderTotalDto,
} from '../../models/pos-report.model';

type Tab = 'period' | 'shift';

/**
 * POS reporting.
 *
 * Two questions, two tabs: *how did the shop trade* over a period, and *does this shift's
 * drawer balance*. The shift read is the one that has to be right to the penny, so it
 * shows the arithmetic — float, cash taken, refunds, money moved to the safe — rather
 * than a single "expected" figure a cashier has to take on trust.
 */
@Component({
  standalone: true,
  selector: 'lib-pos-reports',
  imports: [CommonModule, FormsModule, SearchableSelect],
  templateUrl: './pos-reports.html',
  styleUrls: ['./pos-reports.css'],
})
export class PosReportsComponent implements OnInit {
  private reports = inject(PosReportService);
  private stores = inject(PosStoreService);
  private cashiers = inject(PosCashierService);
  private terminals = inject(PosTerminalService);
  private cdr = inject(ChangeDetectorRef);

  tab: Tab = 'period';

  storeList: PosStoreDto[] = [];
  storeId = '';
  from = '';
  to = '';

  loading = false;
  error = '';

  // ── Period ──
  summary: PosSalesSummaryDto | null = null;
  products: PosProductSalesDto[] = [];
  cashierRows: PosCashierSalesDto[] = [];
  hours: PosHourlySalesDto[] = [];
  tenders: PosTenderTotalDto[] = [];

  // ── Shift ──
  sessions: PosSessionDto[] = [];
  sessionId = '';
  shift: PosShiftReportDto | null = null;
  shiftKind: 'X' | 'Z' = 'X';
  sessionsLoading = false;

  async ngOnInit(): Promise<void> {
    const res = await firstValueFrom(this.stores.getActive()).catch(() => null);
    this.storeList = res?.data ?? [];
    if (this.storeList.length) this.storeId = this.storeList[0].id;

    const today = new Date();
    this.to = this.iso(today);
    this.from = this.iso(new Date(today.getTime() - 6 * 86_400_000));

    await this.runPeriod();
  }

  private iso(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  get storeOptions(): SearchableOption[] {
    return [{ value: '', label: 'All stores' },
            ...this.storeList.map(s => ({ value: s.id, label: s.tradingName ?? s.id }))];
  }

  async setTab(t: Tab): Promise<void> {
    this.tab = t;
    this.error = '';
    if (t === 'shift' && !this.sessions.length) await this.loadSessions();
  }

  // ── Presets ───────────────────────────────────────────────────────────────

  preset(kind: 'today' | 'week' | 'month'): void {
    const now = new Date();
    if (kind === 'today') {
      this.from = this.to = this.iso(now);
    } else if (kind === 'week') {
      this.to = this.iso(now);
      this.from = this.iso(new Date(now.getTime() - 6 * 86_400_000));
    } else {
      this.to = this.iso(now);
      this.from = this.iso(new Date(now.getFullYear(), now.getMonth(), 1));
    }
    void this.runPeriod();
  }

  // ── Period report ─────────────────────────────────────────────────────────

  async runPeriod(): Promise<void> {
    if (!this.from || !this.to) { this.error = 'Pick a date range.'; return; }
    if (this.to < this.from) { this.error = 'The end date is before the start date.'; return; }

    this.loading = true;
    this.error = '';
    const store = this.storeId || null;

    const [summary, products, cashiers, hours, tenders] = await Promise.all([
      firstValueFrom(this.reports.salesSummary(this.from, this.to, store)).catch(() => null),
      firstValueFrom(this.reports.byProduct(this.from, this.to, store, 25)).catch(() => null),
      firstValueFrom(this.reports.byCashier(this.from, this.to, store)).catch(() => null),
      firstValueFrom(this.reports.byHour(this.from, this.to, store)).catch(() => null),
      firstValueFrom(this.reports.tenderMix(this.from, this.to, store)).catch(() => null),
    ]);

    if (!summary) this.error = 'Could not load the report.';
    this.summary = summary?.data ?? null;
    this.products = products?.data ?? [];
    this.cashierRows = cashiers?.data ?? [];
    this.hours = hours?.data ?? [];
    this.tenders = tenders?.data ?? [];

    this.loading = false;
    this.cdr.detectChanges();
  }

  /** Tallest bar in the hourly chart, so the bars scale to the busiest hour. */
  get peakHourSales(): number {
    return this.hours.reduce((max, h) => Math.max(max, h.netSales), 0);
  }

  barHeight(h: PosHourlySalesDto): string {
    const peak = this.peakHourSales;
    // An hour with no trade must render as nothing. The 2% floor is only so a small-but-real
    // hour stays visible — applying it to a true zero would draw trade that never happened.
    if (peak <= 0 || h.netSales <= 0) return '0%';
    return `${Math.max(2, (h.netSales / peak) * 100)}%`;
  }

  hourLabel(h: number): string {
    const suffix = h < 12 ? 'am' : 'pm';
    const hour = h % 12 === 0 ? 12 : h % 12;
    return `${hour}${suffix}`;
  }

  // ── Shift read ────────────────────────────────────────────────────────────

  async loadSessions(): Promise<void> {
    this.sessionsLoading = true;
    this.sessions = [];

    // Sessions hang off terminals, so the store's terminals are the way in.
    const terms = await firstValueFrom(
      this.terminals.getActiveByBranch(this.storeId || this.storeList[0]?.id || '')
    ).catch(() => null);

    const lists = await Promise.all(
      (terms?.data ?? []).map(t =>
        firstValueFrom(this.cashiers.getSessionsByTerminal(t.id)).catch(() => null)));

    this.sessions = lists
      .flatMap(l => l?.data ?? [])
      .sort((a, b) => (b.openedAt ?? '').localeCompare(a.openedAt ?? ''))
      .slice(0, 50);

    if (this.sessions.length && !this.sessionId) this.sessionId = this.sessions[0].id;

    this.sessionsLoading = false;
    this.cdr.detectChanges();
    if (this.sessionId) await this.runShift(this.shiftKind);
  }

  sessionLabel(s: PosSessionDto): string {
    const when = s.openedAt ? new Date(s.openedAt).toLocaleString() : '';
    const state = s.status === 0 ? 'open' : 'closed';
    return `${s.sessionNumber ?? s.id} · ${when} · ${state}`;
  }

  get sessionOptions(): SearchableOption[] {
    return this.sessions.map(s => ({ value: s.id, label: this.sessionLabel(s) }));
  }

  async runShift(kind: 'X' | 'Z'): Promise<void> {
    if (!this.sessionId) { this.error = 'Pick a session.'; return; }

    this.shiftKind = kind;
    this.loading = true;
    this.error = '';

    const res = await firstValueFrom(
      kind === 'X' ? this.reports.xRead(this.sessionId) : this.reports.zRead(this.sessionId)
    ).catch((err: any) => {
      this.error = err?.error?.message ?? 'Could not generate the read.';
      return null;
    });

    this.shift = res?.data ?? null;
    this.loading = false;
    this.cdr.detectChanges();
  }

  async onSessionChange(): Promise<void> {
    if (this.sessionId) await this.runShift(this.shiftKind);
  }

  /** A short drawer is the finding worth colouring; an over is worth noting too. */
  varianceClass(v: number | null): string {
    if (v == null || Math.abs(v) < 0.01) return '';
    return v < 0 ? 'rp-short' : 'rp-over';
  }

  print(): void {
    window.print();
  }

  trackByProduct = (_: number, p: PosProductSalesDto) => `${p.productId}:${p.variantId ?? ''}`;
  trackByCashier = (_: number, c: PosCashierSalesDto) => c.cashierId;
  trackByHour = (_: number, h: PosHourlySalesDto) => h.hour;
  trackByTender = (_: number, t: PosTenderTotalDto) => t.tenderType;
}
