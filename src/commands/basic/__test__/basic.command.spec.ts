import { BasicCommand } from '../commands/basic.command';

describe('CommandTutorial', () => {
  let command: BasicCommand;

  beforeEach(() => {
    command = new BasicCommand();
  });

  it('should log passed params and options', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation();

    await command.run(['build'], { number: 123 });

    expect(logSpy).toHaveBeenCalledWith('CLI Params', ['build']);
    expect(logSpy).toHaveBeenCalledWith('CLI Options', { number: 123 });

    logSpy.mockRestore();
  });

  it('should parse number as numeric value', () => {
    expect(command.parseNumber('456')).toBe(456);
  });
});
