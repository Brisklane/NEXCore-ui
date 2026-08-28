import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { REALESTATE_API as API } from './realestate-api-config';
import type * as M from '../models/realestate.models';
import type * as E from '../models/realestate.enums';

type Api<T> = M.ApiResponse<T>;
type Page<T> = M.PaginatedResponse<T>;

// ── Admin ───────────────────────────────────────────────────────

/** Settings, offices, geography, agents, approvals, saved views and data import. */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);

  getSettings(): Observable<Api<M.RealEstateSettingsDto>> {
    return this.http.get<Api<M.RealEstateSettingsDto>>(API.admin.getSettings);
  }

  updateSettings(request: M.RealEstateSettingsDto): Observable<Api<M.RealEstateSettingsDto>> {
    return this.http.put<Api<M.RealEstateSettingsDto>>(API.admin.updateSettings, request);
  }

  /** Which of the four lines of business this company runs, and what each one turns on. */
  getLinesOfBusiness(): Observable<Api<M.LinesOfBusinessDto>> {
    return this.http.get<Api<M.LinesOfBusinessDto>>(API.admin.getLinesOfBusiness);
  }

  getOffices(query?: M.ListQueryDto): Observable<Page<M.RealEstateOfficeDto>> {
    return this.http.get<Page<M.RealEstateOfficeDto>>(API.admin.getOffices(query));
  }

  getOffice(id: string): Observable<Api<M.RealEstateOfficeDto>> {
    return this.http.get<Api<M.RealEstateOfficeDto>>(API.admin.getOffice(id));
  }

  saveOffice(request: M.RealEstateOfficeDto): Observable<Api<M.RealEstateOfficeDto>> {
    return this.http.post<Api<M.RealEstateOfficeDto>>(API.admin.saveOffice, request);
  }

  getGeoTree(parentId?: string, depth?: number): Observable<Api<M.GeoAreaDto[]>> {
    return this.http.get<Api<M.GeoAreaDto[]>>(API.admin.getGeoTree(parentId, depth));
  }

  searchGeo(search?: string, take?: number): Observable<Api<M.LookupDto[]>> {
    return this.http.get<Api<M.LookupDto[]>>(API.admin.searchGeo(search, take));
  }

  saveGeo(request: M.GeoAreaDto): Observable<Api<M.GeoAreaDto>> {
    return this.http.post<Api<M.GeoAreaDto>>(API.admin.saveGeo, request);
  }

  deleteGeo(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(API.admin.deleteGeo(id));
  }

  getTerritories(officeId?: string): Observable<Api<M.TerritoryDto[]>> {
    return this.http.get<Api<M.TerritoryDto[]>>(API.admin.getTerritories(officeId));
  }

  saveTerritory(request: M.TerritoryDto): Observable<Api<M.TerritoryDto>> {
    return this.http.post<Api<M.TerritoryDto>>(API.admin.saveTerritory, request);
  }

  getAgents(query?: M.ListQueryDto): Observable<Page<M.AgentProfileDto>> {
    return this.http.get<Page<M.AgentProfileDto>>(API.admin.getAgents(query));
  }

  getAgent(id: string): Observable<Api<M.AgentProfileDto>> {
    return this.http.get<Api<M.AgentProfileDto>>(API.admin.getAgent(id));
  }

  saveAgent(request: M.AgentProfileDto): Observable<Api<M.AgentProfileDto>> {
    return this.http.post<Api<M.AgentProfileDto>>(API.admin.saveAgent, request);
  }

  getAgentLookup(officeId?: string): Observable<Api<M.LookupDto[]>> {
    return this.http.get<Api<M.LookupDto[]>>(API.admin.getAgentLookup(officeId));
  }

  getTeams(officeId?: string): Observable<Api<M.SalesTeamDto[]>> {
    return this.http.get<Api<M.SalesTeamDto[]>>(API.admin.getTeams(officeId));
  }

  saveTeam(request: M.SalesTeamDto): Observable<Api<M.SalesTeamDto>> {
    return this.http.post<Api<M.SalesTeamDto>>(API.admin.saveTeam, request);
  }

  getReasonCodes(context?: string): Observable<Api<M.ReasonCodeDto[]>> {
    return this.http.get<Api<M.ReasonCodeDto[]>>(API.admin.getReasonCodes(context));
  }

  saveReasonCode(request: M.ReasonCodeDto): Observable<Api<M.ReasonCodeDto>> {
    return this.http.post<Api<M.ReasonCodeDto>>(API.admin.saveReasonCode, request);
  }

  getMatrix(documentType?: string): Observable<Api<M.ApprovalMatrixDto[]>> {
    return this.http.get<Api<M.ApprovalMatrixDto[]>>(API.admin.getMatrix(documentType));
  }

  saveMatrix(request: M.ApprovalMatrixDto): Observable<Api<M.ApprovalMatrixDto>> {
    return this.http.post<Api<M.ApprovalMatrixDto>>(API.admin.saveMatrix, request);
  }

  getApprovals(query?: M.ListQueryDto, mineOnly?: boolean): Observable<Page<M.ApprovalRequestDto>> {
    return this.http.get<Page<M.ApprovalRequestDto>>(API.admin.getApprovals(query, mineOnly));
  }

  decideApproval(request: M.ApprovalDecisionDto): Observable<Api<M.ApprovalRequestDto>> {
    return this.http.post<Api<M.ApprovalRequestDto>>(API.admin.decideApproval, request);
  }

  getViews(screenKey?: string): Observable<Api<M.SavedViewDto[]>> {
    return this.http.get<Api<M.SavedViewDto[]>>(API.admin.getViews(screenKey));
  }

  saveView(request: M.SavedViewDto): Observable<Api<M.SavedViewDto>> {
    return this.http.post<Api<M.SavedViewDto>>(API.admin.saveView, request);
  }

  deleteView(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(API.admin.deleteView(id));
  }

  /**
   * Validates a file and stages what it would create, without writing anything to the live data.
   * A migration that cannot be inspected before it lands is a migration nobody should run.
   */
  runImport(request: M.ImportRequestDto): Observable<Api<M.ImportBatchDto>> {
    return this.http.post<Api<M.ImportBatchDto>>(API.admin.runImport, request);
  }

  getImports(query?: M.ListQueryDto): Observable<Page<M.ImportBatchDto>> {
    return this.http.get<Page<M.ImportBatchDto>>(API.admin.getImports(query));
  }

  getImport(id: string): Observable<Api<M.ImportBatchDto>> {
    return this.http.get<Api<M.ImportBatchDto>>(API.admin.getImport(id));
  }

  commitImport(id: string): Observable<Api<M.ImportBatchDto>> {
    return this.http.post<Api<M.ImportBatchDto>>(API.admin.commitImport(id), {});
  }

  rollbackImport(id: string): Observable<Api<M.ImportBatchDto>> {
    return this.http.post<Api<M.ImportBatchDto>>(API.admin.rollbackImport(id), {});
  }

}

// ── Booking ─────────────────────────────────────────────────────

/** Offers, tokens, bookings, allotments, agreements and balloting. */
@Injectable({ providedIn: 'root' })
export class BookingService {
  private http = inject(HttpClient);

  getOffers(query?: M.ListQueryDto, propertyId?: string, status?: E.OfferStatus): Observable<Page<M.OfferListItemDto>> {
    return this.http.get<Page<M.OfferListItemDto>>(API.booking.getOffers(query, propertyId, status));
  }

  getOffer(id: string): Observable<Api<M.OfferDetailDto>> {
    return this.http.get<Api<M.OfferDetailDto>>(API.booking.getOffer(id));
  }

  saveOffer(request: M.OfferUpsertDto): Observable<Api<M.OfferDetailDto>> {
    return this.http.post<Api<M.OfferDetailDto>>(API.booking.saveOffer, request);
  }

  decideOffer(request: M.OfferDecisionDto): Observable<Api<M.OfferDetailDto>> {
    return this.http.post<Api<M.OfferDetailDto>>(API.booking.decideOffer, request);
  }

  getEois(query?: M.ListQueryDto, projectId?: string): Observable<Page<M.ExpressionOfInterestDto>> {
    return this.http.get<Page<M.ExpressionOfInterestDto>>(API.booking.getEois(query, projectId));
  }

  saveEoi(request: M.ExpressionOfInterestDto, withPayment?: boolean): Observable<Api<M.ExpressionOfInterestDto>> {
    return this.http.post<Api<M.ExpressionOfInterestDto>>(API.booking.saveEoi(withPayment), request);
  }

  refundEoi(id: string): Observable<Api<M.ExpressionOfInterestDto>> {
    return this.http.post<Api<M.ExpressionOfInterestDto>>(API.booking.refundEoi(id), {});
  }

  getTokens(query?: M.ListQueryDto, projectId?: string, status?: E.ReservationStatus): Observable<Page<M.TokenReservationDto>> {
    return this.http.get<Page<M.TokenReservationDto>>(API.booking.getTokens(query, projectId, status));
  }

  createToken(request: M.TokenReservationCreateDto): Observable<Api<M.TokenReservationDto>> {
    return this.http.post<Api<M.TokenReservationDto>>(API.booking.createToken, request);
  }

  cancelToken(id: string, reasonCodeId?: string, forfeit?: boolean): Observable<Api<M.TokenReservationDto>> {
    return this.http.post<Api<M.TokenReservationDto>>(API.booking.cancelToken(id, reasonCodeId, forfeit), {});
  }

  expireTokens(): Observable<Api<number>> {
    return this.http.post<Api<number>>(API.booking.expireTokens, {});
  }

  search(query: M.BookingSearchDto): Observable<Page<M.BookingListItemDto>> {
    return this.http.post<Page<M.BookingListItemDto>>(API.booking.search, query);
  }

  get(id: string): Observable<Api<M.BookingDetailDto>> {
    return this.http.get<Api<M.BookingDetailDto>>(API.booking.get(id));
  }

  /**
   * The cost sheet, the schedule and every gate this booking would have to clear — without
   * writing anything. What the customer is shown before they sign.
   */
  preview(request: M.BookingCreateDto): Observable<Api<M.BookingPreviewDto>> {
    return this.http.post<Api<M.BookingPreviewDto>>(API.booking.preview, request);
  }

  create(request: M.BookingCreateDto): Observable<Api<M.BookingDetailDto>> {
    return this.http.post<Api<M.BookingDetailDto>>(API.booking.create, request);
  }

  approve(request: M.BookingApprovalDto): Observable<Api<M.BookingDetailDto>> {
    return this.http.post<Api<M.BookingDetailDto>>(API.booking.approve, request);
  }

  confirm(id: string): Observable<Api<M.BookingDetailDto>> {
    return this.http.post<Api<M.BookingDetailDto>>(API.booking.confirm(id), {});
  }

  requestAmendment(request: M.BookingAmendmentDto): Observable<Api<M.BookingAmendmentDto>> {
    return this.http.post<Api<M.BookingAmendmentDto>>(API.booking.requestAmendment, request);
  }

  decideAmendment(id: string, outcome?: E.ApprovalOutcome, comment?: string): Observable<Api<M.BookingAmendmentDto>> {
    return this.http.post<Api<M.BookingAmendmentDto>>(API.booking.decideAmendment(id, outcome, comment), {});
  }

  issueAllotment(id: string, templateId?: string): Observable<Api<M.AllotmentDto>> {
    return this.http.post<Api<M.AllotmentDto>>(API.booking.issueAllotment(id, templateId), {});
  }

  /** Reissues an allotment letter, superseding the old one rather than replacing it. */
  reissueAllotment(id: string, reason?: string): Observable<Api<M.AllotmentDto>> {
    return this.http.post<Api<M.AllotmentDto>>(API.booking.reissueAllotment(id, reason), {});
  }

  getAllotments(query?: M.ListQueryDto, projectId?: string): Observable<Page<M.AllotmentDto>> {
    return this.http.get<Page<M.AllotmentDto>>(API.booking.getAllotments(query, projectId));
  }

  generateAgreement(id: string, templateId?: string, languageCode?: string): Observable<Api<M.SaleAgreementDto>> {
    return this.http.post<Api<M.SaleAgreementDto>>(API.booking.generateAgreement(id, templateId, languageCode), {});
  }

  recordExecution(id: string, executedOn?: string, registrationNumber?: string): Observable<Api<M.SaleAgreementDto>> {
    return this.http.post<Api<M.SaleAgreementDto>>(API.booking.recordExecution(id, executedOn, registrationNumber), {});
  }

  getBallots(query?: M.ListQueryDto, projectId?: string): Observable<Page<M.BallotDto>> {
    return this.http.get<Page<M.BallotDto>>(API.booking.getBallots(query, projectId));
  }

  getBallot(id: string): Observable<Api<M.BallotDto>> {
    return this.http.get<Api<M.BallotDto>>(API.booking.getBallot(id));
  }

  saveBallot(request: M.BallotCreateDto): Observable<Api<M.BallotDto>> {
    return this.http.post<Api<M.BallotDto>>(API.booking.saveBallot, request);
  }

  /**
   * Freezes the pool of entries and the pool of units. Nothing may join or leave after this,
   * which is the only thing that makes the draw afterwards defensible.
   */
  lockPool(id: string): Observable<Api<M.BallotDto>> {
    return this.http.post<Api<M.BallotDto>>(API.booking.lockPool(id), {});
  }

  /** Draws the ballot from a recorded seed, so the same draw can be reproduced. */
  draw(request: M.BallotDrawDto): Observable<Api<M.BallotResultDto>> {
    return this.http.post<Api<M.BallotResultDto>>(API.booking.draw, request);
  }

  publishBallot(id: string): Observable<Api<M.BallotDto>> {
    return this.http.post<Api<M.BallotDto>>(API.booking.publishBallot(id), {});
  }

  getBallotEntries(id: string, categoryId?: string): Observable<Api<M.BallotEntryDto[]>> {
    return this.http.get<Api<M.BallotEntryDto[]>>(API.booking.getBallotEntries(id, categoryId));
  }

  /**
   * Overrides one allocation after a draw. Recorded loudly with its reason, because this is
   * exactly what everybody suspects happens in a ballot and the record is the answer.
   */
  overrideAllocation(entryId: string, unitId?: string, reason?: string): Observable<Api<M.BallotEntryDto>> {
    return this.http.post<Api<M.BallotEntryDto>>(API.booking.overrideAllocation(entryId, unitId, reason), {});
  }

}

// ── Brokerage ───────────────────────────────────────────────────

/** Deals, chains, commission and the channel partner network. */
@Injectable({ providedIn: 'root' })
export class BrokerageService {
  private http = inject(HttpClient);

  getDeals(query?: M.ListQueryDto, status?: E.DealStatus, agentId?: string): Observable<Page<M.DealListItemDto>> {
    return this.http.get<Page<M.DealListItemDto>>(API.brokerage.getDeals(query, status, agentId));
  }

  getBoard(query?: M.ListQueryDto, agentId?: string): Observable<Api<M.DealBoardDto>> {
    return this.http.get<Api<M.DealBoardDto>>(API.brokerage.getBoard(query, agentId));
  }

  getDeal(id: string): Observable<Api<M.DealDetailDto>> {
    return this.http.get<Api<M.DealDetailDto>>(API.brokerage.getDeal(id));
  }

  createDeal(request: M.DealCreateDto): Observable<Api<M.DealDetailDto>> {
    return this.http.post<Api<M.DealDetailDto>>(API.brokerage.createDeal, request);
  }

  updateChecklist(dealId: string, itemId: string, completed?: boolean, completedOn?: string, note?: string): Observable<Api<M.DealDetailDto>> {
    return this.http.post<Api<M.DealDetailDto>>(API.brokerage.updateChecklist(dealId, itemId, completed, completedOn, note), {});
  }

  changeDealStatus(id: string, status?: E.DealStatus): Observable<Api<M.DealDetailDto>> {
    return this.http.post<Api<M.DealDetailDto>>(API.brokerage.changeDealStatus(id, status), {});
  }

  /**
   * Records a deal collapsing, with the cause and the fee lost. Painful to fill in and the only
   * way anybody ever finds out that four in ten deals die at survey.
   */
  recordFallThrough(request: M.FallThroughRecordDto): Observable<Api<M.FallThroughRecordDto>> {
    return this.http.post<Api<M.FallThroughRecordDto>>(API.brokerage.recordFallThrough, request);
  }

  saveDealParty(dealId: string, request: M.DealPartyDto): Observable<Api<M.DealPartyDto>> {
    return this.http.post<Api<M.DealPartyDto>>(API.brokerage.saveDealParty(dealId), request);
  }

  saveChain(request: M.SalesChainDto): Observable<Api<M.SalesChainDto>> {
    return this.http.post<Api<M.SalesChainDto>>(API.brokerage.saveChain, request);
  }

  /** Every chain, or just the ones with a weak link somebody should be ringing about. */
  getChains(atRiskOnly?: boolean): Observable<Api<M.SalesChainDto[]>> {
    return this.http.get<Api<M.SalesChainDto[]>>(API.brokerage.getChains(atRiskOnly));
  }

  saveConveyancing(request: M.ConveyancingDto): Observable<Api<M.ConveyancingDto>> {
    return this.http.post<Api<M.ConveyancingDto>>(API.brokerage.saveConveyancing, request);
  }

  getPlans(appliesTo?: string, projectId?: string): Observable<Api<M.CommissionPlanDto[]>> {
    return this.http.get<Api<M.CommissionPlanDto[]>>(API.brokerage.getPlans(appliesTo, projectId));
  }

  savePlan(request: M.CommissionPlanDto): Observable<Api<M.CommissionPlanDto>> {
    return this.http.post<Api<M.CommissionPlanDto>>(API.brokerage.savePlan, request);
  }

  /**
   * Works out the fee and every split. Pass `commit=false` to see the arithmetic without
   * accruing anything — which is what a negotiator wants before agreeing a deal.
   */
  calculate(dealId?: string, bookingId?: string, tenancyId?: string, commit?: boolean): Observable<Api<M.CommissionCalculationDto>> {
    return this.http.post<Api<M.CommissionCalculationDto>>(API.brokerage.calculate(dealId, bookingId, tenancyId, commit), {});
  }

  getCalculations(query?: M.ListQueryDto, status?: E.CommissionStatus): Observable<Page<M.CommissionCalculationDto>> {
    return this.http.get<Page<M.CommissionCalculationDto>>(API.brokerage.getCalculations(query, status));
  }

  createDisbursement(calculationId: string): Observable<Api<M.CommissionDisbursementDto>> {
    return this.http.post<Api<M.CommissionDisbursementDto>>(API.brokerage.createDisbursement(calculationId), {});
  }

  decideDisbursement(id: string, outcome?: E.ApprovalOutcome, comment?: string): Observable<Api<M.CommissionDisbursementDto>> {
    return this.http.post<Api<M.CommissionDisbursementDto>>(API.brokerage.decideDisbursement(id, outcome, comment), {});
  }

  createPayout(agentId?: string, partnerId?: string, from?: string, to?: string): Observable<Api<M.CommissionPayoutDto>> {
    return this.http.post<Api<M.CommissionPayoutDto>>(API.brokerage.createPayout(agentId, partnerId, from, to), {});
  }

  getPayouts(query?: M.ListQueryDto): Observable<Page<M.CommissionPayoutDto>> {
    return this.http.get<Page<M.CommissionPayoutDto>>(API.brokerage.getPayouts(query));
  }

  /** Where a negotiator stands against their annual cap, and what happens after it. */
  getCapPosition(agentId: string, year?: number): Observable<Api<M.AgentCapLedgerDto>> {
    return this.http.get<Api<M.AgentCapLedgerDto>>(API.brokerage.getCapPosition(agentId, year));
  }

  /** Reverses commission already paid on a booking that has since been cancelled. */
  clawBack(bookingId: string): Observable<Api<number>> {
    return this.http.post<Api<number>>(API.brokerage.clawBack(bookingId), {});
  }

  getPartners(query?: M.ListQueryDto, status?: E.PartnerStatus): Observable<Page<M.ChannelPartnerListItemDto>> {
    return this.http.get<Page<M.ChannelPartnerListItemDto>>(API.brokerage.getPartners(query, status));
  }

  getPartner(id: string): Observable<Api<M.ChannelPartnerDetailDto>> {
    return this.http.get<Api<M.ChannelPartnerDetailDto>>(API.brokerage.getPartner(id));
  }

  savePartner(request: M.ChannelPartnerUpsertDto): Observable<Api<M.ChannelPartnerDetailDto>> {
    return this.http.post<Api<M.ChannelPartnerDetailDto>>(API.brokerage.savePartner, request);
  }

  changePartnerStatus(id: string, status?: E.PartnerStatus, reason?: string): Observable<Api<M.ChannelPartnerDetailDto>> {
    return this.http.post<Api<M.ChannelPartnerDetailDto>>(API.brokerage.changePartnerStatus(id, status, reason), {});
  }

  getTiers(): Observable<Api<M.PartnerTierDto[]>> {
    return this.http.get<Api<M.PartnerTierDto[]>>(API.brokerage.getTiers);
  }

  saveTier(request: M.PartnerTierDto): Observable<Api<M.PartnerTierDto>> {
    return this.http.post<Api<M.PartnerTierDto>>(API.brokerage.saveTier, request);
  }

  getPartnerRates(partnerId?: string, projectId?: string): Observable<Api<M.PartnerCommissionRateDto[]>> {
    return this.http.get<Api<M.PartnerCommissionRateDto[]>>(API.brokerage.getPartnerRates(partnerId, projectId));
  }

  savePartnerRate(request: M.PartnerCommissionRateDto): Observable<Api<M.PartnerCommissionRateDto>> {
    return this.http.post<Api<M.PartnerCommissionRateDto>>(API.brokerage.savePartnerRate, request);
  }

  /**
   * Registers a lead to a partner for a fixed window. This is what stops two agencies claiming
   * the same buyer, and it is the single most argued-about record in the whole channel.
   */
  registerLead(request: M.LeadRegistrationCreateDto): Observable<Api<M.LeadRegistrationDto>> {
    return this.http.post<Api<M.LeadRegistrationDto>>(API.brokerage.registerLead, request);
  }

  getRegistrations(query?: M.ListQueryDto, partnerId?: string, status?: E.LeadRegistrationStatus): Observable<Page<M.LeadRegistrationDto>> {
    return this.http.get<Page<M.LeadRegistrationDto>>(API.brokerage.getRegistrations(query, partnerId, status));
  }

  extendRegistration(id: string, days?: number): Observable<Api<M.LeadRegistrationDto>> {
    return this.http.post<Api<M.LeadRegistrationDto>>(API.brokerage.extendRegistration(id, days), {});
  }

  expireRegistrations(): Observable<Api<number>> {
    return this.http.post<Api<number>>(API.brokerage.expireRegistrations, {});
  }

  getPartnerCommission(query?: M.ListQueryDto, partnerId?: string, status?: E.CommissionStatus): Observable<Page<M.PartnerCommissionEntryDto>> {
    return this.http.get<Page<M.PartnerCommissionEntryDto>>(API.brokerage.getPartnerCommission(query, partnerId, status));
  }

  generateStatement(id: string, from?: string, to?: string): Observable<Api<M.PartnerStatementDto>> {
    return this.http.post<Api<M.PartnerStatementDto>>(API.brokerage.generateStatement(id, from, to), {});
  }

  createAdvance(request: M.PartnerAdvanceDto): Observable<Api<M.PartnerAdvanceDto>> {
    return this.http.post<Api<M.PartnerAdvanceDto>>(API.brokerage.createAdvance, request);
  }

  getContests(activeOnly?: boolean): Observable<Api<M.PartnerContestDto[]>> {
    return this.http.get<Api<M.PartnerContestDto[]>>(API.brokerage.getContests(activeOnly));
  }

  saveContest(request: M.PartnerContestDto): Observable<Api<M.PartnerContestDto>> {
    return this.http.post<Api<M.PartnerContestDto>>(API.brokerage.saveContest, request);
  }

  /** What a partner sees when they log in: their leads, bookings and what they are owed. */
  getPartnerPortal(id: string): Observable<Api<M.PartnerPortalHomeDto>> {
    return this.http.get<Api<M.PartnerPortalHomeDto>>(API.brokerage.getPartnerPortal(id));
  }

}

// ── Communication ───────────────────────────────────────────────

/** The shared inbox, templates, broadcasts, notifications and portal accounts. */
@Injectable({ providedIn: 'root' })
export class CommunicationService {
  private http = inject(HttpClient);

  getConversations(query?: M.ListQueryDto, channel?: E.NotificationChannel, status?: string, assignedToUserId?: string): Observable<Page<M.ConversationDto>> {
    return this.http.get<Page<M.ConversationDto>>(API.communication.getConversations(query, channel, status, assignedToUserId));
  }

  getConversation(id: string): Observable<Api<M.ConversationDto>> {
    return this.http.get<Api<M.ConversationDto>>(API.communication.getConversation(id));
  }

  send(request: M.SendMessageDto): Observable<Api<M.ConversationMessageDto>> {
    return this.http.post<Api<M.ConversationMessageDto>>(API.communication.send, request);
  }

  assign(id: string, assignToUserId?: string): Observable<Api<M.ConversationDto>> {
    return this.http.post<Api<M.ConversationDto>>(API.communication.assign(id, assignToUserId), {});
  }

  /**
   * Closes a thread. Refused while the customer's last message is unanswered — closing one of
   * those is how a complaint becomes a review.
   */
  close(id: string): Observable<Api<M.ConversationDto>> {
    return this.http.post<Api<M.ConversationDto>>(API.communication.close(id), {});
  }

  getTemplates(channel?: E.NotificationChannel, category?: string): Observable<Api<M.MessageTemplateDto[]>> {
    return this.http.get<Api<M.MessageTemplateDto[]>>(API.communication.getTemplates(channel, category));
  }

  saveTemplate(request: M.MessageTemplateDto): Observable<Api<M.MessageTemplateDto>> {
    return this.http.post<Api<M.MessageTemplateDto>>(API.communication.saveTemplate, request);
  }

  /**
   * Runs a broadcast. Defaults to a dry run, which returns the audience, the suppressions and
   * why each one was suppressed, without writing or sending anything.
   */
  runBroadcast(request: M.BroadcastRequestDto): Observable<Api<M.BroadcastRunDto>> {
    return this.http.post<Api<M.BroadcastRunDto>>(API.communication.runBroadcast, request);
  }

  getBroadcasts(query?: M.ListQueryDto): Observable<Page<M.BroadcastRunDto>> {
    return this.http.get<Page<M.BroadcastRunDto>>(API.communication.getBroadcasts(query));
  }

  getRules(): Observable<Api<M.NotificationRuleDto[]>> {
    return this.http.get<Api<M.NotificationRuleDto[]>>(API.communication.getRules);
  }

  saveRule(request: M.NotificationRuleDto): Observable<Api<M.NotificationRuleDto>> {
    return this.http.post<Api<M.NotificationRuleDto>>(API.communication.saveRule, request);
  }

  getNotifications(query?: M.ListQueryDto, unreadOnly?: boolean): Observable<Page<M.NotificationDto>> {
    return this.http.get<Page<M.NotificationDto>>(API.communication.getNotifications(query, unreadOnly));
  }

  markRead(ids: string[]): Observable<Api<void>> {
    return this.http.post<Api<void>>(API.communication.markRead, ids);
  }

  /**
   * The nightly sweep that turns dated obligations into notifications. Idempotent — each source
   * carries its own alert flag, so running it twice in a day does not message anybody twice.
   */
  runAlertSweep(): Observable<Api<number>> {
    return this.http.post<Api<number>>(API.communication.runAlertSweep, {});
  }

  getPortalUsers(query?: M.ListQueryDto, audience?: E.PortalAudience): Observable<Page<M.PortalUserDto>> {
    return this.http.get<Page<M.PortalUserDto>>(API.communication.getPortalUsers(query, audience));
  }

  savePortalUser(request: M.PortalUserDto): Observable<Api<M.PortalUserDto>> {
    return this.http.post<Api<M.PortalUserDto>>(API.communication.savePortalUser, request);
  }

  invitePortalUser(id: string): Observable<Api<M.PortalUserDto>> {
    return this.http.post<Api<M.PortalUserDto>>(API.communication.invitePortalUser(id), {});
  }

  /**
   * What a buyer sees when they log in: what they owe, when it is due, and how far along the
   * building is — from the same figures the office sees, because a portal that disagrees with
   * the accounts department generates more calls than it saves.
   */
  getCustomerPortal(partyId: string): Observable<Api<M.CustomerPortalHomeDto>> {
    return this.http.get<Api<M.CustomerPortalHomeDto>>(API.communication.getCustomerPortal(partyId));
  }

}

// ── Construction ────────────────────────────────────────────────

/** Work breakdown, BOQ, programme, certificates, subcontracts and client builds. */
@Injectable({ providedIn: 'root' })
export class ConstructionService {
  private http = inject(HttpClient);

  getProjects(query?: M.ListQueryDto, status?: E.ProjectStatus): Observable<Page<M.ConstructionProjectListItemDto>> {
    return this.http.get<Page<M.ConstructionProjectListItemDto>>(API.construction.getProjects(query, status));
  }

  getProject(id: string): Observable<Api<M.ConstructionProjectDetailDto>> {
    return this.http.get<Api<M.ConstructionProjectDetailDto>>(API.construction.getProject(id));
  }

  saveProject(request: M.ConstructionProjectDetailDto): Observable<Api<M.ConstructionProjectDetailDto>> {
    return this.http.post<Api<M.ConstructionProjectDetailDto>>(API.construction.saveProject, request);
  }

  getWbs(id: string): Observable<Api<M.WbsNodeDto[]>> {
    return this.http.get<Api<M.WbsNodeDto[]>>(API.construction.getWbs(id));
  }

  saveWbsNode(request: M.WbsNodeUpsertDto): Observable<Api<M.WbsNodeDto>> {
    return this.http.post<Api<M.WbsNodeDto>>(API.construction.saveWbsNode, request);
  }

  deleteWbsNode(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(API.construction.deleteWbsNode(id));
  }

  getBoqs(id: string): Observable<Api<M.BillOfQuantitiesDto[]>> {
    return this.http.get<Api<M.BillOfQuantitiesDto[]>>(API.construction.getBoqs(id));
  }

  getBoq(id: string): Observable<Api<M.BillOfQuantitiesDto>> {
    return this.http.get<Api<M.BillOfQuantitiesDto>>(API.construction.getBoq(id));
  }

  saveBoq(request: M.BillOfQuantitiesDto): Observable<Api<M.BillOfQuantitiesDto>> {
    return this.http.post<Api<M.BillOfQuantitiesDto>>(API.construction.saveBoq, request);
  }

  saveBoqLine(request: M.BoqLineUpsertDto): Observable<Api<M.BoqLineDto>> {
    return this.http.post<Api<M.BoqLineDto>>(API.construction.saveBoqLine, request);
  }

  importBoqLines(id: string, lines: M.BoqLineUpsertDto[]): Observable<Api<M.BillOfQuantitiesDto>> {
    return this.http.post<Api<M.BillOfQuantitiesDto>>(API.construction.importBoqLines(id), lines);
  }

  /** Rate build-ups: labour, material, plant and overhead behind each unit rate. */
  getRateAnalyses(constructionProjectId?: string, libraryOnly?: boolean): Observable<Api<M.RateAnalysisDto[]>> {
    return this.http.get<Api<M.RateAnalysisDto[]>>(API.construction.getRateAnalyses(constructionProjectId, libraryOnly));
  }

  saveRateAnalysis(request: M.RateAnalysisDto): Observable<Api<M.RateAnalysisDto>> {
    return this.http.post<Api<M.RateAnalysisDto>>(API.construction.saveRateAnalysis, request);
  }

  getEstimates(query?: M.ListQueryDto): Observable<Page<M.EstimateDto>> {
    return this.http.get<Page<M.EstimateDto>>(API.construction.getEstimates(query));
  }

  saveEstimate(request: M.EstimateDto): Observable<Api<M.EstimateDto>> {
    return this.http.post<Api<M.EstimateDto>>(API.construction.saveEstimate, request);
  }

  convertEstimate(id: string, constructionProjectId?: string): Observable<Api<M.BillOfQuantitiesDto>> {
    return this.http.post<Api<M.BillOfQuantitiesDto>>(API.construction.convertEstimate(id, constructionProjectId), {});
  }

  getSpecifications(constructionProjectId?: string, clientBuildContractId?: string): Observable<Api<M.SpecificationScheduleDto[]>> {
    return this.http.get<Api<M.SpecificationScheduleDto[]>>(API.construction.getSpecifications(constructionProjectId, clientBuildContractId));
  }

  saveSpecification(request: M.SpecificationScheduleDto): Observable<Api<M.SpecificationScheduleDto>> {
    return this.http.post<Api<M.SpecificationScheduleDto>>(API.construction.saveSpecification, request);
  }

  /**
   * Freezes a specification so it becomes contractual. After this, changing a make or a finish
   * is a variation with a price, which is exactly the discipline a fixed-price build needs.
   */
  freezeSpecification(id: string): Observable<Api<M.SpecificationScheduleDto>> {
    return this.http.post<Api<M.SpecificationScheduleDto>>(API.construction.freezeSpecification(id), {});
  }

  getProgramme(id: string): Observable<Api<M.ProgrammeActivityDto[]>> {
    return this.http.get<Api<M.ProgrammeActivityDto[]>>(API.construction.getProgramme(id));
  }

  saveActivity(id: string, request: M.ProgrammeActivityDto): Observable<Api<M.ProgrammeActivityDto>> {
    return this.http.post<Api<M.ProgrammeActivityDto>>(API.construction.saveActivity(id), request);
  }

  /** Forward and backward pass, so the float and the critical path are current. */
  recalculateCriticalPath(id: string): Observable<Api<M.ProgrammeActivityDto[]>> {
    return this.http.post<Api<M.ProgrammeActivityDto[]>>(API.construction.recalculateCriticalPath(id), {});
  }

  baseline(id: string): Observable<Api<M.ProgrammeActivityDto[]>> {
    return this.http.post<Api<M.ProgrammeActivityDto[]>>(API.construction.baseline(id), {});
  }

  saveProgress(request: M.ProgressMeasurementDto): Observable<Api<M.ProgressMeasurementDto>> {
    return this.http.post<Api<M.ProgressMeasurementDto>>(API.construction.saveProgress, request);
  }

  /** Uploads measurements taken on site with no signal. */
  syncProgress(batch: M.ProgressSyncBatchDto): Observable<Api<M.ProgressMeasurementDto>> {
    return this.http.post<Api<M.ProgressMeasurementDto>>(API.construction.syncProgress, batch);
  }

  certifyProgress(id: string): Observable<Api<M.ProgressMeasurementDto>> {
    return this.http.post<Api<M.ProgressMeasurementDto>>(API.construction.certifyProgress(id), {});
  }

  getProgress(query?: M.ListQueryDto, constructionProjectId?: string, subcontractId?: string): Observable<Page<M.ProgressMeasurementDto>> {
    return this.http.get<Page<M.ProgressMeasurementDto>>(API.construction.getProgress(query, constructionProjectId, subcontractId));
  }

  prepareIpc(request: M.IpcCreateDto): Observable<Api<M.InterimPaymentCertificateDetailDto>> {
    return this.http.post<Api<M.InterimPaymentCertificateDetailDto>>(API.construction.prepareIpc, request);
  }

  certifyIpc(id: string): Observable<Api<M.InterimPaymentCertificateDetailDto>> {
    return this.http.post<Api<M.InterimPaymentCertificateDetailDto>>(API.construction.certifyIpc(id), {});
  }

  approveIpc(id: string, outcome?: E.ApprovalOutcome, comment?: string): Observable<Api<M.InterimPaymentCertificateDetailDto>> {
    return this.http.post<Api<M.InterimPaymentCertificateDetailDto>>(API.construction.approveIpc(id, outcome, comment), {});
  }

  getIpcs(query?: M.ListQueryDto, constructionProjectId?: string, direction?: string, status?: E.CertificateStatus): Observable<Page<M.InterimPaymentCertificateListItemDto>> {
    return this.http.get<Page<M.InterimPaymentCertificateListItemDto>>(API.construction.getIpcs(query, constructionProjectId, direction, status));
  }

  getIpc(id: string): Observable<Api<M.InterimPaymentCertificateDetailDto>> {
    return this.http.get<Api<M.InterimPaymentCertificateDetailDto>>(API.construction.getIpc(id));
  }

  getRetention(query?: M.ListQueryDto, subcontractId?: string, dueForReleaseOnly?: boolean): Observable<Page<M.RetentionLedgerEntryDto>> {
    return this.http.get<Page<M.RetentionLedgerEntryDto>>(API.construction.getRetention(query, subcontractId, dueForReleaseOnly));
  }

  releaseRetention(subcontractId?: string, clientBuildContractId?: string, amount?: number, movement?: E.RetentionMovement): Observable<Api<M.RetentionLedgerEntryDto>> {
    return this.http.post<Api<M.RetentionLedgerEntryDto>>(API.construction.releaseRetention(subcontractId, clientBuildContractId, amount, movement), {});
  }

  createAdvance(request: M.AdvancePaymentDto): Observable<Api<M.AdvancePaymentDto>> {
    return this.http.post<Api<M.AdvancePaymentDto>>(API.construction.createAdvance, request);
  }

  saveMaterialsOnSite(request: M.MaterialsOnSiteDto): Observable<Api<M.MaterialsOnSiteDto>> {
    return this.http.post<Api<M.MaterialsOnSiteDto>>(API.construction.saveMaterialsOnSite, request);
  }

  /**
   * Rebuilds the cost to complete from what has been spent and what is left. This is the number
   * that tells a builder whether the job is still making money while there is time to react.
   */
  recalculateCostToComplete(id: string, asOf?: string): Observable<Api<M.CostToCompleteDto>> {
    return this.http.post<Api<M.CostToCompleteDto>>(API.construction.recalculateCostToComplete(id, asOf), {});
  }

  getTenders(query?: M.ListQueryDto, status?: E.TenderStatus): Observable<Page<M.TenderDto>> {
    return this.http.get<Page<M.TenderDto>>(API.construction.getTenders(query, status));
  }

  getTender(id: string): Observable<Api<M.TenderDto>> {
    return this.http.get<Api<M.TenderDto>>(API.construction.getTender(id));
  }

  saveTender(request: M.TenderDto): Observable<Api<M.TenderDto>> {
    return this.http.post<Api<M.TenderDto>>(API.construction.saveTender, request);
  }

  submitBid(id: string, bid: M.TenderBidDto): Observable<Api<M.TenderDto>> {
    return this.http.post<Api<M.TenderDto>>(API.construction.submitBid(id), bid);
  }

  /**
   * Awards the tender. The justification is required even when the lowest bid wins, because the
   * question always asked afterwards is why the other one did not.
   */
  awardTender(id: string, bidId?: string, justification?: string): Observable<Api<M.TenderDto>> {
    return this.http.post<Api<M.TenderDto>>(API.construction.awardTender(id, bidId, justification), {});
  }

  getBidComparison(id: string): Observable<Api<M.BidComparisonLineDto[]>> {
    return this.http.get<Api<M.BidComparisonLineDto[]>>(API.construction.getBidComparison(id));
  }

  getSubcontracts(query?: M.ListQueryDto, constructionProjectId?: string, status?: E.SubcontractStatus): Observable<Page<M.SubcontractListItemDto>> {
    return this.http.get<Page<M.SubcontractListItemDto>>(API.construction.getSubcontracts(query, constructionProjectId, status));
  }

  getSubcontract(id: string): Observable<Api<M.SubcontractDetailDto>> {
    return this.http.get<Api<M.SubcontractDetailDto>>(API.construction.getSubcontract(id));
  }

  saveSubcontract(request: M.SubcontractCreateDto): Observable<Api<M.SubcontractDetailDto>> {
    return this.http.post<Api<M.SubcontractDetailDto>>(API.construction.saveSubcontract, request);
  }

  changeSubcontractStatus(id: string, status?: E.SubcontractStatus, reason?: string): Observable<Api<M.SubcontractDetailDto>> {
    return this.http.post<Api<M.SubcontractDetailDto>>(API.construction.changeSubcontractStatus(id, status, reason), {});
  }

  submitClaim(request: M.SubcontractorClaimDto): Observable<Api<M.SubcontractorClaimDto>> {
    return this.http.post<Api<M.SubcontractorClaimDto>>(API.construction.submitClaim, request);
  }

  /**
   * Certifies a claim line by line. What is disallowed is recorded with its reason — a
   * subcontractor who is paid less than they claimed will ask, and "the system said so" is not
   * an answer that survives a site meeting.
   */
  certifyClaim(id: string, certifications: M.ClaimCertificationDto[]): Observable<Api<M.SubcontractorClaimDto>> {
    return this.http.post<Api<M.SubcontractorClaimDto>>(API.construction.certifyClaim(id), certifications);
  }

  getClaims(query?: M.ListQueryDto, subcontractId?: string, status?: E.CertificateStatus): Observable<Page<M.SubcontractorClaimDto>> {
    return this.http.get<Page<M.SubcontractorClaimDto>>(API.construction.getClaims(query, subcontractId, status));
  }

  saveContraCharge(request: M.ContraChargeDto): Observable<Api<M.ContraChargeDto>> {
    return this.http.post<Api<M.ContraChargeDto>>(API.construction.saveContraCharge, request);
  }

  getVariations(query?: M.ListQueryDto, constructionProjectId?: string, status?: E.VariationStatus): Observable<Page<M.VariationOrderListItemDto>> {
    return this.http.get<Page<M.VariationOrderListItemDto>>(API.construction.getVariations(query, constructionProjectId, status));
  }

  getVariation(id: string): Observable<Api<M.VariationOrderDetailDto>> {
    return this.http.get<Api<M.VariationOrderDetailDto>>(API.construction.getVariation(id));
  }

  saveVariation(request: M.VariationOrderUpsertDto): Observable<Api<M.VariationOrderDetailDto>> {
    return this.http.post<Api<M.VariationOrderDetailDto>>(API.construction.saveVariation, request);
  }

  decideVariation(id: string, status?: E.VariationStatus, reason?: string): Observable<Api<M.VariationOrderDetailDto>> {
    return this.http.post<Api<M.VariationOrderDetailDto>>(API.construction.decideVariation(id, status, reason), {});
  }

  issueSiteInstruction(request: M.SiteInstructionDto): Observable<Api<M.SiteInstructionDto>> {
    return this.http.post<Api<M.SiteInstructionDto>>(API.construction.issueSiteInstruction, request);
  }

  getSiteInstructions(query?: M.ListQueryDto, constructionProjectId?: string): Observable<Page<M.SiteInstructionDto>> {
    return this.http.get<Page<M.SiteInstructionDto>>(API.construction.getSiteInstructions(query, constructionProjectId));
  }

  saveDelay(request: M.DelayEventDto): Observable<Api<M.DelayEventDto>> {
    return this.http.post<Api<M.DelayEventDto>>(API.construction.saveDelay, request);
  }

  getDelays(query?: M.ListQueryDto, constructionProjectId?: string): Observable<Page<M.DelayEventDto>> {
    return this.http.get<Page<M.DelayEventDto>>(API.construction.getDelays(query, constructionProjectId));
  }

  saveExtension(request: M.ExtensionOfTimeDto): Observable<Api<M.ExtensionOfTimeDto>> {
    return this.http.post<Api<M.ExtensionOfTimeDto>>(API.construction.saveExtension, request);
  }

  decideExtension(id: string, daysGranted?: number, prolongationGranted?: boolean, note?: string): Observable<Api<M.ExtensionOfTimeDto>> {
    return this.http.post<Api<M.ExtensionOfTimeDto>>(API.construction.decideExtension(id, daysGranted, prolongationGranted, note), {});
  }

  saveRequisition(request: M.MaterialRequisitionDto): Observable<Api<M.MaterialRequisitionDto>> {
    return this.http.post<Api<M.MaterialRequisitionDto>>(API.construction.saveRequisition, request);
  }

  approveRequisition(id: string, outcome?: E.ApprovalOutcome, comment?: string): Observable<Api<M.MaterialRequisitionDto>> {
    return this.http.post<Api<M.MaterialRequisitionDto>>(API.construction.approveRequisition(id, outcome, comment), {});
  }

  getRequisitions(query?: M.ListQueryDto, constructionProjectId?: string, status?: string): Observable<Page<M.MaterialRequisitionDto>> {
    return this.http.get<Page<M.MaterialRequisitionDto>>(API.construction.getRequisitions(query, constructionProjectId, status));
  }

  issueMaterial(request: M.MaterialIssueDto): Observable<Api<M.MaterialIssueDto>> {
    return this.http.post<Api<M.MaterialIssueDto>>(API.construction.issueMaterial, request);
  }

  getIssues(query?: M.ListQueryDto, constructionProjectId?: string): Observable<Page<M.MaterialIssueDto>> {
    return this.http.get<Page<M.MaterialIssueDto>>(API.construction.getIssues(query, constructionProjectId));
  }

  /**
   * Compares what was consumed against what the norms say should have been. The difference is
   * wastage, and on a large site it is a bigger number than most people expect.
   */
  calculateWastage(id: string, from?: string, to?: string): Observable<Api<M.WastageRecordDto[]>> {
    return this.http.post<Api<M.WastageRecordDto[]>>(API.construction.calculateWastage(id, from, to), {});
  }

  saveLabour(request: M.LabourRecordDto): Observable<Api<M.LabourRecordDto>> {
    return this.http.post<Api<M.LabourRecordDto>>(API.construction.saveLabour, request);
  }

  getLabour(query?: M.ListQueryDto, constructionProjectId?: string): Observable<Page<M.LabourRecordDto>> {
    return this.http.get<Page<M.LabourRecordDto>>(API.construction.getLabour(query, constructionProjectId));
  }

  getPlant(status?: string): Observable<Api<M.PlantItemDto[]>> {
    return this.http.get<Api<M.PlantItemDto[]>>(API.construction.getPlant(status));
  }

  savePlant(request: M.PlantItemDto): Observable<Api<M.PlantItemDto>> {
    return this.http.post<Api<M.PlantItemDto>>(API.construction.savePlant, request);
  }

  allocatePlant(request: M.PlantAllocationDto): Observable<Api<M.PlantAllocationDto>> {
    return this.http.post<Api<M.PlantAllocationDto>>(API.construction.allocatePlant, request);
  }

  recordSiteGateEntry(request: M.SiteGateEntryDto): Observable<Api<M.SiteGateEntryDto>> {
    return this.http.post<Api<M.SiteGateEntryDto>>(API.construction.recordSiteGateEntry, request);
  }

  saveSafetyIncident(request: M.SafetyIncidentDto): Observable<Api<M.SafetyIncidentDto>> {
    return this.http.post<Api<M.SafetyIncidentDto>>(API.construction.saveSafetyIncident, request);
  }

  getSafetyIncidents(query?: M.ListQueryDto, constructionProjectId?: string): Observable<Page<M.SafetyIncidentDto>> {
    return this.http.get<Page<M.SafetyIncidentDto>>(API.construction.getSafetyIncidents(query, constructionProjectId));
  }

  getClientBuilds(query?: M.ListQueryDto, status?: string): Observable<Page<M.ClientBuildContractListItemDto>> {
    return this.http.get<Page<M.ClientBuildContractListItemDto>>(API.construction.getClientBuilds(query, status));
  }

  getClientBuild(id: string): Observable<Api<M.ClientBuildContractDetailDto>> {
    return this.http.get<Api<M.ClientBuildContractDetailDto>>(API.construction.getClientBuild(id));
  }

  saveClientBuild(request: M.ClientBuildContractUpsertDto): Observable<Api<M.ClientBuildContractDetailDto>> {
    return this.http.post<Api<M.ClientBuildContractDetailDto>>(API.construction.saveClientBuild, request);
  }

  changeClientBuildStatus(id: string, status?: string): Observable<Api<M.ClientBuildContractDetailDto>> {
    return this.http.post<Api<M.ClientBuildContractDetailDto>>(API.construction.changeClientBuildStatus(id, status), {});
  }

  saveClientVariation(request: M.ClientVariationUpsertDto): Observable<Api<M.ClientVariationDto>> {
    return this.http.post<Api<M.ClientVariationDto>>(API.construction.saveClientVariation, request);
  }

  decideClientVariation(id: string, approved?: boolean, reason?: string, evidenceUrl?: string): Observable<Api<M.ClientVariationDto>> {
    return this.http.post<Api<M.ClientVariationDto>>(API.construction.decideClientVariation(id, approved, reason, evidenceUrl), {});
  }

  getClientVariations(query?: M.ListQueryDto, contractId?: string, status?: E.VariationStatus): Observable<Page<M.ClientVariationDto>> {
    return this.http.get<Page<M.ClientVariationDto>>(API.construction.getClientVariations(query, contractId, status));
  }

  getCostSheet(id: string, asOf?: string): Observable<Api<M.ContractCostSheetDto>> {
    return this.http.get<Api<M.ContractCostSheetDto>>(API.construction.getCostSheet(id, asOf));
  }

  /**
   * Rebuilds the cost sheet and attributes margin erosion to what caused it — variations
   * absorbed, wastage, rework, delay, rate increases — with whatever is left honestly labelled
   * as unexplained rather than quietly folded into one of the others.
   */
  recalculateCostSheet(id: string): Observable<Api<M.ContractCostSheetDto>> {
    return this.http.post<Api<M.ContractCostSheetDto>>(API.construction.recalculateCostSheet(id), {});
  }

  getDrawings(clientBuildContractId?: string, constructionProjectId?: string): Observable<Api<M.DrawingRegisterDto[]>> {
    return this.http.get<Api<M.DrawingRegisterDto[]>>(API.construction.getDrawings(clientBuildContractId, constructionProjectId));
  }

  saveDrawing(request: M.DrawingRegisterDto): Observable<Api<M.DrawingRegisterDto>> {
    return this.http.post<Api<M.DrawingRegisterDto>>(API.construction.saveDrawing, request);
  }

  addRevision(id: string, request: M.DrawingRevisionDto): Observable<Api<M.DrawingRegisterDto>> {
    return this.http.post<Api<M.DrawingRegisterDto>>(API.construction.addRevision(id), request);
  }

  getClientPortal(partyId: string): Observable<Api<M.CustomerPortalHomeDto>> {
    return this.http.get<Api<M.CustomerPortalHomeDto>>(API.construction.getClientPortal(partyId));
  }

}

// ── Crm ─────────────────────────────────────────────────────────

/** Contacts, KYC, enquiries, requirements, viewings, site visits and keys. */
@Injectable({ providedIn: 'root' })
export class CrmService {
  private http = inject(HttpClient);

  searchParties(query: M.PartySearchDto): Observable<Page<M.PartyListItemDto>> {
    return this.http.post<Page<M.PartyListItemDto>>(API.crm.searchParties, query);
  }

  getParty(id: string): Observable<Api<M.PartyDetailDto>> {
    return this.http.get<Api<M.PartyDetailDto>>(API.crm.getParty(id));
  }

  saveParty(request: M.PartyUpsertDto): Observable<Api<M.PartyDetailDto>> {
    return this.http.post<Api<M.PartyDetailDto>>(API.crm.saveParty, request);
  }

  lookupParties(search?: string, role?: E.PartyRoleKind, take?: number): Observable<Api<M.LookupDto[]>> {
    return this.http.get<Api<M.LookupDto[]>>(API.crm.lookupParties(search, role, take));
  }

  findDuplicates(request: M.PartyUpsertDto): Observable<Api<M.PartyListItemDto[]>> {
    return this.http.post<Api<M.PartyListItemDto[]>>(API.crm.findDuplicates, request);
  }

  /**
   * Folds one contact into another. Everything the duplicate carried moves across, because a
   * customer whose payments are split across two records cannot be shown a statement.
   */
  mergeParties(keepId?: string, mergeId?: string): Observable<Api<M.PartyDetailDto>> {
    return this.http.post<Api<M.PartyDetailDto>>(API.crm.mergeParties(keepId, mergeId), {});
  }

  getKyc(partyId: string): Observable<Api<M.KycCaseDto>> {
    return this.http.get<Api<M.KycCaseDto>>(API.crm.getKyc(partyId));
  }

  saveKyc(request: M.KycCaseDto): Observable<Api<M.KycCaseDto>> {
    return this.http.post<Api<M.KycCaseDto>>(API.crm.saveKyc, request);
  }

  decideKyc(id: string, status?: E.KycStatus, note?: string): Observable<Api<M.KycCaseDto>> {
    return this.http.post<Api<M.KycCaseDto>>(API.crm.decideKyc(id, status, note), {});
  }

  getKycQueue(query?: M.ListQueryDto, status?: E.KycStatus): Observable<Page<M.KycCaseDto>> {
    return this.http.get<Page<M.KycCaseDto>>(API.crm.getKycQueue(query, status));
  }

  getCautionList(query?: M.ListQueryDto): Observable<Page<M.CautionListEntryDto>> {
    return this.http.get<Page<M.CautionListEntryDto>>(API.crm.getCautionList(query));
  }

  addCaution(request: M.CautionListEntryDto): Observable<Api<M.CautionListEntryDto>> {
    return this.http.post<Api<M.CautionListEntryDto>>(API.crm.addCaution, request);
  }

  clearCaution(id: string, note?: string): Observable<Api<M.CautionListEntryDto>> {
    return this.http.post<Api<M.CautionListEntryDto>>(API.crm.clearCaution(id, note), {});
  }

  searchEnquiries(query: M.EnquirySearchDto): Observable<Page<M.EnquiryListItemDto>> {
    return this.http.post<Page<M.EnquiryListItemDto>>(API.crm.searchEnquiries, query);
  }

  getBoard(query: M.EnquirySearchDto): Observable<Api<M.EnquiryBoardDto>> {
    return this.http.post<Api<M.EnquiryBoardDto>>(API.crm.getBoard, query);
  }

  getEnquiry(id: string): Observable<Api<M.EnquiryDetailDto>> {
    return this.http.get<Api<M.EnquiryDetailDto>>(API.crm.getEnquiry(id));
  }

  saveEnquiry(request: M.EnquiryUpsertDto): Observable<Api<M.EnquiryDetailDto>> {
    return this.http.post<Api<M.EnquiryDetailDto>>(API.crm.saveEnquiry, request);
  }

  changeStage(request: M.EnquiryStageChangeDto): Observable<Api<M.EnquiryDetailDto>> {
    return this.http.post<Api<M.EnquiryDetailDto>>(API.crm.changeStage, request);
  }

  assign(id: string, agentId?: string): Observable<Api<M.EnquiryDetailDto>> {
    return this.http.post<Api<M.EnquiryDetailDto>>(API.crm.assign(id, agentId), {});
  }

  /** Hands out anything still sitting unassigned, by the office's own routing rules. */
  route(): Observable<Api<number>> {
    return this.http.post<Api<number>>(API.crm.route, {});
  }

  /** Marks leads that have passed the response promise, so they show as breached. */
  flagSla(): Observable<Api<number>> {
    return this.http.post<Api<number>>(API.crm.flagSla, {});
  }

  saveRequirement(request: M.RequirementProfileUpsertDto): Observable<Api<M.RequirementProfileDto>> {
    return this.http.post<Api<M.RequirementProfileDto>>(API.crm.saveRequirement, request);
  }

  getRequirements(partyId: string): Observable<Api<M.RequirementProfileDto[]>> {
    return this.http.get<Api<M.RequirementProfileDto[]>>(API.crm.getRequirements(partyId));
  }

  runMatch(id: string, take?: number): Observable<Api<M.MatchResultDto[]>> {
    return this.http.get<Api<M.MatchResultDto[]>>(API.crm.runMatch(id, take));
  }

  matchListing(listingId: string, take?: number): Observable<Api<M.MatchResultDto[]>> {
    return this.http.get<Api<M.MatchResultDto[]>>(API.crm.matchListing(listingId, take));
  }

  sendMatches(request: M.SendMatchesDto): Observable<Api<number>> {
    return this.http.post<Api<number>>(API.crm.sendMatches, request);
  }

  dismissMatch(matchId: string, reasonCodeId?: string): Observable<Api<void>> {
    return this.http.post<Api<void>>(API.crm.dismissMatch(matchId, reasonCodeId), {});
  }

  logActivity(request: M.ActivityCreateDto): Observable<Api<M.ActivityDto>> {
    return this.http.post<Api<M.ActivityDto>>(API.crm.logActivity, request);
  }

  getActivities(partyId?: string, enquiryId?: string, query?: M.ListQueryDto): Observable<Page<M.ActivityDto>> {
    return this.http.get<Page<M.ActivityDto>>(API.crm.getActivities(partyId, enquiryId, query));
  }

  saveTask(request: M.FollowUpTaskCreateDto): Observable<Api<M.FollowUpTaskDto>> {
    return this.http.post<Api<M.FollowUpTaskDto>>(API.crm.saveTask, request);
  }

  completeTask(request: M.TaskCompletionDto): Observable<Api<M.FollowUpTaskDto>> {
    return this.http.post<Api<M.FollowUpTaskDto>>(API.crm.completeTask, request);
  }

  snoozeTask(taskId: string, until?: string): Observable<Api<M.FollowUpTaskDto>> {
    return this.http.post<Api<M.FollowUpTaskDto>>(API.crm.snoozeTask(taskId, until), {});
  }

  /** Everything one person has to do today, in the order it has to happen. */
  getMyDay(date?: string): Observable<Api<M.MyDayDto>> {
    return this.http.get<Api<M.MyDayDto>>(API.crm.getMyDay(date));
  }

  getDiary(agentId?: string, date?: string): Observable<Api<M.DiaryDayDto>> {
    return this.http.get<Api<M.DiaryDayDto>>(API.crm.getDiary(agentId, date));
  }

  getViewings(query?: M.ListQueryDto, agentId?: string, status?: E.ViewingStatus): Observable<Page<M.ViewingListItemDto>> {
    return this.http.get<Page<M.ViewingListItemDto>>(API.crm.getViewings(query, agentId, status));
  }

  getViewing(id: string): Observable<Api<M.ViewingDetailDto>> {
    return this.http.get<Api<M.ViewingDetailDto>>(API.crm.getViewing(id));
  }

  saveViewing(request: M.ViewingUpsertDto): Observable<Api<M.ViewingDetailDto>> {
    return this.http.post<Api<M.ViewingDetailDto>>(API.crm.saveViewing, request);
  }

  changeViewingStatus(id: string, status?: E.ViewingStatus, reasonCodeId?: string, note?: string): Observable<Api<M.ViewingDetailDto>> {
    return this.http.post<Api<M.ViewingDetailDto>>(API.crm.changeViewingStatus(id, status, reasonCodeId, note), {});
  }

  saveFeedback(request: M.ViewingFeedbackDto): Observable<Api<M.ViewingFeedbackDto>> {
    return this.http.post<Api<M.ViewingFeedbackDto>>(API.crm.saveFeedback, request);
  }

  /**
   * Sends the viewer's feedback to the vendor. Deliberately a separate step — some feedback
   * needs a conversation before a seller reads it verbatim.
   */
  shareFeedback(feedbackId: string): Observable<Api<M.ViewingFeedbackDto>> {
    return this.http.post<Api<M.ViewingFeedbackDto>>(API.crm.shareFeedback(feedbackId), {});
  }

  getSiteVisits(query?: M.ListQueryDto, projectId?: string, status?: E.ViewingStatus): Observable<Page<M.SiteVisitListItemDto>> {
    return this.http.get<Page<M.SiteVisitListItemDto>>(API.crm.getSiteVisits(query, projectId, status));
  }

  getSiteVisit(id: string): Observable<Api<M.SiteVisitDetailDto>> {
    return this.http.get<Api<M.SiteVisitDetailDto>>(API.crm.getSiteVisit(id));
  }

  saveSiteVisit(request: M.SiteVisitUpsertDto): Observable<Api<M.SiteVisitDetailDto>> {
    return this.http.post<Api<M.SiteVisitDetailDto>>(API.crm.saveSiteVisit, request);
  }

  changeVisitStatus(id: string, status?: E.ViewingStatus, reasonCodeId?: string): Observable<Api<M.SiteVisitDetailDto>> {
    return this.http.post<Api<M.SiteVisitDetailDto>>(API.crm.changeVisitStatus(id, status, reasonCodeId), {});
  }

  saveVisitFeedback(request: M.SiteVisitFeedbackDto): Observable<Api<M.SiteVisitFeedbackDto>> {
    return this.http.post<Api<M.SiteVisitFeedbackDto>>(API.crm.saveVisitFeedback, request);
  }

  getKeys(propertyId?: string, outOnly?: boolean): Observable<Api<M.KeySetDto[]>> {
    return this.http.get<Api<M.KeySetDto[]>>(API.crm.getKeys(propertyId, outOnly));
  }

  saveKeySet(request: M.KeySetDto): Observable<Api<M.KeySetDto>> {
    return this.http.post<Api<M.KeySetDto>>(API.crm.saveKeySet, request);
  }

  /** Signs a set of keys in or out. The chain of custody is the whole point. */
  moveKeys(keySetId: string, movement?: string, holderUserId?: string, holderPartyId?: string, dueBack?: string, note?: string): Observable<Api<M.KeySetDto>> {
    return this.http.post<Api<M.KeySetDto>>(API.crm.moveKeys(keySetId, movement, holderUserId, holderPartyId, dueBack, note), {});
  }

}

// ── Exit ────────────────────────────────────────────────────────

/** Cancellations, refunds, transfers, possession, snagging and NOCs. */
@Injectable({ providedIn: 'root' })
export class ExitService {
  private http = inject(HttpClient);

  /** What would be deducted and what would come back, without cancelling anything. */
  previewCancellation(request: M.CancellationRequestDto): Observable<Api<M.CancellationPreviewDto>> {
    return this.http.post<Api<M.CancellationPreviewDto>>(API.exit.previewCancellation, request);
  }

  requestCancellation(request: M.CancellationRequestDto): Observable<Api<M.CancellationDto>> {
    return this.http.post<Api<M.CancellationDto>>(API.exit.requestCancellation, request);
  }

  decideCancellation(id: string, outcome?: E.ApprovalOutcome, comment?: string): Observable<Api<M.CancellationDto>> {
    return this.http.post<Api<M.CancellationDto>>(API.exit.decideCancellation(id, outcome, comment), {});
  }

  getCancellations(query?: M.ListQueryDto): Observable<Page<M.CancellationDto>> {
    return this.http.get<Page<M.CancellationDto>>(API.exit.getCancellations(query));
  }

  getDeductionPolicies(projectId?: string): Observable<Api<M.DeductionPolicyDto[]>> {
    return this.http.get<Api<M.DeductionPolicyDto[]>>(API.exit.getDeductionPolicies(projectId));
  }

  saveDeductionPolicy(request: M.DeductionPolicyDto): Observable<Api<M.DeductionPolicyDto>> {
    return this.http.post<Api<M.DeductionPolicyDto>>(API.exit.saveDeductionPolicy, request);
  }

  createRefund(request: M.RefundRequestDto): Observable<Api<M.RefundRequestDto>> {
    return this.http.post<Api<M.RefundRequestDto>>(API.exit.createRefund, request);
  }

  decideRefund(id: string, outcome?: E.ApprovalOutcome, approvedAmount?: number, comment?: string): Observable<Api<M.RefundRequestDto>> {
    return this.http.post<Api<M.RefundRequestDto>>(API.exit.decideRefund(id, outcome, approvedAmount, comment), {});
  }

  recordRefundPayment(scheduleId: string, paidOn?: string, instrument?: E.PaymentInstrument, reference?: string): Observable<Api<M.RefundRequestDto>> {
    return this.http.post<Api<M.RefundRequestDto>>(API.exit.recordRefundPayment(scheduleId, paidOn, instrument, reference), {});
  }

  getRefunds(query?: M.ListQueryDto, status?: E.RefundStatus): Observable<Page<M.RefundRequestDto>> {
    return this.http.get<Page<M.RefundRequestDto>>(API.exit.getRefunds(query, status));
  }

  /**
   * Puts the unit back on the market and pays the customer out of the resale rather than out of
   * cash flow. Common where a scheme's terms say refunds wait for a resale.
   */
  createResale(request: M.ResaleRequestDto): Observable<Api<M.ResaleRequestDto>> {
    return this.http.post<Api<M.ResaleRequestDto>>(API.exit.createResale, request);
  }

  getTransfers(query?: M.ListQueryDto, status?: E.TransferStatus, projectId?: string): Observable<Page<M.TransferRequestListItemDto>> {
    return this.http.get<Page<M.TransferRequestListItemDto>>(API.exit.getTransfers(query, status, projectId));
  }

  getTransfer(id: string): Observable<Api<M.TransferRequestDetailDto>> {
    return this.http.get<Api<M.TransferRequestDetailDto>>(API.exit.getTransfer(id));
  }

  createTransfer(request: M.TransferRequestCreateDto): Observable<Api<M.TransferRequestDetailDto>> {
    return this.http.post<Api<M.TransferRequestDetailDto>>(API.exit.createTransfer, request);
  }

  issueDuesClearance(bookingId?: string, unitId?: string, propertyId?: string, partyId?: string): Observable<Api<M.DuesClearanceDto>> {
    return this.http.post<Api<M.DuesClearanceDto>>(API.exit.issueDuesClearance(bookingId, unitId, propertyId, partyId), {});
  }

  /**
   * Lets a transfer proceed with dues outstanding. Needs a reason and an approval, and is
   * recorded as a high-risk override — this is the control everybody tries to go round.
   */
  overrideDues(id: string, reason?: string): Observable<Api<M.TransferRequestDetailDto>> {
    return this.http.post<Api<M.TransferRequestDetailDto>>(API.exit.overrideDues(id, reason), {});
  }

  computeFees(id: string): Observable<Api<M.TransferRequestDetailDto>> {
    return this.http.post<Api<M.TransferRequestDetailDto>>(API.exit.computeFees(id), {});
  }

  scheduleSession(id: string, scheduledAt?: string, venue?: string): Observable<Api<M.TransferSessionDto>> {
    return this.http.post<Api<M.TransferSessionDto>>(API.exit.scheduleSession(id, scheduledAt, venue), {});
  }

  saveSession(request: M.TransferSessionDto): Observable<Api<M.TransferSessionDto>> {
    return this.http.put<Api<M.TransferSessionDto>>(API.exit.saveSession, request);
  }

  completeTransfer(id: string): Observable<Api<M.TransferRequestDetailDto>> {
    return this.http.post<Api<M.TransferRequestDetailDto>>(API.exit.completeTransfer(id), {});
  }

  rejectTransfer(id: string, reasonCodeId?: string, note?: string): Observable<Api<M.TransferRequestDetailDto>> {
    return this.http.post<Api<M.TransferRequestDetailDto>>(API.exit.rejectTransfer(id, reasonCodeId, note), {});
  }

  /** Every owner this asset has ever had, in order, append-only. */
  getOwnershipChain(unitId?: string, propertyId?: string, plotFileId?: string): Observable<Api<M.OwnershipChainEntryDto[]>> {
    return this.http.get<Api<M.OwnershipChainEntryDto[]>>(API.exit.getOwnershipChain(unitId, propertyId, plotFileId));
  }

  createDuplicateFileRequest(request: M.DuplicateFileRequestDto): Observable<Api<M.DuplicateFileRequestDto>> {
    return this.http.post<Api<M.DuplicateFileRequestDto>>(API.exit.createDuplicateFileRequest, request);
  }

  issueDuplicateFile(id: string): Observable<Api<M.DuplicateFileRequestDto>> {
    return this.http.post<Api<M.DuplicateFileRequestDto>>(API.exit.issueDuplicateFile(id), {});
  }

  /** Whether this booking is ready for possession, and what is stopping it if not. */
  evaluatePossession(bookingId: string): Observable<Api<M.PossessionOfferDto>> {
    return this.http.get<Api<M.PossessionOfferDto>>(API.exit.evaluatePossession(bookingId));
  }

  offerPossession(bookingId: string, windowFrom?: string, windowTo?: string, templateId?: string): Observable<Api<M.PossessionOfferDto>> {
    return this.http.post<Api<M.PossessionOfferDto>>(API.exit.offerPossession(bookingId, windowFrom, windowTo, templateId), {});
  }

  setAppointment(id: string, on?: string): Observable<Api<M.PossessionOfferDto>> {
    return this.http.post<Api<M.PossessionOfferDto>>(API.exit.setAppointment(id, on), {});
  }

  overrideChecklist(checklistItemId: string, reason?: string): Observable<Api<M.PossessionOfferDto>> {
    return this.http.post<Api<M.PossessionOfferDto>>(API.exit.overrideChecklist(checklistItemId, reason), {});
  }

  getPossessions(query?: M.ListQueryDto, status?: E.PossessionStatus, projectId?: string): Observable<Page<M.PossessionOfferDto>> {
    return this.http.get<Page<M.PossessionOfferDto>>(API.exit.getPossessions(query, status, projectId));
  }

  completeHandover(request: M.HandoverDto): Observable<Api<M.HandoverDto>> {
    return this.http.post<Api<M.HandoverDto>>(API.exit.completeHandover, request);
  }

  getHandover(id: string): Observable<Api<M.HandoverDto>> {
    return this.http.get<Api<M.HandoverDto>>(API.exit.getHandover(id));
  }

  createInspection(request: M.SnagInspectionDto): Observable<Api<M.SnagInspectionDto>> {
    return this.http.post<Api<M.SnagInspectionDto>>(API.exit.createInspection, request);
  }

  getInspection(id: string): Observable<Api<M.SnagInspectionDto>> {
    return this.http.get<Api<M.SnagInspectionDto>>(API.exit.getInspection(id));
  }

  getInspections(query?: M.ListQueryDto, projectId?: string, openOnly?: boolean): Observable<Page<M.SnagInspectionDto>> {
    return this.http.get<Page<M.SnagInspectionDto>>(API.exit.getInspections(query, projectId, openOnly));
  }

  saveSnag(request: M.SnagUpsertDto): Observable<Api<M.SnagDto>> {
    return this.http.post<Api<M.SnagDto>>(API.exit.saveSnag, request);
  }

  /**
   * Uploads a batch captured on a tablet with no signal. Idempotent on the client reference, so
   * a surveyor who walks back into range and syncs twice does not create every snag twice.
   */
  syncSnags(batch: M.SnagSyncBatchDto): Observable<Api<M.SnagInspectionDto>> {
    return this.http.post<Api<M.SnagInspectionDto>>(API.exit.syncSnags, batch);
  }

  changeSnagStatus(id: string, photos: M.SnagPhotoDto[], status?: E.SnagStatus, note?: string): Observable<Api<M.SnagDto>> {
    return this.http.post<Api<M.SnagDto>>(API.exit.changeSnagStatus(id, status, note), photos);
  }

  issuePunchList(id: string, agreedClosureDate?: string): Observable<Api<M.PunchListDto>> {
    return this.http.post<Api<M.PunchListDto>>(API.exit.issuePunchList(id, agreedClosureDate), {});
  }

  getLiabilities(unitId?: string, projectId?: string, activeOnly?: boolean): Observable<Api<M.DefectLiabilityDto[]>> {
    return this.http.get<Api<M.DefectLiabilityDto[]>>(API.exit.getLiabilities(unitId, projectId, activeOnly));
  }

  createDefectClaim(request: M.DefectClaimDto): Observable<Api<M.DefectClaimDto>> {
    return this.http.post<Api<M.DefectClaimDto>>(API.exit.createDefectClaim, request);
  }

  decideDefectClaim(id: string, accepted?: boolean, reason?: string): Observable<Api<M.DefectClaimDto>> {
    return this.http.post<Api<M.DefectClaimDto>>(API.exit.decideDefectClaim(id, accepted, reason), {});
  }

  getDefectClaims(query?: M.ListQueryDto, status?: E.TicketStatus): Observable<Page<M.DefectClaimDto>> {
    return this.http.get<Page<M.DefectClaimDto>>(API.exit.getDefectClaims(query, status));
  }

  requestNoc(request: M.NocRequestDto): Observable<Api<M.NocIssuanceDto>> {
    return this.http.post<Api<M.NocIssuanceDto>>(API.exit.requestNoc, request);
  }

  issueNoc(id: string): Observable<Api<M.NocIssuanceDto>> {
    return this.http.post<Api<M.NocIssuanceDto>>(API.exit.issueNoc(id), {});
  }

  revokeNoc(id: string, reason?: string): Observable<Api<M.NocIssuanceDto>> {
    return this.http.post<Api<M.NocIssuanceDto>>(API.exit.revokeNoc(id, reason), {});
  }

  getNocs(query?: M.ListQueryDto, kind?: E.NocKind, status?: E.NocStatus): Observable<Page<M.NocIssuanceDto>> {
    return this.http.get<Page<M.NocIssuanceDto>>(API.exit.getNocs(query, kind, status));
  }

  /**
   * Checks a certificate somebody is holding against what was actually issued. Open to anybody
   * with the code, because that is the only way a verification feature is worth anything.
   */
  verifyNoc(code: string): Observable<Api<M.NocIssuanceDto>> {
    return this.http.get<Api<M.NocIssuanceDto>>(API.exit.verifyNoc(code));
  }

}

// ── Facility ────────────────────────────────────────────────────

/** Work orders, contractors, planned maintenance, assets, meters and parking. */
@Injectable({ providedIn: 'root' })
export class FacilityService {
  private http = inject(HttpClient);

  searchWorkOrders(query: M.WorkOrderSearchDto): Observable<Page<M.WorkOrderListItemDto>> {
    return this.http.post<Page<M.WorkOrderListItemDto>>(API.facility.searchWorkOrders, query);
  }

  getWorkOrder(id: string): Observable<Api<M.WorkOrderDetailDto>> {
    return this.http.get<Api<M.WorkOrderDetailDto>>(API.facility.getWorkOrder(id));
  }

  createWorkOrder(request: M.WorkOrderCreateDto): Observable<Api<M.WorkOrderDetailDto>> {
    return this.http.post<Api<M.WorkOrderDetailDto>>(API.facility.createWorkOrder, request);
  }

  assignWorkOrder(id: string, assignToUserId?: string, contractorId?: string, from?: string, to?: string): Observable<Api<M.WorkOrderDetailDto>> {
    return this.http.post<Api<M.WorkOrderDetailDto>>(API.facility.assignWorkOrder(id, assignToUserId, contractorId, from, to), {});
  }

  /**
   * Authorises spend above the landlord's own repair limit. Below it, no approval is needed —
   * asking a landlord to sign off a washer costs more than the washer.
   */
  authoriseWorkOrder(id: string, outcome?: E.ApprovalOutcome, comment?: string): Observable<Api<M.WorkOrderDetailDto>> {
    return this.http.post<Api<M.WorkOrderDetailDto>>(API.facility.authoriseWorkOrder(id, outcome, comment), {});
  }

  completeWorkOrder(request: M.WorkOrderCompletionDto): Observable<Api<M.WorkOrderDetailDto>> {
    return this.http.post<Api<M.WorkOrderDetailDto>>(API.facility.completeWorkOrder, request);
  }

  cancelWorkOrder(id: string, reasonCodeId?: string): Observable<Api<M.WorkOrderDetailDto>> {
    return this.http.post<Api<M.WorkOrderDetailDto>>(API.facility.cancelWorkOrder(id, reasonCodeId), {});
  }

  flagSla(): Observable<Api<number>> {
    return this.http.post<Api<number>>(API.facility.flagSla, {});
  }

  getContractors(query?: M.ListQueryDto, trade?: string, approvedOnly?: boolean): Observable<Page<M.ContractorListItemDto>> {
    return this.http.get<Page<M.ContractorListItemDto>>(API.facility.getContractors(query, trade, approvedOnly));
  }

  getContractor(id: string): Observable<Api<M.ContractorDetailDto>> {
    return this.http.get<Api<M.ContractorDetailDto>>(API.facility.getContractor(id));
  }

  saveContractor(request: M.ContractorDetailDto): Observable<Api<M.ContractorDetailDto>> {
    return this.http.post<Api<M.ContractorDetailDto>>(API.facility.saveContractor, request);
  }

  /**
   * Insurance, licences and certifications. A contractor whose public liability has lapsed
   * cannot be sent to a job, and this is where that is known.
   */
  saveCompliance(id: string, request: M.ContractorComplianceDto): Observable<Api<M.ContractorComplianceDto>> {
    return this.http.post<Api<M.ContractorComplianceDto>>(API.facility.saveCompliance(id), request);
  }

  getPpmSchedules(query?: M.ListQueryDto, propertyId?: string, overdueOnly?: boolean): Observable<Page<M.PpmScheduleDto>> {
    return this.http.get<Page<M.PpmScheduleDto>>(API.facility.getPpmSchedules(query, propertyId, overdueOnly));
  }

  savePpmSchedule(request: M.PpmScheduleDto): Observable<Api<M.PpmScheduleDto>> {
    return this.http.post<Api<M.PpmScheduleDto>>(API.facility.savePpmSchedule, request);
  }

  getPpmTasks(query?: M.ListQueryDto, status?: string): Observable<Page<M.PpmTaskDto>> {
    return this.http.get<Page<M.PpmTaskDto>>(API.facility.getPpmTasks(query, status));
  }

  generatePpm(asOf?: string): Observable<Api<number>> {
    return this.http.post<Api<number>>(API.facility.generatePpm(asOf), {});
  }

  completePpmTask(id: string, completedOn?: string, cost?: number, note?: string, certificateUrl?: string): Observable<Api<M.PpmTaskDto>> {
    return this.http.post<Api<M.PpmTaskDto>>(API.facility.completePpmTask(id, completedOn, cost, note, certificateUrl), {});
  }

  getAssets(query?: M.ListQueryDto, propertyId?: string, kind?: E.AssetKind): Observable<Page<M.FacilityAssetDto>> {
    return this.http.get<Page<M.FacilityAssetDto>>(API.facility.getAssets(query, propertyId, kind));
  }

  getAsset(id: string): Observable<Api<M.FacilityAssetDto>> {
    return this.http.get<Api<M.FacilityAssetDto>>(API.facility.getAsset(id));
  }

  saveAsset(request: M.FacilityAssetDto): Observable<Api<M.FacilityAssetDto>> {
    return this.http.post<Api<M.FacilityAssetDto>>(API.facility.saveAsset, request);
  }

  recordService(id: string, request: M.AssetServiceRecordDto): Observable<Api<M.AssetServiceRecordDto>> {
    return this.http.post<Api<M.AssetServiceRecordDto>>(API.facility.recordService(id), request);
  }

  getServiceContracts(propertyId?: string, expiringOnly?: boolean): Observable<Api<M.ServiceContractDto[]>> {
    return this.http.get<Api<M.ServiceContractDto[]>>(API.facility.getServiceContracts(propertyId, expiringOnly));
  }

  saveServiceContract(request: M.ServiceContractDto): Observable<Api<M.ServiceContractDto>> {
    return this.http.post<Api<M.ServiceContractDto>>(API.facility.saveServiceContract, request);
  }

  saveInspectionRound(request: M.InspectionRoundDto): Observable<Api<M.InspectionRoundDto>> {
    return this.http.post<Api<M.InspectionRoundDto>>(API.facility.saveInspectionRound, request);
  }

  getInspectionRounds(query?: M.ListQueryDto, propertyId?: string): Observable<Page<M.InspectionRoundDto>> {
    return this.http.get<Page<M.InspectionRoundDto>>(API.facility.getInspectionRounds(query, propertyId));
  }

  getMeters(query?: M.ListQueryDto, propertyId?: string, societyId?: string, kind?: E.MeterKind): Observable<Page<M.MeterDto>> {
    return this.http.get<Page<M.MeterDto>>(API.facility.getMeters(query, propertyId, societyId, kind));
  }

  saveMeter(request: M.MeterDto): Observable<Api<M.MeterDto>> {
    return this.http.post<Api<M.MeterDto>>(API.facility.saveMeter, request);
  }

  /** The round a meter reader walks, in order, with the last reading to compare against. */
  getReadingRound(societyId?: string, propertyId?: string, kind?: E.MeterKind): Observable<Api<M.MeterDto[]>> {
    return this.http.get<Api<M.MeterDto[]>>(API.facility.getReadingRound(societyId, propertyId, kind));
  }

  submitReadings(batch: M.MeterReadingBatchDto): Observable<Api<M.MeterReadingBatchResultDto>> {
    return this.http.post<Api<M.MeterReadingBatchResultDto>>(API.facility.submitReadings, batch);
  }

  getReadings(query?: M.ListQueryDto, meterId?: string, implausibleOnly?: boolean): Observable<Page<M.MeterReadingDto>> {
    return this.http.get<Page<M.MeterReadingDto>>(API.facility.getReadings(query, meterId, implausibleOnly));
  }

  verifyReading(id: string, correctedValue?: number): Observable<Api<M.MeterReadingDto>> {
    return this.http.post<Api<M.MeterReadingDto>>(API.facility.verifyReading(id, correctedValue), {});
  }

  getTariffs(societyId?: string, kind?: E.MeterKind): Observable<Api<M.UtilityTariffDto[]>> {
    return this.http.get<Api<M.UtilityTariffDto[]>>(API.facility.getTariffs(societyId, kind));
  }

  saveTariff(request: M.UtilityTariffDto): Observable<Api<M.UtilityTariffDto>> {
    return this.http.post<Api<M.UtilityTariffDto>>(API.facility.saveTariff, request);
  }

  generateUtilityBills(societyId?: string, periodFrom?: string, periodTo?: string, dryRun?: boolean): Observable<Api<M.UtilityBillDto[]>> {
    return this.http.post<Api<M.UtilityBillDto[]>>(API.facility.generateUtilityBills(societyId, periodFrom, periodTo, dryRun), {});
  }

  getUtilityBills(query?: M.ListQueryDto, unitId?: string): Observable<Page<M.UtilityBillDto>> {
    return this.http.get<Page<M.UtilityBillDto>>(API.facility.getUtilityBills(query, unitId));
  }

  /**
   * Bulk supply against the sum of the sub-meters, separating common-area use from unexplained
   * loss. The second number is theft or leakage, and it is the only one worth chasing.
   */
  reconcileUtility(societyId?: string, propertyId?: string, kind?: E.MeterKind, from?: string, to?: string): Observable<Api<M.UtilityReconciliationDto>> {
    return this.http.get<Api<M.UtilityReconciliationDto>>(API.facility.reconcileUtility(societyId, propertyId, kind, from, to));
  }

  saveFuelLog(request: M.FuelLogDto): Observable<Api<M.FuelLogDto>> {
    return this.http.post<Api<M.FuelLogDto>>(API.facility.saveFuelLog, request);
  }

  getFuelLogs(query?: M.ListQueryDto, societyId?: string): Observable<Page<M.FuelLogDto>> {
    return this.http.get<Page<M.FuelLogDto>>(API.facility.getFuelLogs(query, societyId));
  }

  getParking(query?: M.ListQueryDto, societyId?: string, unallottedOnly?: boolean): Observable<Page<M.ParkingSlotDto>> {
    return this.http.get<Page<M.ParkingSlotDto>>(API.facility.getParking(query, societyId, unallottedOnly));
  }

  saveParkingSlot(request: M.ParkingSlotDto): Observable<Api<M.ParkingSlotDto>> {
    return this.http.post<Api<M.ParkingSlotDto>>(API.facility.saveParkingSlot, request);
  }

  allotParking(request: M.ParkingAllotmentDto): Observable<Api<M.ParkingAllotmentDto>> {
    return this.http.post<Api<M.ParkingAllotmentDto>>(API.facility.allotParking, request);
  }

}

// ── Finance ─────────────────────────────────────────────────────

/** Joint ventures, investors, escrow, recognition, compliance and documents. */
@Injectable({ providedIn: 'root' })
export class FinanceService {
  private http = inject(HttpClient);

  getVentures(projectId?: string): Observable<Api<M.JointVentureDto[]>> {
    return this.http.get<Api<M.JointVentureDto[]>>(API.finance.getVentures(projectId));
  }

  getVenture(id: string): Observable<Api<M.JointVentureDto>> {
    return this.http.get<Api<M.JointVentureDto>>(API.finance.getVenture(id));
  }

  saveVenture(request: M.JointVentureDto): Observable<Api<M.JointVentureDto>> {
    return this.http.post<Api<M.JointVentureDto>>(API.finance.saveVenture, request);
  }

  /** Takes a unit out of saleable inventory and gives it to the landowner in kind. */
  allocateUnit(id: string, unitId?: string, jvPartnerId?: string): Observable<Api<M.LandownerAllocationDto>> {
    return this.http.post<Api<M.LandownerAllocationDto>>(API.finance.allocateUnit(id, unitId, jvPartnerId), {});
  }

  releaseAllocation(id: string): Observable<Api<M.LandownerAllocationDto>> {
    return this.http.post<Api<M.LandownerAllocationDto>>(API.finance.releaseAllocation(id), {});
  }

  getLandownerLedger(id: string, query?: M.ListQueryDto): Observable<Page<M.LandownerLedgerEntryDto>> {
    return this.http.get<Page<M.LandownerLedgerEntryDto>>(API.finance.getLandownerLedger(id, query));
  }

  /**
   * Accrues the landowner's share of everything collected since the last accrual. Incremental,
   * so running it twice in a day does nothing the second time.
   */
  accrueLandownerShare(id: string): Observable<Api<number>> {
    return this.http.post<Api<number>>(API.finance.accrueLandownerShare(id), {});
  }

  getInvestors(query?: M.ListQueryDto, projectId?: string): Observable<Page<M.InvestorDto>> {
    return this.http.get<Page<M.InvestorDto>>(API.finance.getInvestors(query, projectId));
  }

  getInvestor(id: string): Observable<Api<M.InvestorDto>> {
    return this.http.get<Api<M.InvestorDto>>(API.finance.getInvestor(id));
  }

  saveInvestor(request: M.InvestorDto): Observable<Api<M.InvestorDto>> {
    return this.http.post<Api<M.InvestorDto>>(API.finance.saveInvestor, request);
  }

  issueCapitalCall(request: M.CapitalCallDto): Observable<Api<M.CapitalCallDto>> {
    return this.http.post<Api<M.CapitalCallDto>>(API.finance.issueCapitalCall, request);
  }

  recordContribution(request: M.ContributionDto): Observable<Api<M.ContributionDto>> {
    return this.http.post<Api<M.ContributionDto>>(API.finance.recordContribution, request);
  }

  recordDistribution(request: M.DistributionDto): Observable<Api<M.DistributionDto>> {
    return this.http.post<Api<M.DistributionDto>>(API.finance.recordDistribution, request);
  }

  getProjectAccounts(projectId: string): Observable<Api<M.ProjectBankAccountDto[]>> {
    return this.http.get<Api<M.ProjectBankAccountDto[]>>(API.finance.getProjectAccounts(projectId));
  }

  saveProjectAccount(request: M.ProjectBankAccountDto): Observable<Api<M.ProjectBankAccountDto>> {
    return this.http.post<Api<M.ProjectBankAccountDto>>(API.finance.saveProjectAccount, request);
  }

  getEscrowLedger(id: string, query?: M.ListQueryDto): Observable<Page<M.EscrowLedgerEntryDto>> {
    return this.http.get<Page<M.EscrowLedgerEntryDto>>(API.finance.getEscrowLedger(id, query));
  }

  /**
   * Requests a withdrawal. Pass `dryRun` on the body to see the entitlement arithmetic and
   * the missing certificates without leaving a request behind.
   */
  requestWithdrawal(request: M.EscrowWithdrawalRequestDto): Observable<Api<M.EscrowWithdrawalDto>> {
    return this.http.post<Api<M.EscrowWithdrawalDto>>(API.finance.requestWithdrawal, request);
  }

  decideWithdrawal(id: string, outcome?: E.ApprovalOutcome, approvedAmount?: number, comment?: string): Observable<Api<M.EscrowWithdrawalDto>> {
    return this.http.post<Api<M.EscrowWithdrawalDto>>(API.finance.decideWithdrawal(id, outcome, approvedAmount, comment), {});
  }

  getWithdrawals(query?: M.ListQueryDto, projectId?: string): Observable<Page<M.EscrowWithdrawalDto>> {
    return this.http.get<Page<M.EscrowWithdrawalDto>>(API.finance.getWithdrawals(query, projectId));
  }

  recomputeEntitlement(id: string): Observable<Api<M.ProjectBankAccountDto>> {
    return this.http.post<Api<M.ProjectBankAccountDto>>(API.finance.recomputeEntitlement(id), {});
  }

  getLoans(query?: M.ListQueryDto, projectId?: string): Observable<Page<M.ProjectLoanDto>> {
    return this.http.get<Page<M.ProjectLoanDto>>(API.finance.getLoans(query, projectId));
  }

  saveLoan(request: M.ProjectLoanDto): Observable<Api<M.ProjectLoanDto>> {
    return this.http.post<Api<M.ProjectLoanDto>>(API.finance.saveLoan, request);
  }

  recordDrawdown(id: string, request: M.LoanDrawdownDto): Observable<Api<M.LoanDrawdownDto>> {
    return this.http.post<Api<M.LoanDrawdownDto>>(API.finance.recordDrawdown(id), request);
  }

  getGuarantees(projectId?: string, expiringOnly?: boolean): Observable<Api<M.BankGuaranteeDto[]>> {
    return this.http.get<Api<M.BankGuaranteeDto[]>>(API.finance.getGuarantees(projectId, expiringOnly));
  }

  saveGuarantee(request: M.BankGuaranteeDto): Observable<Api<M.BankGuaranteeDto>> {
    return this.http.post<Api<M.BankGuaranteeDto>>(API.finance.saveGuarantee, request);
  }

  getMortgages(query?: M.ListQueryDto, status?: string): Observable<Page<M.CustomerMortgageDto>> {
    return this.http.get<Page<M.CustomerMortgageDto>>(API.finance.getMortgages(query, status));
  }

  saveMortgage(request: M.CustomerMortgageDto): Observable<Api<M.CustomerMortgageDto>> {
    return this.http.post<Api<M.CustomerMortgageDto>>(API.finance.saveMortgage, request);
  }

  recordDisbursement(id: string, request: M.MortgageDisbursementDto): Observable<Api<M.MortgageDisbursementDto>> {
    return this.http.post<Api<M.MortgageDisbursementDto>>(API.finance.recordDisbursement(id), request);
  }

  saveRecognitionPolicy(request: M.RecognitionPolicyDto): Observable<Api<M.RecognitionPolicyDto>> {
    return this.http.post<Api<M.RecognitionPolicyDto>>(API.finance.saveRecognitionPolicy, request);
  }

  /**
   * Recognises revenue for a period. Runs as a dry run by default — a period close nobody can
   * review before committing is a period close that gets committed wrong.
   */
  runRecognition(projectId?: string, periodFrom?: string, periodTo?: string, dryRun?: boolean): Observable<Api<M.RevenueRecognitionRunDto>> {
    return this.http.post<Api<M.RevenueRecognitionRunDto>>(API.finance.runRecognition(projectId, periodFrom, periodTo, dryRun), {});
  }

  getRecognitionRuns(query?: M.ListQueryDto): Observable<Page<M.RevenueRecognitionRunDto>> {
    return this.http.get<Page<M.RevenueRecognitionRunDto>>(API.finance.getRecognitionRuns(query));
  }

  getWip(projectId: string, query?: M.ListQueryDto): Observable<Page<M.WipEntryDto>> {
    return this.http.get<Page<M.WipEntryDto>>(API.finance.getWip(projectId, query));
  }

  getUnitProfitability(projectId: string, query?: M.ListQueryDto): Observable<Api<M.UnitProfitabilityDto[]>> {
    return this.http.get<Api<M.UnitProfitabilityDto[]>>(API.finance.getUnitProfitability(projectId, query));
  }

  /**
   * Spreads incurred cost across the saleable units on whichever basis each cost category is
   * configured for, and records which basis it used.
   */
  allocateCosts(projectId: string, asOf?: string): Observable<Api<number>> {
    return this.http.post<Api<number>>(API.finance.allocateCosts(projectId, asOf), {});
  }

  getProjectPnl(projectId: string, asOf?: string): Observable<Api<M.ProjectPnlDto>> {
    return this.http.get<Api<M.ProjectPnlDto>>(API.finance.getProjectPnl(projectId, asOf));
  }

  getTaxProfiles(projectId?: string): Observable<Api<M.TaxProfileDto[]>> {
    return this.http.get<Api<M.TaxProfileDto[]>>(API.finance.getTaxProfiles(projectId));
  }

  saveTaxProfile(request: M.TaxProfileDto): Observable<Api<M.TaxProfileDto>> {
    return this.http.post<Api<M.TaxProfileDto>>(API.finance.saveTaxProfile, request);
  }

  getWithholding(query?: M.ListQueryDto, kind?: E.WithholdingKind, undepositedOnly?: boolean): Observable<Page<M.WithholdingRecordDto>> {
    return this.http.get<Page<M.WithholdingRecordDto>>(API.finance.getWithholding(query, kind, undepositedOnly));
  }

  getApprovalRecords(query?: M.ListQueryDto, projectId?: string, state?: E.ApprovalState): Observable<Page<M.ApprovalRecordDto>> {
    return this.http.get<Page<M.ApprovalRecordDto>>(API.finance.getApprovalRecords(query, projectId, state));
  }

  saveApprovalRecord(request: M.ApprovalRecordDto): Observable<Api<M.ApprovalRecordDto>> {
    return this.http.post<Api<M.ApprovalRecordDto>>(API.finance.saveApprovalRecord, request);
  }

  getLicences(expiringOnly?: boolean): Observable<Api<M.LicenceRecordDto[]>> {
    return this.http.get<Api<M.LicenceRecordDto[]>>(API.finance.getLicences(expiringOnly));
  }

  saveLicence(request: M.LicenceRecordDto): Observable<Api<M.LicenceRecordDto>> {
    return this.http.post<Api<M.LicenceRecordDto>>(API.finance.saveLicence, request);
  }

  /**
   * Every dated obligation on one calendar with one owner. Anything already overdue is included
   * whatever window was asked for — a missed deadline does not stop mattering.
   */
  getCalendar(from?: string, to?: string, category?: string): Observable<Api<M.ComplianceCalendarEntryDto[]>> {
    return this.http.get<Api<M.ComplianceCalendarEntryDto[]>>(API.finance.getCalendar(from, to, category));
  }

  completeCalendarEntry(id: string, evidenceUrl?: string): Observable<Api<M.ComplianceCalendarEntryDto>> {
    return this.http.post<Api<M.ComplianceCalendarEntryDto>>(API.finance.completeCalendarEntry(id, evidenceUrl), {});
  }

  getFilings(query?: M.ListQueryDto, status?: string): Observable<Page<M.RegulatoryFilingDto>> {
    return this.http.get<Page<M.RegulatoryFilingDto>>(API.finance.getFilings(query, status));
  }

  /**
   * Builds the quarterly return from the ledgers rather than from a spreadsheet, so the sales,
   * collections, escrow movement and physical progress all tie to the same records.
   */
  generateQpr(projectId?: string, year?: number, quarter?: number): Observable<Api<M.QuarterlyProgressReportDto>> {
    return this.http.post<Api<M.QuarterlyProgressReportDto>>(API.finance.generateQpr(projectId, year, quarter), {});
  }

  fileQpr(id: string, acknowledgementNumber?: string): Observable<Api<M.QuarterlyProgressReportDto>> {
    return this.http.post<Api<M.QuarterlyProgressReportDto>>(API.finance.fileQpr(id, acknowledgementNumber), {});
  }

  getQpr(id: string): Observable<Api<M.QuarterlyProgressReportDto>> {
    return this.http.get<Api<M.QuarterlyProgressReportDto>>(API.finance.getQpr(id));
  }

  getTemplates(documentType?: string, projectId?: string): Observable<Api<M.DocumentTemplateDto[]>> {
    return this.http.get<Api<M.DocumentTemplateDto[]>>(API.finance.getTemplates(documentType, projectId));
  }

  saveTemplate(request: M.DocumentTemplateDto): Observable<Api<M.DocumentTemplateDto>> {
    return this.http.post<Api<M.DocumentTemplateDto>>(API.finance.saveTemplate, request);
  }

  /**
   * Publishes a new version and closes the previous one the day before. Every document ever
   * generated can then be traced to exactly one version of exactly one template.
   */
  publishVersion(id: string, request: M.TemplateVersionDto): Observable<Api<M.TemplateVersionDto>> {
    return this.http.post<Api<M.TemplateVersionDto>>(API.finance.publishVersion(id), request);
  }

  getClauses(category?: string, projectId?: string): Observable<Api<M.ClauseLibraryItemDto[]>> {
    return this.http.get<Api<M.ClauseLibraryItemDto[]>>(API.finance.getClauses(category, projectId));
  }

  saveClause(request: M.ClauseLibraryItemDto): Observable<Api<M.ClauseLibraryItemDto>> {
    return this.http.post<Api<M.ClauseLibraryItemDto>>(API.finance.saveClause, request);
  }

  generateDocument(request: M.DocumentGenerationRequestDto): Observable<Api<M.GeneratedDocumentDto>> {
    return this.http.post<Api<M.GeneratedDocumentDto>>(API.finance.generateDocument, request);
  }

  getDocuments(query?: M.ListQueryDto, documentType?: string, entityId?: string): Observable<Page<M.GeneratedDocumentDto>> {
    return this.http.get<Page<M.GeneratedDocumentDto>>(API.finance.getDocuments(query, documentType, entityId));
  }

  /** Checks a printed document against what was actually issued from this office. */
  verifyDocument(code: string): Observable<Api<M.GeneratedDocumentDto>> {
    return this.http.get<Api<M.GeneratedDocumentDto>>(API.finance.verifyDocument(code));
  }

  startSigning(id: string, parties: M.SignaturePartyDto[], method?: E.SignatureMethod, sequential?: boolean): Observable<Api<M.SignatureSessionDto>> {
    return this.http.post<Api<M.SignatureSessionDto>>(API.finance.startSigning(id, method, sequential), parties);
  }

  recordSignature(sessionId: string, partyId?: string, signatureUrl?: string, thumbUrl?: string, photoUrl?: string): Observable<Api<M.SignatureSessionDto>> {
    return this.http.post<Api<M.SignatureSessionDto>>(API.finance.recordSignature(sessionId, partyId, signatureUrl, thumbUrl, photoUrl), {});
  }

  getSigning(id: string): Observable<Api<M.SignatureSessionDto>> {
    return this.http.get<Api<M.SignatureSessionDto>>(API.finance.getSigning(id));
  }

  getPhysicalFiles(query?: M.ListQueryDto, state?: E.PhysicalFileState): Observable<Page<M.PhysicalFileDto>> {
    return this.http.get<Page<M.PhysicalFileDto>>(API.finance.getPhysicalFiles(query, state));
  }

  savePhysicalFile(request: M.PhysicalFileDto): Observable<Api<M.PhysicalFileDto>> {
    return this.http.post<Api<M.PhysicalFileDto>>(API.finance.savePhysicalFile, request);
  }

  /** Signs an original title file in or out. The chain of custody is the whole point. */
  movePhysicalFile(id: string, movement?: string, toUserId?: string, toName?: string, purpose?: string, dueBack?: string): Observable<Api<M.PhysicalFileDto>> {
    return this.http.post<Api<M.PhysicalFileDto>>(API.finance.movePhysicalFile(id, movement, toUserId, toName, purpose, dueBack), {});
  }

  getLegalCases(query?: M.ListQueryDto, status?: E.LegalCaseStatus): Observable<Page<M.LegalCaseDto>> {
    return this.http.get<Page<M.LegalCaseDto>>(API.finance.getLegalCases(query, status));
  }

  getLegalCase(id: string): Observable<Api<M.LegalCaseDto>> {
    return this.http.get<Api<M.LegalCaseDto>>(API.finance.getLegalCase(id));
  }

  saveLegalCase(request: M.LegalCaseDto): Observable<Api<M.LegalCaseDto>> {
    return this.http.post<Api<M.LegalCaseDto>>(API.finance.saveLegalCase, request);
  }

  recordHearing(id: string, request: M.LegalHearingDto): Observable<Api<M.LegalHearingDto>> {
    return this.http.post<Api<M.LegalHearingDto>>(API.finance.recordHearing(id), request);
  }

}

// ── Inventory ───────────────────────────────────────────────────

/** The inventory board, holds, blocks, price lists and cost sheets. */
@Injectable({ providedIn: 'root' })
export class InventoryService {
  private http = inject(HttpClient);

  getBoard(query: M.InventoryQueryDto): Observable<Api<M.InventoryBoardDto>> {
    return this.http.post<Api<M.InventoryBoardDto>>(API.inventory.getBoard, query);
  }

  getUnit(unitId: string): Observable<Api<M.InventoryUnitDto>> {
    return this.http.get<Api<M.InventoryUnitDto>>(API.inventory.getUnit(unitId));
  }

  saveUnit(request: M.InventoryUnitDto): Observable<Api<M.InventoryUnitDto>> {
    return this.http.post<Api<M.InventoryUnitDto>>(API.inventory.saveUnit, request);
  }

  /**
   * Takes a unit off the board for a named person for a fixed time. Anything longer than the
   * configured limit needs an approval, because an indefinite hold is inventory removed from
   * sale by somebody with no authority to remove it.
   */
  hold(request: M.HoldRequestDto): Observable<Api<M.UnitHoldDto>> {
    return this.http.post<Api<M.UnitHoldDto>>(API.inventory.hold, request);
  }

  releaseHold(holdId: string, note?: string): Observable<Api<void>> {
    return this.http.post<Api<void>>(API.inventory.releaseHold(holdId, note), {});
  }

  getActiveHolds(projectId?: string): Observable<Api<M.UnitHoldDto[]>> {
    return this.http.get<Api<M.UnitHoldDto[]>>(API.inventory.getActiveHolds(projectId));
  }

  /** Sweeps up holds whose time has run out. Safe to run repeatedly. */
  expireHolds(): Observable<Api<number>> {
    return this.http.post<Api<number>>(API.inventory.expireHolds, {});
  }

  block(request: M.BlockRequestDto): Observable<Api<M.InventoryUnitDto>> {
    return this.http.post<Api<M.InventoryUnitDto>>(API.inventory.block, request);
  }

  unblock(unitId: string, note?: string): Observable<Api<M.InventoryUnitDto>> {
    return this.http.post<Api<M.InventoryUnitDto>>(API.inventory.unblock(unitId, note), {});
  }

  getPriceLists(projectId?: string): Observable<Api<M.PriceListDto[]>> {
    return this.http.get<Api<M.PriceListDto[]>>(API.inventory.getPriceLists(projectId));
  }

  getPriceList(id: string): Observable<Api<M.PriceListDto>> {
    return this.http.get<Api<M.PriceListDto>>(API.inventory.getPriceList(id));
  }

  savePriceList(request: M.PriceListDto): Observable<Api<M.PriceListDto>> {
    return this.http.post<Api<M.PriceListDto>>(API.inventory.savePriceList, request);
  }

  /** Puts a price list into force. Published lists are never edited afterwards. */
  publishPriceList(id: string): Observable<Api<M.PriceListDto>> {
    return this.http.post<Api<M.PriceListDto>>(API.inventory.publishPriceList(id), {});
  }

  /**
   * Applies a published list to everything still available. Sold and booked units keep the price
   * they were sold at — re-pricing must never rewrite a signed cost sheet.
   */
  reprice(id: string): Observable<Api<number>> {
    return this.http.post<Api<number>>(API.inventory.reprice(id), {});
  }

  getPremiums(projectId?: string): Observable<Api<M.PremiumChargeDto[]>> {
    return this.http.get<Api<M.PremiumChargeDto[]>>(API.inventory.getPremiums(projectId));
  }

  savePremium(request: M.PremiumChargeDto): Observable<Api<M.PremiumChargeDto>> {
    return this.http.post<Api<M.PremiumChargeDto>>(API.inventory.savePremium, request);
  }

  /**
   * The cost sheet a customer is shown: base price, every premium, every charge, tax, and the
   * instalment schedule that follows from it.
   */
  getCostSheet(unitId: string, paymentPlanTemplateId?: string, discountAmount?: number, discountPercent?: number): Observable<Api<M.CostSheetDto>> {
    return this.http.get<Api<M.CostSheetDto>>(API.inventory.getCostSheet(unitId, paymentPlanTemplateId, discountAmount, discountPercent));
  }

}

// ── Leasing ─────────────────────────────────────────────────────

/** Tenancies, deposits, renewals, rent, service charge and client money. */
@Injectable({ providedIn: 'root' })
export class LeasingService {
  private http = inject(HttpClient);

  searchTenancies(query: M.TenancySearchDto): Observable<Page<M.TenancyListItemDto>> {
    return this.http.post<Page<M.TenancyListItemDto>>(API.leasing.searchTenancies, query);
  }

  getTenancy(id: string): Observable<Api<M.TenancyDetailDto>> {
    return this.http.get<Api<M.TenancyDetailDto>>(API.leasing.getTenancy(id));
  }

  createTenancy(request: M.TenancyCreateDto): Observable<Api<M.TenancyDetailDto>> {
    return this.http.post<Api<M.TenancyDetailDto>>(API.leasing.createTenancy, request);
  }

  updateTenancy(id: string, request: M.TenancyCreateDto): Observable<Api<M.TenancyDetailDto>> {
    return this.http.put<Api<M.TenancyDetailDto>>(API.leasing.updateTenancy(id), request);
  }

  changeStatus(id: string, status?: E.TenancyStatus): Observable<Api<M.TenancyDetailDto>> {
    return this.http.post<Api<M.TenancyDetailDto>>(API.leasing.changeStatus(id, status), {});
  }

  /** Rebuilds the rent schedule from the tenancy's terms. Charges already raised stand. */
  regenerateSchedule(id: string): Observable<Api<M.RentChargeDto[]>> {
    return this.http.post<Api<M.RentChargeDto[]>>(API.leasing.regenerateSchedule(id), {});
  }

  saveReferencing(request: M.ReferencingCaseDto): Observable<Api<M.ReferencingCaseDto>> {
    return this.http.post<Api<M.ReferencingCaseDto>>(API.leasing.saveReferencing, request);
  }

  decideReferencing(id: string, outcome?: E.ReferencingOutcome, conditions?: string, failureReason?: string): Observable<Api<M.ReferencingCaseDto>> {
    return this.http.post<Api<M.ReferencingCaseDto>>(API.leasing.decideReferencing(id, outcome, conditions, failureReason), {});
  }

  saveDeposit(request: M.SecurityDepositDto): Observable<Api<M.SecurityDepositDto>> {
    return this.http.post<Api<M.SecurityDepositDto>>(API.leasing.saveDeposit, request);
  }

  /**
   * Records protection in a statutory scheme. There is usually a hard deadline from the day the
   * money was taken, and missing it costs a multiple of the deposit.
   */
  registerDeposit(id: string, schemeName?: string, reference?: string, registeredOn?: string): Observable<Api<M.SecurityDepositDto>> {
    return this.http.post<Api<M.SecurityDepositDto>>(API.leasing.registerDeposit(id, schemeName, reference, registeredOn), {});
  }

  proposeDeductions(id: string, deductions: M.DepositDeductionDto[]): Observable<Api<M.SecurityDepositDto>> {
    return this.http.post<Api<M.SecurityDepositDto>>(API.leasing.proposeDeductions(id), deductions);
  }

  releaseDeposit(id: string, toTenant?: number, toLandlord?: number): Observable<Api<M.SecurityDepositDto>> {
    return this.http.post<Api<M.SecurityDepositDto>>(API.leasing.releaseDeposit(id, toTenant, toLandlord), {});
  }

  getDeposits(query?: M.ListQueryDto, unregisteredOnly?: boolean): Observable<Page<M.SecurityDepositDto>> {
    return this.http.get<Page<M.SecurityDepositDto>>(API.leasing.getDeposits(query, unregisteredOnly));
  }

  saveInspection(request: M.MoveInspectionDto): Observable<Api<M.MoveInspectionDto>> {
    return this.http.post<Api<M.MoveInspectionDto>>(API.leasing.saveInspection, request);
  }

  getInspection(id: string): Observable<Api<M.MoveInspectionDto>> {
    return this.http.get<Api<M.MoveInspectionDto>>(API.leasing.getInspection(id));
  }

  getInspections(query?: M.ListQueryDto, kind?: E.InspectionKind): Observable<Page<M.MoveInspectionDto>> {
    return this.http.get<Page<M.MoveInspectionDto>>(API.leasing.getInspections(query, kind));
  }

  serveNotice(request: M.TenancyNoticeDto): Observable<Api<M.TenancyNoticeDto>> {
    return this.http.post<Api<M.TenancyNoticeDto>>(API.leasing.serveNotice, request);
  }

  offerRenewal(request: M.TenancyRenewalDto): Observable<Api<M.TenancyRenewalDto>> {
    return this.http.post<Api<M.TenancyRenewalDto>>(API.leasing.offerRenewal, request);
  }

  decideRenewal(id: string, status?: string, agreedRent?: number, declineReasonCodeId?: string): Observable<Api<M.TenancyRenewalDto>> {
    return this.http.post<Api<M.TenancyRenewalDto>>(API.leasing.decideRenewal(id, status, agreedRent, declineReasonCodeId), {});
  }

  getRenewalPipeline(query?: M.ListQueryDto, withinDays?: number): Observable<Page<M.TenancyRenewalDto>> {
    return this.http.get<Page<M.TenancyRenewalDto>>(API.leasing.getRenewalPipeline(query, withinDays));
  }

  saveRentReview(request: M.RentReviewDto): Observable<Api<M.RentReviewDto>> {
    return this.http.post<Api<M.RentReviewDto>>(API.leasing.saveRentReview, request);
  }

  /**
   * Lease dates that cannot be missed: break notices, option windows, review triggers. Missing
   * one of these does not produce a warning, it produces a lease that runs another five years.
   */
  getCriticalDates(propertyId?: string, withinDays?: number): Observable<Api<M.CriticalDateDto[]>> {
    return this.http.get<Api<M.CriticalDateDto[]>>(API.leasing.getCriticalDates(propertyId, withinDays));
  }

  actionCriticalDate(id: string, note?: string): Observable<Api<M.CriticalDateDto>> {
    return this.http.post<Api<M.CriticalDateDto>>(API.leasing.actionCriticalDate(id, note), {});
  }

  getCertificates(query?: M.ListQueryDto, expiringOnly?: boolean): Observable<Page<M.ComplianceCertificateDto>> {
    return this.http.get<Page<M.ComplianceCertificateDto>>(API.leasing.getCertificates(query, expiringOnly));
  }

  saveCertificate(request: M.ComplianceCertificateDto): Observable<Api<M.ComplianceCertificateDto>> {
    return this.http.post<Api<M.ComplianceCertificateDto>>(API.leasing.saveCertificate, request);
  }

  getRentRoll(propertyId?: string, projectId?: string, asOf?: string): Observable<Api<M.RentRollDto>> {
    return this.http.get<Api<M.RentRollDto>>(API.leasing.getRentRoll(propertyId, projectId, asOf));
  }

  runRent(request: M.RentRunRequestDto): Observable<Api<M.RentRunDto>> {
    return this.http.post<Api<M.RentRunDto>>(API.leasing.runRent, request);
  }

  getRentRuns(query?: M.ListQueryDto): Observable<Page<M.RentRunDto>> {
    return this.http.get<Page<M.RentRunDto>>(API.leasing.getRentRuns(query));
  }

  getArrears(query?: M.ListQueryDto, minDays?: number): Observable<Page<M.ArrearsCaseDto>> {
    return this.http.get<Page<M.ArrearsCaseDto>>(API.leasing.getArrears(query, minDays));
  }

  getVoids(propertyId?: string, openOnly?: boolean): Observable<Api<M.VoidRecordDto[]>> {
    return this.http.get<Api<M.VoidRecordDto[]>>(API.leasing.getVoids(propertyId, openOnly));
  }

  /** The trade mix in a centre, which is what a retail asset manager actually manages. */
  getTenantMix(propertyId: string): Observable<Api<M.TenantCategoryDto[]>> {
    return this.http.get<Api<M.TenantCategoryDto[]>>(API.leasing.getTenantMix(propertyId));
  }

  getBudgets(query?: M.ListQueryDto, propertyId?: string): Observable<Page<M.ServiceChargeBudgetDto>> {
    return this.http.get<Page<M.ServiceChargeBudgetDto>>(API.leasing.getBudgets(query, propertyId));
  }

  getBudget(id: string): Observable<Api<M.ServiceChargeBudgetDto>> {
    return this.http.get<Api<M.ServiceChargeBudgetDto>>(API.leasing.getBudget(id));
  }

  saveBudget(request: M.ServiceChargeBudgetDto): Observable<Api<M.ServiceChargeBudgetDto>> {
    return this.http.post<Api<M.ServiceChargeBudgetDto>>(API.leasing.saveBudget, request);
  }

  approveBudget(id: string): Observable<Api<M.ServiceChargeBudgetDto>> {
    return this.http.post<Api<M.ServiceChargeBudgetDto>>(API.leasing.approveBudget(id), {});
  }

  raiseOnAccount(id: string, periodFrom?: string, periodTo?: string, dryRun?: boolean): Observable<Api<M.ServiceChargeInvoiceDto[]>> {
    return this.http.post<Api<M.ServiceChargeInvoiceDto[]>>(API.leasing.raiseOnAccount(id, periodFrom, periodTo, dryRun), {});
  }

  /**
   * The year-end reconciliation, applying exclusions, then gross-up, then caps — in that order,
   * because that is the order the lease reads and any other order gives a different answer.
   */
  reconcile(id: string, dryRun?: boolean): Observable<Api<M.ServiceChargeReconciliationDto>> {
    return this.http.post<Api<M.ServiceChargeReconciliationDto>>(API.leasing.reconcile(id, dryRun), {});
  }

  finaliseReconciliation(id: string): Observable<Api<M.ServiceChargeReconciliationDto>> {
    return this.http.post<Api<M.ServiceChargeReconciliationDto>>(API.leasing.finaliseReconciliation(id), {});
  }

  getApportionments(propertyId: string): Observable<Api<M.ApportionmentScheduleDto[]>> {
    return this.http.get<Api<M.ApportionmentScheduleDto[]>>(API.leasing.getApportionments(propertyId));
  }

  saveApportionment(request: M.ApportionmentScheduleDto): Observable<Api<M.ApportionmentScheduleDto>> {
    return this.http.post<Api<M.ApportionmentScheduleDto>>(API.leasing.saveApportionment, request);
  }

  saveTurnoverTerm(request: M.TurnoverRentTermDto): Observable<Api<M.TurnoverRentTermDto>> {
    return this.http.post<Api<M.TurnoverRentTermDto>>(API.leasing.saveTurnoverTerm, request);
  }

  saveSalesDeclaration(request: M.TenantSalesDeclarationDto): Observable<Api<M.TenantSalesDeclarationDto>> {
    return this.http.post<Api<M.TenantSalesDeclarationDto>>(API.leasing.saveSalesDeclaration, request);
  }

  getSalesDeclarations(query?: M.ListQueryDto, propertyId?: string, overdueOnly?: boolean): Observable<Page<M.TenantSalesDeclarationDto>> {
    return this.http.get<Page<M.TenantSalesDeclarationDto>>(API.leasing.getSalesDeclarations(query, propertyId, overdueOnly));
  }

  calculateOverage(propertyId?: string, periodFrom?: string, periodTo?: string, dryRun?: boolean): Observable<Api<M.OverageInvoiceDto[]>> {
    return this.http.post<Api<M.OverageInvoiceDto[]>>(API.leasing.calculateOverage(propertyId, periodFrom, periodTo, dryRun), {});
  }

  getLandlords(query?: M.ListQueryDto): Observable<Page<M.LandlordListItemDto>> {
    return this.http.get<Page<M.LandlordListItemDto>>(API.leasing.getLandlords(query));
  }

  getLandlord(id: string): Observable<Api<M.LandlordDetailDto>> {
    return this.http.get<Api<M.LandlordDetailDto>>(API.leasing.getLandlord(id));
  }

  saveLandlord(request: M.LandlordDetailDto): Observable<Api<M.LandlordDetailDto>> {
    return this.http.post<Api<M.LandlordDetailDto>>(API.leasing.saveLandlord, request);
  }

  saveAgreement(id: string, request: M.ManagementAgreementDto): Observable<Api<M.ManagementAgreementDto>> {
    return this.http.post<Api<M.ManagementAgreementDto>>(API.leasing.saveAgreement(id), request);
  }

  generateStatement(id: string, from?: string, to?: string, propertyId?: string): Observable<Api<M.OwnerStatementDto>> {
    return this.http.post<Api<M.OwnerStatementDto>>(API.leasing.generateStatement(id, from, to, propertyId), {});
  }

  getStatements(query?: M.ListQueryDto, landlordId?: string): Observable<Page<M.OwnerStatementDto>> {
    return this.http.get<Page<M.OwnerStatementDto>>(API.leasing.getStatements(query, landlordId));
  }

  createPayoutRun(payoutDate?: string, officeId?: string, clientAccountId?: string, dryRun?: boolean): Observable<Api<M.OwnerPayoutDto>> {
    return this.http.post<Api<M.OwnerPayoutDto>>(API.leasing.createPayoutRun(payoutDate, officeId, clientAccountId, dryRun), {});
  }

  submitPayoutRun(id: string): Observable<Api<M.OwnerPayoutDto>> {
    return this.http.post<Api<M.OwnerPayoutDto>>(API.leasing.submitPayoutRun(id), {});
  }

  getPayoutRuns(query?: M.ListQueryDto): Observable<Page<M.OwnerPayoutDto>> {
    return this.http.get<Page<M.OwnerPayoutDto>>(API.leasing.getPayoutRuns(query));
  }

  getClientAccounts(): Observable<Api<M.ClientAccountDto[]>> {
    return this.http.get<Api<M.ClientAccountDto[]>>(API.leasing.getClientAccounts);
  }

  saveClientAccount(request: M.ClientAccountDto): Observable<Api<M.ClientAccountDto>> {
    return this.http.post<Api<M.ClientAccountDto>>(API.leasing.saveClientAccount, request);
  }

  getClientLedger(id: string, query?: M.ListQueryDto): Observable<Page<M.ClientLedgerEntryDto>> {
    return this.http.get<Page<M.ClientLedgerEntryDto>>(API.leasing.getClientLedger(id, query));
  }

  /** Bank, ledger control and the sum of client balances, reconciled three ways. */
  reconcileClientMoney(id: string, asOf?: string, bankBalance?: number): Observable<Api<M.ClientMoneyReconciliationDto>> {
    return this.http.post<Api<M.ClientMoneyReconciliationDto>>(API.leasing.reconcileClientMoney(id, asOf, bankBalance), {});
  }

  signOff(id: string): Observable<Api<M.ClientMoneyReconciliationDto>> {
    return this.http.post<Api<M.ClientMoneyReconciliationDto>>(API.leasing.signOff(id), {});
  }

  getExceptions(query?: M.ListQueryDto, openOnly?: boolean): Observable<Page<M.ClientMoneyExceptionDto>> {
    return this.http.get<Page<M.ClientMoneyExceptionDto>>(API.leasing.getExceptions(query, openOnly));
  }

  getOwnerPortal(landlordId: string): Observable<Api<M.OwnerPortalHomeDto>> {
    return this.http.get<Api<M.OwnerPortalHomeDto>>(API.leasing.getOwnerPortal(landlordId));
  }

  getTenantPortal(partyId: string): Observable<Api<M.TenantPortalHomeDto>> {
    return this.http.get<Api<M.TenantPortalHomeDto>>(API.leasing.getTenantPortal(partyId));
  }

}

// ── Listing ─────────────────────────────────────────────────────

/** Listings, instructions, portal syndication and marketing. */
@Injectable({ providedIn: 'root' })
export class ListingService {
  private http = inject(HttpClient);

  search(query: M.ListingSearchDto): Observable<Page<M.ListingListItemDto>> {
    return this.http.post<Page<M.ListingListItemDto>>(API.listing.search, query);
  }

  get(id: string): Observable<Api<M.ListingDetailDto>> {
    return this.http.get<Api<M.ListingDetailDto>>(API.listing.get(id));
  }

  save(request: M.ListingUpsertDto): Observable<Api<M.ListingDetailDto>> {
    return this.http.post<Api<M.ListingDetailDto>>(API.listing.save, request);
  }

  changeStatus(id: string, status?: E.ListingStatus, reasonCodeId?: string): Observable<Api<M.ListingDetailDto>> {
    return this.http.post<Api<M.ListingDetailDto>>(API.listing.changeStatus(id, status, reasonCodeId), {});
  }

  /** Changes the asking price and records what it was, so the history reads honestly. */
  changePrice(request: M.ListingPriceChangeDto): Observable<Api<M.ListingDetailDto>> {
    return this.http.post<Api<M.ListingDetailDto>>(API.listing.changePrice, request);
  }

  /** What is still missing before this listing can go out to the portals. */
  checkReadiness(id: string): Observable<Api<M.GateResultDto>> {
    return this.http.get<Api<M.GateResultDto>>(API.listing.checkReadiness(id));
  }

  getInstructions(query?: M.ListQueryDto): Observable<Page<M.InstructionDto>> {
    return this.http.get<Page<M.InstructionDto>>(API.listing.getInstructions(query));
  }

  getInstruction(id: string): Observable<Api<M.InstructionDto>> {
    return this.http.get<Api<M.InstructionDto>>(API.listing.getInstruction(id));
  }

  saveInstruction(request: M.InstructionUpsertDto): Observable<Api<M.InstructionDto>> {
    return this.http.post<Api<M.InstructionDto>>(API.listing.saveInstruction, request);
  }

  terminateInstruction(id: string, reasonCodeId?: string, note?: string): Observable<Api<M.InstructionDto>> {
    return this.http.post<Api<M.InstructionDto>>(API.listing.terminateInstruction(id, reasonCodeId, note), {});
  }

  getPortals(): Observable<Api<M.PortalChannelDto[]>> {
    return this.http.get<Api<M.PortalChannelDto[]>>(API.listing.getPortals);
  }

  savePortal(request: M.PortalChannelDto): Observable<Api<M.PortalChannelDto>> {
    return this.http.post<Api<M.PortalChannelDto>>(API.listing.savePortal, request);
  }

  getMappings(portalId: string): Observable<Api<M.PortalMappingDto[]>> {
    return this.http.get<Api<M.PortalMappingDto[]>>(API.listing.getMappings(portalId));
  }

  saveMapping(request: M.PortalMappingDto): Observable<Api<M.PortalMappingDto>> {
    return this.http.post<Api<M.PortalMappingDto>>(API.listing.saveMapping, request);
  }

  publish(request: M.PortalPublishRequestDto): Observable<Api<M.PortalPublishResultDto>> {
    return this.http.post<Api<M.PortalPublishResultDto>>(API.listing.publish, request);
  }

  getPublications(query?: M.ListQueryDto, portalId?: string, state?: E.PortalPublishState): Observable<Page<M.PortalPublicationDto>> {
    return this.http.get<Page<M.PortalPublicationDto>>(API.listing.getPublications(query, portalId, state));
  }

  getCampaigns(query?: M.ListQueryDto): Observable<Page<M.CampaignDto>> {
    return this.http.get<Page<M.CampaignDto>>(API.listing.getCampaigns(query));
  }

  saveCampaign(request: M.CampaignDto): Observable<Api<M.CampaignDto>> {
    return this.http.post<Api<M.CampaignDto>>(API.listing.saveCampaign, request);
  }

  getEvents(query?: M.ListQueryDto): Observable<Page<M.MarketingEventDto>> {
    return this.http.get<Page<M.MarketingEventDto>>(API.listing.getEvents(query));
  }

  saveEvent(request: M.MarketingEventDto): Observable<Api<M.MarketingEventDto>> {
    return this.http.post<Api<M.MarketingEventDto>>(API.listing.saveEvent, request);
  }

  getContent(query?: M.ListQueryDto): Observable<Page<M.ContentAssetDto>> {
    return this.http.get<Page<M.ContentAssetDto>>(API.listing.getContent(query));
  }

  saveContent(request: M.ContentAssetDto): Observable<Api<M.ContentAssetDto>> {
    return this.http.post<Api<M.ContentAssetDto>>(API.listing.saveContent, request);
  }

}

// ── Money ───────────────────────────────────────────────────────

/** Payment plans, demands, receipts, cheques, collections and dunning. */
@Injectable({ providedIn: 'root' })
export class MoneyService {
  private http = inject(HttpClient);

  getTemplates(projectId?: string, activeOnly?: boolean): Observable<Api<M.PaymentPlanTemplateDto[]>> {
    return this.http.get<Api<M.PaymentPlanTemplateDto[]>>(API.money.getTemplates(projectId, activeOnly));
  }

  getTemplate(id: string): Observable<Api<M.PaymentPlanTemplateDto>> {
    return this.http.get<Api<M.PaymentPlanTemplateDto>>(API.money.getTemplate(id));
  }

  saveTemplate(request: M.PaymentPlanTemplateDto): Observable<Api<M.PaymentPlanTemplateDto>> {
    return this.http.post<Api<M.PaymentPlanTemplateDto>>(API.money.saveTemplate, request);
  }

  /** The schedule a template would produce, dated and totalled, before anybody commits. */
  previewPlan(custom: M.PaymentPlanCustomDto, templateId?: string, totalConsideration?: number, startDate?: string, projectId?: string): Observable<Api<M.PaymentPlanPreviewDto>> {
    return this.http.post<Api<M.PaymentPlanPreviewDto>>(API.money.previewPlan(templateId, totalConsideration, startDate, projectId), custom);
  }

  getPlan(bookingId: string): Observable<Api<M.PaymentPlanDto>> {
    return this.http.get<Api<M.PaymentPlanDto>>(API.money.getPlan(bookingId));
  }

  /**
   * Rebuilds the remaining schedule. What has already been paid is never touched — a
   * restructure changes the future, not the history.
   */
  restructure(request: M.PlanRestructureDto): Observable<Api<M.PaymentPlanDto>> {
    return this.http.post<Api<M.PaymentPlanDto>>(API.money.restructure, request);
  }

  getSurchargePolicies(projectId?: string): Observable<Api<M.SurchargePolicyDto[]>> {
    return this.http.get<Api<M.SurchargePolicyDto[]>>(API.money.getSurchargePolicies(projectId));
  }

  saveSurchargePolicy(request: M.SurchargePolicyDto): Observable<Api<M.SurchargePolicyDto>> {
    return this.http.post<Api<M.SurchargePolicyDto>>(API.money.saveSurchargePolicy, request);
  }

  accrue(asOf?: string): Observable<Api<number>> {
    return this.http.post<Api<number>>(API.money.accrue(asOf), {});
  }

  requestWaiver(request: M.SurchargeWaiverRequestDto): Observable<Api<M.SurchargeWaiverDto>> {
    return this.http.post<Api<M.SurchargeWaiverDto>>(API.money.requestWaiver, request);
  }

  decideWaiver(id: string, outcome?: E.ApprovalOutcome, approvedAmount?: number, comment?: string): Observable<Api<M.SurchargeWaiverDto>> {
    return this.http.post<Api<M.SurchargeWaiverDto>>(API.money.decideWaiver(id, outcome, approvedAmount, comment), {});
  }

  getWaivers(query?: M.ListQueryDto, outcome?: E.ApprovalOutcome): Observable<Page<M.SurchargeWaiverDto>> {
    return this.http.get<Page<M.SurchargeWaiverDto>>(API.money.getWaivers(query, outcome));
  }

  runDemands(request: M.DemandRunRequestDto): Observable<Api<M.DemandBatchDto>> {
    return this.http.post<Api<M.DemandBatchDto>>(API.money.runDemands, request);
  }

  getBatches(query?: M.ListQueryDto): Observable<Page<M.DemandBatchDto>> {
    return this.http.get<Page<M.DemandBatchDto>>(API.money.getBatches(query));
  }

  getDemands(query?: M.ListQueryDto, bookingId?: string, status?: E.DemandStatus): Observable<Page<M.DemandListItemDto>> {
    return this.http.get<Page<M.DemandListItemDto>>(API.money.getDemands(query, bookingId, status));
  }

  getDemand(id: string): Observable<Api<M.DemandDetailDto>> {
    return this.http.get<Api<M.DemandDetailDto>>(API.money.getDemand(id));
  }

  sendDemand(id: string, channels: E.NotificationChannel[]): Observable<Api<M.DemandDetailDto>> {
    return this.http.post<Api<M.DemandDetailDto>>(API.money.sendDemand(id), channels);
  }

  cancelDemand(id: string, reasonCodeId?: string): Observable<Api<void>> {
    return this.http.post<Api<void>>(API.money.cancelDemand(id, reasonCodeId), {});
  }

  /** Where this money would land, line by line, before it is posted. */
  previewAllocation(request: M.ReceiptCreateDto): Observable<Api<M.AllocationPreviewDto>> {
    return this.http.post<Api<M.AllocationPreviewDto>>(API.money.previewAllocation, request);
  }

  createReceipt(request: M.ReceiptCreateDto): Observable<Api<M.ReceiptDetailDto>> {
    return this.http.post<Api<M.ReceiptDetailDto>>(API.money.createReceipt, request);
  }

  searchReceipts(query: M.ReceiptSearchDto): Observable<Page<M.ReceiptListItemDto>> {
    return this.http.post<Page<M.ReceiptListItemDto>>(API.money.searchReceipts, query);
  }

  getReceipt(id: string): Observable<Api<M.ReceiptDetailDto>> {
    return this.http.get<Api<M.ReceiptDetailDto>>(API.money.getReceipt(id));
  }

  reverseReceipt(id: string, reasonCodeId?: string, note?: string): Observable<Api<M.ReceiptDetailDto>> {
    return this.http.post<Api<M.ReceiptDetailDto>>(API.money.reverseReceipt(id, reasonCodeId, note), {});
  }

  reallocate(id: string, allocations: M.ManualAllocationDto[], reason?: string): Observable<Api<M.ReceiptDetailDto>> {
    return this.http.post<Api<M.ReceiptDetailDto>>(API.money.reallocate(id, reason), allocations);
  }

  getCheques(query?: M.ListQueryDto, state?: E.ChequeState): Observable<Page<M.ChequeRecordDto>> {
    return this.http.get<Page<M.ChequeRecordDto>>(API.money.getCheques(query, state));
  }

  changeChequeState(request: M.ChequeStateChangeDto): Observable<Api<M.ChequeRecordDto>> {
    return this.http.post<Api<M.ChequeRecordDto>>(API.money.changeChequeState, request);
  }

  /** Post-dated cheques by the day they fall due, so none is banked late or early. */
  getMaturity(from?: string, to?: string): Observable<Api<M.ChequeRecordDto[]>> {
    return this.http.get<Api<M.ChequeRecordDto[]>>(API.money.getMaturity(from, to));
  }

  getLedger(bookingId?: string, partyId?: string, query?: M.ListQueryDto): Observable<Page<M.CustomerLedgerEntryDto>> {
    return this.http.get<Page<M.CustomerLedgerEntryDto>>(API.money.getLedger(bookingId, partyId, query));
  }

  getStatement(bookingId: string, from?: string, to?: string): Observable<Api<M.StatementOfAccountDto>> {
    return this.http.get<Api<M.StatementOfAccountDto>>(API.money.getStatement(bookingId, from, to));
  }

  getWorklist(query: M.CollectionQueryDto): Observable<Api<M.CollectionWorklistDto>> {
    return this.http.post<Api<M.CollectionWorklistDto>>(API.money.getWorklist, query);
  }

  recordPromise(request: M.PromiseToPayCreateDto): Observable<Api<M.PromiseToPayDto>> {
    return this.http.post<Api<M.PromiseToPayDto>>(API.money.recordPromise, request);
  }

  getPromises(dueOn?: string, state?: E.PromiseState): Observable<Api<M.PromiseToPayDto[]>> {
    return this.http.get<Api<M.PromiseToPayDto[]>>(API.money.getPromises(dueOn, state));
  }

  /** Marks promises kept or broken by what actually arrived. */
  evaluatePromises(): Observable<Api<number>> {
    return this.http.post<Api<number>>(API.money.evaluatePromises, {});
  }

  getDunningPolicies(appliesTo?: string): Observable<Api<M.DunningPolicyDto[]>> {
    return this.http.get<Api<M.DunningPolicyDto[]>>(API.money.getDunningPolicies(appliesTo));
  }

  saveDunningPolicy(request: M.DunningPolicyDto): Observable<Api<M.DunningPolicyDto>> {
    return this.http.post<Api<M.DunningPolicyDto>>(API.money.saveDunningPolicy, request);
  }

  getDunningCases(query?: M.ListQueryDto, openOnly?: boolean): Observable<Page<M.DunningCaseDto>> {
    return this.http.get<Page<M.DunningCaseDto>>(API.money.getDunningCases(query, openOnly));
  }

  getDunningCase(id: string): Observable<Api<M.DunningCaseDto>> {
    return this.http.get<Api<M.DunningCaseDto>>(API.money.getDunningCase(id));
  }

  /**
   * Pauses the escalation ladder — usually because a promise has been made, or the customer is
   * in hospital. It needs a reason, because a suspended case is a case nobody is chasing.
   */
  suspendDunning(id: string, until?: string, reason?: string): Observable<Api<M.DunningCaseDto>> {
    return this.http.post<Api<M.DunningCaseDto>>(API.money.suspendDunning(id, until, reason), {});
  }

  runDunning(asOf?: string): Observable<Api<number>> {
    return this.http.post<Api<number>>(API.money.runDunning(asOf), {});
  }

  issueNotice(bookingId?: string, tenancyId?: string, noticeType?: string, complyBy?: string, templateId?: string): Observable<Api<M.LegalNoticeDto>> {
    return this.http.post<Api<M.LegalNoticeDto>>(API.money.issueNotice(bookingId, tenancyId, noticeType, complyBy, templateId), {});
  }

  /**
   * Records how and when a notice was served. Statutory periods run from service, not from
   * issue, so this date is the one that decides whether anything downstream is valid.
   */
  recordService(id: string, method?: string, reference?: string, evidenceUrl?: string, servedOn?: string): Observable<Api<M.LegalNoticeDto>> {
    return this.http.post<Api<M.LegalNoticeDto>>(API.money.recordService(id, method, reference, evidenceUrl, servedOn), {});
  }

  getNotices(query?: M.ListQueryDto): Observable<Page<M.LegalNoticeDto>> {
    return this.http.get<Page<M.LegalNoticeDto>>(API.money.getNotices(query));
  }

  requestWriteOff(request: M.WriteOffDto): Observable<Api<M.WriteOffDto>> {
    return this.http.post<Api<M.WriteOffDto>>(API.money.requestWriteOff, request);
  }

  decideWriteOff(id: string, outcome?: E.ApprovalOutcome, comment?: string): Observable<Api<M.WriteOffDto>> {
    return this.http.post<Api<M.WriteOffDto>>(API.money.decideWriteOff(id, outcome, comment), {});
  }

}

// ── Project ─────────────────────────────────────────────────────

/** Projects, their structure, milestones, budget and plot files. */
@Injectable({ providedIn: 'root' })
export class ProjectService {
  private http = inject(HttpClient);

  getAll(query?: M.ListQueryDto): Observable<Page<M.ProjectListItemDto>> {
    return this.http.get<Page<M.ProjectListItemDto>>(API.project.getAll(query));
  }

  lookup(): Observable<Api<M.LookupDto[]>> {
    return this.http.get<Api<M.LookupDto[]>>(API.project.lookup);
  }

  get(id: string): Observable<Api<M.ProjectDetailDto>> {
    return this.http.get<Api<M.ProjectDetailDto>>(API.project.get(id));
  }

  save(request: M.ProjectUpsertDto): Observable<Api<M.ProjectDetailDto>> {
    return this.http.post<Api<M.ProjectDetailDto>>(API.project.save, request);
  }

  getStructure(id: string): Observable<Api<M.ProjectNodeDto[]>> {
    return this.http.get<Api<M.ProjectNodeDto[]>>(API.project.getStructure(id));
  }

  saveNode(request: M.ProjectNodeUpsertDto): Observable<Api<M.ProjectNodeDto>> {
    return this.http.post<Api<M.ProjectNodeDto>>(API.project.saveNode, request);
  }

  deleteNode(nodeId: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(API.project.deleteNode(nodeId));
  }

  /**
   * Creates the units for a block or a floor range in one pass, numbered to the scheme's own
   * convention. Beats typing four hundred flats in by hand, and gets the numbering consistent.
   */
  generateUnits(request: M.UnitGenerationDto): Observable<Api<M.UnitGenerationResultDto>> {
    return this.http.post<Api<M.UnitGenerationResultDto>>(API.project.generateUnits, request);
  }

  getMilestones(id: string): Observable<Api<M.ProjectMilestoneDto[]>> {
    return this.http.get<Api<M.ProjectMilestoneDto[]>>(API.project.getMilestones(id));
  }

  saveMilestone(request: M.ProjectMilestoneDto): Observable<Api<M.ProjectMilestoneDto>> {
    return this.http.post<Api<M.ProjectMilestoneDto>>(API.project.saveMilestone, request);
  }

  /** Certifies a milestone and raises the demands that hang off it. */
  certifyMilestone(request: M.MilestoneCertificateDto): Observable<Api<M.MilestoneCertificateDto>> {
    return this.http.post<Api<M.MilestoneCertificateDto>>(API.project.certifyMilestone, request);
  }

  getBudget(id: string): Observable<Api<M.ProjectBudgetLineDto[]>> {
    return this.http.get<Api<M.ProjectBudgetLineDto[]>>(API.project.getBudget(id));
  }

  saveBudgetLine(id: string, request: M.ProjectBudgetLineDto): Observable<Api<M.ProjectBudgetLineDto>> {
    return this.http.post<Api<M.ProjectBudgetLineDto>>(API.project.saveBudgetLine(id), request);
  }

  getCashFlow(id: string, months?: number): Observable<Api<M.ProjectCashFlowDto>> {
    return this.http.get<Api<M.ProjectCashFlowDto>>(API.project.getCashFlow(id, months));
  }

  getSitePlans(id: string): Observable<Api<M.SitePlanDto[]>> {
    return this.http.get<Api<M.SitePlanDto[]>>(API.project.getSitePlans(id));
  }

  saveSitePlan(id: string, request: M.SitePlanDto): Observable<Api<M.SitePlanDto>> {
    return this.http.post<Api<M.SitePlanDto>>(API.project.saveSitePlan(id), request);
  }

  /** The clickable shapes on a site plan, so a plot can be sold off the map. */
  saveShapes(sitePlanId: string, shapes: M.SitePlanShapeDto[]): Observable<Api<M.SitePlanDto>> {
    return this.http.put<Api<M.SitePlanDto>>(API.project.saveShapes(sitePlanId), shapes);
  }

  getPlotFiles(id: string, query?: M.ListQueryDto): Observable<Page<M.PlotFileDto>> {
    return this.http.get<Page<M.PlotFileDto>>(API.project.getPlotFiles(id, query));
  }

  /**
   * Issues a run of files against a scheme before the plots themselves are balloted. This is how
   * a plot scheme sells: the file is the tradable thing, and the plot comes later.
   */
  issuePlotFiles(id: string, categoryCode?: string, count?: number, price?: number, areaSqFt?: number): Observable<Api<M.PlotFileDto[]>> {
    return this.http.post<Api<M.PlotFileDto[]>>(API.project.issuePlotFiles(id, categoryCode, count, price, areaSqFt), {});
  }

}

// ── Property ────────────────────────────────────────────────────

/** The property register, land parcels, title and acquisition. */
@Injectable({ providedIn: 'root' })
export class PropertyService {
  private http = inject(HttpClient);

  search(query: M.PropertySearchDto): Observable<Page<M.PropertyListItemDto>> {
    return this.http.post<Page<M.PropertyListItemDto>>(API.property.search, query);
  }

  get(id: string): Observable<Api<M.PropertyDetailDto>> {
    return this.http.get<Api<M.PropertyDetailDto>>(API.property.get(id));
  }

  save(request: M.PropertyUpsertDto): Observable<Api<M.PropertyDetailDto>> {
    return this.http.post<Api<M.PropertyDetailDto>>(API.property.save, request);
  }

  delete(id: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(API.property.delete(id));
  }

  /**
   * Looks for a property already on file that this one might be. Run before saving, because two
   * records for the same flat means two owners, two histories and an argument later.
   */
  checkDuplicates(request: M.PropertyUpsertDto): Observable<Api<M.DuplicateCandidateDto[]>> {
    return this.http.post<Api<M.DuplicateCandidateDto[]>>(API.property.checkDuplicates, request);
  }

  changeStatus(id: string, status?: E.PropertyStatus, reasonCodeId?: string, note?: string): Observable<Api<M.PropertyDetailDto>> {
    return this.http.post<Api<M.PropertyDetailDto>>(API.property.changeStatus(id, status, reasonCodeId, note), {});
  }

  saveMedia(id: string, media: M.PropertyMediaDto[]): Observable<Api<M.PropertyMediaDto[]>> {
    return this.http.put<Api<M.PropertyMediaDto[]>>(API.property.saveMedia(id), media);
  }

  deleteMedia(mediaId: string): Observable<Api<void>> {
    return this.http.delete<Api<void>>(API.property.deleteMedia(mediaId));
  }

  getDocuments(id: string): Observable<Api<M.PropertyDocumentDto[]>> {
    return this.http.get<Api<M.PropertyDocumentDto[]>>(API.property.getDocuments(id));
  }

  saveDocument(id: string, request: M.PropertyDocumentDto): Observable<Api<M.PropertyDocumentDto>> {
    return this.http.post<Api<M.PropertyDocumentDto>>(API.property.saveDocument(id), request);
  }

  getOwnership(id: string, includeHistory?: boolean): Observable<Api<M.PropertyOwnershipDto[]>> {
    return this.http.get<Api<M.PropertyOwnershipDto[]>>(API.property.getOwnership(id, includeHistory));
  }

  setOwner(id: string, request: M.PropertyOwnershipDto): Observable<Api<M.PropertyOwnershipDto>> {
    return this.http.post<Api<M.PropertyOwnershipDto>>(API.property.setOwner(id), request);
  }

  getValuations(id: string): Observable<Api<M.PropertyValuationDto[]>> {
    return this.http.get<Api<M.PropertyValuationDto[]>>(API.property.getValuations(id));
  }

  saveValuation(request: M.PropertyValuationDto): Observable<Api<M.PropertyValuationDto>> {
    return this.http.post<Api<M.PropertyValuationDto>>(API.property.saveValuation, request);
  }

  /**
   * A defensible asking price built from comparables, each weighted by how recent, how similar
   * and how close it is — with the workings returned so a vendor can be shown them.
   */
  getPriceOpinion(id: string, kind?: E.ListingKind): Observable<Api<M.PriceOpinionDto>> {
    return this.http.get<Api<M.PriceOpinionDto>>(API.property.getPriceOpinion(id, kind));
  }

  findComparables(id: string, take?: number): Observable<Api<M.PropertyComparableDto[]>> {
    return this.http.get<Api<M.PropertyComparableDto[]>>(API.property.findComparables(id, take));
  }

  getParcels(query?: M.ListQueryDto): Observable<Page<M.LandParcelListItemDto>> {
    return this.http.get<Page<M.LandParcelListItemDto>>(API.property.getParcels(query));
  }

  getParcel(id: string): Observable<Api<M.LandParcelDetailDto>> {
    return this.http.get<Api<M.LandParcelDetailDto>>(API.property.getParcel(id));
  }

  saveParcel(request: M.LandParcelDetailDto): Observable<Api<M.LandParcelDetailDto>> {
    return this.http.post<Api<M.LandParcelDetailDto>>(API.property.saveParcel, request);
  }

  /** Appends one link to the chain of title. Never edits an earlier one. */
  saveTitleEntry(id: string, request: M.TitleChainEntryDto): Observable<Api<M.TitleChainEntryDto>> {
    return this.http.post<Api<M.TitleChainEntryDto>>(API.property.saveTitleEntry(id), request);
  }

  saveEncumbrance(request: M.EncumbranceDto, parcelId?: string, propertyId?: string): Observable<Api<M.EncumbranceDto>> {
    return this.http.post<Api<M.EncumbranceDto>>(API.property.saveEncumbrance(parcelId, propertyId), request);
  }

  saveVerification(id: string, request: M.TitleVerificationItemDto): Observable<Api<M.TitleVerificationItemDto>> {
    return this.http.post<Api<M.TitleVerificationItemDto>>(API.property.saveVerification(id), request);
  }

  getAcquisitions(query?: M.ListQueryDto): Observable<Page<M.LandAcquisitionDto>> {
    return this.http.get<Page<M.LandAcquisitionDto>>(API.property.getAcquisitions(query));
  }

  saveAcquisition(request: M.LandAcquisitionDto): Observable<Api<M.LandAcquisitionDto>> {
    return this.http.post<Api<M.LandAcquisitionDto>>(API.property.saveAcquisition, request);
  }

  saveAcquisitionCost(id: string, request: M.AcquisitionCostLineDto): Observable<Api<M.AcquisitionCostLineDto>> {
    return this.http.post<Api<M.AcquisitionCostLineDto>>(API.property.saveAcquisitionCost(id), request);
  }

}

// ── Report ──────────────────────────────────────────────────────

/** The dashboard, the attention list and the report catalogue. */
@Injectable({ providedIn: 'root' })
export class ReportService {
  private http = inject(HttpClient);

  getDashboard(officeId?: string, projectId?: string): Observable<Api<M.RealEstateDashboardDto>> {
    return this.http.get<Api<M.RealEstateDashboardDto>>(API.report.getDashboard(officeId, projectId));
  }

  /** What would go wrong today if nobody looked, ranked by what it costs. */
  getAttention(officeId?: string, projectId?: string): Observable<Api<M.AttentionItemDto[]>> {
    return this.http.get<Api<M.AttentionItemDto[]>>(API.report.getAttention(officeId, projectId));
  }

  getPortfolio(query?: M.ListQueryDto): Observable<Api<M.ProjectListItemDto[]>> {
    return this.http.get<Api<M.ProjectListItemDto[]>>(API.report.getPortfolio(query));
  }

  /** Every report this company can run, filtered to the lines of business it operates. */
  getCatalogue(): Observable<Api<M.ReportDefinitionDto[]>> {
    return this.http.get<Api<M.ReportDefinitionDto[]>>(API.report.getCatalogue);
  }

  run(request: M.ReportRequestDto): Observable<Api<M.ReportResultDto>> {
    return this.http.post<Api<M.ReportResultDto>>(API.report.run, request);
  }

}

// ── Society ─────────────────────────────────────────────────────

/** Societies, residents, billing, the gate, amenities and complaints. */
@Injectable({ providedIn: 'root' })
export class SocietyService {
  private http = inject(HttpClient);

  getAll(query?: M.ListQueryDto): Observable<Page<M.SocietyListItemDto>> {
    return this.http.get<Page<M.SocietyListItemDto>>(API.society.getAll(query));
  }

  get(id: string): Observable<Api<M.SocietyDetailDto>> {
    return this.http.get<Api<M.SocietyDetailDto>>(API.society.get(id));
  }

  save(request: M.SocietyUpsertDto): Observable<Api<M.SocietyDetailDto>> {
    return this.http.post<Api<M.SocietyDetailDto>>(API.society.save, request);
  }

  getDashboard(id: string): Observable<Api<M.SocietyDashboardDto>> {
    return this.http.get<Api<M.SocietyDashboardDto>>(API.society.getDashboard(id));
  }

  /**
   * Hands the society from the developer to its own committee, transferring the corpus. A
   * one-way step, and the one every resident association eventually asks about.
   */
  handOver(id: string, handoverDate?: string, corpusTransferred?: number): Observable<Api<M.SocietyDetailDto>> {
    return this.http.post<Api<M.SocietyDetailDto>>(API.society.handOver(id, handoverDate, corpusTransferred), {});
  }

  getCommittee(id: string): Observable<Api<M.CommitteeMemberDto[]>> {
    return this.http.get<Api<M.CommitteeMemberDto[]>>(API.society.getCommittee(id));
  }

  saveCommitteeMember(id: string, request: M.CommitteeMemberDto): Observable<Api<M.CommitteeMemberDto>> {
    return this.http.post<Api<M.CommitteeMemberDto>>(API.society.saveCommitteeMember(id), request);
  }

  getResidents(id: string, query?: M.ListQueryDto, kind?: E.ResidentKind, defaultersOnly?: boolean): Observable<Page<M.ResidentListItemDto>> {
    return this.http.get<Page<M.ResidentListItemDto>>(API.society.getResidents(id, query, kind, defaultersOnly));
  }

  getResident(id: string): Observable<Api<M.ResidentDetailDto>> {
    return this.http.get<Api<M.ResidentDetailDto>>(API.society.getResident(id));
  }

  saveResident(request: M.ResidentUpsertDto): Observable<Api<M.ResidentDetailDto>> {
    return this.http.post<Api<M.ResidentDetailDto>>(API.society.saveResident, request);
  }

  moveOut(id: string, movedOutOn?: string): Observable<Api<M.ResidentDetailDto>> {
    return this.http.post<Api<M.ResidentDetailDto>>(API.society.moveOut(id, movedOutOn), {});
  }

  saveVehicle(id: string, request: M.ResidentVehicleDto): Observable<Api<M.ResidentVehicleDto>> {
    return this.http.post<Api<M.ResidentVehicleDto>>(API.society.saveVehicle(id), request);
  }

  getStaff(id: string, query?: M.ListQueryDto): Observable<Page<M.DomesticStaffDto>> {
    return this.http.get<Page<M.DomesticStaffDto>>(API.society.getStaff(id, query));
  }

  saveStaff(request: M.DomesticStaffDto): Observable<Api<M.DomesticStaffDto>> {
    return this.http.post<Api<M.DomesticStaffDto>>(API.society.saveStaff, request);
  }

  getChargeSchemes(id: string): Observable<Api<M.MaintenanceChargeSchemeDto[]>> {
    return this.http.get<Api<M.MaintenanceChargeSchemeDto[]>>(API.society.getChargeSchemes(id));
  }

  saveChargeScheme(request: M.MaintenanceChargeSchemeDto): Observable<Api<M.MaintenanceChargeSchemeDto>> {
    return this.http.post<Api<M.MaintenanceChargeSchemeDto>>(API.society.saveChargeScheme, request);
  }

  /**
   * Raises the month's bills. Maintenance, utilities, one-off charges, penalties, arrears and
   * late fee land on one document, because a resident who gets five separate bills pays none.
   */
  runBilling(request: M.MaintenanceBillRunDto): Observable<Api<M.MaintenanceBillRunResultDto>> {
    return this.http.post<Api<M.MaintenanceBillRunResultDto>>(API.society.runBilling, request);
  }

  getBills(id: string, query?: M.ListQueryDto, status?: E.InstalmentStatus): Observable<Page<M.MaintenanceBillDto>> {
    return this.http.get<Page<M.MaintenanceBillDto>>(API.society.getBills(id, query, status));
  }

  getBill(id: string): Observable<Api<M.MaintenanceBillDto>> {
    return this.http.get<Api<M.MaintenanceBillDto>>(API.society.getBill(id));
  }

  getCharges(id: string, unitId?: string): Observable<Api<M.SocietyChargeDto[]>> {
    return this.http.get<Api<M.SocietyChargeDto[]>>(API.society.getCharges(id, unitId));
  }

  saveCharge(request: M.SocietyChargeDto): Observable<Api<M.SocietyChargeDto>> {
    return this.http.post<Api<M.SocietyChargeDto>>(API.society.saveCharge, request);
  }

  imposePenalty(request: M.SocietyPenaltyDto): Observable<Api<M.SocietyPenaltyDto>> {
    return this.http.post<Api<M.SocietyPenaltyDto>>(API.society.imposePenalty, request);
  }

  waivePenalty(id: string, reason?: string): Observable<Api<M.SocietyPenaltyDto>> {
    return this.http.post<Api<M.SocietyPenaltyDto>>(API.society.waivePenalty(id, reason), {});
  }

  getPenalties(id: string, query?: M.ListQueryDto): Observable<Page<M.SocietyPenaltyDto>> {
    return this.http.get<Page<M.SocietyPenaltyDto>>(API.society.getPenalties(id, query));
  }

  createVisitorPass(request: M.VisitorPassCreateDto): Observable<Api<M.VisitorPassDto>> {
    return this.http.post<Api<M.VisitorPassDto>>(API.society.createVisitorPass, request);
  }

  getVisitorPasses(id: string, query?: M.ListQueryDto, unitId?: string): Observable<Page<M.VisitorPassDto>> {
    return this.http.get<Page<M.VisitorPassDto>>(API.society.getVisitorPasses(id, query, unitId));
  }

  recordEntry(request: M.GateEntryCreateDto): Observable<Api<M.GateEntryDto>> {
    return this.http.post<Api<M.GateEntryDto>>(API.society.recordEntry, request);
  }

  approveEntry(request: M.GateApprovalDto): Observable<Api<M.GateEntryDto>> {
    return this.http.post<Api<M.GateEntryDto>>(API.society.approveEntry, request);
  }

  checkOut(id: string): Observable<Api<M.GateEntryDto>> {
    return this.http.post<Api<M.GateEntryDto>>(API.society.checkOut(id), {});
  }

  getGateLog(id: string, query?: M.ListQueryDto, status?: E.GateEntryStatus): Observable<Page<M.GateEntryDto>> {
    return this.http.get<Page<M.GateEntryDto>>(API.society.getGateLog(id, query, status));
  }

  /** Who is inside the community right now — the first question after any incident. */
  getInsideNow(id: string): Observable<Api<M.GateEntryDto[]>> {
    return this.http.get<Api<M.GateEntryDto[]>>(API.society.getInsideNow(id));
  }

  /** Replays entries a guard recorded while the tablet had no signal. */
  syncGate(batch: M.GateSyncBatchDto): Observable<Api<number>> {
    return this.http.post<Api<number>>(API.society.syncGate, batch);
  }

  createGatePass(request: M.GatePassDto): Observable<Api<M.GatePassDto>> {
    return this.http.post<Api<M.GatePassDto>>(API.society.createGatePass, request);
  }

  createMoveRequest(request: M.MoveRequestDto): Observable<Api<M.MoveRequestDto>> {
    return this.http.post<Api<M.MoveRequestDto>>(API.society.createMoveRequest, request);
  }

  decideMoveRequest(id: string, status?: string): Observable<Api<M.MoveRequestDto>> {
    return this.http.post<Api<M.MoveRequestDto>>(API.society.decideMoveRequest(id, status), {});
  }

  getAmenities(id: string): Observable<Api<M.AmenityDto[]>> {
    return this.http.get<Api<M.AmenityDto[]>>(API.society.getAmenities(id));
  }

  saveAmenity(request: M.AmenityDto): Observable<Api<M.AmenityDto>> {
    return this.http.post<Api<M.AmenityDto>>(API.society.saveAmenity, request);
  }

  getAvailability(id: string, date?: string): Observable<Api<M.AmenityAvailabilityDto>> {
    return this.http.get<Api<M.AmenityAvailabilityDto>>(API.society.getAvailability(id, date));
  }

  bookAmenity(request: M.AmenityBookingCreateDto): Observable<Api<M.AmenityBookingDto>> {
    return this.http.post<Api<M.AmenityBookingDto>>(API.society.bookAmenity, request);
  }

  decideBooking(id: string, approved?: boolean, reason?: string): Observable<Api<M.AmenityBookingDto>> {
    return this.http.post<Api<M.AmenityBookingDto>>(API.society.decideBooking(id, approved, reason), {});
  }

  cancelBooking(id: string, reason?: string): Observable<Api<M.AmenityBookingDto>> {
    return this.http.post<Api<M.AmenityBookingDto>>(API.society.cancelBooking(id, reason), {});
  }

  getBookings(id: string, query?: M.ListQueryDto, status?: E.AmenityBookingStatus): Observable<Page<M.AmenityBookingDto>> {
    return this.http.get<Page<M.AmenityBookingDto>>(API.society.getBookings(id, query, status));
  }

  createComplaint(request: M.ComplaintCreateDto): Observable<Api<M.ComplaintDetailDto>> {
    return this.http.post<Api<M.ComplaintDetailDto>>(API.society.createComplaint, request);
  }

  getComplaint(id: string): Observable<Api<M.ComplaintDetailDto>> {
    return this.http.get<Api<M.ComplaintDetailDto>>(API.society.getComplaint(id));
  }

  searchComplaints(query: M.ComplaintSearchDto): Observable<Page<M.ComplaintListItemDto>> {
    return this.http.post<Page<M.ComplaintListItemDto>>(API.society.searchComplaints, query);
  }

  updateComplaint(id: string, photoUrls: string[], status?: E.TicketStatus, note?: string, visibleToResident?: boolean): Observable<Api<M.ComplaintDetailDto>> {
    return this.http.post<Api<M.ComplaintDetailDto>>(API.society.updateComplaint(id, status, note, visibleToResident), photoUrls);
  }

  assignComplaint(id: string, assignToUserId?: string, contractorId?: string): Observable<Api<M.ComplaintDetailDto>> {
    return this.http.post<Api<M.ComplaintDetailDto>>(API.society.assignComplaint(id, assignToUserId, contractorId), {});
  }

  rateComplaint(id: string, rating?: number, note?: string): Observable<Api<M.ComplaintDetailDto>> {
    return this.http.post<Api<M.ComplaintDetailDto>>(API.society.rateComplaint(id, rating, note), {});
  }

  escalateBreached(): Observable<Api<number>> {
    return this.http.post<Api<number>>(API.society.escalateBreached, {});
  }

  getNotices(id: string, query?: M.ListQueryDto): Observable<Page<M.SocietyNoticeDto>> {
    return this.http.get<Page<M.SocietyNoticeDto>>(API.society.getNotices(id, query));
  }

  saveNotice(request: M.SocietyNoticeDto): Observable<Api<M.SocietyNoticeDto>> {
    return this.http.post<Api<M.SocietyNoticeDto>>(API.society.saveNotice, request);
  }

  getPolls(id: string, openOnly?: boolean): Observable<Api<M.SocietyPollDto[]>> {
    return this.http.get<Api<M.SocietyPollDto[]>>(API.society.getPolls(id, openOnly));
  }

  savePoll(request: M.SocietyPollDto): Observable<Api<M.SocietyPollDto>> {
    return this.http.post<Api<M.SocietyPollDto>>(API.society.savePoll, request);
  }

  /** One vote per unit, not per person — which is how a society's constitution reads. */
  vote(id: string, unitId?: string, choice?: string, comment?: string): Observable<Api<M.SocietyPollDto>> {
    return this.http.post<Api<M.SocietyPollDto>>(API.society.vote(id, unitId, choice, comment), {});
  }

  getBuildingApplications(id: string, query?: M.ListQueryDto, status?: E.BuildingApplicationStatus): Observable<Page<M.BuildingPlanApplicationDto>> {
    return this.http.get<Page<M.BuildingPlanApplicationDto>>(API.society.getBuildingApplications(id, query, status));
  }

  getBuildingApplication(id: string): Observable<Api<M.BuildingPlanApplicationDto>> {
    return this.http.get<Api<M.BuildingPlanApplicationDto>>(API.society.getBuildingApplication(id));
  }

  saveBuildingApplication(request: M.BuildingPlanApplicationDto): Observable<Api<M.BuildingPlanApplicationDto>> {
    return this.http.post<Api<M.BuildingPlanApplicationDto>>(API.society.saveBuildingApplication, request);
  }

  decideBuildingApplication(id: string, status?: E.BuildingApplicationStatus, conditions?: string, rejectionReason?: string): Observable<Api<M.BuildingPlanApplicationDto>> {
    return this.http.post<Api<M.BuildingPlanApplicationDto>>(API.society.decideBuildingApplication(id, status, conditions, rejectionReason), {});
  }

  recordBuildingInspection(request: M.BuildingInspectionDto): Observable<Api<M.BuildingInspectionDto>> {
    return this.http.post<Api<M.BuildingInspectionDto>>(API.society.recordBuildingInspection, request);
  }

  issueViolation(request: M.ViolationNoticeDto): Observable<Api<M.ViolationNoticeDto>> {
    return this.http.post<Api<M.ViolationNoticeDto>>(API.society.issueViolation, request);
  }

  closeViolation(id: string, compliedOn?: string): Observable<Api<M.ViolationNoticeDto>> {
    return this.http.post<Api<M.ViolationNoticeDto>>(API.society.closeViolation(id, compliedOn), {});
  }

  getViolations(id: string, query?: M.ListQueryDto, openOnly?: boolean): Observable<Page<M.ViolationNoticeDto>> {
    return this.http.get<Page<M.ViolationNoticeDto>>(API.society.getViolations(id, query, openOnly));
  }

}

