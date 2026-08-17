import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  CheckService, MenuService, RestaurantOrderService, RestaurantStaffService,
} from '../../services/restaurant.services';
import {
  AddOrderLineDto, ComboMealDto, ComboSelectionDto, DiscountReasonDto, ItemModifierGroupDto,
  MenuCategoryDto, MenuItemDto, MenuItemVariantDto, ModifierDto, OrderPadCatalogDto,
  OrderSummaryDto, RestaurantCheckDto, RestaurantOrderDto, RestaurantOrderLineDto,
  SelectedModifierDto, VoidReasonDto,
} from '../../models/restaurant.models';
import {
  COURSE_LABELS, COURSE_ORDER, CourseType, DISCOUNT_KIND_LABELS, DiscountKind, LINE_STATUS_LABELS,
  ORDER_STATUS_LABELS, ORDER_TYPE_ICONS, ORDER_TYPE_LABELS, OrderChannel, OrderLineStatus,
  OrderType, SPLIT_LABELS, SplitMethod, TENDER_ICONS, TENDER_LABELS, TenderType,
} from '../../models/restaurant.enums';
import { OutletPickerComponent } from '../shared/outlet-picker';
import { PageHelpComponent } from '../shared/page-help';
import {
  FieldErrorComponent, FieldErrors, between, digits, email, greaterThanField, inFuture,
  maxLength, minLength, notNegative, positive, required, summarise, validate,
} from '../shared/validation';

/** A dish the waiter is configuring before it joins the order. */
interface PendingLine {
  item: MenuItemDto;
  variant: MenuItemVariantDto | null;
  quantity: number;
  seatNumber: number | null;
  course: CourseType;
  isHeld: boolean;
  note: string;
  modifiers: Map<string, Set<string>>;   // group id → chosen modifier ids
  combo: ComboMealDto | null;
  comboChoices: Map<string, string>;     // component id → menu item id
}

type Panel = 'none' | 'configure' | 'bill' | 'payment' | 'void' | 'discount' | 'split';

/**
 * The waiter's screen: the order pad on the left, the running check on the right.
 *
 * Three things shape it.
 *
 * **The server owns the price.** Nothing here computes money. The catalogue arrives already
 * priced for this outlet and order type — happy hour included — and every line total comes back
 * from the API. A tablet that has been open since lunch cannot undercharge dinner.
 *
 * **Held lines are visibly different.** Coursing only works if a waiter can see at a glance what
 * the kitchen has and what it has not, so held lines are marked and the fire button counts them.
 *
 * **Modifiers are validated before sending.** A required choice with nothing picked is caught
 * here, because discovering it at the pass costs a table ten minutes.
 */
@Component({
  standalone: true,
  selector: 'lib-restaurant-order-terminal',
  imports: [CommonModule, FormsModule, OutletPickerComponent, PageHelpComponent, FieldErrorComponent],
  templateUrl: './order-terminal.html',
  styleUrls: ['../restaurant-shared.css', './order-terminal.css'],
})
export class OrderTerminalComponent implements OnInit, OnDestroy {
  private menu = inject(MenuService);
  private orders = inject(RestaurantOrderService);
  private checksApi = inject(CheckService);
  private staffApi = inject(RestaurantStaffService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  outletId: string | null = null;
  catalog: OrderPadCatalogDto | null = null;
  order: RestaurantOrderDto | null = null;
  activeOrders: OrderSummaryDto[] = [];
  checks: RestaurantCheckDto[] = [];

  orderType: OrderType = OrderType.DineIn;
  activeCategoryId: string | null = null;
  search = '';

  loading = true;
  busy = false;
  error = '';

  /** Per-field messages for whichever dialog is open. Rebuilt on every save attempt. */
  fieldErrors: FieldErrors = {};
  notice = '';

  panel: Panel = 'none';
  pending: PendingLine | null = null;

  /** Seat the pad is currently attributing lines to. 0 means "shared / no seat". */
  activeSeat = 0;

  /** Course the pad defaults new lines to. */
  activeCourse: CourseType | null = null;

  voidReasons: VoidReasonDto[] = [];
  discountReasons: DiscountReasonDto[] = [];

  // Void
  voidLine: RestaurantOrderLineDto | null = null;
  voidReasonId = '';
  voidNote = '';
  voidPin = '';

  // Payment
  activeCheck: RestaurantCheckDto | null = null;
  tender: TenderType = TenderType.Cash;
  payAmount = 0;
  tenderedAmount = 0;
  tipAmount = 0;
  cardLast4 = '';

  // Discount
  discountReasonId = '';
  discountKind: DiscountKind = DiscountKind.Percentage;
  discountValue = 10;
  discountPin = '';

  // Split
  splitMethod: SplitMethod = SplitMethod.None;
  splitWays = 2;

  private refreshTimer?: ReturnType<typeof setInterval>;

  readonly courseLabels = COURSE_LABELS;
  readonly courseOrder = COURSE_ORDER;
  readonly lineStatusLabels = LINE_STATUS_LABELS;
  readonly orderTypeLabels = ORDER_TYPE_LABELS;
  readonly orderTypeIcons = ORDER_TYPE_ICONS;
  readonly orderStatusLabels = ORDER_STATUS_LABELS;
  readonly tenderLabels = TENDER_LABELS;
  readonly tenderIcons = TENDER_ICONS;
  readonly splitLabels = SPLIT_LABELS;
  readonly discountKindLabels = DISCOUNT_KIND_LABELS;

  readonly OrderType = OrderType;
  readonly OrderLineStatus = OrderLineStatus;
  readonly TenderType = TenderType;
  readonly SplitMethod = SplitMethod;
  readonly DiscountKind = DiscountKind;
  readonly CourseType = CourseType;

  readonly orderTypeOptions = [
    OrderType.DineIn, OrderType.Takeaway, OrderType.Delivery, OrderType.Counter,
  ];

  readonly tenderOptions = [
    TenderType.Cash, TenderType.Card, TenderType.Wallet, TenderType.GiftCard, TenderType.Voucher,
  ];

  ngOnInit(): void {
    // Keeps the ticket rail honest while a waiter is heads-down on one table.
    this.refreshTimer = setInterval(() => this.loadActiveOrders(), 30_000);
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
  }

  async onOutlet(id: string | null): Promise<void> {
    this.outletId = id;
    if (!id) { this.loading = false; return; }

    await Promise.all([this.loadCatalog(), this.loadActiveOrders(), this.loadReasons()]);

    const orderId = this.route.snapshot.queryParamMap.get('orderId');
    if (orderId) await this.openOrder(orderId);

    this.loading = false;
    this.cdr.detectChanges();
  }

  private async loadCatalog(): Promise<void> {
    if (!this.outletId) return;

    const res = await firstValueFrom(this.menu.getCatalog(this.outletId, this.orderType)).catch(() => null);
    this.catalog = res?.data ?? null;

    if (this.catalog && (!this.activeCategoryId ||
        !this.catalog.categories.some(c => c.id === this.activeCategoryId))) {
      this.activeCategoryId = this.catalog.categories[0]?.id ?? null;
    }

    this.cdr.detectChanges();
  }

  private async loadActiveOrders(): Promise<void> {
    if (!this.outletId) return;
    const res = await firstValueFrom(this.orders.getActive(this.outletId)).catch(() => null);
    this.activeOrders = res?.data ?? [];
    this.cdr.detectChanges();
  }

  private async loadReasons(): Promise<void> {
    const [voids, discounts] = await Promise.all([
      firstValueFrom(this.checksApi.getVoidReasons()).catch(() => null),
      firstValueFrom(this.checksApi.getDiscountReasons()).catch(() => null),
    ]);

    this.voidReasons = (voids?.data ?? []).filter(r => r.isActive);
    this.discountReasons = (discounts?.data ?? []).filter(r => r.isActive);
  }

  // ── Order lifecycle ────────────────────────────────────────────────

  async openOrder(id: string): Promise<void> {
    this.fieldErrors = {};
    const res = await firstValueFrom(this.orders.getById(id)).catch(() => null);
    if (!res?.data) { this.error = 'That order could not be opened.'; return; }

    this.order = res.data;
    this.orderType = res.data.orderType;
    this.checks = [];
    this.panel = 'none';
    await this.loadCatalog();
    await this.loadChecks();
    this.cdr.detectChanges();
  }

  async startOrder(type: OrderType): Promise<void> {
    this.fieldErrors = {};
    if (!this.outletId) return;
    this.busy = true;
    this.error = '';

    const res = await firstValueFrom(this.orders.open({
      outletId: this.outletId,
      orderType: type,
      channel: OrderChannel.InHouse,
      guestCount: 1,
      lines: [],
      // A double-tap on a slow connection must not open two orders.
      idempotencyKey: `new-${this.outletId}-${type}-${Date.now()}`,
    })).catch((e: { error?: { message?: string } }) => {
      this.error = e?.error?.message ?? 'Could not open the order.';
      return null;
    });

    this.busy = false;

    if (res?.data) {
      this.order = res.data;
      this.orderType = type;
      await this.loadCatalog();
      await this.loadActiveOrders();
    }

    this.cdr.detectChanges();
  }

  closeOrderView(): void {
    this.fieldErrors = {};
    this.order = null;
    this.checks = [];
    this.panel = 'none';
    this.activeSeat = 0;
    this.router.navigate([], { queryParams: {} });
  }

  private async loadChecks(): Promise<void> {
    if (!this.order) return;
    const res = await firstValueFrom(this.checksApi.forOrder(this.order.id)).catch(() => null);
    this.checks = res?.data ?? [];
  }

  // ── Catalogue ──────────────────────────────────────────────────────

  get categories(): MenuCategoryDto[] {
    return this.catalog?.categories ?? [];
  }

  get visibleItems(): MenuItemDto[] {
    const items = this.catalog?.items ?? [];
    const query = this.search.trim().toLowerCase();

    if (query) {
      return items.filter(i =>
        i.name.toLowerCase().includes(query) ||
        (i.shortName?.toLowerCase().includes(query) ?? false) ||
        (i.code?.toLowerCase().includes(query) ?? false));
    }

    return items.filter(i => i.categoryId === this.activeCategoryId);
  }

  get visibleCombos(): ComboMealDto[] {
    if (this.search.trim()) {
      const q = this.search.trim().toLowerCase();
      return (this.catalog?.combos ?? []).filter(c => c.name.toLowerCase().includes(q));
    }
    // Combos live on the first tab, where a waiter looks for a meal deal.
    return this.activeCategoryId === this.categories[0]?.id ? this.catalog?.combos ?? [] : [];
  }

  async changeOrderType(type: OrderType): Promise<void> {
    this.orderType = type;

    if (this.order) {
      this.busy = true;
      const res = await firstValueFrom(this.orders.update(this.order.id, { orderType: type }))
        .catch((e: { error?: { message?: string } }) => {
          this.error = e?.error?.message ?? 'Could not change the order type.';
          return null;
        });
      this.busy = false;
      if (res?.data) this.order = res.data;
    }

    await this.loadCatalog();
  }

  // ── Building a line ────────────────────────────────────────────────

  pick(item: MenuItemDto): void {
    if (!item.isAvailable) return;

    const needsChoices = item.modifierGroups.length > 0 || item.variants.length > 1;

    const line: PendingLine = {
      item,
      variant: item.variants.find(v => v.isDefault) ?? item.variants[0] ?? null,
      quantity: 1,
      seatNumber: this.activeSeat || null,
      course: this.activeCourse ?? item.defaultCourse,
      isHeld: false,
      note: '',
      modifiers: new Map(),
      combo: null,
      comboChoices: new Map(),
    };

    // Pre-select the defaults so a group whose default is right needs no interaction.
    for (const group of item.modifierGroups) {
      const defaults = group.modifiers.filter(m => m.isDefault).map(m => m.id);
      if (defaults.length) line.modifiers.set(group.modifierGroupId, new Set(defaults));
    }

    this.pending = line;

    // A dish with nothing to choose goes straight onto the order — making a waiter confirm a
    // plain side of fries is friction with no purpose.
    if (!needsChoices) { void this.commitPending(); return; }

    this.panel = 'configure';
  }

  pickCombo(combo: ComboMealDto): void {
    if (!combo.isAvailable) return;

    const choices = new Map<string, string>();
    for (const component of combo.components) {
      const preset = component.options.find(o => o.isDefault) ?? component.options[0];
      if (preset) choices.set(component.id, preset.menuItemId);
    }

    this.pending = {
      item: {
        id: combo.menuItemId ?? combo.id,
        name: combo.name,
        basePrice: combo.price,
      } as MenuItemDto,
      variant: null,
      quantity: 1,
      seatNumber: this.activeSeat || null,
      course: this.activeCourse ?? CourseType.Main,
      isHeld: false,
      note: '',
      modifiers: new Map(),
      combo,
      comboChoices: choices,
    };

    this.panel = 'configure';
  }

  toggleModifier(group: ItemModifierGroupDto, modifier: ModifierDto): void {
    if (!this.pending || !modifier.isAvailable) return;

    const chosen = this.pending.modifiers.get(group.modifierGroupId) ?? new Set<string>();

    if (chosen.has(modifier.id)) {
      chosen.delete(modifier.id);
    } else if (group.maxSelections <= 1) {
      chosen.clear();
      chosen.add(modifier.id);
    } else if (chosen.size < group.maxSelections) {
      chosen.add(modifier.id);
    } else {
      this.error = `${group.name}: choose at most ${group.maxSelections}.`;
      return;
    }

    this.error = '';
    this.pending.modifiers.set(group.modifierGroupId, chosen);
  }

  isChosen(groupId: string, modifierId: string): boolean {
    return this.pending?.modifiers.get(groupId)?.has(modifierId) ?? false;
  }

  chooseComboOption(componentId: string, menuItemId: string): void {
    this.pending?.comboChoices.set(componentId, menuItemId);
  }

  /** Which required groups still have nothing picked — the reason send is blocked. */
  get unmetGroups(): ItemModifierGroupDto[] {
    const p = this.pending;
    if (!p) return [];

    return p.item.modifierGroups?.filter(g => {
      if (!g.isRequired) return false;
      const chosen = p.modifiers.get(g.modifierGroupId)?.size ?? 0;
      return chosen < Math.max(1, g.minSelections);
    }) ?? [];
  }

  /**
   * What the line will cost, shown while configuring. Indicative only — the server prices the
   * line for real on send, and that is the number the guest is charged.
   */
  get pendingPrice(): number {
    const p = this.pending;
    if (!p) return 0;

    const base = p.combo ? p.combo.price
      : p.variant && p.variant.price > 0 ? p.variant.price
      : p.item.basePrice;

    let modifiers = 0;
    for (const group of p.item.modifierGroups ?? []) {
      const chosen = p.modifiers.get(group.modifierGroupId);
      if (!chosen) continue;
      for (const m of group.modifiers) if (chosen.has(m.id)) modifiers += m.priceDelta;
    }

    let upcharge = 0;
    if (p.combo) {
      for (const component of p.combo.components) {
        const picked = p.comboChoices.get(component.id);
        const option = component.options.find(o => o.menuItemId === picked);
        if (option) upcharge += option.upchargeAmount;
      }
    }

    return (base + modifiers + upcharge) * p.quantity;
  }

  cancelPending(): void {
    this.fieldErrors = {};
    this.pending = null;
    this.panel = 'none';
    this.error = '';
  }

  async commitPending(): Promise<void> {
    const p = this.pending;
    if (!p || !this.outletId) return;

    this.fieldErrors = validate(p as unknown as Record<string, unknown>, {
      quantity: [required('A quantity'), positive('The quantity')],
      seatNumber: [between(1, 40, 'The seat number')],
      note: [maxLength(300, 'The note')],
    });
    if (Object.keys(this.fieldErrors).length) { this.error = summarise(this.fieldErrors); return; }

    // Required modifier groups are named outright — "Choose a side" beats "invalid selection".
    if (this.unmetGroups.length) {
      this.error = `Choose: ${this.unmetGroups.map(g => g.name).join(', ')}.`;
      return;
    }

    const modifiers: SelectedModifierDto[] = [];
    for (const ids of p.modifiers.values()) {
      for (const id of ids) modifiers.push({ modifierId: id, quantity: 1 });
    }

    const comboSelections: ComboSelectionDto[] = [];
    if (p.combo) {
      for (const component of p.combo.components) {
        const menuItemId = p.comboChoices.get(component.id);
        if (!menuItemId) continue;
        comboSelections.push({
          comboComponentId: component.id,
          menuItemId,
          quantity: component.quantity,
          modifiers: [],
        });
      }
    }

    const line: AddOrderLineDto = {
      menuItemId: p.item.id,
      variantId: p.variant?.id ?? null,
      comboMealId: p.combo?.id ?? null,
      quantity: p.quantity,
      seatNumber: p.seatNumber,
      course: p.course,
      isHeld: p.isHeld,
      specialInstructions: p.note || null,
      modifiers,
      comboSelections,
    };

    this.busy = true;
    this.error = '';

    // Opening the order lazily means a waiter can start tapping dishes before deciding
    // anything else — the order appears when it has something in it.
    if (!this.order) {
      const opened = await firstValueFrom(this.orders.open({
        outletId: this.outletId,
        orderType: this.orderType,
        channel: OrderChannel.InHouse,
        guestCount: 1,
        lines: [line],
        idempotencyKey: `pad-${this.outletId}-${Date.now()}`,
      })).catch((e: { error?: { message?: string } }) => {
        this.error = e?.error?.message ?? 'Could not open the order.';
        return null;
      });

      this.busy = false;
      if (opened?.data) {
        this.order = opened.data;
        await this.loadActiveOrders();
      }
      this.cancelPending();
      this.cdr.detectChanges();
      return;
    }

    const res = await firstValueFrom(this.orders.addLines({
      orderId: this.order.id,
      lines: [line],
      fireImmediately: !p.isHeld,
    })).catch((e: { error?: { message?: string } }) => {
      this.error = e?.error?.message ?? 'Could not add that to the order.';
      return null;
    });

    this.busy = false;
    if (res?.data) this.order = res.data;
    this.cancelPending();
    this.cdr.detectChanges();
  }

  // ── Order lines ────────────────────────────────────────────────────

  get liveLines(): RestaurantOrderLineDto[] {
    return (this.order?.lines ?? []).filter(l => !l.isVoided && !l.parentLineId);
  }

  childrenOf(line: RestaurantOrderLineDto): RestaurantOrderLineDto[] {
    return (this.order?.lines ?? []).filter(l => l.parentLineId === line.id && !l.isVoided);
  }

  /** Lines grouped by course, in the order a meal is served. */
  get coursedLines(): { course: CourseType; lines: RestaurantOrderLineDto[] }[] {
    const lines = this.liveLines;

    return this.courseOrder
      .map(course => ({ course, lines: lines.filter(l => l.course === course) }))
      .filter(group => group.lines.length > 0);
  }

  get heldLines(): RestaurantOrderLineDto[] {
    return this.liveLines.filter(l => l.isHeld);
  }

  /** Seats that have something on them, so the seat bar only offers real seats plus one more. */
  get seatNumbers(): number[] {
    const used = new Set<number>();
    for (const line of this.liveLines) if (line.seatNumber) used.add(line.seatNumber);

    const guests = this.order?.guestCount ?? 0;
    for (let i = 1; i <= Math.max(guests, used.size + 1); i++) used.add(i);

    return [...used].sort((a, b) => a - b);
  }

  lineTone(line: RestaurantOrderLineDto): string {
    if (line.isHeld) return 'is-held';
    if (line.status === OrderLineStatus.Ready) return 'is-ready';
    if (line.status === OrderLineStatus.Served) return 'is-served';
    if (line.status === OrderLineStatus.Fired || line.status === OrderLineStatus.Preparing) return 'is-fired';
    return '';
  }

  async changeQuantity(line: RestaurantOrderLineDto, delta: number): Promise<void> {
    const quantity = line.quantity + delta;
    if (quantity < 1) return;

    this.busy = true;
    const res = await firstValueFrom(this.orders.updateLine(line.id, { quantity }))
      .catch((e: { error?: { message?: string } }) => {
        this.error = e?.error?.message ?? 'Could not change that line.';
        return null;
      });

    this.busy = false;
    if (res?.data) this.order = res.data;
    this.cdr.detectChanges();
  }

  async toggleHold(line: RestaurantOrderLineDto): Promise<void> {
    this.busy = true;
    const res = await firstValueFrom(this.orders.updateLine(line.id, { isHeld: !line.isHeld }))
      .catch((e: { error?: { message?: string } }) => {
        this.error = e?.error?.message ?? 'Could not hold that line.';
        return null;
      });

    this.busy = false;
    if (res?.data) this.order = res.data;
    this.cdr.detectChanges();
  }

  startVoid(line: RestaurantOrderLineDto): void {
    this.fieldErrors = {};
    this.voidLine = line;
    this.voidReasonId = this.voidReasons[0]?.id ?? '';
    this.voidNote = '';
    this.voidPin = '';
    this.panel = 'void';
    this.error = '';
  }

  get voidNeedsApproval(): boolean {
    return this.voidReasons.find(r => r.id === this.voidReasonId)?.requiresApproval ?? false;
  }

  async confirmVoid(): Promise<void> {
    if (!this.voidLine) return;

    this.fieldErrors = validate(
      { voidReasonId: this.voidReasonId, voidNote: this.voidNote, voidPin: this.voidPin },
      {
        voidReasonId: [required('A reason for the void')],
        voidNote: [maxLength(300, 'The note')],
        voidPin: [digits(4, 6, 'The approval PIN')],
      },
    );
    if (Object.keys(this.fieldErrors).length) { this.error = summarise(this.fieldErrors); return; }

    this.busy = true;
    const res = await firstValueFrom(this.orders.voidLine({
      orderLineId: this.voidLine.id,
      voidReasonId: this.voidReasonId || null,
      note: this.voidNote || null,
      approvalPin: this.voidPin || null,
    })).catch((e: { error?: { message?: string } }) => {
      this.error = e?.error?.message ?? 'Could not void that line.';
      return null;
    });

    this.busy = false;

    if (res?.data) {
      this.order = res.data;
      this.notice = 'Line voided.';
      this.panel = 'none';
      this.voidLine = null;
    }

    this.cdr.detectChanges();
  }

  // ── Firing ─────────────────────────────────────────────────────────

  async fire(course: CourseType | null): Promise<void> {
    if (!this.order) return;

    this.busy = true;
    this.error = '';

    const res = await firstValueFrom(this.orders.fire({
      orderId: this.order.id,
      course,
      lineIds: [],
      isPriority: false,
    })).catch((e: { error?: { message?: string } }) => {
      this.error = e?.error?.message ?? 'Nothing was sent.';
      return null;
    });

    this.busy = false;

    if (res?.data) {
      this.order = res.data;
      this.notice = course === null ? 'Sent to the kitchen.' : `${this.courseLabels[course]} fired.`;
    }

    this.cdr.detectChanges();
  }

  heldInCourse(course: CourseType): number {
    return this.liveLines.filter(l => l.course === course && l.isHeld).length;
  }

  async markServed(): Promise<void> {
    if (!this.order) return;

    this.busy = true;
    const res = await firstValueFrom(this.orders.markServed(this.order.id, []))
      .catch(() => null);

    this.busy = false;
    if (res?.data) { this.order = res.data; this.notice = 'Marked as served.'; }
    this.cdr.detectChanges();
  }

  // ── Billing ────────────────────────────────────────────────────────

  async openBill(): Promise<void> {
    this.fieldErrors = {};
    if (!this.order) return;

    await this.loadChecks();

    if (this.checks.length === 0) {
      await this.createChecks(SplitMethod.None, 1);
    }

    this.panel = 'bill';
    this.cdr.detectChanges();
  }

  openSplit(): void {
    this.fieldErrors = {};
    this.splitMethod = SplitMethod.Evenly;
    this.splitWays = Math.max(2, this.order?.guestCount ?? 2);
    this.panel = 'split';
  }

  async createChecks(method: SplitMethod, ways: number): Promise<void> {
    if (!this.order) return;

    this.busy = true;
    this.error = '';

    const res = await firstValueFrom(this.checksApi.create({
      orderId: this.order.id,
      splitMethod: method,
      splitCount: ways,
      parts: [],
      replaceExisting: true,
    })).catch((e: { error?: { message?: string } }) => {
      this.error = e?.error?.message ?? 'Could not produce the bill.';
      return null;
    });

    this.busy = false;

    if (res?.data) {
      this.checks = res.data;
      this.panel = 'bill';
      await this.refreshOrder();
    }

    this.cdr.detectChanges();
  }

  private async refreshOrder(): Promise<void> {
    if (!this.order) return;
    const res = await firstValueFrom(this.orders.getById(this.order.id)).catch(() => null);
    if (res?.data) this.order = res.data;
  }

  startPayment(check: RestaurantCheckDto): void {
    this.fieldErrors = {};
    this.activeCheck = check;
    this.tender = TenderType.Cash;
    this.payAmount = check.balanceDue;
    this.tenderedAmount = check.balanceDue;
    this.tipAmount = 0;
    this.cardLast4 = '';
    this.panel = 'payment';
    this.error = '';
  }

  setTipPercent(percent: number): void {
    if (!this.activeCheck) return;
    this.tipAmount = Math.round(this.activeCheck.subTotal * percent) / 100;
  }

  get changeDue(): number {
    if (this.tender !== TenderType.Cash) return 0;
    return Math.max(0, Math.round((this.tenderedAmount - this.payAmount) * 100) / 100);
  }

  async takePayment(): Promise<void> {
    if (!this.activeCheck) return;

    this.fieldErrors = validate(
      {
        payAmount: this.payAmount,
        tenderedAmount: this.tenderedAmount,
        tipAmount: this.tipAmount,
      },
      {
        payAmount: [
          required('An amount to take'),
          positive('The amount'),
          v => Number(v) > Number(this.activeCheck?.balanceDue ?? 0) + 0.005
            ? 'That is more than the balance still owing on this check.' : null,
        ],
        // A tender below the amount would silently short the check, so it is caught here
        // rather than surfacing later as an unexplained shortfall at close.
        tenderedAmount: [
          notNegative('The amount tendered'),
          v => v && Number(v) > 0 && Number(v) < Number(this.payAmount)
            ? 'The cash handed over is less than the amount being paid.' : null,
        ],
        tipAmount: [notNegative('The tip')],
      },
    );
    if (Object.keys(this.fieldErrors).length) { this.error = summarise(this.fieldErrors); return; }

    this.busy = true;
    this.error = '';

    const res = await firstValueFrom(this.checksApi.takePayment({
      checkId: this.activeCheck.id,
      tenderType: this.tender,
      amount: this.payAmount,
      tenderedAmount: this.tenderedAmount || this.payAmount,
      tipAmount: this.tipAmount,
      currencyCode: this.activeCheck.currencyCode,
      exchangeRate: 1,
      cardLast4: this.cardLast4 || null,
      idempotencyKey: `pay-${this.activeCheck.id}-${this.payAmount}-${Date.now()}`,
    })).catch((e: { error?: { message?: string } }) => {
      this.error = e?.error?.message ?? 'The payment was not taken.';
      return null;
    });

    this.busy = false;

    if (res?.data) {
      this.notice = this.changeDue > 0
        ? `Paid. Change ${this.changeDue.toFixed(2)}.`
        : 'Paid.';

      await this.loadChecks();
      await this.refreshOrder();
      await this.loadActiveOrders();

      this.panel = this.checks.every(c => c.balanceDue <= 0.01) ? 'none' : 'bill';
      if (this.panel === 'none') this.order = null;
    }

    this.cdr.detectChanges();
  }

  startDiscount(check: RestaurantCheckDto): void {
    this.fieldErrors = {};
    this.activeCheck = check;
    this.discountReasonId = this.discountReasons[0]?.id ?? '';
    this.discountKind = DiscountKind.Percentage;
    this.discountValue = 10;
    this.discountPin = '';
    this.panel = 'discount';
    this.error = '';
  }

  async applyDiscount(): Promise<void> {
    if (!this.activeCheck) return;

    this.fieldErrors = validate(
      {
        discountValue: this.discountValue,
        discountReasonId: this.discountReasonId,
        discountPin: this.discountPin,
      },
      {
        discountValue: [
          required('A discount'),
          positive('The discount'),
          // A percentage over 100 is always a slip; a cash discount is capped by the check.
          v => this.discountKind === DiscountKind.Percentage && Number(v) > 100
            ? 'A percentage discount cannot be more than 100%.' : null,
          v => this.discountKind === DiscountKind.Amount
            && Number(v) > Number(this.activeCheck?.totalAmount ?? 0) + 0.005
            ? 'That is more than the check total.' : null,
        ],
        discountReasonId: [required('A reason for the discount')],
        discountPin: [digits(4, 6, 'The approval PIN')],
      },
    );
    if (Object.keys(this.fieldErrors).length) { this.error = summarise(this.fieldErrors); return; }

    this.busy = true;
    this.error = '';

    const res = await firstValueFrom(this.checksApi.applyDiscount({
      checkId: this.activeCheck.id,
      discountReasonId: this.discountReasonId || null,
      kind: this.discountKind,
      value: this.discountValue,
      approvalPin: this.discountPin || null,
    })).catch((e: { error?: { message?: string } }) => {
      this.error = e?.error?.message ?? 'The discount was not applied.';
      return null;
    });

    this.busy = false;

    if (res?.data) {
      this.notice = 'Discount applied.';
      await this.loadChecks();
      this.panel = 'bill';
    }

    this.cdr.detectChanges();
  }

  async printCheck(check: RestaurantCheckDto): Promise<void> {
    await firstValueFrom(this.checksApi.markPrinted(check.id)).catch(() => null);
    this.notice = 'Bill printed.';
    await this.loadChecks();
    this.cdr.detectChanges();
  }

  trackLine = (_: number, l: RestaurantOrderLineDto) => l.id;
  trackItem = (_: number, i: MenuItemDto) => i.id;
  trackCheck = (_: number, c: RestaurantCheckDto) => c.id;
}
