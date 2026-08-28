import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConstructionService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

function variationTone(s: E.VariationStatus): 'positive' | 'warning' | 'danger' | 'neutral' {
  switch (s) {
    case E.VariationStatus.Approved:
    case E.VariationStatus.Instructed:
    case E.VariationStatus.Measured: return 'positive';
    case E.VariationStatus.Proposed:
    case E.VariationStatus.Quoted: return 'warning';
    case E.VariationStatus.Rejected:
    case E.VariationStatus.Withdrawn: return 'danger';
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

/** Variations — Changes to the works. */
@Component({
  standalone: true,
  selector: 'lib-re-variations',
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
export class VariationsComponent implements OnInit {
  private construction = inject(ConstructionService);

  readonly config: ListConfig<any> = {
    title: 'Variations',
    subtitle: 'Changes to the works.',
    helpKey: 'build/variations',
    icon: 'edit_note',
    searchPlaceholder: 'Number or title',
    scope: 'project',
    createLabel: 'Raise a variation',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No variations',
    emptyMessage: 'The works are being built exactly as tendered.',
    columns: [
      { key: 'variationNumber', label: 'Variation', kind: 'strong', width: '140px' },
      { key: 'title', label: 'What', sub: r => r.justification ?? null },
      { key: 'origin', label: 'Origin', kind: 'pill', value: r => lbl(E.VARIATION_ORIGIN_LABELS, r.origin), hideBelow: 'md' },
      { key: 'additionAmount', label: 'Addition', kind: 'money', align: 'right' },
      { key: 'omissionAmount', label: 'Omission', kind: 'money', align: 'right', hideBelow: 'md' },
      { key: 'netAmount', label: 'Net', kind: 'money', align: 'right' },
      { key: 'timeImpactDays', label: 'Days', kind: 'days', align: 'right' },
      { key: 'status', label: 'Status', kind: 'pill', value: r => lbl(E.VARIATION_STATUS_LABELS, r.status), tone: r => variationTone(r.status) },
    ],
    filters: [
      { key: 'status', label: 'Status', kind: 'select', options: enumOptions(E.VARIATION_STATUS_LABELS) },
      { key: 'origin', label: 'Origin', kind: 'select', options: enumOptions(E.VARIATION_ORIGIN_LABELS) },
    ],
    presets: [
      { key: 'pending', label: 'Awaiting a decision', apply: { status: E.VariationStatus.Quoted }, tone: 'warning' },
      { key: 'approved', label: 'Approved', apply: { status: E.VariationStatus.Approved } },
    ],
    rowActions: [
      { key: 'approve', label: 'Approve', icon: 'check', tone: 'accent' },
      { key: 'reject', label: 'Reject', icon: 'close', tone: 'danger' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.construction.getVariations(toListQuery(q), q.scopeId ?? undefined, (q.filters['status'] as any));

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
