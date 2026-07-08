import { Routes } from '@angular/router';
import { InventoryDashboard } from './pages/dashboard/inventory-dashboard';
import { StockList } from './pages/stock-list/stock-list';
import { InventoryAdjustment } from './pages/inventory-adjustment/inventory-adjustment';
import { ItemsPage } from './pages/items/items';
import { ItemEditorPage } from './pages/item-editor/item-editor';
import { ItemDetailPage } from './pages/item-detail/item-detail';
import { SerialLookupPage } from './pages/serial-lookup/serial-lookup';
import { ReceiveStockPage } from './pages/receive-stock/receive-stock';
import { ItemCategoriesPage } from './pages/item-categories/item-categories';
import { BrandsPage } from './pages/brands/brands';
import { ColorsPage } from './pages/colors/colors';
import { SizesPage } from './pages/sizes/sizes';
import { UnitsPage } from './pages/units/units';
import { WarehousesPage } from './pages/warehouses/warehouses';
import { TaxDefinitionsPage } from './pages/tax-definitions/tax-definitions';
import { AttributeDefinitionsPage } from './pages/attribute-definitions/attribute-definitions';
import { InventoryBalancePage } from './pages/inventory-balance/inventory-balance';
import { InventoryDocumentsPage } from './pages/inventory-documents/inventory-documents';
import { InventoryReportsPage } from './pages/inventory-reports/inventory-reports';
import { PriceTagDesignerComponent } from './pages/price-tag-designer/price-tag-designer';

// Route paths are kept aligned with each page's display name (e.g. Products → /products).
export const inventoryRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: InventoryDashboard },
  { path: 'overview', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'products', component: ItemsPage },
  { path: 'products/new', component: ItemEditorPage },
  { path: 'products/:id/edit', component: ItemEditorPage },
  { path: 'products/:id', component: ItemDetailPage },
  { path: 'product-groups', component: ItemCategoriesPage },
  { path: 'brands', component: BrandsPage },
  { path: 'colors', component: ColorsPage },
  { path: 'sizes', component: SizesPage },
  { path: 'attributes', component: AttributeDefinitionsPage },
  { path: 'label-designer', component: PriceTagDesignerComponent },
  { path: 'units', component: UnitsPage },
  { path: 'locations', component: WarehousesPage },
  { path: 'tax-rates', component: TaxDefinitionsPage },
  { path: 'stock-on-hand', component: StockList },
  { path: 'goods-receipt', component: ReceiveStockPage },
  { path: 'stock-valuation', component: InventoryBalancePage },
  { path: 'documents', component: InventoryDocumentsPage },
  { path: 'adjustments', component: InventoryAdjustment },
  { path: 'unit-trace', component: SerialLookupPage },
  { path: 'insights', component: InventoryReportsPage },
];
