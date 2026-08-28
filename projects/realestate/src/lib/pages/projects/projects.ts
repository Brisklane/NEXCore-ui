import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProjectService } from '../../services/realestate.services';
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

/** Projects — Schemes under development. */
@Component({
  standalone: true,
  selector: 'lib-re-projects',
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
export class ProjectsComponent implements OnInit {
  private projects = inject(ProjectService);
  private router = inject(Router);

  readonly config: ListConfig<any> = {
    title: 'Projects',
    subtitle: 'Schemes under development.',
    helpKey: 'projects',
    icon: 'apartment',
    searchPlaceholder: 'Project name or code',
    createLabel: 'New project',
    createIcon: 'add_business',
    emptyTitle: 'No projects yet',
    emptyMessage: 'Create a project to lay out its blocks, units and prices.',
    columns: [
      { key: 'name', label: 'Project', kind: 'strong', sub: r => r.city ?? r.areaName ?? null },
      { key: 'kind', label: 'Kind', kind: 'pill', value: r => lbl(E.PROJECT_KIND_LABELS, r.kind), hideBelow: 'md' },
      { key: 'status', label: 'Status', kind: 'pill', value: r => lbl(E.PROJECT_STATUS_LABELS, r.status), tone: r => projectTone(r.status) },
      { key: 'totalUnits', label: 'Units', kind: 'number', align: 'right' },
      { key: 'absorptionPercent', label: 'Absorbed', kind: 'progress', align: 'right' },
      { key: 'totalCollected', label: 'Collected', kind: 'money', align: 'right' },
      { key: 'physicalProgressPercent', label: 'Built', kind: 'progress', align: 'right', hideBelow: 'md' },
      { key: 'slipDays', label: 'Slip', kind: 'days', sub: r => r.slipDays ? 'days late' : null, align: 'right', hideBelow: 'lg' },
    ],
    filters: [
      { key: 'status', label: 'Status', kind: 'select', options: enumOptions(E.PROJECT_STATUS_LABELS) },
    ],
    presets: [
      { key: 'all', label: 'Everything', apply: {  } },
      { key: 'selling', label: 'Selling now', apply: { status: E.ProjectStatus.Launched } },
      { key: 'building', label: 'Under construction', apply: { status: E.ProjectStatus.UnderConstruction } },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.projects.getAll(toListQuery(q));

  open(row: any): void {
    void this.router.navigateByUrl(`/realestate/projects/${row.id}`);
  }

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
