import { LookupItemDto } from './inventory-lookup.model';

// ─── Barcode label / price-tag designer (served by the Sales API) ──────────────

export interface LabelPaperPresetDto {
  name: string | null;
  widthMm: number;
  heightMm: number;
  rollPaper: boolean;
}

export interface LabelFieldRangeDto {
  field: string | null;
  min: number;
  max: number;
  default: number;
  step: number;
}

/** Everything the designer needs in one call — no hardcoded dropdown data. */
export interface LabelDesignerOptionsDto {
  barcodeSymbologies: LookupItemDto[] | null;
  paperPresets: LabelPaperPresetDto[] | null;
  sliderRanges: LabelFieldRangeDto[] | null;
}

// ─── Barcode label templates (CRUD + render) ──────────────────────────────────

export interface PosBarcodeLabelTemplateDto {
  id: string;
  templateName: string | null;
  labelWidthMm: number;
  labelHeightMm: number;
  barcodeSymbology: string | null;
  headerText: string | null;
  showProductName: boolean;
  showPrice: boolean;
  showSku: boolean;
  showBarcodeValue: boolean;
  currencySymbol: string | null;
  productNameFontPt: number;
  priceFontPt: number;
  barcodeHeightPt: number;
  showBorders: boolean;
  rollPaper: boolean;
  isDefault: boolean;
}

export interface CreatePosBarcodeLabelTemplateDto {
  templateName?: string | null;
  labelWidthMm: number;
  labelHeightMm: number;
  barcodeSymbology?: string | null;
  headerText?: string | null;
  showProductName: boolean;
  showPrice: boolean;
  showSku: boolean;
  showBarcodeValue: boolean;
  currencySymbol?: string | null;
  productNameFontPt: number;
  priceFontPt: number;
  barcodeHeightPt: number;
  showBorders: boolean;
  rollPaper: boolean;
  isDefault: boolean;
}

export interface BarcodeLabelItemDto {
  barcodeValue?: string | null;
  productName?: string | null;
  sku?: string | null;
  price?: number | null;
  copies: number;
}

export interface RenderBarcodeLabelBatchDto {
  templateId?: string | null;
  symbology?: string | null;
  items: BarcodeLabelItemDto[];
}
