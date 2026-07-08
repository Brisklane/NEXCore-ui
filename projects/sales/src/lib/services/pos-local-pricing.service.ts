import { Injectable } from '@angular/core';
import { PricedOrderDto, PricedLineDto, AppliedPromotionDto } from '../models/pricing.model';

/*
 * On-device pricing engine — mirrors the server's Sales PricingService so a cart built fully
 * offline is priced the same way it will be re-priced on sync (keeps variance ≈ 0).
 *
 * Enums are the BACKEND values (the API serializes enums as numbers — Sales.Domain/Enums/PromotionEnums.cs):
 *   DiscountType:  PercentageOff 0, FixedAmountOff 1, NewPrice 2, BuyXGetYFree 3, FreeItem 4
 *   PriceTarget:   AnyPrice 0, RegularPrice 1
 *   ConditionType: None 0, MinQuantity 1, MinOrderAmount 2, ExactQuantity 3
 *   TargetType:    AllCustomers 0, LoyaltyTier 1, PriceList 2, SpecificContact 3
 *
 * Covered: per-line PercentageOff / FixedAmountOff / NewPrice promotions (item + category match),
 * priority, stackability, conditions, RegularPrice target, max discounted qty, tax on the net line.
 * Not covered offline (server reconciles these on sync): BuyXGetYFree / FreeItem, coupons,
 * price-list re-resolution, usage caps, loyalty targeting.
 */

const Discount = { PercentageOff: 0, FixedAmountOff: 1, NewPrice: 2 } as const;
const PriceTarget = { RegularPrice: 1 } as const;
const Condition = { None: 0, MinQuantity: 1, MinOrderAmount: 2, ExactQuantity: 3 } as const;
const Target = { AllCustomers: 0, PriceList: 2, SpecificContact: 3 } as const;

export interface LocalPriceLine {
  productId: string;
  productCode: string | null;
  productName: string | null;
  categoryId: string | null;
  quantity: number;
  listUnitPrice: number;
  taxRate: number;
}

export interface LocalPriceRequest {
  contactId: string | null;
  priceListId: string | null;
  /** Cached active promotions (runtime numeric enum fields). */
  promotions: any[];
  /** True when a coupon code is present but can't be validated offline (adds a warning). */
  hasCoupon?: boolean;
  lines: LocalPriceLine[];
}

interface WorkingLine {
  req: LocalPriceLine;
  discountAmount: number;
  netUnitPrice: number;
  locked: boolean;
  applied: AppliedPromotionDto[];
}

@Injectable({ providedIn: 'root' })
export class PosLocalPricingService {
  private round(n: number): number { return Math.round((n + Number.EPSILON) * 100) / 100; }

  price(req: LocalPriceRequest): PricedOrderDto {
    const warnings: string[] = [];
    const lines: WorkingLine[] = req.lines.map(l => ({
      req: l, discountAmount: 0, netUnitPrice: l.listUnitPrice, locked: false, applied: [],
    }));

    const gross = lines.reduce((s, l) => s + l.req.listUnitPrice * l.req.quantity, 0);

    // Promotions, highest priority first (matches the server ordering).
    const promos = (req.promotions ?? []).slice().sort((a, b) => (b?.priority ?? 0) - (a?.priority ?? 0));
    for (const p of promos) {
      if (!p?.isAutoApplied) continue;                                   // code-gated promos aren't auto-applied at POS
      if (!this.customerEligible(p, req.contactId, req.priceListId)) continue;
      if (p.minOrderAmount != null && gross < p.minOrderAmount) continue;

      for (const rule of (p.items ?? [])) {
        const dt = Number(rule?.discountType);
        if (dt === Discount.PercentageOff || dt === Discount.FixedAmountOff || dt === Discount.NewPrice) {
          this.applyPerLine(p, rule, lines, gross);
        }
        // BuyXGetYFree / FreeItem are reconciled by the server on sync.
      }
    }

    const lineDiscount = lines.reduce((s, l) => s + l.discountAmount, 0);

    let tax = 0;
    const dtoLines: PricedLineDto[] = lines.map(l => {
      const lineAmount = l.req.listUnitPrice * l.req.quantity - l.discountAmount;
      const taxAmount = lineAmount * (l.req.taxRate || 0) / 100;
      tax += taxAmount;
      return {
        productId: l.req.productId,
        productCode: l.req.productCode,
        productName: l.req.productName,
        variantId: null,
        categoryId: l.req.categoryId,
        quantity: l.req.quantity,
        unitOfMeasure: null,
        listUnitPrice: this.round(l.req.listUnitPrice),
        discountPerUnit: l.req.quantity > 0 ? this.round(l.discountAmount / l.req.quantity) : 0,
        discountAmount: this.round(l.discountAmount),
        netUnitPrice: this.round(l.netUnitPrice),
        lineAmount: this.round(lineAmount),
        taxCategory: 0,
        taxRate: this.round(l.req.taxRate || 0),
        taxAmount: this.round(taxAmount),
        appliedPromotions: l.applied,
      };
    });

    if (req.hasCoupon) warnings.push('Coupon will be validated and applied when the sale syncs online.');

    const subtotal = gross - lineDiscount;   // coupon (if any) is applied server-side on sync
    return {
      lines: dtoLines,
      grossAmount: this.round(gross),
      lineDiscountAmount: this.round(lineDiscount),
      couponDiscountAmount: 0,
      discountAmount: this.round(lineDiscount),
      subtotalAmount: this.round(subtotal),
      taxAmount: this.round(tax),
      totalAmount: this.round(subtotal + tax),
      couponCode: null,
      warnings,
    };
  }

  private customerEligible(p: any, contactId: string | null, priceListId: string | null): boolean {
    switch (Number(p?.targetType)) {
      case Target.AllCustomers:    return true;
      case Target.SpecificContact: return !!p.targetContactId && p.targetContactId === contactId;
      case Target.PriceList:       return !!p.requiredPriceListId && p.requiredPriceListId === priceListId;
      default:                     return false;   // LoyaltyTier can't be resolved offline
    }
  }

  private applyPerLine(promo: any, rule: any, lines: WorkingLine[], gross: number): void {
    for (const line of lines) {
      if (line.locked) continue;
      if (!this.ruleMatches(rule, line.req)) continue;
      if (!this.conditionMet(rule, line.req.quantity, gross)) continue;
      if (Number(rule.priceTarget) === PriceTarget.RegularPrice && line.discountAmount > 0) continue;

      const dt = Number(rule.discountType);
      let perUnit = 0;
      if (dt === Discount.PercentageOff)       perUnit = line.netUnitPrice * (rule.value ?? 0) / 100;
      else if (dt === Discount.FixedAmountOff)  perUnit = rule.value ?? 0;
      else if (dt === Discount.NewPrice)        perUnit = Math.max(0, line.netUnitPrice - (rule.value ?? 0));
      if (perUnit <= 0) continue;

      const qty = rule.maxDiscountedQuantity != null
        ? Math.min(line.req.quantity, rule.maxDiscountedQuantity)
        : line.req.quantity;

      this.applyDiscount(promo, line, perUnit * qty);
    }
  }

  private applyDiscount(promo: any, line: WorkingLine, discount: number): void {
    if (line.locked) return;
    const maxRemaining = line.req.listUnitPrice * line.req.quantity - line.discountAmount;
    discount = Math.min(discount, maxRemaining);     // never discount below zero
    if (discount <= 0) return;

    line.discountAmount += discount;
    line.netUnitPrice = line.req.quantity > 0
      ? line.req.listUnitPrice - line.discountAmount / line.req.quantity
      : line.req.listUnitPrice;
    line.applied.push({
      promotionId: promo.id,
      promotionName: promo.name ?? null,
      discountAmount: this.round(discount),
    });
    if (!promo.isStackable) line.locked = true;
  }

  private ruleMatches(rule: any, line: LocalPriceLine): boolean {
    return (!!rule.itemId && rule.itemId === line.productId) ||
           (!!rule.itemCategoryId && !!line.categoryId && rule.itemCategoryId === line.categoryId);
  }

  private conditionMet(rule: any, qty: number, gross: number): boolean {
    if (!rule.isConditional) return true;
    switch (Number(rule.conditionType)) {
      case Condition.None:           return true;
      case Condition.MinQuantity:    return qty >= (rule.conditionQuantity ?? 0);
      case Condition.ExactQuantity:  return qty === (rule.conditionQuantity ?? -1);
      case Condition.MinOrderAmount: return gross >= (rule.conditionAmount ?? 0);
      default:                       return true;
    }
  }
}
