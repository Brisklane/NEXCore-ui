import { environment } from '@env';

const BASE = environment.apiBaseUrl;

/** Auth and company API endpoints used by @nexcore/core services. */
export const API_CONFIG = {
  auth: {
    login:         `${BASE}/api/Auth/login`,
    register:      `${BASE}/api/Auth/register`,
    logout:        `${BASE}/api/Auth/logout`,
    refreshToken:  `${BASE}/api/Auth/refresh-token`,
    switchContext: `${BASE}/api/Auth/switch-context`,
  },
  branch: {
    list: `${BASE}/api/Branch`,
  },
  businessUnit: {
    list: `${BASE}/api/BusinessUnit`,
  },
  company: {
    validate:  `${BASE}/api/Company/validate`,
    create:    `${BASE}/api/Company`,
    list:      `${BASE}/api/Company`,
    update:    (id: string) => `${BASE}/api/Company/${id}`,
    getById:   (id: string) => `${BASE}/api/Company/${id}`,
  },
  geo: {
    countries:    `${BASE}/api/core/geo/countries`,
    country:      (code: string) => `${BASE}/api/core/geo/countries/${code}`,
    subdivisions: (countryCode: string) => `${BASE}/api/core/geo/countries/${countryCode}/subdivisions`,
    cities:       (countryCode: string, subdivisionCode?: string) =>
      subdivisionCode
        ? `${BASE}/api/core/geo/countries/${countryCode}/cities?subdivisionCode=${encodeURIComponent(subdivisionCode)}`
        : `${BASE}/api/core/geo/countries/${countryCode}/cities`,
    searchCities: (countryCode: string, q: string, limit = 20) =>
      `${BASE}/api/core/geo/countries/${countryCode}/cities/search?q=${encodeURIComponent(q)}&limit=${limit}`,
  },
};
