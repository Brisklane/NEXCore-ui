/*
 * Public API Surface of @nexcore/core
 * Auth, company config, and user management infrastructure.
 */

export * from './lib/core';
export * from './lib/auth/auth.service';
export * from './lib/auth/auth.guard';
export * from './lib/apps/app-registry';
export * from './lib/apps/installed-apps.service';
export * from './lib/apps/app-installed.guard';
export * from './lib/auth/context-switcher.service';
export * from './lib/models/api-response.model';
export * from './lib/models/geo.models';
export * from './lib/services/geo.service';
export * from './lib/services/theme.service';

/* API_CONFIG is intentionally NOT exported — it's an internal detail of core.
   Feature modules read their base URL directly from @env.               */

export * from './lib/components/entity-picker-input/entity-picker-input';
export * from './lib/components/searchable-select/searchable-select';