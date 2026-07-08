// ─── Line item models ─────────────────────────────────────────────────────────

export interface DeliveryLineDto {
  id: string;
  lineNumber: number;
  salesOrderLineId: string;
  productId: string;
  productCode: string | null;
  productName: string | null;
  orderedQuantity: number;
  deliveredQuantity: number;
  unitOfMeasure: string | null;
  binLocation: string | null;
  lotNumber: string | null;
  serialNumber: string | null;
  expiryDate: string | null;
  notes: string | null;
}

export interface CreateDeliveryLineDto {
  salesOrderLineId: string;
  productId: string;
  productCode?: string | null;
  productName?: string | null;
  orderedQuantity: number;
  deliveredQuantity: number;
  unitOfMeasure?: string | null;
  binLocation?: string | null;
  lotNumber?: string | null;
  serialNumber?: string | null;
}

// ─── Enums ───────────────────────────────────────────────────────────────────

export type DeliveryStatus =
  | 'Pending'
  | 'ReadyToShip'
  | 'PartiallyShipped'
  | 'Shipped'
  | 'InTransit'
  | 'OutForDelivery'
  | 'Delivered'
  | 'Failed'
  | 'Cancelled';

// ─── Response DTO ────────────────────────────────────────────────────────────

export interface DeliveryDto {
  id: string;
  deliveryNumber: string | null;
  salesOrderId: string;
  salesOrderNumber: string | null;
  contactId: string | null;
  contactName: string | null;
  status: DeliveryStatus | number;
  plannedDeliveryDate: string | null;
  actualShipDate: string | null;
  actualDeliveryDate: string | null;
  carrier: string | null;
  shippingMethod: string | null;
  trackingNumber: string | null;
  incoterm: string | number | null;
  incotermLocation: string | null;
  warehouseId: string | null;
  shipToName: string | null;
  shipToStreet: string | null;
  shipToCity: string | null;
  shipToState: string | null;
  shipToPostalCode: string | null;
  shipToCountry: string | null;
  numberOfPackages: number | null;
  totalWeight: number | null;
  weightUnit: string | null;
  totalVolume: number | null;
  volumeUnit: string | null;
  notes: string | null;
  lines: DeliveryLineDto[];
}

// ─── Create / Update DTOs ─────────────────────────────────────────────────────

export interface CreateDeliveryDto {
  salesOrderId: string;
  contactId?: string | null;
  plannedDeliveryDate: string;
  warehouseId?: string | null;
  carrier?: string | null;
  shippingMethod?: string | null;
  incoterm?: string | null;
  incotermLocation?: string | null;
  shipToName?: string | null;
  shipToStreet?: string | null;
  shipToCity?: string | null;
  shipToState?: string | null;
  shipToPostalCode?: string | null;
  shipToCountry?: string | null;
  numberOfPackages?: number | null;
  totalWeight?: number | null;
  weightUnit?: string | null;
  notes?: string | null;
  lines: CreateDeliveryLineDto[];
}

export interface ShipDeliveryDto {
  trackingNumber?: string | null;
  carrier?: string | null;
}
