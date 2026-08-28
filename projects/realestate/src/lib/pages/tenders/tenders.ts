import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConstructionService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

function tenderTone(s: E.TenderStatus): 'positive' | 'warning' | 'danger' | 'neutral' {
  switch (s) {
    case E.TenderStatus.Awarded: return 'positive';
    case E.TenderStatus.Cancelled: return 'danger';
    case E.TenderStatus.BidsOpen:
    case E.TenderStatus.UnderEvaluation:
    case E.TenderStatus.Negotiating: return 'warning';
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

/** Tenders — Packages out to bid. */
@Component({
  standalone: true,
  selector: 'lib-re-tenders',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (rowAction)="act($event.action, $any($event.row))"
      (create)="create()"
    />
  `,
})
export class TendersComponent implements OnInit {
  private construction = inject(ConstructionService);

  readonly config: ListConfig<any> = {
    title: 'Tenders',
    subtitle: 'Packages out to bid.',
    icon: 'gavel',
    searchPlaceholder: 'Reference or package',
    createLabel: 'New tender',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No tenders',
    emptyMessage: 'Put a package out to bid.',
    columns: [
      { key: 'reference', label: 'Tender', kind: 'strong', width: '140px' },
      { key: 'title', label: 'Package', sub: r => r.projectName ?? null },
      { key: 'status', label: 'Status', kind: 'pill', value: r => lbl(E.TENDER_STATUS_LABELS, r.status), tone: r => tenderTone(r.status) },
      { key: 'estimatedValue', label: 'Estimate', kind: 'money', align: 'right' },
      { key: 'bidderCount', label: 'Bidders', kind: 'number', align: 'right' },
      { key: 'bidCount', label: 'Bids in', kind: 'number', align: 'right', hideBelow: 'md' },
      { key: 'closesOn', label: 'Closes', kind: 'date' },
      { key: 'awardedAmount', label: 'Awarded', kind: 'money', align: 'right', hideBelow: 'lg' },
    ],
    filters: [
      { key: 'status', label: 'Status', kind: 'select', options: enumOptions(E.TENDER_STATUS_LABELS) },
    ],
    presets: [
      { key: 'open', label: 'Open', apply: {  } },
      { key: 'evaluating', label: 'Evaluating', apply: { status: E.TenderStatus.UnderEvaluation }, tone: 'warning' },
    ],
    rowActions: [
      { key: 'compare', label: 'Compare bids', icon: 'compare_arrows' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.construction.getTenders(toListQuery(q), (q.filters['status'] as any));

  act(action: string, row: any): void {
    // Each of these opens the flow that owns it rather than acting inline —
    // a destructive action taken from a list row with no confirmation is a
    // support call waiting to happen.
    void action;
    void row;
  }

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
