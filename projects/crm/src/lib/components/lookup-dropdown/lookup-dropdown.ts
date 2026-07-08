import {
  Component, Input, forwardRef, HostListener, ElementRef, ViewChild,
  ChangeDetectionStrategy, ChangeDetectorRef, OnChanges,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface LookupOption {
  value: string;
  label: string;
}

@Component({
  selector: 'crm-lookup-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lookup-dropdown.html',
  styleUrl: './lookup-dropdown.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LookupDropdownComponent),
      multi: true,
    },
  ],
})
export class LookupDropdownComponent implements ControlValueAccessor, OnChanges {
  @Input() options: LookupOption[] = [];
  @Input() placeholder = 'Select...';
  @Input() label = '';

  @ViewChild('searchInput') searchInputRef?: ElementRef<HTMLInputElement>;

  readonly maxVisible = 7;
  readonly pickerPageSize = 10;

  value = '';
  isDisabled = false;
  dropdownOpen = false;
  dropdownSearch = '';
  showPicker = false;
  pickerSearch = '';
  pickerPage = 1;
  pickerFiltered: LookupOption[] = [];

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private el: ElementRef, private cdr: ChangeDetectorRef) {}

  ngOnChanges(): void {
    if (this.showPicker) {
      const q = this.pickerSearch.toLowerCase().trim();
      this.pickerFiltered = q
        ? this.options.filter(o => o.label.toLowerCase().includes(q))
        : [...this.options];
      const maxPage = Math.max(1, Math.ceil(this.pickerFiltered.length / this.pickerPageSize));
      if (this.pickerPage > maxPage) this.pickerPage = maxPage;
      this.cdr.detectChanges();
    }
  }

  get selectedLabel(): string {
    if (!this.value) return '';
    return this.options.find(o => o.value === this.value)?.label ?? this.value;
  }

  get visibleOptions(): LookupOption[] {
    const q = this.dropdownSearch.toLowerCase().trim();
    if (q) {
      return this.options.filter(o => o.label.toLowerCase().includes(q));
    }
    return this.options.slice(0, this.maxVisible);
  }

  get hasMore(): boolean {
    return !this.dropdownSearch.trim() && this.options.length > this.maxVisible;
  }

  onDropdownSearch(): void {
    this.cdr.detectChanges();
  }

  get pickerStart(): number {
    return this.pickerFiltered.length === 0 ? 0 : (this.pickerPage - 1) * this.pickerPageSize + 1;
  }

  get pickerEnd(): number {
    return Math.min(this.pickerPage * this.pickerPageSize, this.pickerFiltered.length);
  }

  get pickerPageItems(): LookupOption[] {
    const start = (this.pickerPage - 1) * this.pickerPageSize;
    return this.pickerFiltered.slice(start, start + this.pickerPageSize);
  }

  toggleDropdown(): void {
    if (this.isDisabled) return;
    this.dropdownOpen = !this.dropdownOpen;
    if (this.dropdownOpen) {
      this.dropdownSearch = '';
      setTimeout(() => this.searchInputRef?.nativeElement.focus(), 0);
    } else {
      this.onTouched();
    }
  }

  selectOption(opt: LookupOption | null): void {
    this.value = opt?.value ?? '';
    this.onChange(this.value);
    this.onTouched();
    this.dropdownOpen = false;
    this.dropdownSearch = '';
    this.cdr.markForCheck();
  }

  openPicker(): void {
    this.dropdownOpen = false;
    this.pickerSearch = '';
    this.pickerPage = 1;
    this.pickerFiltered = [...this.options];
    this.showPicker = true;
    this.cdr.markForCheck();
  }

  closePicker(): void {
    this.showPicker = false;
    this.onTouched();
    this.cdr.markForCheck();
  }

  onPickerSearch(): void {
    this.applyPickerFilter();
  }

  private applyPickerFilter(): void {
    const q = this.pickerSearch.toLowerCase().trim();
    this.pickerFiltered = q
      ? this.options.filter(o => o.label.toLowerCase().includes(q))
      : [...this.options];
    this.pickerPage = 1;
    this.cdr.detectChanges();
  }

  pickerPrev(): void {
    if (this.pickerPage > 1) { this.pickerPage--; this.cdr.detectChanges(); }
  }

  pickerNext(): void {
    if (this.pickerEnd < this.pickerFiltered.length) { this.pickerPage++; this.cdr.detectChanges(); }
  }

  selectFromPicker(opt: LookupOption): void {
    this.value = opt.value;
    this.onChange(this.value);
    this.onTouched();
    this.showPicker = false;
    this.cdr.markForCheck();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.dropdownOpen && !this.el.nativeElement.contains(event.target)) {
      this.dropdownOpen = false;
      this.dropdownSearch = '';
      this.onTouched();
      this.cdr.markForCheck();
    }
  }

  writeValue(value: string): void {
    this.value = value ?? '';
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.cdr.markForCheck();
  }
}
