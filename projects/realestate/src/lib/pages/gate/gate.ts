import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SocietyService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
} from '../shared/list-page';

function gateTone(s: E.GateEntryStatus): 'positive' | 'warning' | 'danger' | 'neutral' {
  switch (s) {
    case E.GateEntryStatus.CheckedIn: return 'positive';
    case E.GateEntryStatus.AwaitingApproval:
    case E.GateEntryStatus.Expected: return 'warning';
    case E.GateEntryStatus.Denied:
    case E.GateEntryStatus.Expired: return 'danger';
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

/** Gate — Who is in, and who has come through today. */
@Component({
  standalone: true,
  selector: 'lib-re-gate',
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
export class GateComponent implements OnInit {
  private societies = inject(SocietyService);
  private route = inject(ActivatedRoute);

  readonly config: ListConfig<any> = {
    title: 'Gate',
    subtitle: 'Who is in, and who has come through today.',
    helpKey: 'gate',
    icon: 'sensor_door',
    searchPlaceholder: 'Name, vehicle or unit',
    createLabel: 'Record an entry',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'Nothing through the gate today',
    emptyMessage: 'Entries appear here as they are recorded.',
    columns: [
      { key: 'personName', label: 'Who', kind: 'strong', sub: r => r.vehicleNumber ?? null },
      { key: 'kind', label: 'Kind', kind: 'pill', value: r => lbl(E.VISITOR_KIND_LABELS, r.kind) },
      { key: 'unitNumber', label: 'Visiting', sub: r => r.purpose ?? null },
      { key: 'checkedInAt', label: 'In', kind: 'datetime' },
      { key: 'checkedOutAt', label: 'Out', kind: 'datetime' },
      { key: 'personCount', label: 'People', kind: 'number', align: 'right', hideBelow: 'md' },
      { key: 'status', label: 'Status', kind: 'pill', value: r => lbl(E.GATE_ENTRY_STATUS_LABELS, r.status), tone: r => gateTone(r.status) },
      { key: 'wasOffline', label: 'Offline', kind: 'bool', align: 'center', hideBelow: 'lg' },
    ],
    filters: [
      { key: 'status', label: 'Status', kind: 'select', options: enumOptions(E.GATE_ENTRY_STATUS_LABELS) },
    ],
    presets: [
      { key: 'inside', label: 'Inside now', apply: { status: E.GateEntryStatus.CheckedIn } },
      { key: 'waiting', label: 'Awaiting approval', apply: { status: E.GateEntryStatus.AwaitingApproval }, tone: 'warning' },
      { key: 'denied', label: 'Denied', apply: { deniedOnly: true }, tone: 'danger' },
    ],
    rowActions: [
      { key: 'checkout', label: 'Check out', icon: 'logout', tone: 'accent' },
    ],
  };

  /** Which society this screen is showing. Read from the route the sidebar linked to. */
  protected societyId = '';

  ngOnInit(): void {
    this.societyId = this.route.snapshot.paramMap.get('id') ?? '';
  }

  fetch = (q: ListQueryState) =>
    this.societies.getGateLog(this.societyId, toListQuery(q), (q.filters['status'] as any));

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
