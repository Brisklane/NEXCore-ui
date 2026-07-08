import type { AppEnvironment } from '@nexcore/shared';

/**
 * Production environment -- equivalent to appsettings.Production.json
 * This file replaces environment.ts at build time via the `fileReplacements`
 * entry in angular.json (production configuration).
 */
export const environment: AppEnvironment = {
  production: true,
  // TODO: replace with the real production API base URL before deploying.
  apiBaseUrl: 'https://api.example.com',
  appName: 'NexCore ERP',
};
