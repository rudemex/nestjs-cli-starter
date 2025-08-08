import { TestingModule } from '@nestjs/testing';
import { CommandTestFactory } from 'nest-commander-testing';

import { AddModule } from '../add.module';
import { AddApiCommand } from '../commands/subcommands';
import { AddApiService } from '../services';

jest.mock('chalk', () => ({
  red: (text: string) => text,
  gray: (text: string) => text,
  green: (text: string) => text,
  blue: (text: string) => text,
  yellow: (text: string) => text,
}));

describe('Add Command', () => {
  let commandInstance: TestingModule;
  const generateMock = jest.fn();

  beforeAll(async () => {
    commandInstance = await CommandTestFactory.createTestingCommand({
      imports: [AddModule],
    })
      .overrideProvider(AddApiService)
      .useValue({ generate: generateMock })
      .compile();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Add Api Command', () => {
    it('should call generate with valid options (REST)', async () => {
      await CommandTestFactory.run(commandInstance, [
        'add',
        'api',
        '--name',
        'payments',
        '--url',
        'https://api.example.com',
        '--type',
        'REST',
      ]);

      expect(generateMock).toHaveBeenCalledTimes(1);
      expect(generateMock).toHaveBeenCalledWith(
        expect.any(Array), // _params
        expect.objectContaining({
          name: 'payments',
          url: 'https://api.example.com',
          type: 'REST',
        }),
      );
    });

    it('should normalize type to uppercase when provided in lowercase', async () => {
      await CommandTestFactory.run(commandInstance, [
        'add',
        'api',
        '-n',
        'billing',
        '-u',
        'https://billing.example.com',
        '-t',
        'soap',
      ]);

      expect(generateMock).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          name: 'billing',
          url: 'https://billing.example.com',
          type: 'SOAP', // normalized
        }),
      );
    });

    it('should log an error and skip generate if name is missing (unit)', async () => {
      const svc = { generate: jest.fn() };
      const cmd = new AddApiCommand(svc as any);
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await cmd.run([], { url: 'https://ok.com', type: 'REST' });

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('You must provide a service name using --name'),
      );
      expect(svc.generate).not.toHaveBeenCalled();
    });

    it('should log an error and skip generate if url is missing (unit)', async () => {
      const svc = { generate: jest.fn() };
      const cmd = new AddApiCommand(svc as any);
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await cmd.run([], { name: 'svc', type: 'REST' });

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('You must provide a base URL using --url'),
      );
      expect(svc.generate).not.toHaveBeenCalled();
    });

    it('should log an error and skip generate if url is invalid (unit)', async () => {
      const svc = { generate: jest.fn() };
      const cmd = new AddApiCommand(svc as any);
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await cmd.run([], { name: 'svc', url: 'not-a-url', type: 'REST' });

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid URL provided'));
      expect(svc.generate).not.toHaveBeenCalled();
    });

    it('should log an error and skip generate if type is invalid (unit)', async () => {
      const svc = { generate: jest.fn() };
      const cmd = new AddApiCommand(svc as any);
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await cmd.run([], { name: 'svc', url: 'https://ok.com', type: 'sars' });

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid API type'));
      expect(svc.generate).not.toHaveBeenCalled();
    });

    it('should return help message from showExamples()', () => {
      const cmd = commandInstance.get(AddApiCommand);
      const txt = cmd.showExamples();
      expect(txt).toContain(
        '$ cli add api --name my-api --url https://api.example.com --type REST',
      );
      expect(txt).toContain('$ cli add api -n auth-api -u https://auth.service.com -t GraphQL');
      expect(txt).toContain('Configures a SOAP integration'); // example coverage
    });

    //

    it('should handle empty string type and skip generate (unit)', async () => {
      const svc = { generate: jest.fn() };
      const cmd = new AddApiCommand(svc as any);
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await cmd.run([], { name: 'svc', url: 'https://ok.com', type: '' });

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid API type'));
      expect(svc.generate).not.toHaveBeenCalled();
    });

    it('should trim whitespace-only type and skip generate (unit)', async () => {
      const svc = { generate: jest.fn() };
      const cmd = new AddApiCommand(svc as any);
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await cmd.run([], { name: 'svc', url: 'https://ok.com', type: '   ' });

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid API type'));
      expect(svc.generate).not.toHaveBeenCalled();
    });

    it('should treat undefined type as invalid (unit)', async () => {
      const svc = { generate: jest.fn() };
      const cmd = new AddApiCommand(svc as any);
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      await cmd.run([], { name: 'svc', url: 'https://ok.com' }); // type undefined

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid API type'));
      expect(svc.generate).not.toHaveBeenCalled();
    });
  });
});
