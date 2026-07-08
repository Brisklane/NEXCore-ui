// WorkflowConfig DTOs
export interface WorkflowConfigDto {
  id: string;
  companyId: string;
  workflowCode?: string;
  module?: string;
  transactionType?: string;
  workflowName?: string;
  totalLevels: number;
  isActive: boolean;
  effectiveFrom?: string;
  effectiveTo?: string;
  description?: string;
  createdAt: string;
  modifiedAt?: string;
}

export interface CreateWorkflowConfigDto {
  workflowCode?: string;
  module?: string;
  transactionType?: string;
  workflowName?: string;
  totalLevels: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  description?: string;
}

export interface UpdateWorkflowConfigDto {
  workflowName?: string;
  module?: string;
  transactionType?: string;
  totalLevels?: number;
  isActive?: boolean;
  effectiveFrom?: string;
  effectiveTo?: string;
  description?: string;
}

// WorkflowConfigStep DTOs
export interface WorkflowConfigStepDto {
  id: string;
  companyId: string;
  workflowConfigId: string;
  levelNo: number;
  approverType?: string;
  approverValue?: string;
  mandatory: boolean;
  slaHours: number;
  executionType?: string;
  sortOrder: number;
  isConditional: boolean;
  createdAt: string;
  modifiedAt?: string;
}

export interface CreateWorkflowConfigStepDto {
  workflowConfigId: string;
  levelNo: number;
  approverType?: string;
  approverValue?: string;
  mandatory: boolean;
  slaHours: number;
  executionType?: string;
  sortOrder: number;
  isConditional: boolean;
}

export interface UpdateWorkflowConfigStepDto {
  levelNo?: number;
  approverType?: string;
  approverValue?: string;
  mandatory?: boolean;
  slaHours?: number;
  executionType?: string;
  sortOrder?: number;
  isConditional?: boolean;
}

// WorkflowCondition DTOs
export interface WorkflowConditionDto {
  id: string;
  companyId: string;
  workflowConfigId: string;
  fieldName?: string;
  operator?: string;
  fieldValue?: string;
  actionType?: string;
  actionValue?: string;
  logicalGroup: number;
  joinOperator?: string;
  createdAt: string;
  modifiedAt?: string;
}

export interface CreateWorkflowConditionDto {
  workflowConfigId: string;
  fieldName?: string;
  operator?: string;
  fieldValue?: string;
  actionType?: string;
  actionValue?: string;
  logicalGroup: number;
  joinOperator?: string;
}

export interface UpdateWorkflowConditionDto {
  fieldName?: string;
  operator?: string;
  fieldValue?: string;
  actionType?: string;
  actionValue?: string;
  logicalGroup?: number;
  joinOperator?: string;
}

// WorkflowEscalation DTOs
export interface WorkflowEscalationDto {
  id: string;
  companyId: string;
  workflowConfigStepId: string;
  afterHours: number;
  actionType?: string;
  actionTarget?: string;
  reminderCount: number;
  autoApproveFlag: boolean;
  isActive: boolean;
  createdAt: string;
  modifiedAt?: string;
}

export interface CreateWorkflowEscalationDto {
  workflowConfigStepId: string;
  afterHours: number;
  actionType?: string;
  actionTarget?: string;
  reminderCount: number;
  autoApproveFlag: boolean;
}

export interface UpdateWorkflowEscalationDto {
  afterHours?: number;
  actionType?: string;
  actionTarget?: string;
  reminderCount?: number;
  autoApproveFlag?: boolean;
  isActive?: boolean;
}
