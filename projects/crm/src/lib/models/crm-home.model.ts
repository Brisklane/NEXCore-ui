import { ContactDto } from './contact.model';
import { AccountDto } from './account.model';

export interface CrmHomeDashboard {
  leadsByStatus?:   Record<string, number> | null;
  dealsByStage?:    Record<string, number> | null;
  casesByPriority?: Record<string, number> | null;
  recentContacts?:  ContactDto[]           | null;
  recentAccounts?:  AccountDto[]           | null;
}
