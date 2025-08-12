import 'reflect-metadata';
import { TelemetryService } from '../services/telemetry.service';

describe('TelemetryService', () => {
  let service: TelemetryService;
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    service = new TelemetryService();
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.useFakeTimers().setSystemTime(new Date('2025-08-11T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
    logSpy.mockRestore();
    jest.clearAllMocks();
  });

  it('should capture an event with command, payload and ISO timestamp and log it', () => {
    const payload = { a: 1, b: 'x' };

    service.capture('setup', payload);

    const events = service.getEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({
      command: 'setup',
      payload,
      timestamp: '2025-08-11T12:00:00.000Z',
    });

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith('📡 Telemetría: setup', JSON.stringify(payload, null, 2));
  });

  it('should accumulate multiple events preserving order', () => {
    service.capture('first', { n: 1 });
    jest.setSystemTime(new Date('2025-08-11T12:00:01.000Z'));
    service.capture('second', { n: 2 });

    const events = service.getEvents();
    expect(events.map((e) => e.command)).toEqual(['first', 'second']);
    expect(events[0].timestamp).toBe('2025-08-11T12:00:00.000Z');
    expect(events[1].timestamp).toBe('2025-08-11T12:00:01.000Z');
  });

  it('should return the same internal array reference from getEvents', () => {
    const ref = service.getEvents();
    service.capture('any', {});
    expect(service.getEvents()).toBe(ref);
    expect(ref).toHaveLength(1);
  });
});
