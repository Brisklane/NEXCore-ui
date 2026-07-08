import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SALES_API } from './sales-api-config';
import { ApiResponse } from '../models/api-response.model';
import { EnumLookupDto } from '../models/sales-lookup.model';

export interface SalesLookups {
  orderStatuses: EnumLookupDto[];
  salesChannels: EnumLookupDto[];
  fulfillmentTypes: EnumLookupDto[];
  paymentTerms: EnumLookupDto[];
  discountTypes: EnumLookupDto[];
  incoterms: EnumLookupDto[];
  invoiceStatuses: EnumLookupDto[];
  deliveryStatuses: EnumLookupDto[];
  quotationStatuses: EnumLookupDto[];
}

@Injectable({ providedIn: 'root' })
export class SalesLookupService {
  constructor(private http: HttpClient) {}

  private fetch(url: string): Observable<EnumLookupDto[]> {
    return this.http
      .get<ApiResponse<EnumLookupDto[]>>(url)
      .pipe(
        map(res => res.data ?? []),
        catchError(() => of([])),
      );
  }

  getOrderStatuses(): Observable<EnumLookupDto[]> {
    return this.fetch(SALES_API.salesLookup.orderStatuses);
  }

  getSalesChannels(): Observable<EnumLookupDto[]> {
    return this.fetch(SALES_API.salesLookup.salesChannels);
  }

  getFulfillmentTypes(): Observable<EnumLookupDto[]> {
    return this.fetch(SALES_API.salesLookup.fulfillmentTypes);
  }

  getPaymentTerms(): Observable<EnumLookupDto[]> {
    return this.fetch(SALES_API.salesLookup.paymentTerms);
  }

  getDiscountTypes(): Observable<EnumLookupDto[]> {
    return this.fetch(SALES_API.salesLookup.discountTypes);
  }

  getIncoterms(): Observable<EnumLookupDto[]> {
    return this.fetch(SALES_API.salesLookup.incoterms);
  }

  getInvoiceStatuses(): Observable<EnumLookupDto[]> {
    return this.fetch(SALES_API.salesLookup.invoiceStatuses);
  }

  getDeliveryStatuses(): Observable<EnumLookupDto[]> {
    return this.fetch(SALES_API.salesLookup.deliveryStatuses);
  }

  getQuotationStatuses(): Observable<EnumLookupDto[]> {
    return this.fetch(SALES_API.salesLookup.quotationStatuses);
  }

  getReturnStatuses(): Observable<EnumLookupDto[]> {
    return this.fetch(SALES_API.salesLookup.returnStatuses);
  }

  getCouponStatuses(): Observable<EnumLookupDto[]> {
    return this.fetch(SALES_API.salesLookup.couponStatuses);
  }

  getPriceListTypes(): Observable<EnumLookupDto[]> {
    return this.fetch(SALES_API.salesLookup.priceListTypes);
  }

  getTaxCategories(): Observable<EnumLookupDto[]> {
    return this.fetch(SALES_API.salesLookup.taxCategories);
  }

  getPosStoreTypes(): Observable<EnumLookupDto[]> {
    return this.fetch(SALES_API.salesLookup.posStoreTypes);
  }

  getStoreOnlineStatuses(): Observable<EnumLookupDto[]> {
    return this.fetch(SALES_API.salesLookup.storeOnlineStatuses);
  }

  getPosSessionStatuses(): Observable<EnumLookupDto[]> {
    return this.fetch(SALES_API.salesLookup.posSessionStatuses);
  }

  getPosTransactionStatuses(): Observable<EnumLookupDto[]> {
    return this.fetch(SALES_API.salesLookup.posTransactionStatuses);
  }

  getPosTransactionTypes(): Observable<EnumLookupDto[]> {
    return this.fetch(SALES_API.salesLookup.posTransactionTypes);
  }

  getPosTenderTypes(): Observable<EnumLookupDto[]> {
    return this.fetch(SALES_API.salesLookup.posTenderTypes);
  }

  getPosCashMovementTypes(): Observable<EnumLookupDto[]> {
    return this.fetch(SALES_API.salesLookup.posCashMovementTypes);
  }

  getRiderStatuses(): Observable<EnumLookupDto[]> {
    return this.fetch(SALES_API.salesLookup.riderStatuses);
  }

  getRiderAssignmentStatuses(): Observable<EnumLookupDto[]> {
    return this.fetch(SALES_API.salesLookup.riderAssignmentStatuses);
  }

  getVehicleTypes(): Observable<EnumLookupDto[]> {
    return this.fetch(SALES_API.salesLookup.vehicleTypes);
  }

  getLoyaltyTiers(): Observable<EnumLookupDto[]> {
    return this.fetch(SALES_API.salesLookup.loyaltyTiers);
  }

  getLoyaltyTransactionTypes(): Observable<EnumLookupDto[]> {
    return this.fetch(SALES_API.salesLookup.loyaltyTransactionTypes);
  }

  getGiftCardStatuses(): Observable<EnumLookupDto[]> {
    return this.fetch(SALES_API.salesLookup.giftCardStatuses);
  }

  getApprovalDecisions(): Observable<EnumLookupDto[]> {
    return this.fetch(SALES_API.salesLookup.approvalDecisions);
  }

  getApprovalConditionFields(): Observable<EnumLookupDto[]> {
    return this.fetch(SALES_API.salesLookup.approvalConditionFields);
  }

  getApprovalConditionOperators(): Observable<EnumLookupDto[]> {
    return this.fetch(SALES_API.salesLookup.approvalConditionOperators);
  }

  getCommissionBases(): Observable<EnumLookupDto[]> {
    return this.fetch(SALES_API.salesLookup.commissionBases);
  }

  getCommissionStatuses(): Observable<EnumLookupDto[]> {
    return this.fetch(SALES_API.salesLookup.commissionStatuses);
  }

  getTargetPeriods(): Observable<EnumLookupDto[]> {
    return this.fetch(SALES_API.salesLookup.targetPeriods);
  }

  getSalesAgreementStatuses(): Observable<EnumLookupDto[]> {
    return this.fetch(SALES_API.salesLookup.salesAgreementStatuses);
  }

  /** Load all lookups needed for the sales order form in one parallel call. */
  loadOrderFormLookups(): Observable<SalesLookups> {
    return forkJoin({
      orderStatuses: this.getOrderStatuses(),
      salesChannels: this.getSalesChannels(),
      fulfillmentTypes: this.getFulfillmentTypes(),
      paymentTerms: this.getPaymentTerms(),
      discountTypes: this.getDiscountTypes(),
      incoterms: this.getIncoterms(),
      invoiceStatuses: this.getInvoiceStatuses(),
      deliveryStatuses: this.getDeliveryStatuses(),
      quotationStatuses: this.getQuotationStatuses(),
    });
  }
}
