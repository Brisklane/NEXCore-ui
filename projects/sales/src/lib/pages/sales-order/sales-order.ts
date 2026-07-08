import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { GeoService, CountryDto, SubdivisionDto, CityDto } from '@nexcore/core';
import { EntityPickerInputComponent, EntityPickerItem, EntityPickerColumn, EntityPickerDisplayField } from '@nexcore/core';
import { InventoryBalanceService } from '@nexcore/inventory';
import { WarehouseService, WarehouseDto } from '@nexcore/inventory';
import { DeliveryService } from '../../services/delivery.service';
import { CreateDeliveryDto } from '../../models/delivery.model';
import { SalesOrderService } from '../../services/sales-order.service';
import { SalesLookupService } from '../../services/sales-lookup.service';
import { EnumLookupDto } from '../../models/sales-lookup.model';
import { ContactService } from '@nexcore/crm';
import { ContactDto, CreateContactDto } from '@nexcore/crm';
import { PriceListService } from '../../services/price-list.service';
import { PriceListDto } from '../../models/price-list.model';
import { ItemService } from '@nexcore/inventory';
import { ItemDto } from '@nexcore/inventory';
import { TaxDefinitionService } from '@nexcore/inventory';
import { TaxDefinitionDto } from '@nexcore/inventory';
import { PosStoreService } from '../../services/pos-store.service';
import { PosTerminalService } from '../../services/pos-terminal.service';
import { PosCashierService } from '../../services/pos-cashier.service';
import { PosStoreDto } from '../../models/pos-store.model';
import { PosTerminalDto } from '../../models/pos-terminal.model';
import { PosCashierDto } from '../../models/pos-cashier.model';
import { RowHighlighter } from '@nexcore/shared';
import {
  SalesOrderDto,
  SalesOrderLineDto,
  SalesOrderStatus,
  SalesChannel,
  CreateSalesOrderDto,
  CreateSalesOrderLineDto,
  CreateInvoiceFromOrderDto,
} from '../../models/sales-order.model';

@Component({
  selector: 'lib-sales-order',
  standalone: true,
  imports: [CommonModule, FormsModule, EntityPickerInputComponent],
  templateUrl: './sales-order.html',
  styleUrl: './sales-order.css',
})
export class SalesOrder implements OnInit {
  orders: SalesOrderDto[] = [];
  loading = false;
  error = '';
  successMsg = '';

  highlighter = new RowHighlighter();

  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  sort(column: string): void {
    if (this.sortBy === column) this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else { this.sortBy = column; this.sortDirection = 'asc'; }
    this.cdr.detectChanges();
  }

  // ─── Lookups ────────────────────────────────────────────────────────────
  lookupsLoaded = false;
  channelOptions: EnumLookupDto[] = [];
  fulfillmentTypeOptions: EnumLookupDto[] = [];
  paymentTermOptions: EnumLookupDto[] = [];
  discountTypeOptions: EnumLookupDto[] = [];
  incotermOptions: EnumLookupDto[] = [];
  orderStatusOptions: EnumLookupDto[] = [];

  // Fallback static channels used before lookups load
  readonly defaultChannels: SalesChannel[] = [
    'InStore', 'Online', 'MobileApp', 'Phone', 'WebPOS', 'AndroidPOS',
    'B2B', 'Portal', 'Marketplace', 'Partner', 'Other',
  ];
  readonly defaultStatuses: SalesOrderStatus[] = [
    'Draft', 'Placed', 'PendingApproval', 'Confirmed', 'Preparing',
    'ReadyForPickup', 'OutForDelivery', 'Delivered', 'PartiallyDelivered', 'FullyDelivered',
    'Invoiced', 'PartiallyPaid', 'PaidAndClosed', 'OnHold', 'Rejected',
    'Cancelled', 'Closed',
  ];
  readonly defaultFulfillmentTypes = [
    { value: 'Delivery', name: 'Delivery' },
    { value: 'Pickup', name: 'Pickup' },
    { value: 'DineIn', name: 'Dine In' },
    { value: 'TakeAway', name: 'Take Away' },
    { value: 'Shipping', name: 'Shipping' },
  ];
  readonly defaultPaymentTerms = [
    { value: 'Immediate', name: 'Immediate' },
    { value: 'Net15', name: 'Net 15' },
    { value: 'Net30', name: 'Net 30' },
    { value: 'Net60', name: 'Net 60' },
    { value: 'Net90', name: 'Net 90' },
    { value: 'COD', name: 'Cash on Delivery' },
    { value: 'Prepaid', name: 'Prepaid' },
  ];
  readonly defaultDiscountTypes = [
    { value: 'Percentage', name: 'Percentage' },
    { value: 'FixedAmount', name: 'Fixed Amount' },
    { value: 'FreeShipping', name: 'Free Shipping' },
    { value: 'FixedPrice', name: 'Fixed Price' },
    { value: 'BuyXGetY', name: 'Buy X Get Y' },
  ];
  readonly defaultIncoterms = [
    { value: 'EXW', name: 'EXW – Ex Works' },
    { value: 'FCA', name: 'FCA – Free Carrier' },
    { value: 'FAS', name: 'FAS – Free Alongside Ship' },
    { value: 'FOB', name: 'FOB – Free On Board' },
    { value: 'CFR', name: 'CFR – Cost and Freight' },
    { value: 'CIF', name: 'CIF – Cost, Insurance & Freight' },
    { value: 'CPT', name: 'CPT – Carriage Paid To' },
    { value: 'CIP', name: 'CIP – Carriage and Insurance Paid' },
    { value: 'DAP', name: 'DAP – Delivered At Place' },
    { value: 'DPU', name: 'DPU – Delivered At Place Unloaded' },
    { value: 'DDP', name: 'DDP – Delivered Duty Paid' },
  ];

  private readonly statusMap: Record<number, SalesOrderStatus> = {
    0: 'Draft', 1: 'PendingApproval', 2: 'Confirmed', 3: 'PartiallyDelivered', 4: 'FullyDelivered',
    5: 'Invoiced', 6: 'Closed', 7: 'Cancelled', 8: 'OnHold', 9: 'PosParked', 10: 'PartiallyPaid',
    11: 'PaidAndClosed', 12: 'Preparing', 13: 'ReadyForPickup', 14: 'OutForDelivery', 15: 'Delivered',
    16: 'DeliveryFailed', 17: 'PaymentPending', 18: 'Placed', 19: 'Rejected',
  };

  private readonly channelMap: Record<number, SalesChannel> = {
    0: 'InStore', 1: 'Online', 2: 'MobileApp', 3: 'Phone', 4: 'WebPOS',
    5: 'AndroidPOS', 6: 'B2B', 7: 'Portal', 8: 'Marketplace', 9: 'Partner', 10: 'Other',
  };

  // Reverse maps: string → integer (what the API expects)
  private readonly channelToInt: Record<string, number> = {
    InStore: 0, Online: 1, MobileApp: 2, Phone: 3, WebPOS: 4,
    AndroidPOS: 5, B2B: 6, Portal: 7, Marketplace: 8, Partner: 9, Other: 10,
  };
  private readonly statusToInt: Record<string, number> = {
    Draft: 0, PendingApproval: 1, Confirmed: 2, PartiallyDelivered: 3, FullyDelivered: 4,
    Invoiced: 5, Closed: 6, Cancelled: 7, OnHold: 8, PosParked: 9, PartiallyPaid: 10,
    PaidAndClosed: 11, Preparing: 12, ReadyForPickup: 13, OutForDelivery: 14, Delivered: 15,
    DeliveryFailed: 16, PaymentPending: 17, Placed: 18, Rejected: 19,
  };
  private readonly fulfillmentToInt: Record<string, number> = {
    Delivery: 0, Pickup: 1, DineIn: 2, TakeAway: 3, Shipping: 4, DriveThrough: 5, Curbside: 6,
  };
  private readonly paymentTermsToInt: Record<string, number> = {
    Immediate: 0, Net15: 1, Net30: 2, Net60: 3, Net90: 4,
    COD: 5, Prepaid: 6, EndOfMonth: 7, HalfUpfront: 8, Custom: 9,
  };
  private readonly incotermToInt: Record<string, number> = {
    EXW: 0, FCA: 1, FAS: 2, FOB: 3, CFR: 4, CIF: 5,
    CPT: 6, CIP: 7, DAP: 8, DPU: 9, DDP: 10,
  };

  private toEnumInt(map: Record<string, number>, val: string | number | null | undefined): number | null {
    if (val === null || val === undefined || val === '') return null;
    // The backend enum lookup may expose `value` either as the enum name
    // ("Delivery") or as its integer ("0"). Accept both, plus the hardcoded
    // string fallbacks used before lookups load.
    if (typeof val === 'number') return val;
    if (/^\d+$/.test(val)) return Number(val);
    return map[val] ?? null;
  }

  // ─── Filters ───────────────────────────────────────────────────────────
  statusFilter = '';
  channelFilter = '';
  searchNumber = '';
  activeStatFilter = '';

  // ─── Panels ────────────────────────────────────────────────────────────
  showCreateForm = false;
  selectedOrder: SalesOrderDto | null = null;
  detailLoading = false;

  // ─── Create form ────────────────────────────────────────────────────────
  form: CreateSalesOrderDto = this.blankForm();
  newLine: CreateSalesOrderLineDto = this.blankLine();
  saving = false;
  activeTab: 'order' | 'pricing' | 'delivery' | 'items' | 'pos' = 'order';

  // ─── Contact picker ─────────────────────────────────────────────────────
  contacts: ContactDto[] = [];

  // ─── Price lists ────────────────────────────────────────────────────────
  priceLists: PriceListDto[] = [];

  // ─── Inventory items ────────────────────────────────────────────────────
  inventoryItems: ItemDto[] = [];

  // ─── Tax definitions (for item price/rate info) and category lookup (for enum values)
  taxDefinitions: TaxDefinitionDto[] = [];
  taxCategories: EnumLookupDto[] = [];

  // ─── POS origin cascading dropdowns ────────────────────────────────────
  posStores: PosStoreDto[] = [];
  posTerminals: PosTerminalDto[] = [];
  posCashiers: PosCashierDto[] = [];

  // ─── Delivery address geo ───────────────────────────────────────────────
  allCountries: CountryDto[] = [];
  deliverySubdivisions: SubdivisionDto[] = [];
  deliveryCities: CityDto[] = [];
  deliveryCountryCode = '';
  deliverySubdivisionCode = '';
  loadingDeliverySubdivisions = false;
  loadingDeliveryCities = false;

  // ─── Delivery phone ─────────────────────────────────────────────────────
  deliveryPhoneCountry: CountryDto | null = null;
  deliveryPhone = '';
  showDeliveryPhoneDropdown = false;

  // ─── Searchable country/phone pickers (default Pakistan) ─────────────────
  showDeliveryCountryDropdown = false;
  deliveryPhoneSearch = '';
  deliveryCountrySearch = '';
  private static readonly DEFAULT_COUNTRY_CODE = 'PK';

  constructor(
    private orderService: SalesOrderService,
    private lookupService: SalesLookupService,
    private contactService: ContactService,
    private priceListService: PriceListService,
    private itemService: ItemService,
    private taxService: TaxDefinitionService,
    private posStoreService: PosStoreService,
    private posTerminalService: PosTerminalService,
    private posCashierService: PosCashierService,
    private cdr: ChangeDetectorRef,
    private geo: GeoService,
    private balanceService: InventoryBalanceService,
    private warehouseService: WarehouseService,
    private deliveryService: DeliveryService,
  ) {}

  ngOnInit() {
    this.loadLookups();
    this.loadContacts();
    this.loadPriceLists();
    this.loadInventoryItems();
    this.warehouseService.getActive().subscribe({ next: (r) => { this.warehouseList = r.data ?? []; this.cdr.detectChanges(); }, error: () => {} });
    this.loadTaxDefinitions();
    this.loadPosStores();
    this.load();
    this.geo.getCountries().subscribe({
      next: (c) => {
        this.allCountries = c;
        if (!this.deliveryPhoneCountry) this.deliveryPhoneCountry = this.defaultCountry();
        this.applyDeliveryDefaults();
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  loadPosStores() {
    this.posStoreService.getAll().subscribe({
      next: (res) => {
        this.posStores = res.data ?? [];
        // If the form is already open and no store selected yet, auto-select the first one
        if (this.showCreateForm && !this.form.originBranchId && this.posStores.length > 0) {
          this.form.originBranchId = this.posStores[0].id;
          this.onPosStoreChange(this.posStores[0].id);
        }
        this.cdr.detectChanges();
      },
      error: () => { /* non-critical */ },
    });
  }

  onPosStoreChange(storeId: string) {
    this.form.originPosTerminalId = '';
    this.form.originPosCashierId = '';
    this.posTerminals = [];
    this.posCashiers = [];
    if (!storeId) return;
    this.posTerminalService.getByBranch(storeId).subscribe({
      next: (res) => {
        this.posTerminals = res.data ?? [];
        if (this.showCreateForm && !this.form.originPosTerminalId && this.posTerminals.length) {
          this.form.originPosTerminalId = this.posTerminals[0].id;
        }
        this.cdr.detectChanges();
      },
      error: () => { this.posTerminals = []; },
    });
    this.posCashierService.getByStore(storeId).subscribe({
      next: (res) => {
        this.posCashiers = res.data ?? [];
        if (this.showCreateForm && !this.form.originPosCashierId && this.posCashiers.length) {
          this.form.originPosCashierId = this.posCashiers[0].id;
        }
        this.cdr.detectChanges();
      },
      error: () => { this.posCashiers = []; },
    });
  }

  normFulfillment(v: string | number | null): string {
    const map: Record<number, string> = {
      0: 'Delivery', 1: 'Pickup', 2: 'DineIn', 3: 'TakeAway', 4: 'Shipping', 5: 'DriveThrough', 6: 'Curbside',
    };
    if (v === null || v === undefined) return '';
    const n = typeof v === 'number' ? v : (/^\d+$/.test(String(v)) ? +v : NaN);
    return !isNaN(n) ? (map[n] ?? String(v)) : String(v);
  }

  loadLookups() {
    this.lookupService.loadOrderFormLookups().subscribe({
      next: (lookups) => {
        this.channelOptions = lookups.salesChannels;
        this.fulfillmentTypeOptions = lookups.fulfillmentTypes;
        this.paymentTermOptions = lookups.paymentTerms;
        this.discountTypeOptions = lookups.discountTypes;
        this.incotermOptions = lookups.incoterms;
        this.orderStatusOptions = lookups.orderStatuses;
        this.lookupsLoaded = true;
        this.applyOrderDefaults();
        this.cdr.detectChanges();
      },
      error: () => {
        this.lookupsLoaded = true;
        this.cdr.detectChanges();
      },
    });
  }

  load() {
    this.loading = true;
    this.error = '';
    this.orderService.getAll().subscribe({
      next: (res) => {
        this.orders = res.data ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load sales orders.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  get filtered(): SalesOrderDto[] {
    const filteredRows = this.orders.filter(o => {
      const status = this.normStatus(o.status);
      const channel = this.normChannel(o.salesChannel);
      // Stat group filters
      if (this.activeStatFilter === 'online' &&
          !['Online', 'MobileApp', 'Marketplace'].includes(channel)) return false;
      if (this.activeStatFilter === 'pos' &&
          !['InStore', 'WebPOS', 'AndroidPOS', 'POS'].includes(channel)) return false;
      if (this.activeStatFilter === 'phone' && channel !== 'Phone') return false;
      if (this.activeStatFilter === 'pending' &&
          !['Placed', 'PendingApproval', 'Confirmed'].includes(status)) return false;
      if (this.activeStatFilter === 'today') {
        const today = new Date().toISOString().split('T')[0];
        if (!o.orderDate?.startsWith(today)) return false;
      }
      // Regular filters
      if (this.statusFilter && status !== this.statusFilter) return false;
      if (this.channelFilter && channel !== this.channelFilter) return false;
      const q = this.searchNumber.toLowerCase();
      if (q && !(o.orderNumber ?? '').toLowerCase().includes(q) &&
               !(o.contactName ?? '').toLowerCase().includes(q)) return false;
      return true;
    });
    const rows = [...filteredRows];
    if (this.sortBy) {
      const dir = this.sortDirection === 'asc' ? 1 : -1;
      rows.sort((a: any, b: any) => {
        const av = a?.[this.sortBy], bv = b?.[this.sortBy];
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
        return String(av).localeCompare(String(bv), undefined, { numeric: true }) * dir;
      });
    }
    const hid = this.highlighter?.id;
    if (hid != null) { const i = rows.findIndex(r => r?.id === hid); if (i > 0) { const [x] = rows.splice(i, 1); rows.unshift(x); } }
    return rows;
  }

  filterStat(key: string) {
    this.clearMessages();
    if (this.activeStatFilter === key) {
      this.activeStatFilter = '';
    } else {
      this.activeStatFilter = key;
      this.channelFilter = '';
      this.statusFilter = '';
    }
  }

  // ─── Stats ──────────────────────────────────────────────────────────────

  get statsTotal(): number { return this.orders.length; }

  get statsOnline(): number {
    return this.orders.filter(o =>
      ['Online', 'MobileApp', 'Marketplace'].includes(this.normChannel(o.salesChannel))).length;
  }

  get statsPOS(): number {
    return this.orders.filter(o =>
      ['InStore', 'WebPOS', 'AndroidPOS', 'POS'].includes(this.normChannel(o.salesChannel))).length;
  }

  get statsPhone(): number {
    return this.orders.filter(o => this.normChannel(o.salesChannel) === 'Phone').length;
  }

  get statsPending(): number {
    return this.orders.filter(o =>
      ['Placed', 'PendingApproval', 'Confirmed'].includes(this.normStatus(o.status))).length;
  }

  get statsToday(): number {
    const today = new Date().toISOString().split('T')[0];
    return this.orders.filter(o => o.orderDate?.startsWith(today)).length;
  }

  get statsRevenue(): number {
    return this.filtered.reduce((s, o) => s + (o.totalAmount ?? 0), 0);
  }

  normStatus(v: SalesOrderStatus | number | string | null): string {
    if (v === null || v === undefined) return '';
    const n = typeof v === 'number' ? v : (/^\d+$/.test(String(v)) ? +v : NaN);
    if (!isNaN(n)) return this.statusMap[n] ?? String(v);
    return v as string;
  }

  normChannel(v: SalesChannel | number | string | null): string {
    if (v === null || v === undefined) return '';
    const n = typeof v === 'number' ? v : (/^\d+$/.test(String(v)) ? +v : NaN);
    if (!isNaN(n)) return this.channelMap[n] ?? String(v);
    return v as string;
  }

  /** Normalize a backend enum lookup to the { value, name } shape the template renders. */
  private toOptions(opts: EnumLookupDto[]): Array<{ value: string; name: string }> {
    return opts.map(o => ({ value: o.value, name: o.label ?? o.name ?? o.value }));
  }

  // Each dropdown prefers the backend lookup once loaded; the hardcoded list is
  // only a fallback shown before the lookups arrive (or if the call fails).
  get displayChannels(): Array<{ value: string; name: string }> {
    return this.channelOptions.length
      ? this.toOptions(this.channelOptions)
      : this.defaultChannels.map(c => ({ value: c, name: c }));
  }

  get displayStatuses(): Array<{ value: string; name: string }> {
    return this.orderStatusOptions.length
      ? this.toOptions(this.orderStatusOptions)
      : this.defaultStatuses.map(s => ({ value: s, name: s }));
  }

  get displayFulfillmentTypes(): Array<{ value: string; name: string }> {
    return this.fulfillmentTypeOptions.length
      ? this.toOptions(this.fulfillmentTypeOptions)
      : this.defaultFulfillmentTypes;
  }

  get displayPaymentTerms(): Array<{ value: string; name: string }> {
    return this.paymentTermOptions.length
      ? this.toOptions(this.paymentTermOptions)
      : this.defaultPaymentTerms;
  }

  get displayDiscountTypes(): Array<{ value: string; name: string }> {
    return this.discountTypeOptions.length
      ? this.toOptions(this.discountTypeOptions)
      : this.defaultDiscountTypes;
  }

  get displayIncoterms(): Array<{ value: string; name: string }> {
    return this.incotermOptions.length
      ? this.toOptions(this.incotermOptions)
      : this.defaultIncoterms;
  }

  // ─── Create ─────────────────────────────────────────────────────────────

  loadContacts() {
    // Load every contact by paging through, so the customer picker's "Search more"
    // modal can paginate the full customer list (mirrors the item picker).
    this.contactService.getAll({ page: 1, pageSize: 100 }).subscribe({
      next: (res) => {
        const all = [...(res.data ?? [])];
        const totalPages = res.pagination?.totalPages ?? 1;
        if (totalPages <= 1) { this.contacts = all; this.applyOrderDefaults(); this.cdr.detectChanges(); return; }
        const pages: number[] = [];
        for (let p = 2; p <= totalPages; p++) pages.push(p);
        forkJoin(pages.map(p => this.contactService.getAll({ page: p, pageSize: 100 }))).subscribe({
          next: (rest) => {
            rest.forEach(r => all.push(...(r.data ?? [])));
            this.contacts = all; this.applyOrderDefaults(); this.cdr.detectChanges();
          },
          error: () => { this.contacts = all; this.applyOrderDefaults(); this.cdr.detectChanges(); },
        });
      },
      error: () => { /* non-critical */ },
    });
  }

  loadPriceLists() {
    this.priceListService.getActive().subscribe({
      next: (res) => { this.priceLists = res.data ?? []; this.applyOrderDefaults(); this.cdr.detectChanges(); },
      error: () => { /* non-critical */ },
    });
  }

  loadInventoryItems() {
    // Load every active item by paging through (server caps pageSize at 100), so the
    // item picker's "Search more" modal can paginate the full catalogue.
    this.itemService.getActivePaged({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (res) => {
        let all = [...(res.data ?? [])];
        const totalPages = res.pagination?.totalPages ?? 1;
        if (totalPages <= 1) { this.inventoryItems = all; this.cdr.detectChanges(); return; }
        const pages: number[] = [];
        for (let p = 2; p <= totalPages; p++) pages.push(p);
        forkJoin(pages.map(p => this.itemService.getActivePaged({ pageNumber: p, pageSize: 100 }))).subscribe({
          next: (results) => {
            for (const r of results) all = all.concat(r.data ?? []);
            this.inventoryItems = all;
            this.cdr.detectChanges();
          },
          error: () => { this.inventoryItems = all; this.cdr.detectChanges(); },
        });
      },
      error: () => { /* non-critical */ },
    });
  }

  loadTaxDefinitions() {
    this.taxService.getSales().subscribe({
      next: (res) => { this.taxDefinitions = res.data ?? []; },
      error: () => { /* non-critical */ },
    });
    this.lookupService.getTaxCategories().subscribe({
      next: (data) => { this.taxCategories = data; },
      error: () => { /* non-critical */ },
    });
  }

  onItemSelect(itemId: string) {
    const item = this.inventoryItems.find(i => i.id === itemId);
    if (!item) return;
    this.newLine.productId = itemId;
    this.newLine.productName = item.name ?? null;
    this.newLine.productCode = item.code ?? null;
    const price = item.prices?.find(p => p.isActive);
    if (price) this.newLine.unitPrice = price.salePrice;
    // taxCategory is a backend integer enum — user selects it from the dropdown
    this.fetchStock(itemId);
  }

  itemName(productId: string): string {
    const item = this.inventoryItems.find(i => i.id === productId);
    return item ? (item.name ?? productId) : productId;
  }

  // ─── Item picker (5 suggestions + paginated modal) ───────────────────────
  readonly itemDisplayFields: EntityPickerDisplayField[] = [
    { key: 'code', style: 'code' },
    { key: 'name', style: 'name' },
  ];
  readonly itemColumns: EntityPickerColumn[] = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
  ];
  get itemPickerOptions(): EntityPickerItem[] {
    return this.inventoryItems.map(i => ({ id: i.id, name: i.name ?? '', code: i.code ?? '' }));
  }

  // ─── Live stock availability ──────────────────────────────────────────────
  stockByItemId: Record<string, number> = {};
  stockLoadingByItemId: Record<string, boolean> = {};

  private fetchStock(itemId: string) {
    if (!itemId) return;
    if (this.stockByItemId[itemId] !== undefined || this.stockLoadingByItemId[itemId]) return;
    this.stockLoadingByItemId[itemId] = true;
    this.balanceService.getByItem(itemId).subscribe({
      next: (res) => {
        const total = (res.data ?? []).reduce((s, b) => s + Math.max(0, Number(b.quantityAvailable) || 0), 0);
        this.stockByItemId[itemId] = total;
        this.stockLoadingByItemId[itemId] = false;
        this.cdr.detectChanges();
      },
      error: () => { this.stockByItemId[itemId] = 0; this.stockLoadingByItemId[itemId] = false; this.cdr.detectChanges(); },
    });
  }

  /** Available units for an item, or null if not yet loaded. */
  availableFor(itemId: string): number | null {
    return this.stockByItemId[itemId] ?? null;
  }
  isStockLoading(itemId: string): boolean {
    return !!this.stockLoadingByItemId[itemId];
  }
  isOverStock(itemId: string, qty: number): boolean {
    const avail = this.availableFor(itemId);
    return avail !== null && qty > avail;
  }
  /** True when any added line (or the row being entered) exceeds available stock. */
  get hasStockIssue(): boolean {
    return this.form.lines.some(l => this.isOverStock(l.productId, l.quantity));
  }

  onContactSelect(id: string) {
    const c = this.contacts.find(x => x.id === id);
    if (!c) { this.form.contactName = null; return; }
    // Backend requires a non-empty contactName alongside contactId.
    this.form.contactName = this.contactDisplayName(c);
    if (!this.form.shipToStreet && c.mailingStreet) this.form.shipToStreet = c.mailingStreet;
    if (!this.form.shipToCity && c.mailingCity) this.form.shipToCity = c.mailingCity;
    if (!this.form.shipToCountry && c.mailingCountry) this.form.shipToCountry = c.mailingCountry;
    if (!this.form.shipToName) this.form.shipToName = `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() || null;
  }

  private contactDisplayName(c: ContactDto): string {
    return `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() || c.accountName || c.email || 'Customer';
  }

  // ─── Customer picker (5 suggestions + paginated modal + quick add) ────────
  readonly contactDisplayFields: EntityPickerDisplayField[] = [
    { key: 'name', style: 'name' },
    { key: 'account', style: 'badge' },
  ];
  readonly contactColumns: EntityPickerColumn[] = [
    { key: 'name', header: 'Name' },
    { key: 'account', header: 'Account' },
    { key: 'phone', header: 'Phone' },
  ];
  get contactPickerOptions(): EntityPickerItem[] {
    return this.contacts.map(c => ({
      id: c.id,
      name: this.contactDisplayName(c),
      account: c.accountName ?? '',
      phone: c.phone ?? '',
    }));
  }

  onContactPicked(item: EntityPickerItem) {
    this.form.contactId = item['id'];
    this.onContactSelect(item['id']);
    this.cdr.detectChanges();
  }

  // ─── Quick-create customer (contact) ─────────────────────────────────────
  showQuickContact = false;
  qcSaving = false;
  qcError = '';
  qcFirst = '';
  qcLast = '';
  qcPhone = '';
  qcEmail = '';
  qcCountry = '';
  qcCity = '';
  qcStreet = '';
  qcCities: CityDto[] = [];
  qcLoadingCities = false;

  get qcCountryList(): CountryDto[] {
    return this.allCountries.filter(c => c.isActive && c.code);
  }

  onQcCountryChange(code: string) {
    this.qcCountry = code;
    this.qcCity = '';
    this.qcCities = [];
    if (!code) { this.cdr.detectChanges(); return; }
    this.qcLoadingCities = true;
    this.geo.getCities(code).subscribe({
      next: (cities) => { this.qcCities = cities; this.qcLoadingCities = false; this.cdr.detectChanges(); },
      error: () => { this.qcCities = []; this.qcLoadingCities = false; this.cdr.detectChanges(); },
    });
  }

  openQuickCreateContact(typed: string) {
    this.qcError = '';
    const parts = (typed ?? '').trim().split(/\s+/).filter(Boolean);
    this.qcFirst = parts.shift() ?? '';
    this.qcLast = parts.join(' ');
    this.qcPhone = '';
    this.qcEmail = '';
    this.qcCountry = '';
    this.qcCity = '';
    this.qcStreet = '';
    this.qcCities = [];
    this.showQuickContact = true;
    this.cdr.detectChanges();
  }

  cancelQuickContact() {
    this.showQuickContact = false;
    this.qcError = '';
    this.cdr.detectChanges();
  }

  saveQuickContact() {
    if (!this.qcFirst.trim() && !this.qcLast.trim()) {
      this.qcError = 'Enter a first or last name.';
      this.cdr.detectChanges();
      return;
    }
    this.qcSaving = true;
    this.qcError = '';
    const dto: CreateContactDto = {
      firstName: this.qcFirst.trim() || null,
      lastName: this.qcLast.trim() || null,
      phone: this.qcPhone.trim() || null,
      email: this.qcEmail.trim() || null,
      mailingCountry: this.qcCountry.trim() || null,
      mailingCity: this.qcCity.trim() || null,
      mailingStreet: this.qcStreet.trim() || null,
      emailOptOut: false,
    };
    this.contactService.create(dto).subscribe({
      next: (res) => {
        this.qcSaving = false;
        const created = res.data;
        if (created) {
          this.contacts = [created, ...this.contacts];
          this.form.contactId = created.id;
          this.onContactSelect(created.id);
        }
        this.showQuickContact = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.qcSaving = false;
        this.qcError = 'Failed to create customer.';
        this.cdr.detectChanges();
      },
    });
  }

  // ─── Delivery geo cascade ────────────────────────────────────────────────
  onDeliveryCountrySelected(code: string) {
    const country = this.allCountries.find(c => c.code === code);
    this.deliveryCountryCode = code;
    this.form.shipToCountry = country?.name ?? '';
    this.deliverySubdivisionCode = '';
    this.form.shipToState = '';
    this.form.shipToCity = '';
    this.deliverySubdivisions = [];
    this.deliveryCities = [];
    if (country) this.deliveryPhoneCountry = country;
    if (!code) return;
    this.loadingDeliverySubdivisions = true;
    this.geo.getSubdivisions(code).subscribe({
      next: (s) => { this.deliverySubdivisions = s; this.loadingDeliverySubdivisions = false; this.cdr.detectChanges(); },
      error: () => { this.loadingDeliverySubdivisions = false; this.cdr.detectChanges(); },
    });
  }

  onDeliveryStateSelected(code: string) {
    const sub = this.deliverySubdivisions.find(s => s.code === code);
    this.deliverySubdivisionCode = code;
    this.form.shipToState = sub?.name ?? '';
    this.form.shipToCity = '';
    this.deliveryCities = [];
    if (!code || !this.deliveryCountryCode) return;
    this.loadingDeliveryCities = true;
    this.geo.getCities(this.deliveryCountryCode, code).subscribe({
      next: (c) => { this.deliveryCities = c; this.loadingDeliveryCities = false; this.cdr.detectChanges(); },
      error: () => { this.loadingDeliveryCities = false; this.cdr.detectChanges(); },
    });
  }

  onDeliveryCitySelected(name: string) {
    this.form.shipToCity = name;
    const city = this.deliveryCities.find(c => c.name === name);
    if (city?.postalCode && !this.form.shipToPostalCode) this.form.shipToPostalCode = city.postalCode;
  }

  // ─── Default country (Pakistan) ──────────────────────────────────────────
  private defaultCountry(): CountryDto | null {
    return this.allCountries.find(c => c.code === SalesOrder.DEFAULT_COUNTRY_CODE)
      ?? this.allCountries[0] ?? null;
  }

  /** Pre-select Pakistan in the delivery tab when creating a new order. */
  private applyDeliveryDefaults() {
    if (!this.showCreateForm || !this.allCountries.length) return;
    const pk = this.defaultCountry();
    if (!this.deliveryPhoneCountry) this.deliveryPhoneCountry = pk;
    if (!this.deliveryCountryCode && pk?.code) this.onDeliveryCountrySelected(pk.code);
  }

  private resetDeliveryGeo() {
    this.deliveryCountryCode = '';
    this.deliverySubdivisionCode = '';
    this.deliverySubdivisions = [];
    this.deliveryCities = [];
    this.deliveryPhone = '';
    this.deliveryPhoneSearch = '';
    this.deliveryCountrySearch = '';
    this.showDeliveryPhoneDropdown = false;
    this.showDeliveryCountryDropdown = false;
  }

  // ─── Searchable pickers ───────────────────────────────────────────────────
  get filteredPhoneCountries(): CountryDto[] { return this.filterCountries(this.deliveryPhoneSearch); }
  get filteredDeliveryCountries(): CountryDto[] { return this.filterCountries(this.deliveryCountrySearch); }

  private filterCountries(term: string): CountryDto[] {
    const q = (term ?? '').trim().toLowerCase();
    if (!q) return this.allCountries;
    return this.allCountries.filter(c =>
      (c.name ?? '').toLowerCase().includes(q) ||
      (c.code ?? '').toLowerCase().includes(q) ||
      (c.phoneCode ?? '').toLowerCase().includes(q));
  }

  get selectedDeliveryCountry(): CountryDto | null {
    return this.allCountries.find(c => c.code === this.deliveryCountryCode) ?? null;
  }

  toggleDeliveryPhoneDropdown() {
    this.showDeliveryCountryDropdown = false;
    this.showDeliveryPhoneDropdown = !this.showDeliveryPhoneDropdown;
    if (this.showDeliveryPhoneDropdown) this.deliveryPhoneSearch = '';
  }
  selectDeliveryPhoneCountry(c: CountryDto) {
    this.deliveryPhoneCountry = c;
    this.showDeliveryPhoneDropdown = false;
    this.deliveryPhoneSearch = '';
  }

  toggleDeliveryCountryDropdown() {
    this.showDeliveryPhoneDropdown = false;
    this.showDeliveryCountryDropdown = !this.showDeliveryCountryDropdown;
    if (this.showDeliveryCountryDropdown) this.deliveryCountrySearch = '';
  }
  selectDeliveryCountry(c: CountryDto) {
    this.showDeliveryCountryDropdown = false;
    this.deliveryCountrySearch = '';
    if (c.code) this.onDeliveryCountrySelected(c.code);
  }

  /** Close both geo dropdowns when clicking anywhere outside them. */
  @HostListener('document:click')
  closeGeoDropdowns() {
    this.showDeliveryPhoneDropdown = false;
    this.showDeliveryCountryDropdown = false;
  }

  deliveryFlagUrl(country: CountryDto | null): string {
    return this.geo.flagUrl(country?.code ?? null);
  }

  deliveryDialCode(country: CountryDto | null): string {
    return country ? this.geo.dialCode(country) : '';
  }

  get deliveryFullPhone(): string | null {
    return this.deliveryPhone
      ? `${this.deliveryDialCode(this.deliveryPhoneCountry)} ${this.deliveryPhone}`.trim()
      : null;
  }

  openCreate() {
    this.selectedOrder = null;
    this.showCreateForm = true;
    this.activeTab = 'order';
    this.form = this.blankForm();
    this.newLine = this.blankLine();
    this.posTerminals = [];
    this.posCashiers = [];
    this.error = '';
    this.successMsg = '';
    // Auto-select first store and load its terminals/cashiers
    if (this.posStores.length > 0) {
      this.form.originBranchId = this.posStores[0].id;
      this.onPosStoreChange(this.posStores[0].id);
    }
    // Pre-select the first value in the order's configuration dropdowns.
    this.applyOrderDefaults();
    // Delivery tab: reset the address cascade and default to Pakistan.
    this.resetDeliveryGeo();
    this.applyDeliveryDefaults();
  }

  /**
   * Pre-select the first option in the order's configuration dropdowns. Called when
   * the form opens and again as each async list arrives (the lists load independently,
   * so a value may not be ready at open time). Only fills empty fields, so it never
   * overrides a choice the user already made. Scope is deliberately limited to the
   * order-level config selects — the delivery address cascade (country/state/city)
   * and the per-line item/tax selects are data entry, not defaults, so they're left
   * blank for the user to fill in.
   */
  private applyOrderDefaults() {
    if (!this.showCreateForm) return;
    if (!this.form.contactId && this.contacts.length) {
      this.form.contactId = this.contacts[0].id;
      this.onContactSelect(this.contacts[0].id);
    }
    if (!this.form.salesChannel && this.displayChannels.length) {
      this.form.salesChannel = this.displayChannels[0].value as SalesChannel;
    }
    if (!this.form.fulfillmentType && this.displayFulfillmentTypes.length) {
      this.form.fulfillmentType = this.displayFulfillmentTypes[0].value;
    }
    if (!this.form.paymentTerms && this.displayPaymentTerms.length) {
      this.form.paymentTerms = this.displayPaymentTerms[0].value;
    }
    if (!this.form.priceListId && this.priceLists.length) {
      this.form.priceListId = this.priceLists[0].id;
    }
    if (!this.form.incoterm && this.displayIncoterms.length) {
      this.form.incoterm = this.displayIncoterms[0].value;
    }
  }

  cancelCreate() {
    this.showCreateForm = false;
  }

  private blankForm(): CreateSalesOrderDto {
    return {
      contactId: '',
      salesChannel: 'InStore',
      fulfillmentType: '',
      originBranchId: '',
      originPosTerminalId: '',
      originPosCashierId: '',
      priceListId: '',
      couponCode: '',
      paymentTerms: '',
      incoterm: '',
      customerPONumber: '',
      shipToName: '',
      shipToPhone: '',
      shipToStreet: '',
      shipToCity: '',
      shipToState: '',
      shipToPostalCode: '',
      shipToCountry: '',
      deliveryInstructions: '',
      notes: '',
      lines: [],
    };
  }

  private blankLine(): CreateSalesOrderLineDto {
    return { productId: '', productName: null, productCode: null, quantity: 1, unitPrice: 0, discountPercentage: 0, taxCategory: null };
  }

  addLine() {
    if (!this.newLine.productId.trim()) { this.error = 'Please select an item.'; return; }
    if (this.newLine.quantity <= 0) { this.error = 'Quantity must be greater than 0.'; return; }
    if (this.newLine.unitPrice < 0) { this.error = 'Unit price cannot be negative.'; return; }
    if (this.isOverStock(this.newLine.productId, this.newLine.quantity)) {
      this.error = `Only ${this.availableFor(this.newLine.productId)} unit(s) available for this item.`;
      return;
    }
    this.error = '';
    this.form.lines.push({ ...this.newLine });
    this.newLine = this.blankLine();
  }

  removeLine(i: number) {
    this.form.lines.splice(i, 1);
  }

  lineTotal(line: CreateSalesOrderLineDto): number {
    const base = line.quantity * line.unitPrice;
    return base - (base * (line.discountPercentage ?? 0) / 100);
  }

  get formTotal(): number {
    return this.form.lines.reduce((s, l) => s + this.lineTotal(l), 0);
  }

  saveOrder() {
    if (!this.form.contactId) { this.error = 'Please select a customer.'; return; }
    if (this.form.lines.length === 0) { this.error = 'Add at least one line item.'; return; }
    if (this.hasStockIssue) { this.error = 'One or more lines exceed available stock.'; return; }
    this.saving = true;
    this.clearMessages();
    // Backend requires a non-empty contactName; resolve it from the selected contact
    // in case the dropdown change handler didn't run (e.g. pre-filled form).
    const selectedContact = this.contacts.find(c => c.id === this.form.contactId);
    const contactName = this.form.contactName
      || (selectedContact ? this.contactDisplayName(selectedContact) : 'Customer');
    const payload: CreateSalesOrderDto = {
      ...this.form,
      // API requires integer enums, not strings
      salesChannel: this.toEnumInt(this.channelToInt, this.form.salesChannel as string) ?? 0,
      fulfillmentType: this.toEnumInt(this.fulfillmentToInt, this.form.fulfillmentType as string),
      paymentTerms: this.toEnumInt(this.paymentTermsToInt, this.form.paymentTerms as string),
      incoterm: this.toEnumInt(this.incotermToInt, this.form.incoterm as string),
      // required by API
      contactName,
      // nullable UUIDs
      contactId: this.form.contactId || null,
      originBranchId: this.form.originBranchId || null,
      originPosTerminalId: this.form.originPosTerminalId || null,
      originPosCashierId: this.form.originPosCashierId || null,
      priceListId: this.form.priceListId || null,
      couponCode: this.form.couponCode || null,
      customerPONumber: this.form.customerPONumber || null,
      shipToName: this.form.shipToName || null,
      shipToPhone: this.deliveryFullPhone,
      shipToStreet: this.form.shipToStreet || null,
      shipToCity: this.form.shipToCity || null,
      shipToState: this.form.shipToState || null,
      shipToPostalCode: this.form.shipToPostalCode || null,
      shipToCountry: this.form.shipToCountry || null,
      deliveryInstructions: this.form.deliveryInstructions || null,
      notes: this.form.notes || null,
      // coerce taxCategory to integer or omit — backend expects TaxCategory enum (0-4)
      lines: this.form.lines.map(l => ({
        ...l,
        taxCategory: l.taxCategory != null ? Number(l.taxCategory) : undefined,
      })),
    };
    this.orderService.create(payload).subscribe({
      next: (res) => {
        this.successMsg = 'Order created successfully.';
        this.showCreateForm = false;
        this.saving = false;
        this.load();
        this.highlighter.flash(res.data?.id, this.cdr);
      },
      error: () => {
        this.error = 'Failed to create order.';
        this.saving = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ─── Read / Detail ──────────────────────────────────────────────────────

  viewOrder(o: SalesOrderDto) {
    this.showCreateForm = false;
    this.selectedOrder = o;
    this.detailLoading = true;
    this.orderService.getFull(o.id).subscribe({
      next: (res) => {
        this.selectedOrder = res.data ?? null;
        this.detailLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.detailLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  closeDetail() {
    this.selectedOrder = null;
  }

  // ─── Fulfillment / shipment (deducts stock from the chosen warehouse) ──────
  warehouseList: WarehouseDto[] = [];
  showShipmentModal = false;
  shipWarehouseId = '';
  shipSaving = false;
  shipError = '';
  shipLines: { salesOrderLineId: string; productId: string; productCode: string; productName: string; remaining: number; shipQty: number; unitOfMeasure: string | null }[] = [];
  /** productId → warehouseId → available qty, loaded when the shipment modal opens. */
  shipAvail: Record<string, Record<string, number>> = {};

  /** Available qty of a line's product in the currently chosen source warehouse (null = still loading). */
  shipAvailableFor(productId: string): number | null {
    const m = this.shipAvail[productId];
    if (!m) return null;
    if (!this.shipWarehouseId) return null;
    return m[this.shipWarehouseId] ?? 0;
  }

  /** Statuses from which a shipment can still be created (order confirmed, stock reserved). */
  private readonly shippableStatuses = ['Confirmed', 'Preparing', 'ReadyForPickup', 'OutForDelivery', 'PartiallyDelivered'];
  canShip(o: SalesOrderDto): boolean {
    if (!this.shippableStatuses.includes(this.normStatus(o.status))) return false;
    return (o.lines ?? []).some(l => ((l.quantity ?? 0) - (l.deliveredQuantity ?? 0)) > 0);
  }

  openCreateShipment(): void {
    const o = this.selectedOrder;
    if (!o) return;
    this.shipError = '';
    this.shipLines = (o.lines ?? []).map(l => {
      const remaining = Math.max(0, (l.quantity ?? 0) - (l.deliveredQuantity ?? 0));
      return {
        salesOrderLineId: l.id, productId: l.productId,
        productCode: l.productCode ?? '', productName: l.productName ?? '',
        remaining, shipQty: remaining, unitOfMeasure: l.unitOfMeasure ?? null,
      };
    }).filter(x => x.remaining > 0);
    // Default to the warehouse already on the order lines, if any.
    this.shipWarehouseId = (o.lines ?? []).find(l => l.warehouseId)?.warehouseId ?? '';
    // Load per-warehouse availability for each product so the modal can show what's on hand.
    this.shipAvail = {};
    [...new Set(this.shipLines.map(l => l.productId))].forEach(pid => {
      this.balanceService.getByItem(pid).subscribe({
        next: (res) => {
          const map: Record<string, number> = {};
          (res.data ?? []).forEach(b => { map[b.warehouseId] = (map[b.warehouseId] ?? 0) + (Number(b.quantityAvailable) || 0); });
          this.shipAvail[pid] = map;
          this.cdr.detectChanges();
        },
        error: () => {},
      });
    });
    this.showShipmentModal = true;
    this.cdr.detectChanges();
  }

  cancelShipment(): void {
    this.showShipmentModal = false;
    this.shipError = '';
    this.cdr.detectChanges();
  }

  /** Create a delivery for the order from the chosen warehouse, then ship it — which fires the
   *  inventory stock-deduction (and COGS) events so on-hand drops in that warehouse. */
  confirmShipment(): void {
    const o = this.selectedOrder;
    if (!o) return;
    if (!this.shipWarehouseId) { this.shipError = 'Select the source warehouse.'; this.cdr.detectChanges(); return; }
    const lines = this.shipLines
      .filter(l => Number(l.shipQty) > 0)
      .map(l => ({
        salesOrderLineId: l.salesOrderLineId,
        productId: l.productId,
        productCode: l.productCode,
        productName: l.productName,
        orderedQuantity: l.remaining,
        deliveredQuantity: Number(l.shipQty),
        unitOfMeasure: l.unitOfMeasure,
      }));
    if (lines.length === 0) { this.shipError = 'Enter a quantity to ship on at least one line.'; this.cdr.detectChanges(); return; }

    this.shipSaving = true;
    this.shipError = '';
    const dto: CreateDeliveryDto = {
      salesOrderId: o.id,
      plannedDeliveryDate: new Date().toISOString().slice(0, 10),
      warehouseId: this.shipWarehouseId,
      shipToName: o.shipToName ?? null,
      shipToStreet: o.shipToStreet ?? null,
      shipToCity: o.shipToCity ?? null,
      shipToCountry: o.shipToCountry ?? null,
      lines,
    };
    this.deliveryService.create(dto).subscribe({
      next: (res) => {
        const deliveryId = res.data?.id;
        if (!deliveryId) { this.shipSaving = false; this.shipError = 'Delivery was created but no id was returned.'; this.cdr.detectChanges(); return; }
        this.deliveryService.ship(deliveryId, {}).subscribe({
          next: () => {
            this.shipSaving = false;
            this.showShipmentModal = false;
            const wh = this.warehouseList.find(w => w.id === this.shipWarehouseId);
            this.successMsg = `Shipment created — stock deducted from ${wh?.name ?? 'the selected warehouse'} and COGS posted.`;
            this.viewOrder(o);
            this.load();
          },
          error: (e) => { this.shipSaving = false; this.shipError = e?.error?.message ?? 'Delivery created, but shipping (stock deduction) failed.'; this.cdr.detectChanges(); },
        });
      },
      error: (e) => { this.shipSaving = false; this.shipError = e?.error?.message ?? 'Failed to create shipment.'; this.cdr.detectChanges(); },
    });
  }

  // ─── Actions ────────────────────────────────────────────────────────────

  /** Reload the open order detail in place (keeps the panel open) and refresh the list. */
  private refreshSelectedOrder(id: string): void {
    this.orderService.getFull(id).subscribe({
      next: (res) => { if (res.data) this.selectedOrder = res.data; this.cdr.detectChanges(); },
      error: () => { this.cdr.detectChanges(); },
    });
    this.load();
  }

  /** Draft → Confirmed in one step (place, then confirm) — no separate "Place Order" step. */
  confirmFromDraft(id: string): void {
    this.clearMessages();
    this.orderService.place(id).subscribe({
      next: () => {
        this.orderService.updateStatus(id, { status: (this.toEnumInt(this.statusToInt, 'Confirmed') ?? 0) as any }).subscribe({
          next: () => { this.successMsg = 'Order confirmed.'; this.refreshSelectedOrder(id); },
          error: () => { this.error = 'Order placed, but confirmation failed.'; this.refreshSelectedOrder(id); },
        });
      },
      error: () => { this.error = 'Failed to confirm order.'; this.cdr.detectChanges(); },
    });
  }

  /** Statuses from which the backend allows an invoice to be generated. */
  private readonly invoiceableStatuses = [
    'Confirmed', 'Preparing', 'ReadyForPickup', 'OutForDelivery',
    'PartiallyDelivered', 'FullyDelivered', 'PartiallyPaid',
  ];
  canInvoice(o: SalesOrderDto): boolean {
    if (!this.invoiceableStatuses.includes(this.normStatus(o.status))) return false;
    // Hide once everything is invoiced (backend bumps invoicedQuantity per line on generate).
    return (o.lines ?? []).some(l => ((l.quantity ?? 0) - (l.invoicedQuantity ?? 0)) > 0);
  }

  /** Placed order → Confirmed (the first invoiceable status). */
  confirmOrder(id: string) {
    this.updateStatus(id, 'Confirmed');
  }

  /** Generate a regular invoice from an invoiceable order (lands as a Draft invoice). */
  generateInvoice(id: string) {
    this.clearMessages();
    const dto: CreateInvoiceFromOrderDto = { invoiceType: 0 };
    this.orderService.createInvoice(id, dto).subscribe({
      next: (res) => {
        const num = res.data?.invoiceNumber ?? '';
        this.successMsg = `Invoice ${num} generated. Open it in Sales Invoices and click Confirm to make it payable.`;
        this.refreshSelectedOrder(id);
      },
      error: (err) => {
        this.error = this.extractError(err, 'Failed to generate invoice.');
        this.cdr.detectChanges();
      },
    });
  }

  private extractError(err: unknown, fallback: string): string {
    const body = (err as { error?: { message?: string; errors?: string[] } })?.error;
    if (body?.message) return body.message;
    if (Array.isArray(body?.errors) && body.errors.length) return body.errors.join(' | ');
    return fallback;
  }

  updateStatus(id: string, status: SalesOrderStatus) {
    this.clearMessages();
    const statusInt = this.toEnumInt(this.statusToInt, status) ?? 0;
    this.orderService.updateStatus(id, { status: statusInt as any }).subscribe({
      next: () => {
        this.successMsg = `Order status updated to ${status}.`;
        this.refreshSelectedOrder(id);
      },
      error: () => {
        this.error = 'Failed to update status.';
        this.cdr.detectChanges();
      },
    });
  }

  deleteOrder(id: string) {
    if (!confirm('Delete this order? This action cannot be undone.')) return;
    this.clearMessages();
    this.orderService.delete(id).subscribe({
      next: () => {
        this.successMsg = 'Order deleted.';
        this.closeDetail();
        this.load();
      },
      error: () => {
        this.error = 'Failed to delete order.';
        this.cdr.detectChanges();
      },
    });
  }

  // ─── Badge helpers ──────────────────────────────────────────────────────

  badgeClass(status: SalesOrderStatus | number | string | null): string {
    return `badge badge-${this.normStatus(status).toLowerCase().replace(/\s+/g, '') || 'unknown'}`;
  }

  channelBadgeClass(channel: SalesChannel | number | string | null): string {
    const c = this.normChannel(channel).toLowerCase().replace(/\s|_/g, '');
    if (c.includes('online') || c.includes('mobileapp') || c.includes('mobile')) return 'badge channel-badge ch-online';
    if (c.includes('webpos')) return 'badge channel-badge ch-webpos';
    if (c.includes('androidpos') || c.includes('android')) return 'badge channel-badge ch-android';
    if (c === 'pos' || c === 'instore') return 'badge channel-badge ch-pos';
    if (c.includes('phone')) return 'badge channel-badge ch-phone';
    if (c.includes('b2b')) return 'badge channel-badge ch-b2b';
    if (c.includes('portal')) return 'badge channel-badge ch-portal';
    if (c.includes('marketplace')) return 'badge channel-badge ch-marketplace';
    if (c.includes('partner')) return 'badge channel-badge ch-partner';
    return 'badge channel-badge ch-default';
  }

  channelLabel(channel: SalesChannel | number | string | null): string {
    const map: Record<string, string> = {
      InStore: 'In-Store', Online: 'Online', MobileApp: 'Mobile App',
      Phone: 'Phone', WebPOS: 'Web POS', AndroidPOS: 'Android POS',
      B2B: 'B2B', Portal: 'Portal', Marketplace: 'Marketplace',
      Partner: 'Partner', Other: 'Other', Direct: 'Direct', POS: 'POS',
    };
    const key = this.normChannel(channel);
    return map[key] ?? (key || '--');
  }

  // ─── Helpers ────────────────────────────────────────────────────────────

  clearMessages() {
    this.error = '';
    this.successMsg = '';
  }
}

