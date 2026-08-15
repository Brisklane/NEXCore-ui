/*
 * Public API Surface of inventory
 */

export * from './lib/inventory';
export * from './lib/inventory.routes';

// Pages
export * from './lib/pages/dashboard/inventory-dashboard';
export * from './lib/pages/stock-list/stock-list';
export * from './lib/pages/inventory-adjustment/inventory-adjustment';
export * from './lib/pages/items/items';
export * from './lib/pages/price-tag-designer/price-tag-designer';
export * from './lib/pages/item-categories/item-categories';
export * from './lib/pages/brands/brands';
export * from './lib/pages/colors/colors';
export * from './lib/pages/sizes/sizes';
export * from './lib/pages/units/units';
export * from './lib/pages/warehouses/warehouses';
export * from './lib/pages/tax-definitions/tax-definitions';
export * from './lib/pages/attribute-definitions/attribute-definitions';
export * from './lib/pages/inventory-balance/inventory-balance';
export * from './lib/pages/inventory-documents/inventory-documents';
export * from './lib/pages/inventory-reports/inventory-reports';

// Models
export * from './lib/models/index';

// Services
export * from './lib/services/inventory-api-config';
export * from './lib/services/inventory-auth-helper';
export * from './lib/services/attribute-definition.service';
export * from './lib/services/brand.service';
export * from './lib/services/color.service';
export * from './lib/services/inventory-balance.service';
export * from './lib/services/inventory-document.service';
export * from './lib/services/inventory-lookup.service';
export * from './lib/services/inventory-report.service';
export * from './lib/services/item.service';
export * from './lib/services/catalog.service';
export * from './lib/models/catalog-resolution.model';
export * from './lib/services/barcode-label.service';
export * from './lib/services/item-category.service';
export * from './lib/services/size.service';
export * from './lib/services/tax-definition.service';
export * from './lib/services/unit.service';
export * from './lib/services/warehouse.service';
