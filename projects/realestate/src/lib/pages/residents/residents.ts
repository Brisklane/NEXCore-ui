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

/** Residents — Who lives here. */
@Component({
  standalone: true,
  selector: 'lib-re-residents',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
      (create)="create()"
    />
  `,
})
export class ResidentsComponent implements OnInit {
  private societies = inject(SocietyService);
  private route = inject(ActivatedRoute);

  readonly config: ListConfig<any> = {
    title: 'Residents',
    subtitle: 'Who lives here.',
    icon: 'groups',
    searchPlaceholder: 'Name, phone or unit',
    createLabel: 'Add a resident',
    createIcon: 'person_add',
    clickable: false,
    emptyTitle: 'No residents',
    emptyMessage: 'Add them so the gate, billing and complaints all know who is who.',
    columns: [
      { key: 'name', label: 'Resident', kind: 'strong', sub: r => r.phone ?? null },
      { key: 'unitNumber', label: 'Unit', sub: r => r.blockName ?? null },
      { key: 'kind', label: 'Kind', kind: 'pill', value: r => lbl(E.RESIDENT_KIND_LABELS, r.kind) },
      { key: 'movedInOn', label: 'Moved in', kind: 'date', hideBelow: 'md' },
      { key: 'outstandingAmount', label: 'Outstanding', kind: 'money', tone: r => r.outstandingAmount ? 'danger' : 'neutral', align: 'right' },
      { key: 'vehicleCount', label: 'Vehicles', kind: 'number', align: 'right', hideBelow: 'lg' },
      { key: 'isPrimary', label: 'Primary', kind: 'bool', align: 'center', hideBelow: 'md' },
    ],
    filters: [
      { key: 'kind', label: 'Kind', kind: 'select', options: enumOptions(E.RESIDENT_KIND_LABELS) },
      { key: 'defaultersOnly', label: 'In arrears only', kind: 'toggle' },
    ],
    presets: [
      { key: 'all', label: 'Everyone', apply: {  } },
      { key: 'arrears', label: 'In arrears', apply: { defaultersOnly: true }, tone: 'danger' },
    ],
  };

  /** Which society this screen is showing. Read from the route the sidebar linked to. */
  protected societyId = '';

  ngOnInit(): void {
    this.societyId = this.route.snapshot.paramMap.get('id') ?? '';
  }

  fetch = (q: ListQueryState) =>
    this.societies.getResidents(this.societyId, toListQuery(q), (q.filters['kind'] as any), (q.filters['defaultersOnly'] as any));

  create(): void {
    // Opened by the parent screen or a drawer supplied by the host page.
  }
}
