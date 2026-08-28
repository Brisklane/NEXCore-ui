import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ReportService } from '../../services/realestate.services';
import { RealEstateContextService } from '../../services/realestate-context.service';
import type * as M from '../../models/realestate.models';
import {
  BreakdownComponent, EmptyStateComponent, SkeletonComponent, ToastComponent, TrendComponent,
  type BreakdownSlice, type TrendPoint,
} from '../shared/ui';
import { PageHelpComponent } from '../shared/page-help';
import { SectionComponent } from '../shared/detail-bits';

/* =====================================================================================
 * Reports.
 *
 * The catalogue on the left, the result on the right. Every report in the product is declared by
 * the server — which parameters it takes, whether it groups, whether it trends — so this screen
 * never needs to know that a rent roll and a collections ageing are different things.
 *
 * Two decisions worth stating:
 *
 *   - The parameter panel only shows parameters the chosen report actually declares. A form of
 *     fourteen fields where nine are ignored teaches people to ignore all fourteen.
 *   - A truncated result says so, loudly, with the row count. A report that silently stops at
 *     five thousand rows is how a reconciliation goes wrong.
 * ===================================================================================== */

@Component({
  standalone: true,
  selector: 'lib-re-reports',
  imports: [
    CommonModule, FormsModule, SkeletonComponent, EmptyStateComponent, TrendComponent,
    BreakdownComponent, ToastComponent, PageHelpComponent, SectionComponent,
  ],
  templateUrl: './reports.html',
  styleUrls: [
    '../realestate-shared.css', '../shared/ui.css', '../shared/detail-bits.css', './reports.css',
  ],
})
export class ReportsComponent implements OnInit {
  private reports = inject(ReportService);
  protected ctx = inject(RealEstateContextService);

  readonly catalogue = signal<M.ReportDefinitionDto[]>([]);
  readonly result = signal<M.ReportResultDto | null>(null);
  readonly chosen = signal<M.ReportDefinitionDto | null>(null);

  readonly loadingCatalogue = signal(true);
  readonly running = signal(false);
  readonly error = signal<string | null>(null);
  readonly toast = signal<string | null>(null);

  readonly search = signal('');
  readonly fromDate = signal(this.startOfMonth());
  readonly toDate = signal(this.today());
  readonly groupBy = signal('');
  readonly top = signal<number | null>(null);

  /** Grouped by category so the list reads as a table of contents rather than a hundred rows. */
  readonly grouped = computed(() => {
    const term = this.search().trim().toLowerCase();

    const matching = this.catalogue().filter(r =>
      !term || r.title.toLowerCase().includes(term)
      || (r.description ?? '').toLowerCase().includes(term)
      || r.category.toLowerCase().includes(term));

    const groups = new Map<string, M.ReportDefinitionDto[]>();
    for (const r of matching) {
      const bucket = groups.get(r.category);
      if (bucket) bucket.push(r);
      else groups.set(r.category, [r]);
    }

    return [...groups.entries()]
      .map(([category, items]) => ({
        category,
        items: [...items].sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title)),
      }))
      .sort((a, b) => a.category.localeCompare(b.category));
  });

  readonly takes = computed(() => new Set(this.chosen()?.parameters ?? []));

  readonly trend = computed<TrendPoint[]>(() =>
    (this.result()?.trend ?? []).map(p => ({
      label: p.label, value: p.value, secondaryValue: p.secondaryValue ?? null,
    })));

  readonly breakdown = computed<BreakdownSlice[]>(() =>
    (this.result()?.breakdown ?? []).map(s => ({
      label: s.label, value: s.value, percent: s.percent, count: s.count, tone: s.tone ?? null,
    })));

  readonly appliedFilters = computed(() => {
    const f = this.result()?.appliedFilters ?? {};
    return Object.entries(f).map(([label, value]) => ({ label, value }));
  });

  readonly totalled = computed(() =>
    (this.result()?.columns ?? []).filter(c => c.isTotalled));

  async ngOnInit(): Promise<void> {
    await this.ctx.ensureLoaded();

    const res = await firstValueFrom(this.reports.getCatalogue()).catch(() => null);
    if (res?.data) this.catalogue.set(res.data);
    else this.error.set('We could not load the report catalogue.');

    this.loadingCatalogue.set(false);
  }

  choose(r: M.ReportDefinitionDto): void {
    this.chosen.set(r);
    this.result.set(null);
    this.groupBy.set('');
    void this.run();
  }

  async run(): Promise<void> {
    const r = this.chosen();
    if (!r) return;

    this.running.set(true);
    this.error.set(null);

    const takes = this.takes();
    const request: M.ReportRequestDto = {
      reportKey: r.key,
      parameters: {},
      fromDate: takes.has('fromDate') ? this.fromDate() : undefined,
      toDate: takes.has('toDate') ? this.toDate() : undefined,
      projectId: takes.has('projectId') ? (this.ctx.projectId() ?? undefined) : undefined,
      officeId: takes.has('officeId') ? (this.ctx.officeId() ?? undefined) : undefined,
      groupBy: r.supportsGrouping && this.groupBy() ? this.groupBy() : undefined,
      top: this.top() ?? undefined,
    };

    const res = await firstValueFrom(this.reports.run(request)).catch(() => null);

    if (res?.data) this.result.set(res.data);
    else this.error.set('That report did not run. Nothing has been changed by trying.');

    this.running.set(false);
  }

  /**
   * Exports what is on screen, as CSV, from the rows already in the browser.
   *
   * Deliberately not a server round trip: the figures a person is looking at and the figures in
   * the file they send on must be the same figures, and a second query an hour later is not.
   */
  exportCsv(): void {
    const r = this.result();
    if (!r) return;

    const escape = (v: unknown): string => {
      const s = v === null || v === undefined ? '' : String(v);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };

    const lines = [
      r.columns.map(c => escape(c.label)).join(','),
      ...r.rows.map(row => r.columns.map(c => escape(row[c.key])).join(',')),
    ];

    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = r.reportKey + '-' + this.today() + '.csv';
    a.click();
    URL.revokeObjectURL(url);

    this.toast.set('Downloaded ' + r.rowCount.toLocaleString() + ' rows.');
  }

  print(): void {
    window.print();
  }

  cell(row: Record<string, unknown>, col: M.ReportColumnDto): string {
    const v = row[col.key];
    if (v === null || v === undefined || v === '') return '—';

    switch (col.type) {
      case 'money': return this.money(Number(v));
      case 'number': return Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 });
      case 'percent': return Number(v).toFixed(1) + '%';
      case 'date': return new Date(String(v)).toLocaleDateString();
      case 'area': return Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 });
      default: return String(v);
    }
  }

  total(col: M.ReportColumnDto): string {
    const v = this.result()?.totals?.[col.key];
    if (v === null || v === undefined) return '';
    return col.type === 'money' ? this.money(Number(v))
      : Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  align(col: M.ReportColumnDto): string {
    if (col.align) return col.align;
    return ['money', 'number', 'percent', 'area'].includes(col.type) ? 'right' : 'left';
  }

  money(v: number): string {
    const c = this.result()?.currencyCode ?? this.ctx.currency();
    return c + ' ' + v.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private startOfMonth(): string {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
  }
}
