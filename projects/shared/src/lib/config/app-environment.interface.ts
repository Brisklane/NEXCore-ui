/**
 * Typed shape of the application environment — equivalent to appsettings.json schema.
 * The concrete values live in environment.ts (dev) and environment.prod.ts (prod).
 * Exported so any module can reference the type without coupling to a specific file.
 */
export interface AppEnvironment {
  production: boolean;

  /** Base URL of the backend API, e.g. https://localhost:7214 */
  apiBaseUrl: string;

  /** Human-readable application name shown in the UI */
  appName: string;
}
