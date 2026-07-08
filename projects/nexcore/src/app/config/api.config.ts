import { environment } from '@env';

const BASE = environment.apiBaseUrl;

/** App-level API endpoints (auth, company) — mirrors @nexcore/core/api.config internally. */
export const API_CONFIG = {
  auth: {
    login:    `${BASE}/api/Auth/login`,
    register: `${BASE}/api/Auth/register`,
  },
  company: {
    validate: `${BASE}/api/Company/validate`,
    create:   `${BASE}/api/Company`,
    update:   (id: string) => `${BASE}/api/Company/${id}`,
    getById:  (id: string) => `${BASE}/api/Company/${id}`,
  },
  userAdmin: {
    listByCompany: (companyId: string) => `${BASE}/api/UserAdmin/company/${companyId}`,
    getById:       (id: string) => `${BASE}/api/UserAdmin/${id}`,
    update:        (id: string) => `${BASE}/api/UserAdmin/${id}`,
    activate:      (id: string) => `${BASE}/api/UserAdmin/${id}/activate`,
    deactivate:    (id: string) => `${BASE}/api/UserAdmin/${id}/deactivate`,
    lock:          (id: string) => `${BASE}/api/UserAdmin/${id}/lock`,
    unlock:        (id: string) => `${BASE}/api/UserAdmin/${id}/unlock`,
    invite:        `${BASE}/api/UserAdmin/invite`,
  },
  role: {
    listByCompany: (companyId: string) => `${BASE}/api/Role/company/${companyId}`,
    assign:        `${BASE}/api/Role/assign`,
    remove:        `${BASE}/api/Role/remove`,
  },
};
