import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConstructionService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

function subcontractTone(s: E.SubcontractStatus): 'positive' | 'warning' | 'danger' | 'neutral' {
  switch (s) {
    case E.SubcontractStatus.Completed: return 'positive';
    case E.SubcontractStatus.Terminated:
    case E.SubcontractStatus.Suspended: return 'danger';
    case E.SubcontractStatus.Active:
    case E.SubcontractStatus.InDefectsPeriod: return 'warning';
    default: return 'neutral';
  }
}

/**
 * Reads a label map with a value that arrived as JSON.
 *
 * The wire carries a plain number, so the lookup is unavoidably untyped at this one point. A
 * missing value renders as an em dash rather than as `undefined`, which is the difference between
 * a gap in the data and a bug on screen.
 */
function lbl<T extends number>(map: Record<T, string>, value: unknown): string {
  return map[value as T] ?? '\u2014';
}

/** Subcontracts — Packages awarded and what is owed. */
@Component({
  standalone: true,
  selector: 'lib-re-subcontracts',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (create)="create()"
    />
  `,
})
export class SubcontractsComponent implements OnInit {
  private construction = inject(ConstructionService);

  readonly config: ListConfig<any> = {
    title: 'Subcontracts',
    subtitle: 'Packages awarded and what is owed.',
    helpKey: 'build/subcontracts',
    icon: 'handyman',
    searchPlaceholder: 'Reference, package or contractor',
    scope: 'project',
    createLabel: 'Award a subcontract',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No subcontracts',
    emptyMessage: 'Award one from a tender.',
    columns: [
      { key: 'reference', label: 'Subcontract', kind: 'strong', width: '140px' },
      { key: 'name', label: 'Package', sub: r => r.contractorName ?? null },
      { key: 'revisedValue', label: 'Value', kind: 'money', align: 'right' },
      { key: 'certifiedToDate', label: 'Certified', kind: 'money', align: 'right' },
      { key: 'paidToDate', label: 'Paid', kind: 'money', align: 'right', hideBelow: 'md' },
      { key: 'retentionHeld', label: 'Retention', kind: 'money', align: 'right', hideBelow: 'md' },
      { key: 'progressPercent', label: 'Progress', kind: 'progress', align: 'right' },
      { key: 'status', label: 'Status', kind: 'pill', value: r => lbl(E.SUBCONTRACT_STATUS_LABELS, r.status), tone: r => subcontractTone(r.status) },
    ],
    filters: [
      { key: 'status', label: 'Status', kind: 'select', options: enumOptions(E.SUBCONTRACT_STATUS_LABELS) },
    ],
    presets: [
      { key: 'live', label: 'On site', apply: { status: E.SubcontractStatus.Active } },
      { key: 'owing', label: 'Certified but unpaid', apply: { owingOnly: true }, tone: 'warning' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.construction.getSubcontracts(toListQuery(q), q.scopeId ?? undefined, (q.filters['status'] as any));

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
