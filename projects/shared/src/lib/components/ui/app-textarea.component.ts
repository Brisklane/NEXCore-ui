import { Component, Input, booleanAttribute, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="form-group">
      @if (label) {
        <label>{{ label }}@if (required) {<span style="color:var(--danger, #ef4444)"> *</span>}</label>
      }
      <textarea
        [placeholder]="placeholder"
        [disabled]="isDisabled"
        [rows]="rows"
        [value]="_value ?? ''"
        [style.border-color]="error ? 'var(--input-error-border, #ef4444)' : null"
        (input)="onInput($event)"
        (blur)="_onTouched()"
      ></textarea>
      @if (error) {
        <span style="color:var(--danger, #ef4444);font-size:12px;margin-top:3px;display:block">{{ error }}</span>
      }
    </div>
  `,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => AppTextareaComponent),
    multi: true
  }]
})
export class AppTextareaComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input({ transform: booleanAttribute }) required = false;
  @Input() rows = 3;
  /** Inline validation message; renders below the textarea and reddens its border when set. */
  @Input() error = '';

  _value = '';
  isDisabled = false;

  private _onChange: (v: any) => void = () => {};
  _onTouched: () => void = () => {};

  writeValue(val: any): void { this._value = val ?? ''; }
  registerOnChange(fn: any): void { this._onChange = fn; }
  registerOnTouched(fn: any): void { this._onTouched = fn; }
  setDisabledState(d: boolean): void { this.isDisabled = d; }

  onInput(event: Event): void {
    const val = (event.target as HTMLTextAreaElement).value;
    this._value = val;
    this._onChange(val);
  }
}
