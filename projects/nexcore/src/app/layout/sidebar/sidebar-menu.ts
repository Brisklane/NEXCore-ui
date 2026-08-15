// Shared sidebar navigation model + menu data.
// Consumed by BOTH sidebar layouts: the two-tier rail (sidebar.ts) and the
// classic single-column sidebar (sidebar-classic.ts). Edit the menu here once.

export interface SidebarChild {
  label: string;
  route?: string;
  expanded?: boolean;
  icon?: string;
  children?: SidebarChild[];
}

export interface SidebarItem {
  label: string;
  iconType: 'dashboard' | 'module' | 'app' | 'admin';
  moduleImage?: string;
  icon?: string;
  route?: string;
  expanded?: boolean;
  children?: SidebarChild[];
}

/** True when `url` is this node's route, or sits underneath it. */
export function routeMatches(route: string | undefined, url: string): boolean {
  return !!route && (url === route || url.startsWith(route + '/'));
}

/** True when any node in this subtree owns `url`. */
export function subtreeOwnsRoute(nodes: SidebarChild[] | undefined, url: string): boolean {
  if (!nodes) return false;
  return nodes.some((n) => routeMatches(n.route, url) || subtreeOwnsRoute(n.children, url));
}

/**
 * Opens every group on the path to `url`, at any depth, and closes the rest.
 *
 * This has to recurse: the POS app nests four deep (App > Back Office > Products &
 * Pricing > Price Lists), and an expander that only walked two levels left the deepest
 * group shut — so the active page was not in the DOM and nothing looked selected.
 */
export function expandToRoute(nodes: SidebarChild[] | undefined, url: string): void {
  if (!nodes) return;
  for (const n of nodes) {
    if (!n.children?.length) continue;
    n.expanded = subtreeOwnsRoute(n.children, url);
    expandToRoute(n.children, url);
  }
}

    export const SIDEBAR_MENU: SidebarItem[] = [
      {
        label: 'Dashboard',
        iconType: 'dashboard',
        icon: 'dashboard',
        route: '/dashboard',
      },
      {
        label: 'Apps',
        iconType: 'dashboard',
        icon: 'apps',
        route: '/apps',
      },
      {
        label: 'Human Resource',
        iconType: 'module',
        moduleImage: 'images/hr.svg',
        expanded: false,
        children: [
          { label: 'Dashboard', route: '/hr/dashboard', icon: 'space_dashboard' },
          {
            label: 'Employees',
            icon: 'badge',
            expanded: false,
            children: [
              { label: 'Employees', route: '/hr/employees', icon: 'groups' },
              { label: 'Employee Contracts', route: '/hr/employee-contracts', icon: 'description' },
              { label: 'Attendance', route: '/hr/attendance', icon: 'event_available' },
              { label: 'Tasks', route: '/hr/tasks', icon: 'task' },
            ],
          },
          {
            label: 'Time & Leave',
            icon: 'beach_access',
            expanded: false,
            children: [
              { label: 'Leave Requests', route: '/hr/leave-requests', icon: 'event_busy' },
              { label: 'Leave Types', route: '/hr/leave-types', icon: 'category' },
            ],
          },
          {
            label: 'Payroll & Benefits',
            icon: 'payments',
            expanded: false,
            children: [
              { label: 'Payroll Runs', route: '/hr/payroll-runs', icon: 'receipt_long' },
              { label: 'Salary Structures', route: '/hr/salary-structures', icon: 'account_balance_wallet' },
              { label: 'Allowances Profiles', route: '/hr/allowances-profiles', icon: 'paid' },
              { label: 'Deductions', route: '/hr/deductions', icon: 'remove_circle_outline' },
              { label: 'Benefits Plans', route: '/hr/benefits-plans', icon: 'health_and_safety' },
            ],
          },
          {
            label: 'Recruitment',
            icon: 'groups',
            expanded: false,
            children: [
              { label: 'Job Requisition', route: '/hr/job-requisitions', icon: 'description' },
              { label: 'Approvals', route: '/hr/approval-workflow', icon: 'check_circle' },
              { label: 'Jobs', route: '/hr/job', icon: 'work' },
              {
                label: 'Candidate Pipeline',
                icon: 'folder_open',
                expanded: false,
                children: [
                  { label: 'Candidates', route: '/hr/candidates', icon: 'person_pin' },
                  { label: 'Applications', route: '/hr/applications', icon: 'assignment_ind' },
                  { label: 'Screening', route: '/hr/screening', icon: 'search' },
                  { label: 'Candidate Tasks', route: '/hr/tasks', icon: 'task' },
                  { label: 'Interviews', route: '/hr/interview-management', icon: 'groups' },
                  { label: 'Offers', route: '/hr/offer-letters', icon: 'handshake' },
                  { label: 'Hired', route: '/hr/hired', icon: 'check' },
                  { label: 'Rejected', route: '/hr/blacklisted', icon: 'cancel' }
                ]
              },
          { label: 'Onboarding Tasks', route: '/hr/onboarding-tasks', icon: 'checklist' },
          { label: 'New Hires', route: '/hr/new-hires', icon: 'person_add' },
            ]
          },
          {
            label: 'Configuration & Settings',
            icon: 'settings',
            expanded: false,
            children: [
              {
                label: 'Templates',
                icon: 'description',
                expanded: false,
                children: [
                  { label: 'Job Templates', route: '/hr/job-templates', icon: 'post_add' },
                  // { label: 'Interview Plan Templates', route: '/hr/interview-plan-templates', icon: 'event_note' },
                  // { label: 'Interview Feedback Templates', route: '/hr/interview-feedback-templates', icon: 'rate_review' },
                  // { label: 'Onboarding Task Templates', route: '/hr/onboarding-task-templates', icon: 'task' }
                ]
              },
              {
                label: 'Workflow Configuration',
                icon: 'schema',
                expanded: false,
                children: [
                  { label: 'Workflow Configurations', route: '/hr/configurations', icon: 'settings' },
                  { label: 'Workflow Steps', route: '/hr/steps', icon: 'layers' },
                  { label: 'Workflow Conditions', route: '/hr/conditions', icon: 'rule' },
                  { label: 'Workflow Escalations', route: '/hr/escalations', icon: 'trending_up' }
                ]
              },
              {
                label: 'Master Data',
                icon: 'database',
                expanded: false,
                children: [
                  { label: 'Lookup Values', route: '/hr/lookup-values', icon: 'label' },
                  { label: 'Skills & Competencies', route: '/hr/skills-competencies', icon: 'star' },
                  { label: 'Departments', route: '/hr/departments', icon: 'account_tree' },
                  { label: 'Designations', route: '/hr/designations', icon: 'badge' },
                  { label: 'Positions', route: '/hr/positions', icon: 'work_history' },
                  { label: 'Job Locations', route: '/hr/job-locations', icon: 'location_on' },
                  { label: 'Job Posting Channels', route: '/hr/job-posting-channels', icon: 'campaign' },
                  { label: 'Currencies', route: '/hr/currencies', icon: 'currency_exchange' }
                ]
              },
              {
                label: 'System Settings',
                icon: 'tune',
                expanded: false,
                children: [
                  // { label: 'Notification Settings', route: '/hr/notification-settings', icon: 'notifications' },
                  { label: 'Integration Settings', route: '/hr/integration-settings', icon: 'integration_instructions' },
                  { label: 'Email Templates', route: '/hr/email-templates', icon: 'mail' }
                ]
              }
            ]
          }
        ]
      },
      {
        label: 'CRM',
        iconType: 'module',
        moduleImage: 'images/crm.svg',
        expanded: false,
        children: [
          { label: 'Dashboard', route: '/crm/dashboard', icon: 'space_dashboard' },
          {
            label: 'Sales',
            icon: 'point_of_sale',
            expanded: false,
            children: [
              { label: 'Leads', route: '/crm/leads', icon: 'person_add' },
              { label: 'Contacts', route: '/crm/contacts', icon: 'contacts' },
              { label: 'Accounts', route: '/crm/accounts', icon: 'business' },
              { label: 'Deals', route: '/crm/deals', icon: 'trending_up' },
            ],
          },
          {
            label: 'Activities',
            icon: 'local_activity',
            expanded: false,
            children: [
              { label: 'Calls', route: '/crm/calls', icon: 'phone' },
              { label: 'Meetings', route: '/crm/meetings', icon: 'event' },
              { label: 'Tasks', route: '/crm/tasks', icon: 'task_alt' },
            ],
          },
          {
            label: 'Marketing',
            icon: 'storefront',
            expanded: false,
            children: [
              { label: 'Campaigns', route: '/crm/campaigns', icon: 'campaign' },
              { label: 'Performance', route: '/crm/campaign-performance', icon: 'insights' },
            ],
          },
          {
            label: 'Services',
            icon: 'home_repair_service',
            expanded: false,
            children: [
              { label: 'Cases', route: '/crm/cases', icon: 'support_agent' },
              { label: 'Pipelines', route: '/crm/pipelines', icon: 'account_tree' },
              { label: 'Knowledge Articles', route: '/crm/knowledge-articles', icon: 'article' },
            ],
          },
        ]
      },
      {
        label: 'Sales',
        iconType: 'module',
        moduleImage: 'images/sales.svg',
        expanded: false,
        children: [
          { label: 'Dashboard', route: '/sales/dashboard', icon: 'space_dashboard' },
          {
            label: 'Orders & Fulfillment',
            icon: 'shopping_cart',
            expanded: false,
            children: [
              { label: 'Sales Orders', route: '/sales/orders', icon: 'shopping_cart' },
              { label: 'Quotations', route: '/sales/quotations', icon: 'request_quote' },
              { label: 'Deliveries', route: '/sales/deliveries', icon: 'local_shipping' },
              { label: 'Riders', route: '/sales/riders', icon: 'two_wheeler' },
            ],
          },
          {
            label: 'Billing',
            icon: 'receipt_long',
            expanded: false,
            children: [
              { label: 'Sales Invoices', route: '/sales/invoices', icon: 'receipt_long' },
              { label: 'Payments', route: '/sales/payments', icon: 'payments' },
            ],
          },
          {
            label: 'Pricing & Promotions',
            icon: 'local_offer',
            expanded: false,
            children: [
              { label: 'Price Lists', route: '/sales/price-lists', icon: 'price_change' },
              { label: 'Promotions', route: '/sales/promotions', icon: 'local_offer' },
              { label: 'Coupons', route: '/sales/coupons', icon: 'sell' },
            ],
          },
        ],
      },
      {
        label: 'Inventory',
        iconType: 'module',
        moduleImage: 'images/inventory.svg',
        expanded: false,
        children: [
          { label: 'Dashboard', route: '/inventory/dashboard', icon: 'space_dashboard' },
          {
            label: 'Catalog',
            icon: 'inventory_2',
            expanded: false,
            children: [
              { label: 'Products', route: '/inventory/products', icon: 'deployed_code' },
              { label: 'Product Groups', route: '/inventory/product-groups', icon: 'account_tree' },
              { label: 'Brands', route: '/inventory/brands', icon: 'verified' },
              { label: 'Colors', route: '/inventory/colors', icon: 'palette' },
              { label: 'Sizes', route: '/inventory/sizes', icon: 'straighten' },
              { label: 'Attributes', route: '/inventory/attributes', icon: 'tune' },
              { label: 'Label Designer', route: '/inventory/label-designer', icon: 'qr_code_2' },
            ],
          },
          {
            label: 'Configuration',
            icon: 'settings',
            expanded: false,
            children: [
              { label: 'Units', route: '/inventory/units', icon: 'scale' },
              { label: 'Locations', route: '/inventory/locations', icon: 'warehouse' },
              { label: 'Tax Rates', route: '/inventory/tax-rates', icon: 'percent' },
            ],
          },
          {
            label: 'Operations',
            icon: 'swap_horiz',
            expanded: false,
            children: [
              { label: 'Stock on Hand', route: '/inventory/stock-on-hand', icon: 'shelves' },
              { label: 'Goods Receipt', route: '/inventory/goods-receipt', icon: 'move_to_inbox' },
              { label: 'Stock Valuation', route: '/inventory/stock-valuation', icon: 'payments' },
              { label: 'Documents', route: '/inventory/documents', icon: 'receipt_long' },
              { label: 'Adjustments', route: '/inventory/adjustments', icon: 'edit_note' },
              { label: 'Unit Trace', route: '/inventory/unit-trace', icon: 'barcode_scanner' },
            ],
          },
          { label: 'Insights', route: '/inventory/insights', icon: 'analytics' },
        ],
      },
      {
        label: 'Accounting',
        iconType: 'module',
        moduleImage: 'images/accounts.svg',
        expanded: false,
        children: [
          { label: 'Dashboard', route: '/accounting/dashboard', icon: 'space_dashboard' },
          {
            label: 'General Ledger',
            icon: 'menu_book',
            expanded: false,
            children: [
              { label: 'Ledgers', route: '/accounting/ledger', icon: 'menu_book' },
              { label: 'Chart of Accounts', route: '/accounting/chart-of-accounts', icon: 'account_tree' },
              { label: 'Journal Entries', route: '/accounting/journal-entry', icon: 'edit_note' },
              { label: 'Account Balances', route: '/accounting/account-balances', icon: 'account_balance_wallet' },
            ],
          },
          {
            label: 'Configuration',
            icon: 'settings',
            expanded: false,
            children: [
              { label: 'Fiscal Calendar', route: '/accounting/fiscal-calendar', icon: 'calendar_month' },
              { label: 'Account Categories', route: '/accounting/account-categories', icon: 'category' },
              { label: 'Dimensions', route: '/accounting/dimensions', icon: 'view_in_ar' },
              { label: 'Tax Codes', route: '/accounting/tax-codes', icon: 'percent' },
              { label: 'Posting Profiles', route: '/accounting/posting-profiles', icon: 'rule' },
            ],
          },
          { label: 'Financial Reports', route: '/accounting/financial-reports', icon: 'assessment' },
        ],
      },

      {
        label: 'Procurement',
        iconType: 'module',
        moduleImage: 'images/procurement.svg',
        expanded: false,
        children: [
          { label: 'Dashboard', route: '/procurement/dashboard', icon: 'space_dashboard' },
          // ── Vendor Management ──────────────────────────────────────────────
          {
            label: 'Vendor Management',
            icon: 'storefront',
            expanded: false,
            children: [
              { label: 'Vendors', route: '/procurement/vendors', icon: 'store' },
              { label: 'Vendor Categories', route: '/procurement/vendor-categories', icon: 'category' },
              { label: 'Approved Vendor List', route: '/procurement/approved-vendor-list', icon: 'verified' },
              { label: 'Vendor Performance', route: '/procurement/vendor-performance', icon: 'star_rate' },
              { label: 'Vendor Documents', route: '/procurement/vendor-documents/expiring', icon: 'description' },
              { label: 'Vendor Pricelists', route: '/procurement/vendor-pricelists', icon: 'price_change' },
            ],
          },
          // ── Sourcing ───────────────────────────────────────────────────────
          {
            label: 'Sourcing',
            icon: 'travel_explore',
            expanded: false,
            children: [
              { label: 'Purchase Requisitions', route: '/procurement/purchase-requisitions', icon: 'assignment' },
              { label: 'Requests for Quotation', route: '/procurement/rfq', icon: 'request_quote' },
              { label: 'Vendor Quotations', route: '/procurement/vendor-quotations', icon: 'quiz' },
              { label: 'Purchase Contracts', route: '/procurement/purchase-contracts', icon: 'assignment_turned_in' },
            ],
          },
          // ── Purchase Orders ────────────────────────────────────────────────
          {
            label: 'Purchase Orders',
            icon: 'shopping_cart',
            expanded: false,
            children: [
              { label: 'All Orders', route: '/procurement/purchase-orders', icon: 'list_alt' },
              { label: 'Pending Receipt', route: '/procurement/purchase-orders/pending-receipt', icon: 'local_shipping' },
              { label: 'To Invoice', route: '/procurement/purchase-orders/to-invoice', icon: 'receipt' },
            ],
          },
          // ── Receiving ──────────────────────────────────────────────────────
          {
            label: 'Receiving',
            icon: 'move_to_inbox',
            expanded: false,
            children: [
              { label: 'Goods Receipts (GRN)', route: '/procurement/goods-receipts', icon: 'inventory_2' },
              { label: 'Purchase Returns', route: '/procurement/purchase-returns', icon: 'assignment_return' },
              { label: 'Landed Costs', route: '/procurement/landed-costs', icon: 'directions_boat' },
            ],
          },
          // ── Accounts Payable ───────────────────────────────────────────────
          {
            label: 'Accounts Payable',
            icon: 'account_balance_wallet',
            expanded: false,
            children: [
              { label: 'Vendor Bills', route: '/procurement/purchase-invoices', icon: 'receipt_long' },
              { label: 'Overdue Bills', route: '/procurement/purchase-invoices/overdue', icon: 'warning' },
              { label: 'Pending Payment', route: '/procurement/purchase-invoices/pending-payment', icon: 'pending_actions' },
              { label: 'Vendor Payments', route: '/procurement/vendor-payments', icon: 'payments' },
              { label: 'Vendor Debit Notes', route: '/procurement/vendor-debit-notes', icon: 'note_alt' },
            ],
          },
          // ── Reports & Analytics ────────────────────────────────────────────
          {
            label: 'Reports & Analytics',
            icon: 'analytics',
            expanded: false,
            children: [
              { label: 'Purchase Analysis', route: '/procurement/reports/purchase-analysis', icon: 'bar_chart' },
              { label: 'Vendor Analysis', route: '/procurement/reports/vendor-analysis', icon: 'person_search' },
              { label: 'AP Aging', route: '/procurement/reports/ap-aging', icon: 'hourglass_bottom' },
              { label: '3-Way Match', route: '/procurement/reports/three-way-match', icon: 'compare_arrows' },
              { label: 'Spend by Category', route: '/procurement/reports/spend-by-category', icon: 'pie_chart' },
            ],
          },
          // ── Configuration & Settings ───────────────────────────────────────
          {
            label: 'Configuration',
            icon: 'settings',
            expanded: false,
            children: [
              { label: 'Procurement Categories', route: '/procurement/categories', icon: 'category' },
              { label: 'Approval Workflows', route: '/procurement/approval-workflows', icon: 'schema' },
              { label: 'Document Sequences', route: '/procurement/document-sequences', icon: 'format_list_numbered' },
              { label: 'Settings', route: '/procurement/settings', icon: 'tune' },
            ],
          },
        ],
      },
      {
        label: 'Manufacturing',
        iconType: 'module',
        moduleImage: 'images/manufacturing.svg',
        expanded: false,
        children: [
          { label: 'Dashboard', route: '/manufacturing/dashboard', icon: 'dashboard' },
          {
            label: 'Master Data / Setup',
            icon: 'settings',
            expanded: false,
            children: [
              {
                label: 'Work Centers',
                route: '/manufacturing/work-centers',
                icon: 'precision_manufacturing',
              },
              {
                label: 'Work Center Shifts',
                route: '/manufacturing/work-center-shifts',
                icon: 'schedule',
              },
              {
                label: 'Labor Rates',
                route: '/manufacturing/labor-rates',
                icon: 'badge',
              },
              {
                label: 'Bill of Material / Routing',
                route: '/manufacturing/bill-of-materials',
                icon: 'account_tree',
              },
              {
                label: 'Standard Costs',
                route: '/manufacturing/standard-costs',
                icon: 'price_check',
              },
              { label: 'Overhead Rules', route: '/manufacturing/overhead-rules', icon: 'rule' },
              {
                label: 'Material Planning',
                route: '/manufacturing/material-planning',
                icon: 'inventory',
              },
            ],
          },
          {
            label: 'Planning',
            icon: 'event_note',
            expanded: false,
            children: [
              { label: 'Demands (PIR)', route: '/manufacturing/demand', icon: 'trending_up' },
              {
                label: 'Planned Orders',
                route: '/manufacturing/planned-orders',
                icon: 'playlist_add',
              },
              {
                label: 'Production Schedules',
                route: '/manufacturing/production-schedules',
                icon: 'calendar_today',
              },
              { label: 'Capacity Load', route: '/manufacturing/capacity-load', icon: 'speed' },
            ],
          },
          {
            label: 'Execution / Production',
            icon: 'factory',
            expanded: false,
            children: [
              {
                label: 'Production Orders',
                route: '/manufacturing/production-orders',
                icon: 'assignment',
              },
              { label: 'Material Issues', route: '/manufacturing/material-issues', icon: 'output' },
              {
                label: 'Work in Progress (WIP)',
                route: '/manufacturing/work-in-progress',
                icon: 'pending_actions',
              },
              {
                label: 'Finished Goods Receipts',
                route: '/manufacturing/finished-goods-receipts',
                icon: 'done_all',
              },
              {
                label: 'Production Batches',
                route: '/manufacturing/production-batches',
                icon: 'inventory_2',
              },
            ],
          },
          {
            label: 'Quality & Service',
            icon: 'verified',
            expanded: false,
            children: [
              { label: 'Inspections', route: '/manufacturing/inspections', icon: 'search' },
              {
                label: 'Inspection Characteristics',
                route: '/manufacturing/inspection-characteristics',
                icon: 'fact_check',
              },
              { label: 'Rework Orders', route: '/manufacturing/rework-orders', icon: 'build' },
              {
                label: 'Subcontract Orders',
                route: '/manufacturing/subcontract-orders',
                icon: 'handshake',
              },
            ],
          },
          {
            label: 'Controlling & Reports',
            icon: 'bar_chart',
            expanded: false,
            children: [
              { label: 'Cost Entries', route: '/manufacturing/cost-entries', icon: 'receipt_long' },
              {
                label: 'Production Variances',
                route: '/manufacturing/production-variances',
                icon: 'difference',
              },
              {
                label: 'Machine Downtime',
                route: '/manufacturing/machine-downtime',
                icon: 'warning',
              },
              {
                label: 'Inventory Transactions',
                route: '/manufacturing/inventory-transactions',
                icon: 'swap_horiz',
              },
              {
                label: 'Workflow Runner',
                route: '/manufacturing/workflow-runner',
                icon: 'play_circle',
              },
            ],
          },
        ],
      },
      {
        label: 'Point Of Sale',
        iconType: 'app',
        moduleImage: 'images/pos.svg',
        expanded: false,
        /**
         * The POS app has exactly two modes, so the sidebar has exactly two groups:
         * **Point of Sale** is what you touch while serving a customer, **Back Office**
         * is everything you do when you are not. That split matches how a shop is
         * actually staffed — and later maps straight onto roles, where a cashier sees
         * the first group and a manager sees both.
         *
         * "Stores & Offers" and "Configuration" now live inside Back Office. As
         * siblings of the till they implied daily work; setting up a store or a receipt
         * template is something you do once and then leave alone.
         *
         * Inside Back Office the sub-groups are named for the job, not the module that
         * owns the screen. The `/pos-office/*` entries are Inventory and Procurement
         * screens mounted under a POS-owned URL so the sidebar stays in this app
         * instead of throwing the user into another module mid-task.
         */
        children: [
          { label: 'POS Dashboard', route: '/sales/pos-dashboard', icon: 'dashboard' },
          {
            label: 'Point of Sale',
            icon: 'point_of_sale',
            expanded: false,
            children: [
              { label: 'NexCore POS', route: '/sales/pos', icon: 'point_of_sale' },
              { label: 'POS Customers', route: '/sales/pos-customers', icon: 'group' },
              { label: 'Sales Orders', route: '/pos-office/orders', icon: 'receipt_long' },
              { label: 'Invoices', route: '/pos-office/invoices', icon: 'description' },
              { label: 'Payments', route: '/pos-office/payments', icon: 'payments' },
              { label: 'Deliveries', route: '/pos-office/deliveries', icon: 'local_shipping' },
            ],
          },
          {
            label: 'Back Office',
            icon: 'apps',
            expanded: false,
            children: [
              { label: 'Overview', route: '/sales/pos-backoffice', icon: 'apps' },
              {
                label: 'Products & Pricing',
                icon: 'inventory_2',
                expanded: false,
                children: [
                  { label: 'POS Catalogue', route: '/sales/pos-catalogue', icon: 'inventory_2' },
                  { label: 'Price Lists', route: '/pos-office/price-lists', icon: 'sell' },
                  { label: 'Promotions', route: '/pos-office/promotions', icon: 'campaign' },
                  { label: 'Store Offers', route: '/sales/store-offers', icon: 'local_activity' },
                  { label: 'Coupons', route: '/pos-office/coupons', icon: 'confirmation_number' },
                  { label: 'Categories', route: '/pos-office/categories', icon: 'category' },
                  { label: 'Brands', route: '/pos-office/brands', icon: 'label' },
                  { label: 'Units', route: '/pos-office/units', icon: 'straighten' },
                  { label: 'Tax Rates', route: '/pos-office/tax-rates', icon: 'percent' },
                  { label: 'Shelf Labels', route: '/pos-office/labels', icon: 'qr_code_2' },
                  { label: 'All Products', route: '/pos-office/products', icon: 'list_alt' },
                ],
              },
              {
                label: 'Stock',
                icon: 'inventory',
                expanded: false,
                children: [
                  { label: 'POS Stock', route: '/sales/pos-stock', icon: 'inventory' },
                  { label: 'Goods Received', route: '/sales/pos-receipts', icon: 'move_to_inbox' },
                  { label: 'Adjustments', route: '/pos-office/adjustments', icon: 'tune' },
                  { label: 'Stock Movements', route: '/pos-office/documents', icon: 'swap_horiz' },
                  { label: 'Stock Valuation', route: '/pos-office/stock-valuation', icon: 'account_balance_wallet' },
                  { label: 'Warehouses', route: '/pos-office/warehouses', icon: 'warehouse' },
                ],
              },
              {
                label: 'Buying',
                icon: 'local_shipping',
                expanded: false,
                children: [
                  { label: 'Suppliers', route: '/pos-office/suppliers', icon: 'local_shipping' },
                  { label: 'Purchase Orders', route: '/pos-office/purchase-orders', icon: 'shopping_cart' },
                  { label: 'Purchase Invoices', route: '/pos-office/purchase-invoices', icon: 'request_quote' },
                  { label: 'Supplier Payments', route: '/pos-office/supplier-payments', icon: 'payments' },
                ],
              },
              {
                label: 'Money & Day-end',
                icon: 'summarize',
                expanded: false,
                children: [
                  { label: 'POS Reports', route: '/sales/pos-reports', icon: 'summarize' },
                  { label: 'POS Cashiers', route: '/sales/pos-cashiers', icon: 'badge' },
                  { label: 'POS Terminals', route: '/sales/pos-terminals', icon: 'devices' },
                ],
              },
              {
                label: 'Setup',
                icon: 'settings',
                expanded: false,
                children: [
                  { label: 'POS Stores', route: '/sales/pos-stores', icon: 'storefront' },
                  { label: 'POS Settings', route: '/sales/pos-settings', icon: 'settings' },
                  { label: 'Receipt Templates', route: '/sales/receipt-templates', icon: 'receipt_long' },
                  { label: 'Document Sequences', route: '/sales/document-sequences', icon: 'format_list_numbered' },
                ],
              },
            ],
          },
        ],
      },
      {
        label: 'Administration',
        iconType: 'admin',
        expanded: true,
        children: [
          { label: 'Users', route: '/administration/users', icon: 'group' },
          {
            label: 'Manage Company',
            icon: 'folder_open',
            route: '/administration/manage-company',
          },
          {
            label: 'Subscription Details',
            route: '/administration/subscription-details',
            icon: 'subscriptions',
          },
          { label: 'Settings', route: '/administration/settings', icon: 'settings' },
        ],
      },
    ];

