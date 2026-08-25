import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FITNESS_API } from './fitness-api-config';
import * as M from '../models/fitness.models';

type Api<T> = M.ApiResponse<T>;
type Page<T> = M.PaginatedResponse<T>;

// ── Clubs ────────────────────────────────────────────────────────────────────

/**
 * Clubs, opening hours, rooms and company-wide settings.
 *
 * Holds the selected club in a signal because nearly every other screen is scoped to one, and a
 * receptionist who picks their site once should not be asked again on the next page.
 */
@Injectable({ providedIn: 'root' })
export class ClubService {
  private http = inject(HttpClient);

  /** The club the user is currently working in. Persisted to local storage by the picker. */
  readonly selectedClubId = signal<string | null>(null);

  /** The clubs this company has, cached after the first load. */
  readonly clubs = signal<M.ClubDto[]>([]);

  getAll(activeOnly = false): Observable<Api<M.ClubDto[]>> {
    return this.http.get<Api<M.ClubDto[]>>(FITNESS_API.clubs.getAll(activeOnly));
  }

  getById(id: string): Observable<Api<M.ClubDto>> {
    return this.http.get<Api<M.ClubDto>>(FITNESS_API.clubs.getById(id));
  }

  create(dto: M.SaveClubDto): Observable<Api<M.ClubDto>> {
    return this.http.post<Api<M.ClubDto>>(FITNESS_API.clubs.create, dto);
  }

  update(id: string, dto: M.SaveClubDto): Observable<Api<M.ClubDto>> {
    return this.http.put<Api<M.ClubDto>>(FITNESS_API.clubs.update(id), dto);
  }

  delete(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(FITNESS_API.clubs.delete(id));
  }

  /** Fills in whatever configuration this company is missing. Safe to call repeatedly. */
  provision(includeSampleData = false): Observable<Api<M.ClubDto[]>> {
    return this.http.post<Api<M.ClubDto[]>>(FITNESS_API.clubs.provision(includeSampleData), {});
  }

  getSchedules(clubId: string): Observable<Api<M.ClubScheduleDto[]>> {
    return this.http.get<Api<M.ClubScheduleDto[]>>(FITNESS_API.clubs.schedules(clubId));
  }

  saveSchedules(clubId: string, dto: M.ClubScheduleDto[]): Observable<Api<M.ClubScheduleDto[]>> {
    return this.http.put<Api<M.ClubScheduleDto[]>>(FITNESS_API.clubs.schedules(clubId), dto);
  }

  getClosures(clubId: string, upcomingOnly = true): Observable<Api<M.ClubClosureDto[]>> {
    return this.http.get<Api<M.ClubClosureDto[]>>(FITNESS_API.clubs.closures(clubId, upcomingOnly));
  }

  saveClosure(dto: M.ClubClosureDto, id?: string): Observable<Api<M.ClubClosureDto>> {
    return this.http.post<Api<M.ClubClosureDto>>(FITNESS_API.clubs.saveClosure(id), dto);
  }

  getAreas(clubId: string): Observable<Api<M.ClubAreaDto[]>> {
    return this.http.get<Api<M.ClubAreaDto[]>>(FITNESS_API.clubs.areas(clubId));
  }

  saveArea(dto: M.ClubAreaDto, id?: string): Observable<Api<M.ClubAreaDto>> {
    return this.http.post<Api<M.ClubAreaDto>>(FITNESS_API.clubs.saveArea(id), dto);
  }

  getRooms(clubId: string): Observable<Api<M.RoomDto[]>> {
    return this.http.get<Api<M.RoomDto[]>>(FITNESS_API.clubs.rooms(clubId));
  }

  saveRoomLayout(dto: M.SaveRoomLayoutDto): Observable<Api<M.RoomDto>> {
    return this.http.post<Api<M.RoomDto>>(FITNESS_API.clubs.saveRoomLayout, dto);
  }

  getSettings(): Observable<Api<M.FitnessSettingsDto>> {
    return this.http.get<Api<M.FitnessSettingsDto>>(FITNESS_API.clubs.settings);
  }

  saveSettings(dto: M.FitnessSettingsDto): Observable<Api<M.FitnessSettingsDto>> {
    return this.http.put<Api<M.FitnessSettingsDto>>(FITNESS_API.clubs.settings, dto);
  }
}

// ── Members ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class MemberService {
  private http = inject(HttpClient);

  list(opts: Parameters<typeof FITNESS_API.members.list>[0] = {}): Observable<Page<M.MemberSummaryDto>> {
    return this.http.get<Page<M.MemberSummaryDto>>(FITNESS_API.members.list(opts));
  }

  /** The whole 360 view in one payload. */
  getById(id: string): Observable<Api<M.MemberDetailDto>> {
    return this.http.get<Api<M.MemberDetailDto>>(FITNESS_API.members.getById(id));
  }

  /** Ranked search for the desk: exact member number first, then phone, then active members. */
  search(dto: M.MemberSearchDto): Observable<Api<M.MemberSummaryDto[]>> {
    return this.http.post<Api<M.MemberSummaryDto[]>>(FITNESS_API.members.search, dto);
  }

  create(dto: M.SaveMemberDto): Observable<Api<M.MemberDetailDto>> {
    return this.http.post<Api<M.MemberDetailDto>>(FITNESS_API.members.create, dto);
  }

  update(id: string, dto: M.SaveMemberDto): Observable<Api<M.MemberDetailDto>> {
    return this.http.put<Api<M.MemberDetailDto>>(FITNESS_API.members.update(id), dto);
  }

  /** The join wizard, in one transaction. */
  join(dto: M.JoinMemberDto): Observable<Api<M.JoinResultDto>> {
    return this.http.post<Api<M.JoinResultDto>>(FITNESS_API.members.join, dto);
  }

  changeStatus(dto: M.ChangeMemberStatusDto): Observable<Api<M.MemberDetailDto>> {
    return this.http.post<Api<M.MemberDetailDto>>(FITNESS_API.members.changeStatus, dto);
  }

  setBan(dto: M.BanMemberDto): Observable<Api<M.MemberDetailDto>> {
    return this.http.post<Api<M.MemberDetailDto>>(FITNESS_API.members.ban, dto);
  }

  getTimeline(id: string, limit = 100): Observable<Api<M.MemberNoteDto[]>> {
    return this.http.get<Api<M.MemberNoteDto[]>>(FITNESS_API.members.timeline(id, limit));
  }

  addNote(dto: M.MemberNoteDto): Observable<Api<M.MemberNoteDto>> {
    return this.http.post<Api<M.MemberNoteDto>>(FITNESS_API.members.addNote, dto);
  }

  getAlerts(id: string): Observable<Api<M.MemberAlertDto[]>> {
    return this.http.get<Api<M.MemberAlertDto[]>>(FITNESS_API.members.alerts(id));
  }

  refreshAlerts(id: string): Observable<Api<void>> {
    return this.http.post<Api<void>>(FITNESS_API.members.refreshAlerts(id), {});
  }

  getVisits(id: string, limit = 50): Observable<Api<M.VisitHistoryDto[]>> {
    return this.http.get<Api<M.VisitHistoryDto[]>>(FITNESS_API.members.visits(id, limit));
  }

  getLedger(id: string, limit = 100): Observable<Api<M.MemberLedgerEntryDto[]>> {
    return this.http.get<Api<M.MemberLedgerEntryDto[]>>(FITNESS_API.members.ledger(id, limit));
  }

  getUpcoming(id: string): Observable<Api<M.UpcomingBookingDto[]>> {
    return this.http.get<Api<M.UpcomingBookingDto[]>>(FITNESS_API.members.upcoming(id));
  }

  issueCredential(dto: M.IssueCredentialDto): Observable<Api<M.MemberCredentialDto>> {
    return this.http.post<Api<M.MemberCredentialDto>>(FITNESS_API.members.issueCredential, dto);
  }

  deactivateCredential(id: string, reason: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(FITNESS_API.members.deactivateCredential(id, reason));
  }

  /** The families at a club. A household cannot be found by guessing its id. */
  listHouseholds(
    opts: Parameters<typeof FITNESS_API.members.households>[0] = {},
  ): Observable<Page<M.HouseholdDto>> {
    return this.http.get<Page<M.HouseholdDto>>(FITNESS_API.members.households(opts));
  }

  getHousehold(id: string): Observable<Api<M.HouseholdDto>> {
    return this.http.get<Api<M.HouseholdDto>>(FITNESS_API.members.household(id));
  }

  saveHousehold(dto: M.SaveHouseholdDto): Observable<Api<M.HouseholdDto>> {
    return this.http.post<Api<M.HouseholdDto>>(FITNESS_API.members.saveHousehold, dto);
  }

  previewMerge(dto: M.MergeMembersDto): Observable<Api<M.MergePreviewDto>> {
    return this.http.post<Api<M.MergePreviewDto>>(FITNESS_API.members.previewMerge, dto);
  }

  merge(dto: M.MergeMembersDto): Observable<Api<M.MemberDetailDto>> {
    return this.http.post<Api<M.MemberDetailDto>>(FITNESS_API.members.merge, dto);
  }

  /** Everything held about this member. The request itself is audited server-side. */
  export(id: string): Observable<Api<M.MemberExportDto>> {
    return this.http.get<Api<M.MemberExportDto>>(FITNESS_API.members.export(id));
  }

  /** Irreversible. Keeps the financial and incident records the club is required to retain. */
  anonymise(dto: M.AnonymiseMemberDto): Observable<Api<void>> {
    return this.http.post<Api<void>>(FITNESS_API.members.anonymise, dto);
  }
}

// ── Catalogue ────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class CatalogueService {
  private http = inject(HttpClient);

  getPlans(clubId?: string, kind?: number, sellableOnly = false): Observable<Api<M.MembershipPlanDto[]>> {
    return this.http.get<Api<M.MembershipPlanDto[]>>(FITNESS_API.catalogue.plans(clubId, kind, sellableOnly));
  }

  getPlan(id: string): Observable<Api<M.MembershipPlanDto>> {
    return this.http.get<Api<M.MembershipPlanDto>>(FITNESS_API.catalogue.plan(id));
  }

  createPlan(dto: M.SavePlanDto): Observable<Api<M.MembershipPlanDto>> {
    return this.http.post<Api<M.MembershipPlanDto>>(FITNESS_API.catalogue.createPlan, dto);
  }

  updatePlan(id: string, dto: M.SavePlanDto): Observable<Api<M.MembershipPlanDto>> {
    return this.http.put<Api<M.MembershipPlanDto>>(FITNESS_API.catalogue.updatePlan(id), dto);
  }

  deletePlan(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(FITNESS_API.catalogue.deletePlan(id));
  }

  getSalesCatalogue(clubId: string): Observable<Api<M.SalesCatalogueDto>> {
    return this.http.get<Api<M.SalesCatalogueDto>>(FITNESS_API.catalogue.salesCatalogue(clubId));
  }

  getPromotions(clubId?: string, activeOnly = true): Observable<Api<M.PromotionRuleDto[]>> {
    return this.http.get<Api<M.PromotionRuleDto[]>>(FITNESS_API.catalogue.promotions(clubId, activeOnly));
  }

  savePromotion(dto: M.PromotionRuleDto, id?: string): Observable<Api<M.PromotionRuleDto>> {
    return this.http.post<Api<M.PromotionRuleDto>>(FITNESS_API.catalogue.savePromotion(id), dto);
  }

  /** A refusal comes back as a sentence the desk can read out. */
  checkPromoCode(dto: M.PromoCodeCheckDto): Observable<Api<M.PromoCodeResultDto>> {
    return this.http.post<Api<M.PromoCodeResultDto>>(FITNESS_API.catalogue.checkPromoCode, dto);
  }

  getServices(clubId?: string, activeOnly = true): Observable<Api<M.AppointmentServiceDto[]>> {
    return this.http.get<Api<M.AppointmentServiceDto[]>>(FITNESS_API.catalogue.services(clubId, activeOnly));
  }

  saveService(dto: M.AppointmentServiceDto, id?: string): Observable<Api<M.AppointmentServiceDto>> {
    return this.http.post<Api<M.AppointmentServiceDto>>(FITNESS_API.catalogue.saveService(id), dto);
  }

  getChangePaths(planId: string): Observable<Api<M.PlanChangePathDto[]>> {
    return this.http.get<Api<M.PlanChangePathDto[]>>(FITNESS_API.catalogue.changePaths(planId));
  }
}

// ── Agreements ───────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AgreementService {
  private http = inject(HttpClient);

  list(opts: Parameters<typeof FITNESS_API.agreements.list>[0] = {}): Observable<Page<M.AgreementSummaryDto>> {
    return this.http.get<Page<M.AgreementSummaryDto>>(FITNESS_API.agreements.list(opts));
  }

  getById(id: string): Observable<Api<M.AgreementDetailDto>> {
    return this.http.get<Api<M.AgreementDetailDto>>(FITNESS_API.agreements.getById(id));
  }

  create(dto: M.CreateAgreementDto): Observable<Api<M.AgreementDetailDto>> {
    return this.http.post<Api<M.AgreementDetailDto>>(FITNESS_API.agreements.create, dto);
  }

  sign(dto: M.SignAgreementDto): Observable<Api<M.AgreementSignatureDto>> {
    return this.http.post<Api<M.AgreementSignatureDto>>(FITNESS_API.agreements.sign, dto);
  }

  signRemote(dto: M.RequestRemoteSignatureDto): Observable<Api<M.AgreementSignatureDto>> {
    return this.http.post<Api<M.AgreementSignatureDto>>(FITNESS_API.agreements.signRemote, dto);
  }

  previewPlanChange(id: string, newPlanId: string, effectiveOn?: string): Observable<Api<M.PlanChangePreviewDto>> {
    return this.http.get<Api<M.PlanChangePreviewDto>>(
      FITNESS_API.agreements.previewPlanChange(id, newPlanId, effectiveOn));
  }

  changePlan(dto: M.ChangePlanDto): Observable<Api<M.AgreementDetailDto>> {
    return this.http.post<Api<M.AgreementDetailDto>>(FITNESS_API.agreements.changePlan, dto);
  }

  /** The cost, the new end date and the days used — before anything is committed. */
  previewFreeze(dto: M.RequestFreezeDto): Observable<Api<M.FreezePreviewDto>> {
    return this.http.post<Api<M.FreezePreviewDto>>(FITNESS_API.agreements.previewFreeze, dto);
  }

  freeze(dto: M.RequestFreezeDto): Observable<Api<M.MembershipFreezeDto>> {
    return this.http.post<Api<M.MembershipFreezeDto>>(FITNESS_API.agreements.freeze, dto);
  }

  endFreeze(dto: M.EndFreezeDto): Observable<Api<M.MembershipFreezeDto>> {
    return this.http.post<Api<M.MembershipFreezeDto>>(FITNESS_API.agreements.endFreeze, dto);
  }

  getFreezes(clubId?: string, memberId?: string, activeOnly = true): Observable<Api<M.MembershipFreezeDto[]>> {
    return this.http.get<Api<M.MembershipFreezeDto[]>>(
      FITNESS_API.agreements.freezes(clubId, memberId, activeOnly));
  }

  suspend(dto: M.SuspendMemberDto): Observable<Api<M.MembershipSuspensionDto>> {
    return this.http.post<Api<M.MembershipSuspensionDto>>(FITNESS_API.agreements.suspend, dto);
  }

  liftSuspension(id: string, reason?: string): Observable<Api<M.MembershipSuspensionDto>> {
    return this.http.post<Api<M.MembershipSuspensionDto>>(FITNESS_API.agreements.liftSuspension(id, reason), {});
  }

  /** What cancelling means for this member, plus the offers most likely to work on them. */
  previewCancellation(id: string, requestedEffectiveOn?: string): Observable<Api<M.CancellationPreviewDto>> {
    return this.http.get<Api<M.CancellationPreviewDto>>(
      FITNESS_API.agreements.previewCancellation(id, requestedEffectiveOn));
  }

  requestCancellation(dto: M.RequestCancellationDto): Observable<Api<M.CancellationRequestDto>> {
    return this.http.post<Api<M.CancellationRequestDto>>(FITNESS_API.agreements.requestCancellation, dto);
  }

  makeSaveOffer(dto: M.MakeSaveOfferDto): Observable<Api<M.SaveOfferDto>> {
    return this.http.post<Api<M.SaveOfferDto>>(FITNESS_API.agreements.makeSaveOffer, dto);
  }

  respondToOffer(dto: M.RespondToSaveOfferDto): Observable<Api<M.CancellationRequestDto>> {
    return this.http.post<Api<M.CancellationRequestDto>>(FITNESS_API.agreements.respondToOffer, dto);
  }

  processCancellation(id: string): Observable<Api<M.AgreementDetailDto>> {
    return this.http.post<Api<M.AgreementDetailDto>>(FITNESS_API.agreements.processCancellation(id), {});
  }

  getPendingCancellations(clubId?: string): Observable<Api<M.CancellationRequestDto[]>> {
    return this.http.get<Api<M.CancellationRequestDto[]>>(FITNESS_API.agreements.pendingCancellations(clubId));
  }
}

// ── Billing ──────────────────────────────────────────────────────────────────

/**
 * Billing runs, invoices and payments.
 *
 * Nothing in this service ever carries a card number. `savePaymentMethod` sends a provider token
 * and the brand, last four and expiry the desk needs to recognise it — the server rejects anything
 * that looks like a real PAN.
 */
@Injectable({ providedIn: 'root' })
export class BillingService {
  private http = inject(HttpClient);

  getSchedule(agreementId: string): Observable<Api<M.BillingScheduleDto[]>> {
    return this.http.get<Api<M.BillingScheduleDto[]>>(FITNESS_API.billing.schedule(agreementId));
  }

  rebuildSchedule(agreementId: string): Observable<Api<void>> {
    return this.http.post<Api<void>>(FITNESS_API.billing.rebuildSchedule(agreementId), {});
  }

  startRun(dto: M.StartBillingRunDto): Observable<Api<M.BillingRunDto>> {
    return this.http.post<Api<M.BillingRunDto>>(FITNESS_API.billing.startRun, dto);
  }

  getRun(id: string): Observable<Api<M.BillingRunDto>> {
    return this.http.get<Api<M.BillingRunDto>>(FITNESS_API.billing.run(id));
  }

  getRunLines(id: string, opts: { outcome?: string; page?: number; size?: number } = {}): Observable<Page<M.BillingRunLineDto>> {
    return this.http.get<Page<M.BillingRunLineDto>>(FITNESS_API.billing.runLines(id, opts));
  }

  listRuns(opts: Parameters<typeof FITNESS_API.billing.runs>[0] = {}): Observable<Page<M.BillingRunDto>> {
    return this.http.get<Page<M.BillingRunDto>>(FITNESS_API.billing.runs(opts));
  }

  listInvoices(opts: Parameters<typeof FITNESS_API.billing.invoices>[0] = {}): Observable<Page<M.InvoiceSummaryDto>> {
    return this.http.get<Page<M.InvoiceSummaryDto>>(FITNESS_API.billing.invoices(opts));
  }

  getInvoice(id: string): Observable<Api<M.InvoiceDetailDto>> {
    return this.http.get<Api<M.InvoiceDetailDto>>(FITNESS_API.billing.invoice(id));
  }

  createInvoice(memberId: string, clubId: string, lines: M.InvoiceLineDto[]): Observable<Api<M.InvoiceDetailDto>> {
    return this.http.post<Api<M.InvoiceDetailDto>>(FITNESS_API.billing.createInvoice(memberId, clubId), lines);
  }

  cancelInvoice(id: string, reason: string): Observable<Api<M.InvoiceDetailDto>> {
    return this.http.post<Api<M.InvoiceDetailDto>>(FITNESS_API.billing.cancelInvoice(id, reason), {});
  }

  /** Send an idempotency key. Tills get double-tapped. */
  takePayment(dto: M.TakePaymentDto): Observable<Api<M.TakePaymentResultDto>> {
    return this.http.post<Api<M.TakePaymentResultDto>>(FITNESS_API.billing.takePayment, dto);
  }

  listPayments(opts: Parameters<typeof FITNESS_API.billing.payments>[0] = {}): Observable<Page<M.PaymentDto>> {
    return this.http.get<Page<M.PaymentDto>>(FITNESS_API.billing.payments(opts));
  }

  getPaymentMethods(memberId: string): Observable<Api<M.PaymentMethodRefDto[]>> {
    return this.http.get<Api<M.PaymentMethodRefDto[]>>(FITNESS_API.billing.paymentMethods(memberId));
  }

  savePaymentMethod(dto: M.SavePaymentMethodDto): Observable<Api<M.PaymentMethodRefDto>> {
    return this.http.post<Api<M.PaymentMethodRefDto>>(FITNESS_API.billing.savePaymentMethod, dto);
  }

  deletePaymentMethod(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(FITNESS_API.billing.deletePaymentMethod(id));
  }

  issueCreditNote(dto: M.IssueCreditNoteDto): Observable<Api<M.CreditNoteDto>> {
    return this.http.post<Api<M.CreditNoteDto>>(FITNESS_API.billing.creditNote, dto);
  }

  issueRefund(dto: M.IssueRefundDto): Observable<Api<M.RefundDto>> {
    return this.http.post<Api<M.RefundDto>>(FITNESS_API.billing.refund, dto);
  }

  writeOff(memberId: string, amount: number, reason: string, invoiceId?: string): Observable<Api<M.WriteOffDto>> {
    return this.http.post<Api<M.WriteOffDto>>(
      FITNESS_API.billing.writeOff(memberId, amount, reason, invoiceId), {});
  }

  getDeferredRevenue(from: string, to: string, clubId?: string): Observable<Api<M.DeferredRevenueReportDto>> {
    return this.http.get<Api<M.DeferredRevenueReportDto>>(
      FITNESS_API.billing.deferredRevenue(from, to, clubId));
  }
}

// ── Collections ──────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class CollectionsService {
  private http = inject(HttpClient);

  listCases(opts: Parameters<typeof FITNESS_API.collections.cases>[0] = {}): Observable<Page<M.DunningCaseDto>> {
    return this.http.get<Page<M.DunningCaseDto>>(FITNESS_API.collections.cases(opts));
  }

  getCase(id: string): Observable<Api<M.DunningCaseDto>> {
    return this.http.get<Api<M.DunningCaseDto>>(FITNESS_API.collections.case(id));
  }

  /** Retry, pause, resume, assign, log a promise to pay, or write off. */
  action(dto: M.DunningActionDto): Observable<Api<M.DunningCaseDto>> {
    return this.http.post<Api<M.DunningCaseDto>>(FITNESS_API.collections.action, dto);
  }

  getPolicies(clubId?: string): Observable<Api<M.DunningPolicyDto[]>> {
    return this.http.get<Api<M.DunningPolicyDto[]>>(FITNESS_API.collections.policies(clubId));
  }

  savePolicy(dto: M.DunningPolicyDto, id?: string): Observable<Api<M.DunningPolicyDto>> {
    return this.http.post<Api<M.DunningPolicyDto>>(FITNESS_API.collections.savePolicy(id), dto);
  }

  /** Ageing bands and the breakdown by failure reason. */
  getArrears(clubId?: string, asAt?: string): Observable<Api<M.ArrearsReportDto>> {
    return this.http.get<Api<M.ArrearsReportDto>>(FITNESS_API.collections.arrears(clubId, asAt));
  }
}

// ── Access ───────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AccessService {
  private http = inject(HttpClient);

  /** Should this door open? Every refusal comes back as a sentence a member can be told. */
  decide(dto: M.AccessRequestDto): Observable<Api<M.AccessDecisionDto>> {
    return this.http.post<Api<M.AccessDecisionDto>>(FITNESS_API.access.decide, dto);
  }

  manualCheckIn(dto: M.ManualCheckInDto): Observable<Api<M.AccessDecisionDto>> {
    return this.http.post<Api<M.AccessDecisionDto>>(FITNESS_API.access.manualCheckIn, dto);
  }

  checkOut(checkInId: string): Observable<Api<M.CheckInDto>> {
    return this.http.post<Api<M.CheckInDto>>(FITNESS_API.access.checkOut(checkInId), {});
  }

  getOccupancy(clubId: string): Observable<Api<M.OccupancyDto>> {
    return this.http.get<Api<M.OccupancyDto>>(FITNESS_API.access.occupancy(clubId));
  }

  getOccupancyTrend(clubId: string, from: string, to: string): Observable<Api<M.OccupancyTrendDto>> {
    return this.http.get<Api<M.OccupancyTrendDto>>(FITNESS_API.access.occupancyTrend(clubId, from, to));
  }

  getEvents(opts: Parameters<typeof FITNESS_API.access.events>[0] = {}): Observable<Page<M.AccessEventDto>> {
    return this.http.get<Page<M.AccessEventDto>>(FITNESS_API.access.events(opts));
  }

  getCheckIns(opts: Parameters<typeof FITNESS_API.access.checkIns>[0] = {}): Observable<Page<M.CheckInDto>> {
    return this.http.get<Page<M.CheckInDto>>(FITNESS_API.access.checkIns(opts));
  }

  getDoors(clubId?: string): Observable<Api<M.DoorDto[]>> {
    return this.http.get<Api<M.DoorDto[]>>(FITNESS_API.access.doors(clubId));
  }

  saveDoor(dto: M.SaveDoorDto, id?: string): Observable<Api<M.DoorDto>> {
    return this.http.post<Api<M.DoorDto>>(FITNESS_API.access.saveDoor(id), dto);
  }

  deleteDoor(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(FITNESS_API.access.deleteDoor(id));
  }

  releaseDoor(id: string, reason: string): Observable<Api<M.DoorDto>> {
    return this.http.post<Api<M.DoorDto>>(FITNESS_API.access.releaseDoor(id, reason), {});
  }

  getControllers(clubId?: string): Observable<Api<M.AccessControllerDto[]>> {
    return this.http.get<Api<M.AccessControllerDto[]>>(FITNESS_API.access.controllers(clubId));
  }

  saveController(dto: M.SaveControllerDto, id?: string): Observable<Api<M.AccessControllerDto>> {
    return this.http.post<Api<M.AccessControllerDto>>(FITNESS_API.access.saveController(id), dto);
  }

  getControllerCache(id: string): Observable<Api<M.AccessCacheDto>> {
    return this.http.get<Api<M.AccessCacheDto>>(FITNESS_API.access.controllerCache(id));
  }

  getRules(clubId?: string): Observable<Api<M.AccessRuleDto[]>> {
    return this.http.get<Api<M.AccessRuleDto[]>>(FITNESS_API.access.rules(clubId));
  }

  saveRule(dto: M.AccessRuleDto, id?: string): Observable<Api<M.AccessRuleDto>> {
    return this.http.post<Api<M.AccessRuleDto>>(FITNESS_API.access.saveRule(id), dto);
  }

  registerGuest(dto: M.RegisterGuestDto): Observable<Api<M.GuestVisitDto>> {
    return this.http.post<Api<M.GuestVisitDto>>(FITNESS_API.access.registerGuest, dto);
  }

  issueDayPass(dto: M.IssueDayPassDto): Observable<Api<M.DayPassDto>> {
    return this.http.post<Api<M.DayPassDto>>(FITNESS_API.access.issueDayPass, dto);
  }

  listDayPasses(opts: Parameters<typeof FITNESS_API.access.dayPasses>[0] = {}): Observable<Page<M.DayPassDto>> {
    return this.http.get<Page<M.DayPassDto>>(FITNESS_API.access.dayPasses(opts));
  }

  /** The entire front desk screen in one call. */
  getFrontDesk(clubId: string, staffId?: string): Observable<Api<M.FrontDeskDto>> {
    return this.http.get<Api<M.FrontDeskDto>>(FITNESS_API.access.frontDesk(clubId, staffId));
  }
}

// ── Classes ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private http = inject(HttpClient);

  getClassTypes(clubId?: string, activeOnly = true): Observable<Api<M.ClassTypeDto[]>> {
    return this.http.get<Api<M.ClassTypeDto[]>>(FITNESS_API.classes.types(clubId, activeOnly));
  }

  saveClassType(dto: M.SaveClassTypeDto, id?: string): Observable<Api<M.ClassTypeDto>> {
    return this.http.post<Api<M.ClassTypeDto>>(FITNESS_API.classes.saveType(id), dto);
  }

  deleteClassType(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(FITNESS_API.classes.deleteType(id));
  }

  getSchedules(clubId: string, seasonCode?: string, publishedOnly = false): Observable<Api<M.ClassScheduleDto[]>> {
    return this.http.get<Api<M.ClassScheduleDto[]>>(
      FITNESS_API.classes.schedules(clubId, seasonCode, publishedOnly));
  }

  saveSchedule(dto: M.SaveClassScheduleDto, id?: string): Observable<Api<M.ClassScheduleDto>> {
    return this.http.post<Api<M.ClassScheduleDto>>(FITNESS_API.classes.saveSchedule(id), dto);
  }

  deleteSchedule(id: string, cancelFutureOccurrences = true): Observable<Api<void>> {
    return this.http.delete<Api<void>>(FITNESS_API.classes.deleteSchedule(id, cancelFutureOccurrences));
  }

  /** Double-booked rooms and instructors, found before publishing rather than at 18:29. */
  checkConflicts(clubId: string, seasonCode?: string): Observable<Api<M.ScheduleConflictDto[]>> {
    return this.http.get<Api<M.ScheduleConflictDto[]>>(FITNESS_API.classes.conflicts(clubId, seasonCode));
  }

  publishSchedule(id: string): Observable<Api<M.ClassScheduleDto>> {
    return this.http.post<Api<M.ClassScheduleDto>>(FITNESS_API.classes.publishSchedule(id), {});
  }

  getTimetable(opts: Parameters<typeof FITNESS_API.classes.timetable>[0]): Observable<Api<M.TimetableDto>> {
    return this.http.get<Api<M.TimetableDto>>(FITNESS_API.classes.timetable(opts));
  }

  /** One class: the roster, the spot map, and the medical flags the instructor needs. */
  getOccurrence(id: string, viewerMemberId?: string): Observable<Api<M.ClassOccurrenceDetailDto>> {
    return this.http.get<Api<M.ClassOccurrenceDetailDto>>(FITNESS_API.classes.occurrence(id, viewerMemberId));
  }

  updateOccurrence(dto: M.UpdateOccurrenceDto): Observable<Api<M.ClassOccurrenceDetailDto>> {
    return this.http.put<Api<M.ClassOccurrenceDetailDto>>(FITNESS_API.classes.updateOccurrence, dto);
  }

  cancelOccurrence(dto: M.CancelOccurrenceDto): Observable<Api<M.ClassOccurrenceDetailDto>> {
    return this.http.post<Api<M.ClassOccurrenceDetailDto>>(FITNESS_API.classes.cancelOccurrence, dto);
  }

  /** Can this member book, and if not, why not — in one sentence. */
  checkEligibility(occurrenceId: string, memberId: string): Observable<Api<M.BookingEligibilityDto>> {
    return this.http.get<Api<M.BookingEligibilityDto>>(FITNESS_API.classes.eligibility(occurrenceId, memberId));
  }

  book(dto: M.CreateBookingDto): Observable<Api<M.ClassBookingDto>> {
    return this.http.post<Api<M.ClassBookingDto>>(FITNESS_API.classes.book, dto);
  }

  previewCancel(bookingId: string): Observable<Api<M.CancelBookingPreviewDto>> {
    return this.http.get<Api<M.CancelBookingPreviewDto>>(FITNESS_API.classes.previewCancel(bookingId));
  }

  cancelBooking(dto: M.CancelBookingDto): Observable<Api<M.ClassBookingDto>> {
    return this.http.post<Api<M.ClassBookingDto>>(FITNESS_API.classes.cancelBooking, dto);
  }

  checkInToClass(bookingId: string): Observable<Api<M.ClassBookingDto>> {
    return this.http.post<Api<M.ClassBookingDto>>(FITNESS_API.classes.checkIn(bookingId), {});
  }

  getMemberBookings(
    memberId: string,
    opts: { from?: string; to?: string; upcomingOnly?: boolean } = {},
  ): Observable<Api<M.ClassBookingDto[]>> {
    return this.http.get<Api<M.ClassBookingDto[]>>(FITNESS_API.classes.memberBookings(memberId, opts));
  }

  markAttendance(dto: M.MarkAttendanceDto): Observable<Api<M.ClassOccurrenceDetailDto>> {
    return this.http.post<Api<M.ClassOccurrenceDetailDto>>(FITNESS_API.classes.markAttendance, dto);
  }

  getBookingPolicies(clubId?: string): Observable<Api<M.BookingPolicyDto[]>> {
    return this.http.get<Api<M.BookingPolicyDto[]>>(FITNESS_API.classes.bookingPolicies(clubId));
  }

  saveBookingPolicy(dto: M.BookingPolicyDto, id?: string): Observable<Api<M.BookingPolicyDto>> {
    return this.http.post<Api<M.BookingPolicyDto>>(FITNESS_API.classes.saveBookingPolicy(id), dto);
  }

  getCancellationPolicies(clubId?: string): Observable<Api<M.CancellationPolicyDto[]>> {
    return this.http.get<Api<M.CancellationPolicyDto[]>>(FITNESS_API.classes.cancellationPolicies(clubId));
  }

  saveCancellationPolicy(dto: M.CancellationPolicyDto, id?: string): Observable<Api<M.CancellationPolicyDto>> {
    return this.http.post<Api<M.CancellationPolicyDto>>(FITNESS_API.classes.saveCancellationPolicy(id), dto);
  }

  getStrikes(memberId: string, activeOnly = true): Observable<Api<M.LateCancelStrikeDto[]>> {
    return this.http.get<Api<M.LateCancelStrikeDto[]>>(FITNESS_API.classes.strikes(memberId, activeOnly));
  }

  waiveStrike(id: string, reason: string): Observable<Api<M.LateCancelStrikeDto>> {
    return this.http.post<Api<M.LateCancelStrikeDto>>(FITNESS_API.classes.waiveStrike(id, reason), {});
  }
}

// ── Appointments ─────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private http = inject(HttpClient);

  getBookableStaff(clubId?: string, serviceId?: string, activeOnly = true): Observable<Api<M.BookableStaffDto[]>> {
    return this.http.get<Api<M.BookableStaffDto[]>>(FITNESS_API.appointments.staff(clubId, serviceId, activeOnly));
  }

  saveBookableStaff(dto: M.BookableStaffDto, id?: string): Observable<Api<M.BookableStaffDto>> {
    return this.http.post<Api<M.BookableStaffDto>>(FITNESS_API.appointments.saveStaff(id), dto);
  }

  saveAvailability(bookableStaffId: string, dto: M.StaffAvailabilityDto[]): Observable<Api<M.StaffAvailabilityDto[]>> {
    return this.http.put<Api<M.StaffAvailabilityDto[]>>(
      FITNESS_API.appointments.saveAvailability(bookableStaffId), dto);
  }

  addTimeOff(dto: M.StaffTimeOffDto): Observable<Api<M.StaffTimeOffDto>> {
    return this.http.post<Api<M.StaffTimeOffDto>>(FITNESS_API.appointments.addTimeOff, dto);
  }

  /** Free slots, with the member's own coach offered first. */
  findAvailability(dto: M.AvailabilitySearchDto): Observable<Api<M.AvailabilitySlotDto[]>> {
    return this.http.post<Api<M.AvailabilitySlotDto[]>>(FITNESS_API.appointments.findAvailability, dto);
  }

  list(opts: Parameters<typeof FITNESS_API.appointments.list>[0] = {}): Observable<Page<M.AppointmentSummaryDto>> {
    return this.http.get<Page<M.AppointmentSummaryDto>>(FITNESS_API.appointments.list(opts));
  }

  getById(id: string): Observable<Api<M.AppointmentDetailDto>> {
    return this.http.get<Api<M.AppointmentDetailDto>>(FITNESS_API.appointments.getById(id));
  }

  getDiary(clubId: string, forDate: string, staffId?: string): Observable<Api<M.AppointmentSummaryDto[]>> {
    return this.http.get<Api<M.AppointmentSummaryDto[]>>(
      FITNESS_API.appointments.diary(clubId, forDate, staffId));
  }

  create(dto: M.CreateAppointmentDto): Observable<Api<M.AppointmentDetailDto>> {
    return this.http.post<Api<M.AppointmentDetailDto>>(FITNESS_API.appointments.create, dto);
  }

  reschedule(id: string, newStart: string, newStaffId?: string): Observable<Api<M.AppointmentDetailDto>> {
    return this.http.post<Api<M.AppointmentDetailDto>>(
      FITNESS_API.appointments.reschedule(id, newStart, newStaffId), {});
  }

  cancel(id: string, reason?: string, waivePenalty = false): Observable<Api<M.AppointmentDetailDto>> {
    return this.http.post<Api<M.AppointmentDetailDto>>(
      FITNESS_API.appointments.cancel(id, reason, waivePenalty), {});
  }

  checkIn(id: string, memberId?: string): Observable<Api<M.AppointmentDetailDto>> {
    return this.http.post<Api<M.AppointmentDetailDto>>(FITNESS_API.appointments.checkIn(id, memberId), {});
  }

  /** Consumes the credit, accrues commission and releases deferred revenue — one action. */
  signOff(dto: M.SignOffSessionDto): Observable<Api<M.AppointmentDetailDto>> {
    return this.http.post<Api<M.AppointmentDetailDto>>(FITNESS_API.appointments.signOff, dto);
  }

  markNoShow(id: string, memberId?: string, waivePenalty = false): Observable<Api<M.AppointmentDetailDto>> {
    return this.http.post<Api<M.AppointmentDetailDto>>(
      FITNESS_API.appointments.noShow(id, memberId, waivePenalty), {});
  }

  sellPackage(dto: M.SellPackageDto): Observable<Api<M.SessionPackagePurchaseDto>> {
    return this.http.post<Api<M.SessionPackagePurchaseDto>>(FITNESS_API.appointments.sellPackage, dto);
  }

  getPackages(clubId?: string, memberId?: string, activeOnly = true): Observable<Api<M.SessionPackagePurchaseDto[]>> {
    return this.http.get<Api<M.SessionPackagePurchaseDto[]>>(
      FITNESS_API.appointments.packages(clubId, memberId, activeOnly));
  }

  getCredits(memberId: string): Observable<Api<M.SessionCreditDto[]>> {
    return this.http.get<Api<M.SessionCreditDto[]>>(FITNESS_API.appointments.credits(memberId));
  }

  adjustCredits(dto: M.AdjustCreditsDto): Observable<Api<M.SessionCreditDto>> {
    return this.http.post<Api<M.SessionCreditDto>>(FITNESS_API.appointments.adjustCredits, dto);
  }

  assignCoach(memberId: string, staffId: string, isPrimary = true): Observable<Api<M.CoachAssignmentDto>> {
    return this.http.post<Api<M.CoachAssignmentDto>>(
      FITNESS_API.appointments.assignCoach(memberId, staffId, isPrimary), {});
  }

  getCoachClients(staffId: string, activeOnly = true): Observable<Api<M.CoachAssignmentDto[]>> {
    return this.http.get<Api<M.CoachAssignmentDto[]>>(
      FITNESS_API.appointments.coachClients(staffId, activeOnly));
  }

  /** A trainer's whole day: sessions, classes, gaps and who needs chasing. */
  getTrainerDay(staffId: string, forDate: string): Observable<Api<M.TrainerDayDto>> {
    return this.http.get<Api<M.TrainerDayDto>>(FITNESS_API.appointments.trainerDay(staffId, forDate));
  }
}

// ── Training ─────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class TrainingService {
  private http = inject(HttpClient);

  getExercises(opts: Parameters<typeof FITNESS_API.training.exercises>[0] = {}): Observable<Page<M.ExerciseDto>> {
    return this.http.get<Page<M.ExerciseDto>>(FITNESS_API.training.exercises(opts));
  }

  saveExercise(dto: M.ExerciseDto, id?: string): Observable<Api<M.ExerciseDto>> {
    return this.http.post<Api<M.ExerciseDto>>(FITNESS_API.training.saveExercise(id), dto);
  }

  getWorkouts(opts: Parameters<typeof FITNESS_API.training.workouts>[0] = {}): Observable<Page<M.WorkoutDto>> {
    return this.http.get<Page<M.WorkoutDto>>(FITNESS_API.training.workouts(opts));
  }

  getWorkout(id: string): Observable<Api<M.WorkoutDto>> {
    return this.http.get<Api<M.WorkoutDto>>(FITNESS_API.training.workout(id));
  }

  saveWorkout(dto: M.WorkoutDto, id?: string): Observable<Api<M.WorkoutDto>> {
    return this.http.post<Api<M.WorkoutDto>>(FITNESS_API.training.saveWorkout(id), dto);
  }

  deleteWorkout(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(FITNESS_API.training.deleteWorkout(id));
  }

  getTracks(clubId?: string, activeOnly = true): Observable<Api<M.ProgramTrackDto[]>> {
    return this.http.get<Api<M.ProgramTrackDto[]>>(FITNESS_API.training.tracks(clubId, activeOnly));
  }

  saveTrack(dto: M.ProgramTrackDto, id?: string): Observable<Api<M.ProgramTrackDto>> {
    return this.http.post<Api<M.ProgramTrackDto>>(FITNESS_API.training.saveTrack(id), dto);
  }

  getProgramming(clubId: string, from: string, to: string, trackId?: string): Observable<Api<M.ProgramDayDto[]>> {
    return this.http.get<Api<M.ProgramDayDto[]>>(
      FITNESS_API.training.programming(clubId, from, to, trackId));
  }

  saveProgramDay(dto: M.ProgramDayDto, id?: string): Observable<Api<M.ProgramDayDto>> {
    return this.http.post<Api<M.ProgramDayDto>>(FITNESS_API.training.saveProgramDay(id), dto);
  }

  /** Held back until published, so members do not read Thursday's session on Tuesday. */
  publishProgramDay(id: string): Observable<Api<M.ProgramDayDto>> {
    return this.http.post<Api<M.ProgramDayDto>>(FITNESS_API.training.publishProgramDay(id), {});
  }

  getWodBoard(clubId: string, forDate: string): Observable<Api<M.WodBoardDto>> {
    return this.http.get<Api<M.WodBoardDto>>(FITNESS_API.training.wodBoard(clubId, forDate));
  }

  logResult(dto: M.LogResultDto): Observable<Api<M.WorkoutResultDto>> {
    return this.http.post<Api<M.WorkoutResultDto>>(FITNESS_API.training.logResult, dto);
  }

  getResults(opts: Parameters<typeof FITNESS_API.training.results>[0] = {}): Observable<Page<M.WorkoutResultDto>> {
    return this.http.get<Page<M.WorkoutResultDto>>(FITNESS_API.training.results(opts));
  }

  getPersonalRecords(memberId: string): Observable<Api<M.PersonalRecordDto[]>> {
    return this.http.get<Api<M.PersonalRecordDto[]>>(FITNESS_API.training.personalRecords(memberId));
  }

  /** Respects the member's opt-out: anyone who has opted out does not appear. */
  getLeaderboard(opts: Parameters<typeof FITNESS_API.training.leaderboard>[0]): Observable<Api<M.LeaderboardDto>> {
    return this.http.get<Api<M.LeaderboardDto>>(FITNESS_API.training.leaderboard(opts));
  }

  recordEffort(dto: M.EffortSessionDto): Observable<Api<M.EffortSessionDto>> {
    return this.http.post<Api<M.EffortSessionDto>>(FITNESS_API.training.recordEffort, dto);
  }

  getEffortSessions(memberId: string, from?: string, to?: string): Observable<Api<M.EffortSessionDto[]>> {
    return this.http.get<Api<M.EffortSessionDto[]>>(
      FITNESS_API.training.effortSessions(memberId, from, to));
  }

  getStreak(memberId: string, cadence = 'Weekly'): Observable<Api<M.AttendanceStreakDto>> {
    return this.http.get<Api<M.AttendanceStreakDto>>(FITNESS_API.training.streak(memberId, cadence));
  }

  getLadders(clubId?: string): Observable<Api<M.RankLadderDto[]>> {
    return this.http.get<Api<M.RankLadderDto[]>>(FITNESS_API.training.ladders(clubId));
  }

  saveLadder(dto: M.RankLadderDto, id?: string): Observable<Api<M.RankLadderDto>> {
    return this.http.post<Api<M.RankLadderDto>>(FITNESS_API.training.saveLadder(id), dto);
  }

  getMemberRanks(memberId: string): Observable<Api<M.MemberRankDto[]>> {
    return this.http.get<Api<M.MemberRankDto[]>>(FITNESS_API.training.memberRanks(memberId));
  }

  getGradingCandidates(clubId: string, ladderId: string): Observable<Api<M.MemberRankDto[]>> {
    return this.http.get<Api<M.MemberRankDto[]>>(
      FITNESS_API.training.gradingCandidates(clubId, ladderId));
  }

  awardRank(dto: M.AwardRankDto): Observable<Api<M.MemberRankDto>> {
    return this.http.post<Api<M.MemberRankDto>>(FITNESS_API.training.awardRank, dto);
  }

  saveGradingEvent(dto: M.GradingEventDto, id?: string): Observable<Api<M.GradingEventDto>> {
    return this.http.post<Api<M.GradingEventDto>>(FITNESS_API.training.saveGradingEvent(id), dto);
  }

  grantClearance(dto: M.SkillClearanceDto): Observable<Api<M.SkillClearanceDto>> {
    return this.http.post<Api<M.SkillClearanceDto>>(FITNESS_API.training.grantClearance, dto);
  }

  getClearances(memberId: string, activeOnly = true): Observable<Api<M.SkillClearanceDto[]>> {
    return this.http.get<Api<M.SkillClearanceDto[]>>(FITNESS_API.training.clearances(memberId, activeOnly));
  }
}

// ── Assessments ──────────────────────────────────────────────────────────────

/**
 * Body composition, goals, nutrition and habits.
 *
 * Everything here is special-category data: reads are audited server-side, and a progress photo
 * cannot be uploaded or shown without the member's recorded consent.
 */
@Injectable({ providedIn: 'root' })
export class AssessmentService {
  private http = inject(HttpClient);

  getTemplates(clubId?: string, activeOnly = true): Observable<Api<M.AssessmentTemplateDto[]>> {
    return this.http.get<Api<M.AssessmentTemplateDto[]>>(
      FITNESS_API.assessments.templates(clubId, activeOnly));
  }

  saveTemplate(dto: M.AssessmentTemplateDto, id?: string): Observable<Api<M.AssessmentTemplateDto>> {
    return this.http.post<Api<M.AssessmentTemplateDto>>(FITNESS_API.assessments.saveTemplate(id), dto);
  }

  list(opts: Parameters<typeof FITNESS_API.assessments.list>[0] = {}): Observable<Page<M.AssessmentDto>> {
    return this.http.get<Page<M.AssessmentDto>>(FITNESS_API.assessments.list(opts));
  }

  getById(id: string): Observable<Api<M.AssessmentDto>> {
    return this.http.get<Api<M.AssessmentDto>>(FITNESS_API.assessments.getById(id));
  }

  record(dto: M.RecordAssessmentDto): Observable<Api<M.AssessmentDto>> {
    return this.http.post<Api<M.AssessmentDto>>(FITNESS_API.assessments.record, dto);
  }

  getProgress(memberId: string, measureNames?: string[]): Observable<Api<M.ProgressSeriesDto[]>> {
    return this.http.get<Api<M.ProgressSeriesDto[]>>(
      FITNESS_API.assessments.progress(memberId, measureNames));
  }

  addPhoto(dto: M.ProgressPhotoDto): Observable<Api<M.ProgressPhotoDto>> {
    return this.http.post<Api<M.ProgressPhotoDto>>(FITNESS_API.assessments.addPhoto, dto);
  }

  getPhotos(memberId: string): Observable<Api<M.ProgressPhotoDto[]>> {
    return this.http.get<Api<M.ProgressPhotoDto[]>>(FITNESS_API.assessments.photos(memberId));
  }

  getGoals(memberId: string, activeOnly = true): Observable<Api<M.MemberGoalDto[]>> {
    return this.http.get<Api<M.MemberGoalDto[]>>(FITNESS_API.assessments.goals(memberId, activeOnly));
  }

  saveGoal(dto: M.MemberGoalDto, id?: string): Observable<Api<M.MemberGoalDto>> {
    return this.http.post<Api<M.MemberGoalDto>>(FITNESS_API.assessments.saveGoal(id), dto);
  }

  saveNutritionPlan(dto: M.NutritionPlanDto, id?: string): Observable<Api<M.NutritionPlanDto>> {
    return this.http.post<Api<M.NutritionPlanDto>>(FITNESS_API.assessments.saveNutritionPlan(id), dto);
  }

  getNutritionPlans(memberId: string, activeOnly = true): Observable<Api<M.NutritionPlanDto[]>> {
    return this.http.get<Api<M.NutritionPlanDto[]>>(
      FITNESS_API.assessments.nutritionPlans(memberId, activeOnly));
  }

  saveHabit(dto: M.HabitTrackerDto, id?: string): Observable<Api<M.HabitTrackerDto>> {
    return this.http.post<Api<M.HabitTrackerDto>>(FITNESS_API.assessments.saveHabit(id), dto);
  }

  getHabits(memberId: string, activeOnly = true): Observable<Api<M.HabitTrackerDto[]>> {
    return this.http.get<Api<M.HabitTrackerDto[]>>(FITNESS_API.assessments.habits(memberId, activeOnly));
  }

  logHabit(
    id: string, forDate: string, completed = true, value?: number, note?: string,
  ): Observable<Api<M.HabitEntryDto>> {
    return this.http.post<Api<M.HabitEntryDto>>(
      FITNESS_API.assessments.logHabit(id, forDate, completed, value, note), {});
  }

  getCheckIns(staffId?: string, memberId?: string, dueOnly = false): Observable<Api<M.CoachCheckInDto[]>> {
    return this.http.get<Api<M.CoachCheckInDto[]>>(
      FITNESS_API.assessments.checkIns(staffId, memberId, dueOnly));
  }

  saveCheckIn(dto: M.CoachCheckInDto, id?: string): Observable<Api<M.CoachCheckInDto>> {
    return this.http.post<Api<M.CoachCheckInDto>>(FITNESS_API.assessments.saveCheckIn(id), dto);
  }
}

// ── Leads ────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class LeadService {
  private http = inject(HttpClient);

  getBoard(clubId?: string, assignedStaffId?: string): Observable<Api<M.LeadBoardDto>> {
    return this.http.get<Api<M.LeadBoardDto>>(FITNESS_API.leads.board(clubId, assignedStaffId));
  }

  list(opts: Parameters<typeof FITNESS_API.leads.list>[0] = {}): Observable<Page<M.LeadSummaryDto>> {
    return this.http.get<Page<M.LeadSummaryDto>>(FITNESS_API.leads.list(opts));
  }

  getById(id: string): Observable<Api<M.LeadDetailDto>> {
    return this.http.get<Api<M.LeadDetailDto>>(FITNESS_API.leads.getById(id));
  }

  create(dto: M.SaveLeadDto): Observable<Api<M.LeadDetailDto>> {
    return this.http.post<Api<M.LeadDetailDto>>(FITNESS_API.leads.create, dto);
  }

  update(id: string, dto: M.SaveLeadDto): Observable<Api<M.LeadDetailDto>> {
    return this.http.put<Api<M.LeadDetailDto>>(FITNESS_API.leads.update(id), dto);
  }

  assign(id: string, staffId: string): Observable<Api<M.LeadDetailDto>> {
    return this.http.post<Api<M.LeadDetailDto>>(FITNESS_API.leads.assign(id, staffId), {});
  }

  /** The first successful contact stops the SLA clock. */
  logActivity(dto: M.LogLeadActivityDto): Observable<Api<M.LeadActivityDto>> {
    return this.http.post<Api<M.LeadActivityDto>>(FITNESS_API.leads.logActivity, dto);
  }

  moveStage(id: string, status: number): Observable<Api<M.LeadDetailDto>> {
    return this.http.post<Api<M.LeadDetailDto>>(FITNESS_API.leads.moveStage(id, status), {});
  }

  close(dto: M.CloseLeadDto): Observable<Api<M.LeadDetailDto>> {
    return this.http.post<Api<M.LeadDetailDto>>(FITNESS_API.leads.close, dto);
  }

  /** Carries the attribution across, and closes the referral, trial and tour loops behind it. */
  convert(id: string, dto: M.JoinMemberDto): Observable<Api<M.JoinResultDto>> {
    return this.http.post<Api<M.JoinResultDto>>(FITNESS_API.leads.convert(id), dto);
  }

  bookTour(dto: M.BookTourDto): Observable<Api<M.TourDto>> {
    return this.http.post<Api<M.TourDto>>(FITNESS_API.leads.bookTour, dto);
  }

  updateTour(id: string, dto: M.TourDto): Observable<Api<M.TourDto>> {
    return this.http.put<Api<M.TourDto>>(FITNESS_API.leads.updateTour(id), dto);
  }

  getTours(clubId: string, from: string, to: string, staffId?: string): Observable<Api<M.TourDto[]>> {
    return this.http.get<Api<M.TourDto[]>>(FITNESS_API.leads.tours(clubId, from, to, staffId));
  }

  issueTrial(dto: M.IssueTrialDto): Observable<Api<M.TrialPassDto>> {
    return this.http.post<Api<M.TrialPassDto>>(FITNESS_API.leads.issueTrial, dto);
  }

  getTrials(clubId?: string, activeOnly = true): Observable<Api<M.TrialPassDto[]>> {
    return this.http.get<Api<M.TrialPassDto[]>>(FITNESS_API.leads.trials(clubId, activeOnly));
  }

  createReferral(dto: M.CreateReferralDto): Observable<Api<M.ReferralDto>> {
    return this.http.post<Api<M.ReferralDto>>(FITNESS_API.leads.createReferral, dto);
  }

  getReferrals(clubId?: string, memberId?: string, converted?: boolean): Observable<Api<M.ReferralDto[]>> {
    return this.http.get<Api<M.ReferralDto[]>>(FITNESS_API.leads.referrals(clubId, memberId, converted));
  }

  getSources(clubId?: string, activeOnly = true): Observable<Api<M.LeadSourceDto[]>> {
    return this.http.get<Api<M.LeadSourceDto[]>>(FITNESS_API.leads.sources(clubId, activeOnly));
  }

  saveSource(dto: M.LeadSourceDto, id?: string): Observable<Api<M.LeadSourceDto>> {
    return this.http.post<Api<M.LeadSourceDto>>(FITNESS_API.leads.saveSource(id), dto);
  }

  getLossReasons(): Observable<Api<M.LossReasonDto[]>> {
    return this.http.get<Api<M.LossReasonDto[]>>(FITNESS_API.leads.lossReasons);
  }

  getTargets(clubId?: string, periodStart?: string): Observable<Api<M.SalesTargetDto[]>> {
    return this.http.get<Api<M.SalesTargetDto[]>>(FITNESS_API.leads.targets(clubId, periodStart));
  }

  saveTarget(dto: M.SalesTargetDto, id?: string): Observable<Api<M.SalesTargetDto>> {
    return this.http.post<Api<M.SalesTargetDto>>(FITNESS_API.leads.saveTarget(id), dto);
  }
}

// ── Retention ────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class RetentionService {
  private http = inject(HttpClient);

  getBoard(clubId?: string, band?: number, ownerStaffId?: string): Observable<Api<M.RetentionBoardDto>> {
    return this.http.get<Api<M.RetentionBoardDto>>(FITNESS_API.retention.board(clubId, band, ownerStaffId));
  }

  /** Comes back with the weighted factors that produced it, in plain English. */
  getScore(memberId: string): Observable<Api<M.ChurnScoreDto>> {
    return this.http.get<Api<M.ChurnScoreDto>>(FITNESS_API.retention.score(memberId));
  }

  getTasks(clubId?: string, staffId?: string, openOnly = true): Observable<Api<M.RetentionTaskDto[]>> {
    return this.http.get<Api<M.RetentionTaskDto[]>>(FITNESS_API.retention.tasks(clubId, staffId, openOnly));
  }

  createTask(dto: M.RetentionTaskDto): Observable<Api<M.RetentionTaskDto>> {
    return this.http.post<Api<M.RetentionTaskDto>>(FITNESS_API.retention.createTask, dto);
  }

  completeTask(dto: M.CompleteTaskDto): Observable<Api<M.RetentionTaskDto>> {
    return this.http.post<Api<M.RetentionTaskDto>>(FITNESS_API.retention.completeTask, dto);
  }

  getJourneys(clubId?: string): Observable<Api<M.EngagementJourneyDto[]>> {
    return this.http.get<Api<M.EngagementJourneyDto[]>>(FITNESS_API.retention.journeys(clubId));
  }

  /** New journeys are created switched off, deliberately. */
  saveJourney(dto: M.EngagementJourneyDto, id?: string): Observable<Api<M.EngagementJourneyDto>> {
    return this.http.post<Api<M.EngagementJourneyDto>>(FITNESS_API.retention.saveJourney(id), dto);
  }

  setJourneyActive(id: string, active: boolean): Observable<Api<M.EngagementJourneyDto>> {
    return this.http.post<Api<M.EngagementJourneyDto>>(
      FITNESS_API.retention.setJourneyActive(id, active), {});
  }

  getEnrolments(journeyId: string, activeOnly = true): Observable<Api<M.JourneyEnrolmentDto[]>> {
    return this.http.get<Api<M.JourneyEnrolmentDto[]>>(
      FITNESS_API.retention.enrolments(journeyId, activeOnly));
  }

  listCampaigns(clubId?: string, opts: { page?: number; size?: number } = {}): Observable<Page<M.CampaignDto>> {
    return this.http.get<Page<M.CampaignDto>>(FITNESS_API.retention.campaigns(clubId, opts));
  }

  saveCampaign(dto: M.CampaignDto, id?: string): Observable<Api<M.CampaignDto>> {
    return this.http.post<Api<M.CampaignDto>>(FITNESS_API.retention.saveCampaign(id), dto);
  }

  /** Consent is enforced server-side, and quiet hours defer rather than drop. */
  sendCampaign(dto: M.SendCampaignDto): Observable<Api<M.CampaignDto>> {
    return this.http.post<Api<M.CampaignDto>>(FITNESS_API.retention.sendCampaign, dto);
  }

  getTemplates(clubId?: string, channel?: number): Observable<Api<M.MessageTemplateDto[]>> {
    return this.http.get<Api<M.MessageTemplateDto[]>>(FITNESS_API.retention.templates(clubId, channel));
  }

  saveTemplate(dto: M.MessageTemplateDto, id?: string): Observable<Api<M.MessageTemplateDto>> {
    return this.http.post<Api<M.MessageTemplateDto>>(FITNESS_API.retention.saveTemplate(id), dto);
  }

  getSegments(clubId?: string): Observable<Api<M.SegmentDto[]>> {
    return this.http.get<Api<M.SegmentDto[]>>(FITNESS_API.retention.segments(clubId));
  }

  saveSegment(dto: M.SaveSegmentDto, id?: string): Observable<Api<M.SegmentDto>> {
    return this.http.post<Api<M.SegmentDto>>(FITNESS_API.retention.saveSegment(id), dto);
  }

  /** Who is actually in this segment, before anything is sent to them. */
  previewSegment(id: string, opts: { page?: number; size?: number } = {}): Observable<Page<M.MemberSummaryDto>> {
    return this.http.get<Page<M.MemberSummaryDto>>(FITNESS_API.retention.previewSegment(id, opts));
  }

  getMessageLog(opts: Parameters<typeof FITNESS_API.retention.messages>[0] = {}): Observable<Page<M.MessageLogDto>> {
    return this.http.get<Page<M.MessageLogDto>>(FITNESS_API.retention.messages(opts));
  }

  getLoyalty(memberId: string): Observable<Api<M.LoyaltyAccountDto>> {
    return this.http.get<Api<M.LoyaltyAccountDto>>(FITNESS_API.retention.loyalty(memberId));
  }

  awardPoints(dto: M.AwardPointsDto): Observable<Api<M.LoyaltyTransactionDto>> {
    return this.http.post<Api<M.LoyaltyTransactionDto>>(FITNESS_API.retention.awardPoints, dto);
  }

  redeemPoints(dto: M.RedeemPointsDto): Observable<Api<M.LoyaltyTransactionDto>> {
    return this.http.post<Api<M.LoyaltyTransactionDto>>(FITNESS_API.retention.redeemPoints, dto);
  }

  getTiers(clubId?: string): Observable<Api<M.LoyaltyTierDto[]>> {
    return this.http.get<Api<M.LoyaltyTierDto[]>>(FITNESS_API.retention.tiers(clubId));
  }

  saveTier(dto: M.LoyaltyTierDto, id?: string): Observable<Api<M.LoyaltyTierDto>> {
    return this.http.post<Api<M.LoyaltyTierDto>>(FITNESS_API.retention.saveTier(id), dto);
  }

  getChallenges(clubId?: string, activeOnly = true, viewerMemberId?: string): Observable<Api<M.ChallengeDto[]>> {
    return this.http.get<Api<M.ChallengeDto[]>>(
      FITNESS_API.retention.challenges(clubId, activeOnly, viewerMemberId));
  }

  saveChallenge(dto: M.ChallengeDto, id?: string): Observable<Api<M.ChallengeDto>> {
    return this.http.post<Api<M.ChallengeDto>>(FITNESS_API.retention.saveChallenge(id), dto);
  }

  joinChallenge(id: string, memberId: string, teamName?: string): Observable<Api<M.ChallengeParticipantDto>> {
    return this.http.post<Api<M.ChallengeParticipantDto>>(
      FITNESS_API.retention.joinChallenge(id, memberId, teamName), {});
  }

  getBadges(clubId?: string): Observable<Api<M.BadgeDto[]>> {
    return this.http.get<Api<M.BadgeDto[]>>(FITNESS_API.retention.badges(clubId));
  }

  getMemberBadges(memberId: string): Observable<Api<M.MemberBadgeDto[]>> {
    return this.http.get<Api<M.MemberBadgeDto[]>>(FITNESS_API.retention.memberBadges(memberId));
  }

  recordNps(dto: M.NpsResponseDto): Observable<Api<M.NpsResponseDto>> {
    return this.http.post<Api<M.NpsResponseDto>>(FITNESS_API.retention.recordNps, dto);
  }

  getNpsSummary(from: string, to: string, clubId?: string): Observable<Api<M.NpsSummaryDto>> {
    return this.http.get<Api<M.NpsSummaryDto>>(FITNESS_API.retention.npsSummary(from, to, clubId));
  }

  getNpsResponses(opts: Parameters<typeof FITNESS_API.retention.npsResponses>[0] = {}): Observable<Page<M.NpsResponseDto>> {
    return this.http.get<Page<M.NpsResponseDto>>(FITNESS_API.retention.npsResponses(opts));
  }

  followUpNps(id: string, note: string): Observable<Api<M.NpsResponseDto>> {
    return this.http.post<Api<M.NpsResponseDto>>(FITNESS_API.retention.followUpNps(id, note), {});
  }

  recordFeedback(dto: M.FeedbackDto): Observable<Api<M.FeedbackDto>> {
    return this.http.post<Api<M.FeedbackDto>>(FITNESS_API.retention.recordFeedback, dto);
  }

  getFeedback(clubId?: string, openOnly = false, opts: { page?: number; size?: number } = {}): Observable<Page<M.FeedbackDto>> {
    return this.http.get<Page<M.FeedbackDto>>(FITNESS_API.retention.feedback(clubId, openOnly, opts));
  }

  getAnnouncements(clubId?: string, liveOnly = true): Observable<Api<M.AnnouncementDto[]>> {
    return this.http.get<Api<M.AnnouncementDto[]>>(FITNESS_API.retention.announcements(clubId, liveOnly));
  }

  saveAnnouncement(dto: M.AnnouncementDto, id?: string): Observable<Api<M.AnnouncementDto>> {
    return this.http.post<Api<M.AnnouncementDto>>(FITNESS_API.retention.saveAnnouncement(id), dto);
  }
}

// ── Staff ────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class StaffService {
  private http = inject(HttpClient);

  list(opts: Parameters<typeof FITNESS_API.staff.list>[0] = {}): Observable<Page<M.StaffSummaryDto>> {
    return this.http.get<Page<M.StaffSummaryDto>>(FITNESS_API.staff.list(opts));
  }

  getById(id: string): Observable<Api<M.StaffDetailDto>> {
    return this.http.get<Api<M.StaffDetailDto>>(FITNESS_API.staff.getById(id));
  }

  create(dto: M.SaveStaffDto): Observable<Api<M.StaffDetailDto>> {
    return this.http.post<Api<M.StaffDetailDto>>(FITNESS_API.staff.create, dto);
  }

  update(id: string, dto: M.SaveStaffDto): Observable<Api<M.StaffDetailDto>> {
    return this.http.put<Api<M.StaffDetailDto>>(FITNESS_API.staff.update(id), dto);
  }

  deactivate(id: string, leftOn: string): Observable<Api<void>> {
    return this.http.post<Api<void>>(FITNESS_API.staff.deactivate(id, leftOn), {});
  }

  /** Returns what this person is allowed to do, never their PIN. */
  verifyPin(dto: M.StaffPinLoginDto): Observable<Api<M.StaffPinResultDto>> {
    return this.http.post<Api<M.StaffPinResultDto>>(FITNESS_API.staff.verifyPin, dto);
  }

  /** A manager approving something above someone else's limit. Always recorded. */
  verifyOverride(dto: M.ManagerOverrideDto): Observable<Api<boolean>> {
    return this.http.post<Api<boolean>>(FITNESS_API.staff.verifyOverride, dto);
  }

  getRoles(clubId?: string): Observable<Api<M.StaffRoleDto[]>> {
    return this.http.get<Api<M.StaffRoleDto[]>>(FITNESS_API.staff.roles(clubId));
  }

  saveRole(dto: M.StaffRoleDto, id?: string): Observable<Api<M.StaffRoleDto>> {
    return this.http.post<Api<M.StaffRoleDto>>(FITNESS_API.staff.saveRole(id), dto);
  }

  getCertifications(clubId?: string, staffId?: string, expiringOnly = false): Observable<Api<M.StaffCertificationDto[]>> {
    return this.http.get<Api<M.StaffCertificationDto[]>>(
      FITNESS_API.staff.certifications(clubId, staffId, expiringOnly));
  }

  saveCertification(dto: M.StaffCertificationDto, id?: string): Observable<Api<M.StaffCertificationDto>> {
    return this.http.post<Api<M.StaffCertificationDto>>(FITNESS_API.staff.saveCertification(id), dto);
  }

  /** The week's rota, with coverage gaps computed against opening hours. */
  getRota(clubId: string, from: string, to: string): Observable<Api<M.RotaDto>> {
    return this.http.get<Api<M.RotaDto>>(FITNESS_API.staff.rota(clubId, from, to));
  }

  saveShift(dto: M.SaveShiftDto, id?: string): Observable<Api<M.ShiftDto>> {
    return this.http.post<Api<M.ShiftDto>>(FITNESS_API.staff.saveShift(id), dto);
  }

  deleteShift(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(FITNESS_API.staff.deleteShift(id));
  }

  publishRota(clubId: string, from: string, to: string): Observable<Api<M.ShiftDto[]>> {
    return this.http.post<Api<M.ShiftDto[]>>(FITNESS_API.staff.publishRota(clubId, from, to), {});
  }

  requestSwap(assignmentId: string, offerToStaffId?: string, reason?: string): Observable<Api<M.ShiftSwapRequestDto>> {
    return this.http.post<Api<M.ShiftSwapRequestDto>>(
      FITNESS_API.staff.requestSwap(assignmentId, offerToStaffId, reason), {});
  }

  respondToSwap(id: string, accept: boolean, staffId: string): Observable<Api<M.ShiftSwapRequestDto>> {
    return this.http.post<Api<M.ShiftSwapRequestDto>>(
      FITNESS_API.staff.respondToSwap(id, accept, staffId), {});
  }

  getSwaps(clubId: string, openOnly = true): Observable<Api<M.ShiftSwapRequestDto[]>> {
    return this.http.get<Api<M.ShiftSwapRequestDto[]>>(FITNESS_API.staff.swaps(clubId, openOnly));
  }

  clockIn(dto: M.ClockDto): Observable<Api<M.TimeClockEntryDto>> {
    return this.http.post<Api<M.TimeClockEntryDto>>(FITNESS_API.staff.clockIn, dto);
  }

  clockOut(dto: M.ClockDto): Observable<Api<M.TimeClockEntryDto>> {
    return this.http.post<Api<M.TimeClockEntryDto>>(FITNESS_API.staff.clockOut, dto);
  }

  getTimesheet(staffId: string, from: string, to: string): Observable<Api<M.TimesheetDto>> {
    return this.http.get<Api<M.TimesheetDto>>(FITNESS_API.staff.timesheet(staffId, from, to));
  }

  adjustEntry(
    id: string,
    opts: { inAt?: string; outAt?: string; breakMinutes?: number; note: string },
  ): Observable<Api<M.TimeClockEntryDto>> {
    return this.http.post<Api<M.TimeClockEntryDto>>(FITNESS_API.staff.adjustEntry(id, opts), {});
  }

  approveTimesheet(staffId: string, from: string, to: string): Observable<Api<number>> {
    return this.http.post<Api<number>>(FITNESS_API.staff.approveTimesheet(staffId, from, to), {});
  }

  getCommissionRules(clubId?: string, staffId?: string): Observable<Api<M.CommissionRuleDto[]>> {
    return this.http.get<Api<M.CommissionRuleDto[]>>(FITNESS_API.staff.commissionRules(clubId, staffId));
  }

  saveCommissionRule(dto: M.CommissionRuleDto, id?: string): Observable<Api<M.CommissionRuleDto>> {
    return this.http.post<Api<M.CommissionRuleDto>>(FITNESS_API.staff.saveCommissionRule(id), dto);
  }

  generateStatements(dto: M.GenerateCommissionDto): Observable<Api<M.CommissionStatementDto[]>> {
    return this.http.post<Api<M.CommissionStatementDto[]>>(FITNESS_API.staff.generateStatements, dto);
  }

  getStatement(id: string): Observable<Api<M.CommissionStatementDto>> {
    return this.http.get<Api<M.CommissionStatementDto>>(FITNESS_API.staff.statement(id));
  }

  listStatements(opts: Parameters<typeof FITNESS_API.staff.statements>[0] = {}): Observable<Page<M.CommissionStatementDto>> {
    return this.http.get<Page<M.CommissionStatementDto>>(FITNESS_API.staff.statements(opts));
  }

  approveStatement(dto: M.ApproveStatementDto): Observable<Api<M.CommissionStatementDto>> {
    return this.http.post<Api<M.CommissionStatementDto>>(FITNESS_API.staff.approveStatement, dto);
  }

  /** Marks a statement exported to payroll, so it cannot be paid twice. */
  exportStatement(id: string): Observable<Api<M.CommissionStatementDto>> {
    return this.http.post<Api<M.CommissionStatementDto>>(FITNESS_API.staff.exportStatement(id), {});
  }
}

// ── Facilities ───────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class FacilityService {
  private http = inject(HttpClient);

  getLockerBanks(clubId: string): Observable<Api<M.LockerBankDto[]>> {
    return this.http.get<Api<M.LockerBankDto[]>>(FITNESS_API.facilities.lockerBanks(clubId));
  }

  saveLockerBank(dto: M.LockerBankDto, id?: string): Observable<Api<M.LockerBankDto>> {
    return this.http.post<Api<M.LockerBankDto>>(FITNESS_API.facilities.saveLockerBank(id), dto);
  }

  assignLocker(dto: M.AssignLockerDto): Observable<Api<M.LockerAssignmentDto>> {
    return this.http.post<Api<M.LockerAssignmentDto>>(FITNESS_API.facilities.assignLocker, dto);
  }

  releaseLocker(dto: M.ReleaseLockerDto): Observable<Api<M.LockerAssignmentDto>> {
    return this.http.post<Api<M.LockerAssignmentDto>>(FITNESS_API.facilities.releaseLocker, dto);
  }

  getLockerAssignments(opts: Parameters<typeof FITNESS_API.facilities.lockerAssignments>[0] = {}): Observable<Page<M.LockerAssignmentDto>> {
    return this.http.get<Page<M.LockerAssignmentDto>>(FITNESS_API.facilities.lockerAssignments(opts));
  }

  getResources(clubId: string, kind?: number, activeOnly = true): Observable<Api<M.BookableResourceDto[]>> {
    return this.http.get<Api<M.BookableResourceDto[]>>(
      FITNESS_API.facilities.resources(clubId, kind, activeOnly));
  }

  saveResource(dto: M.BookableResourceDto, id?: string): Observable<Api<M.BookableResourceDto>> {
    return this.http.post<Api<M.BookableResourceDto>>(FITNESS_API.facilities.saveResource(id), dto);
  }

  /** Every resource down one axis, time along the other. */
  getGrid(clubId: string, forDate: string, kind?: number): Observable<Api<M.ResourceGridDto>> {
    return this.http.get<Api<M.ResourceGridDto>>(FITNESS_API.facilities.grid(clubId, forDate, kind));
  }

  bookResource(dto: M.CreateResourceBookingDto): Observable<Api<M.ResourceBookingDto>> {
    return this.http.post<Api<M.ResourceBookingDto>>(FITNESS_API.facilities.bookResource, dto);
  }

  cancelResourceBooking(id: string, reason?: string, waivePenalty = false): Observable<Api<M.ResourceBookingDto>> {
    return this.http.post<Api<M.ResourceBookingDto>>(
      FITNESS_API.facilities.cancelResourceBooking(id, reason, waivePenalty), {});
  }

  checkInResourceBooking(id: string): Observable<Api<M.ResourceBookingDto>> {
    return this.http.post<Api<M.ResourceBookingDto>>(
      FITNESS_API.facilities.checkInResourceBooking(id), {});
  }

  listResourceBookings(opts: Parameters<typeof FITNESS_API.facilities.resourceBookings>[0] = {}): Observable<Page<M.ResourceBookingDto>> {
    return this.http.get<Page<M.ResourceBookingDto>>(FITNESS_API.facilities.resourceBookings(opts));
  }

  getEquipment(opts: Parameters<typeof FITNESS_API.facilities.equipment>[0] = {}): Observable<Page<M.EquipmentAssetDto>> {
    return this.http.get<Page<M.EquipmentAssetDto>>(FITNESS_API.facilities.equipment(opts));
  }

  getAsset(id: string): Observable<Api<M.EquipmentAssetDto>> {
    return this.http.get<Api<M.EquipmentAssetDto>>(FITNESS_API.facilities.asset(id));
  }

  /** The sticker on the machine, so a member can report a fault in ten seconds. */
  getAssetByQr(qrCode: string): Observable<Api<M.EquipmentAssetDto>> {
    return this.http.get<Api<M.EquipmentAssetDto>>(FITNESS_API.facilities.assetByQr(qrCode));
  }

  saveAsset(dto: M.SaveEquipmentDto, id?: string): Observable<Api<M.EquipmentAssetDto>> {
    return this.http.post<Api<M.EquipmentAssetDto>>(FITNESS_API.facilities.saveAsset(id), dto);
  }

  /** Propagates to spot maps, bookable resources and any bookings already made. */
  setAssetStatus(id: string, status: number, note?: string): Observable<Api<M.EquipmentAssetDto>> {
    return this.http.post<Api<M.EquipmentAssetDto>>(
      FITNESS_API.facilities.setAssetStatus(id, status, note), {});
  }

  recordUsage(id: string, cumulativeHours: number, source?: string): Observable<Api<M.EquipmentUsageLogDto>> {
    return this.http.post<Api<M.EquipmentUsageLogDto>>(
      FITNESS_API.facilities.recordUsage(id, cumulativeHours, source), {});
  }

  getMaintenance(clubId?: string, dueOnly = false): Observable<Api<M.MaintenanceScheduleDto[]>> {
    return this.http.get<Api<M.MaintenanceScheduleDto[]>>(
      FITNESS_API.facilities.maintenance(clubId, dueOnly));
  }

  saveMaintenance(dto: M.MaintenanceScheduleDto, id?: string): Observable<Api<M.MaintenanceScheduleDto>> {
    return this.http.post<Api<M.MaintenanceScheduleDto>>(FITNESS_API.facilities.saveMaintenance(id), dto);
  }

  /**
   * Raises work orders for servicing that has fallen due, by date or by hours run.
   *
   * Normally the overnight job, but a manager can run it by hand before a busy period rather than
   * discovering on Saturday morning that six machines were due a service on Friday.
   */
  generateDueWorkOrders(): Observable<Api<number>> {
    return this.http.post<Api<number>>(FITNESS_API.facilities.generateDueWorkOrders, {});
  }

  getWorkOrders(opts: Parameters<typeof FITNESS_API.facilities.workOrders>[0] = {}): Observable<Page<M.WorkOrderDto>> {
    return this.http.get<Page<M.WorkOrderDto>>(FITNESS_API.facilities.workOrders(opts));
  }

  saveWorkOrder(dto: M.SaveWorkOrderDto, id?: string): Observable<Api<M.WorkOrderDto>> {
    return this.http.post<Api<M.WorkOrderDto>>(FITNESS_API.facilities.saveWorkOrder(id), dto);
  }

  completeWorkOrder(dto: M.CompleteWorkOrderDto): Observable<Api<M.WorkOrderDto>> {
    return this.http.post<Api<M.WorkOrderDto>>(FITNESS_API.facilities.completeWorkOrder, dto);
  }

  reportFault(dto: M.ReportFaultDto): Observable<Api<M.FaultReportDto>> {
    return this.http.post<Api<M.FaultReportDto>>(FITNESS_API.facilities.reportFault, dto);
  }

  getFaults(clubId?: string, openOnly = true): Observable<Api<M.FaultReportDto[]>> {
    return this.http.get<Api<M.FaultReportDto[]>>(FITNESS_API.facilities.faults(clubId, openOnly));
  }
}

// ── Compliance ───────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class ComplianceService {
  private http = inject(HttpClient);

  getWaiverTemplates(clubId?: string, publishedOnly = false): Observable<Api<M.WaiverTemplateDto[]>> {
    return this.http.get<Api<M.WaiverTemplateDto[]>>(
      FITNESS_API.compliance.waiverTemplates(clubId, publishedOnly));
  }

  /** Editing a published waiver creates the next version and supersedes existing signatures. */
  saveWaiverTemplate(dto: M.WaiverTemplateDto, id?: string): Observable<Api<M.WaiverTemplateDto>> {
    return this.http.post<Api<M.WaiverTemplateDto>>(FITNESS_API.compliance.saveWaiverTemplate(id), dto);
  }

  publishWaiver(id: string): Observable<Api<M.WaiverTemplateDto>> {
    return this.http.post<Api<M.WaiverTemplateDto>>(FITNESS_API.compliance.publishWaiver(id), {});
  }

  signWaiver(dto: M.SignWaiverDto): Observable<Api<M.WaiverSignatureDto>> {
    return this.http.post<Api<M.WaiverSignatureDto>>(FITNESS_API.compliance.signWaiver, dto);
  }

  getSignatures(memberId?: string, clubId?: string, status?: number): Observable<Api<M.WaiverSignatureDto[]>> {
    return this.http.get<Api<M.WaiverSignatureDto[]>>(
      FITNESS_API.compliance.signatures(memberId, clubId, status));
  }

  /** Members who cannot get through the door until they sign. */
  getOutstandingWaivers(clubId?: string, opts: { page?: number; size?: number } = {}): Observable<Page<M.MemberSummaryDto>> {
    return this.http.get<Page<M.MemberSummaryDto>>(
      FITNESS_API.compliance.outstandingWaivers(clubId, opts));
  }

  /** The PAR-Q+ questions. Seven of the ten gate access until a clinician signs off. */
  getScreeningForm(clubId?: string): Observable<Api<M.HealthScreeningFormDto>> {
    return this.http.get<Api<M.HealthScreeningFormDto>>(FITNESS_API.compliance.screeningForm(clubId));
  }

  submitScreening(dto: M.HealthScreeningDto): Observable<Api<M.HealthScreeningDto>> {
    return this.http.post<Api<M.HealthScreeningDto>>(FITNESS_API.compliance.submitScreening, dto);
  }

  getScreening(memberId: string): Observable<Api<M.HealthScreeningDto>> {
    return this.http.get<Api<M.HealthScreeningDto>>(FITNESS_API.compliance.screening(memberId));
  }

  submitClearance(dto: M.SubmitClearanceDto): Observable<Api<M.MedicalClearanceDto>> {
    return this.http.post<Api<M.MedicalClearanceDto>>(FITNESS_API.compliance.submitClearance, dto);
  }

  reviewClearance(dto: M.ReviewClearanceDto): Observable<Api<M.MedicalClearanceDto>> {
    return this.http.post<Api<M.MedicalClearanceDto>>(FITNESS_API.compliance.reviewClearance, dto);
  }

  getClearances(clubId?: string, status?: number): Observable<Api<M.MedicalClearanceDto[]>> {
    return this.http.get<Api<M.MedicalClearanceDto[]>>(FITNESS_API.compliance.clearances(clubId, status));
  }

  getIncidents(opts: Parameters<typeof FITNESS_API.compliance.incidents>[0] = {}): Observable<Page<M.IncidentDto>> {
    return this.http.get<Page<M.IncidentDto>>(FITNESS_API.compliance.incidents(opts));
  }

  getIncident(id: string): Observable<Api<M.IncidentDto>> {
    return this.http.get<Api<M.IncidentDto>>(FITNESS_API.compliance.incident(id));
  }

  saveIncident(dto: M.SaveIncidentDto, id?: string): Observable<Api<M.IncidentDto>> {
    return this.http.post<Api<M.IncidentDto>>(FITNESS_API.compliance.saveIncident(id), dto);
  }

  addIncidentAction(id: string, dto: M.IncidentActionDto): Observable<Api<M.IncidentActionDto>> {
    return this.http.post<Api<M.IncidentActionDto>>(FITNESS_API.compliance.addIncidentAction(id), dto);
  }

  /** Refused while actions are outstanding or the root cause is blank. */
  closeIncident(id: string, rootCause: string, preventiveAction: string): Observable<Api<M.IncidentDto>> {
    return this.http.post<Api<M.IncidentDto>>(
      FITNESS_API.compliance.closeIncident(id, rootCause, preventiveAction), {});
  }

  getComplaints(clubId?: string, status?: number, opts: { page?: number; size?: number } = {}): Observable<Page<M.ComplaintDto>> {
    return this.http.get<Page<M.ComplaintDto>>(FITNESS_API.compliance.complaints(clubId, status, opts));
  }

  saveComplaint(dto: M.SaveComplaintDto, id?: string): Observable<Api<M.ComplaintDto>> {
    return this.http.post<Api<M.ComplaintDto>>(FITNESS_API.compliance.saveComplaint(id), dto);
  }

  resolveComplaint(dto: M.ResolveComplaintDto): Observable<Api<M.ComplaintDto>> {
    return this.http.post<Api<M.ComplaintDto>>(FITNESS_API.compliance.resolveComplaint, dto);
  }

  getLostProperty(clubId?: string, status?: number, opts: { page?: number; size?: number } = {}): Observable<Page<M.LostPropertyItemDto>> {
    return this.http.get<Page<M.LostPropertyItemDto>>(
      FITNESS_API.compliance.lostProperty(clubId, status, opts));
  }

  saveLostProperty(dto: M.SaveLostPropertyDto, id?: string): Observable<Api<M.LostPropertyItemDto>> {
    return this.http.post<Api<M.LostPropertyItemDto>>(FITNESS_API.compliance.saveLostProperty(id), dto);
  }

  claimLostProperty(dto: M.ClaimLostPropertyDto): Observable<Api<M.LostPropertyItemDto>> {
    return this.http.post<Api<M.LostPropertyItemDto>>(FITNESS_API.compliance.claimLostProperty, dto);
  }

  getChecks(clubId: string, dueTodayOnly = false): Observable<Api<M.FacilityCheckDto[]>> {
    return this.http.get<Api<M.FacilityCheckDto[]>>(FITNESS_API.compliance.checks(clubId, dueTodayOnly));
  }

  saveCheck(dto: M.FacilityCheckDto, id?: string): Observable<Api<M.FacilityCheckDto>> {
    return this.http.post<Api<M.FacilityCheckDto>>(FITNESS_API.compliance.saveCheck(id), dto);
  }

  /** A failed critical item raises an incident, not a note. */
  submitCheck(dto: M.SubmitFacilityCheckDto): Observable<Api<M.FacilityCheckDto>> {
    return this.http.post<Api<M.FacilityCheckDto>>(FITNESS_API.compliance.submitCheck, dto);
  }

  saveHandover(dto: M.ShiftHandoverDto): Observable<Api<M.ShiftHandoverDto>> {
    return this.http.post<Api<M.ShiftHandoverDto>>(FITNESS_API.compliance.saveHandover, dto);
  }

  getHandovers(clubId: string, limit = 20): Observable<Api<M.ShiftHandoverDto[]>> {
    return this.http.get<Api<M.ShiftHandoverDto[]>>(FITNESS_API.compliance.handovers(clubId, limit));
  }

  /** `sensitiveOnly` narrows this to every read of a member's medical data. */
  getAudit(opts: Parameters<typeof FITNESS_API.compliance.audit>[0] = {}): Observable<Page<M.AuditEntryDto>> {
    return this.http.get<Page<M.AuditEntryDto>>(FITNESS_API.compliance.audit(opts));
  }
}

// ── Commerce ─────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class CommerceService {
  private http = inject(HttpClient);

  getProducts(clubId: string, search?: string): Observable<Api<M.RetailProductDto[]>> {
    return this.http.get<Api<M.RetailProductDto[]>>(FITNESS_API.commerce.products(clubId, search));
  }

  /** Send an idempotency key. Tills get double-tapped. */
  createSale(dto: M.CreateSaleDto): Observable<Api<M.FitnessSaleDto>> {
    return this.http.post<Api<M.FitnessSaleDto>>(FITNESS_API.commerce.createSale, dto);
  }

  returnSale(id: string, reason: string, lineIds?: string[]): Observable<Api<M.FitnessSaleDto>> {
    return this.http.post<Api<M.FitnessSaleDto>>(
      FITNESS_API.commerce.returnSale(id, reason), lineIds ?? null);
  }

  listSales(opts: Parameters<typeof FITNESS_API.commerce.sales>[0] = {}): Observable<Page<M.FitnessSaleDto>> {
    return this.http.get<Page<M.FitnessSaleDto>>(FITNESS_API.commerce.sales(opts));
  }

  getHouseAccount(memberId: string, unsettledOnly = true): Observable<Api<M.HouseAccountChargeDto[]>> {
    return this.http.get<Api<M.HouseAccountChargeDto[]>>(
      FITNESS_API.commerce.houseAccount(memberId, unsettledOnly));
  }

  openSession(dto: M.OpenCashSessionDto): Observable<Api<M.CashSessionDto>> {
    return this.http.post<Api<M.CashSessionDto>>(FITNESS_API.commerce.openSession, dto);
  }

  getOpenSession(clubId: string, staffId?: string): Observable<Api<M.CashSessionDto>> {
    return this.http.get<Api<M.CashSessionDto>>(FITNESS_API.commerce.openSessionFor(clubId, staffId));
  }

  getSession(id: string): Observable<Api<M.CashSessionDto>> {
    return this.http.get<Api<M.CashSessionDto>>(FITNESS_API.commerce.session(id));
  }

  recordMovement(dto: M.CashMovementRequestDto): Observable<Api<M.CashSessionDto>> {
    return this.http.post<Api<M.CashSessionDto>>(FITNESS_API.commerce.recordMovement, dto);
  }

  /** Blind count: never show the expected figure before the count is entered. */
  closeSession(dto: M.CloseCashSessionDto): Observable<Api<M.CashSessionDto>> {
    return this.http.post<Api<M.CashSessionDto>>(FITNESS_API.commerce.closeSession, dto);
  }

  listSessions(opts: Parameters<typeof FITNESS_API.commerce.sessions>[0] = {}): Observable<Page<M.CashSessionDto>> {
    return this.http.get<Page<M.CashSessionDto>>(FITNESS_API.commerce.sessions(opts));
  }

  getDayEnd(clubId: string, forDate: string, isZRead = false): Observable<Api<M.DayEndReadDto>> {
    return this.http.get<Api<M.DayEndReadDto>>(FITNESS_API.commerce.dayEnd(clubId, forDate, isZRead));
  }

  issueGiftCard(dto: M.IssueGiftCardDto): Observable<Api<M.GiftCardDto>> {
    return this.http.post<Api<M.GiftCardDto>>(FITNESS_API.commerce.issueGiftCard, dto);
  }

  getGiftCard(cardNumber: string): Observable<Api<M.GiftCardDto>> {
    return this.http.get<Api<M.GiftCardDto>>(FITNESS_API.commerce.giftCard(cardNumber));
  }

  redeemGiftCard(cardNumber: string, amount: number, saleId?: string): Observable<Api<M.GiftCardDto>> {
    return this.http.post<Api<M.GiftCardDto>>(
      FITNESS_API.commerce.redeemGiftCard(cardNumber, amount, saleId), {});
  }

  getCorporateAccounts(clubId?: string, activeOnly = true, opts: { page?: number; size?: number } = {}): Observable<Page<M.CorporateAccountDto>> {
    return this.http.get<Page<M.CorporateAccountDto>>(
      FITNESS_API.commerce.corporate(clubId, activeOnly, opts));
  }

  getCorporateAccount(id: string): Observable<Api<M.CorporateAccountDto>> {
    return this.http.get<Api<M.CorporateAccountDto>>(FITNESS_API.commerce.corporateAccount(id));
  }

  saveCorporateAccount(dto: M.CorporateAccountDto, id?: string): Observable<Api<M.CorporateAccountDto>> {
    return this.http.post<Api<M.CorporateAccountDto>>(FITNESS_API.commerce.saveCorporate(id), dto);
  }

  getCorporateMembers(id: string, activeOnly = true): Observable<Api<M.CorporateMemberDto[]>> {
    return this.http.get<Api<M.CorporateMemberDto[]>>(
      FITNESS_API.commerce.corporateMembers(id, activeOnly));
  }

  addCorporateMember(id: string, memberId: string, employeeReference?: string): Observable<Api<M.CorporateMemberDto>> {
    return this.http.post<Api<M.CorporateMemberDto>>(
      FITNESS_API.commerce.addCorporateMember(id, memberId, employeeReference), {});
  }

  checkEligibility(
    id: string,
    opts: { email?: string; employeeReference?: string; code?: string },
  ): Observable<Api<boolean>> {
    return this.http.get<Api<boolean>>(FITNESS_API.commerce.checkEligibility(id, opts));
  }

  generateCorporateInvoice(id: string, periodStart: string, periodEnd: string): Observable<Api<M.CorporateInvoiceDto>> {
    return this.http.post<Api<M.CorporateInvoiceDto>>(
      FITNESS_API.commerce.generateCorporateInvoice(id, periodStart, periodEnd), {});
  }

  getCorporateInvoices(accountId?: string, status?: number, opts: { page?: number; size?: number } = {}): Observable<Page<M.CorporateInvoiceDto>> {
    return this.http.get<Page<M.CorporateInvoiceDto>>(
      FITNESS_API.commerce.corporateInvoices(accountId, status, opts));
  }

  getPayers(clubId?: string, activeOnly = true): Observable<Api<M.ThirdPartyPayerDto[]>> {
    return this.http.get<Api<M.ThirdPartyPayerDto[]>>(FITNESS_API.commerce.payers(clubId, activeOnly));
  }

  savePayer(dto: M.ThirdPartyPayerDto, id?: string): Observable<Api<M.ThirdPartyPayerDto>> {
    return this.http.post<Api<M.ThirdPartyPayerDto>>(FITNESS_API.commerce.savePayer(id), dto);
  }

  saveAuthorisation(dto: M.PayerAuthorisationDto, id?: string): Observable<Api<M.PayerAuthorisationDto>> {
    return this.http.post<Api<M.PayerAuthorisationDto>>(
      FITNESS_API.commerce.saveAuthorisation(id), dto);
  }

  getAuthorisations(payerId?: string, memberId?: string, activeOnly = true): Observable<Api<M.PayerAuthorisationDto[]>> {
    return this.http.get<Api<M.PayerAuthorisationDto[]>>(
      FITNESS_API.commerce.authorisations(payerId, memberId, activeOnly));
  }

  recordVending(dto: M.VendingRevenueEntryDto): Observable<Api<M.VendingRevenueEntryDto>> {
    return this.http.post<Api<M.VendingRevenueEntryDto>>(FITNESS_API.commerce.vending, dto);
  }
}

// ── Reports ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class FitnessReportService {
  private http = inject(HttpClient);

  getDashboard(clubId?: string): Observable<Api<M.FitnessDashboardDto>> {
    return this.http.get<Api<M.FitnessDashboardDto>>(FITNESS_API.reports.dashboard(clubId));
  }

  getMembership(filter: M.ReportFilterDto): Observable<Api<M.MembershipReportDto>> {
    return this.http.post<Api<M.MembershipReportDto>>(FITNESS_API.reports.membership, filter);
  }

  /** Which channel brings members who stay, not just members who join. */
  getCohorts(filter: M.ReportFilterDto): Observable<Api<M.CohortRetentionDto>> {
    return this.http.post<Api<M.CohortRetentionDto>>(FITNESS_API.reports.cohorts, filter);
  }

  getRevenue(filter: M.ReportFilterDto): Observable<Api<M.RevenueReportDto>> {
    return this.http.post<Api<M.RevenueReportDto>>(FITNESS_API.reports.revenue, filter);
  }

  /** New, expansion, contraction, churn and reactivation — not one net figure. */
  getMrr(filter: M.ReportFilterDto): Observable<Api<M.MrrMovementDto>> {
    return this.http.post<Api<M.MrrMovementDto>>(FITNESS_API.reports.mrr, filter);
  }

  getAttendance(filter: M.ReportFilterDto): Observable<Api<M.AttendanceReportDto>> {
    return this.http.post<Api<M.AttendanceReportDto>>(FITNESS_API.reports.attendance, filter);
  }

  getClassPerformance(filter: M.ReportFilterDto): Observable<Api<M.ClassPerformanceReportDto>> {
    return this.http.post<Api<M.ClassPerformanceReportDto>>(FITNESS_API.reports.classes, filter);
  }

  getSales(filter: M.ReportFilterDto): Observable<Api<M.SalesReportDto>> {
    return this.http.post<Api<M.SalesReportDto>>(FITNESS_API.reports.sales, filter);
  }

  getStaffPerformance(filter: M.ReportFilterDto): Observable<Api<M.StaffPerformanceReportDto>> {
    return this.http.post<Api<M.StaffPerformanceReportDto>>(FITNESS_API.reports.staff, filter);
  }

  getOperations(filter: M.ReportFilterDto): Observable<Api<M.OperationsReportDto>> {
    return this.http.post<Api<M.OperationsReportDto>>(FITNESS_API.reports.operations, filter);
  }

  getSubscriptions(clubId?: string): Observable<Api<M.ReportSubscriptionDto[]>> {
    return this.http.get<Api<M.ReportSubscriptionDto[]>>(FITNESS_API.reports.subscriptions(clubId));
  }

  saveSubscription(dto: M.ReportSubscriptionDto, id?: string): Observable<Api<M.ReportSubscriptionDto>> {
    return this.http.post<Api<M.ReportSubscriptionDto>>(FITNESS_API.reports.saveSubscription(id), dto);
  }
}
