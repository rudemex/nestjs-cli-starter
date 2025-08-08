import { TestingModule } from '@nestjs/testing';
import { CommandTestFactory } from 'nest-commander-testing';

import { AddModule } from '../add.module';
import { AddPkgCommand } from '../commands/subcommands';
import { AddPkgService } from '../services';

jest.mock('chalk', () => ({
  red: (text: string) => text,
  gray: (text: string) => text,
  green: (text: string) => text,
  blue: (text: string) => text,
  yellow: (text: string) => text,
}));

describe('Add Command', () => {
  let commandInstance: TestingModule;
  const installMock = jest.fn();

  beforeAll(async () => {
    commandInstance = await CommandTestFactory.createTestingCommand({
      imports: [AddModule],
    })
      .overrideProvider(AddPkgService)
      .useValue({ install: installMock })
      .compile();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Add Pkg Command', () => {
    it('should call install with only required arguments', async () => {
      await CommandTestFactory.run(commandInstance, ['add', 'pkg', 'axios']);

      expect(installMock).toHaveBeenCalledTimes(1);
      expect(installMock).toHaveBeenCalledWith(
        ['axios'],
        expect.objectContaining({
          asDev: false,
          pkgManager: false,
        }),
      );
    });

    it('should call install with explicit version', async () => {
      await CommandTestFactory.run(commandInstance, ['add', 'pkg', 'eslint', '8.50.0']);

      expect(installMock).toHaveBeenCalledWith(['eslint', '8.50.0'], expect.any(Object));
    });

    it('should parse flags: -D and --yarn as true', async () => {
      await CommandTestFactory.run(commandInstance, ['add', 'pkg', 'lodash', '-D', '--yarn']);

      expect(installMock).toHaveBeenCalledWith(
        ['lodash'],
        expect.objectContaining({ asDev: true, pkgManager: true }),
      );
    });

    it('should parse flags explicitly set to false', async () => {
      await CommandTestFactory.run(commandInstance, [
        'add',
        'pkg',
        'react',
        '--dev=false',
        '--yarn=0',
      ]);

      expect(installMock).toHaveBeenCalledWith(
        ['react'],
        expect.objectContaining({ asDev: false, pkgManager: false }),
      );
    });

    it('should return help message from showExamples()', () => {
      const cmd = commandInstance.get(AddPkgCommand);
      const txt = cmd.showExamples();
      expect(txt).toContain('$ cli add pkg axios');
      expect(txt).toContain('$ cli add pkg eslint 8.50.0 --dev');
      expect(txt).toContain('$ cli add pkg chalk --yarn');
    });

    it('should log an error and skip install if no pkgName is provided', async () => {
      const installMock = jest.fn();
      const cmd = new AddPkgCommand({ install: installMock } as any);
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await cmd.run([], {});

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('❌ You must specify the package name.'),
      );
      expect(installMock).not.toHaveBeenCalled();
    });

    it('should return true if option value is undefined (implicit flags)', () => {
      const cmd = new AddPkgCommand({ install: jest.fn() } as any);

      expect(cmd.parseDev(undefined)).toBe(true);
      expect(cmd.parseYarn(undefined)).toBe(true);
    });
  });
});
