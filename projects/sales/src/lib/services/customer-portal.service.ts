import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SALES_API } from './sales-api-config';
import { ApiResponse } from '../models/api-response.model';
import { SalesOrderDto } from '../models/sales-order.model';
import {
  PortalStoreDto,
  StoreMenuDto,
  CreateCartDto,
  PortalCartDto,
  AddToCartDto,
  UpdateCartLineDto,
  ApplyCouponDto,
  CheckoutDto,
  PortalOrderSummaryDto,
  CancelOrderDto,
  PortalInvoiceSummaryDto,
  PortalLoyaltyDto,
  PortalWishlistItemDto,
  AddWishlistItemDto,
  PortalReviewDto,
  CreateReviewDto,
  PortalNotificationDto,
  PortalEnumReferenceDataDto,
} from '../models/customer-portal.model';

@Injectable({ providedIn: 'root' })
export class CustomerPortalService {
  constructor(private http: HttpClient) {}

  // ── Stores & Menu ──────────────────────────────────────────────────────────

  getStores(): Observable<ApiResponse<PortalStoreDto[]>> {
    return this.http.get<ApiResponse<PortalStoreDto[]>>(SALES_API.customerPortal.stores);
  }

  getStoreMenu(storeId: string): Observable<ApiResponse<StoreMenuDto>> {
    return this.http.get<ApiResponse<StoreMenuDto>>(SALES_API.customerPortal.storeMenu(storeId));
  }

  // ── Cart ───────────────────────────────────────────────────────────────────

  createCart(dto: CreateCartDto): Observable<ApiResponse<PortalCartDto>> {
    return this.http.post<ApiResponse<PortalCartDto>>(SALES_API.customerPortal.createCart, dto);
  }

  getCart(orderId: string): Observable<ApiResponse<PortalCartDto>> {
    return this.http.get<ApiResponse<PortalCartDto>>(SALES_API.customerPortal.getCart(orderId));
  }

  addCartLine(orderId: string, dto: AddToCartDto): Observable<ApiResponse<PortalCartDto>> {
    return this.http.post<ApiResponse<PortalCartDto>>(SALES_API.customerPortal.addCartLine(orderId), dto);
  }

  updateCartLine(orderId: string, lineId: string, dto: UpdateCartLineDto): Observable<ApiResponse<PortalCartDto>> {
    return this.http.put<ApiResponse<PortalCartDto>>(
      SALES_API.customerPortal.updateCartLine(orderId, lineId),
      dto,
    );
  }

  applyCoupon(orderId: string, dto: ApplyCouponDto): Observable<ApiResponse<PortalCartDto>> {
    return this.http.post<ApiResponse<PortalCartDto>>(SALES_API.customerPortal.applyCoupon(orderId), dto);
  }

  checkout(orderId: string, dto: CheckoutDto): Observable<ApiResponse<SalesOrderDto>> {
    return this.http.post<ApiResponse<SalesOrderDto>>(SALES_API.customerPortal.checkout(orderId), dto);
  }

  // ── Orders ─────────────────────────────────────────────────────────────────

  getOrders(): Observable<ApiResponse<PortalOrderSummaryDto[]>> {
    return this.http.get<ApiResponse<PortalOrderSummaryDto[]>>(SALES_API.customerPortal.orders);
  }

  getOrder(orderId: string): Observable<ApiResponse<SalesOrderDto>> {
    return this.http.get<ApiResponse<SalesOrderDto>>(SALES_API.customerPortal.getOrder(orderId));
  }

  cancelOrder(orderId: string, dto: CancelOrderDto): Observable<ApiResponse<SalesOrderDto>> {
    return this.http.post<ApiResponse<SalesOrderDto>>(SALES_API.customerPortal.cancelOrder(orderId), dto);
  }

  // ── Invoices ───────────────────────────────────────────────────────────────

  getInvoices(): Observable<ApiResponse<PortalInvoiceSummaryDto[]>> {
    return this.http.get<ApiResponse<PortalInvoiceSummaryDto[]>>(SALES_API.customerPortal.invoices);
  }

  // ── Loyalty ────────────────────────────────────────────────────────────────

  getLoyalty(): Observable<ApiResponse<PortalLoyaltyDto>> {
    return this.http.get<ApiResponse<PortalLoyaltyDto>>(SALES_API.customerPortal.loyalty);
  }

  // ── Wishlist ───────────────────────────────────────────────────────────────

  getWishlist(): Observable<ApiResponse<PortalWishlistItemDto[]>> {
    return this.http.get<ApiResponse<PortalWishlistItemDto[]>>(SALES_API.customerPortal.wishlist);
  }

  addWishlistItem(dto: AddWishlistItemDto): Observable<ApiResponse<PortalWishlistItemDto>> {
    return this.http.post<ApiResponse<PortalWishlistItemDto>>(SALES_API.customerPortal.wishlist, dto);
  }

  deleteWishlistItem(itemId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(SALES_API.customerPortal.deleteWishlistItem(itemId));
  }

  // ── Reviews ────────────────────────────────────────────────────────────────

  getReviews(): Observable<ApiResponse<PortalReviewDto[]>> {
    return this.http.get<ApiResponse<PortalReviewDto[]>>(SALES_API.customerPortal.reviews);
  }

  createReview(dto: CreateReviewDto): Observable<ApiResponse<PortalReviewDto>> {
    return this.http.post<ApiResponse<PortalReviewDto>>(SALES_API.customerPortal.reviews, dto);
  }

  // ── Notifications ──────────────────────────────────────────────────────────

  getNotifications(unreadOnly = false): Observable<ApiResponse<PortalNotificationDto[]>> {
    const params = new HttpParams().set('unreadOnly', String(unreadOnly));
    return this.http.get<ApiResponse<PortalNotificationDto[]>>(SALES_API.customerPortal.notifications, {
      params,
    });
  }

  getUnreadNotificationCount(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(SALES_API.customerPortal.unreadNotificationCount);
  }

  markAllNotificationsRead(): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(SALES_API.customerPortal.markAllNotificationsRead, {});
  }

  markNotificationRead(id: string): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(SALES_API.customerPortal.markNotificationRead(id), {});
  }

  // ── Enum Reference Data ────────────────────────────────────────────────────

  getEnums(): Observable<ApiResponse<PortalEnumReferenceDataDto>> {
    return this.http.get<ApiResponse<PortalEnumReferenceDataDto>>(SALES_API.customerPortal.enums);
  }
}
