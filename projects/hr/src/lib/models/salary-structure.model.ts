export interface SalaryStructureDto {
  id: string;
  employeeId: string;
  basicSalary: number;
  currency: string;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  createdAt: string;
  modifiedAt: string;
}

export interface CreateSalaryStructureDto {
  employeeId: string;
  basicSalary: number;
  currency?: string;
  effectiveFrom: string;
  effectiveTo?: string;
}

export interface UpdateSalaryStructureDto {
  basicSalary?: number;
  currency?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  isActive?: boolean;
}
