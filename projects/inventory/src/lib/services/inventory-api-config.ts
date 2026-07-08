import { environment } from '@env';
const BASE_URL = environment.apiBaseUrl;

export const INVENTORY_API = {
  // AttributeDefinition
  attributeDefinition: {
    getAll: `${BASE_URL}/api/AttributeDefinition`,
    getById: (id: string) => `${BASE_URL}/api/AttributeDefinition/${id}`,
    create: `${BASE_URL}/api/AttributeDefinition`,
    update: (id: string) => `${BASE_URL}/api/AttributeDefinition/${id}`,
    delete: (id: string) => `${BASE_URL}/api/AttributeDefinition/${id}`,
    getActive: `${BASE_URL}/api/AttributeDefinition/active`,
    getVariants: `${BASE_URL}/api/AttributeDefinition/variants`,
  },

  // Brand
  brand: {
    getAll: `${BASE_URL}/api/Brand`,
    getById: (id: string) => `${BASE_URL}/api/Brand/${id}`,
    create: `${BASE_URL}/api/Brand`,
    update: (id: string) => `${BASE_URL}/api/Brand/${id}`,
    delete: (id: string) => `${BASE_URL}/api/Brand/${id}`,
    getActive: `${BASE_URL}/api/Brand/active`,
  },

  // Color
  color: {
    getAll: `${BASE_URL}/api/Color`,
    getById: (id: string) => `${BASE_URL}/api/Color/${id}`,
    create: `${BASE_URL}/api/Color`,
    update: (id: string) => `${BASE_URL}/api/Color/${id}`,
    delete: (id: string) => `${BASE_URL}/api/Color/${id}`,
    getActive: `${BASE_URL}/api/Color/active`,
    getByFamily: (family: string) => `${BASE_URL}/api/Color/family/${family}`,
  },

  // InventoryBalance
  inventoryBalance: {
    getByItemWarehouse: `${BASE_URL}/api/InventoryBalance/by-item-warehouse`,
    getByItem: (itemId: string) => `${BASE_URL}/api/InventoryBalance/by-item/${itemId}`,
    getByWarehouse: (warehouseId: string) => `${BASE_URL}/api/InventoryBalance/by-warehouse/${warehouseId}`,
    getLowStock: `${BASE_URL}/api/InventoryBalance/low-stock`,
    getTotalValue: (warehouseId: string) => `${BASE_URL}/api/InventoryBalance/total-value/${warehouseId}`,
  },

  // InventoryDocument
  inventoryDocument: {
    getAll: `${BASE_URL}/api/InventoryDocument`,
    getById: (id: string) => `${BASE_URL}/api/InventoryDocument/${id}`,
    create: `${BASE_URL}/api/InventoryDocument`,
    post: (id: string) => `${BASE_URL}/api/InventoryDocument/${id}/post`,
    quickAdjust: `${BASE_URL}/api/InventoryDocument/quick-adjust`,
    getByNumber: (documentNumber: string) => `${BASE_URL}/api/InventoryDocument/by-number/${documentNumber}`,
    getByStatus: (status: string) => `${BASE_URL}/api/InventoryDocument/by-status/${status}`,
    getByType: (documentType: string) => `${BASE_URL}/api/InventoryDocument/by-type/${documentType}`,
  },

  // InventoryLookup
  inventoryLookup: {
    getAll: `${BASE_URL}/api/inventory-lookup`,
    getItemTypes: `${BASE_URL}/api/inventory-lookup/item-types`,
    getItemConditions: `${BASE_URL}/api/inventory-lookup/item-conditions`,
    getCostingMethods: `${BASE_URL}/api/inventory-lookup/costing-methods`,
    getWarehouseTypes: `${BASE_URL}/api/inventory-lookup/warehouse-types`,
    getBarcodeTypes: `${BASE_URL}/api/inventory-lookup/barcode-types`,
    getPriceLists: `${BASE_URL}/api/inventory-lookup/price-lists`,
    getCommentTypes: `${BASE_URL}/api/inventory-lookup/comment-types`,
    getSalesChannels: `${BASE_URL}/api/inventory-lookup/sales-channels`,
    getListingStatuses: `${BASE_URL}/api/inventory-lookup/listing-statuses`,
    getDiscountTypes: `${BASE_URL}/api/inventory-lookup/discount-types`,
    getWarrantyTypes: `${BASE_URL}/api/inventory-lookup/warranty-types`,
    getAttributeDataTypes: `${BASE_URL}/api/inventory-lookup/attribute-data-types`,
    getTaxTypes: `${BASE_URL}/api/inventory-lookup/tax-types`,
    getSizeCharts: `${BASE_URL}/api/inventory-lookup/size-charts`,
    getImageResolutions: `${BASE_URL}/api/inventory-lookup/image-resolutions`,
    getDocumentTypes: `${BASE_URL}/api/inventory-lookup/document-types`,
    getDocumentStatuses: `${BASE_URL}/api/inventory-lookup/document-statuses`,
    getTransactionTypes: `${BASE_URL}/api/inventory-lookup/transaction-types`,
    getTrackingTypes: `${BASE_URL}/api/inventory-lookup/tracking-types`,
    getSerialStatuses: `${BASE_URL}/api/inventory-lookup/serial-statuses`,
    getBatchStatuses: `${BASE_URL}/api/inventory-lookup/batch-statuses`,
  },

  // InventoryReport
  inventoryReport: {
    getStockLedger: `${BASE_URL}/api/InventoryReport/stock-ledger`,
    getStockSummary: `${BASE_URL}/api/InventoryReport/stock-summary`,
    getStockByItem: `${BASE_URL}/api/InventoryReport/stock-by-item`,
    getStockValuation: `${BASE_URL}/api/InventoryReport/stock-valuation`,
    getInventoryAging: `${BASE_URL}/api/InventoryReport/inventory-aging`,
    getLowStockAlert: `${BASE_URL}/api/InventoryReport/low-stock-alert`,
  },

  // Item
  item: {
    getAll: `${BASE_URL}/api/Item`,
    basic: `${BASE_URL}/api/Item/basic`,
    getById: (id: string) => `${BASE_URL}/api/Item/${id}`,
    create: `${BASE_URL}/api/Item`,
    update: (id: string) => `${BASE_URL}/api/Item/${id}`,
    delete: (id: string) => `${BASE_URL}/api/Item/${id}`,
    getByCode: (code: string) => `${BASE_URL}/api/Item/by-code/${code}`,
    getByBarcode: (barcode: string) => `${BASE_URL}/api/Item/by-barcode/${barcode}`,
    getActive: `${BASE_URL}/api/Item/active`,
    uploadImages: (id: string) => `${BASE_URL}/api/Item/${id}/images/upload`,
    deleteImage: (id: string, imageId: string) => `${BASE_URL}/api/Item/${id}/images/${imageId}`,
  },

  // ItemSerial — per-unit serial/IMEI registry
  itemSerial: {
    getByItem: (itemId: string) => `${BASE_URL}/api/ItemSerial/by-item/${itemId}`,
    lookup: (value: string) => `${BASE_URL}/api/ItemSerial/lookup/${encodeURIComponent(value)}`,
    getById: (id: string) => `${BASE_URL}/api/ItemSerial/${id}`,
    getHistory: (id: string) => `${BASE_URL}/api/ItemSerial/${id}/history`,
    create: `${BASE_URL}/api/ItemSerial`,
    bulkGenerate: `${BASE_URL}/api/ItemSerial/bulk-generate`,
    updateStatus: (id: string) => `${BASE_URL}/api/ItemSerial/${id}/status`,
    warrantyExpiring: `${BASE_URL}/api/ItemSerial/report/warranty-expiring`,
  },

  // ItemBatch — lot / batch registry
  itemBatch: {
    getByItem: (itemId: string) => `${BASE_URL}/api/ItemBatch/by-item/${itemId}`,
    getById: (id: string) => `${BASE_URL}/api/ItemBatch/${id}`,
    expiring: `${BASE_URL}/api/ItemBatch/report/expiring`,
    updateStatus: (id: string) => `${BASE_URL}/api/ItemBatch/${id}/status`,
  },

  // ItemCategory
  itemCategory: {
    getAll: `${BASE_URL}/api/ItemCategory`,
    getById: (id: string) => `${BASE_URL}/api/ItemCategory/${id}`,
    create: `${BASE_URL}/api/ItemCategory`,
    update: (id: string) => `${BASE_URL}/api/ItemCategory/${id}`,
    delete: (id: string) => `${BASE_URL}/api/ItemCategory/${id}`,
    getActive: `${BASE_URL}/api/ItemCategory/active`,
    getHierarchy: `${BASE_URL}/api/ItemCategory/hierarchy`,
    generateGlAccounts: (id: string) => `${BASE_URL}/api/ItemCategory/${id}/gl-accounts`,
  },

  // Size
  size: {
    getAll: `${BASE_URL}/api/Size`,
    getById: (id: string) => `${BASE_URL}/api/Size/${id}`,
    create: `${BASE_URL}/api/Size`,
    update: (id: string) => `${BASE_URL}/api/Size/${id}`,
    delete: (id: string) => `${BASE_URL}/api/Size/${id}`,
    getByChart: (sizeChart: string) => `${BASE_URL}/api/Size/chart/${sizeChart}`,
  },

  // TaxDefinition
  taxDefinition: {
    getAll: `${BASE_URL}/api/TaxDefinition`,
    getById: (id: string) => `${BASE_URL}/api/TaxDefinition/${id}`,
    create: `${BASE_URL}/api/TaxDefinition`,
    update: (id: string) => `${BASE_URL}/api/TaxDefinition/${id}`,
    delete: (id: string) => `${BASE_URL}/api/TaxDefinition/${id}`,
    getActive: `${BASE_URL}/api/TaxDefinition/active`,
    getSales: `${BASE_URL}/api/TaxDefinition/sales`,
    getPurchases: `${BASE_URL}/api/TaxDefinition/purchases`,
  },

  // Unit
  unit: {
    getAll: `${BASE_URL}/api/Unit`,
    getById: (id: string) => `${BASE_URL}/api/Unit/${id}`,
    create: `${BASE_URL}/api/Unit`,
    update: (id: string) => `${BASE_URL}/api/Unit/${id}`,
    delete: (id: string) => `${BASE_URL}/api/Unit/${id}`,
    getActive: `${BASE_URL}/api/Unit/active`,
    getConversionsByItem: (itemId: string) => `${BASE_URL}/api/Unit/conversions/item/${itemId}`,
    createConversion: (itemId: string) => `${BASE_URL}/api/Unit/conversions/item/${itemId}`,
    updateConversion: (id: string) => `${BASE_URL}/api/Unit/conversions/${id}`,
    deleteConversion: (id: string) => `${BASE_URL}/api/Unit/conversions/${id}`,
  },

  // Warehouse
  warehouse: {
    getAll: `${BASE_URL}/api/Warehouse`,
    getById: (id: string) => `${BASE_URL}/api/Warehouse/${id}`,
    create: `${BASE_URL}/api/Warehouse`,
    update: (id: string) => `${BASE_URL}/api/Warehouse/${id}`,
    delete: (id: string) => `${BASE_URL}/api/Warehouse/${id}`,
    getActive: `${BASE_URL}/api/Warehouse/active`,
    getWithBins: (id: string) => `${BASE_URL}/api/Warehouse/${id}/with-bins`,
    getBins: (warehouseId: string) => `${BASE_URL}/api/Warehouse/${warehouseId}/bins`,
    getActiveBins: (warehouseId: string) => `${BASE_URL}/api/Warehouse/${warehouseId}/bins/active`,
    createBin: (warehouseId: string) => `${BASE_URL}/api/Warehouse/${warehouseId}/bins`,
    getBinById: (id: string) => `${BASE_URL}/api/Warehouse/bins/${id}`,
    updateBin: (id: string) => `${BASE_URL}/api/Warehouse/bins/${id}`,
    deleteBin: (id: string) => `${BASE_URL}/api/Warehouse/bins/${id}`,
  },
};
