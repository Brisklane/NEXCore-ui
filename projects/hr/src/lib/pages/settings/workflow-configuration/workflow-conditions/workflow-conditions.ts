import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkflowConfigService } from '../../../../services/workflow-config.service';
import { WorkflowConditionService } from '../../../../services/workflow-condition.service';
import { WorkflowConfigDto, WorkflowConditionDto, CreateWorkflowConditionDto, UpdateWorkflowConditionDto } from '../../../../models/workflow-config.model';

@Component({
  selector: 'lib-workflow-conditions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workflow-conditions.html',
  styleUrl: './workflow-conditions.css',
})
export class WorkflowConditionsComponent implements OnInit {
  workflows: WorkflowConfigDto[] = [];
  conditions: WorkflowConditionDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingCondition: WorkflowConditionDto | null = null;
  selectedWorkflowId = '';

  formWorkflowConfigId = '';
  formFieldName = '';
  formOperator = '';
  formFieldValue = '';
  formActionType = '';
  formActionValue = '';
  formLogicalGroup = 1;
  formJoinOperator = '';

  constructor(
    private workflowService: WorkflowConfigService,
    private conditionService: WorkflowConditionService,
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
    if (!this.selectedWorkflowId) { this.conditions = []; return; }
    this.loadConditions();
  }

  loadConditions() {
    if (!this.selectedWorkflowId) { this.conditions = []; return; }
    this.loading = true;
    this.error = '';
    this.conditionService.getByWorkflow(this.selectedWorkflowId).subscribe({
      next: (res) => {
        const raw = res as any;
        this.conditions = Array.isArray(raw) ? raw : (raw.data ?? []);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load conditions'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  openCreateForm() {
    this.editingCondition = null;
    this.resetForm();
    this.formWorkflowConfigId = this.selectedWorkflowId;
    this.showForm = true;
  }

  openEditForm(c: WorkflowConditionDto) {
    this.editingCondition = c;
    this.formWorkflowConfigId = c.workflowConfigId;
    this.formFieldName = c.fieldName ?? '';
    this.formOperator = c.operator ?? '';
    this.formFieldValue = c.fieldValue ?? '';
    this.formActionType = c.actionType ?? '';
    this.formActionValue = c.actionValue ?? '';
    this.formLogicalGroup = c.logicalGroup;
    this.formJoinOperator = c.joinOperator ?? '';
    this.showForm = true;
  }

  resetForm() {
    this.formWorkflowConfigId = '';
    this.formFieldName = '';
    this.formOperator = '';
    this.formFieldValue = '';
    this.formActionType = '';
    this.formActionValue = '';
    this.formLogicalGroup = 1;
    this.formJoinOperator = '';
  }

  cancelForm() { this.showForm = false; this.editingCondition = null; this.resetForm(); }

  saveCondition() {
    if (!this.formWorkflowConfigId) {
      this.error = 'Workflow is required';
      this.cdr.detectChanges();
      return;
    }
    this.error = '';
    if (this.editingCondition) {
      const dto: UpdateWorkflowConditionDto = {
        fieldName: this.formFieldName || undefined,
        operator: this.formOperator || undefined,
        fieldValue: this.formFieldValue || undefined,
        actionType: this.formActionType || undefined,
        actionValue: this.formActionValue || undefined,
        logicalGroup: this.formLogicalGroup,
        joinOperator: this.formJoinOperator || undefined,
      };
      this.conditionService.update(this.editingCondition.id, dto).subscribe({
        next: () => { this.showForm = false; this.loadConditions(); },
        error: () => { this.error = 'Failed to update condition'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateWorkflowConditionDto = {
        workflowConfigId: this.formWorkflowConfigId,
        fieldName: this.formFieldName || undefined,
        operator: this.formOperator || undefined,
        fieldValue: this.formFieldValue || undefined,
        actionType: this.formActionType || undefined,
        actionValue: this.formActionValue || undefined,
        logicalGroup: this.formLogicalGroup,
        joinOperator: this.formJoinOperator || undefined,
      };
      this.conditionService.create(dto).subscribe({
        next: () => { this.showForm = false; this.loadConditions(); },
        error: () => { this.error = 'Failed to create condition'; this.cdr.detectChanges(); },
      });
    }
  }

  deleteCondition(c: WorkflowConditionDto) {
    if (!confirm(`Delete condition for field "${c.fieldName}"?`)) return;
    this.conditionService.delete(c.id).subscribe({
      next: () => this.loadConditions(),
      error: () => { this.error = 'Failed to delete condition'; this.cdr.detectChanges(); },
    });
  }
}
