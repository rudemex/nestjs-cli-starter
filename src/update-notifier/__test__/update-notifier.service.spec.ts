import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

const updateNotifierFactory = jest.fn();
const notifyFn = jest.fn();

jest.mock('update-notifier', () => ({
  __esModule: true,
  default: (...args: any[]) => updateNotifierFactory(...args),
}));

import { UpdateNotifierService } from '../services/update-notifier.service';
import { ConfigStoreService } from '../../config-store/services/config-store.service';
import { DEFAULT_CONFIG_STORE } from '../../config-store/constants/config-store.constant';
import * as PKG from '../../../package.json';

describe('UpdateNotifierService', () => {
  let service: UpdateNotifierService;
  let config: ConfigService;
  let store: Pick<ConfigStoreService, 'get'>;

  const makeStore = (map: Record<string, any>): Pick<ConfigStoreService, 'get'> => ({
    get: jest.fn((k: string) => map[k]),
  });

  const makeConfig = (map: Record<string, any>): Pick<ConfigService, 'get'> => ({
    get: jest.fn((k: string) => map[k]),
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    store = makeStore({
      'update.intervalMs': DEFAULT_CONFIG_STORE.update.intervalMs,
      pkgManager: 'yarn',
    });

    config = makeConfig({
      'project.name': 'my-cli',
      'project.version': '0.1.0',
    }) as any;

    const moduleRef = await Test.createTestingModule({
      providers: [
        UpdateNotifierService,
        { provide: ConfigService, useValue: config },
        { provide: ConfigStoreService, useValue: store },
      ],
    }).compile();

    service = moduleRef.get(UpdateNotifierService);
  });

  it('should early return when project name/version are empty strings', () => {
    (config.get as jest.Mock).mockImplementation((k: string) =>
      k === 'project.name' || k === 'project.version' ? '' : undefined,
    );

    service.onApplicationBootstrap();

    expect(updateNotifierFactory).not.toHaveBeenCalled();
  });

  it('should call update-notifier with pkg & interval from store and not notify when no update', () => {
    updateNotifierFactory.mockReturnValueOnce({
      update: undefined,
      notify: notifyFn,
    });

    service.onApplicationBootstrap();

    expect(updateNotifierFactory).toHaveBeenCalledTimes(1);
    const args = updateNotifierFactory.mock.calls[0][0];

    expect(args).toEqual({
      pkg: { name: 'my-cli', version: '0.1.0' },
      updateCheckInterval: DEFAULT_CONFIG_STORE.update.intervalMs,
    });

    expect(notifyFn).not.toHaveBeenCalled();
  });

  it('should notify when update is available using yarn command', () => {
    updateNotifierFactory.mockReturnValueOnce({
      update: { current: '0.1.0', latest: '1.0.0' },
      notify: notifyFn,
    });

    service.onApplicationBootstrap();

    expect(updateNotifierFactory).toHaveBeenCalledTimes(1);
    expect(notifyFn).toHaveBeenCalledTimes(1);

    const notifyArg = notifyFn.mock.calls[0][0];
    expect(notifyArg).toBeTruthy();
    expect(typeof notifyArg.message).toBe('string');
    expect(notifyArg.message).toContain('v0.1.0');
    expect(notifyArg.message).toContain('v1.0.0');
    expect(notifyArg.message).toContain('yarn global add my-cli');
    expect(notifyArg.defer).toBe(true);
  });

  it('should notify with npm install command when pkgManager is npm', () => {
    (store.get as jest.Mock).mockImplementation((k: string) => {
      if (k === 'pkgManager') return 'npm';
      if (k === 'update.intervalMs') return 0;
      return undefined;
    });

    updateNotifierFactory.mockReturnValueOnce({
      update: { current: '0.1.0', latest: '2.0.0' },
      notify: notifyFn,
    });

    service.onApplicationBootstrap();

    const notifyArg = notifyFn.mock.calls[0][0];
    expect(notifyArg.message).toContain('npm i -g my-cli');
    expect(notifyArg.message).toContain('v0.1.0');
    expect(notifyArg.message).toContain('v2.0.0');
  });

  it('should fallback to package.json name/version when config is missing', () => {
    (config.get as jest.Mock).mockReturnValue(undefined);

    updateNotifierFactory.mockReturnValueOnce({
      update: { current: String((PKG as any).version), latest: '9.9.9' },
      notify: notifyFn,
    });

    service.onApplicationBootstrap();

    expect(updateNotifierFactory).toHaveBeenCalledTimes(1);

    const args = updateNotifierFactory.mock.calls[0][0];
    expect(args.pkg.name).toBe((PKG as any).name);
    expect(args.pkg.version).toBe((PKG as any).version);
  });

  it('should use defaults when store interval & pkgManager are missing', () => {
    (store.get as jest.Mock).mockReturnValue(undefined);

    updateNotifierFactory.mockReturnValueOnce({
      update: { current: '0.1.0', latest: '1.1.0' },
      notify: notifyFn,
    });

    service.onApplicationBootstrap();

    const args = updateNotifierFactory.mock.calls[0][0];
    expect(args.updateCheckInterval).toBe(DEFAULT_CONFIG_STORE.update.intervalMs);

    const notifyArg = notifyFn.mock.calls[0][0];
    expect(notifyArg.message).toContain(`yarn global add my-cli`);
  });
});
