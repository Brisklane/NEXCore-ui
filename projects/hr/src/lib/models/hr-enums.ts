// ── HR.Application.Enums ──────────────────────────────────────────────────

export enum RemoteType {
  OnSite = 'OnSite',
  Remote = 'Remote',
  Hybrid = 'Hybrid',
}

export enum WorkerCategory {
  Employee = 'Employee',
  Contractor = 'Contractor',
  Consultant = 'Consultant',
  Intern = 'Intern',
  Temporary = 'Temporary',
}

export enum VacancyReason {
  NewPosition = 'NewPosition',
  Replacement = 'Replacement',
  Expansion = 'Expansion',
  Backfill = 'Backfill',
  Restructuring = 'Restructuring',
}

export enum HiringType {
  External = 'External',
  Internal = 'Internal',
  Rehire = 'Rehire',
  Transfer = 'Transfer',
}

export enum PositionCriticality {
  Critical = 'Critical',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export enum SecurityClearanceLevel {
  None = 'None',
  Confidential = 'Confidential',
  Secret = 'Secret',
  TopSecret = 'TopSecret',
}

export enum EEOCategory {
  ExecutivesSeniorLevelManagers = 'ExecutivesSeniorLevelManagers',
  FirstMidLevelManagers = 'FirstMidLevelManagers',
  Professionals = 'Professionals',
  Technicians = 'Technicians',
  SalesWorkers = 'SalesWorkers',
  AdministrativeSupport = 'AdministrativeSupport',
  CraftWorkers = 'CraftWorkers',
  Operatives = 'Operatives',
  LaborersHelpers = 'LaborersHelpers',
  ServiceWorkers = 'ServiceWorkers',
}

export enum CandidateSource {
  LinkedIn = 'LinkedIn',
  Indeed = 'Indeed',
  Referral = 'Referral',
  CareerSite = 'CareerSite',
  Agency = 'Agency',
  JobFair = 'JobFair',
  Internal = 'Internal',
  Campus = 'Campus',
  Other = 'Other',
}

export enum CandidateRating {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
}

export enum CallType {
  Screening = 'Screening',
  Interview = 'Interview',
  OfferDiscussion = 'OfferDiscussion',
  FollowUp = 'FollowUp',
  Rejection = 'Rejection',
  General = 'General',
}

export enum CallOutcome {
  Interested = 'Interested',
  NotInterested = 'NotInterested',
  FollowUpRequired = 'FollowUpRequired',
  ScheduledInterview = 'ScheduledInterview',
  OfferAccepted = 'OfferAccepted',
  OfferDeclined = 'OfferDeclined',
  NoAnswer = 'NoAnswer',
  LeftVoicemail = 'LeftVoicemail',
  Rescheduled = 'Rescheduled',
}

export enum ContactMethod {
  Phone = 'Phone',
  Email = 'Email',
  WhatsApp = 'WhatsApp',
  VideoCall = 'VideoCall',
  InPerson = 'InPerson',
  SMS = 'SMS',
}

export enum CallDirection {
  Inbound = 'Inbound',
  Outbound = 'Outbound',
}

export enum NextActionType {
  ScheduleInterview = 'ScheduleInterview',
  SendOffer = 'SendOffer',
  SendRejection = 'SendRejection',
  FollowUp = 'FollowUp',
  RequestDocuments = 'RequestDocuments',
  None = 'None',
}

export enum OnboardingTaskCategory {
  Documentation = 'Documentation',
  ITSetup = 'ITSetup',
  Training = 'Training',
  Orientation = 'Orientation',
  Compliance = 'Compliance',
  Benefits = 'Benefits',
  Payroll = 'Payroll',
  AccessSetup = 'AccessSetup',
  Other = 'Other',
}

export enum HireReadiness {
  StrongYes = 'StrongYes',
  Yes = 'Yes',
  Maybe = 'Maybe',
  No = 'No',
  StrongNo = 'StrongNo',
}

export enum EmployeeStatus {
  Active = 'Active',
  OnLeave = 'OnLeave',
  Probation = 'Probation',
  Terminated = 'Terminated',
  Resigned = 'Resigned',
  Retired = 'Retired',
  Suspended = 'Suspended',
}

// ── NexCore.SharedKernel.Enums ──────────────────────────────────────────

export enum ApprovalDecision {
  Approved = 1,
  Rejected = 2,
  Escalated = 3,
  OnHold = 4,
  ConditionallyApproved = 5,
  Pending = 6,
}

export enum EmploymentType {
  FullTime = 'FullTime',
  PartTime = 'PartTime',
  Contract = 'Contract',
  Temporary = 'Temporary',
  Internship = 'Internship',
  Freelance = 'Freelance',
  Apprenticeship = 'Apprenticeship',
}

export enum InterviewFormat {
  InPerson = 'InPerson',
  VideoCall = 'VideoCall',
  Phone = 'Phone',
  Panel = 'Panel',
  Technical = 'Technical',
  Assessment = 'Assessment',
}

export enum JobRecordType {
  Job = 0,
  Requisition = 1,
}

// ── Lookup type codes ─────────────────────────────────────────────────────
// These match the `code` field on LookupTypeDto records seeded in the database.

export enum LookupTypeCode {
  ChannelType = 'CHANNEL_TYPE',
  PostingStatus = 'POSTING_STATUS',
  CandidateStatus = 'CANDIDATE_STATUS',
  ApplicationStatus = 'APPLICATION_STATUS',
  ApplicationStage = 'APPLICATION_STAGE',
  InterviewType = 'INTERVIEW_TYPE',
  InterviewStatus = 'INTERVIEW_STATUS',
  OfferStatus = 'OFFER_STATUS',
  CandidateResponse = 'CANDIDATE_RESPONSE',
  AddressType = 'ADDRESS_TYPE',
  ContactType = 'CONTACT_TYPE',
  MediaType = 'MEDIA_TYPE',
  SkillType = 'SKILL_TYPE',
  Proficiency = 'PROFICIENCY',
  BlacklistReason = 'BLACKLIST_REASON',
  Priority = 'PRIORITY',
  JobStatus = 'JOB_STATUS',
  InviteStatus = 'INVITE_STATUS',
  SlotStatus = 'SLOT_STATUS',
  Decision = 'DECISION',
  Recommendation = 'RECOMMENDATION',
}

export enum JobPostingStatus {
  NOTPublished = 'NotPublished',
  ACTIVE = 'Active',
    PAUSED = 'Paused',
    CLOSED = 'Closed',
    DRAFT = 'Draft',
}
