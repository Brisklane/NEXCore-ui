import { environment } from '@env';

const BASE = `${environment.apiBaseUrl}/api/distribution`;

/** Turns a loose object into a query string, dropping empty values. */
function q(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  const s = search.toString();
  return s ? `?${s}` : '';
}

/**
 * Every Distribution endpoint in one place.
 *
 * Kept as a literal map rather than string concatenation at the call site so a route rename is a
 * single edit, and so it is possible to read the module's whole API surface without opening
 * Swagger.
 */
export const DISTRIBUTION_API = {
  hub: `${environment.apiBaseUrl}/hubs/distribution`,

  partners: {
    list: (p: Record<string, unknown>) => `${BASE}/partners${q(p)}`,
    tree: (rootPartnerId?: string) => `${BASE}/partners/tree${q({ rootPartnerId })}`,
    get: (id: string) => `${BASE}/partners/${id}`,
    create: `${BASE}/partners`,
    update: (id: string) => `${BASE}/partners/${id}`,
    status: (id: string) => `${BASE}/partners/${id}/status`,
    delete: (id: string) => `${BASE}/partners/${id}`,
    documents: (id: string) => `${BASE}/partners/${id}/documents`,
    verifyDocument: (documentId: string) => `${BASE}/partners/documents/${documentId}/verify`,
    expiringDocuments: (withinDays: number) => `${BASE}/partners/expiring-documents${q({ withinDays })}`,
  },

  outlets: {
    list: (p: Record<string, unknown>) => `${BASE}/outlets${q(p)}`,
    get: (id: string) => `${BASE}/outlets/${id}`,
    get360: (id: string) => `${BASE}/outlets/${id}/360`,
    create: `${BASE}/outlets`,
    update: (id: string) => `${BASE}/outlets/${id}`,
    onboard: `${BASE}/outlets/onboard`,
    duplicates: (p: Record<string, unknown>) => `${BASE}/outlets/duplicates${q(p)}`,
    approve: (id: string, isApproved: boolean, reason?: string) =>
      `${BASE}/outlets/${id}/approve${q({ isApproved, reason })}`,
    status: (id: string, status: number, reason?: string) =>
      `${BASE}/outlets/${id}/status${q({ status, reason })}`,
    merge: (survivorId: string, duplicateId: string) => `${BASE}/outlets/${survivorId}/merge/${duplicateId}`,
    delete: (id: string) => `${BASE}/outlets/${id}`,
    assets: (p: Record<string, unknown>) => `${BASE}/outlets/assets${q(p)}`,
    createAsset: `${BASE}/outlets/assets`,
    updateAsset: (id: string) => `${BASE}/outlets/assets/${id}`,
    verifyAsset: (id: string, p: Record<string, unknown>) => `${BASE}/outlets/assets/${id}/verify${q(p)}`,
    photos: (id: string, tag?: string) => `${BASE}/outlets/${id}/photos${q({ tag })}`,
    addPhoto: `${BASE}/outlets/photos`,
    notes: (id: string) => `${BASE}/outlets/${id}/notes`,
    addNote: `${BASE}/outlets/notes`,
  },

  routes: {
    geoTree: (rootId?: string) => `${BASE}/routes/geo${q({ rootId })}`,
    createGeo: `${BASE}/routes/geo`,
    updateGeo: (id: string) => `${BASE}/routes/geo/${id}`,
    deleteGeo: (id: string) => `${BASE}/routes/geo/${id}`,

    territoryTree: (rootId?: string) => `${BASE}/routes/territories/tree${q({ rootId })}`,
    territories: (p: Record<string, unknown>) => `${BASE}/routes/territories${q(p)}`,
    territory: (id: string) => `${BASE}/routes/territories/${id}`,
    createTerritory: `${BASE}/routes/territories`,
    updateTerritory: (id: string) => `${BASE}/routes/territories/${id}`,
    deleteTerritory: (id: string) => `${BASE}/routes/territories/${id}`,

    list: (p: Record<string, unknown>) => `${BASE}/routes${q(p)}`,
    get: (id: string) => `${BASE}/routes/${id}`,
    create: `${BASE}/routes`,
    update: (id: string) => `${BASE}/routes/${id}`,
    delete: (id: string) => `${BASE}/routes/${id}`,
    addOutlets: `${BASE}/routes/outlets`,
    removeOutlet: (routeId: string, outletId: string) => `${BASE}/routes/${routeId}/outlets/${outletId}`,
    resequence: `${BASE}/routes/resequence`,
    assign: `${BASE}/routes/assign`,
    split: (id: string, newRouteName: string) => `${BASE}/routes/${id}/split${q({ newRouteName })}`,
    unrouted: (p: Record<string, unknown>) => `${BASE}/routes/unrouted${q(p)}`,

    journeyPlans: (p: Record<string, unknown>) => `${BASE}/routes/journey${q(p)}`,
    journeyPlan: (fieldRepId: string, periodStart: string) =>
      `${BASE}/routes/journey/${fieldRepId}${q({ periodStart })}`,
    generateJourney: `${BASE}/routes/journey/generate`,
    publishJourney: (planId: string) => `${BASE}/routes/journey/${planId}/publish`,
    updateJourneyDay: (dayId: string) => `${BASE}/routes/journey/days/${dayId}`,
  },

  field: {
    reps: (p: Record<string, unknown>) => `${BASE}/field/reps${q(p)}`,
    rep: (id: string) => `${BASE}/field/reps/${id}`,
    createRep: `${BASE}/field/reps`,
    updateRep: (id: string) => `${BASE}/field/reps/${id}`,
    deleteRep: (id: string) => `${BASE}/field/reps/${id}`,
    authenticate: (code: string, pin: string) => `${BASE}/field/reps/authenticate${q({ code, pin })}`,

    devices: (p: Record<string, unknown>) => `${BASE}/field/devices${q(p)}`,
    registerDevice: `${BASE}/field/devices`,
    blockDevice: (id: string, p: Record<string, unknown>) => `${BASE}/field/devices/${id}/block${q(p)}`,
    wipeDevice: (id: string) => `${BASE}/field/devices/${id}/wipe`,

    startDay: `${BASE}/field/days/start`,
    day: (id: string) => `${BASE}/field/days/${id}`,
    today: (fieldRepId: string, workDate?: string) => `${BASE}/field/days/today/${fieldRepId}${q({ workDate })}`,
    board: (id: string) => `${BASE}/field/days/${id}/board`,
    closeDay: `${BASE}/field/days/close`,
    days: (p: Record<string, unknown>) => `${BASE}/field/days${q(p)}`,

    checkIn: `${BASE}/field/visits/check-in`,
    checkOut: `${BASE}/field/visits/check-out`,
    visit: (id: string) => `${BASE}/field/visits/${id}`,
    visits: (p: Record<string, unknown>) => `${BASE}/field/visits${q(p)}`,

    tasks: (p: Record<string, unknown>) => `${BASE}/field/tasks${q(p)}`,
    createTask: `${BASE}/field/tasks`,
    updateTask: (id: string) => `${BASE}/field/tasks/${id}`,
    completeTask: `${BASE}/field/tasks/complete`,
    deleteTask: (id: string) => `${BASE}/field/tasks/${id}`,

    surveys: (activeOnly?: boolean) => `${BASE}/field/surveys${q({ activeOnly })}`,
    survey: (id: string) => `${BASE}/field/surveys/${id}`,
    createSurvey: `${BASE}/field/surveys`,
    updateSurvey: (id: string) => `${BASE}/field/surveys/${id}`,
    deleteSurvey: (id: string) => `${BASE}/field/surveys/${id}`,
    submitSurvey: `${BASE}/field/surveys/submit`,
    surveyResponses: (p: Record<string, unknown>) => `${BASE}/field/surveys/responses${q(p)}`,

    submitAudit: `${BASE}/field/audits`,
    audit: (id: string) => `${BASE}/field/audits/${id}`,
    audits: (p: Record<string, unknown>) => `${BASE}/field/audits${q(p)}`,

    recordCompetitor: `${BASE}/field/competitors`,
    competitors: (p: Record<string, unknown>) => `${BASE}/field/competitors${q(p)}`,

    recordPosm: `${BASE}/field/posm`,
    posm: (p: Record<string, unknown>) => `${BASE}/field/posm${q(p)}`,
  },

  orders: {
    quote: `${BASE}/orders/quote`,
    create: `${BASE}/orders`,
    get: (id: string) => `${BASE}/orders/${id}`,
    update: (id: string) => `${BASE}/orders/${id}`,
    submit: (id: string) => `${BASE}/orders/${id}/submit`,
    decide: `${BASE}/orders/decide`,
    hold: (id: string, reason: string) => `${BASE}/orders/${id}/hold${q({ reason })}`,
    release: (id: string) => `${BASE}/orders/${id}/release`,
    cancel: (id: string) => `${BASE}/orders/${id}/cancel`,
    list: (p: Record<string, unknown>) => `${BASE}/orders${q(p)}`,
    catalogue: (p: Record<string, unknown>) => `${BASE}/orders/catalogue${q(p)}`,
    allocate: `${BASE}/orders/allocate`,
    releaseAllocation: (id: string) => `${BASE}/orders/${id}/release-allocation`,
    consolidate: `${BASE}/orders/consolidate`,
  },

  pricing: {
    resolve: (p: Record<string, unknown>) => `${BASE}/pricing/resolve${q(p)}`,
    list: (p: Record<string, unknown>) => `${BASE}/pricing${q(p)}`,
    get: (id: string) => `${BASE}/pricing/${id}`,
    create: `${BASE}/pricing`,
    update: (id: string) => `${BASE}/pricing/${id}`,
    approve: (id: string) => `${BASE}/pricing/${id}/approve`,
    delete: (id: string) => `${BASE}/pricing/${id}`,
    margins: (p: Record<string, unknown>) => `${BASE}/pricing/margins${q(p)}`,
    createMargin: `${BASE}/pricing/margins`,
    updateMargin: (id: string) => `${BASE}/pricing/margins/${id}`,
    mrp: (p: Record<string, unknown>) => `${BASE}/pricing/mrp${q(p)}`,
    createMrp: `${BASE}/pricing/mrp`,
  },

  schemes: {
    list: (p: Record<string, unknown>) => `${BASE}/schemes${q(p)}`,
    get: (id: string) => `${BASE}/schemes/${id}`,
    create: `${BASE}/schemes`,
    update: (id: string) => `${BASE}/schemes/${id}`,
    decide: (id: string) => `${BASE}/schemes/${id}/decide`,
    status: (id: string, status: number, reason?: string) => `${BASE}/schemes/${id}/status${q({ status, reason })}`,
    delete: (id: string) => `${BASE}/schemes/${id}`,
    applicable: (p: Record<string, unknown>) => `${BASE}/schemes/applicable${q(p)}`,
    simulate: (p: Record<string, unknown>) => `${BASE}/schemes/simulate${q(p)}`,
    performance: (id: string) => `${BASE}/schemes/${id}/performance`,
    budget: (id: string) => `${BASE}/schemes/${id}/budget`,
    adjustBudget: (id: string, amount: number, reason: string) =>
      `${BASE}/schemes/${id}/budget${q({ amount, reason })}`,
    applications: (p: Record<string, unknown>) => `${BASE}/schemes/applications${q(p)}`,
    generateClaims: (periodStart: string, periodEnd: string) =>
      `${BASE}/schemes/generate-claims${q({ periodStart, periodEnd })}`,
  },

  vans: {
    list: (p: Record<string, unknown>) => `${BASE}/vans${q(p)}`,
    get: (id: string) => `${BASE}/vans/${id}`,
    create: `${BASE}/vans`,
    update: (id: string) => `${BASE}/vans/${id}`,
    delete: (id: string) => `${BASE}/vans/${id}`,
    stock: (id: string, compartment?: number) => `${BASE}/vans/${id}/stock${q({ compartment })}`,
    movements: (id: string, p: Record<string, unknown>) => `${BASE}/vans/${id}/movements${q(p)}`,
    createLoad: `${BASE}/vans/loads`,
    load: (id: string) => `${BASE}/vans/loads/${id}`,
    loads: (p: Record<string, unknown>) => `${BASE}/vans/loads${q(p)}`,
    approveLoad: (id: string, p: Record<string, unknown>) => `${BASE}/vans/loads/${id}/approve${q(p)}`,
    confirmLoad: `${BASE}/vans/loads/confirm`,
    transfer: `${BASE}/vans/transfer`,
    startCount: `${BASE}/vans/counts/start`,
    submitCount: `${BASE}/vans/counts/submit`,
    approveCount: (id: string) => `${BASE}/vans/counts/${id}/approve`,
    count: (id: string) => `${BASE}/vans/counts/${id}`,
    unload: (id: string, fieldDayId?: string) => `${BASE}/vans/${id}/unload${q({ fieldDayId })}`,
  },

  fulfilment: {
    board: (p: Record<string, unknown>) => `${BASE}/fulfilment/board${q(p)}`,
    createWave: `${BASE}/fulfilment/waves`,
    wave: (id: string) => `${BASE}/fulfilment/waves/${id}`,
    waves: (p: Record<string, unknown>) => `${BASE}/fulfilment/waves${q(p)}`,
    closeWave: (id: string) => `${BASE}/fulfilment/waves/${id}/close`,
    task: (id: string) => `${BASE}/fulfilment/tasks/${id}`,
    assignTask: (id: string, p: Record<string, unknown>) => `${BASE}/fulfilment/tasks/${id}/assign${q(p)}`,
    startTask: (id: string) => `${BASE}/fulfilment/tasks/${id}/start`,
    confirmPick: `${BASE}/fulfilment/tasks/confirm`,
    completeTask: (id: string) => `${BASE}/fulfilment/tasks/${id}/complete`,
    createPackage: `${BASE}/fulfilment/packages`,
    packages: (p: Record<string, unknown>) => `${BASE}/fulfilment/packages${q(p)}`,
    stagePackage: (id: string, stagingLocation: string) =>
      `${BASE}/fulfilment/packages/${id}/stage${q({ stagingLocation })}`,
    loadPackage: (id: string, tripId: string) => `${BASE}/fulfilment/packages/${id}/load${q({ tripId })}`,
    createDispatch: `${BASE}/fulfilment/dispatches`,
    dispatch: (id: string) => `${BASE}/fulfilment/dispatches/${id}`,
    dispatches: (p: Record<string, unknown>) => `${BASE}/fulfilment/dispatches${q(p)}`,
  },

  logistics: {
    vehicles: (p: Record<string, unknown>) => `${BASE}/logistics/vehicles${q(p)}`,
    vehicle: (id: string) => `${BASE}/logistics/vehicles/${id}`,
    createVehicle: `${BASE}/logistics/vehicles`,
    updateVehicle: (id: string) => `${BASE}/logistics/vehicles/${id}`,
    deleteVehicle: (id: string) => `${BASE}/logistics/vehicles/${id}`,
    expiringCompliance: (withinDays: number) => `${BASE}/logistics/compliance/expiring${q({ withinDays })}`,

    drivers: (p: Record<string, unknown>) => `${BASE}/logistics/drivers${q(p)}`,
    driver: (id: string) => `${BASE}/logistics/drivers/${id}`,
    createDriver: `${BASE}/logistics/drivers`,
    updateDriver: (id: string) => `${BASE}/logistics/drivers/${id}`,
    deleteDriver: (id: string) => `${BASE}/logistics/drivers/${id}`,

    createTrip: `${BASE}/logistics/trips`,
    trip: (id: string) => `${BASE}/logistics/trips/${id}`,
    trips: (p: Record<string, unknown>) => `${BASE}/logistics/trips${q(p)}`,
    resequenceTrip: `${BASE}/logistics/trips/resequence`,
    startTrip: `${BASE}/logistics/trips/start`,
    endTrip: `${BASE}/logistics/trips/end`,
    cancelTrip: (id: string, reason: string) => `${BASE}/logistics/trips/${id}/cancel${q({ reason })}`,
    arrive: `${BASE}/logistics/stops/arrive`,
    failStop: `${BASE}/logistics/stops/fail`,
    addExpense: `${BASE}/logistics/expenses`,
    decideExpense: (id: string, p: Record<string, unknown>) => `${BASE}/logistics/expenses/${id}/decide${q(p)}`,

    capturePod: `${BASE}/logistics/pod`,
    pod: (id: string) => `${BASE}/logistics/pod/${id}`,
    pods: (p: Record<string, unknown>) => `${BASE}/logistics/pod${q(p)}`,
    resolvePod: (id: string, note: string) => `${BASE}/logistics/pod/${id}/resolve${q({ note })}`,
  },

  returns: {
    request: `${BASE}/returns`,
    get: (id: string) => `${BASE}/returns/${id}`,
    list: (p: Record<string, unknown>) => `${BASE}/returns${q(p)}`,
    decide: (id: string) => `${BASE}/returns/${id}/decide`,
    cancel: (id: string, reason: string) => `${BASE}/returns/${id}/cancel${q({ reason })}`,
    receive: `${BASE}/returns/receive`,
    disposition: `${BASE}/returns/disposition`,
    destruction: (id: string, p: Record<string, unknown>) => `${BASE}/returns/receipts/${id}/destruction${q(p)}`,
    credit: (id: string, raiseClaim: boolean) => `${BASE}/returns/${id}/credit${q({ raiseClaim })}`,
  },

  credit: {
    snapshot: (p: Record<string, unknown>) => `${BASE}/credit/snapshot${q(p)}`,
    check: (p: Record<string, unknown>) => `${BASE}/credit/check${q(p)}`,
    profiles: (p: Record<string, unknown>) => `${BASE}/credit/profiles${q(p)}`,
    setLimit: `${BASE}/credit/limit`,
    recalculate: (p: Record<string, unknown>) => `${BASE}/credit/recalculate${q(p)}`,
    block: (p: Record<string, unknown>) => `${BASE}/credit/block${q(p)}`,
    requestOverride: `${BASE}/credit/overrides`,
    decideOverride: (id: string) => `${BASE}/credit/overrides/${id}/decide`,
    overrides: (p: Record<string, unknown>) => `${BASE}/credit/overrides${q(p)}`,
    recordCollection: `${BASE}/credit/collections`,
    collection: (id: string) => `${BASE}/credit/collections/${id}`,
    collections: (p: Record<string, unknown>) => `${BASE}/credit/collections${q(p)}`,
    reverseCollection: (id: string, reason: string) => `${BASE}/credit/collections/${id}/reverse${q({ reason })}`,
    cheques: (p: Record<string, unknown>) => `${BASE}/credit/cheques${q(p)}`,
    updateCheque: (id: string) => `${BASE}/credit/cheques/${id}/status`,
  },

  claims: {
    submit: `${BASE}/claims`,
    get: (id: string) => `${BASE}/claims/${id}`,
    list: (p: Record<string, unknown>) => `${BASE}/claims${q(p)}`,
    review: (id: string) => `${BASE}/claims/${id}/review`,
    query: (id: string) => `${BASE}/claims/${id}/query`,
    resubmit: (id: string) => `${BASE}/claims/${id}/resubmit`,
    decide: (id: string) => `${BASE}/claims/${id}/decide`,
    settle: (id: string) => `${BASE}/claims/${id}/settle`,
    cancel: (id: string, reason: string) => `${BASE}/claims/${id}/cancel${q({ reason })}`,
    addDocument: (id: string) => `${BASE}/claims/${id}/documents`,

    rebates: (p: Record<string, unknown>) => `${BASE}/claims/rebates${q(p)}`,
    rebate: (id: string) => `${BASE}/claims/rebates/${id}`,
    createRebate: `${BASE}/claims/rebates`,
    updateRebate: (id: string) => `${BASE}/claims/rebates/${id}`,
    accrue: (periodStart: string, periodEnd: string) => `${BASE}/claims/rebates/accrue${q({ periodStart, periodEnd })}`,
    reconcileAccrual: (id: string, p: Record<string, unknown>) =>
      `${BASE}/claims/rebates/accruals/${id}/reconcile${q(p)}`,

    chargebacks: (p: Record<string, unknown>) => `${BASE}/claims/chargebacks${q(p)}`,
    createChargeback: `${BASE}/claims/chargebacks`,
    updateChargeback: (id: string) => `${BASE}/claims/chargebacks/${id}`,
    settleChargeback: (id: string, p: Record<string, unknown>) =>
      `${BASE}/claims/chargebacks/${id}/settle${q(p)}`,
  },

  settlement: {
    board: (p: Record<string, unknown>) => `${BASE}/settlement/board${q(p)}`,
    open: `${BASE}/settlement/open`,
    get: (id: string) => `${BASE}/settlement/${id}`,
    recompute: (id: string) => `${BASE}/settlement/${id}/recompute`,
    submit: `${BASE}/settlement/submit`,
    explainVariance: `${BASE}/settlement/variance`,
    approve: `${BASE}/settlement/approve`,
    close: (id: string) => `${BASE}/settlement/${id}/close`,
    reverse: (id: string) => `${BASE}/settlement/${id}/reverse`,
    list: (p: Record<string, unknown>) => `${BASE}/settlement${q(p)}`,
    recordDeposit: `${BASE}/settlement/deposits`,
    reconcileDeposit: (id: string) => `${BASE}/settlement/deposits/${id}/reconcile`,
    deposits: (p: Record<string, unknown>) => `${BASE}/settlement/deposits${q(p)}`,
  },

  secondary: {
    list: (p: Record<string, unknown>) => `${BASE}/secondary${q(p)}`,
    get: (id: string) => `${BASE}/secondary/${id}`,
    declare: `${BASE}/secondary/declare`,
    upload: (p: Record<string, unknown>) => `${BASE}/secondary/upload${q(p)}`,
    getUpload: (id: string) => `${BASE}/secondary/uploads/${id}`,
    uploads: (p: Record<string, unknown>) => `${BASE}/secondary/uploads${q(p)}`,
    postUpload: (id: string) => `${BASE}/secondary/uploads/${id}/post`,
    rejectUpload: (id: string, reason: string) => `${BASE}/secondary/uploads/${id}/reject${q({ reason })}`,
    exceptions: (p: Record<string, unknown>) => `${BASE}/secondary/exceptions${q(p)}`,
    resolveMapping: `${BASE}/secondary/exceptions/resolve`,
    mappingProfiles: (partnerId?: string) => `${BASE}/secondary/mapping-profiles${q({ partnerId })}`,
    createMappingProfile: `${BASE}/secondary/mapping-profiles`,
    updateMappingProfile: (id: string) => `${BASE}/secondary/mapping-profiles/${id}`,

    submitStock: `${BASE}/secondary/stock`,
    getStock: (id: string) => `${BASE}/secondary/stock/${id}`,
    stockList: (p: Record<string, unknown>) => `${BASE}/secondary/stock${q(p)}`,
    verifyStock: (id: string) => `${BASE}/secondary/stock/${id}/verify`,

    norms: (p: Record<string, unknown>) => `${BASE}/secondary/norms${q(p)}`,
    createNorm: `${BASE}/secondary/norms`,
    updateNorm: (id: string) => `${BASE}/secondary/norms/${id}`,

    reconcile: (p: Record<string, unknown>) => `${BASE}/secondary/reconcile${q(p)}`,
    reconciliations: (p: Record<string, unknown>) => `${BASE}/secondary/reconciliations${q(p)}`,
    explain: `${BASE}/secondary/reconciliations/explain`,
    channelInventory: (p: Record<string, unknown>) => `${BASE}/secondary/channel-inventory${q(p)}`,
    dataQuality: (periodStart: string, periodEnd: string) =>
      `${BASE}/secondary/data-quality${q({ periodStart, periodEnd })}`,
  },

  performance: {
    targets: (p: Record<string, unknown>) => `${BASE}/performance/targets${q(p)}`,
    target: (id: string) => `${BASE}/performance/targets/${id}`,
    createTarget: `${BASE}/performance/targets`,
    updateTarget: (id: string) => `${BASE}/performance/targets/${id}`,
    publishTarget: (id: string) => `${BASE}/performance/targets/${id}/publish`,
    deleteTarget: (id: string) => `${BASE}/performance/targets/${id}`,
    recomputeTargets: (periodStart: string, periodEnd: string) =>
      `${BASE}/performance/targets/recompute${q({ periodStart, periodEnd })}`,

    incentives: (activeOnly?: boolean) => `${BASE}/performance/incentives${q({ activeOnly })}`,
    createIncentive: `${BASE}/performance/incentives`,
    updateIncentive: (id: string) => `${BASE}/performance/incentives/${id}`,
    computePayouts: (id: string, periodStart: string, periodEnd: string) =>
      `${BASE}/performance/incentives/${id}/compute${q({ periodStart, periodEnd })}`,
    approvePayout: (id: string, p: Record<string, unknown>) => `${BASE}/performance/payouts/${id}/approve${q(p)}`,
    payouts: (p: Record<string, unknown>) => `${BASE}/performance/payouts${q(p)}`,

    computeKpis: (date: string) => `${BASE}/performance/kpis/compute${q({ date })}`,
    kpis: (p: Record<string, unknown>) => `${BASE}/performance/kpis${q(p)}`,
    leaderboard: (p: Record<string, unknown>) => `${BASE}/performance/leaderboard${q(p)}`,
  },

  planning: {
    generateForecast: `${BASE}/planning/forecasts`,
    forecast: (id: string) => `${BASE}/planning/forecasts/${id}`,
    forecasts: (p: Record<string, unknown>) => `${BASE}/planning/forecasts${q(p)}`,
    overrideForecast: `${BASE}/planning/forecasts/override`,
    approveForecast: (id: string) => `${BASE}/planning/forecasts/${id}/approve`,
    generateSuggestions: (p: Record<string, unknown>) => `${BASE}/planning/suggestions/generate${q(p)}`,
    suggestions: (p: Record<string, unknown>) => `${BASE}/planning/suggestions${q(p)}`,
    dismissSuggestion: (id: string, reason: string) => `${BASE}/planning/suggestions/${id}/dismiss${q({ reason })}`,
    createTransfer: `${BASE}/planning/transfers`,
    transfers: (p: Record<string, unknown>) => `${BASE}/planning/transfers${q(p)}`,
    decideTransfer: (id: string, p: Record<string, unknown>) => `${BASE}/planning/transfers/${id}/decide${q(p)}`,
  },

  traceability: {
    checkpoints: (p: Record<string, unknown>) => `${BASE}/traceability/checkpoints${q(p)}`,
    createCheckpoint: `${BASE}/traceability/checkpoints`,
    updateCheckpoint: (id: string) => `${BASE}/traceability/checkpoints/${id}`,
    recordReading: `${BASE}/traceability/readings`,
    readings: (p: Record<string, unknown>) => `${BASE}/traceability/readings${q(p)}`,
    resolveExcursion: (id: string, p: Record<string, unknown>) =>
      `${BASE}/traceability/readings/${id}/resolve${q(p)}`,
    trace: (p: Record<string, unknown>) => `${BASE}/traceability/trace${q(p)}`,
    traceFromOutlet: (p: Record<string, unknown>) => `${BASE}/traceability/trace/from-outlet${q(p)}`,
    initiateRecall: `${BASE}/traceability/recalls`,
    recall: (id: string) => `${BASE}/traceability/recalls/${id}`,
    recalls: (p: Record<string, unknown>) => `${BASE}/traceability/recalls${q(p)}`,
    announceRecall: (id: string) => `${BASE}/traceability/recalls/${id}/announce`,
    updateNotice: (id: string, p: Record<string, unknown>) => `${BASE}/traceability/recalls/notices/${id}${q(p)}`,
    completeRecall: (id: string, closureReport: string) =>
      `${BASE}/traceability/recalls/${id}/complete${q({ closureReport })}`,
    nearExpiry: (p: Record<string, unknown>) => `${BASE}/traceability/near-expiry${q(p)}`,
  },

  reports: {
    dashboard: (p: Record<string, unknown>) => `${BASE}/reports/dashboard${q(p)}`,
    exceptions: (territoryId?: string) => `${BASE}/reports/exceptions${q({ territoryId })}`,
    sales: (groupBy: string) => `${BASE}/reports/sales${q({ groupBy })}`,
    productivity: `${BASE}/reports/productivity`,
    outlets: `${BASE}/reports/outlets`,
    logistics: `${BASE}/reports/logistics`,
    receivables: `${BASE}/reports/receivables`,
    returns: `${BASE}/reports/returns`,
    claims: `${BASE}/reports/claims`,
    stock: `${BASE}/reports/stock`,
  },

  admin: {
    reasons: (p: Record<string, unknown>) => `${BASE}/admin/reasons${q(p)}`,
    createReason: `${BASE}/admin/reasons`,
    updateReason: (id: string) => `${BASE}/admin/reasons/${id}`,
    deleteReason: (id: string) => `${BASE}/admin/reasons/${id}`,
    settings: `${BASE}/admin/settings`,
    notifications: (p: Record<string, unknown>) => `${BASE}/admin/notifications${q(p)}`,
    markRead: (id: string) => `${BASE}/admin/notifications/${id}/read`,
    markAllRead: `${BASE}/admin/notifications/read-all`,
    unreadCount: `${BASE}/admin/notifications/unread-count`,
  },
};
