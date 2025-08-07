import { AddPkgCommand } from '../index';
import { AddPkgService } from '../../../services';
import chalk from 'chalk';

describe('AddPkgCommand', () => {
  let command: AddPkgCommand;
  let pkgService: AddPkgService;

  beforeEach(() => {
    pkgService = {
      install: jest.fn().mockResolvedValue(undefined),
    } as unknown as AddPkgService;

    command = new AddPkgCommand(pkgService);
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('run', () => {
    it('debe mostrar error si no se pasa el nombre del paquete', async () => {
      await command.run([], {});
      expect(console.log).toHaveBeenCalledWith(
        chalk.red('❌ Debes especificar el nombre del paquete.'),
      );
      expect(pkgService.install).not.toHaveBeenCalled();
    });

    it('debe llamar al service con los parámetros correctos', async () => {
      const _params = ['axios'];
      const _options = { asDev: false, pkgManager: false };

      await command.run(_params, _options);

      expect(pkgService.install).toHaveBeenCalledWith(_params, _options);
    });
  });

  describe('parseDev', () => {
    it('devuelve true si es "true"', () => {
      expect(command.parseDev('true')).toBe(true);
    });

    it('devuelve true si es "1"', () => {
      expect(command.parseDev('1')).toBe(true);
    });

    it('devuelve true si es undefined', () => {
      expect(command.parseDev(undefined as any)).toBe(true);
    });

    it('devuelve false si es otro valor', () => {
      expect(command.parseDev('false')).toBe(false);
    });
  });

  describe('parseYarn', () => {
    it('devuelve true si es "true"', () => {
      expect(command.parseYarn('true')).toBe(true);
    });

    it('devuelve true si es "1"', () => {
      expect(command.parseYarn('1')).toBe(true);
    });

    it('devuelve true si es undefined', () => {
      expect(command.parseYarn(undefined as any)).toBe(true);
    });

    it('devuelve false si es otro valor', () => {
      expect(command.parseYarn('false')).toBe(false);
    });
  });

  describe('showExamples', () => {
    it('debe retornar los ejemplos como string', () => {
      const result = command.showExamples();
      expect(typeof result).toBe('string');
      expect(result).toMatch(/cli add pkg axios/);
    });
  });
});
