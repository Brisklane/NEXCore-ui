// Matches JobDto / CreateJobDto / UpdateJobDto from backend Swagger schema
export interface JobRequisitionDto {
  id: string;
  companyId?: string;
  jobCode?: string;
  jobTitle?: string;
  recordType: string;
  departmentId: string;
  designationId: string;
  headcount: number;
  filledCount?: number;
  employmentType?: number;
  priorityLookupValueId?: string;
  statusLookupValueId?: string;
  requestedByEmployeeId?: string;
  hiringManagerEmployeeId?: string;
  recruiterEmployeeId?: string;
  currencyId?: string;
  salaryRangeMin?: number;
  salaryRangeMax?: number;
  targetStartDate?: string;
  postingStartDate?: string;
  postingCloseDate?: string;
  createdAt: string;
  modifiedAt?: string;
}

export interface CreateJobRequisitionDto {
  jobCode?: string;
  jobTitle?: string;
  recordType: number;
  departmentId: string;
  designationId: string;
  headcount: number;
  employmentType?: number;
  priorityLookupValueId?: string;
  statusLookupValueId?: string;
  requestedByEmployeeId?: string;
  hiringManagerEmployeeId?: string;
  recruiterEmployeeId?: string;
  currencyId?: string;
  salaryRangeMin?: number;
  salaryRangeMax?: number;
  targetStartDate?: string;
}

export interface UpdateJobRequisitionDto {
  jobTitle?: string;
  employmentType?: number;
  headcount?: number;
  priorityLookupValueId?: string;
  statusLookupValueId?: string;
  requestedByEmployeeId?: string;
  hiringManagerEmployeeId?: string;
  recruiterEmployeeId?: string;
  currencyId?: string;
  salaryRangeMin?: number;
  salaryRangeMax?: number;
  targetStartDate?: string;
}
