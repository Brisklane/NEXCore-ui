import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { CommerceService, MemberService } from '../../services/fitness.services';
import {
  CashSessionDto, CreateSaleLineDto, DayEndReadDto, MemberSummaryDto, RetailProductDto,
} from '../../models/fitness.models';
import {
  CashMovementKind, PaymentMethod, PAYMENT_METHOD_LABELS,
} from '../../models/fitness.enums';
import { ClubPickerComponent } from '../shared/club-picker';
import { PageHelpComponent } from '../shared/page-help';

interface BasketLine extends CreateSaleLineDto {
  key: string;
}

/**
 * The pro shop till and the cash drawer.
 *
 * Two decisions worth knowing about. Stock lives in Inventory, not here — selling a shaker
 * publishes the same depletion event Point of Sale publishes, because a second item master is a
 * second answer to how many are in the cupboard, and two answers is worse than none.
 *
 * And the drawer close is a **blind count**: the expected figure is not shown until the counted
 * one is entered. A visible target is a target, and a variance that can be reverse-engineered
 * tells you nothing about the drawer.
 */
@Component({
  standalone: true,
  selector: 'lib-fitness-pos',
  imports: [CommonModule, FormsModule, ClubPickerComponent, PageHelpComponent],
  templateUrl: './pos.html',
  styleUrls: ['../fitness-shared.css', './pos.css'],
})
export class PosComponent {
  private commerce = inject(CommerceService);
  private members = inject(MemberService);
  private cdr = inject(ChangeDetectorRef);

  products: RetailProductDto[] = [];
  session: CashSessionDto | null = null;
  dayEnd: DayEndReadDto | null = null;
  loading = true;
  error = '';
  notice = '';
  clubId: string | null = null;

  tab: 'till' | 'drawer' = 'till';
  search = '';

  basket: BasketLine[] = [];
  member: MemberSummaryDto | null = null;
  memberSearch = '';
  memberResults: MemberSummaryDto[] = [];

  /** Payment. */
  paying = false;
  payMethod = PaymentMethod.Card;
  tendered: number | null = null;
  chargeToAccount = false;
  saving = false;
  lastChange = 0;

  /** Drawer. */
  openingFloat = 0;
  countedCash: number | null = null;
  varianceNote = '';
  showExpected = false;
  movementKind = CashMovementKind.PaidOut;
  movementAmount = 0;
  movementReason = '';

  readonly methodLabels = PAYMENT_METHOD_LABELS;
  readonly PaymentMethod = PaymentMethod;
  readonly CashMovementKind = CashMovementKind;

  private searchTimer?: ReturnType<typeof setTimeout>;

  async onClub(id: string | null): Promise<void> {
    this.clubId = id;
    await this.load();
  }

  async load(): Promise<void> {
    if (!this.clubId) { this.loading = false; return; }

    this.loading = true;
    const [products, session] = await Promise.all([
      firstValueFrom(this.commerce.getProducts(this.clubId, this.search.trim() || undefined)).catch(() => null),
      firstValueFrom(this.commerce.getOpenSession(this.clubId)).catch(() => null),
    ]);

    this.products = products?.data ?? [];
    this.session = session?.data ?? null;

    this.loading = false;
    this.cdr.detectChanges();
  }

  // ── Basket ─────────────────────────────────────────────────────────────

  add(p: RetailProductDto): void {
    const existing = this.basket.find(l => l.key === p.id);
    if (existing) {
      existing.quantity += 1;
      return;
    }

    this.basket = [...this.basket, {
      key: p.id,
      planId: p.id,
      inventoryItemId: p.inventoryItemId ?? null,
      itemName: p.name,
      barcode: p.barcode ?? null,
      quantity: 1,
      unitPrice: p.price,
      discountAmount: 0,
      taxPercent: p.taxPercent,
      modifiers: null,
    } as BasketLine];
  }

  changeQty(line: BasketLine, delta: number): void {
    line.quantity += delta;
    if (line.quantity <= 0) this.remove(line);
  }

  remove(line: BasketLine): void {
    this.basket = this.basket.filter(l => l !== line);
  }

  clearBasket(): void {
    this.basket = [];
    this.member = null;
    this.chargeToAccount = false;
    this.tendered = null;
  }

  get subtotal(): number {
    return this.basket.reduce((sum, l) => sum + l.quantity * l.unitPrice - l.discountAmount, 0);
  }

  get tax(): number {
    return this.basket.reduce(
      (sum, l) => sum + (l.quantity * l.unitPrice - l.discountAmount) * l.taxPercent / 100, 0);
  }

  get total(): number { return this.subtotal + this.tax; }

  get changeDue(): number {
    if (this.payMethod !== PaymentMethod.Cash || this.tendered == null) return 0;
    return Math.max(0, this.tendered - this.total);
  }

  // ── Member ─────────────────────────────────────────────────────────────

  onMemberSearch(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    if (this.memberSearch.trim().length < 2) { this.memberResults = []; return; }

    this.searchTimer = setTimeout(async () => {
      const res = await firstValueFrom(this.members.search({
        query: this.memberSearch.trim(),
        clubId: this.clubId,
        includeInactive: false,
        limit: 6,
      })).catch(() => null);

      this.memberResults = res?.data ?? [];
      this.cdr.detectChanges();
    }, 240);
  }

  chooseMember(m: MemberSummaryDto): void {
    this.member = m;
    this.memberSearch = '';
    this.memberResults = [];
  }

  // ── Sale ───────────────────────────────────────────────────────────────

  async completeSale(): Promise<void> {
    if (!this.clubId || this.basket.length === 0) return;

    this.saving = true;
    const res = await firstValueFrom(this.commerce.createSale({
      clubId: this.clubId,
      memberId: this.member?.id ?? null,
      lines: this.basket.map(({ key, ...line }) => line),
      paymentMethod: this.payMethod,
      chargeToHouseAccount: this.chargeToAccount,
      amountTendered: this.tendered,
      discountTotal: 0,
      cashSessionId: this.session?.id ?? null,
      // Protects against a double-tap on a busy till.
      idempotencyKey: `pos:${this.clubId}:${Date.now()}`,
    } as never)).catch(() => null);

    this.saving = false;

    if (res?.data) {
      this.lastChange = this.changeDue;
      this.notice = this.lastChange > 0
        ? `Sale complete. Change: ${this.lastChange.toFixed(2)}.`
        : `Sale complete — ${res.data.saleNumber}.`;
      this.clearBasket();
      this.paying = false;
      await this.load();
    } else {
      this.error = 'That sale did not go through.';
    }

    this.cdr.detectChanges();
  }

  // ── Drawer ─────────────────────────────────────────────────────────────

  async openDrawer(): Promise<void> {
    if (!this.clubId) return;

    const res = await firstValueFrom(this.commerce.openSession({
      clubId: this.clubId,
      openingFloat: this.openingFloat,
    } as never)).catch(() => null);

    if (res?.data) {
      this.session = res.data;
      this.notice = `Drawer open — ${res.data.sessionNumber}.`;
      this.cdr.detectChanges();
    } else {
      this.error = 'Could not open the drawer.';
    }
  }

  async recordMovement(): Promise<void> {
    if (!this.session || this.movementAmount <= 0 || !this.movementReason.trim()) return;

    const res = await firstValueFrom(this.commerce.recordMovement({
      sessionId: this.session.id,
      kind: this.movementKind,
      amount: this.movementAmount,
      reason: this.movementReason.trim(),
    } as never)).catch(() => null);

    if (res?.data) {
      this.session = res.data;
      this.movementAmount = 0;
      this.movementReason = '';
      this.notice = 'Recorded.';
      this.cdr.detectChanges();
    } else {
      this.error = 'Could not record that.';
    }
  }

  async closeDrawer(): Promise<void> {
    if (!this.session || this.countedCash == null) return;

    this.saving = true;
    const res = await firstValueFrom(this.commerce.closeSession({
      sessionId: this.session.id,
      countedCash: this.countedCash,
      varianceNote: this.varianceNote.trim() || null,
    } as never)).catch(() => null);

    this.saving = false;

    if (res?.data) {
      this.session = res.data;
      this.showExpected = true;
      this.notice = res.data.variance === 0
        ? 'Drawer closed and balanced exactly.'
        : `Drawer closed. ${res.data.variance > 0 ? 'Over' : 'Short'} by ${Math.abs(res.data.variance).toFixed(2)}.`;
      this.cdr.detectChanges();
    } else {
      this.error = 'Could not close the drawer.';
    }
  }

  async loadDayEnd(): Promise<void> {
    if (!this.clubId) return;
    const res = await firstValueFrom(
      this.commerce.getDayEnd(this.clubId, new Date().toISOString(), false),
    ).catch(() => null);
    this.dayEnd = res?.data ?? null;
    this.cdr.detectChanges();
  }
}
