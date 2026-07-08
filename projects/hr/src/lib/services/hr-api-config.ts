import { environment } from '@env';
const BASE_URL = environment.apiBaseUrl;

export const HR_API = {
  // Currency — Full CRUD
  currency: {
    getAll: `${BASE_URL}/api/v1/hr/Currency`,
    getById: (id: string) => `${BASE_URL}/api/v1/hr/Currency/${id}`,
    create: `${BASE_URL}/api/v1/hr/Currency`,
    update: (id: string) => `${BASE_URL}/api/v1/hr/Currency/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/hr/Currency/${id}`,
  },

  // AllowancesProfile — Full CRUD
  allowancesProfile: {
    getAll: `${BASE_URL}/api/v1/hr/AllowancesProfile`,
    getById: (id: string) => `${BASE_URL}/api/v1/hr/AllowancesProfile/${id}`,
    create: `${BASE_URL}/api/v1/hr/AllowancesProfile`,
    update: (id: string) => `${BASE_URL}/api/v1/hr/AllowancesProfile/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/hr/AllowancesProfile/${id}`,
  },

  // Application — Full CRUD + by-job + by-candidate
  application: {
    getAll: `${BASE_URL}/api/v1/hr/Application`,
    getById: (id: string) => `${BASE_URL}/api/v1/hr/Application/${id}`,
    create: `${BASE_URL}/api/v1/hr/Application`,
    update: (id: string) => `${BASE_URL}/api/v1/hr/Application/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/hr/Application/${id}`,
    byJob: (jobId: string) => `${BASE_URL}/api/v1/hr/Application/by-job/${jobId}`,
    byCandidate: (candidateId: string) => `${BASE_URL}/api/v1/hr/Application/by-candidate/${candidateId}`,
  },

  // BenefitsPlan — Full CRUD
  benefitsPlan: {
    getAll: `${BASE_URL}/api/v1/hr/BenefitsPlan`,
    getById: (id: string) => `${BASE_URL}/api/v1/hr/BenefitsPlan/${id}`,
    create: `${BASE_URL}/api/v1/hr/BenefitsPlan`,
    update: (id: string) => `${BASE_URL}/api/v1/hr/BenefitsPlan/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/hr/BenefitsPlan/${id}`,
  },

  // Employee — Full CRUD + by-department
  employee: {
    getAll: `${BASE_URL}/api/v1/hr/Employee`,
    getById: (id: string) => `${BASE_URL}/api/v1/hr/Employee/${id}`,
    create: `${BASE_URL}/api/v1/hr/Employee`,
    update: (id: string) => `${BASE_URL}/api/v1/hr/Employee/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/hr/Employee/${id}`,
    byDepartment: (departmentId: string) => `${BASE_URL}/api/v1/hr/Employee/by-department/${departmentId}`,
    byDesignation: (designationId: string) => `${BASE_URL}/api/v1/hr/Employee/by-designation/${designationId}`,
  },

  // Department — Full CRUD
  department: {
    getAll: `${BASE_URL}/api/v1/hr/Department`,
    getById: (id: string) => `${BASE_URL}/api/v1/hr/Department/${id}`,
    create: `${BASE_URL}/api/v1/hr/Department`,
    update: (id: string) => `${BASE_URL}/api/v1/hr/Department/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/hr/Department/${id}`,
    lookup: `${BASE_URL}/api/v1/hr/Department/lookup`,
  },

  // JobTitle / Designation — Full CRUD (backend exposes Designation)
  jobTitle: {
    getAll: `${BASE_URL}/api/v1/hr/Designation`,
    getById: (id: string) => `${BASE_URL}/api/v1/hr/Designation/${id}`,
    create: `${BASE_URL}/api/v1/hr/Designation`,
    update: (id: string) => `${BASE_URL}/api/v1/hr/Designation/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/hr/Designation/${id}`,
    lookup: `${BASE_URL}/api/v1/hr/Designation/lookup`,
  },

  // Job form combined lookups
  jobFormLookups: `${BASE_URL}/api/v1/hr/job-form/lookups`,

  // Job — Full CRUD + approve/reject + by-department
  jobRequisition: {
    getAll: `${BASE_URL}/api/v1/hr/Job`,
    getById: (id: string) => `${BASE_URL}/api/v1/hr/Job/${id}`,
    create: `${BASE_URL}/api/v1/hr/Job`,
    update: (id: string) => `${BASE_URL}/api/v1/hr/Job/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/hr/Job/${id}`,
    approve: (id: string) => `${BASE_URL}/api/v1/hr/Job/${id}/approve`,
    reject: (id: string) => `${BASE_URL}/api/v1/hr/Job/${id}/reject`,
    byDepartment: (departmentId: string) => `${BASE_URL}/api/v1/hr/Job/by-department/${departmentId}`,
  },

  jobTemplate: {
    getAll: `${BASE_URL}/api/v1/hr/JobTemplate`,
    getById: (id: string) => `${BASE_URL}/api/v1/hr/JobTemplate/${id}`,
    create: `${BASE_URL}/api/v1/hr/JobTemplate`,
    update: (id: string) => `${BASE_URL}/api/v1/hr/JobTemplate/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/hr/JobTemplate/${id}`,
  },

  // Candidate — Full CRUD + blacklist/unblacklist
  candidate: {
    getAll: `${BASE_URL}/api/v1/hr/Candidate`,
    getById: (id: string) => `${BASE_URL}/api/v1/hr/Candidate/${id}`,
    create: `${BASE_URL}/api/v1/hr/Candidate`,
    update: (id: string) => `${BASE_URL}/api/v1/hr/Candidate/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/hr/Candidate/${id}`,
    blacklist: (id: string) => `${BASE_URL}/api/v1/hr/Candidate/${id}/blacklist`,
    unblacklist: (id: string) => `${BASE_URL}/api/v1/hr/Candidate/${id}/unblacklist`,
  },

  // CandidateTask — Full CRUD + by-application + by-candidate
  candidateTask: {
    getAll: `${BASE_URL}/api/v1/hr/CandidateTask`,
    getById: (id: string) => `${BASE_URL}/api/v1/hr/CandidateTask/${id}`,
    create: `${BASE_URL}/api/v1/hr/CandidateTask`,
    update: (id: string) => `${BASE_URL}/api/v1/hr/CandidateTask/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/hr/CandidateTask/${id}`,
    byApplication: (applicationId: string) => `${BASE_URL}/api/v1/hr/CandidateTask/by-application/${applicationId}`,
    byCandidate: (candidateId: string) => `${BASE_URL}/api/v1/hr/CandidateTask/by-candidate/${candidateId}`,
  },

  // Interview — Full CRUD + by-application
  interview: {
    getAll: `${BASE_URL}/api/v1/hr/Interview`,
    getById: (id: string) => `${BASE_URL}/api/v1/hr/Interview/${id}`,
    create: `${BASE_URL}/api/v1/hr/Interview`,
    update: (id: string) => `${BASE_URL}/api/v1/hr/Interview/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/hr/Interview/${id}`,
    byApplication: (applicationId: string) => `${BASE_URL}/api/v1/hr/Interview/by-application/${applicationId}`,
  },

  // OfferLetter — Full CRUD
  offerLetter: {
    getAll: `${BASE_URL}/api/v1/hr/OfferLetter`,
    getById: (id: string) => `${BASE_URL}/api/v1/hr/OfferLetter/${id}`,
    create: `${BASE_URL}/api/v1/hr/OfferLetter`,
    update: (id: string) => `${BASE_URL}/api/v1/hr/OfferLetter/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/hr/OfferLetter/${id}`,
  },

  // JobOffer — Full CRUD + accept/decline + by-application
  jobOffer: {
    getAll: `${BASE_URL}/api/v1/hr/JobOffer`,
    getById: (id: string) => `${BASE_URL}/api/v1/hr/JobOffer/${id}`,
    create: `${BASE_URL}/api/v1/hr/JobOffer`,
    update: (id: string) => `${BASE_URL}/api/v1/hr/JobOffer/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/hr/JobOffer/${id}`,
    accept: (id: string) => `${BASE_URL}/api/v1/hr/JobOffer/${id}/accept`,
    decline: (id: string) => `${BASE_URL}/api/v1/hr/JobOffer/${id}/decline`,
    byApplication: (applicationId: string) => `${BASE_URL}/api/v1/hr/JobOffer/by-application/${applicationId}`,
  },

  // EmployeeContract — Full CRUD + by-employee
  employeeContract: {
    getAll: `${BASE_URL}/api/v1/hr/EmployeeContract`,
    getById: (id: string) => `${BASE_URL}/api/v1/hr/EmployeeContract/${id}`,
    create: `${BASE_URL}/api/v1/hr/EmployeeContract`,
    update: (id: string) => `${BASE_URL}/api/v1/hr/EmployeeContract/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/hr/EmployeeContract/${id}`,
    byEmployee: (employeeId: string) => `${BASE_URL}/api/v1/hr/EmployeeContract/by-employee/${employeeId}`,
  },

  // OnboardingTask — Full CRUD + by-employee + complete
  onboardingTask: {
    getAll: `${BASE_URL}/api/v1/hr/OnboardingTaskTemplate`,
    getById: (id: string) => `${BASE_URL}/api/v1/hr/OnboardingTaskTemplate/${id}`,
    create: `${BASE_URL}/api/v1/hr/OnboardingTaskTemplate`,
    update: (id: string) => `${BASE_URL}/api/v1/hr/OnboardingTaskTemplate/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/hr/OnboardingTaskTemplate/${id}`,
    byEmployee: (employeeId: string) => `${BASE_URL}/api/v1/hr/OnboardingTaskTemplate/by-employee/${employeeId}`,
    complete: (id: string) => `${BASE_URL}/api/v1/hr/OnboardingTaskTemplate/${id}/complete`,
  },

  // LeaveType — Full CRUD
  leaveType: {
    getAll: `${BASE_URL}/api/v1/hr/LeaveType`,
    getById: (id: string) => `${BASE_URL}/api/v1/hr/LeaveType/${id}`,
    create: `${BASE_URL}/api/v1/hr/LeaveType`,
    update: (id: string) => `${BASE_URL}/api/v1/hr/LeaveType/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/hr/LeaveType/${id}`,
  },

  // LeaveRequest — Full CRUD + by-employee + approve/reject
  leaveRequest: {
    getAll: `${BASE_URL}/api/v1/hr/LeaveRequest`,
    getById: (id: string) => `${BASE_URL}/api/v1/hr/LeaveRequest/${id}`,
    create: `${BASE_URL}/api/v1/hr/LeaveRequest`,
    update: (id: string) => `${BASE_URL}/api/v1/hr/LeaveRequest/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/hr/LeaveRequest/${id}`,
    byEmployee: (employeeId: string) => `${BASE_URL}/api/v1/hr/LeaveRequest/by-employee/${employeeId}`,
    approve: (id: string) => `${BASE_URL}/api/v1/hr/LeaveRequest/${id}/approve`,
    reject: (id: string) => `${BASE_URL}/api/v1/hr/LeaveRequest/${id}/reject`,
  },

  // AttendanceRecord — Full CRUD + by-employee + by-date
  attendanceRecord: {
    getAll: `${BASE_URL}/api/v1/hr/AttendanceRecord`,
    getById: (id: string) => `${BASE_URL}/api/v1/hr/AttendanceRecord/${id}`,
    create: `${BASE_URL}/api/v1/hr/AttendanceRecord`,
    update: (id: string) => `${BASE_URL}/api/v1/hr/AttendanceRecord/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/hr/AttendanceRecord/${id}`,
    byEmployee: (employeeId: string) => `${BASE_URL}/api/v1/hr/AttendanceRecord/by-employee/${employeeId}`,
    byDate: (date: string) => `${BASE_URL}/api/v1/hr/AttendanceRecord/by-date/${date}`,
  },

  // PayrollRun — Full CRUD + process
  payrollRun: {
    getAll: `${BASE_URL}/api/v1/hr/PayrollRun`,
    getById: (id: string) => `${BASE_URL}/api/v1/hr/PayrollRun/${id}`,
    create: `${BASE_URL}/api/v1/hr/PayrollRun`,
    update: (id: string) => `${BASE_URL}/api/v1/hr/PayrollRun/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/hr/PayrollRun/${id}`,
    process: (id: string) => `${BASE_URL}/api/v1/hr/PayrollRun/${id}/process`,
  },

  // SalaryStructure — Full CRUD + by-employee
  salaryStructure: {
    getAll: `${BASE_URL}/api/v1/hr/SalaryStructure`,
    getById: (id: string) => `${BASE_URL}/api/v1/hr/SalaryStructure/${id}`,
    create: `${BASE_URL}/api/v1/hr/SalaryStructure`,
    update: (id: string) => `${BASE_URL}/api/v1/hr/SalaryStructure/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/hr/SalaryStructure/${id}`,
    byEmployee: (employeeId: string) => `${BASE_URL}/api/v1/hr/SalaryStructure/by-employee/${employeeId}`,
  },

  // Deduction — Full CRUD
  deduction: {
    getAll: `${BASE_URL}/api/v1/hr/Deduction`,
    getById: (id: string) => `${BASE_URL}/api/v1/hr/Deduction/${id}`,
    create: `${BASE_URL}/api/v1/hr/Deduction`,
    update: (id: string) => `${BASE_URL}/api/v1/hr/Deduction/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/hr/Deduction/${id}`,
  },

  // Lookup Types + Values — CRUD
  lookup: {
    getAllTypes: `${BASE_URL}/api/v1/hr/Lookup/types`,
    createType: `${BASE_URL}/api/v1/hr/Lookup/types`,
    getTypeById: (id: string) => `${BASE_URL}/api/v1/hr/Lookup/types/${id}`,
    deleteType: (id: string) => `${BASE_URL}/api/v1/hr/Lookup/types/${id}`,
    getValuesByType: (typeId: string) => `${BASE_URL}/api/v1/hr/Lookup/types/${typeId}/values`,
    getValueById: (id: string) => `${BASE_URL}/api/v1/hr/Lookup/values/${id}`,
    createValue: `${BASE_URL}/api/v1/hr/Lookup/values`,
    deleteValue: (id: string) => `${BASE_URL}/api/v1/hr/Lookup/values/${id}`,
    seedValues: `${BASE_URL}/api/v1/hr/seed/lookup-values`,
  },

  // Position — Full CRUD
  position: {
    getAll: `${BASE_URL}/api/v1/hr/Position`,
    getById: (id: string) => `${BASE_URL}/api/v1/hr/Position/${id}`,
    create: `${BASE_URL}/api/v1/hr/Position`,
    update: (id: string) => `${BASE_URL}/api/v1/hr/Position/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/hr/Position/${id}`,
  },

  // JobLocation — Full CRUD
  jobLocation: {
    getAll: `${BASE_URL}/api/v1/hr/JobLocation`,
    getById: (id: string) => `${BASE_URL}/api/v1/hr/JobLocation/${id}`,
    create: `${BASE_URL}/api/v1/hr/JobLocation`,
    update: (id: string) => `${BASE_URL}/api/v1/hr/JobLocation/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/hr/JobLocation/${id}`,
  },

  // JobPostingChannel — Full CRUD
  jobPostingChannel: {
    getAll: `${BASE_URL}/api/v1/hr/JobPostingChannel`,
    getById: (id: string) => `${BASE_URL}/api/v1/hr/JobPostingChannel/${id}`,
    create: `${BASE_URL}/api/v1/hr/JobPostingChannel`,
    update: (id: string) => `${BASE_URL}/api/v1/hr/JobPostingChannel/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/hr/JobPostingChannel/${id}`,
  },

  // ChannelTemplate — Full CRUD
  channelTemplate: {
    getAll: `${BASE_URL}/api/v1/hr/ChannelTemplate`,
    getById: (id: string) => `${BASE_URL}/api/v1/hr/ChannelTemplate/${id}`,
    create: `${BASE_URL}/api/v1/hr/ChannelTemplate`,
    update: (id: string) => `${BASE_URL}/api/v1/hr/ChannelTemplate/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/hr/ChannelTemplate/${id}`,
  },

  // CommunicationTemplate — Full CRUD
  communicationTemplate: {
    getAll: `${BASE_URL}/api/v1/hr/CommunicationTemplate`,
    getById: (id: string) => `${BASE_URL}/api/v1/hr/CommunicationTemplate/${id}`,
    create: `${BASE_URL}/api/v1/hr/CommunicationTemplate`,
    update: (id: string) => `${BASE_URL}/api/v1/hr/CommunicationTemplate/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/hr/CommunicationTemplate/${id}`,
    byCode: (code: string) => `${BASE_URL}/api/v1/hr/CommunicationTemplate/by-code/${code}`,
  },

  // WorkflowConfig — Full CRUD
  workflowConfig: {
    getAll: `${BASE_URL}/api/v1/hr/WorkflowConfig`,
    getById: (id: string) => `${BASE_URL}/api/v1/hr/WorkflowConfig/${id}`,
    create: `${BASE_URL}/api/v1/hr/WorkflowConfig`,
    update: (id: string) => `${BASE_URL}/api/v1/hr/WorkflowConfig/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/hr/WorkflowConfig/${id}`,
  },

  // WorkflowConfigStep — Full CRUD + by-workflow
  workflowConfigStep: {
    getAll: `${BASE_URL}/api/v1/hr/WorkflowConfigStep`,
    getById: (id: string) => `${BASE_URL}/api/v1/hr/WorkflowConfigStep/${id}`,
    create: `${BASE_URL}/api/v1/hr/WorkflowConfigStep`,
    update: (id: string) => `${BASE_URL}/api/v1/hr/WorkflowConfigStep/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/hr/WorkflowConfigStep/${id}`,
    byWorkflow: (workflowConfigId: string) => `${BASE_URL}/api/v1/hr/WorkflowConfigStep/by-workflow/${workflowConfigId}`,
  },

  // WorkflowCondition — Full CRUD + by-workflow
  workflowCondition: {
    getAll: `${BASE_URL}/api/v1/hr/WorkflowCondition`,
    getById: (id: string) => `${BASE_URL}/api/v1/hr/WorkflowCondition/${id}`,
    create: `${BASE_URL}/api/v1/hr/WorkflowCondition`,
    update: (id: string) => `${BASE_URL}/api/v1/hr/WorkflowCondition/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/hr/WorkflowCondition/${id}`,
    byWorkflow: (workflowConfigId: string) => `${BASE_URL}/api/v1/hr/WorkflowCondition/by-workflow/${workflowConfigId}`,
  },

  // WorkflowEscalation — Full CRUD + by-step
  workflowEscalation: {
    getAll: `${BASE_URL}/api/v1/hr/WorkflowEscalation`,
    getById: (id: string) => `${BASE_URL}/api/v1/hr/WorkflowEscalation/${id}`,
    create: `${BASE_URL}/api/v1/hr/WorkflowEscalation`,
    update: (id: string) => `${BASE_URL}/api/v1/hr/WorkflowEscalation/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/hr/WorkflowEscalation/${id}`,
    byStep: (stepId: string) => `${BASE_URL}/api/v1/hr/WorkflowEscalation/by-step/${stepId}`,
  },

  // Approval — Submit + actions
  approval: {
    getAll: `${BASE_URL}/api/v1/hr/Approval`,
    getById: (id: string) => `${BASE_URL}/api/v1/hr/Approval/${id}`,
    submit: `${BASE_URL}/api/v1/hr/Approval`,
    update: (id: string) => `${BASE_URL}/api/v1/hr/Approval/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/hr/Approval/${id}`,
    byEntity: (entityType: string, entityId: string) => `${BASE_URL}/api/v1/hr/Approval/by-entity/${entityType}/${entityId}`,
    pendingByEmployee: (approverEmployeeId: string) => `${BASE_URL}/api/v1/hr/Approval/pending/employee/${approverEmployeeId}`,
    approve: (id: string) => `${BASE_URL}/api/v1/hr/Approval/${id}/approve`,
    reject: (id: string) => `${BASE_URL}/api/v1/hr/Approval/${id}/reject`,
    delegate: (id: string) => `${BASE_URL}/api/v1/hr/Approval/${id}/delegate`,
    cancel: (id: string) => `${BASE_URL}/api/v1/hr/Approval/${id}/cancel`,
  },
};
