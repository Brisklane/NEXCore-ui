import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FacilityService } from '../../services/realestate.services';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Planned maintenance — What is scheduled and what is overdue. */
@Component({
  standalone: true,
  selector: 'lib-re-ppm',
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
export class PpmComponent implements OnInit {
  private facility = inject(FacilityService);

  readonly config: ListConfig<any> = {
    title: 'Planned maintenance',
    subtitle: 'What is scheduled and what is overdue.',
    icon: 'event_repeat',
    searchPlaceholder: 'Schedule, asset or property',
    createLabel: 'New schedule',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'Nothing scheduled',
    emptyMessage: 'Set up a schedule so servicing does not depend on memory.',
    columns: [
      { key: 'name', label: 'Schedule', kind: 'strong', sub: r => r.addressOneLine ?? null },
      { key: 'assetName', label: 'Asset', hideBelow: 'md' },
      { key: 'frequency', label: 'Every', kind: 'pill' },
      { key: 'lastDoneOn', label: 'Last done', kind: 'date', hideBelow: 'md' },
      { key: 'nextDueOn', label: 'Next due', kind: 'date', tone: r => r.isOverdue ? 'danger' : 'neutral' },
      { key: 'isStatutory', label: 'Statutory', kind: 'bool', align: 'center' },
      { key: 'contractorName', label: 'Contractor', hideBelow: 'lg' },
    ],
    filters: [
      { key: 'overdueOnly', label: 'Overdue only', kind: 'toggle' },
    ],
    presets: [
      { key: 'due', label: 'Due', apply: {  } },
      { key: 'overdue', label: 'Overdue', apply: { overdueOnly: true }, tone: 'danger' },
      { key: 'statutory', label: 'Statutory', apply: { statutoryOnly: true }, tone: 'warning' },
    ],
    rowActions: [
      { key: 'generate', label: 'Generate tasks', icon: 'playlist_add' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.facility.getPpmSchedules(toListQuery(q), undefined, (q.filters['overdueOnly'] as any));

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
