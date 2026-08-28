import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ConstructionService } from '../../services/realestate.services';
import { RealEstateContextService } from '../../services/realestate-context.service';
import type * as M from '../../models/realestate.models';
import { BOQ_LINE_KIND_LABELS, BoqLineKind } from '../../models/realestate.enums';
import {
  EmptyStateComponent, PillComponent, ProgressComponent, SkeletonComponent, StatsComponent,
  ToastComponent, type StatCard,
} from '../shared/ui';
import { SectionComponent } from '../shared/detail-bits';

/** A section or a line, flattened for one scrolling table. */
interface Row {
  kind: 'section' | 'line';
  depth: number;
  section?: M.BoqSectionDto;
  line?: M.BoqLineDto;
}

/* =====================================================================================
 * The bill of quantities.
 *
 * Every item of work on a contract, with its quantity, its rate and what it comes to. This is the
 * document a construction contract is actually made of, and everything downstream — progress
 * measurement, interim certificates, variations, final account — is measured against it.
 *
 * Two distinctions the screen refuses to blur:
 *
 *   - Measured work against provisional sums. A provisional sum is an allowance for work nobody
 *     has designed yet; it will change. Adding it to the measured total and calling the result a
 *     contract value is how a client is surprised at the final account.
 *   - Executed against certified quantity. Work done on site and work signed off are different
 *     numbers, and the gap between them is what the contractor is waiting to be paid for.
 * ===================================================================================== */

@Component({
  standalone: true,
  selector: 'lib-re-boq',
  imports: [
    CommonModule, FormsModule, StatsComponent, ProgressComponent, SkeletonComponent,
    EmptyStateComponent, PillComponent, ToastComponent, SectionComponent,
  ],
  templateUrl: './boq.html',
  styleUrls: [
    '../realestate-shared.css', '../shared/ui.css', '../shared/detail-bits.css', './boq.css',
  ],
})
export class BoqComponent implements OnInit {
  private construction = inject(ConstructionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected ctx = inject(RealEstateContextService);

  readonly available = signal<M.BillOfQuantitiesDto[]>([]);
  readonly boq = signal<M.BillOfQuantitiesDto | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly toast = signal<string | null>(null);

  readonly search = signal('');
  readonly kindFilter = signal<BoqLineKind | null>(null);
  readonly collapsed = signal<Set<string>>(new Set());

  private projectId = '';

  readonly kinds = Object.entries(BOQ_LINE_KIND_LABELS)
    .map(([value, label]) => ({ value: Number(value) as BoqLineKind, label }));

  /** Sections and their lines in one flat list, so the table scrolls as a single thing. */
  readonly rows = computed<Row[]>(() => {
    const b = this.boq();
    if (!b) return [];

    const term = this.search().trim().toLowerCase();
    const kind = this.kindFilter();
    const hidden = this.collapsed();
    const out: Row[] = [];

    const matches = (l: M.BoqLineDto) => {
      if (kind !== null && l.kind !== kind) return false;
      if (!term) return true;
      return l.description.toLowerCase().includes(term)
        || l.itemCode.toLowerCase().includes(term);
    };

    const walk = (sections: M.BoqSectionDto[], depth: number) => {
      for (const s of [...sections].sort((a, b2) => a.sortOrder - b2.sortOrder)) {
        const lines = (s.lines ?? []).filter(matches);
        const childHasContent = this.sectionHasContent(s, matches);

        // A section with nothing left after filtering is not worth a heading.
        if (!lines.length && !childHasContent) continue;

        out.push({ kind: 'section', depth, section: s });

        if (!hidden.has(s.id)) {
          for (const l of [...lines].sort((a, b2) => a.sortOrder - b2.sortOrder)) {
            out.push({ kind: 'line', depth: depth + 1, line: l });
          }
          if (s.children?.length) walk(s.children, depth + 1);
        }
      }
    };

    walk(b.sections ?? [], 0);
    return out;
  });

  private sectionHasContent(
    s: M.BoqSectionDto,
    matches: (l: M.BoqLineDto) => boolean,
  ): boolean {
    if ((s.lines ?? []).some(matches)) return true;
    return (s.children ?? []).some(c => this.sectionHasContent(c, matches));
  }

  readonly isFiltered = computed(() =>
    !!this.search().trim() || this.kindFilter() !== null);

  readonly stats = computed<StatCard[]>(() => {
    const b = this.boq();
    if (!b) return [];

    return [
      {
        label: 'Total', value: this.money(b.totalAmount), icon: 'functions',
        hint: b.lineCount + ' lines',
      },
      {
        label: 'Measured', value: this.money(b.measuredTotal), icon: 'straighten',
        hint: 'firm quantities at firm rates',
      },
      {
        label: 'Provisional sums', value: this.money(b.provisionalSumsTotal), icon: 'help',
        tone: b.provisionalSumsTotal > 0 ? 'warning' : 'neutral',
        hint: 'allowances that will change',
      },
      {
        label: 'Contingency', value: this.money(b.contingencyTotal), icon: 'savings',
        hint: 'held for the unforeseen',
      },
      {
        label: 'Executed', value: b.overallProgressPercent.toFixed(1) + '%', icon: 'engineering',
        tone: 'accent', hint: 'by value',
      },
    ];
  });

  /** How much of the total is an allowance rather than a firm price. */
  readonly softPercent = computed(() => {
    const b = this.boq();
    if (!b || !b.totalAmount) return 0;
    return ((b.provisionalSumsTotal + b.contingencyTotal) / b.totalAmount) * 100;
  });

  readonly uncertifiedValue = computed(() => {
    const b = this.boq();
    if (!b) return 0;

    let total = 0;
    const walk = (sections: M.BoqSectionDto[]) => {
      for (const s of sections) {
        for (const l of s.lines ?? []) {
          total += Math.max(0, (l.executedQuantity - l.certifiedQuantity) * l.rate);
        }
        if (s.children?.length) walk(s.children);
      }
    };

    walk(b.sections ?? []);
    return total;
  });

  async ngOnInit(): Promise<void> {
    await this.ctx.ensureLoaded();
    this.projectId = this.route.snapshot.paramMap.get('id') ?? '';
    await this.load();
  }

  async load(): Promise<void> {
    if (!this.projectId) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const list = await firstValueFrom(this.construction.getBoqs(this.projectId))
      .catch(() => null);

    if (!list?.data) {
      this.error.set('We could not load the bills of quantities for this project.');
      this.loading.set(false);
      return;
    }

    this.available.set(list.data);

    const current = list.data.find(b => b.isCurrent) ?? list.data[0];
    if (current) await this.open(current.id);
    else this.loading.set(false);
  }

  async open(id: string): Promise<void> {
    this.loading.set(true);

    const res = await firstValueFrom(this.construction.getBoq(id)).catch(() => null);

    if (res?.data) this.boq.set(res.data);
    else this.error.set('That bill of quantities could not be opened.');

    this.loading.set(false);
  }

  toggle(sectionId: string): void {
    const next = new Set(this.collapsed());
    if (next.has(sectionId)) next.delete(sectionId);
    else next.add(sectionId);
    this.collapsed.set(next);
  }

  isCollapsed(sectionId: string): boolean {
    return this.collapsed().has(sectionId);
  }

  clear(): void {
    this.search.set('');
    this.kindFilter.set(null);
  }

  back(): void {
    void this.router.navigate(['/realestate/construction', this.projectId]);
  }

  /**
   * Exports the whole bill flat. Quantity surveyors reconcile in a spreadsheet, and giving them
   * the same numbers the screen shows saves an argument about which version is right.
   */
  exportCsv(): void {
    const b = this.boq();
    if (!b) return;

    const lines: string[] = [
      ['Section', 'Item', 'Description', 'Kind', 'Unit', 'Quantity', 'Rate', 'Amount',
        'Executed', 'Certified', 'Remaining', 'Progress %', 'Margin %'].join(','),
    ];

    const escape = (v: unknown) => {
      const s = v === null || v === undefined ? '' : String(v);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };

    const walk = (sections: M.BoqSectionDto[], path: string) => {
      for (const s of sections) {
        const label = path ? path + ' / ' + s.name : s.name;
        for (const l of s.lines ?? []) {
          lines.push([
            escape(label), escape(l.itemCode), escape(l.description),
            escape(BOQ_LINE_KIND_LABELS[l.kind]), escape(l.uom),
            l.quantity, l.rate, l.amount, l.executedQuantity, l.certifiedQuantity,
            l.remainingQuantity, l.progressPercent.toFixed(2), l.marginPercent.toFixed(2),
          ].join(','));
        }
        if (s.children?.length) walk(s.children, label);
      }
    };

    walk(b.sections ?? [], '');

    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = b.reference + '.csv';
    a.click();
    URL.revokeObjectURL(url);

    this.toast.set('Downloaded ' + b.lineCount + ' lines.');
  }

  kindLabel(k: BoqLineKind): string {
    return BOQ_LINE_KIND_LABELS[k] ?? '';
  }

  /** Anything that is not measured work is an allowance, and is marked as such. */
  isAllowance(l: M.BoqLineDto): boolean {
    return l.kind !== BoqLineKind.Measured && l.kind !== BoqLineKind.Preliminaries;
  }

  quantity(v: number): string {
    return v.toLocaleString(undefined, { maximumFractionDigits: 3 });
  }

  money(v: number | undefined | null): string {
    if (v === undefined || v === null) return '—';
    const c = this.boq()?.currencyCode ?? this.ctx.currency();
    const abs = Math.abs(v);
    if (abs >= 1_000_000) return c + ' ' + (v / 1_000_000).toFixed(2) + 'm';
    if (abs >= 10_000) return c + ' ' + (v / 1_000).toFixed(0) + 'k';
    return c + ' ' + v.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }

  exact(v: number | undefined | null): string {
    if (v === undefined || v === null) return '—';
    return (this.boq()?.currencyCode ?? this.ctx.currency()) + ' '
      + v.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
}
