import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SocietyService } from '../../services/realestate.services';
import * as E from '../../models/realestate.enums';
import { enumOptions } from '../../models/realestate.enums';
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

/** Building control — Alterations residents want to make. */
@Component({
  standalone: true,
  selector: 'lib-re-building-control',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (rowAction)="act($event.action, $any($event.row))"
    />
  `,
})
export class BuildingControlComponent implements OnInit {
  private societies = inject(SocietyService);
  private route = inject(ActivatedRoute);

  readonly config: ListConfig<any> = {
    title: 'Building control',
    subtitle: 'Alterations residents want to make.',
    icon: 'architecture',
    searchPlaceholder: 'Reference, resident or unit',
    clickable: false,
    emptyTitle: 'No applications',
    emptyMessage: 'Residents apply here before altering their unit.',
    columns: [
      { key: 'reference', label: 'Application', kind: 'strong', width: '140px' },
      { key: 'residentName', label: 'Resident', sub: r => r.unitNumber ?? null },
      { key: 'workDescription', label: 'What', hideBelow: 'md' },
      { key: 'submittedOn', label: 'Submitted', kind: 'date' },
      { key: 'feePaid', label: 'Fee paid', kind: 'bool', align: 'center', hideBelow: 'md' },
      { key: 'status', label: 'Status', kind: 'pill', value: r => lbl(E.BUILDING_APPLICATION_STATUS_LABELS, r.status) },
      { key: 'inspectionCount', label: 'Inspections', kind: 'number', align: 'right', hideBelow: 'lg' },
    ],
    filters: [
      { key: 'status', label: 'Status', kind: 'select', options: enumOptions(E.BUILDING_APPLICATION_STATUS_LABELS) },
    ],
    presets: [
      { key: 'pending', label: 'Awaiting a decision', apply: { pendingOnly: true }, tone: 'warning' },
      { key: 'all', label: 'Everything', apply: {  } },
    ],
    rowActions: [
      { key: 'approve', label: 'Approve', icon: 'check', tone: 'accent' },
      { key: 'reject', label: 'Reject', icon: 'close', tone: 'danger' },
    ],
  };

  /** Which society this screen is showing. Read from the route the sidebar linked to. */
  protected societyId = '';

  ngOnInit(): void {
    this.societyId = this.route.snapshot.paramMap.get('id') ?? '';
  }

  fetch = (q: ListQueryState) =>
    this.societies.getBuildingApplications(this.societyId, toListQuery(q), (q.filters['status'] as any));

  act(action: string, row: any): void {
    // Each of these opens the flow that owns it rather than acting inline —
    // a destructive action taken from a list row with no confirmation is a
    // support call waiting to happen.
    void action;
    void row;
  }

}
