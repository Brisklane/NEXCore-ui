import { environment } from '@env';
const BASE_URL = environment.apiBaseUrl;

export const CRM_API = {
  // Home dashboard (single aggregated endpoint)
  home: `${BASE_URL}/api/v1/crm/home`,
  // Accounts
  accounts: {
    getAll: `${BASE_URL}/api/v1/Accounts`,
    getById: (id: string) => `${BASE_URL}/api/v1/Accounts/${id}`,
    create: `${BASE_URL}/api/v1/Accounts`,
    update: (id: string) => `${BASE_URL}/api/v1/Accounts/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/Accounts/${id}`,
  },
  // Activities
  activities: {
    getAll: `${BASE_URL}/api/v1/Activities`,
    getById: (id: string) => `${BASE_URL}/api/v1/Activities/${id}`,
    create: `${BASE_URL}/api/v1/Activities`,
    update: (id: string) => `${BASE_URL}/api/v1/Activities/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/Activities/${id}`,
  },
  // Attachments
  attachments: {
    getAll: `${BASE_URL}/api/v1/Attachments`,
    getById: (id: string) => `${BASE_URL}/api/v1/Attachments/${id}`,
    create: `${BASE_URL}/api/v1/Attachments`,
    delete: (id: string) => `${BASE_URL}/api/v1/Attachments/${id}`,
  },
  // Campaigns
  campaigns: {
    getAll: `${BASE_URL}/api/v1/Campaigns`,
    getById: (id: string) => `${BASE_URL}/api/v1/Campaigns/${id}`,
    create: `${BASE_URL}/api/v1/Campaigns`,
    update: (id: string) => `${BASE_URL}/api/v1/Campaigns/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/Campaigns/${id}`,
    getMembers: (id: string) => `${BASE_URL}/api/v1/Campaigns/${id}/members`,
    addMember: (id: string) => `${BASE_URL}/api/v1/Campaigns/${id}/members`,
    removeMember: (id: string, memberId: string) => `${BASE_URL}/api/v1/Campaigns/${id}/members/${memberId}`,
  },
  // Cases
  cases: {
    getAll: `${BASE_URL}/api/v1/Cases`,
    getById: (id: string) => `${BASE_URL}/api/v1/Cases/${id}`,
    create: `${BASE_URL}/api/v1/Cases`,
    update: (id: string) => `${BASE_URL}/api/v1/Cases/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/Cases/${id}`,
    getComments: (id: string) => `${BASE_URL}/api/v1/Cases/${id}/comments`,
    addComment: (id: string) => `${BASE_URL}/api/v1/Cases/${id}/comments`,
    deleteComment: (id: string, commentId: string) => `${BASE_URL}/api/v1/Cases/${id}/comments/${commentId}`,
  },
  // ContactLists
  contactLists: {
    getAll: `${BASE_URL}/api/v1/ContactLists`,
    getById: (id: string) => `${BASE_URL}/api/v1/ContactLists/${id}`,
    create: `${BASE_URL}/api/v1/ContactLists`,
    update: (id: string) => `${BASE_URL}/api/v1/ContactLists/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/ContactLists/${id}`,
    getMembers: (id: string) => `${BASE_URL}/api/v1/ContactLists/${id}/members`,
    addMember: (id: string) => `${BASE_URL}/api/v1/ContactLists/${id}/members`,
    removeMember: (id: string, memberId: string) => `${BASE_URL}/api/v1/ContactLists/${id}/members/${memberId}`,
  },
  // Contacts
  contacts: {
    getAll: `${BASE_URL}/api/v1/Contacts`,
    getById: (id: string) => `${BASE_URL}/api/v1/Contacts/${id}`,
    create: `${BASE_URL}/api/v1/Contacts`,
    update: (id: string) => `${BASE_URL}/api/v1/Contacts/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/Contacts/${id}`,
  },
  // Contracts
  contracts: {
    getAll: `${BASE_URL}/api/v1/Contracts`,
    getById: (id: string) => `${BASE_URL}/api/v1/Contracts/${id}`,
    create: `${BASE_URL}/api/v1/Contracts`,
    update: (id: string) => `${BASE_URL}/api/v1/Contracts/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/Contracts/${id}`,
    activate: (id: string) => `${BASE_URL}/api/v1/Contracts/${id}/activate`,
  },
  // Deals
  deals: {
    getAll: `${BASE_URL}/api/v1/Deals`,
    getById: (id: string) => `${BASE_URL}/api/v1/Deals/${id}`,
    create: `${BASE_URL}/api/v1/Deals`,
    update: (id: string) => `${BASE_URL}/api/v1/Deals/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/Deals/${id}`,
    getProducts: (id: string) => `${BASE_URL}/api/v1/Deals/${id}/products`,
    addProduct: (id: string) => `${BASE_URL}/api/v1/Deals/${id}/products`,
    updateProduct: (id: string, productId: string) => `${BASE_URL}/api/v1/Deals/${id}/products/${productId}`,
    removeProduct: (id: string, productId: string) => `${BASE_URL}/api/v1/Deals/${id}/products/${productId}`,
    getContacts: (id: string) => `${BASE_URL}/api/v1/Deals/${id}/contacts`,
    addContact: (id: string) => `${BASE_URL}/api/v1/Deals/${id}/contacts`,
    removeContact: (id: string, contactId: string) => `${BASE_URL}/api/v1/Deals/${id}/contacts/${contactId}`,
  },
  // EmailMessages
  emailMessages: {
    getAll: `${BASE_URL}/api/v1/EmailMessages`,
    getById: (id: string) => `${BASE_URL}/api/v1/EmailMessages/${id}`,
    create: `${BASE_URL}/api/v1/EmailMessages`,
    delete: (id: string) => `${BASE_URL}/api/v1/EmailMessages/${id}`,
  },
  // Entitlements
  entitlements: {
    getAll: `${BASE_URL}/api/v1/Entitlements`,
    getById: (id: string) => `${BASE_URL}/api/v1/Entitlements/${id}`,
    create: `${BASE_URL}/api/v1/Entitlements`,
    update: (id: string) => `${BASE_URL}/api/v1/Entitlements/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/Entitlements/${id}`,
  },
  // KnowledgeArticles
  knowledgeArticles: {
    getAll: `${BASE_URL}/api/v1/KnowledgeArticles`,
    getById: (id: string) => `${BASE_URL}/api/v1/KnowledgeArticles/${id}`,
    create: `${BASE_URL}/api/v1/KnowledgeArticles`,
    update: (id: string) => `${BASE_URL}/api/v1/KnowledgeArticles/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/KnowledgeArticles/${id}`,
    publish: (id: string) => `${BASE_URL}/api/v1/KnowledgeArticles/${id}/publish`,
    archive: (id: string) => `${BASE_URL}/api/v1/KnowledgeArticles/${id}/archive`,
  },
  // Leads
  leads: {
    getAll: `${BASE_URL}/api/v1/Leads`,
    getById: (id: string) => `${BASE_URL}/api/v1/Leads/${id}`,
    create: `${BASE_URL}/api/v1/Leads`,
    update: (id: string) => `${BASE_URL}/api/v1/Leads/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/Leads/${id}`,
    convert: (id: string) => `${BASE_URL}/api/v1/Leads/${id}/convert`,
  },
  // CrmLookup
  crmLookup: {
    getAll: `${BASE_URL}/api/crm-lookup`,
    getAccountTypes: `${BASE_URL}/api/crm-lookup/account-types`,
    getDealStages: `${BASE_URL}/api/crm-lookup/deal-stages`,
    getForecastCategories: `${BASE_URL}/api/crm-lookup/forecast-categories`,
    getCaseStatuses: `${BASE_URL}/api/crm-lookup/case-statuses`,
    getCaseOrigins: `${BASE_URL}/api/crm-lookup/case-origins`,
    getCasePriorities: `${BASE_URL}/api/crm-lookup/case-priorities`,
    getLeadStatuses: `${BASE_URL}/api/crm-lookup/lead-statuses`,
    getSalutations: `${BASE_URL}/api/crm-lookup/salutations`,
    getLeadSources: `${BASE_URL}/api/crm-lookup/lead-sources`,
    getIndustries: `${BASE_URL}/api/crm-lookup/industries`,
    getCountries: `${BASE_URL}/api/crm-lookup/countries`,
    getStatesProvinces: `${BASE_URL}/api/crm-lookup/states-provinces`,
  },
  // Notes
  notes: {
    getAll: `${BASE_URL}/api/v1/Notes`,
    getById: (id: string) => `${BASE_URL}/api/v1/Notes/${id}`,
    create: `${BASE_URL}/api/v1/Notes`,
    update: (id: string) => `${BASE_URL}/api/v1/Notes/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/Notes/${id}`,
  },
  // Orders
  orders: {
    getAll: `${BASE_URL}/api/v1/Orders`,
    getById: (id: string) => `${BASE_URL}/api/v1/Orders/${id}`,
    create: `${BASE_URL}/api/v1/Orders`,
    update: (id: string) => `${BASE_URL}/api/v1/Orders/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/Orders/${id}`,
  },
  // Pipelines
  pipelines: {
    getAll: `${BASE_URL}/api/v1/Pipelines`,
    getById: (id: string) => `${BASE_URL}/api/v1/Pipelines/${id}`,
    create: `${BASE_URL}/api/v1/Pipelines`,
    update: (id: string) => `${BASE_URL}/api/v1/Pipelines/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/Pipelines/${id}`,
    getStages: (id: string) => `${BASE_URL}/api/v1/Pipelines/${id}/stages`,
    addStage: (id: string) => `${BASE_URL}/api/v1/Pipelines/${id}/stages`,
    updateStage: (id: string, stageId: string) => `${BASE_URL}/api/v1/Pipelines/${id}/stages/${stageId}`,
    deleteStage: (id: string, stageId: string) => `${BASE_URL}/api/v1/Pipelines/${id}/stages/${stageId}`,
  },
  // Pricebooks
  pricebooks: {
    getAll: `${BASE_URL}/api/v1/Pricebooks`,
    getById: (id: string) => `${BASE_URL}/api/v1/Pricebooks/${id}`,
    create: `${BASE_URL}/api/v1/Pricebooks`,
    update: (id: string) => `${BASE_URL}/api/v1/Pricebooks/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/Pricebooks/${id}`,
    getEntries: (id: string) => `${BASE_URL}/api/v1/Pricebooks/${id}/entries`,
    addEntry: (id: string) => `${BASE_URL}/api/v1/Pricebooks/${id}/entries`,
    updateEntry: (id: string, entryId: string) => `${BASE_URL}/api/v1/Pricebooks/${id}/entries/${entryId}`,
    deleteEntry: (id: string, entryId: string) => `${BASE_URL}/api/v1/Pricebooks/${id}/entries/${entryId}`,
  },
  // Products
  products: {
    getAll: `${BASE_URL}/api/v1/Products`,
    getById: (id: string) => `${BASE_URL}/api/v1/Products/${id}`,
    create: `${BASE_URL}/api/v1/Products`,
    update: (id: string) => `${BASE_URL}/api/v1/Products/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/Products/${id}`,
  },
  // Quotes
  quotes: {
    getAll: `${BASE_URL}/api/v1/Quotes`,
    getById: (id: string) => `${BASE_URL}/api/v1/Quotes/${id}`,
    create: `${BASE_URL}/api/v1/Quotes`,
    update: (id: string) => `${BASE_URL}/api/v1/Quotes/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/Quotes/${id}`,
  },
  // SalesTargets
  salesTargets: {
    getAll: `${BASE_URL}/api/v1/SalesTargets`,
    getById: (id: string) => `${BASE_URL}/api/v1/SalesTargets/${id}`,
    create: `${BASE_URL}/api/v1/SalesTargets`,
    update: (id: string) => `${BASE_URL}/api/v1/SalesTargets/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/SalesTargets/${id}`,
  },
  // Tags
  tags: {
    getAll: `${BASE_URL}/api/v1/Tags`,
    getById: (id: string) => `${BASE_URL}/api/v1/Tags/${id}`,
    create: `${BASE_URL}/api/v1/Tags`,
    update: (id: string) => `${BASE_URL}/api/v1/Tags/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/Tags/${id}`,
    assign: `${BASE_URL}/api/v1/Tags/assign`,
    getByEntity: (entityType: string, entityId: string) => `${BASE_URL}/api/v1/Tags/entity/${entityType}/${entityId}`,
    removeEntityTag: (id: string) => `${BASE_URL}/api/v1/Tags/entity/${id}`,
  },
  // Territories
  territories: {
    getAll: `${BASE_URL}/api/v1/Territories`,
    getById: (id: string) => `${BASE_URL}/api/v1/Territories/${id}`,
    create: `${BASE_URL}/api/v1/Territories`,
    update: (id: string) => `${BASE_URL}/api/v1/Territories/${id}`,
    delete: (id: string) => `${BASE_URL}/api/v1/Territories/${id}`,
    assignAccount: (id: string, accountId: string) => `${BASE_URL}/api/v1/Territories/${id}/accounts/${accountId}`,
    removeAccount: (id: string, accountId: string) => `${BASE_URL}/api/v1/Territories/${id}/accounts/${accountId}`,
  },
};
