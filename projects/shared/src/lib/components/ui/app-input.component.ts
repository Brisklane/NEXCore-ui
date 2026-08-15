import { Component, Input, booleanAttribute, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="form-group">
      @if (label) {
        <label>{{ label }}@if (required) {<span style="color:var(--danger, #ef4444)"> *</span>}</label>
      }
      <input
        [type]="type"
        [placeholder]="placeholder"
        [disabled]="isDisabled"
        [readonly]="readonly"
        [min]="min"
        [max]="max"
        [step]="step"
        [min]="min"
        [max]="max"
        [step]="step"
        [value]="_value ?? ''"
        [style.border-color]="error ? 'var(--input-error-border, #ef4444)' : null"
        [style.border-color]="error ? 'var(--input-error-border, #ef4444)' : null"
        (input)="onInput($event)"
        (blur)="_onTouched()"
      />
      @if (error) {
        <span style="color:var(--danger, #ef4444);font-size:12px;margin-top:3px;display:block">{{ error }}</span>
      }
      @if (error) {
        <span style="color:var(--danger, #ef4444);font-size:12px;margin-top:3px;display:block">{{ error }}</span>
      }
    </div>
  `,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => AppInputComponent),
    multi: true
  }]
})
export class AppInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input({ transform: booleanAttribute }) required = false;
  @Input({ transform: booleanAttribute }) readonly = false;
  /** Inline validation message; renders below the input and reddens its border when set. */
  @Input() error = '';
  /** Optional numeric constraints (forwarded to the native input). */
  @Input() min?: number | string;
  @Input() max?: number | string;
  @Input() step?: number | string;

  _value: any = '';
  isDisabled = false;

  private _onChange: (v: any) => void = () => {};
  _onTouched: () => void = () => {};

  writeValue(val: any): void { this._value = val ?? ''; }
  registerOnChange(fn: any): void { this._onChange = fn; }
  registerOnTouched(fn: any): void { this._onTouched = fn; }
  setDisabledState(d: boolean): void { this.isDisabled = d; }

  onInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const val = this.type === 'number' ? (raw === '' ? null : +raw) : raw;
    this._value = val;
    this._onChange(val);
  }
}
