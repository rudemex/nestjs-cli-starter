import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import Configstore from 'configstore';
import { v7 as uuidv7 } from 'uuid';

import { CONFIG_STORE, DEFAULT_CONFIG_STORE } from '../constants/config-store.constant';
import { ConfigStoreData } from '../types/config-store.types';
import { config } from '../../config';

@Injectable()
export class ConfigStoreService {
  /**
   * @param appConfig App configuration registered with `registerAs('config')`,
   *                  exposing `project.name` and `project.version`.
   * @param store     Underlying Configstore instance created by the module factory.
   */
  constructor(
    @Inject(config.KEY) private readonly appConfig: ConfigType<typeof config>,
    @Inject(CONFIG_STORE) private readonly store: Configstore,
  ) {}

  /**
   * Seed on first run (dynamic fields) and refresh on every boot.
   * This is invoked ONCE by the module factory before exposing the service.
   *
   * @returns The underlying Configstore instance.
   */
  init(): Configstore {
    const firstRun = !this.store.get('initialized');
    const now = new Date().toISOString();

    const rawVersion = this.appConfig.project?.version ?? '0.0.0';
    const version = `v${rawVersion}`;

    if (firstRun) {
      const seeded: ConfigStoreData = {
        ...DEFAULT_CONFIG_STORE,
        initialized: true,
        version,
        createdAt: now,
        updatedAt: now,
        userId: uuidv7(),
        userName: process.env.USER ?? process.env.USERNAME ?? 'Unknown',
      };
      // Single batch write
      this.store.set(seeded as any);
    } else {
      // Single batch write (refresh only)
      this.store.set({ version, updatedAt: now } as any);
    }

    return this.store;
  }

  // ------------------------
  // Thin API over configstore
  // ------------------------

  /** Return the full persisted snapshot. */
  all(): ConfigStoreData {
    return this.store.all as ConfigStoreData;
  }

  /**
   * Read a value by path (dot-notation), e.g. "update.intervalMs".
   * @param path Path to read.
   */
  get<T = unknown>(path: string): T | undefined {
    return this.store.get(path) as T | undefined;
  }

  /** Check whether a path exists. */
  has(path: string): boolean {
    return this.store.has(path);
  }

  /**
   * Set a value.
   * - `set('a.b', 123)` for path mode
   * - `set({ a: { b: 123 } })` for shallow top-level merge
   */
  set(pathOrObject: string | Record<string, unknown>, value?: unknown): void {
    if (typeof pathOrObject === 'string') {
      this.store.set(pathOrObject, value);
    } else {
      this.store.set(pathOrObject as any);
    }
  }

  /** Delete a key by path (dot-notation). */
  remove(path: string): void {
    this.store.delete(path);
  }

  /**
   * Shallow-merge a partial object at the top level.
   * For nested writes, pass a nested object or prefer `set(path, value)`.
   * @returns The updated snapshot.
   */
  patch(partial: Partial<ConfigStoreData>): ConfigStoreData {
    this.store.set(partial as any);
    return this.all();
  }

  /** Export the current snapshot (useful for backups/debug). */
  export(): ConfigStoreData {
    return this.all();
  }

  /**
   * Import data into the store.
   * - 'merge' (default): shallow top-level merge with existing store.
   * - 'replace': clear, seed defaults, then apply imported data.
   * @returns The updated snapshot.
   */
  import(data: Partial<ConfigStoreData>, mode: 'merge' | 'replace' = 'merge'): ConfigStoreData {
    if (mode === 'replace') {
      this.store.clear();
      this.store.set(DEFAULT_CONFIG_STORE as any);
      this.store.set(data as any);
    } else {
      this.store.set(data as any);
    }
    return this.all();
  }

  /**
   * Reset the store back to public defaults (without dynamic first-run fields).
   * @returns The reset snapshot.
   */
  reset(): ConfigStoreData {
    this.store.clear();
    this.store.set(DEFAULT_CONFIG_STORE as any);
    return this.all();
  }
}
