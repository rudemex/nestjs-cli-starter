import 'reflect-metadata';
import { TestingModule } from '@nestjs/testing';
import { CommandTestFactory } from 'nest-commander-testing';
import { InquirerService } from 'nest-commander';

import { CliModule } from '../cli.module';
import { SetupCommand } from '../commands/setup/commands/setup.command';
import { InfoCommand } from '../commands/info/commands/info.command';

describe('CliModule', () => {
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await CommandTestFactory.createTestingCommand({
      imports: [CliModule],
    }).compile();
  });

  afterAll(async () => {
    await moduleRef?.close();
  });

  it('should compile CliModule', () => {
    expect(moduleRef).toBeDefined();
  });

  it('should resolve SetupCommand from SetupModule', () => {
    const setupCmd = moduleRef.get(SetupCommand);
    expect(setupCmd).toBeDefined();
  });

  it('should resolve InfoCommand from InfoModule', () => {
    const infoCmd = moduleRef.get(InfoCommand);
    expect(infoCmd).toBeDefined();
  });

  it('should provide InquirerService for command prompts', () => {
    const inquirer = moduleRef.get(InquirerService);
    expect(inquirer).toBeDefined();
  });
});
