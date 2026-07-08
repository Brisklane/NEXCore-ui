import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommunicationTemplateService } from '../../../../services/communication-template.service';
import { LookupService } from '../../../../services/lookup.service';
import { CommunicationTemplateDto } from '../../../../models/communication-template.model';
import { LookupTypeDto, LookupValueDto } from '../../../../models/lookup.model';

@Component({
  selector: 'lib-settings-email-templates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './email-templates.html',
  styleUrl: '../../../shared-styles.css',
})
export class SettingsEmailTemplatesComponent implements OnInit {
  templates: CommunicationTemplateDto[] = [];
  loading = false;
  error = '';
  saving = false;
  saveError = '';

  showForm = false;
  editingTemplate: CommunicationTemplateDto | null = null;

  // Lookup data for dropdown
  lookupTypes: LookupTypeDto[] = [];
  templateTypeValues: LookupValueDto[] = [];
  loadingLookups = false;

  // Form fields
  formCode = '';
  formName = '';
  formSubject = '';
  formBody = '';
  formLanguageCode = '';
  formTemplateLookupValueId = '';
  formIsActive = true;

  constructor(
    private templateService: CommunicationTemplateService,
    private lookupService: LookupService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadTemplates();
    this.loadTemplateLookupValues();
  }

  loadTemplates() {
    this.loading = true;
    this.error = '';
    this.templateService.getAll().subscribe({
      next: (res) => {
        this.templates = res.data ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load templates.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadTemplateLookupValues() {
    this.loadingLookups = true;
    this.lookupService.getAllTypes().subscribe({
      next: (res) => {
        this.lookupTypes = res.data ?? [];
        const emailType = this.lookupTypes.find(
          (t) =>
            (t.name ?? '').toLowerCase().includes('email') ||
            (t.name ?? '').toLowerCase().includes('communication') ||
            (t.code ?? '').toLowerCase().includes('email') ||
            (t.code ?? '').toLowerCase().includes('communication_template')
        );
        if (emailType) {
          this.lookupService.getValuesByType(emailType.id).subscribe({
            next: (vRes) => {
              this.templateTypeValues = vRes.data ?? [];
              this.loadingLookups = false;
              this.cdr.detectChanges();
            },
            error: () => {
              this.loadingLookups = false;
              this.cdr.detectChanges();
            },
          });
        } else {
          this.loadingLookups = false;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.loadingLookups = false;
        this.cdr.detectChanges();
      },
    });
  }

  getTypeValueName(id?: string): string {
    if (!id) return '—';
    return this.templateTypeValues.find((v) => v.id === id)?.name ?? id;
  }

  openCreateForm() {
    this.editingTemplate = null;
    this.resetForm();
    this.showForm = true;
    this.saveError = '';
  }

  openEditForm(tpl: CommunicationTemplateDto) {
    this.editingTemplate = tpl;
    this.formCode = tpl.templateCode ?? '';
    this.formName = tpl.templateName ?? '';
    this.formSubject = tpl.subject ?? '';
    this.formBody = tpl.body ?? '';
    this.formLanguageCode = tpl.languageCode ?? '';
    this.formTemplateLookupValueId = tpl.templateTypeLookupValueId ?? '';
    this.formIsActive = tpl.isActive ?? true;
    this.showForm = true;
    this.saveError = '';
  }

  resetForm() {
    this.formCode = '';
    this.formName = '';
    this.formSubject = '';
    this.formBody = '';
    this.formLanguageCode = '';
    this.formTemplateLookupValueId = '';
    this.formIsActive = true;
  }

  cancelForm() {
    this.showForm = false;
    this.editingTemplate = null;
    this.resetForm();
    this.saveError = '';
  }

  saveTemplate() {
    if (!this.formName.trim() || !this.formTemplateLookupValueId) {
      this.saveError = 'Template Name and Type are required.';
      return;
    }
    this.saving = true;
    this.saveError = '';

    if (this.editingTemplate) {
      this.templateService
        .update(this.editingTemplate.id, {
          templateName: this.formName,
          templateTypeLookupValueId: this.formTemplateLookupValueId,
          subject: this.formSubject,
          body: this.formBody,
          languageCode: this.formLanguageCode || undefined,
          isActive: this.formIsActive,
        })
        .subscribe({
          next: () => {
            this.saving = false;
            this.cancelForm();
            this.loadTemplates();
          },
          error: () => {
            this.saving = false;
            this.saveError = 'Failed to update template.';
            this.cdr.detectChanges();
          },
        });
    } else {
      this.templateService
        .create({
          templateCode: this.formCode || undefined,
          templateName: this.formName,
          templateTypeLookupValueId: this.formTemplateLookupValueId,
          subject: this.formSubject,
          body: this.formBody,
          languageCode: this.formLanguageCode || undefined,
        })
        .subscribe({
          next: () => {
            this.saving = false;
            this.cancelForm();
            this.loadTemplates();
          },
          error: () => {
            this.saving = false;
            this.saveError = 'Failed to create template.';
            this.cdr.detectChanges();
          },
        });
    }
  }

  deleteTemplate(tpl: CommunicationTemplateDto) {
    if (!confirm(`Delete template "${tpl.templateName}"?`)) return;
    this.templateService.delete(tpl.id).subscribe({
      next: () => this.loadTemplates(),
      error: () => {
        this.error = 'Failed to delete template.';
        this.cdr.detectChanges();
      },
    });
  }
}
