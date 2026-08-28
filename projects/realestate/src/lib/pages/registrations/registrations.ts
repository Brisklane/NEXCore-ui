import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrokerageService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

function registrationTone(s: E.LeadRegistrationStatus): 'positive' | 'warning' | 'danger' | 'neutral' {
  switch (s) {
    case E.LeadRegistrationStatus.Converted: return 'positive';
    case E.LeadRegistrationStatus.Registered: return 'warning';
    case E.LeadRegistrationStatus.DuplicateRejected:
    case E.LeadRegistrationStatus.Expired: return 'danger';
    default: return 'neutral';
  }
}

/** A countdown: red once it has passed, amber inside a month. */
function daysTone(days: number | undefined | null): 'positive' | 'warning' | 'danger' {
  if (days === undefined || days === null) return 'positive';
  if (days < 0) return 'danger';
  if (days <= 30) return 'warning';
  return 'positive';
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

/** Lead registrations — Buyers claimed by a partner. */
@Component({
  standalone: true,
  selector: 'lib-re-registrations',
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
export class RegistrationsComponent implements OnInit {
  private brokerage = inject(BrokerageService);

  readonly config: ListConfig<any> = {
    title: 'Lead registrations',
    subtitle: 'Buyers claimed by a partner.',
    helpKey: 'brokerage/registrations',
    icon: 'how_to_reg',
    searchPlaceholder: 'Reference, prospect or partner',
    scope: 'project',
    createLabel: 'Register a lead',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'No registrations',
    emptyMessage: 'Partners register the buyers they bring here.',
    columns: [
      { key: 'reference', label: 'Reference', kind: 'strong', width: '140px' },
      { key: 'prospectName', label: 'Prospect', sub: r => r.prospectPhone ?? null },
      { key: 'partnerName', label: 'Registered by', sub: r => r.partnerUserName ?? null },
      { key: 'registeredAt', label: 'Registered', kind: 'date', hideBelow: 'md' },
      { key: 'expiresAt', label: 'Expires', kind: 'date', sub: r => r.isExpiringSoon ? 'expiring soon' : null },
      { key: 'daysRemaining', label: 'Left', kind: 'days', sub: r => 'days', tone: r => daysTone(r.daysRemaining), align: 'right' },
      { key: 'status', label: 'Status', kind: 'pill', value: r => lbl(E.LEAD_REGISTRATION_STATUS_LABELS, r.status), tone: r => registrationTone(r.status) },
      { key: 'conflictsWithPartnerName', label: 'Conflicts with', hideBelow: 'lg' },
    ],
    filters: [
      { key: 'status', label: 'Status', kind: 'select', options: enumOptions(E.LEAD_REGISTRATION_STATUS_LABELS) },
    ],
    presets: [
      { key: 'live', label: 'Live', apply: { status: E.LeadRegistrationStatus.Registered } },
      { key: 'expiring', label: 'Expiring soon', apply: { expiringOnly: true }, tone: 'warning' },
      { key: 'rejected', label: 'Rejected as duplicates', apply: { status: E.LeadRegistrationStatus.DuplicateRejected }, tone: 'danger' },
    ],
    rowActions: [
      { key: 'extend', label: 'Extend', icon: 'more_time' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.brokerage.getRegistrations(toListQuery(q, { projectId: q.scopeId ?? undefined }), undefined, (q.filters['status'] as any));

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
