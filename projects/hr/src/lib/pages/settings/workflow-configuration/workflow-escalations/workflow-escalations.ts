import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkflowConfigService } from '../../../../services/workflow-config.service';
import { WorkflowEscalationService } from '../../../../services/workflow-escalation.service';
import { WorkflowConfigDto, WorkflowConfigStepDto, WorkflowEscalationDto, CreateWorkflowEscalationDto, UpdateWorkflowEscalationDto } from '../../../../models/workflow-config.model';

@Component({
  selector: 'lib-workflow-escalations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workflow-escalations.html',
  styleUrl: './workflow-escalations.css',
})
export class WorkflowEscalationsComponent implements OnInit {
  workflows: WorkflowConfigDto[] = [];
  steps: WorkflowConfigStepDto[] = [];
  escalations: WorkflowEscalationDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingEscalation: WorkflowEscalationDto | null = null;
  selectedWorkflowId = '';
  selectedStepId = '';

  formWorkflowConfigStepId = '';
  formAfterHours = 24;
  formActionType = '';
  formActionTarget = '';
  formReminderCount = 1;
  formAutoApproveFlag = false;
  formIsActive = true;

  constructor(
    private workflowService: WorkflowConfigService,
    private escalationService: WorkflowEscalationService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() { this.loadWorkflows(); }

  loadWorkflows() {
    this.loading = true;
    this.workflowService.getAll().subscribe({
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
    this.selectedStepId = '';
    this.steps = [];
    this.escalations = [];
    if (!this.selectedWorkflowId) return;
    this.workflowService.getStepsByWorkflow(this.selectedWorkflowId).subscribe({
      next: (res) => {
        const raw = res as any;
        this.steps = Array.isArray(raw) ? raw : (raw.data ?? []);
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load steps'; this.cdr.detectChanges(); },
    });
  }

  onStepChange() {
    if (!this.selectedStepId) { this.escalations = []; return; }
    this.loadEscalations();
  }

  loadEscalations() {
    if (!this.selectedStepId) { this.escalations = []; return; }
    this.loading = true;
    this.error = '';
    this.escalationService.getByStep(this.selectedStepId).subscribe({
      next: (res) => {
        const raw = res as any;
        this.escalations = Array.isArray(raw) ? raw : (raw.data ?? []);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load escalations'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  openCreateForm() {
    this.editingEscalation = null;
    this.resetForm();
    this.formWorkflowConfigStepId = this.selectedStepId;
    this.showForm = true;
  }

  openEditForm(e: WorkflowEscalationDto) {
    this.editingEscalation = e;
    this.formWorkflowConfigStepId = e.workflowConfigStepId;
    this.formAfterHours = e.afterHours;
    this.formActionType = e.actionType ?? '';
    this.formActionTarget = e.actionTarget ?? '';
    this.formReminderCount = e.reminderCount;
    this.formAutoApproveFlag = e.autoApproveFlag;
    this.formIsActive = e.isActive;
    this.showForm = true;
  }

  resetForm() {
    this.formWorkflowConfigStepId = '';
    this.formAfterHours = 24;
    this.formActionType = '';
    this.formActionTarget = '';
    this.formReminderCount = 1;
    this.formAutoApproveFlag = false;
    this.formIsActive = true;
  }

  cancelForm() { this.showForm = false; this.editingEscalation = null; this.resetForm(); }

  saveEscalation() {
    if (!this.formWorkflowConfigStepId) {
      this.error = 'Step is required';
      this.cdr.detectChanges();
      return;
    }
    this.error = '';
    if (this.editingEscalation) {
      const dto: UpdateWorkflowEscalationDto = {
        afterHours: this.formAfterHours,
        actionType: this.formActionType || undefined,
        actionTarget: this.formActionTarget || undefined,
        reminderCount: this.formReminderCount,
        autoApproveFlag: this.formAutoApproveFlag,
        isActive: this.formIsActive,
      };
      this.escalationService.update(this.editingEscalation.id, dto).subscribe({
        next: () => { this.showForm = false; this.loadEscalations(); },
        error: () => { this.error = 'Failed to update escalation'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateWorkflowEscalationDto = {
        workflowConfigStepId: this.formWorkflowConfigStepId,
        afterHours: this.formAfterHours,
        actionType: this.formActionType || undefined,
        actionTarget: this.formActionTarget || undefined,
        reminderCount: this.formReminderCount,
        autoApproveFlag: this.formAutoApproveFlag,
      };
      this.escalationService.create(dto).subscribe({
        next: () => { this.showForm = false; this.loadEscalations(); },
        error: () => { this.error = 'Failed to create escalation'; this.cdr.detectChanges(); },
      });
    }
  }

  deleteEscalation(e: WorkflowEscalationDto) {
    if (!confirm(`Delete this escalation (after ${e.afterHours}h)?`)) return;
    this.escalationService.delete(e.id).subscribe({
      next: () => this.loadEscalations(),
      error: () => { this.error = 'Failed to delete escalation'; this.cdr.detectChanges(); },
    });
  }

  getStepLabel(stepId: string): string {
    const s = this.steps.find(x => x.id === stepId);
    return s ? `Level ${s.levelNo} — ${s.approverType ?? ''}` : stepId;
  }
}
