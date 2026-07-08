import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Standardised page header.
 * Place action buttons inside the element — they are projected into the right side.
 *
 * @example
 * <app-page-header title="Dimensions" subtitle="Manage financial dimensions">
 *   <button class="btn btn-primary" (click)="openForm()">+ New</button>
 * </app-page-header>
 */
@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inv-hero">
      <div class="inv-hero-titles">
        @if (icon) { <div class="inv-hero-mark"><span class="material-symbols-outlined">{{ icon }}</span></div> }
        <div>
          <h1>{{ title }}</h1>
          @if (subtitle) { <p class="inv-hero-sub">{{ subtitle }}</p> }
        </div>
      </div>
      <div class="inv-hero-actions"><ng-content></ng-content></div>
    </div>
  `
})
export class AppPageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
  /** Optional Material Symbols icon name shown in the brand mark. */
  @Input() icon = '';
}
