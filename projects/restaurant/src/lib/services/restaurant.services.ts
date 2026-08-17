import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RESTAURANT_API } from './restaurant-api-config';
import * as M from '../models/restaurant.models';
import { OrderType } from '../models/restaurant.enums';

type Api<T> = M.ApiResponse<T>;

// ── Venue ────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class OutletService {
  private http = inject(HttpClient);

  getAll(activeOnly = false): Observable<Api<M.OutletDto[]>> {
    return this.http.get<Api<M.OutletDto[]>>(RESTAURANT_API.outlets.getAll(activeOnly));
  }

  getById(id: string): Observable<Api<M.OutletDto>> {
    return this.http.get<Api<M.OutletDto>>(RESTAURANT_API.outlets.getById(id));
  }

  create(dto: M.SaveOutletDto): Observable<Api<M.OutletDto>> {
    return this.http.post<Api<M.OutletDto>>(RESTAURANT_API.outlets.create, dto);
  }

  update(id: string, dto: M.SaveOutletDto): Observable<Api<M.OutletDto>> {
    return this.http.put<Api<M.OutletDto>>(RESTAURANT_API.outlets.update(id), dto);
  }

  delete(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(RESTAURANT_API.outlets.delete(id));
  }

  getSchedules(outletId: string): Observable<Api<M.OutletScheduleDto[]>> {
    return this.http.get<Api<M.OutletScheduleDto[]>>(RESTAURANT_API.outlets.schedules(outletId));
  }

  saveSchedules(outletId: string, dto: M.OutletScheduleDto[]): Observable<Api<M.OutletScheduleDto[]>> {
    return this.http.put<Api<M.OutletScheduleDto[]>>(RESTAURANT_API.outlets.schedules(outletId), dto);
  }

  /** Fills in whatever configuration this company is missing. Safe to call repeatedly. */
  provision(includeSampleData = false): Observable<Api<M.OutletDto[]>> {
    return this.http.post<Api<M.OutletDto[]>>(
      `${RESTAURANT_API.outlets.provision}?includeSampleData=${includeSampleData}`, {});
  }

  getSettings(): Observable<Api<M.RestaurantSettingsDto>> {
    return this.http.get<Api<M.RestaurantSettingsDto>>(RESTAURANT_API.outlets.settings);
  }

  updateSettings(dto: M.RestaurantSettingsDto): Observable<Api<M.RestaurantSettingsDto>> {
    return this.http.put<Api<M.RestaurantSettingsDto>>(RESTAURANT_API.outlets.settings, dto);
  }
}

// ── Floor ────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class FloorService {
  private http = inject(HttpClient);

  getPlan(outletId: string): Observable<Api<M.FloorPlanViewDto>> {
    return this.http.get<Api<M.FloorPlanViewDto>>(RESTAURANT_API.floor.plan(outletId));
  }

  getTables(outletId: string, floorId?: string): Observable<Api<M.TableDto[]>> {
    return this.http.get<Api<M.TableDto[]>>(RESTAURANT_API.floor.tables(outletId, floorId));
  }

  getTable(tableId: string): Observable<Api<M.TableDto>> {
    return this.http.get<Api<M.TableDto>>(RESTAURANT_API.floor.table(tableId));
  }

  seat(dto: M.SeatGuestsDto): Observable<Api<M.RestaurantOrderDto>> {
    return this.http.post<Api<M.RestaurantOrderDto>>(RESTAURANT_API.floor.seat, dto);
  }

  changeState(dto: M.ChangeTableStateDto): Observable<Api<M.TableDto>> {
    return this.http.post<Api<M.TableDto>>(RESTAURANT_API.floor.state, dto);
  }

  assignWaiter(dto: M.AssignWaiterDto): Observable<Api<M.TableDto>> {
    return this.http.post<Api<M.TableDto>>(RESTAURANT_API.floor.assignWaiter, dto);
  }

  transfer(dto: M.TransferTableDto): Observable<Api<M.TableDto>> {
    return this.http.post<Api<M.TableDto>>(RESTAURANT_API.floor.transfer, dto);
  }

  merge(dto: M.MergeTablesDto): Observable<Api<M.TableDto[]>> {
    return this.http.post<Api<M.TableDto[]>>(RESTAURANT_API.floor.merge, dto);
  }

  unmerge(primaryTableId: string): Observable<Api<M.TableDto[]>> {
    return this.http.post<Api<M.TableDto[]>>(RESTAURANT_API.floor.unmerge(primaryTableId), {});
  }

  clear(tableId: string): Observable<Api<M.TableDto>> {
    return this.http.post<Api<M.TableDto>>(RESTAURANT_API.floor.clear(tableId), {});
  }

  saveLayout(dto: M.SaveLayoutDto): Observable<Api<M.FloorDto>> {
    return this.http.post<Api<M.FloorDto>>(RESTAURANT_API.floor.saveLayout, dto);
  }

  getFloors(outletId: string): Observable<Api<M.FloorDto[]>> {
    return this.http.get<Api<M.FloorDto[]>>(RESTAURANT_API.floor.floors(outletId));
  }

  createFloor(dto: M.SaveFloorDto): Observable<Api<M.FloorDto>> {
    return this.http.post<Api<M.FloorDto>>(RESTAURANT_API.floor.createFloor, dto);
  }

  updateFloor(id: string, dto: M.SaveFloorDto): Observable<Api<M.FloorDto>> {
    return this.http.put<Api<M.FloorDto>>(RESTAURANT_API.floor.updateFloor(id), dto);
  }

  deleteFloor(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(RESTAURANT_API.floor.deleteFloor(id));
  }

  getSections(outletId: string): Observable<Api<M.SectionDto[]>> {
    return this.http.get<Api<M.SectionDto[]>>(RESTAURANT_API.floor.sections(outletId));
  }

  createSection(dto: M.SaveSectionDto): Observable<Api<M.SectionDto>> {
    return this.http.post<Api<M.SectionDto>>(RESTAURANT_API.floor.createSection, dto);
  }

  updateSection(id: string, dto: M.SaveSectionDto): Observable<Api<M.SectionDto>> {
    return this.http.put<Api<M.SectionDto>>(RESTAURANT_API.floor.updateSection(id), dto);
  }

  deleteSection(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(RESTAURANT_API.floor.deleteSection(id));
  }
}

// ── Menu ─────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class MenuService {
  private http = inject(HttpClient);

  getMenus(outletId?: string, activeNowOnly = false): Observable<Api<M.MenuCardDto[]>> {
    return this.http.get<Api<M.MenuCardDto[]>>(RESTAURANT_API.menu.menus(outletId, activeNowOnly));
  }

  createMenu(dto: M.SaveMenuCardDto): Observable<Api<M.MenuCardDto>> {
    return this.http.post<Api<M.MenuCardDto>>(RESTAURANT_API.menu.createMenu, dto);
  }

  updateMenu(id: string, dto: M.SaveMenuCardDto): Observable<Api<M.MenuCardDto>> {
    return this.http.put<Api<M.MenuCardDto>>(RESTAURANT_API.menu.updateMenu(id), dto);
  }

  deleteMenu(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(RESTAURANT_API.menu.deleteMenu(id));
  }

  getCategories(menuId?: string): Observable<Api<M.MenuCategoryDto[]>> {
    return this.http.get<Api<M.MenuCategoryDto[]>>(RESTAURANT_API.menu.categories(menuId));
  }

  createCategory(dto: M.SaveMenuCategoryDto): Observable<Api<M.MenuCategoryDto>> {
    return this.http.post<Api<M.MenuCategoryDto>>(RESTAURANT_API.menu.createCategory, dto);
  }

  updateCategory(id: string, dto: M.SaveMenuCategoryDto): Observable<Api<M.MenuCategoryDto>> {
    return this.http.put<Api<M.MenuCategoryDto>>(RESTAURANT_API.menu.updateCategory(id), dto);
  }

  deleteCategory(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(RESTAURANT_API.menu.deleteCategory(id));
  }

  getItems(opts: { menuId?: string; categoryId?: string; search?: string; page?: number; size?: number } = {}):
    Observable<M.PaginatedResponse<M.MenuItemDto>> {
    return this.http.get<M.PaginatedResponse<M.MenuItemDto>>(RESTAURANT_API.menu.items(opts));
  }

  getItem(id: string): Observable<Api<M.MenuItemDto>> {
    return this.http.get<Api<M.MenuItemDto>>(RESTAURANT_API.menu.item(id));
  }

  createItem(dto: M.SaveMenuItemDto): Observable<Api<M.MenuItemDto>> {
    return this.http.post<Api<M.MenuItemDto>>(RESTAURANT_API.menu.createItem, dto);
  }

  updateItem(id: string, dto: M.SaveMenuItemDto): Observable<Api<M.MenuItemDto>> {
    return this.http.put<Api<M.MenuItemDto>>(RESTAURANT_API.menu.updateItem(id), dto);
  }

  deleteItem(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(RESTAURANT_API.menu.deleteItem(id));
  }

  getModifierGroups(): Observable<Api<M.ModifierGroupDto[]>> {
    return this.http.get<Api<M.ModifierGroupDto[]>>(RESTAURANT_API.menu.modifierGroups);
  }

  createModifierGroup(dto: M.SaveModifierGroupDto): Observable<Api<M.ModifierGroupDto>> {
    return this.http.post<Api<M.ModifierGroupDto>>(RESTAURANT_API.menu.createModifierGroup, dto);
  }

  updateModifierGroup(id: string, dto: M.SaveModifierGroupDto): Observable<Api<M.ModifierGroupDto>> {
    return this.http.put<Api<M.ModifierGroupDto>>(RESTAURANT_API.menu.updateModifierGroup(id), dto);
  }

  deleteModifierGroup(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(RESTAURANT_API.menu.deleteModifierGroup(id));
  }

  getCombos(outletId?: string): Observable<Api<M.ComboMealDto[]>> {
    return this.http.get<Api<M.ComboMealDto[]>>(RESTAURANT_API.menu.combos(outletId));
  }

  createCombo(dto: M.ComboMealDto): Observable<Api<M.ComboMealDto>> {
    return this.http.post<Api<M.ComboMealDto>>(RESTAURANT_API.menu.createCombo, dto);
  }

  updateCombo(id: string, dto: M.ComboMealDto): Observable<Api<M.ComboMealDto>> {
    return this.http.put<Api<M.ComboMealDto>>(RESTAURANT_API.menu.updateCombo(id), dto);
  }

  deleteCombo(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(RESTAURANT_API.menu.deleteCombo(id));
  }

  get86List(outletId: string, unavailableOnly = true): Observable<Api<M.AvailabilityDto[]>> {
    return this.http.get<Api<M.AvailabilityDto[]>>(RESTAURANT_API.menu.availability(outletId, unavailableOnly));
  }

  set86(dto: M.Set86Dto): Observable<Api<M.AvailabilityDto>> {
    return this.http.post<Api<M.AvailabilityDto>>(RESTAURANT_API.menu.set86, dto);
  }

  getHappyHours(outletId?: string): Observable<Api<M.HappyHourRuleDto[]>> {
    return this.http.get<Api<M.HappyHourRuleDto[]>>(RESTAURANT_API.menu.happyHours(outletId));
  }

  createHappyHour(dto: M.HappyHourRuleDto): Observable<Api<M.HappyHourRuleDto>> {
    return this.http.post<Api<M.HappyHourRuleDto>>(RESTAURANT_API.menu.createHappyHour, dto);
  }

  updateHappyHour(id: string, dto: M.HappyHourRuleDto): Observable<Api<M.HappyHourRuleDto>> {
    return this.http.put<Api<M.HappyHourRuleDto>>(RESTAURANT_API.menu.updateHappyHour(id), dto);
  }

  deleteHappyHour(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(RESTAURANT_API.menu.deleteHappyHour(id));
  }

  /** The priced, filtered catalogue the order pad renders. */
  getCatalog(outletId: string, orderType: OrderType): Observable<Api<M.OrderPadCatalogDto>> {
    return this.http.get<Api<M.OrderPadCatalogDto>>(RESTAURANT_API.menu.catalog(outletId, orderType));
  }
}

// ── Kitchen ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class KitchenService {
  private http = inject(HttpClient);

  getDisplay(outletId: string, stationId?: string, includeBumped = false): Observable<Api<M.KitchenDisplayDto>> {
    return this.http.get<Api<M.KitchenDisplayDto>>(
      RESTAURANT_API.kitchen.display(outletId, stationId, includeBumped));
  }

  getTicketsForOrder(orderId: string): Observable<Api<M.KitchenTicketDto[]>> {
    return this.http.get<Api<M.KitchenTicketDto[]>>(RESTAURANT_API.kitchen.ticketsForOrder(orderId));
  }

  acknowledge(ticketId: string): Observable<Api<M.KitchenTicketDto>> {
    return this.http.post<Api<M.KitchenTicketDto>>(RESTAURANT_API.kitchen.acknowledge(ticketId), {});
  }

  start(ticketId: string): Observable<Api<M.KitchenTicketDto>> {
    return this.http.post<Api<M.KitchenTicketDto>>(RESTAURANT_API.kitchen.start(ticketId), {});
  }

  markReady(ticketId: string, lineId?: string): Observable<Api<M.KitchenTicketDto>> {
    return this.http.post<Api<M.KitchenTicketDto>>(RESTAURANT_API.kitchen.ready(ticketId, lineId), {});
  }

  bump(ticketId: string, ticketLineId?: string): Observable<Api<M.KitchenTicketDto>> {
    return this.http.post<Api<M.KitchenTicketDto>>(RESTAURANT_API.kitchen.bump, { ticketId, ticketLineId });
  }

  recall(ticketId: string, reason?: string): Observable<Api<M.KitchenTicketDto>> {
    return this.http.post<Api<M.KitchenTicketDto>>(RESTAURANT_API.kitchen.recall, { ticketId, reason });
  }

  setPriority(ticketId: string, isPriority: boolean): Observable<Api<M.KitchenTicketDto>> {
    return this.http.post<Api<M.KitchenTicketDto>>(RESTAURANT_API.kitchen.priority(ticketId, isPriority), {});
  }

  getStations(outletId: string): Observable<Api<M.KitchenStationDto[]>> {
    return this.http.get<Api<M.KitchenStationDto[]>>(RESTAURANT_API.kitchen.stations(outletId));
  }

  createStation(dto: M.SaveKitchenStationDto): Observable<Api<M.KitchenStationDto>> {
    return this.http.post<Api<M.KitchenStationDto>>(RESTAURANT_API.kitchen.createStation, dto);
  }

  updateStation(id: string, dto: M.SaveKitchenStationDto): Observable<Api<M.KitchenStationDto>> {
    return this.http.put<Api<M.KitchenStationDto>>(RESTAURANT_API.kitchen.updateStation(id), dto);
  }

  deleteStation(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(RESTAURANT_API.kitchen.deleteStation(id));
  }

  createRule(dto: M.StationRoutingRuleDto): Observable<Api<M.StationRoutingRuleDto>> {
    return this.http.post<Api<M.StationRoutingRuleDto>>(RESTAURANT_API.kitchen.createRule, dto);
  }

  updateRule(id: string, dto: M.StationRoutingRuleDto): Observable<Api<M.StationRoutingRuleDto>> {
    return this.http.put<Api<M.StationRoutingRuleDto>>(RESTAURANT_API.kitchen.updateRule(id), dto);
  }

  deleteRule(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(RESTAURANT_API.kitchen.deleteRule(id));
  }

  getPrinters(outletId: string): Observable<Api<M.PrinterProfileDto[]>> {
    return this.http.get<Api<M.PrinterProfileDto[]>>(RESTAURANT_API.kitchen.printers(outletId));
  }

  createPrinter(dto: M.PrinterProfileDto): Observable<Api<M.PrinterProfileDto>> {
    return this.http.post<Api<M.PrinterProfileDto>>(RESTAURANT_API.kitchen.createPrinter, dto);
  }

  updatePrinter(id: string, dto: M.PrinterProfileDto): Observable<Api<M.PrinterProfileDto>> {
    return this.http.put<Api<M.PrinterProfileDto>>(RESTAURANT_API.kitchen.updatePrinter(id), dto);
  }

  deletePrinter(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(RESTAURANT_API.kitchen.deletePrinter(id));
  }
}

// ── Orders ───────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class RestaurantOrderService {
  private http = inject(HttpClient);

  list(opts: Parameters<typeof RESTAURANT_API.orders.list>[0] = {}):
    Observable<M.PaginatedResponse<M.OrderSummaryDto>> {
    return this.http.get<M.PaginatedResponse<M.OrderSummaryDto>>(RESTAURANT_API.orders.list(opts));
  }

  getActive(outletId: string, waiterId?: string): Observable<Api<M.OrderSummaryDto[]>> {
    return this.http.get<Api<M.OrderSummaryDto[]>>(RESTAURANT_API.orders.active(outletId, waiterId));
  }

  getById(id: string): Observable<Api<M.RestaurantOrderDto>> {
    return this.http.get<Api<M.RestaurantOrderDto>>(RESTAURANT_API.orders.getById(id));
  }

  getByTable(tableId: string): Observable<Api<M.RestaurantOrderDto>> {
    return this.http.get<Api<M.RestaurantOrderDto>>(RESTAURANT_API.orders.byTable(tableId));
  }

  open(dto: M.OpenOrderDto): Observable<Api<M.RestaurantOrderDto>> {
    return this.http.post<Api<M.RestaurantOrderDto>>(RESTAURANT_API.orders.open, dto);
  }

  addLines(dto: M.AddLinesDto): Observable<Api<M.RestaurantOrderDto>> {
    return this.http.post<Api<M.RestaurantOrderDto>>(RESTAURANT_API.orders.addLines, dto);
  }

  updateLine(lineId: string, dto: M.UpdateOrderLineDto): Observable<Api<M.RestaurantOrderDto>> {
    return this.http.put<Api<M.RestaurantOrderDto>>(RESTAURANT_API.orders.updateLine(lineId), dto);
  }

  voidLine(dto: M.VoidLineDto): Observable<Api<M.RestaurantOrderDto>> {
    return this.http.post<Api<M.RestaurantOrderDto>>(RESTAURANT_API.orders.voidLine, dto);
  }

  moveLines(dto: M.MoveLinesDto): Observable<Api<M.RestaurantOrderDto>> {
    return this.http.post<Api<M.RestaurantOrderDto>>(RESTAURANT_API.orders.moveLines, dto);
  }

  fire(dto: M.FireCourseDto): Observable<Api<M.RestaurantOrderDto>> {
    return this.http.post<Api<M.RestaurantOrderDto>>(RESTAURANT_API.orders.fire, dto);
  }

  markServed(id: string, lineIds: string[] = []): Observable<Api<M.RestaurantOrderDto>> {
    return this.http.post<Api<M.RestaurantOrderDto>>(RESTAURANT_API.orders.served(id), lineIds);
  }

  update(id: string, dto: M.UpdateOrderDto): Observable<Api<M.RestaurantOrderDto>> {
    return this.http.put<Api<M.RestaurantOrderDto>>(RESTAURANT_API.orders.update(id), dto);
  }

  cancel(id: string, dto: M.CancelOrderDto): Observable<Api<M.RestaurantOrderDto>> {
    return this.http.post<Api<M.RestaurantOrderDto>>(RESTAURANT_API.orders.cancel(id), dto);
  }

  updateDelivery(id: string, dto: M.UpdateDeliveryStatusDto): Observable<Api<M.RestaurantDeliveryDto>> {
    return this.http.put<Api<M.RestaurantDeliveryDto>>(RESTAURANT_API.orders.delivery(id), dto);
  }
}

// ── Checks ───────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class CheckService {
  private http = inject(HttpClient);

  list(opts: Parameters<typeof RESTAURANT_API.checks.list>[0] = {}):
    Observable<M.PaginatedResponse<M.RestaurantCheckDto>> {
    return this.http.get<M.PaginatedResponse<M.RestaurantCheckDto>>(RESTAURANT_API.checks.list(opts));
  }

  getById(id: string): Observable<Api<M.RestaurantCheckDto>> {
    return this.http.get<Api<M.RestaurantCheckDto>>(RESTAURANT_API.checks.getById(id));
  }

  forOrder(orderId: string): Observable<Api<M.RestaurantCheckDto[]>> {
    return this.http.get<Api<M.RestaurantCheckDto[]>>(RESTAURANT_API.checks.forOrder(orderId));
  }

  create(dto: M.CreateChecksDto): Observable<Api<M.RestaurantCheckDto[]>> {
    return this.http.post<Api<M.RestaurantCheckDto[]>>(RESTAURANT_API.checks.create, dto);
  }

  takePayment(dto: M.TakePaymentDto): Observable<Api<M.RestaurantCheckDto>> {
    return this.http.post<Api<M.RestaurantCheckDto>>(RESTAURANT_API.checks.payment, dto);
  }

  applyDiscount(dto: M.ApplyDiscountDto): Observable<Api<M.RestaurantCheckDto>> {
    return this.http.post<Api<M.RestaurantCheckDto>>(RESTAURANT_API.checks.discount, dto);
  }

  removeDiscount(id: string): Observable<Api<M.RestaurantCheckDto>> {
    return this.http.delete<Api<M.RestaurantCheckDto>>(RESTAURANT_API.checks.removeDiscount(id));
  }

  addTip(dto: M.AddTipDto): Observable<Api<M.RestaurantCheckDto>> {
    return this.http.post<Api<M.RestaurantCheckDto>>(RESTAURANT_API.checks.tip, dto);
  }

  waiveServiceCharge(dto: M.WaiveServiceChargeDto): Observable<Api<M.RestaurantCheckDto>> {
    return this.http.post<Api<M.RestaurantCheckDto>>(RESTAURANT_API.checks.waiveServiceCharge, dto);
  }

  void(dto: M.VoidCheckDto): Observable<Api<M.RestaurantCheckDto>> {
    return this.http.post<Api<M.RestaurantCheckDto>>(RESTAURANT_API.checks.void, dto);
  }

  refund(dto: M.RefundPaymentDto): Observable<Api<M.RestaurantCheckDto>> {
    return this.http.post<Api<M.RestaurantCheckDto>>(RESTAURANT_API.checks.refund, dto);
  }

  markPrinted(id: string): Observable<Api<M.RestaurantCheckDto>> {
    return this.http.post<Api<M.RestaurantCheckDto>>(RESTAURANT_API.checks.printed(id), {});
  }

  getVoidReasons(): Observable<Api<M.VoidReasonDto[]>> {
    return this.http.get<Api<M.VoidReasonDto[]>>(RESTAURANT_API.checks.voidReasons);
  }

  saveVoidReason(dto: M.VoidReasonDto): Observable<Api<M.VoidReasonDto>> {
    return this.http.post<Api<M.VoidReasonDto>>(RESTAURANT_API.checks.saveVoidReason, dto);
  }

  deleteVoidReason(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(RESTAURANT_API.checks.deleteVoidReason(id));
  }

  getDiscountReasons(): Observable<Api<M.DiscountReasonDto[]>> {
    return this.http.get<Api<M.DiscountReasonDto[]>>(RESTAURANT_API.checks.discountReasons);
  }

  saveDiscountReason(dto: M.DiscountReasonDto): Observable<Api<M.DiscountReasonDto>> {
    return this.http.post<Api<M.DiscountReasonDto>>(RESTAURANT_API.checks.saveDiscountReason, dto);
  }

  deleteDiscountReason(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(RESTAURANT_API.checks.deleteDiscountReason(id));
  }

  getServiceCharges(outletId?: string): Observable<Api<M.ServiceChargeRuleDto[]>> {
    return this.http.get<Api<M.ServiceChargeRuleDto[]>>(RESTAURANT_API.checks.serviceCharges(outletId));
  }

  saveServiceCharge(dto: M.ServiceChargeRuleDto): Observable<Api<M.ServiceChargeRuleDto>> {
    return this.http.post<Api<M.ServiceChargeRuleDto>>(RESTAURANT_API.checks.saveServiceCharge, dto);
  }

  deleteServiceCharge(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(RESTAURANT_API.checks.deleteServiceCharge(id));
  }
}

// ── Front of house ───────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class FrontOfHouseService {
  private http = inject(HttpClient);

  getReservations(outletId: string, from?: string, to?: string, status?: number):
    Observable<Api<M.ReservationDto[]>> {
    return this.http.get<Api<M.ReservationDto[]>>(RESTAURANT_API.foh.reservations(outletId, from, to, status));
  }

  getReservation(id: string): Observable<Api<M.ReservationDto>> {
    return this.http.get<Api<M.ReservationDto>>(RESTAURANT_API.foh.reservation(id));
  }

  createReservation(dto: M.SaveReservationDto): Observable<Api<M.ReservationDto>> {
    return this.http.post<Api<M.ReservationDto>>(RESTAURANT_API.foh.createReservation, dto);
  }

  updateReservation(id: string, dto: M.SaveReservationDto): Observable<Api<M.ReservationDto>> {
    return this.http.put<Api<M.ReservationDto>>(RESTAURANT_API.foh.updateReservation(id), dto);
  }

  changeReservationStatus(id: string, dto: M.ChangeReservationStatusDto): Observable<Api<M.ReservationDto>> {
    return this.http.post<Api<M.ReservationDto>>(RESTAURANT_API.foh.reservationStatus(id), dto);
  }

  checkAvailability(outletId: string, forTime: string, partySize: number, durationMinutes = 0):
    Observable<Api<M.ReservationAvailabilityDto>> {
    return this.http.get<Api<M.ReservationAvailabilityDto>>(
      RESTAURANT_API.foh.availability(outletId, forTime, partySize, durationMinutes));
  }

  getWaitlist(outletId: string, activeOnly = true): Observable<Api<M.WaitlistEntryDto[]>> {
    return this.http.get<Api<M.WaitlistEntryDto[]>>(RESTAURANT_API.foh.waitlist(outletId, activeOnly));
  }

  addToWaitlist(dto: M.SaveWaitlistEntryDto): Observable<Api<M.WaitlistEntryDto>> {
    return this.http.post<Api<M.WaitlistEntryDto>>(RESTAURANT_API.foh.addWaitlist, dto);
  }

  updateWaitlist(id: string, dto: M.SaveWaitlistEntryDto): Observable<Api<M.WaitlistEntryDto>> {
    return this.http.put<Api<M.WaitlistEntryDto>>(RESTAURANT_API.foh.updateWaitlist(id), dto);
  }

  changeWaitlistStatus(id: string, dto: M.ChangeWaitlistStatusDto): Observable<Api<M.WaitlistEntryDto>> {
    return this.http.post<Api<M.WaitlistEntryDto>>(RESTAURANT_API.foh.waitlistStatus(id), dto);
  }

  getGuests(search?: string, vipOnly = false): Observable<Api<M.GuestProfileDto[]>> {
    return this.http.get<Api<M.GuestProfileDto[]>>(RESTAURANT_API.foh.guests(search, vipOnly));
  }

  getGuest(id: string): Observable<Api<M.GuestProfileDto>> {
    return this.http.get<Api<M.GuestProfileDto>>(RESTAURANT_API.foh.guest(id));
  }

  createGuest(dto: M.SaveGuestProfileDto): Observable<Api<M.GuestProfileDto>> {
    return this.http.post<Api<M.GuestProfileDto>>(RESTAURANT_API.foh.createGuest, dto);
  }

  updateGuest(id: string, dto: M.SaveGuestProfileDto): Observable<Api<M.GuestProfileDto>> {
    return this.http.put<Api<M.GuestProfileDto>>(RESTAURANT_API.foh.updateGuest(id), dto);
  }

  deleteGuest(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(RESTAURANT_API.foh.deleteGuest(id));
  }

  getFeedback(outletId: string, from?: string, to?: string, unresolvedOnly = false):
    Observable<Api<M.CustomerFeedbackDto[]>> {
    return this.http.get<Api<M.CustomerFeedbackDto[]>>(
      RESTAURANT_API.foh.feedback(outletId, from, to, unresolvedOnly));
  }

  resolveFeedback(id: string, note?: string): Observable<Api<M.CustomerFeedbackDto>> {
    return this.http.post<Api<M.CustomerFeedbackDto>>(RESTAURANT_API.foh.resolveFeedback(id), note ?? null);
  }
}

// ── Staff ────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class RestaurantStaffService {
  private http = inject(HttpClient);

  /**
   * Who is signed in at the till, and what they may do.
   *
   * Held in a signal rather than a route param because the operational screens all need it and
   * a waiter who signs in on the floor plan should not have to sign in again on the order pad.
   * It is a convenience only — the server checks the same permissions independently on every
   * call, so tampering with this buys nothing.
   */
  readonly session = signal<M.StaffSessionDto | null>(null);

  pinLogin(dto: { outletId: string; pin: string }): Observable<Api<M.StaffSessionDto>> {
    return this.http.post<Api<M.StaffSessionDto>>(RESTAURANT_API.staff.pinLogin, dto);
  }

  signOut(): void {
    this.session.set(null);
  }

  setPin(dto: { staffId: string; pin: string }): Observable<Api<void>> {
    return this.http.post<Api<void>>(RESTAURANT_API.staff.setPin, dto);
  }

  verifyApproval(outletId: string, pin: string, permission: string): Observable<Api<M.StaffSessionDto>> {
    return this.http.post<Api<M.StaffSessionDto>>(
      RESTAURANT_API.staff.verifyApproval(outletId, pin, permission), {});
  }

  getStaff(outletId?: string, role?: number, activeOnly = true): Observable<Api<M.RestaurantStaffDto[]>> {
    return this.http.get<Api<M.RestaurantStaffDto[]>>(RESTAURANT_API.staff.list(outletId, role, activeOnly));
  }

  getById(id: string): Observable<Api<M.RestaurantStaffDto>> {
    return this.http.get<Api<M.RestaurantStaffDto>>(RESTAURANT_API.staff.getById(id));
  }

  create(dto: M.SaveRestaurantStaffDto): Observable<Api<M.RestaurantStaffDto>> {
    return this.http.post<Api<M.RestaurantStaffDto>>(RESTAURANT_API.staff.create, dto);
  }

  update(id: string, dto: M.SaveRestaurantStaffDto): Observable<Api<M.RestaurantStaffDto>> {
    return this.http.put<Api<M.RestaurantStaffDto>>(RESTAURANT_API.staff.update(id), dto);
  }

  delete(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(RESTAURANT_API.staff.delete(id));
  }

  getShifts(outletId: string, from?: string, to?: string, staffId?: string): Observable<Api<M.StaffShiftDto[]>> {
    return this.http.get<Api<M.StaffShiftDto[]>>(RESTAURANT_API.staff.shifts(outletId, from, to, staffId));
  }

  createShift(dto: M.SaveStaffShiftDto): Observable<Api<M.StaffShiftDto>> {
    return this.http.post<Api<M.StaffShiftDto>>(RESTAURANT_API.staff.createShift, dto);
  }

  updateShift(id: string, dto: M.SaveStaffShiftDto): Observable<Api<M.StaffShiftDto>> {
    return this.http.put<Api<M.StaffShiftDto>>(RESTAURANT_API.staff.updateShift(id), dto);
  }

  deleteShift(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(RESTAURANT_API.staff.deleteShift(id));
  }

  clockIn(dto: M.ClockDto): Observable<Api<M.TimeClockEntryDto>> {
    return this.http.post<Api<M.TimeClockEntryDto>>(RESTAURANT_API.staff.clockIn, dto);
  }

  clockOut(staffId: string): Observable<Api<M.TimeClockEntryDto>> {
    return this.http.post<Api<M.TimeClockEntryDto>>(RESTAURANT_API.staff.clockOut(staffId), {});
  }

  getTimeClock(outletId: string, from?: string, to?: string, staffId?: string):
    Observable<Api<M.TimeClockEntryDto[]>> {
    return this.http.get<Api<M.TimeClockEntryDto[]>>(RESTAURANT_API.staff.timeClock(outletId, from, to, staffId));
  }

  getTips(outletId: string, from?: string, to?: string, waiterId?: string): Observable<Api<M.TipRecordDto[]>> {
    return this.http.get<Api<M.TipRecordDto[]>>(RESTAURANT_API.staff.tips(outletId, from, to, waiterId));
  }

  getTipPools(outletId: string, from?: string, to?: string): Observable<Api<M.TipPoolDto[]>> {
    return this.http.get<Api<M.TipPoolDto[]>>(RESTAURANT_API.staff.tipPools(outletId, from, to));
  }

  createTipPool(dto: M.CreateTipPoolDto): Observable<Api<M.TipPoolDto>> {
    return this.http.post<Api<M.TipPoolDto>>(RESTAURANT_API.staff.createTipPool, dto);
  }

  calculateTipPool(id: string): Observable<Api<M.TipPoolDto>> {
    return this.http.post<Api<M.TipPoolDto>>(RESTAURANT_API.staff.calculateTipPool(id), {});
  }

  finaliseTipPool(id: string): Observable<Api<M.TipPoolDto>> {
    return this.http.post<Api<M.TipPoolDto>>(RESTAURANT_API.staff.finaliseTipPool(id), {});
  }
}

// ── Sessions ─────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class RestaurantSessionService {
  private http = inject(HttpClient);

  list(opts: Parameters<typeof RESTAURANT_API.sessions.list>[0] = {}):
    Observable<M.PaginatedResponse<M.RestaurantSessionDto>> {
    return this.http.get<M.PaginatedResponse<M.RestaurantSessionDto>>(RESTAURANT_API.sessions.list(opts));
  }

  getById(id: string): Observable<Api<M.RestaurantSessionDto>> {
    return this.http.get<Api<M.RestaurantSessionDto>>(RESTAURANT_API.sessions.getById(id));
  }

  getOpen(outletId: string, terminalName?: string): Observable<Api<M.RestaurantSessionDto>> {
    return this.http.get<Api<M.RestaurantSessionDto>>(RESTAURANT_API.sessions.open(outletId, terminalName));
  }

  openSession(dto: M.OpenSessionDto): Observable<Api<M.RestaurantSessionDto>> {
    return this.http.post<Api<M.RestaurantSessionDto>>(RESTAURANT_API.sessions.openSession, dto);
  }

  closeSession(dto: M.CloseSessionDto): Observable<Api<M.RestaurantSessionDto>> {
    return this.http.post<Api<M.RestaurantSessionDto>>(RESTAURANT_API.sessions.closeSession, dto);
  }

  addCashMovement(dto: M.AddCashMovementDto): Observable<Api<M.SessionCashMovementDto>> {
    return this.http.post<Api<M.SessionCashMovementDto>>(RESTAURANT_API.sessions.cashMovement, dto);
  }

  xRead(id: string): Observable<Api<M.ReadReportDto>> {
    return this.http.get<Api<M.ReadReportDto>>(RESTAURANT_API.sessions.xRead(id));
  }

  zRead(id: string): Observable<Api<M.ReadReportDto>> {
    return this.http.get<Api<M.ReadReportDto>>(RESTAURANT_API.sessions.zRead(id));
  }
}

// ── Recipes ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private http = inject(HttpClient);

  getAll(menuItemId?: string, includeSubRecipes = true): Observable<Api<M.RecipeDto[]>> {
    return this.http.get<Api<M.RecipeDto[]>>(RESTAURANT_API.recipes.list(menuItemId, includeSubRecipes));
  }

  getById(id: string): Observable<Api<M.RecipeDto>> {
    return this.http.get<Api<M.RecipeDto>>(RESTAURANT_API.recipes.getById(id));
  }

  create(dto: M.SaveRecipeDto): Observable<Api<M.RecipeDto>> {
    return this.http.post<Api<M.RecipeDto>>(RESTAURANT_API.recipes.create, dto);
  }

  update(id: string, dto: M.SaveRecipeDto): Observable<Api<M.RecipeDto>> {
    return this.http.put<Api<M.RecipeDto>>(RESTAURANT_API.recipes.update(id), dto);
  }

  delete(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(RESTAURANT_API.recipes.delete(id));
  }

  recalculate(id: string): Observable<Api<M.RecipeDto>> {
    return this.http.post<Api<M.RecipeDto>>(RESTAURANT_API.recipes.recalculate(id), {});
  }

  recalculateAll(): Observable<Api<number>> {
    return this.http.post<Api<number>>(RESTAURANT_API.recipes.recalculateAll, {});
  }

  getWastage(outletId: string, from?: string, to?: string, reason?: number): Observable<Api<M.WastageLogDto[]>> {
    return this.http.get<Api<M.WastageLogDto[]>>(RESTAURANT_API.recipes.wastage(outletId, from, to, reason));
  }

  logWastage(dto: M.SaveWastageDto): Observable<Api<M.WastageLogDto>> {
    return this.http.post<Api<M.WastageLogDto>>(RESTAURANT_API.recipes.logWastage, dto);
  }

  deleteWastage(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(RESTAURANT_API.recipes.deleteWastage(id));
  }
}

// ── Reports ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class RestaurantReportService {
  private http = inject(HttpClient);

  dashboard(outletId?: string): Observable<Api<M.RestaurantDashboardDto>> {
    return this.http.get<Api<M.RestaurantDashboardDto>>(RESTAURANT_API.reports.dashboard(outletId));
  }

  salesSummary(filter: M.ReportFilterDto): Observable<Api<M.SalesSummaryReportDto>> {
    return this.http.post<Api<M.SalesSummaryReportDto>>(RESTAURANT_API.reports.salesSummary, filter);
  }

  menuEngineering(filter: M.ReportFilterDto): Observable<Api<M.MenuEngineeringReportDto>> {
    return this.http.post<Api<M.MenuEngineeringReportDto>>(RESTAURANT_API.reports.menuEngineering, filter);
  }

  waiterPerformance(filter: M.ReportFilterDto): Observable<Api<M.WaiterPerformanceDto[]>> {
    return this.http.post<Api<M.WaiterPerformanceDto[]>>(RESTAURANT_API.reports.waiterPerformance, filter);
  }

  tableTurnover(filter: M.ReportFilterDto): Observable<Api<M.TableTurnoverDto[]>> {
    return this.http.post<Api<M.TableTurnoverDto[]>>(RESTAURANT_API.reports.tableTurnover, filter);
  }

  kitchenPerformance(filter: M.ReportFilterDto): Observable<Api<M.KitchenPerformanceDto[]>> {
    return this.http.post<Api<M.KitchenPerformanceDto[]>>(RESTAURANT_API.reports.kitchenPerformance, filter);
  }

  voidAudit(filter: M.ReportFilterDto): Observable<Api<M.VoidAuditRowDto[]>> {
    return this.http.post<Api<M.VoidAuditRowDto[]>>(RESTAURANT_API.reports.voidAudit, filter);
  }

  wastageSummary(filter: M.ReportFilterDto): Observable<Api<M.WastageSummaryDto[]>> {
    return this.http.post<Api<M.WastageSummaryDto[]>>(RESTAURANT_API.reports.wastageSummary, filter);
  }

  itemSales(filter: M.ReportFilterDto): Observable<Api<M.ItemSalesDto[]>> {
    return this.http.post<Api<M.ItemSalesDto[]>>(RESTAURANT_API.reports.itemSales, filter);
  }
}

// ── Shared UI state ──────────────────────────────────────────────────────────

/**
 * The outlet every Restaurant screen is currently working in.
 *
 * A restaurant company usually runs one venue, and being asked to pick it on every screen is
 * friction with no benefit. The choice is kept here and persisted, so switching outlet is a
 * deliberate act rather than a per-page chore.
 */
@Injectable({ providedIn: 'root' })
export class RestaurantContextService {
  private static readonly KEY = 'nexcore.restaurant.outlet';
  private outlets = inject(OutletService);

  readonly outletId = signal<string | null>(this.read());
  readonly outlets$ = signal<M.OutletDto[]>([]);
  readonly loaded = signal(false);

  private read(): string | null {
    try { return localStorage.getItem(RestaurantContextService.KEY); } catch { return null; }
  }

  setOutlet(id: string | null): void {
    this.outletId.set(id);
    try {
      if (id) localStorage.setItem(RestaurantContextService.KEY, id);
      else localStorage.removeItem(RestaurantContextService.KEY);
    } catch {
      // A blocked or full storage quota must not stop the app working.
    }
  }

  /** True while the app is standing itself up for the first time. */
  readonly provisioning = signal(false);

  /**
   * Loads the outlet list once, and picks a sensible default if none is chosen yet.
   *
   * If the company has no outlet at all, the Restaurant app has never been provisioned here —
   * which happens whenever it is installed onto a business that already existed. Rather than
   * dropping the user on a screen where every button silently fails, we stand the essentials up
   * and carry on. Sample data is never added this way; that is a choice made at registration.
   */
  async ensureLoaded(force = false): Promise<M.OutletDto[]> {
    if (this.loaded() && !force) return this.outlets$();

    let list = await this.fetch();

    if (list.length === 0) {
      this.provisioning.set(true);
      const provisioned = await new Promise<M.ApiResponse<M.OutletDto[]> | null>(resolve => {
        this.outlets.provision(false).subscribe({
          next: r => resolve(r),
          error: () => resolve(null),
        });
      });
      this.provisioning.set(false);

      list = provisioned?.data ?? await this.fetch();
    }

    this.outlets$.set(list);
    this.loaded.set(true);

    const current = this.outletId();
    if (!current || !list.some(o => o.id === current)) this.setOutlet(list[0]?.id ?? null);

    return list;
  }

  private async fetch(): Promise<M.OutletDto[]> {
    const res = await new Promise<M.ApiResponse<M.OutletDto[]> | null>(resolve => {
      this.outlets.getAll(true).subscribe({
        next: r => resolve(r),
        error: () => resolve(null),
      });
    });

    return res?.data ?? [];
  }

  get current(): M.OutletDto | undefined {
    const id = this.outletId();
    return this.outlets$().find(o => o.id === id);
  }
}
