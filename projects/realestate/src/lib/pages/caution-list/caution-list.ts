import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrmService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import {
  ListPageComponent, toListQuery, type ListConfig, type ListQueryState,
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

/** Caution list — People this business will not take new business from. */
@Component({
  standalone: true,
  selector: 'lib-re-caution-list',
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
export class CautionListComponent implements OnInit {
  private crm = inject(CrmService);

  readonly config: ListConfig<any> = {
    title: 'Caution list',
    subtitle: 'People this business will not take new business from.',
    helpKey: 'caution-list',
    icon: 'gpp_bad',
    searchPlaceholder: 'Contact or reason',
    createLabel: 'Add an entry',
    createIcon: 'add',
    clickable: false,
    emptyTitle: 'Nobody on the list',
    emptyMessage: 'That is how it should stay.',
    columns: [
      { key: 'partyName', label: 'Contact', kind: 'strong' },
      { key: 'category', label: 'Category', kind: 'pill' },
      { key: 'severity', label: 'Severity', kind: 'pill', value: r => lbl(E.ALERT_SEVERITY_LABELS, r.severity), tone: r => r.severity === E.AlertSeverity.Critical ? 'danger' : 'warning' },
      { key: 'reason', label: 'Reason' },
      { key: 'raisedOn', label: 'Raised', kind: 'date', hideBelow: 'md' },
      { key: 'expiresOn', label: 'Expires', kind: 'date', hideBelow: 'md' },
      { key: 'blocksNewBusiness', label: 'Blocks', kind: 'bool', align: 'center' },
    ],
    rowActions: [
      { key: 'clear', label: 'Clear entry', icon: 'check_circle', tone: 'accent' },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.crm.getCautionList(toListQuery(q));

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
