import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkflowConfigService } from '../../../../services/workflow-config.service';
import { WorkflowConfigDto, WorkflowConfigStepDto, CreateWorkflowConfigStepDto, UpdateWorkflowConfigStepDto } from '../../../../models/workflow-config.model';

@Component({
  selector: 'lib-workflow-steps',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workflow-steps.html',
  styleUrl: './workflow-steps.css',
})
export class WorkflowStepsComponent implements OnInit {
  workflows: WorkflowConfigDto[] = [];
  steps: WorkflowConfigStepDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingStep: WorkflowConfigStepDto | null = null;
  selectedWorkflowId = '';

  formWorkflowConfigId = '';
  formLevelNo = 1;
  formApproverType = '';
  formApproverValue = '';
  formMandatory = true;
  formSlaHours = 48;
  formExecutionType = '';
  formSortOrder = 1;
  formIsConditional = false;

  constructor(private service: WorkflowConfigService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadWorkflows(); }

  loadWorkflows() {
    this.loading = true;
    this.service.getAll().subscribe({
      next: (res) => {
        const raw = res as any;
        this.workflows = Array.isArray(raw) ? raw : (raw.data ?? []);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load workflows'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  onWorkflowChange() {
    if (!this.selectedWorkflowId) { this.steps = []; return; }
    this.loadSteps();
  }

  loadSteps() {
    if (!this.selectedWorkflowId) { this.steps = []; return; }
    this.loading = true;
    this.error = '';
    this.service.getStepsByWorkflow(this.selectedWorkflowId).subscribe({
      next: (res) => {
        const raw = res as any;
        this.steps = Array.isArray(raw) ? raw : (raw.data ?? []);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load steps'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  openCreateForm() {
    this.editingStep = null;
    this.resetForm();
    this.formWorkflowConfigId = this.selectedWorkflowId;
    this.showForm = true;
  }

  openEditForm(s: WorkflowConfigStepDto) {
    this.editingStep = s;
    this.formWorkflowConfigId = s.workflowConfigId;
    this.formLevelNo = s.levelNo;
    this.formApproverType = s.approverType ?? '';
    this.formApproverValue = s.approverValue ?? '';
    this.formMandatory = s.mandatory;
    this.formSlaHours = s.slaHours;
    this.formExecutionType = s.executionType ?? '';
    this.formSortOrder = s.sortOrder;
    this.formIsConditional = s.isConditional;
    this.showForm = true;
  }

  resetForm() {
    this.formWorkflowConfigId = '';
    this.formLevelNo = 1;
    this.formApproverType = '';
    this.formApproverValue = '';
    this.formMandatory = true;
    this.formSlaHours = 48;
    this.formExecutionType = '';
    this.formSortOrder = 1;
    this.formIsConditional = false;
  }

  cancelForm() { this.showForm = false; this.editingStep = null; this.resetForm(); }

  saveStep() {
    if (!this.formWorkflowConfigId) {
      this.error = 'Workflow is required';
      this.cdr.detectChanges();
      return;
    }
    this.error = '';
    if (this.editingStep) {
      const dto: UpdateWorkflowConfigStepDto = {
        levelNo: this.formLevelNo,
        approverType: this.formApproverType || undefined,
        approverValue: this.formApproverValue || undefined,
        mandatory: this.formMandatory,
        slaHours: this.formSlaHours,
        executionType: this.formExecutionType || undefined,
        sortOrder: this.formSortOrder,
        isConditional: this.formIsConditional,
      };
      this.service.updateStep(this.editingStep.id, dto).subscribe({
        next: () => { this.showForm = false; this.loadSteps(); },
        error: () => { this.error = 'Failed to update step'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateWorkflowConfigStepDto = {
        workflowConfigId: this.formWorkflowConfigId,
        levelNo: this.formLevelNo,
        approverType: this.formApproverType || undefined,
        approverValue: this.formApproverValue || undefined,
        mandatory: this.formMandatory,
        slaHours: this.formSlaHours,
        executionType: this.formExecutionType || undefined,
        sortOrder: this.formSortOrder,
        isConditional: this.formIsConditional,
      };
      this.service.createStep(dto).subscribe({
        next: () => { this.showForm = false; this.loadSteps(); },
        error: () => { this.error = 'Failed to create step'; this.cdr.detectChanges(); },
      });
    }
  }

  deleteStep(s: WorkflowConfigStepDto) {
    if (!confirm(`Delete step Level ${s.levelNo}?`)) return;
    this.service.deleteStep(s.id).subscribe({
      next: () => this.loadSteps(),
      error: () => { this.error = 'Failed to delete step'; this.cdr.detectChanges(); },
    });
  }

  getWorkflowName(id: string): string {
    return this.workflows.find(w => w.id === id)?.workflowName ?? id;
  }
}
