import { AddPkgService } from '../services/pkg.service';

jest.mock('chalk', () => {
  const id = (s: string) => s;
  return {
    __esModule: true,
    default: {
      cyan: jest.fn(id),
      yellow: jest.fn(id),
      gray: jest.fn(id),
      green: jest.fn(id),
      bold: jest.fn(id),
      red: jest.fn(id),
      blue: jest.fn(id),
    },
  };
});

const succeedMock = jest.fn();
const failMock = jest.fn();
const startReturn = { succeed: succeedMock, fail: failMock };
const startMock = jest.fn(() => startReturn);
const oraMock = jest.fn(() => ({ start: startMock }));

jest.mock('ora', () => ({
  __esModule: true,
  default: (...args: any[]) => (oraMock as any)(...args),
}));

describe('AddPkgService', () => {
  let service: AddPkgService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    service = new AddPkgService();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should simulate npm install (regular dependency)', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const promise = service.install(['axios'], { asDev: false, pkgManager: false });

    jest.advanceTimersByTime(3000);
    await promise;

    expect(oraMock).toHaveBeenCalledWith('Installing axios using npm install...');
    expect(startMock).toHaveBeenCalled();
    expect(succeedMock).toHaveBeenCalledWith('✅ Package installed: axios');
    expect(logSpy).toHaveBeenCalledWith('> npm install axios');

    logSpy.mockRestore();
  });

  it('should simulate npm install --save-dev when asDev=true', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const promise = service.install(['eslint', '8.50.0'], { asDev: true, pkgManager: false });

    jest.advanceTimersByTime(3000);
    await promise;

    expect(oraMock).toHaveBeenCalledWith(
      'Installing eslint@8.50.0 using npm install --save-dev...',
    );
    expect(succeedMock).toHaveBeenCalledWith('✅ Package installed: eslint@8.50.0');
    expect(logSpy).toHaveBeenCalledWith('> npm install --save-dev eslint@8.50.0');

    logSpy.mockRestore();
  });

  it('should simulate yarn add when pkgManager=true', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const promise = service.install(['lodash'], { pkgManager: true });

    jest.advanceTimersByTime(3000);
    await promise;

    expect(oraMock).toHaveBeenCalledWith('Installing lodash using yarn add...');
    expect(succeedMock).toHaveBeenCalledWith('✅ Package installed: lodash');
    expect(logSpy).toHaveBeenCalledWith('> yarn add lodash');

    logSpy.mockRestore();
  });

  it('should handle unexpected error and call spinner.fail', async () => {
    const chalkMock = (require('chalk') as any).default;
    chalkMock.green.mockImplementationOnce(() => {
      throw new Error('boom');
    });

    const promise = service.install(['react'], {});

    jest.advanceTimersByTime(3000);
    await promise;

    expect(failMock).toHaveBeenCalledWith('❌ Failed to install react');
  });
});
