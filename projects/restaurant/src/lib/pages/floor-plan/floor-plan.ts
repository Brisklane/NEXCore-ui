import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  FloorService, RestaurantStaffService, FrontOfHouseService,
} from '../../services/restaurant.services';
import {
  FloorDto, FloorPlanViewDto, RestaurantStaffDto, TableDto, WaitlistEntryDto,
} from '../../models/restaurant.models';
import {
  StaffRole, TABLE_STATE_CLASS, TABLE_STATE_LABELS, TableShape, TableState,
} from '../../models/restaurant.enums';
import { OutletPickerComponent } from '../shared/outlet-picker';
import { PageHelpComponent } from '../shared/page-help';
import {
  FieldErrorComponent, FieldErrors, between, digits, email, greaterThanField, inFuture,
  maxLength, minLength, notNegative, positive, required, summarise, validate,
} from '../shared/validation';

type TableAction =
  | 'seat' | 'order' | 'transfer' | 'merge' | 'unmerge'
  | 'clean' | 'free' | 'block' | 'reserve' | 'waiter';

/**
 * The live floor — the screen a host or manager keeps open all service.
 *
 * The plan is rendered to scale from the saved layout rather than as a grid of cards, because the
 * whole value of a floor plan is that it looks like the room: "the two-top by the window" has to
 * be findable by looking, not by reading table numbers. State is carried by colour *and* by a
 * label, never by colour alone.
 *
 * It polls rather than holding a socket open. A restaurant floor changes on the order of tens of
 * seconds, a poll survives a flaky venue wifi that a dropped socket does not, and the endpoint is
 * a single query — so this is the cheaper and more robust choice at this refresh rate.
 */
@Component({
  standalone: true,
  selector: 'lib-restaurant-floor-plan',
  imports: [CommonModule, FormsModule, RouterLink, OutletPickerComponent, PageHelpComponent, FieldErrorComponent],
  templateUrl: './floor-plan.html',
  styleUrls: ['../restaurant-shared.css', './floor-plan.css'],
})
export class FloorPlanComponent implements OnInit, OnDestroy {
  private floors = inject(FloorService);
  private staffApi = inject(RestaurantStaffService);
  private foh = inject(FrontOfHouseService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  plan: FloorPlanViewDto | null = null;
  activeFloorId: string | null = null;
  outletId: string | null = null;

  loading = true;
  busy = false;
  error = '';

  /** Per-field messages for whichever dialog is open. Rebuilt on every save attempt. */
  fieldErrors: FieldErrors = {};
  notice = '';

  waiters: RestaurantStaffDto[] = [];
  waitlist: WaitlistEntryDto[] = [];

  /** Table the action sheet is open for. */
  selected: TableDto | null = null;
  action: TableAction | null = null;

  // Action-sheet form state
  guestCount = 2;
  chosenWaiterId = '';
  transferTargetId = '';
  mergeTargetIds: string[] = [];
  actionNote = '';
  waitlistEntryId = '';

  /** Dim tables that are not this waiter's — used on a shared handheld. */
  filterWaiterId = '';

  /** Show only tables that need someone to do something. */
  attentionOnly = false;

  private timer?: ReturnType<typeof setInterval>;

  readonly stateLabels = TABLE_STATE_LABELS;
  readonly stateClass = TABLE_STATE_CLASS;
  readonly TableState = TableState;
  readonly TableShape = TableShape;

  ngOnInit(): void {
    this.timer = setInterval(() => this.load(true), 15_000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  async onOutlet(id: string | null): Promise<void> {
    this.outletId = id;
    this.activeFloorId = null;
    await this.load();
    await this.loadSupporting();
  }

  private async loadSupporting(): Promise<void> {
    if (!this.outletId) return;

    const [waiters, waitlist] = await Promise.all([
      firstValueFrom(this.staffApi.getStaff(this.outletId, undefined, true)).catch(() => null),
      firstValueFrom(this.foh.getWaitlist(this.outletId, true)).catch(() => null),
    ]);

    this.waiters = (waiters?.data ?? []).filter(s => s.canTakeOrders || s.role === StaffRole.Waiter);
    this.waitlist = waitlist?.data ?? [];
    this.cdr.detectChanges();
  }

  async load(silent = false): Promise<void> {
    if (!this.outletId) { this.loading = false; return; }
    if (!silent) this.loading = true;

    const res = await firstValueFrom(this.floors.getPlan(this.outletId)).catch(() => null);

    if (res?.data) {
      this.plan = res.data;
      if (!this.activeFloorId || !res.data.floors.some(f => f.id === this.activeFloorId)) {
        this.activeFloorId = res.data.floors[0]?.id ?? null;
      }
    } else if (!silent) {
      this.error = 'Could not load the floor plan.';
    }

    this.loading = false;
    this.cdr.detectChanges();
  }

  // ── Derived views ──────────────────────────────────────────────────

  get floorList(): FloorDto[] { return this.plan?.floors ?? []; }

  get activeFloor(): FloorDto | undefined {
    return this.floorList.find(f => f.id === this.activeFloorId);
  }

  get visibleTables(): TableDto[] {
    const tables = this.activeFloor?.tables ?? [];
    return this.attentionOnly ? tables.filter(t => t.needsAttention) : tables;
  }

  /**
   * Tables a merged group covers, other than the primary. They are drawn joined to the primary
   * so the plan shows one party, not three tables that happen to share an order.
   */
  isMergedChild(table: TableDto): boolean {
    return !!table.mergedIntoTableId;
  }

  isDimmed(table: TableDto): boolean {
    if (!this.filterWaiterId) return false;
    return table.assignedWaiterId !== this.filterWaiterId;
  }

  /** Free tables on this floor, for the transfer and merge pickers. */
  get freeTables(): TableDto[] {
    return (this.activeFloor?.tables ?? [])
      .filter(t => t.id !== this.selected?.id && !t.mergedIntoTableId)
      .filter(t => t.state === TableState.Free || t.state === TableState.NeedsCleaning);
  }

  get occupiedTables(): TableDto[] {
    return (this.activeFloor?.tables ?? []).filter(t => !!t.currentOrderId);
  }

  waiterName(id?: string | null): string {
    if (!id) return '';
    const w = this.waiters.find(x => x.id === id);
    return w?.displayName || w?.fullName || '';
  }

  /** Colour a table's timer once it has been sitting in one state too long. */
  timerTone(table: TableDto): string {
    if (table.state === TableState.Free || table.state === TableState.Blocked) return '';
    if (table.needsAttention) return 'is-late';
    if (table.minutesInState >= 45) return 'is-warn';
    return '';
  }

  // ── Action sheet ───────────────────────────────────────────────────

  open(table: TableDto): void {
    this.fieldErrors = {};
    // A merged child is not its own party — send the user to the table that holds the check.
    if (table.mergedIntoTableId) {
      const primary = this.activeFloor?.tables.find(t => t.id === table.mergedIntoTableId);
      if (primary) table = primary;
    }

    this.selected = table;
    this.action = null;
    this.error = '';
    this.notice = '';
    this.guestCount = table.currentGuestCount || Math.min(table.seats, 2);
    this.chosenWaiterId = table.assignedWaiterId ?? '';
    this.transferTargetId = '';
    this.mergeTargetIds = [];
    this.actionNote = '';
    this.waitlistEntryId = '';
  }

  close(): void {
    this.fieldErrors = {};
    this.selected = null;
    this.action = null;
  }

  choose(action: TableAction): void {
    this.action = action;
    this.error = '';
  }

  toggleMergeTarget(id: string): void {
    this.mergeTargetIds = this.mergeTargetIds.includes(id)
      ? this.mergeTargetIds.filter(x => x !== id)
      : [...this.mergeTargetIds, id];
  }

  /** Seats to be covered by the merged group — shown so a host can sanity-check the party size. */
  get mergeSeatTotal(): number {
    const own = this.selected?.seats ?? 0;
    const others = (this.activeFloor?.tables ?? [])
      .filter(t => this.mergeTargetIds.includes(t.id))
      .reduce((sum, t) => sum + t.seats, 0);
    return own + others;
  }

  // ── Commands ───────────────────────────────────────────────────────

  private async run<T>(work: Promise<T>, success: string): Promise<T | null> {
    this.busy = true;
    this.error = '';

    const result = await work.catch((e: { error?: { message?: string } }) => {
      this.error = e?.error?.message ?? 'That did not work. Please try again.';
      return null;
    });

    this.busy = false;

    if (result !== null) {
      this.notice = success;
      await this.load(true);
      this.close();
    }

    this.cdr.detectChanges();
    return result;
  }

  async seat(): Promise<void> {
    if (!this.selected) return;

    this.fieldErrors = validate(
      { guestCount: this.guestCount, chosenWaiterId: this.chosenWaiterId },
      {
        guestCount: [
          required('How many are dining'),
          positive('The guest count'),
          // Over the table's seats is allowed but worth flagging as a likely typo.
          v => Number(v) > 200 ? 'That looks like a typo — check the guest count.' : null,
        ],
      },
    );
    if (Object.keys(this.fieldErrors).length) { this.error = summarise(this.fieldErrors); return; }

    const order = await this.run(
      firstValueFrom(this.floors.seat({
        tableId: this.selected.id,
        guestCount: this.guestCount,
        waiterId: this.chosenWaiterId || null,
        waitlistEntryId: this.waitlistEntryId || null,
        createOrder: true,
      })),
      `Table ${this.selected.tableNumber} seated.`,
    );

    await this.loadSupporting();

    // Seating a table is nearly always followed by taking the order, so go straight there.
    if (order?.data?.id) this.router.navigate(['/restaurant/order'], { queryParams: { orderId: order.data.id } });
  }

  async goToOrder(): Promise<void> {
    if (!this.selected?.currentOrderId) return;
    const id = this.selected.currentOrderId;
    this.close();
    this.router.navigate(['/restaurant/order'], { queryParams: { orderId: id } });
  }

  async transfer(): Promise<void> {
    if (!this.selected) return;

    this.fieldErrors = validate(
      { transferTargetId: this.transferTargetId },
      {
        transferTargetId: [
          required('A table to move the party to'),
          v => v === this.selected?.id ? 'That is the table they are already on.' : null,
        ],
      },
    );
    if (Object.keys(this.fieldErrors).length) { this.error = summarise(this.fieldErrors); return; }

    await this.run(
      firstValueFrom(this.floors.transfer({
        fromTableId: this.selected.id,
        toTableId: this.transferTargetId,
        reason: this.actionNote || null,
      })),
      'Party moved.',
    );
  }

  async merge(): Promise<void> {
    if (!this.selected || this.mergeTargetIds.length === 0) return;

    await this.run(
      firstValueFrom(this.floors.merge({
        primaryTableId: this.selected.id,
        tableIds: this.mergeTargetIds,
        guestCount: this.guestCount,
      })),
      'Tables joined.',
    );
  }

  async unmerge(): Promise<void> {
    if (!this.selected) return;
    await this.run(firstValueFrom(this.floors.unmerge(this.selected.id)), 'Tables separated.');
  }

  async setState(state: TableState, message: string): Promise<void> {
    if (!this.selected) return;

    await this.run(
      firstValueFrom(this.floors.changeState({
        tableId: this.selected.id,
        state,
        note: this.actionNote || null,
      })),
      message,
    );
  }

  async assignWaiter(): Promise<void> {
    if (!this.selected) return;

    this.fieldErrors = validate(
      { chosenWaiterId: this.chosenWaiterId },
      { chosenWaiterId: [required('A server to put on this table')] },
    );
    if (Object.keys(this.fieldErrors).length) { this.error = summarise(this.fieldErrors); return; }

    await this.run(
      firstValueFrom(this.floors.assignWaiter({
        tableId: this.selected.id,
        waiterId: this.chosenWaiterId,
      })),
      'Server assigned.',
    );
  }

  async clear(): Promise<void> {
    if (!this.selected) return;
    await this.run(firstValueFrom(this.floors.clear(this.selected.id)), 'Table cleared.');
  }

  /** True when the selected table currently holds a party. */
  get selectedInService(): boolean {
    const s = this.selected;
    if (!s) return false;
    return s.state === TableState.Seated || s.state === TableState.Ordered
        || s.state === TableState.Served || s.state === TableState.BillPrinted;
  }

  get selectedHasMergedChildren(): boolean {
    if (!this.selected) return false;
    return (this.activeFloor?.tables ?? []).some(t => t.mergedIntoTableId === this.selected!.id);
  }

  trackTable = (_: number, t: TableDto) => t.id;
}
