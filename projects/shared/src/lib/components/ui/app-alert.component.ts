import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Alert / callout banner. Renders nothing when both `message` and projected
 * content are empty.
 *
 * - `error` / `success` — transient operation feedback (red / green).
 * - `info` — a persistent blue help/explanation box for a screen or form.
 * - `warning` — an amber caution box.
 *
 * Content may be supplied via `[message]` or projected for richer markup:
 *
 * @example
 * <app-alert type="error" [message]="errorMsg"></app-alert>
 * <app-alert type="info" message="3-way matching compares PO, receipt and invoice before payment."></app-alert>
 * <app-alert type="info"><strong>Tip:</strong> codes are generated automatically.</app-alert>
 */
@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (message || hasProjected) {
      <div
        class="alert"
        [class.alert-error]="type === 'error'"
        [class.alert-success]="type === 'success'"
        [class.alert-info]="type === 'info'"
        [class.alert-warning]="type === 'warning'"
      >@if (message) { {{ message }} } @else { <ng-content></ng-content> }</div>
    }
  `
})
export class AppAlertComponent {
  @Input() type: 'error' | 'success' | 'info' | 'warning' = 'error';
  @Input() message = '';
  /** Set true when projecting content instead of using [message] so the banner renders. */
  @Input() hasProjected = false;
}
