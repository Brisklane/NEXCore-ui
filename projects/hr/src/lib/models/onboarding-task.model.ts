// Maps to HR.Application.DTOs.OnboardingTaskTemplateDto (backend endpoint: /api/v1/hr/OnboardingTaskTemplate)
export interface OnboardingTaskDto {
  id: string;
  companyId?: string;
  templateCode?: string;
  taskName?: string;
  taskCategory?: string;
  description?: string;
  defaultAssigneeRole?: string;
  defaultDueDaysFromStart: number;
  isRequired: boolean;
  sortOrder: number;
  applicableDepartmentId?: string;
  applicableDesignationId?: string;
  applicableEmploymentType?: string;
  estimatedHours?: number;
  requiresDocumentUpload: boolean;
  requiresManagerSignoff: boolean;
  isActive: boolean;
  createdAt: string;
  modifiedAt?: string;
}

export interface CreateOnboardingTaskDto {
  templateCode?: string;
  taskName?: string;
  taskCategory?: string;
  description?: string;
  defaultAssigneeRole?: string;
  defaultDueDaysFromStart?: number;
  isRequired?: boolean;
  sortOrder?: number;
  applicableDepartmentId?: string;
  applicableDesignationId?: string;
  applicableEmploymentType?: string;
  estimatedHours?: number;
  requiresDocumentUpload?: boolean;
  requiresManagerSignoff?: boolean;
}

export interface UpdateOnboardingTaskDto {
  taskName?: string;
  taskCategory?: string;
  description?: string;
  defaultAssigneeRole?: string;
  defaultDueDaysFromStart?: number;
  isRequired?: boolean;
  sortOrder?: number;
  estimatedHours?: number;
  requiresDocumentUpload?: boolean;
  requiresManagerSignoff?: boolean;
  isActive?: boolean;
}
