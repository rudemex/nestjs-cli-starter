#!/usr/bin/env node

import { CommandFactory } from 'nest-commander';

import { CliModule } from './cli.module';
import * as PACKAGE_JSON from '../package.json';

const bootstrap = async (): Promise<void> => {
  await CommandFactory.run(CliModule, {
    cliName: `${PACKAGE_JSON.name}`,
    version: `v${PACKAGE_JSON.version}`,
    logger: ['warn', 'error'],
  });
};

(async (): Promise<void> =>
  await bootstrap().catch((_error: Error): never => {
    console.error(_error);
    process.exit(1);
  }))();
