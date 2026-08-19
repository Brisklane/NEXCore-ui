/**
 * The catalogue of apps this product ships.
 *
 * Everything that used to be a "core module" is an app here — Accounting, CRM, HR and
 * the rest sit alongside Point of Sale with no special status. A customer who only wants
 * a till installs Point of Sale and nothing else; a distributor installs Inventory and
 * Procurement and skips the till.
 *
 * The catalogue is deliberately client-side: it is UI metadata (name, icon, colour,
 * which URLs belong to which app). The server stores only the set of installed keys,
 * so adding an app to this list never needs a database change.
 *
 * **There is no dependency graph, on purpose.** It is tempting to say Point of Sale
 * "depends on" Inventory, CRM and Accounting because a sale touches items, customers and
 * the ledger — a POS payment posts a journal entry. But those are *server-side services*
 * that run whatever is installed; an app here is a set of screens, and POS ships its own
 * catalogue, customers, stock and reporting screens in its back office. Making them
 * depend on each other would force a shop that wants only a till to carry four apps it
 * never opens, which is exactly what apps are meant to avoid.
 */

export type AppStatus = 'available' | 'coming-soon';

export interface AppDefinition {
  /** Stable identifier. Persisted server-side — never rename one in place. */
  key: string;
  name: string;
  /** One line for the app card. */
  tagline: string;
  /** Material symbol name. */
  icon: string;
  /** Tile gradient for the app card. */
  accent: string;
  status: AppStatus;

  /**
   * Always installed and not removable. The shell itself lives here — an ERP with no
   * dashboard and no way to reach Administration is a locked door.
   */
  core?: boolean;

  /**
   * URL prefixes the app owns, longest-first at match time. Point of Sale and Sales
   * both live under `/sales`, so the POS prefixes have to be the more specific ones.
   */
  prefixes: string[];

  /** Where "Open" goes. */
  home: string;

  /** Sidebar label this app owns, so the menu can be filtered without duplicating it. */
  sidebarLabel?: string;
}

export const APP_REGISTRY: AppDefinition[] = [
  // ── Always on ────────────────────────────────────────────────────────────────
  {
    key: 'core',
    name: 'NexCore',
    tagline: 'Dashboard, apps and administration',
    icon: 'grid_view',
    accent: 'linear-gradient(135deg, #94a3b8, #475569)',
    status: 'available',
    core: true,
    prefixes: ['/dashboard', '/apps', '/administration'],
    home: '/dashboard',
  },

  // ── Business apps ────────────────────────────────────────────────────────────
  {
    key: 'pos',
    name: 'Point of Sale',
    tagline: 'Tills, shifts and the shop back office',
    icon: 'point_of_sale',
    accent: 'linear-gradient(135deg, #22d3ee, #0ea5e9)',
    status: 'available',
    prefixes: ['/sales/pos', '/sales/pos-', '/pos-office'],
    home: '/sales/pos-dashboard',
    sidebarLabel: 'Point Of Sale',
  },
  {
    key: 'sales',
    name: 'Sales',
    tagline: 'Quotes, orders, invoices and pricing',
    icon: 'trending_up',
    accent: 'linear-gradient(135deg, #34d399, #059669)',
    status: 'available',
    prefixes: ['/sales'],
    home: '/sales/dashboard',
    sidebarLabel: 'Sales',
  },
  {
    key: 'inventory',
    name: 'Inventory',
    tagline: 'Stock, warehouses and product data',
    icon: 'inventory_2',
    accent: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
    status: 'available',
    prefixes: ['/inventory'],
    home: '/inventory/dashboard',
    sidebarLabel: 'Inventory',
  },
  {
    key: 'crm',
    name: 'CRM',
    tagline: 'Leads, contacts, deals and cases',
    icon: 'contacts',
    accent: 'linear-gradient(135deg, #f472b6, #db2777)',
    status: 'available',
    prefixes: ['/crm'],
    home: '/crm/dashboard',
    sidebarLabel: 'CRM',
  },
  {
    key: 'accounting',
    name: 'Accounting',
    tagline: 'Ledger, journals and financial reports',
    icon: 'account_balance',
    accent: 'linear-gradient(135deg, #60a5fa, #2563eb)',
    status: 'available',
    prefixes: ['/accounting'],
    home: '/accounting/dashboard',
    sidebarLabel: 'Accounting',
  },
  {
    key: 'procurement',
    name: 'Procurement',
    tagline: 'Suppliers, purchase orders and bills',
    icon: 'shopping_cart',
    accent: 'linear-gradient(135deg, #fbbf24, #d97706)',
    status: 'available',
    prefixes: ['/procurement'],
    home: '/procurement/dashboard',
    sidebarLabel: 'Procurement',
  },
  {
    key: 'hr',
    name: 'Human Resource',
    tagline: 'People, payroll, leave and recruitment',
    icon: 'groups',
    accent: 'linear-gradient(135deg, #38bdf8, #0284c7)',
    status: 'available',
    prefixes: ['/hr'],
    home: '/hr/dashboard',
    sidebarLabel: 'Human Resource',
  },
  {
    key: 'manufacturing',
    name: 'Manufacturing',
    tagline: 'Production orders, BOMs and MRP',
    icon: 'precision_manufacturing',
    accent: 'linear-gradient(135deg, #fb923c, #ea580c)',
    status: 'available',
    prefixes: ['/manufacturing'],
    home: '/manufacturing/dashboard',
    sidebarLabel: 'Manufacturing',
  },

  {
    key: 'restaurant',
    name: 'Restaurant',
    tagline: 'Floor plan, order pad, kitchen display and recipes',
    icon: 'restaurant',
    accent: 'linear-gradient(135deg, #fb7185, #ef4444)',
    status: 'available',
    prefixes: ['/restaurant'],
    home: '/restaurant/dashboard',
    sidebarLabel: 'Restaurant',
  },

  {
    key: 'distribution',
    name: 'Distribution',
    tagline: 'Field force, van sales, trade schemes and route settlement',
    icon: 'local_shipping',
    accent: 'linear-gradient(135deg, #34d399, #0d9488)',
    status: 'available',
    prefixes: ['/distribution'],
    home: '/distribution/dashboard',
    sidebarLabel: 'Distribution',
  },

  // ── Not built yet ────────────────────────────────────────────────────────────
  {
    key: 'ecommerce',
    name: 'Online Store',
    tagline: 'Storefront, catalogue and web orders',
    icon: 'shopping_bag',
    accent: 'linear-gradient(135deg, #c084fc, #9333ea)',
    status: 'coming-soon',
    prefixes: [],
    home: '',
  },
  {
    key: 'realestate',
    name: 'Real Estate',
    tagline: 'Listings, viewings and client matching',
    icon: 'home_work',
    accent: 'linear-gradient(135deg, #7dd3fc, #0369a1)',
    status: 'coming-soon',
    prefixes: [],
    home: '',
  },
  {
    key: 'healthcare',
    name: 'Healthcare',
    tagline: 'Patients, scheduling and billing',
    icon: 'medical_services',
    accent: 'linear-gradient(135deg, #34d399, #10b981)',
    status: 'coming-soon',
    prefixes: [],
    home: '',
  },
  {
    key: 'projects',
    name: 'Projects',
    tagline: 'Tasks, timesheets and delivery tracking',
    icon: 'checklist',
    accent: 'linear-gradient(135deg, #818cf8, #4f46e5)',
    status: 'coming-soon',
    prefixes: [],
    home: '',
  },
];

/** Apps that can actually be installed today. */
export const INSTALLABLE_APPS = APP_REGISTRY.filter(a => a.status === 'available' && !a.core);

/** Installed by default for a brand-new company, until the server says otherwise. */
export const DEFAULT_INSTALLED = INSTALLABLE_APPS.map(a => a.key);

export function findApp(key: string): AppDefinition | undefined {
  return APP_REGISTRY.find(a => a.key === key);
}

/**
 * Which app owns a URL, or undefined when nothing claims it.
 *
 * Matching is longest-prefix-first because apps share roots: `/sales/pos-stock` belongs
 * to Point of Sale, while `/sales/orders` belongs to Sales. Shortest-first would hand
 * every POS screen to the Sales app and lock POS-only customers out of their own till.
 */
export function appForUrl(url: string): AppDefinition | undefined {
  const path = url.split('?')[0].split('#')[0];
  let best: AppDefinition | undefined;
  let bestLength = -1;

  for (const app of APP_REGISTRY) {
    for (const prefix of app.prefixes) {
      const matches = path === prefix || path.startsWith(prefix.endsWith('-') ? prefix : prefix + '/');
      if (matches && prefix.length > bestLength) {
        best = app;
        bestLength = prefix.length;
      }
    }
  }
  return best;
}

