import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface OptionPickerItem {
  id: string;
  label: string;
  meta?: Record<string, string>;
}

export interface OptionPickerColumn {
  key: string;
  header: string;
}

@Component({
  selector: 'lib-option-picker-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './option-picker-input.html',
  styleUrl: './option-picker-input.css',
})
export class OptionPickerInputComponent implements OnChanges {
  @Input() options: OptionPickerItem[] = [];
  @Input() value = '';
  @Input() disabled = false;
  @Input() placeholder = 'Search...';
  @Input() entityLabel = 'Item';
  @Input() columns: OptionPickerColumn[] = [];
  @Output() optionSelected = new EventEmitter<OptionPickerItem>();

  @ViewChild('inputEl') inputEl!: ElementRef<HTMLInputElement>;

  searchText = '';
  showDropdown = false;
  suggestions: OptionPickerItem[] = [];
  dropdownStyle: Record<string, string> = {};

  showPicker = false;
  pickerSearch = '';
  pickerItems: OptionPickerItem[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['value']) {
      this.searchText = this.value;
    }
  }

  onFocus() {
    if (this.disabled) return;
    this.positionDropdown();
    this.refreshSuggestions();
    this.showDropdown = true;
  }

  onInput() {
    if (this.disabled) return;
    this.positionDropdown();
    this.refreshSuggestions();
    this.showDropdown = true;
  }

  onBlur() {
    setTimeout(() => { this.showDropdown = false; this.cdr.detectChanges(); }, 150);
  }

  private positionDropdown() {
    if (!this.inputEl) return;
    const rect = this.inputEl.nativeElement.getBoundingClientRect();
    const dropdownWidth = Math.max(rect.width, 440);
    const rightEdge = rect.left + dropdownWidth;
    const leftPos = rightEdge > window.innerWidth - 16 ? window.innerWidth - dropdownWidth - 16 : rect.left;
    this.dropdownStyle = {
      top: `${rect.bottom + 2}px`,
      left: `${Math.max(8, leftPos)}px`,
      width: `${dropdownWidth}px`,
    };
  }

  private refreshSuggestions() {
    const q = this.searchText.toLowerCase().trim();
    const filtered = q
      ? this.options.filter(o => o.label.toLowerCase().includes(q))
      : this.options;
    this.suggestions = filtered.slice(0, 5);
    this.cdr.detectChanges();
  }

  selectSuggestion(item: OptionPickerItem) {
    this.searchText = item.label;
    this.showDropdown = false;
    this.optionSelected.emit(item);
  }

  openPicker() {
    this.showDropdown = false;
    this.pickerSearch = '';
    this.refreshPickerItems();
    this.showPicker = true;
  }

  closePicker() {
    this.showPicker = false;
  }

  onPickerSearchChange() {
    this.refreshPickerItems();
  }

  getMetaHint(item: OptionPickerItem): string {
    if (!item.meta) return '';
    return Object.values(item.meta).filter(Boolean).join(' · ');
  }

  private refreshPickerItems() {
    const q = this.pickerSearch.toLowerCase().trim();
    this.pickerItems = q
      ? this.options.filter(o => o.label.toLowerCase().includes(q))
      : [...this.options];
    this.cdr.detectChanges();
  }

  selectFromPicker(item: OptionPickerItem) {
    this.selectSuggestion(item);
    this.closePicker();
  }
}
