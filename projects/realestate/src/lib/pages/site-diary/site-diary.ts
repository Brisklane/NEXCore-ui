import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConstructionService } from '../../services/realestate.services';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Site diary — Labour on site, day by day. */
@Component({
  standalone: true,
  selector: 'lib-re-site-diary',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (create)="create()"
    />
  `,
})
export class SiteDiaryComponent implements OnInit {
  private construction = inject(ConstructionService);

  readonly config: ListConfig<any> = {
    title: 'Site diary',
    subtitle: 'Labour on site, day by day.',
    icon: 'today',
    scope: 'project',
    createLabel: 'Record a day',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No diary entries',
    emptyMessage: 'Recording labour daily is what makes a delay claim provable later.',
    columns: [
      { key: 'recordDate', label: 'Date', kind: 'date' },
      { key: 'trade', label: 'Trade', kind: 'pill' },
      { key: 'contractorName', label: 'Contractor', hideBelow: 'md' },
      { key: 'headcount', label: 'On site', kind: 'number', align: 'right' },
      { key: 'hoursWorked', label: 'Hours', kind: 'number', align: 'right' },
      { key: 'weather', label: 'Weather', hideBelow: 'md' },
      { key: 'workDone', label: 'What was done', hideBelow: 'lg' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.construction.getLabour(toListQuery(q), q.scopeId ?? undefined);

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
