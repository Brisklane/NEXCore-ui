import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Status badge with automatic class mapping for common values.
 * Recognised values (case-insensitive): active, inactive, draft, submitted,
 * posted, reversed, cancelled, yes, no, true, false.
 *
 * @example
 * <app-badge [value]="item.status"></app-badge>
 * <app-badge [value]="item.isActive" [label]="item.isActive ? 'Active' : 'Inactive'"></app-badge>
 * <app-badge value="posted" badgeClass="badge-posted"></app-badge>
 */
@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="badge" [ngClass]="resolvedClass">{{ displayLabel }}</span>`
})
export class AppBadgeComponent implements OnChanges {
  @Input() value: any = '';
  /** Overrides the displayed text; defaults to value if omitted */
  @Input() label = '';
  /** Explicit badge CSS class; auto-resolved from value when omitted */
  @Input() badgeClass = '';

  displayLabel = '';
  resolvedClass = '';

  private static readonly CLASS_MAP: Record<string, string> = {
    active: 'badge-active', inactive: 'badge-inactive',
    draft: 'badge-draft', submitted: 'badge-submitted',
    posted: 'badge-posted', reversed: 'badge-reversed',
    cancelled: 'badge-cancelled', yes: 'badge-yes', no: 'badge-no',
    true: 'badge-active', false: 'badge-inactive',
  };

  ngOnChanges(): void {
    const str = String(this.value ?? '');
    this.displayLabel = this.label || (typeof this.value === 'boolean' ? (this.value ? 'Active' : 'Inactive') : str);
    this.resolvedClass = this.badgeClass || AppBadgeComponent.CLASS_MAP[str.toLowerCase()] || '';
  }
}
