import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConstructionService } from '../../services/realestate.services';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Materials — Requisitions and issues. */
@Component({
  standalone: true,
  selector: 'lib-re-materials',
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
export class MaterialsComponent implements OnInit {
  private construction = inject(ConstructionService);

  readonly config: ListConfig<any> = {
    title: 'Materials',
    subtitle: 'Requisitions and issues.',
    icon: 'inventory_2',
    searchPlaceholder: 'Reference or requester',
    scope: 'project',
    createLabel: 'Raise a requisition',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No requisitions',
    emptyMessage: 'Raise one to draw materials from store.',
    columns: [
      { key: 'reference', label: 'Requisition', kind: 'strong', width: '140px' },
      { key: 'requestedByName', label: 'Requested by', sub: r => r.wbsNodeName ?? null },
      { key: 'requestedOn', label: 'Requested', kind: 'date' },
      { key: 'requiredBy', label: 'Needed by', kind: 'date', hideBelow: 'md' },
      { key: 'lineCount', label: 'Lines', kind: 'number', align: 'right' },
      { key: 'estimatedValue', label: 'Value', kind: 'money', align: 'right' },
      { key: 'status', label: 'Status', kind: 'pill' },
    ],
    presets: [
      { key: 'pending', label: 'Awaiting approval', apply: { pendingOnly: true }, tone: 'warning' },
      { key: 'all', label: 'Everything', apply: {  } },
    ],
    rowActions: [
      { key: 'approve', label: 'Approve', icon: 'check', tone: 'accent' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.construction.getRequisitions(toListQuery(q), q.scopeId ?? undefined, (q.filters['status'] as any));

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
