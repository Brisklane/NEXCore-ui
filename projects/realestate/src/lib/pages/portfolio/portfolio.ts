import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ReportService } from '../../services/realestate.services';
import { RealEstateContextService } from '../../services/realestate-context.service';
import type * as M from '../../models/realestate.models';
import {
  PROJECT_KIND_LABELS, PROJECT_STATUS_LABELS, ProjectStatus,
} from '../../models/realestate.enums';
import {
  EmptyStateComponent, PillComponent, ProgressComponent, SkeletonComponent, StatsComponent,
  type StatCard,
} from '../shared/ui';
import { PageHelpComponent } from '../shared/page-help';

/* =====================================================================================
 * The portfolio.
 *
 * One card per project, and every card answers the same four questions in the same order:
 * how much of it has been sold, how much of that money has arrived, how far along the building
 * is, and whether it will be handed over when it was promised.
 *
 * The last of those is the one boards ask about and the one most systems bury. A project that is
 * eleven weeks late says so on the card, in words, in red — not as a forecast date the reader has
 * to subtract a promise date from.
 * ===================================================================================== */

type SortKey = 'name' | 'absorption' | 'outstanding' | 'slip' | 'progress';

@Component({
  standalone: true,
  selector: 'lib-re-portfolio',
  imports: [
    CommonModule, FormsModule, StatsComponent, ProgressComponent, SkeletonComponent,
    EmptyStateComponent, PillComponent, PageHelpComponent,
  ],
  templateUrl: './portfolio.html',
  styleUrls: ['../realestate-shared.css', '../shared/ui.css', './portfolio.css'],
})
export class PortfolioComponent implements OnInit {
  private reports = inject(ReportService);
  private router = inject(Router);
  protected ctx = inject(RealEstateContextService);

  readonly rows = signal<M.ProjectListItemDto[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly search = signal('');
  readonly statusFilter = signal<ProjectStatus | null>(null);
  readonly lateOnly = signal(false);
  readonly sort = signal<SortKey>('name');

  readonly statusOptions = Object.entries(PROJECT_STATUS_LABELS)
    .map(([value, label]) => ({ value: Number(value) as ProjectStatus, label }));

  readonly visible = computed(() => {
    const term = this.search().trim().toLowerCase();

    const filtered = this.rows().filter(p => {
      if (this.statusFilter() !== null && p.status !== this.statusFilter()) return false;
      if (this.lateOnly() && !(p.slipDays && p.slipDays > 0)) return false;
      if (term && !(p.name.toLowerCase().includes(term)
        || (p.code ?? '').toLowerCase().includes(term)
        || (p.city ?? '').toLowerCase().includes(term))) return false;
      return true;
    });

    const key = this.sort();
    return [...filtered].sort((a, b) => {
      switch (key) {
        case 'absorption': return b.absorptionPercent - a.absorptionPercent;
        case 'outstanding': return b.outstanding - a.outstanding;
        case 'slip': return (b.slipDays ?? 0) - (a.slipDays ?? 0);
        case 'progress': return b.physicalProgressPercent - a.physicalProgressPercent;
        default: return a.name.localeCompare(b.name);
      }
    });
  });

  readonly isFiltered = computed(() =>
    !!this.search().trim() || this.statusFilter() !== null || this.lateOnly());

  readonly stats = computed<StatCard[]>(() => {
    const all = this.rows();
    if (!all.length) return [];

    const units = all.reduce((s, p) => s + p.totalUnits, 0);
    const sold = all.reduce((s, p) => s + p.unitsSold + p.unitsBooked, 0);
    const value = all.reduce((s, p) => s + p.totalSalesValue, 0);
    const collected = all.reduce((s, p) => s + p.totalCollected, 0);
    const outstanding = all.reduce((s, p) => s + p.outstanding, 0);
    const late = all.filter(p => (p.slipDays ?? 0) > 0).length;

    return [
      { label: 'Projects', value: all.length, icon: 'apartment' },
      {
        label: 'Units', value: units, icon: 'grid_view',
        hint: units ? Math.round((sold / units) * 100) + '% taken' : 'none yet',
      },
      { label: 'Sold value', value: this.money(value), icon: 'sell' },
      {
        label: 'Collected', value: this.money(collected), icon: 'payments', tone: 'positive',
        hint: value ? Math.round((collected / value) * 100) + '% of sold value' : undefined,
      },
      {
        label: 'Outstanding', value: this.money(outstanding), icon: 'account_balance_wallet',
        tone: outstanding > 0 ? 'warning' : 'neutral',
      },
      {
        label: 'Running late', value: late, icon: 'schedule',
        tone: late > 0 ? 'danger' : 'positive',
        hint: late ? 'against the promised handover' : 'all on programme',
      },
    ];
  });

  async ngOnInit(): Promise<void> {
    await this.ctx.ensureLoaded();
    await this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    const res = await firstValueFrom(this.reports.getPortfolio({ pageSize: 200 }))
      .catch(() => null);

    if (res?.data) this.rows.set(res.data);
    else this.error.set('We could not load the portfolio.');

    this.loading.set(false);
  }

  open(p: M.ProjectListItemDto): void {
    void this.router.navigate(['/realestate/projects', p.id]);
  }

  clear(): void {
    this.search.set('');
    this.statusFilter.set(null);
    this.lateOnly.set(false);
  }

  kindLabel(p: M.ProjectListItemDto): string {
    return PROJECT_KIND_LABELS[p.kind] ?? '—';
  }

  statusLabel(p: M.ProjectListItemDto): string {
    return PROJECT_STATUS_LABELS[p.status] ?? '—';
  }

  where(p: M.ProjectListItemDto): string {
    return [p.areaName, p.city].filter(Boolean).join(', ');
  }

  /** In words, because "forecast 12 Mar, promised 4 Jan" is a subtraction nobody should do. */
  schedule(p: M.ProjectListItemDto): { text: string; tone: 'positive' | 'warning' | 'danger' | 'neutral' } {
    const slip = p.slipDays ?? 0;

    if (!p.promisedPossessionDate) {
      return { text: 'No handover date promised', tone: 'neutral' };
    }
    if (slip <= 0) {
      return { text: 'On programme for handover', tone: 'positive' };
    }
    if (slip < 30) {
      return { text: slip + ' days behind the promise', tone: 'warning' };
    }

    const months = Math.round(slip / 30);
    return {
      text: months + (months === 1 ? ' month' : ' months') + ' behind the promise',
      tone: 'danger',
    };
  }

  collectedPercent(p: M.ProjectListItemDto): number {
    return p.totalSalesValue ? (p.totalCollected / p.totalSalesValue) * 100 : 0;
  }

  money(v: number | undefined): string {
    const n = v ?? 0;
    const abs = Math.abs(n);
    const c = this.ctx.currency();
    if (abs >= 1_000_000_000) return c + ' ' + (n / 1_000_000_000).toFixed(2) + 'bn';
    if (abs >= 1_000_000) return c + ' ' + (n / 1_000_000).toFixed(2) + 'm';
    if (abs >= 1_000) return c + ' ' + (n / 1_000).toFixed(0) + 'k';
    return c + ' ' + n.toFixed(0);
  }
}
