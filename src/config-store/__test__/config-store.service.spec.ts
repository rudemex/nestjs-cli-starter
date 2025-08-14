import 'reflect-metadata';
import { ConfigStoreService } from '../services/config-store.service';
import { DEFAULT_CONFIG_STORE } from '../constants/config-store.constant';

class MockConfigstore {
  private store: Record<string, any> = {};

  private static getByPath(obj: any, path: string): any {
    return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
  }

  private static setByPath(obj: any, path: string, value: any): void {
    const parts = path.split('.');
    const last = parts.pop()!;
    let cursor = obj;
    for (const p of parts) {
      if (typeof cursor[p] !== 'object' || cursor[p] === null) cursor[p] = {};
      cursor = cursor[p];
    }
    cursor[last] = value;
  }

  private static deleteByPath(obj: any, path: string): void {
    const parts = path.split('.');
    const last = parts.pop()!;
    let cursor = obj;
    for (const p of parts) {
      if (typeof cursor[p] !== 'object' || cursor[p] === null) return;
      cursor = cursor[p];
    }
    delete cursor[last];
  }

  get all(): Record<string, any> {
    return JSON.parse(JSON.stringify(this.store));
  }

  get(path: string): any {
    return MockConfigstore.getByPath(this.store, path);
  }

  set(pathOrObject: string | Record<string, unknown>, value?: unknown): void {
    if (typeof pathOrObject === 'string') {
      MockConfigstore.setByPath(this.store, pathOrObject, value);
    } else if (pathOrObject && typeof pathOrObject === 'object') {
      for (const [k, v] of Object.entries(pathOrObject)) {
        (this.store as any)[k] = v;
      }
    }
  }

  has(path: string): boolean {
    return this.get(path) !== undefined;
  }

  delete(path: string): void {
    MockConfigstore.deleteByPath(this.store, path);
  }

  clear(): void {
    this.store = {};
  }
}

describe('ConfigStoreService', () => {
  let svc: ConfigStoreService;
  let mockStore: MockConfigstore;
  const baseAppConfig = {
    project: { name: 'my-cli', version: '1.2.3' },
  } as any;

  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    mockStore = new MockConfigstore();
    svc = new ConfigStoreService(baseAppConfig, mockStore as any);
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  describe('init()', () => {
    it('should seed dynamic defaults on first run', () => {
      delete process.env.USER;
      delete process.env.USERNAME;

      const before = Date.now();
      svc.init();
      const all = svc.all();

      expect(all.initialized).toBe(true);
      expect(all.version).toBe('v1.2.3');

      const createdMs = Date.parse(all.createdAt);
      const updatedMs = Date.parse(all.updatedAt);
      expect(isNaN(createdMs)).toBe(false);
      expect(isNaN(updatedMs)).toBe(false);
      expect(Math.abs(createdMs - before)).toBeLessThan(10_000);
      expect(createdMs).toBe(updatedMs);

      expect(typeof all.userId).toBe('string');
      expect(all.userId.length).toBeGreaterThan(0);
      expect(all.userName).toBe('Unknown');

      expect(all.pkgManager).toBe(DEFAULT_CONFIG_STORE.pkgManager);
      expect(all.update.intervalMs).toBe(DEFAULT_CONFIG_STORE.update.intervalMs);
      expect(all.telemetry.enabled).toBe(true);
    });

    it('should refresh version and updatedAt on subsequent runs', () => {
      mockStore.set({
        initialized: true,
        version: 'v0.0.1',
        createdAt: '1999-01-01T00:00:00.000Z',
        updatedAt: '2000-01-01T00:00:00.000Z',
        userId: 'mock-id',
        userName: 'Tester',
      });

      svc.init();
      const all = svc.all();

      expect(all.version).toBe('v1.2.3');
      expect(all.createdAt).toBe('1999-01-01T00:00:00.000Z');
      expect(all.updatedAt).not.toBe('2000-01-01T00:00:00.000Z');
      expect(Date.parse(all.updatedAt)).toBeGreaterThan(Date.parse('2000-01-01T00:00:00.000Z'));

      expect(all.userId).toBe('mock-id');
      expect(all.userName).toBe('Tester');
    });

    it('should use USER/USERNAME from environment if present', () => {
      process.env.USER = 'LocalUser';
      svc.init();
      const all = svc.all();
      expect(all.userName).toBe('LocalUser');
    });

    // NUEVO: fallback de versión con ?? '0.0.0'
    it('should fallback to version v0.0.0 when project.version is missing', () => {
      const appConfigMissingVersion = { project: { name: 'my-cli' } } as any;
      const svc2 = new ConfigStoreService(appConfigMissingVersion, new MockConfigstore() as any);

      svc2.init();
      const all = svc2.all();

      expect(all.version).toBe('v0.0.0');
      expect(typeof all.updatedAt).toBe('string');
    });
  });

  describe('CRUD helpers', () => {
    it('should set/get/has/remove by dot path', () => {
      expect(svc.has('foo.bar')).toBe(false);
      svc.set('foo.bar', 123);
      expect(svc.has('foo.bar')).toBe(true);
      expect(svc.get<number>('foo.bar')).toBe(123);
      svc.remove('foo.bar');
      expect(svc.has('foo.bar')).toBe(false);
      expect(svc.get('foo.bar')).toBeUndefined();
    });

    it('should set by object (top-level shallow merge)', () => {
      svc.set({ a: { b: 1 }, x: 9 });
      expect(svc.get('a.b')).toBe(1);
      expect(svc.get('x')).toBe(9);

      svc.set({ a: { c: 2 } });
      expect(svc.get('a.b')).toBeUndefined();
      expect(svc.get('a.c')).toBe(2);
    });

    it('should patch shallow top-level object and return snapshot', () => {
      svc.set({ x: 1, nested: { y: 2 } });
      const snapshot = svc.patch({ x: 2 });
      expect(snapshot.x).toBe(2);
      expect(snapshot.nested).toEqual({ y: 2 });
    });

    it('should export the current snapshot', () => {
      svc.set({ hello: 'world' });
      expect(svc.export()).toEqual(expect.objectContaining({ hello: 'world' }));
    });
  });

  describe('import/reset', () => {
    // Ya probábamos explícitamente 'merge'...
    it('should import with merge strategy (top-level shallow merge)', () => {
      svc.set({ a: 1, nested: { y: 2 } });

      const out = svc.import({ b: 2, nested: { y: 99 } }, 'merge');
      expect(out.a).toBe(1);
      expect(out.b).toBe(2);
      expect(out.nested).toEqual({ y: 99 });
    });

    // NUEVO: ...y ahora probamos el default (modo omitido = 'merge')
    it('should import with default strategy when mode is omitted (merge)', () => {
      svc.set({ a: 1, nested: { y: 2 } });

      const out = svc.import({ b: 2, nested: { y: 99 } }); // sin segundo arg
      expect(out.a).toBe(1);
      expect(out.b).toBe(2);
      expect(out.nested).toEqual({ y: 99 });
    });

    it('should import with replace strategy (clear + defaults + data)', () => {
      svc.set({ a: 1, keepMe: true });

      const out = svc.import({ hello: 'world' }, 'replace');
      expect(out.initialized).toBe(DEFAULT_CONFIG_STORE.initialized);
      expect(out.pkgManager).toBe(DEFAULT_CONFIG_STORE.pkgManager);
      expect(out.telemetry.enabled).toBe(true);

      expect(out.keepMe).toBeUndefined();
      expect(out.hello).toBe('world');
    });

    it('should reset to defaults (without dynamic first-run fields)', () => {
      svc.set({ custom: 42 });
      const out = svc.reset();
      expect(out.initialized).toBe(DEFAULT_CONFIG_STORE.initialized);
      expect(out.version).toBe(DEFAULT_CONFIG_STORE.version);
      expect(out.userId).toBe(DEFAULT_CONFIG_STORE.userId);
      expect(out.userName).toBe(DEFAULT_CONFIG_STORE.userName);
      expect(out.custom).toBeUndefined();
    });
  });
});
