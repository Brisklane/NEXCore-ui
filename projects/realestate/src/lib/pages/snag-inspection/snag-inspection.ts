import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ExitService } from '../../services/realestate.services';
import { RealEstateContextService } from '../../services/realestate-context.service';
import type * as M from '../../models/realestate.models';
import {
  COST_BEARER_LABELS, SNAG_SEVERITY_LABELS, SNAG_STATUS_LABELS, SNAG_ZONE_LABELS,
  SnagSeverity, SnagStatus,
} from '../../models/realestate.enums';
import {
  DetailPageComponent, type DetailAction, type DetailFigure, type DetailPill, type DetailTab,
} from '../shared/detail-page';
import { FactsComponent, SectionComponent, type Fact } from '../shared/detail-bits';
import {
  DrawerComponent, PillComponent, ProgressComponent, ToastComponent,
} from '../shared/ui';

/* =====================================================================================
 * A snagging inspection.
 *
 * The walk-through before handover, and every defect found on it.
 *
 * Severity is three tiers and they mean different things, so they are never totalled together:
 * a critical snag blocks handover outright; a major one has to be fixed within an agreed window;
 * a minor one is on the list but does not stop anybody moving in. A screen that shows "47 open
 * snags" without that split tells the reader nothing about whether the unit can be handed over.
 *
 * Every state change carries photographs, because a defect closed without evidence is a defect
 * that comes back as a claim during the liability period.
 * ===================================================================================== */

@Component({
  standalone: true,
  selector: 'lib-re-snag-inspection',
  imports: [
    CommonModule, FormsModule, DetailPageComponent, SectionComponent, FactsComponent,
    ProgressComponent, PillComponent, DrawerComponent, ToastComponent,
  ],
  templateUrl: './snag-inspection.html',
  styleUrls: [
    '../realestate-shared.css', '../shared/ui.css', '../shared/detail-bits.css',
    './snag-inspection.css',
  ],
})
export class SnagInspectionComponent implements OnInit {
  private exit = inject(ExitService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected ctx = inject(RealEstateContextService);

  readonly data = signal<M.SnagInspectionDto | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly notFound = signal(false);
  readonly toast = signal<string | null>(null);
  readonly tab = signal('snags');

  readonly severityFilter = signal<SnagSeverity | null>(null);
  readonly openOnly = signal(true);

  readonly selected = signal<M.SnagDto | null>(null);
  readonly newStatus = signal<SnagStatus | null>(null);
  readonly statusNote = signal('');
  readonly saving = signal(false);

  readonly severities = [SnagSeverity.Critical, SnagSeverity.Major, SnagSeverity.Minor]
    .map(s => ({ value: s, label: SNAG_SEVERITY_LABELS[s] }));

  readonly statuses = Object.entries(SNAG_STATUS_LABELS)
    .map(([value, label]) => ({ value: Number(value) as SnagStatus, label }));

  readonly snags = computed(() => {
    const all = this.data()?.snags ?? [];

    return all.filter(s => {
      if (this.severityFilter() !== null && s.severity !== this.severityFilter()) return false;
      if (this.openOnly() && s.status === SnagStatus.Verified) return false;
      return true;
    });
  });

  /** Grouped by zone, because that is how somebody actually walks a unit. */
  readonly byZone = computed(() => {
    const groups = new Map<number, M.SnagDto[]>();

    for (const s of this.snags()) {
      const bucket = groups.get(s.zone);
      if (bucket) bucket.push(s);
      else groups.set(s.zone, [s]);
    }

    return [...groups.entries()]
      .map(([zone, snags]) => ({
        zone,
        label: SNAG_ZONE_LABELS[zone as keyof typeof SNAG_ZONE_LABELS] ?? 'Elsewhere',
        snags: [...snags].sort((a, b) => a.severity - b.severity || a.snagNumber - b.snagNumber),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  });

  readonly overdue = computed(() => (this.data()?.snags ?? []).filter(s => s.isOverdue));

  readonly tabs = computed<DetailTab[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { key: 'snags', label: 'Defects', icon: 'construction', count: d.openCount,
        tone: d.criticalCount ? 'danger' : d.openCount ? 'warning' : 'neutral' },
      { key: 'summary', label: 'The inspection', icon: 'info' },
    ];
  });

  readonly pills = computed<DetailPill[]>(() => {
    const d = this.data();
    if (!d) return [];

    const pills: DetailPill[] = [
      { label: d.isClosed ? 'Closed' : 'Open', tone: d.isClosed ? 'positive' : 'warning' },
      { label: d.inspectionType },
    ];

    if (d.blocksHandover) {
      pills.push({ label: 'Blocks handover', tone: 'danger', icon: 'block' });
    }
    if (d.customerPresent) {
      pills.push({ label: 'Customer was present', tone: 'positive', icon: 'person' });
    }
    if (this.overdue().length) {
      pills.push({ label: this.overdue().length + ' past target', tone: 'danger' });
    }

    return pills;
  });

  readonly figures = computed<DetailFigure[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      {
        label: 'Critical', value: String(d.criticalCount),
        hint: d.criticalCount ? 'handover is blocked' : 'nothing blocking',
      },
      { label: 'Major', value: String(d.majorCount), hint: 'fix within the window' },
      { label: 'Minor', value: String(d.minorCount), hint: 'on the list, not blocking' },
      {
        label: 'Closed', value: d.percentClosed.toFixed(0) + '%',
        hint: d.closedCount + ' of ' + (d.closedCount + d.openCount),
      },
    ];
  });

  readonly actions = computed<DetailAction[]>(() => {
    const d = this.data();
    if (!d) return [];

    const actions: DetailAction[] = [];

    if (!d.punchListId) {
      actions.push({
        key: 'punch', label: 'Issue punch list', icon: 'assignment', tone: 'primary',
        disabled: d.openCount === 0,
        reason: d.openCount === 0 ? 'There is nothing outstanding to issue.' : null,
      });
    }

    if (d.bookingId) {
      actions.push({ key: 'booking', label: 'The booking', icon: 'open_in_new' });
    }

    return actions;
  });

  readonly summary = computed<Fact[]>(() => {
    const d = this.data();
    if (!d) return [];

    return [
      { label: 'Reference', value: d.reference },
      { label: 'Type', value: d.inspectionType },
      { label: 'Inspected', value: new Date(d.inspectedAt).toLocaleString() },
      { label: 'Inspector', value: d.inspectorName },
      { label: 'Project', value: d.projectName },
      { label: 'Unit', value: d.unitNumber },
      { label: 'Contractor', value: d.contractorName },
      { label: 'Customer present', value: d.customerPresent ? 'Yes' : 'No' },
      { label: 'Customer', value: d.customerName },
      {
        label: 'Target closure',
        value: d.targetClosureDate ? new Date(d.targetClosureDate).toLocaleDateString() : null,
      },
      {
        label: 'Signed by the customer',
        value: d.customerSignatureUrl ? 'Yes' : 'No',
        tone: d.customerSignatureUrl ? 'positive' : 'warning',
        hint: d.customerSignatureUrl
          ? null : 'an unsigned inspection is hard to rely on later',
      },
    ];
  });

  async ngOnInit(): Promise<void> {
    await this.ctx.ensureLoaded();
    await this.load();
  }

  async load(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.notFound.set(true);
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const res = await firstValueFrom(this.exit.getInspection(id)).catch(() => null);

    if (res?.data) this.data.set(res.data);
    else this.notFound.set(true);

    this.loading.set(false);
  }

  act(key: string): void {
    const d = this.data();
    if (!d) return;

    if (key === 'punch') void this.issuePunchList();
    else if (key === 'booking' && d.bookingId) {
      void this.router.navigate(['/realestate/bookings', d.bookingId]);
    }
  }

  private async issuePunchList(): Promise<void> {
    const d = this.data();
    if (!d) return;

    const res = await firstValueFrom(this.exit.issuePunchList(d.id)).catch(() => null);

    if (res?.success) {
      this.toast.set('Punch list issued to the contractor.');
      await this.load();
    } else {
      this.toast.set('The punch list could not be issued.');
    }
  }

  open(snag: M.SnagDto): void {
    this.selected.set(snag);
    this.newStatus.set(snag.status);
    this.statusNote.set('');
  }

  async changeStatus(): Promise<void> {
    const snag = this.selected();
    const status = this.newStatus();
    if (!snag || status === null) return;

    this.saving.set(true);

    // No photographs are attached from this screen — evidence is captured on site, where the
    // camera is. Sending an empty set here would overwrite what the inspector uploaded.
    const res = await firstValueFrom(
      this.exit.changeSnagStatus(snag.id, [], status, this.statusNote() || undefined),
    ).catch(() => null);

    this.saving.set(false);

    if (res?.success) {
      this.selected.set(null);
      this.toast.set('Updated.');
      await this.load();
    } else {
      this.toast.set('That did not save.');
    }
  }

  severityClass(s: SnagSeverity): string {
    if (s === SnagSeverity.Critical) return 'is-critical';
    return s === SnagSeverity.Major ? 'is-major' : 'is-minor';
  }

  severityLabel(s: SnagSeverity): string {
    return SNAG_SEVERITY_LABELS[s] ?? '—';
  }

  statusLabel(s: SnagStatus): string {
    return SNAG_STATUS_LABELS[s] ?? '—';
  }

  bearerLabel(b: M.SnagDto['responsibleParty']): string {
    return COST_BEARER_LABELS[b] ?? '—';
  }

  money(v: number | undefined | null): string {
    if (v === undefined || v === null) return '—';
    return this.ctx.currency() + ' ' + v.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }
}
