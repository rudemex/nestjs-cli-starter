import { TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { CommandTestFactory } from 'nest-commander-testing';
import chalk from 'chalk';

import { InfoModule } from '../info.module';
import { InfoCommand } from '../commands/info.command';
import { config } from '../../../config';

describe('InfoCommand', () => {
  let commandInstance: TestingModule;

  beforeAll(async () => {
    commandInstance = await CommandTestFactory.createTestingCommand({
      imports: [
        await ConfigModule.forRoot({
          load: [config],
          isGlobal: true,
          ignoreEnvFile: true,
        }),
        InfoModule,
      ],
    }).compile();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should print CLI info table', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const cmd = commandInstance.get(InfoCommand);

    await cmd.run();

    expect(logSpy).toHaveBeenCalledWith(chalk.yellow.bold('\n📊 CLI Environment Information:\n'));

    const tableOutput = logSpy.mock.calls.find(
      ([arg]) => typeof arg === 'string' && arg.includes('┌'),
    );
    expect(tableOutput).toBeTruthy();

    logSpy.mockRestore();
  });

  it('should handle missing description and show N/A', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const cmd = new InfoCommand({
      project: {
        ...(config().project || {}),
        description: undefined,
      },
    } as any);

    await cmd.run();

    const tableOutput = logSpy.mock.calls
      .map(([arg]) => arg)
      .find((call) => typeof call === 'string' && call.includes('N/A'));

    expect(tableOutput).toContain('N/A');

    logSpy.mockRestore();
  });

  it('should return beforeAllHelp message', () => {
    const cmd = commandInstance.get(InfoCommand);
    expect(cmd.beforeAllHelp()).toContain('CLI');
  });

  it('should return afterHelp message', () => {
    const cmd = commandInstance.get(InfoCommand);
    expect(cmd.afterHelp()).toContain('Tip');
  });
});
