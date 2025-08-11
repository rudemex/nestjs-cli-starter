import { AddCommand } from '../commands/add.command';

jest.mock('../commands/subcommands', () => ({
  AddPkgCommand: class MockAddPkgCommand {},
  AddApiCommand: class MockAddApiCommand {},
}));

jest.mock('chalk', () => ({
  yellowBright: (text: string) => text,
}));

describe('Add Command', () => {
  let cmd: AddCommand;

  beforeEach(() => {
    cmd = new AddCommand();
  });

  it('should be defined', () => {
    expect(cmd).toBeDefined();
  });

  it('should print the hint message when executed without subcommand', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await cmd.run([], {});

    expect(logSpy).toHaveBeenCalledTimes(1);
    const printed = (logSpy.mock.calls[0] ?? [])[0] as string;
    expect(printed).toContain('Please specify a subcommand.');
    expect(printed).toContain('nestjs-cli-starter add pkg --help');
    expect(printed).toContain('nestjs-cli-starter add api --help');

    logSpy.mockRestore();
  });

  it('should print the same hint even if params/options are provided', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await cmd.run(['some', 'params'], { random: 'option' });

    expect(logSpy).toHaveBeenCalledTimes(1);
    const printed = (logSpy.mock.calls[0] ?? [])[0] as string;
    expect(printed).toMatch(/Please specify a subcommand/);
    expect(printed).toMatch(/add pkg --help/);
    expect(printed).toMatch(/add api --help/);

    logSpy.mockRestore();
  });
});
