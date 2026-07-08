import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemService } from '../../services/item.service';
import { BarcodeLabelService } from '../../services/barcode-label.service';
import { ItemDto } from '../../models/item.model';
import { LookupItemDto } from '../../models/inventory-lookup.model';
import {
  LabelPaperPresetDto, LabelFieldRangeDto, RenderBarcodeLabelBatchDto,
  PosBarcodeLabelTemplateDto, CreatePosBarcodeLabelTemplateDto,
} from '../../models/barcode-label.model';

/** Flattened product row used for tags. */
export interface TagProduct {
  id: string;
  name: string;
  code: string;
  price: number;
  barcode: string;
}

@Component({
  selector: 'lib-price-tag-designer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './price-tag-designer.html',
  styleUrl: './price-tag-designer.css',
})
export class PriceTagDesignerComponent implements OnInit, OnDestroy {
  // ── Layout (presets come from the backend) ────────────────────────────────────
  paperPresets: LabelPaperPresetDto[] = [];
  paperName = '';
  printOnRollPaper = false;
  labelWidth = 30;
  labelHeight = 27.5;

  // ── Display options ──────────────────────────────────────────────────────────
  showProductName = true;
  showPrice = true;
  showBarcode = true;
  showBorders = true;
  barcodeType = 'Code128';
  barcodeSymbologies: LookupItemDto[] = [];

  // Slider ranges (min/max/step/default) come from the backend.
  nameRange: LabelFieldRangeDto = { field: 'productNameFontPt', min: 4, max: 12, default: 8, step: 1 };
  priceRange: LabelFieldRangeDto = { field: 'priceFontPt', min: 6, max: 16, default: 11, step: 1 };
  barcodeRange: LabelFieldRangeDto = { field: 'barcodeHeightPt', min: 8, max: 20, default: 14, step: 1 };
  productNameSize = 8;
  priceSize = 11;
  barcodeHeight = 14;

  // ── Products ─────────────────────────────────────────────────────────────────
  productSearch = '';
  allProducts: TagProduct[] = [];
  availableProducts: TagProduct[] = [];
  selectedProducts: TagProduct[] = [];
  numberOfCopies = 1;
  loading = false;
  optionsLoading = false;
  error = '';

  // ── Templates ────────────────────────────────────────────────────────────────
  templates: PosBarcodeLabelTemplateDto[] = [];
  selectedTemplateId = '';
  newTemplateName = '';
  savingTemplate = false;

  // ── Preview ──────────────────────────────────────────────────────────────────
  previewItems: TagProduct[] = [];
  previewInfo = '';
  currencyPrefix = 'Rs';
  rendering = false;

  /** Cache of rendered barcode images, keyed by `value|symbology`. */
  private barcodeCache: Record<string, string> = {};

  constructor(
    private itemService: ItemService,
    private labelService: BarcodeLabelService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadDesignerOptions();
    this.loadAllProducts();
    this.loadTemplates();
  }

  ngOnDestroy() {
    // data: URLs don't need revoking; nothing to clean up.
  }

  // ── Backend-driven options ────────────────────────────────────────────────────
  loadDesignerOptions() {
    this.optionsLoading = true;
    this.labelService.getDesignerOptions().subscribe({
      next: (res) => {
        const opt = res.data;
        this.barcodeSymbologies = opt?.barcodeSymbologies ?? [];
        if (this.barcodeSymbologies.length && !this.barcodeSymbologies.some(b => b.value === this.barcodeType)) {
          this.barcodeType = this.barcodeSymbologies[0].value ?? this.barcodeType;
        }
        this.paperPresets = opt?.paperPresets ?? [];
        if (this.paperPresets.length) {
          this.paperName = this.paperPresets[0].name ?? '';
          this.applyPaperPreset();
        }
        this.applyRanges(opt?.sliderRanges ?? []);
        this.optionsLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        // Keep the built-in defaults if the lookup is unavailable.
        this.optionsLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private applyRanges(ranges: LabelFieldRangeDto[]) {
    for (const r of ranges) {
      const f = (r.field ?? '').toLowerCase();
      if (f.includes('name')) { this.nameRange = r; this.productNameSize = r.default; }
      else if (f.includes('price')) { this.priceRange = r; this.priceSize = r.default; }
      else if (f.includes('barcode')) { this.barcodeRange = r; this.barcodeHeight = r.default; }
    }
  }

  applyPaperPreset() {
    const preset = this.paperPresets.find(p => p.name === this.paperName);
    if (!preset) return;
    this.printOnRollPaper = preset.rollPaper;
    this.labelWidth = preset.widthMm;
    this.labelHeight = preset.heightMm;
    this.cdr.detectChanges();
  }

  get isLabelPaper(): boolean { return !this.printOnRollPaper; }

  // ── Templates (save / load / set default) ─────────────────────────────────────
  loadTemplates() {
    this.labelService.getTemplates().subscribe({
      next: (res) => {
        this.templates = res.data ?? [];
        const def = this.templates.find(t => t.isDefault);
        if (def && !this.selectedTemplateId) {
          this.selectedTemplateId = def.id;
          this.applyTemplate(def);
        }
        this.cdr.detectChanges();
      },
      error: () => { /* templates are optional */ },
    });
  }

  onTemplateSelected() {
    const t = this.templates.find(x => x.id === this.selectedTemplateId);
    if (t) this.applyTemplate(t);
  }

  private applyTemplate(t: PosBarcodeLabelTemplateDto) {
    this.labelWidth = t.labelWidthMm;
    this.labelHeight = t.labelHeightMm;
    this.printOnRollPaper = t.rollPaper;
    this.barcodeType = t.barcodeSymbology ?? this.barcodeType;
    this.showProductName = t.showProductName;
    this.showPrice = t.showPrice;
    this.showBarcode = t.showBarcodeValue;
    this.showBorders = t.showBorders;
    this.productNameSize = t.productNameFontPt;
    this.priceSize = t.priceFontPt;
    this.barcodeHeight = t.barcodeHeightPt;
    this.currencyPrefix = t.currencySymbol ?? this.currencyPrefix;
    this.paperName = ''; // a loaded template overrides the preset selection
    this.onSymbologyChange();
    this.cdr.detectChanges();
  }

  private toTemplateDto(name: string): CreatePosBarcodeLabelTemplateDto {
    return {
      templateName: name,
      labelWidthMm: this.labelWidth,
      labelHeightMm: this.labelHeight,
      barcodeSymbology: this.barcodeType,
      headerText: null,
      showProductName: this.showProductName,
      showPrice: this.showPrice,
      showSku: false,
      showBarcodeValue: this.showBarcode,
      currencySymbol: this.currencyPrefix,
      productNameFontPt: this.productNameSize,
      priceFontPt: this.priceSize,
      barcodeHeightPt: this.barcodeHeight,
      showBorders: this.showBorders,
      rollPaper: this.printOnRollPaper,
      isDefault: false,
    };
  }

  saveTemplate() {
    const name = this.newTemplateName.trim();
    if (!name) { this.error = 'Enter a template name.'; this.cdr.detectChanges(); return; }
    this.savingTemplate = true;
    this.error = '';
    this.labelService.createTemplate(this.toTemplateDto(name)).subscribe({
      next: (res) => {
        this.savingTemplate = false;
        this.newTemplateName = '';
        if (res.data?.id) this.selectedTemplateId = res.data.id;
        this.loadTemplates();
      },
      error: () => { this.savingTemplate = false; this.error = 'Failed to save template.'; this.cdr.detectChanges(); },
    });
  }

  setDefaultTemplate() {
    if (!this.selectedTemplateId) { this.error = 'Select a template first.'; this.cdr.detectChanges(); return; }
    this.labelService.setDefaultTemplate(this.selectedTemplateId).subscribe({
      next: () => this.loadTemplates(),
      error: () => { this.error = 'Failed to set default template.'; this.cdr.detectChanges(); },
    });
  }

  get barcodeTypeOptions(): { value: string; label: string }[] {
    return this.barcodeSymbologies.map(b => ({ value: b.value ?? '', label: b.label ?? b.value ?? '' }));
  }

  // ── Product loading / search ─────────────────────────────────────────────────
  private toTag(item: ItemDto): TagProduct {
    const primaryBarcode =
      item.barcodes?.find(b => b.isPrimary && b.isActive) ??
      item.barcodes?.find(b => b.isActive) ??
      item.barcodes?.[0];
    const price = item.prices?.find(p => p.isActive) ?? item.prices?.[0];
    return {
      id: item.id,
      name: item.name ?? 'Item',
      code: item.code ?? '',
      price: price?.salePrice ?? 0,
      barcode: primaryBarcode?.barcode ?? item.code ?? '',
    };
  }

  loadAllProducts() {
    this.loading = true;
    this.error = '';
    this.itemService.getActive().subscribe({
      next: (res) => {
        this.allProducts = (res.data ?? []).map(i => this.toTag(i));
        this.availableProducts = [...this.allProducts];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load products.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  searchProducts() {
    const q = this.productSearch.toLowerCase().trim();
    if (!q) { this.availableProducts = [...this.allProducts]; return; }
    this.availableProducts = this.allProducts.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.barcode.toLowerCase().includes(q),
    );
  }

  // ── Selection ────────────────────────────────────────────────────────────────
  addProduct(p: TagProduct) {
    if (!this.selectedProducts.some(s => s.id === p.id)) {
      this.selectedProducts = [...this.selectedProducts, p];
    }
  }
  removeProduct(p: TagProduct) { this.selectedProducts = this.selectedProducts.filter(s => s.id !== p.id); }
  isSelected(p: TagProduct): boolean { return this.selectedProducts.some(s => s.id === p.id); }
  clearProducts() { this.selectedProducts = []; }
  selectAllProducts() {
    const ids = new Set(this.selectedProducts.map(s => s.id));
    this.selectedProducts = [...this.selectedProducts, ...this.availableProducts.filter(p => !ids.has(p.id))];
  }
  increaseCopies() { this.numberOfCopies++; }
  decreaseCopies() { if (this.numberOfCopies > 1) this.numberOfCopies--; }

  // ── Barcode images (real, from the backend) ───────────────────────────────────
  onSymbologyChange() {
    this.barcodeCache = {};
    this.fetchBarcodes(this.previewItems);
  }

  private cacheKey(value: string): string { return `${value}|${this.barcodeType}`; }
  barcodeUrl(p: TagProduct): string | undefined { return this.barcodeCache[this.cacheKey(p.barcode)]; }

  private fetchBarcodes(items: TagProduct[]) {
    if (!this.showBarcode) return;
    const values = Array.from(new Set(items.map(i => i.barcode).filter(v => !!v)));
    for (const value of values) {
      const key = this.cacheKey(value);
      if (this.barcodeCache[key]) continue;
      this.labelService.getBarcodeDataUrl(value, this.barcodeType).subscribe({
        next: (dataUrl) => { this.barcodeCache[key] = dataUrl; this.cdr.detectChanges(); },
        error: () => { /* fall back to the placeholder stripes */ },
      });
    }
  }

  // ── Preview ──────────────────────────────────────────────────────────────────
  generatePreview() {
    const copies = Math.max(1, Math.floor(this.numberOfCopies) || 1);
    this.previewItems = this.selectedProducts.flatMap(p => Array.from({ length: copies }, () => p));
    this.previewInfo = `${this.selectedProducts.length} product(s) × ${copies} = ${this.previewItems.length} tag(s)`;
    this.fetchBarcodes(this.previewItems);
    this.cdr.detectChanges();
  }

  // ── Print (client-side, embeds real barcode images) ───────────────────────────
  printTags() {
    if (this.previewItems.length === 0) this.generatePreview();
    if (this.previewItems.length === 0) { this.error = 'Add products and generate a preview first.'; this.cdr.detectChanges(); return; }
    const html = this.buildPrintHtml();
    const w = window.open('', '_blank');
    if (!w) { this.error = 'Allow pop-ups to print price tags.'; this.cdr.detectChanges(); return; }
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => { try { w.print(); } catch { /* user can print manually */ } }, 400);
  }

  /** Server-rendered PDF (proper label output for thermal printers). */
  saveServerPdf() {
    if (this.selectedProducts.length === 0) { this.error = 'Select at least one product.'; this.cdr.detectChanges(); return; }
    const copies = Math.max(1, Math.floor(this.numberOfCopies) || 1);
    const dto: RenderBarcodeLabelBatchDto = {
      templateId: this.selectedTemplateId || null,
      symbology: this.barcodeType,
      items: this.selectedProducts.map(p => ({
        barcodeValue: p.barcode,
        productName: p.name,
        sku: p.code,
        price: p.price,
        copies,
      })),
    };
    this.rendering = true;
    this.error = '';
    this.labelService.renderBatch(dto).subscribe({
      next: (blob) => {
        this.rendering = false;
        const url = URL.createObjectURL(blob);
        const w = window.open(url, '_blank');
        if (!w) {
          const a = document.createElement('a');
          a.href = url; a.download = 'price-tags.pdf'; a.click();
        }
        setTimeout(() => URL.revokeObjectURL(url), 60000);
        this.cdr.detectChanges();
      },
      error: () => { this.rendering = false; this.error = 'Failed to render label PDF.'; this.cdr.detectChanges(); },
    });
  }

  private escape(s: string): string {
    return (s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
  }

  private buildPrintHtml(): string {
    const w = this.labelWidth;
    const h = this.labelHeight;
    const labelMode = this.isLabelPaper;
    const pageRule = labelMode
      ? `@page { size: ${w}mm ${h}mm; margin: 1mm; }`
      : `@page { size: auto; margin: 6mm; }`;
    const tagStyle = `
      width:${w}mm;${labelMode ? `height:${h}mm;` : ''}
      box-sizing:border-box;display:inline-flex;flex-direction:column;
      align-items:center;justify-content:center;text-align:center;
      padding:1mm;${this.showBorders ? 'border:0.3mm solid #000;' : ''}
      ${labelMode ? 'page-break-after:always;' : 'margin:1mm;'}`;
    const tags = this.previewItems.map(p => {
      const name = this.showProductName ? `<div style="font-size:${this.productNameSize}pt;font-weight:700;line-height:1.1;max-width:100%;overflow:hidden">${this.escape(p.name)}</div>` : '';
      const price = this.showPrice ? `<div style="font-size:${this.priceSize}pt;font-weight:700">${this.currencyPrefix}${(p.price ?? 0).toFixed(0)}</div>` : '';
      const img = this.barcodeUrl(p);
      const barcode = this.showBarcode
        ? (img
            ? `<img src="${img}" style="height:${this.barcodeHeight}px;max-width:100%;object-fit:contain" />`
            : `<div style="height:${this.barcodeHeight}px;width:90%;background:repeating-linear-gradient(90deg,#000 0 1px,#fff 1px 3px)"></div>`)
          + `<div style="font-size:5pt;letter-spacing:1px">${this.escape(p.barcode)}</div>`
        : '';
      return `<div style="${tagStyle}">${name}${price}${barcode}</div>`;
    }).join('');
    return `<!doctype html><html><head><meta charset="utf-8"><title>Price Tags</title>
      <style>${pageRule}
        *{font-family:Arial,Helvetica,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
        body{margin:0;${labelMode ? '' : 'display:flex;flex-wrap:wrap;align-content:flex-start;'}}
      </style></head><body>${tags}</body></html>`;
  }
}
