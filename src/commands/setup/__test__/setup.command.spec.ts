import 'reflect-metadata';
import { TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { InquirerService } from 'nest-commander';
import { CommandTestFactory } from 'nest-commander-testing';
import chalk from 'chalk';

import { SetupModule } from '../setup.module';
import { SetupCommand } from '../commands/setup.command';
import { TelemetryService } from '../../../telemetry/telemetry.service';
import { config } from '../../../config';

const mockSpinner = {
  start: jest.fn().mockReturnThis(),
  succeed: jest.fn(),
  fail: jest.fn(),
};
jest.mock('ora', () => {
  const fn = jest.fn(() => mockSpinner);
  return { __esModule: true, default: fn };
});

describe('SetupCommand', () => {
  let commandInstance: TestingModule;
  let cmd: SetupCommand;
  let inquirer: InquirerService;
  let telemetry: TelemetryService;

  let askSpy: jest.SpyInstance;
  let captureSpy: jest.SpyInstance;

  beforeAll(async () => {
    commandInstance = await CommandTestFactory.createTestingCommand({
      imports: [
        await ConfigModule.forRoot({
          load: [config],
          isGlobal: true,
          ignoreEnvFile: true,
        }),
        SetupModule,
      ],
    }).compile();

    cmd = commandInstance.get(SetupCommand);
    inquirer = commandInstance.get(InquirerService);
    telemetry = commandInstance.get(TelemetryService);

    askSpy = jest.spyOn(inquirer, 'ask');
    captureSpy = jest.spyOn(telemetry, 'capture').mockImplementation(() => {});
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should abort when user does not confirm (without --force)', async () => {
    askSpy.mockResolvedValueOnce({
      projectName: 'demo',
      env: 'local',
      notes: '',
      confirm: false,
    });

    const log = jest.spyOn(console, 'log').mockImplementation(() => {});

    await cmd.run([], {});

    expect(log).toHaveBeenCalledWith(chalk.red('❌ Setup aborted by the user.'));
    expect(captureSpy).not.toHaveBeenCalled();
    expect(mockSpinner.start).not.toHaveBeenCalled();

    log.mockRestore();
  });

  it('should run setup when confirmed and print notes', async () => {
    askSpy.mockResolvedValueOnce({
      projectName: 'my-app',
      env: 'dev',
      notes: 'some notes',
      confirm: true,
    });

    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    await cmd.run(['pos1', 'pos2'], { timeout: '1500' });

    expect(mockSpinner.start).toHaveBeenCalledTimes(1);
    expect(mockSpinner.succeed).toHaveBeenCalledTimes(1);

    const calls = log.mock.calls.map(([arg]) => String(arg));
    expect(calls.some((c) => c.includes('📝 Notes:'))).toBe(true);
    expect(calls.some((c) => c.includes('some notes'))).toBe(true);

    expect(captureSpy).toHaveBeenCalledWith(
      'setup',
      expect.objectContaining({
        projectName: 'my-app',
        env: 'dev',
        notes: 'some notes',
        confirm: true,
        force: false,
        timeout: 1500,
        _params: ['pos1', 'pos2'],
        _options: { timeout: '1500' },
      }),
    );

    log.mockRestore();
  });

  it('should force confirmation with --force regardless of prompt answer', async () => {
    askSpy.mockResolvedValueOnce({
      projectName: 'force-app',
      env: 'prod',
      notes: '',
      confirm: false,
    });

    await cmd.run([], { force: true, timeout: '0' });

    expect(mockSpinner.start).toHaveBeenCalledTimes(1);
    expect(mockSpinner.succeed).toHaveBeenCalledTimes(1);
    expect(captureSpy).toHaveBeenCalledWith(
      'setup',
      expect.objectContaining({
        projectName: 'force-app',
        env: 'prod',
        confirm: false,
        force: true,
        timeout: 0,
      }),
    );
  });

  it('should parse force flag: undefined/true/1/"true" => true; false/0/"false" => false', () => {
    expect(cmd.parseForce(undefined as any)).toBe(true);
    expect(cmd.parseForce(true as any)).toBe(true);
    expect(cmd.parseForce('1' as any)).toBe(true);
    expect(cmd.parseForce('true' as any)).toBe(true);

    expect(cmd.parseForce(false as any)).toBe(false);
    expect(cmd.parseForce('0' as any)).toBe(false);
    expect(cmd.parseForce('false' as any)).toBe(false);
  });

  it('should parse timeout: valid -> n; invalid/negative -> 2000', () => {
    expect(cmd.parseTimeout('1234' as any)).toBe(1234);
    expect(cmd.parseTimeout(undefined as any)).toBe(2000);
    expect(cmd.parseTimeout('abc' as any)).toBe(2000);
    expect(cmd.parseTimeout('-5' as any)).toBe(2000);
  });

  it('should return afterAll help examples', () => {
    const txt = cmd.showExamples();
    expect(txt).toContain('$ cli setup');
    expect(txt).toContain('--force');
    expect(txt).toContain('--timeout');
  });

  it('should handle errors and call spinner.fail in catch', async () => {
    askSpy.mockResolvedValueOnce({
      projectName: 'boom-app',
      env: 'dev',
      notes: '',
      confirm: true,
    });

    captureSpy.mockImplementationOnce(() => {
      throw new Error('kaboom');
    });

    const log = jest.spyOn(console, 'log').mockImplementation(() => {});

    await cmd.run([], { timeout: '0' });

    expect(mockSpinner.fail).toHaveBeenCalledWith(
      chalk.red('❌ Failed to configure the environment.'),
    );

    log.mockRestore();
  });
});
