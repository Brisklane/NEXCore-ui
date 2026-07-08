import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LookupService } from '../../../../services/lookup.service';
import { LookupTypeDto, CreateLookupTypeDto, LookupValueDto, CreateLookupValueDto } from '../../../../models/lookup.model';

@Component({
  selector: 'lib-lookup-values',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lookup-values.html',
  styleUrl: '../../../shared-styles.css',
})
export class LookupValuesComponent implements OnInit {
  activeTab: 'types' | 'values' = 'types';

  // ── Lookup Types ─────────────────────────────────────────
  lookupTypes: LookupTypeDto[] = [];
  loadingTypes = false;
  typeError = '';
  showTypeForm = false;

  formTypeCode = '';
  formTypeName = '';
  formTypeDescription = '';
  formTypeModuleName = '';
  formTypeEntityName = '';
  formTypeSortOrder = 0;

  // ── Lookup Values ────────────────────────────────────────
  selectedTypeId = '';
  lookupValues: LookupValueDto[] = [];
  loadingValues = false;
  valueError = '';
  showValueForm = false;

  formValueCode = '';
  formValueName = '';
  formValueDescription = '';
  formValueSortOrder = 0;

  constructor(private service: LookupService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadTypes(); }

  get selectedType(): LookupTypeDto | undefined {
    return this.lookupTypes.find(t => t.id === this.selectedTypeId);
  }

  switchTab(tab: 'types' | 'values') {
    this.activeTab = tab;
    // When switching to values tab, auto-select first type if none selected
    if (tab === 'values' && !this.selectedTypeId && this.lookupTypes.length) {
      this.selectedTypeId = this.lookupTypes[0].id;
      this.loadValues(this.selectedTypeId);
    }
  }

  // ── Types CRUD ───────────────────────────────────────────

  loadTypes() {
    this.loadingTypes = true;
    this.typeError = '';
    this.service.getAllTypes().subscribe({
      next: (res) => {
        this.lookupTypes = res.data ?? [];
        this.loadingTypes = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.typeError = err?.error?.message ?? 'Failed to load lookup types';
        this.loadingTypes = false;
        this.cdr.detectChanges();
      },
    });
  }

  openCreateTypeForm() { this.resetTypeForm(); this.showTypeForm = true; }
  cancelTypeForm() { this.showTypeForm = false; this.resetTypeForm(); }

  resetTypeForm() {
    this.formTypeCode = '';
    this.formTypeName = '';
    this.formTypeDescription = '';
    this.formTypeModuleName = '';
    this.formTypeEntityName = '';
    this.formTypeSortOrder = 0;
  }

  saveType() {
    if (!this.formTypeName.trim()) { this.typeError = 'Name is required'; return; }
    const dto: CreateLookupTypeDto = {
      code: this.formTypeCode || undefined,
      name: this.formTypeName,
      description: this.formTypeDescription || undefined,
      moduleName: this.formTypeModuleName || undefined,
      entityName: this.formTypeEntityName || undefined,
      sortOrder: this.formTypeSortOrder || undefined,
    };
    this.service.createType(dto).subscribe({
      next: () => { this.showTypeForm = false; this.resetTypeForm(); this.loadTypes(); },
      error: (err) => { this.typeError = err?.error?.message ?? 'Failed to create lookup type'; this.cdr.detectChanges(); },
    });
  }

  deleteType(t: LookupTypeDto) {
    if (!confirm(`Delete lookup type "${t.name}"? This will also remove its values.`)) return;
    this.service.deleteType(t.id).subscribe({
      next: () => {
        if (this.selectedTypeId === t.id) { this.selectedTypeId = ''; this.lookupValues = []; }
        this.loadTypes();
      },
      error: (err) => { this.typeError = err?.error?.message ?? 'Failed to delete lookup type'; this.cdr.detectChanges(); },
    });
  }

  openValuesFor(t: LookupTypeDto) {
    this.selectedTypeId = t.id;
    this.activeTab = 'values';
    this.showValueForm = false;
    this.resetValueForm();
    this.loadValues(t.id);
  }

  // ── Values CRUD ──────────────────────────────────────────

  onTypeDropdownChange() {
    this.lookupValues = [];
    this.showValueForm = false;
    this.resetValueForm();
    if (this.selectedTypeId) {
      this.loadValues(this.selectedTypeId);
    }
  }

  loadValues(typeId: string) {
    this.loadingValues = true;
    this.valueError = '';
    this.service.getValuesByType(typeId).subscribe({
      next: (res) => {
        this.lookupValues = res.data ?? [];
        this.loadingValues = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.valueError = err?.error?.message ?? 'Failed to load lookup values';
        this.loadingValues = false;
        this.cdr.detectChanges();
      },
    });
  }

  openCreateValueForm() { this.resetValueForm(); this.showValueForm = true; }
  cancelValueForm() { this.showValueForm = false; this.resetValueForm(); }

  resetValueForm() {
    this.formValueCode = '';
    this.formValueName = '';
    this.formValueDescription = '';
    this.formValueSortOrder = 0;
  }

  saveValue() {
    if (!this.selectedTypeId) { this.valueError = 'Please select a lookup type first'; return; }
    if (!this.formValueName.trim()) { this.valueError = 'Name is required'; return; }
    const dto: CreateLookupValueDto = {
      lookupTypeId: this.selectedTypeId,
      code: this.formValueCode || undefined,
      name: this.formValueName,
      description: this.formValueDescription || undefined,
      sortOrder: this.formValueSortOrder || undefined,
    };
    this.service.createValue(dto).subscribe({
      next: () => { this.showValueForm = false; this.resetValueForm(); this.loadValues(this.selectedTypeId); },
      error: (err) => { this.valueError = err?.error?.message ?? 'Failed to create lookup value'; this.cdr.detectChanges(); },
    });
  }

  deleteValue(v: LookupValueDto) {
    if (!confirm(`Delete value "${v.name}"?`)) return;
    this.service.deleteValue(v.id).subscribe({
      next: () => this.loadValues(this.selectedTypeId),
      error: (err) => { this.valueError = err?.error?.message ?? 'Failed to delete lookup value'; this.cdr.detectChanges(); },
    });
  }
}
