/** Option for app-select dropdown */
export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
}

/** Column definition for app-data-table */
export interface TableColumn {
  /** Property key on the row object; supports dot notation (e.g. "customer.name") */
  key: string;
  label: string;
  type?: 'text' | 'badge' | 'date' | 'number' | 'currency';
  align?: 'left' | 'center' | 'right';
  width?: string;
  /** Override badge CSS class — string or function returning a class per row */
  badgeClass?: string | ((val: any, row: any) => string);
  /** Custom cell formatter — overrides default type formatting */
  format?: (val: any, row: any) => string;
  /** When true the column header is clickable to sort. Emits (sortChange). */
  sortable?: boolean;
  /** Sort key sent to the consumer (defaults to `key`). Use when the sort field differs from the display key. */
  sortKey?: string;
}

/** Action button shown in the actions column of app-data-table */
export interface TableAction {
  label: string;
  /** Emoji or short text used as button content */
  icon?: string;
  /** Identifier emitted via rowAction output */
  eventName: string;
  variant?: 'default' | 'danger' | 'primary';
  /** Optional per-row visibility predicate; when omitted the action always shows. */
  visible?: (row: any) => boolean;
}

/** Emitted by app-data-table when any action button is clicked */
export interface RowActionEvent<T = any> {
  eventName: string;
  row: T;
}
