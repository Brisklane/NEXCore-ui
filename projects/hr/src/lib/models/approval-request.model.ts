// ApprovalRequest DTOs
export interface ApprovalRequestStepDto {
  id: string;
  approvalRequestId: string;
  workflowConfigStepId: string;
  stepLevel: number;
  approverType?: string;
  approverValue?: string;
  approverEmployeeId?: string;
  mandatory: boolean;
  slaHours: number;
  executionType?: string;
  statusLookupValueId: string;
  statusLabel?: string;
  comments?: string;
  rejectionReason?: string;
  rejectionCategory?: string;
  actionDate?: string;
  delegatedToEmployeeId?: string;
  escalatedFlag: boolean;
  escalatedToEmployeeId?: string;
  createdAt: string;
  modifiedAt?: string;
}

export interface ApprovalRequestDto {
  id: string;
  companyId: string;
  approvalRequestCode?: string;
  entityType?: string;
  entityId: string;
  workflowConfigId: string;
  requestedByEmployeeId: string;
  currentLevel: number;
  totalLevels: number;
  overallStatusLookupValueId: string;
  overallStatusLabel?: string;
  priorityLookupValueId: string;
  priorityLabel?: string;
  requestedAt: string;
  completedAt?: string;
  comments?: string;
  approvalSubjectCode?: string;
  approvalSubjectTitle?: string;
  approvalSummary?: string;
  approvalDisplayName?: string;
  steps?: ApprovalRequestStepDto[];
  createdAt: string;
  modifiedAt?: string;
}

export interface SubmitApprovalRequestDto {
  entityType?: string;
  entityId: string;
  workflowConfigId?: string;
  requestedByEmployeeId: string;
  priorityLookupValueId: string;
  approvalSubjectCode?: string;
  approvalSubjectTitle?: string;
  approvalSummary?: string;
  approvalDisplayName?: string;
  comments?: string;
}

export interface UpdateApprovalRequestDto {
  priorityLookupValueId?: string;
  comments?: string;
  approvalSubjectTitle?: string;
  approvalSummary?: string;
  approvalDisplayName?: string;
}

export interface ApproveStepDto {
  approverEmployeeId: string;
  comments?: string;
}

export interface RejectStepDto {
  approverEmployeeId: string;
  rejectionReason?: string;
  rejectionCategory?: string;
  comments?: string;
}

export interface DelegateStepDto {
  fromEmployeeId: string;
  toEmployeeId: string;
  comments?: string;
}
