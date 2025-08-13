import { ConfigStoreData } from '../types/config-store.types';

/** Optional DI token to provide a custom Configstore instance (e.g., in tests/CI). */
export const CONFIG_STORE = Symbol('CONFIG_STORE');

/**
 * Public defaults for the store.
 * Dynamic first-run fields (userId, userName, version, timestamps) are populated at init time.
 */
export const DEFAULT_CONFIG_STORE: ConfigStoreData = {
  initialized: false,
  configVersion: 1,

  version: 'v0.0.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),

  userId: '00000000-0000-0000-0000-000000000000',
  userName: 'Unknown',
  pkgManager: 'yarn',

  update: {
    check: true,
    intervalMs: 0, //1000 * 60 * 60 * 12, // 12 hours
  },

  telemetry: {
    enabled: true,
  },
};
