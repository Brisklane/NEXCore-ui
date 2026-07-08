export interface EmployeeContractDto {
  id: string;
  employeeId: string;
  startDate: string;
  endDate?: string;
  contractType: string;
  salary: number;
  currency: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  modifiedAt: string;
}

export interface CreateEmployeeContractDto {
  employeeId: string;
  startDate: string;
  endDate?: string;
  contractType: string;
  salary: number;
  currency?: string;
  notes?: string;
}

export interface UpdateEmployeeContractDto {
  endDate?: string;
  contractType?: string;
  salary?: number;
  currency?: string;
  isActive?: boolean;
  notes?: string;
}
