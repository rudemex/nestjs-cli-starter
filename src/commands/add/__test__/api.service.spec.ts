import { AddApiService } from '../services/api.service';

jest.mock('chalk', () => ({
  cyan: (s: string) => s,
  yellow: (s: string) => s,
  gray: (s: string) => s,
  green: (s: string) => s,
  bold: (s: string) => s,
  red: (s: string) => s,
}));

const succeedMock = jest.fn();
const failMock = jest.fn();
const startReturn = { succeed: succeedMock, fail: failMock };
const startMock = jest.fn(() => startReturn);
const oraMock = jest.fn(() => ({ start: startMock }));

jest.mock('ora', () => ({
  __esModule: true,
  default: (...args: any[]) => (oraMock as any)(...args),
}));

describe('AddApiService', () => {
  let service: AddApiService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    service = new AddApiService();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should print summary table and succeed when options are valid', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const promise = service.generate([], {
      name: 'payments',
      url: 'https://api.example.com',
      type: 'REST',
    });

    jest.advanceTimersByTime(500);
    await promise;

    expect(oraMock).toHaveBeenCalledWith('Configuring integration for "payments"...');
    expect(startMock).toHaveBeenCalled();
    expect(succeedMock).toHaveBeenCalledWith('✔ API integration configured successfully');

    const printed = logSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(printed).toContain('Service name');
    expect(printed).toContain('payments');
    expect(printed).toContain('API type');
    expect(printed).toContain('REST');
    expect(printed).toContain('Base URL');
    expect(printed).toContain('https://api.example.com');
    expect(printed).toContain('Your API integration setup is ready');

    logSpy.mockRestore();
  });

  it('should fail when details are missing (empty strings)', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const promise = service.generate([], {
      name: '',
      url: '',
      type: '',
    });

    jest.advanceTimersByTime(500);
    await promise;

    expect(failMock).toHaveBeenCalledWith('❌ Missing integration details (name, url, or type).');
    expect(succeedMock).not.toHaveBeenCalled();

    const printed = logSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(printed).not.toContain('Service name');
    expect(printed).not.toContain('Your API integration setup is ready');

    logSpy.mockRestore();
  });

  it("should fail when options object is undefined (covers ?? '' fallback)", async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const promise = service.generate([], undefined as any);

    jest.advanceTimersByTime(500);
    await promise;

    expect(oraMock).toHaveBeenCalledWith('Configuring integration for "unknown"...');
    expect(failMock).toHaveBeenCalledWith('❌ Missing integration details (name, url, or type).');
    expect(succeedMock).not.toHaveBeenCalled();

    logSpy.mockRestore();
  });

  it('should handle unexpected errors and call spinner.fail', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementationOnce(() => {
      throw new Error('boom');
    });

    const promise = service.generate([], {
      name: 'svc',
      url: 'https://ok.com',
      type: 'REST',
    });

    jest.advanceTimersByTime(500);
    await promise;

    expect(failMock).toHaveBeenCalledWith('❌ Failed to configure the API integration');

    logSpy.mockRestore();
  });
});
