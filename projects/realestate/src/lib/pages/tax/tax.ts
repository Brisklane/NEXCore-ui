import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceService } from '../../services/realestate.services';
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

/** Withholding — Tax deducted at source. */
@Component({
  standalone: true,
  selector: 'lib-re-tax',
  imports: [CommonModule, ListPageComponent],
  template: `
    <re-list-page
      [config]="config"
      [fetch]="fetch"
    />
  `,
})
export class TaxComponent implements OnInit {
  private finance = inject(FinanceService);

  readonly config: ListConfig<any> = {
    title: 'Withholding',
    subtitle: 'Tax deducted at source.',
    icon: 'landmark',
    searchPlaceholder: 'Reference or tax number',
    clickable: false,
    emptyTitle: 'Nothing withheld',
    emptyMessage: 'It accrues as commissions, rents and contractor payments go out.',
    columns: [
      { key: 'reference', label: 'Reference', kind: 'strong', width: '140px' },
      { key: 'partyName', label: 'Deducted from', sub: r => r.taxNumber ?? null },
      { key: 'kind', label: 'Kind', kind: 'pill', value: r => lbl(E.WITHHOLDING_KIND_LABELS, r.kind) },
      { key: 'deductedOn', label: 'Deducted', kind: 'date' },
      { key: 'grossAmount', label: 'Gross', kind: 'money', align: 'right', hideBelow: 'md' },
      { key: 'rate', label: 'Rate', kind: 'percent', align: 'right', hideBelow: 'md' },
      { key: 'withheldAmount', label: 'Withheld', kind: 'money', align: 'right' },
      { key: 'isDeposited', label: 'Deposited', kind: 'bool', tone: r => r.isDeposited ? 'positive' : 'danger', align: 'center' },
      { key: 'certificateIssued', label: 'Certificate', kind: 'bool', align: 'center', hideBelow: 'lg' },
    ],
    filters: [
      { key: 'kind', label: 'Kind', kind: 'select', options: enumOptions(E.WITHHOLDING_KIND_LABELS) },
      { key: 'undepositedOnly', label: 'Not yet deposited', kind: 'toggle' },
    ],
    presets: [
      { key: 'undeposited', label: 'Still to deposit', apply: { undepositedOnly: true }, tone: 'danger' },
      { key: 'all', label: 'Everything', apply: {  } },
    ],
  };

  ngOnInit(): void { /* the list starts itself from its scope picker */ }

  fetch = (q: ListQueryState) =>
    this.finance.getWithholding(toListQuery(q), (q.filters['kind'] as any), (q.filters['undepositedOnly'] as any));

}
