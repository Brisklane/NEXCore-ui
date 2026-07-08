/*
 * Public API Surface of crm
 */

export * from './lib/crm';
export * from './lib/crm.routes';

// Models
export * from './lib/models/index';

// Services
export * from './lib/services/crm-api-config';
export * from './lib/services/crm-auth-helper';
export * from './lib/services/account.service';
export * from './lib/services/activity.service';
export * from './lib/services/attachment.service';
export * from './lib/services/campaign.service';
export * from './lib/services/case.service';
export * from './lib/services/contact.service';
export * from './lib/services/contact-list.service';
export * from './lib/services/deal.service';
export * from './lib/services/email-message.service';
export * from './lib/services/entitlement.service';
export * from './lib/services/knowledge-article.service';
export * from './lib/services/lead.service';
export * from './lib/services/note.service';
export * from './lib/services/pipeline.service';
export * from './lib/services/tag.service';

// Pages
export * from './lib/pages/accounts/accounts';
export * from './lib/pages/leads/leads';
export * from './lib/pages/contacts/contacts';
export * from './lib/pages/deals/deals';
export * from './lib/pages/activities/activities';
export * from './lib/pages/calls/calls';
export * from './lib/pages/meetings/meetings';
export * from './lib/pages/tasks/tasks';
export * from './lib/pages/campaigns/campaigns';
export * from './lib/pages/campaign-performance/campaign-performance';
export * from './lib/pages/cases/cases';
export * from './lib/pages/pipelines/pipelines';
export * from './lib/pages/knowledge-articles/knowledge-articles';

