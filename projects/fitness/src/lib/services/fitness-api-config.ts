import { environment } from '@env';

const BASE = `${environment.apiBaseUrl}/api/fitness`;

/** Builds a query string, dropping anything undefined, null or blank. */
function qs(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : '';
}

/** Page number and size, with the same defaults the server uses. */
function page(opts: { page?: number; size?: number } = {}): Record<string, unknown> {
  return { pageNumber: opts.page ?? 1, pageSize: opts.size ?? 25 };
}

/**
 * Every Fitness endpoint in one place.
 *
 * Kept as a literal map rather than string concatenation at the call site so a route rename is a
 * single edit, and so it is possible to read the module's whole API surface without opening
 * Swagger.
 */
export const FITNESS_API = {
  hub: `${environment.apiBaseUrl}/hubs/fitness`,

  clubs: {
    provision: (includeSampleData = false) => `${BASE}/clubs/provision${qs({ includeSampleData })}`,
    getAll: (activeOnly = false) => `${BASE}/clubs${qs({ activeOnly })}`,
    getById: (id: string) => `${BASE}/clubs/${id}`,
    create: `${BASE}/clubs`,
    update: (id: string) => `${BASE}/clubs/${id}`,
    delete: (id: string) => `${BASE}/clubs/${id}`,

    schedules: (clubId: string) => `${BASE}/clubs/${clubId}/schedules`,
    closures: (clubId: string, upcomingOnly = true) =>
      `${BASE}/clubs/${clubId}/closures${qs({ upcomingOnly })}`,
    saveClosure: (id?: string) => `${BASE}/clubs/closures${qs({ id })}`,

    areas: (clubId: string) => `${BASE}/clubs/${clubId}/areas`,
    saveArea: (id?: string) => `${BASE}/clubs/areas${qs({ id })}`,
    rooms: (clubId: string) => `${BASE}/clubs/${clubId}/rooms`,
    saveRoomLayout: `${BASE}/clubs/rooms/layout`,

    settings: `${BASE}/clubs/settings`,
  },

  members: {
    list: (opts: {
      clubId?: string; status?: number; riskBand?: number; search?: string;
      planId?: string; hasBalance?: boolean; page?: number; size?: number;
    } = {}) => `${BASE}/members${qs({ ...page(opts), clubId: opts.clubId, status: opts.status,
      riskBand: opts.riskBand, search: opts.search, planId: opts.planId, hasBalance: opts.hasBalance })}`,
    getById: (id: string) => `${BASE}/members/${id}`,
    search: `${BASE}/members/search`,
    create: `${BASE}/members`,
    update: (id: string) => `${BASE}/members/${id}`,
    join: `${BASE}/members/join`,
    changeStatus: `${BASE}/members/status`,
    ban: `${BASE}/members/ban`,

    timeline: (id: string, limit = 100) => `${BASE}/members/${id}/timeline${qs({ limit })}`,
    addNote: `${BASE}/members/notes`,
    alerts: (id: string) => `${BASE}/members/${id}/alerts`,
    refreshAlerts: (id: string) => `${BASE}/members/${id}/alerts/refresh`,
    visits: (id: string, limit = 50) => `${BASE}/members/${id}/visits${qs({ limit })}`,
    ledger: (id: string, limit = 100) => `${BASE}/members/${id}/ledger${qs({ limit })}`,
    upcoming: (id: string) => `${BASE}/members/${id}/upcoming`,

    issueCredential: `${BASE}/members/credentials`,
    deactivateCredential: (id: string, reason: string) =>
      `${BASE}/members/credentials/${id}${qs({ reason })}`,

    households: (opts: { clubId?: string; search?: string; page?: number; size?: number } = {}) =>
      `${BASE}/members/households${qs({ ...page({ ...opts, size: opts.size ?? 30 }),
        clubId: opts.clubId, search: opts.search })}`,
    household: (id: string) => `${BASE}/members/households/${id}`,
    saveHousehold: `${BASE}/members/households`,

    previewMerge: `${BASE}/members/merge/preview`,
    merge: `${BASE}/members/merge`,

    export: (id: string) => `${BASE}/members/${id}/export`,
    anonymise: `${BASE}/members/anonymise`,
  },

  catalogue: {
    plans: (clubId?: string, kind?: number, sellableOnly = false) =>
      `${BASE}/catalogue/plans${qs({ clubId, kind, sellableOnly })}`,
    plan: (id: string) => `${BASE}/catalogue/plans/${id}`,
    createPlan: `${BASE}/catalogue/plans`,
    updatePlan: (id: string) => `${BASE}/catalogue/plans/${id}`,
    deletePlan: (id: string) => `${BASE}/catalogue/plans/${id}`,
    salesCatalogue: (clubId: string) => `${BASE}/catalogue/sales/${clubId}`,

    promotions: (clubId?: string, activeOnly = true) =>
      `${BASE}/catalogue/promotions${qs({ clubId, activeOnly })}`,
    savePromotion: (id?: string) => `${BASE}/catalogue/promotions${qs({ id })}`,
    checkPromoCode: `${BASE}/catalogue/promo-codes/check`,

    services: (clubId?: string, activeOnly = true) =>
      `${BASE}/catalogue/services${qs({ clubId, activeOnly })}`,
    saveService: (id?: string) => `${BASE}/catalogue/services${qs({ id })}`,

    changePaths: (planId: string) => `${BASE}/catalogue/plans/${planId}/change-paths`,
  },

  agreements: {
    list: (opts: {
      clubId?: string; memberId?: string; status?: number; planId?: string;
      endingBefore?: string; page?: number; size?: number;
    } = {}) => `${BASE}/agreements${qs({ ...page(opts), clubId: opts.clubId, memberId: opts.memberId,
      status: opts.status, planId: opts.planId, endingBefore: opts.endingBefore })}`,
    getById: (id: string) => `${BASE}/agreements/${id}`,
    create: `${BASE}/agreements`,
    sign: `${BASE}/agreements/sign`,
    signRemote: `${BASE}/agreements/sign/remote`,

    previewPlanChange: (id: string, newPlanId: string, effectiveOn?: string) =>
      `${BASE}/agreements/${id}/plan-change/preview${qs({ newPlanId, effectiveOn })}`,
    changePlan: `${BASE}/agreements/plan-change`,

    previewFreeze: `${BASE}/agreements/freezes/preview`,
    freeze: `${BASE}/agreements/freezes`,
    endFreeze: `${BASE}/agreements/freezes/end`,
    freezes: (clubId?: string, memberId?: string, activeOnly = true) =>
      `${BASE}/agreements/freezes${qs({ clubId, memberId, activeOnly })}`,
    releaseDueFreezes: `${BASE}/agreements/freezes/release-due`,

    suspend: `${BASE}/agreements/suspensions`,
    liftSuspension: (id: string, reason?: string) =>
      `${BASE}/agreements/suspensions/${id}/lift${qs({ reason })}`,
    liftResolved: `${BASE}/agreements/suspensions/lift-resolved`,

    previewCancellation: (id: string, requestedEffectiveOn?: string) =>
      `${BASE}/agreements/${id}/cancellation/preview${qs({ requestedEffectiveOn })}`,
    requestCancellation: `${BASE}/agreements/cancellation`,
    makeSaveOffer: `${BASE}/agreements/cancellation/offer`,
    respondToOffer: `${BASE}/agreements/cancellation/offer/respond`,
    processCancellation: (id: string) => `${BASE}/agreements/cancellation/${id}/process`,
    pendingCancellations: (clubId?: string) => `${BASE}/agreements/cancellation/pending${qs({ clubId })}`,
    processDueCancellations: `${BASE}/agreements/cancellation/process-due`,
  },

  billing: {
    schedule: (agreementId: string) => `${BASE}/billing/schedules/${agreementId}`,
    rebuildSchedule: (agreementId: string) => `${BASE}/billing/schedules/${agreementId}/rebuild`,

    startRun: `${BASE}/billing/runs`,
    run: (id: string) => `${BASE}/billing/runs/${id}`,
    runLines: (id: string, opts: { outcome?: string; page?: number; size?: number } = {}) =>
      `${BASE}/billing/runs/${id}/lines${qs({ ...page(opts), outcome: opts.outcome })}`,
    runs: (opts: { clubId?: string; from?: string; to?: string; page?: number; size?: number } = {}) =>
      `${BASE}/billing/runs${qs({ ...page(opts), clubId: opts.clubId, from: opts.from, to: opts.to })}`,
    runScheduled: `${BASE}/billing/runs/scheduled`,

    invoices: (opts: {
      clubId?: string; memberId?: string; status?: number; from?: string; to?: string;
      overdueOnly?: boolean; page?: number; size?: number;
    } = {}) => `${BASE}/billing/invoices${qs({ ...page(opts), clubId: opts.clubId,
      memberId: opts.memberId, status: opts.status, from: opts.from, to: opts.to,
      overdueOnly: opts.overdueOnly })}`,
    invoice: (id: string) => `${BASE}/billing/invoices/${id}`,
    createInvoice: (memberId: string, clubId: string) =>
      `${BASE}/billing/invoices${qs({ memberId, clubId })}`,
    cancelInvoice: (id: string, reason: string) => `${BASE}/billing/invoices/${id}/cancel${qs({ reason })}`,

    takePayment: `${BASE}/billing/payments`,
    payments: (opts: {
      clubId?: string; memberId?: string; status?: number; from?: string; to?: string;
      page?: number; size?: number;
    } = {}) => `${BASE}/billing/payments${qs({ ...page(opts), clubId: opts.clubId,
      memberId: opts.memberId, status: opts.status, from: opts.from, to: opts.to })}`,

    paymentMethods: (memberId: string) => `${BASE}/billing/payment-methods/${memberId}`,
    savePaymentMethod: `${BASE}/billing/payment-methods`,
    deletePaymentMethod: (id: string) => `${BASE}/billing/payment-methods/${id}`,

    creditNote: `${BASE}/billing/credit-notes`,
    refund: `${BASE}/billing/refunds`,
    writeOff: (memberId: string, amount: number, reason: string, invoiceId?: string) =>
      `${BASE}/billing/write-offs${qs({ memberId, amount, reason, invoiceId })}`,

    deferredRevenue: (from: string, to: string, clubId?: string) =>
      `${BASE}/billing/deferred-revenue${qs({ from, to, clubId })}`,
    recogniseDue: `${BASE}/billing/deferred-revenue/recognise-due`,
  },

  collections: {
    cases: (opts: {
      clubId?: string; status?: number; assignedStaffId?: string; page?: number; size?: number;
    } = {}) => `${BASE}/collections/cases${qs({ ...page(opts), clubId: opts.clubId,
      status: opts.status, assignedStaffId: opts.assignedStaffId })}`,
    case: (id: string) => `${BASE}/collections/cases/${id}`,
    openCase: (invoiceId: string, reason: number) =>
      `${BASE}/collections/cases${qs({ invoiceId, reason })}`,
    action: `${BASE}/collections/cases/action`,
    processDue: `${BASE}/collections/process-due`,

    policies: (clubId?: string) => `${BASE}/collections/policies${qs({ clubId })}`,
    savePolicy: (id?: string) => `${BASE}/collections/policies${qs({ id })}`,

    arrears: (clubId?: string, asAt?: string) => `${BASE}/collections/arrears${qs({ clubId, asAt })}`,
  },

  access: {
    decide: `${BASE}/access/decide`,
    manualCheckIn: `${BASE}/access/check-in/manual`,
    checkOut: (checkInId: string) => `${BASE}/access/check-out/${checkInId}`,
    sweep: `${BASE}/access/check-ins/sweep`,

    occupancy: (clubId: string) => `${BASE}/access/occupancy/${clubId}`,
    occupancyTrend: (clubId: string, from: string, to: string) =>
      `${BASE}/access/occupancy/${clubId}/trend${qs({ from, to })}`,

    events: (opts: {
      clubId?: string; doorId?: string; memberId?: string; decision?: number;
      from?: string; to?: string; page?: number; size?: number;
    } = {}) => `${BASE}/access/events${qs({ ...page(opts), clubId: opts.clubId, doorId: opts.doorId,
      memberId: opts.memberId, decision: opts.decision, from: opts.from, to: opts.to })}`,
    checkIns: (opts: {
      clubId?: string; memberId?: string; from?: string; to?: string; page?: number; size?: number;
    } = {}) => `${BASE}/access/check-ins${qs({ ...page(opts), clubId: opts.clubId,
      memberId: opts.memberId, from: opts.from, to: opts.to })}`,

    doors: (clubId?: string) => `${BASE}/access/doors${qs({ clubId })}`,
    saveDoor: (id?: string) => `${BASE}/access/doors${qs({ id })}`,
    deleteDoor: (id: string) => `${BASE}/access/doors/${id}`,
    releaseDoor: (id: string, reason: string) => `${BASE}/access/doors/${id}/release${qs({ reason })}`,

    controllers: (clubId?: string) => `${BASE}/access/controllers${qs({ clubId })}`,
    saveController: (id?: string) => `${BASE}/access/controllers${qs({ id })}`,
    controllerCache: (id: string) => `${BASE}/access/controllers/${id}/cache`,
    heartbeat: (id: string, pendingEvents = 0) =>
      `${BASE}/access/controllers/${id}/heartbeat${qs({ pendingEvents })}`,
    replay: (id: string) => `${BASE}/access/controllers/${id}/replay`,

    rules: (clubId?: string) => `${BASE}/access/rules${qs({ clubId })}`,
    saveRule: (id?: string) => `${BASE}/access/rules${qs({ id })}`,

    registerGuest: `${BASE}/access/guests`,
    issueDayPass: `${BASE}/access/day-passes`,
    dayPasses: (opts: { clubId?: string; from?: string; to?: string; page?: number; size?: number } = {}) =>
      `${BASE}/access/day-passes${qs({ ...page(opts), clubId: opts.clubId, from: opts.from, to: opts.to })}`,

    frontDesk: (clubId: string, staffId?: string) => `${BASE}/access/front-desk/${clubId}${qs({ staffId })}`,
  },

  classes: {
    types: (clubId?: string, activeOnly = true) => `${BASE}/classes/types${qs({ clubId, activeOnly })}`,
    saveType: (id?: string) => `${BASE}/classes/types${qs({ id })}`,
    deleteType: (id: string) => `${BASE}/classes/types/${id}`,

    schedules: (clubId: string, seasonCode?: string, publishedOnly = false) =>
      `${BASE}/classes/schedules${qs({ clubId, seasonCode, publishedOnly })}`,
    saveSchedule: (id?: string) => `${BASE}/classes/schedules${qs({ id })}`,
    deleteSchedule: (id: string, cancelFutureOccurrences = true) =>
      `${BASE}/classes/schedules/${id}${qs({ cancelFutureOccurrences })}`,
    conflicts: (clubId: string, seasonCode?: string) =>
      `${BASE}/classes/schedules/conflicts${qs({ clubId, seasonCode })}`,
    publishSchedule: (id: string) => `${BASE}/classes/schedules/${id}/publish`,
    generateOccurrences: (clubId?: string) => `${BASE}/classes/occurrences/generate${qs({ clubId })}`,

    timetable: (opts: {
      clubId: string; from: string; to: string; classTypeId?: string;
      instructorStaffId?: string; roomId?: string; viewerMemberId?: string;
    }) => `${BASE}/classes/timetable${qs(opts as unknown as Record<string, unknown>)}`,

    occurrence: (id: string, viewerMemberId?: string) =>
      `${BASE}/classes/occurrences/${id}${qs({ viewerMemberId })}`,
    updateOccurrence: `${BASE}/classes/occurrences`,
    cancelOccurrence: `${BASE}/classes/occurrences/cancel`,

    eligibility: (occurrenceId: string, memberId: string) =>
      `${BASE}/classes/occurrences/${occurrenceId}/eligibility${qs({ memberId })}`,
    book: `${BASE}/classes/bookings`,
    previewCancel: (bookingId: string) => `${BASE}/classes/bookings/${bookingId}/cancel/preview`,
    cancelBooking: `${BASE}/classes/bookings/cancel`,
    checkIn: (bookingId: string) => `${BASE}/classes/bookings/${bookingId}/check-in`,
    memberBookings: (memberId: string, opts: { from?: string; to?: string; upcomingOnly?: boolean } = {}) =>
      `${BASE}/classes/bookings/member/${memberId}${qs(opts as Record<string, unknown>)}`,
    markAttendance: `${BASE}/classes/attendance`,

    processWaitlists: `${BASE}/classes/waitlists/process`,
    processFinished: `${BASE}/classes/occurrences/process-finished`,

    bookingPolicies: (clubId?: string) => `${BASE}/classes/policies/booking${qs({ clubId })}`,
    saveBookingPolicy: (id?: string) => `${BASE}/classes/policies/booking${qs({ id })}`,
    cancellationPolicies: (clubId?: string) => `${BASE}/classes/policies/cancellation${qs({ clubId })}`,
    saveCancellationPolicy: (id?: string) => `${BASE}/classes/policies/cancellation${qs({ id })}`,

    strikes: (memberId: string, activeOnly = true) =>
      `${BASE}/classes/strikes/${memberId}${qs({ activeOnly })}`,
    waiveStrike: (id: string, reason: string) => `${BASE}/classes/strikes/${id}/waive${qs({ reason })}`,
  },

  appointments: {
    staff: (clubId?: string, serviceId?: string, activeOnly = true) =>
      `${BASE}/appointments/staff${qs({ clubId, serviceId, activeOnly })}`,
    saveStaff: (id?: string) => `${BASE}/appointments/staff${qs({ id })}`,
    saveAvailability: (bookableStaffId: string) =>
      `${BASE}/appointments/staff/${bookableStaffId}/availability`,
    addTimeOff: `${BASE}/appointments/staff/time-off`,
    findAvailability: `${BASE}/appointments/availability/search`,

    list: (opts: {
      clubId?: string; staffId?: string; memberId?: string; status?: number;
      from?: string; to?: string; page?: number; size?: number;
    } = {}) => `${BASE}/appointments${qs({ ...page(opts), clubId: opts.clubId, staffId: opts.staffId,
      memberId: opts.memberId, status: opts.status, from: opts.from, to: opts.to })}`,
    getById: (id: string) => `${BASE}/appointments/${id}`,
    diary: (clubId: string, forDate: string, staffId?: string) =>
      `${BASE}/appointments/diary${qs({ clubId, forDate, staffId })}`,
    create: `${BASE}/appointments`,
    reschedule: (id: string, newStart: string, newStaffId?: string) =>
      `${BASE}/appointments/${id}/reschedule${qs({ newStart, newStaffId })}`,
    cancel: (id: string, reason?: string, waivePenalty = false) =>
      `${BASE}/appointments/${id}/cancel${qs({ reason, waivePenalty })}`,
    checkIn: (id: string, memberId?: string) => `${BASE}/appointments/${id}/check-in${qs({ memberId })}`,
    signOff: `${BASE}/appointments/sign-off`,
    noShow: (id: string, memberId?: string, waivePenalty = false) =>
      `${BASE}/appointments/${id}/no-show${qs({ memberId, waivePenalty })}`,

    sellPackage: `${BASE}/appointments/packages`,
    packages: (clubId?: string, memberId?: string, activeOnly = true) =>
      `${BASE}/appointments/packages${qs({ clubId, memberId, activeOnly })}`,
    credits: (memberId: string) => `${BASE}/appointments/credits/${memberId}`,
    adjustCredits: `${BASE}/appointments/credits/adjust`,
    expireDue: `${BASE}/appointments/credits/expire-due`,

    assignCoach: (memberId: string, staffId: string, isPrimary = true) =>
      `${BASE}/appointments/coaches/assign${qs({ memberId, staffId, isPrimary })}`,
    coachClients: (staffId: string, activeOnly = true) =>
      `${BASE}/appointments/coaches/${staffId}/clients${qs({ activeOnly })}`,
    trainerDay: (staffId: string, forDate: string) =>
      `${BASE}/appointments/trainer-day/${staffId}${qs({ forDate })}`,
  },

  training: {
    exercises: (opts: { category?: number; search?: string; page?: number; size?: number } = {}) =>
      `${BASE}/training/exercises${qs({ ...page({ ...opts, size: opts.size ?? 50 }),
        category: opts.category, search: opts.search })}`,
    saveExercise: (id?: string) => `${BASE}/training/exercises${qs({ id })}`,

    workouts: (opts: {
      clubId?: string; benchmarksOnly?: boolean; templatesOnly?: boolean;
      search?: string; page?: number; size?: number;
    } = {}) => `${BASE}/training/workouts${qs({ ...page(opts), clubId: opts.clubId,
      benchmarksOnly: opts.benchmarksOnly, templatesOnly: opts.templatesOnly, search: opts.search })}`,
    workout: (id: string) => `${BASE}/training/workouts/${id}`,
    saveWorkout: (id?: string) => `${BASE}/training/workouts${qs({ id })}`,
    deleteWorkout: (id: string) => `${BASE}/training/workouts/${id}`,

    tracks: (clubId?: string, activeOnly = true) => `${BASE}/training/tracks${qs({ clubId, activeOnly })}`,
    saveTrack: (id?: string) => `${BASE}/training/tracks${qs({ id })}`,
    programming: (clubId: string, from: string, to: string, trackId?: string) =>
      `${BASE}/training/programming${qs({ clubId, from, to, trackId })}`,
    saveProgramDay: (id?: string) => `${BASE}/training/programming${qs({ id })}`,
    publishProgramDay: (id: string) => `${BASE}/training/programming/${id}/publish`,
    wodBoard: (clubId: string, forDate: string) => `${BASE}/training/wod-board${qs({ clubId, forDate })}`,

    logResult: `${BASE}/training/results`,
    results: (opts: {
      memberId?: string; workoutId?: string; clubId?: string; from?: string; to?: string;
      page?: number; size?: number;
    } = {}) => `${BASE}/training/results${qs({ ...page(opts), memberId: opts.memberId,
      workoutId: opts.workoutId, clubId: opts.clubId, from: opts.from, to: opts.to })}`,
    personalRecords: (memberId: string) => `${BASE}/training/personal-records/${memberId}`,
    leaderboard: (opts: {
      clubId: string; workoutId?: string; classOccurrenceId?: string; challengeId?: string;
      division?: string; from?: string; to?: string; viewerMemberId?: string;
    }) => `${BASE}/training/leaderboard${qs(opts as unknown as Record<string, unknown>)}`,

    recordEffort: `${BASE}/training/effort`,
    effortSessions: (memberId: string, from?: string, to?: string) =>
      `${BASE}/training/effort/${memberId}${qs({ from, to })}`,
    streak: (memberId: string, cadence = 'Weekly') =>
      `${BASE}/training/streaks/${memberId}${qs({ cadence })}`,

    ladders: (clubId?: string) => `${BASE}/training/ladders${qs({ clubId })}`,
    saveLadder: (id?: string) => `${BASE}/training/ladders${qs({ id })}`,
    memberRanks: (memberId: string) => `${BASE}/training/ranks/${memberId}`,
    gradingCandidates: (clubId: string, ladderId: string) =>
      `${BASE}/training/ranks/candidates${qs({ clubId, ladderId })}`,
    awardRank: `${BASE}/training/ranks/award`,
    saveGradingEvent: (id?: string) => `${BASE}/training/grading-events${qs({ id })}`,

    grantClearance: `${BASE}/training/clearances`,
    clearances: (memberId: string, activeOnly = true) =>
      `${BASE}/training/clearances/${memberId}${qs({ activeOnly })}`,
  },

  assessments: {
    templates: (clubId?: string, activeOnly = true) =>
      `${BASE}/assessments/templates${qs({ clubId, activeOnly })}`,
    saveTemplate: (id?: string) => `${BASE}/assessments/templates${qs({ id })}`,

    list: (opts: {
      clubId?: string; memberId?: string; staffId?: string; from?: string; to?: string;
      page?: number; size?: number;
    } = {}) => `${BASE}/assessments${qs({ ...page(opts), clubId: opts.clubId, memberId: opts.memberId,
      staffId: opts.staffId, from: opts.from, to: opts.to })}`,
    getById: (id: string) => `${BASE}/assessments/${id}`,
    record: `${BASE}/assessments`,
    progress: (memberId: string, measureNames?: string[]) => {
      const search = new URLSearchParams();
      (measureNames ?? []).forEach(n => search.append('measureNames', n));
      const text = search.toString();
      return `${BASE}/assessments/progress/${memberId}${text ? `?${text}` : ''}`;
    },

    addPhoto: `${BASE}/assessments/photos`,
    photos: (memberId: string) => `${BASE}/assessments/photos/${memberId}`,

    goals: (memberId: string, activeOnly = true) =>
      `${BASE}/assessments/goals/${memberId}${qs({ activeOnly })}`,
    saveGoal: (id?: string) => `${BASE}/assessments/goals${qs({ id })}`,

    saveNutritionPlan: (id?: string) => `${BASE}/assessments/nutrition${qs({ id })}`,
    nutritionPlans: (memberId: string, activeOnly = true) =>
      `${BASE}/assessments/nutrition/${memberId}${qs({ activeOnly })}`,

    saveHabit: (id?: string) => `${BASE}/assessments/habits${qs({ id })}`,
    habits: (memberId: string, activeOnly = true) =>
      `${BASE}/assessments/habits/${memberId}${qs({ activeOnly })}`,
    logHabit: (id: string, forDate: string, completed = true, value?: number, note?: string) =>
      `${BASE}/assessments/habits/${id}/log${qs({ forDate, completed, value, note })}`,

    checkIns: (staffId?: string, memberId?: string, dueOnly = false) =>
      `${BASE}/assessments/check-ins${qs({ staffId, memberId, dueOnly })}`,
    saveCheckIn: (id?: string) => `${BASE}/assessments/check-ins${qs({ id })}`,
  },

  leads: {
    board: (clubId?: string, assignedStaffId?: string) =>
      `${BASE}/leads/board${qs({ clubId, assignedStaffId })}`,
    list: (opts: {
      clubId?: string; status?: number; sourceId?: string; assignedStaffId?: string;
      slaBreached?: boolean; from?: string; to?: string; search?: string;
      page?: number; size?: number;
    } = {}) => `${BASE}/leads${qs({ ...page(opts), clubId: opts.clubId, status: opts.status,
      sourceId: opts.sourceId, assignedStaffId: opts.assignedStaffId, slaBreached: opts.slaBreached,
      from: opts.from, to: opts.to, search: opts.search })}`,
    getById: (id: string) => `${BASE}/leads/${id}`,
    create: `${BASE}/leads`,
    update: (id: string) => `${BASE}/leads/${id}`,
    assign: (id: string, staffId: string) => `${BASE}/leads/${id}/assign${qs({ staffId })}`,
    logActivity: `${BASE}/leads/activities`,
    moveStage: (id: string, status: number) => `${BASE}/leads/${id}/stage${qs({ status })}`,
    close: `${BASE}/leads/close`,
    convert: (id: string) => `${BASE}/leads/${id}/convert`,

    bookTour: `${BASE}/leads/tours`,
    updateTour: (id: string) => `${BASE}/leads/tours/${id}`,
    tours: (clubId: string, from: string, to: string, staffId?: string) =>
      `${BASE}/leads/tours${qs({ clubId, from, to, staffId })}`,

    issueTrial: `${BASE}/leads/trials`,
    trials: (clubId?: string, activeOnly = true) => `${BASE}/leads/trials${qs({ clubId, activeOnly })}`,

    createReferral: `${BASE}/leads/referrals`,
    referrals: (clubId?: string, memberId?: string, converted?: boolean) =>
      `${BASE}/leads/referrals${qs({ clubId, memberId, converted })}`,

    sources: (clubId?: string, activeOnly = true) => `${BASE}/leads/sources${qs({ clubId, activeOnly })}`,
    saveSource: (id?: string) => `${BASE}/leads/sources${qs({ id })}`,
    lossReasons: `${BASE}/leads/loss-reasons`,
    targets: (clubId?: string, periodStart?: string) => `${BASE}/leads/targets${qs({ clubId, periodStart })}`,
    saveTarget: (id?: string) => `${BASE}/leads/targets${qs({ id })}`,
    flagSlaBreaches: `${BASE}/leads/flag-sla-breaches`,
  },

  retention: {
    board: (clubId?: string, band?: number, ownerStaffId?: string) =>
      `${BASE}/retention/board${qs({ clubId, band, ownerStaffId })}`,
    score: (memberId: string) => `${BASE}/retention/scores/${memberId}`,
    scoreAll: (clubId?: string) => `${BASE}/retention/scores/run${qs({ clubId })}`,

    tasks: (clubId?: string, staffId?: string, openOnly = true) =>
      `${BASE}/retention/tasks${qs({ clubId, staffId, openOnly })}`,
    createTask: `${BASE}/retention/tasks`,
    completeTask: `${BASE}/retention/tasks/complete`,

    journeys: (clubId?: string) => `${BASE}/retention/journeys${qs({ clubId })}`,
    saveJourney: (id?: string) => `${BASE}/retention/journeys${qs({ id })}`,
    setJourneyActive: (id: string, active: boolean) =>
      `${BASE}/retention/journeys/${id}/active${qs({ active })}`,
    enrolments: (journeyId: string, activeOnly = true) =>
      `${BASE}/retention/journeys/${journeyId}/enrolments${qs({ activeOnly })}`,
    processJourneys: `${BASE}/retention/journeys/process`,

    campaigns: (clubId?: string, opts: { page?: number; size?: number } = {}) =>
      `${BASE}/retention/campaigns${qs({ ...page(opts), clubId })}`,
    saveCampaign: (id?: string) => `${BASE}/retention/campaigns${qs({ id })}`,
    sendCampaign: `${BASE}/retention/campaigns/send`,

    templates: (clubId?: string, channel?: number) =>
      `${BASE}/retention/templates${qs({ clubId, channel })}`,
    saveTemplate: (id?: string) => `${BASE}/retention/templates${qs({ id })}`,

    segments: (clubId?: string) => `${BASE}/retention/segments${qs({ clubId })}`,
    saveSegment: (id?: string) => `${BASE}/retention/segments${qs({ id })}`,
    previewSegment: (id: string, opts: { page?: number; size?: number } = {}) =>
      `${BASE}/retention/segments/${id}/preview${qs(page(opts))}`,

    messages: (opts: {
      clubId?: string; memberId?: string; channel?: number; status?: number;
      from?: string; to?: string; page?: number; size?: number;
    } = {}) => `${BASE}/retention/messages${qs({ ...page(opts), clubId: opts.clubId,
      memberId: opts.memberId, channel: opts.channel, status: opts.status,
      from: opts.from, to: opts.to })}`,

    loyalty: (memberId: string) => `${BASE}/retention/loyalty/${memberId}`,
    awardPoints: `${BASE}/retention/loyalty/award`,
    redeemPoints: `${BASE}/retention/loyalty/redeem`,
    tiers: (clubId?: string) => `${BASE}/retention/loyalty/tiers${qs({ clubId })}`,
    saveTier: (id?: string) => `${BASE}/retention/loyalty/tiers${qs({ id })}`,

    challenges: (clubId?: string, activeOnly = true, viewerMemberId?: string) =>
      `${BASE}/retention/challenges${qs({ clubId, activeOnly, viewerMemberId })}`,
    saveChallenge: (id?: string) => `${BASE}/retention/challenges${qs({ id })}`,
    joinChallenge: (id: string, memberId: string, teamName?: string) =>
      `${BASE}/retention/challenges/${id}/join${qs({ memberId, teamName })}`,
    processChallenges: `${BASE}/retention/challenges/process`,

    badges: (clubId?: string) => `${BASE}/retention/badges${qs({ clubId })}`,
    memberBadges: (memberId: string) => `${BASE}/retention/badges/${memberId}`,

    recordNps: `${BASE}/retention/nps`,
    npsSummary: (from: string, to: string, clubId?: string) =>
      `${BASE}/retention/nps/summary${qs({ from, to, clubId })}`,
    npsResponses: (opts: {
      clubId?: string; band?: string; needsFollowUpOnly?: boolean; page?: number; size?: number;
    } = {}) => `${BASE}/retention/nps${qs({ ...page(opts), clubId: opts.clubId, band: opts.band,
      needsFollowUpOnly: opts.needsFollowUpOnly })}`,
    followUpNps: (id: string, note: string) => `${BASE}/retention/nps/${id}/follow-up${qs({ note })}`,

    recordFeedback: `${BASE}/retention/feedback`,
    feedback: (clubId?: string, openOnly = false, opts: { page?: number; size?: number } = {}) =>
      `${BASE}/retention/feedback${qs({ ...page(opts), clubId, openOnly })}`,

    announcements: (clubId?: string, liveOnly = true) =>
      `${BASE}/retention/announcements${qs({ clubId, liveOnly })}`,
    saveAnnouncement: (id?: string) => `${BASE}/retention/announcements${qs({ id })}`,
  },

  staff: {
    list: (opts: {
      clubId?: string; role?: number; activeOnly?: boolean; search?: string;
      page?: number; size?: number;
    } = {}) => `${BASE}/staff${qs({ ...page({ ...opts, size: opts.size ?? 50 }), clubId: opts.clubId,
      role: opts.role, activeOnly: opts.activeOnly ?? true, search: opts.search })}`,
    getById: (id: string) => `${BASE}/staff/${id}`,
    create: `${BASE}/staff`,
    update: (id: string) => `${BASE}/staff/${id}`,
    deactivate: (id: string, leftOn: string) => `${BASE}/staff/${id}/deactivate${qs({ leftOn })}`,

    verifyPin: `${BASE}/staff/pin/verify`,
    verifyOverride: `${BASE}/staff/override/verify`,

    roles: (clubId?: string) => `${BASE}/staff/roles${qs({ clubId })}`,
    saveRole: (id?: string) => `${BASE}/staff/roles${qs({ id })}`,

    certifications: (clubId?: string, staffId?: string, expiringOnly = false) =>
      `${BASE}/staff/certifications${qs({ clubId, staffId, expiringOnly })}`,
    saveCertification: (id?: string) => `${BASE}/staff/certifications${qs({ id })}`,

    rota: (clubId: string, from: string, to: string) => `${BASE}/staff/rota${qs({ clubId, from, to })}`,
    saveShift: (id?: string) => `${BASE}/staff/shifts${qs({ id })}`,
    deleteShift: (id: string) => `${BASE}/staff/shifts/${id}`,
    publishRota: (clubId: string, from: string, to: string) =>
      `${BASE}/staff/rota/publish${qs({ clubId, from, to })}`,
    requestSwap: (assignmentId: string, offerToStaffId?: string, reason?: string) =>
      `${BASE}/staff/shifts/${assignmentId}/swap${qs({ offerToStaffId, reason })}`,
    respondToSwap: (id: string, accept: boolean, staffId: string) =>
      `${BASE}/staff/swaps/${id}/respond${qs({ accept, staffId })}`,
    swaps: (clubId: string, openOnly = true) => `${BASE}/staff/swaps${qs({ clubId, openOnly })}`,

    clockIn: `${BASE}/staff/clock/in`,
    clockOut: `${BASE}/staff/clock/out`,
    timesheet: (staffId: string, from: string, to: string) =>
      `${BASE}/staff/timesheets/${staffId}${qs({ from, to })}`,
    adjustEntry: (id: string, opts: { inAt?: string; outAt?: string; breakMinutes?: number; note: string }) =>
      `${BASE}/staff/timesheets/entries/${id}/adjust${qs(opts as unknown as Record<string, unknown>)}`,
    approveTimesheet: (staffId: string, from: string, to: string) =>
      `${BASE}/staff/timesheets/${staffId}/approve${qs({ from, to })}`,

    commissionRules: (clubId?: string, staffId?: string) =>
      `${BASE}/staff/commission/rules${qs({ clubId, staffId })}`,
    saveCommissionRule: (id?: string) => `${BASE}/staff/commission/rules${qs({ id })}`,
    generateStatements: `${BASE}/staff/commission/statements/generate`,
    statement: (id: string) => `${BASE}/staff/commission/statements/${id}`,
    statements: (opts: {
      clubId?: string; staffId?: string; status?: number; page?: number; size?: number;
    } = {}) => `${BASE}/staff/commission/statements${qs({ ...page(opts), clubId: opts.clubId,
      staffId: opts.staffId, status: opts.status })}`,
    approveStatement: `${BASE}/staff/commission/statements/approve`,
    exportStatement: (id: string) => `${BASE}/staff/commission/statements/${id}/export`,
  },

  facilities: {
    lockerBanks: (clubId: string) => `${BASE}/facilities/locker-banks/${clubId}`,
    saveLockerBank: (id?: string) => `${BASE}/facilities/locker-banks${qs({ id })}`,
    assignLocker: `${BASE}/facilities/lockers/assign`,
    releaseLocker: `${BASE}/facilities/lockers/release`,
    lockerAssignments: (opts: {
      clubId?: string; memberId?: string; activeOnly?: boolean; page?: number; size?: number;
    } = {}) => `${BASE}/facilities/lockers/assignments${qs({ ...page(opts), clubId: opts.clubId,
      memberId: opts.memberId, activeOnly: opts.activeOnly ?? true })}`,
    sweepLockers: `${BASE}/facilities/lockers/sweep`,

    resources: (clubId: string, kind?: number, activeOnly = true) =>
      `${BASE}/facilities/resources${qs({ clubId, kind, activeOnly })}`,
    saveResource: (id?: string) => `${BASE}/facilities/resources${qs({ id })}`,
    grid: (clubId: string, forDate: string, kind?: number) =>
      `${BASE}/facilities/resources/grid${qs({ clubId, forDate, kind })}`,
    bookResource: `${BASE}/facilities/resources/bookings`,
    cancelResourceBooking: (id: string, reason?: string, waivePenalty = false) =>
      `${BASE}/facilities/resources/bookings/${id}/cancel${qs({ reason, waivePenalty })}`,
    checkInResourceBooking: (id: string) => `${BASE}/facilities/resources/bookings/${id}/check-in`,
    resourceBookings: (opts: {
      clubId?: string; memberId?: string; resourceId?: string; from?: string; to?: string;
      page?: number; size?: number;
    } = {}) => `${BASE}/facilities/resources/bookings${qs({ ...page(opts), clubId: opts.clubId,
      memberId: opts.memberId, resourceId: opts.resourceId, from: opts.from, to: opts.to })}`,

    equipment: (opts: {
      clubId?: string; status?: number; category?: string; search?: string;
      page?: number; size?: number;
    } = {}) => `${BASE}/facilities/equipment${qs({ ...page({ ...opts, size: opts.size ?? 50 }),
      clubId: opts.clubId, status: opts.status, category: opts.category, search: opts.search })}`,
    asset: (id: string) => `${BASE}/facilities/equipment/${id}`,
    assetByQr: (qrCode: string) => `${BASE}/facilities/equipment/qr/${encodeURIComponent(qrCode)}`,
    saveAsset: (id?: string) => `${BASE}/facilities/equipment${qs({ id })}`,
    setAssetStatus: (id: string, status: number, note?: string) =>
      `${BASE}/facilities/equipment/${id}/status${qs({ status, note })}`,
    recordUsage: (id: string, cumulativeHours: number, source?: string) =>
      `${BASE}/facilities/equipment/${id}/usage${qs({ cumulativeHours, source })}`,

    maintenance: (clubId?: string, dueOnly = false) =>
      `${BASE}/facilities/maintenance${qs({ clubId, dueOnly })}`,
    saveMaintenance: (id?: string) => `${BASE}/facilities/maintenance${qs({ id })}`,
    generateDueWorkOrders: `${BASE}/facilities/maintenance/generate-due`,

    workOrders: (opts: {
      clubId?: string; status?: number; priority?: number; assignedStaffId?: string;
      page?: number; size?: number;
    } = {}) => `${BASE}/facilities/work-orders${qs({ ...page(opts), clubId: opts.clubId,
      status: opts.status, priority: opts.priority, assignedStaffId: opts.assignedStaffId })}`,
    saveWorkOrder: (id?: string) => `${BASE}/facilities/work-orders${qs({ id })}`,
    completeWorkOrder: `${BASE}/facilities/work-orders/complete`,

    reportFault: `${BASE}/facilities/faults`,
    faults: (clubId?: string, openOnly = true) => `${BASE}/facilities/faults${qs({ clubId, openOnly })}`,
  },

  compliance: {
    waiverTemplates: (clubId?: string, publishedOnly = false) =>
      `${BASE}/compliance/waivers/templates${qs({ clubId, publishedOnly })}`,
    saveWaiverTemplate: (id?: string) => `${BASE}/compliance/waivers/templates${qs({ id })}`,
    publishWaiver: (id: string) => `${BASE}/compliance/waivers/templates/${id}/publish`,
    signWaiver: `${BASE}/compliance/waivers/sign`,
    signatures: (memberId?: string, clubId?: string, status?: number) =>
      `${BASE}/compliance/waivers/signatures${qs({ memberId, clubId, status })}`,
    outstandingWaivers: (clubId?: string, opts: { page?: number; size?: number } = {}) =>
      `${BASE}/compliance/waivers/outstanding${qs({ ...page(opts), clubId })}`,

    screeningForm: (clubId?: string) => `${BASE}/compliance/screening/form${qs({ clubId })}`,
    submitScreening: `${BASE}/compliance/screening`,
    screening: (memberId: string) => `${BASE}/compliance/screening/${memberId}`,
    submitClearance: `${BASE}/compliance/clearances`,
    reviewClearance: `${BASE}/compliance/clearances/review`,
    clearances: (clubId?: string, status?: number) =>
      `${BASE}/compliance/clearances${qs({ clubId, status })}`,

    incidents: (opts: {
      clubId?: string; kind?: number; status?: number; severity?: number;
      from?: string; to?: string; page?: number; size?: number;
    } = {}) => `${BASE}/compliance/incidents${qs({ ...page(opts), clubId: opts.clubId,
      kind: opts.kind, status: opts.status, severity: opts.severity, from: opts.from, to: opts.to })}`,
    incident: (id: string) => `${BASE}/compliance/incidents/${id}`,
    saveIncident: (id?: string) => `${BASE}/compliance/incidents${qs({ id })}`,
    addIncidentAction: (id: string) => `${BASE}/compliance/incidents/${id}/actions`,
    closeIncident: (id: string, rootCause: string, preventiveAction: string) =>
      `${BASE}/compliance/incidents/${id}/close${qs({ rootCause, preventiveAction })}`,

    complaints: (clubId?: string, status?: number, opts: { page?: number; size?: number } = {}) =>
      `${BASE}/compliance/complaints${qs({ ...page(opts), clubId, status })}`,
    saveComplaint: (id?: string) => `${BASE}/compliance/complaints${qs({ id })}`,
    resolveComplaint: `${BASE}/compliance/complaints/resolve`,

    lostProperty: (clubId?: string, status?: number, opts: { page?: number; size?: number } = {}) =>
      `${BASE}/compliance/lost-property${qs({ ...page(opts), clubId, status })}`,
    saveLostProperty: (id?: string) => `${BASE}/compliance/lost-property${qs({ id })}`,
    claimLostProperty: `${BASE}/compliance/lost-property/claim`,

    checks: (clubId: string, dueTodayOnly = false) =>
      `${BASE}/compliance/checks${qs({ clubId, dueTodayOnly })}`,
    saveCheck: (id?: string) => `${BASE}/compliance/checks${qs({ id })}`,
    submitCheck: `${BASE}/compliance/checks/submit`,

    saveHandover: `${BASE}/compliance/handovers`,
    handovers: (clubId: string, limit = 20) => `${BASE}/compliance/handovers${qs({ clubId, limit })}`,

    audit: (opts: {
      clubId?: string; memberId?: string; actorUserId?: string; entityType?: string;
      sensitiveOnly?: boolean; from?: string; to?: string; page?: number; size?: number;
    } = {}) => `${BASE}/compliance/audit${qs({ ...page(opts), clubId: opts.clubId,
      memberId: opts.memberId, actorUserId: opts.actorUserId, entityType: opts.entityType,
      sensitiveOnly: opts.sensitiveOnly, from: opts.from, to: opts.to })}`,
  },

  commerce: {
    products: (clubId: string, search?: string) =>
      `${BASE}/commerce/products/${clubId}${qs({ search })}`,
    createSale: `${BASE}/commerce/sales`,
    returnSale: (id: string, reason: string) => `${BASE}/commerce/sales/${id}/return${qs({ reason })}`,
    sales: (opts: {
      clubId?: string; memberId?: string; from?: string; to?: string; page?: number; size?: number;
    } = {}) => `${BASE}/commerce/sales${qs({ ...page(opts), clubId: opts.clubId,
      memberId: opts.memberId, from: opts.from, to: opts.to })}`,
    houseAccount: (memberId: string, unsettledOnly = true) =>
      `${BASE}/commerce/house-account/${memberId}${qs({ unsettledOnly })}`,

    openSession: `${BASE}/commerce/cash-sessions`,
    openSessionFor: (clubId: string, staffId?: string) =>
      `${BASE}/commerce/cash-sessions/open${qs({ clubId, staffId })}`,
    session: (id: string) => `${BASE}/commerce/cash-sessions/${id}`,
    recordMovement: `${BASE}/commerce/cash-sessions/movements`,
    closeSession: `${BASE}/commerce/cash-sessions/close`,
    sessions: (opts: { clubId?: string; from?: string; to?: string; page?: number; size?: number } = {}) =>
      `${BASE}/commerce/cash-sessions${qs({ ...page(opts), clubId: opts.clubId,
        from: opts.from, to: opts.to })}`,
    dayEnd: (clubId: string, forDate: string, isZRead = false) =>
      `${BASE}/commerce/day-end/${clubId}${qs({ forDate, isZRead })}`,

    issueGiftCard: `${BASE}/commerce/gift-cards`,
    giftCard: (cardNumber: string) => `${BASE}/commerce/gift-cards/${encodeURIComponent(cardNumber)}`,
    redeemGiftCard: (cardNumber: string, amount: number, saleId?: string) =>
      `${BASE}/commerce/gift-cards/${encodeURIComponent(cardNumber)}/redeem${qs({ amount, saleId })}`,

    corporate: (clubId?: string, activeOnly = true, opts: { page?: number; size?: number } = {}) =>
      `${BASE}/commerce/corporate${qs({ ...page(opts), clubId, activeOnly })}`,
    corporateAccount: (id: string) => `${BASE}/commerce/corporate/${id}`,
    saveCorporate: (id?: string) => `${BASE}/commerce/corporate${qs({ id })}`,
    corporateMembers: (id: string, activeOnly = true) =>
      `${BASE}/commerce/corporate/${id}/members${qs({ activeOnly })}`,
    addCorporateMember: (id: string, memberId: string, employeeReference?: string) =>
      `${BASE}/commerce/corporate/${id}/members${qs({ memberId, employeeReference })}`,
    checkEligibility: (id: string, opts: { email?: string; employeeReference?: string; code?: string }) =>
      `${BASE}/commerce/corporate/${id}/eligibility${qs(opts as Record<string, unknown>)}`,
    generateCorporateInvoice: (id: string, periodStart: string, periodEnd: string) =>
      `${BASE}/commerce/corporate/${id}/invoices${qs({ periodStart, periodEnd })}`,
    corporateInvoices: (accountId?: string, status?: number, opts: { page?: number; size?: number } = {}) =>
      `${BASE}/commerce/corporate/invoices${qs({ ...page(opts), accountId, status })}`,

    payers: (clubId?: string, activeOnly = true) => `${BASE}/commerce/payers${qs({ clubId, activeOnly })}`,
    savePayer: (id?: string) => `${BASE}/commerce/payers${qs({ id })}`,
    saveAuthorisation: (id?: string) => `${BASE}/commerce/payers/authorisations${qs({ id })}`,
    authorisations: (payerId?: string, memberId?: string, activeOnly = true) =>
      `${BASE}/commerce/payers/authorisations${qs({ payerId, memberId, activeOnly })}`,

    vending: `${BASE}/commerce/vending`,
  },

  reports: {
    dashboard: (clubId?: string) => `${BASE}/reports/dashboard${qs({ clubId })}`,
    membership: `${BASE}/reports/membership`,
    cohorts: `${BASE}/reports/cohorts`,
    revenue: `${BASE}/reports/revenue`,
    mrr: `${BASE}/reports/mrr`,
    attendance: `${BASE}/reports/attendance`,
    classes: `${BASE}/reports/classes`,
    sales: `${BASE}/reports/sales`,
    staff: `${BASE}/reports/staff`,
    operations: `${BASE}/reports/operations`,
    subscriptions: (clubId?: string) => `${BASE}/reports/subscriptions${qs({ clubId })}`,
    saveSubscription: (id?: string) => `${BASE}/reports/subscriptions${qs({ id })}`,
  },
};
