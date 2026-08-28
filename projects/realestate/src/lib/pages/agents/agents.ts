import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/realestate.services';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

/** Agents — Who sells and manages. */
@Component({
  standalone: true,
  selector: 'lib-re-agents',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (create)="create()"
    />
  `,
})
export class AgentsComponent implements OnInit {
  private admin = inject(AdminService);

  readonly config: ListConfig<any> = {
    title: 'Agents',
    subtitle: 'Who sells and manages.',
    icon: 'badge',
    searchPlaceholder: 'Name, phone or email',
    createLabel: 'Add an agent',
    createIcon: 'person_add',
    clickable: false,
    emptyTitle: 'No agents',
    emptyMessage: 'Add one so leads have somebody to route to.',
    columns: [
      { key: 'displayName', label: 'Agent', kind: 'strong', sub: r => r.jobTitle ?? null },
      { key: 'phone', label: 'Contact', sub: r => r.email ?? null },
      { key: 'officeName', label: 'Office', sub: r => r.teamName ?? null, hideBelow: 'md' },
      { key: 'openLeadCount', label: 'Open leads', kind: 'number', align: 'right' },
      { key: 'acceptsNewLeads', label: 'Taking leads', kind: 'bool', align: 'center' },
      { key: 'isOnLeave', label: 'On leave', kind: 'bool', align: 'center', hideBelow: 'md' },
      { key: 'licenceExpiring', label: 'Licence expiring', kind: 'bool', tone: r => r.licenceExpiring ? 'danger' : 'neutral', align: 'center', hideBelow: 'lg' },
    ],
    presets: [
      { key: 'active', label: 'Active', apply: {  } },
      { key: 'leave', label: 'On leave', apply: { onLeaveOnly: true }, tone: 'warning' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.admin.getAgents(toListQuery(q));

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
