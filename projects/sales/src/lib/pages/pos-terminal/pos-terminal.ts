import { Component, OnInit, OnDestroy, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PosCashierService } from '../../services/pos-cashier.service';
import { PosStoreService } from '../../services/pos-store.service';
import { PosTerminalService } from '../../services/pos-terminal.service';
import { SalesOrderService } from '../../services/sales-order.service';
import { SalesPaymentService } from '../../services/sales-payment.service';
import { SalesInvoiceService } from '../../services/sales-invoice.service';
import { CouponService } from '../../services/coupon.service';
import { PricingService } from '../../services/pricing.service';
import { PosTransactionService } from '../../services/pos-transaction.service';
import { AuthService } from '@nexcore/core';
import { ItemService, ItemDto, ItemCategoryService, ItemCategoryDto, InventoryReportService } from '@nexcore/inventory';
import { BomService, ProductionOrderService } from '@nexcore/manufacturing';
import { environment } from '@env';
import { Subscription, firstValueFrom } from 'rxjs';
import { OfflineService } from '../../services/offline.service';
import { PosDataCache, OutboxOrder } from '../../services/pos-data-cache.service';
import { PosSyncService } from '../../services/pos-sync.service';
import { PromotionService } from '../../services/promotion.service';
import { PriceListService } from '../../services/price-list.service';
import { PosLocalPricingService, LocalPriceRequest } from '../../services/pos-local-pricing.service';
import { ContactService, ContactDto } from '@nexcore/crm';
import { PosCashierDto, PosSessionDto } from '../../models/pos-cashier.model';
import { PosStoreDto } from '../../models/pos-store.model';
import { PosTerminalDto } from '../../models/pos-terminal.model';
import { SalesOrderDto, CreateSalesOrderDto } from '../../models/sales-order.model';
import { CouponDto } from '../../models/coupon.model';
import { PaymentMethod } from '../../models/sales-payment.model';
import { PricedOrderDto, PricedLineDto, PriceOrderRequestDto } from '../../models/pricing.model';
import { PosCheckoutResultDto, PosTenderDto, PosTenderType, PosTransactionDto, PosTransactionLineDto } from '../../models/pos-transaction.model';
import { ThermalReceiptDto, PosSettingsDto } from '../../models/pos-settings.model';
import { PosSettingsService } from '../../services/pos-settings.service';

// SalesChannel.PosWalkIn = 8, FulfillmentType.Immediate = 0
const POS_WALK_IN_CHANNEL = 8;
const FULFILLMENT_IMMEDIATE = 0;
import { PosDashboardService } from '../../services/pos-dashboard.service';
import { PosBranchStatusDto } from '../../models/pos-dashboard.model';

export type PosScreen = 'login' | 'terminal' | 'payment' | 'receipt';
export type LoginStep = 'store' | 'pin';
/** How the till behaves w.r.t. connectivity. Per-terminal local setting. */
export type PosOperatingMode = 'Online' | 'OfflineFallback' | 'LocalFirst';

export interface CartItem {
  inventoryItemId: string;
  itemName: string;
  sku: string | null;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
}

/** An in-progress (held) sale kept on the terminal until it is paid or voided. */
export interface OpenSale {
  id: string;
  ref: number;
  items: CartItem[];
  customerName: string;
  contactId: string;
  note: string;
  total: number;
  createdAt: Date;
}

@Component({
  selector: 'lib-pos-terminal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pos-terminal.html',
  styleUrl: './pos-terminal.css',
})
export class PosTerminalComponent implements OnInit, OnDestroy {
  // ── Screen state ─────────────────────────────────────────────────────────────
  screen: PosScreen = 'login';
  loginStep: LoginStep = 'store';

  /** Connectivity flag for the offline-capable POS (drives the topbar indicator). */
  isOnline = navigator.onLine;
  /** Offline sales still waiting to sync (drives the topbar badge). */
  unsyncedCount = 0;
  /** True while a manual Sync runs; syncStatus shows the current phase (download / upload). */
  syncing = false;
  syncStatus = '';
  /** Set when the server catalog changed since our snapshot (local-first inventory watch). */
  inventoryStale = false;
  /** True while the offline data download runs. */
  offlineSyncing = false;
  offlineSyncSteps: { label: string; done: boolean }[] = [];
  lastSyncAt: Date | null = null;
  get offlineSyncPercent(): number {
    if (!this.offlineSyncSteps.length) return 0;
    return Math.round((this.offlineSyncSteps.filter(s => s.done).length / this.offlineSyncSteps.length) * 100);
  }
  private onlineSub?: Subscription;
  private unsyncedSub?: Subscription;
  private sessionExpiredSub?: Subscription;
  private lastKnownSignature = '';
  private invPollTimer?: ReturnType<typeof setInterval>;
  /** Proactively refreshes the access token before it lapses so the till never shows the re-auth prompt while online. */
  private tokenKeepAliveTimer?: ReturnType<typeof setInterval>;
  /** Active promotions cached for on-device pricing while offline (runtime numeric enum fields). */
  private cachedPromotions: any[] = [];
  error = '';
  toast = '';
  toastTimer: any;

  // ── Store & terminal selection ────────────────────────────────────────────────
  stores: PosStoreDto[] = [];
  storesLoading = false;
  selectedStore: PosStoreDto | null = null;
  terminals: PosTerminalDto[] = [];
  terminalsLoading = false;
  selectedTerminalId = '';
  branchStatuses: PosBranchStatusDto[] = [];
  private preSelectedStoreId: string | null = null;

  // ── Login ─────────────────────────────────────────────────────────────────────
  pinInput = '';
  loggedCashier: PosCashierDto | null = null;
  activeSession: PosSessionDto | null = null;
  openingCash = 0;
  openingNotes = '';
  loginLoading = false;
  showOpenSessionForm = false;
  loggedUser: any = null;

  // ── Inline re-auth (session expired while on POS) ─────────────────────────────
  showReauthOverlay = false;
  reauthEmail = '';
  reauthPassword = '';
  reauthError = '';
  reauthLoading = false;

  // ── Cart ──────────────────────────────────────────────────────────────────────
  cart: CartItem[] = [];
  selectedCartIndex = -1;
  searchQuery = '';

  // ── Inventory items ───────────────────────────────────────────────────────────
  menuItems: ItemDto[] = [];
  menuLoading = false;

  // ── Product picker grid (Odoo-style popup) ──────────────────────────────────────
  showProductGrid = false;
  categories: ItemCategoryDto[] = [];
  selectedCategoryId = '';
  gridSearch = '';
  // Product-grid pagination (client-side over the loaded catalog).
  gridPage = 1;
  gridPageSize = 24;
  gridPageSizeOptions = [12, 24, 48, 96];

  // ── Customer ──────────────────────────────────────────────────────────────────
  customerName = '';
  contactId = '';
  orderNotes = '';
  contacts: ContactDto[] = [];
  contactsLoading = false;
  customerSearch = '';

  // ── Coupon ────────────────────────────────────────────────────────────────────
  couponCode = '';
  appliedCoupon: CouponDto | null = null;

  // ── Numpad ────────────────────────────────────────────────────────────────────
  numpadMode: 'qty' | 'price' | 'discount' = 'qty';
  numpadBuffer = '';

  // ── Change-quantity popup ───────────────────────────────────────────────────────
  showQtyPad = false;
  qtyBuffer = '';
  /** True while the buffer holds a pre-filled value — first digit typed replaces it instead of appending. */
  qtyPrefilled = false;
  /** A quantity entered on the pad with no line selected — applied to the next item added. */
  pendingQty: number | null = null;

  // ── Payment ───────────────────────────────────────────────────────────────────
  paymentMethod: PaymentMethod = 'Cash';
  paymentReference = '';
  amountTendered = 0;
  get paymentMethods(): { key: PaymentMethod; label: string }[] {
    const methods: { key: PaymentMethod; label: string }[] = [];
    if (this.posConfig?.acceptCash            ?? true)  methods.push({ key: 'Cash',            label: 'Cash' });
    if (this.posConfig?.acceptCard            ?? true)  methods.push({ key: 'Card',            label: 'Card' });
    if (this.posConfig?.acceptCard            ?? true)  methods.push({ key: 'Cheque',          label: 'Check' });
    if (this.posConfig?.acceptMobilePayment   ?? false) methods.push({ key: 'Wallet',          label: 'Mobile' });
    if (this.posConfig?.acceptCreditOnAccount ?? false) methods.push({ key: 'CreditOnAccount', label: 'Credit' });
    return methods.length ? methods : [{ key: 'Cash', label: 'Cash' }];
  }
  // ── Split payment ─────────────────────────────────────────────────────────────
  tenderLines: PosTenderDto[] = [];
  splitAmount = 0;
  splitMode = false;
  showSplitDialog = false;
  tenderBuffer = '';
  processingPayment = false;
  allowCredit = false;
  receiptOrder: SalesOrderDto | null = null;
  receiptPaymentMethod: PaymentMethod = 'Cash';
  checkoutResult: PosCheckoutResultDto | null = null;
  thermalReceipt: ThermalReceiptDto | null = null;

  // ── POS mode (register vs online orders) ──────────────────────────────────────
  posMode: 'register' | 'online-orders' = 'register';
  onlineOrders: SalesOrderDto[] = [];
  onlineOrdersLoading = false;
  private pollTimer: any;
  private knownOrderIds = new Set<string>();
  private firstPoll = true;
  rejectingOrderId: string | null = null;
  rejectNote = '';
  contactInfoOrder: SalesOrderDto | null = null;

  // ── Pending checkout order ────────────────────────────────────────────────────
  // The SalesOrder API has no endpoint to edit an existing order's lines (only
  // create / delete), so a live auto-saved draft that updates as the cart changes
  // isn't possible. Instead the order is created once at checkout and kept here so
  // a retry after a failed checkout reuses the same order (no duplicates). Any cart
  // edit invalidates it (the stale order is deleted, a fresh one is built next pay).
  pendingOrder: SalesOrderDto | null = null;

  // ── Server-authoritative pricing (live quote) ─────────────────────────────────
  quote: PricedOrderDto | null = null;
  quoteLoading = false;
  quoteWarnings: string[] = [];
  private quoteTimer: any;
  private quoteSeq = 0;
  /** Signature of the cart the current quote was priced for (so it isn't reused for a changed cart). */
  private quoteSig = '';

  // ── Cash drawer ───────────────────────────────────────────────────────────────
  showCashDrawer = false;
  cashMoveAmount = 0;
  cashMoveType: 'CashIn' | 'CashOut' = 'CashIn';
  cashMoveReason = '';

  // ── PWA install prompt ────────────────────────────────────────────────────────
  // index.html captures beforeinstallprompt early (before Angular boots) into
  // window.__deferredInstallPrompt. We read it on init and subscribe to the
  // custom events dispatched from that same handler.
  pwaInstallPrompt: any = null;
  private readonly onPwaInstallable = () => {
    this.pwaInstallPrompt = (window as any).__deferredInstallPrompt ?? null;
    this.cdr.detectChanges();
  };
  private readonly onAppInstalled = () => {
    this.pwaInstallPrompt = null;
    (window as any).__deferredInstallPrompt = null;
    this.cdr.detectChanges();
  };

  // ── Modals ────────────────────────────────────────────────────────────────────
  showSearch = false;
  searchHighlightIndex = -1;
  showCustomerPanel = false;
  showDiscountPanel = false;
  showCommentPanel = false;
  discountAmount = 0;
  commentText = '';

  // ── Discount dialog ─────────────────────────────────────────────────────────────
  discountTab: 'cart' | 'item' = 'cart';
  cartDiscountType: 'Percentage' | 'Fixed' = 'Percentage';
  cartDiscountValue = 0;
  itemDiscountType: 'Percentage' | 'Fixed' = 'Percentage';
  discItemIndex = 0;
  private discSnapshot: { cartType: 'Percentage' | 'Fixed'; cartValue: number; itemDisc: number[] } | null = null;

  // ── Open (held) sales ──────────────────────────────────────────────────────────
  // Every in-progress cart is auto-tracked here so it shows under "Open sales"
  // until it is paid (removed on checkout) or voided. Multiple can be open at once.
  openSales: OpenSale[] = [];
  activeSaleId: string | null = null;
  private openSaleSeq = 0;
  showOpenSalesModal = false;

  // ── Side menu ─────────────────────────────────────────────────────────────────
  showSideMenu = false;
  readonly today = new Date();
  readonly Math = Math;

  // ── Custom confirm dialog ──────────────────────────────────────────────────────
  showConfirmDialog = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmOkLabel = 'Confirm';
  confirmDanger = false;
  private confirmCallback: (() => void) | null = null;

  openConfirm(title: string, message: string, okLabel: string, danger: boolean, onConfirm: () => void) {
    this.confirmTitle    = title;
    this.confirmMessage  = message;
    this.confirmOkLabel  = okLabel;
    this.confirmDanger   = danger;
    this.confirmCallback = onConfirm;
    this.showConfirmDialog = true;
  }
  confirmOk() {
    this.showConfirmDialog = false;
    if (this.confirmCallback) { this.confirmCallback(); this.confirmCallback = null; }
  }
  confirmCancel() {
    this.showConfirmDialog = false;
    this.confirmCallback = null;
  }

  // ── Printer / receipt settings (per-terminal, persisted locally) ────────────────
  private readonly SETTINGS_KEY = 'pos-terminal-settings';
  showSettingsPanel = false;
  posSettings: { paperSize: '80mm' | '58mm'; autoPrint: boolean; skipReceiptScreen: boolean } = {
    paperSize: '80mm',
    autoPrint: false,
    skipReceiptScreen: false,
  };

  /** Effective POS operating mode — driven by the admin POS Settings; falls back to Online. */
  get cfgPosMode(): PosOperatingMode {
    return (this.posConfig?.operatingMode as PosOperatingMode) ?? 'Online';
  }

  // ── Backend-driven POS configuration ──────────────────────────────────────────
  posConfig: PosSettingsDto | null = null;

  // ── Session sales / X-report ──────────────────────────────────────────────────
  showSessionReport = false;
  sessionReportLoading = false;
  sessionTransactions: PosTransactionDto[] = [];

  // ── End session panel ─────────────────────────────────────────────────────────
  showEndSessionPanel = false;
  closingCashAmount = 0;

  get sessionExpectedCash(): number {
    return (this.activeSession?.openingFloat ?? 0) + (this.activeSession?.cashCollected ?? 0);
  }
  get sessionCashVariance(): number { return this.closingCashAmount - this.sessionExpectedCash; }

  // ── Sales history ──────────────────────────────────────────────────────────────
  showSalesHistory = false;
  salesHistoryLoading = false;
  salesDocuments: PosTransactionDto[] = [];
  selectedDocument: PosTransactionDto | null = null;
  documentLoading = false;
  docSearch = '';
  /** Date range for cross-session / cross-day history (yyyy-MM-dd, local). */
  historyFrom = '';
  historyTo = '';
  /** false = only the signed-in cashier's transactions; true = everyone in the branch. */
  showAllUsers = false;

  constructor(
    private cashierService: PosCashierService,
    private storeService: PosStoreService,
    private terminalService: PosTerminalService,
    private orderService: SalesOrderService,
    private paymentService: SalesPaymentService,
    private invoiceService: SalesInvoiceService,
    private couponService: CouponService,
    private pricingService: PricingService,
    private posTransactionService: PosTransactionService,
    private posSettingsService: PosSettingsService,
    private authService: AuthService,
    private itemService: ItemService,
    private reportService: InventoryReportService,
    private bomService: BomService,
    private productionOrderService: ProductionOrderService,
    private categoryService: ItemCategoryService,
    private contactService: ContactService,
    private dashboardService: PosDashboardService,
    private offline: OfflineService,
    private dataCache: PosDataCache,
    private posSync: PosSyncService,
    private promotionService: PromotionService,
    private priceListService: PriceListService,
    private localPricing: PosLocalPricingService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadSettings();
    // Restore posConfig from cache immediately so cfgPosMode is correct on the store selection banner
    // before the async server load completes.
    this.dataCache.get<any>('posConfig').then(v => { if (v) { this.posConfig = v; this.cdr.detectChanges(); } });
    this.loadPosConfig();
    this.loggedUser = this.authService.getUser();
    this.screen = 'login';
    this.preSelectedStoreId = this.route.snapshot.queryParamMap.get('storeId');
    this.loginStep = this.preSelectedStoreId ? 'pin' : 'store';
    this.loadStores();
    this.loadInventoryItems();
    this.loadContacts();
    this.loadCategories();
    this.onlineSub = this.offline.online$.subscribe(v => {
      this.isOnline = v;
      // Connection dropped while a re-auth prompt was up — clear it so the till isn't stuck behind
      // a login window it can't complete offline.
      if (!v && this.showReauthOverlay) this.showReauthOverlay = false;
      if (v && this.cart.length > 0) this.requestQuote();   // re-fetch authoritative pricing on reconnect
      // Auto-upload queued offline sales as soon as connection is restored.
      if (v && this.activeSession && this.cfgPosMode !== 'Online') void this.posSync.drain();
      this.cdr.detectChanges();
    });
    this.unsyncedSub = this.posSync.pendingCount$.subscribe(n => { this.unsyncedCount = n; this.cdr.detectChanges(); });
    this.sessionExpiredSub = this.authService.sessionExpired$.subscribe(() => {
      // An offline till must NEVER demand a sign-in. The cashier authenticated via cached PIN and
      // the till runs entirely from cache + outbox, so an expired JWT must not block work — even
      // for weeks with no internet. The prompt is a last resort, shown only when we are genuinely
      // online AND the silent refresh (incl. the refresh token) has failed. On reconnect the sync's
      // 401 re-fires this to re-auth and drain.
      if (!this.offline.isOnline) return;
      if (this.showReauthOverlay) return;
      // The heartbeat can lag a real network drop by up to ~25s, so re-confirm reachability before
      // interrupting the cashier — otherwise a momentary connection loss flashes a sign-in prompt.
      void this.offline.refresh().then((online) => {
        if (!online || this.showReauthOverlay) return;
        this.reauthEmail = this.loggedUser?.email ?? '';
        this.reauthPassword = '';
        this.reauthError = '';
        this.showReauthOverlay = true;
        this.cdr.detectChanges();
      });
    });
    this.dataCache.get<any[]>('promotions').then(v => { if (v) this.cachedPromotions = v; });
    this.dataCache.get<string>('snapshotAt').then(v => { if (v) this.lastSyncAt = new Date(v); });
    // Pick up install prompt if it already fired before Angular booted.
    this.pwaInstallPrompt = (window as any).__deferredInstallPrompt ?? null;
    window.addEventListener('pwa-installable', this.onPwaInstallable);
    window.addEventListener('pwa-installed', this.onAppInstalled);

    // Keep the session alive proactively: while online, refresh the access token a little
    // before it expires so a cashier mid-sale never gets bounced to the re-auth prompt.
    void this.keepSessionFresh();
    this.tokenKeepAliveTimer = setInterval(() => void this.keepSessionFresh(), 60_000);
  }

  /** Refresh the access token ahead of expiry while online; silent no-op otherwise. */
  private async keepSessionFresh(): Promise<void> {
    if (!this.offline.isOnline) return;          // offline: token lapse is expected and harmless
    if (!this.authService.getToken()) return;    // not signed in yet (e.g. at the store/PIN screen)
    await this.authService.ensureFreshToken(150); // refresh when within ~2.5 min of expiry
  }

  goToDashboard() {
    this.router.navigate(['/sales/pos-dashboard']);
  }

  goToStores() {
    this.router.navigate(['/sales/pos-stores']);
  }

  ngOnDestroy() {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    if (this.quoteTimer) clearTimeout(this.quoteTimer);
    this.stopOrderPolling();
    this.onlineSub?.unsubscribe();
    this.unsyncedSub?.unsubscribe();
    this.sessionExpiredSub?.unsubscribe();
    if (this.invPollTimer) clearInterval(this.invPollTimer);
    if (this.tokenKeepAliveTimer) clearInterval(this.tokenKeepAliveTimer);
    window.removeEventListener('pwa-installable', this.onPwaInstallable);
    window.removeEventListener('pwa-installed', this.onAppInstalled);
  }

  installPwa() {
    if (!this.pwaInstallPrompt) return;
    this.pwaInstallPrompt.prompt();
    this.pwaInstallPrompt.userChoice.then(() => {
      this.pwaInstallPrompt = null;
      this.showSideMenu = false;
      this.cdr.detectChanges();
    });
  }

  /** Called from the store selection screen — downloads all POS data before a session is opened. */
  syncForOffline() {
    if (this.offlineSyncing || !this.isOnline) return;
    void this.snapshotForSessionWithProgress();
  }

  reauthenticate() {
    if (!this.reauthEmail || !this.reauthPassword || this.reauthLoading) return;
    this.reauthLoading = true;
    this.reauthError = '';
    this.authService.login({ username: this.reauthEmail, password: this.reauthPassword }, true).subscribe({
      next: (res) => {
        this.reauthLoading = false;
        if (res?.success) {
          this.loggedUser = this.authService.getUser();
          this.showReauthOverlay = false;
          this.reauthPassword = '';
          // Reload data that failed with 401 before re-auth.
          this.loadStores();
          this.loadPosConfig();
          if (this.screen === 'terminal') {
            this.loadInventoryItems();
            this.loadContacts();
            this.loadCategories();
          }
        } else {
          this.reauthError = res?.message ?? 'Invalid credentials.';
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.reauthLoading = false;
        this.reauthError = 'Invalid email or password.';
        this.cdr.detectChanges();
      },
    });
  }

  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    // Split-payment dialog takes priority while open.
    if (this.showSplitDialog) {
      if (e.key === 'Escape') { e.preventDefault(); this.closeSplitDialog(); }
      else if (e.key === 'Enter') { e.preventDefault(); this.confirmSplit(); }
      return;
    }
    // Change-quantity pad takes priority while open.
    if (this.showQtyPad) {
      if (e.key === 'Escape') { e.preventDefault(); this.closeQtyPad(); }
      else if (e.key === 'Enter') { e.preventDefault(); this.applyQty(); }
      else if (e.key === 'Backspace') { e.preventDefault(); this.qtyKey('back'); }
      else if (e.key >= '0' && e.key <= '9') { e.preventDefault(); this.qtyKey(e.key); }
      else if (e.key === '.' || e.key === '-') { e.preventDefault(); this.qtyKey(e.key); }
      return;
    }
    // Product picker grid takes priority while open.
    if (this.showProductGrid) {
      if (e.key === 'Escape') { e.preventDefault(); this.closeProductGrid(); }
      return;
    }
    // A small modal panel (discount/comment/customer/cash) is open on any screen.
    if (this.showCustomerPanel || this.showDiscountPanel || this.showCommentPanel || this.showCashDrawer) {
      if (e.key === 'Escape') { e.preventDefault(); this.closeAllPanels(); }
      return;
    }
    if (this.screen === 'login') { this.onLoginKey(e); return; }
    if (this.screen === 'receipt') {
      if (e.key === 'Enter')  { e.preventDefault(); this.printAndNewSale(); }
      if (e.key === 'Escape') { e.preventDefault(); this.newSale(); }
      return;
    }
    if (this.screen === 'payment') {
      if (e.key === 'Enter') { e.preventDefault(); this.onPayEnter(); }
      else if (e.key === 'Escape') { e.preventDefault(); this.screen = 'terminal'; this.cdr.detectChanges(); }
      return;
    }
    if (this.screen !== 'terminal') return;
    switch (e.key) {
      case 'F1': e.preventDefault(); this.lockPOS(); break;
      case 'F2': e.preventDefault(); this.openDiscountDialog(); break;
      case 'F3': e.preventDefault(); this.showSearch = true; this.focusEl('posSearchInput'); break;
      case 'F4': e.preventDefault(); this.openQtyPad(); break;
      case 'F6': e.preventDefault(); this.openProductGrid(); break;
      case 'F8': e.preventDefault(); this.newSale(); break;
      case 'F9': e.preventDefault(); this.saveSale(); break;
      case 'F10': e.preventDefault(); this.goToPayment(); break;
      case 'F11': e.preventDefault(); this.endSession(); break;
      case 'Delete': e.preventDefault(); this.deleteSelectedItem(); break;
      case 'Escape': e.preventDefault(); this.closeAllPanels(); break;
    }
  }

  /** Keyboard support on the login screen: type PIN digits, Enter to submit. */
  private onLoginKey(e: KeyboardEvent) {
    if (this.loginStep !== 'pin') return;
    if (this.showOpenSessionForm) {
      if (e.key === 'Enter') { e.preventDefault(); this.doCheckIn(); }
      return;
    }
    if (e.key >= '0' && e.key <= '9') { e.preventDefault(); this.appendPin(e.key); }
    else if (e.key === 'Backspace') { e.preventDefault(); this.backspacePin(); }
    else if (e.key === 'Enter') { e.preventDefault(); this.login(); }
  }

  /** Focus a DOM element by id once Angular has rendered it. */
  private focusEl(id: string, delay = 80) {
    setTimeout(() => { try { (document.getElementById(id) as HTMLElement | null)?.focus(); } catch { /* element not present */ } }, delay);
  }

  /** Return focus to the search bar whenever a popup closes on the terminal screen. */
  private focusSearch() {
    if (this.screen === 'terminal') this.focusEl('posSearchInput');
  }

  // ── Toast ─────────────────────────────────────────────────────────────────────
  showToast(msg: string) {
    this.toast = msg;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.toast = ''; this.cdr.detectChanges(); }, 2500);
    this.cdr.detectChanges();
  }

  // ── Store & terminal loading ───────────────────────────────────────────────────
  loadStores() {
    this.storesLoading = true;
    this.storeService.getAll().subscribe({
      next: (res) => {
        this.stores = res.data ?? [];
        this.dataCache.set('posStores', this.stores);   // for offline store selection
        this.storesLoading = false;
        if (this.preSelectedStoreId) {
          const store = this.stores.find(s => s.id === this.preSelectedStoreId);
          if (store) this.selectStore(store);
        }
        this.cdr.detectChanges();
        if (this.stores.length) {
          this.dashboardService.getBulkBranchStatus({ branchIds: this.stores.map(s => s.id) }).subscribe({
            next: (bulk) => { this.branchStatuses = bulk.data ?? []; this.cdr.detectChanges(); },
            error: () => {},
          });
        }
      },
      error: () => {
        // Offline: fall back to the cached store list so the till can still open.
        this.dataCache.get<PosStoreDto[]>('posStores').then((v) => {
          if (v?.length) {
            this.stores = v;
            if (this.preSelectedStoreId) {
              const store = this.stores.find(s => s.id === this.preSelectedStoreId);
              if (store) this.selectStore(store);
            }
          }
          this.storesLoading = false;
          this.cdr.detectChanges();
        });
      },
    });
  }

  storeStatus(storeId: string): PosBranchStatusDto | null {
    return this.branchStatuses.find(b => b.branchId === storeId) ?? null;
  }

  storeSessionLabel(status: string | number | null | undefined): string {
    const n = typeof status === 'number' ? status : +(status ?? -1);
    if (n === 1) return 'Open';
    if (n === 2) return 'Closed';
    return 'No Session';
  }

  storeSessionClass(status: string | number | null | undefined): string {
    const n = typeof status === 'number' ? status : +(status ?? -1);
    if (n === 1) return 'sc-badge sc-open';
    if (n === 2) return 'sc-badge sc-closed';
    return 'sc-badge sc-none';
  }

  selectStore(store: PosStoreDto) {
    this.selectedStore = store;
    this.selectedTerminalId = '';
    this.terminals = [];
    this.error = '';
    this.loginStep = 'pin';
    this.terminalsLoading = true;
    this.terminalService.getActiveByBranch(store.id).subscribe({
      next: (res) => {
        this.terminals = res.data ?? [];
        if (this.terminals.length >= 1) this.selectedTerminalId = this.terminals[0].id;
        this.terminalsLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        // Offline: use the cached terminals for this store.
        this.dataCache.get<any[]>('posTerminals').then((v) => {
          this.terminals = v ?? [];
          if (this.terminals.length >= 1) this.selectedTerminalId = this.terminals[0].id;
          this.terminalsLoading = false;
          this.cdr.detectChanges();
        });
      },
    });
  }

  backToStoreSelect() {
    this.loginStep = 'store';
    this.pinInput = '';
    this.error = '';
    this.showOpenSessionForm = false;
    this.selectedStore = null;
  }

  // ── PIN login ─────────────────────────────────────────────────────────────────
  appendPin(d: string) {
    if (this.pinInput.length < 4) {
      this.pinInput += d;
      if (this.pinInput.length === 4) this.login();
    }
  }
  backspacePin()       { this.pinInput = this.pinInput.slice(0, -1); }

  login() {
    if (!this.pinInput) { this.error = 'Enter your PIN.'; return; }
    if (!this.selectedStore) { this.error = 'Select a store first.'; return; }
    const enteredPin = this.pinInput;
    this.error = '';
    this.loginLoading = true;

    // Offline: verify the PIN against the device's cached credentials (no server call).
    if (!this.offline.isOnline) { void this.offlineLogin(enteredPin); return; }

    this.cashierService.pinLogin({ pin: this.pinInput, storeId: this.selectedStore.id }).subscribe({
      next: (res) => {
        this.pinInput = '';
        this.loginLoading = false;
        if (!res.data) { this.error = 'Invalid PIN.'; this.cdr.detectChanges(); return; }
        this.loggedCashier = res.data;
        void this.cachePinCredential(res.data, enteredPin);   // enable offline login next time
        this.loadStoreAvailability();
        this.checkExistingSession();
      },
      error: () => {
        this.pinInput = '';
        this.loginLoading = false;
        this.error = 'Invalid PIN or access denied.';
        this.cdr.detectChanges();
      },
    });
  }

  /** Verify a PIN offline against cached credentials, then resume the cached session. */
  private async offlineLogin(pin: string): Promise<void> {
    const creds = (await this.dataCache.get<any[]>('pinCreds')) ?? [];
    let match: any = null;
    try {
      const hash = await this.hashPin(pin);
      match = creds.find((c) => c.pinHash === hash) ?? null;
    } catch { /* Web Crypto unavailable */ }

    this.pinInput = '';
    this.loginLoading = false;
    if (!match) {
      this.error = creds.length
        ? 'PIN not recognized offline. Connect once so this cashier can work offline.'
        : 'No cashier is set up for offline use yet — log in online once first.';
      this.cdr.detectChanges();
      return;
    }

    this.loggedCashier = match.cashier;
    const session = await this.dataCache.get<PosSessionDto>('activeSession');
    if (session) {
      this.resumeSession(session);            // resume the open session (online- or offline-opened)
    } else {
      this.promptOpenSession();               // none cached — open one locally, no connection needed
    }
  }

  /**
   * Try to resume an already-open session before offering the opening-float form.
   * The backend's open-session lookup returns 404 (an HTTP error) when nothing is
   * found, and may scope sessions by terminal, so we try progressively wider
   * strategies and only show the form once all of them come up empty:
   *   1. open session for this cashier on this terminal
   *   2. open session for this cashier on any terminal
   *   3. scan this terminal's sessions for an open one belonging to the cashier
   */
  checkExistingSession() {
    if (!this.loggedCashier) return;
    const cashierId = this.loggedCashier.id;
    this.cashierService.getOpenSession(cashierId, this.selectedTerminalId || undefined).subscribe({
      next: (res) => res.data ? this.resumeSession(res.data) : this.resumeByCashier(cashierId),
      error: () => this.resumeByCashier(cashierId),
    });
  }

  private resumeByCashier(cashierId: string) {
    this.cashierService.getOpenSession(cashierId).subscribe({
      next: (res) => res.data ? this.resumeSession(res.data) : this.resumeFromTerminal(cashierId),
      error: () => this.resumeFromTerminal(cashierId),
    });
  }

  private resumeFromTerminal(cashierId: string) {
    if (!this.selectedTerminalId) { this.promptOpenSession(); return; }
    this.cashierService.getSessionsByTerminal(this.selectedTerminalId).subscribe({
      next: (res) => {
        // status 0 = Open
        const open = (res.data ?? []).find(s => s.posCashierId === cashierId && s.status === 0);
        if (open) this.resumeSession(open); else this.promptOpenSession();
      },
      error: () => this.promptOpenSession(),
    });
  }

  private resumeSession(session: PosSessionDto) {
    this.activeSession = session;
    this.dataCache.set('activeSession', session);   // so it can be resumed offline
    this.showOpenSessionForm = false;
    this.enterTerminal();
    this.cdr.detectChanges();
  }

  private promptOpenSession() {
    this.showOpenSessionForm = true;
    this.focusEl('openingCashInput');
    this.cdr.detectChanges();
  }

  /** True when the current session was opened locally (offline) and hasn't been reconciled yet. */
  get sessionIsOffline(): boolean { return !!(this.activeSession as any)?._offline; }

  /**
   * Open a session entirely on-device (no server). Used when the till is opened with a PIN
   * but there's no connection — the session + its sales are reconciled on sync. The synthetic
   * session is tagged `_offline` and carries an `OFFSESS-…` number used as the sync idempotency key.
   */
  private openLocalSession() {
    const now = new Date().toISOString();
    const dev = this.offline.deviceId.replace(/-/g, '').slice(0, 6).toUpperCase();
    const session = {
      id: (crypto?.randomUUID?.() ?? `local-${Date.now()}`),
      sessionNumber: `OFFSESS-${dev}-${Date.now().toString(36).toUpperCase()}`,
      posTerminalId: this.selectedTerminalId,
      posCashierId: this.loggedCashier?.id ?? '',
      status: 1,                                    // Open
      openedAt: now,
      closedAt: null,
      openingFloat: Number(this.openingCash) || 0,
      openingNotes: this.openingNotes || null,
      openingDenominations: null,
      closingFloat: 0, expectedClosingFloat: 0, floatVariance: 0, closingDenominations: null,
      totalSalesAmount: 0, totalRefundsAmount: 0, totalDiscountsAmount: 0, totalTaxAmount: 0,
      netSalesAmount: 0, cashCollected: 0, cardCollected: 0, walletCollected: 0, otherCollected: 0,
      transactionCount: 0, closingNotes: null,
      _offline: true,
    } as unknown as PosSessionDto;
    this.activeSession = session;
    this.dataCache.set('activeSession', session);
    this.showOpenSessionForm = false;
    this.error = '';
    this.enterTerminal();
    this.cdr.detectChanges();
    this.showToast('Offline session opened — sales will sync when reconnected.');
  }

  doCheckIn() {
    if (!this.loggedCashier) return;
    if (!this.selectedTerminalId) { this.error = 'No terminal assigned to this store. Contact admin.'; return; }
    if (this.cfgRequireOpeningFloat && !(Number(this.openingCash) > 0)) {
      this.error = 'Opening float is required to open a session.';
      this.cdr.detectChanges();
      return;
    }
    this.error = '';
    // No connection: open the session locally instead of calling the server.
    if (!this.offline.isOnline) { this.openLocalSession(); return; }
    this.cashierService.checkIn({
      cashierId: this.loggedCashier.id,
      terminalId: this.selectedTerminalId,
      openingFloat: Number(this.openingCash) || 0,
      openingNotes: this.openingNotes || null,
    }).subscribe({
      next: (res) => {
        this.activeSession = res.data ?? null;
        if (res.data) this.dataCache.set('activeSession', res.data);   // resumable offline
        this.showOpenSessionForm = false;
        this.enterTerminal();
      },
      error: (err) => {
        const body = err?.error;
        const msg: string = body?.message ?? body?.errors?.[0] ?? (typeof body === 'string' ? body : '') ?? err?.message ?? '';
        // A conflict (409) or any "session already open" wording means the cashier
        // is already checked in — resolve and resume rather than erroring out.
        if (err?.status === 409 || /open session|already (has|checked|opened)/i.test(msg)) {
          this.showOpenSessionForm = false;
          this.checkExistingSession();
          return;
        }
        // Surface the real backend reason instead of a generic message.
        this.error = msg || `Failed to open session${err?.status ? ' (' + err.status + ')' : ''}.`;
        this.cdr.detectChanges();
      },
    });
  }

  enterTerminal() {
    this.screen = 'terminal';
    this.showOpenSessionForm = false;
    if (!this.contactId) this.selectWalkIn();
    this.cdr.detectChanges();
    this.focusEl('posSearchInput');
    this.startOrderPolling();
    this.maybeSnapshotOnSession();
    this.loadProducibleItems();
  }

  // ── Make-to-order (BOM-backed) items ────────────────────────────────────────────
  /**
   * IDs of finished products that have an active Bill of Materials. These are "produced" on sale
   * (e.g. a Zinger burger cooked to order) rather than sold from finished-goods stock, so the
   * zero-stock warning is suppressed for them and a production order is fired after checkout.
   * One BOM list call at till entry → O(1) lookup per item (no per-item N+1).
   */
  private producibleItemIds = new Set<string>();

  private loadProducibleItems() {
    this.bomService.getAll({ pageNumber: 1, pageSize: 500 }).subscribe({
      next: (res) => {
        const set = new Set<string>();
        for (const b of res?.data ?? []) {
          if (b.isActive && b.finishedProductId) set.add(b.finishedProductId);
        }
        this.producibleItemIds = set;
      },
      error: () => { /* non-blocking — falls back to plain finished-goods behaviour */ },
    });
  }

  /** True when the item is made to order from a BOM (cooked/assembled on sale). */
  isProducible(itemId: string): boolean {
    return this.producibleItemIds.has(itemId);
  }

  /**
   * After a paid sale, produce each make-to-order cart line: the backend creates a Completed
   * production order, backflushes the BOM components from inventory (raw materials consumed) and
   * receives the finished goods. Fire-and-forget so a production hiccup never blocks the receipt;
   * read the cart now, before newSale() clears it.
   */
  private firePostSaleProduction() {
    const whId = this.selectedStore?.defaultWarehouseId ?? null;
    const lines = this.cart.filter(c => this.isProducible(c.inventoryItemId));
    if (lines.length === 0) return;
    for (const line of lines) {
      this.productionOrderService.produceExpress({
        productId: line.inventoryItemId,
        quantity: line.quantity,
        warehouseId: whId,
      }).subscribe({
        next: () => { this.loadStoreAvailability(); },
        error: (err) => {
          console.error('Express produce failed for', line.itemName, err);
          this.showToast(`Couldn't produce ${line.itemName}: ${this.apiError(err) || 'production failed'}. The sale still went through.`);
        },
      });
    }
    const names = lines.map(l => `${l.quantity}× ${l.itemName}`).join(', ');
    this.showToast(`Sent to production: ${names}`);
  }

  // ── Cart ──────────────────────────────────────────────────────────────────────
  // ── Store-warehouse stock (for the out-of-stock warning when ringing an item) ───
  /** available qty per itemId, restricted to the POS store's default warehouse. */
  private availabilityByItem: Record<string, number> = {};
  /** True once we have warehouse-scoped availability — only then do we warn. */
  private availabilityChecked = false;

  /**
   * Load per-item available stock for the store's default warehouse so ringing an item with no
   * stock there can warn the cashier. Only meaningful when the store has a default warehouse set;
   * otherwise we can't tell which warehouse the till draws from, so we don't warn.
   */
  private loadStoreAvailability() {
    const whId = this.selectedStore?.defaultWarehouseId;
    if (!whId) { this.availabilityChecked = false; this.availabilityByItem = {}; return; }
    this.reportService.getStockByItem(whId).subscribe({
      next: (res) => {
        const map: Record<string, number> = {};
        for (const t of res.data ?? []) map[t.itemId] = t.quantityAvailable ?? 0;
        this.availabilityByItem = map;
        this.availabilityChecked = true;
        this.cdr.detectChanges();
      },
      error: () => { /* non-blocking — selling still works without the warning */ },
    });
  }

  addItem(item: ItemDto | any) {
    // A quantity typed on the qty-pad before scanning applies to this add, then resets.
    const qty = this.pendingQty && this.pendingQty > 0 ? this.pendingQty : 1;
    this.pendingQty = null;
    const id: string = (item as ItemDto).id ?? item.inventoryItemId;

    // Warn (don't block) when the item has no stock in this store's warehouse — usually means the
    // POS store points at the wrong warehouse. Selling still proceeds (negative stock is allowed
    // unless the store enforces it at checkout). Skipped for make-to-order (BOM-backed) items:
    // their finished-goods stock is expectedly 0 — they're produced on sale, not stocked.
    if (this.availabilityChecked && (this.availabilityByItem[id] ?? 0) <= 0 && !this.isProducible(id)) {
      const name = (item as ItemDto).name ?? item.itemName ?? 'This item';
      this.showToast(`${name} shows 0 stock in this store's warehouse. If that's wrong, set the store's Default Warehouse in POS Stores settings.`);
    }

    const existing = this.cart.find((c) => c.inventoryItemId === id);
    if (existing) {
      existing.quantity += qty;
      this.selectedCartIndex = this.cart.indexOf(existing);
    } else {
      const priceEntry = (item as ItemDto).prices?.find(p => p.isActive) ?? (item as ItemDto).prices?.[0];
      const unitPrice = priceEntry?.salePrice ?? item.price ?? item.unitPrice ?? 0;
      const taxEntry = (item as ItemDto).taxes?.find(t => t.isActive) ?? (item as ItemDto).taxes?.[0];
      const taxRate = taxEntry?.effectiveRate ?? item.taxRate ?? 0;
      this.cart.push({
        inventoryItemId: id,
        itemName: (item as ItemDto).name ?? item.itemName ?? 'Item',
        sku: (item as ItemDto).code ?? item.sku ?? null,
        quantity: qty,
        unitPrice,
        discount: 0,
        taxRate,
      });
      this.selectedCartIndex = this.cart.length - 1;
    }
    this.scheduleQuote();
    this.discardPendingOrder();
    this.syncOpenSale();
    this.cdr.detectChanges();
  }

  selectRow(i: number) { this.selectedCartIndex = i; this.numpadBuffer = ''; }
  get selectedItem(): CartItem | null { return this.cart[this.selectedCartIndex] ?? null; }

  // ── Change-quantity popup ───────────────────────────────────────────────────────
  openQtyPad() {
    const it = this.selectedItem;
    this.qtyBuffer = it ? String(it.quantity) : '';
    this.qtyPrefilled = !!this.qtyBuffer;
    this.showQtyPad = true;
    this.cdr.detectChanges();
  }

  closeQtyPad() {
    this.showQtyPad = false;
    this.qtyBuffer = '';
    this.qtyPrefilled = false;
    this.cdr.detectChanges();
    this.focusSearch();
  }

  qtyKey(k: string) {
    switch (k) {
      case 'esc': this.closeQtyPad(); return;
      case 'enter': this.applyQty(); return;
      case 'back':
        if (this.qtyPrefilled) { this.qtyBuffer = ''; this.qtyPrefilled = false; }
        else { this.qtyBuffer = this.qtyBuffer.slice(0, -1); }
        break;
      case '-': this.qtyBuffer = this.qtyBuffer.startsWith('-') ? this.qtyBuffer.slice(1) : '-' + this.qtyBuffer; this.qtyPrefilled = false; break;
      case '.': if (!this.qtyBuffer.includes('.')) this.qtyBuffer = (this.qtyBuffer || '0') + '.'; this.qtyPrefilled = false; break;
      default:
        if (this.qtyPrefilled) { this.qtyBuffer = k; this.qtyPrefilled = false; }
        else { this.qtyBuffer += k; }
    }
    this.cdr.detectChanges();
  }

  /** Apply the typed quantity to the selected line, or remember it for the next item. */
  applyQty() {
    const val = parseFloat(this.qtyBuffer);
    const it = this.selectedItem;
    if (it) {
      if (!isNaN(val) && val > 0) {
        it.quantity = val;
        this.scheduleQuote();
        this.discardPendingOrder();
        this.syncOpenSale();
      } else if (!isNaN(val) && val <= 0) {
        // zero / negative clears the line
        this.cart.splice(this.selectedCartIndex, 1);
        this.selectedCartIndex = Math.min(this.selectedCartIndex, this.cart.length - 1);
        this.scheduleQuote();
        this.discardPendingOrder();
        this.syncOpenSale();
      }
    } else {
      // No line selected — use it as the quantity for the next item added/scanned.
      this.pendingQty = (!isNaN(val) && val > 0) ? val : null;
      if (this.pendingQty) this.showToast(`Next item × ${this.pendingQty}`);
    }
    this.closeQtyPad();
  }

  deleteSelectedItem() {
    if (this.selectedCartIndex < 0 || this.cart.length === 0) return;
    this.cart.splice(this.selectedCartIndex, 1);
    this.selectedCartIndex = Math.min(this.selectedCartIndex, this.cart.length - 1);
    this.scheduleQuote();
    this.discardPendingOrder();
    this.syncOpenSale();
    this.cdr.detectChanges();
  }

  changeQty(i: number, delta: number) {
    const item = this.cart[i];
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      this.cart.splice(i, 1);
      this.selectedCartIndex = Math.min(i, this.cart.length - 1);
    } else {
      item.quantity = newQty;
    }
    this.scheduleQuote();
    this.discardPendingOrder();
    this.syncOpenSale();
    this.cdr.detectChanges();
  }

  get quickAmounts(): number[] {
    const ceil = Math.ceil(this.grandTotal / 10) * 10;
    return [...new Set([this.grandTotal, ceil, ceil + 10, ceil + 50, ceil + 100])]
      .filter(v => v >= this.grandTotal).sort((a, b) => a - b).slice(0, 5);
  }

  numpadPress(key: string) {
    const item = this.selectedItem;
    if (!item) return;
    if (key === '⌫') { this.numpadBuffer = this.numpadBuffer.slice(0, -1); }
    else if (key === '.') { if (!this.numpadBuffer.includes('.')) this.numpadBuffer += '.'; }
    else { this.numpadBuffer += key; }
    const val = parseFloat(this.numpadBuffer) || 0;
    if (this.numpadMode === 'qty')      { item.quantity = Math.max(1, Math.floor(val) || 1); }
    if (this.numpadMode === 'price')    { item.unitPrice = val; }
    if (this.numpadMode === 'discount') { item.discount = Math.min(val, item.unitPrice); }
    this.scheduleQuote();
    this.discardPendingOrder();
    this.syncOpenSale();
    this.cdr.detectChanges();
  }

  // ── Discount dialog (cart-level & item-level) ───────────────────────────────────
  openDiscountDialog() {
    this.discSnapshot = {
      cartType: this.cartDiscountType,
      cartValue: this.cartDiscountValue,
      itemDisc: this.cart.map(c => c.discount || 0),
    };
    this.discItemIndex = this.selectedCartIndex >= 0 ? this.selectedCartIndex : 0;
    this.discountTab = 'cart';
    this.showDiscountPanel = true;
    this.cdr.detectChanges();
  }

  setDiscountTab(t: 'cart' | 'item') { this.discountTab = t; this.cdr.detectChanges(); }
  setCartDiscountType(t: 'Percentage' | 'Fixed') { this.cartDiscountType = t; this.cdr.detectChanges(); }
  setItemDiscountType(t: 'Percentage' | 'Fixed') { this.itemDiscountType = t; this.cdr.detectChanges(); }
  selectDiscountItem(i: number) { this.discItemIndex = i; this.cdr.detectChanges(); }

  get discItem(): CartItem | null { return this.cart[this.discItemIndex] ?? null; }

  /** Item-discount input value, expressed in the chosen unit (% or amount). */
  get itemDiscountValue(): number {
    const it = this.discItem;
    if (!it) return 0;
    if (this.itemDiscountType === 'Percentage') {
      return it.unitPrice > 0 ? Math.round(it.discount / it.unitPrice * 100 * 100) / 100 : 0;
    }
    return it.discount;
  }
  set itemDiscountValue(v: number) {
    const it = this.discItem;
    if (!it) return;
    const maxPct = this.cfgMaxDiscountPercent;
    const val = Math.max(0, Math.min(Number(v) || 0, this.itemDiscountType === 'Percentage' ? maxPct : it.unitPrice * maxPct / 100));
    it.discount = this.itemDiscountType === 'Percentage'
      ? Math.min(it.unitPrice, it.unitPrice * val / 100)
      : Math.min(it.unitPrice, val);
    this.cdr.detectChanges();
  }

  clearDiscounts() {
    this.cartDiscountValue = 0;
    this.cart.forEach(c => c.discount = 0);
    this.cdr.detectChanges();
  }

  cancelDiscount() {
    if (this.discSnapshot) {
      this.cartDiscountType = this.discSnapshot.cartType;
      this.cartDiscountValue = this.discSnapshot.cartValue;
      this.discSnapshot.itemDisc.forEach((d, i) => { if (this.cart[i]) this.cart[i].discount = d; });
    }
    this.showDiscountPanel = false;
    this.cdr.detectChanges();
    this.focusSearch();
  }

  applyDiscount() {
    this.showDiscountPanel = false;
    // Keep the amount-to-collect in step with the new total on the payment screen.
    if (this.screen === 'payment') {
      this.amountTendered = Math.ceil(this.grandTotal);
      this.splitAmount = this.amountTendered;
      this.tenderBuffer = '';
    }
    this.scheduleQuote();
    this.showToast('Discounts applied.');
    this.cdr.detectChanges();
    this.focusSearch();
  }

  /** Open the order-comment panel, pre-filled with the current order note. */
  openCommentPanel() {
    this.commentText = this.orderNotes ?? '';
    this.showCommentPanel = true;
    this.cdr.detectChanges();
  }

  /** Save the comment as the order-level note (sent to the backend as order.notes). */
  applyComment() {
    this.orderNotes = (this.commentText ?? '').trim();
    this.showCommentPanel = false;
    this.commentText = '';
    this.syncOpenSale();
    this.showToast(this.orderNotes ? 'Comment added to order.' : 'Comment cleared.');
    this.cdr.detectChanges();
  }

  // ── Coupon ────────────────────────────────────────────────────────────────────
  // The server (via the quote) is authoritative for whether a coupon applies and
  // for the discount; validate() is just quick UI feedback. The applied discount
  // and any "coupon ignored" warnings come back in the quote.
  validateCoupon() {
    if (!this.cfgEnableCoupons) { this.showToast('Coupons are disabled.'); return; }
    if (!this.couponCode) return;
    this.couponService.validate(this.couponCode, this.contactId || undefined).subscribe({
      next: (res) => {
        this.appliedCoupon = res.data ?? null;
        this.requestQuote();
        this.showToast(this.appliedCoupon ? 'Coupon applied: ' + this.appliedCoupon.code : 'Invalid coupon.');
        this.cdr.detectChanges();
      },
      error: () => { this.showToast('Could not validate coupon.'); },
    });
  }

  removeCoupon() {
    this.appliedCoupon = null;
    this.couponCode = '';
    this.requestQuote();
  }

  // ── Live quote (server-authoritative pricing) ─────────────────────────────────
  // The server recomputes every price, discount, promotion, coupon and tax.
  // We debounce a /pricing/quote call after each cart change and display what it
  // returns. Client-side math is only a fallback before the first quote / offline.
  scheduleQuote() {
    if (this.quoteTimer) clearTimeout(this.quoteTimer);
    if (this.cart.length === 0) {
      this.quote = null;
      this.quoteWarnings = [];
      this.cdr.detectChanges();
      return;
    }
    this.quoteTimer = setTimeout(() => this.requestQuote(), 250);
  }

  /**
   * Discard the order created during a checkout attempt. Called when the cart is
   * edited (the order's lines are now stale and the API can't update them), when
   * starting a new sale, or on lock — so we never check out an outdated order and
   * never leave an unpaid one behind. No-op when nothing is pending.
   */
  private discardPendingOrder() {
    if (!this.pendingOrder) return;
    const id = this.pendingOrder.id;
    this.pendingOrder = null;
    this.orderService.delete(id).subscribe({ error: () => {} });
    this.cdr.detectChanges();
  }

  requestQuote() {
    if (this.cart.length === 0) {
      this.quote = null;
      this.quoteSig = '';
      this.quoteWarnings = [];
      this.cdr.detectChanges();
      return;
    }
    const seq = ++this.quoteSeq;
    const sig = this.cartSig();
    const dto: PriceOrderRequestDto = {
      contactId: this.contactId || null,
      priceListId: this.selectedStore?.defaultPriceListId ?? null,
      posStoreId: this.selectedStore?.id ?? null,
      couponCode: this.couponCode || this.appliedCoupon?.code || null,
      salesChannel: POS_WALK_IN_CHANNEL,
      customerCountryCode: this.selectedStore?.country ?? null,
      lines: this.cart.map((c) => ({
        productId: c.inventoryItemId,
        productCode: c.sku,
        productName: c.itemName,
        quantity: c.quantity,
        unitOfMeasure: null,
        taxCategory: 0,
      })),
    };

    // Offline: keep the last server quote only if it's still for this exact cart — so a basket
    // priced online keeps its authoritative promotions/tax if the link drops at payment. If the
    // cart changed offline we can't re-price it, so drop the quote and use the client estimate.
    if (!this.offline.isOnline) {
      // No live quote — price the cart on-device from cached promotions. Keep a still-valid
      // server quote (priced online) since it's more authoritative (coupon, all promo types).
      if (this.quoteSig !== sig || !this.quote) {
        this.quote = this.localPricing.price(this.buildLocalRequest());
        this.quoteSig = sig;
        this.quoteWarnings = this.quote.warnings ?? [];
      }
      this.quoteLoading = false;
      this.cdr.detectChanges();
      return;
    }

    this.quoteLoading = true;
    this.pricingService.quote(dto).subscribe({
      next: (res) => {
        if (seq !== this.quoteSeq) return; // a newer quote superseded this one
        this.quote = res.data ?? null;
        this.quoteSig = this.quote ? sig : '';
        this.quoteWarnings = this.quote?.warnings ?? [];
        this.quoteLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        if (seq !== this.quoteSeq) return;
        // Request failed (offline / server error) — price the cart on-device instead.
        this.quote = this.localPricing.price(this.buildLocalRequest());
        this.quoteSig = sig;
        this.quoteWarnings = this.quote.warnings ?? [];
        this.quoteLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  /** Signature of the cart inputs that affect the server quote (lines, coupon, customer, store). */
  private cartSig(): string {
    const lines = this.cart.map(c => `${c.inventoryItemId}:${c.quantity}`).join('|');
    const coupon = this.couponCode || this.appliedCoupon?.code || '';
    return `${lines}#${coupon}#${this.contactId || ''}#${this.selectedStore?.id || ''}`;
  }

  /** Build the on-device pricing request from the cart + cached promotions (offline pricing). */
  private buildLocalRequest(): LocalPriceRequest {
    return {
      contactId: this.contactId || null,
      priceListId: this.selectedStore?.defaultPriceListId ?? null,
      promotions: this.cachedPromotions,
      hasCoupon: !!(this.couponCode || this.appliedCoupon?.code),
      lines: this.cart.map(c => ({
        productId: c.inventoryItemId,
        productCode: c.sku,
        productName: c.itemName,
        categoryId: this.menuItems.find(i => i.id === c.inventoryItemId)?.categoryId ?? null,
        quantity: c.quantity,
        listUnitPrice: c.unitPrice,
        taxRate: c.taxRate,
      })),
    };
  }

  private quoteLine(productId: string): PricedLineDto | null {
    return this.quote?.lines?.find((l) => l.productId === productId) ?? null;
  }

  /** Per-line applied promotions from the server quote (shown to the cashier). */
  promotionsFor(item: CartItem) {
    return this.quoteLine(item.inventoryItemId)?.appliedPromotions ?? [];
  }

  /** Whether the server quote applied any promotion to this line. */
  hasPromotion(item: CartItem): boolean {
    return this.promotionsFor(item).length > 0;
  }

  /** Total promotion discount for a line (sum of its applied promotions). */
  promotionDiscountFor(item: CartItem): number {
    return this.promotionsFor(item).reduce((s, p) => s + (p.discountAmount || 0), 0);
  }

  /** Total promotion discount across the whole cart (from the quote). */
  get promotionTotal(): number {
    return this.cart.reduce((s, i) => s + this.promotionDiscountFor(i), 0);
  }

  /** Server-side line/promotion discount from the quote (authoritative). */
  get serverLineDiscount(): number {
    return this.quote?.lineDiscountAmount ?? 0;
  }

  /** Server-resolved net line amount when available, else client estimate. */
  lineAmount(item: CartItem): number {
    const ql = this.quoteLine(item.inventoryItemId);
    if (ql) return ql.lineAmount;
    return (item.unitPrice - item.discount) * item.quantity;
  }

  /** Server-resolved unit price when available, else the catalog price. */
  lineUnitPrice(item: CartItem): number {
    return this.quoteLine(item.inventoryItemId)?.listUnitPrice ?? item.unitPrice;
  }

  // ── Totals ────────────────────────────────────────────────────────────────────
  // Prefer the server quote; fall back to client estimate before it arrives.
  get subtotal(): number {
    return this.quote ? this.quote.grossAmount : this.cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  }

  get couponDiscount(): number {
    if (this.quote) return this.quote.couponDiscountAmount;
    if (!this.appliedCoupon) return 0;
    const net = this.subtotal - this.clientLineDiscount;
    return this.appliedCoupon.discountType === 'Percentage'
      ? net * this.appliedCoupon.discountValue / 100
      : Math.min(this.appliedCoupon.discountValue, net);
  }

  private get clientLineDiscount(): number { return this.cart.reduce((s, i) => s + i.discount * i.quantity, 0); }

  get lineDiscountTotal(): number {
    return this.quote ? this.quote.discountAmount : this.clientLineDiscount;
  }

  get totalDiscount(): number {
    return this.quote ? this.quote.discountAmount : this.clientLineDiscount + this.couponDiscount;
  }

  // ── Manual discounts (entered in the discount dialog) ─────────────────────────
  /** Sum of per-line (item) discounts: per-unit amount × quantity. */
  get manualItemDiscount(): number {
    return this.cart.reduce((s, i) => s + (i.discount || 0) * i.quantity, 0);
  }

  /** Pre-tax net subtotal from the quote (server) before manual discounts. */
  private get serverNetSubtotal(): number {
    return this.quote ? this.quote.subtotalAmount : Math.max(0, this.subtotal - this.couponDiscount);
  }

  /** Base the cart-level discount is computed on (after server + item discounts). */
  get cartDiscountBase(): number {
    return Math.max(0, this.serverNetSubtotal - this.manualItemDiscount);
  }

  /** Resolved cart-level discount amount (percentage or fixed, capped by cfgMaxDiscountPercent). */
  get cartDiscountAmount(): number {
    if (this.cartDiscountValue <= 0) return 0;
    const base = this.cartDiscountBase;
    const maxPct = this.cfgMaxDiscountPercent;
    if (this.cartDiscountType === 'Percentage') {
      return base * Math.min(this.cartDiscountValue, maxPct) / 100;
    }
    return Math.min(this.cartDiscountValue, base * maxPct / 100);
  }

  /** All manual discounts applied in the discount dialog (item + cart). */
  get manualDiscountTotal(): number { return this.manualItemDiscount + this.cartDiscountAmount; }
  get totalSavings(): number { return this.manualDiscountTotal; }

  /** Effective tax rate implied by the server quote. */
  private get effTaxRate(): number {
    if (!this.quote || this.quote.subtotalAmount <= 0) return 0;
    return this.quote.taxAmount / this.quote.subtotalAmount;
  }

  private get clientTax(): number {
    return this.cart.reduce((s, i) => s + (i.unitPrice - i.discount) * i.quantity * i.taxRate / 100, 0);
  }

  get totalTax(): number {
    if (this.quote) return Math.max(0, this.quote.subtotalAmount - this.manualDiscountTotal) * this.effTaxRate;
    return this.clientTax;
  }

  get grandTotal(): number {
    if (this.quote) {
      // No manual discount → the quote is authoritative; use its total verbatim so
      // the tender we send matches the backend invoice exactly (no rounding gap that
      // would leave a residual balance and flag the sale as a partial payment).
      if (this.manualDiscountTotal <= 0) return this.quote.totalAmount;
      const net = Math.max(0, this.quote.subtotalAmount - this.manualDiscountTotal);
      return net + net * this.effTaxRate;
    }
    return Math.max(0, this.subtotal - this.couponDiscount - this.manualDiscountTotal + this.clientTax);
  }

  get change(): number {
    return Math.max(0, this.amountTendered - this.grandTotal);
  }

  /**
   * Treat a sub-cent residual as fully paid: the backend can flag isFullyPaid=false
   * over a rounding remnant, which shouldn't read as a real partial payment on the
   * receipt. Only a balance above half a cent is a genuine partial.
   */
  get isReceiptPartial(): boolean {
    return (this.checkoutResult?.balanceDue ?? 0) > 0.005;
  }

  get balanceDue(): number {
    return Math.max(0, this.grandTotal - this.amountTendered);
  }

  // ── Actions ───────────────────────────────────────────────────────────────────
  closeAllPanels() {
    this.showSearch = false;
    this.showCashDrawer = false;
    this.showCustomerPanel = false;
    this.showDiscountPanel = false;
    this.showCommentPanel = false;
    this.showProductGrid = false;
    this.showQtyPad = false;
    this.customerSearch = '';
    this.cdr.detectChanges();
    this.focusSearch();
  }

  newSale() {
    this.discardPendingOrder();
    // Detach from the current held sale (it stays under Open sales) and start fresh.
    this.activeSaleId = null;
    this.cart = [];
    this.selectedCartIndex = -1;
    this.appliedCoupon = null;
    this.couponCode = '';
    this.customerName = '';
    this.contactId = '';
    this.orderNotes = '';
    this.numpadBuffer = '';
    this.cartDiscountValue = 0;
    this.cartDiscountType = 'Percentage';
    // Re-select the walk-in customer for the next sale.
    this.selectWalkIn();
    this.quote = null;
    this.quoteWarnings = [];
    this.checkoutResult = null;
    this.thermalReceipt = null;
    this.allowCredit = false;
    this.amountTendered = 0;
    this.splitMode = false;
    this.showSplitDialog = false;
    this.splitAmount = 0;
    this.tenderBuffer = '';
    this.tenderLines = [];
    if (this.quoteTimer) clearTimeout(this.quoteTimer);
    this.screen = 'terminal';
    this.closeAllPanels();
    this.cdr.detectChanges();
    this.focusEl('posSearchInput');
  }

  // ── Open (held) sales ──────────────────────────────────────────────────────────
  private newLocalId(): string {
    return (typeof crypto !== 'undefined' && (crypto as any).randomUUID)
      ? (crypto as any).randomUUID()
      : 'os-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  }

  /** Keep the active open-sale entry in step with the current cart. Creates one on
   *  the first item and drops it again if the cart is fully emptied. */
  private syncOpenSale() {
    if (this.cart.length === 0) {
      if (this.activeSaleId) {
        this.openSales = this.openSales.filter(s => s.id !== this.activeSaleId);
        this.activeSaleId = null;
      }
      return;
    }
    if (!this.activeSaleId) {
      this.activeSaleId = this.newLocalId();
      this.openSales.unshift({
        id: this.activeSaleId, ref: ++this.openSaleSeq,
        items: [], customerName: '', contactId: '', note: '', total: 0, createdAt: new Date(),
      });
    }
    const sale = this.openSales.find(s => s.id === this.activeSaleId);
    if (sale) {
      sale.items = this.cart.map(i => ({ ...i }));
      sale.customerName = this.customerName;
      sale.contactId = this.contactId;
      sale.note = this.orderNotes;
      sale.total = this.grandTotal;
    }
  }

  /** F9 / Save sale: park the current order (it is already an open sale) and start
   *  a fresh one, leaving the parked sale under "Open sales". */
  saveSale() {
    if (this.cart.length === 0) { this.showToast('Cart is empty.'); return; }
    this.syncOpenSale();
    this.showToast('Sale parked under Open sales.');
    this.newSale();
  }

  openOpenSales() {
    this.showSideMenu = false;
    this.syncOpenSale();
    this.showOpenSalesModal = true;
    this.cdr.detectChanges();
  }

  closeOpenSales() {
    this.showOpenSalesModal = false;
    this.cdr.detectChanges();
    this.focusSearch();
  }

  /** Resume a held sale into the active cart. The current cart is already synced
   *  into Open sales, so switching never loses work. */
  loadOpenSale(id: string) {
    const sale = this.openSales.find(s => s.id === id);
    if (!sale) return;
    this.discardPendingOrder();
    this.cart = sale.items.map(x => ({ ...x }));
    this.customerName = sale.customerName;
    this.contactId = sale.contactId;
    this.orderNotes = sale.note;
    this.activeSaleId = id;
    this.selectedCartIndex = this.cart.length - 1;
    this.appliedCoupon = null;
    this.couponCode = '';
    this.cartDiscountValue = 0;
    this.cartDiscountType = 'Percentage';
    this.showOpenSalesModal = false;
    this.screen = 'terminal';
    this.scheduleQuote();
    this.cdr.detectChanges();
  }

  /** Remove a held sale. If it is the one being edited, clear the active cart too. */
  deleteOpenSale(id: string, ev?: Event) {
    ev?.stopPropagation();
    this.openSales = this.openSales.filter(s => s.id !== id);
    if (this.activeSaleId === id) {
      this.activeSaleId = null;
      this.cart = [];
      this.selectedCartIndex = -1;
      this.quote = null;
      this.quoteWarnings = [];
      if (this.quoteTimer) clearTimeout(this.quoteTimer);
    }
    this.cdr.detectChanges();
  }

  itemCount(sale: OpenSale): number {
    return sale.items.reduce((n, i) => n + (i.quantity || 0), 0);
  }

  voidOrder() {
    if (this.cart.length === 0) return;
    this.openConfirm('Void Order', 'Discard all items in the current cart?', 'Void order', true, () => {
      if (this.activeSaleId) {
        this.openSales = this.openSales.filter(s => s.id !== this.activeSaleId);
        this.activeSaleId = null;
      }
      this.newSale();
    });
  }

  goToPayment(skipStockCheck = false) {
    if (this.cart.length === 0) { this.showToast('Cart is empty.'); return; }

    // Out-of-stock checkpoint: if any cart line has no stock in this store's warehouse, make the
    // cashier confirm before taking payment (selling still allowed — this is a deliberate prompt,
    // not a hard block). Usually means the POS store points at the wrong warehouse.
    if (!skipStockCheck && this.availabilityChecked) {
      // Make-to-order (BOM-backed) items are produced on sale, so their 0 finished-goods stock is
      // expected — exclude them from the out-of-stock prompt.
      const oos = this.cart.filter(c => (this.availabilityByItem[c.inventoryItemId] ?? 0) <= 0 && !this.isProducible(c.inventoryItemId));
      if (oos.length > 0) {
        const names = oos.map(c => c.itemName).join(', ');
        this.openConfirm(
          'Out of stock',
          `${names} ${oos.length > 1 ? 'have' : 'has'} no stock in this store's warehouse. Sell anyway? If that's wrong, set the store's Default Warehouse in POS Stores settings.`,
          'Sell anyway', true,
          () => this.goToPayment(true),
        );
        return;
      }
    }

    this.error = '';
    this.tenderLines = [];
    this.allowCredit = false;
    this.splitMode = false;
    this.amountTendered = Math.ceil(this.grandTotal);
    this.splitAmount = this.amountTendered;
    this.tenderBuffer = '';
    this.screen = 'payment';
    this.cdr.detectChanges();
    this.focusEl('payTenderedInput');
  }

  // ── Split payment helpers ─────────────────────────────────────────────────────
  private tenderTypeFor(method: PaymentMethod): PosTenderType {
    switch (method) {
      case 'Cash':            return PosTenderType.Cash;
      case 'Card':            return PosTenderType.CreditCard;
      case 'Wallet':          return PosTenderType.MobileWallet;
      case 'CreditOnAccount': return PosTenderType.StoreCredit;
      default:                return PosTenderType.CreditCard;
    }
  }

  get tenderedSoFar(): number {
    return this.tenderLines.reduce((s, t) => s + (t.amount || 0), 0);
  }

  /** Outstanding amount the cashier still has to collect (split-aware). */
  get remainingToPay(): number {
    return Math.max(0, this.grandTotal - this.tenderedSoFar);
  }

  addTender() {
    const amount = Number(this.splitAmount) || this.remainingToPay;
    if (amount <= 0) { this.showToast('Enter a tender amount.'); return; }
    this.tenderLines.push({
      tenderType: this.tenderTypeFor(this.paymentMethod),
      amount,
      referenceNumber: this.paymentReference || null,
    });
    this.paymentReference = '';
    this.splitAmount = this.remainingToPay;
    this.cdr.detectChanges();
  }

  removeTender(i: number) {
    this.tenderLines.splice(i, 1);
    this.splitAmount = this.remainingToPay;
    this.cdr.detectChanges();
  }

  tenderLabel(t: PosTenderDto): string {
    return PosTenderType[t.tenderType as number] ?? String(t.tenderType);
  }

  // ── Payment screen: type selector, keypad, validate ────────────────────────────
  selectPaymentType(t: PaymentMethod | 'Split') {
    if (t === 'Split') {
      this.openSplitDialog();
    } else {
      this.paymentMethod = t;
    }
    this.cdr.detectChanges();
  }

  // ── Split payment dialog ───────────────────────────────────────────────────────
  openSplitDialog() {
    this.splitMode = true;
    this.showSplitDialog = true;
    this.cdr.detectChanges();
  }

  /** Hide the dialog but keep the entered tenders (split stays active). */
  closeSplitDialog() {
    this.showSplitDialog = false;
    this.cdr.detectChanges();
  }

  /** Discard the split and return to the single-payment view. */
  cancelSplit() {
    this.tenderLines = [];
    this.splitMode = false;
    this.showSplitDialog = false;
    this.amountTendered = Math.ceil(this.grandTotal);
    this.splitAmount = this.amountTendered;
    this.tenderBuffer = '';
    this.cdr.detectChanges();
  }

  /** Add a tender for the outstanding balance using the chosen method. */
  addSplitTender(method: PaymentMethod) {
    this.paymentMethod = method;
    const amount = this.remainingToPay;
    if (amount <= 0) { this.showToast('Order is already fully covered.'); return; }
    this.tenderLines.push({
      tenderType: this.tenderTypeFor(method),
      amount,
      referenceNumber: null,
    });
    this.cdr.detectChanges();
  }

  updateTenderAmount(i: number, value: number | string) {
    const t = this.tenderLines[i];
    if (!t) return;
    t.amount = Math.max(0, Number(value) || 0);
    this.cdr.detectChanges();
  }

  /** OK button: the tenders must cover the total unless credit is allowed. */
  confirmSplit() {
    if (this.processingPayment) return;
    if (!this.tenderLines.length) { this.showToast('Add at least one payment.'); return; }
    if (this.remainingToPay > 0.0001 && !this.allowCredit) {
      this.error = 'Paid amount is less than the total. Add another payment or enable credit.';
      this.showToast(this.error);
      return;
    }
    this.showSplitDialog = false;
    this.cdr.detectChanges();
    this.confirmPayment();
  }

  private syncTendered(v: number) {
    this.amountTendered = v;
    this.splitAmount = v;
  }

  /** Quick-amount buttons. */
  setTendered(a: number) {
    this.tenderBuffer = a ? String(a) : '';
    this.syncTendered(a);
    this.cdr.detectChanges();
  }

  /** Keeps the keypad buffer in sync when the cashier types in the amount field. */
  onTenderedInput() {
    const v = Number(this.amountTendered) || 0;
    this.tenderBuffer = v ? String(v) : '';
    this.splitAmount = v;
  }

  /** On-screen numeric keypad. */
  payKey(k: string) {
    switch (k) {
      case 'enter': this.onPayEnter(); return;
      case '-': return; // sign key — reserved, no-op
      case 'C': this.tenderBuffer = ''; break;
      case 'back': this.tenderBuffer = this.tenderBuffer.slice(0, -1); break;
      case '.': if (!this.tenderBuffer.includes('.')) this.tenderBuffer = (this.tenderBuffer || '0') + '.'; break;
      default: this.tenderBuffer += k; // a digit
    }
    this.syncTendered(parseFloat(this.tenderBuffer) || 0);
    this.cdr.detectChanges();
  }

  /** Enter/validate key: in split mode bank the current tender, otherwise check out. */
  onPayEnter() {
    if (this.processingPayment) return;
    if (this.splitMode && this.remainingToPay > 0.0001 && (Number(this.amountTendered) || 0) > 0) {
      this.addTender();
      this.tenderBuffer = '';
      this.amountTendered = this.remainingToPay;
      this.cdr.detectChanges();
      return;
    }
    this.confirmPayment();
  }

  confirmPayment() {
    if (this.processingPayment) return;
    if (this.cart.length === 0) { this.error = 'Cart is empty.'; return; }
    if (!this.activeSession?.id || !this.selectedTerminalId || !this.loggedCashier?.id) {
      this.error = 'An open session, terminal and cashier are required to take payment.';
      this.cdr.detectChanges();
      return;
    }
    const storeId = this.selectedStore?.id ?? this.loggedCashier?.branchId ?? null;
    if (!storeId) { this.error = 'No store selected.'; this.cdr.detectChanges(); return; }
    if (this.cfgRequireCustomer && !this.contactId) {
      this.error = 'Select a customer before taking payment.';
      this.showCustomerPanel = true;
      this.cdr.detectChanges();
      return;
    }

    // Build the tenders. Split tenders take precedence; otherwise a single tender
    // for the selected method (cash uses the tendered amount so the server returns change).
    // Round to currency precision so floating-point dust never leaves a residual
    // balance on the invoice (which the backend would flag as a partial payment).
    const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
    const tenders: PosTenderDto[] = this.tenderLines.length
      ? this.tenderLines.map(t => ({ ...t, amount: round2(t.amount || 0) }))
      : [{
          tenderType: this.tenderTypeFor(this.paymentMethod),
          amount: this.paymentMethod === 'Cash' ? round2(Number(this.amountTendered) || this.grandTotal) : round2(this.grandTotal),
          referenceNumber: this.paymentReference || null,
        }];

    const totalTendered = tenders.reduce((s, t) => s + (t.amount || 0), 0);
    if (totalTendered + 0.0001 < this.grandTotal && !this.allowCredit) {
      this.error = 'Tendered amount is less than the total. Enable credit to accept a partial payment.';
      this.cdr.detectChanges();
      return;
    }

    this.error = '';
    this.processingPayment = true;

    // Manual discounts are sent as a per-line percentage (the order API's convention):
    // the item discount plus the cart-level discount spread evenly across lines.
    const lines = this.cart.map((c) => {
      const cartPct = this.cartDiscountType === 'Percentage'
        ? this.cartDiscountValue
        : (this.cartDiscountBase > 0 ? this.cartDiscountAmount / this.cartDiscountBase * 100 : 0);
      const itemPct = c.unitPrice > 0 ? (c.discount || 0) / c.unitPrice * 100 : 0;
      const discountPercentage = Math.min(100, Math.round((itemPct + cartPct) * 10000) / 10000);
      return {
        productId: c.inventoryItemId,
        productCode: c.sku,
        productName: c.itemName ?? null,
        quantity: c.quantity,
        unitPrice: c.unitPrice,
        discountPercentage,
        taxCategory: 0 as const,
      };
    });

    // ── Operating mode: Online | Offline-fallback | Local-first ──
    // Card/non-cash tenders always need a live connection (no offline authorization),
    // so only cash sales are ever captured locally.
    const mode = this.cfgPosMode;
    const isCash = tenders.every(t => t.tenderType === this.tenderTypeFor('Cash'));
    const goLocal = isCash && (mode === 'LocalFirst' || (mode === 'OfflineFallback' && !this.offline.isOnline));
    if (goLocal) {
      void this.captureOfflineSale(storeId, lines, tenders, totalTendered);
      return;
    }
    if (!this.offline.isOnline) {
      this.failPayment(isCash
        ? 'No connection. This terminal is in Online mode — switch to Offline-fallback or Local-first in settings to keep selling.'
        : 'Card payments need a connection.');
      return;
    }

    const checkout = (order: SalesOrderDto) => {
      this.posTransactionService.checkout({
        salesOrderId: order.id,
        posSessionId: this.activeSession!.id,
        posTerminalId: this.selectedTerminalId,
        posStoreId: storeId,
        posCashierId: this.loggedCashier!.id,
        tenders,
        allowCredit: this.allowCredit,
        notes: this.orderNotes || null,
      }).subscribe({
        next: (res) => {
          if (!res.data) { this.failPayment(res.message || 'Checkout failed.'); return; }
          this.onCheckoutSuccess(res.data, order);
        },
        error: (err) => this.failPayment(this.apiError(err) || 'Checkout failed.'),
      });
    };

    // If a pending order from a prior (failed) checkout attempt still exists, the
    // cart is unchanged since it was built (any edit deletes it), so its lines are
    // still valid — just retry checkout on it instead of creating a duplicate.
    // The order API can't update lines, so there's nothing to re-send.
    if (this.pendingOrder) {
      checkout(this.pendingOrder);
      return;
    }

    const orderDto: CreateSalesOrderDto = {
      contactId: this.contactId || null,
      contactName: this.customerName || 'Walk-in Customer',
      salesChannel: POS_WALK_IN_CHANNEL,
      fulfillmentType: FULFILLMENT_IMMEDIATE,
      originBranchId: storeId,
      originPosCashierId: this.loggedCashier?.id ?? null,
      originPosSessionId: this.activeSession?.id ?? null,
      originPosTerminalId: this.selectedTerminalId || null,
      priceListId: this.selectedStore?.defaultPriceListId ?? null,
      couponCode: this.couponCode || this.appliedCoupon?.code || null,
      billToCountry: this.selectedStore?.country ?? null,
      notes: this.orderNotes || null,
      currencyCode: this.cfgCurrencyCode,
      lines,
    };
    this.orderService.create(orderDto).subscribe({
      next: (orderRes) => {
        const order = orderRes.data;
        if (!order?.id) { this.failPayment('Failed to create order.'); return; }
        // Remember it so a retry after a failed checkout reuses it (no duplicate).
        this.pendingOrder = order;
        checkout(order);
      },
      error: (err) => this.failPayment(this.apiError(err) || 'Failed to create order.'),
    });
  }

  private apiError(err: any): string {
    const body = err?.error;
    return body?.message ?? body?.errors?.[0] ?? err?.message ?? '';
  }

  private failPayment(msg: string) {
    this.error = msg;
    this.processingPayment = false;
    this.cdr.detectChanges();
  }

  // ── Offline sale capture (Phase 2) ──────────────────────────────────────────

  private newOfflineUid(): string {
    const dev = this.offline.deviceId.replace(/-/g, '').slice(0, 6).toUpperCase();
    return `OFF-${dev}-${Date.now().toString(36).toUpperCase()}`;
  }

  /** Cash sale completed with no connection: build the order, queue it, print a provisional receipt. */
  private async captureOfflineSale(storeId: string, lines: any[], tenders: PosTenderDto[], totalTendered: number) {
    const cashType = this.tenderTypeFor('Cash');
    if (!tenders.every(t => t.tenderType === cashType)) {
      this.failPayment('Card payments need a connection. Take cash while offline.');
      return;
    }

    const uid = this.newOfflineUid();
    const order: CreateSalesOrderDto = {
      contactId: this.contactId || null,
      contactName: this.customerName || 'Walk-in Customer',
      salesChannel: POS_WALK_IN_CHANNEL,
      fulfillmentType: FULFILLMENT_IMMEDIATE,
      originBranchId: storeId,
      originPosCashierId: this.loggedCashier?.id ?? null,
      originPosSessionId: this.activeSession?.id ?? null,
      originPosTerminalId: this.selectedTerminalId || null,
      priceListId: this.selectedStore?.defaultPriceListId ?? null,
      couponCode: this.couponCode || this.appliedCoupon?.code || null,
      billToCountry: this.selectedStore?.country ?? null,
      notes: this.orderNotes || null,
      currencyCode: this.cfgCurrencyCode,
      offlineOrderNumber: uid,
      lines,
    };

    // When the session was opened offline, carry its open-context so the server can create/resolve
    // the session on sync (idempotent on offlineSessionNumber) before booking the sale.
    const offlineSession = this.sessionIsOffline ? {
      offlineSessionNumber: this.activeSession?.sessionNumber ?? null,
      terminalId: this.selectedTerminalId || null,
      cashierId: this.loggedCashier?.id ?? null,
      storeId,
      openingFloat: this.activeSession?.openingFloat ?? 0,
      openedAt: this.activeSession?.openedAt ?? null,
    } : null;

    const entry: OutboxOrder = {
      uid,
      createdAt: new Date().toISOString(),
      status: 'pending',
      attempts: 0,
      deviceTotal: this.grandTotal,
      payload: { offlineOrderNumber: uid, order, tenders, allowCredit: this.allowCredit, deviceTotal: this.grandTotal, completedAt: new Date().toISOString(), offlineSession },
    };

    try {
      await this.posSync.enqueue(entry);
    } catch {
      this.failPayment('Could not save the offline sale on this device.');
      return;
    }

    const change = Math.max(0, totalTendered - this.grandTotal);
    this.printOfflineReceipt(uid, totalTendered, change);
    this.processingPayment = false;
    this.pendingOrder = null;
    // Remove the completed sale from Open sales (matches what onCheckoutSuccess does online).
    if (this.activeSaleId) {
      this.openSales = this.openSales.filter(s => s.id !== this.activeSaleId);
      this.activeSaleId = null;
    }
    this.showToast(`Offline sale saved · ${uid} · Change ${change.toFixed(2)} — will sync`);
    this.newSale();
    this.cdr.detectChanges();
  }

  /** Minimal client-rendered thermal receipt for an offline sale (the real number is assigned on sync). */
  private printOfflineReceipt(uid: string, tendered: number, change: number) {
    const w = this.cfgPaperSize === 'Thermal58mm' ? 32 : 48;
    const center = (s: string) => {
      const t = s.length > w ? s.slice(0, w) : s;
      return ' '.repeat(Math.max(0, Math.floor((w - t.length) / 2))) + t;
    };
    const lr = (l: string, r: string) => {
      const maxL = Math.max(0, w - r.length - 1);
      const left = l.length > maxL ? l.slice(0, maxL) : l;
      return left + ' '.repeat(Math.max(1, w - left.length - r.length)) + r;
    };
    const out: string[] = [];
    out.push(center((this.selectedStore?.tradingName ?? 'RECEIPT').toUpperCase()));
    out.push('-'.repeat(w));
    out.push(`Receipt: ${uid}`);
    out.push(`Date   : ${new Date().toLocaleString()}`);
    out.push('-'.repeat(w));
    for (const c of this.cart) {
      out.push((c.itemName ?? c.sku ?? '').slice(0, w));
      // Prefer the authoritative quote (promotions/price-list applied) when it's still valid.
      out.push(lr(`  ${c.quantity} x ${this.lineUnitPrice(c).toFixed(2)}`, this.lineAmount(c).toFixed(2)));
    }
    out.push('-'.repeat(w));
    out.push(lr('TOTAL', this.grandTotal.toFixed(2)));
    out.push(lr('Tendered', tendered.toFixed(2)));
    out.push(lr('Change', change.toFixed(2)));
    out.push('');
    out.push(center('*** OFFLINE — PENDING SYNC ***'));
    this.printHtml(this.buildThermalHtml(out.join('\n'), this.cfgPaperSize));
  }

  // ── Offline sync review panel (Phase 4) ─────────────────────────────────────

  showSyncPanel = false;
  syncItems: OutboxOrder[] = [];

  async openSyncPanel() {
    this.showSyncPanel = true;
    await this.refreshSyncItems();
  }

  closeSyncPanel() {
    this.showSyncPanel = false;
    this.cdr.detectChanges();
  }

  private async refreshSyncItems() {
    this.syncItems = await this.posSync.getItems();
    this.cdr.detectChanges();
  }

  async syncNow() {
    if (this.syncing) return;
    this.syncing = true;
    try {
      // 1) Pull inventory / promotions / prices DOWN (local modes, when online).
      const refresh = this.cfgPosMode !== 'Online' && this.offline.isOnline;
      if (refresh) {
        this.syncStatus = '⬇ Downloading inventory, promotions & prices…';
        this.cdr.detectChanges();
        await this.syncDownload();
        this.inventoryStale = false;
      }

      // 2) Push queued offline sales UP.
      this.syncStatus = '⬆ Uploading sales…';
      this.cdr.detectChanges();
      const r = await this.posSync.drain();
      await this.refreshSyncItems();

      const tail = refresh ? ' · data refreshed' : '';
      if (r.error) this.showToast(`Sync failed: ${r.error}`);
      else if (r.attempted === 0) this.showToast(refresh ? 'Data refreshed — nothing to upload.' : 'Nothing to sync.');
      else this.showToast(`Synced ${r.synced}${r.failed ? ` · ${r.failed} failed` : ''}${tail}.`);
    } finally {
      this.syncing = false;
      this.syncStatus = '';
      this.cdr.detectChanges();
    }
  }

  /** Awaitable snapshot used by manual Sync (so progress can be shown). Best-effort per source. */
  private async syncDownload(): Promise<void> {
    const get = (o: any) => firstValueFrom(o).catch(() => null) as Promise<any>;
    const storeId = this.selectedStore?.id;
    const [items, cats, contacts, cfg, promos, priceLists, cashiers, terms] = await Promise.all([
      this.fetchAllActiveItems().catch(() => null),
      get(this.categoryService.getActive()),
      get(this.contactService.getAll({ pageSize: 500 })),
      get(this.posSettingsService.getSettings()),
      get(this.promotionService.getActive()),
      get(this.priceListService.getActive()),
      storeId ? get(this.cashierService.getByStore(storeId)) : Promise.resolve(null),
      storeId ? get(this.terminalService.getActiveByBranch(storeId)) : Promise.resolve(null),
    ]);
    if (items)         { this.menuItems = items; this.dataCache.set('menuItems', this.menuItems); this.lastKnownSignature = this.catalogSignature(this.menuItems); }
    if (cats?.data)    { this.categories = cats.data; this.dataCache.set('categories', this.categories); }
    if (contacts?.data){ this.contacts = contacts.data; if (!this.contactId) this.selectWalkIn(); this.dataCache.set('contacts', this.contacts); }
    if (cfg?.data)     { this.posConfig = cfg.data; this.dataCache.set('posConfig', this.posConfig); }
    if (promos?.data)  { this.cachedPromotions = promos.data; this.dataCache.set('promotions', this.cachedPromotions); }
    if (priceLists?.data) { this.dataCache.set('priceLists', priceLists.data); }
    if (cashiers?.data) this.dataCache.set('posCashiers', cashiers.data);   // for offline cashier list
    if (terms?.data)    this.dataCache.set('posTerminals', terms.data);     // for offline terminal context
    this.dataCache.set('snapshotAt', new Date().toISOString());
    this.cdr.detectChanges();
  }

  async retrySync(uid: string) {
    const r = await this.posSync.retry(uid);
    await this.refreshSyncItems();
    if (r.error) this.showToast(`Sync failed: ${r.error}`);
    else this.showToast(`Synced ${r.synced}${r.failed ? ` · ${r.failed} failed` : ''}.`);
  }

  async dismissSync(uid: string) { await this.posSync.dismiss(uid); await this.refreshSyncItems(); }

  // ── Local-first: session-start snapshot + inventory-change watch ─────────────

  private maybeSnapshotOnSession() {
    if (this.cfgPosMode === 'Online') return;   // pure online needs nothing local
    if (this.isOnline) {
      // Only download when connected — if already offline, cached data is used as-is.
      void this.snapshotForSessionWithProgress();
    }
    this.startInventoryWatch();
  }

  /** Pull everything the till needs into local storage, showing per-step progress. */
  async snapshotForSessionWithProgress(): Promise<void> {
    const steps = [
      { label: 'Products & inventory',  key: 'products'   },
      { label: 'Categories',            key: 'categories' },
      { label: 'Customers',             key: 'contacts'   },
      { label: 'POS configuration',     key: 'config'     },
      { label: 'Promotions',            key: 'promotions' },
      { label: 'Price lists',           key: 'priceLists' },
      { label: 'Cashiers & terminals',  key: 'cashiers'   },
      { label: 'Uploading queued sales',key: 'upload'     },
    ];
    this.offlineSyncSteps = steps.map(s => ({ label: s.label, done: false }));
    this.offlineSyncing = true;
    this.cdr.detectChanges();

    const storeId = this.selectedStore?.id;
    const get = (o: any) => firstValueFrom(o).catch(() => null) as Promise<any>;

    const markDone = (idx: number) => {
      this.offlineSyncSteps[idx].done = true;
      this.cdr.detectChanges();
    };

    // Run downloads sequentially so the progress bar fills step by step.
    const items = await this.fetchAllActiveItems().catch(() => null);
    if (items) { this.menuItems = items; this.dataCache.set('menuItems', this.menuItems); this.lastKnownSignature = this.catalogSignature(this.menuItems); }
    markDone(0);

    const cats = await get(this.categoryService.getActive());
    if (cats?.data) { this.categories = cats.data; this.dataCache.set('categories', this.categories); }
    markDone(1);

    const contacts = await get(this.contactService.getAll({ pageSize: 500 }));
    if (contacts?.data) { this.contacts = contacts.data; if (!this.contactId) this.selectWalkIn(); this.dataCache.set('contacts', this.contacts); }
    markDone(2);

    const cfg = await get(this.posSettingsService.getSettings());
    if (cfg?.data) { this.posConfig = cfg.data; this.dataCache.set('posConfig', this.posConfig); }
    markDone(3);

    const promos = await get(this.promotionService.getActive());
    if (promos?.data) { this.cachedPromotions = promos.data; this.dataCache.set('promotions', this.cachedPromotions); }
    markDone(4);

    const priceLists = await get(this.priceListService.getActive());
    if (priceLists?.data) this.dataCache.set('priceLists', priceLists.data);
    markDone(5);

    if (storeId) {
      const [cashiers, terms] = await Promise.all([
        get(this.cashierService.getByStore(storeId)),
        get(this.terminalService.getActiveByBranch(storeId)),
      ]);
      if (cashiers?.data) this.dataCache.set('posCashiers', cashiers.data);
      if (terms?.data)    this.dataCache.set('posTerminals', terms.data);
    }
    markDone(6);

    // Upload any queued offline sales back to the server.
    if (this.isOnline) await this.posSync.drain();
    markDone(7);

    const now = new Date();
    this.dataCache.set('snapshotAt', now.toISOString());
    this.lastSyncAt = now;
    this.offlineSyncing = false;
    this.cdr.detectChanges();
  }

  /** Fire-and-forget snapshot (used by manual catalog refresh). */
  snapshotForSession() {
    void this.snapshotForSessionWithProgress();
  }

  /** Cache the store's cashiers + terminals so they're available for offline PIN login / context. */
  private cacheCashiersTerminals() {
    const storeId = this.selectedStore?.id;
    if (!storeId) return;
    this.cashierService.getByStore(storeId).subscribe({
      next: (r) => this.dataCache.set('posCashiers', r.data ?? []),
      error: () => { /* keep last cached cashiers */ },
    });
    this.terminalService.getActiveByBranch(storeId).subscribe({
      next: (r) => this.dataCache.set('posTerminals', r.data ?? []),
      error: () => { /* keep last cached terminals */ },
    });
  }

  // ── Offline PIN credentials (cache-on-online-login) ─────────────────────────────
  // The API never returns the PIN hash, so we can't download it. Instead, when a
  // cashier logs in online we store a per-device salted SHA-256 of the PIN; offline
  // login then verifies the entered PIN against this without any server call.

  private async hashPin(pin: string): Promise<string> {
    const data = new TextEncoder().encode(`${this.offline.deviceId}:${pin}`);
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /** Store the cashier + a salted PIN hash so this cashier can log in offline later. */
  private async cachePinCredential(cashier: PosCashierDto, pin: string): Promise<void> {
    try {
      const hash = await this.hashPin(pin);
      const creds = (await this.dataCache.get<any[]>('pinCreds')) ?? [];
      const next = creds.filter((c) => c.cashierId !== cashier.id);
      next.push({ cashierId: cashier.id, pinHash: hash, cashier });
      this.dataCache.set('pinCreds', next);
    } catch { /* Web Crypto unavailable (insecure context) — skip */ }
  }

  private cachePromotions() {
    this.promotionService.getActive().subscribe({
      next: (res) => {
        this.cachedPromotions = res.data ?? [];
        this.dataCache.set('promotions', this.cachedPromotions);
      },
      error: () => this.dataCache.get<any[]>('promotions').then(v => { if (v) this.cachedPromotions = v; }),
    });
  }

  private cachePriceLists() {
    this.priceListService.getActive().subscribe({
      next: (res) => this.dataCache.set('priceLists', res.data ?? []),
      error: () => { /* keep last cached price lists */ },
    });
  }

  /** Cheap fingerprint of the catalog (count + id hash) to detect added/removed products. */
  private catalogSignature(items: ItemDto[]): string {
    const ids = items.map(i => i.id).sort().join(',');
    let h = 0;
    for (let i = 0; i < ids.length; i++) h = (h * 31 + ids.charCodeAt(i)) | 0;
    return `${items.length}:${h}`;
  }

  private startInventoryWatch() {
    if (this.invPollTimer) return;
    this.invPollTimer = setInterval(() => this.checkInventoryChanged(), 180_000);
  }

  /** When online in a local mode, check whether the server catalog changed since our snapshot. */
  private checkInventoryChanged() {
    if (this.cfgPosMode === 'Online' || !this.offline.isOnline || this.inventoryStale || !this.activeSession) return;
    this.fetchAllActiveItems()
      .then((items) => {
        const sig = this.catalogSignature(items);
        if (this.lastKnownSignature && sig !== this.lastKnownSignature) {
          this.inventoryStale = true;
          this.cdr.detectChanges();
        }
      })
      .catch(() => { /* transient — ignore */ });
  }

  /** Banner action: re-pull the data and clear the "changed" flag. */
  syncInventoryNow() {
    this.inventoryStale = false;
    this.snapshotForSession();
    this.showToast('Refreshing data from the server…');
    this.cdr.detectChanges();
  }

  private onCheckoutSuccess(result: PosCheckoutResultDto, order: SalesOrderDto) {
    // Fire production for any make-to-order (BOM-backed) lines while the cart is still intact —
    // the burger/pizza is "produced" (raw materials backflushed, finished goods received) now that
    // it's been sold. Must run before newSale() clears the cart below.
    this.firePostSaleProduction();
    // The pending order has been settled into this completed sale — clear the
    // reference WITHOUT deleting it (it is now the real, paid order).
    this.pendingOrder = null;
    // The sale is completed — remove it from Open sales.
    if (this.activeSaleId) {
      this.openSales = this.openSales.filter(s => s.id !== this.activeSaleId);
      this.activeSaleId = null;
    }
    this.checkoutResult = result;
    this.receiptOrder = order;
    this.receiptPaymentMethod = this.paymentMethod;
    this.amountTendered = result.tenderedAmount;
    this.processingPayment = false;
    this.loadStoreAvailability();   // stock just changed — refresh the ring-time warning data
    const txId = result.transaction?.id;

    // Auto-print: send straight to printer, skip the preview screen entirely.
    // Enabled via "Auto-print receipt after every sale" in POS Settings (branch-level).
    if (this.cfgAutoPrint && txId) {
      this.printThermal(txId);
      const change = result.changeAmount ?? 0;
      this.showToast('Payment complete · Printing receipt…' + (change > 0 ? ` · Change: ${change.toFixed(2)}` : ''));
      this.newSale();
      return;
    }

    // Skip receipt screen (server config or local override).
    if (this.cfgSkipReceiptScreen) {
      const change = result.changeAmount ?? 0;
      this.showToast('Payment complete' + (change > 0 ? ` · Change ${change.toFixed(2)}` : ''));
      this.newSale();
      return;
    }

    this.screen = 'receipt';
    this.cdr.detectChanges();
    // Pull the server-rendered thermal receipt for an on-screen preview (chosen paper size).
    if (txId) {
      this.thermalReceipt = null;
      this.posTransactionService.getReceipt(txId, this.cfgPaperSize).subscribe({
        next: (res) => { this.thermalReceipt = res.data ?? null; this.cdr.detectChanges(); },
        error: () => {},
      });
    }
  }

  // ── Cash drawer ───────────────────────────────────────────────────────────────
  recordCashMove() {
    if (!this.activeSession || !this.cashMoveAmount) return;
    const dto = { amount: this.cashMoveAmount, reason: this.cashMoveReason || null };
    const obs = this.cashMoveType === 'CashIn'
      ? this.cashierService.cashIn(this.activeSession.id, dto)
      : this.cashierService.cashOut(this.activeSession.id, dto);
    obs.subscribe({
      next: () => {
        this.showToast('Cash movement recorded.');
        this.showCashDrawer = false;
        this.cashMoveAmount = 0;
        this.cashMoveReason = '';
        this.cdr.detectChanges();
      },
      error: () => { this.showToast('Cash movement failed.'); },
    });
  }

  // ── Session end / logout ──────────────────────────────────────────────────────
  endSession() {
    if (!this.activeSession) { this.logoutPOS(); return; }
    this.showSideMenu = false;
    this.closingCashAmount = 0;
    this.sessionTransactions = [];
    this.showEndSessionPanel = true;
    this.cdr.detectChanges();

    // Refresh session totals from server (cashCollected etc. are updated after each sale).
    this.cashierService.getOpenSession(this.loggedCashier?.id, this.selectedTerminalId || undefined).subscribe({
      next: (res) => {
        if (res.data) {
          this.activeSession = res.data;
          this.dataCache.set('activeSession', res.data);
          this.cdr.detectChanges();
        }
      },
      error: () => {},
    });

    // Pre-load transactions so the "Print with Invoices" option has data ready.
    this.posTransactionService.getBySession(this.activeSession.id).subscribe({
      next: (res) => { this.sessionTransactions = res.data ?? []; this.cdr.detectChanges(); },
      error: () => {},
    });
  }

  confirmEndSession(printFirst: boolean, withInvoices = false) {
    if (printFirst) this.printSessionClose(withInvoices);
    if (this.cfgPosMode !== 'Online') void this.posSync.drain();
    this.showEndSessionPanel = false;
    const sessionId = this.activeSession!.id;
    this.dataCache.set('activeSession', null);
    // Best-effort server close (offline this errors, but the session is cleared locally either way),
    // then reset the till to its login screen IN PLACE. We're already on /sales/pos, so a router
    // navigation would be a no-op — logoutPOS() switches the in-component screen back to login.
    this.cashierService.checkOut(sessionId, { closingFloat: this.closingCashAmount }).subscribe({
      next:  () => this.logoutPOS(),
      error: () => this.logoutPOS(),
    });
  }

  printSessionClose(withInvoices = false) {
    const s = this.activeSession!;
    const now = new Date();
    const fmt = (v: number) => (v ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const fmtDate = (iso: string | null) => iso ? new Date(iso).toLocaleString() : '—';
    const variance = this.sessionCashVariance;
    const varClass = variance < 0 ? 'color:#dc3545' : variance > 0 ? 'color:#27a9e3' : 'color:#28a745';
    const row = (label: string, value: string, bold = false, style = '') =>
      `<tr><td style="padding:5px 8px;color:#555;font-size:13px">${label}</td>` +
      `<td style="padding:5px 8px;text-align:right;font-variant-numeric:tabular-nums;${bold ? 'font-weight:700' : ''};${style}">${value}</td></tr>`;

    const invoiceRows = withInvoices && this.sessionTransactions.length
      ? `<hr>
<table>
  <tr><td class="section" colspan="4">Transactions</td></tr>
  <tr style="font-size:11px;font-weight:700;color:#555;border-bottom:1px solid #e2e2e2">
    <td style="padding:4px 8px">#</td>
    <td style="padding:4px 8px">Invoice / Receipt</td>
    <td style="padding:4px 8px">Time</td>
    <td style="padding:4px 8px;text-align:right">Amount</td>
  </tr>
  ${this.sessionTransactions.map((t, i) => `<tr style="font-size:12px;border-bottom:1px solid #f0f0f0">
    <td style="padding:4px 8px;color:#999">${i + 1}</td>
    <td style="padding:4px 8px">${t.receiptNumber ?? t.transactionNumber ?? '—'}</td>
    <td style="padding:4px 8px;color:#777">${t.transactionDate ? new Date(t.transactionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
    <td style="padding:4px 8px;text-align:right;font-weight:600">${fmt(t.totalAmount)}</td>
  </tr>`).join('')}
</table>`
      : '';

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Session Close Report</title>
<style>
  body{font-family:'Segoe UI',sans-serif;margin:0;padding:20px;background:#fff;color:#222}
  h2{text-align:center;margin:0 0 4px;font-size:18px}
  .sub{text-align:center;font-size:12px;color:#777;margin:0 0 16px}
  table{width:100%;border-collapse:collapse}
  .section{background:#f5f5f5;font-weight:700;font-size:12px;letter-spacing:.5px;
    text-transform:uppercase;padding:6px 8px;color:#444}
  hr{border:none;border-top:1px solid #e2e2e2;margin:12px 0}
  @media print{body{padding:8px}button{display:none}}
</style></head><body>
<h2>${this.selectedStore?.tradingName?.toUpperCase() ?? 'POS'}</h2>
<div class="sub">SESSION CLOSE REPORT (Z-REPORT)</div>
<hr>
<table>
  <tr><td class="section" colspan="2">Session Info</td></tr>
  ${row('Session', s.sessionNumber ?? '—')}
  ${row('Cashier', this.loggedCashier?.displayName ?? '—')}
  ${row('Terminal', this.terminalName(s.posTerminalId))}
  ${row('Opened', fmtDate(s.openedAt))}
  ${row('Closed', now.toLocaleString())}
</table>
<hr>
<table>
  <tr><td class="section" colspan="2">Cash Movement</td></tr>
  ${row('Opening Float (Cash In)', fmt(s.openingFloat))}
  ${row('Cash Sales Collected', fmt(s.cashCollected))}
  ${row('Expected Cash in Drawer', fmt(this.sessionExpectedCash), true)}
  ${row('Actual Closing Count (Cash Out)', fmt(this.closingCashAmount), true)}
  ${row('Variance', (variance >= 0 ? '+' : '') + fmt(variance), true, varClass)}
</table>
<hr>
<table>
  <tr><td class="section" colspan="2">Sales Summary</td></tr>
  ${row('Gross Sales', fmt(s.totalSalesAmount))}
  ${row('Discounts', '- ' + fmt(s.totalDiscountsAmount))}
  ${row('Refunds', '- ' + fmt(s.totalRefundsAmount))}
  ${row('Tax', fmt(s.totalTaxAmount))}
  ${row('Net Sales', fmt(s.netSalesAmount), true)}
</table>
<hr>
<table>
  <tr><td class="section" colspan="2">Payment Breakdown</td></tr>
  ${row('Cash', fmt(s.cashCollected))}
  ${row('Card', fmt(s.cardCollected))}
  ${row('Mobile / Wallet', fmt(s.walletCollected))}
  ${row('Other', fmt(s.otherCollected))}
  ${row('Total Collected', fmt((s.cashCollected ?? 0) + (s.cardCollected ?? 0) + (s.walletCollected ?? 0) + (s.otherCollected ?? 0)), true)}
</table>
<hr>
<table>
  ${row('Total Transactions', String(s.transactionCount ?? 0), true)}
</table>
${invoiceRows}
<div style="text-align:center;margin-top:24px;font-size:11px;color:#999">Printed ${now.toLocaleString()}</div>
</body></html>`;
    this.printHtml(html);
  }

  logoutPOS() {
    this.stopOrderPolling();
    // Clear cart/sale state first. NOTE: newSale() sets screen = 'terminal', so the login-screen
    // state below MUST be assigned AFTER it — otherwise the screen flips back to the terminal and
    // never lands on store selection.
    this.newSale();
    this.posMode = 'register';
    this.activeSession = null;
    this.loggedCashier = null;
    this.pinInput = '';
    this.showOpenSessionForm = false;
    this.selectedStore = null;
    this.loginStep = 'store';
    this.screen = 'login';
    this.cdr.detectChanges();
  }

  printReceipt() {
    const txId = this.checkoutResult?.transaction?.id;
    if (!txId) { window.print(); return; }
    this.printThermal(txId);
  }

  printAndNewSale() {
    this.printReceipt();
    this.newSale();
  }

  /**
   * Print the THERMAL receipt — the configured POS receipt template rendered at the
   * selected roll width (58/80mm). This is what a POS sale should print; the wide A4
   * HTML is only a fallback when no thermal content is available.
   */
  private printThermal(txId: string) {
    // Reuse the preview already loaded on the receipt screen when present.
    if (this.thermalReceipt?.content) {
      this.printThermalReceipt(this.thermalReceipt);
      return;
    }
    this.posTransactionService.getReceipt(txId, this.cfgPaperSize).subscribe({
      next: (res) => {
        if (res.data?.content) this.printThermalReceipt(res.data);
        else this.printTransaction(txId);
      },
      error: () => this.printTransaction(txId),
    });
  }

  private printThermalReceipt(rcpt: ThermalReceiptDto) {
    this.printHtml(this.buildThermalHtml(rcpt.content ?? '', rcpt.paperSize));
  }

  /** Wrap the monospace thermal text in a minimal page sized to the roll (58/80mm). */
  private buildThermalHtml(content: string, paperSize: string | null): string {
    const widthMm = paperSize === 'Thermal58mm' ? 58 : 80;
    const text = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Receipt</title><style>'
      + `@page{size:${widthMm}mm auto;margin:0}`
      + 'html,body{margin:0;padding:0}'
      + `body{width:${widthMm}mm}`
      + "pre{font-family:'Courier New',Consolas,monospace;font-size:12px;line-height:1.25;"
      + 'white-space:pre-wrap;word-break:break-word;margin:0;padding:6px 6px 10px}'
      + `</style></head><body><pre>${text}</pre></body></html>`;
  }

  /** A4 HTML receipt — fallback only (full-page invoice-style layout). */
  private printTransaction(txId: string) {
    this.posTransactionService.getReceiptHtml(txId).subscribe({
      next: (html) => this.printHtml(html),
      error: () => window.print(),
    });
  }

  // ── Printer / receipt settings ──────────────────────────────────────────────────
  private loadSettings() {
    try {
      const raw = localStorage.getItem(this.SETTINGS_KEY);
      if (raw) this.posSettings = { ...this.posSettings, ...JSON.parse(raw) };
    } catch { /* ignore corrupt settings */ }
  }

  /** Load backend POS configuration once on init; silently continues on error. */
  private loadPosConfig() {
    this.posSettingsService.getSettings().subscribe({
      next: (res) => {
        this.posConfig = res.data ?? null;
        if (this.posConfig) this.dataCache.set('posConfig', this.posConfig);
        // If operating in an offline mode with an active session, ensure local data is ready.
        if (this.cfgPosMode !== 'Online' && this.activeSession) {
          this.maybeSnapshotOnSession();
        }
        this.cdr.detectChanges();
      },
      error: () => this.restoreFromCache<any>('posConfig', v => { if (v) this.posConfig = v; }),
    });
  }

  // ── Computed POS config shortcuts (all fall back to safe defaults when null) ────
  get cfgAllowDiscount(): boolean       { return this.posConfig?.allowDiscount      ?? true; }
  get cfgMaxDiscountPercent(): number   { return this.posConfig?.maxDiscountPercent ?? 100; }
  get cfgAllowPriceOverride(): boolean  { return this.posConfig?.allowPriceOverride ?? true; }
  get cfgAllowSplitPayment(): boolean   { return this.posConfig?.allowSplitPayment  ?? true; }
  get cfgAllowPartialPayment(): boolean { return this.posConfig?.allowPartialPayment ?? false; }
  get cfgRequireCustomer(): boolean     { return this.posConfig?.requireCustomer    ?? false; }
  get cfgEnableCoupons(): boolean       { return this.posConfig?.enableCoupons      ?? true; }
  get cfgEnablePromotions(): boolean    { return this.posConfig?.enablePromotions   ?? true; }
  get cfgShowNumpad(): boolean          { return this.posConfig?.showNumpad         ?? true; }
  get cfgShowCategoryFilter(): boolean  { return this.posConfig?.showCategoryFilter ?? true; }
  get cfgAllowDecimalQty(): boolean     { return this.posConfig?.allowDecimalQuantity ?? true; }
  get cfgRequireOpeningFloat(): boolean { return this.posConfig?.requireOpeningFloat ?? false; }
  get cfgRequireCashCount(): boolean    { return this.posConfig?.requireCashCountOnClose ?? false; }
  get cfgCurrencyCode(): string         { return this.posConfig?.defaultCurrencyCode      ?? 'USD'; }

  /** Effective paper size: prefers backend config, falls back to local setting. */
  private get cfgPaperSize(): string {
    if (this.posConfig?.defaultPaperSize) return this.posConfig.defaultPaperSize;
    return this.posSettings.paperSize === '58mm' ? 'Thermal58mm' : 'Thermal80mm';
  }

  private get cfgAutoPrint(): boolean {
    return this.posConfig?.autoPrintReceipt ?? this.posSettings.autoPrint;
  }

  private get cfgSkipReceiptScreen(): boolean {
    return this.posConfig?.skipReceiptScreen ?? this.posSettings.skipReceiptScreen;
  }

  openSettings() {
    this.showSideMenu = false;
    this.showSettingsPanel = true;
    this.cdr.detectChanges();
  }

  closeSettings() {
    this.showSettingsPanel = false;
    this.cdr.detectChanges();
  }

  saveSettings() {
    try { localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(this.posSettings)); } catch { /* storage full / blocked */ }
    this.showSettingsPanel = false;
    this.showToast('POS settings saved.');
    this.cdr.detectChanges();
  }

  private printHtml(html: string) {
    // Print through a hidden iframe rather than a popup window. A popup opened after the async
    // checkout (not a direct click) is often blocked by the browser, which then fell back to
    // printing the whole POS page. An iframe is never popup-blocked and nothing flashes on screen.
    //
    // NOTE: the browser still shows its native print dialog for every print() UNLESS it is launched
    // in kiosk-printing mode (Chrome/Edge: --kiosk-printing). That browser flag — not app code — is
    // what makes auto-print truly silent; JavaScript cannot suppress the print dialog on its own.
    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
    document.body.appendChild(iframe);

    const win = iframe.contentWindow;
    const doc = win?.document;
    if (!win || !doc) { iframe.remove(); window.print(); return; }

    doc.open();
    doc.write(html);
    doc.close();

    let printed = false;
    const run = () => {
      if (printed) return;
      printed = true;
      try { win.focus(); win.print(); } catch { /* user can print manually */ }
      setTimeout(() => iframe.remove(), 1000);
    };
    win.onload = () => setTimeout(run, 150);  // fires once the receipt HTML has laid out
    setTimeout(run, 600);                      // safety net if onload never fires
  }

  // ── Search ────────────────────────────────────────────────────────────────────
  get searchResults(): any[] {
    if (!this.searchQuery) return [];
    const q = this.searchQuery.toLowerCase();
    return this.menuItems.filter(i =>
      (i.name ?? '').toLowerCase().includes(q) ||
      (i.code ?? '').toLowerCase().includes(q) ||
      (i.barcodes ?? []).some(b => (b.barcode ?? '').toLowerCase().includes(q))
    );
  }

  /** On a failed load (offline / server unreachable), fall back to the cached snapshot. */
  private async restoreFromCache<T>(key: string, apply: (value: T | null) => void) {
    const cached = await this.dataCache.get<T>(key);
    apply(cached);
    this.cdr.detectChanges();
  }

  /**
   * Fetch ALL active items by paging through the catalog. The API caps PageSize
   * at 100, so a single call only returns the first page — the POS needs every
   * item, so we loop until the catalog is exhausted.
   */
  private async fetchAllActiveItems(): Promise<ItemDto[]> {
    const pageSize = 100;
    const all: ItemDto[] = [];
    let page = 1;
    // Hard cap as a safety net against a misbehaving total/page meta.
    for (let guard = 0; guard < 1000; guard++) {
      const res = await firstValueFrom(
        this.itemService.getActivePaged({ pageNumber: page, pageSize })
      );
      const batch = res?.data ?? [];
      all.push(...batch);

      const total = res?.pagination?.totalCount ?? res?.totalCount;
      const totalPages = res?.pagination?.totalPages ?? res?.totalPages;
      const reachedTotal = total != null && all.length >= total;
      const reachedLastPage = totalPages != null && page >= totalPages;
      // A short page means there is nothing left to fetch.
      if (batch.length < pageSize || reachedTotal || reachedLastPage) break;
      page++;
    }
    // Raw materials (ingredients like flour, cheese, sauce) are consumed in
    // production — they are never sold at the till, so keep them out of the POS.
    return all.filter(i => (i.itemType ?? '') !== 'RawMaterial');
  }

  /**
   * Category tabs for the product picker — only categories that actually contain
   * a sellable (loaded) product, so empty/back-office categories like Raw Materials
   * don't appear at the till.
   */
  get posCategories(): ItemCategoryDto[] {
    const withItems = new Set(this.menuItems.map(i => i.categoryId).filter(Boolean));
    return this.categories.filter(c => withItems.has(c.id));
  }

  loadInventoryItems() {
    this.menuLoading = true;
    this.fetchAllActiveItems()
      .then((items) => {
        this.menuItems = items;
        this.menuLoading = false;
        this.dataCache.set('menuItems', this.menuItems);   // snapshot for offline use
        this.lastKnownSignature = this.catalogSignature(this.menuItems);
        this.cdr.detectChanges();
      })
      .catch(() => this.restoreFromCache<ItemDto[]>('menuItems', v => {
        if (v) this.menuItems = v;
        this.menuLoading = false;
      }));
  }

  /** Add the top search match to the cart (Enter key in the search box). */
  addFirstSearchResult() {
    const idx = this.searchHighlightIndex >= 0 && this.searchHighlightIndex < this.searchResults.length
      ? this.searchHighlightIndex : 0;
    const item = this.searchResults[idx];
    if (!item) return;
    this.addItem(item);
    this.searchQuery = '';
    this.searchHighlightIndex = -1;
    this.showSearch = false;
    this.cdr.detectChanges();
  }

  searchArrowDown(e: Event) {
    (e as KeyboardEvent).preventDefault();
    const max = this.searchResults.length - 1;
    this.searchHighlightIndex = Math.min(this.searchHighlightIndex + 1, max);
    this.cdr.detectChanges();
    this.scrollSearchRowIntoView();
  }

  searchArrowUp(e: Event) {
    (e as KeyboardEvent).preventDefault();
    this.searchHighlightIndex = Math.max(this.searchHighlightIndex - 1, -1);
    this.cdr.detectChanges();
    this.scrollSearchRowIntoView();
  }

  private scrollSearchRowIntoView() {
    setTimeout(() => {
      const rows = document.querySelectorAll('.search-drop .search-row');
      (rows[this.searchHighlightIndex] as HTMLElement | undefined)
        ?.scrollIntoView({ block: 'nearest' });
    }, 0);
  }

  // ── Product picker grid (Odoo-style popup) ──────────────────────────────────────
  loadCategories() {
    this.categoryService.getActive().subscribe({
      next: (res) => {
        this.categories = res.data ?? [];
        this.dataCache.set('categories', this.categories);
        this.cdr.detectChanges();
      },
      error: () => this.restoreFromCache<ItemCategoryDto[]>('categories', v => { if (v) this.categories = v; }),
    });
  }

  openProductGrid() {
    this.showProductGrid = true;
    this.selectedCategoryId = '';
    this.gridSearch = '';
    this.gridPage = 1;
    this.cdr.detectChanges();
    this.focusEl('gridSearchInput');
  }

  closeProductGrid() {
    this.showProductGrid = false;
    this.cdr.detectChanges();
    this.focusSearch();
  }

  selectCategory(id: string) {
    this.selectedCategoryId = id;
    this.gridPage = 1;
    this.cdr.detectChanges();
  }

  /** Products filtered by the selected category and the in-grid search box (full list). */
  private filteredGridProducts(): ItemDto[] {
    let list = this.menuItems;
    if (this.selectedCategoryId) list = list.filter(i => i.categoryId === this.selectedCategoryId);
    const q = this.gridSearch.trim().toLowerCase();
    if (q) list = list.filter(i =>
      (i.name ?? '').toLowerCase().includes(q) ||
      (i.code ?? '').toLowerCase().includes(q) ||
      (i.barcodes ?? []).some(b => (b.barcode ?? '').toLowerCase().includes(q))
    );
    return list;
  }

  /** Number of products matching the current filters (across all pages). */
  get gridTotalCount(): number {
    return this.filteredGridProducts().length;
  }

  /** Total number of pages for the current filters. */
  get gridTotalPages(): number {
    return Math.max(1, Math.ceil(this.gridTotalCount / this.gridPageSize));
  }

  /** Range label, e.g. "1–24 of 369". */
  get gridRangeLabel(): string {
    const total = this.gridTotalCount;
    if (total === 0) return '0 of 0';
    const start = (this.gridPage - 1) * this.gridPageSize + 1;
    const end = Math.min(this.gridPage * this.gridPageSize, total);
    return `${start}–${end} of ${total}`;
  }

  /** The current page of products shown in the grid. */
  get gridProducts(): ItemDto[] {
    const list = this.filteredGridProducts();
    const start = (this.gridPage - 1) * this.gridPageSize;
    return list.slice(start, start + this.gridPageSize);
  }

  /** Reset to the first page — call whenever the filter (search/category) changes. */
  resetGridPage() {
    this.gridPage = 1;
    this.cdr.detectChanges();
  }

  gridPrevPage() {
    if (this.gridPage > 1) { this.gridPage--; this.cdr.detectChanges(); }
  }

  gridNextPage() {
    if (this.gridPage < this.gridTotalPages) { this.gridPage++; this.cdr.detectChanges(); }
  }

  onGridPageSizeChange(e: Event) {
    this.gridPageSize = +(e.target as HTMLSelectElement).value;
    this.gridPage = 1;
    this.cdr.detectChanges();
  }

  /** Pick a product from the grid: add it to the cart and close the popup. */
  pickProduct(item: ItemDto) {
    this.addItem(item);
    this.showToast(`${item.name ?? 'Item'} added`);
    this.showProductGrid = false;
    this.cdr.detectChanges();
  }

  itemImage(item: ItemDto): string | null {
    const url = item.images?.[0]?.url;
    if (!url) return null;
    // Image URLs are stored relative to the API (served from /images/products/...).
    // Resolve them against the API origin, otherwise they 404 against the web app's origin.
    return url.startsWith('/') ? environment.apiBaseUrl + url : url;
  }

  itemPrice(item: ItemDto): number {
    const p = item.prices?.find(x => x.isActive) ?? item.prices?.[0];
    return p?.salePrice ?? 0;
  }

  // ── Customer / contact selection ───────────────────────────────────────────────
  loadContacts() {
    this.contactsLoading = true;
    this.contactService.getAll({ pageSize: 500 }).subscribe({
      next: (res) => {
        this.contacts = res.data ?? [];
        if (!this.contactId) this.selectWalkIn();
        this.contactsLoading = false;
        this.dataCache.set('contacts', this.contacts);
        this.cdr.detectChanges();
      },
      error: () => this.restoreFromCache<ContactDto[]>('contacts', v => {
        if (v) { this.contacts = v; if (!this.contactId) this.selectWalkIn(); }
        this.contactsLoading = false;
      }),
    });
  }

  private get walkInContact(): ContactDto | undefined {
    return this.contacts.find(c => c.isAnonymous) ?? this.contacts.find(c =>
      (c.firstName ?? '').toLowerCase() === 'walk-in' && (c.lastName ?? '').toLowerCase() === 'customer');
  }

  private selectWalkIn() {
    const wi = this.walkInContact;
    if (wi) this.onContactSelect(wi.id);
  }

  contactLabel(c: ContactDto): string {
    const name = `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim();
    return (name || c.accountName || c.email || 'Unnamed') + (name && c.accountName ? ` — ${c.accountName}` : '');
  }

  get filteredContacts(): ContactDto[] {
    const q = this.customerSearch.trim().toLowerCase();
    if (!q) return this.contacts;
    return this.contacts.filter(c => {
      const name = `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim().toLowerCase();
      return name.includes(q) ||
        (c.accountName ?? '').toLowerCase().includes(q) ||
        (c.email ?? '').toLowerCase().includes(q) ||
        (c.phone ?? '').toLowerCase().includes(q);
    });
  }

  onContactSelect(id: string) {
    this.contactId = id;
    const c = this.contacts.find(x => x.id === id);
    this.customerName = c ? this.contactLabel(c) : '';
    this.requestQuote();
    this.cdr.detectChanges();
  }

  selectedStoreName(): string { return this.selectedStore?.tradingName ?? this.loggedUser?.branchName ?? 'POS'; }

  // ── Online Orders ──────────────────────────────────────────────────────────────

  get pendingOnlineOrderCount(): number {
    return this.onlineOrders.filter(o => {
      const s = this.normOoStatus(o.status).toLowerCase();
      return ['placed', 'pendinnapproval', 'approved'].includes(s);
    }).length;
  }

  setPosMode(mode: 'register' | 'online-orders') {
    this.posMode = mode;
    if (mode === 'online-orders') this.fetchOnlineOrders();
    this.cdr.detectChanges();
  }

  startOrderPolling() {
    if (!this.selectedStore?.isOnlineOrderingEnabled) return;
    this.stopOrderPolling();
    this.firstPoll = true;
    this.fetchOnlineOrders();
    this.pollTimer = setInterval(() => this.fetchOnlineOrders(), 30000);
  }

  stopOrderPolling() {
    if (this.pollTimer) { clearInterval(this.pollTimer); this.pollTimer = null; }
    this.knownOrderIds.clear();
    this.firstPoll = true;
    this.onlineOrders = [];
  }

  fetchOnlineOrders() {
    if (!this.selectedStore?.isOnlineOrderingEnabled || !this.selectedStore?.id) return;
    this.onlineOrdersLoading = true;
    this.cdr.detectChanges();
    this.orderService.storeQueue(this.selectedStore.id).subscribe({
      next: (res) => {
        const terminal = ['delivered', 'rejected', 'cancelled', 'draft', 'paid', 'invoiced', 'closed', 'returned', 'refunded'];
        const orders = (res.data ?? []).filter(o => !terminal.includes(this.normOoStatus(o.status).toLowerCase()));
        if (!this.firstPoll) {
          const newOnes = orders.filter(o => !this.knownOrderIds.has(o.id));
          if (newOnes.length) {
            this.playOrderAlert();
            this.showToast(`${newOnes.length} new order${newOnes.length > 1 ? 's' : ''} received!`);
          }
        }
        this.firstPoll = false;
        this.knownOrderIds = new Set(orders.map(o => o.id));
        this.onlineOrders = orders;
        this.onlineOrdersLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.onlineOrdersLoading = false; this.cdr.detectChanges(); },
    });
  }

  private playOrderAlert() {
    try {
      const AudioCtx = (window as any).AudioContext ?? (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx() as AudioContext;
      const note = (freq: number, start: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.4, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + dur + 0.1);
      };
      note(784, 0,   0.25);   // G5
      note(659, 0.3, 0.25);   // E5
      note(523, 0.6, 0.45);   // C5
    } catch { /* audio not available */ }
  }

  normOoStatus(status: any): string {
    const n = typeof status === 'number' ? status : parseInt(String(status ?? ''), 10);
    const map: Record<number, string> = {
      0: 'Draft', 1: 'Placed', 2: 'PendingApproval', 3: 'Approved', 4: 'Confirmed',
      5: 'Processing', 6: 'ReadyForPickup', 7: 'Shipped', 8: 'OutForDelivery',
      9: 'Delivered', 10: 'PartiallyDelivered', 14: 'OnHold', 15: 'Rejected', 16: 'Cancelled',
    };
    return !isNaN(n) ? (map[n] ?? String(status)) : String(status ?? '');
  }

  ooStatusClass(status: any): string {
    const s = this.normOoStatus(status).toLowerCase();
    if (s === 'placed') return 'oo-s-new';
    if (['pendinnapproval', 'approved', 'confirmed', 'processing'].includes(s)) return 'oo-s-processing';
    if (s === 'readyforpickup') return 'oo-s-ready';
    if (['shipped', 'outfordelivery'].includes(s)) return 'oo-s-delivery';
    if (['rejected', 'cancelled'].includes(s)) return 'oo-s-rejected';
    return 'oo-s-default';
  }

  ooStatusLabel(status: any): string {
    const map: Record<string, string> = {
      Placed: 'New', PendingApproval: 'Pending', Approved: 'Approved',
      Confirmed: 'Confirmed', Processing: 'Preparing',
      ReadyForPickup: 'Ready', Shipped: 'Shipped', OutForDelivery: 'On the way',
    };
    return map[this.normOoStatus(status)] ?? this.normOoStatus(status);
  }

  orderAge(order: SalesOrderDto): string {
    const dt = order.placedAt ?? order.orderDate;
    if (!dt) return '';
    const mins = Math.floor((Date.now() - new Date(dt).getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
  }

  acceptOrder(order: SalesOrderDto) {
    this.orderService.updateStatus(order.id, { status: 'Processing' }).subscribe({
      next: () => { this.showToast(`Order #${order.orderNumber ?? ''} accepted`); this.fetchOnlineOrders(); },
      error: () => this.showToast('Failed to accept order.'),
    });
  }

  markReady(order: SalesOrderDto) {
    this.orderService.updateStatus(order.id, { status: 'ReadyForPickup' }).subscribe({
      next: () => { this.showToast(`Order #${order.orderNumber ?? ''} ready for pickup`); this.fetchOnlineOrders(); },
      error: () => this.showToast('Failed to update order.'),
    });
  }

  markDelivered(order: SalesOrderDto) {
    this.orderService.updateStatus(order.id, { status: 'Delivered' }).subscribe({
      next: () => { this.showToast(`Order #${order.orderNumber ?? ''} delivered`); this.fetchOnlineOrders(); },
      error: () => this.showToast('Failed to update order.'),
    });
  }

  startReject(order: SalesOrderDto) {
    this.rejectingOrderId = order.id;
    this.rejectNote = '';
    this.cdr.detectChanges();
  }

  cancelReject() {
    this.rejectingOrderId = null;
    this.rejectNote = '';
    this.cdr.detectChanges();
  }

  confirmReject(order: SalesOrderDto) {
    this.orderService.updateStatus(order.id, { status: 'Rejected', note: this.rejectNote || null }).subscribe({
      next: () => {
        this.showToast(`Order #${order.orderNumber ?? ''} rejected`);
        this.rejectingOrderId = null;
        this.rejectNote = '';
        this.fetchOnlineOrders();
      },
      error: () => this.showToast('Failed to reject order.'),
    });
  }

  showContactInfo(order: SalesOrderDto) {
    this.contactInfoOrder = order;
    this.cdr.detectChanges();
  }

  closeContactInfo() {
    this.contactInfoOrder = null;
    this.cdr.detectChanges();
  }

  contactPhone(order: SalesOrderDto): string {
    return this.contacts.find(c => c.id === order.contactId)?.phone ?? '';
  }

  contactEmail(order: SalesOrderDto): string {
    return this.contacts.find(c => c.id === order.contactId)?.email ?? '';
  }

  openCashDrawerFromMenu() {
    this.showSideMenu = false;
    this.showCashDrawer = true;
  }

  // ── Session sales / X-report ──────────────────────────────────────────────────
  get sessionReportTotal(): number {
    return this.sessionTransactions.reduce((s, t) => s + (t.totalAmount || 0), 0);
  }

  openSessionReport() {
    this.showSideMenu = false;
    this.sessionTransactions = [];
    if (!this.activeSession?.id) { this.showToast('No active session.'); return; }
    this.showSessionReport = true;
    this.sessionReportLoading = true;
    this.posTransactionService.getBySession(this.activeSession.id).subscribe({
      next: (res) => {
        this.sessionTransactions = res.data ?? [];
        this.sessionReportLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.sessionReportLoading = false;
        this.showToast('Could not load session sales.');
        this.cdr.detectChanges();
      },
    });
  }

  // ── Sales history ──────────────────────────────────────────────────────────────
  openSalesHistory() {
    this.showSideMenu = false;
    this.selectedDocument = null;
    this.docSearch = '';
    // Default to today; the cashier can widen the range with the date pickers.
    const todayStr = this.toDateInput(new Date());
    this.historyFrom = todayStr;
    this.historyTo = todayStr;
    this.showAllUsers = false;
    this.showSalesHistory = true;
    this.loadSalesHistory();
  }

  closeSalesHistory() {
    this.showSalesHistory = false;
    this.selectedDocument = null;
    this.cdr.detectChanges();
  }

  /** yyyy-MM-dd for a <input type="date"> value, in local time. */
  private toDateInput(d: Date): string {
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }

  loadSalesHistory() {
    this.salesDocuments = [];
    if (!this.historyFrom) this.historyFrom = this.toDateInput(new Date());
    // The by-date endpoint takes inclusive UTC bounds; treat the picked days as
    // whole UTC days so the documented from/to range maps 1:1 to the pickers.
    const fromUtc = `${this.historyFrom}T00:00:00.000Z`;
    const toUtc = this.historyTo ? `${this.historyTo}T23:59:59.999Z` : undefined;
    if (toUtc && this.historyTo < this.historyFrom) {
      this.showToast('“To” date is before “From” date.');
      return;
    }
    this.salesHistoryLoading = true;
    this.cdr.detectChanges();
    this.posTransactionService.getByDateRange(fromUtc, toUtc).subscribe({
      next: (res) => {
        this.salesDocuments = (res.data ?? []).sort(
          (a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime(),
        );
        this.salesHistoryLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.salesHistoryLoading = false;
        this.showToast('Could not load sales history.');
        this.cdr.detectChanges();
      },
    });
  }

  get filteredDocuments(): PosTransactionDto[] {
    let docs = this.salesDocuments;
    // The endpoint returns every cashier in the branch; scope to the signed-in
    // cashier unless "Show all users" is on.
    if (!this.showAllUsers && this.loggedCashier?.id) {
      docs = docs.filter(d => d.posCashierId === this.loggedCashier!.id);
    }
    const q = this.docSearch.trim().toLowerCase();
    if (!q) return docs;
    return docs.filter(d =>
      (d.receiptNumber ?? '').toLowerCase().includes(q) ||
      (d.transactionNumber ?? '').toLowerCase().includes(q) ||
      (this.documentCustomer(d) ?? '').toLowerCase().includes(q),
    );
  }

  get salesHistoryTotal(): number {
    return this.filteredDocuments.reduce((s, d) => s + (d.totalAmount || 0), 0);
  }

  selectDocument(doc: PosTransactionDto) {
    this.selectedDocument = doc;
    // The list payload may omit line detail — fetch the full transaction so the
    // Document items table is populated.
    if (!doc.lines || doc.lines.length === 0) {
      this.documentLoading = true;
      this.cdr.detectChanges();
      this.posTransactionService.getById(doc.id).subscribe({
        next: (res) => {
          if (res.data) {
            this.selectedDocument = res.data;
            // keep the list row in sync so we don't refetch next time
            const i = this.salesDocuments.findIndex(d => d.id === res.data!.id);
            if (i >= 0) this.salesDocuments[i] = res.data;
          }
          this.documentLoading = false;
          this.cdr.detectChanges();
        },
        error: () => { this.documentLoading = false; this.cdr.detectChanges(); },
      });
    } else {
      this.cdr.detectChanges();
    }
  }

  documentCustomer(doc: PosTransactionDto): string {
    const c = this.contacts.find(x => x.id === doc.contactId);
    return c ? this.contactLabel(c) : '';
  }

  documentTypeLabel(type: number | string): string {
    const map: Record<number, string> = { 0: 'Sale', 1: 'Refund', 2: 'Void', 3: 'NoSale', 4: 'PayIn', 5: 'PayOut' };
    const n = typeof type === 'number' ? type : parseInt(String(type), 10);
    return !isNaN(n) ? (map[n] ?? String(type)) : String(type ?? '');
  }

  documentPaymentLabel(doc: PosTransactionDto): string {
    const pays = doc.payments ?? [];
    if (pays.length === 0) return '—';
    if (pays.length > 1) return 'Split';
    return PosTenderType[pays[0].tenderType as number] ?? String(pays[0].tenderType);
  }

  /** Gross (pre-discount) line value for the Document items table. */
  lineGross(line: PosTransactionLineDto): number {
    return (line.unitPrice || 0) * (line.quantity || 0);
  }

  printDocument(doc: PosTransactionDto) {
    this.posTransactionService.getReceiptHtml(doc.id).subscribe({
      next: (html) => this.printHtml(html),
      error: () => this.showToast('Could not load receipt.'),
    });
  }

  saveDocumentPdf(doc: PosTransactionDto) {
    this.posTransactionService.getReceiptPdf(doc.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${doc.receiptNumber ?? doc.transactionNumber ?? doc.id}.pdf`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      },
      error: () => this.showToast('Could not generate PDF.'),
    });
  }

  /**
   * Refund a past sale by issuing a full credit note against its invoice.
   * POS transactions settle into a SalesInvoice, so we resolve the invoice from
   * the document's order, then post the credit note (the system's refund path).
   */
  refundDocument(doc: PosTransactionDto) {
    if (!doc.salesOrderId) { this.showToast('This document has no order to refund.'); return; }
    const label = doc.receiptNumber ?? doc.transactionNumber ?? 'this sale';
    this.openConfirm('Refund', `Refund ${label} in full?`, 'Refund', true, () => {
      this.invoiceService.byOrder(doc.salesOrderId!).subscribe({
      next: (res) => {
        const invoice = (res.data ?? [])[0];
        if (!invoice) { this.showToast('No invoice found for this sale.'); return; }
        this.invoiceService.creditNote(invoice.id, {
          reason: 'POS refund',
          creditNoteDate: new Date().toISOString().split('T')[0],
          fullReversal: true,
          notes: null,
        }).subscribe({
          next: (cn) => {
            this.showToast(`Refunded — credit note ${cn.data?.creditNoteNumber ?? ''}`);
            this.loadSalesHistory();
          },
          error: () => this.showToast('Refund failed.'),
        });
      },
      error: () => this.showToast('Could not load the invoice to refund.'),
      });
    });
  }

  /**
   * Lock the POS — returns to the PIN screen WITHOUT closing the session.
   * The session stays open on the server so the cashier can resume by
   * re-entering their PIN (checkExistingSession detects it and skips
   * the opening-float form entirely).
   */
  lockPOS() {
    this.showSideMenu = false;
    this.discardPendingOrder();
    // Clear local cashier state only — do NOT call checkOut().
    this.loggedCashier = null;
    this.activeSession = null;
    this.pinInput = '';
    this.showOpenSessionForm = false;
    this.cart = [];
    this.selectedCartIndex = -1;
    this.appliedCoupon = null;
    this.couponCode = '';
    this.customerName = '';
    this.contactId = '';
    this.orderNotes = '';
    this.numpadBuffer = '';
    this.cartDiscountValue = 0;
    this.cartDiscountType = 'Percentage';
    this.stopOrderPolling();
    this.closeAllPanels();
    // Keep selectedStore — cashier goes straight to PIN step, not store selection.
    this.loginStep = 'pin';
    this.screen = 'login';
    this.cdr.detectChanges();
  }

  /** @deprecated use lockPOS() for lock / switch-cashier; endSession() for true sign-out */
  signOut() { this.lockPOS(); }

  endOfDay() {
    this.showSideMenu = false;
    if (!this.activeSession) { this.logoutPOS(); return; }
    this.openConfirm(
      'End of Day',
      'Close the current session and return to the login screen?',
      'End of Day',
      false,
      () => {
        this.cashierService.checkOut(this.activeSession!.id, { closingFloat: 0 }).subscribe({
          next:  () => this.logoutPOS(),
          error: () => this.logoutPOS(),
        });
      }
    );
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  terminalName(id: string): string {
    const t = this.terminals.find(x => x.id === id);
    return t ? (t.terminalName ?? t.terminalCode ?? id) : id;
  }
}
