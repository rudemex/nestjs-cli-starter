import { Test, TestingModule } from '@nestjs/testing';
import { InquirerService } from 'nest-commander';
import chalk from 'chalk';
import ora from 'ora';

import { SetupCommand } from '../commands/setup.command';
import { TelemetryService } from '../../../telemetry/telemetry.service';

jest.mock('ora');

describe('SetupCommand', () => {
  let command: SetupCommand;
  let inquirerService: InquirerService;
  let telemetryService: TelemetryService;
  const mockSpinner = {
    start: jest.fn().mockReturnThis(),
    succeed: jest.fn(),
    fail: jest.fn(),
  };

  beforeEach(async () => {
    (ora as unknown as jest.Mock).mockReturnValue(mockSpinner);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SetupCommand,
        {
          provide: InquirerService,
          useValue: {
            ask: jest.fn(),
          },
        },
        {
          provide: TelemetryService,
          useValue: {
            capture: jest.fn(),
          },
        },
      ],
    }).compile();

    command = module.get(SetupCommand);
    inquirerService = module.get(InquirerService);
    telemetryService = module.get(TelemetryService);
  });

  afterAll(() => {
    if (process.stdin.isTTY) {
      process.stdin.destroy(); // fuerza el cierre del handle de TTY
    }
  });

  it('debe cancelar la configuración si confirm es false', async () => {
    const askMock = jest.spyOn(inquirerService, 'ask').mockResolvedValueOnce({ confirm: false });

    const logSpy = jest.spyOn(console, 'log').mockImplementation();

    await command.run([], {});

    expect(askMock).toHaveBeenCalledWith('setup', undefined);
    expect(logSpy).toHaveBeenCalledWith(chalk.red('❌ Configuración cancelada por el usuario.'));

    logSpy.mockRestore();
  });

  it('debe ejecutar la configuración completa y enviar la telemetría', async () => {
    const answers = {
      projectName: 'demo',
      env: 'local',
      notes: 'Estas son mis notas',
      confirm: true,
    };

    jest.spyOn(inquirerService, 'ask').mockResolvedValueOnce(answers);
    const telemetrySpy = jest.spyOn(telemetryService, 'capture');

    const logSpy = jest.spyOn(console, 'log').mockImplementation();

    await command.run(['demo'], { timeout: 100 });

    expect(mockSpinner.start).toHaveBeenCalled();
    expect(mockSpinner.succeed).toHaveBeenCalledWith(
      chalk.green(
        `✅ Proyecto "${chalk.bold(answers.projectName)}" configurado en entorno ${answers.env}.`,
      ),
    );
    expect(logSpy).toHaveBeenCalledWith(chalk.cyan('\n📝 Notas:'));
    expect(logSpy).toHaveBeenCalledWith(chalk.white('Estas son mis notas'));

    expect(telemetrySpy).toHaveBeenCalledWith('setup', {
      ...answers,
      _passedParams: ['demo'],
      _options: { timeout: 100 },
    });

    logSpy.mockRestore();
  });
});
