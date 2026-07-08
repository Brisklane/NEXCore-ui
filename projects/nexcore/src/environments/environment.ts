import type { AppEnvironment } from '@nexcore/shared';

/**
 * Development environment -- equivalent to appsettings.Development.json
 * This file is replaced at build time with environment.prod.ts for production builds
 * (see the `fileReplacements` entry in angular.json).
 */
export const environment: AppEnvironment = {
  production: false,
  apiBaseUrl: 'https://localhost:7214',
  appName: 'NexCore ERP',
};
