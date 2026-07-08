import { Routes } from '@angular/router';
import { CrmHomeComponent } from './pages/crm-home/crm-home';
import { AccountsComponent } from './pages/accounts/accounts';
import { LeadsComponent } from './pages/leads/leads';
import { LeadDetailComponent } from './pages/leads/lead-detail/lead-detail';
import { ContactsComponent } from './pages/contacts/contacts';
import { DealsComponent } from './pages/deals/deals';
import { CallsComponent } from './pages/calls/calls';
import { MeetingsComponent } from './pages/meetings/meetings';
import { TasksComponent } from './pages/tasks/tasks';
import { CampaignsComponent } from './pages/campaigns/campaigns';
import { CampaignPerformanceComponent } from './pages/campaign-performance/campaign-performance';
import { CasesComponent } from './pages/cases/cases';
import { PipelinesComponent } from './pages/pipelines/pipelines';
import { KnowledgeArticlesComponent } from './pages/knowledge-articles/knowledge-articles';

export const crmRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: CrmHomeComponent },
  { path: 'home', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'accounts', component: AccountsComponent },
  { path: 'leads/:id', component: LeadDetailComponent },
  { path: 'leads', component: LeadsComponent },
  { path: 'contacts', component: ContactsComponent },
  { path: 'deals', component: DealsComponent },
  { path: 'calls', component: CallsComponent },
  { path: 'meetings', component: MeetingsComponent },
  { path: 'tasks', component: TasksComponent },
  { path: 'campaigns', component: CampaignsComponent },
  { path: 'campaign-performance', component: CampaignPerformanceComponent },
  { path: 'cases', component: CasesComponent },
  { path: 'pipelines', component: PipelinesComponent },
  { path: 'knowledge-articles', component: KnowledgeArticlesComponent },
];
