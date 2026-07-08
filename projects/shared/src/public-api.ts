/*
 * Public API Surface of @nexcore/shared
 * Generic, reusable UI components and models used across all feature modules.
 */

/* ── Configuration ── */
export type { AppEnvironment } from './lib/config/app-environment.interface';

/* ── Models ── */
export * from './lib/models/ui.models';

/* ── Utilities ── */
export { RowHighlighter } from './lib/utils/row-highlighter';

/* ── Form controls ── */
export { AppInputComponent    } from './lib/components/ui/app-input.component';
export { AppSelectComponent   } from './lib/components/ui/app-select.component';
export { AppTextareaComponent } from './lib/components/ui/app-textarea.component';

/* ── Layout / display ── */
export { AppPageHeaderComponent } from './lib/components/ui/app-page-header.component';
export { AppFormPanelComponent  } from './lib/components/ui/app-form-panel.component';
export { AppAlertComponent      } from './lib/components/ui/app-alert.component';
export { AppBadgeComponent      } from './lib/components/ui/app-badge.component';
export { AppDataTableComponent  } from './lib/components/ui/app-data-table.component';
