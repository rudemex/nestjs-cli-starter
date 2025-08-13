import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import updateNotifier, { UpdateInfo, UpdateNotifier } from 'update-notifier';
import chalk from 'chalk';

import { ConfigStoreService } from '../../config-store/services/config-store.service';
import { DEFAULT_CONFIG_STORE } from '../../config-store/constants/config-store.constant';
import { PkgManager } from '../../config-store/types/config-store.types';
import * as PACKAGE_JSON from '../../../package.json';

@Injectable()
export class UpdateNotifierService implements OnApplicationBootstrap {
  constructor(
    private readonly configService: ConfigService,
    private readonly store: ConfigStoreService,
  ) {}

  onApplicationBootstrap(): void {
    const name: string = this.configService.get<string>('project.name') ?? PACKAGE_JSON.name;
    const version: string =
      this.configService.get<string>('project.version') ?? PACKAGE_JSON.version;

    if (!name || !version) {
      return;
    }

    const pkg = {
      name,
      version,
    };

    const interval: number =
      this.store.get<number>('update.intervalMs') ?? DEFAULT_CONFIG_STORE.update.intervalMs;

    const notifier: UpdateNotifier = updateNotifier({
      pkg,
      updateCheckInterval: interval,
    });

    if (!notifier.update) return;

    const { current, latest }: UpdateInfo = notifier.update;
    const pkgManager: PkgManager =
      this.store.get<PkgManager>('pkgManager') ?? DEFAULT_CONFIG_STORE.pkgManager;
    const updateCommand = pkgManager === 'npm' ? `npm i -g ${name}` : `yarn global add ${name}`;

    const message =
      `🎉 ${chalk.cyan.bold('New version available!')} ${chalk.dim(`v${current}`)} ${chalk.reset('≫')} ${chalk.green(`v${latest}`)}\n\n` +
      `${chalk.yellow(' It is recommended to update to access new features and improve stability. ')}\n\n` +
      `💻 Run "${chalk.blueBright(updateCommand)}" to update 🚀`;

    notifier.notify({ defer: true, message });
  }
}
