import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Standard form panel wrapper.
 * Place form fields (app-input, app-select, etc.) directly inside the element — they
 * are laid out in the shared form-grid. Put action buttons in the [actions] slot.
 *
 * @example
 * <app-form-panel [title]="editMode ? 'Edit Item' : 'New Item'">
 *   <app-input label="Name" [(ngModel)]="form.name"></app-input>
 *   <app-select label="Type" [options]="typeOptions" [(ngModel)]="form.type"></app-select>
 *
 *   <ng-container actions>
 *     <button class="btn btn-secondary" (click)="cancel()">Cancel</button>
 *     <button class="btn btn-primary" (click)="save()">Save</button>
 *   </ng-container>
 * </app-form-panel>
 */
@Component({
  selector: 'app-form-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="form-panel">
      @if (title) { <h3>{{ title }}</h3> }
      <div class="form-grid">
        <ng-content></ng-content>
      </div>
      <div class="form-actions">
        <ng-content select="[actions]"></ng-content>
      </div>
    </div>
  `
})
export class AppFormPanelComponent {
  @Input() title = '';
}
