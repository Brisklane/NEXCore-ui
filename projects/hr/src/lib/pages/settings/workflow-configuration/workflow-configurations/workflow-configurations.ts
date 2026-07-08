import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkflowConfigService } from '../../../../services/workflow-config.service';
import { WorkflowConfigDto, CreateWorkflowConfigDto, UpdateWorkflowConfigDto } from '../../../../models/workflow-config.model';

@Component({
  selector: 'lib-workflow-configurations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workflow-configurations.html',
  styleUrl: './workflow-configurations.css',
})
export class WorkflowConfigurationsComponent implements OnInit {
  workflows: WorkflowConfigDto[] = [];
  loading = false;
  error = '';
  showForm = false;
  editingWorkflow: WorkflowConfigDto | null = null;

  formWorkflowCode = '';
  formModule = '';
  formTransactionType = '';
  formWorkflowName = '';
  formTotalLevels = 1;
  formEffectiveFrom = '';
  formEffectiveTo = '';
  formDescription = '';
  formIsActive = true;

  constructor(private service: WorkflowConfigService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadWorkflows(); }

  loadWorkflows() {
    this.loading = true;
    this.error = '';
    this.service.getAll().subscribe({
      next: (res) => {
        const raw = res as any;
        this.workflows = Array.isArray(raw) ? raw : (raw.data ?? []);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load workflow configurations'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  openCreateForm() { this.editingWorkflow = null; this.resetForm(); this.showForm = true; }

  openEditForm(w: WorkflowConfigDto) {
    this.editingWorkflow = w;
    this.formWorkflowCode = w.workflowCode ?? '';
    this.formModule = w.module ?? '';
    this.formTransactionType = w.transactionType ?? '';
    this.formWorkflowName = w.workflowName ?? '';
    this.formTotalLevels = w.totalLevels;
    this.formEffectiveFrom = w.effectiveFrom ? w.effectiveFrom.substring(0, 10) : '';
    this.formEffectiveTo = w.effectiveTo ? w.effectiveTo.substring(0, 10) : '';
    this.formDescription = w.description ?? '';
    this.formIsActive = w.isActive;
    this.showForm = true;
  }

  resetForm() {
    this.formWorkflowCode = '';
    this.formModule = '';
    this.formTransactionType = '';
    this.formWorkflowName = '';
    this.formTotalLevels = 1;
    this.formEffectiveFrom = '';
    this.formEffectiveTo = '';
    this.formDescription = '';
    this.formIsActive = true;
  }

  cancelForm() { this.showForm = false; this.editingWorkflow = null; this.resetForm(); }

  saveWorkflow() {
    if (!this.formWorkflowName.trim()) {
      this.error = 'Workflow Name is required';
      this.cdr.detectChanges();
      return;
    }
    this.error = '';
    if (this.editingWorkflow) {
      const dto: UpdateWorkflowConfigDto = {
        workflowName: this.formWorkflowName,
        module: this.formModule || undefined,
        transactionType: this.formTransactionType || undefined,
        totalLevels: this.formTotalLevels,
        isActive: this.formIsActive,
        effectiveFrom: this.formEffectiveFrom || undefined,
        effectiveTo: this.formEffectiveTo || undefined,
        description: this.formDescription || undefined,
      };
      this.service.update(this.editingWorkflow.id, dto).subscribe({
        next: () => { this.showForm = false; this.loadWorkflows(); },
        error: () => { this.error = 'Failed to update workflow configuration'; this.cdr.detectChanges(); },
      });
    } else {
      const dto: CreateWorkflowConfigDto = {
        workflowCode: this.formWorkflowCode || undefined,
        module: this.formModule || undefined,
        transactionType: this.formTransactionType || undefined,
        workflowName: this.formWorkflowName,
        totalLevels: this.formTotalLevels,
        effectiveFrom: this.formEffectiveFrom || undefined,
        effectiveTo: this.formEffectiveTo || undefined,
        description: this.formDescription || undefined,
      };
      this.service.create(dto).subscribe({
        next: () => { this.showForm = false; this.loadWorkflows(); },
        error: () => { this.error = 'Failed to create workflow configuration'; this.cdr.detectChanges(); },
      });
    }
  }

  deleteWorkflow(w: WorkflowConfigDto) {
    if (!confirm(`Delete workflow "${w.workflowName}"?`)) return;
    this.service.delete(w.id).subscribe({
      next: () => this.loadWorkflows(),
      error: () => { this.error = 'Failed to delete workflow configuration'; this.cdr.detectChanges(); },
    });
  }
}
