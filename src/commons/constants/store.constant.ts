import { v7 as uuidv7 } from 'uuid';

export const DEFAULT_CLI_STORE = {
  userId: uuidv7(),
  userName: process.env.USER ?? process.env.USERNAME ?? 'Unknown',
  updateCheckInterval: 43200000,
  pkgManager: 'yarn',
  telemetry: {
    enabled: true,
  },
};
