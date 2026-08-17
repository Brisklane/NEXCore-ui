import { environment } from '@env';

const BASE = `${environment.apiBaseUrl}/api/restaurant`;

/**
 * Every Restaurant endpoint in one place.
 *
 * Kept as a literal map rather than string concatenation at the call site so a route rename is a
 * single edit, and so it is possible to read the module's whole API surface without opening
 * Swagger.
 */
export const RESTAURANT_API = {
  hub: `${environment.apiBaseUrl}/hubs/restaurant`,

  outlets: {
    getAll: (activeOnly = false) => `${BASE}/outlets?activeOnly=${activeOnly}`,
    getById: (id: string) => `${BASE}/outlets/${id}`,
    create: `${BASE}/outlets`,
    update: (id: string) => `${BASE}/outlets/${id}`,
    delete: (id: string) => `${BASE}/outlets/${id}`,
    schedules: (outletId: string) => `${BASE}/outlets/${outletId}/schedules`,
    settings: `${BASE}/outlets/settings`,
    provision: `${BASE}/outlets/provision`,
  },

  floor: {
    plan: (outletId: string) => `${BASE}/floor/plan/${outletId}`,
    tables: (outletId: string, floorId?: string) =>
      floorId ? `${BASE}/floor/tables/${outletId}?floorId=${floorId}` : `${BASE}/floor/tables/${outletId}`,
    table: (tableId: string) => `${BASE}/floor/table/${tableId}`,
    seat: `${BASE}/floor/seat`,
    state: `${BASE}/floor/state`,
    assignWaiter: `${BASE}/floor/assign-waiter`,
    transfer: `${BASE}/floor/transfer`,
    merge: `${BASE}/floor/merge`,
    unmerge: (primaryTableId: string) => `${BASE}/floor/unmerge/${primaryTableId}`,
    clear: (tableId: string) => `${BASE}/floor/clear/${tableId}`,
    saveLayout: `${BASE}/floor/layout`,
    floors: (outletId: string) => `${BASE}/floor/floors/${outletId}`,
    createFloor: `${BASE}/floor/floors`,
    updateFloor: (id: string) => `${BASE}/floor/floors/${id}`,
    deleteFloor: (id: string) => `${BASE}/floor/floors/${id}`,
    sections: (outletId: string) => `${BASE}/floor/sections/${outletId}`,
    createSection: `${BASE}/floor/sections`,
    updateSection: (id: string) => `${BASE}/floor/sections/${id}`,
    deleteSection: (id: string) => `${BASE}/floor/sections/${id}`,
  },

  menu: {
    menus: (outletId?: string, activeNowOnly = false) => {
      const params = new URLSearchParams({ activeNowOnly: String(activeNowOnly) });
      if (outletId) params.set('outletId', outletId);
      return `${BASE}/menu/menus?${params}`;
    },
    createMenu: `${BASE}/menu/menus`,
    updateMenu: (id: string) => `${BASE}/menu/menus/${id}`,
    deleteMenu: (id: string) => `${BASE}/menu/menus/${id}`,

    categories: (menuId?: string) =>
      menuId ? `${BASE}/menu/categories?menuId=${menuId}` : `${BASE}/menu/categories`,
    createCategory: `${BASE}/menu/categories`,
    updateCategory: (id: string) => `${BASE}/menu/categories/${id}`,
    deleteCategory: (id: string) => `${BASE}/menu/categories/${id}`,

    items: (opts: { menuId?: string; categoryId?: string; search?: string; page?: number; size?: number } = {}) => {
      const params = new URLSearchParams({
        pageNumber: String(opts.page ?? 1),
        pageSize: String(opts.size ?? 50),
      });
      if (opts.menuId) params.set('menuId', opts.menuId);
      if (opts.categoryId) params.set('categoryId', opts.categoryId);
      if (opts.search) params.set('search', opts.search);
      return `${BASE}/menu/items?${params}`;
    },
    item: (id: string) => `${BASE}/menu/items/${id}`,
    createItem: `${BASE}/menu/items`,
    updateItem: (id: string) => `${BASE}/menu/items/${id}`,
    deleteItem: (id: string) => `${BASE}/menu/items/${id}`,

    modifierGroups: `${BASE}/menu/modifier-groups`,
    createModifierGroup: `${BASE}/menu/modifier-groups`,
    updateModifierGroup: (id: string) => `${BASE}/menu/modifier-groups/${id}`,
    deleteModifierGroup: (id: string) => `${BASE}/menu/modifier-groups/${id}`,

    combos: (outletId?: string) =>
      outletId ? `${BASE}/menu/combos?outletId=${outletId}` : `${BASE}/menu/combos`,
    createCombo: `${BASE}/menu/combos`,
    updateCombo: (id: string) => `${BASE}/menu/combos/${id}`,
    deleteCombo: (id: string) => `${BASE}/menu/combos/${id}`,

    availability: (outletId: string, unavailableOnly = true) =>
      `${BASE}/menu/availability/${outletId}?unavailableOnly=${unavailableOnly}`,
    set86: `${BASE}/menu/availability`,

    happyHours: (outletId?: string) =>
      outletId ? `${BASE}/menu/happy-hours?outletId=${outletId}` : `${BASE}/menu/happy-hours`,
    createHappyHour: `${BASE}/menu/happy-hours`,
    updateHappyHour: (id: string) => `${BASE}/menu/happy-hours/${id}`,
    deleteHappyHour: (id: string) => `${BASE}/menu/happy-hours/${id}`,

    catalog: (outletId: string, orderType: number) =>
      `${BASE}/menu/catalog/${outletId}?orderType=${orderType}`,
  },

  kitchen: {
    display: (outletId: string, stationId?: string, includeBumped = false) => {
      const params = new URLSearchParams({ includeBumped: String(includeBumped) });
      if (stationId) params.set('stationId', stationId);
      return `${BASE}/kitchen/display/${outletId}?${params}`;
    },
    ticketsForOrder: (orderId: string) => `${BASE}/kitchen/tickets/order/${orderId}`,
    acknowledge: (ticketId: string) => `${BASE}/kitchen/tickets/${ticketId}/acknowledge`,
    start: (ticketId: string) => `${BASE}/kitchen/tickets/${ticketId}/start`,
    ready: (ticketId: string, lineId?: string) =>
      lineId
        ? `${BASE}/kitchen/tickets/${ticketId}/ready?lineId=${lineId}`
        : `${BASE}/kitchen/tickets/${ticketId}/ready`,
    bump: `${BASE}/kitchen/tickets/bump`,
    recall: `${BASE}/kitchen/tickets/recall`,
    priority: (ticketId: string, isPriority: boolean) =>
      `${BASE}/kitchen/tickets/${ticketId}/priority?isPriority=${isPriority}`,

    stations: (outletId: string) => `${BASE}/kitchen/stations/${outletId}`,
    createStation: `${BASE}/kitchen/stations`,
    updateStation: (id: string) => `${BASE}/kitchen/stations/${id}`,
    deleteStation: (id: string) => `${BASE}/kitchen/stations/${id}`,

    createRule: `${BASE}/kitchen/routing-rules`,
    updateRule: (id: string) => `${BASE}/kitchen/routing-rules/${id}`,
    deleteRule: (id: string) => `${BASE}/kitchen/routing-rules/${id}`,

    printers: (outletId: string) => `${BASE}/kitchen/printers/${outletId}`,
    createPrinter: `${BASE}/kitchen/printers`,
    updatePrinter: (id: string) => `${BASE}/kitchen/printers/${id}`,
    deletePrinter: (id: string) => `${BASE}/kitchen/printers/${id}`,
  },

  orders: {
    list: (opts: {
      outletId?: string; status?: number; orderType?: number;
      from?: string; to?: string; page?: number; size?: number; search?: string;
    } = {}) => {
      const params = new URLSearchParams({
        pageNumber: String(opts.page ?? 1),
        pageSize: String(opts.size ?? 25),
      });
      if (opts.outletId) params.set('outletId', opts.outletId);
      if (opts.status != null) params.set('status', String(opts.status));
      if (opts.orderType != null) params.set('orderType', String(opts.orderType));
      if (opts.from) params.set('from', opts.from);
      if (opts.to) params.set('to', opts.to);
      if (opts.search) params.set('searchTerm', opts.search);
      return `${BASE}/orders?${params}`;
    },
    active: (outletId: string, waiterId?: string) =>
      waiterId
        ? `${BASE}/orders/active/${outletId}?waiterId=${waiterId}`
        : `${BASE}/orders/active/${outletId}`,
    getById: (id: string) => `${BASE}/orders/${id}`,
    byTable: (tableId: string) => `${BASE}/orders/by-table/${tableId}`,
    open: `${BASE}/orders`,
    addLines: `${BASE}/orders/lines`,
    updateLine: (lineId: string) => `${BASE}/orders/lines/${lineId}`,
    voidLine: `${BASE}/orders/lines/void`,
    moveLines: `${BASE}/orders/lines/move`,
    fire: `${BASE}/orders/fire`,
    served: (id: string) => `${BASE}/orders/${id}/served`,
    update: (id: string) => `${BASE}/orders/${id}`,
    cancel: (id: string) => `${BASE}/orders/${id}/cancel`,
    delivery: (id: string) => `${BASE}/orders/${id}/delivery`,
  },

  checks: {
    list: (opts: { outletId?: string; status?: number; from?: string; to?: string; page?: number; size?: number } = {}) => {
      const params = new URLSearchParams({
        pageNumber: String(opts.page ?? 1),
        pageSize: String(opts.size ?? 25),
      });
      if (opts.outletId) params.set('outletId', opts.outletId);
      if (opts.status != null) params.set('status', String(opts.status));
      if (opts.from) params.set('from', opts.from);
      if (opts.to) params.set('to', opts.to);
      return `${BASE}/checks?${params}`;
    },
    getById: (id: string) => `${BASE}/checks/${id}`,
    forOrder: (orderId: string) => `${BASE}/checks/order/${orderId}`,
    create: `${BASE}/checks`,
    payment: `${BASE}/checks/payments`,
    discount: `${BASE}/checks/discounts`,
    removeDiscount: (id: string) => `${BASE}/checks/discounts/${id}`,
    tip: `${BASE}/checks/tips`,
    waiveServiceCharge: `${BASE}/checks/waive-service-charge`,
    void: `${BASE}/checks/void`,
    refund: `${BASE}/checks/refund`,
    printed: (id: string) => `${BASE}/checks/${id}/printed`,

    voidReasons: `${BASE}/checks/void-reasons`,
    saveVoidReason: `${BASE}/checks/void-reasons`,
    deleteVoidReason: (id: string) => `${BASE}/checks/void-reasons/${id}`,
    discountReasons: `${BASE}/checks/discount-reasons`,
    saveDiscountReason: `${BASE}/checks/discount-reasons`,
    deleteDiscountReason: (id: string) => `${BASE}/checks/discount-reasons/${id}`,
    serviceCharges: (outletId?: string) =>
      outletId ? `${BASE}/checks/service-charges?outletId=${outletId}` : `${BASE}/checks/service-charges`,
    saveServiceCharge: `${BASE}/checks/service-charges`,
    deleteServiceCharge: (id: string) => `${BASE}/checks/service-charges/${id}`,
  },

  foh: {
    reservations: (outletId: string, from?: string, to?: string, status?: number) => {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      if (status != null) params.set('status', String(status));
      const qs = params.toString();
      return `${BASE}/front-of-house/reservations/${outletId}${qs ? '?' + qs : ''}`;
    },
    reservation: (id: string) => `${BASE}/front-of-house/reservations/detail/${id}`,
    createReservation: `${BASE}/front-of-house/reservations`,
    updateReservation: (id: string) => `${BASE}/front-of-house/reservations/${id}`,
    reservationStatus: (id: string) => `${BASE}/front-of-house/reservations/${id}/status`,
    availability: (outletId: string, forTime: string, partySize: number, durationMinutes = 0) =>
      `${BASE}/front-of-house/availability/${outletId}?forTime=${encodeURIComponent(forTime)}&partySize=${partySize}&durationMinutes=${durationMinutes}`,

    waitlist: (outletId: string, activeOnly = true) =>
      `${BASE}/front-of-house/waitlist/${outletId}?activeOnly=${activeOnly}`,
    addWaitlist: `${BASE}/front-of-house/waitlist`,
    updateWaitlist: (id: string) => `${BASE}/front-of-house/waitlist/${id}`,
    waitlistStatus: (id: string) => `${BASE}/front-of-house/waitlist/${id}/status`,

    guests: (search?: string, vipOnly = false) => {
      const params = new URLSearchParams({ vipOnly: String(vipOnly) });
      if (search) params.set('search', search);
      return `${BASE}/front-of-house/guests?${params}`;
    },
    guest: (id: string) => `${BASE}/front-of-house/guests/${id}`,
    createGuest: `${BASE}/front-of-house/guests`,
    updateGuest: (id: string) => `${BASE}/front-of-house/guests/${id}`,
    deleteGuest: (id: string) => `${BASE}/front-of-house/guests/${id}`,

    feedback: (outletId: string, from?: string, to?: string, unresolvedOnly = false) => {
      const params = new URLSearchParams({ unresolvedOnly: String(unresolvedOnly) });
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      return `${BASE}/front-of-house/feedback/${outletId}?${params}`;
    },
    submitFeedback: `${BASE}/front-of-house/feedback`,
    resolveFeedback: (id: string) => `${BASE}/front-of-house/feedback/${id}/resolve`,
  },

  staff: {
    list: (outletId?: string, role?: number, activeOnly = true) => {
      const params = new URLSearchParams({ activeOnly: String(activeOnly) });
      if (outletId) params.set('outletId', outletId);
      if (role != null) params.set('role', String(role));
      return `${BASE}/staff?${params}`;
    },
    getById: (id: string) => `${BASE}/staff/${id}`,
    create: `${BASE}/staff`,
    update: (id: string) => `${BASE}/staff/${id}`,
    delete: (id: string) => `${BASE}/staff/${id}`,
    pinLogin: `${BASE}/staff/pin-login`,
    setPin: `${BASE}/staff/set-pin`,
    verifyApproval: (outletId: string, pin: string, permission: string) =>
      `${BASE}/staff/verify-approval?outletId=${outletId}&pin=${encodeURIComponent(pin)}&permission=${permission}`,

    shifts: (outletId: string, from?: string, to?: string, staffId?: string) => {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      if (staffId) params.set('staffId', staffId);
      const qs = params.toString();
      return `${BASE}/staff/shifts/${outletId}${qs ? '?' + qs : ''}`;
    },
    createShift: `${BASE}/staff/shifts`,
    updateShift: (id: string) => `${BASE}/staff/shifts/${id}`,
    deleteShift: (id: string) => `${BASE}/staff/shifts/${id}`,

    clockIn: `${BASE}/staff/clock-in`,
    clockOut: (staffId: string) => `${BASE}/staff/clock-out/${staffId}`,
    timeClock: (outletId: string, from?: string, to?: string, staffId?: string) => {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      if (staffId) params.set('staffId', staffId);
      const qs = params.toString();
      return `${BASE}/staff/time-clock/${outletId}${qs ? '?' + qs : ''}`;
    },

    tips: (outletId: string, from?: string, to?: string, waiterId?: string) => {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      if (waiterId) params.set('waiterId', waiterId);
      const qs = params.toString();
      return `${BASE}/staff/tips/${outletId}${qs ? '?' + qs : ''}`;
    },
    tipPools: (outletId: string, from?: string, to?: string) => {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const qs = params.toString();
      return `${BASE}/staff/tip-pools/${outletId}${qs ? '?' + qs : ''}`;
    },
    createTipPool: `${BASE}/staff/tip-pools`,
    calculateTipPool: (id: string) => `${BASE}/staff/tip-pools/${id}/calculate`,
    finaliseTipPool: (id: string) => `${BASE}/staff/tip-pools/${id}/finalise`,
  },

  sessions: {
    list: (opts: { outletId?: string; status?: number; from?: string; to?: string; page?: number; size?: number } = {}) => {
      const params = new URLSearchParams({
        pageNumber: String(opts.page ?? 1),
        pageSize: String(opts.size ?? 25),
      });
      if (opts.outletId) params.set('outletId', opts.outletId);
      if (opts.status != null) params.set('status', String(opts.status));
      if (opts.from) params.set('from', opts.from);
      if (opts.to) params.set('to', opts.to);
      return `${BASE}/sessions?${params}`;
    },
    getById: (id: string) => `${BASE}/sessions/${id}`,
    open: (outletId: string, terminalName?: string) =>
      terminalName
        ? `${BASE}/sessions/open/${outletId}?terminalName=${encodeURIComponent(terminalName)}`
        : `${BASE}/sessions/open/${outletId}`,
    openSession: `${BASE}/sessions/open`,
    closeSession: `${BASE}/sessions/close`,
    cashMovement: `${BASE}/sessions/cash-movements`,
    xRead: (id: string) => `${BASE}/sessions/${id}/x-read`,
    zRead: (id: string) => `${BASE}/sessions/${id}/z-read`,
  },

  recipes: {
    list: (menuItemId?: string, includeSubRecipes = true) => {
      const params = new URLSearchParams({ includeSubRecipes: String(includeSubRecipes) });
      if (menuItemId) params.set('menuItemId', menuItemId);
      return `${BASE}/recipes?${params}`;
    },
    getById: (id: string) => `${BASE}/recipes/${id}`,
    create: `${BASE}/recipes`,
    update: (id: string) => `${BASE}/recipes/${id}`,
    delete: (id: string) => `${BASE}/recipes/${id}`,
    recalculate: (id: string) => `${BASE}/recipes/${id}/recalculate`,
    recalculateAll: `${BASE}/recipes/recalculate-all`,

    wastage: (outletId: string, from?: string, to?: string, reason?: number) => {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      if (reason != null) params.set('reason', String(reason));
      const qs = params.toString();
      return `${BASE}/recipes/wastage/${outletId}${qs ? '?' + qs : ''}`;
    },
    logWastage: `${BASE}/recipes/wastage`,
    deleteWastage: (id: string) => `${BASE}/recipes/wastage/${id}`,
  },

  reports: {
    dashboard: (outletId?: string) =>
      outletId ? `${BASE}/reports/dashboard?outletId=${outletId}` : `${BASE}/reports/dashboard`,
    salesSummary: `${BASE}/reports/sales-summary`,
    menuEngineering: `${BASE}/reports/menu-engineering`,
    waiterPerformance: `${BASE}/reports/waiter-performance`,
    tableTurnover: `${BASE}/reports/table-turnover`,
    kitchenPerformance: `${BASE}/reports/kitchen-performance`,
    voidAudit: `${BASE}/reports/void-audit`,
    wastageSummary: `${BASE}/reports/wastage-summary`,
    itemSales: `${BASE}/reports/item-sales`,
  },
};
