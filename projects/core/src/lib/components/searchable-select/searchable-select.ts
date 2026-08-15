import {
  Component, ElementRef, EventEmitter, Input, Output, ViewChild,
  ChangeDetectorRef, HostListener, OnChanges, SimpleChanges, forwardRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SearchableOption {
  /** Value written back through ngModel. */
  value: string;
  /** Text shown in the list and in the field once selected. */
  label: string;
  /** Optional prefix (flag emoji, code) rendered before the label. */
  prefix?: string;
}

/**
 * A combobox: one input you type directly into, with a filtered suggestion list.
 *
 * It is a real <input>, so it behaves like every other field on the form — Tab moves
 * in and out of it, and typing starts filtering immediately with no click first. A
 * native <select> only jumps to options whose *start* matches and gives up after a
 * moment, which is useless past a few dozen entries.
 *
 * Two modes:
 *   • local  — filters `options` in the browser, case-insensitively, matching anywhere
 *              in the label (countries: 249 entries).
 *   • remote — emits `search` and renders whatever `options` come back, so the list can
 *              be far larger than anything worth shipping to the client
 *              (cities: ~156k rows, searched server-side).
 *
 * Free text is never accepted: on blur the field snaps back to the current selection,
 * so the bound value is always one of the options (or empty).
 */
@Component({
  selector: 'nx-searchable-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './searchable-select.html',
  styleUrls: ['./searchable-select.css'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SearchableSelect),
    multi: true,
  }],
})
export class SearchableSelect implements ControlValueAccessor, OnChanges {
  @Input() options: SearchableOption[] = [];
  @Input() placeholder = 'Type to search…';
  @Input() emptyText = 'No matches';
  @Input() loading = false;
  @Input() disabled = false;
  /** Reddens the field, matching the shared form-control error treatment. */
  @Input() invalid = false;

  /** When true the parent supplies results and no local filtering is applied. */
  @Input() remote = false;
  /** Debounce for the `search` output, in ms. */
  @Input() searchDebounce = 250;

  /** Emitted as the user types (remote mode). */
  @Output() search = new EventEmitter<string>();

  @ViewChild('field') field?: ElementRef<HTMLInputElement>;

  open = false;
  /** What is actually in the input — the query while typing, the label otherwise. */
  text = '';
  activeIndex = -1;

  private value = '';
  private typing = false;
  private debounceTimer: any = null;

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private host: ElementRef<HTMLElement>, private cdr: ChangeDetectorRef) {}

  /**
   * The value is usually bound before the options arrive (a default country is set
   * while the list is still loading), so the label cannot be resolved on writeValue
   * alone — recompute it whenever the options change, or the field would sit there
   * looking empty while actually holding a value.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['options'] || this.typing) return;

    if (!this.value) { this.text = ''; return; }

    // Remote results won't always contain the current selection; keep the label we
    // already have rather than blanking the field.
    const label = this.labelFor(this.value);
    if (label) this.text = label;
  }

  // ── ControlValueAccessor ────────────────────────────────────────────────
  writeValue(v: string): void {
    this.value = v ?? '';
    if (this.typing) return;
    // Falls back to the raw value so a selection is never invisible, even if the
    // matching option hasn't loaded yet.
    this.text = this.labelFor(this.value) || this.value;
  }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.disabled = d; }

  /** Options to show: everything until the user types (local mode filters, remote doesn't). */
  get visibleOptions(): SearchableOption[] {
    if (this.remote || !this.typing || !this.text.trim()) return this.options;
    const q = this.text.trim().toLowerCase();
    return this.options.filter((o) => o.label.toLowerCase().includes(q));
  }

  get hasSelection(): boolean { return !!this.value; }

  // ── Interaction ─────────────────────────────────────────────────────────
  onFocus(): void {
    if (this.disabled) return;
    this.open = true;
    this.activeIndex = this.visibleOptions.findIndex((o) => o.value === this.value);
    // Select the current text so typing replaces it rather than appending.
    setTimeout(() => this.field?.nativeElement.select(), 0);
  }

  onInput(value: string): void {
    this.typing = true;
    this.text = value;
    this.open = true;
    this.activeIndex = -1;

    if (!this.remote) return;
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.search.emit(value.trim());
      this.cdr.detectChanges();
    }, this.searchDebounce);
  }

  /**
   * Leaving the field — by Tab, by clicking elsewhere — discards any half-typed query
   * and restores the selected label, so the input can never disagree with the value.
   */
  onBlur(): void {
    this.close();
    this.onTouched();
  }

  select(option: SearchableOption): void {
    this.value = option.value;
    this.text = this.labelFor(option.value);
    this.typing = false;
    this.open = false;
    this.activeIndex = -1;
    this.onChange(option.value);
  }

  clear(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.value = '';
    this.text = '';
    this.typing = false;
    this.onChange('');
    this.field?.nativeElement.focus();
  }

  onKeydown(event: KeyboardEvent): void {
    const list = this.visibleOptions;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.open = true;
        this.activeIndex = Math.min(this.activeIndex + 1, list.length - 1);
        this.scrollActiveIntoView();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex = Math.max(this.activeIndex - 1, 0);
        this.scrollActiveIntoView();
        break;
      case 'Enter':
        if (this.open && list[this.activeIndex]) {
          event.preventDefault();          // don't submit the form on a pick
          this.select(list[this.activeIndex]);
        }
        break;
      case 'Escape':
        if (this.open) { event.preventDefault(); this.close(); }
        break;
      // Tab is deliberately not handled: the browser moves focus, and onBlur tidies up.
    }
  }

  /** Selecting must beat blur, so options commit on mousedown rather than click. */
  onOptionMouseDown(event: MouseEvent, option: SearchableOption): void {
    event.preventDefault();
    this.select(option);
  }

  @HostListener('document:mousedown', ['$event'])
  onDocumentMouseDown(event: MouseEvent): void {
    if (this.open && !this.host.nativeElement.contains(event.target as Node)) this.close();
  }

  trackByValue = (_: number, o: SearchableOption) => o.value;

  private close(): void {
    this.open = false;
    this.typing = false;
    this.activeIndex = -1;
    this.text = this.labelFor(this.value);   // discard any unmatched free text
  }

  private labelFor(value: string): string {
    const match = this.options.find((o) => o.value === value);
    return match ? `${match.prefix ? match.prefix + ' ' : ''}${match.label}` : '';
  }

  private scrollActiveIntoView(): void {
    setTimeout(() => {
      this.host.nativeElement
        .querySelector('.ss-option.active')
        ?.scrollIntoView({ block: 'nearest' });
    }, 0);
  }
}
