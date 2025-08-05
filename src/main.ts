#!/usr/bin/env node

import { CommandFactory } from 'nest-commander';
import updateNotifier, { UpdateInfo, UpdateNotifier } from 'update-notifier';
import Configstore from 'configstore';
import chalk from 'chalk';

import { CliModule } from './cli.module';
import * as PACKAGE_JSON from '../package.json';

async function bootstrap(): Promise<void> {
  const config = new Configstore(`${PACKAGE_JSON.name}/config`, {});
  config.set('version', `v${PACKAGE_JSON.version}`);
  config.set('pkgManager', 'yarn');

  if (!config.get('userName')) {
    config.set('userName', process.env.USER ?? 'Desconocido');
  }

  // 🛎️ Notificator de versión
  const notifier: UpdateNotifier = updateNotifier({
    pkg: PACKAGE_JSON,
    updateCheckInterval: 1000,
  });

  if (notifier.update) {
    const pkgManager: string = config.get('pkgManager') as string;
    const { current, latest }: UpdateInfo = notifier.update;

    const updateCommand: string =
      pkgManager === 'npm'
        ? `npm i -g ${PACKAGE_JSON.name}`
        : `yarn global add ${PACKAGE_JSON.name}`;

    const message: string =
      `🎉 ${chalk.cyan.bold('New version available!')} ${chalk.dim(`v${current}`)} ${chalk.reset('≫')} ${chalk.green(`v${latest}`)}\n\n` +
      `${chalk.yellow(' It is recommended to update to access new features and improve stability. ')}\n\n` +
      `💻 Run "${chalk.blueBright(updateCommand)}" to update 🚀`;

    notifier.notify({
      defer: true,
      message,
    });
  }

  await CommandFactory.run(CliModule, {
    logger: ['warn', 'error'],
  });
}

(async (): Promise<void> =>
  await bootstrap().catch((_error: Error) => {
    console.error(_error);
    process.exit(1);
  }))();
