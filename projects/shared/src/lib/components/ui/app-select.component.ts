import { Component, Input, booleanAttribute, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectOption } from '../../models/ui.models';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="form-group">
      @if (label) {
        <label>{{ label }}@if (required) {<span style="color:#ef4444"> *</span>}</label>
      }
      <select
        [disabled]="isDisabled"
        [style.border-color]="error ? '#ef4444' : null"
        (change)="onSelect($event)"
        (blur)="_onTouched()"
      >
        <option value="">{{ placeholder }}</option>
        @for (opt of options; track opt.value) {
          <option
            [value]="opt.value"
            [selected]="opt.value == _value"
            [disabled]="!!opt.disabled"
          >{{ opt.label }}</option>
        }
      </select>
      @if (error) {
        <span style="color:#ef4444;font-size:12px;margin-top:3px;display:block">{{ error }}</span>
      }
    </div>
  `,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => AppSelectComponent),
    multi: true
  }]
})
export class AppSelectComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '-- Select --';
  @Input({ transform: booleanAttribute }) required = false;
  @Input() options: SelectOption[] = [];
  /** Inline validation message; renders below the select and reddens its border when set. */
  @Input() error = '';

  _value: any = '';
  isDisabled = false;

  private _onChange: (v: any) => void = () => {};
  _onTouched: () => void = () => {};

  writeValue(val: any): void { this._value = val ?? ''; }
  registerOnChange(fn: any): void { this._onChange = fn; }
  registerOnTouched(fn: any): void { this._onTouched = fn; }
  setDisabledState(d: boolean): void { this.isDisabled = d; }

  onSelect(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this._value = val;
    this._onChange(val);
  }
}
