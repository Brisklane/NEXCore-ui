import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DISTRIBUTION_API as API } from './distribution-api-config';
import * as M from '../models/distribution.models';
import * as E from '../models/distribution.enums';

type Api<T> = M.ApiResponse<T>;
type Page<T> = M.PaginatedResponse<T>;

/** Loose query bag; the API config drops empty values before building the string. */
type Q = Record<string, unknown>;

// ── Network ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class PartnerService {
  private http = inject(HttpClient);

  list(query: Q = {}): Observable<Page<M.PartnerDto>> {
    return this.http.get<Page<M.PartnerDto>>(API.partners.list(query));
  }

  tree(rootPartnerId?: string): Observable<Api<M.PartnerTreeNodeDto[]>> {
    return this.http.get<Api<M.PartnerTreeNodeDto[]>>(API.partners.tree(rootPartnerId));
  }

  get(id: string): Observable<Api<M.PartnerDto>> {
    return this.http.get<Api<M.PartnerDto>>(API.partners.get(id));
  }

  create(dto: M.SavePartnerDto): Observable<Api<M.PartnerDto>> {
    return this.http.post<Api<M.PartnerDto>>(API.partners.create, dto);
  }

  update(id: string, dto: M.SavePartnerDto): Observable<Api<M.PartnerDto>> {
    return this.http.put<Api<M.PartnerDto>>(API.partners.update(id), dto);
  }

  changeStatus(id: string, dto: M.ChangePartnerStatusDto): Observable<Api<M.PartnerDto>> {
    return this.http.post<Api<M.PartnerDto>>(API.partners.status(id), dto);
  }

  delete(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(API.partners.delete(id));
  }

  documents(id: string): Observable<Api<M.PartnerDocumentDto[]>> {
    return this.http.get<Api<M.PartnerDocumentDto[]>>(API.partners.documents(id));
  }

  saveDocument(id: string, dto: M.PartnerDocumentDto): Observable<Api<M.PartnerDocumentDto>> {
    return this.http.post<Api<M.PartnerDocumentDto>>(API.partners.documents(id), dto);
  }

  verifyDocument(documentId: string, note?: string): Observable<Api<M.PartnerDocumentDto>> {
    return this.http.post<Api<M.PartnerDocumentDto>>(API.partners.verifyDocument(documentId), JSON.stringify(note ?? ''), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  expiringDocuments(withinDays = 30): Observable<Api<M.PartnerDocumentDto[]>> {
    return this.http.get<Api<M.PartnerDocumentDto[]>>(API.partners.expiringDocuments(withinDays));
  }
}

@Injectable({ providedIn: 'root' })
export class OutletService {
  private http = inject(HttpClient);

  list(query: Q = {}): Observable<Page<M.OutletDto>> {
    return this.http.get<Page<M.OutletDto>>(API.outlets.list(query));
  }

  get(id: string): Observable<Api<M.OutletDto>> {
    return this.http.get<Api<M.OutletDto>>(API.outlets.get(id));
  }

  get360(id: string): Observable<Api<M.Outlet360Dto>> {
    return this.http.get<Api<M.Outlet360Dto>>(API.outlets.get360(id));
  }

  create(dto: M.SaveOutletDto): Observable<Api<M.OutletDto>> {
    return this.http.post<Api<M.OutletDto>>(API.outlets.create, dto);
  }

  update(id: string, dto: M.SaveOutletDto): Observable<Api<M.OutletDto>> {
    return this.http.put<Api<M.OutletDto>>(API.outlets.update(id), dto);
  }

  onboard(dto: M.OnboardOutletDto): Observable<Api<M.OutletDto>> {
    return this.http.post<Api<M.OutletDto>>(API.outlets.onboard, dto);
  }

  duplicates(query: Q): Observable<Api<M.DuplicateCandidateDto[]>> {
    return this.http.get<Api<M.DuplicateCandidateDto[]>>(API.outlets.duplicates(query));
  }

  approve(id: string, isApproved: boolean, reason?: string): Observable<Api<M.OutletDto>> {
    return this.http.post<Api<M.OutletDto>>(API.outlets.approve(id, isApproved, reason), {});
  }

  changeStatus(id: string, status: E.OutletStatus, reason?: string): Observable<Api<M.OutletDto>> {
    return this.http.post<Api<M.OutletDto>>(API.outlets.status(id, status, reason), {});
  }

  merge(survivorId: string, duplicateId: string): Observable<Api<M.OutletDto>> {
    return this.http.post<Api<M.OutletDto>>(API.outlets.merge(survivorId, duplicateId), {});
  }

  delete(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(API.outlets.delete(id));
  }

  assets(query: Q = {}): Observable<Api<M.OutletAssetDto[]>> {
    return this.http.get<Api<M.OutletAssetDto[]>>(API.outlets.assets(query));
  }

  createAsset(dto: M.OutletAssetDto): Observable<Api<M.OutletAssetDto>> {
    return this.http.post<Api<M.OutletAssetDto>>(API.outlets.createAsset, dto);
  }

  updateAsset(id: string, dto: M.OutletAssetDto): Observable<Api<M.OutletAssetDto>> {
    return this.http.put<Api<M.OutletAssetDto>>(API.outlets.updateAsset(id), dto);
  }

  verifyAsset(id: string, query: Q): Observable<Api<M.OutletAssetDto>> {
    return this.http.post<Api<M.OutletAssetDto>>(API.outlets.verifyAsset(id, query), {});
  }

  photos(id: string, tag?: string): Observable<Api<M.OutletPhotoDto[]>> {
    return this.http.get<Api<M.OutletPhotoDto[]>>(API.outlets.photos(id, tag));
  }

  addPhoto(dto: Partial<M.OutletPhotoDto>): Observable<Api<M.OutletPhotoDto>> {
    return this.http.post<Api<M.OutletPhotoDto>>(API.outlets.addPhoto, dto);
  }

  notes(id: string): Observable<Api<M.OutletNoteDto[]>> {
    return this.http.get<Api<M.OutletNoteDto[]>>(API.outlets.notes(id));
  }

  addNote(dto: Partial<M.OutletNoteDto>): Observable<Api<M.OutletNoteDto>> {
    return this.http.post<Api<M.OutletNoteDto>>(API.outlets.addNote, dto);
  }
}

@Injectable({ providedIn: 'root' })
export class RouteService {
  private http = inject(HttpClient);

  geoTree(rootId?: string): Observable<Api<M.GeoNodeDto[]>> {
    return this.http.get<Api<M.GeoNodeDto[]>>(API.routes.geoTree(rootId));
  }

  saveGeo(id: string | null, dto: Partial<M.GeoNodeDto>): Observable<Api<M.GeoNodeDto>> {
    return id
      ? this.http.put<Api<M.GeoNodeDto>>(API.routes.updateGeo(id), dto)
      : this.http.post<Api<M.GeoNodeDto>>(API.routes.createGeo, dto);
  }

  deleteGeo(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(API.routes.deleteGeo(id));
  }

  territoryTree(rootId?: string): Observable<Api<M.TerritoryDto[]>> {
    return this.http.get<Api<M.TerritoryDto[]>>(API.routes.territoryTree(rootId));
  }

  territories(query: Q = {}): Observable<Page<M.TerritoryDto>> {
    return this.http.get<Page<M.TerritoryDto>>(API.routes.territories(query));
  }

  territory(id: string): Observable<Api<M.TerritoryDto>> {
    return this.http.get<Api<M.TerritoryDto>>(API.routes.territory(id));
  }

  saveTerritory(id: string | null, dto: M.SaveTerritoryDto): Observable<Api<M.TerritoryDto>> {
    return id
      ? this.http.put<Api<M.TerritoryDto>>(API.routes.updateTerritory(id), dto)
      : this.http.post<Api<M.TerritoryDto>>(API.routes.createTerritory, dto);
  }

  deleteTerritory(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(API.routes.deleteTerritory(id));
  }

  list(query: Q = {}): Observable<Page<M.RouteDto>> {
    return this.http.get<Page<M.RouteDto>>(API.routes.list(query));
  }

  get(id: string): Observable<Api<M.RouteDto>> {
    return this.http.get<Api<M.RouteDto>>(API.routes.get(id));
  }

  save(id: string | null, dto: M.SaveRouteDto): Observable<Api<M.RouteDto>> {
    return id
      ? this.http.put<Api<M.RouteDto>>(API.routes.update(id), dto)
      : this.http.post<Api<M.RouteDto>>(API.routes.create, dto);
  }

  delete(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(API.routes.delete(id));
  }

  addOutlets(dto: M.AddOutletsToRouteDto): Observable<Api<M.RouteDto>> {
    return this.http.post<Api<M.RouteDto>>(API.routes.addOutlets, dto);
  }

  removeOutlet(routeId: string, outletId: string): Observable<Api<M.RouteDto>> {
    return this.http.delete<Api<M.RouteDto>>(API.routes.removeOutlet(routeId, outletId));
  }

  resequence(dto: M.ResequenceRouteDto): Observable<Api<M.RouteDto>> {
    return this.http.post<Api<M.RouteDto>>(API.routes.resequence, dto);
  }

  assign(dto: M.AssignRouteDto): Observable<Api<M.RouteDto>> {
    return this.http.post<Api<M.RouteDto>>(API.routes.assign, dto);
  }

  split(id: string, newRouteName: string, outletIds: string[]): Observable<Api<M.RouteDto[]>> {
    return this.http.post<Api<M.RouteDto[]>>(API.routes.split(id, newRouteName), outletIds);
  }

  unrouted(query: Q = {}): Observable<Page<M.OutletDto>> {
    return this.http.get<Page<M.OutletDto>>(API.routes.unrouted(query));
  }

  journeyPlans(query: Q): Observable<Api<M.JourneyPlanDto[]>> {
    return this.http.get<Api<M.JourneyPlanDto[]>>(API.routes.journeyPlans(query));
  }

  journeyPlan(fieldRepId: string, periodStart: string): Observable<Api<M.JourneyPlanDto>> {
    return this.http.get<Api<M.JourneyPlanDto>>(API.routes.journeyPlan(fieldRepId, periodStart));
  }

  generateJourney(dto: M.GenerateJourneyPlanDto): Observable<Api<M.JourneyPlanDto>> {
    return this.http.post<Api<M.JourneyPlanDto>>(API.routes.generateJourney, dto);
  }

  publishJourney(planId: string): Observable<Api<M.JourneyPlanDto>> {
    return this.http.post<Api<M.JourneyPlanDto>>(API.routes.publishJourney(planId), {});
  }

  updateJourneyDay(dayId: string, dto: M.UpdateJourneyPlanDayDto): Observable<Api<M.JourneyPlanDayDto>> {
    return this.http.put<Api<M.JourneyPlanDayDto>>(API.routes.updateJourneyDay(dayId), dto);
  }
}

// ── Field ────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class FieldService {
  private http = inject(HttpClient);

  reps(query: Q = {}): Observable<Page<M.FieldRepDto>> {
    return this.http.get<Page<M.FieldRepDto>>(API.field.reps(query));
  }

  rep(id: string): Observable<Api<M.FieldRepDto>> {
    return this.http.get<Api<M.FieldRepDto>>(API.field.rep(id));
  }

  saveRep(id: string | null, dto: M.SaveFieldRepDto): Observable<Api<M.FieldRepDto>> {
    return id
      ? this.http.put<Api<M.FieldRepDto>>(API.field.updateRep(id), dto)
      : this.http.post<Api<M.FieldRepDto>>(API.field.createRep, dto);
  }

  deleteRep(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(API.field.deleteRep(id));
  }

  authenticate(code: string, pin: string): Observable<Api<M.FieldRepDto>> {
    return this.http.post<Api<M.FieldRepDto>>(API.field.authenticate(code, pin), {});
  }

  devices(query: Q = {}): Observable<Api<M.FieldDeviceDto[]>> {
    return this.http.get<Api<M.FieldDeviceDto[]>>(API.field.devices(query));
  }

  registerDevice(dto: Partial<M.FieldDeviceDto>): Observable<Api<M.FieldDeviceDto>> {
    return this.http.post<Api<M.FieldDeviceDto>>(API.field.registerDevice, dto);
  }

  blockDevice(id: string, isBlocked: boolean, reason?: string): Observable<Api<M.FieldDeviceDto>> {
    return this.http.post<Api<M.FieldDeviceDto>>(API.field.blockDevice(id, { isBlocked, reason }), {});
  }

  wipeDevice(id: string): Observable<Api<M.FieldDeviceDto>> {
    return this.http.post<Api<M.FieldDeviceDto>>(API.field.wipeDevice(id), {});
  }

  startDay(dto: M.StartDayDto): Observable<Api<M.FieldDayDto>> {
    return this.http.post<Api<M.FieldDayDto>>(API.field.startDay, dto);
  }

  day(id: string): Observable<Api<M.FieldDayDto>> {
    return this.http.get<Api<M.FieldDayDto>>(API.field.day(id));
  }

  today(fieldRepId: string, workDate?: string): Observable<Api<M.FieldDayDto>> {
    return this.http.get<Api<M.FieldDayDto>>(API.field.today(fieldRepId, workDate));
  }

  board(id: string): Observable<Api<M.FieldDayBoardDto>> {
    return this.http.get<Api<M.FieldDayBoardDto>>(API.field.board(id));
  }

  closeDay(dto: M.CloseDayDto): Observable<Api<M.FieldDayDto>> {
    return this.http.post<Api<M.FieldDayDto>>(API.field.closeDay, dto);
  }

  days(query: Q = {}): Observable<Page<M.FieldDayDto>> {
    return this.http.get<Page<M.FieldDayDto>>(API.field.days(query));
  }

  checkIn(dto: M.CheckInDto): Observable<Api<M.VisitDto>> {
    return this.http.post<Api<M.VisitDto>>(API.field.checkIn, dto);
  }

  checkOut(dto: M.CheckOutDto): Observable<Api<M.VisitDto>> {
    return this.http.post<Api<M.VisitDto>>(API.field.checkOut, dto);
  }

  visit(id: string): Observable<Api<M.VisitDto>> {
    return this.http.get<Api<M.VisitDto>>(API.field.visit(id));
  }

  visits(query: Q = {}): Observable<Page<M.VisitSummaryDto>> {
    return this.http.get<Page<M.VisitSummaryDto>>(API.field.visits(query));
  }

  tasks(query: Q = {}): Observable<Api<M.VisitTaskDto[]>> {
    return this.http.get<Api<M.VisitTaskDto[]>>(API.field.tasks(query));
  }

  saveTask(id: string | null, dto: M.SaveVisitTaskDto): Observable<Api<M.VisitTaskDto>> {
    return id
      ? this.http.put<Api<M.VisitTaskDto>>(API.field.updateTask(id), dto)
      : this.http.post<Api<M.VisitTaskDto>>(API.field.createTask, dto);
  }

  completeTask(dto: M.CompleteVisitTaskDto): Observable<Api<M.VisitTaskDto>> {
    return this.http.post<Api<M.VisitTaskDto>>(API.field.completeTask, dto);
  }

  deleteTask(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(API.field.deleteTask(id));
  }

  surveys(activeOnly?: boolean): Observable<Api<M.SurveyFormDto[]>> {
    return this.http.get<Api<M.SurveyFormDto[]>>(API.field.surveys(activeOnly));
  }

  survey(id: string): Observable<Api<M.SurveyFormDto>> {
    return this.http.get<Api<M.SurveyFormDto>>(API.field.survey(id));
  }

  saveSurvey(id: string | null, dto: Partial<M.SurveyFormDto>): Observable<Api<M.SurveyFormDto>> {
    return id
      ? this.http.put<Api<M.SurveyFormDto>>(API.field.updateSurvey(id), dto)
      : this.http.post<Api<M.SurveyFormDto>>(API.field.createSurvey, dto);
  }

  deleteSurvey(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(API.field.deleteSurvey(id));
  }

  submitSurvey(dto: M.SubmitSurveyDto): Observable<Api<M.SurveyResponseDto>> {
    return this.http.post<Api<M.SurveyResponseDto>>(API.field.submitSurvey, dto);
  }

  surveyResponses(query: Q = {}): Observable<Page<M.SurveyResponseDto>> {
    return this.http.get<Page<M.SurveyResponseDto>>(API.field.surveyResponses(query));
  }

  submitAudit(dto: M.SubmitAuditDto): Observable<Api<M.MerchandisingAuditDto>> {
    return this.http.post<Api<M.MerchandisingAuditDto>>(API.field.submitAudit, dto);
  }

  audit(id: string): Observable<Api<M.MerchandisingAuditDto>> {
    return this.http.get<Api<M.MerchandisingAuditDto>>(API.field.audit(id));
  }

  audits(query: Q = {}): Observable<Page<M.MerchandisingAuditDto>> {
    return this.http.get<Page<M.MerchandisingAuditDto>>(API.field.audits(query));
  }

  recordCompetitor(dto: Partial<M.CompetitorObservationDto>): Observable<Api<M.CompetitorObservationDto>> {
    return this.http.post<Api<M.CompetitorObservationDto>>(API.field.recordCompetitor, dto);
  }

  competitors(query: Q = {}): Observable<Page<M.CompetitorObservationDto>> {
    return this.http.get<Page<M.CompetitorObservationDto>>(API.field.competitors(query));
  }

  recordPosm(dto: Partial<M.PosmPlacementDto>): Observable<Api<M.PosmPlacementDto>> {
    return this.http.post<Api<M.PosmPlacementDto>>(API.field.recordPosm, dto);
  }

  posm(query: Q = {}): Observable<Api<M.PosmPlacementDto[]>> {
    return this.http.get<Api<M.PosmPlacementDto[]>>(API.field.posm(query));
  }
}

// ── Orders, pricing, schemes, vans ───────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);

  quote(dto: M.QuoteOrderDto): Observable<Api<M.OrderQuoteDto>> {
    return this.http.post<Api<M.OrderQuoteDto>>(API.orders.quote, dto);
  }

  create(dto: M.CreateOrderDto): Observable<Api<M.DistributionOrderDto>> {
    return this.http.post<Api<M.DistributionOrderDto>>(API.orders.create, dto);
  }

  get(id: string): Observable<Api<M.DistributionOrderDto>> {
    return this.http.get<Api<M.DistributionOrderDto>>(API.orders.get(id));
  }

  update(id: string, dto: M.UpdateOrderDto): Observable<Api<M.DistributionOrderDto>> {
    return this.http.put<Api<M.DistributionOrderDto>>(API.orders.update(id), dto);
  }

  submit(id: string): Observable<Api<M.DistributionOrderDto>> {
    return this.http.post<Api<M.DistributionOrderDto>>(API.orders.submit(id), {});
  }

  decide(dto: M.OrderDecisionDto): Observable<Api<M.DistributionOrderDto>> {
    return this.http.post<Api<M.DistributionOrderDto>>(API.orders.decide, dto);
  }

  hold(id: string, reason: string): Observable<Api<M.DistributionOrderDto>> {
    return this.http.post<Api<M.DistributionOrderDto>>(API.orders.hold(id, reason), {});
  }

  release(id: string): Observable<Api<M.DistributionOrderDto>> {
    return this.http.post<Api<M.DistributionOrderDto>>(API.orders.release(id), {});
  }

  cancel(id: string, dto: M.CancelOrderDto): Observable<Api<M.DistributionOrderDto>> {
    return this.http.post<Api<M.DistributionOrderDto>>(API.orders.cancel(id), dto);
  }

  list(query: Q = {}): Observable<Page<M.OrderSummaryDto>> {
    return this.http.get<Page<M.OrderSummaryDto>>(API.orders.list(query));
  }

  catalogue(query: Q): Observable<Api<M.CatalogueItemDto[]>> {
    return this.http.get<Api<M.CatalogueItemDto[]>>(API.orders.catalogue(query));
  }

  allocate(dto: M.AllocateOrderDto): Observable<Api<M.StockAllocationDto[]>> {
    return this.http.post<Api<M.StockAllocationDto[]>>(API.orders.allocate, dto);
  }

  releaseAllocation(id: string): Observable<Api<void>> {
    return this.http.post<Api<void>>(API.orders.releaseAllocation(id), {});
  }

  consolidate(orderIds: string[]): Observable<Api<M.DistributionOrderDto>> {
    return this.http.post<Api<M.DistributionOrderDto>>(API.orders.consolidate, orderIds);
  }
}

@Injectable({ providedIn: 'root' })
export class PricingService {
  private http = inject(HttpClient);

  resolve(query: Q): Observable<Api<M.PriceResolutionDto>> {
    return this.http.get<Api<M.PriceResolutionDto>>(API.pricing.resolve(query));
  }

  list(query: Q = {}): Observable<Page<M.PriceListDto>> {
    return this.http.get<Page<M.PriceListDto>>(API.pricing.list(query));
  }

  get(id: string): Observable<Api<M.PriceListDto>> {
    return this.http.get<Api<M.PriceListDto>>(API.pricing.get(id));
  }

  save(id: string | null, dto: M.SavePriceListDto): Observable<Api<M.PriceListDto>> {
    return id
      ? this.http.put<Api<M.PriceListDto>>(API.pricing.update(id), dto)
      : this.http.post<Api<M.PriceListDto>>(API.pricing.create, dto);
  }

  approve(id: string): Observable<Api<M.PriceListDto>> {
    return this.http.post<Api<M.PriceListDto>>(API.pricing.approve(id), {});
  }

  delete(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(API.pricing.delete(id));
  }

  margins(query: Q = {}): Observable<Page<M.MarginLadderDto>> {
    return this.http.get<Page<M.MarginLadderDto>>(API.pricing.margins(query));
  }

  saveMargin(id: string | null, dto: Partial<M.MarginLadderDto>): Observable<Api<M.MarginLadderDto>> {
    return id
      ? this.http.put<Api<M.MarginLadderDto>>(API.pricing.updateMargin(id), dto)
      : this.http.post<Api<M.MarginLadderDto>>(API.pricing.createMargin, dto);
  }

  mrpRevisions(query: Q = {}): Observable<Page<M.MrpRevisionDto>> {
    return this.http.get<Page<M.MrpRevisionDto>>(API.pricing.mrp(query));
  }

  saveMrp(dto: Partial<M.MrpRevisionDto>): Observable<Api<M.MrpRevisionDto>> {
    return this.http.post<Api<M.MrpRevisionDto>>(API.pricing.createMrp, dto);
  }
}

@Injectable({ providedIn: 'root' })
export class SchemeService {
  private http = inject(HttpClient);

  list(query: Q = {}): Observable<Page<M.TradeSchemeDto>> {
    return this.http.get<Page<M.TradeSchemeDto>>(API.schemes.list(query));
  }

  get(id: string): Observable<Api<M.TradeSchemeDto>> {
    return this.http.get<Api<M.TradeSchemeDto>>(API.schemes.get(id));
  }

  save(id: string | null, dto: M.SaveTradeSchemeDto): Observable<Api<M.TradeSchemeDto>> {
    return id
      ? this.http.put<Api<M.TradeSchemeDto>>(API.schemes.update(id), dto)
      : this.http.post<Api<M.TradeSchemeDto>>(API.schemes.create, dto);
  }

  decide(id: string, dto: M.SchemeDecisionDto): Observable<Api<M.TradeSchemeDto>> {
    return this.http.post<Api<M.TradeSchemeDto>>(API.schemes.decide(id), dto);
  }

  changeStatus(id: string, status: E.SchemeStatus, reason?: string): Observable<Api<M.TradeSchemeDto>> {
    return this.http.post<Api<M.TradeSchemeDto>>(API.schemes.status(id, status, reason), {});
  }

  delete(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(API.schemes.delete(id));
  }

  applicable(query: Q): Observable<Api<M.TradeSchemeDto[]>> {
    return this.http.get<Api<M.TradeSchemeDto[]>>(API.schemes.applicable(query));
  }

  simulate(query: Q, draft?: M.SaveTradeSchemeDto | null): Observable<Api<M.SchemeSimulationDto>> {
    return this.http.post<Api<M.SchemeSimulationDto>>(API.schemes.simulate(query), draft ?? null);
  }

  performance(id: string): Observable<Api<M.SchemePerformanceDto>> {
    return this.http.get<Api<M.SchemePerformanceDto>>(API.schemes.performance(id));
  }

  budget(id: string): Observable<Api<M.SchemeBudgetEntryDto[]>> {
    return this.http.get<Api<M.SchemeBudgetEntryDto[]>>(API.schemes.budget(id));
  }

  adjustBudget(id: string, amount: number, reason: string): Observable<Api<M.TradeSchemeDto>> {
    return this.http.post<Api<M.TradeSchemeDto>>(API.schemes.adjustBudget(id, amount, reason), {});
  }

  applications(query: Q = {}): Observable<Page<M.SchemeApplicationDto>> {
    return this.http.get<Page<M.SchemeApplicationDto>>(API.schemes.applications(query));
  }

  generateClaims(periodStart: string, periodEnd: string): Observable<Api<M.ClaimSummaryDto[]>> {
    return this.http.post<Api<M.ClaimSummaryDto[]>>(API.schemes.generateClaims(periodStart, periodEnd), {});
  }
}

@Injectable({ providedIn: 'root' })
export class VanService {
  private http = inject(HttpClient);

  list(query: Q = {}): Observable<Page<M.VanUnitDto>> {
    return this.http.get<Page<M.VanUnitDto>>(API.vans.list(query));
  }

  get(id: string): Observable<Api<M.VanUnitDto>> {
    return this.http.get<Api<M.VanUnitDto>>(API.vans.get(id));
  }

  save(id: string | null, dto: M.SaveVanUnitDto): Observable<Api<M.VanUnitDto>> {
    return id
      ? this.http.put<Api<M.VanUnitDto>>(API.vans.update(id), dto)
      : this.http.post<Api<M.VanUnitDto>>(API.vans.create, dto);
  }

  delete(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(API.vans.delete(id));
  }

  stock(id: string, compartment?: E.VanCompartment): Observable<Api<M.VanStockSummaryDto>> {
    return this.http.get<Api<M.VanStockSummaryDto>>(API.vans.stock(id, compartment));
  }

  movements(id: string, query: Q = {}): Observable<Page<M.VanStockMovementDto>> {
    return this.http.get<Page<M.VanStockMovementDto>>(API.vans.movements(id, query));
  }

  createLoad(dto: M.CreateVanLoadDto): Observable<Api<M.VanLoadSheetDto>> {
    return this.http.post<Api<M.VanLoadSheetDto>>(API.vans.createLoad, dto);
  }

  load(id: string): Observable<Api<M.VanLoadSheetDto>> {
    return this.http.get<Api<M.VanLoadSheetDto>>(API.vans.load(id));
  }

  loads(query: Q = {}): Observable<Page<M.VanLoadSheetDto>> {
    return this.http.get<Page<M.VanLoadSheetDto>>(API.vans.loads(query));
  }

  approveLoad(id: string, isApproved: boolean, reason?: string): Observable<Api<M.VanLoadSheetDto>> {
    return this.http.post<Api<M.VanLoadSheetDto>>(API.vans.approveLoad(id, { isApproved, reason }), {});
  }

  confirmLoad(dto: M.ConfirmVanLoadDto): Observable<Api<M.VanLoadSheetDto>> {
    return this.http.post<Api<M.VanLoadSheetDto>>(API.vans.confirmLoad, dto);
  }

  transfer(dto: M.VanTransferDto): Observable<Api<M.VanStockSummaryDto>> {
    return this.http.post<Api<M.VanStockSummaryDto>>(API.vans.transfer, dto);
  }

  startCount(dto: M.StartVanCountDto): Observable<Api<M.VanCycleCountDto>> {
    return this.http.post<Api<M.VanCycleCountDto>>(API.vans.startCount, dto);
  }

  submitCount(dto: M.SubmitVanCountDto): Observable<Api<M.VanCycleCountDto>> {
    return this.http.post<Api<M.VanCycleCountDto>>(API.vans.submitCount, dto);
  }

  approveCount(id: string): Observable<Api<M.VanCycleCountDto>> {
    return this.http.post<Api<M.VanCycleCountDto>>(API.vans.approveCount(id), {});
  }

  count(id: string): Observable<Api<M.VanCycleCountDto>> {
    return this.http.get<Api<M.VanCycleCountDto>>(API.vans.count(id));
  }

  unload(id: string, fieldDayId: string | undefined, dto: M.SubmitVanCountDto): Observable<Api<M.VanCycleCountDto>> {
    return this.http.post<Api<M.VanCycleCountDto>>(API.vans.unload(id, fieldDayId), dto);
  }
}

// ── Fulfilment & logistics ───────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class FulfilmentService {
  private http = inject(HttpClient);

  board(query: Q = {}): Observable<Api<M.DispatchBoardDto>> {
    return this.http.get<Api<M.DispatchBoardDto>>(API.fulfilment.board(query));
  }

  createWave(dto: M.CreatePickWaveDto): Observable<Api<M.PickWaveDto>> {
    return this.http.post<Api<M.PickWaveDto>>(API.fulfilment.createWave, dto);
  }

  wave(id: string): Observable<Api<M.PickWaveDto>> {
    return this.http.get<Api<M.PickWaveDto>>(API.fulfilment.wave(id));
  }

  waves(query: Q = {}): Observable<Page<M.PickWaveDto>> {
    return this.http.get<Page<M.PickWaveDto>>(API.fulfilment.waves(query));
  }

  closeWave(id: string): Observable<Api<M.PickWaveDto>> {
    return this.http.post<Api<M.PickWaveDto>>(API.fulfilment.closeWave(id), {});
  }

  task(id: string): Observable<Api<M.PickTaskDto>> {
    return this.http.get<Api<M.PickTaskDto>>(API.fulfilment.task(id));
  }

  assignTask(id: string, userId: string, name?: string): Observable<Api<M.PickTaskDto>> {
    return this.http.post<Api<M.PickTaskDto>>(API.fulfilment.assignTask(id, { userId, name }), {});
  }

  startTask(id: string): Observable<Api<M.PickTaskDto>> {
    return this.http.post<Api<M.PickTaskDto>>(API.fulfilment.startTask(id), {});
  }

  confirmPick(dto: M.ConfirmPickDto): Observable<Api<M.PickTaskDto>> {
    return this.http.post<Api<M.PickTaskDto>>(API.fulfilment.confirmPick, dto);
  }

  completeTask(id: string): Observable<Api<M.PickTaskDto>> {
    return this.http.post<Api<M.PickTaskDto>>(API.fulfilment.completeTask(id), {});
  }

  createPackage(dto: M.CreatePackageDto): Observable<Api<M.PackageDto>> {
    return this.http.post<Api<M.PackageDto>>(API.fulfilment.createPackage, dto);
  }

  packages(query: Q = {}): Observable<Api<M.PackageDto[]>> {
    return this.http.get<Api<M.PackageDto[]>>(API.fulfilment.packages(query));
  }

  stagePackage(id: string, stagingLocation: string): Observable<Api<M.PackageDto>> {
    return this.http.post<Api<M.PackageDto>>(API.fulfilment.stagePackage(id, stagingLocation), {});
  }

  loadPackage(id: string, tripId: string): Observable<Api<M.PackageDto>> {
    return this.http.post<Api<M.PackageDto>>(API.fulfilment.loadPackage(id, tripId), {});
  }

  createDispatch(dto: M.CreateDispatchDto): Observable<Api<M.DispatchDto>> {
    return this.http.post<Api<M.DispatchDto>>(API.fulfilment.createDispatch, dto);
  }

  dispatch(id: string): Observable<Api<M.DispatchDto>> {
    return this.http.get<Api<M.DispatchDto>>(API.fulfilment.dispatch(id));
  }

  dispatches(query: Q = {}): Observable<Page<M.DispatchDto>> {
    return this.http.get<Page<M.DispatchDto>>(API.fulfilment.dispatches(query));
  }
}

@Injectable({ providedIn: 'root' })
export class LogisticsService {
  private http = inject(HttpClient);

  vehicles(query: Q = {}): Observable<Page<M.VehicleDto>> {
    return this.http.get<Page<M.VehicleDto>>(API.logistics.vehicles(query));
  }

  vehicle(id: string): Observable<Api<M.VehicleDto>> {
    return this.http.get<Api<M.VehicleDto>>(API.logistics.vehicle(id));
  }

  saveVehicle(id: string | null, dto: M.SaveVehicleDto): Observable<Api<M.VehicleDto>> {
    return id
      ? this.http.put<Api<M.VehicleDto>>(API.logistics.updateVehicle(id), dto)
      : this.http.post<Api<M.VehicleDto>>(API.logistics.createVehicle, dto);
  }

  deleteVehicle(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(API.logistics.deleteVehicle(id));
  }

  expiringCompliance(withinDays = 30): Observable<Api<M.VehicleComplianceDto[]>> {
    return this.http.get<Api<M.VehicleComplianceDto[]>>(API.logistics.expiringCompliance(withinDays));
  }

  drivers(query: Q = {}): Observable<Page<M.DriverDto>> {
    return this.http.get<Page<M.DriverDto>>(API.logistics.drivers(query));
  }

  driver(id: string): Observable<Api<M.DriverDto>> {
    return this.http.get<Api<M.DriverDto>>(API.logistics.driver(id));
  }

  saveDriver(id: string | null, dto: M.SaveDriverDto): Observable<Api<M.DriverDto>> {
    return id
      ? this.http.put<Api<M.DriverDto>>(API.logistics.updateDriver(id), dto)
      : this.http.post<Api<M.DriverDto>>(API.logistics.createDriver, dto);
  }

  deleteDriver(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(API.logistics.deleteDriver(id));
  }

  createTrip(dto: M.CreateTripDto): Observable<Api<M.TripDto>> {
    return this.http.post<Api<M.TripDto>>(API.logistics.createTrip, dto);
  }

  trip(id: string): Observable<Api<M.TripDto>> {
    return this.http.get<Api<M.TripDto>>(API.logistics.trip(id));
  }

  trips(query: Q = {}): Observable<Page<M.TripSummaryDto>> {
    return this.http.get<Page<M.TripSummaryDto>>(API.logistics.trips(query));
  }

  resequenceTrip(dto: M.ResequenceTripDto): Observable<Api<M.TripDto>> {
    return this.http.post<Api<M.TripDto>>(API.logistics.resequenceTrip, dto);
  }

  startTrip(dto: M.StartTripDto): Observable<Api<M.TripDto>> {
    return this.http.post<Api<M.TripDto>>(API.logistics.startTrip, dto);
  }

  endTrip(dto: M.EndTripDto): Observable<Api<M.TripDto>> {
    return this.http.post<Api<M.TripDto>>(API.logistics.endTrip, dto);
  }

  cancelTrip(id: string, reason: string): Observable<Api<M.TripDto>> {
    return this.http.post<Api<M.TripDto>>(API.logistics.cancelTrip(id, reason), {});
  }

  arrive(dto: M.ArriveAtStopDto): Observable<Api<M.TripStopDto>> {
    return this.http.post<Api<M.TripStopDto>>(API.logistics.arrive, dto);
  }

  failStop(dto: M.FailStopDto): Observable<Api<M.TripStopDto>> {
    return this.http.post<Api<M.TripStopDto>>(API.logistics.failStop, dto);
  }

  addExpense(dto: M.SaveTripExpenseDto): Observable<Api<M.TripExpenseDto>> {
    return this.http.post<Api<M.TripExpenseDto>>(API.logistics.addExpense, dto);
  }

  decideExpense(id: string, isApproved: boolean, reason?: string): Observable<Api<M.TripExpenseDto>> {
    return this.http.post<Api<M.TripExpenseDto>>(API.logistics.decideExpense(id, { isApproved, reason }), {});
  }

  capturePod(dto: M.CapturePodDto): Observable<Api<M.PodDto>> {
    return this.http.post<Api<M.PodDto>>(API.logistics.capturePod, dto);
  }

  pod(id: string): Observable<Api<M.PodDto>> {
    return this.http.get<Api<M.PodDto>>(API.logistics.pod(id));
  }

  pods(query: Q = {}): Observable<Page<M.PodDto>> {
    return this.http.get<Page<M.PodDto>>(API.logistics.pods(query));
  }

  resolvePod(id: string, note: string): Observable<Api<M.PodDto>> {
    return this.http.post<Api<M.PodDto>>(API.logistics.resolvePod(id, note), {});
  }
}

@Injectable({ providedIn: 'root' })
export class ReturnService {
  private http = inject(HttpClient);

  request(dto: M.RequestReturnDto): Observable<Api<M.ReturnDto>> {
    return this.http.post<Api<M.ReturnDto>>(API.returns.request, dto);
  }

  get(id: string): Observable<Api<M.ReturnDto>> {
    return this.http.get<Api<M.ReturnDto>>(API.returns.get(id));
  }

  list(query: Q = {}): Observable<Page<M.ReturnSummaryDto>> {
    return this.http.get<Page<M.ReturnSummaryDto>>(API.returns.list(query));
  }

  decide(id: string, dto: M.DecideReturnDto): Observable<Api<M.ReturnDto>> {
    return this.http.post<Api<M.ReturnDto>>(API.returns.decide(id), dto);
  }

  cancel(id: string, reason: string): Observable<Api<M.ReturnDto>> {
    return this.http.post<Api<M.ReturnDto>>(API.returns.cancel(id, reason), {});
  }

  receive(dto: M.ReceiveReturnDto): Observable<Api<M.ReturnReceiptDto>> {
    return this.http.post<Api<M.ReturnReceiptDto>>(API.returns.receive, dto);
  }

  disposition(dto: M.DispositionReturnDto): Observable<Api<M.ReturnReceiptDto>> {
    return this.http.post<Api<M.ReturnReceiptDto>>(API.returns.disposition, dto);
  }

  recordDestruction(id: string, query: Q): Observable<Api<M.ReturnReceiptDto>> {
    return this.http.post<Api<M.ReturnReceiptDto>>(API.returns.destruction(id, query), {});
  }

  credit(id: string, raiseClaim = true): Observable<Api<M.ReturnDto>> {
    return this.http.post<Api<M.ReturnDto>>(API.returns.credit(id, raiseClaim), {});
  }
}

// ── Money ────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class CreditService {
  private http = inject(HttpClient);

  snapshot(query: Q): Observable<Api<M.CreditSnapshotDto>> {
    return this.http.get<Api<M.CreditSnapshotDto>>(API.credit.snapshot(query));
  }

  check(query: Q): Observable<Api<M.CreditCheckResultDto>> {
    return this.http.get<Api<M.CreditCheckResultDto>>(API.credit.check(query));
  }

  profiles(query: Q = {}): Observable<Page<M.CreditProfileDto>> {
    return this.http.get<Page<M.CreditProfileDto>>(API.credit.profiles(query));
  }

  setLimit(dto: M.SetCreditLimitDto): Observable<Api<M.CreditProfileDto>> {
    return this.http.post<Api<M.CreditProfileDto>>(API.credit.setLimit, dto);
  }

  recalculate(query: Q): Observable<Api<M.CreditProfileDto>> {
    return this.http.post<Api<M.CreditProfileDto>>(API.credit.recalculate(query), {});
  }

  block(query: Q): Observable<Api<M.CreditProfileDto>> {
    return this.http.post<Api<M.CreditProfileDto>>(API.credit.block(query), {});
  }

  requestOverride(dto: M.RequestCreditOverrideDto): Observable<Api<M.CreditOverrideDto>> {
    return this.http.post<Api<M.CreditOverrideDto>>(API.credit.requestOverride, dto);
  }

  decideOverride(id: string, dto: M.DecideCreditOverrideDto): Observable<Api<M.CreditOverrideDto>> {
    return this.http.post<Api<M.CreditOverrideDto>>(API.credit.decideOverride(id), dto);
  }

  overrides(query: Q = {}): Observable<Api<M.CreditOverrideDto[]>> {
    return this.http.get<Api<M.CreditOverrideDto[]>>(API.credit.overrides(query));
  }

  recordCollection(dto: M.RecordCollectionDto): Observable<Api<M.CollectionDto>> {
    return this.http.post<Api<M.CollectionDto>>(API.credit.recordCollection, dto);
  }

  collection(id: string): Observable<Api<M.CollectionDto>> {
    return this.http.get<Api<M.CollectionDto>>(API.credit.collection(id));
  }

  collections(query: Q = {}): Observable<Page<M.CollectionSummaryDto>> {
    return this.http.get<Page<M.CollectionSummaryDto>>(API.credit.collections(query));
  }

  reverseCollection(id: string, reason: string): Observable<Api<M.CollectionDto>> {
    return this.http.post<Api<M.CollectionDto>>(API.credit.reverseCollection(id, reason), {});
  }

  cheques(query: Q = {}): Observable<Page<M.ChequeDto>> {
    return this.http.get<Page<M.ChequeDto>>(API.credit.cheques(query));
  }

  updateCheque(id: string, dto: M.UpdateChequeStatusDto): Observable<Api<M.ChequeDto>> {
    return this.http.post<Api<M.ChequeDto>>(API.credit.updateCheque(id), dto);
  }
}

@Injectable({ providedIn: 'root' })
export class ClaimService {
  private http = inject(HttpClient);

  submit(dto: M.SubmitClaimDto): Observable<Api<M.ClaimDto>> {
    return this.http.post<Api<M.ClaimDto>>(API.claims.submit, dto);
  }

  get(id: string): Observable<Api<M.ClaimDto>> {
    return this.http.get<Api<M.ClaimDto>>(API.claims.get(id));
  }

  list(query: Q = {}): Observable<Page<M.ClaimSummaryDto>> {
    return this.http.get<Page<M.ClaimSummaryDto>>(API.claims.list(query));
  }

  startReview(id: string): Observable<Api<M.ClaimDto>> {
    return this.http.post<Api<M.ClaimDto>>(API.claims.review(id), {});
  }

  query(id: string, dto: M.QueryClaimDto): Observable<Api<M.ClaimDto>> {
    return this.http.post<Api<M.ClaimDto>>(API.claims.query(id), dto);
  }

  resubmit(id: string, dto: M.SubmitClaimDto): Observable<Api<M.ClaimDto>> {
    return this.http.post<Api<M.ClaimDto>>(API.claims.resubmit(id), dto);
  }

  decide(id: string, dto: M.DecideClaimDto): Observable<Api<M.ClaimDto>> {
    return this.http.post<Api<M.ClaimDto>>(API.claims.decide(id), dto);
  }

  settle(id: string, dto: M.SettleClaimDto): Observable<Api<M.ClaimDto>> {
    return this.http.post<Api<M.ClaimDto>>(API.claims.settle(id), dto);
  }

  cancel(id: string, reason: string): Observable<Api<M.ClaimDto>> {
    return this.http.post<Api<M.ClaimDto>>(API.claims.cancel(id, reason), {});
  }

  addDocument(id: string, dto: Partial<M.ClaimDocumentDto>): Observable<Api<M.ClaimDocumentDto>> {
    return this.http.post<Api<M.ClaimDocumentDto>>(API.claims.addDocument(id), dto);
  }

  rebates(query: Q = {}): Observable<Page<M.RebateAgreementDto>> {
    return this.http.get<Page<M.RebateAgreementDto>>(API.claims.rebates(query));
  }

  rebate(id: string): Observable<Api<M.RebateAgreementDto>> {
    return this.http.get<Api<M.RebateAgreementDto>>(API.claims.rebate(id));
  }

  saveRebate(id: string | null, dto: Partial<M.RebateAgreementDto>): Observable<Api<M.RebateAgreementDto>> {
    return id
      ? this.http.put<Api<M.RebateAgreementDto>>(API.claims.updateRebate(id), dto)
      : this.http.post<Api<M.RebateAgreementDto>>(API.claims.createRebate, dto);
  }

  accrue(periodStart: string, periodEnd: string): Observable<Api<M.RebateAccrualDto[]>> {
    return this.http.post<Api<M.RebateAccrualDto[]>>(API.claims.accrue(periodStart, periodEnd), {});
  }

  reconcileAccrual(id: string, receivedAmount: number, reference?: string): Observable<Api<M.RebateAccrualDto>> {
    return this.http.post<Api<M.RebateAccrualDto>>(
      API.claims.reconcileAccrual(id, { receivedAmount, reference }), {});
  }

  chargebacks(query: Q = {}): Observable<Page<M.ChargebackDto>> {
    return this.http.get<Page<M.ChargebackDto>>(API.claims.chargebacks(query));
  }

  saveChargeback(id: string | null, dto: Partial<M.ChargebackDto>): Observable<Api<M.ChargebackDto>> {
    return id
      ? this.http.put<Api<M.ChargebackDto>>(API.claims.updateChargeback(id), dto)
      : this.http.post<Api<M.ChargebackDto>>(API.claims.createChargeback, dto);
  }

  settleChargeback(id: string, settledAmount: number, reference?: string): Observable<Api<M.ChargebackDto>> {
    return this.http.post<Api<M.ChargebackDto>>(
      API.claims.settleChargeback(id, { settledAmount, reference }), {});
  }
}

@Injectable({ providedIn: 'root' })
export class SettlementService {
  private http = inject(HttpClient);

  board(query: Q = {}): Observable<Api<M.SettlementBoardDto>> {
    return this.http.get<Api<M.SettlementBoardDto>>(API.settlement.board(query));
  }

  open(dto: M.OpenSettlementDto): Observable<Api<M.SettlementDto>> {
    return this.http.post<Api<M.SettlementDto>>(API.settlement.open, dto);
  }

  get(id: string): Observable<Api<M.SettlementDto>> {
    return this.http.get<Api<M.SettlementDto>>(API.settlement.get(id));
  }

  recompute(id: string): Observable<Api<M.SettlementDto>> {
    return this.http.post<Api<M.SettlementDto>>(API.settlement.recompute(id), {});
  }

  submit(dto: M.SubmitSettlementDto): Observable<Api<M.SettlementDto>> {
    return this.http.post<Api<M.SettlementDto>>(API.settlement.submit, dto);
  }

  explainVariance(dto: M.ExplainVarianceDto): Observable<Api<M.SettlementDto>> {
    return this.http.post<Api<M.SettlementDto>>(API.settlement.explainVariance, dto);
  }

  approve(dto: M.ApproveSettlementDto): Observable<Api<M.SettlementDto>> {
    return this.http.post<Api<M.SettlementDto>>(API.settlement.approve, dto);
  }

  close(id: string): Observable<Api<M.SettlementDto>> {
    return this.http.post<Api<M.SettlementDto>>(API.settlement.close(id), {});
  }

  reverse(id: string, dto: M.ReverseSettlementDto): Observable<Api<M.SettlementDto>> {
    return this.http.post<Api<M.SettlementDto>>(API.settlement.reverse(id), dto);
  }

  list(query: Q = {}): Observable<Page<M.SettlementDto>> {
    return this.http.get<Page<M.SettlementDto>>(API.settlement.list(query));
  }

  recordDeposit(dto: M.RecordDepositDto): Observable<Api<M.CashDepositDto>> {
    return this.http.post<Api<M.CashDepositDto>>(API.settlement.recordDeposit, dto);
  }

  reconcileDeposit(id: string): Observable<Api<M.CashDepositDto>> {
    return this.http.post<Api<M.CashDepositDto>>(API.settlement.reconcileDeposit(id), {});
  }

  deposits(query: Q = {}): Observable<Page<M.CashDepositDto>> {
    return this.http.get<Page<M.CashDepositDto>>(API.settlement.deposits(query));
  }
}

// ── Insight ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class SecondarySalesService {
  private http = inject(HttpClient);

  list(query: Q = {}): Observable<Page<M.SecondarySaleDto>> {
    return this.http.get<Page<M.SecondarySaleDto>>(API.secondary.list(query));
  }

  get(id: string): Observable<Api<M.SecondarySaleDto>> {
    return this.http.get<Api<M.SecondarySaleDto>>(API.secondary.get(id));
  }

  declare(dto: M.DeclareSecondarySalesDto): Observable<Api<M.SecondarySaleDto[]>> {
    return this.http.post<Api<M.SecondarySaleDto[]>>(API.secondary.declare, dto);
  }

  upload(query: Q, file: File): Observable<Api<M.SecondaryUploadDto>> {
    const body = new FormData();
    body.append('file', file, file.name);
    return this.http.post<Api<M.SecondaryUploadDto>>(API.secondary.upload(query), body);
  }

  getUpload(id: string): Observable<Api<M.SecondaryUploadDto>> {
    return this.http.get<Api<M.SecondaryUploadDto>>(API.secondary.getUpload(id));
  }

  uploads(query: Q = {}): Observable<Page<M.SecondaryUploadDto>> {
    return this.http.get<Page<M.SecondaryUploadDto>>(API.secondary.uploads(query));
  }

  postUpload(id: string): Observable<Api<M.SecondaryUploadDto>> {
    return this.http.post<Api<M.SecondaryUploadDto>>(API.secondary.postUpload(id), {});
  }

  rejectUpload(id: string, reason: string): Observable<Api<M.SecondaryUploadDto>> {
    return this.http.post<Api<M.SecondaryUploadDto>>(API.secondary.rejectUpload(id, reason), {});
  }

  exceptions(query: Q = {}): Observable<Api<M.MappingExceptionDto[]>> {
    return this.http.get<Api<M.MappingExceptionDto[]>>(API.secondary.exceptions(query));
  }

  resolveMapping(dto: M.ResolveMappingDto): Observable<Api<M.MappingExceptionDto>> {
    return this.http.post<Api<M.MappingExceptionDto>>(API.secondary.resolveMapping, dto);
  }

  mappingProfiles(partnerId?: string): Observable<Api<M.MappingProfileDto[]>> {
    return this.http.get<Api<M.MappingProfileDto[]>>(API.secondary.mappingProfiles(partnerId));
  }

  saveMappingProfile(id: string | null, dto: Partial<M.MappingProfileDto>): Observable<Api<M.MappingProfileDto>> {
    return id
      ? this.http.put<Api<M.MappingProfileDto>>(API.secondary.updateMappingProfile(id), dto)
      : this.http.post<Api<M.MappingProfileDto>>(API.secondary.createMappingProfile, dto);
  }

  submitStock(dto: M.SubmitStockDeclarationDto): Observable<Api<M.StockDeclarationDto>> {
    return this.http.post<Api<M.StockDeclarationDto>>(API.secondary.submitStock, dto);
  }

  getStock(id: string): Observable<Api<M.StockDeclarationDto>> {
    return this.http.get<Api<M.StockDeclarationDto>>(API.secondary.getStock(id));
  }

  stockList(query: Q = {}): Observable<Page<M.StockDeclarationDto>> {
    return this.http.get<Page<M.StockDeclarationDto>>(API.secondary.stockList(query));
  }

  verifyStock(id: string): Observable<Api<M.StockDeclarationDto>> {
    return this.http.post<Api<M.StockDeclarationDto>>(API.secondary.verifyStock(id), {});
  }

  norms(query: Q = {}): Observable<Api<M.StockNormDto[]>> {
    return this.http.get<Api<M.StockNormDto[]>>(API.secondary.norms(query));
  }

  saveNorm(id: string | null, dto: Partial<M.StockNormDto>): Observable<Api<M.StockNormDto>> {
    return id
      ? this.http.put<Api<M.StockNormDto>>(API.secondary.updateNorm(id), dto)
      : this.http.post<Api<M.StockNormDto>>(API.secondary.createNorm, dto);
  }

  reconcile(query: Q): Observable<Api<M.ReconciliationDto[]>> {
    return this.http.post<Api<M.ReconciliationDto[]>>(API.secondary.reconcile(query), {});
  }

  reconciliations(query: Q = {}): Observable<Page<M.ReconciliationDto>> {
    return this.http.get<Page<M.ReconciliationDto>>(API.secondary.reconciliations(query));
  }

  explain(dto: M.ExplainReconciliationDto): Observable<Api<M.ReconciliationDto>> {
    return this.http.post<Api<M.ReconciliationDto>>(API.secondary.explain, dto);
  }

  channelInventory(query: Q): Observable<Api<M.ChannelInventoryDto>> {
    return this.http.get<Api<M.ChannelInventoryDto>>(API.secondary.channelInventory(query));
  }

  dataQuality(periodStart: string, periodEnd: string): Observable<Api<M.PartnerDataQualityDto[]>> {
    return this.http.get<Api<M.PartnerDataQualityDto[]>>(API.secondary.dataQuality(periodStart, periodEnd));
  }
}

@Injectable({ providedIn: 'root' })
export class PerformanceService {
  private http = inject(HttpClient);

  targets(query: Q = {}): Observable<Page<M.TargetDto>> {
    return this.http.get<Page<M.TargetDto>>(API.performance.targets(query));
  }

  target(id: string): Observable<Api<M.TargetDto>> {
    return this.http.get<Api<M.TargetDto>>(API.performance.target(id));
  }

  saveTarget(id: string | null, dto: M.SaveTargetDto): Observable<Api<M.TargetDto>> {
    return id
      ? this.http.put<Api<M.TargetDto>>(API.performance.updateTarget(id), dto)
      : this.http.post<Api<M.TargetDto>>(API.performance.createTarget, dto);
  }

  publishTarget(id: string): Observable<Api<M.TargetDto>> {
    return this.http.post<Api<M.TargetDto>>(API.performance.publishTarget(id), {});
  }

  deleteTarget(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(API.performance.deleteTarget(id));
  }

  recomputeTargets(periodStart: string, periodEnd: string): Observable<Api<M.TargetDto[]>> {
    return this.http.post<Api<M.TargetDto[]>>(API.performance.recomputeTargets(periodStart, periodEnd), {});
  }

  incentives(activeOnly?: boolean): Observable<Api<M.IncentiveSchemeDto[]>> {
    return this.http.get<Api<M.IncentiveSchemeDto[]>>(API.performance.incentives(activeOnly));
  }

  saveIncentive(id: string | null, dto: Partial<M.IncentiveSchemeDto>): Observable<Api<M.IncentiveSchemeDto>> {
    return id
      ? this.http.put<Api<M.IncentiveSchemeDto>>(API.performance.updateIncentive(id), dto)
      : this.http.post<Api<M.IncentiveSchemeDto>>(API.performance.createIncentive, dto);
  }

  computePayouts(id: string, periodStart: string, periodEnd: string): Observable<Api<M.IncentivePayoutDto[]>> {
    return this.http.post<Api<M.IncentivePayoutDto[]>>(
      API.performance.computePayouts(id, periodStart, periodEnd), {});
  }

  approvePayout(id: string, isApproved: boolean, note?: string): Observable<Api<M.IncentivePayoutDto>> {
    return this.http.post<Api<M.IncentivePayoutDto>>(
      API.performance.approvePayout(id, { isApproved, note }), {});
  }

  payouts(query: Q = {}): Observable<Page<M.IncentivePayoutDto>> {
    return this.http.get<Page<M.IncentivePayoutDto>>(API.performance.payouts(query));
  }

  computeKpis(date: string): Observable<Api<number>> {
    return this.http.post<Api<number>>(API.performance.computeKpis(date), {});
  }

  kpis(query: Q): Observable<Api<M.KpiDto[]>> {
    return this.http.get<Api<M.KpiDto[]>>(API.performance.kpis(query));
  }

  leaderboard(query: Q): Observable<Api<M.RankedRowDto[]>> {
    return this.http.get<Api<M.RankedRowDto[]>>(API.performance.leaderboard(query));
  }
}

@Injectable({ providedIn: 'root' })
export class PlanningService {
  private http = inject(HttpClient);

  generateForecast(dto: M.GenerateForecastDto): Observable<Api<M.ForecastDto>> {
    return this.http.post<Api<M.ForecastDto>>(API.planning.generateForecast, dto);
  }

  forecast(id: string): Observable<Api<M.ForecastDto>> {
    return this.http.get<Api<M.ForecastDto>>(API.planning.forecast(id));
  }

  forecasts(query: Q = {}): Observable<Page<M.ForecastDto>> {
    return this.http.get<Page<M.ForecastDto>>(API.planning.forecasts(query));
  }

  overrideForecast(dto: M.OverrideForecastLineDto): Observable<Api<M.ForecastDto>> {
    return this.http.post<Api<M.ForecastDto>>(API.planning.overrideForecast, dto);
  }

  approveForecast(id: string): Observable<Api<M.ForecastDto>> {
    return this.http.post<Api<M.ForecastDto>>(API.planning.approveForecast(id), {});
  }

  generateSuggestions(targetKind: E.ReplenishmentTargetKind, scopeId?: string): Observable<Api<number>> {
    return this.http.post<Api<number>>(API.planning.generateSuggestions({ targetKind, scopeId }), {});
  }

  suggestions(query: Q = {}): Observable<Page<M.ReplenishmentSuggestionDto>> {
    return this.http.get<Page<M.ReplenishmentSuggestionDto>>(API.planning.suggestions(query));
  }

  dismissSuggestion(id: string, reason: string): Observable<Api<M.ReplenishmentSuggestionDto>> {
    return this.http.post<Api<M.ReplenishmentSuggestionDto>>(API.planning.dismissSuggestion(id, reason), {});
  }

  createTransfer(suggestionIds: string[]): Observable<Api<M.TransferRequestDto>> {
    return this.http.post<Api<M.TransferRequestDto>>(API.planning.createTransfer, suggestionIds);
  }

  transfers(query: Q = {}): Observable<Page<M.TransferRequestDto>> {
    return this.http.get<Page<M.TransferRequestDto>>(API.planning.transfers(query));
  }

  decideTransfer(id: string, isApproved: boolean, reason?: string): Observable<Api<M.TransferRequestDto>> {
    return this.http.post<Api<M.TransferRequestDto>>(
      API.planning.decideTransfer(id, { isApproved, reason }), {});
  }
}

@Injectable({ providedIn: 'root' })
export class TraceabilityService {
  private http = inject(HttpClient);

  checkpoints(query: Q = {}): Observable<Api<M.ColdChainCheckpointDto[]>> {
    return this.http.get<Api<M.ColdChainCheckpointDto[]>>(API.traceability.checkpoints(query));
  }

  saveCheckpoint(id: string | null, dto: Partial<M.ColdChainCheckpointDto>): Observable<Api<M.ColdChainCheckpointDto>> {
    return id
      ? this.http.put<Api<M.ColdChainCheckpointDto>>(API.traceability.updateCheckpoint(id), dto)
      : this.http.post<Api<M.ColdChainCheckpointDto>>(API.traceability.createCheckpoint, dto);
  }

  recordReading(dto: M.RecordColdChainReadingDto): Observable<Api<M.ColdChainLogDto>> {
    return this.http.post<Api<M.ColdChainLogDto>>(API.traceability.recordReading, dto);
  }

  readings(query: Q = {}): Observable<Page<M.ColdChainLogDto>> {
    return this.http.get<Page<M.ColdChainLogDto>>(API.traceability.readings(query));
  }

  resolveExcursion(id: string, correctiveAction: string, affectedValue = 0): Observable<Api<M.ColdChainLogDto>> {
    return this.http.post<Api<M.ColdChainLogDto>>(
      API.traceability.resolveExcursion(id, { correctiveAction, affectedValue }), {});
  }

  trace(query: Q): Observable<Api<M.BatchTraceDto>> {
    return this.http.get<Api<M.BatchTraceDto>>(API.traceability.trace(query));
  }

  traceFromOutlet(query: Q): Observable<Api<M.BatchTraceDto>> {
    return this.http.get<Api<M.BatchTraceDto>>(API.traceability.traceFromOutlet(query));
  }

  initiateRecall(dto: M.InitiateRecallDto): Observable<Api<M.RecallDto>> {
    return this.http.post<Api<M.RecallDto>>(API.traceability.initiateRecall, dto);
  }

  recall(id: string): Observable<Api<M.RecallDto>> {
    return this.http.get<Api<M.RecallDto>>(API.traceability.recall(id));
  }

  recalls(query: Q = {}): Observable<Page<M.RecallDto>> {
    return this.http.get<Page<M.RecallDto>>(API.traceability.recalls(query));
  }

  announceRecall(id: string): Observable<Api<M.RecallDto>> {
    return this.http.post<Api<M.RecallDto>>(API.traceability.announceRecall(id), {});
  }

  updateNotice(id: string, returnedQuantity: number, isClosed: boolean, note?: string): Observable<Api<M.RecallNoticeDto>> {
    return this.http.post<Api<M.RecallNoticeDto>>(
      API.traceability.updateNotice(id, { returnedQuantity, isClosed, note }), {});
  }

  completeRecall(id: string, closureReport: string): Observable<Api<M.RecallDto>> {
    return this.http.post<Api<M.RecallDto>>(API.traceability.completeRecall(id, closureReport), {});
  }

  nearExpiry(query: Q = {}): Observable<Page<M.NearExpiryDto>> {
    return this.http.get<Page<M.NearExpiryDto>>(API.traceability.nearExpiry(query));
  }
}

@Injectable({ providedIn: 'root' })
export class DistributionReportService {
  private http = inject(HttpClient);

  dashboard(query: Q = {}): Observable<Api<M.DistributionDashboardDto>> {
    return this.http.get<Api<M.DistributionDashboardDto>>(API.reports.dashboard(query));
  }

  exceptions(territoryId?: string): Observable<Api<M.ExceptionDashboardDto>> {
    return this.http.get<Api<M.ExceptionDashboardDto>>(API.reports.exceptions(territoryId));
  }

  sales(filter: M.DistributionReportFilter, groupBy = 'Outlet'): Observable<Api<M.SalesReportDto>> {
    return this.http.post<Api<M.SalesReportDto>>(API.reports.sales(groupBy), filter);
  }

  productivity(filter: M.DistributionReportFilter): Observable<Api<M.ProductivityReportDto>> {
    return this.http.post<Api<M.ProductivityReportDto>>(API.reports.productivity, filter);
  }

  outlets(filter: M.DistributionReportFilter): Observable<Api<M.OutletAnalyticsDto>> {
    return this.http.post<Api<M.OutletAnalyticsDto>>(API.reports.outlets, filter);
  }

  logistics(filter: M.DistributionReportFilter): Observable<Api<M.LogisticsReportDto>> {
    return this.http.post<Api<M.LogisticsReportDto>>(API.reports.logistics, filter);
  }

  receivables(filter: M.DistributionReportFilter): Observable<Api<M.ReceivablesReportDto>> {
    return this.http.post<Api<M.ReceivablesReportDto>>(API.reports.receivables, filter);
  }

  returns(filter: M.DistributionReportFilter): Observable<Api<M.ReturnsReportDto>> {
    return this.http.post<Api<M.ReturnsReportDto>>(API.reports.returns, filter);
  }

  claims(filter: M.DistributionReportFilter): Observable<Api<M.ClaimsReportDto>> {
    return this.http.post<Api<M.ClaimsReportDto>>(API.reports.claims, filter);
  }

  stock(filter: M.DistributionReportFilter): Observable<Api<M.StockReportDto>> {
    return this.http.post<Api<M.StockReportDto>>(API.reports.stock, filter);
  }
}

@Injectable({ providedIn: 'root' })
export class DistributionAdminService {
  private http = inject(HttpClient);

  reasons(query: Q = {}): Observable<Api<M.ReasonCodeDto[]>> {
    return this.http.get<Api<M.ReasonCodeDto[]>>(API.admin.reasons(query));
  }

  saveReason(id: string | null, dto: Partial<M.ReasonCodeDto>): Observable<Api<M.ReasonCodeDto>> {
    return id
      ? this.http.put<Api<M.ReasonCodeDto>>(API.admin.updateReason(id), dto)
      : this.http.post<Api<M.ReasonCodeDto>>(API.admin.createReason, dto);
  }

  deleteReason(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(API.admin.deleteReason(id));
  }

  settings(): Observable<Api<M.DistributionSettingsDto>> {
    return this.http.get<Api<M.DistributionSettingsDto>>(API.admin.settings);
  }

  saveSettings(dto: M.DistributionSettingsDto): Observable<Api<M.DistributionSettingsDto>> {
    return this.http.put<Api<M.DistributionSettingsDto>>(API.admin.settings, dto);
  }

  notifications(query: Q = {}): Observable<Page<M.NotificationDto>> {
    return this.http.get<Page<M.NotificationDto>>(API.admin.notifications(query));
  }

  markRead(id: string): Observable<Api<M.NotificationDto>> {
    return this.http.post<Api<M.NotificationDto>>(API.admin.markRead(id), {});
  }

  markAllRead(): Observable<Api<void>> {
    return this.http.post<Api<void>>(API.admin.markAllRead, {});
  }

  unreadCount(): Observable<Api<number>> {
    return this.http.get<Api<number>>(API.admin.unreadCount);
  }
}
