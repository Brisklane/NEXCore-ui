import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConstructionService } from '../../services/realestate.services';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Delays — What has held the works up. */
@Component({
  standalone: true,
  selector: 'lib-re-delays',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (create)="create()"
    />
  `,
})
export class DelaysComponent implements OnInit {
  private construction = inject(ConstructionService);

  readonly config: ListConfig<any> = {
    title: 'Delays',
    subtitle: 'What has held the works up.',
    icon: 'timer_off',
    searchPlaceholder: 'Reference or cause',
    scope: 'project',
    createLabel: 'Record a delay',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No delays recorded',
    emptyMessage: 'The programme is running to plan.',
    columns: [
      { key: 'reference', label: 'Event', kind: 'strong', width: '130px' },
      { key: 'cause', label: 'Cause' },
      { key: 'startedOn', label: 'From', kind: 'date', sub: r => r.endedOn ? 'to ' + r.endedOn : 'ongoing' },
      { key: 'delayDays', label: 'Days', kind: 'days', align: 'right' },
      { key: 'isExcusable', label: 'Excusable', kind: 'bool', align: 'center' },
      { key: 'isCompensable', label: 'Compensable', kind: 'bool', align: 'center', hideBelow: 'md' },
      { key: 'costImpact', label: 'Cost', kind: 'money', align: 'right', hideBelow: 'md' },
      { key: 'affectsCriticalPath', label: 'Critical path', kind: 'bool', tone: r => r.affectsCriticalPath ? 'danger' : 'neutral', align: 'center' },
      { key: 'isNotified', label: 'Notified', kind: 'bool', align: 'center', hideBelow: 'lg' },
    ],
    presets: [
      { key: 'open', label: 'Ongoing', apply: { openOnly: true } },
      { key: 'critical', label: 'On the critical path', apply: { criticalOnly: true }, tone: 'danger' },
      { key: 'unnotified', label: 'Not yet notified', apply: { unnotifiedOnly: true }, tone: 'warning' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.construction.getDelays(toListQuery(q), q.scopeId ?? undefined);

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
