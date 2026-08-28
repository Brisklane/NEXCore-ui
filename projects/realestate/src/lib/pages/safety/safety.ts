import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConstructionService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

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

/** Safety — Incidents on site. */
@Component({
  standalone: true,
  selector: 'lib-re-safety',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (create)="create()"
    />
  `,
})
export class SafetyComponent implements OnInit {
  private construction = inject(ConstructionService);

  readonly config: ListConfig<any> = {
    title: 'Safety',
    subtitle: 'Incidents on site.',
    icon: 'health_and_safety',
    searchPlaceholder: 'Reference or person',
    scope: 'project',
    createLabel: 'Record an incident',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No incidents recorded',
    emptyMessage: 'Long may that continue.',
    columns: [
      { key: 'reference', label: 'Incident', kind: 'strong', width: '140px' },
      { key: 'occurredAt', label: 'When', kind: 'datetime' },
      { key: 'severity', label: 'Severity', kind: 'pill', value: r => lbl(E.SAFETY_SEVERITY_LABELS, r.severity), tone: r => r.severity === E.SafetySeverity.Fatal ? 'danger' : 'warning' },
      { key: 'kind', label: 'Kind', kind: 'pill', hideBelow: 'md' },
      { key: 'personName', label: 'Who', sub: r => r.contractorName ?? null },
      { key: 'lostTimeDays', label: 'Lost days', kind: 'days', align: 'right', hideBelow: 'md' },
      { key: 'isReportable', label: 'Reportable', kind: 'bool', align: 'center' },
      { key: 'isClosed', label: 'Closed', kind: 'bool', align: 'center', hideBelow: 'lg' },
    ],
    filters: [
      { key: 'severity', label: 'Severity', kind: 'select', options: enumOptions(E.SAFETY_SEVERITY_LABELS) },
    ],
    presets: [
      { key: 'open', label: 'Open', apply: { openOnly: true } },
      { key: 'reportable', label: 'Reportable', apply: { reportableOnly: true }, tone: 'danger' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.construction.getSafetyIncidents(toListQuery(q), q.scopeId ?? undefined);

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
