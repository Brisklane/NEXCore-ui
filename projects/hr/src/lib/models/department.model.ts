export interface DepartmentDto {
  id: string;
  companyId?: string;
  departmentCode?: string;
  departmentName?: string;
  parentDepartmentId?: string;
  departmentHeadEmployeeId?: string;
  costCenterId?: string;
  isActive: boolean;
  createdAt: string;
  modifiedAt?: string;
}

export interface CreateDepartmentDto {
  departmentCode?: string;
  departmentName?: string;
  parentDepartmentId?: string;
  departmentHeadEmployeeId?: string;
  costCenterId?: string;
}

export interface UpdateDepartmentDto {
  departmentName?: string;
  parentDepartmentId?: string;
  departmentHeadEmployeeId?: string;
  costCenterId?: string;
  isActive?: boolean;
}
