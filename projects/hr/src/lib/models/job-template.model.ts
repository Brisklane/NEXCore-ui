export interface JobTemplateDto {
  id: string;
  templateCode: string;
  templateName: string;
  jobTitle: string;
  departmentId?: string;
  designationId?: string;
  employmentType?: string;
  description?: string;
  requirements?: string;
  requiredSkills?: string;
  responsibilities?: string;
  isActive: boolean;
  createdAt?: string;
  modifiedAt?: string;
}

export interface CreateJobTemplateDto {
  templateCode: string;
  templateName: string;
  jobTitle: string;
  departmentId?: string;
  designationId?: string;
  employmentType?: string;
  description?: string;
  requirements?: string;
  requiredSkills?: string;
  responsibilities?: string;
  isActive?: boolean;
}

export interface UpdateJobTemplateDto {
  templateName?: string;
  jobTitle?: string;
  departmentId?: string;
  designationId?: string;
  employmentType?: string;
  description?: string;
  requirements?: string;
  requiredSkills?: string;
  responsibilities?: string;
  isActive?: boolean;
}
