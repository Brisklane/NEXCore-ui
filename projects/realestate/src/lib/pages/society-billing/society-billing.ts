import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SocietyService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

function instalmentTone(s: E.InstalmentStatus): 'positive' | 'warning' | 'danger' | 'neutral' {
  switch (s) {
    case E.InstalmentStatus.Paid: return 'positive';
    case E.InstalmentStatus.Due:
    case E.InstalmentStatus.PartiallyPaid: return 'warning';
    case E.InstalmentStatus.Overdue: return 'danger';
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

/** Maintenance billing — Bills raised and collected. */
@Component({
  standalone: true,
  selector: 'lib-re-society-billing',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (create)="create()"
    />
  `,
})
export class SocietyBillingComponent implements OnInit {
  private societies = inject(SocietyService);
  private route = inject(ActivatedRoute);

  readonly config: ListConfig<any> = {
    title: 'Maintenance billing',
    subtitle: 'Bills raised and collected.',
    icon: 'receipt_long',
    searchPlaceholder: 'Bill number, unit or resident',
    createLabel: 'Run billing',
    createIcon: 'playlist_add',
    clickable: false,
    emptyTitle: 'No bills raised',
    emptyMessage: 'Run billing for the period.',
    columns: [
      { key: 'billNumber', label: 'Bill', kind: 'strong', width: '140px' },
      { key: 'unitNumber', label: 'Unit', sub: r => r.partyName ?? null },
      { key: 'periodFrom', label: 'Period', kind: 'date', sub: r => 'to ' + (r.periodTo ?? ''), hideBelow: 'md' },
      { key: 'maintenanceAmount', label: 'Maintenance', kind: 'money', align: 'right', hideBelow: 'md' },
      { key: 'utilityAmount', label: 'Utilities', kind: 'money', align: 'right', hideBelow: 'lg' },
      { key: 'totalAmount', label: 'Total', kind: 'money', align: 'right' },
      { key: 'balance', label: 'Outstanding', kind: 'money', align: 'right' },
      { key: 'status', label: 'Status', kind: 'pill', value: r => lbl(E.INSTALMENT_STATUS_LABELS, r.status), tone: r => instalmentTone(r.status) },
    ],
    filters: [
      { key: 'status', label: 'Status', kind: 'select', options: enumOptions(E.INSTALMENT_STATUS_LABELS) },
    ],
    presets: [
      { key: 'unpaid', label: 'Unpaid', apply: { unpaidOnly: true }, tone: 'warning' },
      { key: 'overdue', label: 'Overdue', apply: { status: E.InstalmentStatus.Overdue }, tone: 'danger' },
    ],
  };

  /** Which society this screen is showing. Read from the route the sidebar linked to. */
  protected societyId = '';

  ngOnInit(): void {
    this.societyId = this.route.snapshot.paramMap.get('id') ?? '';
  }

  fetch = (q: ListQueryState) =>
    this.societies.getBills(this.societyId, toListQuery(q), (q.filters['status'] as any));

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
