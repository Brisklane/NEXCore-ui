import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApprovalService } from '../../../../services/approval.service';
import { WorkflowConfigService } from '../../../../services/workflow-config.service';
import { EmployeeService } from '../../../../services/employee.service';
import { ApprovalRequestDto, ApproveStepDto, RejectStepDto } from '../../../../models/approval-request.model';
import { WorkflowConfigDto } from '../../../../models/workflow-config.model';
import { EmployeeDto } from '../../../../models/employee.model';

@Component({
  selector: 'lib-approval-workflow',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './approval-workflow.html',
  styleUrl: './approval-workflow.css',
})
export class ApprovalWorkflow implements OnInit {
  approvals: ApprovalRequestDto[] = [];
  workflows: WorkflowConfigDto[] = [];
  employees: EmployeeDto[] = [];
  loading = false;
  error = '';
  selectedApproval: ApprovalRequestDto | null = null;

  // Action panel
  actionMode: 'approve' | 'reject' | null = null;
  actionApproverEmployeeId = '';
  actionComments = '';
  actionRejectionReason = '';

  // Submit new approval panel
  showSubmitForm = false;
  submitEntityType = '';
  submitEntityId = '';
  submitWorkflowConfigId = '';
  submitRequestedByEmployeeId = '';
  submitSubjectTitle = '';
  submitSummary = '';
  submitComments = '';

  constructor(
    private approvalService: ApprovalService,
    private workflowService: WorkflowConfigService,
    private employeeService: EmployeeService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadApprovals();
    this.loadWorkflows();
    this.loadEmployees();
  }

  loadApprovals() {
    this.loading = true;
    this.error = '';
    this.approvalService.getAll().subscribe({
      next: (res) => {
        const raw = res as any;
        this.approvals = Array.isArray(raw) ? raw : (raw.data ?? []);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load approval requests'; this.loading = false; this.cdr.detectChanges(); },
    });
  }

  loadWorkflows() {
    this.workflowService.getAll().subscribe({
      next: (res) => {
        const raw = res as any;
        this.workflows = Array.isArray(raw) ? raw : (raw.data ?? []);
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  loadEmployees() {
    this.employeeService.getAll().subscribe({
      next: (res) => {
        const raw = res as any;
        this.employees = Array.isArray(raw) ? raw : (raw.data ?? []);
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  selectApproval(a: ApprovalRequestDto) {
    this.selectedApproval = a;
    this.actionMode = null;
    this.resetActionForm();
    this.approvalService.getById(a.id).subscribe({
      next: (res) => {
        const raw = res as any;
        this.selectedApproval = (raw.data ?? raw) as ApprovalRequestDto;
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  startApprove() { this.actionMode = 'approve'; this.resetActionForm(); }
  startReject() { this.actionMode = 'reject'; this.resetActionForm(); }
  cancelAction() { this.actionMode = null; this.resetActionForm(); }

  resetActionForm() {
    this.actionApproverEmployeeId = '';
    this.actionComments = '';
    this.actionRejectionReason = '';
  }

  submitApprove() {
    if (!this.selectedApproval || !this.actionApproverEmployeeId) {
      this.error = 'Approver Employee is required';
      this.cdr.detectChanges();
      return;
    }
    this.error = '';
    const dto: ApproveStepDto = {
      approverEmployeeId: this.actionApproverEmployeeId,
      comments: this.actionComments || undefined,
    };
    this.approvalService.approve(this.selectedApproval.id, dto).subscribe({
      next: (res) => {
        const raw = res as any;
        this.selectedApproval = (raw.data ?? raw) as ApprovalRequestDto;
        this.actionMode = null;
        this.resetActionForm();
        this.loadApprovals();
      },
      error: () => { this.error = 'Failed to approve step'; this.cdr.detectChanges(); },
    });
  }

  submitReject() {
    if (!this.selectedApproval || !this.actionApproverEmployeeId) {
      this.error = 'Approver Employee is required';
      this.cdr.detectChanges();
      return;
    }
    this.error = '';
    const dto: RejectStepDto = {
      approverEmployeeId: this.actionApproverEmployeeId,
      rejectionReason: this.actionRejectionReason || undefined,
      comments: this.actionComments || undefined,
    };
    this.approvalService.reject(this.selectedApproval.id, dto).subscribe({
      next: (res) => {
        const raw = res as any;
        this.selectedApproval = (raw.data ?? raw) as ApprovalRequestDto;
        this.actionMode = null;
        this.resetActionForm();
        this.loadApprovals();
      },
      error: () => { this.error = 'Failed to reject step'; this.cdr.detectChanges(); },
    });
  }

  cancelApproval(a: ApprovalRequestDto) {
    if (!confirm(`Cancel approval request "${a.approvalSubjectTitle ?? a.approvalRequestCode}"?`)) return;
    this.approvalService.cancel(a.id, 'Cancelled by user').subscribe({
      next: () => {
        if (this.selectedApproval?.id === a.id) this.selectedApproval = null;
        this.loadApprovals();
      },
      error: () => { this.error = 'Failed to cancel approval request'; this.cdr.detectChanges(); },
    });
  }

  openSubmitForm() { this.showSubmitForm = true; }
  closeSubmitForm() {
    this.showSubmitForm = false;
    this.submitEntityType = '';
    this.submitEntityId = '';
    this.submitWorkflowConfigId = '';
    this.submitRequestedByEmployeeId = '';
    this.submitSubjectTitle = '';
    this.submitSummary = '';
    this.submitComments = '';
  }

  submitNewApproval() {
    if (!this.submitEntityType.trim() || !this.submitEntityId.trim() || !this.submitRequestedByEmployeeId.trim()) {
      this.error = 'Entity Type, Entity ID and Requested By Employee ID are required';
      this.cdr.detectChanges();
      return;
    }
    this.error = '';
    this.approvalService.submit({
      entityType: this.submitEntityType,
      entityId: this.submitEntityId,
      workflowConfigId: this.submitWorkflowConfigId || undefined,
      requestedByEmployeeId: this.submitRequestedByEmployeeId,
      priorityLookupValueId: '00000000-0000-0000-0000-000000000000',
      approvalSubjectTitle: this.submitSubjectTitle || undefined,
      approvalSummary: this.submitSummary || undefined,
      comments: this.submitComments || undefined,
    }).subscribe({
      next: () => { this.closeSubmitForm(); this.loadApprovals(); },
      error: () => { this.error = 'Failed to submit approval request'; this.cdr.detectChanges(); },
    });
  }

  getWorkflowName(id: string): string {
    return this.workflows.find(w => w.id === id)?.workflowName ?? id;
  }
}
