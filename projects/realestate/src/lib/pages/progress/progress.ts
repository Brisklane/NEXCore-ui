import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ConstructionService } from '../../services/realestate.services';
import { RealEstateContextService } from '../../services/realestate-context.service';
import type * as M from '../../models/realestate.models';
import { PROGRESS_METHOD_LABELS, ProgressMethod } from '../../models/realestate.enums';
import {
  ConfirmComponent, EmptyStateComponent, PillComponent, SkeletonComponent, StatsComponent,
  ToastComponent, type StatCard,
} from '../shared/ui';
import { FactsComponent, SectionComponent, type Fact } from '../shared/detail-bits';

/* =====================================================================================
 * Progress measurement.
 *
 * What was built this period, line by line, and what it is worth.
 *
 * This is the screen that turns work on site into money, so it is deliberately conservative:
 *
 *   - A measurement is a draft until it is certified. Certifying it is a separate, explicit act
 *     by somebody with the authority to do it, and it is what a payment certificate is raised on.
 *   - This period's quantity cannot take the cumulative past the contract quantity without
 *     saying so, because over-measurement is over-payment and it is recovered by withholding
 *     later certificates — which is unpleasant for everybody.
 *   - A measurement taken offline on site is marked. It was made without the current figures in
 *     front of the measurer, and it is worth a second look.
 * ===================================================================================== */

@Component({
  standalone: true,
  selector: 'lib-re-progress',
  imports: [
    CommonModule, FormsModule, StatsComponent, SkeletonComponent, EmptyStateComponent,
    PillComponent, ConfirmComponent, ToastComponent, SectionComponent, FactsComponent,
  ],
  templateUrl: './progress.html',
  styleUrls: [
    '../realestate-shared.css', '../shared/ui.css', '../shared/detail-bits.css',
    './progress.css',
  ],
})
export class ProgressComponent implements OnInit {
  private construction = inject(ConstructionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected ctx = inject(RealEstateContextService);

  readonly measurements = signal<M.ProgressMeasurementDto[]>([]);
  readonly selected = signal<M.ProgressMeasurementDto | null>(null);
  readonly loading = signal(true);
  readonly working = signal(false);
  readonly error = signal<string | null>(null);
  readonly toast = signal<string | null>(null);
  readonly certifying = signal(false);
  readonly uncertifiedOnly = signal(false);

  private projectId = '';

  readonly visible = computed(() => {
    const rows = [...this.measurements()]
      .sort((a, b) => new Date(b.measuredOn).getTime() - new Date(a.measuredOn).getTime());

    return this.uncertifiedOnly() ? rows.filter(r => !r.isCertified) : rows;
  });

  readonly uncertified = computed(() =>
    this.measurements().filter(m => !m.isCertified));

  readonly uncertifiedValue = computed(() =>
    this.uncertified().reduce((sum, m) => sum + m.periodValue, 0));

  readonly stats = computed<StatCard[]>(() => {
    const rows = this.measurements();
    if (!rows.length) return [];

    const latest = [...rows].sort((a, b) =>
      new Date(b.measuredOn).getTime() - new Date(a.measuredOn).getTime())[0];

    return [
      { label: 'Measurements', value: rows.length, icon: 'straighten' },
      {
        label: 'Awaiting certification', value: this.uncertified().length, icon: 'pending',
        tone: this.uncertified().length ? 'warning' : 'positive',
        hint: this.money(this.uncertifiedValue()) + ' of work',
      },
      {
        label: 'Cumulative value', value: this.money(latest.cumulativeValue), icon: 'functions',
        hint: 'measured to date',
      },
      {
        label: 'Progress', value: latest.progressPercent.toFixed(1) + '%', icon: 'engineering',
        tone: 'accent',
        hint: 'at ' + new Date(latest.measuredOn).toLocaleDateString(),
      },
    ];
  });

  readonly selectedFacts = computed<Fact[]>(() => {
    const m = this.selected();
    if (!m) return [];

    return [
      { label: 'Reference', value: m.reference },
      {
        label: 'Period',
        value: new Date(m.periodFrom).toLocaleDateString()
          + ' to ' + new Date(m.periodTo).toLocaleDateString(),
      },
      { label: 'Measured on', value: new Date(m.measuredOn).toLocaleDateString() },
      { label: 'Measured by', value: m.measuredByName },
      { label: 'Method', value: PROGRESS_METHOD_LABELS[m.method] },
      { label: 'Package', value: m.wbsName },
      { label: 'Subcontractor', value: m.subcontractorName },
      { label: 'This period', value: this.money(m.periodValue), tone: 'positive' },
      { label: 'Cumulative', value: this.money(m.cumulativeValue) },
      { label: 'Progress', value: m.progressPercent.toFixed(2) + '%' },
      {
        label: 'Certified',
        value: m.isCertified
          ? (m.certifiedOn ? new Date(m.certifiedOn).toLocaleDateString() : 'Yes')
          : 'Not yet',
        tone: m.isCertified ? 'positive' : 'warning',
        hint: m.certifiedByName,
      },
      {
        label: 'Taken offline', value: m.wasOffline ? 'Yes' : 'No',
        tone: m.wasOffline ? 'warning' : 'neutral',
        hint: m.wasOffline
          ? 'recorded on site without the current figures to hand' : null,
      },
      { label: 'Note', value: m.note, wide: true },
    ];
  });

  /** Lines where this period's cumulative has passed the contract quantity. */
  readonly overMeasured = computed(() =>
    (this.selected()?.lines ?? [])
      .filter(l => l.cumulativeQuantity > l.contractQuantity));

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

    const res = await firstValueFrom(
      this.construction.getProgress({ pageSize: 200 }, this.projectId),
    ).catch(() => null);

    if (res?.data) {
      this.measurements.set(res.data);
      if (!this.selected() && res.data.length) this.selected.set(res.data[0]);
    } else {
      this.error.set('We could not load the progress measurements for this project.');
    }

    this.loading.set(false);
  }

  select(m: M.ProgressMeasurementDto): void {
    this.selected.set(m);
  }

  async certify(): Promise<void> {
    const m = this.selected();
    if (!m) return;

    this.working.set(true);

    const res = await firstValueFrom(this.construction.certifyProgress(m.id)).catch(() => null);

    this.working.set(false);
    this.certifying.set(false);

    if (res?.data) {
      this.selected.set(res.data);
      this.toast.set('Certified. It can now be included on an interim payment certificate.');
      await this.load();
    } else {
      this.toast.set('That could not be certified. Nothing has changed.');
    }
  }

  back(): void {
    void this.router.navigate(['/realestate/construction', this.projectId]);
  }

  lineTone(l: M.ProgressMeasurementLineDto): string {
    if (l.cumulativeQuantity > l.contractQuantity) return 'is-over';
    if (l.certifiedQuantity < l.cumulativeQuantity) return 'is-pending';
    return '';
  }

  linePercent(l: M.ProgressMeasurementLineDto): number {
    return l.contractQuantity > 0
      ? Math.min(150, (l.cumulativeQuantity / l.contractQuantity) * 100)
      : 0;
  }

  quantity(v: number): string {
    return v.toLocaleString(undefined, { maximumFractionDigits: 3 });
  }

  money(v: number | undefined | null): string {
    if (v === undefined || v === null) return '—';
    const c = this.selected()?.currencyCode ?? this.ctx.currency();
    const abs = Math.abs(v);
    if (abs >= 1_000_000) return c + ' ' + (v / 1_000_000).toFixed(2) + 'm';
    if (abs >= 10_000) return c + ' ' + (v / 1_000).toFixed(0) + 'k';
    return c + ' ' + v.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }

  exact(v: number | undefined | null): string {
    if (v === undefined || v === null) return '—';
    return (this.selected()?.currencyCode ?? this.ctx.currency()) + ' '
      + v.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  methodLabel(m: ProgressMethod): string {
    return PROGRESS_METHOD_LABELS[m] ?? '';
  }
}
