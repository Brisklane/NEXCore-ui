export interface PositionDto {
  id: string;
  companyId?: string;
  positionCode?: string;
  positionName?: string;
  departmentId: string;
  designationId: string;
  jobFamilyId?: string;
  jobFunctionId?: string;
  gradeId?: string;
  payScaleId?: string;
  reportsToPositionId?: string;
  isVacant: boolean;
  isActive: boolean;
  createdAt: string;
  modifiedAt?: string;
}

export interface CreatePositionDto {
  positionCode?: string;
  positionName?: string;
  departmentId: string;
  designationId: string;
  jobFamilyId?: string;
  jobFunctionId?: string;
  gradeId?: string;
  payScaleId?: string;
  reportsToPositionId?: string;
}

export interface UpdatePositionDto {
  positionName?: string;
  departmentId?: string;
  designationId?: string;
  jobFamilyId?: string;
  jobFunctionId?: string;
  gradeId?: string;
  payScaleId?: string;
  reportsToPositionId?: string;
  isVacant?: boolean;
  isActive?: boolean;
}
