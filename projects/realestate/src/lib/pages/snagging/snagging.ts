import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ExitService } from '../../services/realestate.services';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Snagging — Defects found at handover. */
@Component({
  standalone: true,
  selector: 'lib-re-snagging',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (rowClick)="open($any($event))"
      (create)="create()"
    />
  `,
})
export class SnaggingComponent implements OnInit {
  private exit = inject(ExitService);
  private router = inject(Router);

  readonly config: ListConfig<any> = {
    title: 'Snagging',
    subtitle: 'Defects found at handover.',
    helpKey: 'exit/snagging',
    icon: 'handyman',
    searchPlaceholder: 'Reference or unit',
    scope: 'project',
    createLabel: 'New inspection',
    createIcon: 'add',
    emptyTitle: 'No inspections',
    emptyMessage: 'Book one before offering possession.',
    columns: [
      { key: 'reference', label: 'Inspection', kind: 'strong', width: '140px' },
      { key: 'unitNumber', label: 'Unit', sub: r => r.blockName ?? null },
      { key: 'kind', label: 'Kind', kind: 'pill' },
      { key: 'inspectedOn', label: 'Inspected', kind: 'date' },
      { key: 'inspectedByName', label: 'By', hideBelow: 'lg' },
      { key: 'criticalCount', label: 'Critical', kind: 'number', tone: () => 'danger', align: 'right' },
      { key: 'openCount', label: 'Open', kind: 'number', align: 'right' },
      { key: 'totalCount', label: 'Total', kind: 'number', align: 'right', hideBelow: 'md' },
    ],
    filters: [
      { key: 'openOnly', label: 'Open only', kind: 'toggle' },
    ],
    presets: [
      { key: 'open', label: 'Open', apply: { openOnly: true } },
      { key: 'critical', label: 'Blocking possession', apply: { criticalOnly: true }, tone: 'danger' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.exit.getInspections(toListQuery(q), q.scopeId ?? undefined, (q.filters['openOnly'] as any) ?? true);

  open(row: any): void {
    void this.router.navigateByUrl(`/realestate/exit/snagging/${row.id}`);
  }

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
