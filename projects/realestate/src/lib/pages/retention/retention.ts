import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConstructionService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** A countdown: red once it has passed, amber inside a month. */
function daysTone(days: number | undefined | null): 'positive' | 'warning' | 'danger' {
  if (days === undefined || days === null) return 'positive';
  if (days < 0) return 'danger';
  if (days <= 30) return 'warning';
  return 'positive';
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

/** Retention — Held, released and due for release. */
@Component({
  standalone: true,
  selector: 'lib-re-retention',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
    />
  `,
})
export class RetentionComponent implements OnInit {
  private construction = inject(ConstructionService);

  readonly config: ListConfig<any> = {
    title: 'Retention',
    subtitle: 'Held, released and due for release.',
    icon: 'lock',
    scope: 'project',
    clickable: false,
    emptyTitle: 'No retention held',
    emptyMessage: 'It accrues as certificates are issued.',
    columns: [
      { key: 'entryDate', label: 'Date', kind: 'date' },
      { key: 'partyName', label: 'Party', sub: r => r.subcontractReference ?? null },
      { key: 'movement', label: 'Movement', kind: 'pill', value: r => lbl(E.RETENTION_MOVEMENT_LABELS, r.movement) },
      { key: 'amount', label: 'Amount', kind: 'money', align: 'right' },
      { key: 'runningBalance', label: 'Balance', kind: 'money', align: 'right' },
      { key: 'dueForReleaseOn', label: 'Due for release', kind: 'date', tone: r => daysTone(r.daysToRelease) },
      { key: 'note', label: 'Note', hideBelow: 'lg' },
    ],
    filters: [
      { key: 'dueForReleaseOnly', label: 'Due for release', kind: 'toggle' },
    ],
    presets: [
      { key: 'all', label: 'Everything', apply: {  } },
      { key: 'due', label: 'Due for release', apply: { dueForReleaseOnly: true }, tone: 'warning' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.construction.getRetention(toListQuery(q), undefined, (q.filters['dueForReleaseOnly'] as any) ?? false);

}
