import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ConstructionService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

function projectTone(s: E.ProjectStatus): 'positive' | 'warning' | 'neutral' {
  switch (s) {
    case E.ProjectStatus.Launched:
    case E.ProjectStatus.UnderConstruction: return 'positive';
    case E.ProjectStatus.OnHold: return 'warning';
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

/** Construction — Sites under construction. */
@Component({
  standalone: true,
  selector: 'lib-re-construction',
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
export class ConstructionComponent implements OnInit {
  private construction = inject(ConstructionService);
  private router = inject(Router);

  readonly config: ListConfig<any> = {
    title: 'Construction',
    subtitle: 'Sites under construction.',
    helpKey: 'construction',
    icon: 'foundation',
    searchPlaceholder: 'Project name',
    createLabel: 'New construction project',
    createIcon: 'add',
    emptyTitle: 'Nothing under construction',
    emptyMessage: 'Create a project to plan and measure the works.',
    columns: [
      { key: 'name', label: 'Project', kind: 'strong', sub: r => r.projectName ?? null },
      { key: 'status', label: 'Status', kind: 'pill', value: r => lbl(E.PROJECT_STATUS_LABELS, r.status), tone: r => projectTone(r.status) },
      { key: 'revisedContractValue', label: 'Contract', kind: 'money', align: 'right' },
      { key: 'actualCost', label: 'Spent', kind: 'money', align: 'right' },
      { key: 'forecastFinalCost', label: 'Forecast', kind: 'money', align: 'right', hideBelow: 'md' },
      { key: 'physicalProgressPercent', label: 'Built', kind: 'progress', align: 'right' },
      { key: 'financialProgressPercent', label: 'Spent', kind: 'progress', align: 'right', hideBelow: 'md' },
      { key: 'isAtRisk', label: 'At risk', kind: 'bool', tone: r => r.isAtRisk ? 'danger' : 'neutral', align: 'center' },
    ],
    filters: [
      { key: 'status', label: 'Status', kind: 'select', options: enumOptions(E.PROJECT_STATUS_LABELS) },
    ],
    presets: [
      { key: 'live', label: 'On site', apply: { status: E.ProjectStatus.UnderConstruction } },
      { key: 'risk', label: 'At risk', apply: { atRiskOnly: true }, tone: 'danger' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.construction.getProjects(toListQuery(q), (q.filters['status'] as any));

  open(row: any): void {
    void this.router.navigateByUrl(`/realestate/construction/${row.id}`);
  }

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
