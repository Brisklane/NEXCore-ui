import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '@env';
import { EntityPickerInputComponent, EntityPickerItem, EntityPickerColumn, EntityPickerDisplayField } from '@nexcore/core';
import { LedgerService, LedgerAccountService } from '@nexcore/accounting';
import { ItemService } from '../../services/item.service';
import { InventoryLookupService } from '../../services/inventory-lookup.service';
import { UnitService } from '../../services/unit.service';
import { WarehouseService } from '../../services/warehouse.service';
import { InventoryDocumentService } from '../../services/inventory-document.service';
import { WarehouseDto } from '../../models/warehouse.model';
import { ItemCategoryService } from '../../services/item-category.service';
import { BrandService } from '../../services/brand.service';
import { ColorService } from '../../services/color.service';
import { TaxDefinitionService } from '../../services/tax-definition.service';
import { AttributeDefinitionService } from '../../services/attribute-definition.service';
import { SizeService } from '../../services/size.service';
import {
  ItemDto, CreateItemDto, UpdateItemDto, ItemImageDto,
  CreateItemBarcodeDto, CreateItemPriceDto,
  AssignItemTaxDto, UpsertItemAttributeDto, AssignItemSizeDto,
  CreateItemVariantDto, UpsertItemShippingDto, UpsertItemSeoDto,
  UpsertItemChannelListingDto, AssignItemSupplierDto, AddBundleComponentDto,
  AddItemSubstitutionDto, UpsertItemWarrantyDto, CreateItemDiscountDto, CreateItemCommentDto
} from '../../models/item.model';
import { LookupItemDto } from '../../models/inventory-lookup.model';
import { UnitDto } from '../../models/unit.model';
import { ItemCategoryDto } from '../../models/item-category.model';
import { BrandDto } from '../../models/brand.model';
import { ColorDto } from '../../models/color.model';
import { TaxDefinitionDto } from '../../models/tax-definition.model';
import { AttributeDefinitionDto } from '../../models/attribute-definition.model';
import { SizeDto } from '../../models/size.model';

type EditorSection = 'basic' | 'stock' | 'pricing' | 'accounts' | 'media' | 'attributes' | 'logistics' | 'commerce';

/** Full-page item editor (create + edit) — replaces the legacy inline tab form. */
@Component({
  selector: 'lib-item-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, EntityPickerInputComponent],
  templateUrl: './item-editor.html',
  styleUrl: './item-editor.css',
})
export class ItemEditorPage implements OnInit {
  editingItem: ItemDto | null = null;
  loading = false;
  saving = false;
  error = '';
  section: EditorSection = 'basic';

  readonly sections: { key: EditorSection; label: string; icon: string }[] = [
    { key: 'basic', label: 'Basic Info', icon: 'info' },
    { key: 'stock', label: 'Stock & Tracking', icon: 'inventory' },
    { key: 'pricing', label: 'Pricing & Barcodes', icon: 'sell' },
    { key: 'accounts', label: 'GL Accounts', icon: 'account_balance' },
    { key: 'media', label: 'Media & Colors', icon: 'image' },
    { key: 'attributes', label: 'Attributes & Variants', icon: 'tune' },
    { key: 'logistics', label: 'Logistics & Warranty', icon: 'local_shipping' },
    { key: 'commerce', label: 'Commerce', icon: 'storefront' },
  ];

  // Tracking type options
  trackingTypes: LookupItemDto[] = [
    { value: 'None', label: 'None (quantity only)' },
    { value: 'Lot', label: 'Lot / Batch tracked' },
    { value: 'Serial', label: 'Serial / IMEI tracked' },
  ];

  // Lookups
  itemTypes: LookupItemDto[] = [];
  itemConditions: LookupItemDto[] = [];
  costingMethods: LookupItemDto[] = [];
  units: UnitDto[] = [];
  categories: ItemCategoryDto[] = [];
  brands: BrandDto[] = [];
  colors: ColorDto[] = [];
  taxDefinitions: TaxDefinitionDto[] = [];
  attributeDefinitions: AttributeDefinitionDto[] = [];
  sizeOptions: SizeDto[] = [];
  items: ItemDto[] = [];   // for bundle/substitution pickers

  // Nested collections
  formColorIds: string[] = [];
  pendingImages: { file: File; altText: string; displayOrder: number; isPrimary: boolean; previewUrl: string }[] = [];
  uploadedImages: ItemImageDto[] = [];
  formBarcodes: CreateItemBarcodeDto[] = [];
  formPrices: CreateItemPriceDto[] = [];
  formTaxes: AssignItemTaxDto[] = [];
  formAttributes: UpsertItemAttributeDto[] = [];
  formSizes: AssignItemSizeDto[] = [];
  formVariants: CreateItemVariantDto[] = [];
  formShipping: UpsertItemShippingDto = { requiresSpecialHandling: false, isHazmat: false, isShippableInternational: true };
  formSeo: UpsertItemSeoDto = {};
  formChannelListings: UpsertItemChannelListingDto[] = [];
  formSuppliers: AssignItemSupplierDto[] = [];
  formBundleComponents: AddBundleComponentDto[] = [];
  formSubstitutions: AddItemSubstitutionDto[] = [];
  formWarranty: UpsertItemWarrantyDto = { durationMonths: 0 };
  formDiscounts: CreateItemDiscountDto[] = [];
  formComments: CreateItemCommentDto[] = [];

  // Draft row helpers
  pendingImageFile: File | null = null;
  newImageAltText = '';
  newImageDisplayOrder = 0;
  newImageIsPrimary = false;
  imagePreviewUrl: string | null = null;
  @ViewChild('imageFileInput') imageFileInput!: ElementRef<HTMLInputElement>;
  newBarcode: CreateItemBarcodeDto = { isPrimary: false };
  newPrice: CreateItemPriceDto = { unitId: '', salePrice: 0, purchasePrice: 0, isTaxInclusive: false };
  newTax: AssignItemTaxDto = { taxDefinitionId: '' };
  newAttribute: UpsertItemAttributeDto = { attributeDefinitionId: '' };
  newSize: AssignItemSizeDto = { sizeId: '', isDefault: false };
  newVariant: CreateItemVariantDto = { displayOrder: 0, colorId: '', sizeId: '' };
  newChannelListing: UpsertItemChannelListingDto = { autoSyncStock: false, autoSyncPrice: false };
  newSupplier: AssignItemSupplierDto = { supplierId: '', isPrimary: false };
  newBundleComponent: AddBundleComponentDto = { componentItemId: '', quantity: 1, unitId: '', isIncludedInCost: true, displayOrder: 0 };
  newSubstitution: AddItemSubstitutionDto = { substituteItemId: '', priority: 1, isBidirectional: false };
  newDiscount: CreateItemDiscountDto = { discountValue: 0, validFrom: '', validTo: '', priority: 1 };
  newComment: CreateItemCommentDto = { isPinned: false };

  // Basic Info
  formCode = '';
  formName = '';
  formShortDescription = '';
  formDescription = '';
  formItemType = '';
  formCondition = '';
  formCostingMethod = '';
  formBaseUnitId = '';
  formCategoryId = '';
  formBrandId = '';
  formDisplayColorId = '';
  formQuickBarcode = '';
  formQuickPurchasePrice: number | null = null;
  formQuickSalePrice: number | null = null;
  formAgeRestriction = 0;

  // Stock & tracking
  formTrackingType = 'None';
  formReorderLevel: number | null = null;
  formMaxStockLevel: number | null = null;
  formEconomicOrderQuantity: number | null = null;
  formHasVariants = false;
  formIsComponent = false;
  formAlertOnLowStock = false;
  formAlertOnExcessStock = false;
  formIsActive = true;
  formIsPublished = false;
  formIsFeatured = false;

  // Opening stock (create mode)
  warehouses: WarehouseDto[] = [];
  formOpeningWarehouseId = '';
  formOpeningQty: number | null = null;
  formOpeningUnitCost: number | null = null;

  // Display Color dropdown
  showColorDropdown = false;
  get selectedColor(): ColorDto | null { return this.colors.find(c => c.id === this.formDisplayColorId) ?? null; }

  // GL Accounts
  formInventoryAccountId = '';
  formCogsAccountId = '';
  formPurchaseAccountId = '';
  formSalesAccountId = '';
  glAccountsFromCategory = false;
  categoryMissingGlAccounts = false;
  glAccounts: EntityPickerItem[] = [];
  readonly accountDisplayFields: EntityPickerDisplayField[] = [
    { key: 'accountNumber', style: 'code' },
    { key: 'accountName', style: 'name' },
  ];
  readonly accountColumns: EntityPickerColumn[] = [
    { key: 'accountNumber', header: 'Account #' },
    { key: 'accountName', header: 'Name' },
    { key: 'currencyCode', header: 'Currency' },
  ];

  // Barcode availability
  barcodeStatus: 'idle' | 'checking' | 'available' | 'taken' = 'idle';
  barcodeStatusMsg = '';
  private barcodeCheckTimer?: ReturnType<typeof setTimeout>;
  private barcodeCheckSeq = 0;

  constructor(
    private service: ItemService,
    private lookup: InventoryLookupService,
    private unitService: UnitService,
    private categoryService: ItemCategoryService,
    private brandService: BrandService,
    private colorService: ColorService,
    private taxService: TaxDefinitionService,
    private attributeService: AttributeDefinitionService,
    private sizeService: SizeService,
    private ledgerService: LedgerService,
    private ledgerAccountService: LedgerAccountService,
    private warehouseService: WarehouseService,
    private documentService: InventoryDocumentService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  get isEdit(): boolean { return !!this.editingItem; }

  ngOnInit(): void {
    this.warehouseService.getAll({ pageNumber: 1, pageSize: 200 }).subscribe({ next: (r) => { this.warehouses = r.data ?? []; this.cdr.detectChanges(); } });
    this.lookup.getItemTypes().subscribe({ next: (r) => { this.itemTypes = r.data ?? []; this.cdr.detectChanges(); } });
    this.lookup.getItemConditions().subscribe({ next: (r) => { this.itemConditions = r.data ?? []; this.cdr.detectChanges(); } });
    this.lookup.getCostingMethods().subscribe({ next: (r) => { this.costingMethods = r.data ?? []; this.cdr.detectChanges(); } });
    this.unitService.getActive().subscribe({ next: (r) => { this.units = r.data ?? []; this.cdr.detectChanges(); } });
    this.categoryService.getActive({ pageSize: 1000 }).subscribe({ next: (r) => { this.categories = r.data ?? []; this.cdr.detectChanges(); } });
    this.brandService.getActive().subscribe({ next: (r) => { this.brands = r.data ?? []; this.cdr.detectChanges(); } });
    this.colorService.getActive().subscribe({ next: (r) => { this.colors = r.data ?? []; this.cdr.detectChanges(); } });
    this.taxService.getAll({ pageSize: 1000 }).subscribe({ next: (r) => { this.taxDefinitions = r.data ?? []; this.cdr.detectChanges(); } });
    this.attributeService.getAll({ pageSize: 1000 }).subscribe({ next: (r) => { this.attributeDefinitions = r.data ?? []; this.cdr.detectChanges(); } });
    this.sizeService.getAll({ pageSize: 1000 }).subscribe({ next: (r) => { this.sizeOptions = r.data ?? []; this.cdr.detectChanges(); } });
    this.service.getBasic('', 1000).subscribe({ next: (r) => { this.items = r.data ?? []; this.cdr.detectChanges(); }, error: () => {} });
    this.loadAllGlAccounts();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loading = true;
      this.service.getById(id).subscribe({
        next: (res) => { if (res.data) { this.editingItem = res.data; this.populateForm(res.data); } this.loading = false; this.cdr.detectChanges(); },
        error: (err: HttpErrorResponse) => { this.error = this.extractErrorMessage(err, 'Failed to load item'); this.loading = false; this.cdr.detectChanges(); },
      });
    } else {
      this.formCode = 'Auto-generated';
      this.suggestNextItemCode();
    }
  }

  private loadAllGlAccounts(): void {
    this.ledgerService.getAll({ pageSize: 100 }).subscribe({
      next: (res) => {
        const first = (res.data ?? [])[0];
        if (!first?.id) return;
        const ledgerId = first.id as string;
        this.ledgerAccountService.getChartOfAccounts(ledgerId, { pageNumber: 1, pageSize: 200 }).subscribe({
          next: (r) => {
            let all = [...(r.data ?? [])];
            const ps = r.pagination?.pageSize ?? (all.length || 100);
            const totalPages = r.pagination?.totalPages ?? (r.pagination ? Math.ceil(r.pagination.totalCount / ps) : 1);
            if (!totalPages || totalPages <= 1) { this.glAccounts = this.cleanGlAccounts(all); this.cdr.detectChanges(); return; }
            const pageNos: number[] = [];
            for (let pg = 2; pg <= totalPages; pg++) pageNos.push(pg);
            forkJoin(pageNos.map(pg => this.ledgerAccountService.getChartOfAccounts(ledgerId, { pageNumber: pg, pageSize: ps }))).subscribe({
              next: (pages) => { for (const pr of pages) all = all.concat(pr.data ?? []); this.glAccounts = this.cleanGlAccounts(all); this.cdr.detectChanges(); },
              error: () => { this.glAccounts = this.cleanGlAccounts(all); this.cdr.detectChanges(); },
            });
          },
        });
      },
    });
  }

  private suggestNextItemCode(): void { this.probeFreeItemCode(1, 0); }
  private probeFreeItemCode(num: number, attempts: number): void {
    if (attempts > 200) return;
    const candidate = `ITM-${num.toString().padStart(6, '0')}`;
    this.service.getByCode(candidate).subscribe({
      next: (res) => { if (res?.data) { this.probeFreeItemCode(num + 1, attempts + 1); } else { this.formCode = candidate; this.cdr.detectChanges(); } },
      error: () => { this.formCode = candidate; this.cdr.detectChanges(); },
    });
  }
  private bumpItemCode(code: string): string {
    const m = (code ?? '').match(/^(.*?)(\d+)\s*$/);
    if (!m) return code ? `${code}-1` : `ITM-000001`;
    const prefix = m[1];
    const num = (parseInt(m[2], 10) + 1).toString().padStart(m[2].length, '0');
    return `${prefix}${num}`;
  }

  get missingFields(): string[] {
    const missing: string[] = [];
    if (!this.formName.trim()) missing.push('Name');
    if (!this.formItemType) missing.push('Item Type');
    if (!this.formBaseUnitId) missing.push('Base Unit');
    if (!this.formCategoryId) missing.push('Category');
    return missing;
  }
  get canSave(): boolean { return this.missingFields.length === 0; }

  onColorFocusOut(event: FocusEvent): void {
    const wrapper = event.currentTarget as HTMLElement;
    if (!wrapper.contains(event.relatedTarget as Node)) { this.showColorDropdown = false; this.cdr.detectChanges(); }
  }
  resolveImageUrl(url: string | null): string { if (!url) return ''; return url.startsWith('/') ? environment.apiBaseUrl + url : url; }

  unitName(id: string): string { return this.units.find(u => u.id === id)?.name ?? id; }
  taxName(id: string): string { return this.taxDefinitions.find(t => t.id === id)?.name ?? id; }
  attrName(id: string): string { return this.attributeDefinitions.find(a => a.id === id)?.name ?? id; }
  sizeName(id: string): string { return this.sizeOptions.find(s => s.id === id)?.name ?? id; }
  itemName(id: string): string { return this.items.find(i => i.id === id)?.name ?? id; }
  private cleanName(s: string | null | undefined): string { if (!s) return ''; return s.replace(/�/g, ' - ').replace(/\s+/g, ' ').trim(); }
  private cleanGlAccounts(raw: object[]): EntityPickerItem[] {
    return (raw as EntityPickerItem[]).map(a => ({ ...a, accountName: this.cleanName(a['accountName'] as string) }));
  }
  accountLabel(id: string): string {
    if (!id) return '';
    const a = this.glAccounts.find(x => x['id'] === id);
    if (!a) return id;
    const num = a['accountNumber'] ?? '';
    const name = this.cleanName(a['accountName'] as string);
    return num && name ? `${num} - ${name}` : (name || num || id);
  }
  get selectedCategoryName(): string { return this.categories.find(c => c.id === this.formCategoryId)?.name ?? ''; }

  toggleColorId(id: string): void { const i = this.formColorIds.indexOf(id); i >= 0 ? this.formColorIds.splice(i, 1) : this.formColorIds.push(id); }
  hasColorId(id: string): boolean { return this.formColorIds.includes(id); }

  onImageFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (this.imagePreviewUrl) URL.revokeObjectURL(this.imagePreviewUrl);
    this.pendingImageFile = file;
    this.imagePreviewUrl = URL.createObjectURL(file);
    this.cdr.detectChanges();
  }
  addImage(): void {
    if (!this.pendingImageFile) return;
    const file = this.pendingImageFile;
    const previewUrl = this.imagePreviewUrl!;
    const altText = this.newImageAltText;
    const displayOrder = this.newImageDisplayOrder;
    const isPrimary = this.newImageIsPrimary;
    this.pendingImageFile = null; this.imagePreviewUrl = null; this.newImageAltText = ''; this.newImageDisplayOrder = 0; this.newImageIsPrimary = false;
    if (this.imageFileInput) this.imageFileInput.nativeElement.value = '';
    if (this.editingItem) {
      this.service.uploadImages(this.editingItem.id, [file], altText || null, displayOrder, isPrimary).subscribe({
        next: (res) => { this.uploadedImages.push(...(res.data ?? [])); this.cdr.detectChanges(); },
        error: (err: HttpErrorResponse) => { this.error = this.extractErrorMessage(err, 'Failed to upload image'); this.cdr.detectChanges(); },
      });
    } else {
      this.pendingImages.push({ file, altText, displayOrder, isPrimary, previewUrl });
      this.cdr.detectChanges();
    }
  }
  removePendingImage(i: number): void { URL.revokeObjectURL(this.pendingImages[i].previewUrl); this.pendingImages.splice(i, 1); }
  deleteUploadedImage(img: ItemImageDto): void {
    if (!this.editingItem) return;
    this.service.deleteImage(this.editingItem.id, img.id).subscribe({
      next: () => { this.uploadedImages = this.uploadedImages.filter(i => i.id !== img.id); this.cdr.detectChanges(); },
      error: (err: HttpErrorResponse) => { this.error = this.extractErrorMessage(err, 'Failed to delete image'); this.cdr.detectChanges(); },
    });
  }

  addBarcode(): void {
    if (!this.newBarcode.barcode) return;
    const entry: CreateItemBarcodeDto = { ...this.newBarcode };
    if (entry.isPrimary) { this.formBarcodes.forEach((b) => (b.isPrimary = false)); this.formQuickBarcode = (entry.barcode ?? '').trim(); }
    this.formBarcodes.push(entry);
    this.newBarcode = { isPrimary: false };
  }
  removeBarcode(i: number): void { const removed = this.formBarcodes[i]; this.formBarcodes.splice(i, 1); if (removed?.isPrimary) this.formQuickBarcode = ''; }
  onPrimaryBarcodeChange(): void { this.syncPrimaryBarcode(this.formBarcodes, this.formQuickBarcode); this.checkBarcodeAvailability(); }

  private checkBarcodeAvailability(): void {
    clearTimeout(this.barcodeCheckTimer);
    const value = (this.formQuickBarcode ?? '').trim();
    if (!value) { this.barcodeStatus = 'idle'; this.barcodeStatusMsg = ''; return; }
    this.barcodeStatus = 'checking'; this.barcodeStatusMsg = 'Checking availability…';
    const seq = ++this.barcodeCheckSeq;
    this.barcodeCheckTimer = setTimeout(() => {
      this.service.getByBarcode(value).subscribe({
        next: (res) => {
          if (seq !== this.barcodeCheckSeq) return;
          const ownerId = res.data?.id;
          if (ownerId && ownerId === this.editingItem?.id) { this.barcodeStatus = 'available'; this.barcodeStatusMsg = "This is this item's barcode."; }
          else { this.barcodeStatus = 'taken'; this.barcodeStatusMsg = `Barcode already used${res.data?.name ? ' by "' + res.data.name + '"' : ''}.`; }
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          if (seq !== this.barcodeCheckSeq) return;
          if (err.status === 404) { this.barcodeStatus = 'available'; this.barcodeStatusMsg = 'Barcode is available.'; }
          else { this.barcodeStatus = 'idle'; this.barcodeStatusMsg = ''; }
          this.cdr.detectChanges();
        },
      });
    }, 400);
  }
  private syncPrimaryBarcode(list: CreateItemBarcodeDto[], primaryValue: string): void {
    const value = (primaryValue ?? '').trim();
    if (value) {
      let primary = list.find((b) => b.isPrimary);
      if (primary) primary.barcode = value;
      else { primary = { barcode: value, isPrimary: true }; list.unshift(primary); }
      list.forEach((b) => (b.isPrimary = b === primary));
    } else { const idx = list.findIndex((b) => b.isPrimary); if (idx >= 0) list.splice(idx, 1); }
  }

  addPrice(): void { if (this.newPrice.unitId) { this.formPrices.push({ ...this.newPrice }); this.newPrice = { unitId: '', salePrice: 0, purchasePrice: 0, isTaxInclusive: false }; } }
  removePrice(i: number): void { this.formPrices.splice(i, 1); }
  addTax(): void { if (this.newTax.taxDefinitionId) { this.formTaxes.push({ ...this.newTax }); this.newTax = { taxDefinitionId: '' }; } }
  removeTax(i: number): void { this.formTaxes.splice(i, 1); }
  addAttribute(): void { if (this.newAttribute.attributeDefinitionId) { this.formAttributes.push({ ...this.newAttribute }); this.newAttribute = { attributeDefinitionId: '' }; } }
  removeAttribute(i: number): void { this.formAttributes.splice(i, 1); }
  addSize(): void { if (this.newSize.sizeId) { this.formSizes.push({ ...this.newSize }); this.newSize = { sizeId: '', isDefault: false }; } }
  removeSize(i: number): void { this.formSizes.splice(i, 1); }
  addVariant(): void {
    if (this.newVariant.variantCode || this.newVariant.variantName || this.newVariant.colorId || this.newVariant.sizeId) {
      this.formVariants.push({ ...this.newVariant, displayOrder: this.formVariants.length });
      this.newVariant = { displayOrder: 0, colorId: '', sizeId: '' };
    }
  }
  removeVariant(i: number): void { this.formVariants.splice(i, 1); }
  addChannelListing(): void { if (this.newChannelListing.channel) { this.formChannelListings.push({ ...this.newChannelListing }); this.newChannelListing = { autoSyncStock: false, autoSyncPrice: false }; } }
  removeChannelListing(i: number): void { this.formChannelListings.splice(i, 1); }
  addSupplier(): void { if (this.newSupplier.supplierId) { this.formSuppliers.push({ ...this.newSupplier }); this.newSupplier = { supplierId: '', isPrimary: false }; } }
  removeSupplier(i: number): void { this.formSuppliers.splice(i, 1); }
  addBundleComponent(): void { if (this.newBundleComponent.componentItemId) { this.formBundleComponents.push({ ...this.newBundleComponent, displayOrder: this.formBundleComponents.length }); this.newBundleComponent = { componentItemId: '', quantity: 1, unitId: '', isIncludedInCost: true, displayOrder: 0 }; } }
  removeBundleComponent(i: number): void { this.formBundleComponents.splice(i, 1); }
  addSubstitution(): void { if (this.newSubstitution.substituteItemId) { this.formSubstitutions.push({ ...this.newSubstitution }); this.newSubstitution = { substituteItemId: '', priority: 1, isBidirectional: false }; } }
  removeSubstitution(i: number): void { this.formSubstitutions.splice(i, 1); }
  addDiscount(): void { if (this.newDiscount.discountValue > 0 && this.newDiscount.validFrom && this.newDiscount.validTo) { this.formDiscounts.push({ ...this.newDiscount }); this.newDiscount = { discountValue: 0, validFrom: '', validTo: '', priority: 1 }; } }
  removeDiscount(i: number): void { this.formDiscounts.splice(i, 1); }
  addComment(): void { if (this.newComment.comment) { this.formComments.push({ ...this.newComment }); this.newComment = { isPinned: false }; } }
  removeComment(i: number): void { this.formComments.splice(i, 1); }

  private populateForm(item: ItemDto): void {
    this.formCode = item.code ?? '';
    this.formName = item.name ?? '';
    this.formShortDescription = item.shortDescription ?? '';
    this.formDescription = item.description ?? '';
    this.formItemType = item.itemType ?? '';
    this.formCondition = item.condition ?? '';
    this.formCostingMethod = item.costingMethod ?? '';
    this.formBaseUnitId = item.baseUnitId ?? '';
    this.formCategoryId = item.categoryId ?? '';
    this.formBrandId = item.brandId ?? '';
    this.formDisplayColorId = item.displayColorId ?? '';
    this.formQuickBarcode = (item.barcodes ?? []).find(b => b.isPrimary)?.barcode ?? (item.barcodes ?? [])[0]?.barcode ?? '';
    const defaultPrice = (item.prices ?? []).find(p => p.priceList === 'Default' || p.unitId === item.baseUnitId) ?? (item.prices ?? [])[0] ?? null;
    this.formQuickPurchasePrice = defaultPrice ? (defaultPrice.purchasePrice ?? null) : null;
    this.formQuickSalePrice = defaultPrice ? (defaultPrice.salePrice ?? null) : null;
    this.formReorderLevel = item.reorderLevel ?? null;
    this.formMaxStockLevel = item.maxStockLevel ?? null;
    this.formEconomicOrderQuantity = item.economicOrderQuantity ?? null;
    this.formAgeRestriction = item.ageRestriction ?? 0;
    this.formInventoryAccountId = item.inventoryAccountId ?? '';
    this.formCogsAccountId = item.cogsAccountId ?? '';
    this.formPurchaseAccountId = item.purchaseAccountId ?? '';
    this.formSalesAccountId = item.salesAccountId ?? '';
    this.formTrackingType = item.trackingType ?? (item.isSerialTracked ? 'Serial' : item.isBatchTracked ? 'Lot' : 'None');
    this.formHasVariants = item.hasVariants;
    this.formIsComponent = item.isComponent;
    this.formAlertOnLowStock = item.alertOnLowStock;
    this.formAlertOnExcessStock = item.alertOnExcessStock;
    this.formIsActive = item.isActive;
    this.formIsPublished = item.isPublished;
    this.formIsFeatured = item.isFeatured;
    this.formColorIds = (item.colors ?? []).map(c => c.id);
    this.uploadedImages = item.images ?? [];
    this.pendingImages = [];
    this.formBarcodes = (item.barcodes ?? []).map(b => ({ barcode: b.barcode, barcodeType: b.barcodeType, unitId: b.unitId, isPrimary: b.isPrimary }));
    this.formPrices = (item.prices ?? []).map(p => ({ unitId: p.unitId, priceList: p.priceList, salePrice: p.salePrice, minSalePrice: p.minSalePrice, purchasePrice: p.purchasePrice, isTaxInclusive: p.isTaxInclusive, currencyCode: p.currencyCode, validFrom: p.validFrom, validTo: p.validTo }));
    this.formTaxes = (item.taxes ?? []).map(t => ({ taxDefinitionId: t.taxDefinitionId, overrideRate: t.overrideRate }));
    this.formAttributes = (item.attributes ?? []).map(a => ({ attributeDefinitionId: a.attributeDefinitionId, value: a.value }));
    this.formSizes = (item.sizes ?? []).map(s => ({ sizeId: s.sizeId, itemBarcodeId: s.itemBarcodeId, isDefault: s.isDefault }));
    this.formVariants = (item.variants ?? []).map(v => ({ variantCode: v.variantCode, variantName: v.variantName, colorId: v.colorId, sizeId: v.sizeId, extraDimension: v.extraDimension, barcode: v.barcode, imageUrl: v.imageUrl, salePriceOverride: v.salePriceOverride, purchasePriceOverride: v.purchasePriceOverride, weightKg: v.weightKg, displayOrder: v.displayOrder }));
    this.formShipping = item.shipping
      ? { weightKg: item.shipping.weightKg, lengthCm: item.shipping.lengthCm, widthCm: item.shipping.widthCm, heightCm: item.shipping.heightCm, countryOfOrigin: item.shipping.countryOfOrigin, hsCode: item.shipping.hsCode, unitsPerCarton: item.shipping.unitsPerCarton, cartonsPerPallet: item.shipping.cartonsPerPallet, cartonWeightKg: item.shipping.cartonWeightKg, cartonLengthCm: item.shipping.cartonLengthCm, cartonWidthCm: item.shipping.cartonWidthCm, cartonHeightCm: item.shipping.cartonHeightCm, requiresSpecialHandling: item.shipping.requiresSpecialHandling, handlingNotes: item.shipping.handlingNotes, isHazmat: item.shipping.isHazmat, isShippableInternational: item.shipping.isShippableInternational }
      : { requiresSpecialHandling: false, isHazmat: false, isShippableInternational: true };
    this.formSeo = item.seo ? { metaTitle: item.seo.metaTitle, metaDescription: item.seo.metaDescription, metaKeywords: item.seo.metaKeywords, slug: item.seo.slug, canonicalUrl: item.seo.canonicalUrl } : {};
    this.formChannelListings = (item.channelListings ?? []).map(c => ({ channel: c.channel, listingStatus: c.listingStatus, channelTitle: c.channelTitle, channelDescription: c.channelDescription, channelPrice: c.channelPrice, channelDiscount: c.channelDiscount, discountType: c.discountType, externalProductId: c.externalProductId, externalSku: c.externalSku, autoSyncStock: c.autoSyncStock, autoSyncPrice: c.autoSyncPrice }));
    this.formSuppliers = (item.suppliers ?? []).map(s => ({ supplierId: s.supplierId, supplierItemCode: s.supplierItemCode, supplierItemName: s.supplierItemName, lastPurchasePrice: s.lastPurchasePrice, currencyCode: s.currencyCode, minOrderQuantity: s.minOrderQuantity, leadTimeDays: s.leadTimeDays, isPrimary: s.isPrimary }));
    this.formBundleComponents = (item.bundleComponents ?? []).map(b => ({ componentItemId: b.componentItemId, quantity: b.quantity, unitId: b.unitId, isIncludedInCost: b.isIncludedInCost, displayOrder: b.displayOrder }));
    this.formSubstitutions = (item.substitutions ?? []).map(s => ({ substituteItemId: s.substituteItemId, priority: s.priority, note: s.note, isBidirectional: s.isBidirectional }));
    this.formWarranty = item.warranty ? { warrantyType: item.warranty.warrantyType, durationMonths: item.warranty.durationMonths, policyDescription: item.warranty.policyDescription, providerName: item.warranty.providerName, providerContact: item.warranty.providerContact } : { durationMonths: 0 };
    this.formDiscounts = (item.discounts ?? []).map(d => ({ name: d.name, discountType: d.discountType, discountValue: d.discountValue, buyQuantity: d.buyQuantity, getQuantity: d.getQuantity, minQuantity: d.minQuantity, maxQuantity: d.maxQuantity, applicableChannels: d.applicableChannels, validFrom: d.validFrom, validTo: d.validTo, priority: d.priority }));
    this.formComments = (item.comments ?? []).map(c => ({ commentType: c.commentType, comment: c.comment, isPinned: c.isPinned }));
  }

  onCategoryChange(categoryId: string): void {
    this.formCategoryId = categoryId;
    this.glAccountsFromCategory = false;
    this.categoryMissingGlAccounts = false;
    if (!this.editingItem && categoryId) {
      const cat = this.categories.find(c => c.id === categoryId);
      if (cat) {
        const hasAny = !!(cat.inventoryAccountId || cat.cogsAccountId || cat.purchaseAccountId || cat.salesAccountId);
        if (hasAny) {
          if (cat.inventoryAccountId) this.formInventoryAccountId = cat.inventoryAccountId;
          if (cat.cogsAccountId) this.formCogsAccountId = cat.cogsAccountId;
          if (cat.purchaseAccountId) this.formPurchaseAccountId = cat.purchaseAccountId;
          if (cat.salesAccountId) this.formSalesAccountId = cat.salesAccountId;
          this.glAccountsFromCategory = true;
        } else { this.categoryMissingGlAccounts = true; }
      }
    }
    this.cdr.detectChanges();
  }

  cancel(): void {
    if (this.editingItem) this.router.navigate(['../..', this.editingItem.id], { relativeTo: this.route });
    else this.router.navigate(['..'], { relativeTo: this.route });
  }

  saveItem(): void {
    if (!this.canSave) { this.error = `Please complete: ${this.missingFields.join(', ')}`; this.section = 'basic'; this.cdr.detectChanges(); return; }
    this.error = '';
    this.saving = true;

    const quickBarcodeValue = this.formQuickBarcode.trim();
    const mergedBarcodes: CreateItemBarcodeDto[] = this.formBarcodes.map((b) => ({ ...b }));
    this.syncPrimaryBarcode(mergedBarcodes, quickBarcodeValue);
    const normalizedBarcodes: CreateItemBarcodeDto[] = mergedBarcodes
      .map((b) => ({ barcode: (b.barcode ?? '').trim(), barcodeType: b.barcodeType?.trim() || 'GENERAL', unitId: b.unitId || this.formBaseUnitId, isPrimary: !!b.isPrimary }))
      .filter((b) => !!b.barcode);

    const isSerial = this.formTrackingType === 'Serial';
    const isBatch = this.formTrackingType === 'Lot';

    const dto: CreateItemDto = {
      code: this.formCode && this.formCode !== 'Auto-generated' ? this.formCode : undefined,
      name: this.formName || undefined,
      itemType: this.formItemType || undefined,
      barcode: !this.editingItem ? quickBarcodeValue || undefined : undefined,
      salePrice: !this.editingItem ? this.formQuickSalePrice : undefined,
      purchasePrice: !this.editingItem ? this.formQuickPurchasePrice : undefined,
      baseUnitId: this.formBaseUnitId,
      condition: this.formCondition || undefined,
      ageRestriction: this.formAgeRestriction,
      trackingType: this.formTrackingType,
      isBatchTracked: isBatch,
      isSerialTracked: isSerial,
      hasVariants: this.formHasVariants,
      isComponent: this.formIsComponent,
      alertOnLowStock: this.formAlertOnLowStock,
      alertOnExcessStock: this.formAlertOnExcessStock,
      isActive: this.formIsActive,
      isPublished: this.formIsPublished,
      isFeatured: this.formIsFeatured,
      colorIds: [], images: [], barcodes: [], prices: [], taxes: [], attributes: [], sizes: [], variants: [],
      channelListings: [], suppliers: [], bundleComponents: [], substitutions: [], discounts: [], comments: [],
    };
    if (this.formShortDescription.trim()) dto.shortDescription = this.formShortDescription.trim();
    if (this.formDescription.trim()) dto.description = this.formDescription.trim();
    if (this.formCostingMethod) dto.costingMethod = this.formCostingMethod;
    if (this.formCategoryId) dto.categoryId = this.formCategoryId;
    if (this.formBrandId) dto.brandId = this.formBrandId;
    if (this.formDisplayColorId) dto.displayColorId = this.formDisplayColorId;
    if (this.formReorderLevel != null) dto.reorderLevel = this.formReorderLevel;
    if (this.formMaxStockLevel != null) dto.maxStockLevel = this.formMaxStockLevel;
    if (this.formEconomicOrderQuantity != null) dto.economicOrderQuantity = this.formEconomicOrderQuantity;
    if (this.formInventoryAccountId.trim()) dto.inventoryAccountId = this.formInventoryAccountId.trim();
    if (this.formCogsAccountId.trim()) dto.cogsAccountId = this.formCogsAccountId.trim();
    if (this.formPurchaseAccountId.trim()) dto.purchaseAccountId = this.formPurchaseAccountId.trim();
    if (this.formSalesAccountId.trim()) dto.salesAccountId = this.formSalesAccountId.trim();
    if (this.formColorIds.length) dto.colorIds = this.formColorIds;
    dto.barcodes = normalizedBarcodes;
    if (this.formTaxes.length) dto.taxes = this.formTaxes;
    if (this.formAttributes.length) dto.attributes = this.formAttributes;
    if (this.formSizes.length) dto.sizes = this.formSizes;
    if (this.formVariants.length) dto.variants = this.formVariants;
    if (this.formShipping.weightKg || this.formShipping.hsCode || this.formShipping.lengthCm) dto.shipping = this.formShipping;
    if (this.formSeo.metaTitle || this.formSeo.slug) dto.seo = this.formSeo;
    if (this.formChannelListings.length) dto.channelListings = this.formChannelListings;
    if (this.formSuppliers.length) dto.suppliers = this.formSuppliers;
    if (this.formBundleComponents.length) dto.bundleComponents = this.formBundleComponents;
    if (this.formSubstitutions.length) dto.substitutions = this.formSubstitutions;
    if (this.formWarranty.durationMonths) dto.warranty = this.formWarranty;
    if (this.formDiscounts.length) dto.discounts = this.formDiscounts;
    if (this.formComments.length) dto.comments = this.formComments;

    if (this.editingItem) {
      const updateDto: UpdateItemDto = {
        code: dto.code ?? null, name: dto.name ?? null, shortDescription: dto.shortDescription ?? null, description: dto.description ?? null,
        itemType: dto.itemType ?? null, condition: dto.condition ?? null, costingMethod: dto.costingMethod ?? null, baseUnitId: dto.baseUnitId ?? null,
        categoryId: dto.categoryId ?? null, brandId: dto.brandId ?? null, displayColorId: dto.displayColorId ?? null, ageRestriction: dto.ageRestriction ?? null,
        inventoryAccountId: dto.inventoryAccountId ?? null, cogsAccountId: dto.cogsAccountId ?? null, purchaseAccountId: dto.purchaseAccountId ?? null, salesAccountId: dto.salesAccountId ?? null,
        trackingType: this.formTrackingType, isBatchTracked: isBatch, isSerialTracked: isSerial, hasVariants: dto.hasVariants ?? null, isComponent: dto.isComponent ?? null,
        reorderLevel: dto.reorderLevel ?? null, maxStockLevel: dto.maxStockLevel ?? null, economicOrderQuantity: dto.economicOrderQuantity ?? null,
        alertOnLowStock: dto.alertOnLowStock ?? null, alertOnExcessStock: dto.alertOnExcessStock ?? null,
        isActive: dto.isActive ?? null, isPublished: dto.isPublished ?? null, isFeatured: dto.isFeatured ?? null,
        salePrice: this.formQuickSalePrice != null ? this.formQuickSalePrice : null, purchasePrice: this.formQuickPurchasePrice != null ? this.formQuickPurchasePrice : null,
        colorIds: dto.colorIds ?? null, taxes: dto.taxes ?? null, attributes: dto.attributes ?? null, sizes: dto.sizes ?? null,
        shipping: dto.shipping ?? null, seo: dto.seo ?? null, warranty: dto.warranty ?? null, barcodes: dto.barcodes ?? null,
      };
      this.service.update(this.editingItem.id, updateDto).subscribe({
        next: (res) => {
          if (!res.success) { this.error = res.message || 'Failed to save item'; this.saving = false; this.cdr.detectChanges(); return; }
          const id = this.editingItem!.id;
          if (this.pendingImageFile) {
            this.service.uploadImages(id, [this.pendingImageFile], this.newImageAltText || null, this.newImageDisplayOrder, this.newImageIsPrimary).subscribe({
              next: () => this.goToDetail(id), error: () => this.goToDetail(id),
            });
          } else { this.goToDetail(id); }
        },
        error: (err: HttpErrorResponse) => { this.error = this.extractErrorMessage(err, 'Failed to save item'); this.saving = false; this.cdr.detectChanges(); },
      });
    } else {
      const attemptCreate = (attempt: number) => {
        this.service.create(dto).subscribe({
          next: (res) => {
            const newId = res.data?.id;
            const finishUp = () => {
              if (this.pendingImages.length && newId) {
                forkJoin(this.pendingImages.map(p => this.service.uploadImages(newId, [p.file], p.altText || null, p.displayOrder, p.isPrimary))).subscribe({
                  next: () => this.goToListOrDetail(newId), error: () => this.goToListOrDetail(newId),
                });
              } else { this.goToListOrDetail(newId); }
            };
            if (newId && this.formOpeningQty != null && this.formOpeningQty > 0 && this.formOpeningWarehouseId) {
              this.documentService.quickAdjust({ itemId: newId, warehouseId: this.formOpeningWarehouseId, newQuantity: this.formOpeningQty, unitCost: this.formOpeningUnitCost ?? null, reason: 'Opening stock' })
                .subscribe({ next: () => finishUp(), error: () => finishUp() });
            } else { finishUp(); }
          },
          error: (err: HttpErrorResponse) => {
            const msg = (err?.error?.message ?? '').toString().toLowerCase();
            if (attempt < 5 && /code already exists|item code/.test(msg)) { dto.code = this.bumpItemCode(dto.code ?? this.formCode); this.formCode = dto.code; attemptCreate(attempt + 1); return; }
            this.error = this.extractErrorMessage(err, 'Failed to save item'); this.saving = false; this.cdr.detectChanges();
          },
        });
      };
      attemptCreate(0);
    }
  }

  private goToDetail(id: string): void { this.router.navigate(['../..', id], { relativeTo: this.route }); }
  private goToListOrDetail(id: string | undefined): void {
    if (id) this.router.navigate(['..', id], { relativeTo: this.route });
    else this.router.navigate(['..'], { relativeTo: this.route });
  }

  private extractErrorMessage(err: HttpErrorResponse, fallback: string): string {
    const body = err.error;
    const serverErrors: string[] = Array.isArray(body?.errors) ? body.errors : [];
    const serverMsg: string = typeof body?.message === 'string' ? body.message.trim() : '';
    if (serverErrors.length) return `${fallback}: ${serverErrors.join(' | ')}`;
    if (serverMsg) return `${fallback}: ${serverMsg}`;
    return fallback;
  }
}
