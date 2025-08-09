import { config } from '../index';
import * as PACKAGE_JSON from '../../../package.json';

describe('config', () => {
  it('should load project information from package.json', () => {
    const cfg = config();

    expect(cfg.project.name).toBe(PACKAGE_JSON.name);
    expect(cfg.project.version).toBe(PACKAGE_JSON.version);
    expect(cfg.project.description).toBe(PACKAGE_JSON.description);
    expect(cfg.project.author).toEqual(PACKAGE_JSON.author);
    expect(cfg.project.repository).toEqual(PACKAGE_JSON.repository);
    expect(cfg.project.bugs).toEqual(PACKAGE_JSON.bugs);
    expect(cfg.project.homepage).toBe(PACKAGE_JSON.homepage);
  });

  it('should set the command from the first bin key', () => {
    const expectedCommand = Object.keys(PACKAGE_JSON.bin || {})[0];
    const cfg = config();

    expect(cfg.project.command).toBe(expectedCommand);
  });

  it('should have correct pkgManager and envs values', () => {
    const cfg = config();

    expect(cfg.pkgManager).toBe('yarn');
    expect(cfg.envs).toEqual(['local', 'test', 'develop', 'homo', 'stg', 'prod']);
  });

  it('should handle missing bin property and return undefined command', () => {
    jest.resetModules();
    jest.doMock('../../../package.json', () => ({
      name: 'test-cli',
      version: '0.0.1',
      description: 'desc',
      author: { name: 'test' },
      repository: {},
      bugs: {},
      homepage: 'test.com',
    }));

    const cfg = require('../index').config();

    expect(cfg.project.command).toBeUndefined();
    expect(cfg.project.name).toBe('test-cli');
    expect(cfg.project.version).toBe('0.0.1');
  });
});
