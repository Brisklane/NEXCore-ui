import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CrmService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, type ListConfig, type ListQueryState,
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

/** Enquiries — Every lead, and how long it has waited. */
@Component({
  standalone: true,
  selector: 'lib-re-enquiries',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (rowClick)="open($any($event))"
      (rowAction)="act($event.action, $any($event.row))"
      (create)="create()"
    />
  `,
})
export class EnquiriesComponent implements OnInit {
  private crm = inject(CrmService);
  private router = inject(Router);

  readonly config: ListConfig<any> = {
    title: 'Enquiries',
    subtitle: 'Every lead, and how long it has waited.',
    helpKey: 'enquiries',
    icon: 'contact_support',
    searchPlaceholder: 'Reference, name, phone or email',
    scope: 'office',
    createLabel: 'Log an enquiry',
    createIcon: 'add',
    emptyTitle: 'No enquiries',
    emptyMessage: 'They arrive from portals, the website and the telephone.',
    columns: [
      { key: 'reference', label: 'Enquiry', kind: 'strong', width: '130px' },
      { key: 'contactName', label: 'Contact', sub: r => r.contactPhone ?? null },
      { key: 'interestSummary', label: 'Wants', hideBelow: 'md' },
      { key: 'channel', label: 'From', kind: 'pill', value: r => lbl(E.ENQUIRY_CHANNEL_LABELS, r.channel), hideBelow: 'md' },
      { key: 'assignedAgentName', label: 'With', hideBelow: 'lg' },
      { key: 'minutesWaiting', label: 'Waiting', kind: 'days', sub: r => r.slaBreached ? 'minutes — breached' : 'minutes', tone: r => r.slaBreached ? 'danger' : 'neutral', align: 'right' },
      { key: 'score', label: 'Score', kind: 'number', align: 'right', hideBelow: 'md' },
      { key: 'stage', label: 'Stage', kind: 'pill', value: r => lbl(E.ENQUIRY_STAGE_LABELS, r.stage) },
    ],
    filters: [
      { key: 'stage', label: 'Stage', kind: 'select', options: enumOptions(E.ENQUIRY_STAGE_LABELS) },
      { key: 'channel', label: 'Channel', kind: 'select', options: enumOptions(E.ENQUIRY_CHANNEL_LABELS) },
      { key: 'unansweredOnly', label: 'Unanswered only', kind: 'toggle' },
    ],
    presets: [
      { key: 'unanswered', label: 'Not yet answered', apply: { unansweredOnly: true }, tone: 'danger' },
      { key: 'breached', label: 'Past the promise', apply: { breachedOnly: true }, tone: 'danger' },
      { key: 'hot', label: 'Hot', apply: { hotOnly: true } },
      { key: 'all', label: 'Everything', apply: {  } },
    ],
    rowActions: [
      { key: 'assign', label: 'Assign', icon: 'person_add', tone: 'accent' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.crm.searchEnquiries({ page: q.page, pageSize: q.pageSize, search: q.search, officeId: q.scopeId ?? undefined, stages: q.filters['stage'] ? [(q.filters['stage'] as any)] : undefined, channels: q.filters['channel'] ? [(q.filters['channel'] as any)] : undefined, unassignedOnly: (q.filters['unansweredOnly'] as any) });

  open(row: any): void {
    void this.router.navigateByUrl(`/realestate/enquiries/${row.id}`);
  }

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
