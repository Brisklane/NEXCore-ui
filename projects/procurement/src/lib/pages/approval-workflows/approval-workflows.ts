import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RowHighlighter } from '@nexcore/shared';
import { ApprovalWorkflowService } from '../../services/master-data.service';
import { ApprovalWorkflowDto, ApprovalWorkflowStepDto, CreateApprovalWorkflowDto } from '../../models/master-data.model';
import { ApprovalDocumentType, APPROVAL_DOC_TYPE_LABELS } from '../../models/procurement-enums';

@Component({
  selector: 'lib-approval-workflows',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './approval-workflows.html',
  styleUrl: './approval-workflows.css',
})
export class ApprovalWorkflowsPage implements OnInit {
  workflows: ApprovalWorkflowDto[] = [];
  loading = false;
  error = '';
  success = '';
  showForm = false;
  editing: ApprovalWorkflowDto | null = null;

  // Client-side pagination (small config list loaded in full).
  page = 1;
  pageSize = 10;
  readonly pageSizeOptions = [10, 20, 50];
  get totalPages(): number { return Math.max(1, Math.ceil(this.workflows.length / this.pageSize)); }
  get pagedWorkflows(): ApprovalWorkflowDto[] {
    const ordered = this.floatHighlighted(this.workflows);
    const start = (this.page - 1) * this.pageSize;
    return ordered.slice(start, start + this.pageSize);
  }
  onPageSizeChange(): void { this.page = 1; }

  highlighter = new RowHighlighter();

  /** Float a freshly created workflow to the top of the list so it shows first. */
  private floatHighlighted(rows: ApprovalWorkflowDto[]): ApprovalWorkflowDto[] {
    if (this.highlighter.id == null) return rows;
    const idx = rows.findIndex(r => r.id === this.highlighter.id);
    if (idx <= 0) return rows;
    const copy = [...rows];
    const [row] = copy.splice(idx, 1);
    copy.unshift(row);
    return copy;
  }

  formName = '';
  formDescription = '';
  formDocumentType: ApprovalDocumentType = ApprovalDocumentType.PurchaseOrder;
  formMinAmount: number | null = null;
  formMaxAmount: number | null = null;
  formIsDefault = false;
  formPriority = 1;
  formSteps: ApprovalWorkflowStepDto[] = [];
  newStep: Partial<ApprovalWorkflowStepDto> = { stepNumber: 1, requiredApprovals: 1, escalationAfterDays: 3, isParallelStep: false, isOptional: false };

  readonly docTypeOptions = Object.entries(APPROVAL_DOC_TYPE_LABELS).map(([k, v]) => ({ value: Number(k), label: v }));

  constructor(private service: ApprovalWorkflowService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.service.getAll().subscribe({
      next: (r) => { this.workflows = r.data ?? []; this.page = 1; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load workflows'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  docTypeLabel(dt: ApprovalDocumentType): string { return APPROVAL_DOC_TYPE_LABELS[dt] ?? String(dt); }

  openCreate(): void { this.editing = null; this.resetForm(); this.showForm = true; }

  openEdit(w: ApprovalWorkflowDto): void {
    this.editing = w; this.formName = w.name; this.formDescription = w.description ?? '';
    this.formDocumentType = w.documentType; this.formMinAmount = w.minimumAmount ?? null;
    this.formMaxAmount = w.maximumAmount ?? null; this.formIsDefault = w.isDefault;
    this.formPriority = w.priority;
    this.formSteps = w.steps.map(s => ({ ...s }));
    this.newStep = { stepNumber: this.formSteps.length + 1, requiredApprovals: 1, escalationAfterDays: 3, isParallelStep: false, isOptional: false };
    this.showForm = true;
  }

  cancel(): void { this.showForm = false; this.editing = null; this.resetForm(); }

  resetForm(): void {
    this.formName = ''; this.formDescription = ''; this.formDocumentType = ApprovalDocumentType.PurchaseOrder;
    this.formMinAmount = null; this.formMaxAmount = null; this.formIsDefault = false; this.formPriority = 1;
    this.formSteps = [];
    this.newStep = { stepNumber: 1, requiredApprovals: 1, escalationAfterDays: 3, isParallelStep: false, isOptional: false };
  }

  addStep(): void {
    if (!this.newStep.stepName?.trim()) return;
    this.formSteps.push({ ...this.newStep } as ApprovalWorkflowStepDto);
    this.newStep = { stepNumber: this.formSteps.length + 1, requiredApprovals: 1, escalationAfterDays: 3, isParallelStep: false, isOptional: false };
  }
  removeStep(i: number): void { this.formSteps.splice(i, 1); }

  get canSave(): boolean { return !!this.formName.trim() && this.formSteps.length > 0; }

  save(): void {
    const dto: CreateApprovalWorkflowDto = {
      name: this.formName, description: this.formDescription || undefined,
      documentType: this.formDocumentType, minimumAmount: this.formMinAmount ?? undefined,
      maximumAmount: this.formMaxAmount ?? undefined, isDefault: this.formIsDefault,
      priority: this.formPriority, steps: this.formSteps,
    };
    const isCreate = !this.editing;
    const obs = this.editing ? this.service.update(this.editing.id, dto) : this.service.create(dto);
    obs.subscribe({
      next: (res) => { this.success = isCreate ? 'Workflow created' : 'Workflow updated'; this.showForm = false; this.load(); if (isCreate) this.highlighter.flash(res.data?.id, this.cdr); },
      error: (e) => { this.error = e?.error?.message ?? 'Failed'; this.cdr.detectChanges(); },
    });
  }

  delete(w: ApprovalWorkflowDto): void {
    if (!confirm(`Delete "${w.name}"?`)) return;
    this.service.delete(w.id).subscribe({
      next: () => { this.success = 'Deleted'; this.load(); },
      error: (e) => { this.error = e?.error?.message ?? 'Failed'; this.cdr.detectChanges(); },
    });
  }
}
