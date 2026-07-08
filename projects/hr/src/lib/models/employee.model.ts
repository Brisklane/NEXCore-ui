export interface EmployeeDto {
  id: string;
  companyId?: string;
  employeeCode?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  email?: string;
  phone?: string;
  departmentId?: string;
  designationId?: string;
  positionId?: string;
  reportingManagerId?: string;
  jobLocationId?: string;
  status?: number;
  joinDate?: string;
  exitDate?: string;
  isActive: boolean;
  createdAt: string;
  modifiedAt?: string;
}

export interface CreateEmployeeDto {
  employeeCode?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  email?: string;
  phone?: string;
  departmentId?: string;
  designationId?: string;
  positionId?: string;
  reportingManagerId?: string;
  jobLocationId?: string;
  status?: number;
  joinDate?: string;
}

export interface UpdateEmployeeDto {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  email?: string;
  phone?: string;
  departmentId?: string;
  designationId?: string;
  positionId?: string;
  reportingManagerId?: string;
  jobLocationId?: string;
  status?: number;
  joinDate?: string;
  exitDate?: string;
  isActive?: boolean;
}
