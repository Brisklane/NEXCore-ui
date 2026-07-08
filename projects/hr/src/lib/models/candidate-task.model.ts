export interface CandidateTaskDto {
  id: string;
  taskCode?: string;
  applicationId?: string;
  candidateId?: string;
  jobId?: string;
  taskTypeLookupValueId?: string;
  sourceType?: string;
  externalProvider?: string;
  dueDate?: string;
  statusLookupValueId?: string;
  assignedByEmployeeId?: string;
  description?: string;
  maxScore?: number;
  passingScore?: number;
  attemptAllowed?: number;
  isMandatory?: boolean;
  createdAt?: string;
  modifiedAt?: string;
}

export interface CreateCandidateTaskDto {
  taskCode?: string;
  applicationId?: string;
  candidateId?: string;
  jobId?: string;
  taskTypeLookupValueId?: string;
  sourceType?: string;
  externalProvider?: string;
  dueDate?: string;
  statusLookupValueId?: string;
  assignedByEmployeeId?: string;
  description?: string;
  maxScore?: number;
  passingScore?: number;
  attemptAllowed?: number;
  isMandatory?: boolean;
}

export interface UpdateCandidateTaskDto {
  taskCode?: string;
  applicationId?: string;
  candidateId?: string;
  jobId?: string;
  taskTypeLookupValueId?: string;
  sourceType?: string;
  externalProvider?: string;
  dueDate?: string;
  statusLookupValueId?: string;
  assignedByEmployeeId?: string;
  description?: string;
  maxScore?: number;
  passingScore?: number;
  attemptAllowed?: number;
  isMandatory?: boolean;
}
