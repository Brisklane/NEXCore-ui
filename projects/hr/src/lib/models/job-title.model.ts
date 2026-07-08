// Backend exposes this as Designation — field names match DesignationDto schema
export interface JobTitleDto {
  id: string;
  companyId?: string;
  designationCode?: string;
  designationName?: string;
  jobFamilyId?: string;
  jobFunctionId?: string;
  gradeId?: string;
  isActive: boolean;
  createdAt: string;
  modifiedAt?: string;
}

export interface CreateJobTitleDto {
  designationCode?: string;
  designationName?: string;
  jobFamilyId?: string;
  jobFunctionId?: string;
  gradeId?: string;
}

export interface UpdateJobTitleDto {
  designationName?: string;
  jobFamilyId?: string;
  jobFunctionId?: string;
  gradeId?: string;
  isActive?: boolean;
}
