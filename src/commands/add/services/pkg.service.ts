import { Injectable } from '@nestjs/common';
import chalk from 'chalk';

@Injectable()
export class AddPkgService {
  install(pkg: string, dev: boolean, yarn: boolean): void {
    const tool = yarn ? 'yarn add' : `npm install${dev ? ' --save-dev' : ''}`;
    console.log(chalk.greenBright(`📦 Installing package: ${pkg}`));
    console.log(chalk.gray(`> ${tool} ${pkg}`));
    // Aquí podrías usar child_process.spawnSync
  }
}
