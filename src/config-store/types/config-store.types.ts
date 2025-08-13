/** Minimal package manager list. Default is 'yarn' (the user can change it later). */
export type PkgManager = 'npm' | 'yarn' | 'pnpm';

/** Public shape of the config store. Projects may add extra public keys if needed. */
export interface ConfigStoreData {
  /** True after the first-time bootstrap. */
  initialized: boolean;

  /** Schema version; bump if you change this public shape. */
  configVersion: number;

  /** CLI version string, e.g. "v1.2.3". */
  version: string;

  /** ISO timestamp when the store was first created. */
  createdAt: string;

  /** ISO timestamp for the last write/update. */
  updatedAt: string;

  /** Random identifier generated on first run (uuidv7). */
  userId: string;

  /** Convenience display name read from OS env on first run, if available. */
  userName: string;

  /** Preferred package manager (default 'yarn'). */
  pkgManager: PkgManager;

  /** Minimal update-notifier configuration. */
  update: {
    /** Master switch to enable/disable update checks. */
    check: boolean;
    /** How often to check (ms). */
    intervalMs: number;
  };

  /** Minimal telemetry configuration. When false, telemetry should no-op. */
  telemetry: {
    enabled: boolean;
  };

  /** Open-ended: callers may add additional public keys without changing the core. */
  [key: string]: unknown;
}
